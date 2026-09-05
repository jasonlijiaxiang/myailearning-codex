// AI 治理、风险与合规（AI Governance, Risk & Compliance）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { aiGovernanceBrief } from "../../module-briefs-governance-mlops.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "ai-governance";

export default Object.freeze({
  slug,
  zh: "AI 治理、风险与合规",
  en: "AI Governance, Risk & Compliance",
  titleId: "ai-governance-title",
  layerNo: "05",
  routeKind: "brief",
  introducedAt: "2026-07-21",
  updatedAt: "2026-08-05",
  requiredTerms: Object.freeze(["ai-governance","ai-inventory","ai-risk-tiering","impact-assessment","human-oversight","governance-evidence","continuous-assurance"]),
  knowledgeView: "governance-assurance-loop",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  qaCoverageTags: Object.freeze(["职责边界","框架边界","系统清单","风险分级","第三方治理","法规时效","治理落地","责任模型","影响评估","条件批准","变更复审","适用分诊","备案分诊","内容标识","行业治理"]),
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: aiGovernanceBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"用系统清单、风险分级、责任与证据持续治理 AI 生命周期。","cue":"组织正在扩大 AI 使用，却无法回答谁负责、为何允许和怎样证明"}),
  referenceShortTitle: "AI Governance",
  additionalSourceIds: Object.freeze(["eu-ai-act"]),
  englishUpdatedAt: "2026-08-10",
  englishReaderConfig: deepFreeze({"titleId":"ai-governance-english-title","shortTitle":"AI Governance","criticalBoundary":"Governance defines the use inventory, evidence requirements, approval gates, exception process, and reassessment triggers. The authorized business owner decides whether the use operates and accepts residual business risk within delegated authority. Governance does not perform Security's attack testing, Evaluation's measurement, AI Ops' release and recovery work, the ATS owner's transaction authorization, or counsel's legal classification.","facts":[{"label":"Governed identity","value":"Use × affected people × decision × data × supplier × region × owner"},{"label":"Assurance path","value":"Register → tier → assess → assign controls → assemble evidence → decide → operate → reassess"},{"label":"Decision states","value":"Approve · conditionally approve · hold · reject"},{"label":"Change gate","value":"Suspend affected scope; refresh evidence; restore, restrict, or retire"}],"directories":{"quick":[{"id":"ai-governance-english-primer-title","label":"Governance assurance loop","eyebrow":"From governed use to reassessment"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"AI 治理","facts":[{"label":"治理主键","value":"用途 × 人群 × 决定 × 数据 × 供应商 × 地区"},{"label":"保证闭环","value":"登记 → 分级 → 保证 → 运营 / 复审"},{"label":"批准状态","value":"Approve · Conditional · Hold · No-Go，均绑定证据与条件"},{"label":"变化门禁","value":"重大变化先暂停受影响范围，再补证与重决策"}],"mechanismId":"principle","primer":{"id":"ai-governance-extension-primer-title","label":"治理保证闭环","eyebrow":"从受治理用途到重新评估"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
