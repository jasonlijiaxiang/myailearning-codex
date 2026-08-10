import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { assertJsonSchema } from "./lib/json-schema-lite.mjs";
import {
  COMMIT_PATTERN,
  affectedObjectKey,
  assertAffectedObjectShape,
  composeLocalizationModuleBaseline,
  diffObjectCatalogs,
  loadLocalizationProject,
  normalizeRendererDependencyFiles,
  persistableLocalizationModuleState,
} from "./lib/localization-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(root, "knowledge", "localization-deferments.json");
const schemaPath = path.join(root, "knowledge", "schemas", "localization-deferment.schema.json");
const reviewSchemaPath = path.join(root, "knowledge", "schemas", "bilingual-review.schema.json");
const candidateMatrixPath = path.join(root, "docs", "change-plans", "2026-08-ai-knowledge-base-content-improvement", "stage-0", "candidate-matrix.json");
const requiredReviewStages = ["xhigh-author", "xhigh-semantic", "xhigh-language", "ultra-exception"];

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sorted(values) {
  return [...values].sort();
}

function baselineSourceIds(registry) {
  const ids = new Set();
  for (const baseline of Object.values(registry.moduleBaselines)) {
    for (const object of Object.values(baseline.zhObjects)) {
      for (const sourceId of object.sourceIds ?? []) ids.add(sourceId);
    }
  }
  return ids;
}

function compareAffectedObjects(actual, registered) {
  return same(actual.map(affectedObjectKey).sort(), registered.map(affectedObjectKey).sort());
}

function unchangedEnglish(current, baseline) {
  return current.enAuthoredHash === baseline.enAuthoredHash
    && current.enEffectiveHash === baseline.enEffectiveHash
    && current.enReviewHash === baseline.enReviewHash
    && same(current.enRendererFiles, baseline.enRendererFiles)
    && current.englishUpdatedAt === baseline.englishUpdatedAt;
}

function matchesEnglishCandidate(current, candidate) {
  return current.enAuthoredHash === candidate.enAuthoredHash
    && current.enEffectiveHash === candidate.enEffectiveHash
    && current.enReviewHash === candidate.enReviewHash
    && same(current.zhRendererFiles, candidate.zhRendererFiles)
    && same(current.enRendererFiles, candidate.enRendererFiles)
    && current.englishUpdatedAt === candidate.englishUpdatedAt;
}

function englishRuntimeState(state) {
  return {
    enAuthoredHash: state.enAuthoredHash,
    enEffectiveHash: state.enEffectiveHash,
    enReviewHash: state.enReviewHash,
    enRendererFiles: state.enRendererFiles,
    englishUpdatedAt: state.englishUpdatedAt,
  };
}

function sameEnglishRuntimeState(left, right) {
  return left.enAuthoredHash === right.enAuthoredHash
    && left.enEffectiveHash === right.enEffectiveHash
    && left.enReviewHash === right.enReviewHash
    && same(left.enRendererFiles, right.enRendererFiles)
    && left.englishUpdatedAt === right.englishUpdatedAt;
}

function sameEnglishAuthoredReviewAndDate(left, right) {
  return left.enAuthoredHash === right.enAuthoredHash
    && left.enReviewHash === right.enReviewHash
    && left.englishUpdatedAt === right.englishUpdatedAt;
}

function withRuntimeEnglishBaseline(baseline, runtimeState) {
  return { ...baseline, ...englishRuntimeState(runtimeState) };
}

export function assertPromotionCheckoutClean(statusOutput) {
  if (statusOutput.trim()) {
    throw new Error("--close-and-promote requires a clean working tree so the promoted baseline is exactly attributable to HEAD");
  }
}

export function promotedBaselineFromCommittedState({ currentModuleState, committedModuleState, commit, reviewIds }) {
  const currentBaseline = persistableLocalizationModuleState(currentModuleState, commit, reviewIds);
  const committedBaseline = persistableLocalizationModuleState(committedModuleState, commit, reviewIds);
  if (!same(currentBaseline, committedBaseline)) {
    throw new Error("--close-and-promote current module state does not match the committed HEAD provenance");
  }
  return committedBaseline;
}

