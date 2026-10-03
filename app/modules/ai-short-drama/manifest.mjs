import { deepFreeze } from "../freeze.mjs";
import { scenarioContent } from "../../scenario-content.mjs";

const content = scenarioContent["ai-short-drama"];

/** @type {import("../types.mjs").ModuleManifest} */
const manifest = deepFreeze({
  slug: "ai-short-drama",
  zh: "AI短剧",
  en: "AI Short-form Drama",
  locales: ["zh-CN"],
  category: "scenario",
  titleId: "ai-short-drama-title",
  layerNo: "10",
  routeKind: "brief",
  introducedAt: "2026-10-03",
  updatedAt: "2026-10-03",
  requiredTerms: ["ai-short-drama", "character-bible", "shot-list", "continuity-ledger", "edit-timeline", "audio-video-sync", "picture-lock", "media-rights-ledger"],
  knowledgeView: "short-drama-production-lifecycle",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  contentContract: {"principle": ["data-quality-section=\"principle\""], "mechanism": ["data-knowledge-view"], "boundary": ["data-importance=\"critical\""], "cloud": ["data-quality-section=\"cloud\""], "customer": ["data-quality-section=\"qa\""]},
  discovery: {"summary": "从剧本到成片：组织角色、分镜、声音和版本，让多镜头叙事可检查、可返工、可交付。", "cue": "每条镜头都好看，为什么连起来不像同一场戏？"},
  referenceShortTitle: "AI短剧",
  additionalSourceIds: [],
  englishUpdatedAt: null,
  englishReaderConfig: null,
  unifiedBriefConfig: {"shortTitle": "AI短剧", "facts": [{"label": "交付单位", "value": "能连贯观看和追溯的作品"}, {"label": "核心变量", "value": "角色资产、镜头依赖、时间线与返工"}, {"label": "最后验收", "value": "叙事、音画、版本及使用范围"}], "mechanismId": "principle", "primer": {"id": "ai-short-drama-extension-primer-title", "label": "场景机制", "eyebrow": "从任务到可验收结果"}, "scenarioKind": "ai-short-drama"},
  fieldKitEntries: [],
  brief: content.brief,
  curriculum: content.curriculum,
  learning: content.learning,
  extensionViews: content.extensionViews,
});

export default manifest;
