import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { publishedModuleSlugs } from "../app/module-publication.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(
  root,
  ".agents/skills/curate-portable-knowledge-base/scripts/module-polish.mjs",
);
const gitObjectIdSource = "(?:[0-9a-f]{40}|[0-9a-f]{64})";
const gitObjectIdPattern = new RegExp(`^${gitObjectIdSource}$`);

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function runProcess(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: "utf8",
    shell: false,
    ...options,
  });
}

function runCli(fixtureRoot, args) {
  return runProcess(process.execPath, [cliPath, ...args], {
    cwd: fixtureRoot,
    env: {
      ...process.env,
      MODULE_POLISH_TEST_ROOT: fixtureRoot,
    },
  });
}

function assertSucceeded(result, label) {
  assert.equal(
    result.status,
    0,
    `${label} failed:\n${result.stderr || result.stdout || "(no output)"}`,
  );
}

function assertRejected(result, pattern, label) {
  assert.notEqual(result.status, 0, `${label} unexpectedly succeeded`);
  assert.match(`${result.stderr}\n${result.stdout}`, pattern, `${label} returned the wrong failure`);
}

async function createFixture(t, {
  targetedCommand = "scripts/pass.mjs",
  fullCommand = "node scripts/pass.mjs",
  gitObjectFormat = null,
} = {}) {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "module-polish-test-"));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const [planSchemaSource, progressSchemaSource] = await Promise.all([
    readFile(path.join(root, "knowledge/schemas/module-polish-plan.schema.json"), "utf8"),
    readFile(path.join(root, "knowledge/schemas/module-polish-progress.schema.json"), "utf8"),
  ]);

  const plan = {
    $schema: "../schemas/module-polish-plan.schema.json",
    schemaVersion: 1,
    planId: "fixture-plan",
    batches: [
      {
        id: "batch-00-rag-calibration",
        order: 0,
        title: "RAG calibration",
        dependsOn: [],
        modules: ["rag"],
      },
      {
        id: "batch-01-foundations",
        order: 1,
        title: "Foundations",
        dependsOn: ["batch-00-rag-calibration"],
        modules: ["llm", "data-engineering"],
      },
    ],
  };
  const progress = {
    $schema: "../schemas/module-polish-progress.schema.json",
    schemaVersion: 1,
    planId: plan.planId,
    batches: [
      {
        id: "batch-00-rag-calibration",
        status: "complete",
        note: "Calibration complete.",
        modules: [{ slug: "rag", status: "complete", note: "Calibration complete." }],
      },
      {
        id: "batch-01-foundations",
        status: "planned",
        note: null,
        modules: [
          { slug: "llm", status: "planned", note: null },
          { slug: "data-engineering", status: "planned", note: null },
        ],
      },
    ],
  };
  const config = {
    schemaVersion: 1,
    curation: {
      publicationRegistry: "app/module-publication.mjs",
      contentRegistry: "app/module-content-registry.mjs",
      sourceLedger: "app/reference-content.mjs",
      terminology: "app/terminology.mjs",
      claims: "knowledge/claims/index.json",
    },
    modulePolish: {
      plan: "knowledge/module-polish/plan.json",
      progress: "knowledge/module-polish/progress.json",
      planSchema: "knowledge/schemas/module-polish-plan.schema.json",
      progressSchema: "knowledge/schemas/module-polish-progress.schema.json",
      runtime: "knowledge/module-polish/.runtime",
      outputDirectory: "outputs/module-polish",
      targetedValidationCommands: [
        { command: "node", args: [targetedCommand] },
      ],
      fullValidationProfile: "quality.commands",
    },
    quality: {
      commands: [fullCommand],
    },
  };

  await Promise.all([
    writeFile(
      path.join(fixtureRoot, ".gitignore"),
      "knowledge/module-polish/.runtime/\noutputs/module-polish/\n",
    ),
    writeJson(path.join(fixtureRoot, "kb.config.json"), config),
    writeJson(path.join(fixtureRoot, "knowledge/module-polish/plan.json"), plan),
    writeJson(path.join(fixtureRoot, "knowledge/module-polish/progress.json"), progress),
    mkdir(path.join(fixtureRoot, "knowledge/schemas"), { recursive: true }).then(() => Promise.all([
      writeFile(
        path.join(fixtureRoot, "knowledge/schemas/module-polish-plan.schema.json"),
        planSchemaSource,
      ),
      writeFile(
        path.join(fixtureRoot, "knowledge/schemas/module-polish-progress.schema.json"),
        progressSchemaSource,
      ),
    ])),
    mkdir(path.join(fixtureRoot, "app"), { recursive: true }).then(() => writeFile(
      path.join(fixtureRoot, "app/module-publication.mjs"),
      'export const publishedModuleSlugs = Object.freeze(["rag", "llm", "data-engineering"]);\n',
    )),
    mkdir(path.join(fixtureRoot, "app"), { recursive: true }).then(() => Promise.all([
      writeFile(
        path.join(fixtureRoot, "app/module-brief-content.mjs"),
        'import { fixtureBrief } from "./module-briefs-fixture.mjs";\nexport const moduleBriefs = Object.freeze({ llm: fixtureBrief });\n',
      ),
      writeFile(
        path.join(fixtureRoot, "app/module-briefs-fixture.mjs"),
        'export const fixtureBrief = Object.freeze({ slug: "llm" });\n',
      ),
      writeFile(
        path.join(fixtureRoot, "app/module-learning-content.mjs"),
        'export * from "./module-learning-fixture.mjs";\n',
      ),
      writeFile(
        path.join(fixtureRoot, "app/module-learning-fixture.mjs"),
        'export const fixtureLearning = Object.freeze({ llm: Object.freeze({}) });\n',
      ),
      writeFile(
        path.join(fixtureRoot, "app/module-curriculum-content.mjs"),
        'export { fixtureCurriculum } from "./module-curriculum-fixture.mjs";\nexport * as fixtureNamespace from "./module-curriculum-namespace-fixture.mjs";\n',
      ),
      writeFile(
        path.join(fixtureRoot, "app/module-curriculum-fixture.mjs"),
        'export const fixtureCurriculum = Object.freeze({ llm: Object.freeze([]) });\n',
      ),
      writeFile(
        path.join(fixtureRoot, "app/module-curriculum-namespace-fixture.mjs"),
        'export const fixtureNamespaceValue = Object.freeze({ llm: Object.freeze([]) });\n',
      ),
    ])),
    mkdir(path.join(fixtureRoot, "scripts"), { recursive: true }).then(() => Promise.all([
      writeFile(path.join(fixtureRoot, "scripts/pass.mjs"), ""),
      writeFile(path.join(fixtureRoot, "scripts/fail.mjs"), "process.exitCode = 9;\n"),
    ])),
  ]);

  const gitCommands = [
    [
      "init",
      "-q",
      ...(gitObjectFormat ? [`--object-format=${gitObjectFormat}`] : []),
    ],
    ["config", "user.name", "Module Polish Test"],
    ["config", "user.email", "module-polish-test@example.invalid"],
    ["add", "."],
    ["commit", "-qm", "fixture baseline"],
  ];
  for (const args of gitCommands) {
    const result = runProcess("git", args, { cwd: fixtureRoot });
    assertSucceeded(result, `git ${args.join(" ")}`);
  }

  return fixtureRoot;
}

