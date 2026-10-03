/** Full-attention teaching architecture, deliberately independent of a product. */
export const teachingMemoryConfig = Object.freeze({
  layers: 32, kvHeads: 8, headDimension: 128, bytesPerElement: 2,
  weightsGiB: 14, workspaceGiB: 6, deviceGiB: 64, reserveGiB: 4,
});

/**
 * All sequences have equal length; no prefix sharing, eviction or KV quantization.
 * @param {{ inputTokens: number; outputTokens: number; concurrency: number }} workload
 */
export function estimateTeachingMemory({ inputTokens, outputTokens, concurrency }) {
  for (const value of [inputTokens, outputTokens, concurrency]) {
    if (!Number.isSafeInteger(value) || value < 1) throw new RangeError("Token lengths and concurrency must be positive integers.");
  }
  const config = teachingMemoryConfig;
  const bytesPerToken = 2 * config.layers * config.kvHeads * config.headDimension * config.bytesPerElement;
  const activeTokens = concurrency * (inputTokens + outputTokens);
  const kvGiB = bytesPerToken * activeTokens / 2 ** 30;
  const memoryGiB = config.weightsGiB + config.workspaceGiB + kvGiB;
  return { bytesPerToken, activeTokens, kvGiB, memoryGiB, exceedsBudget: memoryGiB + config.reserveGiB > config.deviceGiB };
}

/**
 * The numerator is the intersection of quality and latency acceptance.
 * @param {readonly { qualityPassed: boolean; latencyPassed: boolean }[]} requests
 * @param {number} durationSeconds
 */
export function qualifyingRequestThroughput(requests, durationSeconds) {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) throw new RangeError("Duration must be positive.");
  return requests.filter((request) => request.qualityPassed && request.latencyPassed).length / durationSeconds;
}
