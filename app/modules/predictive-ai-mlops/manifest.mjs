// 预测式 AI 与 MLOps（Predictive AI & MLOps）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { predictiveAiMlopsBrief } from "../../module-briefs-governance-mlops.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "predictive-ai-mlops";

export default Object.freeze({
  slug,
  zh: "预测式 AI 与 MLOps",
  en: "Predictive AI & MLOps",
  titleId: "predictive-ai-mlops-title",
  layerNo: "06",
  routeKind: "brief",
  introducedAt: "2026-07-21",
  updatedAt: "2026-08-01",
  requiredTerms: Object.freeze(["predictive-ai-mlops","feature-store","model-registry","point-in-time-correctness","training-serving-skew","model-drift"]),
  knowledgeView: "predictive-model-lifecycle",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: predictiveAiMlopsBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"把预测模型的数据、特征、训练、注册、发布与监控连成可复现生命周期。","cue":"传统机器学习能训练，却无法稳定上线、回滚或解释线上退化"}),
  referenceShortTitle: "Predictive AI & MLOps",
  additionalSourceIds: Object.freeze([]),
  englishUpdatedAt: "2026-08-10",
  englishReaderConfig: deepFreeze({"titleId":"predictive-ai-mlops-english-title","shortTitle":"Predictive AI / MLOps","criticalBoundary":"Feature stores, pipelines, registries, and deployment guardrails can make controls repeatable, but they cannot decide whether a model is appropriate for a use, population, or consequence. A registry entry, successful pipeline, or drift alert is evidence—not authority. A technical rollback also cannot undo notifications, prices, eligibility decisions, or other business actions already taken.","facts":[{"label":"Decision contract","value":"Entity × prediction time × label window × action × error cost"},{"label":"Temporal integrity","value":"Each training row uses only information available at prediction time"},{"label":"Release identity","value":"Model × features × preprocessing × image × config × threshold × policy × approval"},{"label":"Update authority","value":"Drift opens investigation · training creates a candidate · the release gate replaces production"}],"directories":{"quick":[{"id":"predictive-ai-mlops-english-primer-title","label":"Prediction lifecycle","eyebrow":"From decision contract to mature ground truth"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"预测式 AI / MLOps","facts":[{"label":"任务合同","value":"实体 × 预测时点 × 标签窗口 × 业务动作 × 误判成本"},{"label":"时间正确","value":"每条训练样本只使用预测时点已可获得的信息"},{"label":"发布身份","value":"模型 × 特征 × 预处理 × 镜像 × 配置 × 阈值 × 策略 × 批准"},{"label":"更新边界","value":"漂移 → 调查；训练 → 候选；发布门 → 生产替换"}],"mechanismId":"principle","primer":{"id":"predictive-ai-mlops-extension-primer-title","label":"预测生命周期","eyebrow":"从任务合同到成熟真值"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
