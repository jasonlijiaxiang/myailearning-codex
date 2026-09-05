// 模型格局与选型（Model Landscape）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { modelLandscape } from "../../module-briefs-foundations.mjs";
import { moduleCurriculumContent } from "../../module-curriculum-content.mjs";
import { moduleLearningContent } from "../../module-learning-content.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "model-landscape";

export default Object.freeze({
  slug,
  zh: "模型格局与选型",
  en: "Model Landscape",
  titleId: "model-landscape-title",
  layerNo: "01",
  routeKind: "brief",
  introducedAt: "2026-07-17",
  updatedAt: "2026-08-13",
  requiredTerms: Object.freeze(["model-landscape","model-routing","access-spectrum","capability-matrix","model-lifecycle"]),
  knowledgeView: "selection-coordinate",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "710518d2e7495dd0a4ab3b5a5f4ca5a6eb25398ffc81ebedb832aaf4b7be4f12",
  contentContract: deepFreeze({"principle":["data-quality-section=\"principle\""],"mechanism":["data-knowledge-view"],"boundary":["data-importance=\"critical\""],"cloud":["data-quality-section=\"cloud\""],"customer":["data-quality-section=\"qa\""]}),
  brief: modelLandscape,
  curriculum: moduleCurriculumContent[slug] ?? null,
  learning: moduleLearningContent[slug] ?? null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"从质量、时延、成本、部署与治理约束选择模型组合。","cue":"客户问哪一个模型最好，或希望同时使用多个模型"}),
  referenceShortTitle: "Model Landscape",
  additionalSourceIds: Object.freeze(["intelligence-index","coding-index","agentic-index","artificial-analysis-models","artificial-analysis-methodology","terminal-bench-v21","scicode","scicode-verified-2026","gdpval-aa-v2","tau3-banking","arena-leaderboard","livebench","gpqa-diamond","humanity-last-exam","swe-bench","terminal-bench","swe-rebench","bfcl","webarena-2024","financebench"]),
  englishUpdatedAt: "2026-08-30",
  englishReaderConfig: deepFreeze({"titleId":"model-landscape-english-title","shortTitle":"Model Selection","criticalBoundary":"Catalogs, prices, versions, and platform capabilities are time-sensitive. Bind every customer comparison to its verification date, region, exact candidate identity, and like-for-like pilot. A leaderboard, one demo, or consumer product experience cannot establish the customer-use-case conclusion.","facts":[{"label":"Decision start","value":"Task, unacceptable loss, and delivery hard gates"},{"label":"Candidate identity","value":"Provider × endpoint × region × exact version × delivery form"},{"label":"Pilot contract","value":"Same prompt, context, tools, schema, budget, and test set"},{"label":"Exit proof","value":"A reserve passes the same gates; otherwise block or hand off"}],"directories":{"quick":[{"id":"model-landscape-english-primer-title","label":"Selection coordinates","eyebrow":"From business loss to exit proof"},{"id":"decisions","label":"Solution decisions","eyebrow":"Assign the handoff"}],"learn":[{"id":"principle","label":"Mechanism","eyebrow":"Build the working model"},{"id":"study-guide","label":"Study and practice","eyebrow":"Produce reviewable work"},{"id":"curriculum","label":"Knowledge map","eyebrow":"Complete the theory"},{"id":"deep-dive","label":"Engineering depth","eyebrow":"Diagnose failure and limits"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud","label":"Cloud capabilities","eyebrow":"Map delivery and ownership"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["decisions"],"learn":["principle","study-guide","curriculum","deep-dive"],"field":["cloud"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: deepFreeze({"shortTitle":"模型选型","facts":[{"label":"判断起点","value":"任务、不可接受损失与交付硬门"},{"label":"候选身份","value":"提供方 × 端点 × 地域 × 精确版本 × 交付形态"},{"label":"试点合同","value":"同一 Prompt、上下文、工具、Schema、预算与考卷"},{"label":"退出证明","value":"备用候选通过相同硬门；否则阻断或转人工"}],"mechanismId":"principle","primer":{"id":"model-landscape-extension-primer-title","label":"选型坐标","eyebrow":"从业务损失到退出证明"}}),
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
