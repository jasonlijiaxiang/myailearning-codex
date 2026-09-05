// 大模型训练（LLM Training）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { llmTraining } from "../../module-briefs-foundations.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";

const slug = "llm-training";

export default Object.freeze({
  slug,
  zh: "大模型训练",
  en: "LLM Training",
  titleId: "llm-training-title",
  layerNo: "07",
  routeKind: "brief",
  introducedAt: "2026-07-17",
  updatedAt: "2026-08-31",
  requiredTerms: Object.freeze(["llm-training","distributed-training","evaluation"]),
  knowledgeView: "training-supply-chain",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "2cfb43d7d978544264c754bb600ceb3200dd7657598589fcea90a3c261233419",
  qaCoverageTags: Object.freeze(["训练全景","规模边界","后训练","评估发布","可靠性","训练恢复","数据去重","Tokenizer 变更","并行策略","检查点策略"]),
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: llmTraining,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"理解数据、并行、优化、通信和恢复构成的训练系统。","cue":"客户计划自训或续训模型，需要评估数据与集群可行性"}),
  referenceShortTitle: "LLM Training",
  additionalSourceIds: Object.freeze([]),
  englishUpdatedAt: "2026-08-01",
  englishReaderConfig: deepFreeze({"titleId":"llm-training-english-title","shortTitle":"Training System","criticalBoundary":"Completing optimization only creates a candidate artifact; serving, shadow traffic, and continuing monitoring remain separate gates. Training-set results and public benchmarks cannot replace the customer's Go/No-Go gate.","facts":[{"label":"Training signals","value":"General-pattern learning · instruction demonstrations · preference signals · verifiable outcomes"},{"label":"Run contract","value":"Base weights · tokenizer · dataset snapshot and mixture · objective · optimizer and scheduler · precision · parallel topology · environment · stop rule · evaluation version"},{"label":"Valid training progress","value":"Compute · communication · I/O · failure · recovery"},{"label":"Release gate","value":"Unseen tasks · critical slices · safety · capability retention · resources · uncertainty"}],"directories":{"quick":[{"id":"llm-training-english-primer-title","label":"Training evidence chain","eyebrow":"From governed data to a release candidate"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"训练系统","facts":[{"label":"训练信号","value":"通用模式学习 · 指令示范 · 偏好信号 · 可验证结果"},{"label":"Run 合同","value":"基础权重 · Tokenizer · 数据快照与配比 · 目标 · 优化器与调度器 · 精度 · 并行拓扑 · 环境 · 停止规则 · 评估版本"},{"label":"有效进度","value":"计算 · 通信 · I/O · 故障 · 恢复"},{"label":"候选门","value":"未见任务 · 关键切片 · 安全 · 能力保留 · 资源 · 不确定性"}],"mechanismId":"principle","primer":{"id":"llm-training-extension-primer-title","label":"训练供应链","eyebrow":"从数据与权利到候选评估"}}),
  fieldKitEntries: Object.freeze([]),
});
