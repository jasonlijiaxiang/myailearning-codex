import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { englishModuleRegistry, englishQuestions, englishSourceCopy, englishTermCopy } from "../app/i18n/en/registry.mjs";
import { englishRepresentationAssessment } from "../app/i18n/english-representation-assessment.mjs";
import {
  buildEnglishSectionGroups,
  selectVisibleEnglishEvidenceCards,
  selectVisibleEnglishQuestions,
  selectVisibleEnglishSectionGroups,
} from "../app/i18n/english-section-outline.mjs";
import { englishModuleSlugs } from "../app/i18n/locale-config.mjs";
import { moduleBriefs } from "../app/module-brief-content.mjs";
import { requireModuleContent } from "../app/module-content-registry.mjs";
import { getPublishedModule, hasDedicatedModule, publishedModuleSlugs } from "../app/module-publication.mjs";
import { sourceLedger } from "../app/reference-content.mjs";
import { terminology } from "../app/terminology.mjs";
import { getUnifiedBriefModuleConfig } from "../app/unified-brief-module-config.mjs";
import { loadPromotedProjects, loadRuntimeMaintenanceOverlays, validateLocalizationRegistry } from "../scripts/audit-localization-deferments.mjs";
import { assertJsonSchema } from "../scripts/lib/json-schema-lite.mjs";
import { loadLocalizationProject } from "../scripts/lib/localization-contract.mjs";

const slugIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const defermentsRegistry = JSON.parse(await readFile(new URL("../knowledge/localization-deferments.json", import.meta.url), "utf8"));
const defermentSchema = JSON.parse(await readFile(new URL("../knowledge/schemas/localization-deferment.schema.json", import.meta.url), "utf8"));
const reviewSchema = JSON.parse(await readFile(new URL("../knowledge/schemas/bilingual-review.schema.json", import.meta.url), "utf8"));
const candidateMatrix = JSON.parse(await readFile(new URL("../docs/change-plans/2026-08-ai-knowledge-base-content-improvement/stage-0/candidate-matrix.json", import.meta.url), "utf8"));
assertJsonSchema(defermentsRegistry, defermentSchema, "localization registry");
const runtimeMaintenance = await loadRuntimeMaintenanceOverlays(defermentsRegistry);
assert.deepEqual(runtimeMaintenance.failures, []);
const promotedProjectsByCommit = await loadPromotedProjects(defermentsRegistry);
const localizationResult = validateLocalizationRegistry(defermentsRegistry, await loadLocalizationProject(fileURLToPath(new URL("..", import.meta.url))), {
  candidateIds: new Set(candidateMatrix.candidates.map((candidate) => candidate.candidateId)),
  reviewSchema,
  promotedProjectsByCommit,
  runtimeOverlays: runtimeMaintenance.overlays,
});
assert.deepEqual(localizationResult.failures, []);
const today = new Date().toISOString().slice(0, 10);
const deferredSlugs = new Set(
  defermentsRegistry.deferments
    .filter((deferment) => deferment.status !== "closed")
    .map((deferment) => deferment.moduleSlug),
);

const ragQuestionProjection = Object.freeze({
  "long-context-vs-rag": "上下文窗口已经很长，为什么还需要 RAG？",
  "rag-vs-fine-tuning": "RAG 和微调怎么选？",
  "vector-database-required": "做 RAG 一定要向量数据库吗？",
  "managed-vs-composable": "RAG 应该选择托管云服务，还是自己拼搜索、向量库和编排？",
  "agent-mcp-a2a-boundary": "一个企业 RAG 是否还需要 Agent、MCP 或 A2A？",
  "pdf-scans-tables-images": "PDF、扫描件、表格和图片很多，RAG 还能做好吗？",
  "chunk-size-overlap": "Chunk 大小和重叠比例应该设多少？",
  "chunk-metadata-parent-page-version": "为什么 Chunk 还要保存父子关系、页码、版本和元数据？",
  "structured-data-vectorization": "数据库里的指标和交易数据，能不能直接切块后放进向量库？",
  "cross-language-retrieval": "用户用中文提问、证据主要是英文时，跨语言检索应该怎样设计？",
  "source-update-freshness": "源文档更新后，多久能在回答中生效？",
  "department-customer-access-control": "不同部门、不同客户的数据权限如何保证？",
  "malicious-instructions-in-documents": "RAG 系统会不会被文档里的恶意指令攻击？",
  "component-model-stack-selection": "解析、Embedding、Reranker、生成和评估模型，应该怎样组合选型？",
  "hybrid-rrf-reranker": "Hybrid Search、RRF 和 Reranker 各自解决什么问题？",
  "document-exists-no-answer": "为什么系统明明有文档，还是答不到？",
  "agentic-retrieval-query-decomposition": "开启 Agentic Retrieval 或查询分解后，是不是一定更准确？",
  "multi-turn-conversation-retrieval": "多轮会话中的历史问题和答案，应该怎样参与下一轮检索？",
  "evidence-insufficient-answer-action": "证据不足时，系统应该追问、继续检索、限定回答还是拒答？",
  "retrieved-right-document-still-wrong": "RAG 检到了正确文档，为什么仍可能答错？RAG 能消除幻觉吗？",
  "citations-trust-compliance": "答案已经带出处，是否就可以认定可信或合规？",
  "graphrag-everywhere": "GraphRAG 是不是向量 RAG 的升级版，所有知识库都应该上？",
  "prove-rag-beyond-demo": "如何证明 RAG 的效果，而不是做一个漂亮 Demo？",
  "production-quality-regression": "RAG 上线几个月后效果变差，应该怎样排查？",
  "latency-and-cost": "怎样控制延迟和成本？",
});

const promptQuestionProjection = Object.freeze({
  "prompt-alone-and-accuracy": "提示词写得足够好，就能解决准确性问题吗？",
  "system-prompt-is-not-security": "系统提示（System Prompt）的优先级更高，是否就等于安全？",
  "zero-shot-or-few-shot": "Zero-shot 和 Few-shot 怎么选？示例是不是越多越好？",
  "json-request-vs-structured-output": "要求模型输出 JSON，是否已经足够可靠？",
  "tool-definition-and-safe-execution": "把 API 写进 Tool Definition，模型就能安全调用了吗？",
  "prompt-rag-context-engineering": "Prompt、RAG 和 Context Engineering 是什么关系？",
  "model-upgrade-regression": "同一个 Prompt 换模型或模型升级后，可以直接上线吗？",
  "typed-template-variables": "提示模板（Prompt Template）里的变量可以直接拼字符串吗？",
  "evaluate-prompt-systematically": "怎样评估 Prompt，而不是靠人工感觉？",
  "reasoning-model-and-chain-of-thought": "推理模型（Reasoning Model）还需要写很长的思维链提示吗？",
  "prompt-chaining-or-agent": "Prompt Chaining 和 Agent 应该怎么分？",
  "prompt-caching-economics": "Prompt Caching 是否一定能降低很多成本？",
  "indirect-injection-difficulty": "为什么间接提示注入比普通恶意用户输入更难防？",
  "conflicting-instruction-sources": "系统、用户、检索内容和工具结果互相冲突时，模型应该听谁的？",
  "structured-output-needs-validation": "Structured Outputs 已经保证 JSON Schema，为什么还需要应用校验？",
  "large-tool-catalog": "工具目录很大时，怎样让模型稳定找到正确工具？",
  "attribute-prompt-improvement": "如何证明一次 Prompt 改动真的带来提升，而不是模型或上下文碰巧变化？",
  "system-developer-user-roles": "System、Developer、User 三类指令应该怎么分工？业务规则都放进 System Prompt 可以吗？",
  "large-context-load-everything": "模型上下文窗口已经很大，是否可以把所有文档、历史和规则一次性塞进去？",
  "conversation-history-lifecycle": "多轮对话历史需要全部保留吗？摘要以后还能当作原始事实吗？",
  "few-shot-customer-conversations": "Few-shot 示例可以直接使用真实客户对话吗？",
  "structured-output-recovery": "结构化输出（Structured Outputs）失败时，应该自动修复 JSON 还是重新调用模型？",
  "tool-result-trust": "工具调用后返回的结果，是不是可以作为可信事实直接交给模型？",
  "reasoning-model-or-chaining": "复杂任务应该选推理模型（Reasoning Model），还是普通模型加 Prompt Chaining？",
  "prompt-rag-or-finetuning": "一个知识类问题，应该优先用 Prompt、RAG 还是微调（Fine-tuning）？",
  "direct-vs-indirect-injection": "直接提示注入（Direct Prompt Injection）和间接提示注入（Indirect Prompt Injection）有什么区别？",
  "detector-does-not-authorize-tools": "部署提示注入检测器或敏感词规则，是否就可以开放高风险工具？",
  "calibrate-llm-judge": "用 LLM Judge 调 Prompt，怎样避免把评分器偏好当成真实提升？",
  "build-prompt-evaluation-set": "Prompt 评估集应该怎么建，怎样避免为了测试集调 Prompt？",
  "multi-tenant-cache-isolation": "企业多租户场景使用 Prompt Caching，会不会把一个客户的内容泄露给另一个客户？",
  "cost-beyond-caching": "除了 Prompt Caching，还有哪些办法可以降低大模型调用成本？",
  "version-complete-release-bundle": "Prompt 版本号只需要对应模板文字吗？",
  "canary-rollback-unit": "Prompt 灰度发布（Canary Release）出现退化时，究竟应该回滚什么？",
  "minimum-operable-prompt-platform": "要把 Prompt Engineering 变成可运营的云服务，最少需要哪些平台能力？",
  "cross-model-prompt-portability": "Prompt 能否在不同模型和云平台之间无修改迁移？",
  "demo-vs-poc-acceptance": "Prompt PoC 能稳定演示几个案例，是否就可以判定成功？",
  "risk-based-go-no-go": "Prompt PoC 的 Go / No-Go 门槛应该设成统一的 90% 或 95% 吗？",
});

const idProjectionsBySlug = Object.freeze({
  rag: Object.freeze({
    question: ragQuestionProjection,
    evidenceCard: Object.freeze({
      "dpr-top-20-improvement": "dpr-2020",
      "ragas-three-dimensions": "ragas",
      "contextual-retrieval-failure-rate": "contextual-retrieval",
      "replug-black-box-route": "replug-2024",
      "long-context-position-sensitivity": "lost-middle",
      "claim-level-citation-quality": "alce-2023",
      "deletion-not-reset": "azure-search-indexer-lifecycle",
    }),
  }),
  "prompt-engineering": Object.freeze({
    question: promptQuestionProjection,
    evidenceCard: Object.freeze({
      "four-prompt-components": "google-prompt-introduction",
      "three-optimization-prerequisites": "anthropic-prompt-overview",
      "schema-constrained-output": "openai-structured-outputs",
      "five-step-tool-loop": "openai-function-calling",
      "evaluate-every-release": "openai-prompting-guide",
      "system-prompt-residual-risk": "owasp-prompt-injection",
      "source-sink-impact-control": "openai-source-sink-injection",
      "continuous-release-evaluation": "openai-eval-best-practices",
    }),
  }),
});

