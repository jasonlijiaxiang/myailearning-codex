#!/usr/bin/env node
// 构建期生成 public/search/*.json（搜索索引静态 JSON），由 scripts/run-vinext.mjs
// 在 build 与 dev 启动前调用；失败会阻断启动。产物已由 .gitignore 排除。
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildKnowledgeSearchEntries, buildQuestionSearchText } from "../app/search-index.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "public", "search");

mkdirSync(outputDirectory, { recursive: true });

const files = {
  "knowledge.zh.json": buildKnowledgeSearchEntries("zh"),
  "knowledge.en.json": buildKnowledgeSearchEntries("en"),
  "questions.zh.json": buildQuestionSearchText("zh"),
  "questions.en.json": buildQuestionSearchText("en"),
};

for (const [filename, payload] of Object.entries(files)) {
  writeFileSync(path.join(outputDirectory, filename), JSON.stringify(payload));
}

const sizes = Object.entries(files)
  .map(([filename, payload]) => `${filename}=${Buffer.byteLength(JSON.stringify(payload))}B`)
  .join(" ");
console.log(`search index: ${Object.keys(files).length} files written to public/search (${sizes})`);
