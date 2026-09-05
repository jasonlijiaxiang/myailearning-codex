// 评估（Evaluation）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { evaluationBrief } from "../../module-briefs-app-protocol.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "evaluation";

export default Object.freeze({
  slug,
  zh: "评估",
  en: "Evaluation",
  titleId: "evaluation-title",
  layerNo: "05",
  routeKind: "brief",
  introducedAt: "2026-07-17",
  updatedAt: "2026-08-31",
  requiredTerms: Object.freeze(["evaluation","evaluation-contract","golden-set","observability","evaluation-layers","llm-as-judge"]),
  knowledgeView: "evaluation-flywheel",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "6b7c274ad07e8010308e249563e65c4acf67df854498668b620de9c4a251636a",
  qaCoverageTags: Object.freeze(["模型选型","评估方法","RAG 诊断","Agent 评估","评审方法","持续评估","黄金集治理","切片评估","红队边界","多目标评估","统计可信度"]),
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: evaluationBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"把好不好用变成任务集、指标、回归和发布门禁。","cue":"PoC 看起来不错，但没人能说明是否达到上线标准"}),
  referenceShortTitle: "Evaluation",
  additionalSourceIds: Object.freeze([]),
  englishUpdatedAt: "2026-08-10",
  englishReaderConfig: deepFreeze({"titleId":"evaluation-english-title","shortTitle":"Evaluation","criticalBoundary":"A score is meaningful only with its contract: version, population, tasks, graders, trials, slices, uncertainty, and decision rules. An aggregate cannot compensate for unauthorized action, sensitive-data exposure, an incorrect business state, or another non-compensable failure.","facts":[{"label":"Evaluation unit","value":"Version tuple × tasks and slices × environment × graders"},{"label":"Grader split","value":"Code for authoritative state · calibrated judge for semantics · people for adjudication"},{"label":"Release gate","value":"Repeated trials, critical slices, uncertainty, and non-compensable gates"},{"label":"Owner handoff","value":"Evaluation recommends · AI Ops executes · Governance accepts exceptions"}],"directories":{"quick":[{"id":"evaluation-english-primer-title","label":"Evaluation contract","eyebrow":"Define the decision before the score"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"评估","facts":[{"label":"评估单元","value":"版本元组 × 任务切片 × 环境 × 评分器"},{"label":"评分分工","value":"代码验证终态 · 校准 Judge 评语义 · 人工裁决"},{"label":"发布门禁","value":"重复试验、关键切片、不确定性与不可补偿硬门"},{"label":"责任转交","value":"Evaluation 建议 · AI Ops 执行 · Governance 批准例外"}],"mechanismId":"principle","primer":{"id":"evaluation-extension-primer-title","label":"评估契约","eyebrow":"先定义决定，再定义分数"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
