import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");
const CAPTURE_SCRIPT = path.join(
  PROJECT_ROOT,
  ".agents/skills/curate-portable-knowledge-base/scripts/capture-turn.mjs",
);
const KB_TOOL = path.join(
  PROJECT_ROOT,
  ".agents/skills/curate-portable-knowledge-base/scripts/kb-tool.mjs",
);

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

function runNode(script, args, { cwd, env, input } = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd,
    env: { ...process.env, ...env },
    input,
    encoding: "utf8",
    shell: false,
  });
}

function runNodeAsync(script, args, { cwd, env, input } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
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

function runHookCommand(command, { cwd, env, input }) {
  return spawnSync(command, {
    cwd,
    env: { ...process.env, ...env },
    input,
    encoding: "utf8",
    shell: true,
  });
}

function sourceSupportsNestedHookCwd() {
  const result = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    shell: false,
  });
  if (result.status !== 0) return false;
  return path.resolve(result.stdout.trim()) === PROJECT_ROOT;
}

function storedZipEntries(archive) {
  const entries = new Map();
  let offset = 0;
  while (offset + 30 <= archive.length && archive.readUInt32LE(offset) === 0x04034b50) {
    const method = archive.readUInt16LE(offset + 8);
    assert.equal(method, 0, "test ZIP parser expects stored entries");
    const size = archive.readUInt32LE(offset + 18);
    const nameLength = archive.readUInt16LE(offset + 26);
    const extraLength = archive.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const name = archive.subarray(nameStart, nameStart + nameLength).toString("utf8");
    entries.set(name, archive.subarray(dataStart, dataStart + size));
    offset = dataStart + size;
  }
  return entries;
}

async function jsonFiles(directory) {
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
      if (entry.isFile() && child.endsWith(".json")) output.push(child);
    }
  }
  await visit(directory);
  return output;
}

