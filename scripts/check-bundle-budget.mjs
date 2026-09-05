#!/usr/bin/env node
// 客户端产物预算：dist/client/assets/*.js 任一文件 > 250 KB 或总量超预算 → exit 1。
// 总量基线：阅读模式按需挂载后英文模块正文拆为按模块懒加载 chunk（改后实测
// 2,093,082 B），预算 = 实测 × 1.15 ≈ 2.4 MB；单文件 250 KB 上限不变。
// 先运行 npm run build。
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsDirectory = path.join(root, "dist", "client", "assets");

let names;
try {
  names = readdirSync(assetsDirectory).filter((name) => name.endsWith(".js"));
} catch {
  console.error(`bundle:budget: 找不到 ${assetsDirectory}（先运行 npm run build）`);
  process.exit(2);
}

const files = names
  .map((name) => ({ name, bytes: statSync(path.join(assetsDirectory, name)).size }))
  .sort((left, right) => right.bytes - left.bytes);
const total = files.reduce((sum, file) => sum + file.bytes, 0);
const budget = 2_407_044; // ≈ 2.4 MB（实测 2,093,082 × 1.15）

console.log("bundle:budget top 10:");
for (const file of files.slice(0, 10)) console.log(`  ${file.bytes} B  ${file.name}`);
console.log(`bundle:budget: 总量 ${total} B / ${files.length} 个文件（预算 ${budget} B）`);

const oversized = files.filter((file) => file.bytes > 250_000);
if (oversized.length > 0) {
  console.error(`bundle:budget: FAIL 单文件超 250 KB：${oversized.map((file) => `${file.name} (${file.bytes} B)`).join("、")}`);
  process.exit(1);
}
if (total > budget) {
  console.error(`bundle:budget: FAIL 总量 ${total} B 超过 ${budget} B`);
  process.exit(1);
}
console.log("bundle:budget: ok");
