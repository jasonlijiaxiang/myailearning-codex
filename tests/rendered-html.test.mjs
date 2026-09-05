import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

import { balanceGridRows, balanceRows, gridSpan } from "../app/layout-utils.mjs";
import { codingAgentBenchmarks, codingAgentLandscapePolicy, codingAgentProducts } from "../app/coding-agent-landscape.mjs";
import { englishCodingAgentBenchmarks, englishCodingAgentProducts } from "../app/i18n/en/coding-agent-landscape.mjs";
import {
  englishModelRadarBenchmarkSourceIds,
  englishModelRadarSnapshots,
} from "../app/i18n/en/model-radar.mjs";
import { CONTENT_UPDATE_POLICY_EFFECTIVE_DATE, formatModuleUpdatedAt, formatQuestionAddedAt, isValidContentUpdatedAt, isValidIsoDate } from "../app/content-update-metadata.mjs";
import { getModuleBySlug, layers, legacyModuleAliases, moduleList } from "../app/knowledge-map.mjs";
import { explicitTermRelations, knowledgeRelationTypes, termPrimaryModules } from "../app/knowledge-relations.mjs";
import { graphHealth, graphModuleCoverage, graphOverviewLinks, graphOverviewPolicy } from "../app/knowledge-graph/graph-data.mjs";
import { buildKnowledgeSearchEntries, buildQuestionSearchText } from "../app/search-index.mjs";
import { englishModuleRegistry, englishQuestions } from "../app/i18n/en/registry.mjs";
import {
  buildEnglishSectionGroups,
  selectVisibleEnglishEvidenceCards,
  selectVisibleEnglishQuestions,
  selectVisibleEnglishSectionGroups,
} from "../app/i18n/english-section-outline.mjs";
import { getEnglishUpdatedAt } from "../app/english-update-dates.mjs";
import { agentQa } from "../app/agent-content.mjs";
import { moduleContentRegistry, requireModuleContent } from "../app/module-content-registry.mjs";
import { requireModuleBrief } from "../app/module-brief-content.mjs";
import { moduleCurriculumContent, moduleCurriculumSlugs, requireModuleCurriculum } from "../app/module-curriculum-content.mjs";
import { moduleDiscovery } from "../app/module-discovery.mjs";
import { getModuleExtensionView, moduleExtensionViews } from "../app/module-extension-views.mjs";
import { moduleLearningContent, moduleLearningSlugs, requireModuleLearning } from "../app/module-learning-content.mjs";
import { moduleRepresentationAssessment } from "../app/module-representation-assessment.mjs";
import { publishedModules as publishedModuleRegistry, publishedModuleSlugs } from "../app/module-publication.mjs";
import {
  modelRadarBenchmarkSourceIds,
  modelRadarPolicy,
  modelRadarSnapshots,
  modelRadarSources,
} from "../app/model-radar-data.mjs";
import { promptQa } from "../app/prompt-content.mjs";
import { filterQuestionDirectoryItems } from "../app/question-filter.mjs";
import { intentDefinitions } from "../app/question-field-kit.mjs";
import { questionDirectoryItems, questionDirectoryModules } from "../app/question-index.mjs";
import { evidenceCards, ragLearningContent, ragQa } from "../app/rag-content.mjs";
import { chineseReferenceModules, referenceModules, sourceLedger } from "../app/reference-content.mjs";
import { sourceFreshness } from "../app/source-freshness.mjs";
import { glossaryGroups, glossaryTermIds, homepageTermGroups, requireTerm, terminology } from "../app/terminology.mjs";
import { scenarioDefinitionsForHome, timeBudgetPaths } from "../app/home-learning-paths.mjs";

let workerPromise;