async function prepareFixture(fixtureRoot) {
  const prepared = runCli(fixtureRoot, ["prepare", "batch-01-foundations"]);
  assertSucceeded(prepared, "prepare fixture batch");
}

function advanceModulesToReady(fixtureRoot) {
  assertSucceeded(
    runCli(fixtureRoot, ["set-batch", "batch-01-foundations", "in-progress", "fixture run"]),
    "start fixture batch",
  );
  for (const slug of ["llm", "data-engineering"]) {
    assertSucceeded(
      runCli(fixtureRoot, ["set-module", "batch-01-foundations", slug, "in-progress", "research complete"]),
      `start ${slug}`,
    );
    assertSucceeded(
      runCli(fixtureRoot, ["set-module", "batch-01-foundations", slug, "ready", "integration complete"]),
      `mark ${slug} ready`,
    );
  }
}

function stageFixture(fixtureRoot) {
  assertSucceeded(
    runProcess("git", ["add", "-A"], { cwd: fixtureRoot }),
    "stage fixture batch snapshot",
  );
}

test("module polish plan covers every live module exactly once", async () => {
  const plan = await readJson("knowledge/module-polish/plan.json");
  const plannedSlugs = plan.batches.flatMap((batch) => batch.modules);

  assert.equal(
    plannedSlugs.length,
    publishedModuleSlugs.length,
    "the plan must schedule one occurrence for every live module",
  );
  assert.equal(
    new Set(plannedSlugs).size,
    publishedModuleSlugs.length,
    "a module must not appear in more than one batch",
  );
  assert.deepEqual(
    [...plannedSlugs].sort(),
    [...publishedModuleSlugs].sort(),
    "the plan must be a scheduling view over the live publication registry",
  );
});

