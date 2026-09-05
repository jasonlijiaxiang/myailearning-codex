// AI 网关（AI Gateway）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { aiGatewayBrief } from "../../module-briefs-platform.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "ai-gateway";

export default Object.freeze({
  slug,
  zh: "AI 网关",
  en: "AI Gateway",
  titleId: "ai-gateway-title",
  layerNo: "04",
  routeKind: "brief",
  introducedAt: "2026-07-17",
  updatedAt: "2026-08-01",
  requiredTerms: Object.freeze([slug,"model-routing","rate-limiting","semantic-cache","guardrails"]),
  knowledgeView: "gateway-policy-data-plane",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "342cad66994dc68ec21c90a7b31753746f7d2935c2d0dcacf0f0c80fa5a619d1",
  qaCoverageTags: Object.freeze(["架构定位","模型路由","可靠性","MCP 治理","路由策略","策略发布","故障降级","缓存隔离","成本归因","旁路治理","流式故障","身份链","容量与预算"]),
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: aiGatewayBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"集中管理模型路由、配额、策略、缓存与调用治理。","cue":"模型供应商和应用增多，成本、策略与流量开始失控"}),
  referenceShortTitle: "AI Gateway",
  additionalSourceIds: Object.freeze([]),
  englishUpdatedAt: "2026-08-01",
  englishReaderConfig: deepFreeze({"titleId":"ai-gateway-english-title","shortTitle":"AI Gateway","criticalBoundary":"A normalized payload can reduce integration cost without making model quality, tool support, context, error semantics, safety policy, data handling, or downstream authorization interchangeable. The gateway does not replace inference, MCP or A2A, the agent runtime, Evaluation, AI Ops, or business-system authorization. Every routed and fallback path still requires task-level evaluation and a tested recovery contract.","facts":[{"label":"Adoption test","value":"Remove duplicated controls or create measurable governance evidence"},{"label":"Policy context","value":"Principal × task × data class × region × model or tool × version"},{"label":"Request evidence","value":"Policy version × route reason × actual attempts × business end state"},{"label":"Failover boundary","value":"HTTP 200 ≠ capability, quality, region, safety, or authority equivalence"}],"directories":{"quick":[{"id":"ai-gateway-english-primer-title","label":"Policy and data plane","eyebrow":"Trace one governed request"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"AI 网关","facts":[{"label":"引入条件","value":"消除重复控制，或形成可验证的治理证据"},{"label":"策略上下文","value":"主体 × 任务 × 数据级别 × 地域 × 模型 / 工具 × 版本"},{"label":"请求证据","value":"策略版本 × 路由理由 × 实际调用尝试 × 业务终态"},{"label":"故障转移","value":"HTTP 200 ≠ 能力、质量、地域、安全或授权等价"}],"mechanismId":"principle","primer":{"id":"ai-gateway-extension-primer-title","label":"策略与数据面","eyebrow":"沿一次请求检查控制证据"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