function validatePassingReviewSet({ reviewIds, moduleState, moduleSlug, expectedZhHash, expectedEnHash, reviewSchema, label, fail }) {
  if (!reviewSchema) {
    fail(`${label}: bilingual review schema is required`);
    return;
  }
  if (!same(sorted(reviewIds), sorted([...new Set(reviewIds)]))) fail(`${label}: review IDs must be unique`);
  const stages = [];
  for (const reviewId of reviewIds) {
    const file = moduleState.reviewFiles[reviewId];
    const record = moduleState.reviewRecords?.[reviewId];
    if (!file || !record) {
      fail(`${label}: review ${reviewId} is missing`);
      continue;
    }
    try {
      assertJsonSchema(record, reviewSchema, `${label} review ${reviewId}`);
    } catch (error) {
      fail(error.message);
      continue;
    }
    if (record.scope.moduleId !== moduleSlug || record.scope.locale !== "en" || record.scope.objectType !== "module") {
      fail(`${label}: review ${reviewId} has the wrong module scope`);
    }
    if (record.scope.zhContentHash !== expectedZhHash || file.zhContentHash !== expectedZhHash) {
      fail(`${label}: review ${reviewId} does not cover the required Chinese content`);
    }
    if (record.scope.enContentHash !== expectedEnHash || file.enContentHash !== expectedEnHash) {
      fail(`${label}: review ${reviewId} does not cover the required English content`);
    }
    if (record.verdict !== "PASS" || record.blockClass !== "NONE" || record.nextStage !== "publish-candidate") {
      fail(`${label}: review ${reviewId} is not a publishable PASS`);
    }
    if (!Array.isArray(record.deterministic) || record.deterministic.length === 0 || record.deterministic.some((gate) => gate.status !== "PASS")) {
      fail(`${label}: review ${reviewId} contains a failing deterministic gate`);
    }
    stages.push(record.stage);
  }
  if (!same(sorted(stages), sorted(requiredReviewStages))) {
    fail(`${label}: review set must contain exactly ${requiredReviewStages.join(", ")}`);
  }
}