function collectSourceIds(value, result = new Set()) {
  if (Array.isArray(value)) value.forEach((item) => collectSourceIds(item, result));
  else if (value && typeof value === "object") {
    if (typeof value.sourceId === "string") result.add(value.sourceId);
    if (Array.isArray(value.sourceIds)) value.sourceIds.forEach((sourceId) => result.add(sourceId));
    Object.values(value).forEach((item) => collectSourceIds(item, result));
  }
  return result;
}

function assertUniqueIds(items, label) {
  const ids = items.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, `${label} IDs must be unique`);
  ids.forEach((id) => assert.match(id, slugIdPattern, `${label} ID must be a stable slug: ${id}`));
}

function findById(items, id, label) {
  const item = items?.find((candidate) => candidate.id === id);
  assert.ok(item, `${label} must include ${id}`);
  return item;
}

function assertReadableItems(items, label, { allowBoundaryOmission = false } = {}) {
  assert.ok(items?.length, `${label} must include authored content`);
  assertUniqueIds(items, label);
  for (const item of items) {
    assert.ok(item.title?.trim(), `${label} / ${item.id} needs a readable title`);
    if (Array.isArray(item.cells)) {
      assert.ok(item.cells.length > 0, `${label} / ${item.id} table item needs relationship cells`);
      item.cells.forEach((cell, index) => {
        assert.ok(typeof cell === "string" && cell.trim(), `${label} / ${item.id} cell ${index + 1} needs readable copy`);
      });
      continue;
    }
    for (const field of ["body", "decision"]) {
      assert.ok(item[field]?.trim(), `${label} / ${item.id} needs a readable ${field}`);
    }
    if (!allowBoundaryOmission) {
      assert.ok(item.boundary?.trim(), `${label} / ${item.id} needs a readable boundary`);
    }
  }
}

function assertReadablePrimerItems(items, fields, label) {
  assert.ok(items?.length, `${label} must include authored content`);
  const titles = new Set();
  for (const item of items) {
    assert.ok(item.title?.trim(), `${label} needs a readable title`);
    assert.ok(!titles.has(item.title), `${label} titles must be unique: ${item.title}`);
    titles.add(item.title);
    for (const field of fields) {
      assert.ok(item[field]?.trim(), `${label} / ${item.title} needs a readable ${field}`);
    }
  }
}

function assertReadableUnifiedBriefConfig(config, label) {
  assert.ok(config?.shortTitle?.trim(), `${label} needs a readable short title`);
  assert.ok(config.primer?.id?.trim() && config.primer.label?.trim() && config.primer.eyebrow?.trim(), `${label} needs an identifiable, readable primer`);
  assert.ok(config.facts?.length, `${label} needs authored reader facts`);
  const labels = new Set();
  for (const fact of config.facts) {
    assert.ok(fact.label?.trim() && fact.value?.trim(), `${label} facts need readable labels and values`);
    assert.ok(!labels.has(fact.label), `${label} fact labels must be unique: ${fact.label}`);
    labels.add(fact.label);
  }
}

function assertIncludesSourceIds(item, sourceIds, label) {
  assert.ok(item, `${label} must exist`);
  const actualSourceIds = new Set(item.sourceIds ?? []);
  sourceIds.forEach((sourceId) => assert.ok(actualSourceIds.has(sourceId), `${label} must retain ${sourceId}`));
}

function assertIncludesEvidenceSources(item, sourceIds, label) {
  assert.ok(item, `${label} must exist`);
  const actualSourceIds = new Set(item.evidence?.map((entry) => entry.sourceId));
  sourceIds.forEach((sourceId) => assert.ok(actualSourceIds.has(sourceId), `${label} must retain ${sourceId}`));
}

function assertExactEvidenceSources(item, sourceIds, label) {
  assert.ok(item, `${label} must exist`);
  assert.deepEqual(
    item.evidence?.map((entry) => entry.sourceId).sort(),
    [...sourceIds].sort(),
    `${label} must keep the exact reviewed evidence set`,
  );
}

function buildUniqueMap(items, keyForItem, label) {
  const result = new Map();
  for (const item of items) {
    const key = keyForItem(item);
    assert.ok(key, `${label} needs a stable key`);
    assert.equal(result.has(key), false, `${label} key must be unique: ${key}`);
    result.set(key, item);
  }
  return result;
}

function sortedMultiset(items, signature) {
  return items.map(signature).sort();
}

function questionEvidenceSignature(item) {
  return JSON.stringify({
    addedAt: item.addedAt ?? null,
    sourceIds: [...item.evidence.map((entry) => entry.sourceId)].sort(),
  });
}

function evidenceCardSignature(card) {
  return card.sourceId;
}

function assertCompleteIdProjection(label, englishItems, canonicalItems, projection, canonicalKey) {
  const englishById = buildUniqueMap(englishItems, (item) => item.id, `${label} English item`);
  const canonicalByKey = buildUniqueMap(canonicalItems, canonicalKey, `${label} canonical item`);
  const projectedIds = Object.keys(projection);
  const projectedCanonicalKeys = Object.values(projection);
  const projectedIdSet = new Set(projectedIds);
  const projectedCanonicalKeySet = new Set(projectedCanonicalKeys);

  assert.ok(projectedIds.length, `${label} needs an explicit ID projection`);
  assert.equal(projectedIdSet.size, projectedIds.length, `${label} projection IDs must be unique`);
  assert.equal(projectedCanonicalKeySet.size, projectedCanonicalKeys.length, `${label} projection targets must be unique`);
  projectedIds.forEach((id) => assert.ok(englishById.has(id), `${label} projection has no English item for ${id}`));
  englishById.forEach((_, id) => assert.ok(projectedIdSet.has(id), `${label} English item has no projection: ${id}`));
  projectedCanonicalKeys.forEach((key) => assert.ok(canonicalByKey.has(key), `${label} projection has no canonical item for ${key}`));
  canonicalByKey.forEach((_, key) => assert.ok(projectedCanonicalKeySet.has(key), `${label} canonical item has no projection: ${key}`));

  return new Map(projectedIds.map((id) => [id, canonicalByKey.get(projection[id])]));
}

test("English edition registers every published module", () => {
  assert.deepEqual([...englishModuleSlugs], [...publishedModuleSlugs]);
  assert.deepEqual(Object.keys(englishModuleRegistry).sort(), [...publishedModuleSlugs].sort());
  const expectedEnglishTotal = publishedModuleSlugs.reduce((total, slug) => {
    if (deferredSlugs.has(slug)) return total + englishModuleRegistry[slug].qa.length;
    return total + requireModuleContent(slug).qa.length;
  }, 0);
  assert.equal(englishQuestions.length, expectedEnglishTotal);
});

test("English release audit refuses active localization deferments", () => {
  const result = spawnSync(process.execPath, ["scripts/audit-english-modules.mjs", "--require-all", "--require-aligned"], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    encoding: "utf8",
  });
  const output = `${result.stdout}${result.stderr}`;
  if (deferredSlugs.size) {
    assert.notEqual(result.status, 0, "English release audit must fail while localization deferments are active");
    assert.match(output, /English localization alignment:/);
    assert.match(output, /English release audit failed/);
  } else {
    assert.equal(result.status, 0, output);
    assert.match(output, /English localization alignment passed/);
  }
});

test("active and watch claims stay inside their review window", () => {
  const claimItems = JSON.parse(readFileSync(new URL("../knowledge/claims/index.json", import.meta.url), "utf8")).items;
  const overdue = claimItems
    .filter((claim) => ["active", "watch"].includes(claim.status))
    .filter((claim) => claim.reviewBy < today)
    .map((claim) => `${claim.id} (reviewBy ${claim.reviewBy})`);
  assert.deepEqual(overdue, [], `Claim 复核窗口已过期：${overdue.join("; ")}`);
});

test("shared English modules preserve canonical related-module routes and order", () => {
  for (const [slug, canonical] of Object.entries(moduleBriefs)) {
    assert.equal(canonical.relatedSlugs.includes(slug), false, `${slug} relatedSlugs must not link to itself`);
    assert.equal(new Set(canonical.relatedSlugs).size, canonical.relatedSlugs.length, `${slug} relatedSlugs must be unique`);
    if (deferredSlugs.has(slug)) {
      assert.ok(defermentsRegistry.deferments.some((deferment) => deferment.moduleSlug === slug), `${slug} deferred module must carry a deferment record`);
      continue;
    }
    assert.deepEqual(
      [...englishModuleRegistry[slug].relatedSlugs].sort(),
      [...canonical.relatedSlugs].sort(),
      `${slug} relatedSlugs must remain bilingual`,
    );
  }
});

test("English edition preserves canonical question evidence relationships and dates", () => {
  for (const slug of englishModuleSlugs) {
    const english = englishModuleRegistry[slug];
    const chinese = requireModuleContent(slug);
    if (deferredSlugs.has(slug)) {
      assert.ok(defermentsRegistry.deferments.some((deferment) => deferment.moduleSlug === slug), `${slug} deferred module must carry a deferment record`);
      continue;
    }
    assert.equal(english.qa.length, chinese.qa.length, `${slug} question parity`);
    assertUniqueIds(english.qa, `${slug} question`);
    const questionProjection = idProjectionsBySlug[slug]?.question;
    if (questionProjection) {
      const canonicalQaByEnglishId = assertCompleteIdProjection(
        `${slug} question`,
        english.qa,
        chinese.qa,
        questionProjection,
        (item) => item.q,
      );
      english.qa.forEach((item) => {
        assert.ok(item.q?.trim() && item.a?.trim() && item.depth?.trim() && item.ask?.trim(), `${slug} / ${item.id} needs readable question copy`);
        const canonical = canonicalQaByEnglishId.get(item.id);
        assert.ok(canonical, `${slug} / ${item.id} needs a canonical question projection`);
        assert.deepEqual(
          [...item.evidence.map((entry) => entry.sourceId)].sort(),
          [...canonical.evidence.map((entry) => entry.sourceId)].sort(),
          `${slug} / ${item.id} evidence sources`,
        );
        assert.equal(item.addedAt ?? null, canonical.addedAt ?? null, `${slug} / ${item.id} addedAt must remain canonical`);
      });
      continue;
    }

    english.qa.forEach((item) => {
      assert.ok(item.q?.trim() && item.a?.trim() && item.depth?.trim() && item.ask?.trim(), `${slug} / ${item.id} needs readable question copy`);
    });
    assert.deepEqual(
      sortedMultiset(english.qa, questionEvidenceSignature),
      sortedMultiset(chinese.qa, questionEvidenceSignature),
      `${slug} question evidence and dates must remain bilingual`,
    );
  }
});

