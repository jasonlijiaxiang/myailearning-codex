import { promises as fs } from "node:fs";
import path from "node:path";
import {
  ALLOWED_DEFAULT_PUBLISHING_MODES,
  ALLOWED_PORTABLE_INCLUDES,
  DAILY_QUALITY_COMMANDS,
  EXPECTED_HOOK_COMMAND_SHA256,
  EXPECTED_HOOK_EVENTS,
  EXPECTED_HOOK_HANDLER_KEYS,
  EXPECTED_HOOK_TIMEOUT_SECONDS,
  REQUIRED_PORTABLE_EXCLUDES,
  REQUIRED_PORTABLE_INCLUDES,
} from "./constants.mjs";
import {
  PROJECT_ROOT,
  canonicalProjectRelative,
  exists,
  gitCommand,
  gitStatus,
  hash,
  portablePath,
  readJson,
  resolveProjectPath,
  sameStringArray,
} from "./context.mjs";
import { privateInboxIsSafe } from "../private-runtime.mjs";
import { validatePrivateCaptures } from "./capture-validation.mjs";

export async function validateEnvironment(config) {
  const errors = [];
  if (config.schemaVersion !== 1) errors.push("kb.config.json schemaVersion must be 1");
  if (!ALLOWED_DEFAULT_PUBLISHING_MODES.has(config.publishing?.defaultMode)) {
    errors.push("publishing.defaultMode must be one of: local, git, sites");
  }
  const sourceRepositoryVisibility = config.publishing?.sourceRepository?.visibility;
  if (sourceRepositoryVisibility != null
    && !["private", "public"].includes(sourceRepositoryVisibility)) {
    errors.push("publishing.sourceRepository.visibility must be private or public when configured");
  }
  const sitesVisibility = config.publishing?.sites?.visibility;
  if (sitesVisibility != null && !["private", "public"].includes(sitesVisibility)) {
    errors.push("publishing.sites.visibility must be private or public when configured");
  }
  if (!Number.isInteger(config.capture?.rawRetentionDays) || config.capture.rawRetentionDays <= 0) {
    errors.push("capture.rawRetentionDays must be a positive integer");
  }
  if (typeof config.capture?.storeRawTranscript !== "boolean") {
    errors.push("capture.storeRawTranscript must be true or false");
  }
  if (!sameStringArray(config.quality?.commands, DAILY_QUALITY_COMMANDS)) {
    errors.push(`quality.commands must be exactly: ${DAILY_QUALITY_COMMANDS.join(", ")}`);
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
  if (config.handoff?.defaultAudience !== "internal") {
    errors.push("handoff.defaultAudience must remain internal; external distribution requires an explicit CLI audience");
  }
  if (!Array.isArray(config.handoff?.attachmentRoots)
    || config.handoff.attachmentRoots.length === 0) {
    errors.push("handoff.attachmentRoots must contain at least one source-material root");
  }
  const attachmentRoots = [];
  for (const root of config.handoff?.attachmentRoots ?? []) {
    try {
      const canonical = canonicalProjectRelative(root);
      if (attachmentRoots.includes(canonical)) {
        errors.push(`handoff.attachmentRoots contains a duplicate root: ${canonical}`);
      } else {
        attachmentRoots.push(canonical);
      }
    } catch (error) {
      errors.push(error.message);
    }
  }
  const attachmentPolicyPath = config.handoff?.attachmentPolicy;
  const attachmentSchemaPath = config.handoff?.attachmentSchema;
  if (attachmentPolicyPath !== "knowledge/attachment-distribution.json") {
    errors.push("handoff.attachmentPolicy must point to knowledge/attachment-distribution.json");
  }
  if (attachmentSchemaPath !== "knowledge/schemas/attachment-distribution.schema.json") {
    errors.push("handoff.attachmentSchema must point to knowledge/schemas/attachment-distribution.schema.json");
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
  if (attachmentPolicyPath && !packageIncludes.has(attachmentPolicyPath)) {
    errors.push("Portable package must include the attachment distribution policy");
  }
  for (const root of attachmentRoots) {
    const covered = [...packageIncludes].some((included) => (
      root === included || root.startsWith(`${included}/`)
    ));
    if (!covered) errors.push(`Portable package must include attachment root: ${root}`);
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
    config.handoff?.attachmentPolicy,
    config.handoff?.attachmentSchema,
    ...(config.handoff?.attachmentRoots ?? []),
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

  return { errors, attachmentRoots, privateSafe, runtime, privateCaptures };
}
