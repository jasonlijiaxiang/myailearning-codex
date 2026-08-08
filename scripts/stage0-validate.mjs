import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { assertJsonSchema } from "./lib/json-schema-lite.mjs";
import { validateStage0Relationships } from "./lib/stage0-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const planRoot = path.join(root, "docs", "change-plans", "2026-08-ai-knowledge-base-content-improvement");
const stage0 = path.join(planRoot, "stage-0");

function readJson(rel) {
  return JSON.parse(readFileSync(path.join(stage0, rel), "utf8"));
}

function readText(rel) {
  return readFileSync(path.join(planRoot, rel), "utf8");
}

const schema = readJson("candidate-matrix.schema.json");
const matrix = readJson("candidate-matrix.json");
const coverage = readJson("source-coverage.json");
const occurrencesDocument = readJson("source-occurrences.json");
const occurrenceMapDocument = readJson("occurrence-candidate-map.json");

assertJsonSchema(matrix, schema, "candidate-matrix.json");

const candidates = matrix.candidates;
if (!Array.isArray(candidates) || candidates.length !== 63) {
  throw new Error(`候选数量异常：${candidates.length}（期望 63）`);
}
const ids = new Set();
for (const candidate of candidates) {
  if (ids.has(candidate.candidateId)) throw new Error(`候选 ID 重复：${candidate.candidateId}`);
  ids.add(candidate.candidateId);
  if (candidate.coverageStatus === "net-new" && !candidate.noMatchSearch?.trim()) {
    throw new Error(`${candidate.candidateId} 为 net-new 但缺少 noMatchSearch`);
  }
  if (!candidate.reviewDecision || !candidate.finalAction || candidate.decidedAt === undefined || !candidate.localeGate) {
    throw new Error(`${candidate.candidateId} 缺少正式裁决字段（reviewDecision/finalAction/decidedAt/localeGate）`);
  }
}

const { pendingCoverage } = validateStage0Relationships({ matrix, coverage, occurrencesDocument, occurrenceMapDocument });
if (matrix.canonicalStatus === "approved" && pendingCoverage.length) {
  throw new Error(`Stage 0 标记 approved，但仍有 ${pendingCoverage.length} 个 pending/blocked 输入`);
}

for (const candidate of candidates.filter((item) => item.coverageStatus?.startsWith("covered"))) {
  if (!candidate.currentLocations?.length || candidate.currentLocations.some((location) => !location.trim())) {
    throw new Error(`${candidate.candidateId} 标记 ${candidate.coverageStatus} 时必须提供精确 currentLocations`);
  }
}

const actualImplemented = candidates.filter((c) => c.finalAction === "implement").map((c) => c.candidateId).sort();

// ---- §9.2 正式写入门（01-STAGE-0-GAP-MATRIX-PLAN.md 第 9.2 节）----
// 知识内容写入必须同时满足：reviewDecision 已批准、finalAction=implement、targetStage/targetBatch 已确定、
// executionReadiness=ready、evidenceGate=pass、ownerStatus=resolved、localeGate=pass；
// approved-with-changes 时 approvedScope 必须冻结。
const APPROVED_DECISIONS = new Set(["approved", "approved-with-changes"]);
const writeGateChecks = [
  ["reviewDecision", (c) => APPROVED_DECISIONS.has(c.reviewDecision), "reviewDecision 必须为 approved / approved-with-changes"],
  ["targetStage", (c) => Boolean(c.targetStage), "targetStage 未确定（recommendedStage 不能代替最终路由）"],
  ["targetBatch", (c) => Boolean(c.targetBatch), "targetBatch 未确定（recommendedBatch 不能代替最终路由）"],
  ["executionReadiness", (c) => c.executionReadiness === "ready", "executionReadiness 必须为 ready"],
  ["evidenceGate", (c) => c.evidenceGate === "pass", "evidenceGate 必须为 pass；证据未就绪的部分应拆分候选或保持 hold"],
  ["ownerStatus", (c) => c.ownerStatus === "resolved", "ownerStatus 必须为 resolved（仅有 ownerId 不等于已解决归属）"],
  ["localeGate", (c) => c.localeGate === "pass", "localeGate 必须为 pass"],
  ["approvedScope", (c) => c.reviewDecision !== "approved-with-changes" || Boolean(c.approvedScope?.trim()), "approved-with-changes 必须冻结 approvedScope"],
];

const writeGateFailures = new Map();
for (const candidate of candidates.filter((c) => c.finalAction === "implement")) {
  for (const [field, ok, message] of writeGateChecks) {
    if (ok(candidate)) continue;
    if (!writeGateFailures.has(field)) writeGateFailures.set(field, { message, ids: [] });
    writeGateFailures.get(field).ids.push(candidate.candidateId);
  }
}

if (writeGateFailures.size > 0) {
  const report = [...writeGateFailures.entries()]
    .map(([field, { message, ids }]) => `  · ${field}（${ids.length} 项）：${message}\n    ${ids.join(", ")}`)
    .join("\n");
  throw new Error(
    `§9.2 正式写入门未通过：以下 finalAction=implement 的候选不满足写入条件。\n${report}\n` +
      "  修复方式：按计划 §6 拆分候选（稳定方法 vs 待核验结论），或在证据核验完成后更新对应字段并冻结 approvedScope。",
  );
}

// ---- plan document status consistency (B-02) ----
const master = readText("00-MASTER-PLAN.md");
const stage0Plan = readText("01-STAGE-0-GAP-MATRIX-PLAN.md");
const readme = readText("README.md");
const reviewSummary = readText("stage-0/review-summary.md");

const mustContain = [
  [master, /状态：`approved-for-execution`/, "00-MASTER 头部状态应为 approved-for-execution"],
  [stage0Plan, /状态：`incomplete`/, "01-STAGE-0 头部状态应诚实标记 incomplete"],
  [reviewSummary, /状态：`incomplete`/, "review-summary 状态应诚实标记 incomplete"],
];

for (const [text, pattern, message] of mustContain) {
  if (!pattern.test(text)) throw new Error(`计划状态一致性失败：${message}`);
}

const mustNotContain = [
  [readme, /内容实施\s*\|\s*未开始/, "README 不应再声明内容实施未开始"],
  [readme, /联合 Review 中/, "README 不应再声明第 1～5 阶段处于联合 Review 中"],
  [master, /Review 中/, "00-MASTER 阶段表不应再声明阶段处于 Review 中"],
];

for (const [text, pattern, message] of mustNotContain) {
  if (pattern.test(text)) throw new Error(`计划状态一致性失败：${message}`);
}

console.log(
  `Stage 0 structural validation passed: ${candidates.length} candidates, ${actualImplemented.length} implemented, ${pendingCoverage.length} inputs remain pending/blocked.`,
);