export function validateLocalizationRegistry(registry, currentProject, { candidateIds = new Set(), reviewSchema, promotedProjectsByCommit = new Map(), runtimeOverlays = new Map() } = {}) {
  const failures = [];
  const messages = [];
  const fail = (message) => failures.push(message);
  const publishedSlugs = currentProject.publishedModuleSlugs;
  const baselineSlugs = Object.keys(registry.moduleBaselines).sort();
  if (!same(baselineSlugs, [...publishedSlugs].sort())) {
    fail(`moduleBaselines must exactly cover published modules; received ${baselineSlugs.length}, expected ${publishedSlugs.length}`);
  }

  const receiptIds = new Set();
  const receiptById = new Map();
  for (const receipt of registry.receipts) {
    if (receiptIds.has(receipt.receiptId)) fail(`duplicate receipt ID ${receipt.receiptId}`);
    receiptIds.add(receipt.receiptId);
    receiptById.set(receipt.receiptId, receipt);
  }

  const runtimeMaintenanceIds = new Set();
  for (const maintenance of registry.runtimeMaintenances ?? []) {
    if (runtimeMaintenanceIds.has(maintenance.maintenanceId)) fail(`duplicate runtime maintenance ID ${maintenance.maintenanceId}`);
    runtimeMaintenanceIds.add(maintenance.maintenanceId);
    const receipt = receiptById.get(maintenance.receiptId);
    if (!receipt) fail(`${maintenance.maintenanceId}: unknown runtime-maintenance receipt ${maintenance.receiptId}`);
    else if (receipt.kind !== "runtime-maintenance") fail(`${maintenance.maintenanceId}: receipt must be runtime-maintenance`);
    else if (receipt.decisionId !== maintenance.decisionId) fail(`${maintenance.maintenanceId}: receipt decision does not match the maintenance`);
    if (new Set(maintenance.affectedModuleSlugs).size !== maintenance.affectedModuleSlugs.length) fail(`${maintenance.maintenanceId}: affected module slugs must be unique`);
    if (new Set(maintenance.changedRendererFiles).size !== maintenance.changedRendererFiles.length) fail(`${maintenance.maintenanceId}: changed renderer files must be unique`);
    for (const slug of maintenance.affectedModuleSlugs) {
      if (!publishedSlugs.includes(slug)) fail(`${maintenance.maintenanceId}: unknown affected module ${slug}`);
    }
    for (const slug of maintenance.contentProjectionChangeSlugs) {
      if (!maintenance.affectedModuleSlugs.includes(slug)) fail(`${maintenance.maintenanceId}: content projection module ${slug} is not affected`);
    }
  }

  const knownSourceIds = new Set([...currentProject.sourceIds, ...baselineSourceIds(registry)]);
  const defermentIds = new Set();
  const activeBySlug = new Map();
  const closedDeferments = [];
  for (const deferment of registry.deferments) {
    if (defermentIds.has(deferment.defermentId)) fail(`duplicate deferment ID ${deferment.defermentId}`);
    defermentIds.add(deferment.defermentId);
    if (!publishedSlugs.includes(deferment.moduleSlug)) fail(`${deferment.defermentId}: unknown module ${deferment.moduleSlug}`);
    if (!receiptIds.has(deferment.localeGateReceipt)) fail(`${deferment.defermentId}: unknown localeGateReceipt ${deferment.localeGateReceipt}`);
    const localeGateReceipt = receiptById.get(deferment.localeGateReceipt);
    if (localeGateReceipt && localeGateReceipt.kind !== "locale-gate") fail(`${deferment.defermentId}: localeGateReceipt must reference a locale-gate receipt`);
    if (localeGateReceipt && localeGateReceipt.decisionId !== deferment.decisionId) fail(`${deferment.defermentId}: locale-gate receipt decision does not match the deferment`);
    for (const candidateId of deferment.candidateIds) {
      if (candidateIds.size && !candidateIds.has(candidateId)) fail(`${deferment.defermentId}: unknown candidate ${candidateId}`);
    }
    const objectIds = new Set();
    for (const [index, object] of deferment.affectedObjects.entries()) {
      try {
        assertAffectedObjectShape(object, `${deferment.defermentId}.affectedObjects[${index}]`);
      } catch (error) {
        fail(error.message);
      }
      if (objectIds.has(object.objectId)) fail(`${deferment.defermentId}: duplicate affected object ${object.objectId}`);
      objectIds.add(object.objectId);
      for (const sourceId of object.sourceIds) {
        if (!knownSourceIds.has(sourceId)) fail(`${deferment.defermentId}: affected object references unknown source ${sourceId}`);
      }
    }
    if (deferment.status !== "closed") {
      for (const field of ["closedAt", "promotedCommit", "closureReviewIds", "closureReceipt"]) {
        if (Object.hasOwn(deferment, field)) fail(`${deferment.defermentId}: ${field} is only allowed on closed records`);
      }
      const active = activeBySlug.get(deferment.moduleSlug) ?? [];
      active.push(deferment);
      activeBySlug.set(deferment.moduleSlug, active);
    } else {
      if (!deferment.closedAt || !deferment.promotedCommit || !deferment.closureReviewIds?.length || !deferment.closureReceipt) {
        fail(`${deferment.defermentId}: closed records require closedAt, promotedCommit, closureReviewIds, and closureReceipt`);
      }
      if (deferment.closureReceipt && !receiptIds.has(deferment.closureReceipt)) {
        fail(`${deferment.defermentId}: unknown closureReceipt ${deferment.closureReceipt}`);
      }
      const closureReceipt = receiptById.get(deferment.closureReceipt);
      if (closureReceipt && closureReceipt.kind !== "closure") fail(`${deferment.defermentId}: closureReceipt must reference a closure receipt`);
      if (closureReceipt && closureReceipt.decisionId !== deferment.decisionId) fail(`${deferment.defermentId}: closure receipt decision does not match the deferment`);
      if (!deferment.englishCandidate) fail(`${deferment.defermentId}: closed records must retain the reviewed English candidate`);
      else if (!same(sorted(deferment.closureReviewIds ?? []), sorted(deferment.englishCandidate.reviewIds))) {
        fail(`${deferment.defermentId}: closureReviewIds must exactly match the reviewed English candidate`);
      }
      closedDeferments.push(deferment);
    }
  }

  for (const deferment of closedDeferments) {
    const promotedModuleState = promotedProjectsByCommit.get(deferment.promotedCommit)?.modules[deferment.moduleSlug];
    if (!promotedModuleState || !deferment.englishCandidate) {
      if (deferment.promotedCommit) fail(`${deferment.defermentId}: promotedCommit cannot be reconstructed`);
      continue;
    }
    let promotedBaseline;
    try {
      promotedBaseline = persistableLocalizationModuleState(promotedModuleState, deferment.promotedCommit, deferment.englishCandidate.reviewIds);
    } catch (error) {
      fail(`${deferment.defermentId}: cannot reconstruct promoted candidate: ${error.message}`);
      continue;
    }
    if (deferment.englishCandidate.zhReviewHash !== promotedBaseline.zhReviewHash
      || !same(deferment.englishCandidate.zhRendererFiles, promotedBaseline.zhRendererFiles)
      || deferment.englishCandidate.enAuthoredHash !== promotedBaseline.enAuthoredHash
      || deferment.englishCandidate.enEffectiveHash !== promotedBaseline.enEffectiveHash
      || deferment.englishCandidate.enReviewHash !== promotedBaseline.enReviewHash
      || !same(deferment.englishCandidate.enRendererFiles, promotedBaseline.enRendererFiles)
      || deferment.englishCandidate.englishUpdatedAt !== promotedBaseline.englishUpdatedAt) {
      fail(`${deferment.defermentId}: closed candidate must match its own promoted commit`);
    }
    validatePassingReviewSet({
      reviewIds: deferment.closureReviewIds,
      moduleState: promotedModuleState,
      moduleSlug: deferment.moduleSlug,
      expectedZhHash: deferment.englishCandidate.zhReviewHash,
      expectedEnHash: deferment.englishCandidate.enReviewHash,
      reviewSchema,
      label: deferment.defermentId,
      fail,
    });
  }

  for (const [slug, active] of activeBySlug) {
    if (active.length > 1) fail(`${slug}: only one active deferment is allowed; received ${active.length}`);
  }

  for (const slug of publishedSlugs) {
    const baseline = registry.moduleBaselines[slug];
    const current = currentProject.modules[slug];
    if (!baseline || !current) continue;
    const runtimeOverlay = runtimeOverlays.get(slug) ?? null;
    const englishBaseline = runtimeOverlay ? withRuntimeEnglishBaseline(baseline, runtimeOverlay.state) : baseline;

    for (const [reviewId, expectedFile] of Object.entries(baseline.reviewFiles)) {
      const currentFile = current.reviewFiles[reviewId];
      if (!currentFile) fail(`${slug}: baseline review ${reviewId} is missing`);
      else if (!same(currentFile, expectedFile)) fail(`${slug}: baseline review ${reviewId} was modified or moved`);
    }
    validatePassingReviewSet({
      reviewIds: baseline.reviewSetIds,
      moduleState: current,
      moduleSlug: slug,
      expectedZhHash: baseline.zhReviewHash,
      expectedEnHash: baseline.enReviewHash,
      reviewSchema,
      label: `${slug} baseline`,
      fail,
    });

    const active = activeBySlug.get(slug)?.[0] ?? null;
    const actualDiff = diffObjectCatalogs(baseline.zhObjects, current.zhObjects);
    if (!active) {
      if (current.zhStateHash !== baseline.zhStateHash || actualDiff.length) fail(`${slug}: Chinese content changed without an active deferment`);
      if (!unchangedEnglish(current, englishBaseline)) fail(`${slug}: English content or date changed outside the localization workflow`);
      messages.push(runtimeOverlay
        ? `ALIGNED/RUNTIME-MAINTAINED ${slug}: ${runtimeOverlay.maintenanceId}`
        : `ALIGNED ${slug}: strict bilingual baseline holds.`);
      continue;
    }

    if (active.openedFromCommit !== baseline.zhBaselineCommit) {
      fail(`${active.defermentId}: openedFromCommit must match the module baseline commit`);
    }

    const expectedReviewIds = baseline.reviewSetIds;
    if (!same(sorted(active.baselineReviewIds), expectedReviewIds)) {
      fail(`${active.defermentId}: baselineReviewIds do not match the immutable review set`);
    }
    if (current.zhStateHash === baseline.zhStateHash || actualDiff.length === 0) {
      fail(`${active.defermentId}: active deferment has no Chinese state delta`);
    }
    if (!compareAffectedObjects(actualDiff, active.affectedObjects)) {
      const actualIds = actualDiff.map((item) => item.objectId);
      const registeredIds = active.affectedObjects.map((item) => item.objectId);
      fail(`${active.defermentId}: affectedObjects do not exactly match the live delta (actual ${actualIds.length}, registered ${registeredIds.length})`);
    }

    if (active.status === "deferred") {
      if (!unchangedEnglish(current, englishBaseline)) fail(`${active.defermentId}: deferred work changed English content or englishUpdatedAt`);
      if (active.englishCandidate) fail(`${active.defermentId}: deferred state must not carry an English candidate`);
      messages.push(runtimeOverlay
        ? `DEFERRED/NOT_ALIGNED ${slug}: ${active.defermentId} (runtime ${runtimeOverlay.maintenanceId})`
        : `DEFERRED/NOT_ALIGNED ${slug}: ${active.defermentId}`);
    } else if (active.status === "ready-for-english-review") {
      if (!active.englishCandidate) fail(`${active.defermentId}: ready state requires englishCandidate hashes and review IDs`);
      else {
        if (active.englishCandidate.zhReviewHash !== current.zhReviewHash) fail(`${active.defermentId}: English candidate does not cover the current Chinese review scope`);
        if (!matchesEnglishCandidate(current, active.englishCandidate)) fail(`${active.defermentId}: current English does not match the registered candidate`);
        if (unchangedEnglish(current, englishBaseline)) fail(`${active.defermentId}: ready state must contain a real English candidate delta`);
        validatePassingReviewSet({
          reviewIds: active.englishCandidate.reviewIds,
          moduleState: current,
          moduleSlug: slug,
          expectedZhHash: current.zhReviewHash,
          expectedEnHash: active.englishCandidate.enReviewHash,
          reviewSchema,
          label: active.defermentId,
          fail,
        });
      }
      messages.push(`READY/NOT_ALIGNED ${slug}: ${active.defermentId}`);
    }
  }

  return { failures, messages };
}

