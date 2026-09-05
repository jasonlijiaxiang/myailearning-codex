// Agent · 智能体（AI Agent）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "ai-agent";

export default Object.freeze({
  slug,
  zh: "Agent · 智能体",
  en: "AI Agent",
  titleId: "agent-title",
  layerNo: "02",
  routeKind: "dedicated",
  introducedAt: "2026-07-17",
  updatedAt: "2026-09-04",
  requiredTerms: Object.freeze(["ai-agent","harness","harness-engineering","agent-engineering","perceive","reason","act","observe","planning","memory","tools"]),
  knowledgeView: "control-architecture",
  readingProfile: null,
  visualProfile: "dense-reading",
  legacyUndatedQuestionSetSha256: "53b2a8990c5769cdddd525727b6135d534dd4bbadc5501fa4fc32555e85bf114",
  qaCoverageTags: Object.freeze(["概念边界","动作循环","可解释与审计","规划机制","路线选择","方案边界","工具治理","记忆治理","安全","架构选择","评估","可观测","云选型","FinOps","上线治理","协议边界","执行方式","Run 状态机","身份授权","工具契约","人工介入","故障恢复","长任务运行","多 Agent"]),
  contentContract: deepFreeze({"principle":["Agent 的基础概念与工作循环"],"mechanism":["感知—思考—行动—观察","规划、记忆与工具"],"boundary":["模型会调用 API，不等于模型拥有 API 权限"],"cloud":["Agent 技术环节与云服务机会"],"customer":["客户高频问题与深度回答"]}),
  brief: null,
  curriculum: null,
  learning: null,
  extensionViews: null,
  discovery: deepFreeze({"summary":"让模型在受控循环中规划、调用工具并推进业务任务。","cue":"客户希望 AI 不只回答，还要跨系统完成动作"}),
  referenceShortTitle: "Agent",
  additionalSourceIds: Object.freeze(["openai-agent-guide","openai-model-spec-hidden-cot","anthropic-effective-agents","react-2023","webarena-2024","google-agent-platform","aws-agentcore","aws-agentcore-memory","azure-foundry-agent-service","opentelemetry-semconv","nist-genai-profile","nist-zero-trust","mcp-architecture","a2a-concepts","openai-function-calling","openai-harness-engineering","anthropic-agent-evals","microsoft-agent-harness","nist-agent-standards","openai-hugging-face-incident-technical-report-2026","metr-openai-hf-incident-2026","ncsc-agentic-ai-risk-interim-2026","harness-bench-2026","configuring-agentic-coding-tools","swe-bench","terminal-bench","swe-rebench","product-codex-docs","product-claude-code-docs","product-github-copilot-coding-agent","product-cursor-docs","product-kiro-cli","product-devin-docs","product-openhands-docs","product-cline-docs","product-aider-docs","product-opencode-docs","product-antigravity-migration","product-gemini-cli-individual-transition","product-antigravity-cli-migration","product-gemini-cli-releases","product-qwen-code-docs","product-kimi-code-docs","product-codebuddy-docs","product-comate-agent-docs","product-tongyi-lingma","product-qoder-cn-series","product-qoder-cn-ide","product-qoder-cn-ide-changelog"]),
  englishUpdatedAt: "2026-09-04",
  englishReaderConfig: deepFreeze({"titleId":"ai-agent-english-title","shortTitle":"AI Agent","criticalBoundary":"A tool-call intent, successful tool execution, and business completion are three different claims. Deterministic controls must retain identity, authorization, real-world execution, stopping, and final acceptance.","facts":[{"label":"Adoption condition","value":"New evidence changes the next step"},{"label":"Model responsibility","value":"Propose structured action intent"},{"label":"Application responsibility","value":"Identity, policy, execution, and stopping"},{"label":"Completion proof","value":"Authoritative business postconditions"}],"directories":{"quick":[{"id":"ai-agent-english-primer-title","label":"Control loop","eyebrow":"Separate intent from authority"},{"id":"agent-adoption-decision","label":"Adoption decision","eyebrow":"Prove the path must adapt"}],"learn":[{"id":"agent-operating-model","label":"Operating model","eyebrow":"Bound the run"},{"id":"agent-harness-engineering","label":"Harness engineering","eyebrow":"Control model-facing state"},{"id":"agent-control-architecture","label":"Control architecture","eyebrow":"Place deterministic authority"},{"id":"agent-production-runtime","label":"Production runtime","eyebrow":"Recover durable work"},{"id":"agent-interoperability","label":"Interoperability","eyebrow":"Delegate without broad authority"},{"id":"agent-memory-poisoning","label":"Memory controls","eyebrow":"Preserve provenance and recovery"}],"field":[{"id":"agent-low-code-choice","label":"Delivery choice","eyebrow":"Test platform fit"},{"id":"agent-cloud-evaluation","label":"Cloud and PoC","eyebrow":"Map controls and proof"},{"id":"evidence","label":"Evidence and limits","eyebrow":"State what sources prove"},{"id":"qa","label":"Customer questions","eyebrow":"Answer with boundaries"},{"id":"related-modules","label":"Related modules","eyebrow":"Explore adjacent topics"}]},"groupIds":{"quick":["agent-adoption-decision"],"learn":["agent-operating-model","agent-harness-engineering","agent-control-architecture","agent-production-runtime","agent-interoperability","agent-memory-poisoning"],"field":["agent-low-code-choice","agent-cloud-evaluation"]},"fieldGroupsBeforeEvidence":true}),
  unifiedBriefConfig: null,
  fieldKitEntries: Object.freeze(fieldQuestions.filter((entry) => entry.questionRef.moduleId === slug)),
});
