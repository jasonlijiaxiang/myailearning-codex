import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { getEnglishUpdatedAt } from "../app/english-update-dates.mjs";
import { getPublishedModule, publishedModules, publishedModuleSlugs } from "../app/module-publication.mjs";
import { assertCanonicalRendererFileLists, assertPromotionCheckoutClean, derivedAffectedModuleSlugs, hasOnlyChineseRendererProjectionDelta, loadProjectAtCommit, loadPromotedProjects, loadRuntimeMaintenanceOverlays, matchesRegisteredDeferredChineseProjection, promotedBaselineFromCommittedState, rebaseActiveDefermentRendererProjection, sameChineseRendererProjectionState, validateLocalizationRegistry, withRuntimeChineseBaseline } from "../scripts/audit-localization-deferments.mjs";
import { assertJsonSchema, validateJsonSchema } from "../scripts/lib/json-schema-lite.mjs";
import {
  chineseRendererEntryFiles,
  diffObjectCatalogs,
  englishRendererEntryFiles,
  loadLocalizationProject,
  persistableLocalizationModuleState,
  rendererDependencyHash,
  resolveRendererDependencyFiles,
} from "../scripts/lib/localization-contract.mjs";

const registry = JSON.parse(await readFile(new URL("../knowledge/localization-deferments.json", import.meta.url), "utf8"));
const schema = JSON.parse(await readFile(new URL("../knowledge/schemas/localization-deferment.schema.json", import.meta.url), "utf8"));
const reviewSchema = JSON.parse(await readFile(new URL("../knowledge/schemas/bilingual-review.schema.json", import.meta.url), "utf8"));
const matrix = JSON.parse(await readFile(new URL("../docs/change-plans/2026-08-ai-knowledge-base-content-improvement/stage-0/candidate-matrix.json", import.meta.url), "utf8"));
const candidateIds = new Set(matrix.candidates.map((candidate) => candidate.candidateId));
const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const currentProject = await loadLocalizationProject(projectRoot);
const runtimeMaintenance = await loadRuntimeMaintenanceOverlays(registry);
assert.deepEqual(runtimeMaintenance.failures, [], "the committed runtime-maintenance receipt must reconstruct cleanly");
const runtimeOverlays = runtimeMaintenance.overlays;
const promotedProjectsByCommit = await loadPromotedProjects(registry);
const fullHashA = `sha256:${"a".repeat(64)}`;
const fullHashB = `sha256:${"b".repeat(64)}`;
const fullHashC = `sha256:${"c".repeat(64)}`;
const preAgentPlatformModuleSlugs = publishedModuleSlugs.filter((slug) => !["veadk", "agentkit"].includes(slug)).sort();

function validate(candidateRegistry = registry, candidateProject = currentProject, options = {}) {
  return validateLocalizationRegistry(candidateRegistry, candidateProject, {
    candidateIds,
    reviewSchema,
    promotedProjectsByCommit,
    runtimeOverlays,
    ...options,
  });
}

function runtimeOverlaysExcept(...slugs) {
  return new Map([...runtimeOverlays].filter(([slug]) => !slugs.includes(slug)));
}

function registryThroughRuntimeMaintenance(maintenanceId) {
  const candidateRegistry = structuredClone(registry);
  const maintenanceIndex = candidateRegistry.runtimeMaintenances.findIndex((item) => item.maintenanceId === maintenanceId);
  assert.notEqual(maintenanceIndex, -1, `runtime maintenance ${maintenanceId} must exist`);
  candidateRegistry.runtimeMaintenances = candidateRegistry.runtimeMaintenances.slice(0, maintenanceIndex + 1);
  return candidateRegistry;
}

function makeDeferredFixture(slug = "solution-patterns") {
  const candidateRegistry = structuredClone(registry);
  const candidateProject = structuredClone(currentProject);
  const deferment = candidateRegistry.deferments.find((item) => item.moduleSlug === slug && item.status !== "closed");
  assert.ok(deferment, `${slug} must have an active deferment for this fixture`);
  const priorAffectedObjectCount = deferment.affectedObjects.length;
  const baseline = candidateRegistry.moduleBaselines[slug];
  const moduleState = candidateProject.modules[slug];
  const syntheticObjectId = `/module:${slug}/test-deferred-candidate`;

  moduleState.zhObjects[syntheticObjectId] = {
    hash: fullHashA,
    objectType: "test-content",
    sourceIds: [],
  };
  moduleState.zhStateHash = fullHashB;
  moduleState.zhReviewHash = fullHashC;
  deferment.status = "deferred";
  deferment.openedFromCommit = baseline.zhBaselineCommit;
  deferment.baselineReviewIds = [...baseline.reviewSetIds];
  const runtimeOverlay = runtimeOverlays.get(slug);
  const effectiveZhBaseline = runtimeOverlay
    ? withRuntimeChineseBaseline(baseline, runtimeOverlay.state).zhObjects
    : baseline.zhObjects;
  deferment.affectedObjects = diffObjectCatalogs(effectiveZhBaseline, moduleState.zhObjects);
  for (const field of ["englishCandidate", "closedAt", "promotedCommit", "closureReviewIds", "closureReceipt"]) delete deferment[field];

  return { candidateRegistry, candidateProject, deferment, moduleState, baseline, priorAffectedObjectCount };
}

