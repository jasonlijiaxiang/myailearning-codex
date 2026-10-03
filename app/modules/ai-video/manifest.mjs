import { deepFreeze } from "../freeze.mjs";
import { scenarioContent } from "../../scenario-content.mjs";

const content = scenarioContent["ai-video"];

/** @type {import("../types.mjs").ModuleManifest} */
const manifest = deepFreeze({
  slug: "ai-video",
  zh: "AI视频",
  en: "AI Video Generation",
  locales: ["zh-CN"],
  category: "scenario",
  titleId: "ai-video-title",
  layerNo: "10",
  routeKind: "brief",
  introducedAt: "2026-10-03",
  updatedAt: "2026-10-03",
  requiredTerms: ["video-generation", "text-to-video", "image-to-video", "video-conditioning", "temporal-consistency", "shot-contract", "audio-video-sync"],
  knowledgeView: "video-shot-pipeline",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  contentContract: {"principle": ["data-quality-section=\"principle\""], "mechanism": ["data-knowledge-view"], "boundary": ["data-importance=\"critical\""], "cloud": ["data-quality-section=\"cloud\""], "customer": ["data-quality-section=\"qa\""]},
  discovery: {"summary": "从条件输入到可用镜头：理解视频模型的时间机制、控制边界、候选验收与任务恢复。", "cue": "为什么首帧很像，后面却变了？"},
  referenceShortTitle: "AI视频",
  additionalSourceIds: [],
  englishUpdatedAt: null,
  englishReaderConfig: null,
  unifiedBriefConfig: {"shortTitle": "AI视频", "facts": [{"label": "交付单位", "value": "经过验收的可用镜头"}, {"label": "核心变量", "value": "条件输入、时间关系、候选与返工"}, {"label": "证据口径", "value": "视觉、物理、语义和音画分别判断"}], "mechanismId": "principle", "primer": {"id": "ai-video-extension-primer-title", "label": "场景机制", "eyebrow": "从任务到可验收结果"}, "scenarioKind": "ai-video"},
  fieldKitEntries: [],
  brief: content.brief,
  curriculum: content.curriculum,
  learning: content.learning,
  extensionViews: content.extensionViews,
});

export default manifest;
