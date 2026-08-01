import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { englishModuleRegistry, englishQuestions, englishSourceCopy, englishTermCopy } from "../app/i18n/en/registry.mjs";
import { englishRepresentationAssessment } from "../app/i18n/english-representation-assessment.mjs";
import { buildEnglishSectionGroups, focusedEnglishModuleSlugs, focusedSectionRoleOrder, sharedSectionRoleOrder } from "../app/i18n/english-section-outline.mjs";
import { englishModuleSlugs } from "../app/i18n/locale-config.mjs";
import { moduleBriefs } from "../app/module-brief-content.mjs";
import { requireModuleContent } from "../app/module-content-registry.mjs";
import { getPublishedModule, hasDedicatedModule, publishedModuleSlugs } from "../app/module-publication.mjs";
import { sourceLedger } from "../app/reference-content.mjs";
import { terminology } from "../app/terminology.mjs";

const slugIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

test("English edition registers every published module", () => {
  assert.equal(englishModuleSlugs.length, 21);
  assert.deepEqual([...englishModuleSlugs], [...publishedModuleSlugs]);
  assert.deepEqual(Object.keys(englishModuleRegistry).sort(), [...publishedModuleSlugs].sort());
  assert.equal(englishQuestions.length, publishedModuleSlugs.reduce((total, slug) => total + requireModuleContent(slug).qa.length, 0));
});

test("shared English modules preserve canonical related-module routes and order", () => {
  for (const [slug, canonical] of Object.entries(moduleBriefs)) {
    assert.equal(canonical.relatedSlugs.includes(slug), false, `${slug} relatedSlugs must not link to itself`);
    assert.equal(new Set(canonical.relatedSlugs).size, canonical.relatedSlugs.length, `${slug} relatedSlugs must be unique`);
    assert.deepEqual(
      englishModuleRegistry[slug].relatedSlugs,
      canonical.relatedSlugs,
      `${slug} relatedSlugs must remain bilingual and order-stable`,
    );
  }
});

test("English edition preserves canonical question order, evidence relationships, and dates", () => {
  for (const slug of englishModuleSlugs) {
    const english = englishModuleRegistry[slug];
    const chinese = requireModuleContent(slug);
    assert.equal(english.qa.length, chinese.qa.length, `${slug} question parity`);
    assertUniqueIds(english.qa, `${slug} question`);
    english.qa.forEach((item, index) => {
      const canonical = chinese.qa[index];
      assert.deepEqual(item.evidence.map((entry) => entry.sourceId), canonical.evidence.map((entry) => entry.sourceId), `${slug} / ${item.id} evidence source order`);
      assert.equal(item.addedAt ?? null, canonical.addedAt ?? null, `${slug} / ${item.id} addedAt must remain canonical`);
    });
  }
});

test("English evidence cards keep canonical source relationships", () => {
  for (const slug of englishModuleSlugs) {
    const english = englishModuleRegistry[slug];
    const chinese = requireModuleContent(slug);
    assert.equal(english.evidenceCards.length, chinese.evidenceCards.length, `${slug} evidence-card parity`);
    assertUniqueIds(english.evidenceCards, `${slug} evidence card`);
    assert.deepEqual(english.evidenceCards.map((card) => card.sourceId), chinese.evidenceCards.map((card) => card.sourceId), `${slug} evidence-card source order`);
  }
});

