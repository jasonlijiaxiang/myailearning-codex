import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { balanceRows } from "../app/layout-utils.mjs";
import { getModuleBySlug, layers, legacyModuleAliases, moduleList } from "../app/knowledge-map.mjs";
import { agentQa } from "../app/agent-content.mjs";
import { moduleContentRegistry, requireModuleContent } from "../app/module-content-registry.mjs";
import { publishedModules as publishedModuleRegistry, publishedModuleSlugs } from "../app/module-publication.mjs";
import { promptQa } from "../app/prompt-content.mjs";
import { evidenceCards, ragQa } from "../app/rag-content.mjs";
import { referenceModules, sourceLedger } from "../app/reference-content.mjs";
import { sourceFreshness } from "../app/source-freshness.mjs";
import { requireTerm, terminology } from "../app/terminology.mjs";

async function render(path = "/") {
  assert.match(path, /^\//, "render(path) 必须接收站内绝对路径");

  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(path, "http://localhost"), {
      headers: { accept: "text/html" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

async function renderHtml(path) {
  const response = await render(path);
  assert.equal(response.status, 200, `${path} 应可正常访问`);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtmlText(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

const publishedModules = publishedModuleRegistry.map((module) => {
  const content = requireModuleContent(module.slug);
  return { ...module, id: module.slug, cards: content.evidenceCards, qa: content.qa };
});

function getPublishedModule(slug) {
  const publishedModule = publishedModules.find((candidate) => candidate.slug === slug);
  assert.ok(publishedModule, `缺少发布模块：${slug}`);
  return publishedModule;
}

function collectModuleSourceIds({ cards, qa }) {
  return new Set([
    ...cards.map((card) => card.sourceId),
    ...qa.flatMap((item) => item.evidence.map((reference) => reference.sourceId)),
  ]);
}

test("homepage is a focused knowledge map with links to every independent module", async () => {
  const html = await renderHtml("/");

  assert.match(html, /<html lang="zh-CN">/i);
  assert.match(html, /<title>云计算 × AI 平台售前知识库<\/title>/i);
  assert.match(html, /<h2 id="map-title">知识地图<\/h2>/);
  assert.match(html, new RegExp(`aria-label="${layers.length} 层架构，${moduleList.length} 个细分模块"`));
  assert.match(html, /href="\/references"/);
  assert.match(html, /Reference/);
  assert.match(html, /选择学习模块/);
  assert.match(html, /aria-label="已完成的学习模块"/);
  assert.match(html, /AVAILABLE MODULES/);
  assert.doesNotMatch(html, /阅读 RAG 模块/);
  assert.equal((html.match(/class="heroModuleCard"/g) ?? []).length, publishedModules.length);

  for (const publishedModule of publishedModules) {
    assert.match(html, new RegExp(`<a[^>]*href="${escapeRegExp(publishedModule.path)}"[^>]*class="heroModuleCard"`));
  }

  for (const knowledgeModule of moduleList) {
    assert.match(html, new RegExp(`href="${escapeRegExp(knowledgeModule.href)}"`), `首页缺少模块入口：${knowledgeModule.zh}`);
    assert.match(html, new RegExp(escapeRegExp(knowledgeModule.zh)), `首页缺少模块名称：${knowledgeModule.zh}`);
    assert.match(html, new RegExp(escapeRegExp(escapeHtmlText(knowledgeModule.en))), `首页缺少英文术语：${knowledgeModule.en}`);
  }

  for (const layer of layers) {
    assert.doesNotMatch(html, new RegExp(escapeRegExp(layer.purpose)), `首页不应显示泛化层说明：${layer.name}`);
  }

  assert.doesNotMatch(html, /RAG 的工作原理与工程机制/);
  assert.doesNotMatch(html, /RAG 技术环节与云服务机会/);
  assert.doesNotMatch(html, /Agent 的基础概念与工作循环/);
  assert.doesNotMatch(html, /Prompt 是什么，以及 Context Engineering 的边界/);
  assert.doesNotMatch(html, /客户高频问题与深度回答/);
  assert.doesNotMatch(html, /本题依据 \/ Evidence/);
  assert.doesNotMatch(html, /id="source-[a-z0-9-]+"/);
  assert.doesNotMatch(html, /统一来源台账/);
  assert.doesNotMatch(html, /BUILD BRIEF|语言规范 \/ Language Standard|编辑原则：|跨模块阅读规则/);
  assert.doesNotMatch(html, /中文为主|中文主版本|术语中英对照/);
  assert.doesNotMatch(html, /\/(?:Users|home)\//, "生产 HTML 不应包含本机绝对路径");
});

test("RAG route contains principles, cloud-service opportunities, and evidence-backed answers", async () => {
  const html = await renderHtml("/modules/rag");

  assert.match(html, /检索增强生成 · Retrieval-Augmented Generation/);
  assert.match(html, /RAG 的工作原理与工程机制/);
  assert.match(html, /检索 · Retrieval/);
  assert.match(html, /增强 · Augmentation/);
  assert.match(html, /生成 · Generation/);
  assert.match(html, /检索到不等于回答正确/);
  assert.match(html, /召回是证据可用性的上限/);
  assert.match(html, /增强发生在上下文/);
  assert.match(html, /RAG 技术环节与云服务机会/);
  assert.match(html, /对象存储、数据库、文件服务、SaaS 连接器、CDC、消息队列/);
  assert.match(html, /客户高频问题与深度回答/);
  assert.match(html, /上下文窗口已经很长，为什么还需要 RAG/);
  assert.match(html, /RAG 检到了正确文档，为什么仍可能答错/);
  assert.match(html, /本题依据 \/ Evidence/);
  assert.equal((html.match(/aria-label="本题依据"/g) ?? []).length, ragQa.length);
  assert.match(html, /href="\/references"/);

  for (const sourceId of collectModuleSourceIds(getPublishedModule("rag"))) {
    assert.match(
      html,
      new RegExp(`href="/references#source-${escapeRegExp(sourceId)}"`),
      `RAG 页面缺少统一 Reference 回链：${sourceId}`,
    );
  }

  assert.doesNotMatch(html, /id="source-[a-z0-9-]+"/, "RAG 页面不应复制完整来源台账");
  assert.doesNotMatch(html, /统一来源台账|本模块的来源与证据类别|打开原文 ↗/);
  assert.doesNotMatch(html, /MAINTENANCE BY DESIGN|时效性不是页脚日期|claim_id|review_by|事实最小单元/);
  assert.doesNotMatch(html, /softmax|RAG-Sequence|RAG-Token|潜变量|边缘化|Σ|∏/);
  assert.doesNotMatch(html, /class="(?:formula|deepFormula|smallFormula)"/);
});

test("Agent route explains the controlled loop, cloud runtime, and evidence-backed customer decisions", async () => {
  const html = await renderHtml("/modules/ai-agent");

  assert.match(html, /智能体 · AI Agent/);
  assert.match(html, /Agent 的基础概念与工作循环/);
  assert.match(html, /Agent 的四个关键动作：感知—思考—行动—观察/);
  assert.match(html, /感知 · Perceive/);
  assert.match(html, /思考 · Reason/);
  assert.match(html, /行动 · Act/);
  assert.match(html, /观察 · Observe/);
  assert.match(html, /感知（Perceive）.*观察（Observe）/s);
  assert.match(html, /计划、决策摘要、工具调用、环境结果、策略判断与停止原因/);
  assert.match(html, /规划、记忆与工具：让四个动作持续运转/);
  assert.match(html, /规划 · Planning/);
  assert.match(html, /记忆 · Memory/);
  assert.match(html, /工具 · Tools/);
  assert.match(html, /数据工具 · Data Tools/);
  assert.match(html, /动作工具 · Action Tools/);
  assert.match(html, /编排工具 · Orchestration Tools/);
  assert.match(html, /RAG ≠ MEMORY/);
  assert.match(html, /观察—决策—行动—反馈/);
  assert.match(html, /模型会调用 API，不等于模型拥有 API 权限/);
  assert.match(html, /智能体、工作流、RAG 与聊天机器人的边界/);
  assert.match(html, /Memory 是需治理的数据|记忆不是模型魔法/);
  assert.match(html, /Agent 技术环节与云服务机会/);
  assert.match(html, /模型即服务、模型目录、推理端点、AI 网关、内容安全/);
  assert.match(html, /什么时候应该用 Agent，什么时候用固定工作流（Workflow）/);
  assert.match(html, /单智能体 · Single Agent/);
  assert.match(html, /编排者—执行者 · Orchestrator–Workers/);
  assert.match(html, /选择云上托管 Agent 平台，还是自己用框架搭/);
  assert.equal((html.match(/aria-label="本题依据"/g) ?? []).length, agentQa.length);

  for (const sourceId of collectModuleSourceIds(getPublishedModule("ai-agent"))) {
    assert.match(html, new RegExp(`href="/references#source-${escapeRegExp(sourceId)}"`));
  }

  assert.doesNotMatch(html, /正文建设中|模块依赖/);
  assert.doesNotMatch(html, /softmax|Σ|∏|class="(?:formula|deepFormula|smallFormula)"/);
});

test("Prompt Engineering route covers context boundaries, release governance, and cloud-service opportunities", async () => {
  const html = await renderHtml("/modules/prompt-engineering");

  assert.match(html, /提示词工程/);
  assert.match(html, /Prompt Engineering/);
  assert.match(html, /Prompt 是什么，以及 Context Engineering 的边界/);
  assert.match(html, /稳定指令 · Instructions/);
  assert.match(html, /动态上下文 · Context/);
  assert.match(html, /必须执行的规则应落在模型外/);
  assert.match(html, /结构正确不等于事实正确|保证结构不等于保证字段值真实/);
  assert.match(html, /模型差异、提示版本与发布控制/);
  assert.match(html, /提示词工程与云服务机会/);
  assert.match(html, /系统提示（System Prompt）的优先级更高，是否就等于安全/);
  assert.match(html, /可维护的提示模板 · Prompt Template/);
  assert.match(html, /Prompt、RAG 和 Context Engineering 是什么关系/);
  assert.equal((html.match(/aria-label="本题依据"/g) ?? []).length, promptQa.length);

  for (const sourceId of collectModuleSourceIds(getPublishedModule("prompt-engineering"))) {
    assert.match(html, new RegExp(`href="/references#source-${escapeRegExp(sourceId)}"`));
  }

  assert.doesNotMatch(html, /正文建设中|模块依赖/);
  assert.doesNotMatch(html, /中文主版 · 术语中英对照/);
  assert.doesNotMatch(html, /softmax|Σ|∏|class="(?:formula|deepFormula|smallFormula)"/);
});

test("every published module passes the shared reader, terminology, and depth contract", async () => {
  assert.equal(new Set(publishedModuleSlugs).size, publishedModuleSlugs.length, "发布模块 slug 必须唯一");
  assert.deepEqual(Object.keys(moduleContentRegistry).sort(), [...publishedModuleSlugs].sort(), "实战与证据注册表必须和发布模块一致");
  assert.ok(Object.keys(terminology).length > 0);

  for (const [termId, term] of Object.entries(terminology)) {
    assert.match(termId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(term.zh && term.en, `术语必须同时有中英文：${termId}`);
  }

  for (const publishedModule of publishedModules) {
    const knowledgeModule = getModuleBySlug(publishedModule.slug);
    assert.ok(knowledgeModule, `发布模块未进入知识地图：${publishedModule.slug}`);
    assert.equal(publishedModule.path, knowledgeModule.href, `发布路径与知识地图不一致：${publishedModule.slug}`);
    assert.ok(referenceModules.some((module) => module.id === publishedModule.slug), `缺少 Reference 分组：${publishedModule.slug}`);

    const html = await renderHtml(publishedModule.path);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `每个正式模块只能有一个主标题：${publishedModule.slug}`);
    assert.match(html, new RegExp(`<h1[^>]*id="${escapeRegExp(publishedModule.titleId)}"`));

    for (const match of html.matchAll(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/g)) {
      const headingText = match[1].replace(/<[^>]+>/g, " ");
      assert.doesNotMatch(headingText, /先确定|我们来看|你需要|不要一上来/, `标题不应使用编辑者对读者说话的语气：${headingText}`);
    }

    for (const section of ["related-modules", "principle", "evidence", "cloud", "qa"]) {
      assert.match(html, new RegExp(`data-quality-section="${section}"`), `${publishedModule.slug} 缺少 ${section} 质量区块`);
    }

    assert.match(html, /aria-label="重要边界"[^>]*data-importance="critical"/);
    assert.match(html, /客户高频问题与深度回答/);
    assert.match(html, /href="\/references(?:#[^"]+)?"/);

    for (const termId of publishedModule.requiredTerms) {
      const term = requireTerm(termId);
      assert.match(html, new RegExp(escapeRegExp(term.zh)), `${publishedModule.slug} 缺少中文术语：${term.zh}`);
      assert.match(html, new RegExp(escapeRegExp(escapeHtmlText(term.en))), `${publishedModule.slug} 缺少英文术语：${term.en}`);
    }

    for (const [dimension, markers] of Object.entries(publishedModule.contentContract)) {
      assert.ok(markers.length > 0, `${publishedModule.slug} 的 ${dimension} 契约不能为空`);
      for (const marker of markers) {
        assert.match(html, new RegExp(escapeRegExp(marker)), `${publishedModule.slug} 缺少 ${dimension} 语义：${marker}`);
      }
    }

    assert.doesNotMatch(html, /\b(?:Login|Sign in)\b|type="password"/i);
    assert.doesNotMatch(html, /模块依赖|BUILD BRIEF|读者画像|语言规范|中文为主|中文主版本|术语中英对照|CONTENT STATUS/);
    assert.doesNotMatch(html, /\/(?:Users|home)\//);
  }
});

test("reader pages omit internal build notes and use the shared related-module language", async () => {
  for (const path of ["/", ...publishedModules.map((module) => module.path), "/references"]) {
    const html = await renderHtml(path);
    assert.doesNotMatch(html, /模块依赖|BUILD BRIEF|编辑原则：|语言规范 \/ Language Standard|跨模块阅读规则|读者画像|中文为主|中文主版本|术语中英对照|CONTENT STATUS/);
    assert.doesNotMatch(html, /claim_id|review_by|本机绝对路径|\/Users\/lijiaxiang/);
    assert.doesNotMatch(html, /\b(?:Login|Sign in)\b|type="password"/i);
  }
});

test("references route is the complete centralized source ledger", async () => {
  const html = await renderHtml("/references");

  assert.match(html, /统一来源台账/);
  assert.match(html, /Reference Library/);
  assert.match(html, /来源与证据类别图例/);
  assert.match(html, /官方产品与技术文档/);
  assert.match(html, /id="reference-modules"/);

  for (const referenceModule of referenceModules) {
    assert.match(html, new RegExp(`id="module-${escapeRegExp(referenceModule.id)}"`));
    assert.match(html, new RegExp(`href="${escapeRegExp(referenceModule.href)}"`));
    assert.match(html, new RegExp(escapeRegExp(referenceModule.zh)));

    for (const sourceId of referenceModule.sourceIds) {
      const source = sourceLedger[sourceId];
      assert.ok(source, `Reference 模块引用未知来源：${sourceId}`);
      assert.match(html, new RegExp(`id="source-${escapeRegExp(sourceId)}"`));
      assert.match(html, new RegExp(`href="${escapeRegExp(source.href)}"`));
      assert.match(html, new RegExp(escapeRegExp(source.title)));
      assert.match(html, new RegExp(`核验：(?:<!-- -->)?${escapeRegExp(source.verifiedAt)}`));
    }
  }

  for (const sourceId of Object.keys(sourceLedger)) {
    assert.match(html, new RegExp(`id="source-${escapeRegExp(sourceId)}"`), `来源未出现在统一台账：${sourceId}`);
    assert.equal(
      (html.match(new RegExp(`<a class="sourceItem" id="source-${escapeRegExp(sourceId)}"`, "g")) ?? []).length,
      1,
      `每个稳定来源锚点只能出现一次：${sourceId}`,
    );
  }
});

test("legacy module addresses resolve to the merged 19-module knowledge base", async () => {
  assert.ok(Object.keys(legacyModuleAliases).length > 0);

  for (const [legacySlug, canonicalSlug] of Object.entries(legacyModuleAliases)) {
    const resolved = getModuleBySlug(legacySlug);
    assert.ok(resolved, `历史模块地址无法解析：${legacySlug}`);
    assert.equal(resolved.canonicalSlug, canonicalSlug);
    assert.equal(resolved.href, `/modules/${canonicalSlug}`);

    const html = await renderHtml(`/modules/${legacySlug}`);
    const canonicalModule = getPublishedModule(canonicalSlug);
    assert.match(html, new RegExp(`<h1[^>]*id="${escapeRegExp(canonicalModule.titleId)}"`));
    assert.match(html, /客户高频问题与深度回答/);
    assert.doesNotMatch(html, /正文建设中|CONTENT STATUS|后续版本将补齐|模块依赖/);
  }
});

test("every public knowledge route is anonymously readable and directly shareable", async () => {
  const routes = [
    "/",
    "/references",
    ...moduleList.map((knowledgeModule) => knowledgeModule.href),
    ...Object.keys(legacyModuleAliases).map((slug) => `/modules/${slug}`),
  ];

  for (const path of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, `${path} 必须匿名直达`);
    assert.equal(response.headers.get("location"), null, `${path} 不应跳转到登录或中间页`);
    const html = await response.text();
    assert.doesNotMatch(html, /\b(?:Login|Sign in)\b|type="password"|\/login\b|\/signin\b/i, `${path} 不得出现登录依赖`);
    assert.doesNotMatch(html, /\/(?:Users|home)\//, `${path} 不得泄漏本机绝对路径`);
  }
});

test("knowledge-map registry supports changing layer and module counts without duplicate routes", () => {
  assert.ok(layers.length > 0);
  assert.ok(moduleList.length > 0);
  assert.equal(moduleList.length, 19, "公开知识地图必须与 CC-20260717 的 19 个模块一一对应");
  assert.equal(layers.reduce((total, layer) => total + layer.modules.length, 0), moduleList.length);

  const layerNumbers = layers.map((layer) => layer.no);
  const slugs = moduleList.map((knowledgeModule) => knowledgeModule.slug);
  const hrefs = moduleList.map((knowledgeModule) => knowledgeModule.href);

  assert.equal(new Set(layerNumbers).size, layers.length, "层编号必须唯一");
  assert.equal(new Set(slugs).size, moduleList.length, "模块 slug 必须唯一");
  assert.equal(new Set(hrefs).size, moduleList.length, "模块 href 必须唯一");

  for (const layer of layers) {
    assert.ok(layer.no && layer.name && layer.en && layer.purpose);
    assert.ok(layer.modules.length > 0, `知识层不应为空：${layer.name}`);
  }

  for (const knowledgeModule of moduleList) {
    assert.match(knowledgeModule.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(knowledgeModule.href, `/modules/${knowledgeModule.slug}`);
    const resolved = getModuleBySlug(knowledgeModule.slug);
    assert.ok(resolved);
    assert.equal(resolved.slug, knowledgeModule.slug);
    assert.equal(resolved.canonicalSlug, knowledgeModule.slug);
    assert.equal(resolved.href, knowledgeModule.href);
    assert.ok(knowledgeModule.zh && knowledgeModule.en && knowledgeModule.layerNo && knowledgeModule.layerName && knowledgeModule.layerEn);
  }
});

test("every published module claim resolves to a unique, grouped, and verified source", () => {
  const sourceEntries = Object.entries(sourceLedger);
  const sourceIds = new Set(sourceEntries.map(([sourceId]) => sourceId));
  const sourceUrls = sourceEntries.map(([, source]) => source.href);
  const allowedGrades = new Set(["O", "P", "A", "B", "G"]);

  assert.ok(sourceEntries.length > 0);
  assert.equal(new Set(sourceUrls).size, sourceUrls.length, "来源 URL 不应重复维护");

  for (const [sourceId, source] of sourceEntries) {
    assert.match(sourceId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.match(source.href, /^https:\/\//);
    assert.match(source.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
    const freshness = sourceFreshness(source);
    assert.equal(
      freshness.status,
      "fresh",
      `来源必须使用真实日期且处于复核周期内：${sourceId} / ${freshness.status} / ${freshness.ageDays ?? "?"} 天`,
    );
    assert.ok([30, 90, 180].includes(freshness.reviewCycleDays));
    assert.ok(source.grade && source.kind && source.shortTitle && source.title && source.note);
    assert.ok(allowedGrades.has(source.grade), `未知证据类别：${sourceId} / ${source.grade}`);
  }

  const groupedSourceIds = new Set();
  const referenceModuleIds = new Set();
  const referenceModuleHrefs = new Set();
  for (const referenceModule of referenceModules) {
    assert.ok(!referenceModuleIds.has(referenceModule.id), `Reference 模块 ID 重复：${referenceModule.id}`);
    assert.ok(!referenceModuleHrefs.has(referenceModule.href), `Reference 模块链接重复：${referenceModule.href}`);
    referenceModuleIds.add(referenceModule.id);
    referenceModuleHrefs.add(referenceModule.href);
    assert.ok(referenceModule.zh && referenceModule.en && referenceModule.shortTitle);
    assert.ok(referenceModule.sourceIds.length > 0, `Reference 模块缺少来源：${referenceModule.id}`);
    assert.equal(new Set(referenceModule.sourceIds).size, referenceModule.sourceIds.length, `Reference 模块来源重复：${referenceModule.id}`);
    assert.equal(referenceModule.href, getModuleBySlug(referenceModule.id)?.href, `Reference 分组应连接到对应模块：${referenceModule.id}`);

    for (const sourceId of referenceModule.sourceIds) {
      assert.ok(sourceIds.has(sourceId), `Reference 模块引用未知来源：${sourceId}`);
      groupedSourceIds.add(sourceId);
    }
  }
  assert.deepEqual([...groupedSourceIds].sort(), [...sourceIds].sort(), "每个来源都必须归入至少一个模块分组");

  for (const publishedModule of publishedModules) {
    const referenceModule = referenceModules.find((candidate) => candidate.id === publishedModule.id);
    assert.ok(referenceModule, `缺少 ${publishedModule.id} Reference 分组`);
    const moduleSourceIds = new Set(referenceModule.sourceIds);

    assert.ok(publishedModule.qa.length > 0, `已发布模块缺少客户问答：${publishedModule.id}`);

    for (const item of publishedModule.qa) {
      assert.ok(item.q && item.a && item.depth && item.ask && item.tag && item.basis);
      assert.ok(item.evidence.length > 0, `问答缺少本题依据：${item.q}`);
      assert.equal(
        new Set(item.evidence.map((reference) => reference.sourceId)).size,
        item.evidence.length,
        `同一问题不应重复引用同一来源：${item.q}`,
      );
      for (const reference of item.evidence) {
        assert.ok(sourceIds.has(reference.sourceId), `问答引用未知来源：${reference.sourceId}`);
        assert.ok(moduleSourceIds.has(reference.sourceId), `问答来源未归入 ${publishedModule.id} 分组：${reference.sourceId}`);
        assert.match(reference.supports, /支持/, `应说明来源具体支持什么：${item.q}`);
      }
    }

    for (const card of publishedModule.cards) {
      assert.ok(sourceIds.has(card.sourceId), `证据卡引用未知来源：${card.sourceId}`);
      assert.ok(moduleSourceIds.has(card.sourceId), `证据卡来源未归入 ${publishedModule.id} 分组：${card.sourceId}`);
      assert.ok(card.metric && card.title && card.finding && card.boundary);
    }
  }

  assert.ok(evidenceCards.every((card) => card.title !== "种原始概率形式"));
  assert.ok(ragQa.every((item) => !/RAG-Sequence|RAG-Token/.test(item.q)));
});

test("source freshness rejects impossible, future, and overdue verification dates", () => {
  const now = new Date("2026-07-17T12:00:00Z");
  const productSource = { kind: "官方产品文档", verifiedAt: "2026-07-17" };

  assert.equal(sourceFreshness(productSource, now).status, "fresh");
  assert.equal(sourceFreshness({ ...productSource, verifiedAt: "2026-02-30" }, now).status, "invalid");
  assert.equal(sourceFreshness({ ...productSource, verifiedAt: "2026-07-18" }, now).status, "future");
  assert.equal(sourceFreshness({ ...productSource, verifiedAt: "2026-04-01" }, now).status, "stale");
});

test("balances arbitrary card counts without hard-coded even or odd layouts", () => {
  for (let maxColumns = 1; maxColumns <= 6; maxColumns += 1) {
    for (let count = 0; count <= 50; count += 1) {
      const items = Array.from({ length: count }, (_, index) => index);
      const rows = balanceRows(items, maxColumns);

      assert.deepEqual(rows.flat(), items, `布局必须保持原顺序：${count} / ${maxColumns}`);
      assert.equal(rows.length, Math.ceil(count / maxColumns), `行数应由当前数量动态计算：${count} / ${maxColumns}`);

      if (rows.length > 0) {
        const sizes = rows.map((row) => row.length);
        assert.ok(Math.max(...sizes) <= maxColumns);
        assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `各行数量差不能超过 1：${count} / ${maxColumns}`);
      }
    }
  }

  assert.throws(() => balanceRows([1], 0), /positive integer/);
});

test("keeps module card systems dynamically balanced with mobile navigation", async () => {
  const [styles, homepage, genericModuleRoute, referencesRoute, moduleComponents, publicationRegistry] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/modules/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/references/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/module-content-components.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/module-publication.mjs", import.meta.url), "utf8"),
  ]);

  assert.match(genericModuleRoute, /hasDedicatedModule\(module\.slug\)/);
  assert.match(genericModuleRoute, /hasDedicatedModule\(currentModule\.canonicalSlug\)/);
  assert.match(genericModuleRoute, /legacyModuleAliases/);
  assert.doesNotMatch(genericModuleRoute, /href="\/modules\/rag"/);
  assert.match(genericModuleRoute, /const relatedRows = balanceRows\(relatedModules, 4\)/);
  assert.match(genericModuleRoute, /"--related-span": 12 \/ row\.length/);
  assert.match(genericModuleRoute, /data-odd=\{relatedModules\.length % 2 === 1/);
  assert.match(referencesRoute, /const referenceModuleRows = balanceRows\(referenceModules, 4\)/);
  assert.match(referencesRoute, /"--reference-span": 12 \/ row\.length/);
  assert.match(referencesRoute, /data-odd=\{referenceModules\.length % 2 === 1/);
  assert.match(moduleComponents, /if \(cards\.length === 0\) return null/);
  assert.match(moduleComponents, /const rows = balanceRows\(cards, maxColumns\)/);
  assert.match(moduleComponents, /const rows = balanceRows\(items, maxColumns\)/);
  assert.match(moduleComponents, /balanceRows\(item\.evidence, 3\)/);
  assert.match(moduleComponents, /"--evidence-span": 12 \/ row\.length/);
  assert.match(moduleComponents, /"--qa-evidence-span": 12 \/ row\.length/);
  assert.match(moduleComponents, /data-importance="critical"/);
  assert.match(moduleComponents, /className="balancedGridCell"/);
  assert.match(styles, /\.mechanicGrid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  assert.match(styles, /\.balancedGrid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  assert.match(homepage, /availableModules\.map/);
  assert.match(homepage, /publishedModuleSlugs\.map/);
  assert.match(publicationRegistry, /export const publishedModules/);
  assert.match(publicationRegistry, /contentContract/);
  assert.match(homepage, /className="heroModuleRail"/);
  assert.match(styles, /\.heroModuleRail\s*\{[^}]*overflow-x:\s*auto;/s);
  assert.match(styles, /\.heroModuleRail\s*\{[^}]*scroll-snap-type:\s*x proximity;/s);
  assert.match(styles, /\.moduleHeroTitle\s*\{[^}]*font-size:\s*var\(--module-title-size,/s);
  assert.match(styles, /\.moduleHeroTitle\s*\{[^}]*line-height:\s*1;/s);
  assert.doesNotMatch(styles, /#[a-z-]+-title\s*\{/);
  assert.doesNotMatch(styles, /auto-fit/);
  assert.match(styles, /\.layer:nth-child\(7n \+ 1\)/);
  assert.match(styles, /\.layer:nth-child\(7n\)/);
  assert.match(styles, /\.relatedModuleGrid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  assert.match(styles, /\.flow\s*\{[^}]*grid-auto-flow:\s*column;[^}]*grid-auto-columns:\s*minmax\(180px,1fr\);/s);
  assert.doesNotMatch(styles, /\.flow\s*\{[^}]*grid-template-columns:\s*repeat\(\d+,/s);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*?\.flow\s*\{[^}]*grid-auto-flow:\s*row;[^}]*grid-template-columns:\s*1fr;/);
  assert.match(styles, /\.referenceModuleNav\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  assert.match(styles, /\.relatedModuleGrid\[data-odd="true"\] > a:last-child,[\s\S]*?\.referenceModuleNav\[data-odd="true"\] > a:last-child\s*\{\s*grid-column:\s*span 12;/);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*?\.toplinks\s*\{\s*display:\s*flex;[^}]*width:\s*100%;/);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*?\.mechanicGrid article,[\s\S]*?grid-column:\s*span 12;/);
  assert.doesNotMatch(styles, /@media \(max-width: 720px\)[\s\S]*?\.toplinks\s*\{[^}]*display:\s*none;/);
});

test("source URLs have one code owner and are absent from content and route files", async () => {
  const [referenceContent, ragContent, agentContent, promptContent, homepage, ragRoute, agentRoute, promptRoute, referencesRoute, moduleComponents] = await Promise.all([
    readFile(new URL("../app/reference-content.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/rag-content.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/agent-content.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/prompt-content.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/modules/rag/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/modules/ai-agent/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/modules/prompt-engineering/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/references/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/module-content-components.tsx", import.meta.url), "utf8"),
  ]);
  const nonLedgerFiles = [ragContent, agentContent, promptContent, homepage, ragRoute, agentRoute, promptRoute, referencesRoute, moduleComponents];

  assert.match(referenceContent, /export const sourceLedger/);
  assert.match(referenceContent, /export const referenceModules/);
  assert.doesNotMatch(ragContent, /export const sourceLedger/);
  assert.match(ragContent, /export const ragQa/);
  assert.match(ragContent, /export const evidenceCards/);
  assert.match(agentContent, /export const agentQa/);
  assert.match(agentContent, /export const agentEvidenceCards/);
  assert.match(promptContent, /export const promptQa/);
  assert.match(promptContent, /export const promptEvidenceCards/);

  for (const source of Object.values(sourceLedger)) {
    assert.ok(referenceContent.includes(source.href), `统一来源文件缺少 URL：${source.href}`);
    for (const fileContent of nonLedgerFiles) {
      assert.ok(!fileContent.includes(source.href), `非台账文件不应维护 URL：${source.href}`);
    }
  }

  for (const fileContent of nonLedgerFiles) assert.doesNotMatch(fileContent, /https?:\/\//);

  const appRoot = new URL("../app/", import.meta.url);
  const appFiles = (await readdir(appRoot, { recursive: true }))
    .filter((relativePath) => /\.(?:mjs|tsx|ts)$/.test(relativePath))
    .filter((relativePath) => relativePath !== "reference-content.mjs");

  for (const relativePath of appFiles) {
    const fileContent = await readFile(new URL(relativePath, appRoot), "utf8");
    const withoutPublicSiteUrl = fileContent.replaceAll("https://cloud-ai-presales-fieldbook.lijx.chatgpt.site", "");
    assert.doesNotMatch(withoutPublicSiteUrl, /https?:\/\//, `外部来源 URL 只能在统一台账维护：app/${relativePath}`);
  }
});

test("project docs require independent routes, one reference page, and publish-after-push", async () => {
  const [standard, moduleStandard, qualityGates, maintenance, agentRules, layout, packageJson] = await Promise.all([
    readFile(new URL("../docs/CONTENT-DESIGN-STANDARD.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/MODULE-BUILD-STANDARD.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/MODULE-QUALITY-GATES.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/CONTENT-MAINTENANCE.md", import.meta.url), "utf8"),
    readFile(new URL("../AGENTS.md", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(standard, /每个模块使用独立页面/);
  assert.match(standard, /\/references/);
  assert.match(standard, /所有来源集中在独立/);
  assert.match(standard, /动态均衡卡片/);
  assert.match(standard, /相关模块/);
  assert.match(standard, /仅当公式直接帮助售前做架构、选型或风险判断时展示/);
  assert.match(standard, /MODULE-BUILD-STANDARD\.md/);
  assert.match(moduleStandard, /机制与组件完整性/);
  assert.match(moduleStandard, /每个关键动作和组件都必须分别讲清/);

  assert.match(moduleStandard, /定义.*机制.*边界.*判断.*证据/);
  assert.match(moduleStandard, /不为图、卡片、案例、问答或来源设置数量指标/);
  assert.match(moduleStandard, /页面统一使用“相关模块”，不用“模块依赖”/);
  assert.match(moduleStandard, /技术环节—云能力—客户价值—发现问题—验收指标/);
  assert.match(moduleStandard, /每道问题至少包含/);
  assert.match(moduleStandard, /公式必须同时满足以下条件/);
  assert.match(moduleStandard, /balanceRows\(items, maxColumns\)/);
  assert.match(moduleStandard, /内部巡检流程、责任人、字段 schema、发布步骤和构建状态不得公开/);
  assert.match(moduleStandard, /MODULE-QUALITY-GATES\.md/);
  assert.match(moduleStandard, /发布注册/);

  assert.match(qualityGates, /历史问题 → 永久门禁/);
  assert.match(qualityGates, /原理深度/);
  assert.match(qualityGates, /术语中英/);
  assert.match(qualityGates, /云服务连接/);
  assert.match(qualityGates, /动态构图/);
  assert.match(qualityGates, /Portable/);
  assert.match(qualityGates, /Reference/);
  assert.match(qualityGates, /时效性/);
  assert.match(qualityGates, /新模块 Definition of Done/);
  assert.match(qualityGates, /新的系统性问题/);

  assert.match(maintenance, /完整来源台账只呈现在 `\/references`/);
  assert.match(maintenance, /Git 推送后的公开发布/);
  assert.match(maintenance, /任何 Git 推送后/);
  assert.match(maintenance, /部署公开版本/);
  assert.match(maintenance, /轮询至成功/);

  assert.match(agentRules, /每个知识模块使用独立地址 `\/modules\/<slug>`/);
  assert.match(agentRules, /`\/references` 是全站唯一的公开来源台账/);
  assert.match(agentRules, /任何 Git 推送后/);
  assert.match(agentRules, /更新公开站点/);
  assert.match(agentRules, /轮询到发布成功/);
  assert.match(agentRules, /MODULE-QUALITY-GATES\.md/);
  assert.match(agentRules, /module-publication\.mjs/);
  assert.match(agentRules, /terminology\.mjs/);
  assert.match(agentRules, /默认匿名可读/);
  assert.match(agentRules, /新的系统性问题/);

  assert.match(layout, /lang="zh-CN"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
