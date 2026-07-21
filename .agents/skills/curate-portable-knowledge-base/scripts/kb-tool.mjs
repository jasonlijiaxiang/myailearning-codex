import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  acquirePrivateLock,
  atomicWriteJson,
  privateInboxIsSafe,
  pruneExpiredCaptures,
  readPrivateFile,
  readPrivateJson,
  releasePrivateLock,
  walkPrivateFiles,
} from "./private-runtime.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = process.env.NODE_ENV === "test" && process.env.PORTABLE_KB_TEST_ROOT
  ? path.resolve(process.env.PORTABLE_KB_TEST_ROOT)
  : path.resolve(SCRIPT_DIR, "../../../..");
const CONFIG_FILE = path.join(PROJECT_ROOT, "kb.config.json");
const REQUIRED_PORTABLE_EXCLUDES = [
  ".git",
  "node_modules",
  "dist",
  ".next",
  ".vinext",
  ".wrangler",
  "outputs",
  "work",
];
const REQUIRED_PORTABLE_SEGMENT_EXCLUDES = new Set([
  ...REQUIRED_PORTABLE_EXCLUDES,
  "coverage",
]);
const REQUIRED_PORTABLE_INCLUDES = [
  ".agents/skills/curate-portable-knowledge-base",
  ".codex/hooks.json",
  ".gitignore",
  ".node-version",
  "AGENTS.md",
  "HANDOFF-READ-FIRST.html",
  "HANDOFF.md",
  "README.md",
  "kb.config.json",
  "package.json",
  "package-lock.json",
  "app",
  "public",
  "knowledge/claims",
  "knowledge/release-manifest.json",
  "knowledge/schemas",
  "scripts",
  "tests",
];
const REQUIRED_PORTABLE_ROOTS = [
  ".agents/skills/curate-portable-knowledge-base",
  "app",
  "public",
  "knowledge/claims",
  "knowledge/schemas",
  "scripts",
  "tests",
];
const REQUIRED_PORTABLE_FILES = [
  ".agents/skills/curate-portable-knowledge-base/SKILL.md",
  ".agents/skills/curate-portable-knowledge-base/scripts/capture-turn.mjs",
  ".agents/skills/curate-portable-knowledge-base/scripts/hook-bootstrap.mjs",
  ".agents/skills/curate-portable-knowledge-base/scripts/kb-tool.mjs",
  ".agents/skills/curate-portable-knowledge-base/scripts/private-runtime.mjs",
  ".codex/hooks.json",
  ".gitignore",
  ".node-version",
  "AGENTS.md",
  "HANDOFF-READ-FIRST.html",
  "HANDOFF.md",
  "README.md",
  "kb.config.json",
  "package.json",
  "package-lock.json",
  "app/module-publication.mjs",
  "app/module-content-registry.mjs",
  "app/reference-content.mjs",
  "app/terminology.mjs",
  "knowledge/claims/index.json",
  "knowledge/release-manifest.json",
  "knowledge/schemas/candidate.schema.json",
  "knowledge/schemas/claim.schema.json",
  "knowledge/schemas/release.schema.json",
  "scripts/release-check.mjs",
];
const SAFE_QUALITY_COMMANDS = Object.freeze([
  "npm run kb:validate",
  "npm run lint",
  "npm test",
]);
const EXPECTED_HOOK_COMMAND_SHA256 = "0bc700775252b8391ef3ec898ed0e48d536bc4e2ac3aa97c90c9dd11cc73724f";
const EXPECTED_HOOK_TIMEOUT_SECONDS = 20;
const EXPECTED_HOOK_EVENTS = Object.freeze(["Stop", "UserPromptSubmit"]);
const EXPECTED_HOOK_HANDLER_KEYS = Object.freeze([
  "command",
  "commandWindows",
  "statusMessage",
  "timeout",
  "type",
]);
const INDEX_FILE_MODIFIED_AT = new Date("1980-01-01T00:00:00.000Z");
const PROCESSABLE_COMPLETENESS = new Set(["full-to-stop", "visible-messages"]);
const RESULT_ID_PATTERN = /^(candidate|claim|module|source|release):([a-z0-9][a-z0-9._/-]{1,127})$/i;
const ALLOWED_PORTABLE_INCLUDES = new Set([
  ...REQUIRED_PORTABLE_INCLUDES,
  ".openai/hosting.example.json",
  "build",
  "db",
  "docs",
  "drizzle",
  "examples",
  "external_reference",
  "knowledge",
  "knowledge/schemas",
  "worker",
  "drizzle.config.ts",
  "eslint.config.mjs",
  "next.config.ts",
  "postcss.config.mjs",
  "tsconfig.json",
  "vite.config.ts",
]);

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function portablePath(value) {
  return value.split(path.sep).join("/").replace(/^\.\//, "");
}

function isWithin(candidate, parent) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function resolveProjectPath(relative) {
  if (typeof relative !== "string" || path.isAbsolute(relative)) {
    throw new Error(`Expected a project-relative path, received: ${relative}`);
  }
  const resolved = path.resolve(PROJECT_ROOT, relative);
  if (!isWithin(resolved, PROJECT_ROOT)) throw new Error(`Path leaves project root: ${relative}`);
  return resolved;
}

function canonicalProjectRelative(value) {
  if (typeof value !== "string" || !value || value.includes("\\") || path.isAbsolute(value)) {
    throw new Error(`Expected a canonical project-relative path, received: ${value}`);
  }
  const normalized = path.posix.normalize(value);
  if (normalized !== value || normalized === "." || normalized.startsWith("../")) {
    throw new Error(`Project path is not canonical: ${value}`);
  }
  resolveProjectPath(value);
  return normalized;
}

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function loadConfig() {
  const config = await readJson(CONFIG_FILE);
  if (!config) throw new Error("kb.config.json is missing");
  return config;
}

function qualityCommands(config) {
  return Array.isArray(config.quality?.commands)
    ? config.quality.commands
    : [...SAFE_QUALITY_COMMANDS];
}

function sameStringArray(left, right) {
  return Array.isArray(left)
    && left.length === right.length
    && left.every((item, index) => item === right[index]);
}

function parseResultId(value) {
  const match = RESULT_ID_PATTERN.exec(value ?? "");
  return match ? { kind: match[1].toLowerCase(), id: match[2] } : null;
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function parseVersion(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(value.replace(/^v/, ""));
  return match ? match.slice(1).map(Number) : null;
}

function versionAtLeast(actual, required) {
  for (let index = 0; index < 3; index += 1) {
    if (actual[index] > required[index]) return true;
    if (actual[index] < required[index]) return false;
  }
  return true;
}

function gitStatus() {
  const result = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    shell: false,
  });
  return result.status === 0 ? "available" : "unavailable";
}

function gitCommand(args) {
  return spawnSync("git", args, {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    shell: false,
  });
}

