// 场景解决方案（Solution Patterns）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { solutionPatternsBrief } from "../../module-briefs-app-protocol.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "solution-patterns";

export default Object.freeze({
  slug,
  zh: "场景解决方案",
  en: "Solution Patterns",
  titleId: "solution-patterns-title",
  layerNo: "01",
  routeKind: "brief",
  introducedAt: "2026-07-17",
  updatedAt: "2026-08-31",
  requiredTerms: Object.freeze(["solution-patterns","ai-finops","finops","unit-economics","cost-allocation","cost-to-serve","cost-anomaly"]),
  knowledgeView: "decision-blueprint",
  readingProfile: "focused",
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "52a7b6302cb7bafde13c1d47e1f25e06eb103debf951508a765d7ae67341f110",
  qaCoverageTags: Object.freeze(["方案边界","PoC 验收","TCO","场景选择","架构组合","智能客服","企业搜索","内容生成","AI Coding","数字人","ChatBI","会议助手","生产运营","成本边界","范围设计","单位经济","采购选型","价值衡量","内部结算","禁止动作"]),
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: solutionPatternsBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: null,
  discovery: deepFreeze({"summary":"把业务目标拆成可验证的 AI 能力、流程、责任与单位经济。","cue":"客户只有宏大愿景，还没有清晰场景、验收口径或完整成本边界"}),
  referenceShortTitle: "Solution Patterns & AI FinOps",
  additionalSourceIds: Object.freeze([]),
  englishUpdatedAt: "2026-08-10",
  englishReaderConfig: deepFreeze({"titleId":"solution-patterns-english-title","shortTitle":"Solution Patterns","criticalBoundary":"A production-ready solution must connect the current baseline to an authoritative business outcome and keep constraints, the minimum sufficient loop, ownership, evidence, operations, unit economics, and exit in one contract. Product icons, one successful demo, token price, or a technical metric cannot on its own establish production readiness or ROI.","facts":[{"label":"Decision start","value":"Outcome × baseline × authoritative end state × owner"},{"label":"Minimum loop","value":"Compare no AI, rules, and one model call; add only necessary capabilities"},{"label":"Delivery gates","value":"Discovery → PoC → pilot → production"},{"label":"Economics & exit","value":"Complete cost per accepted outcome + rollback, migration, and retirement"}],"directories":{"quick":[{"id":"solution-patterns-english-primer-title","label":"Decision blueprint","eyebrow":"From customer outcome to an accountable, testable loop"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false,"completeFocusedProjection":true}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"场景解决方案","facts":[{"label":"方案起点","value":"业务结果 × 当前基线 × 权威终态 × Owner"},{"label":"最小闭环","value":"先比较无 AI、规则与单次模型；只为必要责任增加组件"},{"label":"交付阶段","value":"Discovery → PoC → Pilot → Production"},{"label":"经营与退出","value":"每个达标结果的完整成本 + 回滚、迁移与停服"}],"mechanismId":"mechanism-summary","primer":{"id":"solution-pattern-primer-title","label":"决策蓝图","eyebrow":"从业务结果到可验收闭环"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