function makeIsolatedDeferredFixture(slug = "solution-patterns") {
  const baseline = structuredClone(registry.moduleBaselines[slug]);
  const sourceModuleState = currentProject.modules[slug];
  const moduleState = structuredClone(sourceModuleState);
  Object.assign(moduleState, {
    zhReviewHash: baseline.zhReviewHash,
    zhStateHash: baseline.zhStateHash,
    zhObjects: structuredClone(baseline.zhObjects),
    zhRendererFiles: [...baseline.zhRendererFiles],
    enAuthoredHash: baseline.enAuthoredHash,
    enEffectiveHash: baseline.enEffectiveHash,
    enReviewHash: baseline.enReviewHash,
    enRendererFiles: [...baseline.enRendererFiles],
    englishUpdatedAt: baseline.englishUpdatedAt,
    reviewFiles: structuredClone(baseline.reviewFiles),
  });

  const historical = registry.deferments.find((item) => item.moduleSlug === slug);
  const localeGateReceipt = registry.receipts.find((item) => item.receiptId === historical.localeGateReceipt);
  const contentObjectId = `/module:${slug}/test-active-deferment-content`;
  moduleState.zhObjects[contentObjectId] = {
    hash: fullHashA,
    objectType: "test-content",
    sourceIds: [],
  };
  moduleState.zhStateHash = fullHashB;
  moduleState.zhReviewHash = fullHashC;

  const deferment = {
    defermentId: `dfr-${slug}-runtime-overlay-test`,
    moduleSlug: slug,
    sourceLocale: "zh-CN",
    targetLocale: "en",
    status: "deferred",
    openedAt: "2026-08-24",
    openedFromCommit: baseline.zhBaselineCommit,
    decisionId: localeGateReceipt.decisionId,
    reason: "Synthetic active deferment used to verify renderer-only runtime overlays.",
    localeRequirements: ["semantic-deferment", "shared-runtime-decoupling"],
    candidateIds: [],
    workItemIds: ["runtime-overlay-test"],
    affectedObjects: diffObjectCatalogs(baseline.zhObjects, moduleState.zhObjects),
    baselineReviewIds: [...baseline.reviewSetIds],
    localeGateReceipt: localeGateReceipt.receiptId,
    closureCriteria: "Complete an independent English review before promotion.",
  };
  const candidateRegistry = {
    ...structuredClone(registry),
    receipts: [structuredClone(localeGateReceipt)],
    moduleBaselines: { [slug]: baseline },
    runtimeMaintenances: [],
    deferments: [deferment],
  };
  const candidateProject = {
    ...currentProject,
    publishedModuleSlugs: [slug],
    modules: { [slug]: moduleState },
  };

  return { baseline, candidateProject, candidateRegistry, contentObjectId, deferment, moduleState };
}

function addPassingCandidateReviews(moduleState, slug, zhHash, enHash, suffix = "candidate-test") {
  const reviewIds = [];
  const templatesByStage = new Map(Object.values(moduleState.reviewRecords).map((record) => [record.stage, record]));
  for (const template of templatesByStage.values()) {
    const reviewId = `br-${slug}-${template.stage}-${suffix}`;
    const record = structuredClone(template);
    record.reviewId = reviewId;
    record.scope.zhContentHash = zhHash;
    record.scope.enContentHash = enHash;
    moduleState.reviewRecords[reviewId] = record;
    moduleState.reviewFiles[reviewId] = {
      path: `knowledge/claims/bilingual-reviews/test/${slug}.${template.stage}.json`,
      hash: fullHashA,
      zhContentHash: zhHash,
      enContentHash: enHash,
    };
    reviewIds.push(reviewId);
  }
  return reviewIds.sort();
}

test("localization registry passes its recursive schema and covers every module", () => {
  assert.doesNotThrow(() => assertJsonSchema(registry, schema, "localization registry"));
  assert.equal(registry.schemaVersion, "localization-deferment/v3");
  const maintenances = new Map(registry.runtimeMaintenances.map((item) => [item.maintenanceId, item]));
  for (const maintenanceId of [
    "erm-english-document-shell-2026-08-10",
    "erm-english-language-switch-2026-08-10",
    "erm-english-reader-2026-08-09",
    "erm-english-source-scope-2026-08-10",
    "erm-full-site-design-voice-2026-08-12",
    "erm-module-reading-modes-2026-08-24",
  ]) assert.ok(maintenances.has(maintenanceId), `${maintenanceId} must remain in the runtime chain`);
  assert.equal(maintenances.size, registry.runtimeMaintenances.length, "runtime maintenance IDs must be unique");
  const reader = maintenances.get("erm-english-reader-2026-08-09");
  assert.equal(reader?.receiptId, "receipt-english-reader-runtime-2026-08-09");
  assert.deepEqual(reader?.affectedModuleSlugs, preAgentPlatformModuleSlugs);
  assert.deepEqual(reader?.contentProjectionChangeSlugs, ["rag"]);
  assert.equal(reader?.metadataScope, "all-en-routes");
  const documentShell = maintenances.get("erm-english-document-shell-2026-08-10");
  assert.equal(documentShell?.kind, "document-shell");
  assert.equal(documentShell?.receiptId, "receipt-english-document-shell-2026-08-10");
  assert.deepEqual(documentShell?.affectedModuleSlugs, preAgentPlatformModuleSlugs);
  assert.deepEqual(documentShell?.contentProjectionChangeSlugs, []);
  assert.equal(documentShell?.metadataScope, "all-en-routes");
  const languageSwitch = maintenances.get("erm-english-language-switch-2026-08-10");
  assert.equal(languageSwitch?.kind, "english-renderer");
  assert.equal(languageSwitch?.receiptId, "receipt-erm-english-language-switch-2026-08-10");
  assert.deepEqual(languageSwitch?.changedRendererFiles, ["app/i18n/english-pilot-module-page.tsx"]);
  assert.deepEqual(languageSwitch?.affectedModuleSlugs, preAgentPlatformModuleSlugs);
  assert.deepEqual(languageSwitch?.contentProjectionChangeSlugs, []);
  assert.equal(languageSwitch?.metadataScope, "none");
  const fullSiteReview = maintenances.get("erm-full-site-design-voice-2026-08-12");
  assert.equal(fullSiteReview?.kind, "document-shell");
  assert.equal(fullSiteReview?.receiptId, "receipt-full-site-design-voice-2026-08-12");
  assert.deepEqual(fullSiteReview?.affectedModuleSlugs, preAgentPlatformModuleSlugs);
  assert.deepEqual(fullSiteReview?.contentProjectionChangeSlugs, []);
  assert.equal(fullSiteReview?.metadataScope, "none");
  assert.deepEqual(Object.keys(registry.moduleBaselines).sort(), [...publishedModuleSlugs].sort());
  assert.match(registry.baselineCommit, /^[0-9a-f]{40}$/);
  const activeBySlug = new Map(registry.deferments
    .filter((item) => item.status !== "closed")
    .map((item) => [item.moduleSlug, item]));
  for (const publication of publishedModules) {
    const baseline = registry.moduleBaselines[publication.slug];
    const active = activeBySlug.get(publication.slug);
    assert.match(baseline.zhBaselineCommit, /^[0-9a-f]{40}$/);
    assert.match(baseline.enBaselineCommit, /^[0-9a-f]{40}$/);
    assert.equal(active?.englishCandidate?.englishUpdatedAt ?? baseline.englishUpdatedAt, getEnglishUpdatedAt(publication.slug));
    assert.ok(!Object.hasOwn(publication, "addedAt"), `${publication.slug} must not use addedAt for module dates`);
  }

  const escapingRendererPath = structuredClone(registry);
  escapingRendererPath.moduleBaselines.rag.enRendererFiles = ["../../etc/hosts"];
  assert.throws(() => assertJsonSchema(escapingRendererPath, schema, "localization registry"), /does not match/);
});

