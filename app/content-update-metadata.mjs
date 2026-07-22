export const CONTENT_UPDATE_POLICY_EFFECTIVE_DATE = "2026-07-20";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

export function isValidContentUpdatedAt(value) {
  return isValidIsoDate(value) && value >= CONTENT_UPDATE_POLICY_EFFECTIVE_DATE;
}

function formatContentDate(value, fieldName, prefix) {
  if (value == null) return null;
  if (!isValidContentUpdatedAt(value)) {
    throw new Error(`${fieldName} 必须是 ${CONTENT_UPDATE_POLICY_EFFECTIVE_DATE} 起的有效 YYYY-MM-DD 日期：${value}`);
  }

  return `${prefix} ${value}`;
}

export function formatModuleUpdatedAt(value) {
  return formatContentDate(value, "updatedAt", "最近更新于");
}

export function formatQuestionAddedAt(value) {
  return formatContentDate(value, "addedAt", "新增于");
}
