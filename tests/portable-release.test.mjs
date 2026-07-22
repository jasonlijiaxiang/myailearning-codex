import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");
const RELEASE_CHECK = path.join(PROJECT_ROOT, "scripts", "release-check.mjs");
const RUN_VINEXT = path.join(PROJECT_ROOT, "scripts", "run-vinext.mjs");

async function write(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

async function writeJson(file, value) {
  await write(file, `${JSON.stringify(value, null, 2)}\n`);
}

function run(executable, args, { cwd, env } = {}) {
  return spawnSync(executable, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    shell: false,
  });
}

function runGit(cwd, args, options = {}) {
  const result = run("git", args, {
    cwd,
    env: { GIT_TERMINAL_PROMPT: "0", ...options.env },
  });
  if (!options.allowFailure && result.status !== 0) {
    assert.fail(`git ${args.join(" ")} failed:\n${result.stderr}`);
  }
  return result;
}

function releaseConfig(command, {
  sites = false,
  include = [],
  sourceVisibility = "private",
  sitesVisibility = "private",
  handoff = null,
} = {}) {
  return {
    schemaVersion: 1,
    quality: { commands: [command] },
    publishing: {
      sourceRepository: { visibility: sourceVisibility },
      ...(sites ? { sites: { binding: ".openai/hosting.json", visibility: sitesVisibility } } : {}),
    },
    ...(handoff ? { handoff } : {}),
    packaging: { include },
  };
}

async function copyReleaseScript(project) {
  await write(
    path.join(project, "scripts", "release-check.mjs"),
    await fs.readFile(RELEASE_CHECK, "utf8"),
  );
}

async function initializeRepository(project, remote) {
  runGit(project, ["init", "-b", "main"]);
  runGit(project, ["config", "user.name", "Portable Release Test"]);
  runGit(project, ["config", "user.email", "portable-release@example.invalid"]);
  runGit(project, ["config", "commit.gpgsign", "false"]);
  runGit(project, ["add", "."]);
  runGit(project, ["commit", "-m", "fixture"]);
  runGit(path.dirname(remote), ["init", "--bare", remote]);
  runGit(project, ["remote", "add", "origin", remote]);
  runGit(project, ["push", "-u", "origin", "main"]);
  return runGit(project, ["rev-parse", "HEAD"]).stdout.trim();
}

async function createGitFixture({ qualityScript, config, files = {} } = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-release-test-"));
  const project = path.join(root, "project");
  const remote = path.join(root, "remote.git");
  await fs.mkdir(project, { recursive: true });
  await copyReleaseScript(project);
  await writeJson(
    path.join(project, "kb.config.json"),
    config ?? releaseConfig("node scripts/quality.mjs"),
  );
  await write(
    path.join(project, "scripts", "quality.mjs"),
    qualityScript ?? "// successful fixture quality gate\n",
  );
  await write(
    path.join(project, ".gitignore"),
    "/outputs/\n/.openai/hosting.json\n/ignored-input.txt\n/node_modules/\n",
  );
  for (const [relative, content] of Object.entries(files)) {
    await write(path.join(project, relative), content);
  }
  const sha = await initializeRepository(project, remote);
  return { root, project, remote, sha };
}

function runRelease(project, mode, env = {}, audience = null) {
  const args = [path.join(project, "scripts", "release-check.mjs"), "--mode", mode];
  if (audience) args.push("--audience", audience);
  return run(process.execPath, args, {
    cwd: project,
    env,
  });
}

async function removeFixture(root) {
  await fs.rm(root, { recursive: true, force: true });
}

test("local release mode uses configured quality commands without requiring Git", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-release-local-"));
  try {
    const marker = path.join(root, "quality-marker.json");
    await copyReleaseScript(root);
    await writeJson(
      path.join(root, "kb.config.json"),
      releaseConfig("node scripts/quality.mjs --configured-command"),
    );
    await write(
      path.join(root, "scripts", "quality.mjs"),
      [
        'import { writeFileSync } from "node:fs";',
        "writeFileSync(process.env.RELEASE_TEST_MARKER, JSON.stringify({ cwd: process.cwd(), argv: process.argv.slice(2) }));",
        "",
      ].join("\n"),
    );

    const result = runRelease(root, "local", { RELEASE_TEST_MARKER: marker });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Running quality command: node scripts\/quality\.mjs --configured-command/);
    const record = JSON.parse(await fs.readFile(marker, "utf8"));
    assert.equal(record.cwd, await fs.realpath(root));
    assert.deepEqual(record.argv, ["--configured-command"]);
  } finally {
    await removeFixture(root);
  }
});