test("runtime maintenance records cannot masquerade as locale-gate receipts", () => {
  const mutated = structuredClone(registry);
  mutated.runtimeMaintenances.push({
    maintenanceId: "erm-test-runtime",
    status: "applied",
    kind: "english-renderer",
    decisionId: "D-014",
    recordedAt: "2026-08-09",
    baseCommit: registry.moduleBaselines.rag.enBaselineCommit,
    implementationCommit: registry.moduleBaselines.rag.enBaselineCommit,
    receiptId: "receipt-contract07-2026-08-08",
    changedRendererFiles: ["scripts/lib/localization-contract.mjs"],
    affectedModuleSlugs: ["rag"],
    contentProjectionChangeSlugs: ["rag"],
    metadataScope: "rag",
    summary: "Fixture only.",
  });
  assert.doesNotThrow(() => assertJsonSchema(mutated, schema, "localization registry"));
  assert.match(validate(mutated).failures.join("\n"), /receipt must be runtime-maintenance/);
});

test("a later runtime maintenance may supersede an earlier overlay for the same module", () => {
  const chained = structuredClone(registry);
  chained.runtimeMaintenances.push({
    ...chained.runtimeMaintenances[0],
    maintenanceId: "erm-test-runtime-chain",
    summary: "Fixture that exercises registry-level overlay chaining.",
  });
  const result = validate(chained, currentProject, { runtimeOverlays });
  assert.doesNotMatch(result.failures.join("\n"), /already covered by/);
});

test("the latest document-shell maintenance retains the complete prior runtime chain", () => {
  const result = validate(registry, currentProject, { runtimeOverlays });
  const latestDocumentShell = registry.runtimeMaintenances.filter((item) => item.kind === "document-shell").at(-1);
  assert.ok(latestDocumentShell, "the registry must contain a document-shell maintenance");
  assert.deepEqual(result.failures, []);
  assert.ok([...runtimeOverlays.values()].every((overlay) => overlay.kind === "document-shell"));
  assert.ok([...runtimeOverlays.values()].every((overlay) => overlay.maintenanceId === latestDocumentShell.maintenanceId));
});

test("a document-shell overlay preserves an active deferment's exact authored-content delta", () => {
  const fixture = makeIsolatedDeferredFixture();
  const slug = fixture.deferment.moduleSlug;
  const projectionObjectId = Object.keys(fixture.baseline.zhObjects)
    .find((objectId) => objectId.endsWith("/renderedProjection/sharedRendererHash"));
  assert.ok(projectionObjectId, "the baseline must contain a renderer projection hash");

  const overlayState = structuredClone(fixture.moduleState);
  overlayState.zhObjects[projectionObjectId].hash = fullHashC;
  overlayState.zhStateHash = fullHashA;
  overlayState.enEffectiveHash = fullHashB;
  Object.assign(fixture.moduleState, structuredClone(overlayState));
  const overlay = {
    maintenanceId: "erm-active-deferment-overlay-test",
    kind: "document-shell",
    state: overlayState,
  };

  const mergedBaseline = withRuntimeChineseBaseline(fixture.baseline, overlayState);
  assert.equal(Object.hasOwn(mergedBaseline.zhObjects, fixture.contentObjectId), false, "runtime overlay must not promote authored content into the baseline");
  assert.equal(mergedBaseline.zhObjects[projectionObjectId].hash, fullHashC, "runtime overlay must advance the renderer projection");
  assert.deepEqual(fixture.deferment.affectedObjects, diffObjectCatalogs(mergedBaseline.zhObjects, fixture.moduleState.zhObjects));

  const result = validateLocalizationRegistry(fixture.candidateRegistry, fixture.candidateProject, {
    candidateIds,
    reviewSchema,
    promotedProjectsByCommit: new Map(),
    runtimeOverlays: new Map([[slug, overlay]]),
  });
  assert.deepEqual(result.failures, []);
  assert.ok(result.messages.includes(`DEFERRED/NOT_ALIGNED ${slug}: ${fixture.deferment.defermentId} (runtime ${overlay.maintenanceId})`));
});

test("document-shell projection checks reject non-renderer Chinese changes", () => {
  const fixture = makeIsolatedDeferredFixture();
  const projectionObjectId = Object.keys(fixture.baseline.zhObjects)
    .find((objectId) => objectId.endsWith("/renderedProjection/sharedRendererHash"));
  assert.ok(projectionObjectId);

  const activeContentBeforeMaintenance = structuredClone(fixture.baseline);
  activeContentBeforeMaintenance.zhObjects[fixture.contentObjectId] = fixture.moduleState.zhObjects[fixture.contentObjectId];
  activeContentBeforeMaintenance.zhStateHash = fullHashB;
  assert.equal(sameChineseRendererProjectionState(fixture.baseline, activeContentBeforeMaintenance), true, "authored content delta must not invalidate the registered renderer base");

  const rendererOnly = structuredClone(fixture.baseline);
  rendererOnly.zhObjects[projectionObjectId].hash = fullHashA;
  assert.equal(sameChineseRendererProjectionState(fixture.baseline, rendererOnly), false, "unregistered renderer drift must invalidate the maintenance base");
  assert.equal(hasOnlyChineseRendererProjectionDelta(fixture.baseline, rendererOnly), true);

  const smuggledContent = structuredClone(rendererOnly);
  smuggledContent.zhObjects[`/module:${fixture.deferment.moduleSlug}/brief/runtime-smuggled-content`] = {
    hash: fullHashB,
    objectType: "brief",
    sourceIds: [],
  };
  assert.equal(hasOnlyChineseRendererProjectionDelta(fixture.baseline, smuggledContent), false);

  const mergedBaseline = withRuntimeChineseBaseline(fixture.baseline, smuggledContent);
  assert.equal(Object.hasOwn(mergedBaseline.zhObjects, `/module:${fixture.deferment.moduleSlug}/brief/runtime-smuggled-content`), false);
});

