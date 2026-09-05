// A2A · 智能体间协议（Agent2Agent Protocol）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { a2aBrief } from "../../module-briefs-app-protocol.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "a2a";

export default Object.freeze({
  slug,
  zh: "A2A · 智能体间协议",
  en: "Agent2Agent Protocol",
  titleId: "a2a-title",
  layerNo: "03",
  routeKind: "dedicated",
  introducedAt: "2026-07-17",
  updatedAt: "2026-09-04",
  requiredTerms: Object.freeze(["a2a","agent-card","a2a-message","a2a-task","artifact","agent-collaboration","identity-authorization"]),
  knowledgeView: "delegated-task-lifecycle",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "7f302462d608a14f80957008e03ff4dfcdcb1c136d71eb6b4957998223a253b0",
  qaCoverageTags: Object.freeze(["协议边界","架构选择","可靠性","审计与可观测","采用判断","故障恢复","取消语义","协作拓扑","发现信任","跨域委托","产物验收"]),
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: a2aBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"让独立 Agent 发现、委托、协作并跟踪持久任务。","cue":"多个团队或系统拥有各自 Agent，需要跨边界协作"}),
  referenceShortTitle: "A2A",
  additionalSourceIds: Object.freeze(["a2a-agent-discovery","a2a-extensions"]),
  englishUpdatedAt: "2026-09-04",
  englishReaderConfig: deepFreeze({"titleId":"a2a-english-title","shortTitle":"A2A","criticalBoundary":"A2A coordinates independently operated agents through a Message-or-Task contract. MCP or conventional APIs connect tools and data, while local orchestration keeps fine-grained work inside one trust domain. Discovery, protocol-level COMPLETED, and Artifact delivery establish neither authorization nor business acceptance.","facts":[{"label":"Adoption condition","value":"Independent-agent delegation across an ownership or trust boundary"},{"label":"Response object","value":"Message or server-created Task"},{"label":"Operating responsibility","value":"Delegator and provider validate separately"},{"label":"Completion evidence","value":"Task state + optional Artifact validation + business acceptance"}],"directories":{"quick":[{"id":"a2a-english-primer-title","label":"Message or Task","eyebrow":"Choose the response object"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: null,
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
