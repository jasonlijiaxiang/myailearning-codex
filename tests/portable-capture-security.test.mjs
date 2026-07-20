import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");
const SCRIPT_ROOT = path.join(
  PROJECT_ROOT,
  ".agents/skills/curate-portable-knowledge-base/scripts",
);
const CAPTURE_SCRIPT = path.join(SCRIPT_ROOT, "capture-turn.mjs");
const PRIVATE_RUNTIME = path.join(SCRIPT_ROOT, "private-runtime.mjs");

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function configureRoot(root, { storeRawTranscript = false } = {}) {
  await writeJson(path.join(root, "kb.config.json"), {
    schemaVersion: 1,
    capture: {
      privateInbox: "knowledge/private-inbox",
      storeRawTranscript,
      maxTranscriptBytes: 1024 * 1024,
      maxCaptureBytesPerEvent: 1024 * 1024,
      rawRetentionDays: 14,
    },
  });
}

async function copyCaptureScripts(root) {
  const destination = path.join(
    root,
    ".agents/skills/curate-portable-knowledge-base/scripts",
  );
  await fs.mkdir(destination, { recursive: true });
  for (const file of [
    "capture-turn.mjs",
    "private-runtime.mjs",
    "hook-bootstrap.mjs",
    "kb-tool.mjs",
  ]) {
    await fs.copyFile(path.join(SCRIPT_ROOT, file), path.join(destination, file));
  }
}

async function copyHookConfig(root) {
  await fs.mkdir(path.join(root, ".codex"), { recursive: true });
  await fs.copyFile(
    path.join(PROJECT_ROOT, ".codex/hooks.json"),
    path.join(root, ".codex/hooks.json"),
  );
}

function runNode(script, { cwd, env = {}, input = "" } = {}) {
  return spawnSync(process.execPath, [script], {
    cwd,
    env: { ...process.env, ...env },
    input,
    encoding: "utf8",
    shell: false,
  });
}

function runNodeAsync(script, { cwd, env = {}, input = "" } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      cwd,
      env: { ...process.env, ...env },
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("exit", (status) => resolve({ status, stdout, stderr }));
    child.stdin.end(input);
  });
}

function runHook(command, { cwd, input, env = {} }) {
  return spawnSync(command, {
    cwd,
    env: { ...process.env, NODE_ENV: "", PORTABLE_KB_TEST_ROOT: "", ...env },
    input,
    encoding: "utf8",
    shell: true,
  });
}

async function filesBelow(directory, suffix = null) {
  const output = [];
  async function visit(current) {
    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(child);
      if (entry.isFile() && (!suffix || entry.name.endsWith(suffix))) output.push(child);
    }
  }
  await visit(directory);
  return output;
}

function captureEnv(root, extra = {}) {
  return {
    NODE_ENV: "test",
    PORTABLE_KB_TEST_ROOT: root,
    ...extra,
  };
}

function captureEvent(root, overrides = {}) {
  return {
    hook_event_name: "UserPromptSubmit",
    session_id: "security-session",
    turn_id: "security-turn",
    cwd: root,
    prompt: "private security test prompt",
    ...overrides,
  };
}

function sessionKey(rawSession) {
  return `s_${createHash("sha256")
    .update(`codex-session\0${rawSession}`)
    .digest("hex")
    .slice(0, 32)}`;
}

