// 安全（AI Security）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { securityBrief } from "../../module-briefs-app-protocol.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "security";

export default Object.freeze({
  slug,
  zh: "安全",
  en: "AI Security",
  titleId: "security-title",
  layerNo: "05",
  routeKind: "brief",
  introducedAt: "2026-07-17",
  updatedAt: "2026-08-05",
  requiredTerms: Object.freeze(["security","guardrails","identity-authorization","prompt-injection"]),
  knowledgeView: "threat-path",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "07ddfd01632072126a875cbe9d52acee36cb149354af43c44510b68d4e8196db",
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: securityBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: null,
  discovery: deepFreeze({"summary":"控制不可信输入、模型行为、敏感数据和高影响动作。","cue":"客户担心提示注入、越权、泄漏或不可逆业务动作"}),
  referenceShortTitle: "Security",
  additionalSourceIds: Object.freeze([]),
  englishUpdatedAt: "2026-08-10",
  englishReaderConfig: deepFreeze({"titleId":"security-english-title","shortTitle":"Security","criticalBoundary":"Security proves that technical controls bound authority and that incidents can be contained and reconstructed. Governance owns use conditions and residual-risk acceptance, Evaluation owns measurement, AI Ops owns release and recovery execution, and qualified professionals own legal applicability. The authorized recruiting owner approves any high-impact applicant decision; identity, authorization, credentials, data access, and ATS writes remain deterministic controls outside the model.","facts":[{"label":"Threat model","value":"Unacceptable loss × untrusted source × high-impact sink"},{"label":"Data boundary","value":"Recruiter × requisition × applicant × purpose; retrieval-time ACLs"},{"label":"Action boundary","value":"The model proposes; the principal and deterministic policy authorize the ATS"},{"label":"Recovery proof","value":"Pause writes → revoke credentials → verify ATS state → compensate → add a regression case"}],"directories":{"quick":[{"id":"security-english-primer-title","label":"Threat path","eyebrow":"From hostile resume to bounded ATS state"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"AI 安全","facts":[{"label":"威胁起点","value":"不可接受损失 × 不可信 Source × 高影响 Sink"},{"label":"数据边界","value":"招聘人员 × 职位 × 候选人 × 用途；检索时 ACL"},{"label":"动作边界","value":"模型形成有据提案；真实身份与确定性策略授权 ATS"},{"label":"恢复证明","value":"暂停写入 → 撤销凭据 → 核对 ATS 终态 → 补偿 → 回归"}],"mechanismId":"principle","primer":{"id":"security-threat-primer-title","label":"威胁路径","eyebrow":"从恶意简历到 ATS 终态"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