test("an English runtime may start from the exact Chinese renderer projection registered by an active deferment", () => {
  const fixture = makeIsolatedDeferredFixture();
  const slug = fixture.deferment.moduleSlug;
  const projectionObjectId = Object.keys(fixture.baseline.zhObjects)
    .find((objectId) => objectId.endsWith("/renderedProjection/sharedRendererHash"));
  assert.ok(projectionObjectId);

  const deferredState = structuredClone(fixture.moduleState);
  deferredState.zhObjects[projectionObjectId].hash = fullHashC;
  fixture.deferment.affectedObjects = diffObjectCatalogs(fixture.baseline.zhObjects, deferredState.zhObjects);

  assert.equal(
    matchesRegisteredDeferredChineseProjection(fixture.candidateRegistry, slug, fixture.baseline, deferredState),
    true,
    "a reconstructable active deferment may carry its exact Chinese renderer projection into a later English-only runtime",
  );

  const unregisteredState = structuredClone(deferredState);
  unregisteredState.zhObjects[projectionObjectId].hash = fullHashB;
  assert.equal(matchesRegisteredDeferredChineseProjection(fixture.candidateRegistry, slug, fixture.baseline, unregisteredState), false);

  fixture.deferment.status = "closed";
  assert.equal(matchesRegisteredDeferredChineseProjection(fixture.candidateRegistry, slug, fixture.baseline, deferredState), false);
});

test("a runtime receipt rebases only an active deferment's renderer projection", () => {
  const fixture = makeIsolatedDeferredFixture();
  const slug = fixture.deferment.moduleSlug;
  const projectionObjectId = Object.keys(fixture.baseline.zhObjects)
    .find((objectId) => objectId.endsWith("/renderedProjection/sharedRendererHash"));
  assert.ok(projectionObjectId);

  fixture.moduleState.zhObjects[projectionObjectId].hash = fullHashC;
  fixture.deferment.affectedObjects = diffObjectCatalogs(fixture.baseline.zhObjects, fixture.moduleState.zhObjects);
  const overlayState = structuredClone(fixture.moduleState);
  const overlays = new Map([[slug, { maintenanceId: "erm-rebase-test", kind: "english-renderer", state: overlayState }]]);

  rebaseActiveDefermentRendererProjection(fixture.candidateRegistry, fixture.candidateProject, overlays);
  assert.ok(fixture.deferment.affectedObjects.some((item) => item.objectId === fixture.contentObjectId));
  assert.equal(fixture.deferment.affectedObjects.some((item) => item.objectId === projectionObjectId), false);

  fixture.moduleState.zhObjects[`/module:${slug}/brief/unregistered-content`] = {
    hash: fullHashB,
    objectType: "brief",
    sourceIds: [],
  };
  assert.throws(
    () => rebaseActiveDefermentRendererProjection(fixture.candidateRegistry, fixture.candidateProject, overlays),
    /cannot change the registered Chinese authored-content delta/,
  );
});

test("an effective-hash contract change covers every English module", () => {
  const derived = derivedAffectedModuleSlugs(currentProject, currentProject, ["scripts/lib/localization-contract.mjs"]);
  assert.deepEqual(derived, [...publishedModuleSlugs].sort());
});

test("an active deferment records the exact live object delta", () => {
  const { candidateRegistry, candidateProject, deferment, priorAffectedObjectCount } = makeDeferredFixture();
  const activeSlugs = candidateRegistry.deferments.filter((item) => item.status !== "closed").map((item) => item.moduleSlug);
  assert.equal(new Set(activeSlugs).size, activeSlugs.length);
  const result = validate(candidateRegistry, candidateProject, { runtimeOverlays });
  assert.deepEqual(result.failures, []);
  assert.equal(result.messages.filter((line) => /^(?:DEFERRED|READY)\/NOT_ALIGNED /.test(line)).length, activeSlugs.length);
  assert.equal(deferment.affectedObjects.length, priorAffectedObjectCount + 1);
  assert.ok(deferment.affectedObjects.some((item) => item.objectId.endsWith("/test-deferred-candidate")));
});

test("runtime-maintenance chain preserves the verified document shell and English reader state", async () => {
  const beforeLanguageSwitch = registryThroughRuntimeMaintenance("erm-english-document-shell-2026-08-10");
  const documentShellRuntime = await loadRuntimeMaintenanceOverlays(beforeLanguageSwitch);
  assert.deepEqual(documentShellRuntime.failures, []);
  assert.ok([...documentShellRuntime.overlays.values()].every((overlay) => overlay.maintenanceId === "erm-english-document-shell-2026-08-10"));
  assert.ok([...documentShellRuntime.overlays.values()].every((overlay) => overlay.kind === "document-shell"));

  const beforeFullSiteReview = registryThroughRuntimeMaintenance("erm-english-language-switch-2026-08-10");
  const languageSwitchRuntime = await loadRuntimeMaintenanceOverlays(beforeFullSiteReview);
  assert.deepEqual(languageSwitchRuntime.failures, []);
  assert.ok([...languageSwitchRuntime.overlays.values()].every((overlay) => overlay.maintenanceId === "erm-english-language-switch-2026-08-10"));
  assert.ok([...languageSwitchRuntime.overlays.values()].every((overlay) => overlay.kind === "english-renderer"));

  const latestRuntimeMaintenance = registry.runtimeMaintenances.at(-1);
  const expectedLiveOverlaySlugs = publishedModuleSlugs.filter((slug) => spawnSync(
    "git",
    ["merge-base", "--is-ancestor", latestRuntimeMaintenance.implementationCommit, registry.moduleBaselines[slug].enBaselineCommit],
    { cwd: projectRoot },
  ).status !== 0).sort();
  assert.deepEqual([...runtimeOverlays.keys()].sort(), expectedLiveOverlaySlugs);
  assert.ok([...runtimeOverlays.values()].every((overlay) => overlay.maintenanceId === latestRuntimeMaintenance.maintenanceId));

  const driftedProject = structuredClone(currentProject);
  driftedProject.modules.rag.enEffectiveHash = fullHashA;
  assert.match(
    validate(registry, driftedProject, { runtimeOverlays }).failures.join("\n"),
    /dfr-rag-.*: deferred work changed English content or englishUpdatedAt/,
  );

  driftedProject.modules.rag.enEffectiveHash = currentProject.modules.rag.enEffectiveHash;
  driftedProject.modules.rag.zhObjects["/module:rag/test-unregistered-runtime-drift"] = {
    hash: fullHashA,
    objectType: "test-content",
    sourceIds: [],
  };
  driftedProject.modules.rag.zhStateHash = fullHashB;
  assert.match(
    validate(registry, driftedProject, { runtimeOverlays }).failures.join("\n"),
    /dfr-rag-.*: affectedObjects do not exactly match the live delta/,
  );
});

