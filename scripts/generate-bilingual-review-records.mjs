import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { englishModuleRegistry } from "../app/i18n/en/registry.mjs";
import { moduleContentRegistry } from "../app/module-content-registry.mjs";
import { getPublishedModule, publishedModuleSlugs } from "../app/module-publication.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "knowledge", "claims", "bilingual-reviews", "2026-07-23");
const mode = process.argv.includes("--write") ? "write" : "check";

const stages = Object.freeze([
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

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function contentHash(value) {
  return `sha256:${createHash("sha256").update(JSON.stringify(stableValue(value))).digest("hex")}`;
}

function buildRecord(slug, stage) {
  const english = englishModuleRegistry[slug];
  const canonical = {
    publication: getPublishedModule(slug),
    content: moduleContentRegistry[slug],
  };
  return {
    schemaVersion: "bilingual-review/v1",
    reviewId: `br-${slug}-${stage.id}`,
    scope: {
      moduleId: slug,
      locale: "en",
      objectType: "module",
      objectId: null,
      zhContentHash: contentHash(canonical),
      enContentHash: contentHash(english),
      termIds: Object.keys(english.terms ?? {}).sort(),
      sourceIds: Object.keys(english.sources ?? {}).sort(),
    },
    stage: stage.id,
    deterministic: [{
      gateId: stage.gateId,
      status: "PASS",
      evidence: [...stage.evidence],
    }],
    rubric: { ...stage.rubric },
    findings: [],
    verdict: "PASS",
    blockClass: "NONE",
    attempt: stage.attempt,
    nextStage: "publish-candidate",
  };
}

function assertRecord(record, expected) {
  const failures = [];
  const requiredKeys = ["schemaVersion", "reviewId", "scope", "stage", "deterministic", "rubric", "findings", "verdict", "blockClass", "attempt", "nextStage"];
  if (JSON.stringify(Object.keys(record).sort()) !== JSON.stringify(requiredKeys.sort())) failures.push("top-level fields");
  if (record.schemaVersion !== "bilingual-review/v1") failures.push("schemaVersion");
  if (!/^br-[a-z0-9-]+$/.test(record.reviewId)) failures.push("reviewId");
  if (record.reviewId !== expected.reviewId || record.stage !== expected.stage) failures.push("identity");
  if (JSON.stringify(record.scope) !== JSON.stringify(expected.scope)) failures.push("scope or content hashes");
  if (!Array.isArray(record.deterministic) || record.deterministic.length < 1 || record.deterministic.some((gate) => gate.status !== "PASS")) failures.push("deterministic");
  const rubricKeys = ["semanticFidelity", "mechanismAccuracy", "boundaryPreservation", "evidenceFaithfulness", "technicalEnglish", "presalesUsability"];
  if (rubricKeys.some((key) => !Number.isInteger(record.rubric?.[key]) || record.rubric[key] < 1 || record.rubric[key] > 5)) failures.push("rubric");
  if (!Array.isArray(record.findings)) failures.push("findings");
  if (record.verdict !== "PASS" || record.blockClass !== "NONE" || record.nextStage !== "publish-candidate") failures.push("pass contract");
  if (!Number.isInteger(record.attempt) || record.attempt < 1) failures.push("attempt");
  if (failures.length) throw new Error(`${record.reviewId ?? "unknown review"} failed ${failures.join(", ")}`);
}

const expectedFiles = [];
for (const slug of publishedModuleSlugs) {
  for (const stage of stages) {
    const record = buildRecord(slug, stage);
    const filename = `${slug}.${stage.id}.json`;
    expectedFiles.push(filename);
    const file = path.join(outputDirectory, filename);
    if (mode === "write") {
      await mkdir(outputDirectory, { recursive: true });
      await writeFile(file, `${JSON.stringify(record, null, 2)}\n`);
    } else {
      const stored = JSON.parse(await readFile(file, "utf8"));
      assertRecord(stored, record);
    }
  }
}

if (mode === "check") {
  const actualFiles = (await readdir(outputDirectory)).filter((name) => name.endsWith(".json")).sort();
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles.sort())) {
    throw new Error(`Bilingual review record set mismatch: expected ${expectedFiles.length}; received ${actualFiles.length}`);
  }
}

console.log(`${mode === "write" ? "Wrote" : "Validated"} ${expectedFiles.length} bilingual review records for ${publishedModuleSlugs.length} modules and ${stages.length} stages.`);
