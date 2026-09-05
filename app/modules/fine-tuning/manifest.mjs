// 微调（Fine-tuning）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { fineTuning } from "../../module-briefs-foundations.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "fine-tuning";

export default Object.freeze({
  slug,
  zh: "微调",
  en: "Fine-tuning",
  titleId: "fine-tuning-title",
  layerNo: "07",
  routeKind: "brief",
  introducedAt: "2026-07-17",
  updatedAt: "2026-07-30",
  requiredTerms: Object.freeze(["fine-tuning","sft","peft","lora","qlora","dpo","evaluation"]),
  knowledgeView: "tuning-lifecycle",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "32309070485d6a96e18382bfb09f74f991f842911f3609bb238e2b7f58ab02cc",
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: fineTuning,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: null,
  discovery: deepFreeze({"summary":"用高质量样本改变稳定行为、风格或任务模式。","cue":"仅靠 Prompt 难以稳定达成专门行为或格式"}),
  referenceShortTitle: "Fine-tuning",
  additionalSourceIds: Object.freeze([]),
  englishUpdatedAt: "2026-08-10",
  englishReaderConfig: deepFreeze({"titleId":"fine-tuning-english-title","shortTitle":"Fine-tuning","criticalBoundary":"Do not use fine-tuning in place of a current knowledge source, business database, deterministic eligibility logic, or tool authorization. Verify deletion and model-impact obligations under the customer's policy.","facts":[{"label":"Training trigger","value":"Train only when a stable, repeatable, labelable behavior gap remains."},{"label":"No-tune gate","value":"Data rights · privacy treatment · reliable adjudication · frozen evaluation · versioning · rollback"},{"label":"Release tuple","value":"Data · base · adapter · tokenizer · template · runtime · policy · evidence · economics"},{"label":"Stop condition","value":"Unstable gains · critical regression · a lighter route wins"}],"directories":{"quick":[{"id":"fine-tuning-english-primer-title","label":"Reversible training experiment","eyebrow":"Route, gate, assess, release"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"微调","facts":[{"label":"训练触发","value":"轻量路线后仍有稳定、可重复、可标注的行为缺口"},{"label":"不微调门","value":"数据权利 · PII · 可靠标注 · 冻结评测 · 版本化 · 回滚"},{"label":"发布单元","value":"数据 · 冻结评估集 · 基座 / Adapter · Tokenizer / Chat Template · Runtime / Policy"},{"label":"停止条件","value":"收益不稳定、关键退化、完整成本越界或轻量路线反超"}],"mechanismId":"principle","primer":{"id":"fine-tuning-primer-title","label":"可逆训练实验","eyebrow":"分流、门禁、验收、发布与停止"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