async function doctor({ json = false } = {}) {
  const config = await loadConfig();
  const requiredVersion = parseVersion(config.project.requiredNode.replace(/^>=/, ""));
  const actualVersion = parseVersion(process.version);
  const checks = [];
  const add = (name, status, detail) => checks.push({ name, status, detail });

  add(
    "node",
    actualVersion && requiredVersion && versionAtLeast(actualVersion, requiredVersion) ? "pass" : "fail",
    `${process.version} / requires ${config.project.requiredNode}`,
  );

  const requiredFiles = [
    "AGENTS.md",
    "HANDOFF-READ-FIRST.html",
    "HANDOFF.md",
    "README.md",
    "package.json",
    "package-lock.json",
    ".agents/skills/curate-portable-knowledge-base/SKILL.md",
    ".codex/hooks.json",
    config.curation.publicationRegistry,
    config.curation.contentRegistry,
    config.curation.sourceLedger,
    config.curation.terminology,
  ];

  for (const relative of requiredFiles) {
    add(relative, await exists(resolveProjectPath(relative)) ? "pass" : "fail", "required");
  }

  add("git", "info", gitStatus());
  const privateInbox = resolveProjectPath(config.capture.privateInbox);
  add(
    "private-inbox-safety",
    await privateInboxIsSafe(PROJECT_ROOT, privateInbox) ? "pass" : "fail",
    "must stay inside the real project tree without symlinks",
  );
  add(
    "sites-binding",
    "info",
    await exists(resolveProjectPath(config.publishing.sites.binding))
      ? "present; excluded from portable packages by default"
      : "not bound; local mode remains available",
  );

  const failed = checks.filter((check) => check.status === "fail");
  if (json) {
    console.log(JSON.stringify({ ok: failed.length === 0, checks }, null, 2));
  } else {
    for (const check of checks) {
      console.log(`${check.status.toUpperCase().padEnd(5)} ${check.name}: ${check.detail}`);
    }
  }

  if (failed.length > 0) process.exitCode = 1;
  return failed.length === 0;
}

async function inbox({ json = false } = {}) {
  const config = await loadConfig();
  const runtime = path.join(resolveProjectPath(config.capture.privateInbox), ".runtime");
  if (!await privateInboxIsSafe(PROJECT_ROOT, resolveProjectPath(config.capture.privateInbox))) {
    throw new Error("Private inbox must stay inside the real project tree without symlinks");
  }
  const verifyProcessed = await prepareProcessedResultVerifier();
  const pruning = await pruneExpiredCaptures({
    runtime,
    retentionDays: config.capture.rawRetentionDays,
    force: true,
    verifyProcessed,
  });
  const captures = await walkPrivateFiles(runtime, path.join(runtime, "captures"), ".json");
  const counts = { pending: 0, processed: 0, ignored: 0, blocked: 0, total: captures.length };

  for (const file of captures) {
    const capture = await readPrivateJson(runtime, file, {});
    const status = capture.curation?.status ?? "pending";
    if (!(status in counts)) counts[status] = 0;
    counts[status] += 1;
  }

  if (json) {
    console.log(JSON.stringify({ ...counts, retention: pruning }, null, 2));
  } else {
    console.log(`Private inbox: ${counts.pending} pending / ${counts.total} total`);
    console.log(`Processed: ${counts.processed}; ignored: ${counts.ignored}; blocked: ${counts.blocked}`);
    if (pruning.purgedCaptures > 0) {
      console.log(`Expired processed/ignored payloads purged: ${pruning.purgedCaptures}`);
    }
    if (pruning.orphanPayloadsRemoved > 0) {
      console.log(`Expired orphan payloads removed: ${pruning.orphanPayloadsRemoved}`);
    }
    if (pruning.overdueUnresolved > 0) {
      console.log(`Overdue unresolved captures requiring curation: ${pruning.overdueUnresolved}`);
    }
    if (pruning.skippedInvalid > 0) {
      console.log(`Invalid capture envelopes retained for review: ${pruning.skippedInvalid}`);
    }
  }
}

async function mark(identifier, status, note = "") {
  const allowed = new Set(["processed", "ignored", "blocked", "pending"]);
  if (!identifier || !allowed.has(status)) {
    throw new Error("Usage: npm run kb:mark -- <captureId-or-turnKey> <processed|ignored|blocked|pending> [note]");
  }
  if (status === "processed" && !parseResultId(note)) {
    throw new Error("processed requires candidate:, claim:, module:, source:, or release: followed by a stable ID");
  }
  if (["ignored", "blocked"].includes(status) && !note.trim()) {
    throw new Error(`${status} requires a reason`);
  }
  if (status === "pending" && note.trim()) throw new Error("pending does not accept a note");

  const config = await loadConfig();
  const runtime = path.join(resolveProjectPath(config.capture.privateInbox), ".runtime");
  if (!await privateInboxIsSafe(PROJECT_ROOT, resolveProjectPath(config.capture.privateInbox))) {
    throw new Error("Private inbox must stay inside the real project tree without symlinks");
  }
  if (status === "processed") {
    const registryErrors = await validate({
      quiet: true,
      allowOverdueUnresolved: true,
      skipRetentionSweep: true,
      setExitCode: false,
    });
    if (registryErrors.length > 0) {
      throw new Error(`processed requires valid capture and knowledge registries: ${registryErrors.join("; ")}`);
    }
  }
  const resultRegistries = status === "processed" ? await loadResultRegistries(config) : null;
  const captures = await walkPrivateFiles(runtime, path.join(runtime, "captures"), ".json");

  for (const file of captures) {
    const initial = await readPrivateJson(runtime, file, {});
    if (initial.captureId !== identifier && initial.turnKey !== identifier) continue;
    if (!/^s_[0-9a-f]{32}$/.test(initial.sessionKey ?? "")) {
      throw new Error(`Capture has an invalid sessionKey: ${identifier}`);
    }
    const lock = path.join(runtime, "locks", `${initial.sessionKey}.lock`);
    const lockToken = await acquirePrivateLock(lock);
    if (!lockToken) throw new Error(`Capture is busy; retry mark: ${identifier}`);
    try {
      const capture = await readPrivateJson(runtime, file, {});
      if (capture.captureId !== identifier && capture.turnKey !== identifier) continue;
      if (status === "processed") {
        const processingErrors = await validateCaptureForProcessing(
          capture,
          runtime,
          note,
          resultRegistries,
        );
        if (processingErrors.length > 0) throw new Error(processingErrors.join("; "));
      }
      const updatedAt = new Date().toISOString();
      capture.curation = {
        status,
        result: status === "processed" ? note : null,
        reason: ["ignored", "blocked"].includes(status) ? note.trim() : null,
        resultVerifiedAt: status === "processed" ? updatedAt : null,
        updatedAt,
      };
      await atomicWriteJson(file, capture);
      console.log(`Marked ${capture.captureId} as ${status}.`);
      return;
    } finally {
      await releasePrivateLock(lock, lockToken);
    }
  }

  throw new Error(`Capture not found: ${identifier}`);
}

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

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function matchesJsonType(value, type) {
  if (type === "null") return value === null;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  return typeof value === type;
}

function validateSchemaValue(value, schema, label, errors) {
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  if (types.length > 0 && !types.some((type) => matchesJsonType(value, type))) {
    errors.push(`${label} must be ${types.join(" or ")}`);
    return;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${label} must be one of ${schema.enum.join(", ")}`);
    return;
  }

  if (typeof value === "number") {
    if (Number.isFinite(schema.minimum) && value < schema.minimum) {
      errors.push(`${label} must be at least ${schema.minimum}`);
    }
    if (Number.isFinite(schema.maximum) && value > schema.maximum) {
      errors.push(`${label} must be at most ${schema.maximum}`);
    }
  }

  if (typeof value === "string") {
    if (schema.minLength && value.length < schema.minLength) errors.push(`${label} is empty`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${label} does not match the required hashed identifier format`);
    }
    if (schema.format === "date" && !validDate(value)) errors.push(`${label} must be a valid date`);
    if (schema.format === "date-time" && !Number.isFinite(Date.parse(value))) {
      errors.push(`${label} must be a valid date-time`);
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) {
      errors.push(`${label} needs at least ${schema.minItems} item(s)`);
    }
    if (schema.uniqueItems) {
      const serialized = value.map((item) => JSON.stringify(item));
      if (new Set(serialized).size !== serialized.length) errors.push(`${label} must contain unique items`);
    }
    if (schema.items) {
      value.forEach((item, index) => validateSchemaValue(item, schema.items, `${label}[${index}]`, errors));
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const required of schema.required ?? []) {
      if (!(required in value)) errors.push(`${label}.${required} is required`);
    }
    const properties = schema.properties ?? {};
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in properties)) errors.push(`${label}.${key} is not allowed`);
      }
    }
    for (const [key, childSchema] of Object.entries(properties)) {
      if (key in value) validateSchemaValue(value[key], childSchema, `${label}.${key}`, errors);
    }
  }
}