async function render(path = "/") {
  assert.match(path, /^\//, "render(path) must receive an absolute site path");

  workerPromise ??= import(new URL("../dist/server/index.js", import.meta.url).href).then(({ default: worker }) => worker);
  const worker = await workerPromise;

  return worker.fetch(
    new Request(new URL(path, "http://localhost"), {
      headers: { accept: "text/html" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

/** @param {string} path */
async function renderHtml(path) {
  const response = await render(path);
  assert.equal(response.status, 200, `${path} must be reachable`);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

/** @param {string} value */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** @param {string} value */
function escapeHtmlText(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/**
 * Build a regex source that matches registry text as rendered into HTML:
 * quote characters may appear as HTML entities depending on the rendering context.
 * @param {string} value
 */
function renderTextPattern(value) {
  return escapeRegExp(escapeHtmlText(value))
    .replaceAll('"', '(?:&quot;|")')
    .replaceAll("'", "(?:&#x27;|')");
}

/** @param {string} html @param {string} label */
function serverRenderedReadingPanels(html, label) {
  const panels = [...html.matchAll(/<div\b(?=[^>]*\bclass="[^"]*\bmoduleModePanel\b[^"]*")(?=[^>]*\bdata-reading-mode="([^"]+)")[^>]*>/g)].map(([tag, mode]) => ({ tag, mode }));
  assert.ok(panels.length > 0, `${label} must declare at least one reading task`);
  assert.equal(new Set(panels.map((panel) => panel.mode)).size, panels.length, `${label} must not duplicate reading-task IDs`);
  for (const panel of panels) {
    assert.doesNotMatch(panel.tag, /\shidden(?:\s|=|>)/i, `${label} must expose ${panel.mode} before JavaScript enhancement`);
  }
  return panels;
}

/** @param {string} html @param {string} mode @param {string} label */
function readingPanelHtml(html, mode, label) {
  const marker = `data-reading-mode="${mode}"`;
  const start = html.indexOf(marker);
  assert.ok(start >= 0, `${label} must declare the ${mode} reading task`);
  const next = html.indexOf('data-reading-mode="', start + marker.length);
  return html.slice(start, next >= 0 ? next : undefined);
}

/** @param {any[]} modules @param {Record<string, any>} terms */
function deriveSharedTermModuleLinks(modules, terms) {
  const links = [];

  for (const [fromIndex, from] of modules.entries()) {
    for (const to of modules.slice(fromIndex + 1)) {
      const termIds = Object.entries(terms)
        .filter(([, term]) => term.moduleSlugs.includes(from.slug) && term.moduleSlugs.includes(to.slug))
        .map(([termId]) => termId);
      if (!termIds.length) continue;
      links.push({ id: `${from.slug}:shared-terms:${to.slug}`, termIds });
    }
  }

  return links.sort((left, right) => right.termIds.length - left.termIds.length || left.id.localeCompare(right.id));
}

/** @param {string} html @param {string} path */
function extractControlDataPlane(html, path) {
  const controlDataPlane = html.match(/<section class="controlDataPlane"[\s\S]*?<\/section>/)?.[0];
  assert.ok(controlDataPlane, `${path} must render the control-plane steps section`);
  return controlDataPlane;
}

/** @param {string} html @param {string} path */
function assertValidGridSpans(html, path) {
  const spanDeclarations = [...html.matchAll(/--(?:module|concept|mechanic|balanced|evidence|qa-evidence|related|brief|reference|result|search)-span:([^;"']+)/g)];

  for (const declaration of spanDeclarations) {
    const value = Number(declaration[1]);
    assert.ok(Number.isInteger(value) && value >= 1 && value <= 12 && 12 % value === 0, `${path} renders an invalid grid span: ${declaration[0]}`);
  }

  for (const openingTag of html.matchAll(/<div\b[^>]*class="[^"]*\bmechanicGrid\b[^"]*"[^>]*>/g)) {
    assert.match(openingTag[0], /data-count="\d+"/, `${path} mechanicGrid must declare the real card count`);
  }
}

const publishedModules = publishedModuleRegistry.map((module) => {
  const content = requireModuleContent(module.slug);
  return { ...module, id: module.slug, cards: content.evidenceCards, qa: content.qa, deepDives: content.deepDives };
});

/** @param {string} slug */
function getPublishedModule(slug) {
  const publishedModule = publishedModules.find((candidate) => candidate.slug === slug);
  assert.ok(publishedModule, `missing published module: ${slug}`);
  return publishedModule;
}

/** @param {{ cards: any[]; qa: any[]; deepDives: any[] }} moduleContent */
function collectModuleSourceIds({ cards, qa, deepDives }) {
  return new Set([
    ...cards.map((card) => card.sourceId),
    ...qa.flatMap((item) => item.evidence.map((/** @type {any} */ reference) => reference.sourceId)),
    ...deepDives.flatMap((block) => block.sourceIds),
  ]);
}

/** @param {string | undefined} value @param {string} label @param {(v: string) => string | null} formatter */
function assertOptionalContentDate(value, label, formatter) {
  if (value == null) return;
  assert.ok(isValidContentUpdatedAt(value), `${label} must be a valid post-policy date: ${value}`);
  const formatted = formatter(value);
  assert.ok(typeof formatted === "string" && formatted.endsWith(value), `${label} must format to a labeled date ending in ${value}`);
}

/** @param {{ addedAt?: string | null; q: string }[]} qa */
function legacyUndatedQuestionSetSha256(qa) {
  const identities = qa
    .filter((item) => !item.addedAt)
    .map((item) => item.q.normalize("NFKC").trim().replace(/\s+/g, " "))
    .sort();
  return createHash("sha256").update(JSON.stringify(identities), "utf8").digest("hex");
}

/** @param {any} item @param {string} label */
function assertNoItemDateMetadata(item, label) {
  assert.equal(Object.hasOwn(item, "updatedAt"), false, `${label} must not show per-item update dates`);
  assert.equal(Object.hasOwn(item, "addedAt"), false, `${label} must not reuse the addedAt question metadata`);
}

test("historical undated-question baseline binds identity instead of only quantity", () => {
  const original = [{ q: "Legacy question A" }, { q: "Legacy question B" }];
  const sameCountReplacement = [{ q: "Legacy question A" }, { q: "New question missing its date" }];
  assert.equal(original.length, sameCountReplacement.length);
  assert.notEqual(
    legacyUndatedQuestionSetSha256(original),
    legacyUndatedQuestionSetSha256(sameCountReplacement),
  );
});

test("module updates and newly added questions use distinct, non-repeating date metadata", async () => {
  assert.equal(CONTENT_UPDATE_POLICY_EFFECTIVE_DATE, "2026-07-20");
  assert.equal(formatModuleUpdatedAt(undefined), null, "historic modules without updatedAt must stay renderable");
  assert.equal(formatQuestionAddedAt(undefined), null, "historic questions without addedAt must stay renderable");
  assert.ok(/^\S+ 2026-07-20$/.test(/** @type {string} */ (formatModuleUpdatedAt("2026-07-20"))));
  assert.ok(/^\S+ 2026-07-20$/.test(/** @type {string} */ (formatQuestionAddedAt("2026-07-20"))));
  assert.equal(isValidContentUpdatedAt("2026-02-30"), false);
  assert.equal(isValidContentUpdatedAt("2026-07-19"), false);
  assert.throws(() => formatModuleUpdatedAt("2026-02-30"), /updatedAt/);
  assert.throws(() => formatQuestionAddedAt("2026-02-30"), /addedAt/);

  let postPolicyModuleCount = 0;

  for (const publication of publishedModuleRegistry) {
    const content = requireModuleContent(publication.slug);
    const curriculum = publication.routeKind === "brief" ? requireModuleCurriculum(publication.slug) : null;
    const learning = publication.routeKind === "brief" ? requireModuleLearning(publication.slug) : null;

    assert.equal(Object.hasOwn(publication, "addedAt"), false, `${publication.slug} must not use addedAt for the module date`);
    assert.ok(isValidIsoDate(publication.introducedAt), `${publication.slug} / introducedAt must be a valid YYYY-MM-DD date`);
    assert.match(publication.legacyUndatedQuestionSetSha256, /^[0-9a-f]{64}$/, `${publication.slug} / legacyUndatedQuestionSetSha256 must hold a stable identity digest`);
    assertOptionalContentDate(publication.updatedAt, `${publication.slug} / updatedAt`, formatModuleUpdatedAt);
    if (publication.updatedAt) {
      assert.ok(publication.updatedAt >= publication.introducedAt, `${publication.slug} updatedAt must not predate introducedAt`);
    }
    const requiresInitialQuestionDates = publication.introducedAt >= CONTENT_UPDATE_POLICY_EFFECTIVE_DATE;
    if (requiresInitialQuestionDates) postPolicyModuleCount += 1;
    for (const item of content.qa) {
      assert.equal(Object.hasOwn(item, "updatedAt"), false, `${publication.slug} / ${item.q} must not mislabel an existing rewrite as updatedAt`);
      assertOptionalContentDate(item.addedAt, `${publication.slug} / ${item.q} / addedAt`, formatQuestionAddedAt);
      if (requiresInitialQuestionDates) {
        assert.ok(/** @type {string} */ (item.addedAt) >= publication.introducedAt, `${publication.slug} was introduced after the date policy, so qa addedAt must not predate introducedAt`);
      }
    }
    assert.equal(
      legacyUndatedQuestionSetSha256(content.qa),
      publication.legacyUndatedQuestionSetSha256,
      `${publication.slug} undated question identity set must keep its audit baseline; new questions need addedAt`,
    );
    for (const block of content.deepDives) assertNoItemDateMetadata(block, `${publication.slug} / ${block.title}`);
    for (const card of content.evidenceCards) assertNoItemDateMetadata(card, `${publication.slug} / ${card.title}`);
    for (const chapter of curriculum?.chapters ?? []) assertNoItemDateMetadata(chapter, `${publication.slug} / ${chapter.title}`);
    for (const lab of learning?.labs ?? []) assertNoItemDateMetadata(lab, `${publication.slug} / ${lab.title}`);

    const html = await renderHtml(publication.path);
    const moduleDateCount = (html.match(/class="moduleUpdatedAt"/g) ?? []).length;
    assert.equal(moduleDateCount, publication.updatedAt ? 1 : 0, `${publication.slug} module update date must render exactly once`);
    if (publication.updatedAt) {
      assert.match(html, /<footer\b[^>]*>[\s\S]*?class="moduleUpdatedAt"[\s\S]*?<\/footer>/, `${publication.slug} module update date must sit in the page footer`);
    }

    const englishHtml = await renderHtml(`/en${publication.path}`);
    const englishModuleDateCount = (englishHtml.match(/class="moduleUpdatedAt"/g) ?? []).length;
    assert.equal(englishModuleDateCount, publication.updatedAt ? 1 : 0, `${publication.slug} English module update date must render exactly once`);
    if (publication.updatedAt) {
      const englishDate = getEnglishUpdatedAt(publication.slug) ?? publication.updatedAt;
      assert.match(englishHtml, new RegExp(`<footer\\b[^>]*>[\\s\\S]*?Last updated ${englishDate}[\\s\\S]*?<\\/footer>`), `${publication.slug} English module update date must sit in the page footer`);
    }
  }

  assert.ok(postPolicyModuleCount > 0, "modules introduced after the date policy must enter the initial question-date check");

  const [components, questionsPage, questionIndex, styles, v2Styles, agentRules, moduleStandard] = await Promise.all([
    readFile(new URL("../app/module-content-components.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/questions/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/question-index.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/fieldbook-v2.css", import.meta.url), "utf8"),
    readFile(new URL("../AGENTS.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/MODULE-BUILD-STANDARD.md", import.meta.url), "utf8"),
  ]);

  assert.match(components, /className="moduleUpdatedAt"/);
  assert.match(components, /value=\{item\.addedAt\}/);
  assert.doesNotMatch(components, /block\.updatedAt|chapter\.updatedAt/);
  assert.match(questionIndex, /addedAt: item\.addedAt \?\? null/);
  assert.match(questionsPage, /value=\{item\.addedAt \?\? undefined\}/);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(styles, /\.questionAddedAt[^}]*font-size:\s*12px/s);
  assert.doesNotMatch(styles, /\.deepDiveUpdatedAt/);
  assert.match(v2Styles, /\.qaAddedAt/);
  assert.match(v2Styles, /\.questionDirectoryAddedAt/);
  assert.doesNotMatch(v2Styles, /\.curriculumUpdatedAt/);
  assert.match(agentRules, /历史内容不回填/);
  assert.match(agentRules, /只有整道新增的客户问答设置 `addedAt/);
  assert.match(moduleStandard, /模块最近更新时间只说明知识内容何时修订/);

  const a2aHtml = await renderHtml("/modules/a2a");
  const questionDirectoryHtml = await renderHtml("/questions");
  assert.ok(a2aHtml.includes(formatQuestionAddedAt("2026-07-20")), "a2a must render the addedAt label for a post-policy question");
  assert.ok(questionDirectoryHtml.includes(formatQuestionAddedAt("2026-07-20")), "question directory must render the addedAt label for a post-policy question");
});

test("homepage leads from scenario to questions with links to every independent module", async () => {
  const [html, englishHtml] = await Promise.all([renderHtml("/"), renderHtml("/en")]);
  assertValidGridSpans(html, "/");
  const homepageSource = await readFile(new URL("../app/(zh)/page.tsx", import.meta.url), "utf8");

  assert.match(html, /<html lang="zh-CN">/i);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1"\/>/i);
  assert.match(html, /<title>云计算 × AI 平台售前知识库<\/title>/i);
  assert.match(html, /<meta property="og:image" content="https:\/\/cloud-ai-presales-fieldbook\.lijx\.chatgpt\.site\/social-card\.png"\/>/i);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"\/>/i);
  assert.match(html, /href="\/references"/);
  assert.match(html, /href="\/coding-agents"/);
  assert.match(englishHtml, /href="\/en\/model-radar"/);
  assert.match(englishHtml, /href="\/en\/coding-agents"/);
  assert.match(html, /href="\/knowledge-graph">[^<]*<\/a>[\s\S]*?<details class="homeSelectionMenu">[\s\S]*?<summary>[^<]*<\/summary>[\s\S]*?href="\/model-radar">[^<]*<\/a>[\s\S]*?href="\/coding-agents">[^<]*<\/a>/);
  assert.match(html, /Reference/);
  assert.match(html, /<div class="heroCopy">[\s\S]*?<h1><span>[^<]*<\/span><span>[^<]*<\/span><\/h1>/);
  assert.match(html, /class="heroDecisionPanel"/);
  assert.match(englishHtml, /Use the same knowledge for different reading tasks/);
  assert.match(html, /id="learning-paths-title"/);
  assert.match(html, /id="available-modules"/);
  assert.match(html, /id="time-budget-paths-title"/);
  assert.doesNotMatch(html, /按可用时间准备/);
  assert.ok(
    html.indexOf('id="learning-paths"') < html.indexOf('id="available-modules"')
      && html.indexOf('id="available-modules"') < html.indexOf('id="time-budget-paths"'),
    "the three homepage entry points must follow scenario, question, then time",
  );
  assert.match(html, /<input[^>]*placeholder="[^"]+"/);
  assert.match(html, new RegExp(`${layers.length} 层[\\s\\S]{0,80}${moduleList.length} 个模块`));
  assert.match(html, /href="\/knowledge-graph"[^>]*>[^<]*</);
  assert.doesNotMatch(html, /三种阅读深度/);
  assert.doesNotMatch(englishHtml, /three reading depths/i);
  assert.doesNotMatch(html, /<h2 id="map-title">/);
  assert.doesNotMatch(html, /什么时候看这个模块：|阅读 RAG 模块/);
  assert.equal((html.match(/class="moduleResult"/g) ?? []).length, publishedModules.length);

  for (const publishedModule of publishedModules) {
    assert.match(html, new RegExp(`<a(?=[^>]*class="moduleResult")(?=[^>]*href="${escapeRegExp(publishedModule.path)}")[^>]*>`));
  }

  for (const discovery of Object.values(moduleDiscovery)) assert.match(html, new RegExp(escapeRegExp(discovery.cue)));

  for (const knowledgeModule of moduleList) {
    assert.match(html, new RegExp(`href="${escapeRegExp(knowledgeModule.href)}"`), `homepage is missing the module entry: ${knowledgeModule.zh}`);
    assert.match(html, new RegExp(escapeRegExp(knowledgeModule.zh)), `homepage is missing the module name: ${knowledgeModule.zh}`);
    assert.match(html, new RegExp(escapeRegExp(escapeHtmlText(knowledgeModule.en))), `homepage is missing the English term: ${knowledgeModule.en}`);
  }

  for (const timeBudgetPath of timeBudgetPaths) {
    assert.match(html, new RegExp(escapeRegExp(timeBudgetPath.label)), `homepage must render the time-budget path: ${timeBudgetPath.label}`);
    assert.match(html, new RegExp(escapeRegExp(timeBudgetPath.deliverable)), `homepage must render the deliverable of ${timeBudgetPath.label}`);
  }
  for (const scenario of scenarioDefinitionsForHome) {
    assert.match(html, new RegExp(`href="${escapeRegExp(scenario.href)}"[^>]*>${escapeRegExp(escapeHtmlText(scenario.title))}`), `homepage must render the scenario entry: ${scenario.title}`);
  }

  const scenarioPathSlugs = [
    "solution-patterns", "model-landscape", "llm", "evaluation", "data-engineering", "rag", "security", "ai-gateway", "ai-ops", "ai-agent", "mcp", "a2a", "llm-inference", "ai-infra-platform", "ai-infra-compute",
  ];
  for (const slug of scenarioPathSlugs) {
    assert.match(html, new RegExp('<a(?=[^>]*class="learningPathModuleLink")(?=[^>]*href="' + escapeRegExp("/modules/" + slug) + '")[^>]*>'), "Chinese scenario path is missing a clickable module: " + slug);
    assert.match(englishHtml, new RegExp('<a(?=[^>]*class="learningPathModuleLink")(?=[^>]*href="' + escapeRegExp("/en/modules/" + slug) + '")[^>]*>'), "English learning path lacks a clickable module: " + slug);
  }

  assert.doesNotMatch(homepageSource, /layer\.purpose/, "the homepage must not render the generalized layer purpose");

  assert.doesNotMatch(html, /RAG 的工作原理与工程机制|RAG 技术环节与云服务机会|Agent 的基础概念与工作循环|Prompt 是什么，以及 Context Engineering 的边界|客户高频问题与深度回答|本题依据 \/ Evidence|统一来源台账|BUILD BRIEF|语言规范 \/ Language Standard|编辑原则：|跨模块阅读规则|中文为主|中文主版本|术语中英对照/);
  assert.doesNotMatch(html, /id="source-[a-z0-9-]+"/);
  assert.doesNotMatch(html, /\/(?:Users|home)\//, "production HTML must not leak local absolute paths");
});

test("coding agent landscape separates product facts, benchmark evidence, and freshness", async () => {
  const html = await renderHtml("/coding-agents");
  const claims = JSON.parse(await readFile(new URL("../knowledge/claims/index.json", import.meta.url), "utf8"));
  const claimIds = new Set(claims.items.map((/** @type {any} */ item) => item.id));

  assert.equal(codingAgentLandscapePolicy.productCount, codingAgentProducts.length);
  assert.equal(codingAgentLandscapePolicy.reviewCadenceDays, 30);
  assert.ok(codingAgentProducts.some((item) => item.market === "中国"), "the product radar must include the Chinese market");
  assert.ok(codingAgentProducts.some((item) => item.market === "国际"), "the product radar must include the international market");
  assert.ok(codingAgentProducts.some((item) => item.status === "watch"), "lifecycle changes must enter the watch state");
  assert.ok(codingAgentBenchmarks.length > 0, "the product radar must provide at least one verifiable benchmark entry");
  assert.equal(new Set(codingAgentBenchmarks.map((benchmark) => benchmark.id)).size, codingAgentBenchmarks.length, "benchmark entries must use stable, unique identities");
  for (const benchmark of codingAgentBenchmarks) {
    assert.ok(benchmark.scope.trim() && benchmark.use.trim() && benchmark.boundary.trim(), `${benchmark.id} must state the task scope, use, and extrapolation boundary`);
    assert.ok(sourceLedger[benchmark.sourceId], `${benchmark.id} is missing a verifiable source`);
  }

  for (const item of codingAgentProducts) {
    assert.ok(claimIds.has(item.claimId), `${item.name} is missing its dynamic fact claim`);
    assert.equal(item.verifiedAt, codingAgentLandscapePolicy.verifiedAt);
    assert.equal(item.nextReviewAt, codingAgentLandscapePolicy.nextReviewAt);
    for (const sourceId of item.sourceIds) assert.ok(sourceLedger[sourceId], `${item.name} cites an unknown source: ${sourceId}`);
  }

  assert.match(html, /Model × Harness × Task × Environment/);
  for (const product of codingAgentProducts) {
    assert.match(html, new RegExp(escapeRegExp(product.name)), `the radar must render the product: ${product.name}`);
  }
  assert.match(html, new RegExp(escapeRegExp(codingAgentLandscapePolicy.nextReviewAt)), "the radar must render the registered next review date");
});

test("English decision tools preserve canonical facts without exposing Chinese reader copy", async () => {
  const [codingHtml, radarHtml, chineseRadarHtml] = await Promise.all([
    renderHtml("/en/coding-agents"),
    renderHtml("/en/model-radar"),
    renderHtml("/model-radar"),
  ]);

  assert.deepEqual(englishCodingAgentProducts.map((item) => item.id), codingAgentProducts.map((item) => item.id));
  assert.deepEqual(englishCodingAgentBenchmarks.map((item) => item.id), codingAgentBenchmarks.map((item) => item.id));
  for (const [index, item] of englishCodingAgentProducts.entries()) {
    const canonical = codingAgentProducts[index];
    assert.equal(item.status, canonical.status);
    assert.equal(item.verifiedAt, canonical.verifiedAt);
    assert.equal(item.nextReviewAt, canonical.nextReviewAt);
    assert.deepEqual(item.sourceIds, canonical.sourceIds);
  }

  assert.deepEqual(englishModelRadarBenchmarkSourceIds, modelRadarBenchmarkSourceIds);
  assert.deepEqual(englishModelRadarSnapshots.map((item) => item.id), modelRadarSnapshots.map((item) => item.id));
  for (const [snapshotIndex, snapshot] of englishModelRadarSnapshots.entries()) {
    const canonicalSnapshot = modelRadarSnapshots[snapshotIndex];
    assert.equal(snapshot.asOf, canonicalSnapshot.asOf);
    assert.deepEqual(snapshot.models.map((model) => model.id), canonicalSnapshot.models.map((model) => model.id));
    for (const [modelIndex, model] of snapshot.models.entries()) {
      const canonicalModel = canonicalSnapshot.models[modelIndex];
      assert.deepEqual(model.sourceRefs, canonicalModel.sourceRefs);
      assert.deepEqual(model.benchmarkScores, canonicalModel.benchmarkScores);
    }
  }

  for (const [path, html] of [["/en/coding-agents", codingHtml], ["/en/model-radar", radarHtml]]) {
    assert.match(html, /<html\b[^>]*\blang="en"/i);
    assert.match(html, /fieldbookTheme/);
    assert.doesNotMatch(html, /[\u3400-\u9fff]/, `${path} must not render Chinese reader copy`);
  }

  assert.match(codingHtml, /Product and Harness Radar/);
  assert.match(codingHtml, /Model × Harness × Task × Environment/);
  assert.equal((codingHtml.match(/class="codingAgentItem"/g) ?? []).length, codingAgentProducts.length);
  assert.match(codingHtml, /href="\/en\/references#source-product-codex-docs"/);
  assert.match(codingHtml, /href="\/coding-agents"[^>]*hrefLang="zh-CN"/);

  assert.match(radarHtml, /capability snapshot: 20 configurations/i);
  assert.match(radarHtml, /Re-rank the 20 captured Intelligence configurations by capability/);
  assert.match(radarHtml, /Artificial Analysis · [\s\S]{0,80}v4\.1\.1/);
  assert.match(radarHtml, /Coding Composite/);
  assert.match(radarHtml, /Agentic Composite/);
  assert.match(radarHtml, /Claude Opus 5 \(Adaptive Reasoning, Max Effort\)/);
  assert.match(radarHtml, /Grok 4\.6 \(high\)/);
  assert.match(radarHtml, /not a global top 20 across all 604 available inference configurations in that capture/i);
  assert.match(radarHtml, /captured[\s\S]{0,80}01:18:07 UTC/i);
  assert.doesNotMatch(radarHtml, /configuration\.。|snapshot\.\./);
  assert.match(radarHtml, /href="\/en\/references#source-intelligence-index"/);
  assert.match(radarHtml, /href="\/en\/modules\/model-landscape#qa-contextual-model-choice"/);
  assert.match(radarHtml, /href="\/model-radar"[^>]*hrefLang="zh-CN"/);

  assert.match(chineseRadarHtml, /Artificial Analysis · [\s\S]{0,80}v4\.1\.1/);
  assert.match(chineseRadarHtml, /Coding Composite/);
  assert.match(chineseRadarHtml, /Agentic Composite/);
  const candidatePoolScopeClause = modelRadarPolicy.candidatePool.slice(modelRadarPolicy.candidatePool.indexOf("；") + 1);
  assert.match(chineseRadarHtml, new RegExp(escapeRegExp(candidatePoolScopeClause)));
});

test("model-radar snapshots keep the candidate pool, formulas, versions, and evidence atomic", () => {
  const expectedModelIds = [
    "claude-opus-5", "claude-fable-5", "gpt-5-6-sol", "grok-4-6", "kimi-k3",
    "qwen3-8-max", "muse-spark-1-2", "gpt-5-6-terra", "glm-5-2", "gpt-5-6-luna",
    "gemini-3-6-flash", "motif-3", "minimax-m3", "inkling",
    "nvidia-nemotron-3-ultra-550b-a55b", "gemini-3-5-flash-lite", "solar-open2-250b",
    "muse-glimmer", "a-x-k2", "k-exaone-2-0-0803",
  ];
  const requiredSourceRefs = [
    "aa-models-2026-08-13", "aa-methodology-v4-1-1", "terminal-bench-v2-1", "scicode",
    "scicode-verified-2026", "gdpval-aa-v2", "tau3-banking",
  ];
  const componentAverage = (/** @type {number | null} */ left, /** @type {number | null} */ right) => left === null || right === null ? null : Number(((left + right) / 2).toFixed(2));
  // S2-T6：benchmarkScores 四舍五入到源页面精度（1 位小数）；Intelligence 原始
  // 值与两个 50/50 Composite 的 2 位复算值仍保留在 intelligence/coding/agentic
  // 与 componentScores 中，此处只核对展示精度下的公式一致性。
  const toSourcePrecision = (/** @type {number | null} */ value) => value === null ? null : Number(value.toFixed(1));
  const assertScoreRange = (/** @type {number | null} */ value, /** @type {string} */ label) => {
    if (value !== null) assert.ok(value >= 0 && value <= 100, `${label} is out of range`);
  };

  const snapshot = modelRadarSnapshots.find((item) => item.id === "artificial-analysis-2026-08-13");
  assert.ok(snapshot, "the current 2026-08-13 snapshot must be kept");
  assert.equal(snapshot.id, "artificial-analysis-2026-08-13");
  assert.equal(snapshot.asOf, modelRadarPolicy.verifiedAt);
  assert.equal(snapshot.label, snapshot.asOf);
  assert.ok(snapshot.id.endsWith(snapshot.asOf));
  assert.equal(snapshot.methodologyVersion, "v4.1.1");
  assert.equal(snapshot.capturedAt, "2026-08-13T01:18:07Z");
  assert.deepEqual(snapshot.models.map((model) => model.id), expectedModelIds);
  assert.equal(new Set(expectedModelIds).size, expectedModelIds.length);
  assert.match(modelRadarPolicy.candidatePool, /Intelligence Index[\s\S]*604/);
  assert.match(modelRadarPolicy.confidence, /Artificial Analysis/);
  assert.equal(snapshot.models.find((model) => model.id === "gemini-3-6-flash")?.name, "Gemini 3.6 Flash (high)");
  assert.equal(snapshot.models.find((model) => model.id === "gemini-3-6-flash")?.shortName, "Gemini 3.6 Flash");
  assert.equal(snapshot.models.find((model) => model.id === "inkling")?.name, "Inkling (xhigh)");
  assert.equal(snapshot.models.find((model) => model.id === "inkling")?.shortName, "Inkling");
  assert.equal(snapshot.models.find((model) => model.id === "claude-opus-5")?.name, "Claude Opus 5 (Adaptive Reasoning, Max Effort)");
  assert.equal(snapshot.models.find((model) => model.id === "claude-fable-5")?.name, "Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback)");
  assert.equal(snapshot.models.find((model) => model.id === "nvidia-nemotron-3-ultra-550b-a55b")?.name, "Nemotron 3 Ultra 550B A55B (Reasoning)");
  assert.ok(snapshot.models.find((model) => model.id === "kimi-k3")?.openness?.trim(), "kimi-k3 must state its openness posture");
  assert.equal(snapshot.models.find((model) => model.id === "qwen3-8-max")?.provider, "Alibaba");
  assert.equal(snapshot.models.find((model) => model.id === "k-exaone-2-0-0803")?.provider, "LG AI Research");

  for (const [index, model] of snapshot.models.entries()) {
    assertScoreRange(model.intelligence, `${model.id} Intelligence`);
    if (index > 0) assert.ok(snapshot.models[index - 1].intelligence >= model.intelligence, "the snapshot must stay sorted by descending Intelligence");
    assert.equal(model.benchmarkScores["intelligence-index"], toSourcePrecision(model.intelligence));
    assert.equal(
      model.benchmarkScores["coding-index"],
      toSourcePrecision(componentAverage(model.componentScores["terminal-bench-v21"], model.componentScores.scicode)),
      `${model.id} Coding Composite formula drifted`,
    );
    assert.equal(
      model.benchmarkScores["agentic-index"],
      toSourcePrecision(componentAverage(model.componentScores["gdpval-aa-v2"], model.componentScores["tau3-banking"])),
      `${model.id} Agentic Composite formula drifted`,
    );
    for (const [sourceId, score] of Object.entries(model.componentScores)) assertScoreRange(score, `${model.id} / ${sourceId}`);
    for (const [sourceId, score] of Object.entries(model.benchmarkScores)) assertScoreRange(score, `${model.id} / ${sourceId}`);
    assert.equal(new Set(model.sourceRefs).size, model.sourceRefs.length, `${model.id} has duplicated sources`);
    assert.deepEqual(model.sourceRefs, requiredSourceRefs, `${model.id} must cover the complete source set`);
    for (const sourceRef of model.sourceRefs) {
      const sourceEntry = modelRadarSources[/** @type {any} */ (sourceRef)];
      assert.ok(sourceEntry, `${model.id} has an unresolvable source ref: ${sourceRef}`);
      assert.equal(sourceEntry.asOf, snapshot.asOf, `${sourceRef} must belong to the same capture snapshot`);
      assert.ok(sourceLedger[sourceEntry.sourceId], `${sourceRef} must resolve into the canonical sourceLedger`);
    }
  }

  assert.equal(modelRadarSources["aa-methodology-v4-1-1"].version, `Intelligence Index ${snapshot.methodologyVersion}`);
  assert.equal(modelRadarSources["aa-models-2026-08-13"].capturedAt, snapshot.capturedAt);
  assert.match(modelRadarSources["aa-models-2026-08-13"].captureFingerprint, /^HTTP ETag [a-f0-9]{32}$/);
});

test("v3 reading system keeps discovery functional, compact, and portable", async () => {
  const [html, moduleHtml, layoutSource, interactionSource, readingModeSource, styles, globalStyles] = await Promise.all([
    renderHtml("/"),
    renderHtml("/modules/evaluation"),
    readFile(new URL("../app/(zh)/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/fieldbook-interactions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dense-module-reading-modes.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/fieldbook-v3.css", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(layoutSource, /import "\.\.\/fieldbook-v3\.css"/);
  assert.doesNotMatch(html, /class="heroSearch"/, "the homepage must keep exactly one question-first entry");
  assert.match(html, /class="moduleSearch"/);
  assert.match(html, /<input[^>]*placeholder="[^"]+"/);
  assert.match(interactionSource, /export function KnowledgeSearchLaunch/);
  assert.match(moduleHtml, /class="moduleReadingExperience"/);
  assert.match(moduleHtml, /role="tablist" aria-label="[^"]+"/);
  assert.equal((moduleHtml.match(/role="tab"/g) ?? []).length, 3, "the reading tablist must expose exactly the three registered reading tasks");
  assert.match(readingModeSource, /String\(index \+ 1\)\.padStart\(2, "0"\)/);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(readingModeSource, /ArrowLeft.*ArrowRight.*Home.*End/s);
  assert.match(globalStyles, /--readable:\s*820px/);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(styles, /\.moduleResult\s*\{[^}]*display:\s*grid[^}]*grid-template-areas:/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(styles, /\.moduleSearch\s*\{[^}]*grid-template-columns:/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(styles, /@media \(max-width:\s*720px\)[\s\S]*\.topbar\s*\{[^}]*flex-wrap:\s*wrap/s);
  assert.doesNotMatch(styles, /url\s*\(/i, "the V3 visual system must not depend on remote or runtime images");
  assert.doesNotMatch(styles, /\/(?:Users|home)\//, "V3 styles must not contain local absolute paths");
});

test("focus surfaces provide accessible terminology explanations", async () => {
  const hintTermIds = ["rag", "llm", "ai-agent", "poc", "sla", "tco", "mcp", "a2a", "bm25", "ann", "hnsw", "rrf", "api", "iam", "acl", "dlp", "hitl", "qkv", "kv-cache", "ttft", "tpot", "moe", "sft", "lora", "qlora", "dpo"];

  for (const termId of hintTermIds) {
    const term = requireTerm(termId);
    assert.ok(term.abbr && term.description, `abbreviation hints need both the abbreviation and a short description: ${termId}`);
  }

  for (const path of ["/modules/rag", "/modules/ai-agent", "/modules/llm", "/modules/solution-patterns", "/modules/security", "/modules/fine-tuning"]) {
    const html = await renderHtml(path);
    assert.match(html, /class="termHintRow"/i, `${path} is missing the abbreviation quick-lookup entry`);
    assert.match(html, /<details class="termHint" data-term-id="[^"]+">/i, `${path} abbreviation hints must use clickable native details`);
    assert.match(html, /<summary aria-label="[^"]+">/i, `${path} abbreviation controls are missing an accessible name`);
  }

  const homepage = await renderHtml("/");
  assert.match(homepage, /class="termHintGroups"/i);
  assert.match(homepage, /id="home-term-guide-title"/);
  assert.match(
    homepage,
    new RegExp(`查看全部[\\s\\S]{0,80}${glossaryTermIds.length}[\\s\\S]{0,80}个术语`),
  );
  for (const group of homepageTermGroups) {
    assert.match(homepage, new RegExp(escapeRegExp(group.label)));
    for (const termId of group.termIds) assert.match(homepage, new RegExp(`data-term-id="${escapeRegExp(termId)}"`));
  }

  const styles = await readFile(new URL("../app/fieldbook-v2.css", import.meta.url), "utf8");
  assert.match(styles, /\.termHint:hover\s+\.termHintPopover\s*\{\s*display:\s*block;/, "desktop hover must reveal the abbreviation note directly");
  assert.doesNotMatch(styles, /@media\s*\(hover:\s*hover\)[\s\S]*?\.termHint:hover\s+\.termHintPopover/, "abbreviation hover must not depend on the input-device capability query");
});

test("glossary is complete, searchable, grouped, and linked back to published modules", async () => {
  const terminologyIds = Object.keys(terminology);
  const homepageTermIds = homepageTermGroups.flatMap((group) => group.termIds);
  const publishedSet = new Set(publishedModuleSlugs);

  assert.deepEqual([...glossaryTermIds].sort(), terminologyIds.sort(), "every term must belong to exactly one glossary topic");
  assert.equal(new Set(glossaryTermIds).size, glossaryTermIds.length, "glossary termIds must be unique");
  assert.equal(new Set(homepageTermIds).size, homepageTermIds.length, "homepage core terms must not repeat");
  assert.ok(homepageTermIds.length > 0, "the homepage must keep at least one meaningful term entry");
  assert.ok(homepageTermGroups.every((group) => group.label.trim() && group.en.trim() && group.termIds.length > 0), "homepage term groups need readable zh/en labels and real entries");
  assert.ok(homepageTermIds.length < glossaryTermIds.length, "the homepage only carries the core entries; the full set stays in the glossary");

  for (const [termId, term] of Object.entries(terminology)) {
    assert.ok(term.description.length >= 12, `term is missing a readable one-line description: ${termId}`);
    assert.ok(term.moduleSlugs.length > 0, `term is missing related modules: ${termId}`);
    for (const slug of term.moduleSlugs) assert.ok(publishedSet.has(slug), `term links to an unknown module: ${termId} -> ${slug}`);
  }

  const html = await renderHtml("/glossary");
  assert.match(html, /<input[^>]*placeholder="[^"]+"/);
  for (const group of glossaryGroups) {
    assert.match(html, new RegExp(`id="glossary-group-${escapeRegExp(group.id)}"`));
    assert.match(html, new RegExp(escapeRegExp(group.zh)));
  }
  for (const termId of glossaryTermIds) assert.match(html, new RegExp(`id="term-${escapeRegExp(termId)}"`));
});

test("public dynamic knowledge graph and backend coverage gates derive from stable registries", async () => {
  const moduleIds = new Set(moduleList.map((module) => module.slug));
  const termIds = new Set(Object.keys(terminology));
  const allowedExplicitTypes = new Set(["prerequisite", "component", "control", "metric"]);
  const relationKeys = new Set();

  assert.equal(Object.keys(termPrimaryModules).length, termIds.size, "every term must have exactly one primary module");
  for (const [termId, primaryModuleId] of Object.entries(termPrimaryModules)) {
    assert.ok(termIds.has(termId), `graph primary ownership references an unknown term: ${termId}`);
    assert.ok(moduleIds.has(primaryModuleId), `graph primary ownership references an unknown module: ${termId} -> ${primaryModuleId}`);
    assert.equal(terminology[termId].moduleSlugs[0], primaryModuleId, `the first term module must be the primary owner: ${termId}`);
  }

  for (const relation of explicitTermRelations) {
    assert.ok(termIds.has(relation.from), `graph relation references an unknown start: ${relation.from}`);
    assert.ok(termIds.has(relation.to), `graph relation references an unknown end: ${relation.to}`);
    assert.ok(allowedExplicitTypes.has(relation.type), `illegal graph relation type: ${relation.type}`);
    assert.ok(relation.explanation.length >= 18, `graph relation is missing a readable explanation: ${relation.from} -> ${relation.to}`);
    assert.equal(relation.id, `${relation.from}:${relation.type}:${relation.to}`, "graph relations must carry a predictable stable id");
    assert.equal(relation.direction, "directed", "explicit graph relations must declare their direction");
    assert.equal(relation.status, "published", "the public graph only consumes formal relations");
    const key = `${relation.from}:${relation.type}:${relation.to}`;
    assert.equal(relationKeys.has(key), false, `duplicate graph relation: ${key}`);
    relationKeys.add(key);
  }

  assert.equal(graphHealth.isolatedTermIds.length, 0, "terms must not become isolated nodes");
  assert.ok(graphHealth.maximumDegree > 0, "the graph health check must compute the node degree");
  assert.equal(graphModuleCoverage.length, moduleList.length, "the global graph must compute coverage for every formal module");
  assert.equal(graphModuleCoverage.filter((coverage) => coverage.termCount === 0).length, 0, "every formal module must own drillable related terms");
  assert.equal(graphModuleCoverage.filter((coverage) => coverage.primaryTermCount === 0).length, 0, "every formal module must own at least one primary term");
  assert.equal(graphModuleCoverage.every((coverage) => coverage.primaryTermCount >= 0 && coverage.primaryTermCount <= coverage.termCount), true, "primary term counts must stay within the related term counts");
  assert.equal(graphOverviewPolicy.requiresSharedTerm, true, "overview links must come from real shared terms");
  assert.deepEqual(
    graphOverviewLinks.map(({ id, termIds }) => ({ id, termIds: [...termIds] })),
    deriveSharedTermModuleLinks(moduleList, terminology),
    "the global overview must present every shared-term pair derived from the module and term registries",
  );

  for (const typeId of /** @type {any[]} */ (["primary-owner", "contextual-use", ...allowedExplicitTypes])) {
    assert.ok(knowledgeRelationTypes[/** @type {keyof typeof knowledgeRelationTypes} */ (typeId)], `graph is missing the relation-type description: ${typeId}`);
  }

  const html = await renderHtml("/knowledge-graph");
  assert.match(html, new RegExp(`${layers.length}[\\s\\S]{0,120}层知识`));
  assert.match(html, new RegExp(`${moduleList.length}[\\s\\S]{0,120}个模块`));
  assert.match(html, new RegExp(`${glossaryTermIds.length}[\\s\\S]{0,120}个术语`));
  assert.match(html, /<input[^>]*placeholder="[^"]+"/);
  assert.match(html, /id="knowledge-graph-module-rail"/);
  assert.match(html, /href="\/#available-modules"[^>]*>[^<]+<\/a>/);
  assert.match(html, /href="\/modules\/rag"[^>]*>[^<]+/);
  assert.match(html, new RegExp(`moduleTitleLead[^>]*>RAG<\\/span><span[^>]*moduleTitleDetail[^>]*>${escapeRegExp(terminology.rag.zh)}`));
  assert.doesNotMatch(html, /全局总览|覆盖门禁|关系总览|切换到关系总览/);
  const graphExplorerSource = await readFile(new URL("../app/knowledge-graph/design-2/knowledge-constellation.tsx", import.meta.url), "utf8");
  assert.match(graphExplorerSource, /splitModuleTitle/);
  assert.match(graphExplorerSource, /className=\{styles\.focusAction\}/);
  assert.doesNotMatch(html, /来源节点|客户问题节点|图数据库|GraphRAG/);
  assert.doesNotMatch(html, /\b(?:Login|Sign in)\b|type="password"/i);
  assert.doesNotMatch(html, /\/(?:Users|home)\//);
});

test("evidence cards keep facts, findings, boundaries, and sources readable", async () => {
  const [componentSource, globalStyles] = await Promise.all([
    readFile(new URL("../app/module-content-components.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  const metricIndex = componentSource.indexOf('className="metric"');
  const findingIndex = componentSource.indexOf('className="metricFinding"');
  const boundaryIndex = componentSource.indexOf('className="metricBoundary"');
  const sourceIndex = componentSource.indexOf("href={`/references#source-${card.sourceId}`}");
  assert.ok(metricIndex >= 0 && metricIndex < findingIndex && findingIndex < boundaryIndex && boundaryIndex < sourceIndex, "evidence cards must read fact label, finding, boundary, then source");

  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(globalStyles, /\.metric\s*\{[^}]*font-size:\s*clamp\(22px,2vw,30px\)/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(globalStyles, /\.metricFinding\s*\{[^}]*font-size:\s*16px/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(globalStyles, /\.metricBoundary\s*\{[^}]*font-size:\s*14px/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(globalStyles, /\.metricCard\s*\{[^}]*min-height:\s*0/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.doesNotMatch(globalStyles, /\.metric\s*\{[^}]*font-size:\s*clamp\(4\dpx/s, "evidence fact labels must not return to cover-sized type");
});

test("dense-reading modules derive a scannable content overview without a visual or reader-mode quota", async () => {
  const denseReadingModules = publishedModuleRegistry.filter((module) => module.visualProfile === "dense-reading");
  assert.equal(denseReadingModules.length, publishedModuleRegistry.length, "every formal module must complete the dense-reading shell");

  for (const publishedModule of denseReadingModules) {
    const html = await renderHtml(publishedModule.path);
    assert.match(html, /class="[^"]*\bmodulePilot\b[^"]*"/, `${publishedModule.slug} has not enabled the shared dense-reading shell`);
    if (publishedModule.readingProfile === "focused") assert.match(html, /class="[^"]*\bmoduleFocused\b[^"]*"/, `${publishedModule.slug} has not enabled the focused reading structure`);
    assert.match(html, /<dl class="moduleHeroMetrics" aria-label="[^"]+">/);
    const heroMetricsHtml = html.match(/<dl class="moduleHeroMetrics"[\s\S]*?<\/dl>/)?.[0] ?? "";
    const content = requireModuleContent(publishedModule.slug);
    assert.match(heroMetricsHtml, new RegExp(`<strong>${content.qa.length}<\\/strong>`), `${publishedModule.slug} hero metrics must carry the registered question count`);
    assert.match(heroMetricsHtml, new RegExp(`<strong>${content.evidenceCards.length}<\\/strong>`), `${publishedModule.slug} hero metrics must carry the registered evidence-card count`);
    serverRenderedReadingPanels(html, publishedModule.slug);
    if (publishedModule.knowledgeView) assert.match(html, new RegExp(`data-knowledge-view="${publishedModule.knowledgeView}"`));
  }
});

test("focused pilots use relationship-driven reading paths instead of standalone chapter quotas", async () => {
  const focusedModules = publishedModuleRegistry.filter((module) => module.readingProfile === "focused");
  assert.ok(focusedModules.length > 0, "at least one module should opt into the focused reading profile");

  for (const publishedModule of focusedModules) {
    const html = await renderHtml(publishedModule.path);
    assert.match(html, /class="moduleReadingExperience"/);
    serverRenderedReadingPanels(html, publishedModule.slug);
    if (publishedModule.slug === "rag") {
      assert.match(html, /id="fit"/);
      assert.match(html, /id="evidence-contract"/);
      assert.ok(html.indexOf('id="fit"') < html.indexOf('id="evidence"'), "rag must judge the adoption boundary before the evidence contract");
    } else {
      assert.match(html, /id="principle"/);
      assert.ok(html.indexOf('id="principle"') < html.indexOf('id="evidence"'), `${publishedModule.slug} must lead with its own judgement spine`);
    }
    assert.match(html, /data-quality-section="deep-dive"/);
    assert.ok(html.indexOf('id="qa"') < html.indexOf('id="related-modules"'), `${publishedModule.slug} should finish the main argument before related modules`);
  }

  const [solution, rag, mcp, inference] = await Promise.all([
    renderHtml("/modules/solution-patterns"),
    renderHtml("/modules/rag"),
    renderHtml("/modules/mcp"),
    renderHtml("/modules/llm-inference"),
  ]);
  assert.match(solution, /class="solutionDecisionLoop"/);
  assert.match(solution, /class="solutionCapabilityMatrix"/);
  assert.doesNotMatch(solution, /class="solutionDecisionRail"/);
  assert.match(rag, /class="ragDualChainExplorer"/);
  assert.match(rag, /class="focusedDecisionLedger"/);
  assert.match(mcp, /class="mcpArchitectureExplorer"/);
  const mcpContent = /** @type {any} */ (requireModuleContent("mcp"));
  for (const deepDive of mcpContent.deepDives) {
    assert.match(mcp, new RegExp(renderTextPattern(deepDive.title)), `MCP must render its registered deep dive: ${deepDive.title}`);
  }
  assert.match(mcp, /Multi Round-Trip Requests/);
  assert.match(mcp, /input_required/);
  assert.match(mcp, /requestState/);
  assert.match(mcp, /Mcp-Method/);
  assert.match(mcp, /Mcp-Name/);
  for (const fragment of ["server/discover", "tools/list", "prompts/list", "resources/list", "resources/templates/list", "resources/read", "complete", "tasks/get", "tasks/update", "tasks/cancel", "params.taskId", "notification POST"]) {
    assert.match(mcp, new RegExp(escapeRegExp(fragment)), `MCP must render the registered protocol fact: ${fragment}`);
  }
  assert.doesNotMatch(mcp, /会话、能力协商与结构化消息|状态变更用 Tool|只读内容优先 Resource/);
  assert.doesNotMatch(mcp, /class="mcpResponsibilityMap"/);
  const mcpSystematicStudy = readingPanelHtml(mcp, "learn", "MCP");
  const mcpCurriculum = requireModuleCurriculum("mcp");
  assert.match(mcpSystematicStudy, /id="curriculum"/, "MCP systematic study must lead from the topic map into real content");
  for (const [index, chapter] of mcpCurriculum.chapters.entries()) {
    assert.match(mcpSystematicStudy, new RegExp(`id="mcp-chapter-${index + 1}"`), `MCP systematic study is missing the topic: ${chapter.title}`);
    assert.match(mcpSystematicStudy, new RegExp(renderTextPattern(chapter.title)), `MCP systematic study is missing the topic body: ${chapter.title}`);
  }
  ["mcp-relationships", "mcp-contract-dossier", "mcp-labs"].forEach((id) => assert.match(mcpSystematicStudy, new RegExp(`id="${id}"`), `MCP systematic study is missing the executable artifact: ${id}`));
  const mcpQaPanels = [...mcp.matchAll(/<div\b(?=[^>]*\bid="mcp-qa-panel-[^"]+")[^>]*>/g)].map(([tag]) => tag);
  assert.ok(mcpQaPanels.length > 0, "MCP field QA must keep its categorized panels");
  mcpQaPanels.forEach((panel) => assert.doesNotMatch(panel, /\shidden(?:\s|=|>)/i, "without JavaScript MCP must not hide any QA category"));
  const solutionCapabilityRows = solution.match(/class="solutionCapabilityMatrixRow"/g) ?? [];
  const solutionChoiceCells = solution.match(/data-label="常见选择"/g) ?? [];
  assert.equal(solutionChoiceCells.length, solutionCapabilityRows.length, "every solution matrix row must keep its choice label even when the header collapses");
  assert.match(inference, /class="inferenceExplorer"/);
  const inferenceContent = /** @type {any} */ (requireModuleContent("llm-inference"));
  for (const deepDive of inferenceContent.deepDives) {
    assert.match(inference, new RegExp(renderTextPattern(deepDive.title)), `inference must render its registered deep dive: ${deepDive.title}`);
  }
  assert.match(inference, /TTFT/);
  assert.match(inference, /TPOT/);
  assert.doesNotMatch(inference, /class="inferenceBudgetLedger"/);
});

test("migrated Chinese modules share one header, hero, and task-led reader contract", async () => {
  const renderedModules = await Promise.all(publishedModules.map(async (module) => ({
    html: await renderHtml(module.path),
    path: module.path,
  })));
  const unifiedModules = renderedModules.filter(({ html }) => /data-module-hero="unified"/.test(html));
  const paths = unifiedModules.map(({ path }) => path);
  const htmlByPath = unifiedModules.map(({ html }) => html);
  assert.deepEqual([...paths].sort(), publishedModules.map((module) => module.path).sort(), "every published module must use the shared reader shell");

  for (const [index, html] of htmlByPath.entries()) {
    assert.match(html, /data-module-hero="unified"/, `${paths[index]} is missing the shared Hero`);
    assert.match(html, /data-module-reader="unified"/, `${paths[index]} is missing the shared reading controller`);
    assert.match(html, /Cloud × AI \/ Presales Fieldbook/, `${paths[index]} must use the unified brand`);
    assert.match(html, /<nav[^>]*aria-label="[^"]+"/);
    assert.match(html, new RegExp(`href="/"[^>]*>[^<]*<\\/a>`));
    assert.match(html, /href="#qa"[^>]*>[^<]*<\/a>/);
    assert.match(html, new RegExp(`href="/references#module-${escapeRegExp(publishedModules[index].slug)}"[^>]*>[^<]*<\\/a>`));
    assert.match(html, /href="\/glossary"[^>]*>[^<]*<\/a>/);
    assert.match(html, new RegExp(`href="/en${escapeRegExp(paths[index])}"[^>]*>[^<]*<\\/a>`));
    assert.match(html, /<summary aria-label="[^"]+"><span><\/span><span><\/span><span><\/span><\/summary>/, `${paths[index]} is missing the mobile menu`);
    assert.match(html, /aria-label="[^"]+"[^>]*data-importance="critical"/);
    serverRenderedReadingPanels(html, paths[index]);
  }

  const [ragRoute, agentRoute, mcpRoute, a2aRoute, promptRoute, readerSource, qaInteractionSource, heroSource, relationSource, mcpStyles, denseStyles, fieldbookStyles] = await Promise.all([
    readFile(new URL("../app/(zh)/modules/rag/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/modules/ai-agent/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/mcp-module-experience-client.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/a2a-module-experience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/modules/prompt-engineering/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dense-module-reading-modes.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/fieldbook-interactions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/unified-module-hero.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/deep-dive-relation-view.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/mcp-module-experience.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/dense-module-reading-modes.module.css", import.meta.url), "utf8"),
    readFile(new URL("../app/fieldbook-v3.css", import.meta.url), "utf8"),
  ]);
  for (const routeSource of [ragRoute, agentRoute, mcpRoute, a2aRoute, promptRoute]) {
    assert.match(routeSource, /UnifiedModuleScaffold/);
    assert.doesNotMatch(routeSource, /<UnifiedModuleHero\b|<ReadingProgress\b/);
    assert.match(routeSource, /DenseModuleReadingModes/);
  }
  assert.match(readerSource, /aria-current=\{activeId === item\.id \? "location"/);
  assert.match(readerSource, /const \[isEnhanced, setIsEnhanced\] = useState\(false\);/);
  assert.match(readerSource, /useEffect\(\(\) => \{\s*const frame = window\.requestAnimationFrame\(\(\) => setIsEnhanced\(true\)\);[\s\S]*window\.cancelAnimationFrame\(frame\);\s*\}, \[\]\);/);
  assert.match(readerSource, /hidden=\{isEnhanced && activeMode !== mode\.id\}/);
  assert.match(readerSource, /IntersectionObserver/);
  assert.match(readerSource, /closest<HTMLElement>\("\[data-reading-mode\]"\)/, "nested deep links must detect their own reading panel");
  assert.match(readerSource, /function directoryAnchorForTarget\(/, "nested deep links must resolve to the nearest directory owner");
  assert.match(readerSource, /while \(current\)[\s\S]*directoryIds\.has\(current\.id\)[\s\S]*current = current\.parentElement/, "directory ownership must walk real DOM ancestors");
  assert.match(readerSource, /setActiveAnchor\(directoryAnchorForTarget\(targetId, nextMode, directoryByMode\) \?\? targetId\)/, "nested deep links must highlight their directory item instead of a missing leaf");
  assert.match(readerSource, /data-reading-mode=\{mode\.id\}/, "every reading panel must declare its stable mode");
  assert.match(readerSource, /target\.startsWith\("qa-"\) && readingModeIds\.includes\("field"\) \? "field" : null/, "qa deep links may only fall back to the field task when it is declared");
  assert.match(readerSource, /setActiveMode\(resolvedDefaultMode\)[\s\S]*setActiveAnchor\(undefined\)/, "clearing the hash must restore the module default reading task");
  assert.match(readerSource, /modeDefinitions\?\.length \? modeDefinitions : copy\.modes/, "the reader must let modules declare their own reading tasks");
  assert.match(readerSource, /const missingPanelIds = readingModes/, "every declared reading task must have a matching body");
  assert.doesNotMatch(readerSource, /const readingModeIds = \["quick", "learn", "field"\]/, "the shared reader must not treat its defaults as a fixed task set");
  const revealHashStart = readerSource.indexOf("const revealHash =");
  const revealHashEnd = readerSource.indexOf("\n\n  useEffect(", revealHashStart);
  const revealHashSource = readerSource.slice(revealHashStart, revealHashEnd);
  assert.match(revealHashSource, /setPendingHashReveal\(\{[\s\S]*mode: nextMode/, "cross-mode hashes must register a post-commit reveal request");
  assert.doesNotMatch(revealHashSource, /scrollHashTargetIntoView/, "the hash handler must not scroll before the target panel commits");
  assert.match(readerSource, /pendingHashReveal\.mode !== activeMode[\s\S]*scrollHashTargetIntoView\(hash\)[\s\S]*queueMicrotask/, "the unified reader must reveal and clear the request once the target mode commits");
  assert.match(readerSource, /event\.preventDefault\(\);[\s\S]*window\.history\.pushState\(window\.history\.state/, "the unified reader must own its anchors and preserve Back history");
  assert.match(readerSource, /window\.history\.replaceState\(window\.history\.state/, "clearing the hash on task switch must not drop router history state");
  assert.match(readerSource, /target instanceof HTMLDetailsElement\) target\.open = true/, "qa deep links must expand their target disclosure");
  assert.match(readerSource, /revealTarget\(\);[\s\S]*requestAnimationFrame\(\(\) => \{[\s\S]*revealTarget\(\);[\s\S]*requestAnimationFrame\(revealTarget\)/, "responsive layout commits must double-check the deep-link position");
  assert.match(qaInteractionSource, /target\.hidden = false;[\s\S]*requestAnimationFrame\(\(\) => \{[\s\S]*target\.scrollIntoView[\s\S]*requestAnimationFrame\(\(\) => target\.scrollIntoView/, "qa deep links inside collapsed sets must re-anchor after expansion");
  assert.match(readerSource, /count === 1 \? "entry" : "entries"/, "English directory counts must handle singular and plural");
  assert.match(heroSource, /mobileMenu:\s*"/, "the Chinese mobile menu name must stay in the localized contract");
  assert.match(heroSource, /aria-label=\{copy\.mobileMenu\}/, "the mobile menu name must not bind to one open state");
  assert.match(heroSource, /<em lang="en"> · \{enTitle\}<\/em>/, "the Chinese Hero English subtitle must declare its language");
  assert.match(relationSource, /className="relationMatrixScroll" role="region" aria-label=\{block\.title\} tabIndex=\{0\}/, "relation matrices must be focusable with an accessible name");
  assert.match(relationSource, /<caption className="srOnly">\{block\.title\}<\/caption>/, "relation matrices must declare a hidden caption");
  assert.equal((relationSource.match(/scope="col"/g) ?? []).length, 4, "all four relation-matrix columns must declare column headers");
  assert.match(relationSource, /<th scope="row"><button/, "the relation-matrix object column must declare row headers");
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(fieldbookStyles, /\.moduleReadingExperience\[data-module-reader="unified"\]\s*\{[^}]*overflow:\s*visible;/s, "the unified reader must not clip sticky elements");
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(fieldbookStyles, /\[data-module-content="unified"\] \.moduleReadingHost > \.section\s*\{[^}]*overflow:\s*visible;/s, "unified reader body ancestors must not break sticky positioning");
  assert.doesNotMatch(denseStyles, /#fff\b/, "the unified reader must consume the shared surface token");
  const ragTables = ragRoute.match(/<table>/g) ?? [];
  const ragCaptions = ragRoute.match(/<caption className="srOnly">/g) ?? [];
  const ragRegions = ragRoute.match(/role="region"[^>]*tabIndex=\{0\}/g) ?? [];
  assert.ok(ragTables.length > 0, "RAG must keep its relation tables for incompressible object relations");
  assert.equal(ragCaptions.length, ragTables.length, "every RAG table must have an accessible name");
  assert.equal(ragRegions.length, ragTables.length, "every RAG relation table must support keyboard scrolling");
  assert.ok((ragRoute.match(/scope="row"/g) ?? []).length >= ragTables.length, "every RAG table must declare row headers");

  const a2aRegions = a2aRoute.match(/role="region"[^>]*tabIndex=\{0\}/g) ?? [];
  const a2aCaptions = a2aRoute.match(/<caption className="srOnly">/g) ?? [];
  assert.ok(a2aRegions.length > 0, "A2A relation matrices must have focusable named regions");
  assert.equal(a2aCaptions.length, a2aRegions.length, "every A2A relation matrix must declare a hidden caption");
  assert.ok((a2aRoute.match(/scope="col"/g) ?? []).length > 0, "A2A tables must declare column headers");
  assert.ok((a2aRoute.match(/scope="row"/g) ?? []).length > 0, "A2A tables must declare row headers");

  const promptRegions = promptRoute.match(/role="region"[^>]*aria-label="[^"]+"[^>]*tabIndex=\{0\}/g) ?? [];
  const promptCaptions = promptRoute.match(/<caption className="srOnly">/g) ?? [];
  assert.ok(promptRegions.length > 0, "Prompt relation tables must use focusable named regions");
  assert.ok(promptCaptions.length >= promptRegions.length, "Prompt relation tables must declare hidden captions");
  assert.ok((promptRoute.match(/scope="col"/g) ?? []).length > 0, "Prompt tables must declare column headers");
  assert.match(promptRoute, /id="context-assembly"[\s\S]*<ModuleExtensionPrimer/, "Prompt must keep a real DOM target for the historic context-assembly deep link");
  assert.doesNotMatch(mcpRoute, /mobileChapterNav/, "MCP must not keep a second mobile chapter nav");
  assert.doesNotMatch(mcpStyles, /mobileChapterNav/, "MCP must not keep second mobile chapter nav styles");
});

test("standard brief modules preserve their authored content in the unified reader", async () => {
  const cases = [
    {
      slug: "solution-patterns",
      zhTitleId: "solution-patterns-title",
      enTitleId: "solution-patterns-english-title",
      zhPrimerId: "solution-pattern-primer-title",
      enPrimerId: "solution-patterns-english-primer-title",
      zhMechanism: /data-knowledge-view="decision-blueprint"/,
      enMechanism: /data-knowledge-view="decision-blueprint"/,
      requiredChineseIds: ["principle", "mechanism-summary", "solution-decision-ledger-title"],
      requiredChineseQaTags: ["禁止动作"],
      requiredEnglishIds: ["decision-blueprint", "solution-outcome-poc", "solution-pattern-curriculum", "solution-claims-intake-exit", "solution-cloud-operate", "evidence-solution-value-connection", "qa-claim-intake-prohibited-actions"],
    },
    {
      slug: "model-landscape",
      zhTitleId: "model-landscape-title",
      enTitleId: "model-landscape-english-title",
      zhPrimerId: "model-landscape-extension-primer-title",
      enPrimerId: "model-landscape-english-primer-title",
      zhMechanism: /data-knowledge-view="selection-coordinate"/,
      enMechanism: /data-knowledge-view="selection-coordinate"/,
    },
    {
      slug: "multimodal",
      zhTitleId: "multimodal-title",
      enTitleId: "multimodal-english-title",
      zhPrimerId: "multimodal-extension-primer-title",
      enPrimerId: "multimodal-english-primer-title",
      zhMechanism: /data-knowledge-view="multimodal-evidence-pipeline"/,
      enMechanism: /data-knowledge-view="multimodal-evidence-pipeline"/,
      requiredEnglishIds: ["multimodal-evidence-pipeline", "multimodal-barge-in-runtime", "multimodal-failure-slices", "multimodal-content-delivery-chain", "pipeline-contract", "failure-small-text-table"],
    },
    {
      slug: "veadk",
      zhTitleId: "veadk-title",
      enTitleId: "veadk-english-title",
      zhPrimerId: "veadk-extension-primer-title",
      enPrimerId: "veadk-english-primer-title",
      zhMechanism: /data-knowledge-view="agent-definition-runtime-bridge"/,
      enMechanism: /data-knowledge-view="agent-definition-runtime-bridge"/,
      requiredEnglishIds: ["principles", "cloud-connections", "decision-veadk-or-google-adk", "deep-state-and-memory", "qa-veadk-application-entry-choice"],
    },
    {
      slug: "agentkit",
      zhTitleId: "agentkit-title",
      enTitleId: "agentkit-english-title",
      zhPrimerId: "agentkit-extension-primer-title",
      enPrimerId: "agentkit-english-primer-title",
      zhMechanism: /data-knowledge-view="application-runtime-lifecycle"/,
      enMechanism: /data-knowledge-view="application-runtime-lifecycle"/,
      requiredEnglishIds: ["principles", "cloud-connections", "deep-dependencies-to-outcome", "cloud-pending-load", "qa-agentkit-operating-evidence", "evidence-agentkit-cloud-evidence-pending"],
    },
    {
      slug: "evaluation",
      zhTitleId: "evaluation-title",
      enTitleId: "evaluation-english-title",
      zhPrimerId: "evaluation-extension-primer-title",
      enPrimerId: "evaluation-english-primer-title",
      zhMechanism: /data-knowledge-view="evaluation-flywheel"/,
      enMechanism: /data-knowledge-view="evaluation-flywheel"/,
      requiredEnglishIds: ["evaluation-flywheel", "evaluation-curriculum", "evaluation-benchmark-atlas", "evaluation-score-diagnostics", "evaluation-result-contract", "evaluation-cloud", "qa-nondeterministic-score-reporting", "evidence-offline-deployed-evidence"],
    },
    {
      slug: "ai-governance",
      zhTitleId: "ai-governance-title",
      enTitleId: "ai-governance-english-title",
      zhPrimerId: "ai-governance-extension-primer-title",
      enPrimerId: "ai-governance-english-primer-title",
      zhMechanism: /data-knowledge-view="governance-assurance-loop"/,
      enMechanism: /data-knowledge-view="governance-assurance-loop"/,
      requiredEnglishIds: ["governance-critical-boundary", "governance-decision-private-deployment", "governance-obligation-labeling", "qa-eu-ai-act-timeline-freshness", "qa-china-algorithm-filing-triage", "evidence-eu-amendment-timeline"],
    },
    {
      slug: "security",
      zhTitleId: "security-title",
      enTitleId: "security-english-title",
      zhPrimerId: "security-threat-primer-title",
      enPrimerId: "security-english-primer-title",
      zhMechanism: /data-knowledge-view="threat-path"/,
      enMechanism: /data-knowledge-view="threat-path"/,
      requiredEnglishIds: ["threat-path", "security-path-authorize", "security-owner-boundary", "security-decision-ats", "security-incident-ats-action", "security-cloud-response", "qa-content-labeling-log-controls", "evidence-content-labeling-controls"],
    },
    {
      slug: "ai-gateway",
      zhTitleId: "ai-gateway-title",
      enTitleId: "ai-gateway-english-title",
      zhPrimerId: "ai-gateway-extension-primer-title",
      enPrimerId: "ai-gateway-english-primer-title",
      zhMechanism: /data-knowledge-view="gateway-policy-data-plane"/,
      enMechanism: /data-knowledge-view="gateway-policy-data-plane"/,
      requiredEnglishIds: ["gateway-policy-data-plane", "gateway-decision-managed", "gateway-deep-offline-replay", "gateway-cloud-routing", "qa-request-rate-limit-not-enough", "evidence-gateway-routing-risk-loop"],
    },
    {
      slug: "ai-ops",
      zhTitleId: "ai-ops-title",
      enTitleId: "ai-ops-english-title",
      zhPrimerId: "ai-ops-extension-primer-title",
      enPrimerId: "ai-ops-english-primer-title",
      zhMechanism: /data-knowledge-view="operations-feedback-loop"/,
      enMechanism: /data-knowledge-view="operations-feedback-loop"/,
      requiredChineseQaTags: ["观测边界", "业务恢复", "告警设计"],
      requiredEnglishIds: ["ai-ops-operating-model", "principle-task-contract", "ai-ops-decisions", "decision-release-traffic", "ai-ops-delivery-chain", "incident-freeze-evidence", "ai-ops-cloud", "cloud-release-incident", "qa-incident-business-state", "evidence-model-external-stop"],
    },
    {
      slug: "predictive-ai-mlops",
      zhTitleId: "predictive-ai-mlops-title",
      enTitleId: "predictive-ai-mlops-english-title",
      zhPrimerId: "predictive-ai-mlops-extension-primer-title",
      enPrimerId: "predictive-ai-mlops-english-primer-title",
      zhMechanism: /data-knowledge-view="predictive-model-lifecycle"/,
      enMechanism: /data-knowledge-view="predictive-model-lifecycle"/,
      requiredChineseQaTags: ["效果验收", "回滚恢复"],
      requiredEnglishIds: ["predictive-model-lifecycle", "predictive-decision-retraining", "predictive-deep-skew", "predictive-cloud-monitor", "qa-predictive-rollback-bundle", "evidence-production-readiness-score"],
    },
    {
      slug: "llm",
      zhTitleId: "llm-title",
      enTitleId: "llm-english-title",
      zhPrimerId: "llm-theory-primer-title",
      enPrimerId: "llm-english-primer-title",
      zhMechanism: /class="llmGenerationExplorer"/,
      enMechanism: /class="visualPipelineCanvas"/,
    },
    {
      slug: "fine-tuning",
      zhTitleId: "fine-tuning-title",
      enTitleId: "fine-tuning-english-title",
      zhPrimerId: "fine-tuning-primer-title",
      enPrimerId: "fine-tuning-english-primer-title",
      zhMechanism: /data-knowledge-view="tuning-lifecycle"/,
      enMechanism: /data-knowledge-view="tuning-lifecycle"/,
      requiredChineseQaTags: ["能力保留"],
      requiredEnglishIds: ["tuning-lifecycle", "critical-tuning-boundary", "tuning-production", "qa-detect-catastrophic-forgetting", "evidence-dpo-preference-pairs"],
      requiredEnglishFacts: [
        ["Training trigger", "Train only when a stable, repeatable, labelable behavior gap remains."],
        ["No-tune gate", "Data rights · privacy treatment · reliable adjudication · frozen evaluation · versioning · rollback"],
        ["Release tuple", "Data · base · adapter · tokenizer · template · runtime · policy · evidence · economics"],
        ["Stop condition", "Unstable gains · critical regression · a lighter route wins"],
      ],
      englishBoundary: /Do not use fine-tuning in place of a current knowledge source[\s\S]*tool authorization[\s\S]*model-impact obligations/,
    },
    {
      slug: "llm-training",
      zhTitleId: "llm-training-title",
      enTitleId: "llm-training-english-title",
      zhPrimerId: "llm-training-extension-primer-title",
      enPrimerId: "llm-training-english-primer-title",
      zhMechanism: /data-knowledge-view="training-supply-chain"/,
      enMechanism: /data-knowledge-view="training-supply-chain"/,
      requiredChineseQaTags: ["检查点策略"],
      requiredEnglishIds: ["principles", "training-product-boundary", "deep-failure-recovery", "qa-checkpoint-frequency", "evidence-fine-tuning-four-layer-gate"],
      requiredEnglishFacts: [
        ["Training signals", "General-pattern learning · instruction demonstrations · preference signals · verifiable outcomes"],
        ["Run contract", "Base weights · tokenizer · dataset snapshot and mixture · objective · optimizer and scheduler · precision · parallel topology · environment · stop rule · evaluation version"],
        ["Valid training progress", "Compute · communication · I/O · failure · recovery"],
        ["Release gate", "Unseen tasks · critical slices · safety · capability retention · resources · uncertainty"],
      ],
      englishBoundary: /Completing optimization only creates a candidate artifact; serving, shadow traffic, and continuing monitoring remain separate gates\. Training-set results and public benchmarks cannot replace the customer(?:'|&#x27;)s Go\/No-Go gate\./,
    },
    {
      slug: "data-engineering",
      zhTitleId: "data-engineering-title",
      enTitleId: "data-engineering-english-title",
      zhPrimerId: "data-engineering-extension-primer-title",
      enPrimerId: "data-engineering-english-primer-title",
      zhMechanism: /data-knowledge-view="ai-data-lineage"/,
      enMechanism: /data-knowledge-view="ai-data-lineage"/,
    },
    {
      slug: "ai-infra-compute",
      zhTitleId: "ai-infra-compute-title",
      enTitleId: "ai-infra-compute-english-title",
      zhPrimerId: "ai-infra-compute-extension-primer-title",
      enPrimerId: "ai-infra-compute-english-primer-title",
      zhMechanism: /data-knowledge-view="compute-bottleneck-path"/,
      enMechanism: /data-knowledge-view="compute-bottleneck-path"/,
      requiredChineseQaTags: ["采购方法", "异构可移植"],
      requiredEnglishIds: ["curriculum-workload-first", "compute-foundation-boundary", "bottleneck-communication", "proof-failure-recovery", "evidence-complete-gpu-runtime", "qa-procurement-beyond-gpu", "qa-heterogeneous-supply-risk"],
      requiredEnglishFacts: [
        ["Sizing inputs", "Model version · precision · sequence or data · batch · parallelism · concurrency · SLO · recovery"],
        ["Complete path", "Compute · HBM · scale-up · scale-out · storage · power · cooling"],
        ["Acceptance profile", "Cold start · steady state · peak · soak · scaling · failure · recovery"],
        ["Economic unit", "Full cost per result that meets quality and SLO criteria"],
      ],
      englishBoundary: /Peak specifications are screening data\.[\s\S]*Resource-level TCO is not project ROI[\s\S]*cannot establish durable capacity\./,
    },
    {
      slug: "ai-infra-platform",
      zhTitleId: "ai-infra-platform-title",
      enTitleId: "ai-infra-platform-english-title",
      zhPrimerId: "ai-infra-platform-extension-primer-title",
      enPrimerId: "ai-infra-platform-english-primer-title",
      zhMechanism: /data-knowledge-view="scheduler-control-plane"/,
      enMechanism: /data-knowledge-view="scheduler-control-plane"/,
      requiredChineseQaTags: ["建设起点", "可移植性"],
      requiredEnglishIds: ["curriculum-serving-platform", "platform-component-boundary", "queue-startup-path", "upgrade-executable-rollback", "evidence-image-not-migration", "qa-quota-not-isolation", "qa-containerized-not-fully-portable"],
      requiredEnglishFacts: [
        ["Workload contract", "User × identity × device × topology × data × runtime × deadline × recovery"],
        ["Scheduling path", "Admission → queueing → placement → preparation → execution → recovery"],
        ["Tenant validation", "Control plane · identity/data/network · performance/resources · cost allocation/accountability"],
        ["Ownership boundary", "Platform Goodput and resource economics · application quality and ROI stay with application and business owners"],
      ],
      englishBoundary: /The platform owns resource, job, and service-runtime lifecycles[\s\S]*Kubernetes, GPU Operator[\s\S]*not proof of a complete platform\./,
    },
  ];

  for (const moduleCase of cases) {
    const [zhHtml, enHtml] = await Promise.all([
      renderHtml(`/modules/${moduleCase.slug}`),
      renderHtml(`/en/modules/${moduleCase.slug}`),
    ]);
    const englishModule = englishModuleRegistry[moduleCase.slug];
    assert.ok(englishModule, `${moduleCase.slug} must have an English module`);

    for (const [locale, html] of [["zh", zhHtml], ["en", enHtml]]) {
      assert.match(html, /data-module-hero="unified"/, `${locale} ${moduleCase.slug} is missing the shared Hero`);
      assert.match(html, /data-module-reader="unified"/, `${locale} ${moduleCase.slug} is missing the shared reader`);
      assert.equal((html.match(/id="main-content"/g) ?? []).length, 1, `${locale} ${moduleCase.slug} must keep exactly one main-content target`);
      serverRenderedReadingPanels(html, `${locale} ${moduleCase.slug}`);
      assert.doesNotMatch(html, /class="topbar"/, `${locale} ${moduleCase.slug} must not keep the legacy topbar`);
    }

    assert.match(zhHtml, new RegExp(`id="${moduleCase.zhTitleId}"`));
    assert.match(enHtml, new RegExp(`id="${moduleCase.enTitleId}"`));
    assert.match(zhHtml, new RegExp(`id="${moduleCase.zhPrimerId}"`));
    assert.match(enHtml, new RegExp(`id="${moduleCase.enPrimerId}"`));
    assert.match(zhHtml, moduleCase.zhMechanism);
    assert.match(enHtml, moduleCase.enMechanism);
    for (const [label, value] of moduleCase.requiredEnglishFacts ?? []) {
      assert.match(enHtml, new RegExp(`<dt>${escapeRegExp(label)}</dt><dd>${escapeRegExp(value)}</dd>`));
    }
    if (moduleCase.englishBoundary) assert.match(enHtml, moduleCase.englishBoundary);
    assert.match(zhHtml, new RegExp(`href="/references#module-${moduleCase.slug}"`));
    assert.match(enHtml, new RegExp(`href="/en/references\\?module=${moduleCase.slug}"`));
    const chineseModule = requireModuleContent(moduleCase.slug);
    assert.equal((zhHtml.match(/id="qa-\d+"/g) ?? []).length, chineseModule.qa.length, `${moduleCase.slug} Chinese QA must project completely`);
    assert.equal((enHtml.match(/class="qaItem"/g) ?? []).length, englishModule.qa.length);
    assert.equal((enHtml.match(/<article class="metricCard[^"]*" id="evidence-[^"]+"/g) ?? []).length, englishModule.evidenceCards.length);
    for (const id of moduleCase.requiredChineseIds ?? []) {
      assert.equal((zhHtml.match(new RegExp(`id="${id}"`, "g")) ?? []).length, 1, `${moduleCase.slug} must preserve Chinese #${id}`);
    }
    for (const tag of moduleCase.requiredChineseQaTags ?? []) {
      assert.ok((zhHtml.match(new RegExp(`data-qa-tag="${escapeRegExp(tag)}"`, "g")) ?? []).length > 0, `${moduleCase.slug} must preserve the Chinese QA tagged ${tag}`);
    }
    const englishTables = enHtml.match(/class="tableWrap" role="region" aria-label="[^"]+" tabindex="0"/g) ?? [];
    const englishCaptions = enHtml.match(/<caption class="srOnly">/g) ?? [];
    assert.equal(englishCaptions.length, englishTables.length, `${moduleCase.slug} every wide English table must have an accessible name`);
    for (const id of moduleCase.requiredEnglishIds ?? []) {
      assert.equal((enHtml.match(new RegExp(`id="${id}"`, "g")) ?? []).length, 1, `${moduleCase.slug} must preserve #${id}`);
    }
    for (const question of englishModule.qa) {
      assert.match(enHtml, new RegExp(`id="qa-${escapeRegExp(question.id)}"`), `${moduleCase.slug} must preserve ${question.id}`);
    }
    for (const id of [...buildEnglishSectionGroups(englishModule).map((/** @type {any} */ group) => group.id), "evidence", "qa", "related-modules"]) {
      assert.match(enHtml, new RegExp(`<section aria-labelledby="${id}-section-title"[^>]*id="${id}"`), `${moduleCase.slug} #${id} must own an accessible heading`);
      assert.equal((enHtml.match(new RegExp(`id="${id}-section-title"`, "g")) ?? []).length, 1, `${moduleCase.slug} #${id} heading ID must be unique`);
    }
    const englishIds = [...enHtml.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(englishIds).size, englishIds.length, `${moduleCase.slug} English reader must not duplicate DOM IDs`);
    if (moduleCase.slug === "solution-patterns") {
      assert.equal((zhHtml.match(/aria-label="[^"]+" data-importance="critical"/g) ?? []).length, 1, "Solution Patterns must expose one critical-boundary owner");
      assert.match(zhHtml, /class="primerAtlasTable" role="table" aria-label="[^"]+"/, "Solution Patterns scenario table must have its own accessible name");
    }
    if (moduleCase.slug === "fine-tuning") {
      assert.match(
        zhHtml,
        /<div class="tuningMethodMatrix"(?=[^>]*role="table")(?=[^>]*aria-label="[^"]+")(?=[^>]*tabindex="0")[^>]*>/,
        "Fine-tuning parameter-update matrix must be a named, keyboard-scrollable table region",
      );
    }
  }
});

test("AI Agent and MCP preserve complete authored packs in the unified English reader", async () => {
  const cases = [
    {
      slug: "ai-agent",
      zhPath: "/modules/ai-agent",
      enPrimerId: "ai-agent-english-primer-title",
      newQuestionIds: ["blocked-task-safe-exit", "agent-owned-logs-not-ground-truth", "cancel-does-not-undo"],
      newEvidenceId: "impossible-task-control-failure",
    },
    {
      slug: "mcp",
      zhPath: "/modules/mcp",
      enPrimerId: "mcp-english-primer-title",
      newQuestionIds: ["stateless-mrtr-input"],
      newEvidenceId: "mcp-mrtr-stateless-input",
    },
  ];

  for (const moduleCase of cases) {
    const [zhHtml, enHtml] = await Promise.all([
      renderHtml(moduleCase.zhPath),
      renderHtml(`/en/modules/${moduleCase.slug}`),
    ]);
    for (const [locale, html] of [["zh", zhHtml], ["en", enHtml]]) {
      assert.match(html, /data-module-hero="unified"/, `${locale} ${moduleCase.slug} is missing the shared Hero`);
      assert.match(html, /data-module-reader="unified"/, `${locale} ${moduleCase.slug} is missing the shared reader`);
      assert.equal((html.match(/id="main-content"/g) ?? []).length, 1, `${locale} ${moduleCase.slug} must keep exactly one main-content target`);
      serverRenderedReadingPanels(html, `${locale} ${moduleCase.slug}`);
      assert.doesNotMatch(html, /class="topbar"/, `${locale} ${moduleCase.slug} must not keep the legacy topbar`);
    }
    assert.match(enHtml, new RegExp(`id="${moduleCase.enPrimerId}"`));
    const englishModule = englishModuleRegistry[moduleCase.slug];
    assert.ok(englishModule, `${moduleCase.slug} must have an English module`);
    for (const id of [...buildEnglishSectionGroups(englishModule).map((/** @type {any} */ group) => group.id), "evidence", "qa", "related-modules"]) {
      assert.equal((enHtml.match(new RegExp(`id="${id}"`, "g")) ?? []).length, 1, `${moduleCase.slug} must fully preserve #${id}`);
    }
    assert.equal((enHtml.match(/<article class="metricCard[^"]*" id="evidence-[^"]+"/g) ?? []).length, englishModule.evidenceCards.length);
    assert.equal((enHtml.match(/class="qaItem"/g) ?? []).length, englishModule.qa.length);
    for (const id of moduleCase.newQuestionIds) {
      assert.equal((enHtml.match(new RegExp(`id="qa-${id}"`, "g")) ?? []).length, 1, `${moduleCase.slug} must preserve #qa-${id}`);
    }
    assert.equal((enHtml.match(new RegExp(`id="evidence-${moduleCase.newEvidenceId}"`, "g")) ?? []).length, 1, `${moduleCase.slug} must preserve #evidence-${moduleCase.newEvidenceId}`);
    assert.equal((enHtml.match(/Added on (?:<!-- -->)?2026-09-04/g) ?? []).length, moduleCase.newQuestionIds.length, `${moduleCase.slug} must render every new-question date`);
    const englishTables = enHtml.match(/class="tableWrap" role="region" aria-label="[^"]+" tabindex="0"/g) ?? [];
    const englishCaptions = enHtml.match(/<caption class="srOnly">/g) ?? [];
    assert.equal(englishCaptions.length, englishTables.length, `${moduleCase.slug} every wide English table must have an accessible name`);
  }
});

test("A2A preserves its complete English pack and accessible Chinese comparison tables", async () => {
  const [zhHtml, enHtml] = await Promise.all([
    renderHtml("/modules/a2a"),
    renderHtml("/en/modules/a2a"),
  ]);
  for (const [locale, html] of [["zh", zhHtml], ["en", enHtml]]) {
    assert.match(html, /data-module-hero="unified"/, `${locale} A2A is missing the shared Hero`);
    assert.match(html, /data-module-reader="unified"/, `${locale} A2A is missing the shared reader`);
    assert.equal((html.match(/id="main-content"/g) ?? []).length, 1, `${locale} A2A must keep exactly one main-content target`);
    serverRenderedReadingPanels(html, `${locale} A2A`);
    assert.doesNotMatch(html, /class="topbar"/, `${locale} A2A must not keep the legacy topbar`);
  }
  for (const id of ["a2a-collaboration-model", "a2a-practice", "a2a-curriculum", "a2a-decisions", "a2a-task-lifecycle", "a2a-cloud", "task-terminal-state", "evidence-card-task-artifact", "qa-a2a-one-point-zero-acceptance"]) {
    assert.equal((enHtml.match(new RegExp(`id="${id}"`, "g")) ?? []).length, 1, `A2A must preserve #${id}`);
  }
  const chineseA2A = requireModuleContent("a2a");
  const englishA2A = englishModuleRegistry.a2a;
  assert.equal((zhHtml.match(/id="qa-\d+"/g) ?? []).length, chineseA2A.qa.length);
  assert.equal((enHtml.match(/class="qaItem"/g) ?? []).length, englishA2A.qa.length);
  assert.equal((enHtml.match(/<article class="metricCard[^"]*" id="evidence-[^"]+"/g) ?? []).length, englishA2A.evidenceCards.length);
  for (const id of ["a2a-identifier-lineage", "send-message-unknown-outcome", "extension-versus-extended-card"]) {
    assert.equal((enHtml.match(new RegExp(`id="qa-${id}"`, "g")) ?? []).length, 1, `A2A must preserve #qa-${id}`);
  }
  assert.equal((enHtml.match(/id="evidence-message-id-not-exactly-once"/g) ?? []).length, 1, "A2A must preserve #evidence-message-id-not-exactly-once");
  assert.equal((enHtml.match(/Added on (?:<!-- -->)?2026-09-04/g) ?? []).length, 3, "A2A must render every new-question date");
  const a2aTables = zhHtml.match(/role="region" tabindex="0" aria-label="[^"]+"/g) ?? [];
  const a2aCaptions = zhHtml.match(/<caption class="srOnly">[^<]+<\/caption>/g) ?? [];
  assert.ok(a2aTables.length > 0, "A2A must keep at least one scrollable, named relation matrix");
  assert.equal(a2aCaptions.length, a2aTables.length, "every A2A relation matrix must have a hidden caption");
  const englishIds = [...enHtml.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(englishIds).size, englishIds.length, "A2A English reader must not duplicate DOM IDs");
});

test("inference reader preserves its interactive system view inside the unified bilingual shell", async () => {
  const [html, enHtml, studioSource, pageSource, studioStyles] = await Promise.all([
    renderHtml("/modules/llm-inference"),
    renderHtml("/en/modules/llm-inference"),
    readFile(new URL("../app/inference-studio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/inference-module-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/inference-studio.css", import.meta.url), "utf8"),
  ]);
  for (const [locale, rendered] of [["zh", html], ["en", enHtml]]) {
    assert.equal((rendered.match(/data-module-hero="unified"/g) ?? []).length, 1, `${locale} inference must render one unified Hero`);
    assert.equal((rendered.match(/data-module-reader="unified"/g) ?? []).length, 1, `${locale} inference must render one unified reader`);
    assert.equal((rendered.match(/id="main-content"/g) ?? []).length, 1, `${locale} inference must render one main-content target`);
    assert.equal((rendered.match(/id="top"/g) ?? []).length, 1, `${locale} inference must preserve one #top target`);
    serverRenderedReadingPanels(rendered, `${locale} inference`);
    assert.doesNotMatch(rendered, /inferenceTopbar|inferenceChapterRail|class="topbar"/, `${locale} inference must not retain the legacy shell`);
    const ids = [...rendered.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${locale} inference must not duplicate DOM IDs`);
  }
  assert.match(html, /id="llm-inference-title"/);
  assert.match(enHtml, /id="llm-inference-english-title"/);
  assert.match(enHtml, /id="llm-inference-english-primer-title"/);
  assert.equal((html.match(/role="gridcell"/g) ?? []).length, 56, "the inference heatmap must cover 7 input lengths × 8 concurrency steps");
  assert.equal((html.match(/<button[^>]*aria-selected="true"[^>]*role="gridcell"/g) ?? []).length, 1, "the server first paint must keep exactly one selected heatmap cell");
  assert.match(html, /data-memory-gb="18\.0"/, "low-load memory estimates must not fall below the sample BF16 baseline");
  assert.match(html, /ms\/token/);
  assert.match(studioStyles, /@media \(max-width: 760px\) \{[\s\S]*?\.metricInspector > section \{ padding: 12px 0 0; \}[\s\S]*?\.metricInspector > \.capacityLink \{ display: flex; \}[\s\S]*?\.metricInspector > footer \{ display: grid; \}/, "narrow screens must not drop the inference metrics, capacity link, or sources");
  assert.doesNotMatch(studioStyles, /@media \(max-width: 760px\) \{[\s\S]*?\.metricInspector > section,[\s\S]*?display: none;/, "narrow screens must not hide the metric-inspector semantics with display:none");
  assert.match(html, /<dt>TTFT<\/dt><dd>1\.20<!-- --> s<\/dd>/);
  assert.match(html, /<dd>849<!-- --> token\/s[\s\S]*?997<\/small>/);
  assert.match(html, /≈/, "capacity estimates must mark their approximate nature instead of posing as load-test readings");
  assert.equal((html.match(/trendCurrentPoint trendCurrentPoint--/g) ?? []).length, 3, "the three current capacity points must sit on the TTFT, TPOT, and throughput curves");
  assert.match(html, /class="inferenceMetricStrip" role="group" aria-label="[^"]+"/);
  const metricStripHtml = html.match(/<div class="inferenceMetricStrip"[\s\S]*?<\/div>/)?.[0] ?? "";
  assert.equal((metricStripHtml.match(/aria-pressed="(?:true|false)"/g) ?? []).length, 6, "all six inference metrics must keep an accessible selected state");
  for (const metric of ["input", "concurrency", "ttft", "tpot", "goodput", "oom"]) {
    assert.equal((html.match(new RegExp(`id="metric-${metric}"`, "g")) ?? []).length, 1, `the inference page must keep a unique #metric-${metric} deep link`);
  }
  assert.match(studioSource, /window\.history\.pushState\(window\.history\.state/);
  assert.match(studioSource, /window\.dispatchEvent\(new HashChangeEvent\("hashchange"\)\)/);
  assert.match(studioSource, /setActiveMetric\(metric \?\? "input"\)/, "Back to a non-metric hash must restore the default metric");
  assert.match(pageSource, /definition: brief\.definition/);
  assert.match(pageSource, /position: brief\.position/);
  const inferenceCurriculum = requireModuleCurriculum("llm-inference");
  const inferenceTopicIds = inferenceCurriculum.chapters.map((/** @type {any} */ topic) => `inference-topic-${topic.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "untitled"}`);
  for (const topicId of inferenceTopicIds) {
    assert.equal((html.match(new RegExp(`id="${escapeRegExp(topicId)}"`, "g")) ?? []).length, 1, `inference topic must keep its semantic anchor: ${topicId}`);
  }
  const inferenceLearnPanel = readingPanelHtml(html, "learn", "inference");
  assert.equal((inferenceLearnPanel.match(/class="chapterMechanism"/g) ?? []).length, inferenceCurriculum.chapters.length, "every inference topic must render its mechanism on first paint");
  assert.equal((inferenceLearnPanel.match(/class="chapterMechanism"[\s\S]*?<\/div><dl>/g) ?? []).length, inferenceCurriculum.chapters.length, "every inference topic must explain the decision it changes");
  assert.match(studioSource, /function TopicSemantics/);
  assert.doesNotMatch(studioSource, /learningRoute\.slice\(0, 3\)/);
  assert.doesNotMatch(studioSource, /chapterIds/);
  const chineseInference = requireModuleContent("llm-inference");
  const englishInference = englishModuleRegistry["llm-inference"];
  assert.equal((html.match(/id="qa-\d+"/g) ?? []).length, chineseInference.qa.length, "Chinese inference QA must project completely");
  assert.equal((html.match(/<article class="metricCard[^"]*"/g) ?? []).length, chineseInference.evidenceCards.length, "Chinese inference evidence cards must project completely");
  assert.equal((enHtml.match(/class="qaItem"/g) ?? []).length, englishInference.qa.length, "English inference QA must project completely");
  assert.equal((enHtml.match(/<article class="metricCard[^"]*" id="evidence-[^"]+"/g) ?? []).length, englishInference.evidenceCards.length, "English inference evidence cards must project completely");
  const inferenceTables = enHtml.match(/class="tableWrap" role="region" aria-label="[^"]+" tabindex="0"/g) ?? [];
  const inferenceCaptions = enHtml.match(/<caption class="srOnly">/g) ?? [];
  assert.equal(inferenceCaptions.length, inferenceTables.length, "every wide English inference table must be nameable, focusable, and scrollable");
  for (const id of ["principle", "study-guide", "curriculum", "principles", "decisions", "deep-dive", "evidence", "cloud", "qa", "related-modules", "inference-engine-boundary", "qa-maximum-context-admission", "evidence-kv-cache-serving-capacity"]) {
    assert.equal((enHtml.match(new RegExp(`id="${id}"`, "g")) ?? []).length, 1, `the English inference page must fully preserve #${id}`);
  }
  assert.match(html, /class="capacityTeachingLabel"/);
  assert.match(html, /id="capacity-run-pack-title"/);
  assert.match(html, /该互动图仅用于解释变量关系，不构成容量承诺或压测结论/);
  assert.match(html, /id="oom-case-title"/);
  assert.match(html, /id="mechanism-index"/);
  assert.match(html, /id="decision-guide"/);
  assert.equal((html.match(/aria-label="[^"]+" data-importance="critical"/g) ?? []).length, 2, "the inference page must keep one global and one field boundary");
  const inferenceViewIntro = /** @type {any} */ (moduleExtensionViews["llm-inference"]).intro.split("；")[1];
  assert.match(html, new RegExp(renderTextPattern(inferenceViewIntro)));
  assert.match(html, /href="\/en\/modules\/llm-inference" hrefLang="en" lang="en"/);
  assert.doesNotMatch(html, /真实案例/);
});

test("remaining modules complete their own knowledge views, learning expansions, and customer decisions", async () => {
  const remainingSlugs = Object.keys(moduleExtensionViews);
  assert.ok(remainingSlugs.length > 0, "generic knowledge views must be registered when a module needs one");
  assert.equal(new Set(Object.values(moduleExtensionViews).map((view) => view.id)).size, remainingSlugs.length, "remaining-module knowledge-view IDs must not be reused");

  for (const slug of remainingSlugs) {
    const view = moduleExtensionViews[slug];
    const html = await renderHtml(`/modules/${slug}`);
    assert.match(html, new RegExp(`data-knowledge-view="${escapeRegExp(view.id)}"`));
    const publication = publishedModuleRegistry.find((module) => module.slug === slug);
    if (publication?.readingProfile === "focused") {
      assert.match(html, /class="[^"]*\bfocusedNarrative\b[^"]*"/);
      assert.match(html, /class="focusedDecisionLedger"/);
    } else {
      const chineseView = getModuleExtensionView(slug) ?? view;
      assert.match(html, new RegExp(escapeRegExp(chineseView.title)));
      assert.match(html, /data-knowledge-explorer="interactive"/);
      assert.match(html, new RegExp(`moduleKnowledgeExplorer--${escapeRegExp(view.layout)}`));
      assert.doesNotMatch(html, /class="extensionPrimerMap"/);
      assert.doesNotMatch(html, /class="extensionPrimerChecks"/);
    }
  }

  // 完成内容已回填进静态课程/学习/注册表：不再依赖已删除的 module-completion-content.mjs，
  // 改为按稳定标题/问题逐条核对回填结果仍在合并内容中（语义与原合并断言等价）。
  // 中文值即注册表审计基线本身（与内容快照哈希一致），按类别压成单行以控制测试文件中文行数。
  const completionMarkers = {
    curriculum: { "model-landscape": ["退出演练与供应连续性"], multimodal: ["长视频的候选检索与时序证据"], mcp: ["错误、进度与可观测"], a2a: ["幂等、取消与恢复", "采用边界与迁移"], evaluation: ["评估契约与可重放结果", "重复试验、不确定性与硬门"], "ai-gateway": ["策略变更与证据化发布"], "ai-ops": ["遥测数据与隐私", "从告警到确认业务恢复"], "llm-training": ["实验谱系与可复现制品"], "llm-inference": ["版本发布与请求连续性"], "data-engineering": ["为不同用途准备数据制品"], "ai-infra-platform": ["Goodput、资源成本与业务 ROI"], "ai-infra-compute": ["端到端基准与交付验收"] },
    learningRoute: { "model-landscape": ["把选择变成可回退、可退出的发布证据"], multimodal: [], mcp: ["验证错误与恢复", "建立目录与下线责任"], a2a: ["补齐恢复与取消", "验证采用收益"], evaluation: [], "ai-gateway": ["把策略当作发布资产", "演练网关自身故障"], "ai-ops": [], "llm-training": [], "llm-inference": ["拆开时间账与显存账", "把优化作为版本发布"], "data-engineering": [], "ai-infra-platform": ["设计训练和推理的共享边界"], "ai-infra-compute": [] },
    learningLabs: { "model-landscape": ["验证一次受控模型路由"], multimodal: ["处理一份跨模态证据冲突工单"], mcp: ["评审一个企业 MCP Server"], a2a: ["验收一次外部 Agent 的版本变更"], evaluation: ["校准评分器并裁决分歧样本"], "ai-gateway": ["排查一次网关放大故障"], "ai-ops": ["编写 AI 事故运行手册"], "llm-training": ["复盘一次长训练中断"], "llm-inference": ["诊断一次首字延迟退化"], "data-engineering": ["排查一次知识更新未生效"], "ai-infra-platform": ["设计训练与在线推理混部策略"], "ai-infra-compute": ["验证一条算力瓶颈假设"] },
    qa: { "model-landscape": ["公开 Benchmark 应该怎样用于模型候选初筛，而不是直接选出赢家？", "怎样为模型停服或不可用准备替代方案？"], multimodal: ["文档 OCR 字符准确率很高，为什么表格问答仍可能错误？"], mcp: ["MCP 工具返回成功，为什么业务动作仍可能失败？", "企业应该允许客户端自动安装任意 MCP Server 吗？"], a2a: ["A2A 的取消请求，是否保证远端任务已经停止？", "多 Agent 架构应该由一个编排者控制，还是允许点对点协作？"], evaluation: ["评估集版本升级时，怎样接纳线上失败又保护盲留出集？"], "ai-gateway": ["AI 网关的策略应该怎样安全上线？", "模型提供方故障时，AI 网关应该自动切到任意可用模型吗？"], "ai-ops": ["AI 事故恢复后，为什么还要核对业务系统状态？", "观测数据保留越多，是否越容易排查 AI 问题？"], "llm-training": ["训练恢复后 Loss 连续，为什么还不能证明状态正确？"], "llm-inference": ["模型权重能装进显存，为什么并发一上来仍会 OOM？", "量化后吞吐提高，为什么仍可能不值得上线？"], "data-engineering": ["同一份数据能否同时用于 RAG、评估和训练？"], "ai-infra-platform": ["GPU 利用率很高，为什么训练和推理产出仍可能很差？", "训练和在线推理可以长期混在同一个 GPU 资源池吗？"], "ai-infra-compute": ["为什么不能直接用峰值 FLOPS 比较 AI 加速器？", "多加一倍 GPU，为什么训练速度没有接近翻倍？"] },
  };

  for (const [slug, titles] of Object.entries(completionMarkers.curriculum)) {
    const curriculum = requireModuleCurriculum(slug);
    const chapterTitles = curriculum.chapters.map((/** @type {any} */ chapter) => chapter.title);
    for (const title of titles) assert.ok(chapterTitles.includes(title), `${slug} curriculum is missing the completed chapter: ${title}`);
  }
  for (const [slug, titles] of Object.entries(completionMarkers.learningRoute)) {
    const learning = requireModuleLearning(slug);
    const stepTitles = learning.route.map((/** @type {any} */ step) => step.title);
    for (const title of titles) assert.ok(stepTitles.includes(title), `${slug} learning route is missing the completed step: ${title}`);
  }
  for (const [slug, titles] of Object.entries(completionMarkers.learningLabs)) {
    const learning = requireModuleLearning(slug);
    const labTitles = learning.labs.map((/** @type {any} */ lab) => lab.title);
    for (const title of titles) assert.ok(labTitles.includes(title), `${slug} labs are missing the completed lab: ${title}`);
  }
  for (const [slug, questions] of Object.entries(completionMarkers.qa)) {
    const content = requireModuleContent(slug);
    const qaQuestions = content.qa.map((/** @type {any} */ item) => item.q);
    for (const question of questions) assert.ok(qaQuestions.includes(question), `${slug} QA is missing the completed question: ${question}`);
  }
});

test("registered core knowledge views render as web-native visuals without making them a module quota", async () => {
  const specializedVisuals = new Map([
    ["solution-patterns", "solutionDecisionLoop"],
    ["rag", "ragDualChainExplorer"],
    ["ai-agent", "agentAuthorityExplorer"],
    ["mcp", "mcpArchitectureExplorer"],
    ["security", "securityBarrierExplorer"],
    ["llm", "llmGenerationExplorer"],
    ["fine-tuning", "tuningRouteExplorer"],
    ["llm-inference", "inferenceExplorer"],
  ]);

  const modulesWithCoreViews = publishedModuleRegistry.filter((module) => module.knowledgeView);
  assert.ok(modulesWithCoreViews.length > 0);
  for (const { slug } of modulesWithCoreViews) {
    const html = await renderHtml(`/modules/${slug}`);
    const specializedClass = specializedVisuals.get(slug);
    if (specializedClass) {
      assert.match(html, new RegExp(`class="${specializedClass}`), `${slug} is missing its dedicated web-native visual`);
    } else {
      assert.match(html, /class="moduleKnowledgeExplorer /, `${slug} is missing the relation-driven interactive visual`);
      assert.match(html, /data-knowledge-explorer="interactive"/);
    }
  }
});

test("content representation is assessed per relationship without a visual-count quota", async () => {
  assert.deepEqual(Object.keys(moduleRepresentationAssessment), publishedModuleSlugs);
  /** @type {Record<string, string>} */
  const dedicatedDeepDiveRenderers = {
    mcp: "mcpArchitectureExplorer",
  };

  for (const slug of publishedModuleSlugs) {
    const content = requireModuleContent(slug);
    const assessment = moduleRepresentationAssessment[slug];
    assert.equal(assessment.deepDives.length, content.deepDives.length, `${slug} deep dives have not completed the representation audit`);
    assert.deepEqual(assessment.deepDives.map((item) => item.title), content.deepDives.map((block) => block.title));

    const html = await renderHtml(`/modules/${slug}`);
    const visualCount = (html.match(/data-adaptive-visual="(?:sequence|diagnostic|matrix|scenario)"/g) ?? []).length;
    const checklistCount = (html.match(/data-adaptive-prose="checklist"/g) ?? []).length;
    const dedicatedRenderer = dedicatedDeepDiveRenderers[slug];
    if (dedicatedRenderer) {
      assert.match(html, new RegExp(`class="${dedicatedRenderer}"`), `${slug} must keep its dedicated relation view`);
      assert.match(html, /data-quality-section="deep-dive"/, `${slug} dedicated relation view must keep the deep-dive entry`);
      for (const deepDive of assessment.deepDives) {
        assert.match(html, new RegExp(renderTextPattern(deepDive.title)), `${slug} dedicated relation view is missing: ${deepDive.title}`);
      }
    } else {
      assert.equal(visualCount, assessment.visualDeepDiveCount, `${slug} generic deep-dive visuals must match the relation audit`);
    }
    assert.equal(checklistCount, content.deepDives.filter((block) => block.kind === "checklist").length, `${slug} checklists must stay checklists instead of pseudo-visuals`);
  }
});

test("course maps use progressive reading instead of another wall of equal cards", async () => {
  const curriculumModules = publishedModuleRegistry.filter((module) => module.routeKind === "brief" && module.readingProfile !== "focused");
  for (const publication of curriculumModules) {
    const html = await renderHtml(publication.path);
    const curriculum = requireModuleCurriculum(publication.slug);
    assert.match(html, /data-curriculum-representation="progressive-outline"/);
    assert.equal((html.match(/class="curriculumChapter"/g) ?? []).length, curriculum.chapters.length);
    assert.doesNotMatch(html, /curriculumChapterGrid/);
  }
});

test("customer questions resolve to a registered intent instead of a shared numeric template", async () => {
  // 深度问题集已回填进 moduleContentRegistry（由内容快照哈希固定）。qaCoverageTags
  // 覆盖表已退役：tag 保留为自由标签，改为核对每道题都解析出受控的 intentId。
  const intentIds = new Set(intentDefinitions.map((intent) => intent.id));
  for (const publishedModule of publishedModuleRegistry) {
    const content = requireModuleContent(publishedModule.slug);
    for (const item of content.qa) {
      assert.ok(item.tag?.trim(), `${publishedModule.slug} question must keep a free tag label`);
    }
  }
  assert.ok(questionDirectoryItems.length > 0);
  for (const item of questionDirectoryItems) {
    assert.ok(item.intentId && intentIds.has(item.intentId), `${item.key} resolves to an unknown intent: ${item.intentId}`);
  }
});

test("question directory searches every published question from one canonical index", async () => {
  const html = await renderHtml("/questions");
  const registeredCount = Object.values(moduleContentRegistry).reduce((total, content) => total + content.qa.length, 0);
  const moduleHtmlById = new Map();

  assert.equal(questionDirectoryModules.length, publishedModuleRegistry.length);
  assert.equal(questionDirectoryItems.length, registeredCount);
  assert.equal(new Set(questionDirectoryItems.map((item) => item.key)).size, questionDirectoryItems.length, "question directory keys must be unique");
  assert.equal((html.match(/data-question-key="[^"]+"/g) ?? []).length, questionDirectoryItems.length, "the question directory must server-render every formal question");
  assert.match(html, new RegExp(`全部 ${publishedModuleRegistry.length} 个模块`));
  assert.match(html, /<input[^>]*placeholder="[^"]+"/);

  for (const directoryModule of questionDirectoryModules) {
    assert.equal(directoryModule.count, moduleContentRegistry[directoryModule.id].qa.length, `${directoryModule.id} question counts must come from the formal content registry`);
    assert.match(html, new RegExp(`value="${escapeRegExp(directoryModule.id)}"`));
    assert.match(html, new RegExp(`href="${escapeRegExp(directoryModule.href)}"`));
  }

  for (const item of questionDirectoryItems) {
    const sourceQuestion = moduleContentRegistry[item.moduleId].qa[item.number - 1];
    let moduleHtml = moduleHtmlById.get(item.moduleId);
    if (!moduleHtml) {
      moduleHtml = await renderHtml(item.moduleHref);
      moduleHtmlById.set(item.moduleId, moduleHtml);
    }
    assert.equal(item.question, sourceQuestion.q, `${item.key} diverges from the formal question content`);
    assert.match(html, new RegExp(`id="question-${escapeRegExp(item.key)}"`));
    assert.match(html, new RegExp(`href="${escapeRegExp(item.originalHref)}"`));
    assert.match(moduleHtml, new RegExp(`id="qa-${item.number}"`), `${item.originalHref} must point at the real question anchor on the module page`);
    assert.match(html, new RegExp(escapeRegExp(escapeHtmlText(item.question))));
  }
});

test("English question directory links every published question to its visible module anchor", async () => {
  const html = await renderHtml("/en/questions");
  const scopedHtml = await renderHtml("/en/questions?module=solution-patterns");
  const llmScopedHtml = await renderHtml("/en/questions?module=llm");
  const invalidScopeHtml = await renderHtml("/en/questions?module=not-a-module");

  for (const englishModule of Object.values(englishModuleRegistry)) {
    const exactIds = new Set(englishModule.qa.map((item) => item.id));
    assert.deepEqual(exactIds, new Set(englishModule.qa.map((item) => item.id)), `${englishModule.slug} search must include every question`);
    for (const item of englishQuestions.filter((question) => question.moduleSlug === englishModule.slug)) {
      assert.ok(exactIds.has(item.id), `${englishModule.slug}:${item.id} must remain searchable`);
      assert.match(html, new RegExp(`href="/en/modules/${escapeRegExp(englishModule.slug)}#qa-${escapeRegExp(item.id)}"`));
    }
  }
  assert.match(html, /each with a concise answer/);
  assert.equal((scopedHtml.match(/class="questionDirectoryItem"/g) ?? []).length, englishModuleRegistry["solution-patterns"].qa.length);
  assert.match(scopedHtml, new RegExp(`all ${englishModuleRegistry["solution-patterns"].qa.length} questions for Solution Patterns`));
  assert.match(scopedHtml, /id="question-solution-patterns-/);
  assert.doesNotMatch(scopedHtml, /id="question-rag-/);
  assert.equal((llmScopedHtml.match(/class="questionDirectoryItem"/g) ?? []).length, englishModuleRegistry.llm.qa.length);
  assert.match(llmScopedHtml, /id="question-llm-/);
  assert.doesNotMatch(llmScopedHtml, /id="question-llm-training-|id="question-llm-inference-/);
  assert.equal((invalidScopeHtml.match(/class="questionDirectoryItem"/g) ?? []).length, englishQuestions.length);
});

test("English RAG renders its complete dedicated reader and its source ledger can be scoped", async () => {
  const rag = englishModuleRegistry.rag;
  const sourceIds = referenceModules.find((module) => module.id === "rag")?.sourceIds;
  assert.ok(sourceIds, "RAG must have a canonical Reference group");
  const unrelatedSourceId = Object.keys(sourceLedger).find((sourceId) => !sourceIds.includes(sourceId));
  assert.ok(unrelatedSourceId, "RAG should not use every canonical source entry");
  const focusedSlugs = publishedModuleRegistry.filter((module) => module.readingProfile === "focused").map((module) => module.slug);
  const [ragHtml, scopedReferencesHtml, allReferencesHtml, invalidScopeHtml, ...focusedPages] = await Promise.all([
    renderHtml("/en/modules/rag"),
    renderHtml("/en/references?module=rag"),
    renderHtml("/en/references"),
    renderHtml("/en/references?module=not-a-module"),
    ...focusedSlugs.map((slug) => renderHtml(`/en/modules/${slug}`)),
  ]);

  const visibleGroups = selectVisibleEnglishSectionGroups(rag);
  const visibleEvidence = selectVisibleEnglishEvidenceCards(rag);
  const visibleQuestions = selectVisibleEnglishQuestions(rag);
  assert.match(ragHtml, /data-module-hero="unified"/);
  assert.match(ragHtml, /data-module-reader="unified"/);
  assert.match(ragHtml, /aria-label="Module navigation"/);
  assert.match(ragHtml, /aria-label="Reading modes"/);
  assert.match(ragHtml, />10-minute scan</);
  assert.match(ragHtml, />Systematic study</);
  assert.match(ragHtml, />Field lookup</);
  assert.match(ragHtml, /aria-label="Critical boundary"[^>]*data-importance="critical"/);
  serverRenderedReadingPanels(ragHtml, "English RAG");
  assert.equal((ragHtml.match(/id="main-content"/g) ?? []).length, 1, "English RAG must expose one shared skip target");
  assert.doesNotMatch(ragHtml, /class="topbar"/, "English RAG must not render the legacy module shell");
  assert.equal(visibleGroups.length, rag.sections.length);
  assert.equal(visibleEvidence.length, rag.evidenceCards.length);
  assert.equal(visibleQuestions.length, rag.qa.length);
  for (const group of visibleGroups) {
    const groupMatches = ragHtml.match(new RegExp(`id="${escapeRegExp(group.id)}"`, "g")) ?? [];
    assert.equal(groupMatches.length, 1, `RAG must render its ${group.id} section exactly once`);
  }
  for (const card of visibleEvidence) assert.match(ragHtml, new RegExp(`id="evidence-${escapeRegExp(card.id)}"`), `RAG must render its ${card.id} evidence card`);
  for (const question of visibleQuestions) assert.match(ragHtml, new RegExp(`id="qa-${escapeRegExp(question.id)}"`), `RAG must render its ${question.id} question`);
  const primerTarget = visibleGroups.find((/** @type {any} */ group) => /(?:production|deep)/.test(group.id))?.id ?? visibleGroups[0]?.id;
  assert.ok(primerTarget);
  assert.match(ragHtml, new RegExp(`href="#${escapeRegExp(primerTarget)}"`));
  assert.equal((ragHtml.match(/class="qaItem"/g) ?? []).length, rag.qa.length);

  for (const [index, slug] of focusedSlugs.entries()) {
    assert.match(focusedPages[index], new RegExp(`href="/en/references\\?module=${escapeRegExp(slug)}"`), `${slug} must link to its actual source ledger view`);
    assert.doesNotMatch(focusedPages[index], /\/en\/references#module-/, `${slug} must not link to a nonexistent source anchor`);
  }

  assert.match(scopedReferencesHtml, new RegExp(`Showing ${sourceIds.length} sources used by ${escapeRegExp(rag.title)}\\.`));
  assert.match(scopedReferencesHtml, /href="\/en\/references">Show all sources<\/a>/);
  assert.match(scopedReferencesHtml, /Open source ↗/);
  assert.match(scopedReferencesHtml, /target="_blank"/);
  assert.equal((scopedReferencesHtml.match(/class="questionDirectoryItem"/g) ?? []).length, sourceIds.length);
  for (const sourceId of sourceIds) assert.match(scopedReferencesHtml, new RegExp(`id="source-${escapeRegExp(sourceId)}"`));
  assert.doesNotMatch(scopedReferencesHtml, new RegExp(`id="source-${escapeRegExp(unrelatedSourceId)}"`));
  assert.equal((allReferencesHtml.match(/class="questionDirectoryItem"/g) ?? []).length, Object.keys(sourceLedger).length);
  assert.equal((invalidScopeHtml.match(/class="questionDirectoryItem"/g) ?? []).length, Object.keys(sourceLedger).length);
});

test("English Reference scopes preserve the canonical module-ledger source order", async () => {
  const pages = await Promise.all(referenceModules.map((module) => renderHtml(`/en/references?module=${module.id}`)));
  for (const [index, module] of referenceModules.entries()) {
    const renderedSourceIds = [...pages[index].matchAll(/<article class="questionDirectoryItem" id="source-([^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(renderedSourceIds, module.sourceIds, `${module.id} must render its complete canonical Reference group in order`);
  }
});

test("English LLM and predictive modules render their authored mechanism views", async () => {
  const [llmHtml, predictiveHtml] = await Promise.all([
    renderHtml("/en/modules/llm"),
    renderHtml("/en/modules/predictive-ai-mlops"),
  ]);
  assert.match(llmHtml, /data-knowledge-view="theory-atlas"/);
  assert.match(llmHtml, /visualPipelineCanvas/);
  assert.match(llmHtml, /Trace an application request from tokens to output/);
  assert.match(predictiveHtml, /data-knowledge-view="predictive-model-lifecycle"/);
  assert.match(predictiveHtml, /Build a time-correct, evidence-backed, recoverable decision system/);
});

test("English pages publish route-specific English sharing metadata", async () => {
  const site = "https://cloud-ai-presales-fieldbook.lijx.chatgpt.site";
  const cases = [
    ["/en", "/en", "/", "Cloud × AI Presales Fieldbook"],
    ["/en/questions", "/en/questions", "/questions", "Customer Questions"],
    ["/en/glossary", "/en/glossary", "/glossary", "Glossary"],
    ["/en/references", "/en/references", "/references", "References"],
    ["/en/knowledge-graph", "/en/knowledge-graph", "/knowledge-graph", "Dynamic Knowledge Explorer"],
    ["/en/coding-agents", "/en/coding-agents", "/coding-agents", "Coding Agent and Harness Radar"],
    ["/en/model-radar", "/en/model-radar", "/model-radar", "Model Capability Radar: Dated 20-Configuration Snapshot"],
    ["/en/modules/rag", "/en/modules/rag", "/modules/rag", englishModuleRegistry.rag.title],
    ["/en/modules/mcp", "/en/modules/mcp", "/modules/mcp", englishModuleRegistry.mcp.title],
  ];

  for (const [route, englishPath, chinesePath, title] of cases) {
    const html = await renderHtml(route);
    assert.match(html, /<html\b[^>]*\blang="en"/i, `${route} must emit an English document root on the server`);
    assert.doesNotMatch(html, /<html\b[^>]*\blang="zh-CN"/i, `${route} must not inherit the Chinese document language`);
    assert.match(html, new RegExp(`<meta property="og:title" content="${escapeRegExp(title)}"/>`), `${route} needs its own Open Graph title`);
    assert.match(html, new RegExp(`<meta name="twitter:title" content="${escapeRegExp(title)}"/>`), `${route} needs its own Twitter title`);
    assert.match(html, /<meta name="twitter:card" content="summary"\/>/i, `${route} needs an image-free English Twitter card`);
    assert.match(html, new RegExp(`<link rel="canonical" href="${escapeRegExp(`${site}${englishPath}`)}"/>`), `${route} needs its own canonical URL`);
    assert.match(html, new RegExp(`<link rel="alternate" hrefLang="en" href="${escapeRegExp(`${site}${englishPath}`)}"/>`), `${route} needs an English alternate`);
    assert.match(html, new RegExp(`<link rel="alternate" hrefLang="zh-CN" href="${escapeRegExp(`${site}${chinesePath}`)}"/>`), `${route} needs its Chinese counterpart`);
    assert.doesNotMatch(html, /<meta name="twitter:title" content="云计算 × AI 平台售前知识库"\/>/);
    assert.doesNotMatch(html, /social-card\.png/, `${route} must not inherit the Chinese social card`);
    assert.doesNotMatch(html, /summary_large_image/i, `${route} must not claim an absent social image`);
    assert.doesNotMatch(html, /<meta\b(?=[^>]*\bname="robots")(?=[^>]*\bcontent="[^"]*(?:noindex|nofollow))[^>]*>/i, `${route} must remain indexable`);
  }
});

test("Chinese pages declare their own canonical URL and bilingual alternates", async () => {
  const site = "https://cloud-ai-presales-fieldbook.lijx.chatgpt.site";
  // 模块路由的 canonical/hreflang 在 S1-T2 退役对象级本地化账本后补齐，见 S0-T5 回执。
  const cases = [
    ["/", "/", "/en"],
    ["/modules/ai-gateway", "/modules/ai-gateway", "/en/modules/ai-gateway"],
    ["/glossary", "/glossary", "/en/glossary"],
  ];

  for (const [route, chinesePath, englishPath] of cases) {
    const html = await renderHtml(route);
    assert.match(html, new RegExp(`<link rel="canonical" href="${escapeRegExp(`${site}${chinesePath}`)}"/>`), `${route} needs its own canonical URL`);
    assert.equal((html.match(/rel="alternate" hrefLang=/g) ?? []).length, 2, `${route} needs both zh-CN and en alternates`);
    assert.match(html, new RegExp(`<link rel="alternate" hrefLang="zh-CN" href="${escapeRegExp(`${site}${chinesePath}`)}"/>`), `${route} needs its Chinese alternate`);
    assert.match(html, new RegExp(`<link rel="alternate" hrefLang="en" href="${escapeRegExp(`${site}${englishPath}`)}"/>`), `${route} needs its English counterpart`);
  }
});

test("question directory combines keyword, module, and category filters", () => {
  const textByKey = buildQuestionSearchText("zh");
  const filterItems = questionDirectoryItems.map((item) => ({ key: item.key, moduleId: item.moduleId, tag: item.tag }));
  const quantization = filterQuestionDirectoryItems(filterItems, { query: "量化", textByKey });
  const mcp = filterQuestionDirectoryItems(filterItems, { moduleId: "mcp", textByKey });
  const inferenceCache = filterQuestionDirectoryItems(filterItems, { query: "缓存", moduleId: "llm-inference", textByKey });
  const evaluationSlice = filterQuestionDirectoryItems(filterItems, { moduleId: "evaluation", tag: "切片评估", textByKey });

  assert.ok(quantization.length > 0, "keyword queries must return real matching knowledge entries");
  assert.equal(new Set(quantization.map((item) => item.key)).size, quantization.length, "keyword query results must not repeat");
  assert.ok(quantization.every((item) => textByKey[item.key].includes("量化")), "keyword query results must keep their matching context");
  assert.equal(mcp.length, moduleContentRegistry.mcp.qa.length, "module filters must return every question of that module");
  assert.ok(inferenceCache.length > 0 && inferenceCache.every((item) => item.moduleId === "llm-inference" && textByKey[item.key].includes("缓存")), "keyword and module filters must combine");
  assert.equal(evaluationSlice.length, 1, "category filters must pinpoint one independent question topic");
});

test("solution, security, and fine-tuning use distinct problem-specific knowledge views", async () => {
  const [solution, security, tuning, tuningExplorerSource, tuningEnglishSource] = await Promise.all([
    renderHtml("/modules/solution-patterns"),
    renderHtml("/modules/security"),
    renderHtml("/modules/fine-tuning"),
    readFile(new URL("../app/module-visual-explorers.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n/en/modules/fine-tuning.mjs", import.meta.url), "utf8"),
  ]);

  assert.match(solution, /data-knowledge-view="decision-blueprint"/);
  assert.match(solution, /class="solutionDecisionLoop"/);
  assert.match(solution, /TCO/);
  assert.match(solution, /class="solutionCapabilityMatrix"/);
  assert.doesNotMatch(solution, /需求决策契约/);

  assert.match(security, /data-knowledge-view="threat-path"/);
  assert.match(security, /class="securityBarrierExplorer"/);
  assert.match(security, /IAM/);
  assert.match(security, /ACL/);
  assert.match(security, /DLP/);
  assert.match(security, /OWASP LLM Top 10/);
  assert.doesNotMatch(security, /四道外部控制门/);

  assert.match(tuning, /data-knowledge-view="tuning-lifecycle"/);
  assert.match(tuning, /class="tuningRouteExplorer"/);
  assert.match(tuning, /SFT/);
  assert.match(tuning, /PEFT/);
  assert.match(tuning, /LoRA/);
  assert.match(tuning, /QLoRA/);
  assert.match(tuning, /DPO/);
  assert.doesNotMatch(tuning, /微调闭环|反馈闭环/);

  const viewHtmlBySlug = { "solution-patterns": solution, security, "fine-tuning": tuning };
  for (const [slug, viewHtml] of Object.entries(viewHtmlBySlug)) {
    const content = requireModuleContent(slug);
    for (const item of content.qa) {
      assert.match(viewHtml, new RegExp(renderTextPattern(item.q)), `${slug} must render its registered question`);
    }
    for (const block of content.deepDives) {
      assert.match(viewHtml, new RegExp(renderTextPattern(block.title)), `${slug} must render its registered deep dive`);
    }
    const curriculum = moduleCurriculumContent[slug];
    for (const chapter of curriculum.chapters) {
      assert.match(viewHtml, new RegExp(renderTextPattern(chapter.title)), `${slug} curriculum must render the chapter: ${chapter.title}`);
    }
    const learning = moduleLearningContent[slug];
    for (const step of learning.route) {
      assert.match(viewHtml, new RegExp(renderTextPattern(step.title)), `${slug} learning route must render the step: ${step.title}`);
    }
    for (const lab of learning.labs) {
      assert.match(viewHtml, new RegExp(renderTextPattern(lab.title)), `${slug} labs must render: ${lab.title}`);
    }
  }

  assert.match(tuningExplorerSource, /\{ id: "format"[^}]*method: 0[^}]*\}[\s\S]*\{ id: "knowledge"[^}]*method: 1[^}]*\}[\s\S]*\{ id: "state-action"[^}]*method: 2[^}]*\}[\s\S]*\{ id: "behavior"[^}]*method: 3[^}]*\}[\s\S]*\{ id: "capability"[^}]*method: 4[^}]*\}/);
  assert.match(tuningExplorerSource, /tuningProblems\[3\]/);
  assert.doesNotMatch(tuningEnglishSource, /For enterprise behavior customization, start with LoRA|vllm-2023/);
});

test("RAG route follows one evidence decision from adoption through production", async () => {
  const html = await renderHtml("/modules/rag");
  assertValidGridSpans(html, "/modules/rag");

  const ragBrief = /** @type {any} */ (requireModuleContent("rag"));
  assert.match(html, new RegExp(`<small>${escapeRegExp(terminology.rag.zh)}<em lang="en"> · (?:<!-- -->)?Retrieval-Augmented Generation<\\/em><\\/small>`));
  assert.match(html, new RegExp(renderTextPattern(ragBrief.definition)));
  assert.match(html, new RegExp(renderTextPattern(ragBrief.principleTitle)));
  assert.match(html, new RegExp(renderTextPattern(ragBrief.criticalBoundary)));
  assert.match(html, new RegExp(renderTextPattern(ragBrief.deepDiveTitle)));
  for (const hook of ragBrief.cloudHooks) {
    assert.match(html, new RegExp(renderTextPattern(hook.stage)), `RAG must render the cloud stage: ${hook.stage}`);
  }
  for (const fact of ragBrief.facts) {
    assert.match(html, new RegExp(renderTextPattern(fact.label)), `RAG must render the hero fact: ${fact.label}`);
  }
  for (const choice of ragBrief.adoptionChoices) {
    assert.match(html, new RegExp(renderTextPattern(choice.route)), `RAG must render the adoption choice: ${choice.route}`);
  }
  for (const choice of ragBrief.extensionChoices) {
    assert.match(html, new RegExp(renderTextPattern(choice.pattern)), `RAG must render the extension choice: ${choice.pattern}`);
  }
  for (const deepDive of ragBrief.deepDives) {
    assert.match(html, new RegExp(renderTextPattern(deepDive.title)), `RAG must render the deep dive: ${deepDive.title}`);
  }
  for (const item of ragBrief.qa) {
    assert.match(html, new RegExp(renderTextPattern(item.q)), `RAG must render the registered question`);
  }
  for (const lab of ragLearningContent.labs) {
    assert.match(html, new RegExp(renderTextPattern(lab.title)), `RAG must render the lab: ${lab.title}`);
  }
  assert.match(html, /Candidate Recall@K/);
  assert.match(html, /BM25/);
  assert.equal((html.match(/class="qaEvidenceDisclosure"/g) ?? []).length, ragQa.length);
  assert.ok(ragLearningContent.outcomes.some((outcome) => outcome.trim()));
  assert.ok(ragLearningContent.route.some((step) => step.title && step.learn && step.checkpoint));
  assert.ok(ragLearningContent.labs.some((lab) => lab.title && lab.deliverable && lab.acceptance));
  assert.equal((html.match(/class="learningLab"/g) ?? []).length, ragLearningContent.labs.length);
  assert.match(html, /INTERACTIVE SYSTEM VIEW/);
  assert.match(html, /<input[^>]*type="search"/);
  assert.match(html, /href="\/references#module-rag"/);
  assert.doesNotMatch(html, /<dt>阅读方式<\/dt>/, "the Hero must not pose the default reading presets as a fixed module scale");

  for (const sourceId of collectModuleSourceIds(getPublishedModule("rag"))) {
    assert.match(
      html,
      new RegExp(`href="/references#source-${escapeRegExp(sourceId)}"`),
      `the RAG page is missing the unified Reference backlink: ${sourceId}`,
    );
  }

  assert.doesNotMatch(html, /id="source-[a-z0-9-]+"/, "the RAG page must not duplicate the complete source ledger");
  assert.doesNotMatch(html, /统一来源台账|本模块的来源与证据类别|打开原文 ↗/);
  assert.doesNotMatch(html, /MAINTENANCE BY DESIGN|时效性不是页脚日期|claim_id|review_by|事实最小单元/);
  assert.doesNotMatch(html, /softmax|RAG-Sequence|RAG-Token|潜变量|边缘化|Σ|∏/);
  assert.doesNotMatch(html, /class="(?:formula|deepFormula|smallFormula)"/);
});

test("Agent route explains the controlled loop, cloud runtime, and evidence-backed customer decisions", async () => {
  const html = await renderHtml("/modules/ai-agent");

  const agentBrief = /** @type {any} */ (requireModuleContent("ai-agent"));
  assert.match(html, /AI Agent/);
  assert.match(html, new RegExp(renderTextPattern(agentBrief.definition)));
  assert.match(html, new RegExp(renderTextPattern(agentBrief.principleTitle)));
  assert.match(html, new RegExp(renderTextPattern(agentBrief.deepDiveTitle)));
  assert.match(html, new RegExp(renderTextPattern(agentBrief.criticalBoundary)));
  for (const hook of agentBrief.cloudHooks) {
    assert.match(html, new RegExp(renderTextPattern(hook.stage)), `Agent must render the cloud stage: ${hook.stage}`);
  }
  for (const fact of agentBrief.facts) {
    assert.match(html, new RegExp(renderTextPattern(fact.label)), `Agent must render the hero fact: ${fact.label}`);
  }
  for (const deepDive of agentBrief.deepDives) {
    assert.match(html, new RegExp(renderTextPattern(deepDive.title)), `Agent must render the deep dive: ${deepDive.title}`);
  }
  for (const item of agentBrief.qa) {
    assert.match(html, new RegExp(renderTextPattern(item.q)), `Agent must render the registered question`);
  }
  assert.match(html, /RAG ≠ MEMORY/);
  assert.equal((html.match(/class="qaEvidenceDisclosure"/g) ?? []).length, agentQa.length);
  assert.doesNotMatch(html, /ReAct 是否意味着 Agent 必须严格按|工具参数已经通过 Strict Schema|生产上线前，Agent 最低需要通过哪些/);
  assert.match(html, /INTERACTIVE SYSTEM VIEW/);
  assert.match(html, /<input[^>]*type="search"/);
  assert.match(html, /Safe Exit/);
  assert.match(html, /Kill Switch/);

  for (const sourceId of collectModuleSourceIds(getPublishedModule("ai-agent"))) {
    assert.match(html, new RegExp(`href="/references#source-${escapeRegExp(sourceId)}"`));
  }

  assert.doesNotMatch(html, /正文建设中|模块依赖/);
  assert.doesNotMatch(html, /softmax|Σ|∏|class="(?:formula|deepFormula|smallFormula)"/);
});

test("Prompt Engineering route covers context boundaries, release governance, and cloud-service opportunities", async () => {
  const [html, englishHtml, labSource] = await Promise.all([
    renderHtml("/modules/prompt-engineering"),
    renderHtml("/en/modules/prompt-engineering"),
    readFile(new URL("../app/flagship-labs.tsx", import.meta.url), "utf8"),
  ]);

  for (const rendered of [html, englishHtml]) {
    assert.match(rendered, /data-module-hero="unified"/);
    assert.match(rendered, /data-module-reader="unified"/);
    assert.equal((rendered.match(/id="main-content"/g) ?? []).length, 1);
    serverRenderedReadingPanels(rendered, "Prompt Engineering");
    assert.doesNotMatch(rendered, /class="topbar"/);
  }
  assert.match(html, /Prompt Engineering/);
  assert.equal((html.match(/id="context-assembly"/g) ?? []).length, 1);
  assert.match(html, /id="prompt-engineering-extension-primer-title"/);
  assert.equal((html.match(/id="qa-\d+"/g) ?? []).length, promptQa.length);
  assert.equal((englishHtml.match(/class="qaItem"/g) ?? []).length, promptQa.length);
  const englishPrompt = englishModuleRegistry["prompt-engineering"];
  assert.equal((englishHtml.match(/<article class="metricCard[^"]*" id="evidence-[^"]+"/g) ?? []).length, englishPrompt.evidenceCards.length);
  const promptTables = html.match(/class="[^"]*\btableWrap\b[^"]*"[^>]*role="region"[^>]*aria-label="[^"]+"[^>]*tabindex="0"/g) ?? [];
  const promptTableCaptions = html.match(/<caption class="srOnly">/g) ?? [];
  assert.ok(promptTables.length > 0, "Prompt must keep scrollable tables for incompressible relations");
  assert.ok(promptTableCaptions.length >= promptTables.length, "every wide Prompt table must have an accessible name");
  assert.ok((englishHtml.match(/class="termHint" data-term-id=/g) ?? []).length > 0, "Prompt must keep locatable core term hints");
  for (const id of ["prompt-pattern-diagnostics", "technique-reasoning", "prompt-context-boundary", "claim-route-rules", "controlled-context-assembly", "validation-transaction", "boundary-prompt-hardening", "release-rollback-learn", "evidence-continuous-release-evaluation", "cloud-poc-operating-model", "boundary-universal-threshold", "qa-risk-based-go-no-go", "related-modules"]) {
    assert.equal((englishHtml.match(new RegExp(`id="${id}"`, "g")) ?? []).length, 1, `Prompt English reader must preserve #${id}`);
  }
  const promptBrief = /** @type {any} */ (requireModuleContent("prompt-engineering"));
  assert.match(html, new RegExp(renderTextPattern(promptBrief.definition)));
  assert.match(html, new RegExp(renderTextPattern(promptBrief.position)));
  assert.match(html, new RegExp(renderTextPattern(promptBrief.principleTitle)));
  assert.match(html, new RegExp(renderTextPattern(promptBrief.criticalBoundary)));
  assert.match(html, new RegExp(renderTextPattern(promptBrief.deepDiveTitle)));
  for (const hook of promptBrief.cloudHooks) {
    assert.match(html, new RegExp(renderTextPattern(hook.stage)), `Prompt must render the cloud stage: ${hook.stage}`);
  }
  for (const fact of promptBrief.facts) {
    assert.match(html, new RegExp(renderTextPattern(fact.label)), `Prompt must render the hero fact: ${fact.label}`);
  }
  for (const deepDive of promptBrief.deepDives) {
    assert.match(html, new RegExp(renderTextPattern(deepDive.title)), `Prompt must render the deep dive: ${deepDive.title}`);
  }
  for (const item of promptBrief.qa) {
    assert.match(html, new RegExp(renderTextPattern(item.q)), "Prompt must render the registered question");
  }
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(englishHtml, /Eligibility, limits, or state transition.*Deterministic rules and authorization.*Application workflow/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(englishHtml, /Factual and evidence correctness.*Business validity.*Authorization validity.*Tool-contract validity.*Transaction acceptance/s);
  assert.match(englishHtml, /Release Bundle is this fieldbook.{0,120}recommended[\s\S]*not a cross-provider standard/i);
  assert.match(labSource, /不会作最终赔付裁决/);
  assert.equal((html.match(/class="qaEvidenceDisclosure"/g) ?? []).length, promptQa.length);
  assert.match(html, /INTERACTIVE SYSTEM VIEW/);
  assert.match(html, /<input[^>]*type="search"/);

  /** @type {any} */
  const caseStudy = moduleContentRegistry["prompt-engineering"].caseStudy;
  assert.ok(caseStudy, "Prompt must register its through-line case as an auditable caseStudy");
  assert.ok(caseStudy.stages.some((/** @type {any} */ stage) => stage.title?.trim() && stage.detail?.trim()), "the Prompt case needs at least one reviewable stage");
  const failureRouteNames = caseStudy.failureRoutes.map((/** @type {any} */ route) => route.route);
  for (const route of ["Prompt、示例与 Schema", "RAG 与证据时效", "只读 Tool / 受控工作流", "确定性规则与授权", "更换候选模型", "进入微调候选门"]) assert.ok(failureRouteNames.includes(route), "the Prompt case must keep the failure route: " + route);

  for (const sourceId of collectModuleSourceIds(getPublishedModule("prompt-engineering"))) {
    assert.match(html, new RegExp(`href="/references#source-${escapeRegExp(sourceId)}"`));
  }

  assert.doesNotMatch(html, /正文建设中|模块依赖/);
  assert.doesNotMatch(html, /中文主版 · 术语中英对照/);
  assert.doesNotMatch(html, /softmax|Σ|∏|class="(?:formula|deepFormula|smallFormula)"/);
});

test("Model landscape route uses the claim-intake case to prove selection and exit decisions", async () => {
  const [html, englishHtml] = await Promise.all([
    renderHtml("/modules/model-landscape"),
    renderHtml("/en/modules/model-landscape"),
  ]);

  assert.match(html, /data-knowledge-view="selection-coordinate"/);
  const modelLandscapeView = moduleExtensionViews["model-landscape"];
  assert.match(html, new RegExp(renderTextPattern(modelLandscapeView.title)));
  assert.match(html, new RegExp(renderTextPattern(modelLandscapeView.application)));
  for (const step of modelLandscapeView.steps) {
    assert.match(html, new RegExp(renderTextPattern(step.title)), `model-landscape must render the view step: ${step.title}`);
  }
  for (const check of modelLandscapeView.checks) {
    assert.match(html, new RegExp(renderTextPattern(check.title)), `model-landscape must render the view check: ${check.title}`);
    assert.match(html, new RegExp(renderTextPattern(check.detail)), `model-landscape must render the check detail for: ${check.title}`);
  }
  const modelLandscapeContent = /** @type {any} */ (requireModuleContent("model-landscape"));
  for (const card of modelLandscapeContent.evidenceCards) {
    assert.match(html, new RegExp(renderTextPattern(card.metric)), "model-landscape must render the evidence metric");
    assert.match(html, new RegExp(renderTextPattern(card.finding)), "model-landscape must render the evidence finding");
  }
  for (const step of moduleLearningContent["model-landscape"].route) {
    assert.match(html, new RegExp(renderTextPattern(step.title)), `model-landscape must render the learning step: ${step.title}`);
  }
  for (const lab of moduleLearningContent["model-landscape"].labs) {
    assert.match(html, new RegExp(renderTextPattern(lab.title)), `model-landscape must render the lab: ${lab.title}`);
  }
  assert.doesNotMatch(html, /正文建设中|模块依赖/);

  assert.match(englishHtml, /Define the task and loss contract[\s\S]*Apply hard gates and identify each candidate[\s\S]*Run a controlled pilot and choose one model or a portfolio[\s\S]*Release, fall back, and exercise exit/);
  assert.match(englishHtml, /First test whether one model passes every hard gate/);
  assert.doesNotMatch(englishHtml, /Use multi-model routing/);
  assert.match(englishHtml, /id="claim-intake-task-loss-contract"/);
  assert.match(englishHtml, /id="claim-intake-feasibility-identity"/);
  assert.match(englishHtml, /id="claim-intake-controlled-pilot"/);
  assert.match(englishHtml, /id="claim-intake-release-exit"/);
  assert.doesNotMatch(englishHtml, /id="scenario-(?:regulated-knowledge-assistant|high-volume-triage|multimodal-field-inspection|code-tool-assistant)"/);
  assert.match(englishHtml, /Multimodal owns capture, parsing, cross-modal alignment, and evidence coordinates/);
  assert.match(englishHtml, /Fine-tuning owns stable residual behavior adaptation/);
  assert.match(englishHtml, /AI Gateway owns runtime route execution/);
  assert.match(englishHtml, /Lost in the Middle/);
});

test("Batch 06 routes render the Message-or-Task, gateway-control, and AI Ops recovery contracts", async () => {
  const [a2a, a2aEn, gateway, gatewayEn, aiOps, aiOpsEn] = await Promise.all([
    renderHtml("/modules/a2a"),
    renderHtml("/en/modules/a2a"),
    renderHtml("/modules/ai-gateway"),
    renderHtml("/en/modules/ai-gateway"),
    renderHtml("/modules/ai-ops"),
    renderHtml("/en/modules/ai-ops"),
  ]);

  assert.match(a2a, /Message \| Task/);
  assert.match(a2a, /v1\.0\.1/);
  assert.match(a2a, /A2A-Version[^<]*1\.0/);
  assert.match(a2a, /TASK_STATE_SUBMITTED[\s\S]*TASK_STATE_WORKING[\s\S]*TASK_STATE_INPUT_REQUIRED[\s\S]*TASK_STATE_AUTH_REQUIRED/);
  assert.match(a2a, /TASK_STATE_COMPLETED[\s\S]*TASK_STATE_FAILED[\s\S]*TASK_STATE_CANCELED/);
  assert.match(a2a, /TASK_STATE_REJECTED/);
  assert.match(a2a, /contextId[\s\S]*taskId[\s\S]*messageId[\s\S]*referenceTaskIds/);
  const a2aBrief = /** @type {any} */ (requireModuleBrief("a2a"));
  for (const item of a2aBrief.qa) {
    assert.match(a2a, new RegExp(renderTextPattern(item.q)), "a2a must render the registered question");
  }
  assert.match(a2a, /PushNotificationNotSupportedError/);
  assert.match(a2a, /TaskNotFoundError/);
  assert.match(a2a, /ExtensionSupportRequiredError/);
  assert.match(a2aEn, /Message \| Task/);
  assert.match(a2aEn, /v1\.0\.1/);
  assert.match(a2aEn, /TASK_STATE_SUBMITTED, TASK_STATE_WORKING, TASK_STATE_INPUT_REQUIRED, TASK_STATE_AUTH_REQUIRED, TASK_STATE_COMPLETED, TASK_STATE_FAILED, TASK_STATE_CANCELED, and TASK_STATE_REJECTED/);
  assert.match(a2aEn, /messageId ≠ exactly once/);
  assert.match(a2aEn, /SubscribeToTask[^.]*no resume cursor or historical replay/);
  assert.match(a2aEn, /Task is already terminal[^.]*SubscribeToTask MUST return UnsupportedOperationError/);
  assert.match(a2aEn, /successful at-least-once delivery is not guaranteed/);
  assert.match(a2aEn, /For each configured webhook/);
  assert.match(a2aEn, /PushNotificationNotSupportedError/);
  assert.match(a2aEn, /taskId and contextId[^.]*MUST match/);
  assert.match(a2aEn, /MUST include a generated value in (?:its )?returned Task or Message/);
  assert.match(a2aEn, /server-generated (?:contextId )?values as opaque/);
  assert.match(a2aEn, /TaskNotFoundError/);
  assert.match(a2aEn, /unsupported version of an optional Extension[^.]*MUST NOT fall back/);
  assert.match(a2aEn, /ExtensionSupportRequiredError/);
  assert.match(a2aEn, /Extended Agent Card is not an Extension/);

  const gatewayBrief = /** @type {any} */ (requireModuleBrief("ai-gateway"));
  for (const item of gatewayBrief.qa) {
    assert.match(gateway, new RegExp(renderTextPattern(item.q)), "ai-gateway must render the registered question");
  }
  for (const chapter of moduleCurriculumContent["ai-gateway"].chapters) {
    assert.match(gateway, new RegExp(renderTextPattern(chapter.title)), `ai-gateway must render the curriculum chapter: ${chapter.title}`);
    assert.match(gateway, new RegExp(renderTextPattern(chapter.explanation)), `ai-gateway must render the chapter explanation for: ${chapter.title}`);
  }
  assert.ok(gateway.includes(formatQuestionAddedAt("2026-08-01")), "ai-gateway must render the registered addedAt label");
  assert.match(gatewayEn, /Once the gateway manages provider credentials, can it act for the user across every model and tool/);
  assert.match(gatewayEn, /Why can request-rate limiting still allow token, concurrency, or budget exhaustion/);
  assert.match(gatewayEn, /Exact and semantic caching/);

  assert.match(aiOps, /Head Sampling/);
  assert.match(aiOps, /Tail Sampling/);
  assert.match(aiOps, new RegExp(renderTextPattern(/** @type {any} */ (requireModuleBrief("ai-ops")).criticalBoundary)));
  assert.match(aiOps, new RegExp(renderTextPattern(moduleExtensionViews["ai-ops"].application)));
  assert.match(aiOpsEn, /head sampling/i);
  assert.match(aiOpsEn, /tail sampling/i);
  assert.match(aiOpsEn, /tail sampler cannot recover traces dropped upstream/i);
  assert.match(aiOpsEn, /not traditional AIOps alert reduction or GPU-only monitoring/);
  assert.match(aiOpsEn, /cross-region, multi-tenant claim assistant/);
});

test("Batch 08 routes render inference overload and compute procurement evidence in both languages", async () => {
  const [inference, inferenceEn, compute, computeEn] = await Promise.all([
    renderHtml("/modules/llm-inference"),
    renderHtml("/en/modules/llm-inference"),
    renderHtml("/modules/ai-infra-compute"),
    renderHtml("/en/modules/ai-infra-compute"),
  ]);

  const inferenceBrief = /** @type {any} */ (requireModuleBrief("llm-inference"));
  assert.match(inference, new RegExp(renderTextPattern(inferenceBrief.position)));
  assert.match(inference, new RegExp(renderTextPattern(inferenceBrief.criticalBoundary)));
  assert.match(inference, /Goodput/);
  for (const deepDive of inferenceBrief.deepDives) {
    for (const item of deepDive.items) {
      assert.match(inference, new RegExp(renderTextPattern(item.name)), `inference must render the deep-dive item: ${item.name}`);
    }
  }
  assert.match(inferenceEn, /First-token delay, slow continuation, queueing, rejection, memory growth, and quality regression/);
  assert.match(inferenceEn, /Goodput/);
  assert.match(inferenceEn, /unavailable or loading capacity/);
  assert.match(inferenceEn, /cache_salt/);

  const computeBrief = /** @type {any} */ (requireModuleBrief("ai-infra-compute"));
  assert.match(compute, new RegExp(renderTextPattern(computeBrief.definition)));
  assert.match(compute, new RegExp(renderTextPattern(computeBrief.position)));
  assert.match(compute, new RegExp(renderTextPattern(computeBrief.criticalBoundary)));
  assert.match(compute, /Roofline/);
  for (const item of computeBrief.qa) {
    assert.match(compute, new RegExp(renderTextPattern(item.q)), "ai-infra-compute must render the registered question");
  }
  for (const deepDive of computeBrief.deepDives) {
    for (const item of deepDive.items) {
      assert.match(compute, new RegExp(renderTextPattern(item.name)), `ai-infra-compute must render the deep-dive item: ${item.name}`);
    }
  }
  assert.match(computeEn, /Workload envelope and acceptance contract/);
  assert.match(computeEn, /Roofline/);
  assert.match(computeEn, /tightly coupled accelerator domain/);
  assert.match(computeEn, /Multiple nodes do not necessarily mean multiple domains/);
  assert.match(computeEn, /Resource-level TCO is not project ROI/);
});

test("Batch 09 routes render platform-product and minimum-sufficient-loop evidence in both languages", async () => {
  const [platform, platformEn, solution, solutionEn] = await Promise.all([
    renderHtml("/modules/ai-infra-platform"),
    renderHtml("/en/modules/ai-infra-platform"),
    renderHtml("/modules/solution-patterns"),
    renderHtml("/en/modules/solution-patterns"),
  ]);

  const platformBrief = /** @type {any} */ (requireModuleBrief("ai-infra-platform"));
  assert.match(platform, new RegExp(renderTextPattern(platformBrief.position)));
  assert.match(platform, new RegExp(renderTextPattern(platformBrief.criticalBoundary)));
  for (const item of platformBrief.qa) {
    assert.match(platform, new RegExp(renderTextPattern(item.q)), "ai-infra-platform must render the registered question");
  }
  for (const chapter of moduleCurriculumContent["ai-infra-platform"].chapters) {
    assert.match(platform, new RegExp(renderTextPattern(chapter.title)), `ai-infra-platform must render the curriculum chapter: ${chapter.title}`);
    assert.match(platform, new RegExp(renderTextPattern(chapter.explanation)), `ai-infra-platform must render the chapter explanation for: ${chapter.title}`);
    assert.match(platform, new RegExp(renderTextPattern(chapter.boundary)), `ai-infra-platform must render the chapter boundary for: ${chapter.title}`);
  }
  assert.match(platformEn, /platform control layer provides a capability catalog, APIs, templates, policy, quota, versions, and audit/i);
  assert.match(platformEn, /Four multi-tenant validation boundaries/);
  assert.match(platformEn, /OCI image or Kubernetes YAML is not evidence of cross-cloud or cross-accelerator migration/);
  assert.match(platformEn, /Does containerizing an AI workload and deploying it on Kubernetes make it freely portable/);

  const solutionBrief = /** @type {any} */ (requireModuleBrief("solution-patterns"));
  assert.match(solution, new RegExp(renderTextPattern(solutionBrief.definition)));
  assert.match(solution, new RegExp(renderTextPattern(solutionBrief.position)));
  assert.match(solution, new RegExp(renderTextPattern(solutionBrief.criticalBoundary)));
  for (const chapter of moduleCurriculumContent["solution-patterns"].chapters) {
    assert.match(solution, new RegExp(renderTextPattern(chapter.title)), `solution-patterns must render the curriculum chapter: ${chapter.title}`);
    assert.match(solution, new RegExp(renderTextPattern(chapter.explanation)), `solution-patterns must render the chapter explanation for: ${chapter.title}`);
  }
  assert.match(solutionEn, /Minimum sufficient loop/);
  assert.match(solutionEn, /RAG for current attributable knowledge/);
  assert.match(solutionEn, /eight responsibility layers/);
  assert.match(solutionEn, /Worked example: verifiable customer-service resolution/);
  assert.match(solutionEn, /resolved cases, human transfers, abandonment, false commitments, and rework/);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(solutionEn, /Go, Hold, No-Go.*Exit/is);
});

test("Batch 09 control views expose every step and focused search entries resolve to visible anchors", async () => {
  const [platform, platformEn, solutionEn, homepageSource, searchIndexBuilderSource] = await Promise.all([
    renderHtml("/modules/ai-infra-platform"),
    renderHtml("/en/modules/ai-infra-platform"),
    renderHtml("/en/modules/solution-patterns"),
    readFile(new URL("../app/(zh)/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../scripts/build-search-index.mjs", import.meta.url), "utf8"),
  ]);

  const platformView = moduleExtensionViews["ai-infra-platform"];
  const chinesePlatformView = getModuleExtensionView("ai-infra-platform");
  const englishPlatformPrinciples = /** @type {any} */ (
    englishModuleRegistry["ai-infra-platform"].sections
      .find((/** @type {any} */ section) => section.id === "principles")
  )?.blocks.find((/** @type {any} */ block) => block.type === "cards")?.items ?? [];
  const chineseControlDataPlane = extractControlDataPlane(platform, "/modules/ai-infra-platform");
  const englishControlDataPlane = extractControlDataPlane(platformEn, "/en/modules/ai-infra-platform");

  assert.ok(platformView, "ai-infra-platform must register the control-plane knowledge view");
  assert.ok(chinesePlatformView, "ai-infra-platform must provide the Chinese control-plane knowledge view");
  assert.deepEqual(
    chinesePlatformView.steps.map((/** @type {any} */ { code, title }) => ({ code, title })),
    platformView.steps.map((/** @type {any} */ { code, title }) => ({ code, title })),
    "Chinese control-plane steps must fully render the registered codes and titles",
  );
  assert.equal(englishPlatformPrinciples.length, platformView.steps.length, "English control-plane steps must cover every registered phase");
  assert.match(chineseControlDataPlane, new RegExp(`data-step-count="${platformView.steps.length}"`));
  assert.match(englishControlDataPlane, new RegExp(`data-step-count="${platformView.steps.length}"`));
  assert.equal((chineseControlDataPlane.match(/<button type="button"/g) ?? []).length, platformView.steps.length);
  assert.equal((englishControlDataPlane.match(/<button type="button"/g) ?? []).length, platformView.steps.length);

  for (const step of platformView.steps) {
    assert.match(
      chineseControlDataPlane,
      new RegExp(`<button[^>]*>[\\s\\S]*?<span>${escapeRegExp(step.code)}</span>[\\s\\S]*?<strong>${escapeRegExp(step.title)}</strong>`),
      `the Chinese control plane is missing the step: ${step.code} ${step.title}`,
    );
  }
  for (const [stepIndex, step] of englishPlatformPrinciples.entries()) {
    const code = String(stepIndex + 1).padStart(2, "0");
    assert.match(
      englishControlDataPlane,
      new RegExp(`<button[^>]*>[\\s\\S]*?<span>${code}</span>[\\s\\S]*?<strong>${escapeRegExp(step.title)}</strong>`),
      `the English control plane is missing the step: ${code} ${step.title}`,
    );
  }
  assert.match(searchIndexBuilderSource, /buildKnowledgeSearchEntries\("zh"\)/);
  assert.match(homepageSource, /knowledgeIndexUrl="\/search\/knowledge\.zh\.json"/);

  const zhSearchIndex = buildKnowledgeSearchEntries("zh");
  for (const publication of publishedModuleRegistry.filter((module) => module.readingProfile === "focused")) {
    const qaEntries = zhSearchIndex.filter((entry) => entry.type === "客户问答" && entry.id.startsWith(`qa-${publication.slug}-`));
    assert.equal(
      qaEntries.length,
      moduleContentRegistry[publication.slug].qa.length,
      `${publication.slug} search must retain every formal question`,
    );
    const curriculum = moduleCurriculumContent[publication.slug];
    if (curriculum) {
      const curriculumEntries = zhSearchIndex.filter((entry) => entry.type === "课程章节" && entry.id.startsWith(`curriculum-${publication.slug}-`));
      assert.equal(curriculumEntries.length, curriculum.chapters.length, `${publication.slug} search must keep long-form sections discoverable`);
    }
    const html = await renderHtml(publication.path);
    moduleContentRegistry[publication.slug].qa.forEach((_, index) => assert.match(html, new RegExp(`id="qa-${index + 1}"`)));
  }

  const enSearchIndex = buildKnowledgeSearchEntries("en");
  const solutionGroups = buildEnglishSectionGroups(englishModuleRegistry["solution-patterns"]);
  const solutionSectionEntries = enSearchIndex.filter((entry) => entry.type === "Module section" && entry.id.startsWith("section-solution-patterns-"));
  const expectedSolutionItems = solutionGroups.flatMap((/** @type {any} */ group) => group.sections.flatMap((/** @type {any} */ section) => section.blocks.flatMap((/** @type {any} */ block) => block.items))).length;
  assert.equal(solutionSectionEntries.length, expectedSolutionItems, "solution-patterns search must keep every section item");
  assert.ok(solutionGroups.some((/** @type {any} */ group) => group.role === "learning"));
  assert.ok(solutionGroups.some((/** @type {any} */ group) => group.role === "curriculum"));
  assert.match(solutionEn, /id="curriculum"/);
  assert.match(solutionEn, /id="study-guide"/);
  assert.equal((solutionEn.match(/class="qaItem"/g) ?? []).length, englishModuleRegistry["solution-patterns"].qa.length);
  assert.match(solutionEn, /Worked example: verifiable customer-service resolution/);
  assert.match(solutionEn, /id="solution-outcome-poc"/);
  assert.match(platformEn, /id="curriculum-serving-platform"/);
});

test("LLM foundations questions cover the theory readers need for architecture decisions", async () => {
  const html = await renderHtml("/modules/llm");
  const llmQa = moduleContentRegistry.llm.qa;

  assert.equal((html.match(/class="qaEvidenceDisclosure"/g) ?? []).length, llmQa.length);
  for (const item of llmQa) {
    assert.match(html, new RegExp(renderTextPattern(item.q)), "llm must render the registered theory question");
  }
  assert.match(html, /MoE/);
});

test("every published module passes the shared reader, terminology, and depth contract", async () => {
  assert.equal(new Set(publishedModuleSlugs).size, publishedModuleSlugs.length, "published module slugs must be unique");
  assert.deepEqual(Object.keys(moduleContentRegistry).sort(), [...publishedModuleSlugs].sort(), "the practice-and-evidence registry must match the published modules");
  assert.ok(Object.keys(terminology).length > 0);

  for (const [termId, term] of Object.entries(terminology)) {
    assert.match(termId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(term.zh && term.en, `terms need both Chinese and English names: ${termId}`);
  }

  for (const publishedModule of publishedModules) {
    const knowledgeModule = getModuleBySlug(publishedModule.slug);
    assert.ok(knowledgeModule, `published module is not on the knowledge map: ${publishedModule.slug}`);
    assert.equal(publishedModule.path, knowledgeModule.href, `published path diverges from the knowledge map: ${publishedModule.slug}`);
    assert.ok(referenceModules.some((module) => module.id === publishedModule.slug), `missing Reference group: ${publishedModule.slug}`);

    const html = await renderHtml(publishedModule.path);
    assertValidGridSpans(html, publishedModule.path);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `every formal module must keep one main title: ${publishedModule.slug}`);
    assert.match(html, new RegExp(`<h1[^>]*id="${escapeRegExp(publishedModule.titleId)}"`));

    for (const match of html.matchAll(/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/g)) {
      const headingText = match[1].replace(/<[^>]+>/g, " ");
      assert.doesNotMatch(headingText, /先确定|我们来看|你需要|不要一上来/, `headings must not address the reader in an editorial voice: ${headingText}`);
    }

    for (const section of ["related-modules", "principle", "deep-dive", "evidence", "cloud", "qa"]) {
      assert.match(html, new RegExp(`data-quality-section="${section}"`), `${publishedModule.slug} is missing the ${section} quality section`);
    }

    assert.match(html, /aria-label="[^"]+"[^>]*data-importance="critical"/);
    assert.match(html, /class="readingProgress"/, `${publishedModule.slug} is missing the reading progress`);
    assert.match(html, /class="moduleReadingExperience"/, `${publishedModule.slug} is missing the task reader`);
    assert.match(html, /role="tablist" aria-label="[^"]+"/, `${publishedModule.slug} is missing the accessible reading-task choice`);
    assert.match(html, /INTERACTIVE SYSTEM VIEW|data-knowledge-explorer="interactive"/, `${publishedModule.slug} is missing a mechanism or decision view`);
    assert.match(html, /<input[^>]*type="search"|href="\/questions\?module=[^"]*"/, `${publishedModule.slug} is missing the searchable practice pack`);
    assert.match(html, /href="\/questions(?:\?[^\"]*)?"/, `${publishedModule.slug} is missing the site-wide question directory entry`);
    assert.match(html, /href="\/references(?:#[^"]+)?"/);

    for (const termId of publishedModule.requiredTerms) {
      const term = requireTerm(termId);
      assert.match(html, new RegExp(escapeRegExp(term.zh)), `${publishedModule.slug} is missing the Chinese term: ${term.zh}`);
      assert.match(html, new RegExp(escapeRegExp(escapeHtmlText(term.en))), `${publishedModule.slug} is missing the English term: ${term.en}`);
    }

    for (const [dimension, markers] of Object.entries(publishedModule.contentContract)) {
      assert.ok(markers.length > 0, `${publishedModule.slug} ${dimension} contract must not be empty`);
      for (const marker of markers) {
        if (dimension === "boundary" && html.includes('data-module-reader="unified"') && !html.includes(marker)) {
          assert.match(html, /aria-label="[^"]+"[^>]*data-importance="critical"/, `${publishedModule.slug} unified reader must keep an explicit boundary label`);
          continue;
        }
        assert.match(html, new RegExp(escapeRegExp(marker)), `${publishedModule.slug} is missing ${dimension} semantics: ${marker}`);
      }
    }

    assert.doesNotMatch(html, /\b(?:Login|Sign in)\b|type="password"/i);
    assert.doesNotMatch(html, /模块依赖|BUILD BRIEF|读者画像|语言规范|中文为主|中文主版本|术语中英对照|CONTENT STATUS/);
    assert.doesNotMatch(html, /\/(?:Users|home)\//);
  }
});

test("reader pages omit internal build notes and use the shared related-module language", async () => {
  for (const path of ["/", ...publishedModules.map((module) => module.path), "/glossary", "/questions", "/references", "/knowledge-graph"]) {
    const html = await renderHtml(path);
    assert.doesNotMatch(html, /模块依赖|BUILD BRIEF|编辑原则：|语言规范 \/ Language Standard|跨模块阅读规则|读者画像|中文为主|中文主版本|术语中英对照|CONTENT STATUS/);
    assert.doesNotMatch(html, /claim_id|review_by|本机绝对路径|\/Users\/lijiaxiang/);
    assert.doesNotMatch(html, /\b(?:Login|Sign in)\b|type="password"/i);
    assert.doesNotMatch(html, /class="brandMark"/, `public headers and footers must not re-introduce a meaningless CA mark: ${path}`);
    assert.doesNotMatch(
      html,
      /客户信号|来源台账|知识供应链|责任链|运营闭环|责任闭环|技术售前工作台|形成连续叙事|产品后映射/,
      `public pages must use plain reader-facing Chinese: ${path}`,
    );
  }
});

test("all public page families use the shared A / Mist design contract", async () => {
  const representativeRoutes = [
    "/",
    "/en",
    "/modules/solution-patterns",
    "/modules/rag",
    "/en/modules/rag",
    "/questions",
    "/glossary",
    "/references",
    "/coding-agents",
    "/en/questions",
    "/en/glossary",
    "/en/references",
    "/knowledge-graph",
    "/en/knowledge-graph",
  ];

  for (const path of representativeRoutes) {
    const html = await renderHtml(path);
    assert.match(html, /<main[^>]*class="[^"]*\bfieldbookTheme\b[^"]*"/, `${path} is missing the site-wide design-language root class`);
  }

  const [globals, v2Styles, v3Styles, homeStyles, designLanguage] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/fieldbook-v2.css", import.meta.url), "utf8"),
    readFile(new URL("../app/fieldbook-v3.css", import.meta.url), "utf8"),
    readFile(new URL("../app/home-refresh.css", import.meta.url), "utf8"),
    readFile(new URL("../docs/DESIGN-LANGUAGE.md", import.meta.url), "utf8"),
  ]);

  for (const token of ["--fb-ink", "--fb-muted", "--fb-link", "--fb-line", "--fb-accent", "--fb-canvas", "--fb-mist", "--fb-risk"]) {
    assert.match(globals, new RegExp(escapeRegExp(token)), `missing design token: ${token}`);
  }
  assert.doesNotMatch(v2Styles, /^:root\s*\{/m, "V2 must not redefine site-wide tokens");
  assert.doesNotMatch(v3Styles, /^:root\s*\{/m, "V3 must not redefine site-wide tokens");
  assert.doesNotMatch(homeStyles, /\.fieldbookHomeZh\b/, "the homepage design must serve both locales");
  assert.match(homeStyles, /\.fieldbookHome\s*\{/);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(homeStyles, /\.fieldbookHome \.learningPathsV2,\s*\.fieldbookHome \.timeBudgetPathsV2\s*\{[^}]*max-width:\s*1360px;[^}]*border:\s*0;[^}]*border-radius:\s*16px;/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(homeStyles, /\.fieldbookHome \.learningPathsV2::before,\s*\.fieldbookHome \.timeBudgetPathsV2::before,/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(homeStyles, /\.fieldbookHome \.learningPathsV2::after,\s*\.fieldbookHome \.timeBudgetPathsV2::after,/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.doesNotMatch(homeStyles, /\.fieldbookHome \.timeBudgetPathsV2::before,\s*\.fieldbookHome \.timeBudgetPathsV2::after\s*\{\s*display:\s*none;/s);
  assert.match(designLanguage, /全站设计语言：雾灰青 A[\s\S]*动态知识关系图/);
  assert.ok(
    v3Styles.indexOf(".fieldbookTheme.modulePage .tableWrap {") > v3Styles.indexOf(".fieldbookTheme.modulePage :where(.conceptGrid, .mechanicGrid, .tableWrap"),
    "the module-table scroll override must come after the generic card-clip rules",
  );
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(v3Styles, /\.fieldbookTheme\.modulePage \.tableWrap\s*\{[^}]*overflow-x:\s*auto;/s);
});

test("references route is the complete centralized source ledger", async () => {
  const html = await renderHtml("/references");

  assert.match(html, /Reference Library/);
  assert.match(html, /id="reference-modules"/);
  assert.match(html, /<input[^>]*placeholder="[^"]+"/);

  for (const referenceModule of chineseReferenceModules) {
    assert.match(html, new RegExp(`id="module-${escapeRegExp(referenceModule.id)}"`));
    assert.match(html, new RegExp(`href="${escapeRegExp(referenceModule.href)}"`));
    assert.match(html, new RegExp(escapeRegExp(referenceModule.zh)));

    for (const sourceId of referenceModule.sourceIds) {
      const source = sourceLedger[sourceId];
      assert.ok(source, `Reference module cites an unknown source: ${sourceId}`);
      assert.match(html, new RegExp(`id="source-${escapeRegExp(sourceId)}"`));
      assert.match(html, new RegExp(`href="${escapeRegExp(source.href)}"`));
      assert.match(html, new RegExp(escapeRegExp(escapeHtmlText(source.title))));
      assert.match(html, new RegExp(`核验：(?:<!-- -->)?${escapeRegExp(source.verifiedAt)}`));
    }
  }

  const publicSourceIds = new Set(chineseReferenceModules.flatMap((module) => module.sourceIds));
  for (const [sourceId, source] of Object.entries(sourceLedger)) {
    assert.match(html, new RegExp(`id="source-${escapeRegExp(sourceId)}"`), `source is missing from the unified ledger: ${sourceId}`);
    assert.equal(
      (html.match(new RegExp(`<a class="sourceItem" id="source-${escapeRegExp(sourceId)}"`, "g")) ?? []).length,
      publicSourceIds.has(sourceId) ? 1 : 0,
      `each sourceId owner anchor must be unique; legacy versions keep only the stable alias anchor: ${sourceId}`,
    );
    if (!publicSourceIds.has(sourceId)) assert.ok(source.versionOf === undefined, `${sourceId} must not be superseded by an older source`);
  }
  assert.doesNotMatch(html, /本轮中文内容|英文证据视图|避免静默/);
});

test("legacy module addresses resolve to the current published knowledge base", async () => {
  assert.ok(Object.keys(legacyModuleAliases).length > 0);

  for (const [legacySlug, canonicalSlug] of Object.entries(legacyModuleAliases)) {
    const resolved = getModuleBySlug(legacySlug);
    assert.ok(resolved, `legacy module address cannot be resolved: ${legacySlug}`);
    assert.equal(resolved.canonicalSlug, canonicalSlug);
    assert.equal(resolved.href, `/modules/${canonicalSlug}`);

    const html = await renderHtml(`/modules/${legacySlug}`);
    const canonicalModule = getPublishedModule(canonicalSlug);
    assert.match(html, new RegExp(`<h1[^>]*id="${escapeRegExp(canonicalModule.titleId)}"`));
    assert.match(html, /data-quality-section="qa"/);
    assert.doesNotMatch(html, /正文建设中|CONTENT STATUS|后续版本将补齐|模块依赖/);
  }
});

test("every public knowledge route is anonymously readable and directly shareable", async () => {
  const routes = [
    "/",
    "/glossary",
    "/questions",
    "/references",
    "/knowledge-graph",
    "/en",
    "/en/coding-agents",
    "/model-radar",
    "/en/model-radar",
    "/en/glossary",
    "/en/questions",
    "/en/references",
    "/en/knowledge-graph",
    ...publishedModuleSlugs.map((slug) => `/en/modules/${slug}`),
    ...moduleList.map((knowledgeModule) => knowledgeModule.href),
    ...Object.keys(legacyModuleAliases).map((slug) => `/modules/${slug}`),
  ];

  for (const path of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, `${path} must be directly reachable without login`);
    assert.equal(response.headers.get("location"), null, `${path} must not redirect to a login or interstitial page`);
    const html = await response.text();
    assert.doesNotMatch(html, /type="password"|(?:href|action)="\/(?:login|signin)\b|<(?:a|button)[^>]*>\s*(?:Login|Sign in)\s*<\/(?:a|button)>/i, `${path} must not depend on login`);
    assert.doesNotMatch(html, /\/(?:Users|home)\//, `${path} must not leak local absolute paths`);
  }
});

test("legacy knowledge graph routes redirect to the single public explorer and preserve focus", async () => {
  for (const path of ["/knowledge-graph/explore?node=term:kv-cache", "/knowledge-graph/design-2?node=term:kv-cache"]) {
    const response = await render(path);
    assert.equal(response.status, 308);
    const location = new URL(response.headers.get("location"), "http://localhost");
    assert.equal(location.pathname, "/knowledge-graph");
    assert.equal(location.searchParams.get("node"), "term:kv-cache");
  }
});

test("knowledge-map registry supports changing layer and module counts without duplicate routes", () => {
  assert.ok(layers.length > 0);
  assert.ok(moduleList.length > 0);
  assert.equal(layers.reduce((total, layer) => total + layer.modules.length, 0), moduleList.length);

  const layerNumbers = layers.map((layer) => layer.no);
  const slugs = moduleList.map((knowledgeModule) => knowledgeModule.slug);
  const hrefs = moduleList.map((knowledgeModule) => knowledgeModule.href);

  assert.equal(new Set(layerNumbers).size, layers.length, "layer numbers must be unique");
  assert.equal(new Set(slugs).size, moduleList.length, "module slugs must be unique");
  assert.equal(new Set(hrefs).size, moduleList.length, "module hrefs must be unique");

  for (const layer of layers) {
    assert.ok(layer.no && layer.name && layer.en && layer.purpose);
    assert.ok(layer.modules.length > 0, `knowledge layers must not be empty: ${layer.name}`);
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
  const allowedGrades = new Set(["O", "P", "A", "B", "G"]);
  const intentIds = new Set(intentDefinitions.map((intent) => intent.id));

  assert.ok(sourceEntries.length > 0);

  const sourcesByUrl = Map.groupBy(sourceEntries, ([, source]) => source.href);
  for (const [href, entries] of sourcesByUrl) {
    if (entries.length === 1) continue;
    const canonical = entries.filter(([, source]) => !source.versionOf);
    assert.equal(canonical.length, 1, `duplicate URLs must keep exactly one canonical source: ${href}`);
    for (const [sourceId, source] of entries.filter(([, item]) => item.versionOf)) {
      assert.equal(source.versionOf, canonical[0][0], `${sourceId} must explicitly point at the canonical source for its URL`);
      assert.equal(source.localeScope, "zh-CN", `${sourceId} versioned sources must stay scoped to Chinese`);
      assert.ok(source.verifiedAt >= canonical[0][1].verifiedAt, `${sourceId} verifiedAt must not predate the canonical source`);
    }
  }

  for (const [sourceId, source] of sourceEntries) {
    assert.match(sourceId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.match(source.href, /^https:\/\//);
    assert.match(source.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
    const freshness = sourceFreshness(source);
    assert.ok(
      freshness.status !== "invalid" && freshness.status !== "future",
      `source dates must be valid and must not be in the future: ${sourceId} / ${freshness.status} / ${freshness.ageDays ?? "?"} days`,
    );
    assert.ok([30, 90, 180].includes(/** @type {number} */ (freshness.reviewCycleDays)));
    assert.ok(source.grade && source.kind && source.shortTitle && source.title && source.note);
    assert.ok(allowedGrades.has(source.grade), `unknown evidence grade: ${sourceId} / ${source.grade}`);
  }

  const groupedSourceIds = new Set();
  const referenceModuleIds = new Set();
  const referenceModuleHrefs = new Set();
  for (const referenceModule of referenceModules) {
    assert.ok(!referenceModuleIds.has(referenceModule.id), `duplicate Reference module id: ${referenceModule.id}`);
    assert.ok(!referenceModuleHrefs.has(referenceModule.href), `duplicate Reference module link: ${referenceModule.href}`);
    referenceModuleIds.add(referenceModule.id);
    referenceModuleHrefs.add(referenceModule.href);
    assert.ok(referenceModule.zh && referenceModule.en && referenceModule.shortTitle);
    assert.ok(referenceModule.sourceIds.length > 0, `Reference module is missing sources: ${referenceModule.id}`);
    assert.equal(new Set(referenceModule.sourceIds).size, referenceModule.sourceIds.length, `Reference module has duplicated sources: ${referenceModule.id}`);
    assert.equal(referenceModule.href, getModuleBySlug(referenceModule.id)?.href, `Reference groups must link to their module: ${referenceModule.id}`);

    for (const sourceId of referenceModule.sourceIds) {
      assert.ok(sourceIds.has(sourceId), `Reference module cites an unknown source: ${sourceId}`);
      groupedSourceIds.add(sourceId);
    }
  }
  assert.deepEqual([...groupedSourceIds].sort(), [...sourceIds].sort(), "every source must belong to at least one module group");

  for (const publishedModule of publishedModules) {
    const referenceModule = referenceModules.find((candidate) => candidate.id === publishedModule.id);
    assert.ok(referenceModule, `missing the ${publishedModule.id} Reference group`);
    const moduleSourceIds = new Set(referenceModule.sourceIds);

    assert.ok(publishedModule.qa.length > 0, `published module is missing customer questions: ${publishedModule.id}`);
    assert.equal(
      new Set(publishedModule.qa.map((item) => item.q)).size,
      publishedModule.qa.length,
      `one module must not repeat the same customer question: ${publishedModule.id}`,
    );
    for (const item of publishedModule.qa) {
      assert.ok(item.tag?.trim(), `${publishedModule.id} question must keep a free tag label`);
    }
    const moduleDirectoryItems = questionDirectoryItems.filter((item) => item.moduleId === publishedModule.id);
    assert.equal(moduleDirectoryItems.length, publishedModule.qa.length, `question directory must cover every question: ${publishedModule.id}`);
    for (const item of moduleDirectoryItems) {
      assert.ok(intentIds.has(item.intentId), `${item.key} resolves to an unknown intent: ${item.intentId}`);
    }
    assert.ok(publishedModule.deepDives.length > 0, `published module is missing independent knowledge expansions: ${publishedModule.id}`);

    for (const block of publishedModule.deepDives) {
      assert.ok(["sequence", "matrix", "diagnostic", "checklist", "scenario"].includes(block.kind), `unknown deep-dive representation: ${publishedModule.id} / ${block.kind}`);
      assert.ok(block.eyebrow && block.title && block.intro, `incomplete deep-dive metadata: ${publishedModule.id}`);
      assert.ok(block.items.length > 0, `deep dives must not be empty: ${publishedModule.id} / ${block.title}`);
      assert.ok(block.sourceIds.length > 0, `deep dives are missing evidence: ${publishedModule.id} / ${block.title}`);
      assert.equal(new Set(block.sourceIds).size, block.sourceIds.length, `deep dives have duplicated sources: ${publishedModule.id} / ${block.title}`);

      for (const item of block.items) {
        assert.ok(item.name && item.mechanism && item.decision, `incomplete deep-dive item: ${publishedModule.id} / ${block.title}`);
      }
      for (const sourceId of block.sourceIds) {
        assert.ok(sourceIds.has(sourceId), `deep dives cite an unknown source: ${sourceId}`);
        assert.ok(moduleSourceIds.has(sourceId), `deep-dive sources are not in the ${publishedModule.id} group: ${sourceId}`);
      }
    }

    for (const item of publishedModule.qa) {
      assert.ok(item.q && item.a && item.depth && item.ask && item.tag && item.basis);
      assert.ok(item.evidence.length > 0, `question is missing its evidence basis: ${item.q}`);
      assert.equal(
        new Set(item.evidence.map((reference) => reference.sourceId)).size,
        item.evidence.length,
        `one question must not cite the same source twice: ${item.q}`,
      );
      for (const reference of item.evidence) {
        assert.ok(sourceIds.has(reference.sourceId), `question cites an unknown source: ${reference.sourceId}`);
        assert.ok(moduleSourceIds.has(reference.sourceId), `question sources are not in the ${publishedModule.id} group: ${reference.sourceId}`);
        assert.match(reference.supports, /支持/, `sources must state what they support: ${item.q}`);
      }
    }

    for (const card of publishedModule.cards) {
      assert.ok(sourceIds.has(card.sourceId), `evidence card cites an unknown source: ${card.sourceId}`);
      assert.ok(moduleSourceIds.has(card.sourceId), `evidence-card sources are not in the ${publishedModule.id} group: ${card.sourceId}`);
      assert.ok(card.metric && card.title && card.finding && card.boundary);
    }
  }

  assert.ok(evidenceCards.every((card) => card.title !== "种原始概率形式"));
  assert.ok(ragQa.every((item) => !/RAG-Sequence|RAG-Token/.test(item.q)));
});

test("source freshness rejects impossible, future, and overdue verification dates", () => {
  const now = new Date("2026-07-17T12:00:00Z");
  const productSource = { kind: "官方文档", verifiedAt: "2026-07-17" };

  assert.equal(sourceFreshness(productSource, now).status, "fresh");
  assert.equal(sourceFreshness({ ...productSource, verifiedAt: "2026-02-30" }, now).status, "invalid");
  assert.equal(sourceFreshness({ ...productSource, verifiedAt: "2026-07-18" }, now).status, "future");
  assert.equal(sourceFreshness({ ...productSource, verifiedAt: "2026-04-01" }, now).status, "stale");
  assert.equal(
    sourceFreshness({ kind: "产品规格", verifiedAt: "2026-08-08" }, new Date("2026-09-08T00:00:00Z")).status,
    "stale",
  );
});

test("every shared module has a source-backed learning route and practical labs", async () => {
  const briefModules = publishedModuleRegistry.filter((module) => module.routeKind === "brief");
  // 共享学习与课程内容以内容注册表为准：mcp / a2a / llm-inference 路由改为
  // dedicated 后仍保留共享课程与学习内容（其专用页面与 Reference 分组继续使用）。
  const sharedModules = publishedModuleRegistry.filter((module) => Object.hasOwn(moduleLearningContent, module.slug));
  assert.deepEqual([...moduleLearningSlugs].sort(), sharedModules.map((module) => module.slug).sort());
  assert.deepEqual([...moduleCurriculumSlugs].sort(), sharedModules.map((module) => module.slug).sort());
  assert.equal(Object.keys(moduleLearningContent).length, sharedModules.length);
  assert.equal(Object.keys(moduleCurriculumContent).length, sharedModules.length);
  for (const briefModule of briefModules) {
    assert.ok(moduleLearningSlugs.includes(briefModule.slug), `brief module is missing shared learning content: ${briefModule.slug}`);
  }
  for (const sharedModule of sharedModules) {
    assert.ok(requireModuleContent(sharedModule.slug).qa.length > 0, `${sharedModule.slug} is missing customer question coverage`);
  }

  for (const publishedModuleEntry of sharedModules) {
    const learning = requireModuleLearning(publishedModuleEntry.slug);
    const curriculum = /** @type {any} */ (requireModuleCurriculum(publishedModuleEntry.slug));
    const referenceModule = referenceModules.find((candidate) => candidate.id === publishedModuleEntry.slug);
    assert.ok(referenceModule, `learning route is missing its Reference group: ${publishedModuleEntry.slug}`);
    const moduleSourceIds = new Set(referenceModule.sourceIds);

    assert.ok(learning.outcomes.some((/** @type {any} */ outcome) => outcome.trim()), `learning outcomes are too thin: ${publishedModuleEntry.slug}`);
    assert.ok(learning.route.some((/** @type {any} */ step) => step.title.trim() && step.learn.trim() && step.checkpoint.trim()), `learning route is missing reviewable steps: ${publishedModuleEntry.slug}`);
    assert.equal(new Set(learning.route.map((/** @type {any} */ step) => step.title)).size, learning.route.length, `learning route must not repeat the same judgement: ${publishedModuleEntry.slug}`);
    assert.ok(learning.labs.some((/** @type {any} */ lab) => lab.title.trim() && lab.deliverable.trim()), `labs are too thin: ${publishedModuleEntry.slug}`);
    assert.equal(new Set(learning.labs.map((/** @type {any} */ lab) => lab.title)).size, learning.labs.length, `labs must not repeat the same task via rewording: ${publishedModuleEntry.slug}`);
    assert.ok(curriculum.lead.trim(), `curriculum lead is too thin: ${publishedModuleEntry.slug}`);
    assert.ok(curriculum.chapters.some((/** @type {any} */ chapter) => chapter.title.trim()), `curriculum coverage is too thin: ${publishedModuleEntry.slug}`);
    assert.equal(new Set(curriculum.chapters.map((/** @type {any} */ chapter) => chapter.title)).size, curriculum.chapters.length, `curriculum topics must not repeat: ${publishedModuleEntry.slug}`);

    for (const chapter of curriculum.chapters) {
      assert.ok(chapter.title && chapter.en && chapter.explanation && chapter.decision && chapter.boundary, `incomplete curriculum topic: ${publishedModuleEntry.slug}`);
      assert.ok(chapter.sourceIds.length > 0, `curriculum topic is missing evidence: ${publishedModuleEntry.slug} / ${chapter.title}`);
      for (const sourceId of chapter.sourceIds) {
        assert.ok(sourceLedger[sourceId], `curriculum topic cites an unknown source: ${publishedModuleEntry.slug} / ${sourceId}`);
        assert.ok(moduleSourceIds.has(sourceId), `curriculum sources are not in the ${publishedModuleEntry.slug} Reference group: ${sourceId}`);
      }
    }

    for (const outcome of learning.outcomes) assert.ok(outcome.trim(), `learning outcomes are too vague: ${publishedModuleEntry.slug}`);
    for (const step of learning.route) {
      assert.ok(step.title && step.learn && step.checkpoint, `incomplete learning step: ${publishedModuleEntry.slug}`);
    }
    for (const lab of learning.labs) {
      assert.ok(lab.title && lab.scenario && lab.deliverable && lab.acceptance, `incomplete lab: ${publishedModuleEntry.slug}`);
      assert.ok(lab.tasks.some((/** @type {any} */ task) => task.trim()), `lab is missing executable actions: ${publishedModuleEntry.slug} / ${lab.title}`);
      assert.equal(new Set(lab.tasks).size, lab.tasks.length, `labs must not repeat the same action: ${publishedModuleEntry.slug} / ${lab.title}`);
      assert.ok(lab.sourceIds.length > 0, `lab is missing evidence: ${publishedModuleEntry.slug} / ${lab.title}`);
      assert.equal(new Set(lab.sourceIds).size, lab.sourceIds.length, `lab sources are duplicated: ${publishedModuleEntry.slug} / ${lab.title}`);
      for (const sourceId of lab.sourceIds) {
        assert.ok(sourceLedger[sourceId], `lab cites an unknown source: ${publishedModuleEntry.slug} / ${sourceId}`);
        assert.ok(moduleSourceIds.has(sourceId), `lab sources are not in the ${publishedModuleEntry.slug} Reference group: ${sourceId}`);
      }
    }

    const html = await renderHtml(publishedModuleEntry.path);
    assert.match(html, /id="study-guide"/);
    assert.match(html, /id="curriculum"/);
    if (publishedModuleEntry.slug === "llm-inference") {
      assert.match(html, /<div class="inferenceLearning" id="study-guide">/);
      assert.match(html, /class="learningOutcomeList"/);
      assert.match(html, /class="learningRoute"/);
      assert.match(html, /class="learningLabList"/);
    } else {
      assert.match(html, /(?:学习产出|能独立完成的判断)/);
      assert.match(html, /(?:学习路线|把主题推进到检查点)/);
      assert.match(html, /(?:验证实验|可复核练习)/);
    }
    assert.doesNotMatch(html, /[一二三四五六七八九十\d]+步学习顺序/, `${publishedModuleEntry.slug} route titles must not bind to a fixed count`);
    assert.match(html, /(?:知识地图|主题地图)/);
    assert.doesNotMatch(html, /external_reference|不复刻 PPT|讲义提供覆盖线索/);
  }
});

test("balances arbitrary card counts without hard-coded even or odd layouts", () => {
  for (let maxColumns = 1; maxColumns <= 6; maxColumns += 1) {
    for (let count = 0; count <= 50; count += 1) {
      const items = Array.from({ length: count }, (_, index) => index);
      const rows = balanceRows(items, maxColumns);

      assert.deepEqual(rows.flat(), items, `layouts must keep the original order: ${count} / ${maxColumns}`);
      assert.equal(rows.length, Math.ceil(count / maxColumns), `row counts must be derived from the current count: ${count} / ${maxColumns}`);

      if (rows.length > 0) {
        const sizes = rows.map((row) => row.length);
        assert.ok(Math.max(...sizes) <= maxColumns);
        assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `row counts must not differ by more than 1: ${count} / ${maxColumns}`);
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

      assert.deepEqual(rows.flat(), items, `Grid layouts must keep the original order: ${count} / ${maxColumns}`);

      if (rows.length > 0) {
        const sizes = rows.map((row) => row.length);
        assert.ok(Math.max(...sizes) <= maxColumns);
        assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `Grid row counts must not differ by more than 1: ${count} / ${maxColumns}`);
        for (const row of rows) assert.ok(Number.isInteger(gridSpan(row.length)), `Grid spans must be integers: ${row.length}`);
      }
    }
  }

  assert.deepEqual(balanceGridRows([1, 2, 3, 4, 5], 5).map((row) => row.length), [3, 2]);
  assert.throws(() => gridSpan(5), /must divide/);
  assert.throws(() => balanceGridRows([1], 0), /positive integer/);
});

test("keeps module systems dynamically balanced, searchable, and navigable on mobile", async () => {
  const [styles, v2Styles, v3Styles, homepage, searchIndexSource, interactions, genericModuleRoute, referencesRoute, moduleComponents, publicationRegistry] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/fieldbook-v2.css", import.meta.url), "utf8"),
    readFile(new URL("../app/fieldbook-v3.css", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/search-index.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/fieldbook-interactions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/modules/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/references/page.tsx", import.meta.url), "utf8"),
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
  assert.match(referencesRoute, /const referenceModuleRows = balanceGridRows\(chineseReferenceModules, 4\)/);
  assert.match(referencesRoute, /"--reference-span": gridSpan\(row\.length\)/);
  assert.match(referencesRoute, /data-odd=\{chineseReferenceModules\.length % 2 === 1/);
  assert.match(moduleComponents, /if \(cards\.length === 0\) return null/);
  assert.match(moduleComponents, /const rows = balanceGridRows\(cards, maxColumns\)/);
  assert.match(moduleComponents, /const rows = balanceGridRows\(items, maxColumns\)/);
  assert.match(moduleComponents, /balanceGridRows\(item\.evidence, 3\)/);
  assert.match(moduleComponents, /"--evidence-span": gridSpan\(row\.length\)/);
  assert.match(moduleComponents, /"--qa-evidence-span": gridSpan\(row\.length\)/);
  assert.match(moduleComponents, /data-importance="critical"/);
  assert.match(moduleComponents, /className="balancedGridCell"/);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(styles, /\.mechanicGrid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(styles, /\.balancedGrid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(styles, /\.sourceItem\s*\{[^}]*position:\s*relative/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(styles, /\.sourceAnchorAlias\s*\{[^}]*position:\s*absolute/s);
  for (const [source, variable] of [[styles, "module"], [styles, "concept"], [styles, "mechanic"], [styles, "balanced"], [styles, "evidence"], [styles, "qa-evidence"], [styles, "related"], [styles, "brief"], [styles, "reference"], [v2Styles, "result"], [v2Styles, "search"]]) {
    assert.match(source, new RegExp(`var\\(--${variable}-span,\\s*12\\)`), `--${variable}-span must have a full-width fallback`);
  }
  assert.match(v2Styles, /container-type:\s*inline-size/);
  assert.match(v2Styles, /@container \(max-width: 900px\)/);
  assert.match(v2Styles, /@container \(max-width: 620px\)/);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(v2Styles, /\.subHead h2, \.subHead h3\s*\{[^}]*5cqi[^}]*text-wrap:\s*balance/s);
  assert.match(homepage, /explorerModules/);
  assert.match(homepage, /publishedModuleSlugs\.map/);
  assert.match(homepage, /knowledgeIndexUrl="\/search\/knowledge\.zh\.json"/);
  assert.match(homepage, /<ModuleExplorer[\s\S]*?modules=\{explorerModules\}[\s\S]*?knowledgeIndexUrl=/);
  assert.match(searchIndexSource, /Object\.entries\(moduleCurriculumContent\)/);
  assert.match(searchIndexSource, /Object\.entries\(moduleLearningContent\)/);
  assert.match(searchIndexSource, /type: "课程章节"/);
  assert.match(searchIndexSource, /type: "实战练习"/);
  assert.match(publicationRegistry, /export const publishedModules/);
  assert.match(publicationRegistry, /contentContract/);
  assert.match(interactions, /export function ModuleExplorer/);
  assert.match(interactions, /export function ModuleReadingNav/);
  assert.match(interactions, /export function SystemLens/);
  assert.match(interactions, /export function QaFilterShell/);
  assert.match(interactions, /export function ReferenceFilterShell/);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(v2Styles, /\.moduleResultGrid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(v2Styles, /@media \(max-width: 720px\)[\s\S]*?\.moduleResult,[\s\S]*?grid-column:\s*span 12;/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(styles, /\.moduleHeroTitle\s*\{[^}]*font-size:\s*var\(--module-title-size,/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(styles, /\.moduleHeroTitle\s*\{[^}]*line-height:\s*1;/s);
  assert.doesNotMatch(styles, /#[a-z-]+-title\s*\{/);
  assert.match(styles, /\.layer:nth-child\(7n \+ 1\)/);
  assert.match(styles, /\.layer:nth-child\(7n\)/);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(styles, /\.relatedModuleGrid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(styles, /\.flow\s*\{[^}]*grid-auto-flow:\s*column;[^}]*grid-auto-columns:\s*minmax\(180px,1fr\);/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.doesNotMatch(styles, /\.flow\s*\{[^}]*grid-template-columns:\s*repeat\(\d+,/s);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*?\.flow\s*\{[^}]*grid-auto-flow:\s*row;[^}]*grid-template-columns:\s*1fr;/);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(styles, /\.referenceModuleNav\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  assert.match(styles, /\.relatedModuleGrid\[data-odd="true"\] > a:last-child,[\s\S]*?\.referenceModuleNav\[data-odd="true"\] > a:last-child\s*\{\s*grid-column:\s*span 12;/);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*?\.toplinks\s*\{\s*display:\s*flex;[^}]*width:\s*100%;/);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*?\.mechanicGrid article,[\s\S]*?grid-column:\s*span 12;/);
  assert.doesNotMatch(styles, /@media \(max-width: 720px\)[\s\S]*?\.toplinks\s*\{[^}]*display:\s*none;/);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(v3Styles, /\.fieldbookTheme\[lang="en"\]:not\(\.fieldbookHome\) \.topbar \.toplinks\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);[^}]*overflow:\s*visible;/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(v3Styles, /\.fieldbookTheme\[lang="en"\]:not\(\.fieldbookHome\) \.topbar \.toplinks a\s*\{[^}]*white-space:\s*normal;/s);
});

test("public page shells expose one real skip target after navigation without decorative release labels", async () => {
  const appRoot = new URL("../app/", import.meta.url);
  const pageFiles = (await readdir(appRoot, { recursive: true }))
    .filter((relativePath) => relativePath.endsWith("page.tsx"));

  for (const relativePath of pageFiles) {
    const source = await readFile(new URL(relativePath, appRoot), "utf8");
    assert.doesNotMatch(source, /className="topbar"/, `${relativePath} must delegate its topbar to the shared SiteNav`);
    if (!source.includes("<SiteNav")) continue;
    assert.equal((source.match(/id="main-content"/g) ?? []).length, 1, `${relativePath} must keep exactly one main-content skip target`);
    assert.ok(source.indexOf('id="main-content"') > source.indexOf("<SiteNav"), `${relativePath} skip target must sit after the shared site navigation`);
    assert.doesNotMatch(source, /V2\.0/, `${relativePath} must not show decorative maintenance versions`);
  }
  const siteChromeSource = await readFile(new URL("site-chrome.tsx", appRoot), "utf8");
  assert.equal((siteChromeSource.match(/className="topbar"/g) ?? []).length, 1, "site-chrome.tsx must own the single shared topbar render");

  const publicPageFamilies = [
    { id: "home", zhPath: "/", enPath: "/en" },
    { id: "questions", zhPath: "/questions", enPath: "/en/questions" },
    { id: "glossary", zhPath: "/glossary", enPath: "/en/glossary" },
    { id: "references", zhPath: "/references", enPath: "/en/references" },
    { id: "knowledge-graph", zhPath: "/knowledge-graph", enPath: "/en/knowledge-graph" },
    { id: "model-radar", zhPath: "/model-radar", enPath: "/en/model-radar" },
    { id: "coding-agents", zhPath: "/coding-agents", enPath: "/en/coding-agents" },
  ];
  const publicPageShells = [
    ...publicPageFamilies.flatMap(({ id, zhPath, enPath }) => [
      { id: `zh:${id}`, locale: "zh", path: zhPath },
      { id: `en:${id}`, locale: "en", path: enPath },
    ]),
    ...publishedModuleRegistry.flatMap((module) => [
      { id: `zh:module:${module.slug}`, locale: "zh", path: module.path },
      { id: `en:module:${module.slug}`, locale: "en", path: `/en${module.path}` },
    ]),
  ];
  const skipLinkContracts = {
    zh: { layoutPath: "(zh)/layout.tsx", label: "跳到主要内容" },
    en: { layoutPath: "(en)/layout.tsx", label: "Skip to main content" },
  };

  assert.equal(new Set(publicPageShells.map(({ path }) => path)).size, publicPageShells.length, "the public page-shell inventory must not repeat routes");
  for (const { layoutPath, label } of Object.values(skipLinkContracts)) {
    const source = await readFile(new URL(layoutPath, appRoot), "utf8");
    assert.match(source, new RegExp(`className="skipLink" href="#main-content">${escapeRegExp(label)}<`), `${layoutPath} must provide a localized skip link`);
  }
  const renderedPublicPageShells = await Promise.all(publicPageShells.map(async (page) => ({ ...page, html: await renderHtml(page.path) })));
  for (const { id, locale, path, html } of renderedPublicPageShells) {
    const { label } = skipLinkContracts[/** @type {keyof typeof skipLinkContracts} */ (locale)];
    assert.match(html, new RegExp(`<a class="skipLink" href="#main-content">${escapeRegExp(label)}</a>`), `${id} must render the localized skip link`);
    assert.equal((html.match(/class="skipLink" href="#main-content"/g) ?? []).length, 1, `${path} must keep exactly one skip link`);
    assert.equal((html.match(/id="main-content"/g) ?? []).length, 1, `${path} must keep exactly one main-content skip target`);
    assert.ok(html.indexOf('id="main-content"') > html.indexOf("</nav>"), `${path} skip target must sit after the navigation`);
    assert.doesNotMatch(html, /V2\.0/, `${path} must not show decorative maintenance versions`);
    const headingLevels = [...html.matchAll(/<h([1-6])(?=[\s>])/g)].map((match) => Number(match[1]));
    assert.ok(!headingLevels.slice(1).some((level, index) => headingLevels[index] === 2 && level === 4), `${path} must not skip from h2 to h4`);
  }

  const unifiedHero = await readFile(new URL("unified-module-hero.tsx", appRoot), "utf8");
  assert.equal((unifiedHero.match(/id="main-content"/g) ?? []).length, 1, "the shared module Hero must keep exactly one main-content skip target");
  assert.ok(unifiedHero.indexOf('id="main-content"') > unifiedHero.indexOf("</nav>"), "the shared module Hero skip target must sit after the navigation");
});

test("shared responsive interactions preserve explicit state, keyboard safety, and usable mobile controls", async () => {
  const [interactions, glossary, radar, graph, pilotViews, englishReader, v3Styles, graphStyles] = await Promise.all([
    readFile(new URL("../app/fieldbook-interactions.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/glossary-explorer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/model-radar-explorer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/knowledge-graph/design-2/knowledge-constellation.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/module-pilot-views.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n/english-pilot-module-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/fieldbook-v3.css", import.meta.url), "utf8"),
    readFile(new URL("../app/knowledge-graph/design-2/knowledge-constellation.module.css", import.meta.url), "utf8"),
  ]);

  assert.ok((interactions.match(/aria-pressed=/g) ?? []).length >= 10, "shared filters must expose the selected state to assistive tech");
  assert.match(glossary, /aria-pressed=\{groupId === group\.id\}/);
  assert.match(radar, /className="modelPosterBenchmarkTabs" role="group"/);
  assert.match(radar, /aria-pressed=\{benchmark\.sourceId === benchmarkId\}/);
  assert.doesNotMatch(radar, /role="tablist"|role="tab"/);
  assert.doesNotMatch(radar, /<tr[\s\S]{0,180}onClick=/, "Radar rows must not pretend to be whole-row clickable controls");

  assert.match(graph, /aria-hidden=\{mobileRail && !railOpen \? true : undefined\}/);
  assert.match(graph, /inert=\{mobileRail && !railOpen \? true : undefined\}/);
  assert.match(graph, /event\.key !== "Escape"/);
  assert.match(graph, /pickerRef\.current\?\.focus\(\)/);
  assert.match(graph, /aria-controls=\{deferredQuery \? searchResultsId : undefined\}/);

  assert.match(pilotViews, /role="columnheader"/);
  assert.match(pilotViews, /role="rowheader"/);
  assert.match(pilotViews, /role="cell"/);
  assert.match(englishReader, /replace\(\/\^Ask the customer:/);
  assert.match(englishReader, /function readerBlockTitle\(block: ContentBlock, sectionId: string\)/);
  assert.match(englishReader, /sectionId\.endsWith\("-curriculum"\)/);
  assert.match(englishReader, /<h3>\{title \?\? "Critical boundary"\}<\/h3>/);

  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(v3Styles, /\.fieldbookTheme\.modulePage \.moduleReadingNav\s*\{[^}]*overflow:\s*auto;/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(v3Styles, /@media \(max-width: 980px\)[\s\S]*?\.fieldbookTheme\.modulePage \.moduleReadingNav\s*\{[^}]*overflow-x:\s*auto;[^}]*overflow-y:\s*hidden;/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.doesNotMatch(v3Styles, /\.fieldbookTheme\.modulePage \.moduleReadingNav\s*\{[^}]*overflow:\s*hidden;/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(graphStyles, /@media \(max-width: 600px\)[\s\S]*?\.canvas\s*\{\s*bottom:\s*140px;/s);
  // @ts-expect-error the es2017 target does not recognize the dotAll flag; the regex body must not change
  assert.match(graphStyles, /\.canvasControls button\s*\{\s*width:\s*44px;\s*height:\s*44px;/s);
});

test("source URLs have one code owner and are absent from content and route files", async () => {
  const [referenceContent, ragContent, agentContent, promptContent, homepage, ragRoute, agentRoute, promptRoute, referencesRoute, moduleComponents] = await Promise.all([
    readFile(new URL("../app/reference-content.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/rag-content.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/agent-content.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/prompt-content.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/modules/rag/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/modules/ai-agent/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/modules/prompt-engineering/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/references/page.tsx", import.meta.url), "utf8"),
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
    assert.ok(referenceContent.includes(source.href), `the unified source file is missing the URL: ${source.href}`);
    for (const fileContent of nonLedgerFiles) {
      assert.ok(!fileContent.includes(source.href), `non-ledger files must not maintain URLs: ${source.href}`);
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
    assert.doesNotMatch(withoutPublicSiteUrl, /https?:\/\//, `external source URLs may only live in the unified ledger: app/${relativePath}`);
  }
});

test("project docs require independent routes, one reference page, and main-only production", async () => {
  const [
    standard,
    moduleStandard,
    qualityGates,
    maintenance,
    repositoryWorkflow,
    agentRules,
    layout,
    globalStyles,
    packageJson,
    kbConfigText,
  ] = await Promise.all([
    readFile(new URL("../docs/CONTENT-DESIGN-STANDARD.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/MODULE-BUILD-STANDARD.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/MODULE-QUALITY-GATES.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/CONTENT-MAINTENANCE.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/REPOSITORY-WORKFLOW.md", import.meta.url), "utf8"),
    readFile(new URL("../AGENTS.md", import.meta.url), "utf8"),
    readFile(new URL("../app/(zh)/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../kb.config.json", import.meta.url), "utf8"),
  ]);
  const kbConfig = JSON.parse(kbConfigText);

  assert.match(standard, /每个模块使用独立页面|所有来源集中在独立|动态均衡卡片|相关模块|仅当公式直接帮助售前做架构、选型或风险判断时展示|MODULE-BUILD-STANDARD\.md/);
  assert.match(standard, /\/references/);
  assert.match(moduleStandard, /机制与组件完整性|每个关键动作和组件都必须分别讲清|定义.*机制.*边界.*判断.*证据|不为图、卡片、案例、问答或来源设置数量指标|页面统一使用“相关模块”，不用“模块依赖”|技术环节—云能力—客户价值—发现问题—验收指标|每道问题至少包含|公式必须同时满足以下条件|balanceGridRows\(items, maxColumns\)/);
  assert.match(moduleStandard, /内部巡检流程、责任人、字段 schema、发布步骤和构建状态不得公开|MODULE-QUALITY-GATES\.md|发布注册|面向读者的中文优先使用具体名词和日常动词|首次出现必须先给普通中文解释/);

  assert.match(qualityGates, /历史问题 → 永久门禁|原理深度|术语中英|云服务连接|动态构图|Portable|Reference|时效性|普通中文|新模块 Definition of Done|新的系统性问题/);

  assert.match(maintenance, /完整来源台账只呈现在 `\/references`|`main` 推送后的公开发布|非 `main` 分支.*不得更新公开 Site|实时 `origin\/main`|轮询至成功/);

  assert.match(repositoryWorkflow, /`main` 是唯一生产分支|同一个任务换设备继续原分支|任务分支.*不能生成生产候选|最新 Sites source SHA = origin\/main/);

  assert.match(agentRules, /每个知识模块使用独立地址 `\/modules\/<slug>`|`\/references` 是全站唯一的公开来源台账|`main` 是唯一生产分支|非 `main` 分支推送后不得更新公开站点|实时 `origin\/main`|轮询到发布成功|MODULE-QUALITY-GATES\.md|module-publication\.mjs|terminology\.mjs|默认匿名可读|新的系统性问题/);

  assert.equal(kbConfig.publishing.sourceRepository.productionRemote, "origin");
  assert.equal(kbConfig.publishing.sourceRepository.productionBranch, "main");

  assert.match(layout, /lang="zh-CN"/);
  assert.doesNotMatch(layout, /Noto_Serif_SC/, "large-character-set Chinese fonts must not be registered and preloaded by next/font");
  assert.match(globalStyles, /--font-serif:[^;]*Songti SC[^;]*Noto Serif CJK SC/, "Chinese headings must keep a portable system font stack");
  assert.match(moduleStandard, /大字符集中文字体不得通过 `next\/font`/);
  assert.match(qualityGates, /响应 `Link` 头不含大字符集中文字体分片/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(packageJson, /--ignore-pattern outputs/, "release and portable outputs must not re-enter source lint");
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
