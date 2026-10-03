import assert from "node:assert/strict";
import test from "node:test";
import { documentReviewDecision, dramaRevisionImpact, reviewVideoCandidates, voiceInterruptionState } from "../app/scenario-teaching-model.mjs";

test("video acceptance treats required criteria as hard gates", () => {
  assert.deepEqual(reviewVideoCandidates(false).filter((candidate) => candidate.accepted).map((candidate) => candidate.id), ["候选 B"]);
  assert.equal(reviewVideoCandidates(true).filter((candidate) => candidate.accepted).length, 0);
});

test("drama asset lineage limits direct rework and frame conversion uses 24 fps", () => {
  assert.deepEqual(dramaRevisionImpact("costume", 6), { shotIds: ["S01", "S02"], seconds: 10, offsetMs: 250 });
  assert.deepEqual(dramaRevisionImpact("ring", 0), { shotIds: ["S02", "S03"], seconds: 11, offsetMs: 0 });
  assert.deepEqual(dramaRevisionImpact("voice", 12).shotIds, ["S01", "S02"]);
});

test("voice interruption preserves played state and bounds buffered residual", () => {
  assert.deepEqual(voiceInterruptionState(3000, 1200, 120), { retainedMs: 1200, discardedMs: 1800, residualMs: 120 });
  assert.equal(voiceInterruptionState(3000, 3000, 400).residualMs, 0);
  assert.equal(voiceInterruptionState(3000, 2900, 400).residualMs, 100);
  assert.throws(() => voiceInterruptionState(3000, 4000, 100), /Invalid/);
});

test("document confidence cannot override business validation or provenance", () => {
  const safe = documentReviewDecision(.9, true);
  assert.deepEqual(safe.filter((candidate) => candidate.accepted).map((candidate) => candidate.id), ["D02"]);
  const unsafe = documentReviewDecision(.9, false);
  assert.deepEqual(unsafe.filter((candidate) => candidate.accepted).map((candidate) => candidate.id), ["D01", "D02", "D03"]);
  assert.equal(documentReviewDecision(.99, true).filter((candidate) => candidate.accepted).length, 0);
});