test("Codex hooks capture visible messages and opaque transcript deltas privately and idempotently", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-kb-capture-"));
  try {
    const codexHome = path.join(root, "codex-home");
    const transcript = path.join(codexHome, "sessions", "session.jsonl");
    await fs.mkdir(path.dirname(transcript), { recursive: true });
    await fs.writeFile(transcript, '{"visible":"first private transcript chunk"}\n');
    await writeJson(path.join(root, "kb.config.json"), {
      schemaVersion: 1,
      capture: {
        privateInbox: "knowledge/private-inbox",
        storeRawTranscript: true,
        maxTranscriptBytes: 1024 * 1024,
        maxCaptureBytesPerEvent: 1024 * 1024,
        rawRetentionDays: 14,
      },
      curation: {
        candidates: "knowledge/private-inbox/.runtime/candidates/index.json",
        claims: "knowledge/claims/index.json",
        releaseManifest: "knowledge/release-manifest.json",
        publicationRegistry: "app/module-publication.mjs",
        sourceLedger: "app/reference-content.mjs",
      },
    });
    await fs.mkdir(path.join(root, "app"), { recursive: true });
    await fs.writeFile(
      path.join(root, "app/module-publication.mjs"),
      "export const publishedModules = [];\n",
    );
    await fs.writeFile(
      path.join(root, "app/reference-content.mjs"),
      "export const sourceLedger = {};\n",
    );
    await writeJson(path.join(root, "knowledge/claims/index.json"), {
      schemaVersion: 1,
      items: [],
    });
    await writeJson(path.join(root, "knowledge/release-manifest.json"), {
      schemaVersion: 1,
      releases: [],
    });

    const common = {
      session_id: "raw-session-must-not-leak",
      turn_id: "raw-turn-must-not-leak",
      cwd: root,
      model: "test-model",
      permission_mode: "default",
    };
    const env = {
      NODE_ENV: "test",
      PORTABLE_KB_TEST_ROOT: root,
      CODEX_HOME: codexHome,
    };

    const hooks = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, ".codex/hooks.json"), "utf8"));
    const promptCommand = hooks.hooks.UserPromptSubmit[0].hooks[0][
      process.platform === "win32" ? "commandWindows" : "command"
    ];
    const prompt = runHookCommand(promptCommand, {
      // A Git checkout may safely resolve the trusted project root from a child
      // directory. A Git-less portable copy deliberately accepts only its root.
      cwd: sourceSupportsNestedHookCwd() ? path.join(PROJECT_ROOT, "app") : PROJECT_ROOT,
      env,
      input: JSON.stringify({ ...common, hook_event_name: "UserPromptSubmit", prompt: "private user prompt" }),
    });
    assert.equal(prompt.status, 0, prompt.stderr);
    assert.equal(prompt.stdout.trim(), '{"continue":true}');

    const stopEvent = {
      ...common,
      hook_event_name: "Stop",
      transcript_path: transcript,
      last_assistant_message: "private assistant response",
      stop_hook_active: false,
    };
    const concurrentStops = await Promise.all([
      runNodeAsync(CAPTURE_SCRIPT, [], { cwd: root, env, input: JSON.stringify(stopEvent) }),
      runNodeAsync(CAPTURE_SCRIPT, [], { cwd: root, env, input: JSON.stringify(stopEvent) }),
    ]);
    for (const stop of concurrentStops) {
      assert.equal(stop.status, 0, stop.stderr);
      assert.equal(stop.stdout.trim(), '{"continue":true}');
    }

    const runtime = path.join(root, "knowledge/private-inbox/.runtime");
    const captures = await jsonFiles(path.join(runtime, "captures"));
    assert.equal(captures.length, 1);
    const envelope = JSON.parse(await fs.readFile(captures[0], "utf8"));
    assert.equal(envelope.completeness, "full-to-stop", JSON.stringify(envelope, null, 2));
    assert.equal(envelope.messages.user.status, "captured");
    assert.equal(envelope.messages.assistant.status, "captured");
    assert.equal(envelope.transcript.deltas.length, 1);
    const publicMetadata = JSON.stringify(envelope);
    assert.doesNotMatch(publicMetadata, /raw-session-must-not-leak|raw-turn-must-not-leak/);
    assert.ok(!publicMetadata.includes(root));
    assert.ok(!publicMetadata.includes(transcript));

    const delta = await fs.readFile(path.join(runtime, envelope.transcript.deltas[0].path), "utf8");
    assert.equal(delta, '{"visible":"first private transcript chunk"}\n');

    const invalidMark = runNode(KB_TOOL, ["mark", envelope.captureId, "processed"], { cwd: root, env });
    assert.notEqual(invalidMark.status, 0);
    const concurrentMutation = await Promise.all([
      runNodeAsync(CAPTURE_SCRIPT, [], { cwd: root, env, input: JSON.stringify(stopEvent) }),
      runNodeAsync(KB_TOOL, ["mark", envelope.captureId, "ignored", "concurrency no-op"], {
        cwd: root,
        env,
      }),
    ]);
    for (const mutation of concurrentMutation) assert.equal(mutation.status, 0, mutation.stderr);
    const concurrentlyUpdated = JSON.parse(await fs.readFile(captures[0], "utf8"));
    assert.equal(concurrentlyUpdated.curation.status, "ignored");
    assert.equal(concurrentlyUpdated.curation.reason, "concurrency no-op");
    assert.equal(concurrentlyUpdated.messages.assistant.status, "captured");

    const repeated = runNode(CAPTURE_SCRIPT, [], {
      cwd: root,
      env,
      input: JSON.stringify(stopEvent),
    });
    assert.equal(repeated.status, 0, repeated.stderr);
    const repeatedEnvelope = JSON.parse(await fs.readFile(captures[0], "utf8"));
    assert.equal(repeatedEnvelope.transcript.deltas.length, 1);

    const secondTurn = { ...common, turn_id: "second-turn" };
    await fs.appendFile(transcript, '{"visible":"second chunk"}\n');
    runNode(CAPTURE_SCRIPT, [], {
      cwd: root,
      env,
      input: JSON.stringify({ ...secondTurn, hook_event_name: "UserPromptSubmit", prompt: "second prompt" }),
    });
    const secondStop = runNode(CAPTURE_SCRIPT, [], {
      cwd: root,
      env,
      input: JSON.stringify({
        ...secondTurn,
        hook_event_name: "Stop",
        transcript_path: transcript,
        last_assistant_message: "second response",
      }),
    });
    assert.equal(secondStop.status, 0, secondStop.stderr);
    const secondCaptures = await jsonFiles(path.join(runtime, "captures"));
    assert.equal(secondCaptures.length, 2);
    const secondEnvelopes = await Promise.all(
      secondCaptures.map(async (file) => JSON.parse(await fs.readFile(file, "utf8"))),
    );
    const newest = secondEnvelopes.find((item) => item.turnKey !== envelope.turnKey);
    assert.equal(newest.transcript.generation, envelope.transcript.generation);
    assert.equal(newest.transcript.deltas.at(-1).range.start, envelope.transcript.cursor);
    const appendedDelta = await fs.readFile(
      path.join(runtime, newest.transcript.deltas.at(-1).path),
      "utf8",
    );
    assert.equal(appendedDelta, '{"visible":"second chunk"}\n');

    const thirdTurn = { ...common, turn_id: "third-turn" };
    runNode(CAPTURE_SCRIPT, [], {
      cwd: root,
      env,
      input: JSON.stringify({ ...thirdTurn, hook_event_name: "UserPromptSubmit", prompt: "fallback prompt" }),
    });
    runNode(CAPTURE_SCRIPT, [], {
      cwd: root,
      env,
      input: JSON.stringify({
        ...thirdTurn,
        hook_event_name: "Stop",
        transcript_path: null,
        last_assistant_message: "fallback response",
      }),
    });
    const finalCaptures = await jsonFiles(path.join(runtime, "captures"));
    const envelopes = await Promise.all(finalCaptures.map(async (file) => JSON.parse(await fs.readFile(file, "utf8"))));
    assert.ok(envelopes.some((item) => item.completeness === "visible-messages"));

    const assistantOnlyTurn = { ...common, turn_id: "assistant-only-turn" };
    const assistantOnly = runNode(CAPTURE_SCRIPT, [], {
      cwd: root,
      env,
      input: JSON.stringify({
        ...assistantOnlyTurn,
        hook_event_name: "Stop",
        transcript_path: transcript,
        last_assistant_message: "assistant without captured prompt",
      }),
    });
    assert.equal(assistantOnly.status, 0, assistantOnly.stderr);
    const withAssistantOnly = await jsonFiles(path.join(runtime, "captures"));
    const assistantOnlyEnvelope = (await Promise.all(
      withAssistantOnly.map(async (file) => JSON.parse(await fs.readFile(file, "utf8"))),
    )).find((item) => item.messages?.assistant?.sha256
      && item.messages?.user?.status !== "captured"
      && item.turnKey !== newest.turnKey);
    assert.equal(assistantOnlyEnvelope.completeness, "assistant-only");

    const oversizedTurn = { ...common, turn_id: "oversized-turn" };
    const oversized = runNode(CAPTURE_SCRIPT, [], {
      cwd: root,
      env,
      input: JSON.stringify({
        ...oversizedTurn,
        hook_event_name: "UserPromptSubmit",
        prompt: "x".repeat(2 * 1024 * 1024 + 1),
      }),
    });
    assert.equal(oversized.status, 0, oversized.stderr);
    const afterOversized = await jsonFiles(path.join(runtime, "captures"));
    const oversizedEnvelope = (await Promise.all(
      afterOversized.map(async (file) => JSON.parse(await fs.readFile(file, "utf8"))),
    )).find((item) => item.messages?.user?.status === "too-large");
    assert.ok(oversizedEnvelope, "oversized visible messages should leave a size-marked envelope");

    const malformed = runNode(CAPTURE_SCRIPT, [], { cwd: root, env, input: "not-json" });
    assert.equal(malformed.status, 0);
    assert.equal(malformed.stdout.trim(), '{"continue":true}');

    const beforeRetention = await jsonFiles(path.join(runtime, "captures"));
    const retainedPendingFile = beforeRetention.find((file) => file.includes(oversizedEnvelope.turnKey));
    const processedFile = captures[0];
    const processed = JSON.parse(await fs.readFile(processedFile, "utf8"));
    processed.curation = {
      status: "ignored",
      result: null,
      reason: "retention test no-op",
      resultVerifiedAt: null,
      updatedAt: "2000-01-01T00:00:00.000Z",
    };
    processed.updatedAt = "2000-01-01T00:00:00.000Z";
    await writeJson(processedFile, processed);
    const pending = JSON.parse(await fs.readFile(retainedPendingFile, "utf8"));
    pending.updatedAt = "2000-01-01T00:00:00.000Z";
    await writeJson(retainedPendingFile, pending);
    const inbox = runNode(KB_TOOL, ["inbox", "--json"], { cwd: root, env });
    assert.equal(inbox.status, 0, inbox.stderr);
    const retention = JSON.parse(inbox.stdout).retention;
    assert.equal(retention.purgedCaptures, 1);
    assert.equal(retention.overdueUnresolved, 1);
    const scrubbed = JSON.parse(await fs.readFile(processedFile, "utf8"));
    assert.equal(scrubbed.curation.status, "ignored");
    assert.ok(scrubbed.rawPurgedAt);
    assert.equal(scrubbed.messages.user?.status, "expired");
    assert.equal((await jsonFiles(path.join(runtime, "captures"))).length, beforeRetention.length);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("retention purges only valid payload roots and preserves a minimal processed envelope", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-kb-retention-"));
  try {
    const runtime = path.join(root, "knowledge/private-inbox/.runtime");
    const sessionKey = `s_${"1".repeat(32)}`;
    const turnKey = `t_${"2".repeat(32)}`;
    const captureFile = path.join(runtime, "captures", sessionKey, `${turnKey}.json`);
    const protectedCandidate = path.join(runtime, "candidates", "index.json");
    const assistantPayload = path.join(runtime, "assistant-messages", sessionKey, `${turnKey}.txt`);
    const orphanPayload = path.join(runtime, "user-messages", "orphan.txt");
    await fs.mkdir(path.dirname(protectedCandidate), { recursive: true });
    await fs.mkdir(path.dirname(assistantPayload), { recursive: true });
    await fs.mkdir(path.dirname(orphanPayload), { recursive: true });
    await fs.writeFile(protectedCandidate, "CANDIDATE_MUST_SURVIVE");
    await fs.writeFile(assistantPayload, "expired assistant payload");
    await fs.writeFile(orphanPayload, "expired orphan payload");
    const old = new Date("2000-01-01T00:00:00.000Z");
    await fs.utimes(orphanPayload, old, old);
    await writeJson(captureFile, {
      captureId: `cap_${"3".repeat(32)}`,
      sessionKey,
      turnKey,
      firstCapturedAt: old.toISOString(),
      updatedAt: old.toISOString(),
      completeness: "assistant-only",
      messages: {
        user: {
          status: "unavailable",
          path: null,
          bytes: 0,
          sha256: null,
        },
        assistant: {
          status: "captured",
          path: path.relative(runtime, assistantPayload),
          bytes: 25,
          sha256: "recreated-payload-after-prior-purge",
        },
      },
      transcript: { status: "unavailable", deltas: [] },
      curation: {
        status: "processed",
        result: "candidate:retention-test",
        reason: null,
        resultVerifiedAt: old.toISOString(),
        updatedAt: old.toISOString(),
      },
      rawPurgedAt: "2001-01-01T00:00:00.000Z",
    });
    const { pruneExpiredCaptures } = await import(
      pathToFileURL(path.join(
        PROJECT_ROOT,
        ".agents/skills/curate-portable-knowledge-base/scripts/private-runtime.mjs",
      )).href
    );
    const result = await pruneExpiredCaptures({
      runtime,
      retentionDays: 14,
      now: Date.parse("2026-07-20T00:00:00.000Z"),
      force: true,
      verifyProcessed: async () => true,
    });
    assert.equal(result.purgedCaptures, 1);
    assert.equal(result.orphanPayloadsRemoved, 1);
    assert.equal(await fs.readFile(protectedCandidate, "utf8"), "CANDIDATE_MUST_SURVIVE");
    await assert.rejects(fs.access(assistantPayload));
    await assert.rejects(fs.access(orphanPayload));
    const minimal = JSON.parse(await fs.readFile(captureFile, "utf8"));
    assert.equal(minimal.curation.result, "candidate:retention-test");
    assert.equal(minimal.messages.assistant.status, "expired");
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("capture fails open without following a symlinked private inbox", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-kb-symlink-"));
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), "portable-kb-outside-"));
  try {
    await writeJson(path.join(root, "kb.config.json"), {
      schemaVersion: 1,
      capture: {
        privateInbox: "knowledge/private-inbox",
        storeRawTranscript: false,
        rawRetentionDays: 14,
      },
    });
    await fs.mkdir(path.join(root, "knowledge"), { recursive: true });
    try {
      await fs.symlink(outside, path.join(root, "knowledge/private-inbox"), "junction");
    } catch (error) {
      if (["EPERM", "EACCES", "ENOTSUP"].includes(error?.code)) {
        context.skip(`symlinks unavailable: ${error.code}`);
        return;
      }
      throw error;
    }
    const result = runNode(CAPTURE_SCRIPT, [], {
      cwd: root,
      env: { NODE_ENV: "test", PORTABLE_KB_TEST_ROOT: root },
      input: JSON.stringify({
        hook_event_name: "UserPromptSubmit",
        session_id: "raw-session",
        turn_id: "raw-turn",
        prompt: "must not cross symlink",
      }),
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), '{"continue":true}');
    assert.deepEqual(await fs.readdir(outside), []);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  }
});

