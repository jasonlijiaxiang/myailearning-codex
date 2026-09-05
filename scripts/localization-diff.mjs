#!/usr/bin/env node
// 轻量双语差异报告：npm run localization:diff -- <slug>
// 打印自该模块上次英文同步提交以来，其中文内容源文件的 git diff --stat。
// 尽力而为的报告工具，永远 exit 0。
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2];

if (!slug) {
  console.error("usage: node scripts/localization-diff.mjs <slug>");
  process.exit(0);
}

const status = JSON.parse(readFileSync(path.join(root, "knowledge", "localization", "status.json"), "utf8"));
const record = status.modules[slug];
if (!record) {
  console.error(`unknown module slug: ${slug}`);
  process.exit(0);
}

// 内容源文件候选：按文件名清单过滤 app/ 下的 .mjs。
const CANDIDATE_FILES = [
  /^module-briefs-.*\.mjs$/,
  /^module-content-agent-platforms\.mjs$/,
  /^module-(curriculum|learning)-.*\.mjs$/,
  /^rag-content\.mjs$/,
  /^agent-content\.mjs$/,
  /^prompt-content\.mjs$/,
];

const files = readdirSync(path.join(root, "app"))
  .filter((name) => CANDIDATE_FILES.some((pattern) => pattern.test(name)));

const matches = files.filter((name) => {
  const text = readFileSync(path.join(root, "app", name), "utf8");
  return text.includes(`"${slug}"`);
});

console.log(`# ${slug} 状态：${record.status}（enSyncedCommit ${record.enSyncedCommit}）`);
if (record.status === "deferred") console.log(`# 延期原因：${record.reason}`);
console.log(`# 中文内容源文件（${matches.length} 个命中）`);
if (matches.length === 0) {
  console.log("（无命中文件）");
} else {
  const args = ["-C", root, "diff", "--stat", `${record.enSyncedCommit}`, "HEAD", "--", ...matches];
  const output = execFileSync("git", args, { encoding: "utf8" });
  console.log(output.trim() || "（无差异）");
}
