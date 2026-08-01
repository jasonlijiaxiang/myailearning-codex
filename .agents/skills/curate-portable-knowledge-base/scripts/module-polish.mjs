#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import { realpathSync } from "node:fs";
import {
  lstat,
  mkdir,
  open,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = process.env.MODULE_POLISH_TEST_ROOT
  ? path.resolve(process.env.MODULE_POLISH_TEST_ROOT)
  : path.resolve(SCRIPT_DIR, "../../../..");
const CONFIG_PATH = path.join(PROJECT_ROOT, "kb.config.json");
const BATCH_STATUSES = new Set([
  "planned",
  "prepared",
  "in-progress",
  "verified",
  "complete",
  "blocked",
]);
const MODULE_STATUSES = new Set([
  "planned",
  "in-progress",
  "ready",
  "verified",
  "complete",
  "blocked",
]);
const MANUAL_BATCH_TRANSITIONS = new Map([
  ["prepared", new Set(["in-progress", "blocked"])],
  ["in-progress", new Set(["blocked"])],
  ["blocked", new Set(["in-progress"])],
  ["verified", new Set(["in-progress", "blocked"])],
]);
const MANUAL_MODULE_TRANSITIONS = new Map([
  ["planned", new Set(["in-progress", "blocked"])],
  ["in-progress", new Set(["ready", "blocked"])],
  ["blocked", new Set(["in-progress"])],
]);
const SAFE_EXECUTABLES = new Set(["node", "npm", "npx"]);
const GIT_OBJECT_ID_PATTERN = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;

function fail(message) {
  throw new Error(message);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function relativePath(absolutePath) {
  return path.relative(PROJECT_ROOT, absolutePath).split(path.sep).join("/");
}

function resolveProjectPath(projectRelativePath, label) {
  assert(
    typeof projectRelativePath === "string" && projectRelativePath.length > 0,
    `${label} must be a non-empty project-relative path.`,
  );
  assert(!path.isAbsolute(projectRelativePath), `${label} must be project-relative.`);
  const absolutePath = path.resolve(PROJECT_ROOT, projectRelativePath);
  const rel = path.relative(PROJECT_ROOT, absolutePath);
  assert(
    rel !== "" && rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel),
    `${label} escapes the project root.`,
  );
  return absolutePath;
}

async function assertReadableProjectFile(
  filePath,
  label = relativePath(filePath),
) {
  const absolutePath = path.resolve(filePath);
  const rel = path.relative(PROJECT_ROOT, absolutePath);
  assert(
    rel !== "" && rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel),
    `${label} must be a file inside the project root.`,
  );

  let rootInfo;
  try {
    rootInfo = await lstat(PROJECT_ROOT);
  } catch (error) {
    fail(`Cannot inspect project root for ${label}: ${error.message}`);
  }
  assert(
    !rootInfo.isSymbolicLink() && rootInfo.isDirectory(),
    `Project root must be a real directory before reading ${label}.`,
  );

  const parts = rel.split(path.sep).filter(Boolean);
  let cursor = PROJECT_ROOT;
  for (let index = 0; index < parts.length; index += 1) {
    cursor = path.join(cursor, parts[index]);
    let info;
    try {
      info = await lstat(cursor);
    } catch (error) {
      fail(`Cannot inspect ${label}: ${error.message}`);
    }
    assert(
      !info.isSymbolicLink(),
      `Refusing symlinked read path: ${relativePath(cursor)}`,
    );
    if (index === parts.length - 1) {
      assert(info.isFile(), `Expected readable project file: ${label}`);
    } else {
      assert(
        info.isDirectory(),
        `Expected directory while reading ${label}: ${relativePath(cursor)}`,
      );
    }
  }
}