test("batch order is contiguous, dependency-safe, and capped at three modules", async () => {
  const plan = await readJson("knowledge/module-polish/plan.json");
  const batchIds = new Set(plan.batches.map((batch) => batch.id));

  assert.equal(batchIds.size, plan.batches.length, "batch IDs must be unique");
  plan.batches.forEach((batch, index) => {
    assert.equal(batch.order, index, `batch ${batch.id} must retain contiguous order`);
    assert.ok(batch.modules.length >= 1 && batch.modules.length <= 3, `${batch.id} must contain one to three modules`);

    if (index === 0) {
      assert.deepEqual(batch.dependsOn, [], "the calibration batch must not depend on another batch");
      return;
    }

    assert.deepEqual(
      batch.dependsOn,
      [plan.batches[index - 1].id],
      `${batch.id} must depend on the immediately preceding approved batch`,
    );
    for (const dependencyId of batch.dependsOn) {
      assert.ok(batchIds.has(dependencyId), `${batch.id} depends on unknown batch ${dependencyId}`);
      const dependency = plan.batches.find((candidate) => candidate.id === dependencyId);
      assert.ok(dependency.order < batch.order, `${batch.id} must not depend on itself or a later batch`);
    }
  });
});

test("RAG is the completed calibration batch and progress mirrors the plan", async () => {
  const [plan, progress] = await Promise.all([
    readJson("knowledge/module-polish/plan.json"),
    readJson("knowledge/module-polish/progress.json"),
  ]);

  assert.equal(progress.planId, plan.planId);
  assert.deepEqual(
    progress.batches.map((batch) => batch.id),
    plan.batches.map((batch) => batch.id),
    "progress batch order must match the approved plan",
  );

  for (const batch of plan.batches) {
    const tracked = progress.batches.find((candidate) => candidate.id === batch.id);
    assert.ok(tracked, `progress is missing ${batch.id}`);
    assert.deepEqual(
      tracked.modules.map((module) => module.slug),
      batch.modules,
      `${batch.id} progress modules must match the plan exactly`,
    );
  }

  const calibration = plan.batches[0];
  const calibrationProgress = progress.batches[0];
  assert.equal(calibration.id, "batch-00-rag-calibration");
  assert.deepEqual(calibration.modules, ["rag"]);
  assert.equal(calibrationProgress.status, "complete");
  assert.deepEqual(
    calibrationProgress.modules.map(({ slug, status }) => ({ slug, status })),
    [{ slug: "rag", status: "complete" }],
  );
});

test("configured plan, progress, and schema paths exist", async () => {
  const config = await readJson("kb.config.json");
  assert.ok(config.modulePolish, "kb.config.json must define modulePolish paths");

  for (const key of ["plan", "progress", "planSchema", "progressSchema"]) {
    const relativePath = config.modulePolish[key];
    assert.equal(typeof relativePath, "string", `modulePolish.${key} must be a repository-relative path`);
    assert.equal(path.isAbsolute(relativePath), false, `modulePolish.${key} must not contain an absolute path`);
    await access(path.join(root, relativePath));
  }
});

test("the live CLI validates the repository plan", async () => {
  const plan = await readJson("knowledge/module-polish/plan.json");
  const moduleCount = plan.batches.flatMap((batch) => batch.modules).length;
  const result = runProcess(process.execPath, [cliPath, "validate"], { cwd: root });
  assertSucceeded(result, "module-polish validate");
  assert.equal(
    result.stdout.trim(),
    `module-polish valid: ${plan.batches.length} batches, ${moduleCount} modules`,
  );
});

test("validate refuses a plan reached through a symlink", async (t) => {
  const fixtureRoot = await createFixture(t);
  const planPath = path.join(fixtureRoot, "knowledge/module-polish/plan.json");
  const targetPath = path.join(fixtureRoot, "knowledge/module-polish/plan.target.json");
  await rename(planPath, targetPath);
  try {
    await symlink("plan.target.json", planPath);
  } catch (error) {
    if (["EACCES", "ENOSYS", "EPERM"].includes(error.code)) {
      t.skip(`symlinks are unavailable: ${error.code}`);
      return;
    }
    throw error;
  }

  assertRejected(
    runCli(fixtureRoot, ["validate"]),
    /Refusing symlinked read path: knowledge\/module-polish\/plan\.json/,
    "symlinked plan validation",
  );
});

