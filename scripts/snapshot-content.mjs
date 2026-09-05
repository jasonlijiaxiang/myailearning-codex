#!/usr/bin/env node
// 内容快照：把全站注册表内容序列化为确定性 JSON 并输出 SHA-256 与条目计数。
// 用途：重构类任务（移动代码不改内容）前后运行，哈希必须相同。
// 用法：node scripts/snapshot-content.mjs [--json]
import { createHash } from "node:crypto";
import { moduleContentRegistry } from "../app/module-content-registry.mjs";
import { publishedModules } from "../app/module-publication.mjs";
import { moduleList, layers } from "../app/knowledge-map.mjs";
import { sourceLedger, referenceModules } from "../app/reference-content.mjs";
import { terminology, glossaryGroups } from "../app/terminology.mjs";
import { englishModuleRegistry } from "../app/i18n/en/registry.mjs";
import { moduleCurriculumContent } from "../app/module-curriculum-content.mjs";
import { moduleLearningContent } from "../app/module-learning-content.mjs";
import { questionDirectoryItems } from "../app/question-index.mjs";

// S0-T3 会把 searchText 从 questionDirectoryItems 移到搜索索引，快照一律剔除该字段，
// 使哈希不因该字段的存放位置变化而改变。
const items = questionDirectoryItems.map((/** @type {any} */ item) => {
  const copy = { ...item };
  delete copy.searchText;
  return copy;
});

// routeKind 是路由注册而不是内容。S3 把 mcp/a2a/llm-inference 调整为 dedicated
// 属于路由重构；快照把这三个值投影回重构前的 brief，保证内容哈希不因路由
// 重构变化，同时仍对任何真实内容变动保持敏感（除这三个投影外逐字段参与哈希）。
/** @type {Readonly<Record<string, string>>} */
const routeKindSnapshotProjection = Object.freeze({ mcp: "brief", a2a: "brief", "llm-inference": "brief" });
const publishedModuleItems = publishedModules.map((/** @type {any} */ module) => {
  const projectedRouteKind = routeKindSnapshotProjection[module.slug];
  if (!projectedRouteKind) return module;
  return { ...module, routeKind: projectedRouteKind };
});

const payload = {
  moduleContentRegistry,
  publishedModules: publishedModuleItems,
  moduleList,
  layers,
  sourceLedger,
  referenceModules,
  terminology,
  glossaryGroups,
  englishModuleRegistry,
  moduleCurriculumContent,
  moduleLearningContent,
  questionDirectoryItems: items,
};

// 确定性序列化：对象键排序，数组保持原序。
/**
 * @param {any} value
 * @returns {any}
 */
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    /** @type {Record<string, any>} */
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = stable(value[key]);
    return out;
  }
  return value;
}

const json = JSON.stringify(stable(payload));
const hash = createHash("sha256").update(json, "utf8").digest("hex");

const counts = {
  模块: payload.publishedModules.length,
  问答: payload.questionDirectoryItems.length,
  来源: Object.keys(payload.sourceLedger).length,
  术语: Object.keys(payload.terminology).length,
};

if (process.argv.includes("--json")) {
  console.log(json);
} else {
  console.log(
    `sha256=${hash} 模块=${counts.模块} 问答=${counts.问答} 来源=${counts.来源} 术语=${counts.术语}`,
  );
}