test("local release mode runs the configured handoff audit with an explicit audience", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-release-handoff-"));
  try {
    const marker = path.join(root, "handoff-marker.json");
    await copyReleaseScript(root);
    await writeJson(path.join(root, "kb.config.json"), {
      ...releaseConfig("node scripts/quality.mjs"),
      handoff: { attachmentPolicy: "knowledge/attachment-distribution.json" },
    });
    await writeJson(path.join(root, "package.json"), {
      name: "portable-release-handoff",
      private: true,
      scripts: {
        "kb:handoff-audit": "node scripts/handoff-audit.mjs",
      },
    });
    await write(
      path.join(root, "scripts", "handoff-audit.mjs"),
      [
        'import { writeFileSync } from "node:fs";',
        "writeFileSync(process.env.HANDOFF_TEST_MARKER, JSON.stringify(process.argv.slice(2)));",
        "",
      ].join("\n"),
    );
    await write(path.join(root, "scripts", "quality.mjs"), "// successful quality gate\n");

    const result = run(
      process.execPath,
      [path.join(root, "scripts", "release-check.mjs"), "--mode", "local", "--audience", "external"],
      { cwd: root, env: { HANDOFF_TEST_MARKER: marker } },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /handoff attachment audit for external distribution/);
    assert.deepEqual(JSON.parse(await fs.readFile(marker, "utf8")), ["--audience", "external"]);
  } finally {
    await removeFixture(root);
  }
});

test("public Git and Sites release surfaces reject an internal audience", async (t) => {
  for (const mode of ["git", "sites"]) {
    await t.test(mode, async () => {
      const fixture = await createGitFixture({
        config: releaseConfig("node scripts/quality.mjs", {
          sites: mode === "sites",
          sourceVisibility: "public",
          sitesVisibility: "public",
        }),
      });
      try {
        const result = runRelease(fixture.project, mode);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /public surface and requires --audience external/);
      } finally {
        await removeFixture(fixture.root);
      }
    });
  }
});

test("public Git external release cannot bypass unknown attachment audit", async () => {
  const packageManifest = {
    name: "public-git-handoff-fixture",
    version: "1.0.0",
    private: true,
    scripts: { "kb:handoff-audit": "node scripts/handoff-audit.mjs" },
  };
  const fixture = await createGitFixture({
    config: releaseConfig("node scripts/quality.mjs", {
      sourceVisibility: "public",
      handoff: { attachmentPolicy: "knowledge/attachment-distribution.json" },
    }),
    files: {
      "package.json": `${JSON.stringify(packageManifest, null, 2)}\n`,
      "package-lock.json": `${JSON.stringify({
        name: packageManifest.name,
        version: packageManifest.version,
        lockfileVersion: 3,
        requires: true,
        packages: {
          "": {
            name: packageManifest.name,
            version: packageManifest.version,
          },
        },
      }, null, 2)}\n`,
      "scripts/handoff-audit.mjs": [
        'if (process.argv.slice(2).join(" ") !== "--audience external") process.exit(9);',
        'console.error("Attachment authorization is unknown for external distribution: external_reference/unknown.pptx");',
        "process.exit(1);",
        "",
      ].join("\n"),
    },
  });
  try {
    const result = runRelease(fixture.project, "git", {}, "external");
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /handoff attachment audit for external distribution/);
    assert.match(result.stderr, /Attachment authorization is unknown for external distribution/);
  } finally {
    await removeFixture(fixture.root);
  }
});

