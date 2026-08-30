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
  focusedEnglishModuleSlugs,
  focusedSectionRoleOrder,
  selectVisibleEnglishEvidenceCards,
  selectVisibleEnglishQuestions,
  selectVisibleEnglishSectionGroups,
  sharedSectionRoleOrder,
} from "../app/i18n/english-section-outline.mjs";
import { englishModuleSlugs } from "../app/i18n/locale-config.mjs";
import { moduleBriefs } from "../app/module-brief-content.mjs";
import { requireModuleContent } from "../app/module-content-registry.mjs";
import { getPublishedModule, hasDedicatedModule, publishedModuleSlugs } from "../app/module-publication.mjs";
import { sourceLedger } from "../app/reference-content.mjs";
import { terminology } from "../app/terminology.mjs";
import { getUnifiedBriefModuleConfig, unifiedBriefModuleSlugs } from "../app/unified-brief-module-config.mjs";
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
  assert.equal(englishModuleSlugs.length, 23);
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
    if (deferredSlugs.has(slug)) {
      assert.ok(defermentsRegistry.deferments.some((deferment) => deferment.moduleSlug === slug), `${slug} deferred module must carry a deferment record`);
      continue;
    }
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
    if (deferredSlugs.has(slug)) continue;
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

test("Batch 07 English content preserves the training contract and predictive rollback boundaries", async () => {
  const training = englishModuleRegistry["llm-training"];
  const trainingIds = training.qa.map((item) => item.id);
  assert.equal(training.qa.length, 10);
  assert.equal(trainingIds.includes("gpu-scaling-efficiency"), false);
  assert.equal(trainingIds.includes("scaling-law-task-boundary"), false);
  assert.match(JSON.stringify(training), /run manifest/);
  assert.match(JSON.stringify(training), /asynchronous completion/i);
  assert.match(JSON.stringify(training), /not guarantee bitwise|do not promise cross-platform bitwise|not promising bitwise identity/i);
  const modelCompute = training.sections
    .find((section) => section.id === "deep-dive")
    .blocks.flatMap((block) => block.items)
    .find((item) => item.id === "deep-model-compute");
  assert.deepEqual(modelCompute.sourceIds, ["megatron-3d-parallelism-2021"]);
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
  assert.equal(predictive.qa.length, 10);
  assert.equal(predictive.qa.at(-1).id, "predictive-rollback-bundle");
  assert.equal(predictive.qa.at(-1).addedAt, "2026-08-01");
  assert.match(JSON.stringify(predictive), /seven production signals/i);
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
  assert.equal(inference.qa.length, 14);
  assert.equal(inference.qa[0].id, "same-model-different-speed");
  assert.equal(inference.qa.at(-1).id, "maximum-context-admission");
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
  assert.equal(compute.qa.length, 12);
  assert.equal(compute.qa[0].id, "peak-compute-not-speed");
  assert.equal(compute.qa.at(-1).id, "heterogeneous-supply-risk");
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
  assert.equal(platform.qa.length, 12);
  assert.equal(platform.qa.at(-1).id, "containerized-not-fully-portable");
  assert.equal(platform.qa.at(-1).addedAt, "2026-08-01");
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
  assert.equal(solution.qa.length, 20);
  assert.equal(solution.qa[0].id, "solution-versus-model-api");
  assert.equal(solution.qa.at(-1).id, "claim-intake-prohibited-actions");
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
  assert.match(englishHome, /knowledgeSearchEntries/);
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
  assert.ok(englishModulePage.indexOf("visibleMainGroups.map") < englishModulePage.indexOf('id="evidence"'), "main reading roles must render before evidence");
  assert.ok(englishModulePage.indexOf('id="evidence"') < englishModulePage.lastIndexOf("cloudGroups.map"), "evidence must render before cloud connections");
});

