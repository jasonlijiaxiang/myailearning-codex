// AI 应用工程与运营（AI Application Engineering & GenAIOps）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { aiOpsBrief } from "../../module-briefs-platform.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "ai-ops";

export default Object.freeze({
  slug,
  zh: "AI 应用工程与运营",
  en: "AI Application Engineering & GenAIOps",
  titleId: "ai-ops-title",
  layerNo: "04",
  routeKind: "brief",
  introducedAt: "2026-07-17",
  updatedAt: "2026-08-31",
  requiredTerms: Object.freeze(["ai-ops","ai-application-engineering","genaiops","ai-release-manifest","configuration-bundle","release-evaluation","shadow-traffic","observability","golden-set","cost-allocation","cost-anomaly"]),
  knowledgeView: "operations-feedback-loop",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "c94ef422a8f447daa9336ce65ebae56958cb1550c5b3e73b5f70e12cce8ec88f",
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: aiOpsBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"把跨组件版本、发布、质量、轨迹、成本与事故放进一套 GenAIOps 闭环。","cue":"组件能分别运行，但升级后无法重放、归因、灰度或安全恢复"}),
  referenceShortTitle: "AI Application Engineering & GenAIOps",
  additionalSourceIds: Object.freeze([]),
  englishUpdatedAt: "2026-08-01",
  englishReaderConfig: deepFreeze({"titleId":"ai-ops-english-title","shortTitle":"AI Ops","criticalBoundary":"AI Ops binds the Evaluation Contract, governed datasets, evaluator versions, thresholds, models, prompts, retrieval, tools, policy, and runtime into a release manifest; it runs approved gates, exposes controlled traffic, observes production, and preserves recovery evidence. This is not traditional AIOps alert reduction or GPU-only monitoring. DevOps, DataOps, MLOps, Evaluation, Security, Governance, and business systems retain their own authority; telemetry is evidence, not proof of correctness. AI Ops owns gate enforcement, stop controls, rollback, and recovery.","facts":[{"label":"Release unit","value":"Model · prompt · data or index · tools · workflow · policy · runtime"},{"label":"Test layers","value":"Code contracts · semantic quality · risk · performance · business outcome"},{"label":"Controlled traffic","value":"Replay → no-side-effect shadow → canary → rollback"},{"label":"Improvement gate","value":"Privacy review · deduplication · provenance · adjudication"}],"directories":{"quick":[{"id":"ai-ops-english-primer-title","label":"Operating lifecycle","eyebrow":"Task, bundle, evidence, and business outcome"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"AI Ops","facts":[{"label":"发布单元","value":"模型 · Prompt · 数据或索引 · 工具 · 工作流 · 策略 · 运行配置"},{"label":"测试分层","value":"代码契约 · 语义质量 · 风险 · 性能 · 业务终态"},{"label":"受控流量","value":"回放 → 无副作用影子 → 灰度 → 回滚"},{"label":"改进门禁","value":"隐私审查 · 去重 · 溯源 · 裁决后进入回归集"}],"mechanismId":"principle","primer":{"id":"ai-ops-extension-primer-title","label":"交付恢复闭环","eyebrow":"组装、验证、发布、观测、恢复"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
