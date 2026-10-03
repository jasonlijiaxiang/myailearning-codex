import { deepFreeze } from "../freeze.mjs";
import { scenarioContent } from "../../scenario-content.mjs";

const content = scenarioContent["voice-service"];

/** @type {import("../types.mjs").ModuleManifest} */
const manifest = deepFreeze({
  slug: "voice-service",
  zh: "语音客服",
  en: "AI Voice Customer Service",
  locales: ["zh-CN"],
  category: "scenario",
  titleId: "voice-service-title",
  layerNo: "10",
  routeKind: "brief",
  introducedAt: "2026-10-03",
  updatedAt: "2026-10-03",
  requiredTerms: ["voice-service", "asr", "tts", "vad", "endpointing", "barge-in", "playback-cursor", "human-handoff"],
  knowledgeView: "voice-service-turn-delivery",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  contentContract: {"principle": ["data-quality-section=\"principle\""], "mechanism": ["data-knowledge-view"], "boundary": ["data-importance=\"critical\""], "cloud": ["data-quality-section=\"cloud\""], "customer": ["data-quality-section=\"qa\""]},
  discovery: {"summary": "把来电音频转成可确认、可中断、可接管的业务服务。", "cue": "电话机器人抢话、重复播报、听错编号或转人工后信息丢失"},
  referenceShortTitle: "语音客服",
  additionalSourceIds: ["openai-realtime-conversations", "openai-realtime-vad", "openai-realtime-transcription", "google-speech-v2-streaming-results", "google-dialogflow-cx-advanced-speech", "twilio-media-stream-messages"],
  englishUpdatedAt: null,
  englishReaderConfig: null,
  unifiedBriefConfig: {"shortTitle": "语音客服", "facts": [{"label": "采用条件", "value": "需要即时对话，且业务结果可核验"}, {"label": "对话控制", "value": "轮次 × 实际播放 × 业务状态"}, {"label": "接管条件", "value": "用户要求、身份失败或任务超出权限"}, {"label": "验收结果", "value": "正确处理、成功接管、再次来电与时延"}], "mechanismId": "principle", "primer": {"id": "voice-service-extension-primer-title", "label": "场景机制", "eyebrow": "从任务到可验收结果"}, "scenarioKind": "voice-service"},
  fieldKitEntries: [],
  brief: content.brief,
  curriculum: content.curriculum,
  learning: content.learning,
  extensionViews: content.extensionViews,
});

export default manifest;
