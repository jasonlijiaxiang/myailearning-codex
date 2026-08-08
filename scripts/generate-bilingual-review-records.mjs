import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { assertJsonSchema } from "./lib/json-schema-lite.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(root, "knowledge", "localization-deferments.json");

export const stages = Object.freeze([
  Object.freeze({
    id: "xhigh-author",
    gateId: "english-module-contract",
    evidence: Object.freeze([
      "The English module resolves every canonical term and source ID.",
      "Stable section, question, content-item, and evidence-card IDs are present.",
      "The complete-edition audit passes for this module.",
    ]),
    rubric: Object.freeze({ semanticFidelity: 5, mechanismAccuracy: 5, boundaryPreservation: 5, evidenceFaithfulness: 5, technicalEnglish: 4, presalesUsability: 5 }),
    attempt: 1,
  }),
  Object.freeze({
    id: "xhigh-semantic",
    gateId: "canonical-alignment",
    evidence: Object.freeze([
      "Question order, evidence relationships, evidence-card relationships, and addedAt values match the canonical owner.",
      "Mechanism, decision, failure, control, and evidence boundaries were cross-reviewed against the Chinese source and primary evidence.",
    ]),
    rubric: Object.freeze({ semanticFidelity: 5, mechanismAccuracy: 5, boundaryPreservation: 5, evidenceFaithfulness: 5, technicalEnglish: 4, presalesUsability: 5 }),
    attempt: 1,
  }),
  Object.freeze({
    id: "xhigh-language",
    gateId: "technical-english",
    evidence: Object.freeze([
      "American-English and unexplained-Chinese-prose gates pass.",
      "Reader-facing copy uses professional technical English without language-status filler.",
      "Module navigation preserves the canonical reading-role order.",
    ]),
    rubric: Object.freeze({ semanticFidelity: 5, mechanismAccuracy: 5, boundaryPreservation: 5, evidenceFaithfulness: 5, technicalEnglish: 5, presalesUsability: 5 }),
    attempt: 1,
  }),
  Object.freeze({
    id: "ultra-exception",
    gateId: "exception-adjudication",
    evidence: Object.freeze([
      "The B1-B6 exception families are resolved and the shared-copy ownership policy covers the live conflict set.",
      "All canonical reading roles are present and all complete-edition, lint, build, and browser gates pass.",
      "No remaining content blocker was found in the final adjudication.",
    ]),
    rubric: Object.freeze({ semanticFidelity: 5, mechanismAccuracy: 5, boundaryPreservation: 5, evidenceFaithfulness: 5, technicalEnglish: 5, presalesUsability: 5 }),
    attempt: 2,
  }),
]);

function assertRecord(record, { slug, baseline, reviewSchema }) {
  const failures = [];
  try {
    assertJsonSchema(record, reviewSchema, `review ${record.reviewId ?? slug}`);
  } catch (error) {
    failures.push(error.message);
  }
  if (record.scope?.moduleId !== slug || record.scope?.locale !== "en" || record.scope?.objectType !== "module") failures.push("scope identity");
  if (record.scope?.zhContentHash !== baseline.zhReviewHash) failures.push("Chinese baseline hash");
  if (record.scope?.enContentHash !== baseline.enReviewHash) failures.push("English baseline hash");
  if (!Array.isArray(record.deterministic) || record.deterministic.some((gate) => gate.status !== "PASS")) failures.push("deterministic gates");
  if (record.verdict !== "PASS" || record.blockClass !== "NONE" || record.nextStage !== "publish-candidate") failures.push("verdict");
  if (failures.length) throw new Error(`${record.reviewId ?? slug} failed ${failures.join(", ")}`);
}

async function checkRecords(registry) {
  const reviewSchema = JSON.parse(await readFile(path.join(root, "knowledge", "schemas", "bilingual-review.schema.json"), "utf8"));
  let count = 0;
  for (const [slug, baseline] of Object.entries(registry.moduleBaselines)) {
    const reviewStages = [];
    for (const reviewId of baseline.reviewSetIds) {
      const registered = baseline.reviewFiles[reviewId];
      if (!registered) throw new Error(`${slug}: missing immutable baseline review ${reviewId}`);
      const record = JSON.parse(await readFile(path.join(root, registered.path), "utf8"));
      if (record.reviewId !== reviewId) throw new Error(`${slug}: review file identity does not match ${reviewId}`);
      assertRecord(record, { slug, baseline, reviewSchema });
      reviewStages.push(record.stage);
      count += 1;
    }
    const expectedStages = stages.map((stage) => stage.id).sort();
    if (JSON.stringify(reviewStages.sort()) !== JSON.stringify(expectedStages)) throw new Error(`${slug}: baseline review set must contain exactly the four review stages`);
  }
  console.log(`Validated ${count} immutable bilingual review records for ${Object.keys(registry.moduleBaselines).length} modules.`);
}

async function writeRecords() {
  throw new Error("Automatic PASS review generation is disabled; candidate records must come from an independent four-stage English review and then be registered explicitly.");
}

async function main() {
  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  if (process.argv.includes("--write")) await writeRecords();
  else await checkRecords(registry);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