test("runtime maintenance cannot relabel a document shell as an English-only renderer", async () => {
  const mislabeledDocumentShell = structuredClone(registry);
  const documentShell = mislabeledDocumentShell.runtimeMaintenances.find((item) => item.maintenanceId === "erm-english-document-shell-2026-08-10");
  documentShell.kind = "english-renderer";
  const mislabeledResult = await loadRuntimeMaintenanceOverlays(mislabeledDocumentShell);
  assert.match(mislabeledResult.failures.join("\n"), /changes Chinese renderer state; record a document-shell maintenance instead/);

  const mislabeledEnglishRuntime = structuredClone(registry);
  const reader = mislabeledEnglishRuntime.runtimeMaintenances.find((item) => item.maintenanceId === "erm-english-reader-2026-08-09");
  reader.kind = "document-shell";
  const readerResult = await loadRuntimeMaintenanceOverlays(mislabeledEnglishRuntime);
  assert.match(readerResult.failures.join("\n"), /document-shell maintenance has no Chinese renderer projection change/);
});

test("candidate review scope covers the complete Chinese effective state", () => {
  for (const moduleState of Object.values(currentProject.modules)) {
    assert.equal(moduleState.zhReviewHash, moduleState.zhStateHash);
  }
});

test("module renderer manifests cover indirect visible dependencies", async () => {
  const solutionFiles = await resolveRendererDependencyFiles(projectRoot, chineseRendererEntryFiles(getPublishedModule("solution-patterns")));
  const ragFiles = await resolveRendererDependencyFiles(projectRoot, chineseRendererEntryFiles(getPublishedModule("rag")));
  const agentFiles = await resolveRendererDependencyFiles(projectRoot, chineseRendererEntryFiles(getPublishedModule("ai-agent")));
  const promptFiles = await resolveRendererDependencyFiles(projectRoot, chineseRendererEntryFiles(getPublishedModule("prompt-engineering")));
  const mcpFiles = await resolveRendererDependencyFiles(projectRoot, chineseRendererEntryFiles(getPublishedModule("mcp")));
  const a2aFiles = await resolveRendererDependencyFiles(projectRoot, chineseRendererEntryFiles(getPublishedModule("a2a")));
  const englishSharedFiles = await resolveRendererDependencyFiles(projectRoot, englishRendererEntryFiles("solution-patterns"));
  const englishRagFiles = await resolveRendererDependencyFiles(projectRoot, englishRendererEntryFiles("rag"));

  assert.ok(solutionFiles.includes("app/(zh)/layout.tsx"));
  assert.ok(englishSharedFiles.includes("app/(en)/layout.tsx"));
  assert.ok(!englishSharedFiles.includes("app/en/layout.tsx"));

  for (const relativePath of ["app/fieldbook-interactions.tsx", "app/deep-dive-relation-view.tsx", "app/layout-utils.mjs", "app/focused-visual-explainers.tsx", "app/module-visual-explorers.tsx"]) {
    assert.ok(solutionFiles.includes(relativePath), `${relativePath} must affect a shared Chinese module renderer hash`);
  }
  for (const [files, route] of [
    [ragFiles, "app/(zh)/modules/rag/page.tsx"],
    [agentFiles, "app/(zh)/modules/ai-agent/page.tsx"],
    [promptFiles, "app/(zh)/modules/prompt-engineering/page.tsx"],
  ]) {
    assert.ok(files.includes(route), `${route} must be the module's real Chinese entry`);
    assert.ok(files.includes("app/flagship-labs.tsx"), `${route} must close over its interactive lab`);
    assert.ok(!files.includes("app/(zh)/modules/[slug]/page.tsx"), `${route} must not inherit the unused brief route`);
  }
  for (const [files, route, renderer] of [
    [mcpFiles, "app/(zh)/modules/mcp/page.tsx", "app/mcp-module-experience.tsx"],
    [a2aFiles, "app/(zh)/modules/a2a/page.tsx", "app/a2a-module-experience.tsx"],
  ]) {
    assert.ok(files.includes(route), `${route} must be the module's real Chinese entry`);
    assert.ok(files.includes(renderer), `${route} must close over its specialized reader`);
    assert.ok(!files.includes("app/(zh)/modules/[slug]/page.tsx"), `${route} must not inherit the unused brief route`);
  }
  assert.ok(englishSharedFiles.includes("app/(en)/en/modules/[slug]/page.tsx"));
  assert.ok(englishSharedFiles.includes("app/i18n/english-pilot-module-page.tsx"));
  assert.ok(englishRagFiles.includes("app/(en)/en/modules/rag/page.tsx"));
  assert.ok(!englishRagFiles.includes("app/(en)/en/modules/[slug]/page.tsx"));

  const baselineHash = await rendererDependencyHash(projectRoot, solutionFiles);
  const mutatedHash = await rendererDependencyHash(projectRoot, solutionFiles, async (filePath) => {
    const bytes = await readFile(filePath);
    return filePath.endsWith("fieldbook-interactions.tsx") ? Buffer.concat([bytes, Buffer.from("\n// renderer mutation")]) : bytes;
  });
  assert.notEqual(mutatedHash, baselineHash, "an indirect renderer edit must change the effective renderer hash");

  const focusedVisualHash = await rendererDependencyHash(projectRoot, solutionFiles, async (filePath) => {
    const bytes = await readFile(filePath);
    return filePath.endsWith("focused-visual-explainers.tsx") ? Buffer.concat([bytes, Buffer.from("\n// focused visual mutation")]) : bytes;
  });
  assert.notEqual(focusedVisualHash, baselineHash, "a nested focused visual edit must change the Chinese effective renderer hash");

  const sharedVisualHash = await rendererDependencyHash(projectRoot, solutionFiles, async (filePath) => {
    const bytes = await readFile(filePath);
    return filePath.endsWith("module-visual-explorers.tsx") ? Buffer.concat([bytes, Buffer.from("\n// shared visual mutation")]) : bytes;
  });
  assert.notEqual(sharedVisualHash, baselineHash, "a nested shared visual edit must change the Chinese effective renderer hash");

  const ragBaselineHash = await rendererDependencyHash(projectRoot, ragFiles);
  const ragRouteHash = await rendererDependencyHash(projectRoot, ragFiles, async (filePath) => {
    const bytes = await readFile(filePath);
    return filePath.endsWith("app/(zh)/modules/rag/page.tsx") ? Buffer.concat([bytes, Buffer.from("\n// dedicated route mutation")]) : bytes;
  });
  const flagshipHash = await rendererDependencyHash(projectRoot, ragFiles, async (filePath) => {
    const bytes = await readFile(filePath);
    return filePath.endsWith("flagship-labs.tsx") ? Buffer.concat([bytes, Buffer.from("\n// lab mutation")]) : bytes;
  });
  assert.notEqual(ragRouteHash, ragBaselineHash, "a dedicated route edit must change only that route family hash");
  assert.notEqual(flagshipHash, ragBaselineHash, "a dedicated lab edit must change its module renderer hash");

  assert.doesNotThrow(() => assertCanonicalRendererFileLists(currentProject, {
    rag: { zh: currentProject.modules.rag.zhRendererFiles, en: currentProject.modules.rag.enRendererFiles },
  }));
  assert.throws(() => assertCanonicalRendererFileLists(currentProject, {
    rag: { en: currentProject.modules.rag.enRendererFiles.slice(0, 1) },
  }), /do not match the canonical commit closure/);
  await assert.rejects(
    rendererDependencyHash(projectRoot, ["../../etc/hosts"]),
    /must stay inside app\/ without dot segments/,
  );
});