async function readJson(filePath, label = relativePath(filePath)) {
  await assertReadableProjectFile(filePath, label);
  let source;
  try {
    source = await readFile(filePath, "utf8");
  } catch (error) {
    fail(`Cannot read ${label}: ${error.message}`);
  }
  try {
    return JSON.parse(source);
  } catch (error) {
    fail(`Invalid JSON in ${label}: ${error.message}`);
  }
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function sha256File(filePath) {
  await assertReadableProjectFile(filePath);
  return sha256(await readFile(filePath));
}

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function rejectSymlinks(absolutePath, createParent = false) {
  const rel = path.relative(PROJECT_ROOT, absolutePath);
  assert(
    rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel),
    `Unsafe path outside project root: ${absolutePath}`,
  );
  const parts = rel.split(path.sep).filter(Boolean);
  let cursor = PROJECT_ROOT;
  const lastDirectoryIndex = createParent ? parts.length - 1 : parts.length;
  for (let index = 0; index < lastDirectoryIndex; index += 1) {
    cursor = path.join(cursor, parts[index]);
    try {
      const info = await lstat(cursor);
      assert(!info.isSymbolicLink(), `Refusing symlinked path: ${relativePath(cursor)}`);
      assert(info.isDirectory(), `Expected directory: ${relativePath(cursor)}`);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      await mkdir(cursor);
    }
  }
  try {
    const info = await lstat(absolutePath);
    assert(!info.isSymbolicLink(), `Refusing symlinked path: ${relativePath(absolutePath)}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function atomicWrite(filePath, source) {
  await rejectSymlinks(filePath, true);
  const parent = path.dirname(filePath);
  let mode = 0o600;
  try {
    const existing = await lstat(filePath);
    assert(existing.isFile(), `Atomic-write target must be a regular file: ${relativePath(filePath)}`);
    mode = existing.mode & 0o777;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const temporaryPath = path.join(
    parent,
    `.${path.basename(filePath)}.${process.pid}.${randomUUID()}.tmp`,
  );
  let handle;
  try {
    handle = await open(temporaryPath, "wx", mode);
    await handle.writeFile(source);
    await handle.sync();
    await handle.close();
    handle = undefined;
    await rename(temporaryPath, filePath);
  } finally {
    if (handle) await handle.close().catch(() => {});
    await rm(temporaryPath, { force: true }).catch(() => {});
  }
}

async function atomicWriteJson(filePath, value) {
  await atomicWrite(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function loadContext() {
  const config = await readJson(CONFIG_PATH, "kb.config.json");
  assert(isPlainObject(config.modulePolish), "kb.config.json is missing modulePolish.");
  const modulePolish = config.modulePolish;
  for (const key of [
    "plan",
    "progress",
    "planSchema",
    "progressSchema",
    "runtime",
    "outputDirectory",
  ]) {
    assert(typeof modulePolish[key] === "string", `modulePolish.${key} must be a path.`);
  }
  const paths = {
    plan: resolveProjectPath(modulePolish.plan, "modulePolish.plan"),
    progress: resolveProjectPath(modulePolish.progress, "modulePolish.progress"),
    planSchema: resolveProjectPath(modulePolish.planSchema, "modulePolish.planSchema"),
    progressSchema: resolveProjectPath(
      modulePolish.progressSchema,
      "modulePolish.progressSchema",
    ),
    runtime: resolveProjectPath(modulePolish.runtime, "modulePolish.runtime"),
    outputDirectory: resolveProjectPath(
      modulePolish.outputDirectory,
      "modulePolish.outputDirectory",
    ),
  };
  const [plan, progress, planSchema, progressSchema] = await Promise.all([
    readJson(paths.plan),
    readJson(paths.progress),
    readJson(paths.planSchema),
    readJson(paths.progressSchema),
  ]);
  return {
    config,
    modulePolish,
    paths,
    plan,
    progress,
    planSchema,
    progressSchema,
  };
}

function validateSchemaContract(schema, expectedId, expectedRequired) {
  assert(isPlainObject(schema), `${expectedId} must be an object.`);
  assert(
    schema.$schema === "https://json-schema.org/draft/2020-12/schema",
    `${expectedId} must use JSON Schema draft 2020-12.`,
  );
  assert(schema.$id === expectedId, `${expectedId} has an unexpected $id.`);
  assert(schema.type === "object", `${expectedId} root type must be object.`);
  assert(schema.additionalProperties === false, `${expectedId} must fail closed on extra fields.`);
  assert(Array.isArray(schema.required), `${expectedId} must declare required root fields.`);
  for (const field of expectedRequired) {
    assert(schema.required.includes(field), `${expectedId} must require ${field}.`);
  }
  assert(isPlainObject(schema.properties), `${expectedId} must declare root properties.`);
}

function validatePlanShape(plan) {
  assert(isPlainObject(plan), "Plan must be an object.");
  assert(
    plan.$schema === "../schemas/module-polish-plan.schema.json",
    "Plan $schema is invalid.",
  );
  assert(plan.schemaVersion === 1, "Plan schemaVersion must be 1.");
  assert(typeof plan.planId === "string" && plan.planId.length > 0, "Plan planId is invalid.");
  assert(Array.isArray(plan.batches) && plan.batches.length > 0, "Plan batches are required.");

  const ids = new Set();
  const modules = new Set();
  plan.batches.forEach((batch, index) => {
    assert(isPlainObject(batch), `Plan batch ${index} must be an object.`);
    assert(
      Object.keys(batch).sort().join(",") === "dependsOn,id,modules,order,title",
      `Plan batch ${index} contains unsupported fields; the plan is scheduling-only.`,
    );
    assert(
      typeof batch.id === "string" && /^batch-\d{2}-[a-z0-9-]+$/.test(batch.id),
      `Invalid batch id at index ${index}.`,
    );
    assert(!ids.has(batch.id), `Duplicate batch id: ${batch.id}`);
    ids.add(batch.id);
    assert(batch.order === index, `Batch ${batch.id} order must be ${index}.`);
    assert(typeof batch.title === "string" && batch.title.length > 0, `Batch ${batch.id} title is required.`);
    assert(Array.isArray(batch.dependsOn), `Batch ${batch.id} dependsOn must be an array.`);
    const expectedDependencies = index === 0 ? [] : [plan.batches[index - 1].id];
    assert(
      JSON.stringify(batch.dependsOn) === JSON.stringify(expectedDependencies),
      `Batch ${batch.id} must depend only on the immediately preceding batch.`,
    );
    assert(
      Array.isArray(batch.modules) && batch.modules.length > 0 && batch.modules.length <= 3,
      `Batch ${batch.id} must contain between one and three modules.`,
    );
    for (const slug of batch.modules) {
      assert(typeof slug === "string" && /^[a-z0-9-]+$/.test(slug), `Invalid module slug: ${slug}`);
      assert(!modules.has(slug), `Module appears more than once in plan: ${slug}`);
      modules.add(slug);
    }
  });
  return modules;
}

function validateProgressShape(plan, progress) {
  assert(isPlainObject(progress), "Progress must be an object.");
  assert(
    progress.$schema === "../schemas/module-polish-progress.schema.json",
    "Progress $schema is invalid.",
  );
  assert(progress.schemaVersion === 1, "Progress schemaVersion must be 1.");
  assert(progress.planId === plan.planId, "Progress planId does not match the plan.");
  assert(
    Array.isArray(progress.batches) && progress.batches.length === plan.batches.length,
    "Progress batches must align exactly with the plan.",
  );
  progress.batches.forEach((batch, index) => {
    const plannedBatch = plan.batches[index];
    assert(isPlainObject(batch), `Progress batch ${index} must be an object.`);
    const allowedKeys = new Set(["id", "status", "note", "modules"]);
    assert(
      Object.keys(batch).every((key) => allowedKeys.has(key)),
      `Progress batch ${batch.id ?? index} contains unsupported fields.`,
    );
    assert(batch.id === plannedBatch.id, `Progress batch ${index} does not match plan.`);
    assert(BATCH_STATUSES.has(batch.status), `Invalid batch status for ${batch.id}.`);
    assert(batch.note === null || typeof batch.note === "string", `Invalid note for ${batch.id}.`);
    assert(
      Array.isArray(batch.modules) && batch.modules.length === plannedBatch.modules.length,
      `Progress modules do not align for ${batch.id}.`,
    );
    batch.modules.forEach((module, moduleIndex) => {
      assert(isPlainObject(module), `Invalid module progress in ${batch.id}.`);
      assert(
        Object.keys(module).sort().join(",") === "note,slug,status",
        `Module progress ${module.slug ?? moduleIndex} contains unsupported fields.`,
      );
      assert(
        module.slug === plannedBatch.modules[moduleIndex],
        `Module order mismatch in ${batch.id}.`,
      );
      assert(MODULE_STATUSES.has(module.status), `Invalid status for module ${module.slug}.`);
      assert(
        module.note === null || typeof module.note === "string",
        `Invalid note for module ${module.slug}.`,
      );
    });
    if (batch.status === "planned") {
      assert(
        batch.modules.every((module) => module.status === "planned"),
        `Planned batch ${batch.id} must contain only planned modules.`,
      );
    }
    if (batch.status === "verified") {
      assert(
        batch.modules.every((module) => module.status === "verified"),
        `Verified batch ${batch.id} must contain only verified modules.`,
      );
    }
    if (batch.status === "complete") {
      assert(
        batch.modules.every((module) => module.status === "complete"),
        `${batch.status} batch ${batch.id} must contain only complete modules.`,
      );
    }
  });
}

async function loadPublishedModuleSlugs(config) {
  const registryRelative = config.curation?.publicationRegistry;
  assert(
    typeof registryRelative === "string",
    "curation.publicationRegistry must identify the publication registry.",
  );
  const registryPath = resolveProjectPath(
    registryRelative,
    "curation.publicationRegistry",
  );
  await assertReadableProjectFile(registryPath, "publication registry");
  let registry;
  try {
    registry = await import(`${pathToFileURL(registryPath).href}?module-polish=${Date.now()}`);
  } catch (error) {
    fail(`Cannot import publication registry: ${error.message}`);
  }
  const slugs = registry.publishedModuleSlugs
    ?? registry.publishedModules?.map((module) => module.slug);
  assert(Array.isArray(slugs), "Publication registry does not export module slugs.");
  return [...slugs];
}

async function validateContext(context) {
  validateSchemaContract(
    context.planSchema,
    "module-polish-plan.schema.json",
    ["$schema", "schemaVersion", "planId", "batches"],
  );
  validateSchemaContract(
    context.progressSchema,
    "module-polish-progress.schema.json",
    ["$schema", "schemaVersion", "planId", "batches"],
  );
  const plannedModules = validatePlanShape(context.plan);
  validateProgressShape(context.plan, context.progress);
  const publishedSlugs = await loadPublishedModuleSlugs(context.config);
  assert(new Set(publishedSlugs).size === publishedSlugs.length, "Publication registry contains duplicate slugs.");
  assert(
    plannedModules.size === publishedSlugs.length
      && publishedSlugs.every((slug) => plannedModules.has(slug)),
    `Plan modules do not match the ${publishedSlugs.length} published modules.`,
  );
  const firstBatch = context.plan.batches[0];
  const firstProgress = context.progress.batches[0];
  assert(
    firstBatch.id === "batch-00-rag-calibration"
      && firstBatch.modules.length === 1
      && firstBatch.modules[0] === "rag",
    "Batch 00 must be the RAG calibration batch.",
  );
  assert(
    firstProgress.status === "complete" && firstProgress.modules[0].status === "complete",
    "RAG calibration must already be complete.",
  );
  assert(
    Array.isArray(context.modulePolish.targetedValidationCommands),
    "modulePolish.targetedValidationCommands must be an array.",
  );
  for (const [index, command] of context.modulePolish.targetedValidationCommands.entries()) {
    assert(isPlainObject(command), `Targeted validation command ${index} must be an object.`);
    assert(
      SAFE_EXECUTABLES.has(command.command),
      `Targeted validation command ${index} uses a forbidden executable.`,
    );
    assert(
      Array.isArray(command.args) && command.args.every((arg) => typeof arg === "string"),
      `Targeted validation command ${index} args must be strings.`,
    );
  }
  assert(
    context.modulePolish.fullValidationProfile === "quality.commands",
    "modulePolish.fullValidationProfile must be quality.commands.",
  );
  assert(
    Array.isArray(context.config.quality?.commands),
    "quality.commands must be an array.",
  );
}

function findBatch(context, batchId) {
  const planIndex = context.plan.batches.findIndex((batch) => batch.id === batchId);
  assert(planIndex >= 0, `Unknown batch: ${batchId}`);
  return {
    index: planIndex,
    plan: context.plan.batches[planIndex],
    progress: context.progress.batches[planIndex],
  };
}

function resolveBatchSelector(context, selector) {
  if (selector !== "next") return selector;
  const next = context.progress.batches.find(
    (batch) => batch.status !== "complete",
  );
  assert(next, "All module-polish batches are complete.");
  assert(
    next.status === "planned" || next.status === "prepared",
    `Cannot select next batch while ${next.id} is ${next.status}; resume or resolve it first.`,
  );
  return next.id;
}

function findModule(context, moduleSlug, explicitBatchId) {
  const matches = [];
  context.plan.batches.forEach((batch, batchIndex) => {
    const moduleIndex = batch.modules.indexOf(moduleSlug);
    if (moduleIndex >= 0) matches.push({ batchIndex, moduleIndex });
  });
  assert(matches.length === 1, `Unknown or ambiguous module: ${moduleSlug}`);
  const match = matches[0];
  const batch = context.plan.batches[match.batchIndex];
  if (explicitBatchId) assert(batch.id === explicitBatchId, `${moduleSlug} is not in ${explicitBatchId}.`);
  return {
    batchIndex: match.batchIndex,
    moduleIndex: match.moduleIndex,
    planBatch: batch,
    progressBatch: context.progress.batches[match.batchIndex],
    progressModule: context.progress.batches[match.batchIndex].modules[match.moduleIndex],
  };
}

function dependenciesComplete(context, batch) {
  for (const dependencyId of batch.dependsOn) {
    const dependency = findBatch(context, dependencyId).progress;
    assert(
      dependency.status === "complete",
      `Dependency ${dependencyId} must be complete.`,
    );
  }
}

function sealReceiptFile(context, batchId) {
  assert(/^batch-\d{2}-[a-z0-9-]+$/.test(batchId), "Unsafe batch id.");
  return path.join(context.paths.runtime, `${batchId}.seal.json`);
}

async function requireDependencySeals(context, batch) {
  const currentHead = gitHead();
  for (const dependencyId of batch.dependsOn) {
    if (dependencyId === "batch-00-rag-calibration") continue;
    const receiptPath = sealReceiptFile(context, dependencyId);
    assert(
      await pathExists(receiptPath),
      `Dependency ${dependencyId} is complete but not sealed in this checkout.`,
    );
    const receipt = await readJson(receiptPath);
    assert(
      receipt.batchId === dependencyId
        && receipt.planSha256 === sha256(canonicalJson(context.plan))
        && receipt.headSha === currentHead,
      `Dependency ${dependencyId} seal does not match current HEAD; verify release proof and reseal it.`,
    );
  }
}

async function ensureRuntimeDirectory(context) {
  await rejectSymlinks(context.paths.runtime);
  await mkdir(context.paths.runtime, { recursive: true });
}

async function withLock(context, action) {
  await ensureRuntimeDirectory(context);
  const lockPath = path.join(context.paths.runtime, ".module-polish.lock");
  try {
    await mkdir(lockPath);
  } catch (error) {
    if (error.code === "EEXIST") fail("Another module-polish command holds the runtime lock.");
    throw error;
  }
  try {
    await writeFile(
      path.join(lockPath, "owner.json"),
      `${JSON.stringify({ pid: process.pid, command: process.argv.slice(2) })}\n`,
      { flag: "wx", mode: 0o600 },
    );
    return await action();
  } finally {
    await rm(lockPath, { recursive: true, force: true });
  }
}

function run(command, args, { capture = false, trim = true } = {}) {
  const executable = process.platform === "win32" && (command === "npm" || command === "npx")
    ? `${command}.cmd`
    : command;
  const result = spawnSync(executable, args, {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    shell: false,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.error) fail(`Could not run ${command}: ${result.error.message}`);
  if (result.status !== 0) {
    const detail = capture ? (result.stderr || result.stdout || "").trim() : "";
    fail(`Command failed (${result.status}): ${command} ${args.join(" ")}${detail ? `\n${detail}` : ""}`);
  }
  if (!capture) return "";
  return trim ? result.stdout.trim() : result.stdout.replace(/\r?\n$/, "");
}

function assertGitRoot() {
  const reportedRoot = run("git", ["rev-parse", "--show-toplevel"], { capture: true });
  let actualRoot;
  let expectedRoot;
  try {
    actualRoot = realpathSync(reportedRoot);
    expectedRoot = realpathSync(PROJECT_ROOT);
  } catch (error) {
    fail(`Cannot resolve Git/project root: ${error.message}`);
  }
  assert(
    actualRoot === expectedRoot,
    `Git top level must equal the project root: expected ${expectedRoot}, found ${actualRoot}.`,
  );
}

function gitHead() {
  assertGitRoot();
  const head = run("git", ["rev-parse", "--verify", "HEAD"], { capture: true });
  assert(GIT_OBJECT_ID_PATTERN.test(head), "Git HEAD is not a full commit object ID.");
  return head;
}

function assertActiveBaseline(batchId, runtime) {
  const currentHead = gitHead();
  assert(
    currentHead === runtime.baselineSha,
    `${batchId} baseline moved: expected ${runtime.baselineSha}, found ${currentHead}.`,
  );
}

async function assertFrozenBaseline(context, batchId, runtime) {
  assertActiveBaseline(batchId, runtime);
  for (const frozen of runtime.criticalFiles) {
    assert(
      isPlainObject(frozen)
        && typeof frozen.path === "string"
        && /^[0-9a-f]{64}$/.test(frozen.sha256),
      `Invalid frozen critical-file entry for ${batchId}.`,
    );
    const absolutePath = resolveProjectPath(frozen.path, "frozen critical file");
    assert(await pathExists(absolutePath), `Frozen critical file is missing: ${frozen.path}`);
    const info = await lstat(absolutePath);
    assert(
      !info.isSymbolicLink() && info.isFile(),
      `Frozen critical path is not a regular file: ${frozen.path}`,
    );
    const currentHash = await sha256File(absolutePath);
    assert(
      currentHash === frozen.sha256,
      `Frozen critical file drifted before work began: ${frozen.path}`,
    );
  }
  const dirty = run(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    { capture: true, trim: false },
  );
  const progressRelative = relativePath(context.paths.progress);
  const unexplained = dirty
    .split("\n")
    .filter(Boolean)
    .filter((line) => {
      const normalMatch = line.match(/^[ MADRCU?!]{2} (.+)$/);
      const firstLineUnstagedMatch = line.match(/^[MADRCU?!] (.+)$/);
      const changedPath = normalMatch?.[1] ?? firstLineUnstagedMatch?.[1];
      return changedPath !== progressRelative;
    });
  assert(
    unexplained.length === 0,
    `Unexpected worktree changes before ${batchId} starts:\n${unexplained.join("\n")}`,
  );
}

function requireCleanGit() {
  assertGitRoot();
  const dirty = run(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    { capture: true, trim: false },
  );
  assert(dirty === "", `Git worktree must be clean:\n${dirty}`);
  return gitHead();
}

function requireStagedSnapshot() {
  assertGitRoot();
  const status = run(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    { capture: true, trim: false },
  );
  const entries = status.split("\n").filter(Boolean);
  assert(entries.length > 0, "Finish requires an intentional staged batch snapshot.");
  const unsafe = entries.filter((entry) => {
    const indexStatus = entry[0];
    const worktreeStatus = entry[1];
    return indexStatus === "?"
      || indexStatus === " "
      || indexStatus === "U"
      || worktreeStatus !== " ";
  });
  assert(
    unsafe.length === 0,
    `Finish requires all intended changes staged and no unstaged or untracked files:\n${unsafe.join("\n")}`,
  );
}

function runtimeFile(context, batchId) {
  assert(/^batch-\d{2}-[a-z0-9-]+$/.test(batchId), "Unsafe batch id.");
  return path.join(context.paths.runtime, `${batchId}.json`);
}

async function readRuntime(context, batchId, required = true) {
  const filePath = runtimeFile(context, batchId);
  if (!(await pathExists(filePath))) {
    if (required) fail(`Batch ${batchId} has not been prepared.`);
    return null;
  }
  await rejectSymlinks(filePath, true);
  const value = await readJson(filePath);
  assert(value.batchId === batchId, `Runtime batch id mismatch for ${batchId}.`);
  assert(
    value.planSha256 === sha256(canonicalJson(context.plan)),
    `Runtime plan digest mismatch for ${batchId}; prepare is fail-closed.`,
  );
  assert(
    GIT_OBJECT_ID_PATTERN.test(value.baselineSha),
    `Runtime baseline is invalid for ${batchId}.`,
  );
  assert(Array.isArray(value.criticalFiles), `Runtime critical file hashes are invalid for ${batchId}.`);
  return value;
}

const SHARED_CONTENT_OWNER_AGGREGATORS = Object.freeze([
  "app/module-brief-content.mjs",
  "app/module-curriculum-content.mjs",
  "app/module-learning-content.mjs",
]);

const SHARED_PUBLIC_KNOWLEDGE_FILES = Object.freeze([
  "app/knowledge-relations.mjs",
  "app/module-extension-views.mjs",
]);

function staticModuleSpecifiers(source) {
  const specifiers = [];
  const patterns = [
    /(?:^|\n)\s*import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']\s*;?/g,
    /(?:^|\n)\s*export\s+(?:\*(?:\s+as\s+[A-Za-z_$][\w$]*)?|\{[\s\S]*?\})\s+from\s+["']([^"']+)["']\s*;?/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.push(match[1]);
  }
  return specifiers;
}

async function resolveDirectLocalImport(importerRelativePath, specifier) {
  if (!specifier.startsWith(".")) return null;
  assert(
    !/[?#]/.test(specifier),
    `Local content owner import must not contain a query or fragment: ${importerRelativePath} -> ${specifier}`,
  );
  const importerPath = resolveProjectPath(importerRelativePath, "content owner importer");
  const unresolvedPath = path.resolve(path.dirname(importerPath), specifier);
  const rel = path.relative(PROJECT_ROOT, unresolvedPath);
  assert(
    rel !== "" && rel !== ".." && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel),
    `Local content owner import escapes the project root: ${importerRelativePath} -> ${specifier}`,
  );
  assert(
    path.extname(unresolvedPath),
    `Local content owner import must use an explicit file specifier: ${importerRelativePath} -> ${specifier}`,
  );
  if (await pathExists(unresolvedPath)) {
    await assertReadableProjectFile(
      unresolvedPath,
      `content owner imported by ${importerRelativePath}`,
    );
    return relativePath(unresolvedPath);
  }
  fail(`Missing local content owner import: ${importerRelativePath} -> ${specifier}`);
}

async function discoverDirectContentOwners(context, readPaths) {
  const owners = [];
  const aggregators = [
    context.config.curation.contentRegistry,
    ...SHARED_CONTENT_OWNER_AGGREGATORS,
  ];
  for (const importerRelativePath of new Set(aggregators)) {
    if (typeof importerRelativePath !== "string") continue;
    if (!readPaths.includes(importerRelativePath)) continue;
    const importerPath = resolveProjectPath(importerRelativePath, "content owner aggregator");
    await assertReadableProjectFile(importerPath, "content owner aggregator");
    const source = await readFile(importerPath, "utf8");
    for (const specifier of staticModuleSpecifiers(source)) {
      const owner = await resolveDirectLocalImport(importerRelativePath, specifier);
      if (owner) owners.push(owner);
    }
  }
  return owners;
}

async function moduleReadPaths(context, slug) {
  const common = [
    context.modulePolish.plan,
    context.modulePolish.progress,
    context.config.curation.publicationRegistry,
    context.config.curation.contentRegistry,
    context.config.curation.sourceLedger,
    context.config.curation.terminology,
    "docs/MODULE-BUILD-STANDARD.md",
    "docs/MODULE-QUALITY-GATES.md",
    ...SHARED_PUBLIC_KNOWLEDGE_FILES,
    `app/i18n/en/modules/${slug}.mjs`,
  ];
  const dedicated = new Set(["rag", "ai-agent", "prompt-engineering"]);
  const dedicatedContent = {
    rag: "app/rag-content.mjs",
    "ai-agent": "app/agent-content.mjs",
    "prompt-engineering": "app/prompt-content.mjs",
  };
  if (dedicated.has(slug)) common.push(`app/modules/${slug}/page.tsx`);
  else common.push("app/modules/[slug]/page.tsx");
  if (dedicatedContent[slug]) common.push(dedicatedContent[slug]);
  for (const candidate of [
    `app/${slug}-content.mjs`,
    "app/module-curriculum-content.mjs",
    "app/module-learning-content.mjs",
    "app/module-qa-expansion.mjs",
    "app/module-question-depth-expansion.mjs",
    "app/module-completion-content.mjs",
    "app/module-brief-content.mjs",
  ]) {
    common.push(candidate);
  }
  const readPaths = [];
  for (const item of new Set(common.filter((candidate) => typeof candidate === "string"))) {
    let absolutePath;
    try {
      absolutePath = resolveProjectPath(item, "brief read path");
    } catch {
      continue;
    }
    if (!(await pathExists(absolutePath))) continue;
    await assertReadableProjectFile(absolutePath, "brief read path");
    readPaths.push(item);
  }
  readPaths.push(...await discoverDirectContentOwners(context, readPaths));
  return [...new Set(readPaths)].sort();
}

async function criticalFiles(context, batch) {
  const modulePaths = [];
  for (const slug of batch.modules) {
    modulePaths.push(...await moduleReadPaths(context, slug));
  }
  const candidates = [
    "kb.config.json",
    "package.json",
    "package-lock.json",
    context.modulePolish.plan,
    context.modulePolish.planSchema,
    context.modulePolish.progressSchema,
    context.config.curation?.publicationRegistry,
    context.config.curation?.contentRegistry,
    context.config.curation?.sourceLedger,
    context.config.curation?.terminology,
    context.config.curation?.claims,
    ...modulePaths,
  ].filter((item) => typeof item === "string");
  const unique = [...new Set(candidates)]
    .filter((projectRelative) => projectRelative !== context.modulePolish.progress)
    .sort();
  const files = [];
  for (const projectRelative of unique) {
    const absolutePath = resolveProjectPath(projectRelative, "critical file");
    if (!(await pathExists(absolutePath))) continue;
    const info = await lstat(absolutePath);
    assert(!info.isSymbolicLink() && info.isFile(), `Critical path must be a regular file: ${projectRelative}`);
    files.push({ path: projectRelative, sha256: await sha256File(absolutePath) });
  }
  return files;
}

async function saveProgress(context) {
  validateProgressShape(context.plan, context.progress);
  await atomicWriteJson(context.paths.progress, context.progress);
}

function noteFrom(args) {
  const note = args.join(" ").trim();
  return note || null;
}

function tokenizeCommand(source) {
  assert(typeof source === "string" && source.trim(), "Quality command must be a non-empty string.");
  const tokens = [];
  let token = "";
  let quote = null;
  let active = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote) quote = null;
      else token += char;
      active = true;
      continue;
    }
    if (char === "'" || char === "\"") {
      quote = char;
      active = true;
    } else if (/\s/.test(char)) {
      if (active) {
        tokens.push(token);
        token = "";
        active = false;
      }
    } else {
      assert(!/[;&|<>`$\\]/.test(char), `Unsafe token in quality command: ${source}`);
      token += char;
      active = true;
    }
  }
  assert(!quote, `Unterminated quote in quality command: ${source}`);
  if (active) tokens.push(token);
  assert(tokens.length > 0 && SAFE_EXECUTABLES.has(tokens[0]), `Forbidden quality command: ${source}`);
  return { command: tokens[0], args: tokens.slice(1) };
}

