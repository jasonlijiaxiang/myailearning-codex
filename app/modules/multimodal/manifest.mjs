// 多模态（Multimodal AI）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { multimodalBrief } from "../../module-briefs-app-protocol.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "multimodal";

export default Object.freeze({
  slug,
  zh: "多模态",
  en: "Multimodal AI",
  titleId: "multimodal-title",
  layerNo: "02",
  routeKind: "brief",
  introducedAt: "2026-07-17",
  updatedAt: "2026-08-31",
  requiredTerms: Object.freeze(["multimodal","vision-transformer","ocr","asr","document-intelligence"]),
  knowledgeView: "multimodal-evidence-pipeline",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "4df913dc37dccd7d10f4a83be80665e47ddb83998ab61acc5cf2b558b768dc38",
  qaCoverageTags: Object.freeze(["方案选择","成本与性能","实时交互","多模态安全","证据链","评估设计","结构恢复","输入预算","时序证据","语音交互","模态隐私","降级策略","发布责任","发布状态"]),
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: multimodalBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"让文本、图像、语音、视频与版面信息共同参与理解。","cue":"关键信息藏在表格、图纸、扫描件、录音或视频中"}),
  referenceShortTitle: "Multimodal",
  additionalSourceIds: Object.freeze(["gb-45438-2025","china-ai-content-labeling"]),
  englishUpdatedAt: "2026-08-10",
  englishReaderConfig: deepFreeze({"titleId":"multimodal-english-title","shortTitle":"Multimodal","criticalBoundary":"A larger model cannot recover pixels, sound, or pages that were never captured. Perception does not grant tool permission; MCP or A2A is not required for read-only understanding. Success at one gate does not authorize the next.","facts":[{"label":"Adoption condition","value":"Non-text information changes the task decision"},{"label":"Evidence coordinates","value":"Asset × page or region × interval or speaker"},{"label":"Route choice","value":"Compare specialist, native, and hybrid paths on the same difficult cases"},{"label":"Safe degradation","value":"Recapture, specialist processing, or accountable review"}],"directories":{"quick":[{"id":"multimodal-english-primer-title","label":"Evidence pipeline","eyebrow":"Locate information loss"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"多模态","facts":[{"label":"采用条件","value":"非文本信息会改变任务判断"},{"label":"证据坐标","value":"资产 × 页面/区域 × 时间段/说话人"},{"label":"路线选择","value":"专用解析、原生模型与混合路线同卷比较"},{"label":"安全降级","value":"重采、专用处理或责任复核；不继续猜"}],"mechanismId":"principle","primer":{"id":"multimodal-extension-primer-title","label":"证据管线","eyebrow":"定位信息损失"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
