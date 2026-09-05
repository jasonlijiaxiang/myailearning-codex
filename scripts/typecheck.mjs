#!/usr/bin/env node
// 类型检查门禁：运行 tsc --noEmit，按文件统计错误数，与基线 typecheck-baseline.json 比对。
// 规则：任一文件错误数超过基线、或出现基线中没有的文件 → exit 1；
//       文件错误数低于基线 → 打印提示「可以运行 --update 收紧基线」。
// 用法：node scripts/typecheck.mjs [--update]
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baselinePath = path.join(root, "typecheck-baseline.json");
const asUpdate = process.argv.includes("--update");

const result = spawnSync(
  path.join(root, "node_modules", ".bin", "tsc"),
  ["--noEmit", "--pretty", "false", "-p", "tsconfig.json"],
  { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);

if (result.error) {
  console.error(`typecheck: 无法运行 tsc：${result.error.message}`);
  process.exit(2);
}

// 逐行解析 "文件(行,列): error TSxxxx: 消息"，多行消息的续行不带该前缀。
const errorPattern = /^(.+?)\((\d+),(\d+)\): error (TS\d+):\s*(.*)$/;
const errorCountByFile = new Map();
const errorLinesByFile = new Map();
for (const line of result.stdout.split("\n")) {
  const match = errorPattern.exec(line);
  if (!match) continue;
  const [, file, , , code, message] = match;
  errorCountByFile.set(file, (errorCountByFile.get(file) ?? 0) + 1);
  const lines = errorLinesByFile.get(file) ?? [];
  lines.push(`${code}: ${message}`);
  errorLinesByFile.set(file, lines);
}

const total = [...errorCountByFile.values()].reduce((sum, count) => sum + count, 0);

if (asUpdate) {
  const baseline = {};
  for (const [file, count] of [...errorCountByFile.entries()].sort()) baseline[file] = count;
  writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`typecheck: baseline updated (${total} errors in ${errorCountByFile.size} files)`);
  process.exit(0);
}

const baseline = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, "utf8"))
  : {};

const offenders = [];
let improved = false;
for (const [file, count] of errorCountByFile) {
  const limit = baseline[file];
  if (limit === undefined) {
    offenders.push(file);
  } else if (count > limit) {
    offenders.push(file);
  } else if (count < limit) {
    improved = true;
  }
}
for (const file of Object.keys(baseline)) {
  if (!errorCountByFile.has(file)) {
    // 基线里的文件已零错误：同样属于收紧提示。
    improved = true;
  }
}

if (offenders.length > 0) {
  for (const file of offenders) {
    const limit = baseline[file];
    const count = errorCountByFile.get(file);
    const reason = limit === undefined
      ? `新出现的错误文件（基线外）`
      : `错误数超过基线（基线 ${limit}，当前 ${count}）`;
    console.error(`typecheck: FAIL ${file}：${reason}`);
    for (const line of errorLinesByFile.get(file)) console.error(`  ${line}`);
  }
  process.exit(1);
}

if (improved) console.log("提示：有文件的错误数低于基线，可以运行 npm run typecheck -- --update 收紧基线");
console.log(`typecheck: ${total} errors within baseline (${errorCountByFile.size} files)`);
process.exit(0);