test("git release validates the target commit in an isolated worktree", async () => {
  const qualityScript = [
    'import assert from "node:assert/strict";',
    'import { existsSync, readFileSync, writeFileSync } from "node:fs";',
    'assert.equal(readFileSync("source-skip.txt", "utf8"), "committed skip\\n");',
    'assert.equal(readFileSync("source-assume.txt", "utf8"), "committed assume\\n");',
    'assert.equal(existsSync("ignored-input.txt"), false);',
    "writeFileSync(process.env.RELEASE_TEST_MARKER, JSON.stringify({",
    "  cwd: process.cwd(),",
    "  commit: process.env.KB_RELEASE_COMMIT,",
    "}));",
    "",
  ].join("\n");
  const fixture = await createGitFixture({
    qualityScript,
    config: releaseConfig("node scripts/quality.mjs", {
      include: ["scripts", "source-skip.txt", "source-assume.txt"],
    }),
    files: {
      "source-skip.txt": "committed skip\n",
      "source-assume.txt": "committed assume\n",
    },
  });
  try {
    const marker = path.join(fixture.root, "quality-marker.json");
    runGit(fixture.project, ["update-index", "--skip-worktree", "source-skip.txt"]);
    runGit(fixture.project, ["update-index", "--assume-unchanged", "source-assume.txt"]);
    await write(path.join(fixture.project, "source-skip.txt"), "hidden skip mutation\n");
    await write(path.join(fixture.project, "source-assume.txt"), "hidden assume mutation\n");
    await write(path.join(fixture.project, "ignored-input.txt"), "ignored local mutation\n");
    assert.equal(runGit(fixture.project, ["status", "--porcelain=v1", "--untracked-files=all"]).stdout, "");

    const result = runRelease(fixture.project, "git", { RELEASE_TEST_MARKER: marker });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, new RegExp(`Release checks passed for git mode at ${fixture.sha}`));
    const record = JSON.parse(await fs.readFile(marker, "utf8"));
    assert.equal(record.commit, fixture.sha);
    assert.notEqual(record.cwd, fixture.project);
    assert.match(record.cwd, /kb-release-.*\/source$/);
  } finally {
    await removeFixture(fixture.root);
  }
});

test("git release installs locked dependencies without linking live node_modules", async () => {
  const qualityScript = [
    'import assert from "node:assert/strict";',
    'import { lstatSync, readFileSync } from "node:fs";',
    'assert.equal(lstatSync("node_modules").isSymbolicLink(), false);',
    'assert.equal(readFileSync("node_modules/exact-dependency/index.js", "utf8"), "committed dependency\\n");',
    "",
  ].join("\n");
  const packageManifest = {
    name: "portable-release-fixture",
    version: "1.0.0",
    private: true,
    dependencies: { "exact-dependency": "file:vendor/exact-dependency" },
  };
  const fixture = await createGitFixture({
    qualityScript,
    files: {
      "package.json": `${JSON.stringify(packageManifest, null, 2)}\n`,
      "package-lock.json": `${JSON.stringify({
        name: packageManifest.name,
        version: packageManifest.version,
        lockfileVersion: 3,
        requires: true,
        packages: {
          "": {
            name: packageManifest.name,
            version: packageManifest.version,
            dependencies: packageManifest.dependencies,
          },
          "node_modules/exact-dependency": {
            resolved: "vendor/exact-dependency",
            link: true,
          },
          "vendor/exact-dependency": {
            version: "1.0.0",
          },
        },
      }, null, 2)}\n`,
      "vendor/exact-dependency/package.json": `${JSON.stringify({
        name: "exact-dependency",
        version: "1.0.0",
        main: "index.js",
      }, null, 2)}\n`,
      "vendor/exact-dependency/index.js": "committed dependency\n",
    },
  });
  try {
    await write(
      path.join(fixture.project, "node_modules", "exact-dependency", "index.js"),
      "tampered live dependency\n",
    );
    assert.equal(runGit(fixture.project, ["status", "--porcelain=v1", "--untracked-files=all"]).stdout, "");

    const result = runRelease(fixture.project, "git");
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Installing dependencies from the exact-commit package lock/);
    assert.equal(
      await fs.readFile(
        path.join(fixture.project, "node_modules", "exact-dependency", "index.js"),
        "utf8",
      ),
      "tampered live dependency\n",
    );
  } finally {
    await removeFixture(fixture.root);
  }
});

test("git release rejects tracked dirt and untracked files", async (t) => {
  await t.test("tracked dirt", async () => {
    const fixture = await createGitFixture({ files: { "tracked.txt": "clean\n" } });
    try {
      await write(path.join(fixture.project, "tracked.txt"), "dirty\n");
      const result = runRelease(fixture.project, "git");
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /requires a clean Git worktree/);
    } finally {
      await removeFixture(fixture.root);
    }
  });

  await t.test("untracked file", async () => {
    const fixture = await createGitFixture();
    try {
      await write(path.join(fixture.project, "unexpected.txt"), "untracked\n");
      const result = runRelease(fixture.project, "git");
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /requires a clean Git worktree/);
    } finally {
      await removeFixture(fixture.root);
    }
  });
});