function assertCommitAvailable(commit, label, { requireRemote = true } = {}) {
  if (!COMMIT_PATTERN.test(commit)) throw new Error(`${label}: expected a full 40-character commit SHA`);
  const exists = spawnSync("git", ["cat-file", "-e", `${commit}^{commit}`], { cwd: root });
  if (exists.status !== 0) throw new Error(`${label}: commit ${commit} does not exist locally`);
  const ancestor = spawnSync("git", ["merge-base", "--is-ancestor", commit, "HEAD"], { cwd: root });
  if (ancestor.status !== 0) throw new Error(`${label}: commit ${commit} is not an ancestor of HEAD`);
  if (requireRemote) {
    const remoteContains = execFileSync("git", ["branch", "-r", "--contains", commit], { cwd: root, encoding: "utf8" }).trim();
    if (!remoteContains) throw new Error(`${label}: commit ${commit} is not reachable from a remote-tracking branch`);
  }
}

export function assertCanonicalRendererFileLists(project, expectedFilesBySlug) {
  for (const [slug, expected] of Object.entries(expectedFilesBySlug)) {
    const moduleState = project.modules[slug];
    if (!moduleState) throw new Error(`${slug}: canonical renderer closure cannot be reconstructed`);
    for (const [locale, files] of Object.entries(expected)) {
      if (!["zh", "en"].includes(locale)) throw new Error(`${slug}: unknown renderer locale ${locale}`);
      const canonicalFiles = locale === "zh" ? moduleState.zhRendererFiles : moduleState.enRendererFiles;
      const normalizedFiles = normalizeRendererDependencyFiles(files, `${slug}.${locale}RendererFiles`);
      if (!same(normalizedFiles, canonicalFiles)) {
        throw new Error(`${slug}: stored ${locale} renderer files do not match the canonical commit closure`);
      }
    }
  }
}