test("validate refuses a publication registry reached through a symlink", async (t) => {
  const fixtureRoot = await createFixture(t);
  const registryPath = path.join(fixtureRoot, "app/module-publication.mjs");
  const targetPath = path.join(fixtureRoot, "app/module-publication.target.mjs");
  await rename(registryPath, targetPath);
  try {
    await symlink("module-publication.target.mjs", registryPath);
  } catch (error) {
    if (["EACCES", "ENOSYS", "EPERM"].includes(error.code)) {
      t.skip(`symlinks are unavailable: ${error.code}`);
      return;
    }
    throw error;
  }

  assertRejected(
    runCli(fixtureRoot, ["validate"]),
    /Refusing symlinked read path: app\/module-publication\.mjs/,
    "symlinked publication registry validation",
  );
});

test("brief emits only project-relative paths and rejects a module from another batch", async (t) => {
  const fixtureRoot = await createFixture(t);
  await prepareFixture(fixtureRoot);

  const result = runCli(fixtureRoot, ["brief", "batch-01-foundations", "--json"]);
  assertSucceeded(result, "brief fixture batch");
  assert.equal(result.stdout.includes(fixtureRoot), false, "brief must not expose its absolute fixture root");
  assert.equal(result.stdout.includes(root), false, "brief must not expose the real repository root");

  const brief = JSON.parse(result.stdout);
  assert.equal(brief.mode, "read-only");
  assert.ok(brief.deliverableFields.includes("evidenceGapsAndPrimarySources"));
  assert.ok(brief.evidenceGate.some((item) => /primary sources/i.test(item)));
  assert.ok(brief.prohibitedActions.includes("edit files"));
  assert.deepEqual(brief.modules.map((module) => module.slug), ["llm", "data-engineering"]);
  for (const moduleEntry of brief.modules) {
    for (const readPath of moduleEntry.readPaths) {
      assert.equal(path.isAbsolute(readPath), false, `brief leaked an absolute path: ${readPath}`);
      assert.equal(path.win32.isAbsolute(readPath), false, `brief leaked a Windows absolute path: ${readPath}`);
      assert.equal(readPath.includes(".."), false, `brief path escapes the project root: ${readPath}`);
    }
  }

  assertRejected(
    runCli(fixtureRoot, ["brief", "batch-01-foundations", "rag", "--json"]),
    /rag is not in batch-01-foundations/,
    "brief for a non-batch module",
  );
});

test("brief and frozen baseline include content owners imported by an adapter", async (t) => {
  const fixtureRoot = await createFixture(t);
  await prepareFixture(fixtureRoot);
  const ownerPath = "app/module-briefs-fixture.mjs";

  const result = runCli(fixtureRoot, ["brief", "batch-01-foundations", "llm", "--json"]);
  assertSucceeded(result, "brief with imported content owner");
  const brief = JSON.parse(result.stdout);
  assert.ok(
    brief.modules[0].readPaths.includes(ownerPath),
    "the read-only work package must expose the real imported content owner",
  );
  assert.ok(
    brief.modules[0].readPaths.includes("app/module-learning-fixture.mjs"),
    "the read-only work package must discover a content owner re-exported with export *",
  );
  assert.ok(
    brief.modules[0].readPaths.includes("app/module-curriculum-fixture.mjs"),
    "the read-only work package must discover a named re-exported content owner",
  );
  assert.ok(
    brief.modules[0].readPaths.includes("app/module-curriculum-namespace-fixture.mjs"),
    "the read-only work package must discover a namespace re-exported content owner",
  );

  const runtime = JSON.parse(
    await readFile(
      path.join(
        fixtureRoot,
        "knowledge/module-polish/.runtime/batch-01-foundations.json",
      ),
      "utf8",
    ),
  );
  assert.ok(
    runtime.criticalFiles.some((entry) => entry.path === ownerPath),
    "the prepared baseline must freeze the real imported content owner",
  );

  await writeFile(
    path.join(fixtureRoot, ownerPath),
    'export const fixtureBrief = Object.freeze({ slug: "llm", changed: true });\n',
  );
  assertRejected(
    runCli(fixtureRoot, ["set-batch", "batch-01-foundations", "in-progress", "start"]),
    /Frozen critical file drifted before work began: app\/module-briefs-fixture\.mjs/,
    "imported content owner drift",
  );
});

