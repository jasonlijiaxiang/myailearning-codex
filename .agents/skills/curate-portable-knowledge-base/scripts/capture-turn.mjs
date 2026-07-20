import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { constants as FS_CONSTANTS, promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  acquirePrivateLock,
  atomicWritePrivateFile,
  ensurePrivateDirectory,
  privateInboxIsSafe,
  pruneExpiredCaptures,
  readPrivateFile,
  readPrivateJson,
  releasePrivateLock,
} from "./private-runtime.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = process.env.NODE_ENV === "test" && process.env.PORTABLE_KB_TEST_ROOT
  ? path.resolve(process.env.PORTABLE_KB_TEST_ROOT)
  : path.resolve(SCRIPT_DIR, "../../../..");
const MAX_MESSAGE_BYTES = 2 * 1024 * 1024;
const MAX_STDIN_BYTES = 16 * 1024 * 1024;
const NO_FOLLOW = FS_CONSTANTS.O_NOFOLLOW ?? 0;

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function relativePath(from, to) {
  return path.relative(from, to).split(path.sep).join("/");
}

function isWithin(candidate, parent) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function safeString(value) {
  return typeof value === "string" ? value : "";
}

function sameFile(left, right) {
  if (!left || !right) return false;
  if (left.dev !== undefined && right.dev !== undefined && left.ino && right.ino) {
    return left.dev === right.dev && left.ino === right.ino;
  }
  return left.size === right.size && left.mtimeMs === right.mtimeMs;
}

async function noLinksWithin(root, target, leafKind) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  if (!isWithin(resolvedTarget, resolvedRoot)) return null;

  let rootStat;
  try {
    rootStat = await fs.lstat(resolvedRoot);
  } catch {
    return null;
  }
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) return null;
  const rootReal = await fs.realpath(resolvedRoot);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  let current = resolvedRoot;
  let currentStat = rootStat;

  for (const segment of relative ? relative.split(path.sep) : []) {
    current = path.join(current, segment);
    try {
      currentStat = await fs.lstat(current);
    } catch {
      return null;
    }
    if (currentStat.isSymbolicLink()) return null;
    if (current !== resolvedTarget && !currentStat.isDirectory()) return null;
    const real = await fs.realpath(current);
    if (!isWithin(real, rootReal)) return null;
  }

  if (leafKind === "file" && !currentStat.isFile()) return null;
  if (leafKind === "directory" && !currentStat.isDirectory()) return null;
  return { stat: currentStat, real: await fs.realpath(resolvedTarget), rootReal };
}

async function gitTopLevel(directory) {
  const result = spawnSync("git", ["-C", directory, "rev-parse", "--show-toplevel"], {
    encoding: "utf8",
    shell: false,
    timeout: 3_000,
    windowsHide: true,
  });
  if (result.status !== 0 || !result.stdout.trim()) return null;
  try {
    return await fs.realpath(result.stdout.trim());
  } catch {
    return null;
  }
}

async function eventCwdBelongsToProject(value) {
  if (!value || !path.isAbsolute(value)) return false;
  const project = await noLinksWithin(PROJECT_ROOT, PROJECT_ROOT, "directory");
  let valueReal;
  try {
    valueReal = await fs.realpath(value);
  } catch {
    return false;
  }
  if (!project || !isWithin(valueReal, project.real)) return false;
  const cwd = await noLinksWithin(
    PROJECT_ROOT,
    path.join(PROJECT_ROOT, path.relative(project.real, valueReal)),
    "directory",
  );
  if (!project || !cwd || !isWithin(cwd.real, project.real)) return false;

  const [projectGit, cwdGit] = await Promise.all([
    gitTopLevel(project.real),
    gitTopLevel(cwd.real),
  ]);
  if (projectGit || cwdGit) {
    return projectGit === cwdGit && projectGit === project.real;
  }
  return true;
}