test("a dedicated focused English module keeps its complete authored reader instead of a preview", () => {
  const rag = englishModuleRegistry.rag;
  const ragGroups = buildEnglishSectionGroups(rag);
  assert.deepEqual(selectVisibleEnglishSectionGroups(rag).map((group) => group.id), ragGroups.map((group) => group.id));
  assert.equal(selectVisibleEnglishEvidenceCards(rag).length, rag.evidenceCards.length);
  assert.equal(selectVisibleEnglishQuestions(rag).length, rag.qa.length);

  const mcp = englishModuleRegistry.mcp;
  assert.deepEqual(selectVisibleEnglishSectionGroups(mcp).map((group) => group.role), ["decision", "deep", "cloud"], "focused brief modules retain their reviewed main-argument preview");
  assert.equal(selectVisibleEnglishEvidenceCards(mcp).length, 4);
  assert.equal(selectVisibleEnglishQuestions(mcp).length, 5);
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
  assert.equal(governance.qa.length, 15);
  assert.equal(governance.qa.at(-4).id, "china-private-deployment-triage");
  assert.equal(governance.qa.at(-1).id, "claim-intake-governance-boundary");
  assert.deepEqual(governance.qa.at(-2).evidence.map((item) => item.sourceId), ["china-ai-content-labeling-2026-08-05", "china-ai-service-management"]);
  assert.match(JSON.stringify(governance), /Successful generation, content review, labeling, and business approval for publication are four distinct control states/);
  assert.doesNotMatch(JSON.stringify(governance), /Generation succeeding|align filing thresholds/);
  const governanceLab = governance.sections
    .find((section) => section.id === "governance-study-guide")
    .blocks.flatMap((block) => block.items)
    .find((item) => item.id === "governance-lab-china-delivery-evidence");
  assert.deepEqual(governanceLab.sourceIds, ["china-ai-content-labeling-2026-08-05", "gb-45438-2025", "nist-ai-rmf"]);
  const governanceLabeling = governance.sections
    .find((section) => section.id === "governance-deep-dive")
    .blocks.flatMap((block) => block.items)
    .find((item) => item.id === "governance-obligation-labeling");
  assert.deepEqual(governanceLabeling.sourceIds, ["china-ai-content-labeling-2026-08-05", "china-ai-service-management"]);

  const modelLandscape = englishModuleRegistry["model-landscape"];
  assert.equal(modelLandscape.qa.length, 15);
  assert.equal(modelLandscape.qa.at(-3).id, "platform-catalog-claim-boundary");
  assert.equal(modelLandscape.qa.at(-1).id, "domestic-international-model-comparison");
  const maasTable = modelLandscape.sections
    .find((section) => section.id === "deep-dive")
    .blocks.find((block) => block.type === "table" && block.title === "Eight procurement dimensions for Model-as-a-Service");
  assert.ok(maasTable);
  assert.ok(maasTable.items.every((item) => item.sourceIds?.length), "every MaaS procurement dimension must render its source links");
  assert.deepEqual(maasTable.items[0].sourceIds, ["nist-genai-profile", "openai-models", "google-models", "anthropic-models"]);
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
  assert.equal(security.qa.length, 11);
  assert.deepEqual(security.qa.at(-3).evidence.map((item) => item.sourceId), ["china-ai-content-labeling-2026-08-05"]);
  assert.deepEqual(security.qa.at(-2).evidence.map((item) => item.sourceId), ["nist-sp-800-61r3", "c2pa-2-4"]);
  assert.deepEqual(security.qa.at(-1).evidence.map((item) => item.sourceId), ["owasp-prompt-injection", "nist-zero-trust"]);
  const securityCopy = JSON.stringify(security);
  assert.match(securityCopy, /specific Article 9 scenario/);
  assert.match(securityCopy, /does not independently establish the truth of assertions, a signer's real-world identity or authority/);
  assert.match(securityCopy, /parse it in isolation, retain provenance and trust labels/);

  const multimodal = englishModuleRegistry.multimodal;
  assert.equal(multimodal.qa.length, 14);
  assert.equal(multimodal.evidenceCards.length, 6);
  const multimodalCurriculum = multimodal.sections.find((section) => section.id === "multimodal-curriculum");
  assert.equal(multimodalCurriculum.blocks[0].items.length, 12);
  const multimodalPractice = multimodal.sections.find((section) => section.id === "multimodal-practice");
  assert.equal(multimodalPractice.blocks.find((block) => block.title === "Four practice labs").items.length, 4);
  assert.deepEqual(
    multimodalCurriculum.blocks[0].items.find((item) => item.id === "chapter-barge-in-state-recovery").sourceIds,
    ["nist-genai-profile", "opentelemetry-semconv", "opentelemetry-genai-semconv"],
  );
  assert.match(JSON.stringify(multimodal), /Generation, content review, disclosure and distribution requirements, authorized release, and post-release accountability are independent states/);
  assert.match(JSON.stringify(multimodal), /C2PA validation checks the integrity of recorded provenance assertions and their binding to an asset/);

  const solution = englishModuleRegistry["solution-patterns"];
  assert.equal(solution.qa.length, 20);
  assert.equal(solution.qa.at(-1).id, "claim-intake-prohibited-actions");
  assert.equal(solution.qa.at(-1).addedAt, "2026-08-05");
  const solutionCurriculum = solution.sections.find((section) => section.id === "solution-pattern-curriculum");
  assert.equal(solutionCurriculum.blocks[0].items.length, 25);
  const chinaChapter = solutionCurriculum.blocks[0].items.find((item) => item.id === "solution-chapter-china-delivery-evidence");
  assert.deepEqual(chinaChapter.sourceIds, ["china-ai-content-labeling-2026-08-05", "gb-45438-2025", "nist-genai-profile"]);
  const claimsBlueprint = solution.sections
    .find((section) => section.id === "solution-deep-dive")
    .blocks.find((block) => block.title === "Teaching blueprint: insurance claims intake and preliminary review");
  assert.equal(claimsBlueprint.items.length, 9);
  assert.match(JSON.stringify(solution), /must not automatically assess damage, deny a claim, determine eligibility or amount, or initiate payment/);
  assert.doesNotMatch(JSON.stringify(solution), /filing or registration triage/);
});

test("Batch 12 English content preserves protocol, memory, and evaluation boundaries", () => {
  const a2a = englishModuleRegistry.a2a;
  assert.deepEqual(Object.keys(a2a.sources), [
    "a2a-concepts", "a2a-specification", "a2a-mcp-boundary", "mcp-tasks-extension", "anthropic-effective-agents",
    "opentelemetry-semconv", "opentelemetry-genai-semconv", "nist-genai-profile", "nist-zero-trust", "a2a-release-1-0-1",
  ]);
  const a2aCopy = JSON.stringify(a2a);
  assert.match(a2aCopy, /protocol-level COMPLETED state/);
  assert.match(a2aCopy, /reconcile side effects with the business system/);
  assert.doesNotMatch(a2aCopy, /mcp-architecture|a2a-spec-1-0-0/);

  const agent = englishModuleRegistry["ai-agent"];
  assert.equal(agent.qa.length, 28);
  assert.equal(agent.evidenceCards.length, 6);
  const memorySection = agent.sections.find((section) => section.id === "agent-memory-poisoning");
  assert.equal(memorySection.blocks[0].items.length, 5);
  assert.deepEqual(memorySection.blocks[0].items[0].sourceIds, ["aws-agentcore-memory", "nist-genai-profile", "owasp-llm-top-ten"]);
  const lowCodeSection = agent.sections.find((section) => section.id === "agent-low-code-choice");
  assert.equal(lowCodeSection.blocks[0].items.length, 6);
  assert.deepEqual(lowCodeSection.blocks[0].items[1].sourceIds, ["mcp-specification-2026-07-28"]);
  assert.match(JSON.stringify(agent), /Lab attack rates do not predict production incidence/);

  const evaluation = englishModuleRegistry.evaluation;
  assert.equal(evaluation.qa.length, 11);
  assert.equal(evaluation.evidenceCards.length, 4);
  const evaluationCurriculum = evaluation.sections.find((section) => section.id === "evaluation-curriculum");
  const courseChapters = evaluationCurriculum.blocks.find((block) => block.title === "Nine course chapters");
  assert.equal(courseChapters.items.length, 9);
  assert.deepEqual(courseChapters.items.find((item) => item.id === "chapter-evaluation-handoff").sourceIds, ["nist-ai-800-4", "opentelemetry-genai-semconv"]);
  const benchmarkAtlas = evaluation.sections.find((section) => section.id === "evaluation-benchmark-atlas");
  assert.equal(benchmarkAtlas.blocks[0].items.length, 6);
  assert.deepEqual(benchmarkAtlas.blocks[1].items[0].sourceIds, ["swe-bench", "terminal-bench", "beir-2021", "webarena-2024", "harness-bench-2026", "longvideobench-2024", "openai-eval-best-practices"]);
  const evaluationStudyGuide = evaluation.sections.find((section) => section.id === "evaluation-study-guide");
  const evaluationRoute = evaluationStudyGuide.blocks.find((block) => block.title === "Recommended learning route");
  assert.equal(evaluationRoute.items.length, 6);
  assert.deepEqual(evaluationRoute.items.slice(-2).map((item) => item.id), ["route-freeze-complete-evaluation-contract", "route-report-uncertainty-and-handoff"]);
  assert.equal(evaluationStudyGuide.blocks.find((block) => block.title === "Practice labs").items.length, 4);
  assert.match(JSON.stringify(evaluation), /A leaderboard is a screening input/);
  assert.doesNotMatch(JSON.stringify(evaluation), /cost per accepted/i);
});

test("Batch 13 English content preserves data, tuning, and MCP boundaries", () => {
  const data = englishModuleRegistry["data-engineering"];
  assert.equal(data.qa.length, 11);
  assert.equal(data.evidenceCards.length, 5);
  assert.equal(data.qa.at(-1).id, "cross-border-vectorized-data");
  assert.equal(data.qa.at(-1).addedAt, "2026-08-05");
  assert.deepEqual(data.qa.at(-1).evidence.map((item) => item.sourceId), ["china-personal-information-protection-law", "china-data-cross-border-2024"]);
  assert.deepEqual(Object.keys(data.sources), [
    "docling-report", "w3c-prov-o", "openlineage-spec", "iso-iec-5259-2", "nist-zero-trust", "hnsw-2016", "nist-genai-profile",
    "china-personal-information-protection-law", "china-data-cross-border-2024", "pp-ocr-2020", "opentelemetry-semconv",
  ]);
  const dataCurriculum = data.sections.find((section) => section.id === "curriculum");
  assert.equal(dataCurriculum.blocks[0].items.length, 10);
  assert.deepEqual(dataCurriculum.blocks[0].items.find((item) => item.id === "curriculum-data-readiness-triage").sourceIds, ["nist-genai-profile", "nist-zero-trust", "w3c-prov-o"]);
  const dataPractice = data.sections.find((section) => section.id === "study-guide");
  assert.equal(dataPractice.blocks.find((block) => block.title === "Practice labs").items.length, 4);
  const dataPrinciples = data.sections.find((section) => section.id === "principles");
  assert.equal(dataPrinciples.blocks[0].items.length, 9);
  assert.match(JSON.stringify(data), /Chunking, embeddings, vectorization, or caching do not by themselves change the data classification/);
  assert.doesNotMatch(JSON.stringify(data), /Governability|withdrawable|Acceptance:/);

  const fineTuning = englishModuleRegistry["fine-tuning"];
  assert.equal(fineTuning.qa.length, 11);
  assert.equal(fineTuning.evidenceCards.length, 3);
  assert.deepEqual(fineTuning.qa[3].evidence.map((item) => item.sourceId), ["nist-genai-profile", "openai-eval-best-practices", "hf-trl-sft-trainer"]);
  const tuningCurriculum = fineTuning.sections.find((section) => section.id === "tuning-curriculum");
  assert.equal(tuningCurriculum.blocks[0].items.length, 9);
  assert.deepEqual(tuningCurriculum.blocks[0].items[5].sourceIds, ["deepseek-r1-2025", "dpo-2023", "hf-trl-dpo-trainer", "nist-genai-profile"]);
  const tuningPractice = fineTuning.sections.find((section) => section.id === "tuning-practice");
  assert.equal(tuningPractice.blocks.find((block) => block.title === "Practice labs").items.length, 4);
  assert.deepEqual(tuningPractice.blocks.find((block) => block.title === "Practice labs").items[1].sourceIds, ["hf-trl-peft", "lora-2021", "qlora-2023", "nist-genai-profile", "finops-unit-economics"]);
  assert.equal(fineTuning.primer.layout, "lifecycle");
  assert.equal(fineTuning.primer.steps.length, 6);
  assert.equal(fineTuning.primer.steps.at(-1).title, "Canary, observe, roll back, or stop");
  const fineTuningCopy = JSON.stringify(fineTuning);
  assert.match(fineTuningCopy, /claims-intake|Completion criterion:|Define the evaluation before training/);
  assert.doesNotMatch(fineTuningCopy, /claim-intake|cost per accepted|Acceptance:|Define the exam/);

  const mcp = englishModuleRegistry.mcp;
  assert.equal(mcp.qa.length, 15);
  assert.equal(mcp.evidenceCards.length, 5);
  assert.ok(Object.hasOwn(mcp.sources, "mcp-2026-07-28-rc"));
  const mcpTasks = mcp.qa.find((item) => item.id === "long-running-mcp-call");
  assert.match(mcpTasks.a, /Client opts in per request/);
  assert.match(mcpTasks.depth, /Server advertise it through server\/discover/);
  const mcpCopy = JSON.stringify(mcp);
  assert.match(mcpCopy, /MCP 2026-07-28 is the current final specification/);
  assert.doesNotMatch(mcpCopy, /As of August 1, 2026|both parties can opt in/);
});

test("Batch 14 English content preserves model mechanisms and predictive lifecycle controls", () => {
  const llm = englishModuleRegistry.llm;
  assert.equal(llm.qa.length, 10);
  assert.equal(llm.evidenceCards.length, 4);
  assert.equal(llm.primer.id, "theory-atlas");
  assert.equal(llm.primer.layout, "pipeline");
  assert.deepEqual(llm.primer.steps.map((step) => step.title), [
    "Tokenize the request",
    "Embed tokens and encode position",
    "Aggregate context with attention",
    "Refine representations in Transformer blocks",
    "Form a next-token distribution",
    "Select the output sequence",
  ]);
  for (const termId of llm.primer.termIds) assert.ok(llm.terms[termId], `LLM primer term must resolve: ${termId}`);
  const llmCurriculum = llm.sections.find((section) => section.id === "curriculum");
  assert.deepEqual(llmCurriculum.blocks[0].items.find((item) => item.id === "curriculum-attention-heads").sourceIds, ["transformer-2017", "gqa-2023", "attention-not-explanation-2019"]);
  assert.deepEqual(llmCurriculum.blocks[0].items.find((item) => item.id === "curriculum-autoregressive-generation").sourceIds, ["deepseek-r1-2025", "openai-model-spec-hidden-cot", "nist-genai-profile"]);
  assert.deepEqual(llmCurriculum.blocks[0].items.find((item) => item.id === "curriculum-runtime-context").sourceIds, ["vllm-2023", "flashattention-2022", "lost-middle"]);
  const llmCopy = JSON.stringify(llm);
  assert.match(llmCopy, /returned reasoning summary is not a verbatim chain of thought/);
  assert.doesNotMatch(llmCopy, /Ask the customer:|repeated-transfer|recognizable capability|any supported reasoning configuration|Acceptance:/);

  const predictive = englishModuleRegistry["predictive-ai-mlops"];
  assert.equal(predictive.qa.length, 10);
  assert.equal(predictive.evidenceCards.length, 4);
  assert.equal(predictive.primer.id, "predictive-model-lifecycle");
  assert.equal(predictive.primer.layout, "lifecycle");
  assert.equal(predictive.primer.steps.length, 5);
  const predictiveCurriculum = predictive.sections.find((section) => section.id === "predictive-curriculum");
  assert.deepEqual(predictiveCurriculum.blocks[0].items.find((item) => item.id === "predictive-chapter-feature-pipelines").sourceIds, ["aws-sagemaker-feature-store", "google-mlops-predictive-ai"]);
  assert.deepEqual(predictiveCurriculum.blocks[0].items.find((item) => item.id === "predictive-chapter-governance").sourceIds, ["google-mlops-predictive-ai", "nist-genai-profile"]);
  const predictivePractice = predictive.sections.find((section) => section.id === "predictive-study-guide");
  const predictiveLabs = predictivePractice.blocks.find((block) => block.title === "Practice labs").items;
  assert.deepEqual(predictiveLabs[0].sourceIds, ["google-mlops-predictive-ai"]);
  assert.equal(predictiveLabs[2].title, "Diagnose training–serving skew");
  assert.deepEqual(predictiveLabs[2].sourceIds, ["aws-sagemaker-feature-store", "google-mlops-predictive-ai"]);
  assert.match(predictiveLabs[2].boundary, /Completion criterion/);
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
  assert.match(sharedZh, /englishModulePath/);
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
  for (const groupId of ["concept-map", "when-to-use", "rag-principle", "architecture", "retrieval-basics", "production-rag", "choice", "rag-independent-depth", "poc", "rag-variants", "rag-evidence-practice", "cloud-opportunities", "rag-customer-question-guide"]) {
    assert.match(enModulePage, new RegExp(`"${groupId}"`), `English RAG reader mapping must retain ${groupId}`);
  }
  assert.deepEqual(unifiedBriefModuleSlugs, ["solution-patterns", "model-landscape", "multimodal", "veadk", "agentkit", "evaluation", "ai-governance", "security", "ai-gateway", "ai-ops", "predictive-ai-mlops", "llm", "fine-tuning", "llm-training", "data-engineering"]);
  for (const slug of unifiedBriefModuleSlugs) {
    const config = getUnifiedBriefModuleConfig(slug);
    assert.ok(config, `${slug} must have a Chinese unified-reader config`);
    assert.deepEqual(config.directories.quick.map((item) => item.id).slice(1), ["decisions"]);
    assert.deepEqual(config.directories.learn.map((item) => item.id), [slug === "solution-patterns" ? "mechanism-summary" : "principle", "study-guide", "curriculum", "deep-dive"]);
    assert.deepEqual(config.directories.field.map((item) => item.id), ["evidence", "cloud", "qa", "related-modules"]);
    assert.equal(config.facts.length, 4);
  }
  const batch07ChineseReaders = {
    "fine-tuning": {
      shortTitle: "微调",
      primer: { id: "fine-tuning-primer-title", label: "可逆训练实验", eyebrow: "分流、门禁、验收、发布与停止" },
      facts: [
        { label: "训练触发", value: "轻量路线后仍有稳定、可重复、可标注的行为缺口" },
        { label: "不微调门", value: "数据权利 · PII · 可靠标注 · 冻结评测 · 版本化 · 回滚" },
        { label: "发布单元", value: "数据 · 冻结评估集 · 基座 / Adapter · Tokenizer / Chat Template · Runtime / Policy" },
        { label: "停止条件", value: "收益不稳定、关键退化、完整成本越界或轻量路线反超" },
      ],
    },
    "llm-training": {
      shortTitle: "训练系统",
      primer: { id: "llm-training-extension-primer-title", label: "训练供应链", eyebrow: "从数据与权利到候选评估" },
      facts: [
        { label: "训练信号", value: "通用模式学习 · 指令示范 · 偏好信号 · 可验证结果" },
        { label: "Run 合同", value: "基础权重 · Tokenizer · 数据快照与配比 · 目标 · 优化器与调度器 · 精度 · 并行拓扑 · 环境 · 停止规则 · 评估版本" },
        { label: "有效进度", value: "计算 · 通信 · I/O · 故障 · 恢复" },
        { label: "候选门", value: "未见任务 · 关键切片 · 安全 · 能力保留 · 资源 · 不确定性" },
      ],
    },
  };
  for (const [slug, expected] of Object.entries(batch07ChineseReaders)) {
    const config = getUnifiedBriefModuleConfig(slug);
    assert.equal(config.shortTitle, expected.shortTitle);
    assert.deepEqual(config.directories.quick[0], expected.primer);
    assert.deepEqual(config.facts, expected.facts);
  }
  for (const slug of ["solution-patterns", "model-landscape", "multimodal", "llm", "fine-tuning", "llm-training", "llm-inference", "data-engineering", "ai-agent", "mcp", "a2a", "veadk", "agentkit", "evaluation", "ai-governance", "security", "ai-gateway", "ai-ops", "predictive-ai-mlops", "prompt-engineering"]) {
    assert.match(enModulePage, new RegExp(`(?:^|\\n)  (?:"${slug}"|${slug}): \\{`), `English unified reader config must include ${slug}`);
  }
  assert.match(enModulePage, /"prompt-engineering": \{[\s\S]*prompt-pattern-diagnostics[\s\S]*cloud-poc-operating-model/, "Prompt must preserve its dedicated reader map");
  assert.match(enModulePage, /"prompt-engineering": \["prompt-engineering", "context-engineering", "tools-schema", "structured-outputs", "prompt-injection"\]/, "Prompt primer must retain five locally defined terms");
  assert.match(enModulePage, /export const englishUnifiedReaderSlugs = Object\.freeze\(Object\.keys\(englishUnifiedReaderConfigs\)\)/);
  assert.match(enModulePage, /mcp: \{[\s\S]*completeFocusedProjection: true/, "MCP must render its complete authored English projection");
  assert.match(enModulePage, /"solution-patterns": \{[\s\S]*completeFocusedProjection: true/, "Solution Patterns must render its complete authored English projection");
  assert.match(enModulePage, /englishSourceCopy/, "English module pages must render localized source labels");
  assert.doesNotMatch(enModulePage, /sourceLedger\[evidence\.sourceId\]\?\.(?:kind|shortTitle)/, "English QA evidence must not render Chinese canonical labels");
});