async function commandValidate() {
  const context = await loadContext();
  await validateContext(context);
  console.log(
    `module-polish valid: ${context.plan.batches.length} batches, `
      + `${context.plan.batches.flatMap((batch) => batch.modules).length} modules`,
  );
}

async function commandStatus(args) {
  const context = await loadContext();
  await validateContext(context);
  const json = args.includes("--json");
  const batchId = args.find((arg) => arg !== "--json");
  const batches = batchId ? [findBatch(context, batchId).progress] : context.progress.batches;
  if (json) {
    console.log(JSON.stringify({ planId: context.plan.planId, batches }, null, 2));
    return;
  }
  for (const batch of batches) {
    console.log(`${batch.id}\t${batch.status}`);
    for (const moduleEntry of batch.modules) {
      console.log(`  ${moduleEntry.slug}\t${moduleEntry.status}`);
    }
  }
}

async function commandPrepare(args) {
  const selector = args[0];
  let batchId;
  assert(selector, "Usage: module-polish prepare <batch-id|next>");
  let context = await loadContext();
  await validateContext(context);
  batchId = resolveBatchSelector(context, selector);
  const batch = findBatch(context, batchId);
  dependenciesComplete(context, batch.plan);
  await requireDependencySeals(context, batch.plan);
  assert(
    ["planned", "prepared"].includes(batch.progress.status),
    `Cannot prepare ${batchId} from ${batch.progress.status}.`,
  );
  await withLock(context, async () => {
    context = await loadContext();
    await validateContext(context);
    const current = findBatch(context, batchId);
    dependenciesComplete(context, current.plan);
    await requireDependencySeals(context, current.plan);
    const existing = await readRuntime(context, batchId, false);
    if (existing) {
      if (current.progress.status === "planned") {
        current.progress.status = "prepared";
        current.progress.note = current.progress.note ?? "Baseline prepared.";
        await saveProgress(context);
      }
      console.log(`${batchId} already prepared at ${existing.baselineSha}.`);
      return;
    }
    const baselineSha = requireCleanGit();
    const runtime = {
      schemaVersion: 1,
      batchId,
      baselineSha,
      planSha256: sha256(canonicalJson(context.plan)),
      progressSha256: await sha256File(context.paths.progress),
      criticalFiles: await criticalFiles(context, current.plan),
    };
    const runtimePath = runtimeFile(context, batchId);
    await atomicWriteJson(runtimePath, runtime);
    const original = await readFile(context.paths.progress);
    try {
      current.progress.status = "prepared";
      current.progress.note = current.progress.note ?? "Baseline prepared.";
      await saveProgress(context);
    } catch (error) {
      await rm(runtimePath, { force: true });
      await atomicWrite(context.paths.progress, original);
      throw error;
    }
    console.log(`${batchId} prepared at ${baselineSha}.`);
  });
}

