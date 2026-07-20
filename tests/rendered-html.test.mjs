import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { balanceGridRows, balanceRows, gridSpan } from "../app/layout-utils.mjs";
import { getModuleBySlug, layers, legacyModuleAliases, moduleList } from "../app/knowledge-map.mjs";
import { agentQa } from "../app/agent-content.mjs";
import { moduleContentRegistry, requireModuleContent } from "../app/module-content-registry.mjs";
import { completionCurriculum, completionLearning, completionQa } from "../app/module-completion-content.mjs";
import { moduleCurriculumContent, moduleCurriculumSlugs, requireModuleCurriculum } from "../app/module-curriculum-content.mjs";
import { moduleExtensionViews } from "../app/module-extension-views.mjs";
import { moduleLearningContent, moduleLearningSlugs, requireModuleLearning } from "../app/module-learning-content.mjs";
import { moduleQaExpansion } from "../app/module-qa-expansion.mjs";
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

function assertValidGridSpans(html, path) {
  const spanDeclarations = [...html.matchAll(/--(?:module|concept|mechanic|balanced|evidence|qa-evidence|related|brief|reference|result|search)-span:([^;"']+)/g)];

  for (const declaration of spanDeclarations) {
    const value = Number(declaration[1]);
    assert.ok(Number.isInteger(value) && value >= 1 && value <= 12 && 12 % value === 0, `${path} 出现非法 Grid span：${declaration[0]}`);
  }

  for (const openingTag of html.matchAll(/<div\b[^>]*class="[^"]*\bmechanicGrid\b[^"]*"[^>]*>/g)) {
    assert.match(openingTag[0], /data-count="\d+"/, `${path} 的 mechanicGrid 必须声明真实卡片数量`);
  }
}

const publishedModules = publishedModuleRegistry.map((module) => {
  const content = requireModuleContent(module.slug);
  return { ...module, id: module.slug, cards: content.evidenceCards, qa: content.qa, deepDives: content.deepDives };
});

function getPublishedModule(slug) {
  const publishedModule = publishedModules.find((candidate) => candidate.slug === slug);
  assert.ok(publishedModule, `缺少发布模块：${slug}`);
  return publishedModule;
}

function collectModuleSourceIds({ cards, qa, deepDives }) {
  return new Set([
    ...cards.map((card) => card.sourceId),
    ...qa.flatMap((item) => item.evidence.map((reference) => reference.sourceId)),
    ...deepDives.flatMap((block) => block.sourceIds),
  ]);
}

test("homepage is a focused knowledge map with links to every independent module", async () => {
  const html = await renderHtml("/");
  assertValidGridSpans(html, "/");
  const homepageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(html, /<html lang="zh-CN">/i);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1"\/>/i);
  assert.match(html, /<title>云计算 × AI 平台售前知识库<\/title>/i);
  assert.match(html, /<meta property="og:image" content="https:\/\/cloud-ai-presales-fieldbook\.lijx\.chatgpt\.site\/social-card\.png"\/>/i);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"\/>/i);
  assert.match(html, /<h2 id="map-title">知识地图<\/h2>/);
  assert.match(html, new RegExp(`aria-label="${layers.length} 层架构，${moduleList.length} 个细分模块"`));
  assert.match(html, /href="\/references"/);
  assert.match(html, /Reference/);
  assert.match(html, /从当前客户问题开始/);
  assert.match(html, /搜索模块与知识内容/);
  assert.match(html, /同一份知识，支持三种阅读深度/);
  assert.match(html, /不要按章节学，按任务走/);
  assert.doesNotMatch(html, /阅读 RAG 模块/);
  assert.equal((html.match(/class="moduleResult"/g) ?? []).length, publishedModules.length);

  for (const publishedModule of publishedModules) {
    assert.match(html, new RegExp(`<a(?=[^>]*class="moduleResult")(?=[^>]*href="${escapeRegExp(publishedModule.path)}")[^>]*>`));
  }

  for (const knowledgeModule of moduleList) {
    assert.match(html, new RegExp(`href="${escapeRegExp(knowledgeModule.href)}"`), `首页缺少模块入口：${knowledgeModule.zh}`);
    assert.match(html, new RegExp(escapeRegExp(knowledgeModule.zh)), `首页缺少模块名称：${knowledgeModule.zh}`);
    assert.match(html, new RegExp(escapeRegExp(escapeHtmlText(knowledgeModule.en))), `首页缺少英文术语：${knowledgeModule.en}`);
  }

  assert.doesNotMatch(homepageSource, /layer\.purpose/, "首页不应渲染泛化层说明");

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

test("focus surfaces provide accessible abbreviation explanations", async () => {
  const hintTermIds = ["rag", "llm", "ai-agent", "poc", "sla", "tco", "mcp", "a2a", "bm25", "ann", "hnsw", "rrf", "api", "iam", "acl", "dlp", "hitl", "qkv", "kv-cache", "ttft", "tpot", "moe", "sft", "lora", "qlora", "dpo"];

  for (const termId of hintTermIds) {
    const term = requireTerm(termId);
    assert.ok(term.abbr && term.description, `缩写提示必须同时有缩写和简短说明：${termId}`);
  }

  for (const path of ["/", "/modules/rag", "/modules/ai-agent", "/modules/llm", "/modules/solution-patterns", "/modules/security", "/modules/fine-tuning"]) {
    const html = await renderHtml(path);
    assert.match(html, /class="termHintRow"/i, `${path} 缺少缩写速查入口`);
    assert.match(html, /<details class="termHint" data-term-id="[^"]+">/i, `${path} 缩写解释必须使用可点击的原生 details`);
    assert.match(html, /<summary aria-label="[^"]+">/i, `${path} 缩写控件缺少可访问名称`);
    assert.match(html, /悬停 \/ 点击查看全称与说明/);
  }
});

test("evidence cards keep facts, findings, boundaries, and sources readable", async () => {
  const [componentSource, globalStyles] = await Promise.all([
    readFile(new URL("../app/module-content-components.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  const metricIndex = componentSource.indexOf('className="metric"');
  const findingIndex = componentSource.indexOf('className="metricFinding"');
  const boundaryIndex = componentSource.indexOf('className="metricBoundary"');
  const sourceIndex = componentSource.indexOf("对应来源 ·");
  assert.ok(metricIndex >= 0 && metricIndex < findingIndex && findingIndex < boundaryIndex && boundaryIndex < sourceIndex, "证据卡阅读顺序必须是事实标签、结论、边界、来源");

  assert.match(globalStyles, /\.metric\s*\{[^}]*font-size:\s*clamp\(22px,2vw,30px\)/s);
  assert.match(globalStyles, /\.metricFinding\s*\{[^}]*font-size:\s*16px/s);
  assert.match(globalStyles, /\.metricBoundary\s*\{[^}]*font-size:\s*14px/s);
  assert.match(globalStyles, /\.metricCard\s*\{[^}]*min-height:\s*0/s);
  assert.doesNotMatch(globalStyles, /\.metric\s*\{[^}]*font-size:\s*clamp\(4\dpx/s, "证据事实标签不得恢复为封面级字号");
});

test("dense-reading modules derive a scannable content overview from the publication registry", async () => {
  const denseReadingModules = publishedModuleRegistry.filter((module) => module.visualProfile === "dense-reading");
  assert.equal(denseReadingModules.length, publishedModuleRegistry.length, "所有正式模块都必须完成高密度阅读壳");
  assert.equal(new Set(denseReadingModules.map((module) => module.knowledgeView)).size, denseReadingModules.length, "正式模块必须使用不同的主题知识视图");

  for (const publishedModule of denseReadingModules) {
    const html = await renderHtml(publishedModule.path);
    assert.match(html, /class="[^"]*\bmodulePilot\b[^"]*"/, `${publishedModule.slug} 未启用共享高密度阅读壳`);
    assert.match(html, /<dl class="moduleHeroMetrics" aria-label="模块内容概览">/);
    assert.match(html, /<dt>阅读章节<\/dt>/);
    assert.match(html, /<dt>客户问题<\/dt>/);
    assert.match(html, /<dt>证据卡<\/dt>/);
    assert.match(html, new RegExp(`data-knowledge-view="${publishedModule.knowledgeView}"`));
  }
});

test("remaining modules complete their own knowledge views, learning expansions, and customer decisions", async () => {
  const remainingSlugs = Object.keys(moduleExtensionViews);
  assert.equal(remainingSlugs.length, 13, "剩余模块清单必须完整且显式");
  assert.equal(new Set(Object.values(moduleExtensionViews).map((view) => view.id)).size, remainingSlugs.length, "剩余模块知识视图 ID 不得复用");

  for (const slug of remainingSlugs) {
    const view = moduleExtensionViews[slug];
    const html = await renderHtml(`/modules/${slug}`);
    assert.match(html, new RegExp(`data-knowledge-view="${escapeRegExp(view.id)}"`));
    assert.match(html, new RegExp(escapeRegExp(view.title)));
    assert.match(html, /class="extensionPrimerMap"/);
    assert.match(html, /class="extensionPrimerChecks"/);
  }

  for (const slug of Object.keys(completionLearning)) {
    assert.ok(completionCurriculum[slug]?.length > 0, `${slug} 缺少新增课程主题`);
    assert.ok(completionLearning[slug].route.length > 0, `${slug} 缺少新增学习步骤`);
    assert.ok(completionLearning[slug].labs.length > 0, `${slug} 缺少新增实战任务`);
    assert.ok(completionQa[slug]?.length > 0, `${slug} 缺少新增客户判断问题`);

    const curriculum = requireModuleCurriculum(slug);
    const learning = requireModuleLearning(slug);
    const content = requireModuleContent(slug);
    for (const chapter of completionCurriculum[slug]) assert.ok(curriculum.chapters.includes(chapter));
    for (const step of completionLearning[slug].route) assert.ok(learning.route.includes(step));
    for (const lab of completionLearning[slug].labs) assert.ok(learning.labs.includes(lab));
    for (const question of completionQa[slug]) assert.ok(content.qa.includes(question));
  }
});

test("solution, security, and fine-tuning use distinct problem-specific knowledge views", async () => {
  const [solution, security, tuning] = await Promise.all([
    renderHtml("/modules/solution-patterns"),
    renderHtml("/modules/security"),
    renderHtml("/modules/fine-tuning"),
  ]);

  assert.match(solution, /data-knowledge-view="decision-blueprint"/);
  assert.match(solution, /把业务目标变成可以验收的方案/);
  assert.match(solution, /检索证据.*生成内容.*执行任务.*人工负责/s);
  assert.match(solution, /TCO/);
  assert.match(solution, /七类场景，七套验收重点/);
  assert.match(solution, /客服.*企业搜索.*内容生成.*AI Coding.*数字人.*ChatBI.*会议助手/s);
  assert.match(solution, /智能客服应该看回答准确率，还是看问题解决率/);
  assert.match(solution, /ChatBI 生成的 SQL 能运行，为什么还不能说明答案正确/);
  assert.doesNotMatch(solution, /需求决策契约|三本账|能力组合/);

  assert.match(security, /data-knowledge-view="threat-path"/);
  assert.match(security, /沿一条攻击路径看清每道防线/);
  assert.match(security, /不可信内容进入.*进入模型上下文.*应用决定是否执行.*外部系统状态变化/s);
  assert.match(security, /IAM.*ACL.*DLP/s);
  assert.match(security, /指令.*数据.*模型与组件.*工具与 Agent.*输出与运营/s);
  assert.match(security, /按部署地判断适用法规/);
  assert.match(security, /OWASP LLM Top 10 能不能直接当作安全验收清单/);
  assert.match(security, /发生数据泄露或 Agent 越权后，第一步应该做什么/);
  assert.doesNotMatch(security, /四道外部控制门/);

  assert.match(tuning, /data-knowledge-view="tuning-lifecycle"/);
  assert.match(tuning, /先判断该不该训练，再管理完整发布过程/);
  assert.match(tuning, /Prompt \/ Schema.*RAG.*Fine-tuning.*换基础模型/s);
  assert.match(tuning, /SFT.*LoRA.*QLoRA.*DPO/s);
  assert.match(tuning, /三种参数更新方式/);
  assert.match(tuning, /数据.*训练.*任务.*服务/s);
  assert.match(tuning, /聊天模板用错了，会对微调结果产生什么影响/);
  assert.match(tuning, /怎样发现微调造成了灾难性遗忘/);
  assert.doesNotMatch(tuning, /微调闭环|反馈闭环/);

  assert.ok(moduleCurriculumContent["solution-patterns"].chapters.length >= 10, "场景方案必须覆盖主要应用原型与生产验收");
  assert.ok(moduleCurriculumContent.security.chapters.length >= 9, "安全模块必须覆盖攻击、控制、治理、法规与响应");
  assert.ok(moduleCurriculumContent["fine-tuning"].chapters.length >= 8, "微调模块必须覆盖数据、训练、对齐、评估与发布");
  for (const slug of ["solution-patterns", "security", "fine-tuning"]) {
    assert.ok(moduleLearningContent[slug].route.length >= 5, `${slug} 学习路线不能压缩为通用三步模板`);
    assert.ok(moduleLearningContent[slug].labs.length >= 4, `${slug} 至少覆盖四个不同决策或工程练习`);
  }
});

test("RAG route contains principles, cloud-service opportunities, and evidence-backed answers", async () => {
  const html = await renderHtml("/modules/rag");
  assertValidGridSpans(html, "/modules/rag");

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
  assert.doesNotMatch(html, /开源模型还是商业模型更适合|RAG 的评估集应该怎样建设|RAG 成本应该按什么口径核算/);
  assert.match(html, /INTERACTIVE SYSTEM VIEW/);
  assert.match(html, /搜索客户问题/);
  assert.match(html, /RAG 检索链实验/);
  assert.match(html, /关键词检索 BM25/);
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
  assert.doesNotMatch(html, /ReAct 是否意味着 Agent 必须严格按|工具参数已经通过 Strict Schema|生产上线前，Agent 最低需要通过哪些/);
  assert.match(html, /INTERACTIVE SYSTEM VIEW/);
  assert.match(html, /搜索客户问题/);
  assert.match(html, /Agent 运行与恢复实验/);
  assert.match(html, /故障注入：工具超时/);

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
  assert.match(html, /INTERACTIVE SYSTEM VIEW/);
  assert.match(html, /搜索客户问题/);
  assert.match(html, /Prompt 装配实验/);
  assert.match(html, /坏提示 Bad Prompt/);

  for (const sourceId of collectModuleSourceIds(getPublishedModule("prompt-engineering"))) {
    assert.match(html, new RegExp(`href="/references#source-${escapeRegExp(sourceId)}"`));
  }

  assert.doesNotMatch(html, /正文建设中|模块依赖/);
  assert.doesNotMatch(html, /中文主版 · 术语中英对照/);
  assert.doesNotMatch(html, /softmax|Σ|∏|class="(?:formula|deepFormula|smallFormula)"/);
});

test("LLM foundations questions cover the theory readers need for architecture decisions", async () => {
  const html = await renderHtml("/modules/llm");
  const llmQa = moduleContentRegistry.llm.qa;

  assert.equal((html.match(/aria-label="本题依据"/g) ?? []).length, llmQa.length);
  assert.match(html, /同一段中文、英文或代码，为什么在不同模型里占用的 Token 数不同/);
  assert.match(html, /模型输入里的 Embedding，和向量数据库里的 Embedding 是一回事吗/);
  assert.match(html, /预训练主要学习预测下一个 Token，模型为什么后来会遵循指令/);
  assert.match(html, /参数量越大，模型能力就一定越强吗.*MoE/s);
  assert.match(html, /KV Cache 是什么，为什么长上下文会迅速吃掉并发容量/);
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
    assertValidGridSpans(html, publishedModule.path);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `每个正式模块只能有一个主标题：${publishedModule.slug}`);
    assert.match(html, new RegExp(`<h1[^>]*id="${escapeRegExp(publishedModule.titleId)}"`));

    for (const match of html.matchAll(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/g)) {
      const headingText = match[1].replace(/<[^>]+>/g, " ");
      assert.doesNotMatch(headingText, /先确定|我们来看|你需要|不要一上来/, `标题不应使用编辑者对读者说话的语气：${headingText}`);
    }

    for (const section of ["related-modules", "principle", "deep-dive", "evidence", "cloud", "qa"]) {
      assert.match(html, new RegExp(`data-quality-section="${section}"`), `${publishedModule.slug} 缺少 ${section} 质量区块`);
    }

    assert.match(html, /aria-label="重要边界"[^>]*data-importance="critical"/);
    assert.match(html, /客户高频问题与深度回答/);
    assert.match(html, /class="readingProgress"/, `${publishedModule.slug} 缺少阅读进度`);
    assert.match(html, /class="moduleReadingNav"/, `${publishedModule.slug} 缺少章节导航`);
    assert.match(html, /INTERACTIVE SYSTEM VIEW/, `${publishedModule.slug} 缺少机制或决策视图`);
    assert.match(html, /搜索客户问题/, `${publishedModule.slug} 缺少可检索实战包`);
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
    assert.doesNotMatch(
      html,
      /客户信号|来源台账|知识供应链|责任链|运营闭环|责任闭环|技术售前工作台|形成连续叙事|产品后映射/,
      `公开页面应使用普通中文：${path}`,
    );
  }
});

test("references route is the complete centralized source ledger", async () => {
  const html = await renderHtml("/references");

  assert.match(html, /来源与证据资料库/);
  assert.match(html, /Reference Library/);
  assert.match(html, /来源与证据类别图例/);
  assert.match(html, /官方产品与技术文档/);
  assert.match(html, /id="reference-modules"/);
  assert.match(html, /查找来源，而不是翻阅长名单/);
  assert.match(html, /检索标题、边界或模块/);

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
    assert.equal(
      new Set(publishedModule.qa.map((item) => item.q)).size,
      publishedModule.qa.length,
      `同一模块不应出现重复客户问题：${publishedModule.id}`,
    );
    const actualQaTags = new Set(publishedModule.qa.map((item) => item.tag));
    for (const requiredTag of publishedModule.qaCoverageTags) {
      assert.ok(actualQaTags.has(requiredTag), `${publishedModule.id} 客户问题缺少已登记的覆盖主题：${requiredTag}`);
    }
    assert.ok(publishedModule.deepDives.length > 0, `已发布模块缺少独立知识扩展：${publishedModule.id}`);

    for (const block of publishedModule.deepDives) {
      assert.ok(["sequence", "matrix", "diagnostic", "checklist", "scenario"].includes(block.kind), `未知深挖表达类型：${publishedModule.id} / ${block.kind}`);
      assert.ok(block.eyebrow && block.title && block.intro, `深挖区块元数据不完整：${publishedModule.id}`);
      assert.ok(block.items.length > 0, `深挖区块不应为空：${publishedModule.id} / ${block.title}`);
      assert.ok(block.sourceIds.length > 0, `深挖区块缺少依据：${publishedModule.id} / ${block.title}`);
      assert.equal(new Set(block.sourceIds).size, block.sourceIds.length, `深挖区块来源重复：${publishedModule.id} / ${block.title}`);

      for (const item of block.items) {
        assert.ok(item.name && item.mechanism && item.decision, `深挖条目不完整：${publishedModule.id} / ${block.title}`);
      }
      for (const sourceId of block.sourceIds) {
        assert.ok(sourceIds.has(sourceId), `深挖区块引用未知来源：${sourceId}`);
        assert.ok(moduleSourceIds.has(sourceId), `深挖来源未归入 ${publishedModule.id} 分组：${sourceId}`);
      }
    }

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

test("every shared module has a source-backed learning route and practical labs", async () => {
  const sharedModules = publishedModuleRegistry.filter((module) => module.routeKind === "brief");
  assert.deepEqual([...moduleLearningSlugs].sort(), sharedModules.map((module) => module.slug).sort());
  assert.deepEqual([...moduleCurriculumSlugs].sort(), sharedModules.map((module) => module.slug).sort());
  assert.equal(Object.keys(moduleLearningContent).length, sharedModules.length);
  assert.equal(Object.keys(moduleCurriculumContent).length, sharedModules.length);
  assert.deepEqual(Object.keys(moduleQaExpansion).sort(), sharedModules.map((module) => module.slug).sort());

  for (const publishedModuleEntry of sharedModules) {
    const learning = requireModuleLearning(publishedModuleEntry.slug);
    const curriculum = requireModuleCurriculum(publishedModuleEntry.slug);
    const referenceModule = referenceModules.find((candidate) => candidate.id === publishedModuleEntry.slug);
    assert.ok(referenceModule, `学习路线缺少 Reference 分组：${publishedModuleEntry.slug}`);
    const moduleSourceIds = new Set(referenceModule.sourceIds);

    assert.ok(learning.outcomes.length > 0, `学习结果不足：${publishedModuleEntry.slug}`);
    assert.ok(learning.route.length >= 3 && learning.route.length <= 6, `共享模块应按知识复杂度提供 3–6 步学习路线：${publishedModuleEntry.slug}`);
    assert.ok(learning.labs.length > 0, `实战任务不足：${publishedModuleEntry.slug}`);
    assert.ok(moduleQaExpansion[publishedModuleEntry.slug].length > 0, `缺少增补客户问答：${publishedModuleEntry.slug}`);
    assert.ok(curriculum.lead.length >= 20, `课程地图导语不足：${publishedModuleEntry.slug}`);
    assert.ok(curriculum.chapters.length > 0, `课程地图覆盖不足：${publishedModuleEntry.slug}`);

    for (const chapter of curriculum.chapters) {
      assert.ok(chapter.title && chapter.en && chapter.explanation && chapter.decision && chapter.boundary, `课程主题不完整：${publishedModuleEntry.slug}`);
      assert.ok(chapter.explanation.length >= 40, `课程主题解释过浅：${publishedModuleEntry.slug} / ${chapter.title}`);
      assert.ok(chapter.sourceIds.length > 0, `课程主题缺少依据：${publishedModuleEntry.slug} / ${chapter.title}`);
      for (const sourceId of chapter.sourceIds) {
        assert.ok(sourceLedger[sourceId], `课程主题引用未知来源：${publishedModuleEntry.slug} / ${sourceId}`);
        assert.ok(moduleSourceIds.has(sourceId), `课程主题来源未归入 ${publishedModuleEntry.slug} Reference：${sourceId}`);
      }
    }

    for (const outcome of learning.outcomes) assert.ok(outcome.length >= 8, `学习结果过于空泛：${publishedModuleEntry.slug}`);
    for (const step of learning.route) {
      assert.ok(step.title && step.learn && step.checkpoint, `学习步骤不完整：${publishedModuleEntry.slug}`);
    }
    for (const lab of learning.labs) {
      assert.ok(lab.title && lab.scenario && lab.deliverable && lab.acceptance, `实战任务不完整：${publishedModuleEntry.slug}`);
      assert.ok(lab.tasks.length >= 3, `实战任务步骤不足：${publishedModuleEntry.slug} / ${lab.title}`);
      assert.ok(lab.sourceIds.length > 0, `实战任务缺少依据：${publishedModuleEntry.slug} / ${lab.title}`);
      assert.equal(new Set(lab.sourceIds).size, lab.sourceIds.length, `实战任务来源重复：${publishedModuleEntry.slug} / ${lab.title}`);
      for (const sourceId of lab.sourceIds) {
        assert.ok(sourceLedger[sourceId], `实战任务引用未知来源：${publishedModuleEntry.slug} / ${sourceId}`);
        assert.ok(moduleSourceIds.has(sourceId), `实战任务来源未归入 ${publishedModuleEntry.slug} Reference：${sourceId}`);
      }
    }

    const html = await renderHtml(publishedModuleEntry.path);
    assert.match(html, /id="study-guide"/);
    assert.match(html, /id="curriculum"/);
    assert.match(html, /学完后，你应该能独立完成/);
    assert.match(html, /建议学习顺序/);
    assert.doesNotMatch(html, /[一二三四五六七八九十\d]+步学习顺序/, `${publishedModuleEntry.slug} 的路线标题不应绑定固定数量`);
    assert.match(html, /用真实产物证明掌握/);
    assert.match(html, /课程地图与知识展开/);
    assert.doesNotMatch(html, /external_reference|不复刻 PPT|讲义提供覆盖线索/);
  }
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

test("balances arbitrary CSS Grid counts without fractional or missing spans", () => {
  for (let maxColumns = 1; maxColumns <= 12; maxColumns += 1) {
    for (let count = 0; count <= 60; count += 1) {
      const items = Array.from({ length: count }, (_, index) => index);
      const rows = balanceGridRows(items, maxColumns);

      assert.deepEqual(rows.flat(), items, `Grid 布局必须保持原顺序：${count} / ${maxColumns}`);

      if (rows.length > 0) {
        const sizes = rows.map((row) => row.length);
        assert.ok(Math.max(...sizes) <= maxColumns);
        assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `Grid 各行数量差不能超过 1：${count} / ${maxColumns}`);
        for (const row of rows) assert.ok(Number.isInteger(gridSpan(row.length)), `Grid span 必须为整数：${row.length}`);
      }
    }
  }

  assert.deepEqual(balanceGridRows([1, 2, 3, 4, 5], 5).map((row) => row.length), [3, 2]);
  assert.throws(() => gridSpan(5), /must divide/);
  assert.throws(() => balanceGridRows([1], 0), /positive integer/);
});

test("keeps module systems dynamically balanced, searchable, and navigable on mobile", async () => {
  const [styles, v2Styles, homepage, interactions, genericModuleRoute, referencesRoute, moduleComponents, publicationRegistry] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/fieldbook-v2.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/fieldbook-interactions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/modules/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/references/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/module-content-components.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/module-publication.mjs", import.meta.url), "utf8"),
  ]);

  assert.match(genericModuleRoute, /hasDedicatedModule\(module\.slug\)/);
  assert.match(genericModuleRoute, /hasDedicatedModule\(currentModule\.canonicalSlug\)/);
  assert.match(genericModuleRoute, /legacyModuleAliases/);
  assert.doesNotMatch(genericModuleRoute, /href="\/modules\/rag"/);
  assert.match(genericModuleRoute, /const relatedRows = balanceGridRows\(relatedModules, 4\)/);
  assert.match(genericModuleRoute, /"--related-span": gridSpan\(row\.length\)/);
  assert.match(genericModuleRoute, /data-odd=\{relatedModules\.length % 2 === 1/);
  assert.match(referencesRoute, /const referenceModuleRows = balanceGridRows\(referenceModules, 4\)/);
  assert.match(referencesRoute, /"--reference-span": gridSpan\(row\.length\)/);
  assert.match(referencesRoute, /data-odd=\{referenceModules\.length % 2 === 1/);
  assert.match(moduleComponents, /if \(cards\.length === 0\) return null/);
  assert.match(moduleComponents, /const rows = balanceGridRows\(cards, maxColumns\)/);
  assert.match(moduleComponents, /const rows = balanceGridRows\(items, maxColumns\)/);
  assert.match(moduleComponents, /balanceGridRows\(item\.evidence, 3\)/);
  assert.match(moduleComponents, /"--evidence-span": gridSpan\(row\.length\)/);
  assert.match(moduleComponents, /"--qa-evidence-span": gridSpan\(row\.length\)/);
  assert.match(moduleComponents, /data-importance="critical"/);
  assert.match(moduleComponents, /className="balancedGridCell"/);
  assert.match(styles, /\.mechanicGrid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  assert.match(styles, /\.balancedGrid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  for (const [source, variable] of [[styles, "module"], [styles, "concept"], [styles, "mechanic"], [styles, "balanced"], [styles, "evidence"], [styles, "qa-evidence"], [styles, "related"], [styles, "brief"], [styles, "reference"], [v2Styles, "result"], [v2Styles, "search"]]) {
    assert.match(source, new RegExp(`var\\(--${variable}-span,\\s*12\\)`), `--${variable}-span 必须有通栏 fallback`);
  }
  assert.match(v2Styles, /container-type:\s*inline-size/);
  assert.match(v2Styles, /@container \(max-width: 900px\)/);
  assert.match(v2Styles, /@container \(max-width: 620px\)/);
  assert.match(v2Styles, /\.subHead h2, \.subHead h3\s*\{[^}]*5cqi[^}]*text-wrap:\s*balance/s);
  assert.match(homepage, /explorerModules/);
  assert.match(homepage, /publishedModuleSlugs\.map/);
  assert.match(homepage, /knowledgeSearchEntries/);
  assert.match(homepage, /Object\.entries\(moduleCurriculumContent\)/);
  assert.match(homepage, /Object\.entries\(moduleLearningContent\)/);
  assert.match(homepage, /type: "课程章节" as const/);
  assert.match(homepage, /type: "实战练习" as const/);
  assert.match(homepage, /<ModuleExplorer modules=\{explorerModules\} knowledgeEntries=\{knowledgeSearchEntries\}/);
  assert.match(publicationRegistry, /export const publishedModules/);
  assert.match(publicationRegistry, /contentContract/);
  assert.match(interactions, /export function ModuleExplorer/);
  assert.match(interactions, /export function ModuleReadingNav/);
  assert.match(interactions, /export function SystemLens/);
  assert.match(interactions, /export function QaFilterShell/);
  assert.match(interactions, /export function ReferenceFilterShell/);
  assert.match(v2Styles, /\.moduleResultGrid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  assert.match(v2Styles, /@media \(max-width: 720px\)[\s\S]*?\.moduleResult,[\s\S]*?grid-column:\s*span 12;/s);
  assert.match(styles, /\.moduleHeroTitle\s*\{[^}]*font-size:\s*var\(--module-title-size,/s);
  assert.match(styles, /\.moduleHeroTitle\s*\{[^}]*line-height:\s*1;/s);
  assert.doesNotMatch(styles, /#[a-z-]+-title\s*\{/);
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
  const [standard, moduleStandard, qualityGates, maintenance, agentRules, layout, globalStyles, packageJson] = await Promise.all([
    readFile(new URL("../docs/CONTENT-DESIGN-STANDARD.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/MODULE-BUILD-STANDARD.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/MODULE-QUALITY-GATES.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/CONTENT-MAINTENANCE.md", import.meta.url), "utf8"),
    readFile(new URL("../AGENTS.md", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
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
  assert.match(moduleStandard, /balanceGridRows\(items, maxColumns\)/);
  assert.match(moduleStandard, /内部巡检流程、责任人、字段 schema、发布步骤和构建状态不得公开/);
  assert.match(moduleStandard, /MODULE-QUALITY-GATES\.md/);
  assert.match(moduleStandard, /发布注册/);
  assert.match(moduleStandard, /面向读者的中文优先使用具体名词和日常动词/);
  assert.match(moduleStandard, /首次出现必须先给普通中文解释/);

  assert.match(qualityGates, /历史问题 → 永久门禁/);
  assert.match(qualityGates, /原理深度/);
  assert.match(qualityGates, /术语中英/);
  assert.match(qualityGates, /云服务连接/);
  assert.match(qualityGates, /动态构图/);
  assert.match(qualityGates, /Portable/);
  assert.match(qualityGates, /Reference/);
  assert.match(qualityGates, /时效性/);
  assert.match(qualityGates, /普通中文/);
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
  assert.doesNotMatch(layout, /Noto_Serif_SC/, "大字符集中文字体不得由 next\/font 注册并在首屏预加载");
  assert.match(globalStyles, /--font-serif:[^;]*Songti SC[^;]*Noto Serif CJK SC/, "中文标题必须保留可移植的系统字体栈");
  assert.match(moduleStandard, /大字符集中文字体不得通过 `next\/font`/);
  assert.match(qualityGates, /响应 `Link` 头不含大字符集中文字体分片/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