test("capture and retention reject linked runtime descendants without touching outside files", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-capture-link-"));
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), "portable-capture-outside-"));
  const retentionRoot = await fs.mkdtemp(path.join(os.tmpdir(), "portable-retention-link-"));
  const retentionOutside = await fs.mkdtemp(path.join(os.tmpdir(), "portable-retention-outside-"));
  try {
    await configureRoot(root);
    const runtime = path.join(root, "knowledge/private-inbox/.runtime");
    await fs.mkdir(runtime, { recursive: true });
    try {
      await fs.symlink(outside, path.join(runtime, "user-messages"), "junction");
    } catch (error) {
      if (["EPERM", "EACCES", "ENOTSUP"].includes(error?.code)) {
        context.skip(`symlinks unavailable: ${error.code}`);
        return;
      }
      throw error;
    }

    const capture = runNode(CAPTURE_SCRIPT, {
      cwd: root,
      env: captureEnv(root),
      input: JSON.stringify(captureEvent(root)),
    });
    assert.equal(capture.status, 0, capture.stderr);
    assert.equal(capture.stdout.trim(), '{"continue":true}');
    assert.deepEqual(await fs.readdir(outside), []);

    const retentionRuntime = path.join(retentionRoot, "knowledge/private-inbox/.runtime");
    const linkedPayload = path.join(retentionRuntime, "assistant-messages");
    await fs.mkdir(path.join(retentionRuntime, "captures"), { recursive: true });
    await fs.symlink(retentionOutside, linkedPayload, "junction");
    const victim = path.join(retentionOutside, "victim.txt");
    await fs.writeFile(victim, "outside-must-survive");
    const old = "2000-01-01T00:00:00.000Z";
    await writeJson(path.join(retentionRuntime, "captures", "capture.json"), {
      captureId: `cap_${"a".repeat(32)}`,
      sessionKey: `s_${"b".repeat(32)}`,
      turnKey: `t_${"c".repeat(32)}`,
      firstCapturedAt: old,
      updatedAt: old,
      messages: {
        assistant: {
          status: "captured",
          path: "assistant-messages/victim.txt",
          bytes: 20,
          sha256: "outside",
        },
      },
      transcript: { status: "unavailable", deltas: [] },
      curation: {
        status: "processed",
        result: "candidate:verified",
        resultVerifiedAt: old,
        updatedAt: old,
      },
    });
    const { pruneExpiredCaptures } = await import(pathToFileURL(PRIVATE_RUNTIME).href);
    await assert.rejects(
      pruneExpiredCaptures({
        runtime: retentionRuntime,
        retentionDays: 14,
        now: Date.parse("2026-07-21T00:00:00.000Z"),
        force: true,
        verifyProcessed: async () => true,
      }),
      (error) => error?.code === "UNSAFE_PRIVATE_PATH",
    );
    assert.equal(await fs.readFile(victim, "utf8"), "outside-must-survive");
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
    await fs.rm(retentionRoot, { recursive: true, force: true });
    await fs.rm(retentionOutside, { recursive: true, force: true });
  }
});

