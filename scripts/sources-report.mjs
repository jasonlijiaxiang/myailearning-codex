#!/usr/bin/env node
// 来源新鲜度报告：按到期日升序列出全部来源，汇总已过期与即将到期的条数。
// 用途：来源过期不再阻断 check，本报告让过期来源在每次 check 输出里持续可见。
// 用法：node scripts/sources-report.mjs [--now YYYY-MM-DD] [--json]
// 永远 exit 0。
import { readFileSync } from "node:fs";
import { sourceLedger } from "../app/reference-content.mjs";
import { sourceFreshness } from "../app/source-freshness.mjs";

const DAY_MS = 24 * 60 * 60 * 1000;

function parseNow() {
  const argIndex = process.argv.indexOf("--now");
  if (argIndex !== -1) {
    const raw = process.argv[argIndex + 1];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      console.error(`sources-report: --now 需要 YYYY-MM-DD，收到 "${raw}"`);
      process.exit(2);
    }
    const date = new Date(`${raw}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) {
      console.error(`sources-report: 无法解析日期 "${raw}"`);
      process.exit(2);
    }
    return date;
  }
  return new Date();
}

function loadWaivers() {
  try {
    const raw = readFileSync(new URL("../knowledge/source-waivers.json", import.meta.url), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.waivers) ? parsed.waivers : [];
  } catch (error) {
    console.error(`sources-report: 无法读取 knowledge/source-waivers.json：${error.message}`);
    process.exit(2);
  }
}

function dueDateOf(source, freshness) {
  if (!freshness.reviewCycleDays) return null;
  const verifiedAt = Date.parse(`${source.verifiedAt}T00:00:00Z`);
  return new Date(verifiedAt + freshness.reviewCycleDays * DAY_MS);
}

function isWaived(sourceId, now, waivers) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return waivers.some((waiver) => {
    if (waiver.sourceId !== sourceId) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(waiver.until)) return false;
    return Date.parse(`${waiver.until}T00:00:00Z`) >= today;
  });
}

function main() {
  const now = parseNow();
  const waivers = loadWaivers();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  const rows = Object.entries(sourceLedger).map(([sourceId, source]) => {
    const freshness = sourceFreshness(source, now);
    const waived = freshness.status === "stale" && isWaived(sourceId, now, waivers);
    const due = dueDateOf(source, freshness);
    const dueDays = due ? Math.floor((due.getTime() - today) / DAY_MS) : null;
    return {
      sourceId,
      kind: source.kind,
      verifiedAt: source.verifiedAt,
      reviewCycleDays: freshness.reviewCycleDays,
      due: due ? due.toISOString().slice(0, 10) : null,
      dueDays,
      status: waived ? "waived" : freshness.status,
    };
  });

  rows.sort((a, b) => {
    if (a.due === null && b.due === null) return a.sourceId.localeCompare(b.sourceId);
    if (a.due === null) return 1;
    if (b.due === null) return -1;
    return a.due.localeCompare(b.due) || a.sourceId.localeCompare(b.sourceId);
  });

  const expired = rows.filter((row) => row.status === "stale" || row.status === "waived");
  const waivedCount = expired.filter((row) => row.status === "waived").length;
  const dueIn30 = rows.filter((row) => row.dueDays !== null && row.dueDays >= 0 && row.dueDays <= 30);
  const dueIn60 = rows.filter((row) => row.dueDays !== null && row.dueDays >= 0 && row.dueDays <= 60);

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ now: now.toISOString().slice(0, 10), rows, summary: {
      expired: expired.length,
      waived: waivedCount,
      dueIn30: dueIn30.length,
      dueIn60: dueIn60.length,
    } }, null, 2));
    return;
  }

  console.log("sourceId | kind | verifiedAt | 周期 | 到期日 | 状态");
  for (const row of rows) {
    console.log(
      `${row.sourceId} | ${row.kind} | ${row.verifiedAt} | ${row.reviewCycleDays ?? "-"} | ${row.due ?? "-"} | ${row.status}`,
    );
  }
  console.log(
    `已过期 ${expired.length} 条（豁免 ${waivedCount} 条）、30 天内到期 ${dueIn30.length} 条、60 天内到期 ${dueIn60.length} 条`,
  );
}

main();