async function commandBrief(args) {
  const json = args.includes("--json");
  const positional = args.filter((arg) => arg !== "--json");
  const selector = positional[0];
  assert(selector, "Usage: module-polish brief <batch-id|next> [module-slug] [--json]");
  const context = await loadContext();
  await validateContext(context);
  const batchId = resolveBatchSelector(context, selector);
  const batch = findBatch(context, batchId);
  const runtime = await readRuntime(context, batchId);
  const requested = positional[1] ? [positional[1]] : batch.plan.modules;
  for (const slug of requested) assert(batch.plan.modules.includes(slug), `${slug} is not in ${batchId}.`);
  const brief = {
    batchId,
    baselineSha: runtime.baselineSha,
    mode: "read-only",
    instruction: "Inspect the assigned module and return the structured work package; do not modify files.",
    deliverableFields: [
      "readerProblemAndDecisionChain",
      "definitionMechanismFailureAndControls",
      "customerDecisionsAndBoundaries",
      "evidenceGapsAndPrimarySources",
      "adjacentOverlapAndPrimaryOwner",
      "chineseEnglishTerminologySourceClaimTestAndUiImpacts",
      "proposedAddsMergesRemovalsAndOpenQuestions",
    ],
    evidenceGate: [
      "Use current primary sources for dynamic claims.",
      "Separate supported, evidence-needed, and excluded findings.",
      "Preserve stable IDs and enumerate reverse references before source migration.",
      "Flag question-date or historical identity-hash effects.",
    ],
    prohibitedActions: [
      "edit files",
      "stage or commit",
      "push or deploy",
      "create worktrees",
      "change tracked progress",
    ],
    modules: await Promise.all(requested.map(async (slug) => ({
      slug,
      status: findModule(context, slug, batchId).progressModule.status,
      readPaths: await moduleReadPaths(context, slug),
    }))),
  };
  if (json) {
    console.log(JSON.stringify(brief, null, 2));
    return;
  }
  console.log(`Batch: ${batchId}`);
  console.log(`Baseline: ${brief.baselineSha}`);
  console.log("Mode: READ-ONLY");
  for (const moduleEntry of brief.modules) {
    console.log(`Module: ${moduleEntry.slug} (${moduleEntry.status})`);
    for (const readPath of moduleEntry.readPaths) console.log(`  - ${readPath}`);
  }
}