test("processed retention defers without live result verification and purges only after a true callback", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-retention-verified-"));
  try {
    const runtime = path.join(root, "knowledge/private-inbox/.runtime");
    const session = `s_${"1".repeat(32)}`;
    const turn = `t_${"2".repeat(32)}`;
    const payload = path.join(runtime, "user-messages", session, `${turn}.txt`);
    const capture = path.join(runtime, "captures", session, `${turn}.json`);
    await fs.mkdir(path.dirname(payload), { recursive: true });
    await fs.writeFile(payload, "verified-before-delete");
    const old = "2000-01-01T00:00:00.000Z";
    await writeJson(capture, {
      captureId: `cap_${"3".repeat(32)}`,
      sessionKey: session,
      turnKey: turn,
      firstCapturedAt: old,
      updatedAt: old,
      messages: {
        user: {
          status: "captured",
          path: path.relative(runtime, payload),
          bytes: 22,
          sha256: "verified",
        },
      },
      transcript: { status: "unavailable", deltas: [] },
      curation: {
        status: "processed",
        result: "candidate:live-result",
        resultVerifiedAt: old,
        updatedAt: old,
      },
    });
    const { pruneExpiredCaptures } = await import(pathToFileURL(PRIVATE_RUNTIME).href);
    const options = {
      runtime,
      retentionDays: 14,
      now: Date.parse("2026-07-21T00:00:00.000Z"),
      force: true,
    };
    const deferred = await pruneExpiredCaptures(options);
    assert.equal(deferred.deferredProcessed, 1);
    assert.equal(await fs.readFile(payload, "utf8"), "verified-before-delete");
    const rejected = await pruneExpiredCaptures({ ...options, verifyProcessed: async () => false });
    assert.equal(rejected.overdueUnresolved, 1);
    assert.equal(await fs.readFile(payload, "utf8"), "verified-before-delete");
    const purged = await pruneExpiredCaptures({ ...options, verifyProcessed: async () => true });
    assert.equal(purged.purgedCaptures, 1);
    await assert.rejects(fs.access(payload));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("retention never deletes a payload owned or referenced by another capture", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-retention-ownership-"));
  try {
    const runtime = path.join(root, "knowledge/private-inbox/.runtime");
    const processedSession = `s_${"4".repeat(32)}`;
    const processedTurn = `t_${"5".repeat(32)}`;
    const pendingSession = `s_${"6".repeat(32)}`;
    const pendingTurn = `t_${"7".repeat(32)}`;
    const pendingPayload = path.join(
      runtime,
      "user-messages",
      pendingSession,
      `${pendingTurn}.txt`,
    );
    await fs.mkdir(path.dirname(pendingPayload), { recursive: true });
    await fs.writeFile(pendingPayload, "pending-payload-must-survive");
    const old = "2000-01-01T00:00:00.000Z";
    const record = {
      status: "captured",
      path: path.relative(runtime, pendingPayload),
      bytes: 28,
      sha256: "shared",
    };
    await writeJson(
      path.join(runtime, "captures", processedSession, `${processedTurn}.json`),
      {
        captureId: `cap_${"8".repeat(32)}`,
        sessionKey: processedSession,
        turnKey: processedTurn,
        firstCapturedAt: old,
        updatedAt: old,
        messages: { user: record },
        transcript: { status: "unavailable", deltas: [] },
        curation: {
          status: "processed",
          result: "candidate:verified-owner",
          resultVerifiedAt: old,
          updatedAt: old,
        },
      },
    );
    await writeJson(
      path.join(runtime, "captures", pendingSession, `${pendingTurn}.json`),
      {
        captureId: `cap_${"9".repeat(32)}`,
        sessionKey: pendingSession,
        turnKey: pendingTurn,
        firstCapturedAt: old,
        updatedAt: old,
        messages: { user: record },
        transcript: { status: "unavailable", deltas: [] },
        curation: { status: "pending", result: null, reason: null, resultVerifiedAt: null },
      },
    );
    const { pruneExpiredCaptures } = await import(pathToFileURL(PRIVATE_RUNTIME).href);
    const result = await pruneExpiredCaptures({
      runtime,
      retentionDays: 14,
      now: Date.parse("2026-07-21T00:00:00.000Z"),
      force: true,
      verifyProcessed: async () => true,
    });
    assert.equal(result.purgedCaptures, 0);
    assert.ok(result.skippedInvalid >= 1);
    assert.equal(await fs.readFile(pendingPayload, "utf8"), "pending-payload-must-survive");
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("hook ignores shadow markers, rejects nested Git capture, and safely no-ops in a Git-less subdirectory", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-hook-root-"));
  const noGitRoot = await fs.mkdtemp(path.join(os.tmpdir(), "portable-hook-nogit-"));
  try {
    await configureRoot(root);
    await copyCaptureScripts(root);
    await copyHookConfig(root);
    const git = spawnSync("git", ["init", "-q", root], { encoding: "utf8", shell: false });
    assert.equal(git.status, 0, git.stderr);
    const nested = path.join(root, "nested/deeper");
    await fs.mkdir(nested, { recursive: true });
    await writeJson(path.join(root, "nested/kb.config.json"), { schemaVersion: 1 });
    const shadowScript = path.join(
      root,
      "nested/.agents/skills/curate-portable-knowledge-base/scripts/capture-turn.mjs",
    );
    await fs.mkdir(path.dirname(shadowScript), { recursive: true });
    await fs.writeFile(
      shadowScript,
      "await import('node:fs/promises').then((fs) => fs.writeFile(new URL('./shadow-ran', import.meta.url), 'bad'));\n",
    );
    await fs.writeFile(
      path.join(path.dirname(shadowScript), "hook-bootstrap.mjs"),
      "await import('./capture-turn.mjs');\n",
    );
    await fs.mkdir(path.join(root, "nested/.codex"), { recursive: true });
    await fs.copyFile(
      path.join(PROJECT_ROOT, ".codex/hooks.json"),
      path.join(root, "nested/.codex/hooks.json"),
    );
    const hooks = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, ".codex/hooks.json"), "utf8"));
    const command = hooks.hooks.UserPromptSubmit[0].hooks[0][
      process.platform === "win32" ? "commandWindows" : "command"
    ];
    const event = captureEvent(nested, { session_id: "git-root", turn_id: "git-root-turn" });
    const result = runHook(command, { cwd: nested, input: JSON.stringify(event) });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), '{"continue":true}');
    assert.equal((await filesBelow(path.join(root, "knowledge/private-inbox/.runtime/captures"), ".json")).length, 1, result.stderr);
    await assert.rejects(fs.access(path.join(path.dirname(shadowScript), "shadow-ran")));

    const nestedGit = spawnSync("git", ["init", "-q", path.join(root, "nested")], {
      encoding: "utf8",
      shell: false,
    });
    assert.equal(nestedGit.status, 0, nestedGit.stderr);
    const nestedGitResult = runHook(command, {
      cwd: nested,
      input: JSON.stringify(captureEvent(nested, {
        session_id: "nested-git",
        turn_id: "nested-git-turn",
      })),
    });
    assert.equal(nestedGitResult.status, 0, nestedGitResult.stderr);
    assert.equal(nestedGitResult.stdout.trim(), '{"continue":true}');
    assert.equal((await filesBelow(path.join(root, "knowledge/private-inbox/.runtime/captures"), ".json")).length, 1);
    await assert.rejects(fs.access(path.join(path.dirname(shadowScript), "shadow-ran")));

    await configureRoot(noGitRoot);
    await copyCaptureScripts(noGitRoot);
    await copyHookConfig(noGitRoot);
    const noGitNested = path.join(noGitRoot, "nested");
    await fs.mkdir(noGitNested);
    const noGit = runHook(command, {
      cwd: noGitNested,
      input: JSON.stringify(captureEvent(noGitNested, { session_id: "no-git" })),
    });
    assert.equal(noGit.status, 0, noGit.stderr);
    assert.equal(noGit.stdout.trim(), '{"continue":true}');
    assert.equal((await filesBelow(path.join(noGitRoot, "knowledge/private-inbox/.runtime/captures"))).length, 0);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(noGitRoot, { recursive: true, force: true });
  }
});