test("content-owner discovery refuses an import that escapes the project", async (t) => {
  const fixtureRoot = await createFixture(t);
  const adapterPath = path.join(fixtureRoot, "app/module-learning-content.mjs");
  await writeFile(adapterPath, 'export * from "../../outside-owner.mjs";\n');
  for (const args of [
    ["add", "app/module-learning-content.mjs"],
    ["commit", "-qm", "unsafe owner import"],
  ]) {
    assertSucceeded(runProcess("git", args, { cwd: fixtureRoot }), `git ${args.join(" ")}`);
  }

  assertRejected(
    runCli(fixtureRoot, ["prepare", "batch-01-foundations"]),
    /Local content owner import escapes the project root/,
    "escaping content owner import",
  );
});

test("content-owner discovery refuses a symlinked owner", async (t) => {
  const fixtureRoot = await createFixture(t);
  const ownerPath = path.join(fixtureRoot, "app/module-briefs-fixture.mjs");
  const targetPath = path.join(fixtureRoot, "app/module-briefs-fixture.target.mjs");
  await rename(ownerPath, targetPath);
  try {
    await symlink("module-briefs-fixture.target.mjs", ownerPath);
  } catch (error) {
    if (["EACCES", "ENOSYS", "EPERM"].includes(error.code)) {
      t.skip(`symlinks are unavailable: ${error.code}`);
      return;
    }
    throw error;
  }
  for (const args of [
    ["add", "-A"],
    ["commit", "-qm", "symlinked owner"],
  ]) {
    assertSucceeded(runProcess("git", args, { cwd: fixtureRoot }), `git ${args.join(" ")}`);
  }

  assertRejected(
    runCli(fixtureRoot, ["prepare", "batch-01-foundations"]),
    /Refusing symlinked read path: app\/module-briefs-fixture\.mjs/,
    "symlinked content owner",
  );
});

test("state transitions reject skipped stages and preserve tracked progress", async (t) => {
  const fixtureRoot = await createFixture(t);
  await prepareFixture(fixtureRoot);
  const progressPath = path.join(fixtureRoot, "knowledge/module-polish/progress.json");
  const preparedProgress = await readFile(progressPath, "utf8");

  assertRejected(
    runCli(fixtureRoot, ["set-batch", "batch-01-foundations", "complete", "skip"]),
    /Forbidden batch transition: prepared -> complete/,
    "batch stage skip",
  );
  assert.equal(await readFile(progressPath, "utf8"), preparedProgress);

  assertSucceeded(
    runCli(fixtureRoot, ["set-batch", "batch-01-foundations", "in-progress", "start"]),
    "start fixture batch",
  );
  const inProgress = await readFile(progressPath, "utf8");
  assertRejected(
    runCli(fixtureRoot, ["set-module", "batch-01-foundations", "llm", "ready", "skip"]),
    /Forbidden module transition: planned -> ready/,
    "module stage skip",
  );
  assert.equal(await readFile(progressPath, "utf8"), inProgress);
});

test("blocked transitions require a reason", async (t) => {
  const batchFixture = await createFixture(t);
  await prepareFixture(batchFixture);
  assertRejected(
    runCli(batchFixture, ["set-batch", "batch-01-foundations", "blocked"]),
    /blocked.*(?:reason|note)|(?:reason|note).*blocked/i,
    "reasonless blocked batch",
  );

  const moduleFixture = await createFixture(t);
  await prepareFixture(moduleFixture);
  assertSucceeded(
    runCli(moduleFixture, ["set-batch", "batch-01-foundations", "in-progress", "start"]),
    "start module fixture batch",
  );
  assertSucceeded(
    runCli(moduleFixture, ["set-module", "batch-01-foundations", "llm", "in-progress", "start"]),
    "start fixture module",
  );
  assertRejected(
    runCli(moduleFixture, ["set-module", "batch-01-foundations", "llm", "blocked"]),
    /blocked.*(?:reason|note)|(?:reason|note).*blocked/i,
    "reasonless blocked module",
  );

  assertSucceeded(
    runCli(moduleFixture, ["set-module", "batch-01-foundations", "llm", "blocked", "evidence conflict"]),
    "block fixture module with a reason",
  );
  assertRejected(
    runCli(moduleFixture, ["set-module", "batch-01-foundations", "data-engineering", "in-progress", "continue"]),
    /Batch batch-01-foundations must be in-progress/,
    "work while the batch is blocked",
  );
  assertRejected(
    runCli(moduleFixture, ["set-batch", "batch-01-foundations", "in-progress"]),
    /recovery note is required/,
    "reasonless blocked-batch recovery",
  );
});