test("historical renderer provenance rejects a self-declared subset", async () => {
  const baseline = registry.moduleBaselines.rag;
  await assert.rejects(
    loadProjectAtCommit(baseline.enBaselineCommit, {
      rag: { en: baseline.enRendererFiles.slice(0, 1) },
    }),
    /do not match the canonical commit closure/,
  );
});

test("semantic audit rejects an added object without a current hash", () => {
  const mutated = structuredClone(registry);
  const object = mutated.deferments.flatMap((item) => item.affectedObjects).find((item) => item.changeKind === "added");
  assert.ok(object);
  object.currentHash = null;
  assert.match(validate(mutated).failures.join("\n"), /added requires null baselineHash and a currentHash/);
});

test("semantic audit rejects omitted and invented object deltas", () => {
  const omitted = makeDeferredFixture();
  omitted.deferment.affectedObjects.pop();
  assert.match(validate(omitted.candidateRegistry, omitted.candidateProject).failures.join("\n"), /do not exactly match the live delta/);

  const invented = makeDeferredFixture();
  invented.deferment.affectedObjects.push({
    objectId: "/module:solution-patterns/invented",
    objectType: "content",
    changeKind: "modified",
    baselineHash: fullHashA,
    currentHash: fullHashB,
    sourceIds: [],
  });
  assert.match(validate(invented.candidateRegistry, invented.candidateProject).failures.join("\n"), /do not exactly match the live delta/);
});

test("semantic audit rejects invalid modified hashes and duplicate active records", () => {
  const sameHash = structuredClone(registry);
  const modified = sameHash.deferments.flatMap((item) => item.affectedObjects).find((item) => item.changeKind === "modified");
  assert.ok(modified);
  modified.currentHash = modified.baselineHash;
  assert.match(validate(sameHash).failures.join("\n"), /modified requires two different hashes/);

  const duplicate = makeDeferredFixture();
  duplicate.candidateRegistry.deferments.push({ ...structuredClone(duplicate.deferment), defermentId: "dfr-duplicate-active-record" });
  assert.match(validate(duplicate.candidateRegistry, duplicate.candidateProject).failures.join("\n"), /only one active deferment is allowed/);
});

test("semantic audit resolves candidate, receipt, and source references", () => {
  const badCandidate = structuredClone(registry);
  badCandidate.deferments[0].candidateIds.push("C-NOT-REAL");
  assert.match(validate(badCandidate).failures.join("\n"), /unknown candidate/);

  const badReceipt = structuredClone(registry);
  badReceipt.deferments[0].localeGateReceipt = "receipt-not-real";
  assert.match(validate(badReceipt).failures.join("\n"), /unknown localeGateReceipt/);

  const wrongReceiptKind = structuredClone(registry);
  wrongReceiptKind.deferments[0].localeGateReceipt = "receipt-localization-baseline-2026-08-08";
  assert.match(validate(wrongReceiptKind).failures.join("\n"), /must reference a locale-gate receipt/);

  const badSource = structuredClone(registry);
  badSource.deferments[0].affectedObjects[0].sourceIds.push("source-not-real");
  assert.match(validate(badSource).failures.join("\n"), /unknown source/);

  const closureFieldsOnDeferred = makeDeferredFixture();
  Object.assign(closureFieldsOnDeferred.deferment, {
    closedAt: "2026-08-08",
    promotedCommit: "d".repeat(40),
    closureReviewIds: closureFieldsOnDeferred.deferment.baselineReviewIds,
    closureReceipt: "receipt-localization-baseline-2026-08-08",
  });
  assert.match(validate(closureFieldsOnDeferred.candidateRegistry, closureFieldsOnDeferred.candidateProject).failures.join("\n"), /only allowed on closed records/);
});

test("deferred state rejects every English hash or date drift", () => {
  const { candidateRegistry, candidateProject: changed, deferment } = makeDeferredFixture();
  const slug = deferment.moduleSlug;
  changed.modules[slug].enAuthoredHash = fullHashA;
  changed.modules[slug].englishUpdatedAt = "2026-08-08";
  assert.match(validate(candidateRegistry, changed).failures.join("\n"), /deferred work changed English content or englishUpdatedAt/);
});

