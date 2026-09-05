const DAY_MS = 24 * 60 * 60 * 1000;

// S2-T6：来源 kind 收敛为 15 个枚举（app/reference-content.mjs 的 sourceLedger
// 与 /tmp/s6/kind-map.mjs 的 ENUM_TO_DAYS 保持一致），复核周期直接查表，
// 不再用正则匹配细分类目。
const ENUM_TO_DAYS = Object.freeze({
  "产品规格": 30,
  "官方公告": 30,
  "模型目录": 30,
  "官方文档": 90,
  "协议规范": 90,
  "官方源码": 90,
  "法规标准": 90,
  "安全治理": 90,
  "可观测规范": 90,
  "行业指南": 90,
  "论文": 180,
  "研究报告": 180,
  "标准": 180,
  "指南": 180,
  "实验与教材": 180,
});

/** @param {string} value */
export function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const timestamp = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const date = new Date(timestamp);
  if (
    date.getUTCFullYear() !== Number(year)
    || date.getUTCMonth() !== Number(month) - 1
    || date.getUTCDate() !== Number(day)
  ) return null;

  return date;
}

/** @param {any} source */
export function reviewCycleDaysFor(source) {
  const days = /** @type {Readonly<Record<string, number>>} */ (ENUM_TO_DAYS)[source.kind];
  if (!days) throw new Error(`No freshness review rule for source kind: ${source.kind}`);
  return days;
}

/** @param {any} source */
export function sourceFreshness(source, now = new Date()) {
  const verifiedAt = parseIsoDate(source.verifiedAt);
  if (!verifiedAt) return { status: "invalid", reviewCycleDays: null, ageDays: null };

  const reviewCycleDays = reviewCycleDaysFor(source);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const ageDays = Math.floor((today - verifiedAt.getTime()) / DAY_MS);

  if (ageDays < 0) return { status: "future", reviewCycleDays, ageDays };
  if (ageDays > reviewCycleDays) return { status: "stale", reviewCycleDays, ageDays };
  return { status: "fresh", reviewCycleDays, ageDays };
}
