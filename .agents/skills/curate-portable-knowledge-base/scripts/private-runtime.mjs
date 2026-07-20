import { randomBytes } from "node:crypto";
import { constants as FS_CONSTANTS, promises as fs } from "node:fs";
import path from "node:path";

const PAYLOAD_DIRECTORIES = ["user-messages", "assistant-messages", "transcript-deltas"];
const MAINTENANCE_INTERVAL_MS = 24 * 60 * 60 * 1000;
const LOCK_STALE_MS = 60_000;
const LOCK_ATTEMPTS = 40;
const NO_FOLLOW = FS_CONSTANTS.O_NOFOLLOW ?? 0;

function isWithin(candidate, parent) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function unsafePrivatePath() {
  const error = new Error("Unsafe private runtime path");
  error.code = "UNSAFE_PRIVATE_PATH";
  return error;
}

function missingPath() {
  const error = new Error("Private runtime path does not exist");
  error.code = "ENOENT";
  return error;
}

function sameFile(left, right) {
  if (!left || !right) return false;
  if (left.dev !== undefined && right.dev !== undefined && left.ino && right.ino) {
    return left.dev === right.dev && left.ino === right.ino;
  }
  return left.size === right.size && left.mtimeMs === right.mtimeMs;
}

function runtimeLayout(runtime) {
  const resolved = path.resolve(runtime);
  const inbox = path.dirname(resolved);
  const knowledge = path.dirname(inbox);
  const projectRoot = path.dirname(knowledge);
  if (
    path.basename(resolved) !== ".runtime"
    || path.basename(inbox) !== "private-inbox"
    || path.basename(knowledge) !== "knowledge"
  ) {
    throw unsafePrivatePath();
  }
  return { runtime: resolved, inbox, projectRoot };
}