async function loadSourceLedger(config) {
  const ledgerFile = resolveProjectPath(config.curation.sourceLedger);
  const ledgerModule = await import(`${pathToFileURL(ledgerFile).href}?portable-kb=${Date.now()}`);
  if (!ledgerModule.sourceLedger || typeof ledgerModule.sourceLedger !== "object") {
    throw new Error("Public source ledger must export sourceLedger");
  }
  return ledgerModule.sourceLedger;
}

async function loadPublishedModuleIds(config) {
  const publicationFile = resolveProjectPath(config.curation.publicationRegistry);
  const publicationModule = await import(
    `${pathToFileURL(publicationFile).href}?portable-kb=${Date.now()}`
  );
  if (!Array.isArray(publicationModule.publishedModules)) {
    throw new Error("Publication registry must export publishedModules");
  }
  return new Set(publicationModule.publishedModules.map((module) => module?.slug).filter(Boolean));
}

function resultExists(result, registries) {
  if (!result) return false;
  if (result.kind === "candidate") return registries.candidates.has(result.id);
  if (result.kind === "claim") return registries.claims.has(result.id);
  if (result.kind === "module") return registries.modules.has(result.id);
  if (result.kind === "source") return registries.sources.has(result.id);
  if (result.kind === "release") return registries.releases.has(result.id);
  return false;
}