test("git release rejects a project nested under a different Git top level", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-release-nested-"));
  try {
    const outer = path.join(root, "outer");
    const project = path.join(outer, "nested-project");
    const remote = path.join(root, "remote.git");
    await fs.mkdir(project, { recursive: true });
    await copyReleaseScript(project);
    await writeJson(path.join(project, "kb.config.json"), releaseConfig("node scripts/quality.mjs"));
    await write(path.join(project, "scripts", "quality.mjs"), "// must not run\n");
    await initializeRepository(outer, remote);

    const result = runRelease(project, "git");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /requires the project directory to be the Git top level/);
  } finally {
    await removeFixture(root);
  }
});

test("git release fails closed when the live upstream is unavailable", async () => {
  const fixture = await createGitFixture();
  try {
    await fs.rm(fixture.remote, { recursive: true, force: true });
    const result = runRelease(fixture.project, "git");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /could not verify the live upstream branch/);
  } finally {
    await removeFixture(fixture.root);
  }
});

test("git release rechecks the live upstream after quality validation", async () => {
  const qualityScript = [
    'import { spawnSync } from "node:child_process";',
    "const pushed = spawnSync(\"git\", [\"push\", \"--force\", process.env.RELEASE_TEST_REMOTE, `${process.env.RELEASE_TEST_DRIFT_SHA}:refs/heads/main`], { encoding: \"utf8\" });",
    "if (pushed.status !== 0) throw new Error(pushed.stderr);",
    "",
  ].join("\n");
  const fixture = await createGitFixture({ qualityScript });
  try {
    const tree = runGit(fixture.project, ["rev-parse", "HEAD^{tree}"]).stdout.trim();
    const driftSha = runGit(
      fixture.project,
      ["commit-tree", tree, "-p", fixture.sha, "-m", "remote drift"],
    ).stdout.trim();
    const result = runRelease(fixture.project, "git", {
      RELEASE_TEST_REMOTE: fixture.remote,
      RELEASE_TEST_DRIFT_SHA: driftSha,
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /live upstream and local HEAD to match exactly/);
  } finally {
    await removeFixture(fixture.root);
  }
});

test("sites release rejects placeholder and malformed project IDs", async () => {
  const fixture = await createGitFixture({
    config: releaseConfig("node scripts/quality.mjs", { sites: true }),
  });
  try {
    for (const projectId of ["replace-after-sites-binding", "appgprj_123", ""]) {
      await writeJson(path.join(fixture.project, ".openai", "hosting.json"), {
        project_id: projectId,
        d1: null,
        r2: null,
      });
      const result = runRelease(fixture.project, "sites");
      assert.notEqual(result.status, 0, `unexpected success for ${JSON.stringify(projectId)}`);
      assert.match(result.stderr, /requires a valid bound project_id/);
    }
  } finally {
    await removeFixture(fixture.root);
  }
});

test("sites release exports an exact-commit build with the verified binding", async () => {
  const qualityScript = [
    'import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";',
    'mkdirSync("dist/server", { recursive: true });',
    'mkdirSync("dist/.openai", { recursive: true });',
    'writeFileSync("dist/server/index.js", `export const commit = "${process.env.KB_RELEASE_COMMIT}";\\n`);',
    'copyFileSync(".openai/hosting.json", "dist/.openai/hosting.json");',
    "",
  ].join("\n");
  const fixture = await createGitFixture({
    qualityScript,
    config: releaseConfig("node scripts/quality.mjs", { sites: true }),
  });
  try {
    const binding = {
      project_id: "appgprj_0123456789abcdef0123456789abcdef",
      d1: null,
      r2: null,
    };
    await writeJson(path.join(fixture.project, ".openai", "hosting.json"), binding);
    const result = runRelease(fixture.project, "sites");
    assert.equal(result.status, 0, result.stderr);

    const artifact = path.join(await fs.realpath(fixture.project), "outputs", "release", fixture.sha);
    assert.match(result.stdout, new RegExp(`Exact Sites artifact root: ${artifact}`));
    assert.equal(
      await fs.readFile(path.join(artifact, "dist", "server", "index.js"), "utf8"),
      `export const commit = "${fixture.sha}";\n`,
    );
    assert.deepEqual(
      JSON.parse(await fs.readFile(path.join(artifact, ".openai", "hosting.json"), "utf8")),
      binding,
    );
    assert.deepEqual(
      JSON.parse(await fs.readFile(path.join(artifact, "dist", ".openai", "hosting.json"), "utf8")),
      binding,
    );
    const metadata = JSON.parse(await fs.readFile(path.join(artifact, "release.json"), "utf8"));
    assert.equal(metadata.commitSha, fixture.sha);
    assert.equal(metadata.upstream.sha, fixture.sha);
    assert.equal(metadata.projectId, binding.project_id);
    assert.equal(metadata.bindingSource, "release-environment");
    assert.equal(metadata.attachmentAudit.summary.total, 0);
  } finally {
    await removeFixture(fixture.root);
  }
});

test("public Sites audits the staged artifact instead of blocking on omitted source attachments", async () => {
  const qualityScript = [
    'import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";',
    'mkdirSync("dist/server", { recursive: true });',
    'mkdirSync("dist/.openai", { recursive: true });',
    'writeFileSync("dist/server/index.js", "export {};\\n");',
    'copyFileSync(".openai/hosting.json", "dist/.openai/hosting.json");',
    'if (process.env.RELEASE_TEST_COPY_ATTACHMENT === "1") {',
    '  mkdirSync("dist/downloads", { recursive: true });',
    '  copyFileSync("external_reference/unknown.pptx", "dist/downloads/unknown.pptx");',
    '}',
    "",
  ].join("\n");
  const fixture = await createGitFixture({
    qualityScript,
    config: releaseConfig("node scripts/quality.mjs", {
      sites: true,
      sourceVisibility: "public",
      sitesVisibility: "public",
      include: ["external_reference", "knowledge/attachment-distribution.json"],
      handoff: {
        attachmentRoots: ["external_reference"],
        attachmentPolicy: "knowledge/attachment-distribution.json",
      },
    }),
    files: {
      "external_reference/unknown.pptx": "UNKNOWN ATTACHMENT\n",
      "knowledge/attachment-distribution.json": `${JSON.stringify({
        $schema: "./schemas/attachment-distribution.schema.json",
        schemaVersion: 2,
        items: [],
      }, null, 2)}\n`,
    },
  });
  try {
    await writeJson(path.join(fixture.project, ".openai", "hosting.json"), {
      project_id: "appgprj_cccccccccccccccccccccccccccccccc",
      d1: null,
      r2: null,
    });

    let result = runRelease(fixture.project, "sites", {}, "external");
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Sites artifact attachment audit found 0 distributed attachment/);
    const artifact = path.join(fixture.project, "outputs", "release", fixture.sha);
    const metadata = JSON.parse(await fs.readFile(path.join(artifact, "release.json"), "utf8"));
    assert.equal(metadata.distributionAudience, "external");
    assert.equal(metadata.attachmentAudit.summary.total, 0);

    result = runRelease(
      fixture.project,
      "sites",
      { RELEASE_TEST_COPY_ATTACHMENT: "1" },
      "external",
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Sites artifact attachment authorization is unknown/);
  } finally {
    await removeFixture(fixture.root);
  }
});

