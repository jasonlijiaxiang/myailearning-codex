// AI 算力基础设施（AI Compute Infrastructure）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { aiInfraComputeBrief } from "../../module-briefs-platform.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "ai-infra-compute";

export default Object.freeze({
  slug,
  zh: "AI 算力基础设施",
  en: "AI Compute Infrastructure",
  titleId: "ai-infra-compute-title",
  layerNo: "09",
  routeKind: "brief",
  introducedAt: "2026-07-17",
  updatedAt: "2026-08-31",
  requiredTerms: Object.freeze(["ai-infra-compute","heterogeneous-compute","vram","hbm","scale-up","scale-out","tco"]),
  knowledgeView: "compute-bottleneck-path",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "5739e718d368d17dd46a01cd35bcc7eb1c7d158c3bd84b3a66153abf1343ef9e",
  qaCoverageTags: Object.freeze(["性能判断","显存规划","混合云","TCO","采购方法","网络选型","规格边界","扩展效率","网络投资","数据供给","能源与散热","异构可移植"]),
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: aiInfraComputeBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"从计算、显存、网络、存储和功耗判断算力方案。","cue":"客户准备采购 GPU，但缺少基于负载的容量与瓶颈证据"}),
  referenceShortTitle: "Infra Compute",
  additionalSourceIds: Object.freeze([]),
  englishUpdatedAt: "2026-08-01",
  englishReaderConfig: deepFreeze({"titleId":"ai-infra-compute-english-title","shortTitle":"AI Compute","criticalBoundary":"Peak specifications are screening data. Procurement evidence comes from the target model, software stack, request or training shape, long-run profile, failure recovery, supply boundary, and full cost per result that meets the stated criteria. Resource-level TCO is not project ROI; current hourly price, one inventory snapshot, and one benchmark cannot establish durable capacity.","facts":[{"label":"Sizing inputs","value":"Model version · precision · sequence or data · batch · parallelism · concurrency · SLO · recovery"},{"label":"Complete path","value":"Compute · HBM · scale-up · scale-out · storage · power · cooling"},{"label":"Acceptance profile","value":"Cold start · steady state · peak · soak · scaling · failure · recovery"},{"label":"Economic unit","value":"Full cost per result that meets quality and SLO criteria"}],"directories":{"quick":[{"id":"ai-infra-compute-english-primer-title","label":"Physical data path","eyebrow":"Start with the workload, then identify the bottleneck"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"AI 算力","facts":[{"label":"容量输入","value":"模型版本 · 精度 · 序列或数据 · 批量 · 并行 · 并发 · SLO · 恢复"},{"label":"完整通路","value":"计算 · HBM · Scale-up · Scale-out · 存储 · 电力 · 散热"},{"label":"验收画像","value":"冷启动 · 稳态 · 峰值 · 长跑 · 缩放 · 故障 · 恢复"},{"label":"经营口径","value":"每个满足质量与 SLO 的达标结果完整成本"}],"mechanismId":"principle","primer":{"id":"ai-infra-compute-extension-primer-title","label":"瓶颈路径","eyebrow":"先冻结负载，再定位最窄环节"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