test("portable builds treat the personal Sites binding as optional", async () => {
  const viteConfig = await fs.readFile(path.join(PROJECT_ROOT, "vite.config.ts"), "utf8");
  assert.doesNotMatch(viteConfig, /import\s+\w+\s+from\s+["']\.\/\.openai\/hosting\.json["']/);
  assert.match(viteConfig, /readOptionalHostingConfig/);
  assert.match(viteConfig, /ENOENT/);
});

test("local lecture attachments remain outside the Git source distribution", async () => {
  const [gitignore, readme, handoff] = await Promise.all([
    fs.readFile(path.join(PROJECT_ROOT, ".gitignore"), "utf8"),
    fs.readFile(path.join(PROJECT_ROOT, "README.md"), "utf8"),
    fs.readFile(path.join(PROJECT_ROOT, "HANDOFF.md"), "utf8"),
  ]);
  assert.match(gitignore, /^\/external_reference\/CC-20260717\/$/m);
  assert.match(readme, /CC-20260717\/.*不属于 GitHub 源码交付/);
  assert.match(handoff, /CC-20260717\/.*不属于 Git 源码交付/);

  const tracked = spawnSync("git", ["ls-files", "external_reference/CC-20260717/**"], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    shell: false,
  });
  if (tracked.status === 0) assert.equal(tracked.stdout.trim(), "");
});

test("portable tools pass without Git and exclude private runtime and personal Sites binding", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-kb-package-"));
  let output;
  try {
    const config = {
      schemaVersion: 1,
      project: {
        id: "portable-test",
        requiredNode: ">=22.13.0",
      },
      capture: {
        privateInbox: "knowledge/private-inbox",
        storeRawTranscript: false,
        rawRetentionDays: 14,
      },
      curation: {
        candidates: "knowledge/private-inbox/.runtime/candidates/index.json",
        claims: "knowledge/claims/index.json",
        releaseManifest: "knowledge/release-manifest.json",
        releaseSchema: "knowledge/schemas/release.schema.json",
        publicAdapter: "existing-app-registry",
        publicationRegistry: "app/module-publication.mjs",
        contentRegistry: "app/module-content-registry.mjs",
        sourceLedger: "app/reference-content.mjs",
        terminology: "app/terminology.mjs",
      },
      quality: {
        commands: ["npm run kb:validate", "npm run lint", "npm test"],
      },
      publishing: {
        defaultMode: "local",
        sites: { binding: ".openai/hosting.json" },
      },
      handoff: {
        defaultAudience: "internal",
        attachmentRoots: ["docs/attachments"],
        attachmentPolicy: "knowledge/attachment-distribution.json",
        attachmentSchema: "knowledge/schemas/attachment-distribution.schema.json",
      },
      packaging: {
        outputDirectory: "outputs/portable",
        maxArchiveBytes: 268435456,
        includeSiteBindingByDefault: false,
        include: [
          ".agents/skills/curate-portable-knowledge-base",
          ".codex/hooks.json",
          ".gitignore",
          ".node-version",
          ".openai/hosting.example.json",
          "AGENTS.md",
          "HANDOFF-READ-FIRST.html",
          "HANDOFF.md",
          "README.md",
          "kb.config.json",
          "package.json",
          "package-lock.json",
          "app",
          "public",
          "knowledge/attachment-distribution.json",
          "knowledge/claims",
          "knowledge/release-manifest.json",
          "knowledge/schemas",
          "knowledge",
          "docs",
          "scripts",
          "tests"
        ],
        exclude: [
          ".git",
          "node_modules",
          "dist",
          ".next",
          ".vinext",
          ".wrangler",
          "outputs",
          "work",
          "coverage",
          "tsconfig.tsbuildinfo",
          "knowledge/private-inbox",
          ".openai/hosting.json",
        ],
      },
    };
    await writeJson(path.join(root, "kb.config.json"), config);
    await fs.writeFile(path.join(root, "AGENTS.md"), "portable test\n");
    await fs.writeFile(path.join(root, "HANDOFF-READ-FIRST.html"), "<!doctype html><title>Portable handoff</title>\n");
    await fs.writeFile(path.join(root, "HANDOFF.md"), "portable handoff\n");
    await fs.writeFile(path.join(root, "README.md"), "portable test\n");
    await writeJson(path.join(root, "package.json"), { name: "portable-test" });
    await writeJson(path.join(root, "package-lock.json"), { name: "portable-test", lockfileVersion: 3 });
    await fs.writeFile(path.join(root, ".gitignore"), "/knowledge/private-inbox/*\n");
    await fs.writeFile(path.join(root, ".node-version"), "22.13.0\n");
    await fs.mkdir(path.join(root, ".agents/skills/curate-portable-knowledge-base"), { recursive: true });
    await fs.writeFile(
      path.join(root, ".agents/skills/curate-portable-knowledge-base/SKILL.md"),
      '---\nname: curate-portable-knowledge-base\ndescription: "Portable test skill."\n---\n\nTest.\n',
    );
    await fs.mkdir(
      path.join(root, ".agents/skills/curate-portable-knowledge-base/references"),
      { recursive: true },
    );
    await fs.writeFile(
      path.join(root, ".agents/skills/curate-portable-knowledge-base/references/handoff-audit.md"),
      "# Handoff audit fixture\n",
    );
    const skillScripts = path.join(
      root,
      ".agents/skills/curate-portable-knowledge-base/scripts",
    );
    await fs.mkdir(skillScripts, { recursive: true });
    for (const script of ["kb-tool.mjs", "hook-bootstrap.mjs", "capture-turn.mjs", "private-runtime.mjs"]) {
      await fs.writeFile(path.join(skillScripts, script), "export {};\n");
    }
    await fs.mkdir(path.join(root, ".codex"), { recursive: true });
    await fs.copyFile(
      path.join(PROJECT_ROOT, ".codex/hooks.json"),
      path.join(root, ".codex/hooks.json"),
    );
    for (const file of [
      "app/module-publication.mjs",
      "app/module-content-registry.mjs",
      "app/reference-content.mjs",
      "app/terminology.mjs",
    ]) {
      await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
      await fs.writeFile(
        path.join(root, file),
        file === "app/reference-content.mjs"
          ? "export const sourceLedger = { known: {} };\n"
          : file === "app/module-publication.mjs"
            ? "export const publishedModules = [];\n"
            : "export default {};\n",
      );
    }
    await fs.writeFile(path.join(root, "app/page.tsx"), "APP_UNCHANGED\n");
    await fs.mkdir(path.join(root, "public"), { recursive: true });
    await fs.writeFile(path.join(root, "public/site.css"), "PUBLIC_UNCHANGED\n");
    await fs.mkdir(path.join(root, "scripts"), { recursive: true });
    await fs.writeFile(path.join(root, "scripts/tool.mjs"), "export {};\n");
    await fs.writeFile(path.join(root, "scripts/release-check.mjs"), "export {};\n");
    await fs.mkdir(path.join(root, "tests"), { recursive: true });
    await fs.writeFile(path.join(root, "tests/tool.test.mjs"), "export {};\n");
    await fs.mkdir(path.join(root, "knowledge/schemas"), { recursive: true });
    await fs.copyFile(
      path.join(PROJECT_ROOT, "knowledge/schemas/attachment-distribution.schema.json"),
      path.join(root, "knowledge/schemas/attachment-distribution.schema.json"),
    );
    await fs.copyFile(
      path.join(PROJECT_ROOT, "knowledge/schemas/claim.schema.json"),
      path.join(root, "knowledge/schemas/claim.schema.json"),
    );
    await fs.copyFile(
      path.join(PROJECT_ROOT, "knowledge/schemas/candidate.schema.json"),
      path.join(root, "knowledge/schemas/candidate.schema.json"),
    );
    await fs.copyFile(
      path.join(PROJECT_ROOT, "knowledge/schemas/release.schema.json"),
      path.join(root, "knowledge/schemas/release.schema.json"),
    );
    await writeJson(path.join(root, "knowledge/claims/index.json"), { schemaVersion: 1, items: [] });
    await writeJson(path.join(root, "knowledge/attachment-distribution.json"), {
      $schema: "./schemas/attachment-distribution.schema.json",
      schemaVersion: 2,
      items: [],
    });
    await writeJson(path.join(root, "knowledge/release-manifest.json"), {
      $schema: "./schemas/release.schema.json",
      schemaVersion: 1,
      releases: [],
    });
    await fs.mkdir(path.join(root, "knowledge/private-inbox/.runtime"), { recursive: true });
    await fs.writeFile(path.join(root, "knowledge/private-inbox/.runtime/secret.txt"), "PRIVATE_SENTINEL");
    await fs.mkdir(path.join(root, "docs"), { recursive: true });
    await fs.writeFile(path.join(root, "docs/guide.md"), "PORTABLE_GUIDE\n");
    await fs.mkdir(path.join(root, "docs/中文路径"), { recursive: true });
    await fs.writeFile(path.join(root, "docs/中文路径/A2A-讲义.txt"), "UNICODE_PATH_OK\n");
    await writeJson(path.join(root, ".openai/hosting.json"), { project_id: "PERSONAL_BINDING" });
    await writeJson(path.join(root, ".openai/hosting.example.json"), { project_id: "replace-me" });

    const env = { NODE_ENV: "test", PORTABLE_KB_TEST_ROOT: root };
    const doctor = runNode(KB_TOOL, ["doctor", "--json"], { cwd: root, env });
    assert.equal(doctor.status, 0, doctor.stderr);
    assert.equal(JSON.parse(doctor.stdout).ok, true);

    const validation = runNode(KB_TOOL, ["validate"], { cwd: root, env });
    assert.equal(validation.status, 0, validation.stderr);

    const unsafeBindingConfig = {
      ...config,
      publishing: {
        ...config.publishing,
        sites: { binding: "docs/personal-sites-binding.json" },
      },
    };
    await writeJson(path.join(root, "kb.config.json"), unsafeBindingConfig);
    await writeJson(path.join(root, "docs/personal-sites-binding.json"), {
      project_id: "PRIVATE_BINDING_SENTINEL",
    });
    const unsafeBinding = runNode(KB_TOOL, ["validate"], { cwd: root, env });
    assert.notEqual(unsafeBinding.status, 0);
    const rejectedOutput = path.join(root, "docs", "rejected-binding.zip");
    const rejectedPackage = runNode(KB_TOOL, ["package", "--output", rejectedOutput], {
      cwd: root,
      env,
    });
    assert.notEqual(rejectedPackage.status, 0);
    await assert.rejects(fs.access(rejectedOutput));
    await fs.rm(path.join(root, "docs/personal-sites-binding.json"), { force: true });
    await writeJson(path.join(root, "kb.config.json"), config);

    await writeJson(path.join(root, "knowledge/claims/index.json"), {
      schemaVersion: 1,
      items: [{
        id: "stale",
        claim: "stale test",
        scope: "test",
        sourceIds: ["known"],
        evidenceGrade: "A",
        verifiedAt: "2020-01-01",
        reviewBy: "2020-02-01",
        owner: "test",
        status: "active",
        derivedFrom: ["raw-turn-id-must-fail"],
      }],
    });
    const stale = runNode(KB_TOOL, ["validate"], { cwd: root, env });
    assert.notEqual(stale.status, 0);
    assert.match(stale.stderr, /overdue|hashed identifier/);
    await writeJson(path.join(root, "knowledge/claims/index.json"), { schemaVersion: 1, items: [] });

    await writeJson(path.join(root, "knowledge/private-inbox/.runtime/candidates/index.json"), {
      schemaVersion: 1,
      items: [{
        id: "bad-candidate",
        title: "bad",
        kind: "decision",
        summary: "bad raw identifier",
        capturedTurnIds: ["raw-codex-turn-id"],
        status: "pending",
        visibility: "private",
        sensitivity: "none",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      }],
    });
    const badCandidate = runNode(KB_TOOL, ["validate"], { cwd: root, env });
    assert.notEqual(badCandidate.status, 0);
    assert.match(badCandidate.stderr, /hashed identifier/);
    await fs.rm(path.join(root, "knowledge/private-inbox/.runtime/candidates/index.json"), { force: true });

    output = path.join(root, "docs", "portable.zip");
    const packaged = runNode(KB_TOOL, ["package", "--output", output], { cwd: root, env });
    assert.equal(packaged.status, 0, packaged.stderr);
    const repackaged = runNode(KB_TOOL, ["package", "--output", output], { cwd: root, env });
    assert.equal(repackaged.status, 0, repackaged.stderr);
    const archive = await fs.readFile(output);
    const entries = storedZipEntries(archive);
    const manifest = JSON.parse(entries.get("PORTABLE-MANIFEST.json").toString("utf8"));
    const manifestPaths = new Set(manifest.files.map((file) => file.path));
    assert.ok(entries.get("app/page.tsx").includes(Buffer.from("APP_UNCHANGED")));
    assert.ok(entries.get("public/site.css").includes(Buffer.from("PUBLIC_UNCHANGED")));
    assert.ok(manifestPaths.has(".openai/hosting.example.json"));
    assert.ok(manifestPaths.has("docs/guide.md"));
    assert.ok(![...manifestPaths].some((file) => file.startsWith("knowledge/private-inbox/")));
    assert.ok(!manifestPaths.has(".openai/hosting.json"));
    assert.ok(!manifestPaths.has("docs/portable.zip"));
    assert.ok(!manifestPaths.has("docs/portable.zip.sha256"));
    assert.ok(!archive.includes(Buffer.from("PRIVATE_SENTINEL")));
    assert.ok(!archive.includes(Buffer.from("PERSONAL_BINDING")));
    assert.ok(await fs.readFile(`${output}.sha256`, "utf8"));

    if (process.platform === "darwin") {
      const extracted = path.join(root, "macos-built-in-unzip");
      await fs.mkdir(extracted);
      const unzip = spawnSync("/usr/bin/unzip", ["-qq", output, "-d", extracted], {
        encoding: "utf8",
        input: "",
        shell: false,
      });
      assert.equal(unzip.status, 0, `${unzip.stdout}\n${unzip.stderr}`);
      assert.equal(
        await fs.readFile(path.join(extracted, "docs/中文路径/A2A-讲义.txt"), "utf8"),
        "UNICODE_PATH_OK\n",
      );
    }

    const personalOutput = path.join(root, "outputs", "portable-with-binding.zip");
    const withBinding = runNode(
      KB_TOOL,
      ["package", "--include-site-binding", "--output", personalOutput],
      { cwd: root, env },
    );
    assert.equal(withBinding.status, 0, withBinding.stderr);
    const personalEntries = storedZipEntries(await fs.readFile(personalOutput));
    const personalManifest = JSON.parse(personalEntries.get("PORTABLE-MANIFEST.json").toString("utf8"));
    assert.equal(personalManifest.siteBindingIncluded, true);
    assert.ok(personalEntries.get(".openai/hosting.json").includes(Buffer.from("PERSONAL_BINDING")));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    if (output && !output.startsWith(root)) await fs.rm(output, { force: true });
    if (output && !output.startsWith(root)) await fs.rm(`${output}.sha256`, { force: true });
  }
});