test("hook bootstrap and capture imports fail open with the exact continue response", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-hook-fail-open-"));
  try {
    await configureRoot(root);
    await copyCaptureScripts(root);
    await copyHookConfig(root);
    const bootstrap = path.join(
      root,
      ".agents/skills/curate-portable-knowledge-base/scripts/hook-bootstrap.mjs",
    );
    await fs.writeFile(bootstrap, "this is not valid JavaScript !!!\n");
    const hooks = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, ".codex/hooks.json"), "utf8"));
    const command = hooks.hooks.Stop[0].hooks[0][
      process.platform === "win32" ? "commandWindows" : "command"
    ];
    const syntaxFailure = runHook(command, {
      cwd: root,
      input: JSON.stringify(captureEvent(root, { hook_event_name: "Stop" })),
    });
    assert.equal(syntaxFailure.status, 0, syntaxFailure.stderr);
    assert.equal(syntaxFailure.stdout, '{"continue":true}\n');

    await fs.copyFile(path.join(SCRIPT_ROOT, "hook-bootstrap.mjs"), bootstrap);
    await fs.writeFile(
      path.join(path.dirname(bootstrap), "capture-turn.mjs"),
      "this is not valid JavaScript !!!\n",
    );
    const importFailure = runHook(command, {
      cwd: root,
      input: JSON.stringify(captureEvent(root, { hook_event_name: "Stop" })),
    });
    assert.equal(importFailure.status, 0, importFailure.stderr);
    assert.equal(importFailure.stdout, '{"continue":true}\n');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("hook loader rejects a linked script ancestor before external JavaScript can execute", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-hook-linked-ancestor-"));
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), "portable-hook-linked-code-"));
  try {
    await configureRoot(root);
    await copyHookConfig(root);
    const externalBootstrap = path.join(
      outside,
      "skills/curate-portable-knowledge-base/scripts/hook-bootstrap.mjs",
    );
    await fs.mkdir(path.dirname(externalBootstrap), { recursive: true });
    await fs.writeFile(
      externalBootstrap,
      "await import('node:fs/promises').then((fs) => fs.writeFile(new URL('./executed', import.meta.url), 'bad'));\n",
    );
    try {
      await fs.symlink(outside, path.join(root, ".agents"), "junction");
    } catch (error) {
      if (["EPERM", "EACCES", "ENOTSUP"].includes(error?.code)) {
        context.skip(`symlinks unavailable: ${error.code}`);
        return;
      }
      throw error;
    }
    const hooks = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, ".codex/hooks.json"), "utf8"));
    const command = hooks.hooks.UserPromptSubmit[0].hooks[0][
      process.platform === "win32" ? "commandWindows" : "command"
    ];
    const result = runHook(command, {
      cwd: root,
      input: JSON.stringify(captureEvent(root)),
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '{"continue":true}\n');
    await assert.rejects(fs.access(path.join(path.dirname(externalBootstrap), "executed")));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  }
});