function resultTracesCapture(resultId, turnKey, registries) {
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

async function loadResultRegistries(config) {
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

function verifierFromRegistries(registries) {
  return async (capture) => {
    const result = parseResultId(capture.curation?.result);
    return Boolean(
      result
      && resultExists(result, registries)
      && resultTracesCapture(capture.curation.result, capture.turnKey, registries)
    );
  };
}

async function prepareProcessedResultVerifier() {
  try {
    const context = await validate({
      quiet: true,
      allowOverdueUnresolved: true,
      skipRetentionSweep: true,
      setExitCode: false,
      returnContext: true,
    });
    if (context.errors.length > 0 || !context.registriesValid) return async () => false;
    return verifierFromRegistries(context.resultRegistries);
  } catch {
    return async () => false;
  }
}

async function validatePayload(runtime, payload, expectedPath, label, errors) {
  if (!payload || payload.status !== "captured") return;
  const belongsToCapture = typeof expectedPath === "string"
    ? payload.path === expectedPath
    : expectedPath.test(payload.path ?? "");
  if (typeof payload.path !== "string"
    || payload.path.includes("\\")
    || path.posix.isAbsolute(payload.path)
    || path.posix.normalize(payload.path) !== payload.path
    || !belongsToCapture) {
    errors.push(`${label} has an invalid private payload path`);
    return;
  }
  if (!Number.isInteger(payload.bytes) || payload.bytes < 0
    || !/^[0-9a-f]{64}$/.test(payload.sha256 ?? "")) {
    errors.push(`${label} has invalid integrity metadata`);
    return;
  }
  const file = path.resolve(runtime, payload.path);
  if (!isWithin(file, runtime)) {
    errors.push(`${label} leaves the private runtime directory`);
    return;
  }
  try {
    const data = await readPrivateFile(runtime, file);
    if (data.length !== payload.bytes) errors.push(`${label} byte count does not match`);
    if (hash(data) !== payload.sha256) errors.push(`${label} SHA-256 does not match`);
  } catch {
    errors.push(`${label} private payload is missing or unreadable`);
  }
}

async function validateCaptureForProcessing(capture, runtime, resultId, registries) {
  const errors = [];
  const label = `Private capture ${capture.captureId ?? "unknown"}`;
  if (!PROCESSABLE_COMPLETENESS.has(capture.completeness)) {
    errors.push(`${label} completeness ${capture.completeness ?? "unknown"} cannot be processed`);
  }
  if (capture.messages?.user?.status !== "captured"
    || capture.messages?.assistant?.status !== "captured") {
    errors.push(`${label} needs intact visible user and assistant messages before processing`);
  }
  await validatePayload(
    runtime,
    capture.messages?.user,
    `user-messages/${capture.sessionKey}/${capture.turnKey}.txt`,
    `${label} user message`,
    errors,
  );
  await validatePayload(
    runtime,
    capture.messages?.assistant,
    `assistant-messages/${capture.sessionKey}/${capture.turnKey}.txt`,
    `${label} assistant message`,
    errors,
  );
  for (const [index, delta] of (capture.transcript?.deltas ?? []).entries()) {
    await validatePayload(
      runtime,
      { ...delta, status: "captured" },
      new RegExp(`^transcript-deltas/${capture.sessionKey}/g[0-9]{4,}/[0-9]{6,}-${capture.turnKey}\\.bin$`),
      `${label} transcript delta ${index + 1}`,
      errors,
    );
  }

  const result = parseResultId(resultId);
  if (!result) {
    errors.push(`${label} result must use candidate:, claim:, module:, source:, or release:`);
  } else if (!resultExists(result, registries)) {
    errors.push(`${label} result does not exist: ${resultId}`);
  } else if (!resultTracesCapture(resultId, capture.turnKey, registries)) {
    errors.push(`${label} result does not trace back to ${capture.turnKey}`);
  }
  return errors;
}

async function validatePrivateCaptures(config, errors) {
  const runtime = path.join(resolveProjectPath(config.capture.privateInbox), ".runtime");
  const captures = await walkPrivateFiles(runtime, path.join(runtime, "captures"), ".json");
  const ids = new Set();
  const completenessStates = new Set([
    "full-to-stop",
    "visible-messages",
    "prompt-only",
    "assistant-only",
    "transcript-only",
    "partial-backlog",
    "metadata-only",
  ]);
  const curationStates = new Set(["pending", "processed", "ignored", "blocked"]);
  const transcriptStates = new Set([
    "unavailable",
    "rejected-path",
    "unreadable",
    "captured",
    "partial-backlog",
    "size-limit",
    "expired",
  ]);
  const records = [];
  const payloadOwners = new Map();

  function registerPayloadOwner(capture, captureFile, payload, label) {
    if (payload?.status !== "captured" || typeof payload.path !== "string") return;
    const previous = payloadOwners.get(payload.path);
    if (previous && previous.captureFile !== captureFile) {
      errors.push(`${label} reuses payload owned by private capture ${previous.captureId}`);
      return;
    }
    payloadOwners.set(payload.path, { captureFile, captureId: capture.captureId });
  }

  for (const file of captures) {
    const capture = await readPrivateJson(runtime, file, {});
    records.push(capture);
    if (!/^cap_[0-9a-f]{32}$/.test(capture.captureId ?? "") || ids.has(capture.captureId)) {
      errors.push("Private capture IDs must be present and unique");
    }
    ids.add(capture.captureId);
    if (!/^s_[0-9a-f]{32}$/.test(capture.sessionKey ?? "")) {
      errors.push(`Private capture ${capture.captureId ?? "unknown"} has an invalid sessionKey`);
    }
    if (!/^t_[0-9a-f]{32}$/.test(capture.turnKey ?? "")) {
      errors.push(`Private capture ${capture.captureId ?? "unknown"} has an invalid turnKey`);
    }
    if (!completenessStates.has(capture.completeness)) {
      errors.push(`Private capture ${capture.captureId ?? "unknown"} has invalid completeness`);
    }
    if (!transcriptStates.has(capture.transcript?.status)) {
      errors.push(`Private capture ${capture.captureId ?? "unknown"} has invalid transcript status`);
    }
    const curation = capture.curation ?? {};
    if (!curationStates.has(curation.status)) {
      errors.push(`Private capture ${capture.captureId ?? "unknown"} has invalid curation status`);
    } else if (curation.status === "processed") {
      if (!parseResultId(curation.result) || curation.reason) {
        errors.push(`Private capture ${capture.captureId} processed state needs only a typed stable result ID`);
      }
      if (!Number.isFinite(Date.parse(curation.resultVerifiedAt ?? ""))) {
        errors.push(`Private capture ${capture.captureId} processed state needs resultVerifiedAt`);
      }
    } else if (["ignored", "blocked"].includes(curation.status)) {
      if (typeof curation.reason !== "string" || !curation.reason.trim()
        || curation.result || curation.resultVerifiedAt) {
        errors.push(`Private capture ${capture.captureId} ${curation.status} state needs only a reason`);
      }
    } else if (curation.result || curation.reason || curation.resultVerifiedAt) {
      errors.push(`Private capture ${capture.captureId} pending state cannot have result, reason, or verification`);
    }
    const metadata = JSON.stringify(capture);
    if (/\/(?:Users|home)\/|[A-Za-z]:\\|file:\/\//.test(metadata)) {
      errors.push(`Private capture ${capture.captureId ?? "unknown"} contains an absolute path`);
    }
    registerPayloadOwner(
      capture,
      file,
      capture.messages?.user,
      `Private capture ${capture.captureId} user message`,
    );
    registerPayloadOwner(
      capture,
      file,
      capture.messages?.assistant,
      `Private capture ${capture.captureId} assistant message`,
    );
    await validatePayload(
      runtime,
      capture.messages?.user,
      `user-messages/${capture.sessionKey}/${capture.turnKey}.txt`,
      `${capture.captureId} user message`,
      errors,
    );
    await validatePayload(
      runtime,
      capture.messages?.assistant,
      `assistant-messages/${capture.sessionKey}/${capture.turnKey}.txt`,
      `${capture.captureId} assistant message`,
      errors,
    );
    for (const [index, delta] of (capture.transcript?.deltas ?? []).entries()) {
      registerPayloadOwner(
        capture,
        file,
        { ...delta, status: "captured" },
        `Private capture ${capture.captureId} transcript delta ${index + 1}`,
      );
      await validatePayload(
        runtime,
        { ...delta, status: "captured" },
        new RegExp(`^transcript-deltas/${capture.sessionKey}/g[0-9]{4,}/[0-9]{6,}-${capture.turnKey}\\.bin$`),
        `${capture.captureId} transcript delta ${index + 1}`,
        errors,
      );
    }
  }
  return records;
}

async function validate({
  quiet = false,
  allowOverdueUnresolved = false,
  skipRetentionSweep = false,
  setExitCode = true,
  returnContext = false,
} = {}) {
  const errors = [];
  const config = await loadConfig();
  if (config.schemaVersion !== 1) errors.push("kb.config.json schemaVersion must be 1");
  if (config.publishing?.defaultMode !== "local") {
    errors.push("Portable default publishing mode must remain local");
  }
  if (!Number.isInteger(config.capture?.rawRetentionDays) || config.capture.rawRetentionDays <= 0) {
    errors.push("capture.rawRetentionDays must be a positive integer");
  }
  if (typeof config.capture?.storeRawTranscript !== "boolean") {
    errors.push("capture.storeRawTranscript must be true or false");
  }
  if (!sameStringArray(config.quality?.commands, SAFE_QUALITY_COMMANDS)) {
    errors.push(`quality.commands must be exactly: ${SAFE_QUALITY_COMMANDS.join(", ")}`);
  }
  if (!Number.isInteger(config.packaging?.maxArchiveBytes)
    || config.packaging.maxArchiveBytes <= 0
    || config.packaging.maxArchiveBytes > 0xffffffff) {
    errors.push("packaging.maxArchiveBytes must be a positive classic-ZIP-safe integer");
  }
  if (config.packaging?.includeSiteBindingByDefault !== false) {
    errors.push("packaging.includeSiteBindingByDefault must remain false; use the explicit CLI flag instead");
  }

  const privateInbox = portablePath(config.capture?.privateInbox ?? "").replace(/\/$/, "");
  if (!privateInbox || privateInbox === "." || privateInbox.includes("\\")) {
    errors.push("capture.privateInbox must be a non-root portable path using forward slashes");
  }
  if (privateInbox !== "knowledge/private-inbox") {
    errors.push("capture.privateInbox is fixed at knowledge/private-inbox to stay outside app/public/build inputs");
  }
  const siteBinding = portablePath(config.publishing?.sites?.binding ?? "").replace(/\/$/, "");
  if (siteBinding !== ".openai/hosting.json") {
    errors.push("publishing.sites.binding is fixed at .openai/hosting.json for portable isolation");
  }
  const candidates = portablePath(config.curation?.candidates ?? "");
  const privateRuntime = `${privateInbox}/.runtime`;
  if (candidates !== privateRuntime && !candidates.startsWith(`${privateRuntime}/`)) {
    errors.push("Private candidates must remain inside the configured private inbox runtime");
  }
  if (config.curation?.releaseSchema !== "knowledge/schemas/release.schema.json") {
    errors.push("curation.releaseSchema must point to knowledge/schemas/release.schema.json");
  }

  const packageExcludes = new Set();
  for (const excludedPath of config.packaging?.exclude ?? []) {
    try {
      packageExcludes.add(canonicalProjectRelative(excludedPath));
    } catch (error) {
      errors.push(error.message);
    }
  }
  for (const required of REQUIRED_PORTABLE_EXCLUDES) {
    if (!packageExcludes.has(required)) errors.push(`Portable package must exclude ${required}`);
  }
  if (!packageExcludes.has(privateInbox)) {
    errors.push("Portable package exclusions must contain the configured private inbox");
  }

  const packageIncludes = new Set();
  for (const includedPath of config.packaging?.include ?? []) {
    try {
      packageIncludes.add(canonicalProjectRelative(includedPath));
    } catch (error) {
      errors.push(error.message);
    }
  }
  for (const required of REQUIRED_PORTABLE_INCLUDES) {
    if (!packageIncludes.has(required)) errors.push(`Portable package must include ${required}`);
  }
  for (const included of packageIncludes) {
    let normalized = included;
    try {
      normalized = canonicalProjectRelative(included);
      if (!ALLOWED_PORTABLE_INCLUDES.has(normalized)) {
        errors.push(`Portable package include path is not approved: ${normalized}`);
      }
    } catch (error) {
      errors.push(error.message);
      continue;
    }
    if (normalized === privateInbox || normalized.startsWith(`${privateInbox}/`)) {
      errors.push("Portable package include list must never contain the private inbox");
    }
    try {
      if (!await exists(resolveProjectPath(included))) {
        errors.push(`Portable package include path does not exist: ${included}`);
      }
    } catch (error) {
      errors.push(error.message);
    }
  }

  for (const included of packageIncludes) {
    for (const excludedPath of packageExcludes) {
      const segments = included.split("/");
      const coveredBySegmentRule = !excludedPath.includes("/") && segments.includes(excludedPath);
      if (included === excludedPath
        || included.startsWith(`${excludedPath}/`)
        || coveredBySegmentRule) {
        errors.push(`Portable include ${included} is fully covered by exclude ${excludedPath}`);
      }
    }
  }

  if (!packageExcludes.has(siteBinding)) {
    errors.push("Personal Sites binding must be excluded from portable packages by default");
  }

  const projectPaths = [
    config.capture.privateInbox,
    config.curation.candidates,
    config.curation.claims,
    config.curation.releaseManifest,
    config.curation.releaseSchema,
    config.curation.publicationRegistry,
    config.curation.contentRegistry,
    config.curation.sourceLedger,
    config.curation.terminology,
    config.publishing.sites.binding,
    config.packaging.outputDirectory,
  ];
  for (const relative of projectPaths) {
    try {
      canonicalProjectRelative(relative);
    } catch (error) {
      errors.push(error.message);
    }
  }

  const skillFile = resolveProjectPath(".agents/skills/curate-portable-knowledge-base/SKILL.md");
  const skill = await fs.readFile(skillFile, "utf8");
  const frontmatter = /^---\n([\s\S]*?)\n---/.exec(skill)?.[1] ?? "";
  const keys = frontmatter
    .split("\n")
    .map((line) => line.match(/^([a-zA-Z0-9_-]+):/)?.[1])
    .filter(Boolean);
  if (!frontmatter.includes("name: curate-portable-knowledge-base")) {
    errors.push("Skill name does not match its directory");
  }
  if (!frontmatter.includes("description:") || keys.some((key) => !["name", "description"].includes(key))) {
    errors.push("Skill frontmatter must contain only name and description");
  }

  const hooks = await readJson(resolveProjectPath(".codex/hooks.json"), {});
  if (!hooks.hooks || typeof hooks.hooks !== "object"
    || !sameStringArray(Object.keys(hooks.hooks).sort(), EXPECTED_HOOK_EVENTS)) {
    errors.push("Hook events must be exactly UserPromptSubmit and Stop");
  }

  for (const eventName of ["UserPromptSubmit", "Stop"]) {
    const groups = hooks.hooks?.[eventName];
    if (!Array.isArray(groups) || groups.length !== 1) {
      errors.push(`${eventName} must contain exactly one unfiltered hook group`);
      continue;
    }
    const [group] = groups;
    if (!group || typeof group !== "object"
      || !sameStringArray(Object.keys(group).sort(), ["hooks"])) {
      errors.push(`${eventName} hook group must contain only hooks, without matcher or disable fields`);
      continue;
    }
    const handlers = Array.isArray(group.hooks) ? group.hooks : [];
    if (handlers.length !== 1) {
      errors.push(`${eventName} must contain exactly one canonical command hook`);
      continue;
    }
    const [handler] = handlers;
    if (!handler || typeof handler !== "object"
      || !sameStringArray(Object.keys(handler).sort(), EXPECTED_HOOK_HANDLER_KEYS)) {
      errors.push(`${eventName} handler keys do not match the canonical synchronous command hook`);
      continue;
    }
    if (handler.type !== "command") {
      errors.push(`${eventName} hook type must be command`);
    }
    if (handler.timeout !== EXPECTED_HOOK_TIMEOUT_SECONDS) {
      errors.push(`${eventName} hook timeout must be ${EXPECTED_HOOK_TIMEOUT_SECONDS} seconds`);
    }
    if (typeof handler.command !== "string" || handler.command !== handler.commandWindows) {
      errors.push(`${eventName} command and commandWindows must be identical canonical commands`);
    } else if (hash(handler.command) !== EXPECTED_HOOK_COMMAND_SHA256) {
      errors.push(`${eventName} hook command does not match the canonical SHA-256`);
    }
  }

  const runtime = path.join(resolveProjectPath(config.capture.privateInbox), ".runtime");
  let privateCaptures = [];
  const privateSafe = await privateInboxIsSafe(
    PROJECT_ROOT,
    resolveProjectPath(config.capture.privateInbox),
  );
  if (!privateSafe) {
    errors.push("Private inbox must stay inside the real project tree without symlinks");
  } else {
    privateCaptures = await validatePrivateCaptures(config, errors);
  }

  const gitignore = await fs.readFile(resolveProjectPath(".gitignore"), "utf8");
  if (!gitignore.includes(`/${privateInbox}/*`)) {
    errors.push("Private inbox must be ignored by Git");
  }
  if (gitStatus() === "available") {
    const ignoredProbe = gitCommand(["check-ignore", "-q", `${privateInbox}/.runtime/privacy-probe`]);
    if (ignoredProbe.status !== 0) errors.push("Git does not effectively ignore the private inbox runtime");

    const prefix = gitCommand(["rev-parse", "--show-prefix"]);
    const tracked = gitCommand(["ls-files", "--full-name", "--", privateInbox]);
    if (tracked.status !== 0) {
      errors.push("Unable to inspect tracked private inbox files");
    } else {
      const allowedSentinel = `${prefix.status === 0 ? prefix.stdout.trim() : ""}${privateInbox}/.gitignore`;
      const leaked = tracked.stdout.split(/\r?\n/).filter(Boolean)
        .filter((file) => portablePath(file) !== allowedSentinel);
      if (leaked.length > 0) errors.push(`Git tracks private inbox data: ${leaked.join(", ")}`);
    }
  }

  const registryErrorStart = errors.length;
  const claims = await readJson(resolveProjectPath(config.curation.claims), { schemaVersion: 1, items: [] });
  const candidateRegistry = await readPrivateJson(runtime, resolveProjectPath(config.curation.candidates), {
    schemaVersion: 1,
    items: [],
  });
  const releases = await readJson(resolveProjectPath(config.curation.releaseManifest), null);
  const claimSchema = await readJson(resolveProjectPath("knowledge/schemas/claim.schema.json"));
  const candidateSchema = await readJson(resolveProjectPath("knowledge/schemas/candidate.schema.json"));
  const releaseSchema = await readJson(resolveProjectPath(
    config.curation.releaseSchema ?? "knowledge/schemas/release.schema.json",
  ));
  if (!releaseSchema || typeof releaseSchema !== "object") {
    errors.push("Release manifest schema is missing or invalid");
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

  const trackedKnowledge = JSON.stringify({ claims, releases });
  if (/\/(?:Users|home)\/|[A-Za-z]:\\|file:\/\//.test(trackedKnowledge)) {
    errors.push("Portable knowledge metadata contains an absolute path");
  }

  if (!quiet) {
    if (errors.length === 0) console.log("Portable knowledge validation passed.");
    for (const error of errors) console.error(`ERROR ${error}`);
  }
  if (setExitCode && errors.length > 0) process.exitCode = 1;
  return returnContext ? { errors, registriesValid, resultRegistries } : errors;
}

function excluded(relative, config, includeSiteBinding, exactExcludes = new Set()) {
  const normalized = portablePath(relative);
  const basename = path.posix.basename(normalized).toLowerCase();
  const segments = normalized.split("/");
  const excludes = new Set((config.packaging.exclude ?? []).map(portablePath));
  const siteBinding = portablePath(config.publishing.sites.binding);
  if (includeSiteBinding) excludes.delete(siteBinding);

  if (exactExcludes.has(normalized)
    || [...exactExcludes].some((item) => (
      normalized.startsWith(`${item}.tmp-`) || normalized.startsWith(`${item}.backup-`)
    ))) return true;

  const privateInbox = portablePath(config.capture.privateInbox).replace(/\/$/, "");
  if (normalized === privateInbox || normalized.startsWith(`${privateInbox}/`)) return true;
  if (!includeSiteBinding && normalized === siteBinding) return true;

  if (normalized === ".DS_Store" || normalized.endsWith("/.DS_Store")) return true;
  if ([
    ".npmrc",
    ".pypirc",
    ".netrc",
    "credentials",
    "credentials.json",
    "service-account.json",
    "id_rsa",
    "id_ed25519",
  ].includes(basename)) return true;
  if (/\.(?:pem|key|p12|pfx|jks|keystore)$/.test(basename)) return true;
  if (normalized.endsWith(".tsbuildinfo") || normalized === "next-env.d.ts") return true;
  if (basename.startsWith(".env")) return true;
  if (/^(?:npm|yarn|pnpm)-debug\.log/.test(basename)) return true;

  for (const item of excludes) {
    if (normalized === item || normalized.startsWith(`${item}/`)) return true;
    if (!item.includes("/") && segments.includes(item)) return true;
  }
  if (segments.some((segment) => REQUIRED_PORTABLE_SEGMENT_EXCLUDES.has(segment))) return true;
  return false;
}

async function collectPortableFiles(config, includeSiteBinding, exactExcludes = new Set()) {
  const output = [];
  const seen = new Set();

  async function visit(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const relative = portablePath(path.relative(PROJECT_ROOT, absolute));
      if (excluded(relative, config, includeSiteBinding, exactExcludes)) continue;
      if (entry.isSymbolicLink()) throw new Error(`Portable package refuses symlink: ${relative}`);
      if (entry.isDirectory()) await visit(absolute);
      if (entry.isFile() && !seen.has(relative)) {
        seen.add(relative);
        output.push({ absolute, relative });
      }
    }
  }

  const includes = [...(config.packaging.include ?? [])];
  if (includeSiteBinding) includes.push(config.publishing.sites.binding);

  for (const include of includes) {
    const absolute = resolveProjectPath(include);
    if (!await exists(absolute)) continue;
    const stat = await fs.lstat(absolute);
    if (stat.isSymbolicLink()) throw new Error(`Portable package refuses symlink: ${include}`);
    if (stat.isDirectory()) {
      await visit(absolute);
      continue;
    }
    const relative = portablePath(path.relative(PROJECT_ROOT, absolute));
    if (!excluded(relative, config, includeSiteBinding, exactExcludes) && !seen.has(relative)) {
      seen.add(relative);
      output.push({ absolute, relative });
    }
  }

  return output.sort((a, b) => a.relative.localeCompare(b.relative));
}

function gitBinaryCommand(args, maxBuffer = 16 * 1024 * 1024) {
  return spawnSync("git", args, {
    cwd: PROJECT_ROOT,
    encoding: null,
    maxBuffer,
    shell: false,
  });
}

function commandOutput(result) {
  if (result.error) return result.error.message;
  return Buffer.isBuffer(result.stderr)
    ? result.stderr.toString("utf8").trim()
    : String(result.stderr ?? "").trim();
}

async function packagingSourceMode() {
  const top = gitCommand(["rev-parse", "--show-toplevel"]);
  if (top.error?.code === "ENOENT") return "filesystem";
  if (top.status !== 0) {
    const detail = commandOutput(top);
    if (/not a git repository|not a git work tree/i.test(detail)) return "filesystem";
    throw new Error(`Unable to determine portable Git source inventory: ${detail || "git rev-parse failed"}`);
  }

  const [projectRoot, gitTop] = await Promise.all([
    fs.realpath(PROJECT_ROOT),
    fs.realpath(top.stdout.trim()),
  ]);
  if (projectRoot !== gitTop) {
    throw new Error(`Portable project root differs from Git top-level: ${gitTop}`);
  }
  return "git-index";
}

function assertGitIndexReady() {
  const unstaged = gitCommand(["diff", "--quiet", "--ignore-submodules=none", "--"]);
  if (unstaged.status === 1) {
    throw new Error("Portable packaging requires all tracked changes to be staged");
  }
  if (unstaged.status !== 0) {
    throw new Error(`Unable to inspect unstaged Git changes: ${commandOutput(unstaged) || "git diff failed"}`);
  }

  const unmerged = gitBinaryCommand(["ls-files", "--unmerged", "-z"]);
  if (unmerged.status !== 0) {
    throw new Error(`Unable to inspect unmerged Git entries: ${commandOutput(unmerged) || "git ls-files failed"}`);
  }
  if (unmerged.stdout.length > 0) {
    throw new Error("Portable packaging refuses an index with unmerged entries");
  }

  const flags = gitBinaryCommand(["ls-files", "-v", "-z"]);
  if (flags.status !== 0) {
    throw new Error(`Unable to inspect Git index flags: ${commandOutput(flags) || "git ls-files failed"}`);
  }
  for (const record of flags.stdout.toString("utf8").split("\0").filter(Boolean)) {
    const tag = record[0];
    if (tag === "S" || /[a-z]/.test(tag)) {
      throw new Error(`Portable packaging refuses skip-worktree or assume-unchanged: ${record.slice(2)}`);
    }
  }
}

async function readExplicitSiteBinding(config) {
  const relative = canonicalProjectRelative(config.publishing.sites.binding);
  const absolute = resolveProjectPath(relative);
  const [projectRoot, realFile] = await Promise.all([
    fs.realpath(PROJECT_ROOT),
    fs.realpath(absolute),
  ]);
  if (!isWithin(realFile, projectRoot)) {
    throw new Error("Explicit Sites binding leaves the real project tree");
  }
  for (let cursor = absolute; cursor !== PROJECT_ROOT; cursor = path.dirname(cursor)) {
    const stat = await fs.lstat(cursor);
    if (stat.isSymbolicLink()) {
      throw new Error(`Portable package refuses symlink: ${relative}`);
    }
  }
  const stat = await fs.lstat(absolute);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error("Explicit Sites binding must be a regular non-symlink file");
  }
  return { relative, data: await fs.readFile(absolute), modified: stat.mtime };
}

async function collectGitIndexPortableFiles(
  config,
  includeSiteBinding,
  exactExcludes = new Set(),
) {
  assertGitIndexReady();
  const includes = [...(config.packaging.include ?? [])];
  if (includeSiteBinding) includes.push(config.publishing.sites.binding);
  const listing = gitBinaryCommand(
    ["ls-files", "--stage", "-z", "--", ...includes],
    config.packaging.maxArchiveBytes,
  );
  if (listing.status !== 0) {
    throw new Error(`Unable to read portable Git index: ${commandOutput(listing) || "git ls-files failed"}`);
  }

  const files = [];
  const seen = new Set();
  for (const record of listing.stdout.toString("utf8").split("\0").filter(Boolean)) {
    const separator = record.indexOf("\t");
    const metadata = record.slice(0, separator).split(" ");
    const relative = record.slice(separator + 1);
    if (separator < 0 || metadata.length !== 3 || metadata[2] !== "0") {
      throw new Error(`Portable Git index contains an unsupported entry: ${record}`);
    }
    canonicalProjectRelative(relative);
    if (excluded(relative, config, includeSiteBinding, exactExcludes) || seen.has(relative)) continue;
    const [mode, oid] = metadata;
    if (!["100644", "100755"].includes(mode)) {
      throw new Error(`Portable package refuses non-regular Git entry: ${relative}`);
    }
    const blob = gitBinaryCommand(
      ["cat-file", "blob", oid],
      config.packaging.maxArchiveBytes + 1,
    );
    if (blob.status !== 0) {
      throw new Error(`Unable to read staged Git blob ${relative}: ${commandOutput(blob) || "git cat-file failed"}`);
    }
    seen.add(relative);
    const source = { relative, data: blob.stdout, modified: INDEX_FILE_MODIFIED_AT };
    scanPortableText(source);
    files.push(source);
  }
  const siteBinding = portablePath(config.publishing.sites.binding);
  if (includeSiteBinding && !seen.has(siteBinding)) {
    const source = await readExplicitSiteBinding(config);
    scanPortableText(source);
    files.push(source);
  }
  return files.sort((a, b) => a.relative.localeCompare(b.relative));
}

function scanPortableText({ relative, data }) {
  if (data.includes(0)) return;
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(data);
  } catch {
    return;
  }

  const findings = [
    [/(?:^|[\s"'`(=,:])\/(?:Users|home)\/[^/\s"'`]+(?:\/[^\s"'`]*)?/m, "host-local absolute path"],
    [/(?:^|[\s"'`(=,:])[A-Za-z]:[\\/][^\s"'`]+/m, "host-local absolute path"],
    [/file:\/\/(?:\/|[A-Za-z]:)/i, "file URL"],
    [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key"],
    [/(?:^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{20,}/, "secret token"],
    [/(?:^|[^A-Z0-9])AKIA[0-9A-Z]{16}(?:$|[^A-Z0-9])/, "AWS access key"],
    [/(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{12,}/i, "credential assignment"],
  ];
  const finding = findings.find(([pattern]) => pattern.test(text));
  if (finding) {
    throw new Error(`Portable source contains a ${finding[1]}: ${relative}`);
  }
}

async function collectPortableSourceFiles(config, includeSiteBinding, exactExcludes = new Set()) {
  const mode = await packagingSourceMode();
  if (mode === "git-index") {
    return collectGitIndexPortableFiles(config, includeSiteBinding, exactExcludes);
  }

  const files = await collectPortableFiles(config, includeSiteBinding, exactExcludes);
  const sources = [];
  for (const file of files) {
    const [data, stat] = await Promise.all([fs.readFile(file.absolute), fs.stat(file.absolute)]);
    const source = { relative: file.relative, data, modified: stat.mtime };
    scanPortableText(source);
    sources.push(source);
  }
  return sources;
}

function crcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    }
    table[index] = value >>> 0;
  }
  return table;
}

const CRC_TABLE = crcTable();

function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function localHeader({ name, data, crc, modified }) {
  const header = Buffer.alloc(30);
  const { time, day } = dosDateTime(modified);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(time, 10);
  header.writeUInt16LE(day, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return header;
}

function centralHeader({ name, data, crc, modified, offset }) {
  const header = Buffer.alloc(46);
  const { time, day } = dosDateTime(modified);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(0x031e, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0800, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(time, 12);
  header.writeUInt16LE(day, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(data.length, 20);
  header.writeUInt32LE(data.length, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE((0o100644 << 16) >>> 0, 38);
  header.writeUInt32LE(offset, 42);
  return header;
}

async function createZip(entries, outputFile) {
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.relative, "utf8");
    const crc = crc32(entry.data);
    const local = localHeader({ ...entry, name, crc });
    locals.push(local, name, entry.data);
    centrals.push(centralHeader({ ...entry, name, crc, offset }), name);
    offset += local.length + name.length + entry.data.length;
  }

  const centralDirectory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  const temporary = `${outputFile}.tmp-${process.pid}-${Date.now()}`;
  try {
    await fs.writeFile(temporary, Buffer.concat([...locals, centralDirectory, end]));
    return temporary;
  } catch (error) {
    await fs.rm(temporary, { force: true });
    throw error;
  }
}

async function assertReplaceableFile(file) {
  try {
    const stat = await fs.lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new Error(`Portable output target must be a regular file when it exists: ${file}`);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

async function publishArchivePair(archiveTemporary, outputFile, sidecarTemporary, sidecar) {
  await assertReplaceableFile(outputFile);
  await assertReplaceableFile(sidecar);
  const nonce = `${process.pid}-${Date.now()}`;
  const archiveBackup = `${outputFile}.backup-${nonce}`;
  const sidecarBackup = `${sidecar}.backup-${nonce}`;
  let archiveBackedUp = false;
  let sidecarBackedUp = false;
  let archiveInstalled = false;
  let sidecarInstalled = false;

  try {
    if (await exists(outputFile)) {
      await fs.rename(outputFile, archiveBackup);
      archiveBackedUp = true;
    }
    if (await exists(sidecar)) {
      await fs.rename(sidecar, sidecarBackup);
      sidecarBackedUp = true;
    }
    await fs.rename(archiveTemporary, outputFile);
    archiveInstalled = true;
    if (process.env.NODE_ENV === "test"
      && process.env.PORTABLE_KB_TEST_FAIL_PUBLISH === "after-archive") {
      throw new Error("Injected portable publish failure after archive install");
    }
    await fs.rename(sidecarTemporary, sidecar);
    sidecarInstalled = true;
  } catch (error) {
    if (archiveInstalled) await fs.rm(outputFile, { force: true });
    if (sidecarInstalled) await fs.rm(sidecar, { force: true });
    if (archiveBackedUp) await fs.rename(archiveBackup, outputFile);
    if (sidecarBackedUp) await fs.rename(sidecarBackup, sidecar);
    throw error;
  }

  if (archiveBackedUp) await fs.rm(archiveBackup, { force: true });
  if (sidecarBackedUp) await fs.rm(sidecarBackup, { force: true });
}

function verifyPortableZip(archive, config, includeSiteBinding) {
  const endOffset = archive.length - 22;
  if (endOffset < 0 || archive.readUInt32LE(endOffset) !== 0x06054b50) {
    throw new Error("Portable ZIP is missing a valid end-of-central-directory record");
  }
  const entryCount = archive.readUInt16LE(endOffset + 10);
  const centralSize = archive.readUInt32LE(endOffset + 12);
  const centralOffset = archive.readUInt32LE(endOffset + 16);
  if (centralOffset + centralSize !== endOffset) {
    throw new Error("Portable ZIP central-directory size or offset is invalid");
  }

  const entries = new Map();
  let offset = centralOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > endOffset || archive.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error("Portable ZIP contains an invalid central-directory entry");
    }
    const flags = archive.readUInt16LE(offset + 8);
    const origin = archive.readUInt16LE(offset + 4) >>> 8;
    const method = archive.readUInt16LE(offset + 10);
    const expectedCrc = archive.readUInt32LE(offset + 16);
    const compressedSize = archive.readUInt32LE(offset + 20);
    const size = archive.readUInt32LE(offset + 24);
    const nameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    const localOffset = archive.readUInt32LE(offset + 42);
    const name = archive.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    offset += 46 + nameLength + extraLength + commentLength;

    if (origin !== 3 || (flags & 0x0800) === 0 || (flags & 0x0001) !== 0
      || method !== 0 || size !== compressedSize) {
      throw new Error(`Portable ZIP entry uses unsupported flags or compression: ${name}`);
    }
    if (!name || name.includes("\\") || name.includes("\0") || path.posix.isAbsolute(name)
      || path.posix.normalize(name) !== name || name.startsWith("../")) {
      throw new Error(`Portable ZIP entry has an unsafe path: ${name}`);
    }
    if (entries.has(name)) throw new Error(`Portable ZIP contains duplicate entry: ${name}`);
    if (localOffset + 30 > centralOffset || archive.readUInt32LE(localOffset) !== 0x04034b50) {
      throw new Error(`Portable ZIP entry has an invalid local header: ${name}`);
    }
    const localNameLength = archive.readUInt16LE(localOffset + 26);
    const localExtraLength = archive.readUInt16LE(localOffset + 28);
    const localName = archive
      .subarray(localOffset + 30, localOffset + 30 + localNameLength)
      .toString("utf8");
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataStart + size;
    if (localName !== name || dataEnd > centralOffset) {
      throw new Error(`Portable ZIP local entry does not match its central record: ${name}`);
    }
    const data = archive.subarray(dataStart, dataEnd);
    if (crc32(data) !== expectedCrc
      || archive.readUInt32LE(localOffset + 14) !== expectedCrc
      || archive.readUInt32LE(localOffset + 18) !== size
      || archive.readUInt32LE(localOffset + 22) !== size) {
      throw new Error(`Portable ZIP CRC or size verification failed: ${name}`);
    }
    entries.set(name, data);
  }
  if (offset !== endOffset || entries.size !== entryCount) {
    throw new Error("Portable ZIP entry count does not match its central directory");
  }

  const manifestData = entries.get("PORTABLE-MANIFEST.json");
  if (!manifestData) throw new Error("Portable ZIP is missing PORTABLE-MANIFEST.json");
  let manifest;
  try {
    manifest = JSON.parse(manifestData.toString("utf8"));
  } catch {
    throw new Error("Portable ZIP manifest is invalid JSON");
  }
  if (manifest.schemaVersion !== 1
    || manifest.projectId !== config.project.id
    || !Number.isFinite(Date.parse(manifest.generatedAt ?? ""))
    || manifest.siteBindingIncluded !== includeSiteBinding
    || !sameStringArray(manifest.qualityCommands, qualityCommands(config))
    || !Array.isArray(manifest.files)) {
    throw new Error("Portable ZIP manifest contract is invalid");
  }
  const manifestPaths = new Set();
  for (const file of manifest.files) {
    if (!file || typeof file.path !== "string" || manifestPaths.has(file.path)) {
      throw new Error("Portable ZIP manifest contains an invalid or duplicate path");
    }
    if (excluded(file.path, config, includeSiteBinding)) {
      throw new Error(`Portable ZIP manifest contains an excluded path: ${file.path}`);
    }
    manifestPaths.add(file.path);
    const data = entries.get(file.path);
    if (!data || data.length !== file.bytes || hash(data) !== file.sha256) {
      throw new Error(`Portable ZIP manifest integrity failed: ${file.path}`);
    }
  }
  const archivePaths = [...entries.keys()].filter((name) => name !== "PORTABLE-MANIFEST.json");
  if (archivePaths.length !== manifestPaths.size
    || archivePaths.some((name) => !manifestPaths.has(name))) {
    throw new Error("Portable ZIP manifest does not describe every archive entry exactly once");
  }
  for (const requiredFile of REQUIRED_PORTABLE_FILES) {
    if (!manifestPaths.has(requiredFile)) {
      throw new Error(`Portable ZIP is missing required file: ${requiredFile}`);
    }
  }
  for (const requiredRoot of REQUIRED_PORTABLE_ROOTS) {
    if (![...manifestPaths].some((name) => name.startsWith(`${requiredRoot}/`))) {
      throw new Error(`Portable ZIP is missing required root content: ${requiredRoot}`);
    }
  }
  const privateInbox = portablePath(config.capture.privateInbox);
  if ([...manifestPaths].some((name) => name === privateInbox || name.startsWith(`${privateInbox}/`))) {
    throw new Error("Portable ZIP manifest contains private inbox data");
  }
  if (!includeSiteBinding && manifestPaths.has(portablePath(config.publishing.sites.binding))) {
    throw new Error("Portable ZIP manifest contains the personal Sites binding");
  }
  if (includeSiteBinding && !manifestPaths.has(portablePath(config.publishing.sites.binding))) {
    throw new Error("Portable ZIP manifest is missing the explicitly requested Sites binding");
  }
  return manifest;
}

async function packagePortable({ output, includeSiteBinding = null } = {}) {
  const errors = await validate({ quiet: true });
  if (errors.length > 0) throw new Error(`Portable validation failed with ${errors.length} error(s)`);
  const config = await loadConfig();
  includeSiteBinding = includeSiteBinding ?? config.packaging.includeSiteBindingByDefault;
  const now = new Date();
  const twoDigits = (value) => String(value).padStart(2, "0");
  const timestamp = [
    now.getFullYear(),
    twoDigits(now.getMonth() + 1),
    twoDigits(now.getDate()),
    twoDigits(now.getHours()),
    twoDigits(now.getMinutes()),
  ].join("");
  const defaultOutput = path.join(
    resolveProjectPath(config.packaging.outputDirectory),
    `portable-knowledge-base-${timestamp}.zip`,
  );
  const outputFile = output ? path.resolve(output) : defaultOutput;
  if (path.extname(outputFile).toLowerCase() !== ".zip") {
    throw new Error("Portable archive output must use a .zip extension");
  }
  const privateInbox = resolveProjectPath(config.capture.privateInbox);
  if (isWithin(outputFile, privateInbox)) {
    throw new Error("Portable archive output cannot be written inside the private inbox");
  }
  if (includeSiteBinding && !await exists(resolveProjectPath(config.publishing.sites.binding))) {
    throw new Error("--include-site-binding requires the configured Sites binding to exist");
  }

  const exactExcludes = new Set();
  for (const generated of [outputFile, `${outputFile}.sha256`]) {
    if (isWithin(generated, PROJECT_ROOT)) {
      exactExcludes.add(portablePath(path.relative(PROJECT_ROOT, generated)));
    }
  }
  const files = await collectPortableSourceFiles(config, includeSiteBinding, exactExcludes);
  const entries = [];
  const manifestFiles = [];
  const maximumArchiveBytes = config.packaging.maxArchiveBytes;
  let sourceBytes = 0;

  for (const file of files) {
    if (file.data.length > maximumArchiveBytes) {
      throw new Error(`Portable source file exceeds packaging.maxArchiveBytes: ${file.relative}`);
    }
    sourceBytes += file.data.length;
    if (sourceBytes > maximumArchiveBytes) {
      throw new Error("Portable source exceeds packaging.maxArchiveBytes before archive creation");
    }
  }

  for (const file of files) {
    entries.push({ relative: file.relative, data: file.data, modified: file.modified });
    manifestFiles.push({ path: file.relative, bytes: file.data.length, sha256: hash(file.data) });
  }

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    projectId: config.project.id,
    siteBindingIncluded: includeSiteBinding,
    qualityCommands: qualityCommands(config),
    files: manifestFiles,
  };
  entries.push({
    relative: "PORTABLE-MANIFEST.json",
    data: Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`),
    modified: new Date(),
  });

  if (entries.length > 65_535) throw new Error("Portable archive exceeds classic ZIP entry limit");
  if (entries.some((entry) => entry.data.length > 0xffffffff)) {
    throw new Error("Portable archive contains a file larger than 4 GiB");
  }
  const localBytes = entries.reduce(
    (total, entry) => total + 30 + Buffer.byteLength(entry.relative, "utf8") + entry.data.length,
    0,
  );
  const centralBytes = entries.reduce(
    (total, entry) => total + 46 + Buffer.byteLength(entry.relative, "utf8"),
    0,
  );
  const archiveBytes = localBytes + centralBytes + 22;
  if (localBytes > 0xffffffff || centralBytes > 0xffffffff || archiveBytes > maximumArchiveBytes) {
    throw new Error("Portable archive exceeds configured or classic ZIP size limits");
  }

  const archiveTemporary = await createZip(entries, outputFile);
  const sidecar = `${outputFile}.sha256`;
  const sidecarTemporary = `${sidecar}.tmp-${process.pid}-${Date.now()}`;
  try {
    const archive = await fs.readFile(archiveTemporary);
    if (archive.length !== archiveBytes) throw new Error("Portable ZIP size differs from its preflight");
    verifyPortableZip(archive, config, includeSiteBinding);
    const archiveHash = hash(archive);
    await fs.writeFile(sidecarTemporary, `${archiveHash}  ${path.basename(outputFile)}\n`);
    await publishArchivePair(archiveTemporary, outputFile, sidecarTemporary, sidecar);
    console.log(`Portable archive: ${outputFile}`);
    console.log(`Files: ${manifestFiles.length}; SHA-256: ${archiveHash}`);
  } catch (error) {
    await fs.rm(archiveTemporary, { force: true });
    await fs.rm(sidecarTemporary, { force: true });
    throw error;
  }
}

function parseOptions(args) {
  const options = { json: false, includeSiteBinding: null, output: null };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--json") options.json = true;
    if (args[index] === "--include-site-binding") options.includeSiteBinding = true;
    if (args[index] === "--output") {
      options.output = args[index + 1];
      index += 1;
    }
  }
  return options;
}

const [command = "help", ...args] = process.argv.slice(2);

try {
  if (command === "doctor") await doctor(parseOptions(args));
  else if (command === "inbox") await inbox(parseOptions(args));
  else if (command === "validate") await validate();
  else if (command === "mark") await mark(args[0], args[1], args.slice(2).join(" "));
  else if (command === "package") await packagePortable(parseOptions(args));
  else {
    console.log("Usage: kb-tool.mjs <doctor|inbox|validate|mark|package>");
    process.exitCode = command === "help" ? 0 : 2;
  }
} catch (error) {
  console.error(`ERROR ${error.message}`);
  process.exitCode = 1;
}
