import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { HANDOFF_AUDIENCES } from "./lib/constants.mjs";
import {
  PROJECT_ROOT,
  exists,
  gitStatus,
  hash,
  isWithin,
  loadConfig,
  parseResultId,
  parseVersion,
  portablePath,
  qualityCommands,
  resolveProjectPath,
  versionAtLeast,
} from "./lib/context.mjs";
import { validateCaptureForProcessing } from "./lib/capture-validation.mjs";
import { loadResultRegistries } from "./lib/registries.mjs";
import { prepareProcessedResultVerifier, validate } from "./lib/validate.mjs";
import { auditPortableAttachments, attachmentAuditManifest, printAttachmentAudit } from "./lib/attachments.mjs";
import { collectPortableSourceFiles } from "./lib/source-collection.mjs";
import { createZip, publishArchivePair, verifyPortableZip } from "./lib/zip.mjs";
import {
  acquirePrivateLock,
  atomicWriteJson,
  privateInboxIsSafe,
  pruneExpiredCaptures,
  readPrivateJson,
  releasePrivateLock,
  walkPrivateFiles,
} from "./private-runtime.mjs";

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
    ".agents/skills/curate-portable-knowledge-base/references/handoff-audit.md",
    ".codex/hooks.json",
    ...(config.handoff?.attachmentPolicy ? [config.handoff.attachmentPolicy] : []),
    ...(config.handoff?.attachmentSchema ? [config.handoff.attachmentSchema] : []),
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

async function handoffAudit({ audience = null, json = false } = {}) {
  const validationErrors = await validate({ quiet: true, skipRetentionSweep: true });
  if (validationErrors.length > 0) {
    throw new Error(`Portable validation failed with ${validationErrors.length} error(s)`);
  }
  const config = await loadConfig();
  const selectedAudience = audience ?? config.handoff.defaultAudience;
  const sources = await collectPortableSourceFiles(config, false);
  const audit = auditPortableAttachments(config, sources, selectedAudience);
  printAttachmentAudit(audit, { json });
  if (audit.errors.length > 0) {
    throw new Error(`Handoff attachment audit failed with ${audit.errors.length} error(s)`);
  }
  return audit;
}

async function packagePortable({ output, includeSiteBinding = null, audience = null } = {}) {
  const errors = await validate({ quiet: true });
  if (errors.length > 0) throw new Error(`Portable validation failed with ${errors.length} error(s)`);
  const config = await loadConfig();
  includeSiteBinding = includeSiteBinding ?? config.packaging.includeSiteBindingByDefault;
  audience = audience ?? config.handoff.defaultAudience;
  if (!HANDOFF_AUDIENCES.includes(audience)) {
    throw new Error(`Handoff audience must be one of: ${HANDOFF_AUDIENCES.join(", ")}`);
  }
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
  const attachmentAudit = auditPortableAttachments(config, files, audience);
  printAttachmentAudit(attachmentAudit);
  if (attachmentAudit.errors.length > 0) {
    throw new Error(`Handoff attachment audit failed with ${attachmentAudit.errors.length} error(s)`);
  }
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
    distributionAudience: audience,
    attachmentAudit: attachmentAuditManifest(attachmentAudit),
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
    verifyPortableZip(archive, config, includeSiteBinding, audience);
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
  const options = { json: false, includeSiteBinding: null, output: null, audience: null };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--json") options.json = true;
    if (args[index] === "--include-site-binding") options.includeSiteBinding = true;
    if (args[index] === "--output") {
      options.output = args[index + 1];
      index += 1;
    }
    if (args[index] === "--audience") {
      options.audience = args[index + 1];
      index += 1;
    }
  }
  return options;
}

const [command = "help", ...args] = process.argv.slice(2);

try {
  if (command === "doctor") await doctor(parseOptions(args));
  else if (command === "inbox") await inbox(parseOptions(args));
  else if (command === "handoff-audit") await handoffAudit(parseOptions(args));
  else if (command === "validate") await validate();
  else if (command === "mark") await mark(args[0], args[1], args.slice(2).join(" "));
  else if (command === "package") await packagePortable(parseOptions(args));
  else {
    console.log("Usage: kb-tool.mjs <doctor|inbox|handoff-audit|validate|mark|package>");
    process.exitCode = command === "help" ? 0 : 2;
  }
} catch (error) {
  console.error(`ERROR ${error.message}`);
  process.exitCode = 1;
}