export async function loadProjectAtCommit(commit, expectedFilesBySlug = {}) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "kb-localization-baseline-"));
  try {
    const archive = execFileSync("git", ["archive", "--format=tar", commit], { cwd: root, maxBuffer: 64 * 1024 * 1024 });
    execFileSync("tar", ["-xf", "-", "-C", directory], { input: archive, maxBuffer: 64 * 1024 * 1024 });
    const moduleSlugs = Object.keys(expectedFilesBySlug);
    // Load the contract from the archived checkout. Historical baselines must
    // retain the effective-hash semantics that were in force at their commit;
    // the current audit implementation may legitimately use a later contract.
    const archivedContractPath = path.join(directory, "scripts", "lib", "localization-contract.mjs");
    let loadArchivedLocalizationProject = loadLocalizationProject;
    try {
      await readFile(archivedContractPath);
      const archivedContractUrl = pathToFileURL(archivedContractPath).href;
      ({ loadLocalizationProject: loadArchivedLocalizationProject } = await import(archivedContractUrl));
    } catch (error) {
      // The earliest Chinese-only baseline predates the contract module. Its
      // English state is never used for that baseline, so the current loader
      // is sufficient to reconstruct the required Chinese state.
      if (error?.code !== "ENOENT") throw error;
    }
    const project = await loadArchivedLocalizationProject(directory, { moduleSlugs: moduleSlugs.length ? moduleSlugs : null });
    assertCanonicalRendererFileLists(project, expectedFilesBySlug);
    return project;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function assertBaselineProvenance(registry, { requireRemote = false } = {}) {
  const projectsByCommit = new Map();
  const rendererFilesByCommit = new Map();
  function register(commit, slug, locale, files) {
    const bySlug = rendererFilesByCommit.get(commit) ?? {};
    const expected = bySlug[slug] ?? {};
    if (expected[locale] && !same(expected[locale], files)) throw new Error(`${slug}: conflicting ${locale} renderer provenance for ${commit}`);
    expected[locale] = files;
    bySlug[slug] = expected;
    rendererFilesByCommit.set(commit, bySlug);
  }
  for (const [slug, baseline] of Object.entries(registry.moduleBaselines)) {
    register(baseline.zhBaselineCommit, slug, "zh", baseline.zhRendererFiles);
    register(baseline.enBaselineCommit, slug, "en", baseline.enRendererFiles);
  }
  for (const [commit, rendererFilesBySlug] of rendererFilesByCommit) {
    assertCommitAvailable(commit, "module baselineCommit", { requireRemote });
    projectsByCommit.set(commit, await loadProjectAtCommit(commit, rendererFilesBySlug));
  }
  for (const [slug, baseline] of Object.entries(registry.moduleBaselines)) {
    const historicalZh = projectsByCommit.get(baseline.zhBaselineCommit)?.modules[slug];
    const historicalEn = projectsByCommit.get(baseline.enBaselineCommit)?.modules[slug];
    if (!historicalZh || !historicalEn) throw new Error(`${slug}: baseline commits do not contain the published module`);
    const reconstructed = composeLocalizationModuleBaseline(
      historicalZh,
      historicalEn,
      baseline.zhBaselineCommit,
      baseline.enBaselineCommit,
      baseline.reviewSetIds,
    );
    if (!same(reconstructed, baseline)) throw new Error(`${slug}: stored localization baseline does not match its declared commits`);
  }
}

export async function loadPromotedProjects(registry, { requireRemote = false } = {}) {
  const projects = new Map();
  const rendererFilesByCommit = new Map();
  for (const deferment of registry.deferments.filter((item) => item.status === "closed" && item.promotedCommit && item.englishCandidate)) {
    const bySlug = rendererFilesByCommit.get(deferment.promotedCommit) ?? {};
    bySlug[deferment.moduleSlug] = {
      zh: deferment.englishCandidate.zhRendererFiles,
      en: deferment.englishCandidate.enRendererFiles,
    };
    rendererFilesByCommit.set(deferment.promotedCommit, bySlug);
  }
  for (const [commit, rendererFilesBySlug] of rendererFilesByCommit) {
    if (!commit) continue;
    assertCommitAvailable(commit, "promotedCommit", { requireRemote });
    projects.set(commit, await loadProjectAtCommit(commit, rendererFilesBySlug));
  }
  return projects;
}

function commitParent(commit) {
  return execFileSync("git", ["rev-parse", `${commit}^`], { cwd: root, encoding: "utf8" }).trim();
}

function isAncestor(ancestor, descendant) {
  return spawnSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], { cwd: root }).status === 0;
}