test("hook loader fails open when Git reports a path that cannot be resolved", async (context) => {
  if (process.platform === "win32") {
    context.skip("POSIX fake-git executable test");
    return;
  }
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-hook-fake-git-"));
  try {
    const bin = path.join(root, "bin");
    const fakeGit = path.join(bin, "git");
    await fs.mkdir(bin);
    await fs.writeFile(fakeGit, "#!/bin/sh\nprintf '%s\\n' '/path/that/does/not/exist'\n");
    await fs.chmod(fakeGit, 0o755);
    const hooks = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, ".codex/hooks.json"), "utf8"));
    const command = hooks.hooks.UserPromptSubmit[0].hooks[0].command;
    const result = runHook(command, {
      cwd: root,
      env: { PATH: `${bin}${path.delimiter}${process.env.PATH}` },
      input: JSON.stringify(captureEvent(root)),
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '{"continue":true}\n');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("raw transcript capture only accepts no-follow JSONL files in Codex session scopes", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-transcript-scope-"));
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), "portable-transcript-outside-"));
  try {
    await configureRoot(root, { storeRawTranscript: true });
    const codexHome = path.join(root, "codex-home");
    const allowed = path.join(codexHome, "sessions/2026/allowed.jsonl");
    await fs.mkdir(path.dirname(allowed), { recursive: true });
    await fs.mkdir(path.join(codexHome, "archived_sessions"), { recursive: true });
    await fs.writeFile(allowed, '{"session":"allowed"}\n');
    await fs.writeFile(path.join(codexHome, "auth.json"), "ordinary-config");
    await fs.writeFile(path.join(codexHome, "models.jsonl"), "not-a-session");
    const env = captureEnv(root, { CODEX_HOME: codexHome });

    const events = [
      ["allowed", allowed],
      ["ordinary-config", path.join(codexHome, "auth.json")],
      ["root-jsonl", path.join(codexHome, "models.jsonl")],
      ["root-directory", codexHome],
    ];
    const outsideTranscript = path.join(outside, "outside.jsonl");
    await fs.writeFile(outsideTranscript, "outside-transcript");
    const linked = path.join(codexHome, "sessions/linked.jsonl");
    try {
      await fs.symlink(outsideTranscript, linked);
      events.push(["linked", linked]);
    } catch (error) {
      if (!["EPERM", "EACCES", "ENOTSUP"].includes(error?.code)) throw error;
      context.diagnostic(`symlink transcript case skipped: ${error.code}`);
    }

    for (const [turn, transcriptPath] of events) {
      const common = { session_id: "transcript-session", turn_id: turn };
      const prompt = runNode(CAPTURE_SCRIPT, {
        cwd: root,
        env,
        input: JSON.stringify(captureEvent(root, { ...common, prompt: `prompt-${turn}` })),
      });
      assert.equal(prompt.status, 0, prompt.stderr);
      const stop = runNode(CAPTURE_SCRIPT, {
        cwd: root,
        env,
        input: JSON.stringify(captureEvent(root, {
          ...common,
          hook_event_name: "Stop",
          transcript_path: transcriptPath,
          last_assistant_message: `answer-${turn}`,
        })),
      });
      assert.equal(stop.status, 0, stop.stderr);
      assert.equal(stop.stdout.trim(), '{"continue":true}');
    }

    const runtime = path.join(root, "knowledge/private-inbox/.runtime");
    const captures = await filesBelow(path.join(runtime, "captures"), ".json");
    const envelopes = await Promise.all(captures.map(async (file) => JSON.parse(await fs.readFile(file, "utf8"))));
    const accepted = envelopes.find((item) => item.messages?.user?.sha256
      && item.transcript?.status === "captured");
    assert.ok(accepted, JSON.stringify(envelopes, null, 2));
    assert.equal(accepted.transcript.deltas.length, 1);
    const rejected = envelopes.filter((item) => item.transcript?.status === "rejected-path");
    assert.equal(rejected.length, events.length - 1);
    assert.equal((await filesBelow(path.join(runtime, "transcript-deltas"))).length, 1);
    assert.ok(!(await fs.readFile(path.join(runtime, accepted.transcript.deltas[0].path))).includes("outside-transcript"));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  }
});

