// 提示词工程（Prompt Engineering）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "prompt-engineering";

export default Object.freeze({
  slug,
  zh: "提示词工程",
  en: "Prompt Engineering",
  titleId: "prompt-title",
  layerNo: "07",
  routeKind: "dedicated",
  introducedAt: "2026-07-17",
  updatedAt: "2026-07-30",
  requiredTerms: Object.freeze(["prompt-engineering","context-engineering","instructions","context","tools-schema","structured-outputs","prompt-injection"]),
  knowledgeView: "context-assembly",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "35e50b6873227dc90cb62668e2b8edcb00349dfa8994853eebb437fd08bf634d",
  qaCoverageTags: Object.freeze(["能力边界","安全边界","结构化输出","工具安全","版本治理","上下文装配","提示注入","评估方法","灰度回滚","PoC 验收"]),
  contentContract: deepFreeze({"principle":["Prompt 是什么，以及 Context Engineering 的边界"],"mechanism":["明确且稳定的指令","动态上下文","能力接口"],"boundary":["必须执行的规则应落在模型外"],"cloud":["提示词工程与云服务机会"],"customer":["客户高频问题与深度回答"]}),
  brief: null,
  curriculum: null,
  learning: null,
  extensionViews: moduleExtensionViews[slug] ?? null,
  discovery: deepFreeze({"summary":"把指令、上下文、工具和输出契约组织成可发布资产。","cue":"Prompt 靠个人试错，修改后无法证明效果或安全性"}),
  referenceShortTitle: "Prompt",
  additionalSourceIds: Object.freeze(["openai-prompting-guide","openai-structured-outputs","openai-function-calling","google-prompt-introduction","google-prompt-strategies","google-system-instructions","anthropic-prompt-overview","openai-model-spec-hidden-cot","openai-prompt-caching","anthropic-effective-agents","react-2023","nist-genai-profile","nist-zero-trust","owasp-prompt-injection"]),
  englishUpdatedAt: "2026-07-30",
  englishReaderConfig: deepFreeze({"titleId":"prompt-engineering-english-title","shortTitle":"Prompt","criticalBoundary":"Message roles and instruction priority guide model behavior; they do not grant identity, access, transaction validity, or proof that an external action succeeded. Keep secrets and every mandatory authorization or business invariant outside the model, and reauthorize each proposed action at execution time.","facts":[{"label":"Input unit","value":"Instructions × trusted state × dynamic evidence × tools and schemas"},{"label":"Model responsibility","value":"Produce a candidate response or structured action intent"},{"label":"Application responsibility","value":"Identity, authorization, validation, execution, and business truth"},{"label":"Release unit","value":"Model snapshot × prompt × context × tools × evaluation × rollback"}],"directories":{"quick":[{"id":"prompt-engineering-english-primer-title","label":"Context assembly","eyebrow":"Separate task expression from authority"},{"id":"prompt-pattern-diagnostics","label":"Technique triage","eyebrow":"Route the failure"}],"learn":[{"id":"prompt-context-boundary","label":"Scope and ownership","eyebrow":"Define the responsibility split"},{"id":"controlled-context-assembly","label":"Context manifest","eyebrow":"Budget and preserve provenance"},{"id":"output-tool-contracts","label":"Output and action","eyebrow":"Validate each contract layer"},{"id":"prompt-injection-controls","label":"Injection controls","eyebrow":"Bound source-to-sink impact"},{"id":"evaluation-release-governance","label":"Release governance","eyebrow":"Version, evaluate, canary, and roll back"}],"field":[{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"cloud-poc-operating-model","label":"Cloud and PoC","eyebrow":"Make the capability operable"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["prompt-pattern-diagnostics"],"learn":["prompt-context-boundary","controlled-context-assembly","output-tool-contracts","prompt-injection-controls","evaluation-release-governance"],"field":["cloud-poc-operating-model"]},"fieldGroupsBeforeEvidence":false}),
  unifiedBriefConfig: null,
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
