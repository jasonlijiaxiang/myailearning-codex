import assert from "node:assert/strict";
import test from "node:test";

import { estimateTeachingMemory, qualifyingRequestThroughput } from "../app/inference-teaching-model.mjs";
import { moduleLearningContent } from "../app/module-learning-content.mjs";
import { ragLearningContent } from "../app/rag-content.mjs";
import { sourceLedger } from "../app/reference-content.mjs";

test("full-attention KV grows with total sequence length and concurrent sequences", () => {
  const baseline = estimateTeachingMemory({ inputTokens: 8192, outputTokens: 512, concurrency: 32 });
  assert.equal(baseline.bytesPerToken, 131072);
  assert.equal(baseline.kvGiB, 34);
  assert.equal(baseline.memoryGiB, 54);
  assert.equal(baseline.exceedsBudget, false);
  const doubledConcurrency = estimateTeachingMemory({ inputTokens: 8192, outputTokens: 512, concurrency: 64 });
  assert.equal(doubledConcurrency.kvGiB, 68);
  assert.equal(doubledConcurrency.exceedsBudget, true);
  assert.equal(estimateTeachingMemory({ inputTokens: 16384, outputTokens: 512, concurrency: 32 }).kvGiB, 66,
    "doubling only input does not double a nonzero output allocation");
  assert.throws(() => estimateTeachingMemory({ inputTokens: 0, outputTokens: 512, concurrency: 32 }), RangeError);
});

test("request Goodput counts the quality and latency intersection, never either marginal", () => {
  const requests = Array.from({ length: 100 }, (_, index) => ({
    qualityPassed: index < 80,
    latencyPassed: index < 60 || index >= 80 && index < 95,
  }));
  assert.equal(qualifyingRequestThroughput(requests, 10), 6);
  assert.throws(() => qualifyingRequestThroughput(requests, 0), RangeError);
});

test("worked examples declare assumptions, reasoning, result and limitations alongside valid sources", () => {
  const calculators = new Set(["attention", "zero-failure", "serial-bottleneck"]);
  for (const [slug, content] of [...Object.entries(moduleLearningContent), ["rag", ragLearningContent]]) {
    for (const lab of content.labs) {
      const example = lab.workedExample;
      if (!example) continue;
      for (const field of ["premise", "result", "boundary"]) assert.ok(example[field]?.trim(), `${slug}: ${field}`);
      assert.ok(example.steps.length > 0 && example.steps.every((/** @type {string} */ step) => step.trim()), `${slug}: reasoning steps`);
      if (example.calculator) assert.ok(calculators.has(example.calculator), `${slug}: supported calculator`);
      assert.ok(lab.sourceIds.every((/** @type {string} */ sourceId) => sourceLedger[sourceId]), `${slug}: resolvable sources`);
    }
  }
});