test("module transitions reject a slug outside the explicit batch", async (t) => {
  const fixtureRoot = await createFixture(t);
  await prepareFixture(fixtureRoot);
  assertSucceeded(
    runCli(fixtureRoot, ["set-batch", "batch-01-foundations", "in-progress", "start"]),
    "start fixture batch",
  );

  assertRejected(
    runCli(fixtureRoot, ["set-module", "batch-01-foundations", "rag", "in-progress", "wrong batch"]),
    /rag is not in batch-01-foundations/,
    "module from another batch",
  );
});

test("the runtime lock rejects a concurrent writer", async (t) => {
  const fixtureRoot = await createFixture(t);
  await prepareFixture(fixtureRoot);
  await mkdir(
    path.join(fixtureRoot, "knowledge/module-polish/.runtime/.module-polish.lock"),
    { recursive: true },
  );

  assertRejected(
    runCli(fixtureRoot, ["set-batch", "batch-01-foundations", "in-progress", "start"]),
    /Another module-polish command holds the runtime lock/,
    "concurrent writer",
  );
});

test("verify failure leaves the in-progress batch and ready modules unchanged", async (t) => {
  const fixtureRoot = await createFixture(t, { targetedCommand: "scripts/fail.mjs" });
  await prepareFixture(fixtureRoot);
  advanceModulesToReady(fixtureRoot);

  const progressPath = path.join(fixtureRoot, "knowledge/module-polish/progress.json");
  const before = await readFile(progressPath, "utf8");
  assertRejected(
    runCli(fixtureRoot, ["verify", "batch-01-foundations"]),
    /Command failed \(9\): node scripts\/fail\.mjs/,
    "failed targeted verification",
  );
  assert.equal(
    await readFile(progressPath, "utf8"),
    before,
    "verify failure must not advance tracked progress",
  );
});

test("finish failure leaves verified progress unchanged", async (t) => {
  const fixtureRoot = await createFixture(t, { fullCommand: "node scripts/fail.mjs" });
  await prepareFixture(fixtureRoot);
  advanceModulesToReady(fixtureRoot);
  assertSucceeded(
    runCli(fixtureRoot, ["verify", "batch-01-foundations"]),
    "verify fixture batch",
  );
  stageFixture(fixtureRoot);

  const progressPath = path.join(fixtureRoot, "knowledge/module-polish/progress.json");
  const before = await readFile(progressPath, "utf8");
  assertRejected(
    runCli(fixtureRoot, ["finish", "batch-01-foundations"]),
    /Finish failed; tracked progress remains verified/,
    "failed full quality profile",
  );
  assert.equal(
    await readFile(progressPath, "utf8"),
    before,
    "finish failure must leave verified progress byte-for-byte unchanged",
  );
});

test("finish requires a fully staged verified snapshot", async (t) => {
  const fixtureRoot = await createFixture(t);
  await prepareFixture(fixtureRoot);
  advanceModulesToReady(fixtureRoot);
  assertSucceeded(
    runCli(fixtureRoot, ["verify", "batch-01-foundations"]),
    "verify fixture batch",
  );

  const progressPath = path.join(fixtureRoot, "knowledge/module-polish/progress.json");
  const before = await readFile(progressPath, "utf8");
  assertRejected(
    runCli(fixtureRoot, ["finish", "batch-01-foundations"]),
    /Finish requires all intended changes staged/,
    "finish with an unstaged verified snapshot",
  );
  assert.equal(await readFile(progressPath, "utf8"), before);
});

test("a verified batch can reopen only with a recovery note", async (t) => {
  const fixtureRoot = await createFixture(t);
  await prepareFixture(fixtureRoot);
  advanceModulesToReady(fixtureRoot);
  assertSucceeded(
    runCli(fixtureRoot, ["verify", "batch-01-foundations"]),
    "verify fixture batch",
  );

  assertRejected(
    runCli(fixtureRoot, ["set-batch", "batch-01-foundations", "in-progress"]),
    /recovery note is required/,
    "reasonless verified-batch recovery",
  );
  assertSucceeded(
    runCli(fixtureRoot, ["set-batch", "batch-01-foundations", "in-progress", "repair full gate"]),
    "reopen verified batch",
  );
  const progress = JSON.parse(
    await readFile(path.join(fixtureRoot, "knowledge/module-polish/progress.json"), "utf8"),
  );
  assert.equal(progress.batches[1].status, "in-progress");
  assert.deepEqual(
    progress.batches[1].modules.map((module) => module.status),
    ["ready", "ready"],
  );
});

