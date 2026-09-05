// AI 数据工程（Data Engineering for AI）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { dataEngineeringBrief } from "../../module-briefs-platform.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "data-engineering";

export default Object.freeze({
  slug,
  zh: "AI 数据工程",
  en: "Data Engineering for AI",
  titleId: "data-engineering-title",
  layerNo: "08",
  routeKind: "brief",
  introducedAt: "2026-07-17",
  updatedAt: "2026-08-31",
  requiredTerms: Object.freeze(["data-engineering","document-intelligence","dense-retrieval","data-contract","data-lineage","deletion-propagation"]),
  knowledgeView: "ai-data-lineage",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "f7ad1f475effd1b928140f2e60385dbd73a6eaf6fcbd2cef9fc0b7bc2431cb25",
  qaCoverageTags: Object.freeze(["建设顺序","向量库选型","权限与删除","生命周期","解析质量","用途治理","增量同步","索引发布","质量契约","主数据治理","数据出境"]),
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: dataEngineeringBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"把原始内容整理为能追溯来源、可删除的 AI 数据。","cue":"数据分散、解析失真、版本冲突或权限无法同步"}),
  referenceShortTitle: "Data Engineering",
  additionalSourceIds: Object.freeze([]),
  englishUpdatedAt: "2026-08-10",
  englishReaderConfig: deepFreeze({"titleId":"data-engineering-english-title","shortTitle":"AI Data","criticalBoundary":"Business and data owners decide authoritative meaning and permitted use; Data Engineering publishes traceable derivatives and propagates lifecycle state, while Security, IAM, and the application enforce current authorization.","facts":[{"label":"Admission conditions","value":"Authoritative source, permitted purpose, and stable identity"},{"label":"Lifecycle","value":"Connect → parse → adjudicate → derive → publish → withdraw"},{"label":"Production gate","value":"Verifiable structure, version, policy reference, quality, and lineage"},{"label":"Completion proof","value":"State reaches every derivative and negative probes pass"}],"directories":{"quick":[{"id":"data-engineering-english-primer-title","label":"Data lineage","eyebrow":"From authority to withdrawal"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"AI 数据","facts":[{"label":"准入条件","value":"权威来源、允许用途、稳定身份"},{"label":"生命周期","value":"连接 → 解析 → 裁决 → 派生 → 发布 → 撤回"},{"label":"生产门禁","value":"结构、版本、策略引用、质量与血缘可验证"},{"label":"完成证明","value":"状态到达全部派生层，并通过负向探针"}],"mechanismId":"principle","primer":{"id":"data-engineering-extension-primer-title","label":"数据血缘主线","eyebrow":"从权威源到撤回"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
