// AI 基础设施平台（AI Infrastructure Platform）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { aiInfraPlatformBrief } from "../../module-briefs-platform.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "ai-infra-platform";

export default Object.freeze({
  slug,
  zh: "AI 基础设施平台",
  en: "AI Infrastructure Platform",
  titleId: "ai-infra-platform-title",
  layerNo: "09",
  routeKind: "brief",
  introducedAt: "2026-07-17",
  updatedAt: "2026-08-01",
  requiredTerms: Object.freeze(["ai-infra-platform","resource-scheduling","observability","gang-scheduling","goodput"]),
  knowledgeView: "scheduler-control-plane",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "b1d9886106ef81384e0bb1593c441a8760ca4d1ce1aae6978d9fd002535ffa70",
  qaCoverageTags: Object.freeze(["建设起点","调度选型","DRA","平台边界","资源效率","升级治理","有效产出","混部边界","队列公平","拓扑调度","平台隔离","可移植性"]),
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: aiInfraPlatformBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"用集群、调度、运行时与运维体系稳定承载 AI 工作负载。","cue":"GPU 有空闲却排队，环境升级频繁破坏任务"}),
  referenceShortTitle: "Infra Platform",
  additionalSourceIds: Object.freeze([]),
  englishUpdatedAt: "2026-08-01",
  englishReaderConfig: deepFreeze({"titleId":"ai-infra-platform-english-title","shortTitle":"Infra Platform","criticalBoundary":"The platform owns resource, job, and service-runtime lifecycles and an operable user contract. It does not own hardware procurement, training-state correctness, inference-engine internals, gateway policy, model quality, or project ROI. Kubernetes, GPU Operator, schedulers, notebooks, and serving frameworks are components, not proof of a complete platform.","facts":[{"label":"Workload contract","value":"User × identity × device × topology × data × runtime × deadline × recovery"},{"label":"Scheduling path","value":"Admission → queueing → placement → preparation → execution → recovery"},{"label":"Tenant validation","value":"Control plane · identity/data/network · performance/resources · cost allocation/accountability"},{"label":"Ownership boundary","value":"Platform Goodput and resource economics · application quality and ROI stay with application and business owners"}],"directories":{"quick":[{"id":"ai-infra-platform-english-primer-title","label":"Control and execution","eyebrow":"From workload contract to recovery evidence"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"基础设施平台","facts":[{"label":"工作负载合同","value":"用户 × 身份 × 设备 × 拓扑 × 数据 × 运行时 × 时限 × 恢复"},{"label":"调度路径","value":"准入 → 排队 → 放置 → 准备 → 执行 → 恢复"},{"label":"多租户验收","value":"控制层 · 身份/数据/网络 · 性能/资源 · 成本归属"},{"label":"经营边界","value":"Goodput 与资源经济归平台；业务质量与 ROI 归应用和业务"}],"mechanismId":"principle","primer":{"id":"ai-infra-platform-extension-primer-title","label":"控制与执行","eyebrow":"从自助契约到恢复证据"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