test("turn correlation keeps consecutive identical turn content separate without hook turn IDs", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-turn-correlation-"));
  try {
    await configureRoot(root);
    const env = captureEnv(root);
    for (let index = 0; index < 2; index += 1) {
      const prompt = captureEvent(root, {
        session_id: "same-content-session",
        prompt: "identical prompt",
      });
      delete prompt.turn_id;
      const stop = captureEvent(root, {
        hook_event_name: "Stop",
        session_id: "same-content-session",
        last_assistant_message: "identical answer",
      });
      delete stop.turn_id;
      const promptResult = runNode(CAPTURE_SCRIPT, {
        cwd: root,
        env,
        input: JSON.stringify(prompt),
      });
      const stopResult = runNode(CAPTURE_SCRIPT, {
        cwd: root,
        env,
        input: JSON.stringify(stop),
      });
      assert.equal(promptResult.status, 0, promptResult.stderr);
      assert.equal(stopResult.status, 0, stopResult.stderr);
    }
    const captureFiles = await filesBelow(
      path.join(root, "knowledge/private-inbox/.runtime/captures"),
      ".json",
    );
    assert.equal(captureFiles.length, 2);
    const captures = await Promise.all(
      captureFiles.map(async (file) => JSON.parse(await fs.readFile(file, "utf8"))),
    );
    assert.deepEqual(captures.map((capture) => capture.completeness).sort(), [
      "visible-messages",
      "visible-messages",
    ]);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("capture serialization, stale-lock recovery, active-lock protection, and retention locking are deterministic", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-capture-locks-"));
  try {
    await configureRoot(root);
    const env = captureEnv(root);
    const common = captureEvent(root, { session_id: "concurrent", turn_id: "same-turn" });
    const promptWithoutTurnId = { ...common, prompt: "same prompt" };
    delete promptWithoutTurnId.turn_id;
    const promptResult = runNode(CAPTURE_SCRIPT, {
      cwd: root,
      env,
      input: JSON.stringify(promptWithoutTurnId),
    });
    assert.equal(promptResult.status, 0, promptResult.stderr);
    const results = await Promise.all(Array.from({ length: 12 }, () => runNodeAsync(CAPTURE_SCRIPT, {
      cwd: root,
      env,
      input: JSON.stringify({
        ...common,
        hook_event_name: "Stop",
        last_assistant_message: "same answer",
      }),
    })));
    for (const result of results) {
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout.trim(), '{"continue":true}');
    }

    const runtime = path.join(root, "knowledge/private-inbox/.runtime");
    const capturesRoot = path.join(runtime, "captures");
    let captures = await filesBelow(capturesRoot, ".json");
    assert.equal(captures.length, 1);
    const serialized = JSON.parse(await fs.readFile(captures[0], "utf8"));
    assert.equal(serialized.completeness, "visible-messages");

    const staleSession = "stale-session";
    const staleLock = path.join(runtime, "locks", `${sessionKey(staleSession)}.lock`);
    await fs.mkdir(staleLock, { recursive: true });
    await writeJson(path.join(staleLock, "owner"), {
      token: "stale-owner",
      pid: 2_147_483_647,
      acquiredAt: "2000-01-01T00:00:00.000Z",
    });
    const staleCapture = runNode(CAPTURE_SCRIPT, {
      cwd: root,
      env,
      input: JSON.stringify(captureEvent(root, {
        session_id: staleSession,
        turn_id: "recovered",
      })),
    });
    assert.equal(staleCapture.status, 0, staleCapture.stderr);
    captures = await filesBelow(capturesRoot, ".json");
    assert.equal(captures.length, 2, "a dead stale owner should be rotated and capture should continue");

    const activeSession = "active-session";
    const activeLock = path.join(runtime, "locks", `${sessionKey(activeSession)}.lock`);
    await fs.mkdir(activeLock, { recursive: true });
    await writeJson(path.join(activeLock, "owner"), {
      token: "active-owner",
      pid: process.pid,
      acquiredAt: "2000-01-01T00:00:00.000Z",
    });
    const activeCapture = runNode(CAPTURE_SCRIPT, {
      cwd: root,
      env,
      input: JSON.stringify(captureEvent(root, {
        session_id: activeSession,
        turn_id: "must-wait",
      })),
    });
    assert.equal(activeCapture.status, 0, activeCapture.stderr);
    assert.equal((await filesBelow(capturesRoot, ".json")).length, 2);
    assert.equal((await fs.stat(activeLock)).isDirectory(), true);

    const {
      acquirePrivateLock,
      pruneExpiredCaptures,
      releasePrivateLock,
    } = await import(pathToFileURL(PRIVATE_RUNTIME).href);
    const lockedSession = `s_${"d".repeat(32)}`;
    const lockedCapture = path.join(capturesRoot, lockedSession, `t_${"e".repeat(32)}.json`);
    const lockedPayload = path.join(runtime, "assistant-messages", lockedSession, "old.txt");
    await fs.mkdir(path.dirname(lockedPayload), { recursive: true });
    await fs.writeFile(lockedPayload, "must-survive-locked-retention");
    const old = "2000-01-01T00:00:00.000Z";
    await writeJson(lockedCapture, {
      captureId: `cap_${"f".repeat(32)}`,
      sessionKey: lockedSession,
      turnKey: `t_${"e".repeat(32)}`,
      firstCapturedAt: old,
      updatedAt: old,
      messages: {
        assistant: {
          status: "captured",
          path: path.relative(runtime, lockedPayload),
          bytes: 29,
          sha256: "locked",
        },
      },
      transcript: { status: "unavailable", deltas: [] },
      curation: {
        status: "processed",
        result: "candidate:locked",
        resultVerifiedAt: old,
        updatedAt: old,
      },
    });
    const lockPath = path.join(runtime, "locks", `${lockedSession}.lock`);
    const token = await acquirePrivateLock(lockPath);
    assert.ok(token);
    try {
      const retained = await pruneExpiredCaptures({
        runtime,
        retentionDays: 14,
        now: Date.parse("2026-07-21T00:00:00.000Z"),
        force: true,
        verifyProcessed: async () => true,
      });
      assert.equal(retained.skippedLocked, 1);
      assert.equal(await fs.readFile(lockedPayload, "utf8"), "must-survive-locked-retention");
    } finally {
      await releasePrivateLock(lockPath, token);
    }
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