test("sites release uses committed binding bytes despite a hidden live-worktree mutation", async () => {
  const qualityScript = [
    'import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";',
    'mkdirSync("dist/server", { recursive: true });',
    'mkdirSync("dist/.openai", { recursive: true });',
    'writeFileSync("dist/server/index.js", "export {};\\n");',
    'copyFileSync(".openai/hosting.json", "dist/.openai/hosting.json");',
    "",
  ].join("\n");
  const fixture = await createGitFixture({
    qualityScript,
    config: releaseConfig("node scripts/quality.mjs", { sites: true }),
  });
  try {
    const committedBinding = {
      project_id: "appgprj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      d1: null,
      r2: null,
    };
    await writeJson(path.join(fixture.project, ".openai", "hosting.json"), committedBinding);
    runGit(fixture.project, ["add", "-f", ".openai/hosting.json"]);
    runGit(fixture.project, ["commit", "-m", "track hosting binding"]);
    runGit(fixture.project, ["push", "origin", "main"]);
    const releaseSha = runGit(fixture.project, ["rev-parse", "HEAD"]).stdout.trim();

    runGit(fixture.project, ["update-index", "--skip-worktree", ".openai/hosting.json"]);
    await writeJson(path.join(fixture.project, ".openai", "hosting.json"), {
      project_id: "replace-hidden-live-binding",
      d1: null,
      r2: null,
    });
    assert.equal(runGit(fixture.project, ["status", "--porcelain=v1", "--untracked-files=all"]).stdout, "");

    const result = runRelease(fixture.project, "sites");
    assert.equal(result.status, 0, result.stderr);
    const artifact = path.join(
      await fs.realpath(fixture.project),
      "outputs",
      "release",
      releaseSha,
    );
    assert.deepEqual(
      JSON.parse(await fs.readFile(path.join(artifact, ".openai", "hosting.json"), "utf8")),
      committedBinding,
    );
    assert.deepEqual(
      JSON.parse(await fs.readFile(path.join(artifact, "dist", ".openai", "hosting.json"), "utf8")),
      committedBinding,
    );
    const metadata = JSON.parse(await fs.readFile(path.join(artifact, "release.json"), "utf8"));
    assert.equal(metadata.commitSha, releaseSha);
    assert.equal(metadata.bindingSource, "commit");
  } finally {
    await removeFixture(fixture.root);
  }
});