test("English evidence cards keep canonical source relationships", () => {
  for (const slug of englishModuleSlugs) {
    const english = englishModuleRegistry[slug];
    const chinese = requireModuleContent(slug);
    if (deferredSlugs.has(slug)) continue;
    assert.equal(english.evidenceCards.length, chinese.evidenceCards.length, `${slug} evidence-card parity`);
    assertUniqueIds(english.evidenceCards, `${slug} evidence card`);
    english.evidenceCards.forEach((card) => {
      assert.ok(card.metric?.trim() && card.title?.trim() && card.finding?.trim() && card.boundary?.trim(), `${slug} / ${card.id} needs readable evidence copy`);
    });
    const evidenceCardProjection = idProjectionsBySlug[slug]?.evidenceCard;
    if (evidenceCardProjection) {
      const canonicalEvidenceCardsByEnglishId = assertCompleteIdProjection(
        `${slug} evidence card`,
        english.evidenceCards,
        chinese.evidenceCards,
        evidenceCardProjection,
        (card) => card.sourceId,
      );
      english.evidenceCards.forEach((card) => {
        const canonical = canonicalEvidenceCardsByEnglishId.get(card.id);
        assert.ok(canonical, `${slug} / ${card.id} needs a canonical evidence-card projection`);
        assert.equal(card.sourceId, canonical.sourceId, `${slug} / ${card.id} source relationship must remain canonical`);
      });
      continue;
    }
    assert.deepEqual(
      sortedMultiset(english.evidenceCards, evidenceCardSignature),
      sortedMultiset(chinese.evidenceCards, evidenceCardSignature),
      `${slug} evidence-card source relationships must remain bilingual`,
    );
  }
});

test("Batch 05 English content preserves the Agent adoption gate and MCP control model", () => {
  const agentModule = englishModuleRegistry["ai-agent"];
  const agentAdoption = agentModule.sections.find((section) => section.id === "agent-adoption-decision");
  const agentAdoptionLevels = agentAdoption.blocks.find((block) => block.items.some((item) => item.id === "agent-adoption-multi"));
  assertReadableItems(agentAdoptionLevels.items, "Agent adoption levels");
  findById(agentAdoptionLevels.items, "agent-adoption-workflow", "Agent adoption levels");
  findById(agentAdoptionLevels.items, "agent-adoption-multi", "Agent adoption levels");
  const agent = JSON.stringify(agentModule);
  assert.match(agent, /final eligibility, settlement amount/);
  assert.match(agent, /There is no universal ROI threshold/);

  const mcp = JSON.stringify(englishModuleRegistry.mcp);
  assert.match(mcp, /Adopt a protocol only when repeated integration justifies it/);
  assert.match(mcp, /Tools are model-controlled/);
  assert.match(mcp, /A Tool may be read-only/);
  assert.match(mcp, /Cancellation is cooperative/);
  assert.match(mcp, /cancelled, ttlMs, pollIntervalMs/);
  assert.doesNotMatch(mcp, /Use Tools for actions, Resources for read-only context|stateless Host|failed, canceled, TTL/);
  ["mcp-changelog-2026-07-28", "mcp-server-overview-2026-07-28", "mcp-tools-2026-07-28", "mcp-resources-2026-07-28", "mcp-prompts-2026-07-28", "mcp-tasks-extension"].forEach((sourceId) => {
    assert.ok(sourceLedger[sourceId], `${sourceId} must resolve in the canonical source ledger`);
    assert.ok(englishModuleRegistry.mcp.sources[sourceId], `${sourceId} must have independent English source copy`);
  });
});

test("Batch 06 English content preserves runtime interoperability and operations boundaries", () => {
  const a2a = JSON.stringify(englishModuleRegistry.a2a);
  assert.match(a2a, /Message \| Task/);
  assert.match(a2a, /v1\.0\.1/);
  assert.match(a2a, /A2A-Version 1\.0/);
  assert.match(a2a, /TASK_STATE_SUBMITTED, TASK_STATE_WORKING, TASK_STATE_INPUT_REQUIRED, TASK_STATE_AUTH_REQUIRED, TASK_STATE_COMPLETED, TASK_STATE_FAILED, TASK_STATE_CANCELED, and TASK_STATE_REJECTED/);
  assert.match(a2a, /eight non-UNSPECIFIED operational/);
  assert.doesNotMatch(a2a, /all eight specified Task states|Patch numbers do not appear/);
  assert.match(a2a, /patch numbers should not be used[^.]*and must not participate in version negotiation/i);
  assert.match(a2a, /COMPLETED[^.]*not[^.]*business acceptance|COMPLETED is not treated as business acceptance/);
  ["a2a-release-1-0-1", "a2a-mcp-boundary"].forEach((sourceId) => {
    assert.ok(sourceLedger[sourceId], `${sourceId} must resolve in the canonical source ledger`);
    assert.ok(englishModuleRegistry.a2a.sources[sourceId], `${sourceId} must have independent English source copy`);
  });

  const gateway = englishModuleRegistry["ai-gateway"];
  const credentialNotAuthority = findById(gateway.qa, "gateway-credential-not-user-authority", "AI Gateway questions");
  const requestRateLimit = findById(gateway.qa, "request-rate-limit-not-enough", "AI Gateway questions");
  assert.equal(credentialNotAuthority.addedAt, "2026-08-01");
  assert.equal(requestRateLimit.addedAt, "2026-08-01");
  assert.match(JSON.stringify(gateway), /Exact and semantic caching/);
  assert.match(JSON.stringify(gateway), /RPM limit cannot prevent token, concurrency, or budget exhaustion/);
  ["cloudflare-ai-gateway-authentication", "cloudflare-ai-gateway-caching", "cloudflare-ai-gateway-spend-limits", "cloudflare-ai-gateway-dynamic-routing", "azure-apim-ai-gateway", "aws-builders-library-retries"].forEach((sourceId) => {
    assert.ok(sourceLedger[sourceId], `${sourceId} must resolve in the canonical source ledger`);
    assert.ok(gateway.sources[sourceId], `${sourceId} must have independent English source copy`);
  });

  const aiOps = englishModuleRegistry["ai-ops"];
  assert.equal(aiOps.relatedSlugs.includes("ai-ops"), false);
  assert.ok(aiOps.relatedSlugs.includes("predictive-ai-mlops"));
  assert.match(JSON.stringify(aiOps), /head sampling.*tail sampling/is);
  assert.match(JSON.stringify(aiOps), /tail sampler cannot recover traces dropped upstream/i);
  assert.match(JSON.stringify(aiOps), /not traditional AIOps alert reduction or GPU-only monitoring/);
  assert.ok(sourceLedger["opentelemetry-tail-sampling"]);
  assert.ok(aiOps.sources["opentelemetry-tail-sampling"]);
});

test("Batch 07 English content preserves the training contract and predictive rollback boundaries", async () => {
  const training = englishModuleRegistry["llm-training"];
  const trainingIds = training.qa.map((item) => item.id);
  assert.equal(trainingIds.includes("gpu-scaling-efficiency"), false);
  assert.equal(trainingIds.includes("scaling-law-task-boundary"), false);
  assert.match(JSON.stringify(training), /run manifest/);
  assert.match(JSON.stringify(training), /asynchronous completion/i);
  assert.match(JSON.stringify(training), /not guarantee bitwise|do not promise cross-platform bitwise|not promising bitwise identity/i);
  const modelCompute = training.sections
    .find((section) => section.id === "deep-dive")
    .blocks.flatMap((block) => block.items)
    .find((item) => item.id === "deep-model-compute");
  assertIncludesSourceIds(modelCompute, ["megatron-3d-parallelism-2021"], "Training model-compute deep dive");
  [
    "deduplicating-training-data-2022",
    "sentencepiece-2018",
    "switch-transformer-2022",
    "pytorch-distributed-checkpoint",
    "pytorch-reproducibility",
    "hf-transformers-tokenizer-contract",
  ].forEach((sourceId) => {
    assert.ok(sourceLedger[sourceId], `${sourceId} must resolve in the canonical source ledger`);
    assert.ok(training.sources[sourceId], `${sourceId} must have independent English source copy`);
  });

  const predictive = englishModuleRegistry["predictive-ai-mlops"];
  const predictiveRollback = findById(predictive.qa, "predictive-rollback-bundle", "Predictive AI questions");
  assert.equal(predictiveRollback.addedAt, "2026-08-01");
  const predictiveProduction = predictive.sections.find((section) => section.id === "predictive-production-deep-dive");
  const predictiveSignals = predictiveProduction.blocks.find((block) => block.items.some((item) => item.id === "predictive-deep-performance"));
  assertReadableItems(predictiveSignals.items, "Predictive production signals");
  findById(predictiveSignals.items, "predictive-deep-data-quality", "Predictive production signals");
  findById(predictiveSignals.items, "predictive-deep-feedback-loop", "Predictive production signals");
  assert.match(JSON.stringify(predictive), /Technical rollback.*does not/i);
  assert.match(JSON.stringify(predictive), /Managed MLOps platform or self-built stack/);
  [
    "google-rules-of-ml",
    "ml-test-score-2017",
    "azure-ml-model-monitoring",
    "aws-sagemaker-deployment-guardrails",
  ].forEach((sourceId) => {
    assert.ok(sourceLedger[sourceId], `${sourceId} must resolve in the canonical source ledger`);
    assert.ok(predictive.sources[sourceId], `${sourceId} must have independent English source copy`);
  });

  const claimItems = JSON.parse(await readFile(new URL("../knowledge/claims/index.json", import.meta.url), "utf8")).items;
  const claimsById = Object.fromEntries(claimItems.map((claim) => [claim.id, claim]));
  assert.equal(claimsById["mlops.azure-monitoring-signals-2026-08-01"].status, "watch");
  assert.equal(claimsById["mlops.aws-deployment-guardrails-scope-2026-08-01"].status, "watch");
  assert.equal(claimsById["training.pytorch-dcp-compatibility-2026-08-01"].status, "watch");
});

test("Batch 08 English content preserves inference overload and compute procurement contracts", () => {
  const inference = englishModuleRegistry["llm-inference"];
  findById(inference.qa, "same-model-different-speed", "Inference questions");
  findById(inference.qa, "maximum-context-admission", "Inference questions");
  assert.match(JSON.stringify(inference), /Allocated devices are not ready model capacity/);
  assert.match(JSON.stringify(inference), /cache_salt/);
  assert.match(JSON.stringify(inference), /Goodput/);
  assert.match(JSON.stringify(inference), /Continuous Batching/);
  [
    "vllm-metrics-v0-12",
    "llm-serving-fairness-2024",
    "serverlessllm-2024",
    "jitserve-2026",
  ].forEach((sourceId) => {
    assert.ok(sourceLedger[sourceId], `${sourceId} must resolve in the canonical source ledger`);
    assert.ok(inference.sources[sourceId], `${sourceId} must have independent English source copy`);
  });

  const compute = englishModuleRegistry["ai-infra-compute"];
  findById(compute.qa, "peak-compute-not-speed", "Compute questions");
  findById(compute.qa, "heterogeneous-supply-risk", "Compute questions");
  assert.match(JSON.stringify(compute), /arithmetic intensity/);
  assert.match(JSON.stringify(compute), /tightly coupled/);
  assert.match(JSON.stringify(compute), /Multiple nodes do not necessarily mean multiple domains/);
  assert.doesNotMatch(compute.terms["scale-out"].definition, /across nodes/);
  assert.match(JSON.stringify(compute), /MLPerf Storage/);
  assert.match(JSON.stringify(compute), /resource TCO.*(?:does not|not).*application ROI/is);
  const canonicalCompute = requireModuleContent("ai-infra-compute");
  const trainingEvidenceCard = canonicalCompute.evidenceCards.find((card) => card.sourceId === "mlperf-training");
  assert.ok(trainingEvidenceCard);
  assert.doesNotMatch(trainingEvidenceCard.finding, /MLPerf Inference/);
  [
    "roofline-2009",
    "mlperf-training",
    "mlperf-inference-datacenter",
    "mlperf-storage-v2",
    "finops-ai-category",
    "finops-unit-economics",
  ].forEach((sourceId) => {
    assert.ok(sourceLedger[sourceId], `${sourceId} must resolve in the canonical source ledger`);
    assert.ok(compute.sources[sourceId], `${sourceId} must have independent English source copy`);
  });
});