async function commandSetBatch(args) {
  const [batchId, targetStatus, ...noteArgs] = args;
  assert(batchId && targetStatus, "Usage: module-polish set-batch <batch-id> <status> [note]");
  let context = await loadContext();
  await validateContext(context);
  await withLock(context, async () => {
    context = await loadContext();
    await validateContext(context);
    const batch = findBatch(context, batchId);
    const runtime = await readRuntime(context, batchId);
    assert(
      MANUAL_BATCH_TRANSITIONS.get(batch.progress.status)?.has(targetStatus),
      `Forbidden batch transition: ${batch.progress.status} -> ${targetStatus}.`,
    );
    const transitionNote = noteFrom(noteArgs);
    if (targetStatus === "blocked") {
      assert(transitionNote, `A reason note is required when ${batchId} is blocked.`);
    }
    if (
      targetStatus === "in-progress"
      && (batch.progress.status === "blocked" || batch.progress.status === "verified")
    ) {
      assert(transitionNote, `A recovery note is required when ${batchId} resumes.`);
    }
    if (targetStatus === "in-progress") dependenciesComplete(context, batch.plan);
    const workHasNotStarted = batch.progress.modules.every(
      (moduleEntry) => moduleEntry.status === "planned",
    );
    if (
      targetStatus === "in-progress"
      && (batch.progress.status === "prepared" || workHasNotStarted)
    ) {
      await assertFrozenBaseline(context, batchId, runtime);
    } else {
      assertActiveBaseline(batchId, runtime);
    }
    if (targetStatus === "in-progress") {
      for (const moduleEntry of batch.progress.modules) {
        if (moduleEntry.status === "verified") moduleEntry.status = "ready";
      }
    }
    batch.progress.status = targetStatus;
    batch.progress.note = transitionNote;
    await saveProgress(context);
    console.log(`${batchId}: ${targetStatus}`);
  });
}