test("sites release removes staged output when the post-build upstream check fails", async () => {
  const qualityScript = [
    'import { spawnSync } from "node:child_process";',
    'import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";',
    'mkdirSync("dist/server", { recursive: true });',
    'mkdirSync("dist/.openai", { recursive: true });',
    'writeFileSync("dist/server/index.js", "export {};\\n");',
    'copyFileSync(".openai/hosting.json", "dist/.openai/hosting.json");',
    "const pushed = spawnSync(\"git\", [\"push\", \"--force\", process.env.RELEASE_TEST_REMOTE, `${process.env.RELEASE_TEST_DRIFT_SHA}:refs/heads/main`], { encoding: \"utf8\" });",
    "if (pushed.status !== 0) throw new Error(pushed.stderr);",
    "",
  ].join("\n");
  const fixture = await createGitFixture({
    qualityScript,
    config: releaseConfig("node scripts/quality.mjs", { sites: true }),
  });
  try {
    await writeJson(path.join(fixture.project, ".openai", "hosting.json"), {
      project_id: "appgprj_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      d1: null,
      r2: null,
    });
    const tree = runGit(fixture.project, ["rev-parse", "HEAD^{tree}"]).stdout.trim();
    const driftSha = runGit(
      fixture.project,
      ["commit-tree", tree, "-p", fixture.sha, "-m", "sites remote drift"],
    ).stdout.trim();
    const result = runRelease(fixture.project, "sites", {
      RELEASE_TEST_REMOTE: fixture.remote,
      RELEASE_TEST_DRIFT_SHA: driftSha,
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /live upstream and local HEAD to match exactly/);
    assert.deepEqual(
      await fs.readdir(path.join(fixture.project, "outputs", "release")),
      [],
    );
  } finally {
    await removeFixture(fixture.root);
  }
});

test("run-vinext resolves the package-declared binary and forwards CLI arguments", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-vinext-argv-"));
  try {
    const marker = path.join(root, "argv.json");
    await write(path.join(root, "scripts", "run-vinext.mjs"), await fs.readFile(RUN_VINEXT, "utf8"));
    await writeJson(path.join(root, "node_modules", "vinext", "package.json"), {
      name: "vinext",
      type: "module",
      exports: { ".": "./dist/index.js" },
      bin: { vinext: "tools/custom-cli.mjs" },
    });
    await write(path.join(root, "node_modules", "vinext", "dist", "index.js"), "export {};\n");
    await write(
      path.join(root, "node_modules", "vinext", "tools", "custom-cli.mjs"),
      [
        'import { writeFileSync } from "node:fs";',
        "writeFileSync(process.env.VINEXT_ARGV_MARKER, JSON.stringify(process.argv.slice(2)));",
        "",
      ].join("\n"),
    );

    const result = run(
      process.execPath,
      [
        path.join(root, "scripts", "run-vinext.mjs"),
        "dev",
        "--host",
        "127.0.0.1",
        "--port",
        "4123",
      ],
      { cwd: root, env: { VINEXT_ARGV_MARKER: marker } },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(
      JSON.parse(await fs.readFile(marker, "utf8")),
      ["dev", "--host", "127.0.0.1", "--port", "4123"],
    );
  } finally {
    await removeFixture(root);
  }
});