test("Batch 09 English content preserves the platform-product and minimum-sufficient-loop contracts", async () => {
  const platform = englishModuleRegistry["ai-infra-platform"];
  const portableContainer = findById(platform.qa, "containerized-not-fully-portable", "Platform questions");
  assert.equal(portableContainer.addedAt, "2026-08-01");
  assert.match(JSON.stringify(platform), /platform control layer.*workload execution layer/is);
  assert.match(JSON.stringify(platform), /Management\/control.*identity\/data\/network.*performance\/resources.*cost allocation\/accountability/is);
  assert.match(JSON.stringify(platform), /OCI image or Kubernetes YAML is not evidence of cross-cloud or cross-accelerator migration/i);
  assert.match(JSON.stringify(platform), /platform economics and application business ROI have different owners/i);
  [
    "cncf-platforms-whitepaper",
    "kubernetes-multi-tenancy",
    "kubernetes-dra-1-36",
    "oci-image-spec-v1-1-1",
  ].forEach((sourceId) => {
    assert.ok(sourceLedger[sourceId], `${sourceId} must resolve in the canonical source ledger`);
    assert.ok(platform.sources[sourceId], `${sourceId} must have independent English source copy`);
  });

  const solution = englishModuleRegistry["solution-patterns"];
  findById(solution.qa, "solution-versus-model-api", "Solution-pattern questions");
  findById(solution.qa, "claim-intake-prohibited-actions", "Solution-pattern questions");
  assert.match(JSON.stringify(solution), /Outcome and current baseline/);
  assert.match(JSON.stringify(solution), /Measurable constraint envelope/);
  assert.match(JSON.stringify(solution), /Minimum sufficient loop/);
  assert.match(JSON.stringify(solution), /RAG.*agent.*MCP.*A2A.*gateway.*platform/is);
  ["rag-original-2020", "mcp-architecture", "a2a-concepts", "cloudflare-ai-gateway", "cncf-platforms-whitepaper"].forEach((sourceId) => {
    assert.ok(englishSourceCopy[sourceId], `${sourceId} must have shared English source copy`);
    assert.match(JSON.stringify(solution), new RegExp(sourceId));
  });
  assert.match(JSON.stringify(solution), /Go, Hold, No-Go.*Exit/is);
  assert.match(JSON.stringify(solution), /token price.*not ROI/is);
  assert.ok(sourceLedger["finops-unit-economics"]);
  assert.ok(solution.sources["finops-unit-economics"]);
  assert.ok(sourceLedger["finops-ai-tools-considerations"]);
  assert.ok(solution.sources["finops-ai-tools-considerations"]);

  const claimItems = JSON.parse(await readFile(new URL("../knowledge/claims/index.json", import.meta.url), "utf8")).items;
  const draClaim = claimItems.find((claim) => claim.id === "platform.kubernetes-dra-1-36-feature-maturity-2026-08-01");
  assert.equal(draClaim?.status, "watch");
  assert.equal(draClaim?.reviewBy, "2026-10-30");
});

test("English sections and rendered object anchors use stable, unique IDs", () => {
  const generatedPageSectionIds = new Set(["evidence", "qa"]);
  for (const slug of englishModuleSlugs) {
    const english = englishModuleRegistry[slug];
    assertUniqueIds(english.sections, `${slug} section`);
    english.sections.forEach((section) => assert.ok(!generatedPageSectionIds.has(section.id), `${slug} section ID ${section.id} conflicts with a generated page section`));
    const sectionItemIds = english.sections.flatMap((section) => section.blocks.flatMap((block) => block.items.map((item) => item.id)));
    const sectionLegacyIds = english.sections.flatMap((section) => section.blocks.flatMap((block) => block.items.flatMap((item) => item.legacyIds ?? [])));
    assert.equal(new Set([...sectionItemIds, ...sectionLegacyIds]).size, sectionItemIds.length + sectionLegacyIds.length, `${slug} current and legacy anchors must be unique`);
    sectionItemIds.forEach((id) => assert.match(id, slugIdPattern, `${slug} section-item ID must be a stable slug: ${id}`));
  }
});

test("English copy reuses stable terminology and source IDs without duplicating canonical metadata", () => {
  for (const slug of englishModuleSlugs) {
    const publication = getPublishedModule(slug);
    assert.ok(publication, `${slug} must remain a canonical published module`);
    const english = englishModuleRegistry[slug];
    publication.requiredTerms.forEach((termId) => assert.ok(english.terms[termId], `${slug} missing required English term ${termId}`));
    Object.entries(english.terms).forEach(([termId, copy]) => {
      assert.ok(terminology[termId], `${slug} has unknown termId ${termId}`);
      assert.equal(copy.name, terminology[termId].en, `${slug} must preserve the canonical English name for ${termId}`);
    });
    for (const sourceId of collectSourceIds(english)) {
      assert.ok(sourceLedger[sourceId], `${slug} has unknown sourceId ${sourceId}`);
      assert.ok(english.sources[sourceId], `${slug} is missing English source explanation ${sourceId}`);
    }
  }
  Object.values(englishSourceCopy).forEach((source) => {
    assert.deepEqual(Object.keys(source).sort(), ["kind", "note", "shortTitle"], "Localized sources may not duplicate URL, grade, or verifiedAt");
  });
  Object.keys(englishTermCopy).forEach((termId) => assert.ok(terminology[termId]));
  assert.deepEqual(
    Object.keys(englishSourceCopy).sort(),
    Object.keys(sourceLedger).sort(),
    "English source ledger must cover every canonical source",
  );
});

test("English edition content contains no unexplained Chinese prose", () => {
  const serialized = JSON.stringify(englishModuleRegistry);
  assert.doesNotMatch(serialized, /[\u3400-\u9fff]/, "English module data must not contain Chinese prose");
});

test("bilingual review contract blocks inconsistent release verdicts", async () => {
  const schema = JSON.parse(await readFile(new URL("../knowledge/schemas/bilingual-review.schema.json", import.meta.url), "utf8"));
  assert.equal(schema.properties.deterministic.minItems, 1);
  assert.ok(schema.allOf.some((rule) => rule.if?.properties?.verdict?.const === "PASS" && rule.then?.properties?.blockClass?.const === "NONE"));
  assert.ok(schema.allOf.some((rule) => rule.if?.properties?.deterministic?.contains && rule.then?.properties?.verdict?.const === "BLOCK"));
  assert.ok(schema.allOf.some((rule) => rule.if?.properties?.verdict?.const === "BLOCK" && rule.then?.properties?.blockClass?.not?.const === "NONE"));
});

test("English pages reuse the established Chinese design system", async () => {
  const [englishHome, englishModulePage, englishLayout, chineseLayout] = await Promise.all([
    readFile(new URL("../app/(en)/en/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n/english-pilot-module-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/layout.tsx", import.meta.url), "utf8"),
  ]);
  ["fieldbookHome", "hero heroV2", "topbar", "heroGrid heroGridV2", "heroDecisionPanel", "fieldbookPromise", "promiseGrid"].forEach((className) => assert.match(englishHome, new RegExp(className)));
  ["modulePageHero moduleBriefHero", "moduleArticleLayout", "moduleBriefSection", "evidenceGrid", "qaList"].forEach((className) => assert.match(englishModulePage, new RegExp(className)));
  assert.match(englishModulePage, /ModuleReadingNav/);
  assert.match(englishModulePage, /ModuleHeroMetrics/);
  const cssImports = (source) => [...source.matchAll(/^import\s+["']([^"']+\.css)["'];?$/gm)].map((match) => match[1]);
  assert.deepEqual(cssImports(englishLayout), cssImports(chineseLayout), "English and Chinese root layouts must share the same visual system");
  assert.doesNotMatch(`${englishHome}\n${englishModulePage}`, /import\s+["'][^"']+\.css["']/, "English routes must not introduce route-specific stylesheets");
});

