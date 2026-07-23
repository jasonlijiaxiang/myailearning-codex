import assert from "node:assert/strict";
import test from "node:test";

import { questionDirectoryItems } from "../app/question-index.mjs";

const REVIEWED_HIGH_OVERLAP_PAIRS = new Map([
  [
    "ai-agent-14::rag-10",
    "RAG 题聚焦检索管线的分阶段预算；Agent 题聚焦循环轮次、工具调用与停止条件，责任层不同。",
  ],
  [
    "ai-agent-16::mcp-1",
    "Agent 题比较 Function Calling、MCP 与 A2A 三层协作边界；MCP 题解释单次工具调用为何仍需要标准协议。",
  ],
  [
    "prompt-engineering-10::prompt-engineering-35",
    "前者用于售前识别可销售的服务机会，后者用于平台团队定义最小可运营能力，受众与交付决定不同。",
  ],
]);
const HIGH_OVERLAP_THRESHOLD = 0.55;

function normalizeQuestion(value) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{P}\p{S}\s]+/gu, "");
}

function bigrams(value) {
  const normalized = normalizeQuestion(value);
  const result = new Set();
  for (let index = 0; index < normalized.length - 1; index += 1) {
    result.add(normalized.slice(index, index + 2));
  }
  return result;
}

function diceSimilarity(left, right) {
  if (left.size === 0 && right.size === 0) return 1;
  let intersection = 0;
  for (const value of left) if (right.has(value)) intersection += 1;
  return (2 * intersection) / (left.size + right.size);
}

function pairKey(left, right) {
  return [left.key, right.key].sort().join("::");
}

test("published customer questions have no normalized duplicates", () => {
  const seen = new Map();
  for (const item of questionDirectoryItems) {
    const normalized = normalizeQuestion(item.question);
    assert.ok(normalized.length >= 4, `${item.key} 的问题文本过短，无法承担独立客户判断`);
    assert.equal(
      seen.has(normalized),
      false,
      `${item.key} 与 ${seen.get(normalized)} 是规范化后的同一道问题，应合并或重写为不同决策`,
    );
    seen.set(normalized, item.key);
  }
});

test("high lexical-overlap questions require an explicit human decision", () => {
  const candidates = [];
  for (let leftIndex = 0; leftIndex < questionDirectoryItems.length; leftIndex += 1) {
    const left = questionDirectoryItems[leftIndex];
    const leftBigrams = bigrams(left.question);
    for (let rightIndex = leftIndex + 1; rightIndex < questionDirectoryItems.length; rightIndex += 1) {
      const right = questionDirectoryItems[rightIndex];
      const similarity = diceSimilarity(leftBigrams, bigrams(right.question));
      if (similarity < HIGH_OVERLAP_THRESHOLD) continue;
      candidates.push({ left, right, similarity, key: pairKey(left, right) });
    }
  }

  const candidateKeys = new Set(candidates.map((candidate) => candidate.key));
  assert.ok(candidates.length > 0, "高词面重合门禁不得因阈值过高而空跑");
  for (const [key, rationale] of REVIEWED_HIGH_OVERLAP_PAIRS) {
    assert.ok(candidateKeys.has(key), `高重合复核记录已失效，应删除：${key}`);
    assert.ok(typeof rationale === "string" && rationale.trim().length >= 20, `${key} 必须说明保留两题的独立决策价值`);
  }

  const unreviewed = candidates
    .filter((candidate) => !REVIEWED_HIGH_OVERLAP_PAIRS.has(candidate.key))
    .map((candidate) => (
      `${candidate.left.key}「${candidate.left.question}」 ↔ `
      + `${candidate.right.key}「${candidate.right.question}」 (${candidate.similarity.toFixed(2)})`
    ));

  assert.deepEqual(
    unreviewed,
    [],
    "高词面重合只能作为人工复核候选；重复决策应合并，确有不同责任层或验收价值时登记复核理由",
  );
});