test("ready state requires a real, reviewed English candidate", () => {
  const { candidateRegistry: readyRegistry, candidateProject: readyProject, deferment, moduleState } = makeDeferredFixture();
  const candidateReviewIds = addPassingCandidateReviews(moduleState, deferment.moduleSlug, moduleState.zhReviewHash, fullHashC);
  deferment.status = "ready-for-english-review";
  deferment.englishCandidate = {
    zhReviewHash: moduleState.zhReviewHash,
    zhRendererFiles: [...moduleState.zhRendererFiles],
    enAuthoredHash: fullHashA,
    enEffectiveHash: fullHashB,
    enReviewHash: fullHashC,
    enRendererFiles: [...moduleState.enRendererFiles],
    englishUpdatedAt: "2026-08-08",
    reviewIds: candidateReviewIds,
  };
  moduleState.enAuthoredHash = fullHashA;
  moduleState.enEffectiveHash = fullHashB;
  moduleState.enReviewHash = fullHashC;
  moduleState.englishUpdatedAt = "2026-08-08";
  assert.deepEqual(validate(readyRegistry, readyProject, { runtimeOverlays }).failures, []);

  moduleState.reviewRecords[candidateReviewIds[0]].deterministic[0].status = "FAIL";
  assert.match(validate(readyRegistry, readyProject, { runtimeOverlays }).failures.join("\n"), /failing deterministic gate|must equal "PASS"/);
  moduleState.reviewRecords[candidateReviewIds[0]].deterministic[0].status = "PASS";
  moduleState.reviewRecords[candidateReviewIds[0]].verdict = "BLOCK";
  assert.match(validate(readyRegistry, readyProject, { runtimeOverlays }).failures.join("\n"), /not a publishable PASS|Schema validation failed/);
});

test("closed state cannot hide an unpromoted Chinese delta", () => {
  const { candidateRegistry: closed, candidateProject: closedProject, deferment } = makeDeferredFixture();
  closed.receipts.push({ receiptId: "receipt-test-closure", kind: "closure", recordedAt: "2026-08-08", decisionId: "D-012", summary: "Test closure." });
  deferment.status = "closed";
  deferment.closedAt = "2026-08-08";
  deferment.closureReviewIds = deferment.baselineReviewIds;
  deferment.closureReceipt = "receipt-test-closure";
  assert.match(validate(closed, closedProject).failures.join("\n"), /Chinese content changed without an active deferment/);
});

test("reviewed ready state can close only through an exact promoted baseline", () => {
  const closedRegistry = structuredClone(registry);
  const closedProject = structuredClone(currentProject);
  const deferment = closedRegistry.deferments.find((item) => item.moduleSlug === "solution-patterns" && item.status !== "closed");
  assert.ok(deferment, "solution-patterns must have an active deferment for this fixture");
  const moduleState = closedProject.modules[deferment.moduleSlug];
  const reviewIds = addPassingCandidateReviews(moduleState, deferment.moduleSlug, moduleState.zhReviewHash, fullHashC);
  moduleState.enAuthoredHash = fullHashA;
  moduleState.enEffectiveHash = fullHashB;
  moduleState.enReviewHash = fullHashC;
  moduleState.englishUpdatedAt = "2026-08-08";
  deferment.englishCandidate = {
    zhReviewHash: moduleState.zhReviewHash,
    zhRendererFiles: [...moduleState.zhRendererFiles],
    enAuthoredHash: fullHashA,
    enEffectiveHash: fullHashB,
    enReviewHash: fullHashC,
    enRendererFiles: [...moduleState.enRendererFiles],
    englishUpdatedAt: "2026-08-08",
    reviewIds,
  };
  deferment.status = "closed";
  deferment.closedAt = "2026-08-08";
  deferment.promotedCommit = "d".repeat(40);
  deferment.closureReviewIds = reviewIds;
  deferment.closureReceipt = "receipt-test-closure";
  closedRegistry.receipts.push({ receiptId: "receipt-test-closure", kind: "closure", recordedAt: "2026-08-08", decisionId: deferment.decisionId, summary: "Reviewed test closure." });
  closedRegistry.moduleBaselines[deferment.moduleSlug] = persistableLocalizationModuleState(moduleState, deferment.promotedCommit, reviewIds);
  const fixturePromotedProjects = new Map([
    ...promotedProjectsByCommit,
    [deferment.promotedCommit, closedProject],
  ]);

  assert.deepEqual(validate(closedRegistry, closedProject, {
    promotedProjectsByCommit: fixturePromotedProjects,
    runtimeOverlays: runtimeOverlaysExcept(deferment.moduleSlug),
  }).failures, []);

  moduleState.reviewRecords[reviewIds[0]].deterministic[0].status = "FAIL";
  assert.match(validate(closedRegistry, closedProject, {
    promotedProjectsByCommit: fixturePromotedProjects,
    runtimeOverlays: runtimeOverlaysExcept(deferment.moduleSlug),
  }).failures.join("\n"), /failing deterministic gate|must equal "PASS"/);
  moduleState.reviewRecords[reviewIds[0]].deterministic[0].status = "PASS";
  deferment.closureReviewIds = ["br-does-not-exist"];
  assert.match(validate(closedRegistry, closedProject, {
    promotedProjectsByCommit: fixturePromotedProjects,
    runtimeOverlays: runtimeOverlaysExcept(deferment.moduleSlug),
  }).failures.join("\n"), /closureReviewIds must exactly match|review br-does-not-exist is missing/);
});