function changedFilesBetween(baseCommit, implementationCommit) {
  return execFileSync("git", ["diff", "--name-only", baseCommit, implementationCommit], { cwd: root, encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .sort();
}

const effectiveHashContractFiles = new Set(["scripts/lib/localization-contract.mjs"]);

export function derivedAffectedModuleSlugs(beforeProject, implementationProject, changedRendererFiles) {
  if (changedRendererFiles.some((file) => effectiveHashContractFiles.has(file))) {
    return [...beforeProject.publishedModuleSlugs].sort();
  }
  return beforeProject.publishedModuleSlugs.filter((slug) => {
    const before = beforeProject.modules[slug];
    const after = implementationProject.modules[slug];
    const rendererFiles = new Set([...(before?.enRendererFiles ?? []), ...(after?.enRendererFiles ?? [])]);
    return changedRendererFiles.some((file) => rendererFiles.has(file));
  }).sort();
}

export async function loadRuntimeMaintenanceOverlays(registry, { requireRemote = false } = {}) {
  const failures = [];
  const overlays = new Map();
  const records = registry.runtimeMaintenances ?? [];
  const knownMaintenanceIds = new Set();

  for (const maintenance of records) {
    const label = maintenance.maintenanceId ?? "runtime-maintenance";
    if (knownMaintenanceIds.has(maintenance.maintenanceId)) {
      failures.push(`duplicate runtime maintenance ID ${maintenance.maintenanceId}`);
      continue;
    }
    knownMaintenanceIds.add(maintenance.maintenanceId);

    try {
      assertCommitAvailable(maintenance.baseCommit, `${label} baseCommit`, { requireRemote });
      assertCommitAvailable(maintenance.implementationCommit, `${label} implementationCommit`, { requireRemote });
      if (commitParent(maintenance.implementationCommit) !== maintenance.baseCommit) {
        failures.push(`${label}: baseCommit must be the direct parent of implementationCommit`);
        continue;
      }

      const actualChangedFiles = changedFilesBetween(maintenance.baseCommit, maintenance.implementationCommit);
      if (!same(actualChangedFiles, sorted(maintenance.changedRendererFiles))) {
        failures.push(`${label}: changedRendererFiles must exactly match the implementation commit diff`);
        continue;
      }

      const [beforeProject, implementationProject] = await Promise.all([
        loadProjectAtCommit(maintenance.baseCommit),
        loadProjectAtCommit(maintenance.implementationCommit),
      ]);
      const derivedAffected = derivedAffectedModuleSlugs(beforeProject, implementationProject, maintenance.changedRendererFiles);
      if (!same(derivedAffected, sorted(maintenance.affectedModuleSlugs))) {
        failures.push(`${label}: affectedModuleSlugs must exactly match the renderer dependency closure`);
        continue;
      }

      for (const slug of maintenance.affectedModuleSlugs) {
        const baseline = registry.moduleBaselines[slug];
        const before = beforeProject.modules[slug];
        const after = implementationProject.modules[slug];
        if (!baseline || !before || !after) {
          failures.push(`${label}: cannot reconstruct ${slug}`);
          continue;
        }
        if (isAncestor(maintenance.implementationCommit, baseline.enBaselineCommit)) {
          // A later content promotion already includes this maintenance. It is
          // historical provenance, not a live overlay for the current baseline.
          overlays.delete(slug);
          continue;
        }
        const expectedBefore = overlays.get(slug)?.state ?? baseline;
        if (!sameEnglishRuntimeState(before, expectedBefore)) {
          failures.push(`${label}: ${slug} base commit does not match the registered English baseline or prior runtime maintenance`);
          continue;
        }
        if (!sameEnglishAuthoredReviewAndDate(before, after) || !same(before.reviewFiles, after.reviewFiles)) {
          failures.push(`${label}: ${slug} changes English authored content, review scope, review files, or update date`);
          continue;
        }
        if (sameEnglishRuntimeState(before, after)) {
          failures.push(`${label}: ${slug} has no effective English renderer change`);
          continue;
        }
        overlays.set(slug, { maintenanceId: maintenance.maintenanceId, state: after });
      }
    } catch (error) {
      failures.push(`${label}: ${error.message}`);
    }
  }

  return { failures, overlays };
}

async function loadInputs() {
  const [registryText, schemaText, reviewSchemaText, matrixText, currentProject] = await Promise.all([
    readFile(registryPath, "utf8"),
    readFile(schemaPath, "utf8"),
    readFile(reviewSchemaPath, "utf8"),
    readFile(candidateMatrixPath, "utf8"),
    loadLocalizationProject(root),
  ]);
  const registry = JSON.parse(registryText);
  const schema = JSON.parse(schemaText);
  const reviewSchema = JSON.parse(reviewSchemaText);
  const matrix = JSON.parse(matrixText);
  return { registry, schema, reviewSchema, currentProject, candidateIds: new Set(matrix.candidates.map((candidate) => candidate.candidateId)) };
}

function cliValue(flag, { required = false } = {}) {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    if (required) throw new Error(`--record-runtime-maintenance requires ${flag}`);
    return null;
  }
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

function cliCsv(flag, options) {
  const value = cliValue(flag, options);
  if (!value) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean).sort();
}

function assertRuntimeMaintenanceCheckoutClean(statusOutput) {
  if (statusOutput.trim()) {
    throw new Error("--record-runtime-maintenance requires a clean working tree so the renderer state is exactly attributable to HEAD");
  }
}

async function recordRuntimeMaintenance({ registry, schema, reviewSchema, currentProject, candidateIds }) {
  const recordIndex = process.argv.indexOf("--record-runtime-maintenance");
  const maintenanceId = process.argv[recordIndex + 1];
  if (!maintenanceId || maintenanceId.startsWith("--")) throw new Error("--record-runtime-maintenance requires one explicit maintenance ID");
  const receiptId = cliValue("--receipt", { required: true });
  const decisionId = cliValue("--decision-id", { required: true });
  const recordedAt = cliValue("--recorded-at", { required: true });
  const summary = cliValue("--summary", { required: true });
  const metadataScope = cliValue("--metadata-scope") ?? "none";
  const contentProjectionChangeSlugs = cliCsv("--content-projection");
  const declaredFiles = cliCsv("--files", { required: true });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(recordedAt)) throw new Error("--recorded-at requires YYYY-MM-DD");

  const worktreeStatus = execFileSync("git", ["status", "--porcelain=v1", "--untracked-files=normal"], { cwd: root, encoding: "utf8" });
  assertRuntimeMaintenanceCheckoutClean(worktreeStatus);
  const implementationCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const baseCommit = commitParent(implementationCommit);
  const actualChangedFiles = changedFilesBetween(baseCommit, implementationCommit);
  if (!same(actualChangedFiles, declaredFiles)) throw new Error("--files must exactly match the implementation commit diff");

  const [beforeProject, implementationProject] = await Promise.all([
    loadProjectAtCommit(baseCommit),
    loadProjectAtCommit(implementationCommit),
  ]);
  const affectedModuleSlugs = derivedAffectedModuleSlugs(beforeProject, implementationProject, declaredFiles);
  if (!affectedModuleSlugs.length) throw new Error("--record-runtime-maintenance found no affected English module renderer closure");

  const candidateRegistry = structuredClone(registry);
  candidateRegistry.receipts.push({
    receiptId,
    kind: "runtime-maintenance",
    recordedAt,
    decisionId,
    summary: `English renderer maintenance ${maintenanceId}: ${summary}`,
  });
  candidateRegistry.runtimeMaintenances.push({
    maintenanceId,
    status: "applied",
    kind: "english-renderer",
    decisionId,
    recordedAt,
    baseCommit,
    implementationCommit,
    receiptId,
    changedRendererFiles: declaredFiles,
    affectedModuleSlugs,
    contentProjectionChangeSlugs,
    metadataScope,
    summary,
  });
  assertJsonSchema(candidateRegistry, schema, "localization registry");
  await assertBaselineProvenance(candidateRegistry, { requireRemote: false });
  const [promotedProjectsByCommit, runtime] = await Promise.all([
    loadPromotedProjects(candidateRegistry, { requireRemote: false }),
    loadRuntimeMaintenanceOverlays(candidateRegistry, { requireRemote: false }),
  ]);
  if (runtime.failures.length) throw new Error(`Refusing runtime maintenance:\n${runtime.failures.map((failure) => `- ${failure}`).join("\n")}`);
  const validation = validateLocalizationRegistry(candidateRegistry, currentProject, {
    candidateIds,
    reviewSchema,
    promotedProjectsByCommit,
    runtimeOverlays: runtime.overlays,
  });
  if (validation.failures.length) throw new Error(`Refusing runtime maintenance:\n${validation.failures.map((failure) => `- ${failure}`).join("\n")}`);
  await writeFile(registryPath, `${JSON.stringify(candidateRegistry, null, 2)}\n`);
  console.log(`Recorded ${maintenanceId} from ${implementationCommit}.`);
}

