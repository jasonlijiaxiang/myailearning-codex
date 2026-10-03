import assert from "node:assert/strict";
import test from "node:test";

import { rankKnowledgeSearch } from "../app/knowledge-search-match.mjs";
import { buildKnowledgeSearchEntries } from "../app/search-index.mjs";
import { moduleList } from "../app/knowledge-map.mjs";
import { moduleSearchFeedback, questionFilterCount } from "../app/search-result-feedback.mjs";
import { matchesModuleQuestion, moduleQuestionSearchText } from "../app/question-filter.mjs";
import { moduleContentRegistry } from "../app/module-content-registry.mjs";
import { sourceLedger } from "../app/reference-content.mjs";

test("search feedback keeps knowledge matches visible when no module title matches", () => {
  const labels = { foundPrefix: "找到", moduleNoun: "个模块", knowledgeHitsPrefix: "另有", knowledgeHitsSuffix: "条知识命中" };
  assert.deepEqual(moduleSearchFeedback({ moduleCount: 0, knowledgeCount: 22, query: "向量数据库", indexState: "ready", labels }), {
    status: "找到 22 条知识命中",
    showEmpty: false,
  });
  assert.equal(moduleSearchFeedback({ moduleCount: 0, knowledgeCount: 0, query: "陌生词", indexState: "loading", labels }).showEmpty, false);
  assert.equal(moduleSearchFeedback({ moduleCount: 0, knowledgeCount: 0, query: "陌生词", indexState: "ready", labels }).showEmpty, true);
});

test("question filter count retains the unfiltered total", () => {
  assert.equal(questionFilterCount(1, 11), "当前显示 1 / 11 个问题");
});

test("module question search includes evidence and shares one match set", () => {
  const questions = moduleContentRegistry.rag.qa.map((item) => ({ tag: item.tag, text: moduleQuestionSearchText(item, sourceLedger) }));
  const matches = questions.map((item) => matchesModuleQuestion(item, " NIST ", "all"));
  assert.ok(matches.filter(Boolean).length > 0, "evidence-only query must find its questions");
  questions.forEach((item, index) => {
    assert.equal(matches[index], item.text.toLowerCase().includes("nist"));
    if (matches[index]) {
      assert.equal(matchesModuleQuestion(item, "nist", item.tag), true);
      assert.equal(matchesModuleQuestion(item, "nist", "nonexistent-tag"), false);
    }
  });
});

test("Chinese knowledge search finds technical terms inside customer answers", () => {
  const entries = buildKnowledgeSearchEntries("zh");
  for (const [query, moduleSlug] of [["VAD", "multimodal"], ["Run Token", "ai-gateway"], ["Jamba", "llm"]]) {
    const matches = rankKnowledgeSearch(entries, query, "zh-CN", (entry) => entry);
    assert.ok(matches.some((entry) => entry.type === "客户问答" && entry.moduleSlugs.includes(moduleSlug)), `${query} must reach its customer answer`);
  }
});

test("a reader's Chinese question finds related knowledge without an exact sentence match", () => {
  const entries = buildKnowledgeSearchEntries("zh");
  const matches = rankKnowledgeSearch(entries, "内部文档只让有权限的人看", "zh-CN", (entry) => entry);

  assert.ok(matches.length > 0);
  assert.ok(matches.slice(0, 5).some((entry) => entry.href.includes("/modules/") && /权限|文档/.test(entry.title)));
});

test("exact terminology ranks ahead of partial matches", () => {
  const entries = buildKnowledgeSearchEntries("zh");
  const matches = rankKnowledgeSearch(entries, "KV Cache", "zh-CN", (entry) => entry);

  assert.equal(matches[0].type, "专业术语");
  assert.match(matches[0].title, /KV Cache/);
});

test("English questions ignore conversational filler while preserving precise terms", () => {
  const entries = [
    { title: "RAG retrieval", keywords: "Ground answers in source documents" },
    { title: "Model training", keywords: "Pretraining data and checkpoints" },
  ];
  assert.deepEqual(rankKnowledgeSearch(entries, "How do I use RAG?", "en-US", (entry) => entry), [entries[0]]);
});

test("Chinese chapter and practice search results link to distinct item anchors", () => {
  const entries = buildKnowledgeSearchEntries("zh").filter((entry) => ["课程章节", "实战练习"].includes(entry.type));
  assert.ok(entries.length > 0);
  assert.equal(new Set(entries.map((entry) => entry.href)).size, entries.length);
  assert.ok(entries.every((entry) => entry.href.endsWith(`#${entry.id}`)));
  assert.ok(entries.some((entry) => entry.href.startsWith("/modules/mcp?view=learn#mcp-chapter-")));
  assert.ok(entries.some((entry) => entry.href.startsWith("/modules/llm-inference?view=learn#inference-topic-")));
});

test("knowledge results retain module ownership for layer filtering", () => {
  const publishedSlugs = new Set(moduleList.map((module) => module.slug));
  for (const locale of ["zh", "en"]) {
    const entries = buildKnowledgeSearchEntries(locale);
    assert.ok(entries.every((entry) => entry.moduleSlugs.length > 0));
    assert.ok(entries.every((entry) => entry.moduleSlugs.every((/** @type {string} */ slug) => publishedSlugs.has(slug))));
  }
});