test("Batch 05 English content preserves the Agent adoption gate and MCP control model", () => {
  const agent = JSON.stringify(englishModuleRegistry["ai-agent"]);
  assert.match(agent, /Four implementation levels/);
  assert.match(agent, /final eligibility, settlement amount/);
  assert.match(agent, /There is no universal ROI threshold/);

  const mcp = JSON.stringify(englishModuleRegistry.mcp);
  assert.match(mcp, /Start with repeated integration, not protocol enthusiasm/);
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
  assert.equal(gateway.qa.length, 14);
  assert.equal(gateway.qa.at(-2).id, "gateway-credential-not-user-authority");
  assert.equal(gateway.qa.at(-1).id, "request-rate-limit-not-enough");
  assert.equal(gateway.qa.at(-2).addedAt, "2026-08-01");
  assert.equal(gateway.qa.at(-1).addedAt, "2026-08-01");
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

test("English sections and rendered object anchors use stable, unique IDs", () => {
  const generatedPageSectionIds = new Set(["evidence", "qa"]);
  for (const slug of englishModuleSlugs) {
    const english = englishModuleRegistry[slug];
    assertUniqueIds(english.sections, `${slug} section`);
    english.sections.forEach((section) => assert.ok(!generatedPageSectionIds.has(section.id), `${slug} section ID ${section.id} conflicts with a generated page section`));
    const sectionItemIds = english.sections.flatMap((section) => section.blocks.flatMap((block) => block.items.map((item) => item.id)));
    assert.equal(new Set(sectionItemIds).size, sectionItemIds.length, `${slug} section-item IDs must be unique`);
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
  Object.keys(englishSourceCopy).forEach((sourceId) => assert.ok(sourceLedger[sourceId]));
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
  const [englishHome, englishModulePage, englishLayout] = await Promise.all([
    readFile(new URL("../app/en/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n/english-pilot-module-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/en/layout.tsx", import.meta.url), "utf8"),
  ]);
  ["fieldbookHome", "hero heroV2", "topbar", "heroGrid heroGridV2", "heroDecisionPanel", "fieldbookPromise", "promiseGrid"].forEach((className) => assert.match(englishHome, new RegExp(className)));
  ["modulePageHero moduleBriefHero", "moduleArticleLayout", "moduleBriefSection", "evidenceGrid", "qaList"].forEach((className) => assert.match(englishModulePage, new RegExp(className)));
  assert.match(englishModulePage, /ModuleReadingNav/);
  assert.match(englishModulePage, /ModuleHeroMetrics/);
  assert.doesNotMatch(`${englishHome}\n${englishModulePage}\n${englishLayout}`, /import\s+["'][^"']+\.css["']/, "English routes must not introduce a separate visual stylesheet");
});

test("English home and knowledge graph expose the same interactive discovery capabilities", async () => {
  const [englishHome, englishGraph, englishGraphData, englishLayout] = await Promise.all([
    readFile(new URL("../app/en/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/en/knowledge-graph/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n/en/graph-data.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/en/layout.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(englishHome, /KnowledgeSearchLaunch/);
  assert.match(englishHome, /ModuleExplorer/);
  assert.match(englishHome, /knowledgeSearchEntries/);
  assert.match(englishHome, /learningPathsV2/);
  assert.match(englishHome, /\/en\/knowledge-graph/);
  assert.match(englishGraph, /KnowledgeConstellation/);
  assert.match(englishGraph, /language="en"/);
  assert.match(englishGraphData, /englishGraphModules/);
  assert.match(englishGraphData, /englishGraphTerms/);
  assert.match(englishLayout, /DocumentLanguage lang="en"/);
});

test("reader-facing English routes use interface space for knowledge instead of language-status labels", async () => {
  const routeSources = await Promise.all([
    "../app/en/page.tsx",
    "../app/en/questions/page.tsx",
    "../app/en/glossary/page.tsx",
    "../app/en/references/page.tsx",
    "../app/en/layout.tsx",
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
  assert.match(englishModulePage, /usesFocusedReadingProfile \? relatedSection : null/, "focused pages must place related modules after the main argument");
  for (const slug of englishModuleSlugs) assert.ok(getPublishedModule(slug), `${slug} needs a canonical bilingual publication contract`);
  for (const [slug, module] of Object.entries(englishModuleRegistry)) {
    if (!module.primer) continue;
    assert.equal(module.primer.id, getPublishedModule(slug).knowledgeView, `${slug} explicit primer must use the canonical knowledge-view ID`);
    assert.ok(module.primer.steps.length >= 3, `${slug} explicit primer needs a real mechanism sequence`);
    assert.ok(module.primer.checks.length >= 3, `${slug} explicit primer needs decision checks`);
    module.primer.termIds.forEach((termId) => assert.ok(module.terms[termId], `${slug} primer term must resolve to English copy`));
  }
});

test("English content representation is assessed block by block without a visual quota", () => {
  assert.deepEqual(Object.keys(englishRepresentationAssessment).sort(), [...englishModuleSlugs].sort());
  const visualCounts = Object.values(englishRepresentationAssessment).map((assessment) => assessment.visualStepCount);
  assert.ok(visualCounts.includes(0), "some modules should remain prose-first when their steps are learning guidance");
  assert.ok(Math.max(...visualCounts) > 2, "relationship-rich modules may need several interactive views");
  assert.ok(new Set(visualCounts).size >= 4, "visual counts should vary with the authored relationships");

  for (const [slug, module] of Object.entries(englishModuleRegistry)) {
    const expectedBlockCount = module.sections.reduce((total, section) => total + section.blocks.length, 0);
    const assessment = englishRepresentationAssessment[slug];
    assert.equal(assessment.blocks.length, expectedBlockCount, `${slug} must assess every English content block`);
    assert.equal(
      assessment.blocks.filter((block) => block.representation === "editorial-steps").length,
      module.sections.flatMap((section) => section.blocks).filter((block) => block.type === "steps").length - assessment.visualStepCount,
      `${slug} must keep non-relational step content as readable prose`,
    );
  }
});

test("shared English sidebars preserve the canonical reading-role order", async () => {
  for (const slug of englishModuleSlugs.filter((moduleSlug) => !hasDedicatedModule(moduleSlug))) {
    const roles = buildEnglishSectionGroups(englishModuleRegistry[slug]).map((group) => group.role);
    const expectedRoles = focusedEnglishModuleSlugs.includes(slug) ? focusedSectionRoleOrder : sharedSectionRoleOrder;
    assert.deepEqual(roles, expectedRoles, `${slug} must provide the correct canonical sidebar roles in order`);
  }

  const mcpGroups = buildEnglishSectionGroups(englishModuleRegistry.mcp);
  assert.deepEqual(mcpGroups.map((group) => group.role), ["principle", "decision", "deep", "cloud"]);
  assert.deepEqual(mcpGroups.map((group) => group.label), [
    "Core mechanisms",
    "Solution choices",
    "Turn capability invocation into a verifiable authorization and execution chain",
    "Cloud connections",
  ]);

  const englishModulePage = await readFile(new URL("../app/i18n/english-pilot-module-page.tsx", import.meta.url), "utf8");
  assert.ok(englishModulePage.indexOf("mainGroups.map") < englishModulePage.indexOf('id="evidence"'), "main reading roles must render before evidence");
  assert.ok(englishModulePage.indexOf('id="evidence"') < englishModulePage.lastIndexOf("cloudGroups.map"), "evidence must render before cloud connections");
});

test("Chinese global entry pages expose their matching English routes", async () => {
  const routes = [
    ["../app/page.tsx", "/en"],
    ["../app/questions/page.tsx", "/en/questions"],
    ["../app/glossary/page.tsx", "/en/glossary"],
    ["../app/references/page.tsx", "/en/references"],
  ];
  for (const [file, englishHref] of routes) {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    assert.match(source, new RegExp(`href=["'{\\s]*${englishHref.replaceAll("/", "\\/")}`), `${file} must link to ${englishHref}`);
    assert.match(source, /hrefLang="en"/);
  }
});

test("English routes and all Chinese module page families expose reciprocal language paths", async () => {
  const [sharedZh, ragZh, agentZh, promptZh, enHome, enShared, enRag, enModulePage] = await Promise.all([
    readFile(new URL("../app/modules/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/modules/rag/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/modules/ai-agent/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/modules/prompt-engineering/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/en/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/en/modules/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/en/modules/rag/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/i18n/english-pilot-module-page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(sharedZh, /englishModulePath/);
  assert.match(ragZh, /ragEnglishPath/);
  assert.match(agentZh, /agentEnglishPath/);
  assert.match(promptZh, /promptEnglishPath/);
  assert.doesNotMatch(enHome, />English pilot</i);
  assert.match(enShared, /EnglishModulePage/);
  assert.match(enRag, /EnglishModulePage/);
  assert.match(enModulePage, /englishSourceCopy/, "English module pages must render localized source labels");
  assert.doesNotMatch(enModulePage, /sourceLedger\[evidence\.sourceId\]\?\.(?:kind|shortTitle)/, "English QA evidence must not render Chinese canonical labels");
});
