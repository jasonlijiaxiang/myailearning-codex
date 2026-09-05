// 大语言模型原理（Large Language Models）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { llm } from "../../module-briefs-foundations.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "llm";

export default Object.freeze({
  slug,
  zh: "大语言模型原理",
  en: "Large Language Models",
  titleId: "llm-title",
  layerNo: "07",
  routeKind: "brief",
  introducedAt: "2026-07-17",
  updatedAt: "2026-07-29",
  requiredTerms: Object.freeze(["llm","transformer","attention","kv-cache"]),
  knowledgeView: "theory-atlas",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "7dc39e54761576aa4bb5343b2a736ba538834cc7bfa99b9568f43d77fc8614bd",
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: llm,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: null,
  discovery: deepFreeze({"summary":"理解 Transformer、上下文、生成概率与模型能力边界。","cue":"需要解释模型为什么会生成、遗忘、幻觉或受上下文影响"}),
  referenceShortTitle: "LLM",
  additionalSourceIds: Object.freeze([]),
  englishUpdatedAt: "2026-08-10",
  englishReaderConfig: deepFreeze({"titleId":"llm-english-title","shortTitle":"LLM","criticalBoundary":"Fluent output does not establish factual correctness, authorization, or the validity of a business action. External systems must validate factual claims and enforce security, permissions, and deterministic business rules.","facts":[{"label":"Generation path","value":"Token representation → context interaction → autoregressive sampling"},{"label":"Diagnosis order","value":"Separate capability, evidence, instruction, decoding, serving, and orchestration"},{"label":"Performance handoff","value":"Move capacity and latency to inference only after quality passes"},{"label":"Production boundary","value":"Fluency does not prove truth, authority, or a valid business action"}],"directories":{"quick":[{"id":"llm-english-primer-title","label":"Generation path","eyebrow":"From tokens to output"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"LLM","facts":[{"label":"生成机制","value":"Token 表示 → 上下文交互 → 自回归采样"},{"label":"诊断顺序","value":"分开能力、证据、指令、解码、服务与编排"},{"label":"性能转交","value":"质量达标后再把容量与时延交给推理平台"},{"label":"生产边界","value":"流畅输出不证明事实、授权或业务动作有效"}],"mechanismId":"principle","primer":{"id":"llm-theory-primer-title","label":"生成主线","eyebrow":"从 Token 到输出"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
