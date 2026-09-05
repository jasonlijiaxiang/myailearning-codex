// VeADK（Volcengine Agent Development Kit）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { agentPlatformBriefs } from "../../module-content-agent-platforms.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";

const slug = "veadk";

export default Object.freeze({
  slug,
  zh: "VeADK",
  en: "Volcengine Agent Development Kit",
  titleId: "veadk-title",
  layerNo: "04",
  routeKind: "brief",
  introducedAt: "2026-08-15",
  updatedAt: "2026-08-31",
  requiredTerms: Object.freeze(["veadk","google-adk","agent-runner","short-term-memory","root-agent","agentkit-app-adapter","tool-loop"]),
  knowledgeView: "agent-definition-runtime-bridge",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  qaCoverageTags: Object.freeze(["产品定位","继承与版本","执行与状态","工具边界","多实例状态","状态分层","应用适配"]),
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: agentPlatformBriefs.veadk,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"用 Python 定义 Agent、Tool、Session 与 Memory，并把本地执行连接到正式应用入口。","cue":"团队需要从可运行 Demo 走向可测试、可封装的 Agent 代码"}),
  referenceShortTitle: "VeADK",
  additionalSourceIds: Object.freeze(["veadk-agent-source-2026-08-15","veadk-runner-source-2026-08-15","veadk-agentkit-integration-2026-08-15","veadk-short-term-memory-2026-08-15","veadk-builtin-tools-2026-08-15"]),
  englishUpdatedAt: "2026-08-15",
  englishReaderConfig: deepFreeze({"titleId":"veadk-english-title","shortTitle":"VeADK","criticalBoundary":"VeADK helps define and execute agent logic; it does not provision a cloud Runtime, establish trusted end-user identity, authorize business actions, or make process-local state safe across replicas. A registered Tool, completed local run, or successful create_agentkit_app call is not proof of permission, authoritative business completion, or production readiness.","facts":[{"label":"Pinned implementation","value":"VeADK Agent and Runner extend Google ADK abstractions"},{"label":"Execution record","value":"Versioned root_agent, Runner events, and Session scope"},{"label":"State boundary","value":"Conversation, long-term memory, and authoritative truth stay separate"},{"label":"Production handoff","value":"create_agentkit_app ≠ deployed Runtime or customer SLO"}],"directories":{"quick":[{"id":"veadk-english-primer-title","label":"Framework execution boundary","eyebrow":"From inheritance to application handoff"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"VeADK","facts":[{"label":"实现基线","value":"固定源码中 Agent 与 Runner 扩展 Google ADK"},{"label":"执行记录","value":"root_agent 版本 × Runner 事件 × Session 作用域"},{"label":"状态边界","value":"会话、长期记忆与权威事实分层"},{"label":"生产转交","value":"create_agentkit_app ≠ Runtime 已部署"}],"mechanismId":"principle","primer":{"id":"veadk-extension-primer-title","label":"Agent 交付桥","eyebrow":"定义、执行、状态、适配、证明"}}),
  fieldKitEntries: Object.freeze([]),
});
