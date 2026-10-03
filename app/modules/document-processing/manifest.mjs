import { deepFreeze } from "../freeze.mjs";
import { scenarioContent } from "../../scenario-content.mjs";

const content = scenarioContent["document-processing"];

/** @type {import("../types.mjs").ModuleManifest} */
const manifest = deepFreeze({
  slug: "document-processing",
  zh: "智能文档处理",
  en: "Intelligent Document Processing",
  locales: ["zh-CN"],
  category: "scenario",
  titleId: "document-processing-title",
  layerNo: "10",
  routeKind: "brief",
  introducedAt: "2026-10-03",
  updatedAt: "2026-10-03",
  requiredTerms: ["document-processing", "ocr", "document-intelligence", "layout-analysis", "field-confidence", "field-provenance", "document-review", "straight-through-processing"],
  knowledgeView: "document-processing-evidence-review",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  contentContract: {"principle": ["data-quality-section=\"principle\""], "mechanism": ["data-knowledge-view"], "boundary": ["data-importance=\"critical\""], "cloud": ["data-quality-section=\"cloud\""], "customer": ["data-quality-section=\"qa\""]},
  discovery: {"summary": "把扫描件、表单和票据变成可回看原页、可审阅、可入系统的字段。", "cue": "OCR 文字能读，却有错行、缺字段、金额冲突或重复入账"},
  referenceShortTitle: "智能文档处理",
  additionalSourceIds: ["google-document-ai-response", "google-document-ai-evaluation", "google-document-ai-layout-parser", "google-document-ai-processors", "aws-textract-blocks", "aws-textract-limits", "aws-a2i-textract-review-conditions", "google-document-ai-deprecations"],
  englishUpdatedAt: null,
  englishReaderConfig: null,
  unifiedBriefConfig: {"shortTitle": "智能文档处理", "facts": [{"label": "处理对象", "value": "扫描件、PDF、表单与跨页表格"}, {"label": "字段依据", "value": "原页位置 × 识别值 × 变换与版本"}, {"label": "自动化条件", "value": "关键字段、交叉校验和权限全部通过"}, {"label": "交付结果", "value": "可审阅的草稿或受控业务写入"}], "mechanismId": "principle", "primer": {"id": "document-processing-extension-primer-title", "label": "场景机制", "eyebrow": "从任务到可验收结果"}, "scenarioKind": "document-processing"},
  fieldKitEntries: [],
  brief: content.brief,
  curriculum: content.curriculum,
  learning: content.learning,
  extensionViews: content.extensionViews,
});

export default manifest;