async function readStdin() {
  const chunks = [];
  let total = 0;

  for await (const chunk of process.stdin) {
    total += chunk.length;
    if (total > MAX_STDIN_BYTES) throw new Error("stdin-too-large");
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function readJson(file, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writePayload(runtime, file, buffer) {
  try {
    const existing = await readPrivateFile(runtime, file);
    if (existing.equals(buffer)) return;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  await atomicWritePrivateFile(runtime, file, buffer);
}

async function readRange(handle, start, end) {
  const length = Math.max(0, end - start);
  const buffer = Buffer.alloc(length);
  if (length === 0) return buffer;
  const { bytesRead } = await handle.read(buffer, 0, length, start);
  return buffer.subarray(0, bytesRead);
}

async function allowedTranscriptFile(transcriptPath) {
  if (!transcriptPath || !path.isAbsolute(transcriptPath)) {
    return { status: "unavailable" };
  }

  if (path.extname(transcriptPath).toLowerCase() !== ".jsonl") {
    return { status: "rejected-path" };
  }
  const configuredHome = safeString(process.env.CODEX_HOME);
  const codexHome = configuredHome && path.isAbsolute(configuredHome)
    ? path.resolve(configuredHome)
    : path.join(os.homedir(), ".codex");
  const scopes = ["sessions", "archived_sessions"].map((directory) => path.join(codexHome, directory));

  for (const scope of scopes) {
    const scopeInfo = await noLinksWithin(codexHome, scope, "directory");
    if (!scopeInfo || !isWithin(path.resolve(transcriptPath), path.resolve(scope))) continue;
    const candidate = await noLinksWithin(codexHome, transcriptPath, "file");
    if (!candidate || !isWithin(candidate.real, scopeInfo.real)) continue;
    return {
      status: "allowed",
      path: path.resolve(transcriptPath),
      real: candidate.real,
      scope: codexHome,
      stat: candidate.stat,
    };
  }
  return { status: "rejected-path" };
}

async function captureTranscript({ event, config, runtime, sessionKey, turnKey, envelope }) {
  const transcript = await allowedTranscriptFile(safeString(event.transcript_path));
  if (transcript.status !== "allowed") {
    return {
      transcript: {
        ...(envelope.transcript ?? {}),
        status: transcript.status,
        format: "opaque-codex-transcript",
      },
      nextState: null,
      diagnosticCode: transcript.status,
    };
  }

  const stateFile = path.join(runtime, "state", `${sessionKey}.json`);
  const previous = await readPrivateJson(runtime, stateFile, {
    $schema: "portable-kb/capture-state/v1",
    sessionKey,
    generation: 1,
    sequence: 0,
    cursor: 0,
    sourceKey: null,
    sourcePrefixSha256: null,
    sourcePrefixBytes: 0,
    sourceBoundary: null,
  });

  const handle = await fs.open(transcript.path, FS_CONSTANTS.O_RDONLY | NO_FOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || !sameFile(stat, transcript.stat)) throw new Error("transcript-path-changed");
    const revalidated = await noLinksWithin(transcript.scope, transcript.path, "file");
    if (!revalidated || !sameFile(stat, revalidated.stat)) throw new Error("transcript-path-changed");
    const sourceSize = stat.size;
    const sourceKey = hash(`codex-transcript\0${transcript.real}`);
    let generation = previous.generation ?? 1;
    let cursor = previous.cursor ?? 0;
    let sequence = previous.sequence ?? 0;
    let reset = previous.sourceKey !== sourceKey || sourceSize < cursor;
    let prefixBytes = previous.sourcePrefixBytes ?? 0;
    let prefixHash = previous.sourcePrefixSha256;

    if (!reset && previous.sourcePrefixSha256) {
      const comparisonBytes = prefixBytes || Math.min(cursor, 4096);
      const comparisonPrefix = await readRange(handle, 0, comparisonBytes);
      if (previous.sourcePrefixSha256 !== hash(comparisonPrefix)) reset = true;
    }

    if (!reset && cursor > 0 && previous.sourceBoundary) {
      const boundaryStart = Math.max(0, cursor - 64);
      const boundary = await readRange(handle, boundaryStart, cursor);
      if (
        previous.sourceBoundary.start !== boundaryStart
        || previous.sourceBoundary.sha256 !== hash(boundary)
      ) {
        reset = true;
      }
    }

    if (reset) {
      generation += 1;
      cursor = 0;
    }

    if (reset || !prefixHash) {
      prefixBytes = Math.min(sourceSize, 4096);
      prefixHash = hash(await readRange(handle, 0, prefixBytes));
    }

    const maximumTotal = Number(config.capture.maxTranscriptBytes) || 26_214_400;
    const maximumPerEvent = Number(config.capture.maxCaptureBytesPerEvent) || 8_388_608;
    const end = Math.min(sourceSize, cursor + maximumPerEvent, maximumTotal);
    const delta = await readRange(handle, cursor, end);
    const deltas = Array.isArray(envelope.transcript?.deltas)
      ? [...envelope.transcript.deltas]
      : [];

    if (delta.length > 0) {
      sequence += 1;
      const generationName = `g${String(generation).padStart(4, "0")}`;
      const fileName = `${String(sequence).padStart(6, "0")}-${turnKey}.bin`;
      const deltaFile = path.join(runtime, "transcript-deltas", sessionKey, generationName, fileName);
      await writePayload(runtime, deltaFile, delta);
      const deltaPath = relativePath(runtime, deltaFile);
      const deltaRecord = {
        generation,
        range: { start: cursor, end: cursor + delta.length },
        bytes: delta.length,
        sha256: hash(delta),
        path: deltaPath,
      };

      if (!deltas.some((item) => item.path === deltaPath && item.sha256 === deltaRecord.sha256)) {
        deltas.push(deltaRecord);
      }
      cursor += delta.length;
    }

    const boundaryStart = Math.max(0, cursor - 64);
    const boundary = await readRange(handle, boundaryStart, cursor);
    const status = cursor >= sourceSize
      ? "captured"
      : cursor >= maximumTotal
        ? "size-limit"
        : "partial-backlog";

    return {
      transcript: {
        status,
        format: "opaque-codex-transcript",
        generation,
        cursor,
        sourceSizeAtOpen: sourceSize,
        deltas,
      },
      nextState: {
        $schema: "portable-kb/capture-state/v1",
        sessionKey,
        generation,
        sequence,
        cursor,
        sourceKey,
        sourcePrefixSha256: prefixHash,
        sourcePrefixBytes: prefixBytes,
        sourceBoundary: {
          start: boundaryStart,
          sha256: hash(boundary),
        },
        lastTurnKey: turnKey,
      },
      stateFile,
      diagnosticCode: status === "captured" ? null : status,
    };
  } finally {
    await handle.close();
  }
}

async function storeMessage({ value, kind, runtime, sessionKey, turnKey }) {
  const text = safeString(value);
  if (!text) return { status: "unavailable", path: null, bytes: 0, sha256: null };
  const buffer = Buffer.from(text, "utf8");
  if (buffer.length > MAX_MESSAGE_BYTES) {
    return { status: "too-large", path: null, bytes: buffer.length, sha256: hash(buffer) };
  }

  const file = path.join(runtime, `${kind}-messages`, sessionKey, `${turnKey}.txt`);
  await writePayload(runtime, file, buffer);
  return {
    status: "captured",
    path: relativePath(runtime, file),
    bytes: buffer.length,
    sha256: hash(buffer),
  };
}

function completeness(envelope) {
  const hasUser = envelope.messages?.user?.status === "captured";
  const hasAssistant = envelope.messages?.assistant?.status === "captured";
  if (hasUser && hasAssistant && envelope.transcript?.status === "captured") return "full-to-stop";
  if (hasUser && hasAssistant) return "visible-messages";
  if (hasUser) return "prompt-only";
  if (hasAssistant) return "assistant-only";
  if (envelope.transcript?.status === "captured") return "transcript-only";
  if (["partial-backlog", "size-limit"].includes(envelope.transcript?.status)) return "partial-backlog";
  return "metadata-only";
}

function validTurnKey(value) {
  return /^t_[0-9a-f]{32}$/.test(value ?? "");
}

async function correlateTurn({ event, eventName, runtime, sessionKey }) {
  const stateFile = path.join(runtime, "turn-state", `${sessionKey}.json`);
  const previous = await readPrivateJson(runtime, stateFile, {});
  const sequence = Number.isSafeInteger(previous.sequence) && previous.sequence >= 0
    ? previous.sequence
    : 0;
  const now = new Date().toISOString();

  if (eventName === "UserPromptSubmit") {
    const promptSha256 = hash(`codex-prompt\0${safeString(event.prompt)}`);
    if (
      validTurnKey(previous.active?.turnKey)
      && previous.active?.promptSha256 === promptSha256
    ) {
      return {
        turnKey: previous.active.turnKey,
        stateFile,
        nextState: { ...previous, updatedAt: now },
      };
    }
    const nextSequence = sequence + 1;
    const turnKey = `t_${hash(
      `codex-visible-turn\0${sessionKey}\0${nextSequence}\0${promptSha256}`,
    ).slice(0, 32)}`;
    return {
      turnKey,
      stateFile,
      nextState: {
        $schema: "portable-kb/turn-correlation-state/v1",
        sessionKey,
        sequence: nextSequence,
        active: { turnKey, promptSha256 },
        lastStop: previous.lastStop ?? null,
        updatedAt: now,
      },
    };
  }

  const rawStopIdentity = safeString(event.turn_id)
    || hash(`${safeString(event.last_assistant_message)}\0${safeString(event.transcript_path)}`);
  const stopIdentitySha256 = hash(`codex-stop\0${rawStopIdentity}`);
  let turnKey;
  if (
    validTurnKey(previous.active?.turnKey)
  ) {
    turnKey = previous.active.turnKey;
  } else if (
    previous.lastStop?.identitySha256 === stopIdentitySha256
    && validTurnKey(previous.lastStop?.turnKey)
  ) {
    turnKey = previous.lastStop.turnKey;
  } else {
    turnKey = `t_${hash(`codex-stop-turn\0${sessionKey}\0${stopIdentitySha256}`).slice(0, 32)}`;
  }
  return {
    turnKey,
    stateFile,
    nextState: {
      $schema: "portable-kb/turn-correlation-state/v1",
      sessionKey,
      sequence,
      active: null,
      lastStop: { turnKey, identitySha256: stopIdentitySha256 },
      updatedAt: now,
    },
  };
}

async function main() {
  const config = await readJson(path.join(PROJECT_ROOT, "kb.config.json"));
  if (!config || config.schemaVersion !== 1) return;
  if (config.capture?.privateInbox !== "knowledge/private-inbox") return;

  const raw = await readStdin();
  const event = JSON.parse(raw || "{}");
  const eventName = safeString(event.hook_event_name);
  if (!new Set(["UserPromptSubmit", "Stop"]).has(eventName)) return;
  if (!await eventCwdBelongsToProject(safeString(event.cwd))) return;

  const rawSession = safeString(event.session_id) || `missing-session:${safeString(event.model)}`;
  const sessionKey = `s_${hash(`codex-session\0${rawSession}`).slice(0, 32)}`;
  const inbox = path.resolve(PROJECT_ROOT, config.capture.privateInbox);
  if (!isWithin(inbox, PROJECT_ROOT)) return;
  if (!await privateInboxIsSafe(PROJECT_ROOT, inbox)) return;
  await ensurePrivateDirectory(PROJECT_ROOT, inbox);
  if (!await privateInboxIsSafe(PROJECT_ROOT, inbox)) return;
  const runtime = path.join(inbox, ".runtime");
  await ensurePrivateDirectory(inbox, runtime);
  await pruneExpiredCaptures({
    runtime,
    retentionDays: config.capture.rawRetentionDays,
  });
  const lock = path.join(runtime, "locks", `${sessionKey}.lock`);
  const lockToken = await acquirePrivateLock(lock);
  if (!lockToken) return;

  try {
    const turn = await correlateTurn({ event, eventName, runtime, sessionKey });
    const { turnKey } = turn;
    const envelopeFile = path.join(runtime, "captures", sessionKey, `${turnKey}.json`);
    const existing = await readPrivateJson(runtime, envelopeFile, null);
    const now = new Date().toISOString();
    const cwd = safeString(event.cwd);
    const resolvedCwd = cwd ? path.resolve(cwd) : null;
    const cwdRelative = resolvedCwd && isWithin(resolvedCwd, PROJECT_ROOT)
      ? relativePath(PROJECT_ROOT, resolvedCwd) || "."
      : null;
    const envelope = existing ?? {
      $schema: "portable-kb/turn-envelope/v1",
      captureId: `cap_${hash(`${sessionKey}\0${turnKey}`).slice(0, 32)}`,
      sessionKey,
      turnKey,
      firstCapturedAt: now,
      eventNames: [],
      event: {
        runtime: "codex",
        model: safeString(event.model) || null,
        permissionMode: safeString(event.permission_mode) || null,
        cwdRelative,
      },
      messages: {},
      transcript: {
        status: "unavailable",
        format: "opaque-codex-transcript",
        deltas: [],
      },
      curation: {
        status: "pending",
        result: null,
        reason: null,
        resultVerifiedAt: null,
      },
      diagnosticCodes: [],
    };

    envelope.updatedAt = now;
    envelope.eventNames = [...new Set([...(envelope.eventNames ?? []), eventName])];

    if (eventName === "UserPromptSubmit") {
      envelope.messages.user = await storeMessage({
        value: event.prompt,
        kind: "user",
        runtime,
        sessionKey,
        turnKey,
      });
    }

    let transcriptResult = null;
    if (eventName === "Stop") {
      envelope.messages.assistant = await storeMessage({
        value: event.last_assistant_message,
        kind: "assistant",
        runtime,
        sessionKey,
        turnKey,
      });

      if (config.capture.storeRawTranscript) {
        transcriptResult = await captureTranscript({
          event,
          config,
          runtime,
          sessionKey,
          turnKey,
          envelope,
        });
        envelope.transcript = transcriptResult.transcript;
        if (transcriptResult.diagnosticCode) {
          envelope.diagnosticCodes = [...new Set([
            ...(envelope.diagnosticCodes ?? []),
            transcriptResult.diagnosticCode,
          ])];
        }
      }
    }

    envelope.completeness = completeness(envelope);
    await atomicWritePrivateFile(runtime, envelopeFile, `${JSON.stringify(envelope, null, 2)}\n`);
    await atomicWritePrivateFile(
      runtime,
      turn.stateFile,
      `${JSON.stringify(turn.nextState, null, 2)}\n`,
    );

    if (transcriptResult?.nextState && transcriptResult.stateFile) {
      await atomicWritePrivateFile(
        runtime,
        transcriptResult.stateFile,
        `${JSON.stringify(transcriptResult.nextState, null, 2)}\n`,
      );
    }
  } finally {
    await releasePrivateLock(lock, lockToken);
  }
}

try {
  await main();
} catch {
  // Capture must fail open. Private diagnostics are deliberately not emitted to stdout.
}

process.stdout.write('{"continue":true}\n');
