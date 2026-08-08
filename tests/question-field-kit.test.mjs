import assert from "node:assert/strict";
import test from "node:test";

import {
  fieldQuestionByRef,
  fieldQuestions,
  fallbackScripts,
  intentDefinitions,
  scenarioDefinitions,
} from "../app/question-field-kit.mjs";
import { questionDirectoryItems } from "../app/question-index.mjs";
import { filterQuestionDirectoryItems } from "../app/question-filter.mjs";
import { timeBudgetPaths } from "../app/home-learning-paths.mjs";

const itemsByKey = new Map(questionDirectoryItems.map((item) => [item.key, item]));

test("field kit intents are exactly the eight stable intent IDs", () => {
  assert.deepEqual(intentDefinitions.map((intent) => intent.id), [
    "concept-mechanism",
    "selection-strategy",
    "architecture-integration",
    "cost-procurement",
    "data-security-access",
    "evaluation-acceptance",
    "operations-reliability",
    "governance-compliance",
  ]);
});

test("every published question resolves to exactly one intent", () => {
  const intentIds = new Set(intentDefinitions.map((intent) => intent.id));
  for (const item of questionDirectoryItems) {
    assert.ok(intentIds.has(item.intentId), `${item.key} 必须解析出受控主意图，实际：${item.intentId}`);
  }
});

test("field questions bind to existing canonical questions and never copy answers", () => {
  const intentIds = new Set(intentDefinitions.map((intent) => intent.id));
  const scenarioIds = new Set(scenarioDefinitions.map((scenario) => scenario.id));
  const seenFieldIds = new Set();

  for (const field of fieldQuestions) {
    const { moduleId, questionNumber, expectedQuestion } = field.questionRef;
    const key = `${moduleId}-${questionNumber}`;
    const item = itemsByKey.get(key);

    assert.ok(item, `${field.fieldId} 引用的正式问题不存在：${key}`);
    // expectedQuestion 是防重编号的锚：正式问答顺序变化时必须在这里同步暴露。
    assert.equal(
      item.question,
      expectedQuestion,
      `${field.fieldId} 的 expectedQuestion 与正式问答不一致，正式问题可能已改写或重编号`,
    );

    assert.ok(!seenFieldIds.has(field.fieldId), `fieldId 必须唯一：${field.fieldId}`);
    seenFieldIds.add(field.fieldId);

    for (const forbidden of ["answer", "shortAnswer", "a", "depth", "ask", "basis", "evidence"]) {
      assert.ok(
        !Object.hasOwn(field, forbidden),
        `${field.fieldId} 不得复制正式答案字段：${forbidden}（答案唯一来源是 module-content-registry）`,
      );
    }

    assert.ok(intentIds.has(field.intentId), `${field.fieldId} 意图必须受控：${field.intentId}`);
    for (const scenarioId of field.scenarioIds) {
      assert.ok(scenarioIds.has(scenarioId), `${field.fieldId} 场景必须受控：${scenarioId}`);
    }
    assert.ok(["core", "situational"].includes(field.tier), `${field.fieldId} tier 必须受控：${field.tier}`);
    assert.ok(field.rationale?.trim(), `${field.fieldId} 必须写明入选理由`);
  }

  assert.ok(fieldQuestions.length >= 24, `现场核心题不应少于 24 道，实际 ${fieldQuestions.length}`);
});

test("fieldQuestionByRef is keyed consistently with the canonical question keys", () => {
  for (const [key, field] of Object.entries(fieldQuestionByRef)) {
    assert.ok(itemsByKey.has(key), `fieldQuestionByRef 的键必须是正式问题键：${key}`);
    assert.equal(`${field.questionRef.moduleId}-${field.questionRef.questionNumber}`, key);
  }
  assert.equal(Object.keys(fieldQuestionByRef).length, fieldQuestions.length);
});

test("customer phrases stay aliases and join the shared search projection", () => {
  for (const field of fieldQuestions) {
    const item = itemsByKey.get(`${field.questionRef.moduleId}-${field.questionRef.questionNumber}`);
    for (const phrase of field.customerPhrases) {
      assert.ok(typeof phrase === "string" && phrase.trim(), `${field.fieldId} 的客户口语不得为空`);
      assert.ok(
        item.searchText.includes(phrase),
        `客户口语必须进入正式问题的搜索投影：${phrase}`,
      );
    }
    if (field.displayPhrase) {
      assert.equal(item.displayPhrase, field.displayPhrase, `${field.fieldId} 的展示口语必须传导到问题目录`);
    }
  }
});

test("fallback scripts stay process guidance instead of factual answers", () => {
  assert.ok(fallbackScripts.length > 0, "必须存在兜底话术");
  for (const script of fallbackScripts) {
    assert.ok(script.trigger?.trim(), "兜底话术必须写明触发情形");
    for (const forbidden of ["answer", "evidence", "sourceId", "sourceIds"]) {
      assert.ok(!Object.hasOwn(script, forbidden), `兜底话术不得携带事实来源字段：${forbidden}`);
    }
  }
});

test("field-kit view filters to field questions and composes with intent", () => {
  const items = questionDirectoryItems.map((item) => ({
    key: item.key,
    moduleId: item.moduleId,
    tag: item.tag,
    text: item.searchText,
    intentId: item.intentId,
    tier: item.tier,
  }));

  const fieldOnly = filterQuestionDirectoryItems(items, { view: "field-kit" });
  assert.ok(fieldOnly.length > 0, "field-kit 视图不应为空");
  assert.ok(fieldOnly.every((item) => item.tier), "field-kit 视图只包含现场核心题");
  assert.equal(fieldOnly.length, fieldQuestions.length);

  const withIntent = filterQuestionDirectoryItems(items, { view: "field-kit", intentId: "selection-strategy" });
  assert.ok(withIntent.length > 0);
  assert.ok(withIntent.every((item) => item.intentId === "selection-strategy"));
});

test("time-budget paths point at real entries instead of a second answer store", () => {
  assert.ok(timeBudgetPaths.length >= 3, "时间预算路径至少覆盖速查、会前与系统学习");
  for (const path of timeBudgetPaths) {
    assert.ok(path.href?.startsWith("/"), `${path.id} 必须指向站内稳定地址`);
    assert.ok(path.deliverable?.trim(), `${path.id} 必须有可观察产物`);
    assert.ok(path.steps.length > 0, `${path.id} 必须有步骤`);
    for (const forbidden of ["answer", "depth", "evidence"]) {
      assert.ok(!Object.hasOwn(path, forbidden), `${path.id} 不得保存第二份答案内容`);
    }
  }
});
