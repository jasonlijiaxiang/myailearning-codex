import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { getEnglishUpdatedAt } from "../app/english-update-dates.mjs";
import { getPublishedModule, publishedModules, publishedModuleSlugs } from "../app/module-publication.mjs";
import { assertCanonicalRendererFileLists, assertPromotionCheckoutClean, loadProjectAtCommit, loadPromotedProjects, loadRuntimeMaintenanceOverlays, promotedBaselineFromCommittedState, validateLocalizationRegistry } from "../scripts/audit-localization-deferments.mjs";
import { assertJsonSchema, validateJsonSchema } from "../scripts/lib/json-schema-lite.mjs";
import {
  chineseRendererEntryFiles,
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

function validate(candidateRegistry = registry, candidateProject = currentProject, options = {}) {
  return validateLocalizationRegistry(candidateRegistry, candidateProject, {
    candidateIds,
    reviewSchema,
    promotedProjectsByCommit,
    ...options,
  });
}

function runtimeOverlaysExcept(...slugs) {
  return new Map([...runtimeOverlays].filter(([slug]) => !slugs.includes(slug)));
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
  assert.equal(registry.runtimeMaintenances.length, 1);
  const [maintenance] = registry.runtimeMaintenances;
  assert.equal(maintenance.maintenanceId, "erm-english-reader-2026-08-09");
  assert.equal(maintenance.receiptId, "receipt-english-reader-runtime-2026-08-09");
  assert.deepEqual(maintenance.affectedModuleSlugs, [...publishedModuleSlugs].sort());
  assert.deepEqual(maintenance.contentProjectionChangeSlugs, ["rag"]);
  assert.equal(maintenance.metadataScope, "all-en-routes");
  assert.deepEqual(Object.keys(registry.moduleBaselines).sort(), [...publishedModuleSlugs].sort());
  assert.match(registry.baselineCommit, /^[0-9a-f]{40}$/);
  for (const publication of publishedModules) {
    const baseline = registry.moduleBaselines[publication.slug];
    assert.match(baseline.zhBaselineCommit, /^[0-9a-f]{40}$/);
    assert.match(baseline.enBaselineCommit, /^[0-9a-f]{40}$/);
    assert.equal(baseline.englishUpdatedAt, getEnglishUpdatedAt(publication.slug));
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

test("one active deferment per module records the exact live object delta", () => {
  const activeSlugs = registry.deferments.filter((item) => item.status !== "closed").map((item) => item.moduleSlug);
  assert.equal(new Set(activeSlugs).size, activeSlugs.length);
  const result = validate(registry, currentProject, { runtimeOverlays });
  assert.deepEqual(result.failures, []);
  assert.equal(result.messages.filter((line) => line.startsWith("DEFERRED/NOT_ALIGNED ")).length, activeSlugs.length);
  assert.ok(
    registry.deferments.find((item) => item.moduleSlug === "solution-patterns")?.affectedObjects.some((item) => item.objectId.endsWith("/renderedProjection/sharedRendererHash")),
    "shared Chinese renderer changes must be represented in each affected module delta",
  );
});

test("runtime maintenance overlays only the verified English renderer state", () => {
  const closedSlugs = registry.deferments.filter((item) => item.status === "closed").map((item) => item.moduleSlug);
  assert.equal(runtimeOverlays.size, publishedModuleSlugs.length - closedSlugs.length);
  assert.ok(closedSlugs.every((slug) => !runtimeOverlays.has(slug)));
  assert.equal(runtimeOverlays.get("rag")?.maintenanceId, "erm-english-reader-2026-08-09");

  const driftedProject = structuredClone(currentProject);
  driftedProject.modules.rag.enEffectiveHash = fullHashA;
  assert.match(
    validate(registry, driftedProject, { runtimeOverlays }).failures.join("\n"),
    /rag: English content or date changed outside the localization workflow/,
  );
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
  const englishSharedFiles = await resolveRendererDependencyFiles(projectRoot, englishRendererEntryFiles("solution-patterns"));
  const englishRagFiles = await resolveRendererDependencyFiles(projectRoot, englishRendererEntryFiles("rag"));

  for (const relativePath of ["app/fieldbook-interactions.tsx", "app/deep-dive-relation-view.tsx", "app/layout-utils.mjs", "app/focused-visual-explainers.tsx", "app/module-visual-explorers.tsx"]) {
    assert.ok(solutionFiles.includes(relativePath), `${relativePath} must affect a shared Chinese module renderer hash`);
  }
  for (const [files, route] of [
    [ragFiles, "app/modules/rag/page.tsx"],
    [agentFiles, "app/modules/ai-agent/page.tsx"],
    [promptFiles, "app/modules/prompt-engineering/page.tsx"],
  ]) {
    assert.ok(files.includes(route), `${route} must be the module's real Chinese entry`);
    assert.ok(files.includes("app/flagship-labs.tsx"), `${route} must close over its interactive lab`);
    assert.ok(!files.includes("app/modules/[slug]/page.tsx"), `${route} must not inherit the unused brief route`);
  }
  assert.ok(englishSharedFiles.includes("app/en/modules/[slug]/page.tsx"));
  assert.ok(englishSharedFiles.includes("app/i18n/english-pilot-module-page.tsx"));
  assert.ok(englishRagFiles.includes("app/en/modules/rag/page.tsx"));
  assert.ok(!englishRagFiles.includes("app/en/modules/[slug]/page.tsx"));

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
    return filePath.endsWith("app/modules/rag/page.tsx") ? Buffer.concat([bytes, Buffer.from("\n// dedicated route mutation")]) : bytes;
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
  const omitted = structuredClone(registry);
  omitted.deferments[0].affectedObjects.pop();
  assert.match(validate(omitted).failures.join("\n"), /do not exactly match the live delta/);

  const invented = structuredClone(registry);
  invented.deferments[0].affectedObjects.push({
    objectId: "/module:solution-patterns/invented",
    objectType: "content",
    changeKind: "modified",
    baselineHash: fullHashA,
    currentHash: fullHashB,
    sourceIds: [],
  });
  assert.match(validate(invented).failures.join("\n"), /do not exactly match the live delta/);
});

test("semantic audit rejects invalid modified hashes and duplicate active records", () => {
  const sameHash = structuredClone(registry);
  const modified = sameHash.deferments.flatMap((item) => item.affectedObjects).find((item) => item.changeKind === "modified");
  assert.ok(modified);
  modified.currentHash = modified.baselineHash;
  assert.match(validate(sameHash).failures.join("\n"), /modified requires two different hashes/);

  const duplicate = structuredClone(registry);
  duplicate.deferments.push({ ...structuredClone(duplicate.deferments[0]), defermentId: "dfr-duplicate-active-record" });
  assert.match(validate(duplicate).failures.join("\n"), /only one active deferment is allowed/);
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

  const closureFieldsOnDeferred = structuredClone(registry);
  Object.assign(closureFieldsOnDeferred.deferments[0], {
    closedAt: "2026-08-08",
    promotedCommit: "d".repeat(40),
    closureReviewIds: closureFieldsOnDeferred.deferments[0].baselineReviewIds,
    closureReceipt: "receipt-localization-baseline-2026-08-08",
  });
  assert.match(validate(closureFieldsOnDeferred).failures.join("\n"), /only allowed on closed records/);
});

test("deferred state rejects every English hash or date drift", () => {
  const changed = structuredClone(currentProject);
  const slug = registry.deferments[0].moduleSlug;
  changed.modules[slug].enAuthoredHash = fullHashA;
  changed.modules[slug].englishUpdatedAt = "2026-08-08";
  assert.match(validate(registry, changed).failures.join("\n"), /deferred work changed English content or englishUpdatedAt/);
});

test("ready state requires a real, reviewed English candidate", () => {
  const readyRegistry = structuredClone(registry);
  const readyProject = structuredClone(currentProject);
  const deferment = readyRegistry.deferments[0];
  const moduleState = readyProject.modules[deferment.moduleSlug];
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
  const closed = structuredClone(registry);
  const deferment = closed.deferments[0];
  closed.receipts.push({ receiptId: "receipt-test-closure", kind: "closure", recordedAt: "2026-08-08", decisionId: "D-012", summary: "Test closure." });
  deferment.status = "closed";
  deferment.closedAt = "2026-08-08";
  deferment.closureReviewIds = deferment.baselineReviewIds;
  deferment.closureReceipt = "receipt-test-closure";
  assert.match(validate(closed).failures.join("\n"), /Chinese content changed without an active deferment/);
});

test("reviewed ready state can close only through an exact promoted baseline", () => {
  const closedRegistry = structuredClone(registry);
  const closedProject = structuredClone(currentProject);
  const deferment = closedRegistry.deferments[0];
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
  const latest = latestRegistry.deferments[0];
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

test("localization audit emits line-anchored aligned and deferred states", () => {
  const output = execFileSync(process.execPath, ["scripts/audit-localization-deferments.mjs"], { cwd: projectRoot, encoding: "utf8" });
  const lines = output.trim().split("\n");
  assert.ok(lines.some((line) => /^DEFERRED\/NOT_ALIGNED solution-patterns: dfr-solution-patterns-/.test(line)));
  assert.ok(lines.includes("ALIGNED/RUNTIME-MAINTAINED rag: erm-english-reader-2026-08-09"));
  assert.ok(lines.includes("ALIGNED/RUNTIME-MAINTAINED prompt-engineering: erm-english-reader-2026-08-09"));
  assert.ok(lines.includes("Localization contract passed for 21 modules."));
  assert.equal(lines.filter((line) => /^DEFERRED\/NOT_ALIGNED /.test(line)).length, registry.deferments.filter((item) => item.status !== "closed").length);
  assert.equal(
    lines.filter((line) => /^ALIGNED\/RUNTIME-MAINTAINED /.test(line)).length,
    publishedModuleSlugs.filter((slug) => !registry.deferments.some((item) => item.moduleSlug === slug && item.status !== "closed") && runtimeOverlays.has(slug)).length,
  );
});

test("English pages read englishUpdatedAt instead of Chinese updatedAt", async () => {
  const englishPage = await readFile(new URL("../app/i18n/english-pilot-module-page.tsx", import.meta.url), "utf8");
  assert.match(englishPage, /getEnglishUpdatedAt\(module\.slug\)/);
  assert.doesNotMatch(englishPage, /locale="en"[^>]*publication\.updatedAt/);
});
