const DAY_MS = 24 * 60 * 60 * 1000;

const reviewRules = Object.freeze([
  Object.freeze({ pattern: /模型目录|价格|配额|产品规格/, days: 30 }),
  Object.freeze({ pattern: /产品文档|API 文档|技术文档|工程文档|SDK 文档|协议文档|模型行为规范|安全指南|安全工程文章|可观测规范|规范性文件|国家标准|法规实施页面/, days: 90 }),
  Object.freeze({ pattern: /论文|教材|研究综述|技术报告|任务特定研究|厂商实验|风险管理框架|架构指南|工程指南|实践指南|开放标准|互联网标准|国际标准/, days: 180 }),
]);

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

export function reviewCycleDaysFor(source) {
  const rule = reviewRules.find((candidate) => candidate.pattern.test(source.kind));
  if (!rule) throw new Error(`No freshness review rule for source kind: ${source.kind}`);
  return rule.days;
}

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