async function commandSetModule(args) {
  let batchId;
  let moduleSlug;
  let targetStatus;
  let noteArgs;
  if (args[0]?.startsWith("batch-")) {
    [batchId, moduleSlug, targetStatus, ...noteArgs] = args;
  } else {
    [moduleSlug, targetStatus, ...noteArgs] = args;
  }
  assert(
    moduleSlug && targetStatus,
    "Usage: module-polish set-module [batch-id] <module-slug> <status> [note]",
  );
  let context = await loadContext();
  await validateContext(context);
  await withLock(context, async () => {
    context = await loadContext();
    await validateContext(context);
    const moduleEntry = findModule(context, moduleSlug, batchId);
    const runtime = await readRuntime(context, moduleEntry.planBatch.id);
    assertActiveBaseline(moduleEntry.planBatch.id, runtime);
    assert(
      moduleEntry.progressBatch.status === "in-progress",
      `Batch ${moduleEntry.planBatch.id} must be in-progress.`,
    );
    assert(
      MANUAL_MODULE_TRANSITIONS.get(moduleEntry.progressModule.status)?.has(targetStatus),
      `Forbidden module transition: ${moduleEntry.progressModule.status} -> ${targetStatus}.`,
    );
    const transitionNote = noteFrom(noteArgs);
    if (targetStatus === "blocked") {
      assert(transitionNote, `A reason note is required when ${moduleSlug} is blocked.`);
    }
    moduleEntry.progressModule.status = targetStatus;
    moduleEntry.progressModule.note = transitionNote;
    if (targetStatus === "blocked") {
      moduleEntry.progressBatch.status = "blocked";
      moduleEntry.progressBatch.note = `Blocked by ${moduleSlug}.`;
    }
    await saveProgress(context);
    console.log(`${moduleSlug}: ${targetStatus}`);
  });
}