test("English home and knowledge graph expose the same interactive discovery capabilities", async () => {
  const [englishHome, englishGraph, englishGraphData, englishLayout] = await Promise.all([
    readFile(new URL("../app/(en)/en/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/en/knowledge-graph/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n/en/graph-data.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(englishHome, /KnowledgeSearchLaunch/);
  assert.match(englishHome, /ModuleExplorer/);
  assert.match(englishHome, /knowledgeIndexUrl="\/search\/knowledge\.en\.json"/);
  assert.match(englishHome, /learningPathsV2/);
  assert.match(englishHome, /\/en\/knowledge-graph/);
  assert.match(englishGraph, /KnowledgeConstellation/);
  assert.match(englishGraph, /language="en"/);
  assert.match(englishGraphData, /englishGraphModules/);
  assert.match(englishGraphData, /englishGraphTerms/);
  assert.match(englishLayout, /<html lang="en">/);
  assert.doesNotMatch(englishLayout, /DocumentLanguage/);
});

test("reader-facing English routes use interface space for knowledge instead of language-status labels", async () => {
  const routeSources = await Promise.all([
    "../app/(en)/en/page.tsx",
    "../app/(en)/en/questions/page.tsx",
    "../app/(en)/en/glossary/page.tsx",
    "../app/(en)/en/references/page.tsx",
    "../app/(en)/layout.tsx",
    "../app/i18n/english-pilot-module-page.tsx",
  ].map((file) => readFile(new URL(file, import.meta.url), "utf8")));
  const renderedCopy = routeSources.join("\n");
  assert.doesNotMatch(renderedCopy, /English edition|in English|available in English|English fieldbook/i);
  assert.match(routeSources[0], /const layerCount = layers\.length/);
  assert.match(routeSources[0], /independent modules/);
  assert.match(routeSources[0], /knowledge layers/);
});

test("English module pages render the canonical knowledge view before the shared reading outline", async () => {
  const englishModulePage = await readFile(new URL("../app/i18n/english-pilot-module-page.tsx", import.meta.url), "utf8");
  assert.match(englishModulePage, /publication\.knowledgeView/);
  assert.match(englishModulePage, /deriveEnglishPrimer/);
  assert.match(englishModulePage, /primer \? <EnglishModulePrimer module=\{module\} primer=\{primer\} \/> : null/);
  assert.match(englishModulePage, /<ModuleKnowledgeExplorer view=\{explorerView\} locale="en" \/>/, "English modules must share the canonical interactive knowledge view");
  assert.doesNotMatch(englishModulePage, /className="extensionPrimerMap"/, "English modules must not fall back to the old static card rail");
  assert.match(englishModulePage, /<DeepDiveRelationView[\s\S]*locale="en"/, "English step relationships should use the shared adaptive relation view");
  assert.match(englishModulePage, /usesFocusedReadingProfile \? renderRelatedSection\(/, "focused pages must place related modules after the main argument");
  for (const slug of englishModuleSlugs) assert.ok(getPublishedModule(slug), `${slug} needs a canonical bilingual publication contract`);
  for (const [slug, module] of Object.entries(englishModuleRegistry)) {
    if (!module.primer) continue;
    assert.equal(module.primer.id, getPublishedModule(slug).knowledgeView, `${slug} explicit primer must use the canonical knowledge-view ID`);
    assertReadablePrimerItems(module.primer.steps, ["detail", "signal"], `${slug} explicit primer mechanisms`);
    assertReadablePrimerItems(module.primer.checks, ["detail"], `${slug} explicit primer decision checks`);
    module.primer.termIds.forEach((termId) => assert.ok(module.terms[termId], `${slug} primer term must resolve to English copy`));
  }
});

test("English content representation is assessed block by block without a visual quota", () => {
  assert.deepEqual(Object.keys(englishRepresentationAssessment).sort(), [...englishModuleSlugs].sort());

  for (const [slug, englishModule] of Object.entries(englishModuleRegistry)) {
    const expectedBlockCount = englishModule.sections.reduce((total, section) => total + section.blocks.length, 0);
    const assessment = englishRepresentationAssessment[slug];
    assert.equal(assessment.blocks.length, expectedBlockCount, `${slug} must assess every English content block`);
    assert.equal(
      assessment.blocks.filter((block) => block.representation === "editorial-steps").length,
      englishModule.sections.flatMap((section) => section.blocks).filter((block) => block.type === "steps").length - assessment.visualStepCount,
      `${slug} must keep non-relational step content as readable prose`,
    );
  }
});

test("shared English readers preserve every authored section in authored order without a role quota", async () => {
  for (const slug of englishModuleSlugs.filter((moduleSlug) => !hasDedicatedModule(moduleSlug))) {
    const englishModule = englishModuleRegistry[slug];
    const groups = buildEnglishSectionGroups(englishModule);
    assert.deepEqual(
      groups.flatMap((group) => group.sections).map((section) => section.id),
      englishModule.sections.map((section) => section.id),
      `${slug} must retain every authored section in its authored order`,
    );
    assert.equal(new Set(groups.map((group) => group.id)).size, groups.length, `${slug} needs stable, non-duplicated reader anchors`);
    for (const group of groups) {
      assert.ok(group.label.trim(), `${slug} group ${group.id} needs a readable label`);
      assert.ok(group.eyebrow.trim(), `${slug} group ${group.id} needs readable context`);
    }
  }

  const mcpGroups = buildEnglishSectionGroups(englishModuleRegistry.mcp);
  assert.deepEqual(
    mcpGroups.flatMap((group) => group.sections).map((section) => section.id),
    englishModuleRegistry.mcp.sections.map((section) => section.id),
    "MCP must not lose or reorder authored argument sections",
  );

  const englishModulePage = await readFile(new URL("../app/i18n/english-pilot-module-page.tsx", import.meta.url), "utf8");
  assert.ok(englishModulePage.indexOf("visibleSectionGroups.map") < englishModulePage.indexOf('id="evidence"'), "authored reading groups must render before evidence");
  assert.doesNotMatch(englishModulePage, /visibleMainGroups|cloudGroups/, "reader must not reorder content around a fixed cloud role");
  assert.match(englishModulePage, /configuredModeByGroupId\.get\(group\.id\) \?\? "learn"/, "unconfigured authored groups must remain readable in Systematic study");
});

test("a dedicated focused English module keeps its complete authored reader instead of a preview", () => {
  const rag = englishModuleRegistry.rag;
  const ragGroups = buildEnglishSectionGroups(rag);
  assert.deepEqual(selectVisibleEnglishSectionGroups(rag).map((group) => group.id), ragGroups.map((group) => group.id));
  assert.equal(selectVisibleEnglishEvidenceCards(rag).length, rag.evidenceCards.length);
  assert.equal(selectVisibleEnglishQuestions(rag).length, rag.qa.length);

  const mcp = englishModuleRegistry.mcp;
  const visibleMcpGroups = selectVisibleEnglishSectionGroups(mcp);
  const authoredMcpGroupIds = new Set(buildEnglishSectionGroups(mcp).map((group) => group.id));
  assert.ok(visibleMcpGroups.every((group) => authoredMcpGroupIds.has(group.id)), "MCP preview groups must project from the authored reader");
  const visibleMcpEvidence = selectVisibleEnglishEvidenceCards(mcp);
  const visibleMcpQuestions = selectVisibleEnglishQuestions(mcp);
  assert.ok(visibleMcpEvidence.length, "MCP preview must retain source-backed evidence");
  assert.ok(visibleMcpQuestions.length, "MCP preview must retain readable questions");
  assert.ok(visibleMcpEvidence.every((card) => mcp.evidenceCards.some((candidate) => candidate.id === card.id)), "MCP preview evidence must project from the authored collection");
  assert.ok(visibleMcpQuestions.every((question) => mcp.qa.some((candidate) => candidate.id === question.id)), "MCP preview questions must project from the authored collection");
});

test("reviewed English production modules retain direct professional copy and controlled acceptance terms", async () => {
  const gateway = JSON.stringify(englishModuleRegistry["ai-gateway"]);
  assert.doesNotMatch(gateway, /appropriately minimized historical traffic|Model requests, tokens, concurrency|exercise route reason|exercise the routing rationale|Not yet\.|cost per successful task/);
  assert.match(gateway, /historical traffic samples minimized for the stated purpose/);
  assert.match(gateway, /No—not on its own\./);
  assert.match(gateway, /task success rate/);
  assert.match(gateway, /least-privilege downstream scope for its tenant, project, model, and task/);

  const { sources: aiOpsSources, ...aiOpsReaderCopy } = englishModuleRegistry["ai-ops"];
  assert.ok(aiOpsSources);
  const aiOps = JSON.stringify(aiOpsReaderCopy);
  assert.doesNotMatch(aiOps, /\bTool(?:s)?\b/, "generic tools must remain lowercase outside MCP protocol copy");
  assert.doesNotMatch(aiOps, /cost per accepted|complete release versions|RAG evaluates retrieval and citation, agents Tools|useful throughput/);
  assert.match(aiOps, /OpenTelemetry Collector/);
  assert.match(aiOps, /tool and side-effect tests/);
  assert.match(aiOps, /responses to requests with compatible authorization/);
  assert.match(aiOps, /scale sampled evaluation/);
  assert.match(aiOps, /SLO-satisfying Goodput/);

  const inference = JSON.stringify(englishModuleRegistry["llm-inference"]);
  assert.doesNotMatch(inference, /regress facts, Chinese|fit fewer devices or more sessions|combination can canary|queue has already failed|Average response time cannot accept inference|cost per successful task/);
  assert.match(inference, /Chinese-language behavior, long-context handling/);
  assert.match(inference, /run on fewer devices or support more concurrent sessions/);
  assert.match(inference, /highest concurrency at which the workload still meets its SLO/);
  assert.match(inference, /demonstrate canary deployment, traffic draining, and rollback/);
  assert.match(inference, /SLO-satisfying Goodput/);

  const { sources: computeSources, ...computeReaderCopy } = englishModuleRegistry["ai-infra-compute"];
  assert.ok(computeSources);
  const compute = JSON.stringify(computeReaderCopy);
  assert.doesNotMatch(compute, /conforming result|accepted duration|Accept with rejection|\bSpot\b|Ask the customer:/);
  assert.match(compute, /time to the stated quality target/);
  assert.match(compute, /SLO-satisfying Goodput/);
  assert.match(compute, /cost per result that meets the stated criteria/);

  const { sources: platformSources, ...platformReaderCopy } = englishModuleRegistry["ai-infra-platform"];
  assert.ok(platformSources);
  const platform = JSON.stringify(platformReaderCopy);
  assert.doesNotMatch(platform, /\bcosted\b|conforming service|accepted output|qualifying candidates|cost per success|unit success|\bQOS\b|\bSpot\b|Ask the customer:/);
  assert.match(platform, /model FLOPs utilization \(MFU\)/);
  assert.match(platform, /cost per task that meets stated acceptance criteria/);
  assert.match(platform, /device preparation, image pulls, data mounting, and model loading/);

  const { sources: trainingSources, ...trainingReaderCopy } = englishModuleRegistry["llm-training"];
  assert.ok(trainingSources);
  const training = JSON.stringify(trainingReaderCopy);
  assert.doesNotMatch(training, /\bRun contract|resolves to|accepted metrics|OOM memory composition|OOM exposure|Most enterprises need|Ask the customer:/);
  assert.match(training, /valid training progress while the cluster meets declared integrity, recovery, and service objectives/);
  assert.match(training, /RLHF trains a reward model and then optimizes a policy against it/);
  assert.match(training, /predeclared acceptance metrics/);

  const standard = await readFile(new URL("../docs/ENGLISH-EDITORIAL-STANDARD.md", import.meta.url), "utf8");
  assert.match(standard, /Direct technical prose/);
  assert.match(standard, /MCP's named protocol primitives/);
  assert.match(standard, /SLO-satisfying Goodput/);
});

test("Batch 10 English content preserves governance and model-selection boundaries", () => {
  const governance = englishModuleRegistry["ai-governance"];
  findById(governance.qa, "china-private-deployment-triage", "Governance questions");
  findById(governance.qa, "claim-intake-governance-boundary", "Governance questions");
  assertIncludesEvidenceSources(
    findById(governance.qa, "china-content-labeling-scope", "Governance questions"),
    ["china-ai-content-labeling-2026-08-05", "china-ai-service-management"],
    "Governance content-labeling question",
  );
  assert.match(JSON.stringify(governance), /Successful generation, content review, labeling, and business approval for publication are (?:four )?distinct control states/);
  assert.doesNotMatch(JSON.stringify(governance), /Generation succeeding|align filing thresholds/);
  const governanceLab = governance.sections
    .find((section) => section.id === "governance-study-guide")
    .blocks.flatMap((block) => block.items)
    .find((item) => item.id === "governance-lab-china-delivery-evidence");
  assertIncludesSourceIds(governanceLab, ["china-ai-content-labeling-2026-08-05", "gb-45438-2025", "nist-ai-rmf"], "Governance China delivery lab");
  const governanceLabeling = governance.sections
    .find((section) => section.id === "governance-deep-dive")
    .blocks.flatMap((block) => block.items)
    .find((item) => item.id === "governance-obligation-labeling");
  assertIncludesSourceIds(governanceLabeling, ["china-ai-content-labeling-2026-08-05", "china-ai-service-management"], "Governance labeling obligation");

  const modelLandscape = englishModuleRegistry["model-landscape"];
  findById(modelLandscape.qa, "platform-catalog-claim-boundary", "Model-landscape questions");
  findById(modelLandscape.qa, "domestic-international-model-comparison", "Model-landscape questions");
  const maasTable = modelLandscape.sections
    .find((section) => section.id === "deep-dive")
    .blocks.find((block) => block.type === "table" && block.items.some((item) => item.id === "maas-region-delivery-gates"));
  assert.ok(maasTable);
  assertReadableItems(maasTable.items, "MaaS procurement dimensions");
  assert.ok(maasTable.items.every((item) => item.sourceIds?.length), "every MaaS procurement dimension must render its source links");
  assertIncludesSourceIds(
    findById(maasTable.items, "maas-region-delivery-gates", "MaaS procurement dimensions"),
    ["nist-genai-profile", "openai-models", "google-models", "anthropic-models"],
    "MaaS region and delivery gate",
  );
  const { sources: modelSources, ...modelReaderCopy } = modelLandscape;
  assert.ok(modelSources["dify-open-source-license"]);
  assert.ok(modelSources["dify-enterprise-pricing"]);
  const modelCopy = JSON.stringify(modelReaderCopy);
  assert.doesNotMatch(modelCopy, /decision face|China delivery|dynamic facts|cost per accepted/i);
  assert.match(modelCopy, /qualified task/);
  assert.match(modelCopy, /self-hosted without a subscription/);

});

test("Batch 11 English content preserves content-delivery, multimodal, and claims boundaries", () => {
  const security = englishModuleRegistry.security;
  assertIncludesEvidenceSources(findById(security.qa, "content-labeling-log-controls", "Security questions"), ["china-ai-content-labeling-2026-08-05"], "Security content-labeling question");
  assertIncludesEvidenceSources(findById(security.qa, "multimodal-content-incident-forensics", "Security questions"), ["nist-sp-800-61r3", "c2pa-2-4"], "Security multimodal-forensics question");
  assertIncludesEvidenceSources(findById(security.qa, "claims-material-indirect-injection", "Security questions"), ["owasp-prompt-injection", "nist-zero-trust"], "Security claims-injection question");
  const securityCopy = JSON.stringify(security);
  assert.match(securityCopy, /specific Article 9 scenario/);
  assert.match(securityCopy, /does not independently establish the truth of assertions, a signer's real-world identity or authority/);
  assert.match(securityCopy, /parse it in isolation, retain provenance and trust labels/);

  const multimodal = englishModuleRegistry.multimodal;
  const multimodalCurriculum = multimodal.sections.find((section) => section.id === "multimodal-curriculum");
  const multimodalChapters = multimodalCurriculum.blocks.find((block) => block.items.some((item) => item.id === "chapter-barge-in-state-recovery"));
  assertReadableItems(multimodalChapters.items, "Multimodal curriculum");
  const multimodalPractice = multimodal.sections.find((section) => section.id === "multimodal-practice");
  const multimodalLabs = multimodalPractice.blocks.find((block) => block.items.some((item) => item.id === "lab-barge-in-state-recovery"));
  assertReadableItems(multimodalLabs.items, "Multimodal practice labs");
  assertIncludesSourceIds(
    findById(multimodalChapters.items, "chapter-barge-in-state-recovery", "Multimodal curriculum"),
    ["nist-genai-profile", "opentelemetry-semconv", "opentelemetry-genai-semconv"],
    "Multimodal barge-in curriculum chapter",
  );
  assert.match(JSON.stringify(multimodal), /Generation, content review, disclosure and distribution requirements, authorized release, and post-release accountability are independent states/);
  assert.match(JSON.stringify(multimodal), /C2PA validation checks the integrity of recorded provenance assertions and their binding to an asset/);

  const solution = englishModuleRegistry["solution-patterns"];
  const prohibitedClaimAction = findById(solution.qa, "claim-intake-prohibited-actions", "Solution-pattern questions");
  assert.equal(prohibitedClaimAction.addedAt, "2026-08-05");
  const solutionCurriculum = solution.sections.find((section) => section.id === "solution-pattern-curriculum");
  const solutionChapters = solutionCurriculum.blocks.find((block) => block.items.some((item) => item.id === "solution-chapter-china-delivery-evidence"));
  assertReadableItems(solutionChapters.items, "Solution-pattern curriculum");
  const chinaChapter = findById(solutionChapters.items, "solution-chapter-china-delivery-evidence", "Solution-pattern curriculum");
  assertIncludesSourceIds(chinaChapter, ["china-ai-content-labeling-2026-08-05", "gb-45438-2025", "nist-genai-profile"], "Solution China delivery chapter");
  const claimsBlueprint = solution.sections
    .find((section) => section.id === "solution-deep-dive")
    .blocks.find((block) => block.items.some((item) => item.id === "solution-claims-intake-exit"));
  assertReadableItems(claimsBlueprint.items, "Solution claims-intake blueprint");
  assert.match(JSON.stringify(solution), /must not automatically assess damage, deny a claim, determine eligibility or amount, or initiate payment/);
  assert.doesNotMatch(JSON.stringify(solution), /filing or registration triage/);
});

test("Batch 12 English content preserves protocol, memory, and evaluation boundaries", () => {
  const a2a = englishModuleRegistry.a2a;
  [
    "a2a-concepts", "a2a-specification", "a2a-mcp-boundary", "mcp-tasks-extension", "anthropic-effective-agents",
    "opentelemetry-semconv", "opentelemetry-genai-semconv", "nist-genai-profile", "nist-zero-trust", "a2a-release-1-0-1",
    "a2a-agent-discovery", "a2a-extensions",
  ].forEach((sourceId) => assert.ok(a2a.sources[sourceId], `A2A must retain source copy for ${sourceId}`));
  const a2aCopy = JSON.stringify(a2a);
  assert.match(a2aCopy, /protocol-level COMPLETED state/);
  assert.match(a2aCopy, /reconcile side effects with the business system/);
  assert.match(a2aCopy, /messageId ≠ exactly once/);
  assert.match(a2aCopy, /SubscribeToTask.*no resume cursor or historical replay.*ListTasks.*pagination/s);
  assert.match(a2aCopy, /Task is already terminal.*SubscribeToTask MUST return UnsupportedOperationError/s);
  assert.match(a2aCopy, /For each configured webhook.*MUST attempt push delivery at least once.*MAY retry failed deliveries.*MAY stop.*successful at-least-once delivery is not guaranteed/s);
  assert.match(a2aCopy, /pushNotifications is false or absent.*PushNotificationNotSupportedError/s);
  assert.match(a2aCopy, /Server requires an Extension marked required.*Client did not declare support.*MUST return ExtensionSupportRequiredError/s);
  assert.match(a2aCopy, /unsupported version of an optional Extension.*SHOULD ignore.*MUST NOT fall back to another version/s);
  assert.match(a2aCopy, /contextId is absent.*MAY generate one.*rejects that value.*MUST return an error rather than silently replace it/s);
  assert.match(a2aCopy, /MAY generate one.*MUST include a generated value.*returned Task or Message/s);
  assert.match(a2aCopy, /server-generated contextId values as opaque/);
  assert.match(a2aCopy, /taskId in a client Message MUST reference an existing accessible Task.*cannot create a new Task/s);
  assert.match(a2aCopy, /only taskId is supplied.*MUST infer contextId.*both are supplied but do not match.*MUST reject/s);
  assert.match(a2aCopy, /nonexistent or inaccessible taskId causes the Agent to return TaskNotFoundError/);
  assert.match(a2aCopy, /Extended Agent Card is not an Extension/);
  assertIncludesEvidenceSources(findById(a2a.qa, "a2a-identifier-lineage", "A2A questions"), ["a2a-specification"], "A2A identifier-lineage question");
  assertIncludesEvidenceSources(findById(a2a.qa, "extension-versus-extended-card", "A2A questions"), ["a2a-agent-discovery", "a2a-extensions", "a2a-specification"], "A2A Extension question");
  assert.doesNotMatch(a2aCopy, /mcp-architecture|a2a-spec-1-0-0/);

  const agent = englishModuleRegistry["ai-agent"];
  [
    "openai-hugging-face-incident-technical-report-2026", "metr-openai-hf-incident-2026", "ncsc-agentic-ai-risk-interim-2026",
  ].forEach((sourceId) => assert.ok(agent.sources[sourceId], `AI Agent must retain source copy for ${sourceId}`));
  const memorySection = agent.sections.find((section) => section.id === "agent-memory-poisoning");
  const memoryLifecycle = memorySection.blocks.find((block) => block.items.some((item) => item.id === "agent-memory-write-trust"));
  assertReadableItems(memoryLifecycle.items, "Agent memory lifecycle");
  assertIncludesSourceIds(findById(memoryLifecycle.items, "agent-memory-write-trust", "Agent memory lifecycle"), ["aws-agentcore-memory", "nist-genai-profile", "owasp-llm-top-ten"], "Agent memory-write boundary");
  const lowCodeSection = agent.sections.find((section) => section.id === "agent-low-code-choice");
  const lowCodeDecisions = lowCodeSection.blocks.find((block) => block.items.some((item) => item.id === "agent-delivery-tool-protocol"));
  assertReadableItems(lowCodeDecisions.items, "Agent delivery decisions");
  assertIncludesSourceIds(findById(lowCodeDecisions.items, "agent-delivery-tool-protocol", "Agent delivery decisions"), ["mcp-specification-2026-07-28"], "Agent tool-protocol decision");
  const harnessSection = agent.sections.find((section) => section.id === "agent-harness-engineering");
  const planeMatrix = harnessSection.blocks.find((block) => block.items.some((item) => item.id === "harness-plane-evidence"));
  assertReadableItems(planeMatrix.items, "Agent execution-control-evidence planes");
  assertIncludesSourceIds(findById(planeMatrix.items, "harness-plane-evidence", "Agent planes"), ["openai-hugging-face-incident-technical-report-2026", "metr-openai-hf-incident-2026", "ncsc-agentic-ai-risk-interim-2026"], "Agent evidence plane");
  const runtimeSection = agent.sections.find((section) => section.id === "agent-production-runtime");
  const safeExit = runtimeSection.blocks.find((block) => block.items.some((item) => item.id === "agent-safe-exit-detect"));
  assertReadableItems(safeExit.items, "Agent Safe Exit sequence");
  assertIncludesEvidenceSources(findById(agent.qa, "blocked-task-safe-exit", "Agent questions"), ["openai-hugging-face-incident-technical-report-2026", "metr-openai-hf-incident-2026", "ncsc-agentic-ai-risk-interim-2026"], "Agent Safe Exit question");
  const agentCopy = JSON.stringify(agent);
  assert.match(agentCopy, /Lab attack rates do not predict production incidence/);
  assert.match(agentCopy, /no impact to OpenAI customer data.*does not cover the affected Hugging Face systems or data/s);

  const evaluation = englishModuleRegistry.evaluation;
  const evaluationCurriculum = evaluation.sections.find((section) => section.id === "evaluation-curriculum");
  const courseChapters = evaluationCurriculum.blocks.find((block) => block.items.some((item) => item.id === "chapter-evaluation-handoff"));
  assertReadableItems(courseChapters.items, "Evaluation curriculum");
  assertIncludesSourceIds(findById(courseChapters.items, "chapter-evaluation-handoff", "Evaluation curriculum"), ["nist-ai-800-4", "opentelemetry-genai-semconv"], "Evaluation handoff chapter");
  const benchmarkAtlas = evaluation.sections.find((section) => section.id === "evaluation-benchmark-atlas");
  const benchmarkFamilies = benchmarkAtlas.blocks.find((block) => block.items.some((item) => item.id === "benchmark-general-qa"));
  assertReadableItems(benchmarkFamilies.items, "Evaluation benchmark families");
  const benchmarkBoundary = benchmarkAtlas.blocks.find((block) => block.items.some((item) => item.id === "benchmark-atlas-boundary"));
  assertIncludesSourceIds(
    findById(benchmarkBoundary.items, "benchmark-atlas-boundary", "Evaluation benchmark boundary"),
    ["swe-bench", "terminal-bench", "beir-2021", "webarena-2024", "harness-bench-2026", "longvideobench-2024", "openai-eval-best-practices"],
    "Evaluation benchmark boundary",
  );
  const evaluationStudyGuide = evaluation.sections.find((section) => section.id === "evaluation-study-guide");
  const evaluationRoute = evaluationStudyGuide.blocks.find((block) => block.items.some((item) => item.id === "route-freeze-complete-evaluation-contract"));
  assertReadableItems(evaluationRoute.items, "Evaluation learning route", { allowBoundaryOmission: true });
  findById(evaluationRoute.items, "route-freeze-complete-evaluation-contract", "Evaluation learning route");
  findById(evaluationRoute.items, "route-report-uncertainty-and-handoff", "Evaluation learning route");
  const evaluationLabs = evaluationStudyGuide.blocks.find((block) => block.items.some((item) => item.id === "lab-refund-agent-contract"));
  assertReadableItems(evaluationLabs.items, "Evaluation practice labs");
  assert.match(JSON.stringify(evaluation), /A leaderboard is a screening input/);
  assert.doesNotMatch(JSON.stringify(evaluation), /cost per accepted/i);
});

test("Batch 13 English content preserves data, tuning, and MCP boundaries", () => {
  const data = englishModuleRegistry["data-engineering"];
  const crossBorderData = findById(data.qa, "cross-border-vectorized-data", "Data-engineering questions");
  assert.equal(crossBorderData.addedAt, "2026-08-05");
  assertIncludesEvidenceSources(crossBorderData, ["china-personal-information-protection-law", "china-data-cross-border-2024"], "Cross-border vectorized-data question");
  [
    "docling-report", "w3c-prov-o", "openlineage-spec", "iso-iec-5259-2", "nist-zero-trust", "hnsw-2016", "nist-genai-profile",
    "china-personal-information-protection-law", "china-data-cross-border-2024", "pp-ocr-2020", "opentelemetry-semconv",
  ].forEach((sourceId) => assert.ok(data.sources[sourceId], `Data Engineering must retain source copy for ${sourceId}`));
  const dataCurriculum = data.sections.find((section) => section.id === "curriculum");
  const dataChapters = dataCurriculum.blocks.find((block) => block.items.some((item) => item.id === "curriculum-data-readiness-triage"));
  assertReadableItems(dataChapters.items, "Data-engineering curriculum");
  assertIncludesSourceIds(findById(dataChapters.items, "curriculum-data-readiness-triage", "Data-engineering curriculum"), ["nist-genai-profile", "nist-zero-trust", "w3c-prov-o"], "Data-readiness triage chapter");
  const dataPractice = data.sections.find((section) => section.id === "study-guide");
  const dataLabs = dataPractice.blocks.find((block) => block.items.some((item) => item.id === "lab-data-readiness-triage"));
  assertReadableItems(dataLabs.items, "Data-engineering practice labs");
  const dataPrinciples = data.sections.find((section) => section.id === "principles");
  const dataPrincipleItems = dataPrinciples.blocks.find((block) => block.items.some((item) => item.id === "principle-cross-region-flow"));
  assertReadableItems(dataPrincipleItems.items, "Data-engineering principles", { allowBoundaryOmission: true });
  const dataResponsibilityBoundary = dataPrinciples.blocks.find((block) => block.items.some((item) => item.id === "data-engineering-boundary"));
  const dataResponsibilityItem = findById(dataResponsibilityBoundary.items, "data-engineering-boundary", "Data-engineering responsibility boundary");
  assert.ok(dataResponsibilityItem.title?.trim(), "Data-engineering responsibility handoff needs a readable title");
  assert.ok(dataResponsibilityItem.body?.trim(), "Data-engineering responsibility handoff needs readable body copy");
  assert.ok(dataResponsibilityItem.boundary?.trim(), "Data-engineering responsibility handoff needs a readable boundary");
  assert.match(JSON.stringify(data), /Chunking, embeddings, vectorization, or caching do not by themselves change the data classification/);
  assert.doesNotMatch(JSON.stringify(data), /Governability|withdrawable|Acceptance:/);

  const fineTuning = englishModuleRegistry["fine-tuning"];
  assertIncludesEvidenceSources(findById(fineTuning.qa, "prove-tuning-effectiveness", "Fine-tuning questions"), ["nist-genai-profile", "openai-eval-best-practices", "hf-trl-sft-trainer"], "Fine-tuning effectiveness question");
  const tuningCurriculum = fineTuning.sections.find((section) => section.id === "tuning-curriculum");
  const tuningChapters = tuningCurriculum.blocks.find((block) => block.items.some((item) => item.id === "curriculum-preference-verifiable-reward"));
  assertReadableItems(tuningChapters.items, "Fine-tuning curriculum");
  assertIncludesSourceIds(findById(tuningChapters.items, "curriculum-preference-verifiable-reward", "Fine-tuning curriculum"), ["deepseek-r1-2025", "dpo-2023", "hf-trl-dpo-trainer", "nist-genai-profile"], "Fine-tuning preference chapter");
  const tuningPractice = fineTuning.sections.find((section) => section.id === "tuning-practice");
  const tuningLabs = tuningPractice.blocks.find((block) => block.items.some((item) => item.id === "lab-lora-release-gate"));
  assertReadableItems(tuningLabs.items, "Fine-tuning practice labs");
  assertIncludesSourceIds(findById(tuningLabs.items, "lab-lora-release-gate", "Fine-tuning practice labs"), ["hf-trl-peft", "lora-2021", "qlora-2023", "nist-genai-profile", "finops-unit-economics"], "Fine-tuning LoRA release lab");
  assert.equal(fineTuning.primer.layout, "lifecycle");
  assert.ok(fineTuning.primer.steps.some((step) => step.title === "Canary, observe, roll back, or stop"), "Fine-tuning primer must retain its release-and-rollback decision");
  const fineTuningCopy = JSON.stringify(fineTuning);
  assert.match(fineTuningCopy, /claims-intake|Completion criterion:|Define the evaluation before training/);
  assert.doesNotMatch(fineTuningCopy, /claim-intake|cost per accepted|Acceptance:|Define the exam/);

  const mcp = englishModuleRegistry.mcp;
  assert.ok(Object.hasOwn(mcp.sources, "mcp-2026-07-28-rc"));
  ["mcp-mrtr-2026-07-28", "mcp-list-cache-2026-07-28", "mcp-http-routing-2026-07-28"].forEach((sourceId) => {
    assert.ok(mcp.sources[sourceId], `MCP must retain source copy for ${sourceId}`);
  });
  const mcpTasks = findById(mcp.qa, "long-running-mcp-call", "MCP questions");
  assert.match(mcpTasks.a, /Client opts in per request/);
  assert.match(mcpTasks.a, /CreateTaskResult only for tools\/call/);
  assert.match(mcpTasks.depth, /Server advertise it through server\/discover/);
  const mcpCopy = JSON.stringify(mcp);
  assert.match(mcpCopy, /MCP 2026-07-28 is the current final specification/);
  assert.match(mcpCopy, /input_required.*new JSON-RPC id.*inputResponses.*requestState/s);
  assert.match(mcpCopy, /prompts\/get, resources\/read, and tools\/call may return input_required.*every InputRequiredResult MUST contain at least one/s);
  assert.match(mcpCopy, /resultType: complete results for server\/discover.*resources\/templates\/list.*require ttlMs/s);
  assert.match(mcpCopy, /input_required.*MRTR retries.*MUST NOT be cached/s);
  assert.match(mcpCopy, /private responses MUST NOT be reused across authorization contexts such as different access tokens/);
  assert.match(mcpCopy, /Mcp-Method.*Mcp-Name/);
  assert.match(mcpCopy, /notification POSTs.*core protocol defines no Client-to-Server notifications over Streamable HTTP/s);
  assert.match(mcpCopy, /tasks\/get, tasks\/update, and tasks\/cancel.*Mcp-Name.*params\.taskId/s);
  assert.doesNotMatch(mcpCopy, /As of August 1, 2026|both parties can opt in/);
});

test("2026-09-04 Agent, MCP, and A2A additions preserve exact bilingual evidence mappings", () => {
  const additions = {
    "ai-agent": {
      questions: [
        ["blocked-task-safe-exit", "为什么任务越难，Agent 越需要定义主动停止，而不是一直重试？", ["openai-hugging-face-incident-technical-report-2026", "metr-openai-hf-incident-2026", "ncsc-agentic-ai-risk-interim-2026"]],
        ["agent-owned-logs-not-ground-truth", "为什么 Agent 自己生成的日志不能作为唯一验收证据？", ["openai-hugging-face-incident-technical-report-2026", "ncsc-agentic-ai-risk-interim-2026"]],
        ["cancel-does-not-undo", "点停止或 Cancel 后，为什么还要撤权、断网并核对外部副作用？", ["ncsc-agentic-ai-risk-interim-2026", "openai-hugging-face-incident-technical-report-2026"]],
      ],
      evidenceCard: ["impossible-task-control-failure", "安全退出不等于耗尽轮次", "openai-hugging-face-incident-technical-report-2026"],
    },
    mcp: {
      questions: [
        ["stateless-mrtr-input", "MCP 2026-07-28 已经无状态，工具执行中还需要用户补充信息怎么办？", ["mcp-mrtr-2026-07-28", "mcp-tasks-extension"]],
      ],
      evidenceCard: ["mcp-mrtr-stateless-input", "无状态请求仍可显式请求补参", "mcp-mrtr-2026-07-28"],
    },
    a2a: {
      questions: [
        ["a2a-identifier-lineage", "contextId、taskId、messageId、referenceTaskIds 和业务单号分别负责什么？", ["a2a-specification"]],
        ["send-message-unknown-outcome", "SendMessage 超时后，可以带同一个 messageId 直接重发吗？", ["a2a-specification"]],
        ["extension-versus-extended-card", "Agent Card 声明的 Extension 和 Extended Agent Card 是同一件事吗？", ["a2a-agent-discovery", "a2a-extensions", "a2a-specification"]],
      ],
      evidenceCard: ["message-id-not-exactly-once", "未知写结果要先查状态再决定重试", "a2a-specification"],
    },
  };

  for (const [slug, expected] of Object.entries(additions)) {
    const chinese = requireModuleContent(slug);
    const english = englishModuleRegistry[slug];
    assert.equal(chinese.qa.filter((question) => question.addedAt === "2026-09-04").length, expected.questions.length, `${slug} Chinese additions must stay complete`);
    assert.equal(english.qa.filter((question) => question.addedAt === "2026-09-04").length, expected.questions.length, `${slug} English additions must stay complete`);

    for (const [englishId, chineseQuestion, sourceIds] of expected.questions) {
      const chineseItem = chinese.qa.find((question) => question.q === chineseQuestion);
      const englishItem = findById(english.qa, englishId, `${slug} English questions`);
      assert.ok(chineseItem, `${slug} Chinese questions must include ${chineseQuestion}`);
      assert.equal(chineseItem.addedAt, "2026-09-04");
      assert.equal(englishItem.addedAt, "2026-09-04");
      assertExactEvidenceSources(chineseItem, sourceIds, `${slug} Chinese question ${chineseQuestion}`);
      assertExactEvidenceSources(englishItem, sourceIds, `${slug} English question ${englishId}`);
    }

    const [englishCardId, chineseCardTitle, sourceId] = expected.evidenceCard;
    const chineseCard = chinese.evidenceCards.find((card) => card.title === chineseCardTitle);
    const englishCard = findById(english.evidenceCards, englishCardId, `${slug} English evidence cards`);
    assert.ok(chineseCard, `${slug} Chinese evidence cards must include ${chineseCardTitle}`);
    assert.equal(chineseCard.sourceId, sourceId);
    assert.equal(englishCard.sourceId, sourceId);
    if (slug === "ai-agent") {
      assert.match(chineseCard.boundary, /不覆盖.*Hugging Face/);
      assert.match(englishCard.boundary, /does not cover.*Hugging Face systems or data/);
    }
  }
});

test("Batch 14 English content preserves model mechanisms and predictive lifecycle controls", () => {
  const llm = englishModuleRegistry.llm;
  assert.equal(llm.primer.id, "theory-atlas");
  assert.equal(llm.primer.layout, "pipeline");
  ["Tokenize the request", "Aggregate context with attention", "Select the output sequence"].forEach((title) => {
    assert.ok(llm.primer.steps.some((step) => step.title === title && step.detail?.trim()), `LLM primer must retain ${title}`);
  });
  for (const termId of llm.primer.termIds) assert.ok(llm.terms[termId], `LLM primer term must resolve: ${termId}`);
  const llmCurriculum = llm.sections.find((section) => section.id === "curriculum");
  const llmChapters = llmCurriculum.blocks.find((block) => block.items.some((item) => item.id === "curriculum-attention-heads"));
  assertReadableItems(llmChapters.items, "LLM curriculum");
  assertIncludesSourceIds(findById(llmChapters.items, "curriculum-attention-heads", "LLM curriculum"), ["transformer-2017", "gqa-2023", "attention-not-explanation-2019"], "LLM attention-heads chapter");
  assertIncludesSourceIds(findById(llmChapters.items, "curriculum-autoregressive-generation", "LLM curriculum"), ["deepseek-r1-2025", "openai-model-spec-hidden-cot", "nist-genai-profile"], "LLM autoregressive-generation chapter");
  assertIncludesSourceIds(findById(llmChapters.items, "curriculum-runtime-context", "LLM curriculum"), ["vllm-2023", "flashattention-2022", "lost-middle"], "LLM runtime-context chapter");
  const llmCopy = JSON.stringify(llm);
  assert.match(llmCopy, /returned reasoning summary is not a verbatim chain of thought/);
  assert.doesNotMatch(llmCopy, /Ask the customer:|repeated-transfer|recognizable capability|any supported reasoning configuration|Acceptance:/);

  const predictive = englishModuleRegistry["predictive-ai-mlops"];
  assert.equal(predictive.primer.id, "predictive-model-lifecycle");
  assert.equal(predictive.primer.layout, "lifecycle");
  assert.ok(predictive.primer.steps.some((step) => step.title?.trim() && step.detail?.trim()), "Predictive primer must retain an inspectable lifecycle step");
  const predictiveCurriculum = predictive.sections.find((section) => section.id === "predictive-curriculum");
  const predictiveChapters = predictiveCurriculum.blocks.find((block) => block.items.some((item) => item.id === "predictive-chapter-feature-pipelines"));
  assertReadableItems(predictiveChapters.items, "Predictive AI curriculum");
  assertIncludesSourceIds(findById(predictiveChapters.items, "predictive-chapter-feature-pipelines", "Predictive AI curriculum"), ["aws-sagemaker-feature-store", "google-mlops-predictive-ai"], "Predictive feature-pipelines chapter");
  assertIncludesSourceIds(findById(predictiveChapters.items, "predictive-chapter-governance", "Predictive AI curriculum"), ["google-mlops-predictive-ai", "nist-genai-profile"], "Predictive governance chapter");
  const predictivePractice = predictive.sections.find((section) => section.id === "predictive-study-guide");
  const predictiveLabs = predictivePractice.blocks.find((block) => block.items.some((item) => item.id === "predictive-lab-drift"));
  assertReadableItems(predictiveLabs.items, "Predictive AI practice labs");
  assertIncludesSourceIds(findById(predictiveLabs.items, "predictive-lab-leakage", "Predictive AI practice labs"), ["google-mlops-predictive-ai"], "Predictive leakage lab");
  const skewLab = findById(predictiveLabs.items, "predictive-lab-drift", "Predictive AI practice labs");
  assert.ok(skewLab.title?.trim(), "Predictive training-serving skew lab needs a readable title");
  assertIncludesSourceIds(skewLab, ["aws-sagemaker-feature-store", "google-mlops-predictive-ai"], "Predictive training-serving skew lab");
  assert.match(skewLab.boundary, /Completion criterion/);
  assert.doesNotMatch(JSON.stringify(predictive), /Acceptance:|Respond to drift without automatic release|Control data time/);
});

test("Chinese global entry pages expose their matching English routes", async () => {
  const routes = [
    ["../app/(zh)/page.tsx", "/en"],
    ["../app/(zh)/questions/page.tsx", "/en/questions"],
    ["../app/(zh)/glossary/page.tsx", "/en/glossary"],
    ["../app/(zh)/references/page.tsx", "/en/references"],
  ];
  for (const [file, englishHref] of routes) {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    assert.match(source, new RegExp(`href=["'{\\s]*${englishHref.replaceAll("/", "\\/")}`), `${file} must link to ${englishHref}`);
    assert.match(source, /hrefLang="en"/);
  }
});

test("English routes and all Chinese module page families expose reciprocal language paths", async () => {
  const [sharedZh, ragZh, agentZh, unifiedHero, promptZh, enHome, enShared, enRag, enModulePage] = await Promise.all([
    readFile(new URL("../app/(zh)/modules/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/modules/rag/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/modules/ai-agent/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/unified-module-hero.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/modules/prompt-engineering/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/en/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/en/modules/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(en)/en/modules/rag/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n/english-pilot-module-page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(sharedZh, /UnifiedBriefModulePage/);
  assert.match(ragZh, /UnifiedModuleScaffold/);
  assert.doesNotMatch(ragZh, /<nav className="topbar"|<ReadingProgress\b/, "RAG must not duplicate the shared page shell");
  assert.match(agentZh, /UnifiedModuleScaffold/);
  assert.match(unifiedHero, /englishModulePath/);
  assert.match(unifiedHero, /`\/en\/references\?module=\$\{slug\}`/, "English unified modules must use the real scoped source-ledger URL");
  assert.doesNotMatch(unifiedHero, /\/en\/references#module-/, "English unified modules must not point to a nonexistent source anchor");
  assert.match(promptZh, /UnifiedModuleScaffold/);
  assert.match(promptZh, /DenseModuleReadingModes/);
  assert.doesNotMatch(promptZh, /promptEnglishPath|<nav className="topbar"|<ReadingProgress\b/, "Prompt must use the shared shell and language switch");
  assert.doesNotMatch(enHome, />English pilot</i);
  assert.match(enShared, /EnglishModulePage/);
  assert.match(enShared, /englishUnifiedReaderSlugs\.includes\(slug\)/, "English shared route must consume the centralized unified-reader registry");
  assert.match(enRag, /EnglishModulePage[^>]*reader="unified"/, "English RAG must opt into the shared task-led reader");
  assert.match(enModulePage, /DenseModuleReadingModes/);
  assert.match(enModulePage, /locale="en"/);
  for (const groupId of buildEnglishSectionGroups(englishModuleRegistry.rag).map((group) => group.id)) {
    assert.match(enModulePage, new RegExp(`"${groupId}"`), `English RAG reader mapping must retain ${groupId}`);
  }
  const chineseUnifiedReaders = publishedModuleSlugs
    .map((slug) => [slug, getUnifiedBriefModuleConfig(slug)])
    .filter(([, config]) => config);
  assert.ok(chineseUnifiedReaders.length, "Published modules need at least one unified Chinese reader");
  for (const [slug, config] of chineseUnifiedReaders) {
    assertReadableUnifiedBriefConfig(config, `${slug} Chinese unified reader`);
  }
  for (const slug of englishModuleSlugs.filter((moduleSlug) => moduleSlug !== "rag")) {
    assert.match(enModulePage, new RegExp(`(?:^|\\n)  (?:"${slug}"|${slug}): \\{`), `English unified reader config must include ${slug}`);
  }
  assert.match(enModulePage, /"prompt-engineering": \{[\s\S]*prompt-pattern-diagnostics[\s\S]*cloud-poc-operating-model/, "Prompt must preserve its dedicated reader map");
  const promptTermConfig = enModulePage.match(/"prompt-engineering":\s*\[([^\]]*)\]/);
  assert.ok(promptTermConfig, "Prompt primer must define localized term IDs");
  const promptTermIds = [...promptTermConfig[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  assert.ok(promptTermIds.length, "Prompt primer needs localized terms");
  assert.equal(new Set(promptTermIds).size, promptTermIds.length, "Prompt primer term IDs must be unique");
  promptTermIds.forEach((termId) => assert.ok(englishModuleRegistry["prompt-engineering"].terms[termId], `Prompt primer term must resolve: ${termId}`));
  assert.match(enModulePage, /export const englishUnifiedReaderSlugs = Object\.freeze\(Object\.keys\(englishUnifiedReaderConfigs\)\)/);
  assert.match(enModulePage, /mcp: \{[\s\S]*completeFocusedProjection: true/, "MCP must render its complete authored English projection");
  assert.match(enModulePage, /"solution-patterns": \{[\s\S]*completeFocusedProjection: true/, "Solution Patterns must render its complete authored English projection");
  assert.match(enModulePage, /englishSourceCopy/, "English module pages must render localized source labels");
  assert.doesNotMatch(enModulePage, /sourceLedger\[evidence\.sourceId\]\?\.(?:kind|shortTitle)/, "English QA evidence must not render Chinese canonical labels");
});