test("prepare next selects only the first incomplete approved batch", async (t) => {
  const fixtureRoot = await createFixture(t);
  const result = runCli(fixtureRoot, ["prepare", "next"]);
  assertSucceeded(result, "prepare next");
  assert.match(
    result.stdout,
    new RegExp(`batch-01-foundations prepared at ${gitObjectIdSource}`),
  );

  const progress = JSON.parse(
    await readFile(path.join(fixtureRoot, "knowledge/module-polish/progress.json"), "utf8"),
  );
  assert.equal(progress.batches[0].status, "complete");
  assert.equal(progress.batches[1].status, "prepared");
  await access(
    path.join(
      fixtureRoot,
      "knowledge/module-polish/.runtime/batch-01-foundations.json",
    ),
  );
});

test("prepare accepts a SHA-256 Git repository when the installed Git supports it", async (t) => {
  const probeRoot = await mkdtemp(path.join(os.tmpdir(), "module-polish-sha256-probe-"));
  const probe = runProcess(
    "git",
    ["init", "-q", "--object-format=sha256"],
    { cwd: probeRoot },
  );
  await rm(probeRoot, { recursive: true, force: true });
  if (probe.status !== 0) {
    t.skip("installed Git does not support SHA-256 repositories");
    return;
  }

  const fixtureRoot = await createFixture(t, { gitObjectFormat: "sha256" });
  const result = runCli(fixtureRoot, ["prepare", "next"]);
  assertSucceeded(result, "prepare next in SHA-256 fixture");
  const runtime = JSON.parse(
    await readFile(
      path.join(
        fixtureRoot,
        "knowledge/module-polish/.runtime/batch-01-foundations.json",
      ),
      "utf8",
    ),
  );
  assert.match(runtime.baselineSha, /^[0-9a-f]{64}$/);
  assert.match(
    result.stdout,
    new RegExp(`batch-01-foundations prepared at ${runtime.baselineSha}`),
  );
});

test("frozen baseline and unexplained worktree drift block batch start", async (t) => {
  const movedHeadFixture = await createFixture(t);
  await prepareFixture(movedHeadFixture);
  await writeFile(path.join(movedHeadFixture, "unrelated.txt"), "new committed state\n");
  for (const args of [["add", "unrelated.txt"], ["commit", "-qm", "move fixture head"]]) {
    assertSucceeded(
      runProcess("git", args, { cwd: movedHeadFixture }),
      `git ${args.join(" ")}`,
    );
  }
  assertRejected(
    runCli(movedHeadFixture, ["set-batch", "batch-01-foundations", "in-progress", "start"]),
    new RegExp(
      `batch-01-foundations baseline moved: expected ${gitObjectIdSource}, found ${gitObjectIdSource}`,
    ),
    "moved baseline HEAD",
  );

  const dirtyFixture = await createFixture(t);
  await prepareFixture(dirtyFixture);
  await writeFile(path.join(dirtyFixture, "unexpected.txt"), "untracked overlap\n");
  assertRejected(
    runCli(dirtyFixture, ["set-batch", "batch-01-foundations", "in-progress", "start"]),
    /Unexpected worktree changes before batch-01-foundations starts:[\s\S]*unexpected\.txt/,
    "unexplained worktree diff",
  );
});

test("module polish refuses a project nested under another Git root", async (t) => {
  const fixtureRoot = await createFixture(t);
  const outerRoot = await mkdtemp(path.join(os.tmpdir(), "module-polish-outer-"));
  t.after(() => rm(outerRoot, { recursive: true, force: true }));
  const nestedRoot = path.join(outerRoot, "project");
  await rm(path.join(fixtureRoot, ".git"), { recursive: true, force: true });
  await rename(fixtureRoot, nestedRoot);

  for (const args of [
    ["init", "-q"],
    ["config", "user.name", "Module Polish Outer Test"],
    ["config", "user.email", "module-polish-outer@example.invalid"],
    ["add", "."],
    ["commit", "-qm", "outer fixture baseline"],
  ]) {
    assertSucceeded(runProcess("git", args, { cwd: outerRoot }), `git ${args.join(" ")}`);
  }

  assertRejected(
    runCli(nestedRoot, ["prepare", "next"]),
    /Git top level must equal the project root/,
    "nested project prepare",
  );
});