function inferRuntimeRoot(target) {
  let current = path.resolve(target);
  while (path.dirname(current) !== current) {
    if (
      path.basename(current) === ".runtime"
      && path.basename(path.dirname(current)) === "private-inbox"
      && path.basename(path.dirname(path.dirname(current))) === "knowledge"
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  throw unsafePrivatePath();
}

export async function privateInboxIsSafe(projectRoot, inbox) {
  const resolvedRoot = path.resolve(projectRoot);
  const resolvedInbox = path.resolve(inbox);
  const relative = path.relative(resolvedRoot, resolvedInbox);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return false;

  try {
    const rootStat = await fs.lstat(resolvedRoot);
    if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) return false;
    const rootReal = await fs.realpath(resolvedRoot);
    let current = resolvedRoot;
    for (const segment of relative.split(path.sep)) {
      current = path.join(current, segment);
      let stat;
      try {
        stat = await fs.lstat(current);
      } catch (error) {
        if (error?.code === "ENOENT") return true;
        return false;
      }
      if (stat.isSymbolicLink() || !stat.isDirectory()) return false;
      const real = await fs.realpath(current);
      if (!isWithin(real, rootReal)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function ensurePrivateDirectory(boundary, directory) {
  const root = path.resolve(boundary);
  const target = path.resolve(directory);
  if (!isWithin(target, root)) throw unsafePrivatePath();

  const rootStat = await fs.lstat(root);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) throw unsafePrivatePath();
  const rootReal = await fs.realpath(root);
  const relative = path.relative(root, target);
  let current = root;

  for (const segment of relative ? relative.split(path.sep) : []) {
    current = path.join(current, segment);
    try {
      await fs.mkdir(current, { mode: 0o700 });
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
    }
    const stat = await fs.lstat(current);
    if (stat.isSymbolicLink() || !stat.isDirectory()) throw unsafePrivatePath();
    const real = await fs.realpath(current);
    if (!isWithin(real, rootReal)) throw unsafePrivatePath();
  }

  try {
    await fs.chmod(target, 0o700);
  } catch {
    // Windows and some mounted filesystems do not implement POSIX modes.
  }
}

async function ensureRuntimeExists(runtime) {
  const layout = runtimeLayout(runtime);
  if (!await privateInboxIsSafe(layout.projectRoot, layout.inbox)) throw unsafePrivatePath();
  await ensurePrivateDirectory(layout.projectRoot, layout.inbox);
  await ensurePrivateDirectory(layout.inbox, layout.runtime);
  if (!await privateInboxIsSafe(layout.projectRoot, layout.inbox)) throw unsafePrivatePath();
}

async function validateRuntimePath(runtime, target, {
  allowMissing = false,
  leafKind = null,
} = {}) {
  const layout = runtimeLayout(runtime);
  const resolvedTarget = path.resolve(target);
  if (!isWithin(resolvedTarget, layout.runtime)) throw unsafePrivatePath();
  if (!await privateInboxIsSafe(layout.projectRoot, layout.inbox)) throw unsafePrivatePath();

  let runtimeStat;
  try {
    runtimeStat = await fs.lstat(layout.runtime);
  } catch (error) {
    if (error?.code === "ENOENT" && allowMissing) return null;
    throw error?.code === "ENOENT" ? missingPath() : error;
  }
  if (runtimeStat.isSymbolicLink() || !runtimeStat.isDirectory()) throw unsafePrivatePath();
  const runtimeReal = await fs.realpath(layout.runtime);
  const relative = path.relative(layout.runtime, resolvedTarget);
  let current = layout.runtime;
  let currentStat = runtimeStat;

  for (const segment of relative ? relative.split(path.sep) : []) {
    current = path.join(current, segment);
    try {
      currentStat = await fs.lstat(current);
    } catch (error) {
      if (error?.code === "ENOENT" && allowMissing) return null;
      throw error?.code === "ENOENT" ? missingPath() : error;
    }
    if (currentStat.isSymbolicLink()) throw unsafePrivatePath();
    if (current !== resolvedTarget && !currentStat.isDirectory()) throw unsafePrivatePath();
    const real = await fs.realpath(current);
    if (!isWithin(real, runtimeReal)) throw unsafePrivatePath();
  }

  if (leafKind === "file" && !currentStat.isFile()) throw unsafePrivatePath();
  if (leafKind === "directory" && !currentStat.isDirectory()) throw unsafePrivatePath();
  return currentStat;
}

export async function readPrivateFile(runtime, file, encoding = null) {
  const initial = await validateRuntimePath(runtime, file, { leafKind: "file" });
  const handle = await fs.open(file, FS_CONSTANTS.O_RDONLY | NO_FOLLOW);
  try {
    const opened = await handle.stat();
    if (!opened.isFile()) throw unsafePrivatePath();
    const current = await validateRuntimePath(runtime, file, { leafKind: "file" });
    if (!sameFile(opened, initial) || !sameFile(opened, current)) throw unsafePrivatePath();
    return encoding ? handle.readFile({ encoding }) : handle.readFile();
  } finally {
    await handle.close();
  }
}

export async function readPrivateJson(runtime, file, fallback = null) {
  try {
    return JSON.parse(await readPrivateFile(runtime, file, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function safeUnlink(runtime, file, { missingOkay = false } = {}) {
  try {
    await validateRuntimePath(runtime, file, { leafKind: "file" });
    await fs.unlink(file);
  } catch (error) {
    if (missingOkay && error?.code === "ENOENT") return;
    throw error;
  }
}

export async function atomicWritePrivateFile(runtime, file, data, mode = 0o600) {
  await ensureRuntimeExists(runtime);
  const parent = path.dirname(file);
  await ensurePrivateDirectory(runtime, parent);
  await validateRuntimePath(runtime, parent, { leafKind: "directory" });
  await validateRuntimePath(runtime, file, { allowMissing: true, leafKind: "file" });

  const temporary = `${file}.tmp-${process.pid}-${Date.now()}-${randomBytes(6).toString("hex")}`;
  let handle;
  try {
    handle = await fs.open(
      temporary,
      FS_CONSTANTS.O_CREAT | FS_CONSTANTS.O_EXCL | FS_CONSTANTS.O_WRONLY | NO_FOLLOW,
      mode,
    );
    await handle.writeFile(data);
    await handle.close();
    handle = null;
    await validateRuntimePath(runtime, temporary, { leafKind: "file" });
    await validateRuntimePath(runtime, parent, { leafKind: "directory" });
    await validateRuntimePath(runtime, file, { allowMissing: true, leafKind: "file" });

    try {
      await fs.rename(temporary, file);
    } catch (error) {
      if (error?.code !== "EEXIST" && error?.code !== "EPERM") throw error;
      await safeUnlink(runtime, file);
      await fs.rename(temporary, file);
    }
    await validateRuntimePath(runtime, file, { leafKind: "file" });
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
    await safeUnlink(runtime, temporary, { missingOkay: true }).catch(() => {});
    throw error;
  }
}

export async function atomicWriteJson(file, value) {
  const runtime = inferRuntimeRoot(file);
  await atomicWritePrivateFile(runtime, file, `${JSON.stringify(value, null, 2)}\n`);
}

async function readLockOwner(runtime, lockDirectory) {
  try {
    const raw = await readPrivateFile(runtime, path.join(lockDirectory, "owner"), "utf8");
    try {
      const parsed = JSON.parse(raw);
      return {
        token: typeof parsed.token === "string" ? parsed.token : null,
        pid: Number.isInteger(parsed.pid) ? parsed.pid : null,
        acquiredAt: Number.isFinite(Date.parse(parsed.acquiredAt ?? ""))
          ? Date.parse(parsed.acquiredAt)
          : null,
      };
    } catch {
      const token = raw.trim();
      const pid = Number.parseInt(token.split("-", 1)[0], 10);
      return { token, pid: Number.isInteger(pid) ? pid : null, acquiredAt: null };
    }
  } catch (error) {
    if (error?.code === "ENOENT") return { token: null, pid: null, acquiredAt: null };
    throw error;
  }
}

function processIsAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code !== "ESRCH";
  }
}

async function safeRenameDirectory(runtime, source, destination) {
  await validateRuntimePath(runtime, source, { leafKind: "directory" });
  await validateRuntimePath(runtime, path.dirname(destination), { leafKind: "directory" });
  await validateRuntimePath(runtime, destination, { allowMissing: true });
  await fs.rename(source, destination);
  await validateRuntimePath(runtime, destination, { leafKind: "directory" });
}

async function safeRemoveTree(runtime, target) {
  let stat;
  try {
    stat = await validateRuntimePath(runtime, target);
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  if (stat.isFile()) {
    await safeUnlink(runtime, target);
    return;
  }
  if (!stat.isDirectory()) throw unsafePrivatePath();
  const entries = await fs.readdir(target);
  for (const entry of entries) await safeRemoveTree(runtime, path.join(target, entry));
  await validateRuntimePath(runtime, target, { leafKind: "directory" });
  await fs.rmdir(target);
}

export async function acquirePrivateLock(lockDirectory) {
  const runtime = inferRuntimeRoot(lockDirectory);
  await ensureRuntimeExists(runtime);
  await ensurePrivateDirectory(runtime, path.dirname(lockDirectory));
  const token = `${process.pid}-${Date.now()}-${randomBytes(8).toString("hex")}`;

  for (let attempt = 0; attempt < LOCK_ATTEMPTS; attempt += 1) {
    await validateRuntimePath(runtime, path.dirname(lockDirectory), { leafKind: "directory" });
    try {
      await fs.mkdir(lockDirectory, { mode: 0o700 });
      await validateRuntimePath(runtime, lockDirectory, { leafKind: "directory" });
      await atomicWritePrivateFile(runtime, path.join(lockDirectory, "owner"), `${JSON.stringify({
        token,
        pid: process.pid,
        acquiredAt: new Date().toISOString(),
      })}\n`);
      return token;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
    }

    const lockStat = await validateRuntimePath(runtime, lockDirectory, { leafKind: "directory" });
    const owner = await readLockOwner(runtime, lockDirectory);
    const age = Date.now() - (owner.acquiredAt ?? lockStat.mtimeMs);
    if (age > LOCK_STALE_MS && !processIsAlive(owner.pid)) {
      const stale = `${lockDirectory}.stale-${Date.now()}-${randomBytes(4).toString("hex")}`;
      try {
        await safeRenameDirectory(runtime, lockDirectory, stale);
        await safeRemoveTree(runtime, stale);
        continue;
      } catch (error) {
        if (!["ENOENT", "EEXIST"].includes(error?.code)) throw error;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 25 + Math.min(attempt, 10) * 5));
  }
  return null;
}

export async function releasePrivateLock(lockDirectory, token) {
  const runtime = inferRuntimeRoot(lockDirectory);
  try {
    const owner = await readLockOwner(runtime, lockDirectory);
    if (owner.token !== token) return false;
    const released = `${lockDirectory}.released-${Date.now()}-${randomBytes(4).toString("hex")}`;
    await safeRenameDirectory(runtime, lockDirectory, released);
    const movedOwner = await readLockOwner(runtime, released);
    if (movedOwner.token !== token) throw unsafePrivatePath();
    await safeRemoveTree(runtime, released);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

export async function walkPrivateFiles(runtime, directory, suffix = null) {
  try {
    await validateRuntimePath(runtime, directory, { leafKind: "directory" });
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }

  const output = [];
  const entries = await fs.readdir(directory);
  for (const entry of entries) {
    const child = path.join(directory, entry);
    const stat = await validateRuntimePath(runtime, child);
    if (stat.isDirectory()) output.push(...await walkPrivateFiles(runtime, child, suffix));
    else if (stat.isFile() && (!suffix || entry.endsWith(suffix))) output.push(child);
    else if (!stat.isFile()) throw unsafePrivatePath();
  }
  return output;
}

function payloadRecords(capture) {
  return [
    { kind: "user", record: capture.messages?.user },
    { kind: "assistant", record: capture.messages?.assistant },
    ...(capture.transcript?.deltas ?? []).map((record) => ({ kind: "transcript", record })),
  ].filter(({ record }) => record && typeof record.path === "string" && record.path.length > 0);
}

function payloadBelongsToCapture(capture, entry) {
  const value = entry.record.path;
  if (value.includes("\\") || path.posix.normalize(value) !== value || path.posix.isAbsolute(value)) {
    return false;
  }
  if (!/^s_[0-9a-f]{32}$/.test(capture.sessionKey ?? "")) return false;
  if (!/^t_[0-9a-f]{32}$/.test(capture.turnKey ?? "")) return false;
  if (entry.kind === "user" || entry.kind === "assistant") {
    return value === `${entry.kind}-messages/${capture.sessionKey}/${capture.turnKey}.txt`;
  }
  return new RegExp(
    `^transcript-deltas/${capture.sessionKey}/g\\d{4}/\\d{6}-${capture.turnKey}\\.bin$`,
  ).test(value);
}

function resolvePayload(runtime, relative) {
  if (path.isAbsolute(relative)) return null;
  const normalized = relative.split(path.sep).join("/");
  const directory = PAYLOAD_DIRECTORIES.find((item) => normalized.startsWith(`${item}/`));
  if (!directory) return null;
  const resolved = path.resolve(runtime, relative);
  const payloadRoot = path.join(runtime, directory);
  return resolved !== payloadRoot && isWithin(resolved, payloadRoot) ? resolved : null;
}

async function removeEmptyParents(runtime, start, stop) {
  let current = path.dirname(start);
  while (isWithin(current, stop) && current !== stop) {
    try {
      await validateRuntimePath(runtime, current, { leafKind: "directory" });
      await fs.rmdir(current);
    } catch (error) {
      if (error?.code === "ENOENT") {
        current = path.dirname(current);
        continue;
      }
      return;
    }
    current = path.dirname(current);
  }
}

function expiredMessage(message) {
  if (!message || message.status !== "captured") return message;
  return {
    status: "expired",
    path: null,
    bytes: message.bytes,
    sha256: message.sha256,
  };
}

function validProcessedResult(value) {
  return typeof value === "string"
    && /^(candidate|claim|module|source|release):[a-z0-9][a-z0-9._/-]{1,127}$/i.test(value);
}

function eligibleForPurge(curation) {
  if (curation?.status === "processed") {
    return validProcessedResult(curation.result)
      && Number.isFinite(Date.parse(curation.resultVerifiedAt ?? ""));
  }
  if (curation?.status === "ignored") {
    return typeof curation.reason === "string" && Boolean(curation.reason.trim());
  }
  return false;
}

export async function pruneExpiredCaptures({
  runtime,
  retentionDays,
  now = Date.now(),
  force = false,
  verifyProcessed = null,
}) {
  const days = Number(retentionDays);
  const result = {
    purgedCaptures: 0,
    orphanPayloadsRemoved: 0,
    overdueUnresolved: 0,
    deferredProcessed: 0,
    deferredOrphanSweep: false,
    skippedInvalid: 0,
    skippedLocked: 0,
    skippedReason: null,
  };
  if (!Number.isFinite(days) || days <= 0) return result;

  const maintenanceRoot = path.join(runtime, "maintenance");
  const stateFile = path.join(maintenanceRoot, "retention-state.json");
  const maintenanceLock = path.join(maintenanceRoot, "retention.lock");
  const lockToken = await acquirePrivateLock(maintenanceLock);
  if (!lockToken) {
    result.skippedReason = "locked";
    return result;
  }

  try {
    if (!force) {
      const state = await readPrivateJson(runtime, stateFile, null);
      if (Number.isFinite(Date.parse(state?.lastSweepAt ?? ""))
        && now - Date.parse(state.lastSweepAt) < MAINTENANCE_INTERVAL_MS) {
        result.skippedReason = "recent";
        return result;
      }
    }

    const cutoff = now - days * 24 * 60 * 60 * 1000;
    const referencedPayloads = new Set();
    const referenceCounts = new Map();
    const capturesRoot = path.join(runtime, "captures");
    const captureFiles = await walkPrivateFiles(runtime, capturesRoot, ".json");
    const initialCaptures = new Map();

    for (const captureFile of captureFiles) {
      let capture;
      try {
        capture = await readPrivateJson(runtime, captureFile, null);
      } catch {
        result.skippedInvalid += 1;
        result.deferredOrphanSweep = true;
        continue;
      }
      if (!capture) {
        result.skippedInvalid += 1;
        result.deferredOrphanSweep = true;
        continue;
      }
      initialCaptures.set(captureFile, capture);
      for (const { record } of payloadRecords(capture)) {
        const payload = resolvePayload(runtime, record.path);
        if (!payload) continue;
        referencedPayloads.add(payload);
        referenceCounts.set(payload, (referenceCounts.get(payload) ?? 0) + 1);
      }
    }

    for (const captureFile of captureFiles) {
      const initial = initialCaptures.get(captureFile);
      if (!initial) continue;
      if (!/^s_[0-9a-f]{32}$/.test(initial.sessionKey ?? "")) {
        result.skippedInvalid += 1;
        continue;
      }

      const captureLock = path.join(runtime, "locks", `${initial.sessionKey}.lock`);
      const captureLockToken = await acquirePrivateLock(captureLock);
      if (!captureLockToken) {
        result.skippedLocked += 1;
        continue;
      }

      try {
        const capture = await readPrivateJson(runtime, captureFile, null);
        if (!capture || capture.sessionKey !== initial.sessionKey) {
          result.skippedInvalid += 1;
          continue;
        }
        const records = payloadRecords(capture);
        for (const { record } of records) {
          const payload = resolvePayload(runtime, record.path);
          if (payload) referencedPayloads.add(payload);
        }

        const unsafePayloadReference = records.some((entry) => {
          const payload = resolvePayload(runtime, entry.record.path);
          if (!payload) return false;
          return !payloadBelongsToCapture(capture, entry) || referenceCounts.get(payload) !== 1;
        });
        if (unsafePayloadReference) {
          result.skippedInvalid += 1;
          continue;
        }

        const lifecycleAt = Date.parse(
          capture.curation?.updatedAt ?? capture.updatedAt ?? capture.firstCapturedAt ?? "",
        );
        if (!Number.isFinite(lifecycleAt)) {
          result.skippedInvalid += 1;
          continue;
        }
        if (lifecycleAt >= cutoff) continue;
        if (!eligibleForPurge(capture.curation)) {
          result.overdueUnresolved += 1;
          continue;
        }
        if (capture.curation?.status === "processed") {
          if (typeof verifyProcessed !== "function") {
            result.deferredProcessed += 1;
            continue;
          }
          let verified = false;
          try {
            verified = await verifyProcessed(capture) === true;
          } catch {
            verified = false;
          }
          if (!verified) {
            result.overdueUnresolved += 1;
            continue;
          }
        }
        if (capture.rawPurgedAt && records.length === 0) continue;

        for (const { record } of records) {
          const payload = resolvePayload(runtime, record.path);
          if (!payload) continue;
          await safeUnlink(runtime, payload, { missingOkay: true });
          const payloadDirectory = record.path.split(/[\\/]/, 1)[0];
          await removeEmptyParents(runtime, payload, path.join(runtime, payloadDirectory));
          referencedPayloads.delete(payload);
        }

        capture.messages = {
          ...(capture.messages ?? {}),
          user: expiredMessage(capture.messages?.user),
          assistant: expiredMessage(capture.messages?.assistant),
        };
        const deltaCount = capture.transcript?.deltas?.length ?? 0;
        capture.transcript = {
          ...(capture.transcript ?? {}),
          status: capture.transcript?.status === "unavailable" ? "unavailable" : "expired",
          deltas: [],
          purgedDeltaCount: deltaCount,
        };
        capture.rawPurgedAt = new Date(now).toISOString();
        await atomicWriteJson(captureFile, capture);
        result.purgedCaptures += 1;
      } finally {
        await releasePrivateLock(captureLock, captureLockToken);
      }
    }

    if (!result.deferredOrphanSweep) {
      for (const directory of PAYLOAD_DIRECTORIES) {
        const root = path.join(runtime, directory);
        for (const payload of await walkPrivateFiles(runtime, root)) {
          if (referencedPayloads.has(payload)) continue;
          const stat = await validateRuntimePath(runtime, payload, { leafKind: "file" });
          if (stat.mtimeMs >= cutoff) continue;
          await safeUnlink(runtime, payload);
          await removeEmptyParents(runtime, payload, root);
          result.orphanPayloadsRemoved += 1;
        }
      }
    }

    await atomicWriteJson(stateFile, { lastSweepAt: new Date(now).toISOString() });
    return result;
  } finally {
    await releasePrivateLock(maintenanceLock, lockToken);
  }
}