test("historical closures remain valid after a later baseline promotion", () => {
  const latestRegistry = structuredClone(registry);
  const latestProject = structuredClone(currentProject);
  const latest = latestRegistry.deferments.find((item) => item.moduleSlug === "solution-patterns" && item.status !== "closed");
  assert.ok(latest, "solution-patterns must have an active deferment for this fixture");
  const latestModule = latestProject.modules[latest.moduleSlug];
  const latestReviewIds = addPassingCandidateReviews(latestModule, latest.moduleSlug, latestModule.zhReviewHash, fullHashC);
  latestModule.enAuthoredHash = fullHashA;
  latestModule.enEffectiveHash = fullHashB;
  latestModule.enReviewHash = fullHashC;
  latestModule.englishUpdatedAt = "2026-08-08";
  latest.status = "closed";
  latest.closedAt = "2026-08-08";
  latest.promotedCommit = "d".repeat(40);
  latest.closureReviewIds = latestReviewIds;
  latest.closureReceipt = "receipt-latest-test-closure";
  latest.englishCandidate = {
    zhReviewHash: latestModule.zhReviewHash,
    zhRendererFiles: [...latestModule.zhRendererFiles],
    enAuthoredHash: latestModule.enAuthoredHash,
    enEffectiveHash: latestModule.enEffectiveHash,
    enReviewHash: latestModule.enReviewHash,
    enRendererFiles: [...latestModule.enRendererFiles],
    englishUpdatedAt: latestModule.englishUpdatedAt,
    reviewIds: latestReviewIds,
  };
  latestRegistry.receipts.push({ receiptId: latest.closureReceipt, kind: "closure", recordedAt: "2026-08-08", decisionId: latest.decisionId, summary: "Latest test closure." });
  latestRegistry.moduleBaselines[latest.moduleSlug] = persistableLocalizationModuleState(latestModule, latest.promotedCommit, latestReviewIds);

  const historicalProject = structuredClone(latestProject);
  const historicalModule = historicalProject.modules[latest.moduleSlug];
  const historicalReviewIds = addPassingCandidateReviews(historicalModule, latest.moduleSlug, historicalModule.zhReviewHash, fullHashB, "historical-test");
  historicalModule.enAuthoredHash = fullHashC;
  historicalModule.enEffectiveHash = fullHashA;
  historicalModule.enReviewHash = fullHashB;
  historicalModule.englishUpdatedAt = "2026-08-07";
  const historical = structuredClone(latest);
  historical.defermentId = "dfr-solution-patterns-historical-test";
  historical.closedAt = "2026-08-07";
  historical.promotedCommit = "e".repeat(40);
  historical.closureReviewIds = historicalReviewIds;
  historical.closureReceipt = "receipt-historical-test-closure";
  historical.englishCandidate = {
    zhReviewHash: historicalModule.zhReviewHash,
    zhRendererFiles: [...historicalModule.zhRendererFiles],
    enAuthoredHash: historicalModule.enAuthoredHash,
    enEffectiveHash: historicalModule.enEffectiveHash,
    enReviewHash: historicalModule.enReviewHash,
    enRendererFiles: [...historicalModule.enRendererFiles],
    englishUpdatedAt: historicalModule.englishUpdatedAt,
    reviewIds: historicalReviewIds,
  };
  latestRegistry.deferments.push(historical);
  latestRegistry.receipts.push({ receiptId: historical.closureReceipt, kind: "closure", recordedAt: "2026-08-07", decisionId: historical.decisionId, summary: "Historical test closure." });

  const fixturePromotedProjects = new Map([
    ...promotedProjectsByCommit,
    [latest.promotedCommit, latestProject],
    [historical.promotedCommit, historicalProject],
  ]);
  assert.deepEqual(validate(latestRegistry, latestProject, {
    promotedProjectsByCommit: fixturePromotedProjects,
    runtimeOverlays: runtimeOverlaysExcept(latest.moduleSlug),
  }).failures, []);
});

test("review schema enforces conditional gates and numeric bounds", () => {
  const record = structuredClone(Object.values(currentProject.modules.rag.reviewRecords)[0]);
  record.deterministic[0].status = "FAIL";
  assert.ok(validateJsonSchema(record, reviewSchema).some((error) => error.includes('must equal "PASS"')));

  record.deterministic[0].status = "PASS";
  record.rubric.semanticFidelity = 6;
  assert.ok(validateJsonSchema(record, reviewSchema).some((error) => error.includes("greater than 5")));

  record.rubric.semanticFidelity = 5;
  record.attempt = 0;
  assert.ok(validateJsonSchema(record, reviewSchema).some((error) => error.includes("less than 1")));
});

test("baseline promotion refuses an uncommitted checkout", () => {
  assert.doesNotThrow(() => assertPromotionCheckoutClean(""));
  assert.throws(
    () => assertPromotionCheckoutClean(" M app/i18n/en/modules/example.mjs\n"),
    /requires a clean working tree/,
  );

  const currentModuleState = structuredClone(currentProject.modules.rag);
  const committedModuleState = structuredClone(currentProject.modules.rag);
  assert.doesNotThrow(() => promotedBaselineFromCommittedState({
    currentModuleState,
    committedModuleState,
    commit: registry.moduleBaselines.rag.enBaselineCommit,
    reviewIds: registry.moduleBaselines.rag.reviewSetIds,
  }));
  currentModuleState.zhStateHash = fullHashA;
  assert.throws(
    () => promotedBaselineFromCommittedState({
      currentModuleState,
      committedModuleState,
      commit: registry.moduleBaselines.rag.enBaselineCommit,
      reviewIds: registry.moduleBaselines.rag.reviewSetIds,
    }),
    /does not match the committed HEAD provenance/,
  );
});

test("review generator refuses to overwrite PASS records while deferments are active", () => {
  const result = spawnSync(process.execPath, ["scripts/generate-bilingual-review-records.mjs", "--write", "--review-date", "2026-08-08"], { cwd: projectRoot, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /Automatic PASS review generation is disabled/);
});

test("localization audit reports chained runtime alignment and reviewed candidates", () => {
  const output = execFileSync(process.execPath, ["scripts/audit-localization-deferments.mjs"], { cwd: projectRoot, encoding: "utf8" });
  const lines = output.trim().split("\n");
  for (const slug of ["rag", "prompt-engineering"]) {
    const activeDeferment = registry.deferments.find((item) => item.moduleSlug === slug && item.status !== "closed");
    const runtimeOverlay = runtimeOverlays.get(slug);
    assert.ok(activeDeferment, `${slug} must have an active deferment`);
    assert.ok(runtimeOverlay, `${slug} must have a runtime overlay`);
    assert.ok(lines.includes(`DEFERRED/NOT_ALIGNED ${slug}: ${activeDeferment.defermentId} (runtime ${runtimeOverlay.maintenanceId})`));
  }
  assert.ok(lines.includes("Localization contract passed for 23 modules."));
  const active = registry.deferments.filter((item) => item.status !== "closed");
  assert.equal(lines.filter((line) => /^DEFERRED\/NOT_ALIGNED /.test(line)).length, active.filter((item) => item.status === "deferred").length);
  assert.equal(lines.filter((line) => /^READY\/NOT_ALIGNED /.test(line)).length, active.filter((item) => item.status === "ready-for-english-review").length);
  assert.equal(lines.filter((line) => /^(?:ALIGNED(?:\/RUNTIME-MAINTAINED)?|DEFERRED\/NOT_ALIGNED|READY\/NOT_ALIGNED) /.test(line)).length, publishedModuleSlugs.length);
});

test("English pages read englishUpdatedAt instead of Chinese updatedAt", async () => {
  const englishPage = await readFile(new URL("../app/i18n/english-pilot-module-page.tsx", import.meta.url), "utf8");
  assert.match(englishPage, /getEnglishUpdatedAt\(module\.slug\)/);
  assert.doesNotMatch(englishPage, /locale="en"[^>]*publication\.updatedAt/);
});