async function commandVerify(args) {
  const batchId = args[0];
  assert(batchId, "Usage: module-polish verify <batch-id>");
  let context = await loadContext();
  await validateContext(context);
  await withLock(context, async () => {
    context = await loadContext();
    await validateContext(context);
    const batch = findBatch(context, batchId);
    const runtime = await readRuntime(context, batchId);
    assertActiveBaseline(batchId, runtime);
    assert(batch.progress.status === "in-progress", `${batchId} must be in-progress before verify.`);
    assert(
      batch.progress.modules.every((module) => module.status === "ready"),
      `Every module in ${batchId} must be ready before verify.`,
    );
    for (const entry of context.modulePolish.targetedValidationCommands) {
      assert(SAFE_EXECUTABLES.has(entry.command), `Forbidden targeted executable: ${entry.command}`);
      console.log(`verify> ${entry.command} ${entry.args.join(" ")}`);
      run(entry.command, entry.args);
    }
    batch.progress.status = "verified";
    batch.progress.note = "Targeted validation passed.";
    for (const moduleEntry of batch.progress.modules) {
      moduleEntry.status = "verified";
      moduleEntry.note = moduleEntry.note ?? "Targeted validation passed.";
    }
    await saveProgress(context);
    console.log(`${batchId}: verified`);
  });
}

