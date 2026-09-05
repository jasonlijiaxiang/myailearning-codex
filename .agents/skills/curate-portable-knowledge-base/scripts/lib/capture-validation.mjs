import path from "node:path";
import { PROCESSABLE_COMPLETENESS } from "./constants.mjs";
import { hash, isWithin, parseResultId, resolveProjectPath } from "./context.mjs";
import { resultExists, resultTracesCapture } from "./registries.mjs";
import { readPrivateFile, readPrivateJson, walkPrivateFiles } from "../private-runtime.mjs";

export async function validatePayload(runtime, payload, expectedPath, label, errors) {
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

export async function validateCaptureForProcessing(capture, runtime, resultId, registries) {
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

export async function validatePrivateCaptures(config, errors) {
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
