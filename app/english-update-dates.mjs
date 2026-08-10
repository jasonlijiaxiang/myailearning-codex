/**
 * 英文模块最后真实同步日期。
 *
 * 本轮中文单线交付不撰写英文内容；英文页面读取本表，而不是读取中文
 * module-publication.updatedAt，避免中文模块更新被误报为英文同步日期。
 *
 * 日期按每个英文模块最后一次真实撰写与专业审校提交维护。中文单线更新
 * 不得刷新本表；未来英文同步只更新对应模块，不修改中文 updatedAt。
 */
export const englishUpdatedDates = Object.freeze({
  "solution-patterns": "2026-08-01",
  "model-landscape": "2026-08-10",
  rag: "2026-07-29",
  "ai-agent": "2026-08-01",
  multimodal: "2026-07-30",
  mcp: "2026-08-01",
  a2a: "2026-08-01",
  evaluation: "2026-07-30",
  "ai-governance": "2026-08-10",
  security: "2026-07-30",
  "ai-gateway": "2026-08-01",
  "ai-ops": "2026-08-01",
  "predictive-ai-mlops": "2026-08-01",
  llm: "2026-07-29",
  "prompt-engineering": "2026-07-30",
  "fine-tuning": "2026-07-30",
  "llm-training": "2026-08-01",
  "llm-inference": "2026-08-01",
  "data-engineering": "2026-07-29",
  "ai-infra-platform": "2026-08-01",
  "ai-infra-compute": "2026-08-01",
});

export function getEnglishUpdatedAt(slug) {
  return englishUpdatedDates[slug] ?? null;
}