async function commandFinish(args) {
  const batchId = args[0];
  assert(batchId, "Usage: module-polish finish <batch-id>");
  let context = await loadContext();
  await validateContext(context);
  await withLock(context, async () => {
    context = await loadContext();
    await validateContext(context);
    const batch = findBatch(context, batchId);
    const runtime = await readRuntime(context, batchId);
    assertActiveBaseline(batchId, runtime);
    assert(batch.progress.status === "verified", `${batchId} must be verified before finish.`);
    assert(
      batch.progress.modules.every((module) => module.status === "verified"),
      `Every module in ${batchId} must be verified before finish.`,
    );
    requireStagedSnapshot();
    const verifiedProgress = await readFile(context.paths.progress);
    try {
      for (const source of context.config.quality.commands) {
        const parsed = tokenizeCommand(source);
        console.log(`finish> ${parsed.command} ${parsed.args.join(" ")}`);
        run(parsed.command, parsed.args);
      }
    } catch (error) {
      throw new Error(`Finish failed; tracked progress remains verified. ${error.message}`);
    }
    assert(
      (await readFile(context.paths.progress)).equals(verifiedProgress),
      "Tracked progress changed during full quality validation.",
    );
    batch.progress.status = "complete";
    batch.progress.note = "Full quality profile passed.";
    for (const moduleEntry of batch.progress.modules) {
      moduleEntry.status = "complete";
      moduleEntry.note = moduleEntry.note ?? "Full quality profile passed.";
    }
    await saveProgress(context);
    console.log(`${batchId}: complete`);
  });
}

async function commandSeal(args) {
  const batchId = args[0];
  assert(batchId, "Usage: module-polish seal <batch-id>");
  let context = await loadContext();
  await validateContext(context);
  await withLock(context, async () => {
    context = await loadContext();
    await validateContext(context);
    const batch = findBatch(context, batchId);
    const runtime = await readRuntime(context, batchId, false);
    assert(batch.progress.status === "complete", `${batchId} must be complete before seal.`);
    const head = requireCleanGit();
    const progressAtHeadSource = run(
      "git",
      ["show", `HEAD:${relativePath(context.paths.progress)}`],
      { capture: true },
    );
    let progressAtHead;
    try {
      progressAtHead = JSON.parse(progressAtHeadSource);
    } catch (error) {
      fail(`Progress committed at HEAD is invalid JSON: ${error.message}`);
    }
    validateProgressShape(context.plan, progressAtHead);
    const batchAtHead = progressAtHead.batches.find((entry) => entry.id === batchId);
    assert(
      batchAtHead?.status === "complete"
        && batchAtHead.modules.every((module) => module.status === "complete"),
      `${batchId} complete progress must already be committed at HEAD.`,
    );
    const receipt = {
      schemaVersion: 1,
      batchId,
      headSha: head,
      baselineSha: runtime?.baselineSha ?? null,
      planSha256: sha256(canonicalJson(context.plan)),
      progressSha256: sha256(progressAtHeadSource),
    };
    const receiptPath = sealReceiptFile(context, batchId);
    if (await pathExists(receiptPath)) {
      const existing = await readJson(receiptPath);
      if (canonicalJson(existing) === canonicalJson(receipt)) {
        console.log(`${batchId}: already sealed at ${head}`);
        return;
      }
    }
    await atomicWriteJson(receiptPath, receipt);
    console.log(`${batchId}: sealed at ${head}`);
  });
}

function usage() {
  console.log(`Usage: module-polish <command>

Commands:
  validate
  status [batch-id] [--json]
  prepare <batch-id|next>
  brief <batch-id|next> [module-slug] [--json]
  set-batch <batch-id> <in-progress|blocked> [note]
  set-module [batch-id] <module-slug> <in-progress|ready|blocked> [note]
  verify <batch-id>
  finish <batch-id>
  seal <batch-id>`);
}

const [command, ...args] = process.argv.slice(2);
const commands = {
  validate: commandValidate,
  status: commandStatus,
  prepare: commandPrepare,
  brief: commandBrief,
  "set-batch": commandSetBatch,
  "set-module": commandSetModule,
  verify: commandVerify,
  finish: commandFinish,
  seal: commandSeal,
};

try {
  if (!command || command === "help" || command === "--help" || command === "-h") {
    usage();
  } else {
    assert(commands[command], `Unknown command: ${command}`);
    await commands[command](args);
  }
} catch (error) {
  console.error(`module-polish: ${error.message}`);
  process.exitCode = 1;
}
