// 大模型推理（LLM Inference）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { llmInferenceBrief } from "../../module-briefs-platform.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "llm-inference";

export default Object.freeze({
  slug,
  zh: "大模型推理",
  en: "LLM Inference",
  titleId: "llm-inference-title",
  layerNo: "07",
  routeKind: "dedicated",
  introducedAt: "2026-07-17",
  updatedAt: "2026-08-31",
  requiredTerms: Object.freeze(["llm-inference","kv-cache","batching","quantization","ttft","tpot","goodput"]),
  knowledgeView: "latency-capacity-map",
  readingProfile: "focused",
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "1a732d72e0a2f584fe4fcd76f56b7913afe8fdc63d50080556095c9bb1adf973",
  qaCoverageTags: Object.freeze(["性能原理","容量规划","优化边界","组件边界","SLO 取舍","精度选择","显存容量","量化发布","调度公平","投机解码","弹性冷启动","缓存安全","性能归因","准入控制"]),
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: llmInferenceBrief,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"在延迟、吞吐、显存、质量与成本之间设计服务策略。","cue":"模型能跑但并发、首 token、长上下文或成本不达标"}),
  referenceShortTitle: "LLM Inference",
  additionalSourceIds: Object.freeze([]),
  englishUpdatedAt: "2026-08-01",
  englishReaderConfig: deepFreeze({"titleId":"llm-inference-english-title","shortTitle":"Inference","criticalBoundary":"A model that loads is not necessarily serviceable at target concurrency. Maximum context and maximum concurrency cannot generally be delivered simultaneously; engine metrics do not automatically include gateway, network, client rendering, or the business terminal state.","facts":[{"label":"Serving release","value":"Model × tokenizer × template × engine × quantization × cache × batching × routing"},{"label":"Time account","value":"Queue × prefill × decode × delivery"},{"label":"Memory account","value":"Weights × KV cache × workspaces × fragmentation × reserve"},{"label":"Acceptance","value":"Quality × SLO × Goodput × recovery × cost per qualifying task"}],"directories":{"quick":[{"id":"llm-inference-english-primer-title","label":"Latency and capacity map","eyebrow":"Separate time, memory, and overload"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false,"completeFocusedProjection":true}),
  unifiedBriefConfig: null,
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
