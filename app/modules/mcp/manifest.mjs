// MCP · 模型上下文协议（Model Context Protocol）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { mcpBrief } from "../../module-briefs-app-protocol.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "mcp";

export default Object.freeze({
  slug,
  zh: "MCP · 模型上下文协议",
  en: "Model Context Protocol",
  titleId: "mcp-title",
  layerNo: "03",
  routeKind: "dedicated",
  introducedAt: "2026-07-17",
  updatedAt: "2026-09-04",
  requiredTerms: Object.freeze(["mcp","tool-discovery","identity-authorization","mcp-protocol-roles","mcp-primitives"]),
  knowledgeView: "mcp-host-server-boundary",
  readingProfile: "focused",
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "0e77279a34c57ab3814cf800dd0f9f9874955adbcf0e1097d88d6999c267cc61",
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: mcpBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"标准化模型与工具、数据资源及提示能力之间的连接。","cue":"团队要复用工具接入，并控制远程调用与授权边界"}),
  referenceShortTitle: "MCP",
  additionalSourceIds: Object.freeze(["mcp-2026-07-28-rc","mcp-specification-2026-07-28","mcp-changelog-2026-07-28","mcp-mrtr-2026-07-28","mcp-list-cache-2026-07-28","mcp-http-routing-2026-07-28","mcp-server-overview-2026-07-28","mcp-tools-2026-07-28","mcp-resources-2026-07-28","mcp-prompts-2026-07-28","mcp-tasks-extension"]),
  englishUpdatedAt: "2026-09-04",
  englishReaderConfig: deepFreeze({"titleId":"mcp-english-title","shortTitle":"MCP","criticalBoundary":"MCP standardizes discovery and invocation. It does not grant authority, establish a supplier's identity, validate business semantics, or make an action safe. Preserve the API gateway, identity, policy, transaction, validation, and audit controls that existed before MCP.","facts":[{"label":"Adoption condition","value":"Repeated integration across real Hosts or providers"},{"label":"Protocol primitives","value":"Tool · Resource · Prompt"},{"label":"Authority","value":"Existing identity, policy, gateway, and business systems"},{"label":"Version boundary","value":"2026-07-28 current · 2025-11-25 legacy"}],"directories":{"quick":[{"id":"mcp-english-primer-title","label":"Protocol boundary","eyebrow":"Standardize exchange, not authority"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false,"completeFocusedProjection":true}),
  unifiedBriefConfig: null,
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
