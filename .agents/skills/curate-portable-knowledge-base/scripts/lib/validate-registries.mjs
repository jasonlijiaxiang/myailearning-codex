import {
  canonicalProjectRelative,
  exists,
  parseResultId,
  qualityCommands,
  readJson,
  resolveProjectPath,
  sameStringArray,
} from "./context.mjs";
import { validDate, validateSchemaValue } from "./json-schema.mjs";
import { readPrivateJson, pruneExpiredCaptures } from "../private-runtime.mjs";
import {
  loadPublishedModuleIds,
  loadSourceLedger,
  resultExists,
  resultTracesCapture,
  verifierFromRegistries,
} from "./registries.mjs";

function uniqueIds(items, label, errors) {
  const seen = new Set();
  for (const item of items) {
    if (!item || typeof item.id !== "string" || item.id.length === 0) {
      errors.push(`${label} contains an item without an id`);
      continue;
    }
    if (seen.has(item.id)) errors.push(`${label} contains duplicate id ${item.id}`);
    seen.add(item.id);
  }
}

export async function validateKnowledgeState(
  config,
  { errors, attachmentRoots, privateSafe, runtime, privateCaptures },
  { allowOverdueUnresolved, skipRetentionSweep },
) {
  const registryErrorStart = errors.length;
  const claims = await readJson(resolveProjectPath(config.curation.claims), { schemaVersion: 1, items: [] });
  const candidateRegistry = await readPrivateJson(runtime, resolveProjectPath(config.curation.candidates), {
    schemaVersion: 1,
    items: [],
  });
  const releases = await readJson(resolveProjectPath(config.curation.releaseManifest), null);
  const attachmentPolicy = config.handoff?.attachmentPolicy
    ? await readJson(resolveProjectPath(config.handoff.attachmentPolicy), null)
    : null;
  const claimSchema = await readJson(resolveProjectPath("knowledge/schemas/claim.schema.json"));
  const candidateSchema = await readJson(resolveProjectPath("knowledge/schemas/candidate.schema.json"));
  const attachmentSchema = config.handoff?.attachmentSchema
    ? await readJson(resolveProjectPath(config.handoff.attachmentSchema))
    : null;
  const releaseSchema = await readJson(resolveProjectPath(
    config.curation.releaseSchema ?? "knowledge/schemas/release.schema.json",
  ));
  if (!releaseSchema || typeof releaseSchema !== "object") {
    errors.push("Release manifest schema is missing or invalid");
  }
  if (!attachmentSchema || typeof attachmentSchema !== "object") {
    errors.push("Attachment distribution schema is missing or invalid");
  }
  if (!attachmentPolicy || attachmentPolicy.schemaVersion !== 2
    || !Array.isArray(attachmentPolicy.items)) {
    errors.push("Attachment distribution policy must contain schemaVersion 2 and an items array");
  } else {
    if (attachmentSchema) {
      validateSchemaValue(attachmentPolicy, attachmentSchema, "Attachment distribution policy", errors);
    }
    if (attachmentPolicy.$schema !== "./schemas/attachment-distribution.schema.json") {
      errors.push("Attachment distribution policy must reference ./schemas/attachment-distribution.schema.json");
    }
    const seenAttachmentPaths = new Set();
    for (const item of attachmentPolicy.items) {
      let itemPath;
      try {
        itemPath = canonicalProjectRelative(item?.path);
      } catch (error) {
        errors.push(error.message);
        continue;
      }
      if (seenAttachmentPaths.has(itemPath)) {
        errors.push(`Attachment distribution policy contains duplicate path: ${itemPath}`);
      }
      seenAttachmentPaths.add(itemPath);
      const insideRoot = attachmentRoots.some((root) => (
        itemPath === root || itemPath.startsWith(`${root}/`)
      ));
      if (!insideRoot) {
        errors.push(`Attachment policy path is outside configured attachment roots: ${itemPath}`);
      }
      if (!await exists(resolveProjectPath(itemPath))) {
        errors.push(`Attachment policy references a missing file: ${itemPath}`);
      }
      if (!validDate(item.reviewedAt)) {
        errors.push(`Attachment policy ${itemPath} has an invalid reviewedAt date`);
      }
      if (item.authorization === "denied" && (item.allowedAudiences?.length ?? 0) > 0) {
        errors.push(`Denied attachment policy cannot allow an audience: ${itemPath}`);
      }
      if (item.authorization === "confirmed" && (item.allowedAudiences?.length ?? 0) === 0) {
        errors.push(`Confirmed attachment policy must allow at least one audience: ${itemPath}`);
      }
    }
  }
  let sourceLedger = {};
  let moduleIds = new Set();
  try {
    sourceLedger = await loadSourceLedger(config);
  } catch (error) {
    errors.push(error.message);
  }
  try {
    moduleIds = await loadPublishedModuleIds(config);
  } catch (error) {
    errors.push(error.message);
  }
  const sourceIds = new Set(Object.keys(sourceLedger));
  const captureTurnIds = new Set(privateCaptures.map((capture) => capture?.turnKey).filter(Boolean));

  if (claims.schemaVersion !== 1 || !Array.isArray(claims.items)) {
    errors.push("Claim registry must contain schemaVersion 1 and an items array");
  } else {
    uniqueIds(claims.items, "Claim registry", errors);
    const claimIds = new Set(claims.items.map((claim) => claim?.id).filter(Boolean));
    const claimById = new Map(claims.items.map((claim) => [claim?.id, claim]));
    const today = new Date().toISOString().slice(0, 10);
    for (const claim of claims.items) {
      validateSchemaValue(claim, claimSchema, `Claim ${claim?.id ?? "unknown"}`, errors);
      if (!validDate(claim.verifiedAt) || !validDate(claim.reviewBy)) {
        errors.push(`Claim ${claim.id} has an invalid lifecycle date`);
      } else if (claim.reviewBy < claim.verifiedAt) {
        errors.push(`Claim ${claim.id} reviewBy predates verifiedAt`);
      } else {
        if ([30, 90, 180].includes(claim.reviewCadenceDays)) {
          const maximumReview = new Date(`${claim.verifiedAt}T00:00:00Z`);
          maximumReview.setUTCDate(maximumReview.getUTCDate() + claim.reviewCadenceDays);
          if (claim.reviewBy > maximumReview.toISOString().slice(0, 10)) {
            errors.push(`Claim ${claim.id} reviewBy exceeds its ${claim.reviewCadenceDays}-day cadence`);
          }
        }
        if (claim.verifiedAt > today) errors.push(`Claim ${claim.id} verifiedAt is in the future`);
        if (["active", "watch"].includes(claim.status) && claim.reviewBy < today) {
          errors.push(`Claim ${claim.id} is overdue and must be reverified or retired`);
        }
      }
      if (claim.status === "active" && claim.evidenceGrade === "C") {
        errors.push(`Claim ${claim.id} cannot be active with C-grade evidence`);
      }
      for (const sourceId of claim.sourceIds ?? []) {
        if (!sourceIds.has(sourceId)) errors.push(`Claim ${claim.id} references unknown sourceId ${sourceId}`);
      }
      if (claim.supersedes && !claimIds.has(claim.supersedes)) {
        errors.push(`Claim ${claim.id} supersedes unknown claim ${claim.supersedes}`);
      }
      if (claim.announcement) {
        const { targetClaimId, scheduledFor } = claim.announcement;
        const target = claimById.get(targetClaimId);
        if (!target) {
          errors.push(`Claim ${claim.id} announces replacement of unknown claim ${targetClaimId}`);
        } else if (targetClaimId === claim.id) {
          errors.push(`Claim ${claim.id} cannot announce itself as a replacement target`);
        } else {
          if (claim.status !== "watch") {
            errors.push(`Claim ${claim.id} with a scheduled replacement announcement must be watch`);
          }
          if (target.status !== "watch") {
            errors.push(`Claim ${targetClaimId} targeted by a scheduled replacement announcement must be watch`);
          }
          if (validDate(scheduledFor)) {
            if (validDate(claim.verifiedAt) && scheduledFor < claim.verifiedAt) {
              errors.push(`Claim ${claim.id} scheduled replacement predates its verification`);
            }
            if (validDate(claim.reviewBy) && claim.reviewBy > scheduledFor) {
              errors.push(`Claim ${claim.id} reviewBy exceeds scheduled replacement date ${scheduledFor}`);
            }
            if (validDate(target.reviewBy) && target.reviewBy > scheduledFor) {
              errors.push(`Claim ${targetClaimId} reviewBy exceeds announced replacement date ${scheduledFor}`);
            }
          }
        }
      }
    }
  }

  const claimMap = new Map((claims.items ?? []).map((claim) => [claim?.id, claim]));
  if (candidateRegistry.schemaVersion !== 1 || !Array.isArray(candidateRegistry.items)) {
    errors.push("Candidate registry must contain schemaVersion 1 and an items array");
  } else {
    uniqueIds(candidateRegistry.items, "Candidate registry", errors);
    const contentHashes = new Map();
    for (const candidate of candidateRegistry.items) {
      validateSchemaValue(candidate, candidateSchema, `Candidate ${candidate?.id ?? "unknown"}`, errors);
      if (contentHashes.has(candidate.contentHash)) {
        errors.push(`Candidates ${contentHashes.get(candidate.contentHash)} and ${candidate.id} duplicate contentHash ${candidate.contentHash}`);
      } else if (typeof candidate.contentHash === "string") {
        contentHashes.set(candidate.contentHash, candidate.id);
      }
      if (Number.isFinite(Date.parse(candidate.createdAt)) && Number.isFinite(Date.parse(candidate.updatedAt))
        && Date.parse(candidate.updatedAt) < Date.parse(candidate.createdAt)) {
        errors.push(`Candidate ${candidate.id} updatedAt predates createdAt`);
      }
      for (const turnId of candidate.capturedTurnIds ?? []) {
        if (!captureTurnIds.has(turnId)) {
          errors.push(`Candidate ${candidate.id} references missing private capture ${turnId}`);
        }
      }
      if (candidate.moduleId && !moduleIds.has(candidate.moduleId)) {
        errors.push(`Candidate ${candidate.id} references unknown module ${candidate.moduleId}`);
      }
      if (candidate.status !== "integrated" && (candidate.integratedResultIds?.length ?? 0) > 0) {
        errors.push(`Candidate ${candidate.id} cannot declare integratedResultIds before integrated`);
      }
      if (candidate.visibility === "public-candidate" && candidate.sensitivity === "restricted") {
        errors.push(`Candidate ${candidate.id} cannot be public-candidate with restricted sensitivity`);
      }
      if (["ready", "integrated"].includes(candidate.status)) {
        if (candidate.visibility !== "public-candidate" || candidate.sensitivity !== "none") {
          errors.push(`Candidate ${candidate.id} must be non-sensitive and public-candidate before ${candidate.status}`);
        }
        if (typeof candidate.decision !== "string" || !candidate.decision.trim()) {
          errors.push(`Candidate ${candidate.id} needs a decision note before ${candidate.status}`);
        }
        const directEvidence = (candidate.sourceIds ?? [])
          .map((sourceId) => sourceLedger[sourceId])
          .some((source) => ["A", "B"].includes(source?.grade));
        const claimEvidence = (candidate.claimIds ?? [])
          .map((claimId) => claimMap.get(claimId))
          .some((claim) => ["A", "B"].includes(claim?.evidenceGrade)
            && ["active", "watch"].includes(claim?.status));
        if (!directEvidence && !claimEvidence) {
          errors.push(`Candidate ${candidate.id} needs at least one current A/B source or claim before ${candidate.status}`);
        }
      }
      for (const sourceId of candidate.sourceIds ?? []) {
        if (!sourceIds.has(sourceId)) {
          errors.push(`Candidate ${candidate.id} references unknown sourceId ${sourceId}`);
        }
      }
      for (const claimId of candidate.claimIds ?? []) {
        if (!claimMap.has(claimId)) errors.push(`Candidate ${candidate.id} references unknown claim ${claimId}`);
      }
    }
  }

  const candidateMap = new Map((candidateRegistry.items ?? []).map((candidate) => [candidate?.id, candidate]));
  const releaseMap = new Map();
  if (!releases || releases.schemaVersion !== 1 || !Array.isArray(releases.releases)) {
    errors.push("Release manifest must contain schemaVersion 1 and a releases array");
  } else {
    if (releaseSchema) validateSchemaValue(releases, releaseSchema, "Release manifest", errors);
    if (releases.$schema !== "./schemas/release.schema.json") {
      errors.push("Release manifest must reference ./schemas/release.schema.json");
    }
    uniqueIds(releases.releases, "Release manifest", errors);
    for (const release of releases.releases) releaseMap.set(release?.id, release);
  }
  const resultRegistries = {
    candidates: candidateMap,
    claims: claimMap,
    modules: moduleIds,
    sources: new Map(Object.entries(sourceLedger)),
    releases: releaseMap,
  };
  if (releases?.schemaVersion === 1 && Array.isArray(releases.releases)) {
    for (const release of releases.releases) {
      const label = `Release ${release?.id ?? "unknown"}`;
      if (release.projectId !== config.project.id) errors.push(`${label} projectId does not match this project`);
      if (!sameStringArray(release.qualityCommands, qualityCommands(config))) {
        errors.push(`${label} qualityCommands do not match kb.config.json`);
      }
      if (Number.isFinite(Date.parse(release.createdAt ?? ""))
        && Number.isFinite(Date.parse(release.verifiedAt ?? ""))
        && Date.parse(release.verifiedAt) < Date.parse(release.createdAt)) {
        errors.push(`${label} verifiedAt predates createdAt`);
      }
      const archiveFields = [release.archiveSha256, release.archiveBytes, release.archiveFileCount];
      const archiveFieldCount = archiveFields.filter((value) => value !== null && value !== undefined).length;
      if (![0, 3].includes(archiveFieldCount)) errors.push(`${label} archive integrity fields must be all present or all null`);
      if (release.mode === "local") {
        if (release.status !== "verified" || archiveFieldCount !== 3
          || release.commitSha || release.versionId || release.publicUrl) {
          errors.push(`${label} local mode needs a verified archive and no Git or Sites identity`);
        }
      }
      if (release.mode === "git") {
        if (release.status !== "verified" || !/^[0-9a-f]{40}$/.test(release.commitSha ?? "")
          || release.versionId || release.publicUrl) {
          errors.push(`${label} git mode needs a verified 40-character commit and no Sites identity`);
        }
      }
      if (release.mode === "sites") {
        if (release.status !== "deployed" || !/^[0-9a-f]{40}$/.test(release.commitSha ?? "")
          || typeof release.versionId !== "string" || !release.versionId
          || !/^https:\/\//.test(release.publicUrl ?? "")) {
          errors.push(`${label} sites mode needs a deployed commit, version ID, and HTTPS public URL`);
        }
      }
      for (const resultId of release.knowledgeResults ?? []) {
        const result = parseResultId(resultId);
        if (!result || !["claim", "module", "source"].includes(result.kind)
          || !resultExists(result, resultRegistries)) {
          errors.push(`${label} references a missing or non-public knowledge result: ${resultId}`);
        }
      }
    }
  }

  for (const candidate of candidateRegistry.items ?? []) {
    if (candidate.status !== "integrated") continue;
    if (!Array.isArray(candidate.integratedResultIds) || candidate.integratedResultIds.length === 0) {
      errors.push(`Candidate ${candidate.id} needs integratedResultIds before integrated`);
      continue;
    }
    for (const resultId of candidate.integratedResultIds) {
      const result = parseResultId(resultId);
      if (!result || result.kind === "candidate" || !resultExists(result, resultRegistries)) {
        errors.push(`Candidate ${candidate.id} references a missing integrated result: ${resultId}`);
      } else if (result.kind === "module" && candidate.moduleId !== result.id) {
        errors.push(`Candidate ${candidate.id} moduleId must equal integrated module ${result.id}`);
      }
    }
  }

  const registriesValid = errors.length === registryErrorStart;
  const canVerifyProcessed = registriesValid && errors.length === 0;
  for (const capture of privateCaptures) {
    if (capture.curation?.status !== "processed") continue;
    const result = parseResultId(capture.curation.result);
    if (!result || !resultExists(result, resultRegistries)) {
      errors.push(`Private capture ${capture.captureId} processed result does not exist: ${capture.curation.result}`);
    } else if (!resultTracesCapture(capture.curation.result, capture.turnKey, resultRegistries)) {
      errors.push(`Private capture ${capture.captureId} processed result does not trace back to ${capture.turnKey}`);
    }
  }

  if (privateSafe && !skipRetentionSweep) {
    const pruning = await pruneExpiredCaptures({
      runtime,
      retentionDays: config.capture.rawRetentionDays,
      force: true,
      verifyProcessed: canVerifyProcessed
        ? verifierFromRegistries(resultRegistries)
        : async () => false,
    });
    if (!allowOverdueUnresolved && pruning.overdueUnresolved > 0) {
      errors.push(`${pruning.overdueUnresolved} unresolved private capture(s) exceed the retention window`);
    }
  }

  const trackedKnowledge = JSON.stringify({ attachmentPolicy, claims, releases });
  if (/\/(?:Users|home)\/|[A-Za-z]:\\|file:\/\//.test(trackedKnowledge)) {
    errors.push("Portable knowledge metadata contains an absolute path");
  }

  return { registriesValid, resultRegistries };
}
