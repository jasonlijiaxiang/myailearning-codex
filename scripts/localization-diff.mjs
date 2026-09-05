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

// 内容源文件候选：按文件名清单过滤 app/ 下的 .mjs，并纳入模块专属 manifest。
// S2-T3 后每模块配置落在 app/modules/<slug>/manifest.mjs，一并纳入中文侧差异。
const CANDIDATE_FILES = [
  /^module-briefs-.*\.mjs$/,
  /^module-content-agent-platforms\.mjs$/,
  /^module-(curriculum|learning)-.*\.mjs$/,
  /^rag-content\.mjs$/,
  /^agent-content\.mjs$/,
  /^prompt-content\.mjs$/,
];

const appDirectory = path.join(root, "app");
const files = readdirSync(appDirectory)
  .filter((name) => CANDIDATE_FILES.some((pattern) => pattern.test(name)));

// git pathspec 必须以仓库根为基准（此前把 app/ 下的裸文件名传给 git diff，
// 路径在仓库根下永远匹配不到，导致所有模块都误报“无差异”）。
const matches = files
  .map((name) => path.join("app", name))
  .filter((relativePath) => {
    const text = readFileSync(path.join(root, relativePath), "utf8");
    return text.includes(`"${slug}"`);
  });
const manifestPath = path.join("app", "modules", slug, "manifest.mjs");
try {
  readFileSync(path.join(root, manifestPath), "utf8");
  matches.push(manifestPath);
} catch {
  // 没有专属 manifest 的模块保持原有候选集合。
}

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