test("a non-calibration dependency must be sealed before the next batch", async (t) => {
  const fixtureRoot = await createFixture(t);
  const planPath = path.join(fixtureRoot, "knowledge/module-polish/plan.json");
  const progressPath = path.join(fixtureRoot, "knowledge/module-polish/progress.json");
  const plan = JSON.parse(await readFile(planPath, "utf8"));
  const progress = JSON.parse(await readFile(progressPath, "utf8"));
  plan.batches.push({
    id: "batch-02-evaluation",
    order: 2,
    title: "Evaluation",
    dependsOn: ["batch-01-foundations"],
    modules: ["evaluation"],
  });
  progress.batches.push({
    id: "batch-02-evaluation",
    status: "planned",
    note: null,
    modules: [{ slug: "evaluation", status: "planned", note: null }],
  });
  await Promise.all([
    writeJson(planPath, plan),
    writeJson(progressPath, progress),
    writeFile(
      path.join(fixtureRoot, "app/module-publication.mjs"),
      'export const publishedModuleSlugs = Object.freeze(["rag", "llm", "data-engineering", "evaluation"]);\n',
    ),
  ]);
  stageFixture(fixtureRoot);
  assertSucceeded(
    runProcess("git", ["commit", "-qm", "add evaluation batch"], { cwd: fixtureRoot }),
    "commit third fixture batch",
  );

  await prepareFixture(fixtureRoot);
  advanceModulesToReady(fixtureRoot);
  assertSucceeded(
    runCli(fixtureRoot, ["verify", "batch-01-foundations"]),
    "verify first fixture batch",
  );
  stageFixture(fixtureRoot);
  assertSucceeded(
    runCli(fixtureRoot, ["finish", "batch-01-foundations"]),
    "finish first fixture batch",
  );
  stageFixture(fixtureRoot);
  assertSucceeded(
    runProcess("git", ["commit", "-qm", "complete foundations"], { cwd: fixtureRoot }),
    "commit completed fixture batch",
  );

  assertRejected(
    runCli(fixtureRoot, ["prepare", "batch-02-evaluation"]),
    /batch-01-foundations is complete but not sealed/,
    "prepare before dependency seal",
  );
  assertSucceeded(
    runCli(fixtureRoot, ["seal", "batch-01-foundations"]),
    "seal completed dependency",
  );
  assertSucceeded(
    runCli(fixtureRoot, ["prepare", "batch-02-evaluation"]),
    "prepare after dependency seal",
  );
});

test("seal requires a clean committed completion and never rewrites tracked progress", async (t) => {
  const fixtureRoot = await createFixture(t);
  await prepareFixture(fixtureRoot);
  advanceModulesToReady(fixtureRoot);
  assertSucceeded(
    runCli(fixtureRoot, ["verify", "batch-01-foundations"]),
    "verify fixture batch",
  );
  stageFixture(fixtureRoot);
  assertSucceeded(
    runCli(fixtureRoot, ["finish", "batch-01-foundations"]),
    "finish fixture batch",
  );

  assertRejected(
    runCli(fixtureRoot, ["seal", "batch-01-foundations"]),
    /Git worktree must be clean/,
    "seal with uncommitted progress",
  );

  for (const args of [
    ["add", "knowledge/module-polish/progress.json"],
    ["commit", "-qm", "complete fixture batch"],
  ]) {
    assertSucceeded(runProcess("git", args, { cwd: fixtureRoot }), `git ${args.join(" ")}`);
  }

  const progressPath = path.join(fixtureRoot, "knowledge/module-polish/progress.json");
  const before = await readFile(progressPath, "utf8");
  const sealed = runCli(fixtureRoot, ["seal", "batch-01-foundations"]);
  assertSucceeded(sealed, "seal completed fixture batch");
  assert.match(
    sealed.stdout,
    new RegExp(`batch-01-foundations: sealed at ${gitObjectIdSource}`),
  );
  assert.equal(
    await readFile(progressPath, "utf8"),
    before,
    "seal must leave tracked progress byte-for-byte unchanged",
  );

  const receipt = JSON.parse(
    await readFile(
      path.join(
        fixtureRoot,
        "knowledge/module-polish/.runtime/batch-01-foundations.seal.json",
      ),
      "utf8",
    ),
  );
  assert.equal(receipt.batchId, "batch-01-foundations");
  assert.match(receipt.headSha, gitObjectIdPattern);
  assert.equal(
    runProcess("git", ["status", "--porcelain=v1"], { cwd: fixtureRoot }).stdout,
    "",
    "ignored runtime receipt must not dirty the tracked worktree",
  );
});
