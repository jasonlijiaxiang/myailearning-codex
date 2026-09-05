// AgentKit（AgentKit）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { agentPlatformBriefs } from "../../module-content-agent-platforms.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";

const slug = "agentkit";

export default Object.freeze({
  slug,
  zh: "AgentKit",
  en: "AgentKit",
  titleId: "agentkit-title",
  layerNo: "04",
  routeKind: "brief",
  introducedAt: "2026-08-15",
  updatedAt: "2026-08-31",
  requiredTerms: Object.freeze(["agentkit","agentkit-runtime","agent-application","runtime-binding","deployment-mode","build-deploy-lifecycle","managed-agent-memory","agentkit-app-adapter"]),
  knowledgeView: "application-runtime-lifecycle",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  qaCoverageTags: Object.freeze(["产品定位","应用合同","CLI 生命周期","上线门禁","状态与身份","Memory 架构","可观测与性能"]),
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: agentPlatformBriefs.agentkit,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"管理 Agent 应用的构建、部署、Runtime、状态资源与运行治理。","cue":"Agent 已能本地运行，但云端入口、共享状态、身份和发布证据尚未闭环"}),
  referenceShortTitle: "AgentKit",
  additionalSourceIds: Object.freeze(["agentkit-platform-overview-2026-08-15","agentkit-cli-overview-2026-08-15","agentkit-cli-commands-2026-08-15","agentkit-config-reference-2026-08-15","agentkit-runtime-quickstart-2026-08-15","agentkit-memory-quickstart-2026-08-15","mem0-oss-overview-2026-08-15","mem0-platform-vs-oss-2026-08-15"]),
  englishUpdatedAt: "2026-08-15",
  englishReaderConfig: deepFreeze({"titleId":"agentkit-english-title","shortTitle":"AgentKit","criticalBoundary":"AgentKit manages application delivery, the Runtime lifecycle, and resource bindings. The application team still owns agent logic, trusted identity, shared state, business authorization, quality, load, recovery, and the release decision. Runtime Ready is a platform state, not proof of a customer SLO or production acceptance.","facts":[{"label":"Application contract","value":"Entry point × dependencies × configuration × invocation surface"},{"label":"Delivery chain","value":"Source → image → Runtime → target-environment verification"},{"label":"State boundary","value":"Shared sessions and governed memory stay separate from authoritative truth"},{"label":"Release proof","value":"Runtime Ready ≠ customer SLO or production acceptance"}],"directories":{"quick":[{"id":"agentkit-english-primer-title","label":"Application to Runtime","eyebrow":"From application contract to release evidence"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"AgentKit","facts":[{"label":"应用合同","value":"入口 × 依赖 × 配置 × 调用接口"},{"label":"交付链","value":"Source → Image → Runtime → 目标环境验证"},{"label":"状态边界","value":"共享 Session 与受治理 Memory 分层；Memory ≠ 权威事实"},{"label":"上线证明","value":"Runtime Ready ≠ 客户 SLO 或生产验收"}],"mechanismId":"principle","primer":{"id":"agentkit-extension-primer-title","label":"应用到 Runtime","eyebrow":"从应用合同到上线证据"}}),
  fieldKitEntries: Object.freeze([]),
});
