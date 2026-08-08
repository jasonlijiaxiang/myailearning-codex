import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validateJsonSchema } from "../scripts/lib/json-schema-lite.mjs";
import { validateStage0Relationships } from "../scripts/lib/stage0-contract.mjs";

const schema = JSON.parse(readFileSync(new URL("../docs/change-plans/2026-08-ai-knowledge-base-content-improvement/stage-0/candidate-matrix.schema.json", import.meta.url), "utf8"));
const matrix = JSON.parse(readFileSync(new URL("../docs/change-plans/2026-08-ai-knowledge-base-content-improvement/stage-0/candidate-matrix.json", import.meta.url), "utf8"));
const coverage = JSON.parse(readFileSync(new URL("../docs/change-plans/2026-08-ai-knowledge-base-content-improvement/stage-0/source-coverage.json", import.meta.url), "utf8"));
const occurrencesDocument = JSON.parse(readFileSync(new URL("../docs/change-plans/2026-08-ai-knowledge-base-content-improvement/stage-0/source-occurrences.json", import.meta.url), "utf8"));
const occurrenceMapDocument = JSON.parse(readFileSync(new URL("../docs/change-plans/2026-08-ai-knowledge-base-content-improvement/stage-0/occurrence-candidate-map.json", import.meta.url), "utf8"));

function clone(value) {
  return structuredClone(value);
}

test("Stage 0 canonical matrix satisfies the complete repository schema subset", () => {
  assert.deepEqual(validateJsonSchema(matrix, schema, "candidate-matrix.json"), []);
});

test("Stage 0 schema validation rejects nested array item and enum failures", () => {
  const invalidLocation = clone(matrix);
  invalidLocation.candidates[0].currentLocations = [null];
  assert.ok(validateJsonSchema(invalidLocation, schema).some((error) => error.includes("currentLocations[0]")));

  const invalidEnum = clone(matrix);
  invalidEnum.candidates[0].coverageStatus = "invented";
  assert.ok(validateJsonSchema(invalidEnum, schema).some((error) => error.includes("coverageStatus") && error.includes("enum")));
});

test("Stage 0 schema validation rejects missing and additional nested properties", () => {
  const missingRequired = clone(matrix);
  delete missingRequired.candidates[0].summary;
  assert.ok(validateJsonSchema(missingRequired, schema).some((error) => error.includes("missing required property summary")));

  const additional = clone(matrix);
  additional.candidates[0].unexpected = true;
  assert.ok(validateJsonSchema(additional, schema).some((error) => error.includes("unexpected property unexpected")));
});

test("Stage 0 relationships enforce one canonical candidate per occurrence", () => {
  assert.doesNotThrow(() => validateStage0Relationships({ matrix, coverage, occurrencesDocument, occurrenceMapDocument }));

  const duplicated = clone(matrix);
  duplicated.candidates.find((candidate) => candidate.candidateId === "C-037").sourceOccurrenceIds.push("O-P-B6");
  assert.throws(
    () => validateStage0Relationships({ matrix: duplicated, coverage, occurrencesDocument, occurrenceMapDocument }),
    /必须且只能归入一个候选/,
  );

  const mismatchedMap = clone(occurrenceMapDocument);
  mismatchedMap.mapping["O-P-B6"].candidateId = "C-037";
  assert.throws(
    () => validateStage0Relationships({ matrix, coverage, occurrencesDocument, occurrenceMapDocument: mismatchedMap }),
    /映射为 C-037.*矩阵归属为 C-015/,
  );
});

test("screened artifacts require an exact reverse occurrence ledger", () => {
  const screenedCoverage = clone(coverage);
  const artifact = screenedCoverage.artifacts.find((item) => item.artifactId === "t-practice-pack");
  artifact.screenStatus = "screened";
  artifact.screenedUnitCount = artifact.expectedUnitCount;
  assert.throws(
    () => validateStage0Relationships({ matrix, coverage: screenedCoverage, occurrencesDocument, occurrenceMapDocument }),
    /screened 时 occurrenceIds 必须与已提取 occurrence 精确一致/,
  );
});

test("Stage 0 structural command reports the incomplete coverage state honestly", () => {
  const output = execFileSync(process.execPath, ["scripts/stage0-validate.mjs"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
  });
  assert.match(output, /structural validation passed/);
  assert.match(output, /492 inputs remain pending\/blocked/);
});
