import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseResultId, readJson, resolveProjectPath } from "./context.mjs";
import { readPrivateJson } from "../private-runtime.mjs";

export async function loadSourceLedger(config) {
  const ledgerFile = resolveProjectPath(config.curation.sourceLedger);
  const ledgerModule = await import(`${pathToFileURL(ledgerFile).href}?portable-kb=${Date.now()}`);
  if (!ledgerModule.sourceLedger || typeof ledgerModule.sourceLedger !== "object") {
    throw new Error("Public source ledger must export sourceLedger");
  }
  return ledgerModule.sourceLedger;
}

export async function loadPublishedModuleIds(config) {
  const publicationFile = resolveProjectPath(config.curation.publicationRegistry);
  const publicationModule = await import(
    `${pathToFileURL(publicationFile).href}?portable-kb=${Date.now()}`
  );
  if (!Array.isArray(publicationModule.publishedModules)) {
    throw new Error("Publication registry must export publishedModules");
  }
  return new Set(publicationModule.publishedModules.map((module) => module?.slug).filter(Boolean));
}

export function resultExists(result, registries) {
  if (!result) return false;
  if (result.kind === "candidate") return registries.candidates.has(result.id);
  if (result.kind === "claim") return registries.claims.has(result.id);
  if (result.kind === "module") return registries.modules.has(result.id);
  if (result.kind === "source") return registries.sources.has(result.id);
  if (result.kind === "release") return registries.releases.has(result.id);
  return false;
}

export function resultTracesCapture(resultId, turnKey, registries) {
  const result = parseResultId(resultId);
  if (!result) return false;
  if (result.kind === "candidate") {
    return registries.candidates.get(result.id)?.capturedTurnIds?.includes(turnKey) ?? false;
  }
  if (result.kind === "claim") {
    return registries.claims.get(result.id)?.derivedFrom?.includes(turnKey) ?? false;
  }
  return [...registries.candidates.values()].some((candidate) => (
    candidate.status === "integrated"
    && candidate.capturedTurnIds?.includes(turnKey)
    && candidate.integratedResultIds?.includes(resultId)
  ));
}

export async function loadResultRegistries(config) {
  const runtime = path.join(resolveProjectPath(config.capture.privateInbox), ".runtime");
  const candidateRegistry = await readPrivateJson(runtime, resolveProjectPath(config.curation.candidates), {
    schemaVersion: 1,
    items: [],
  });
  const claimRegistry = await readJson(resolveProjectPath(config.curation.claims), {
    schemaVersion: 1,
    items: [],
  });
  const releaseRegistry = await readJson(resolveProjectPath(config.curation.releaseManifest), {
    schemaVersion: 1,
    releases: [],
  });
  const sourceLedger = await loadSourceLedger(config);
  return {
    candidates: new Map((candidateRegistry.items ?? []).map((item) => [item?.id, item])),
    claims: new Map((claimRegistry.items ?? []).map((item) => [item?.id, item])),
    modules: await loadPublishedModuleIds(config),
    sources: new Map(Object.entries(sourceLedger)),
    releases: new Map((releaseRegistry.releases ?? []).map((item) => [item?.id, item])),
  };
}

export function verifierFromRegistries(registries) {
  return async (capture) => {
    const result = parseResultId(capture.curation?.result);
    return Boolean(
      result
      && resultExists(result, registries)
      && resultTracesCapture(capture.curation.result, capture.turnKey, registries)
    );
  };
}
