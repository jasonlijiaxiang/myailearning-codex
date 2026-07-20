export const CONTENT_UPDATE_POLICY_EFFECTIVE_DATE = "2026-07-20";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidContentUpdatedAt(value) {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
    && value >= CONTENT_UPDATE_POLICY_EFFECTIVE_DATE;
}

export function formatContentUpdatedAt(value) {
  if (value == null) return null;
  if (!isValidContentUpdatedAt(value)) {
    throw new Error(`updatedAt 必须是 ${CONTENT_UPDATE_POLICY_EFFECTIVE_DATE} 起的有效 YYYY-MM-DD 日期：${value}`);
  }

  return `更新于 ${value}`;
}