async function main() {
  const { registry, schema, reviewSchema, currentProject, candidateIds } = await loadInputs();
  assertJsonSchema(registry, schema, "localization registry");

  if (process.argv.includes("--write-baseline")) throw new Error("--write-baseline is unsafe and unsupported; use the reviewed --close-and-promote transition");
  if (process.argv.includes("--record-runtime-maintenance")) {
    await recordRuntimeMaintenance({ registry, schema, reviewSchema, currentProject, candidateIds });
    return;
  }

  const requireRemote = process.argv.includes("--require-remote") || Boolean(process.env.KB_RELEASE_COMMIT);
  assertCommitAvailable(registry.baselineCommit, "baselineCommit", { requireRemote });
  for (const commit of new Set(registry.deferments.map((deferment) => deferment.openedFromCommit))) {
    assertCommitAvailable(commit, "openedFromCommit", { requireRemote });
  }
  await assertBaselineProvenance(registry, { requireRemote });
  const [promotedProjectsByCommit, runtime] = await Promise.all([
    loadPromotedProjects(registry, { requireRemote }),
    loadRuntimeMaintenanceOverlays(registry, { requireRemote }),
  ]);
  if (runtime.failures.length) throw new Error(`Runtime maintenance failures:\n${runtime.failures.map((failure) => `- ${failure}`).join("\n")}`);

  const { failures, messages } = validateLocalizationRegistry(registry, currentProject, {
    candidateIds,
    reviewSchema,
    promotedProjectsByCommit,
    runtimeOverlays: runtime.overlays,
  });
  for (const message of messages) console.log(message);
  if (failures.length) throw new Error(`Localization contract failures:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);

  const closeIndex = process.argv.indexOf("--close-and-promote");
  if (closeIndex !== -1) {
    const slug = process.argv[closeIndex + 1];
    const receiptIndex = process.argv.indexOf("--closure-receipt");
    const dateIndex = process.argv.indexOf("--closed-at");
    const closureReceipt = receiptIndex === -1 ? null : process.argv[receiptIndex + 1];
    const closedAt = dateIndex === -1 ? null : process.argv[dateIndex + 1];
    if (!slug || slug.startsWith("--")) throw new Error("--close-and-promote requires one explicit module slug");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(closedAt ?? "")) throw new Error("--close-and-promote requires --closed-at YYYY-MM-DD");
    const worktreeStatus = execFileSync("git", ["status", "--porcelain=v1", "--untracked-files=normal"], { cwd: root, encoding: "utf8" });
    assertPromotionCheckoutClean(worktreeStatus);
    const deferment = registry.deferments.find((item) => item.moduleSlug === slug && item.status === "ready-for-english-review");
    if (!deferment?.englishCandidate) throw new Error(`${slug}: no reviewed ready-for-english-review transition exists`);
    const receipt = registry.receipts.find((item) => item.receiptId === closureReceipt);
    if (!receipt || receipt.kind !== "closure" || receipt.decisionId !== deferment.decisionId) throw new Error(`${slug}: --closure-receipt must reference a matching closure receipt`);
    const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
    assertCommitAvailable(head, "promotion commit", { requireRemote: false });
    const committedProject = await loadProjectAtCommit(head, {
      [slug]: {
        zh: deferment.englishCandidate.zhRendererFiles,
        en: deferment.englishCandidate.enRendererFiles,
      },
    });
    const committedModuleState = committedProject.modules[slug];
    if (!committedModuleState) throw new Error(`${slug}: committed HEAD does not contain the module being promoted`);
    registry.moduleBaselines[slug] = promotedBaselineFromCommittedState({
      currentModuleState: currentProject.modules[slug],
      committedModuleState,
      commit: head,
      reviewIds: deferment.englishCandidate.reviewIds,
    });
    deferment.status = "closed";
    deferment.closedAt = closedAt;
    deferment.promotedCommit = head;
    deferment.closureReviewIds = [...deferment.englishCandidate.reviewIds];
    deferment.closureReceipt = closureReceipt;
    promotedProjectsByCommit.set(head, committedProject);
    assertJsonSchema(registry, schema, "localization registry");
    const refreshedRuntime = await loadRuntimeMaintenanceOverlays(registry, { requireRemote: false });
    if (refreshedRuntime.failures.length) throw new Error(`Refusing invalid closure:\n${refreshedRuntime.failures.map((failure) => `- ${failure}`).join("\n")}`);
    const promoted = validateLocalizationRegistry(registry, currentProject, {
      candidateIds,
      reviewSchema,
      promotedProjectsByCommit,
      runtimeOverlays: refreshedRuntime.overlays,
    });
    if (promoted.failures.length) throw new Error(`Refusing invalid closure:\n${promoted.failures.map((failure) => `- ${failure}`).join("\n")}`);
    await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
    console.log(`Closed ${slug} and promoted its reviewed baseline from ${head}.`);
    return;
  }

  console.log(`Localization contract passed for ${currentProject.publishedModuleSlugs.length} modules.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
