#!/usr/bin/env node
// 来源链接体检：对 sourceLedger 的每个 href 发 HEAD，失败再 GET；
// 并发 8、单请求超时 15 秒；非 2xx/3xx 汇总在末尾。永远 exit 0。
// 用法：node scripts/check-source-links.mjs [--limit N] [--json]
import { appendFileSync } from "node:fs";
import { sourceLedger } from "../app/reference-content.mjs";

const CONCURRENCY = 8;
const TIMEOUT_MS = 15_000;

function parseLimit() {
  const index = process.argv.indexOf("--limit");
  if (index === -1) return null;
  const value = Number(process.argv[index + 1]);
  return Number.isInteger(value) && value > 0 ? value : null;
}

async function probe(href) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const attempt = async (method) => {
    try {
      const response = await fetch(href, { method, redirect: "follow", signal: controller.signal, headers: { "user-agent": "fieldbook-source-link-check/1.0" } });
      return { status: response.status, ok: response.ok };
    } catch {
      return null;
    }
  };
  try {
    const head = await attempt("HEAD");
    if (head) return head;
    return (await attempt("GET")) ?? { status: 0, ok: false };
  } finally {
    clearTimeout(timeout);
  }
}

const entries = Object.entries(sourceLedger);
const limit = parseLimit();
const targets = limit ? entries.slice(0, limit) : entries;
const results = [];

let cursor = 0;
async function worker() {
  while (cursor < targets.length) {
    const [sourceId, source] = targets[cursor];
    cursor += 1;
    const { status } = await probe(source.href);
    results.push({ sourceId, href: source.href, status, reachable: status >= 200 && status < 400 });
  }
}
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targets.length) }, () => worker()));
results.sort((left, right) => left.sourceId.localeCompare(right.sourceId));

const failed = results.filter((result) => !result.reachable);
const summaryLine = `checked ${results.length}/${entries.length} source links; unreachable: ${failed.length}`;
if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ checked: results.length, total: entries.length, failed }, null, 2));
} else {
  console.log("status | sourceId | href");
  for (const result of results) console.log(`${result.status} | ${result.sourceId} | ${result.href}`);
  console.log(summaryLine);
  for (const result of failed) console.log(`UNREACHABLE ${result.sourceId} (${result.status}): ${result.href}`);
}
if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = ["## Source link check", "", "| status | sourceId | href |", "| --- | --- | --- |"];
  for (const result of failed) lines.push(`| ${result.status} | ${result.sourceId} | ${result.href} |`);
  lines.push("", `**${summaryLine}**`);
  try {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
  } catch {
    // summary 写入失败不影响检查结果
  }
}
process.exit(0);
