// 提示词工程（Prompt Engineering）模块配置。
// 本文件是该模块在全站注册表中的唯一配置源：正文只引用，不复制。
// 注册表（发布、地图、发现、简报、英文、Reference、问答等）全部从本文件派生。
import { deepFreeze } from "../freeze.mjs";
import { moduleExtensionViews } from "../../module-extension-views.mjs";
import { promptDeepDives, promptEvidenceCards, promptQa } from "../../prompt-content.mjs";
import { fieldQuestions } from "../../question-field-kit.mjs";

const slug = "prompt-engineering";

// brief 正文：15 键统一结构 + 专用页面的呈现扩展字段。页面只引用，不复制。
const brief = {
  slug,
  definition: "把业务目标、上下文、约束与输出契约翻译成模型可执行的输入，并通过版本、评估和安全控制持续验证；它是系统工程的一部分，不是寻找一句“万能咒语”。",
  position: "提示词工程负责表达已经定义的任务，上下文工程负责决定每次调用看见什么；知识供给、模型能力、Agent 编排、身份授权、确定性业务规则和外部事务终态继续由各自主责系统承担。",
  presentation: "dedicated",
  principleTitle: "Prompt 是什么，以及 Context Engineering 的边界",
  principles: [],
  decisions: [],
  deepDiveTitle: "提示词如何融入输入、发布与安全工程",
  deepDiveLead: "本节不按技巧名单展开，而是回答生产系统更难的问题：冲突指令如何处理、Context 如何装配、输出何时可执行，以及提示注入成功时如何仍然限制真实影响。",
  deepDives: promptDeepDives,
  criticalBoundary: "消息角色与指令层级能帮助模型区分来源，却不是通用安全协议。不同模型 API 的角色、优先级与能力并不完全一致；必须执行的规则应落在模型外。",
  cloudHooks: [
    { stage: "模型接入", services: "模型即服务、模型目录、推理端点、多模型路由", value: "在质量、时延、成本与数据边界间选择模型", discover: "是否需要跨厂商？固定快照还是自动升级？" },
    { stage: "模板管理", services: "Prompt 管理、配置中心、代码仓库、密钥管理", value: "把模板、变量、审批和回滚纳入版本治理", discover: "谁能修改？能否追踪一次回答使用的确切版本？" },
    { stage: "上下文供给", services: "托管搜索、向量库、数据库、对象存储、会话状态", value: "按身份和任务动态提供证据与状态", discover: "上下文来自哪里？多久更新？是否分权限？" },
    { stage: "结构与工具", services: "API 网关、函数计算、工作流、事件总线、Schema Registry", value: "连接业务 API 并让输出可被系统消费", discover: "哪些动作只读、哪些改变状态、哪些需要审批？" },
    { stage: "安全治理", services: "IAM、KMS、WAF、内容安全、DLP、私网、审计", value: "隔离不可信输入并控制数据与动作权限", discover: "是否含敏感数据？提示和日志能否留存？" },
    { stage: "评估发布", services: "评估平台、CI/CD、灰度、特征开关、模型网关", value: "提示与模型升级前回归，失败时快速回滚", discover: "上线门槛、审批人和回滚目标是什么？" },
    { stage: "观测运营", services: "Tracing、APM、日志、告警、成本分析、提示缓存（Prompt Cache）", value: "定位退化并核算每个成功任务成本", discover: "需要保存哪些输入输出？保留期和脱敏要求是什么？" },
  ],
  relatedSlugs: ["llm", "model-landscape", "fine-tuning", "rag", "ai-agent", "solution-patterns", "evaluation", "security", "ai-gateway", "ai-ops"],
  qa: promptQa,
  evidenceCards: promptEvidenceCards,
  facts: [
    { label: "输入单元", value: "指令 × 可信状态 × 动态证据 × Tools / Schema" },
    { label: "模型责任", value: "生成候选答案或结构化动作意图" },
    { label: "应用责任", value: "身份、授权、校验、执行与业务终态" },
    { label: "发布单元", value: "模型 × Prompt × Context × Tools × Eval × 回滚" },
  ],
  directories: {
    quick: [
      { id: "context-assembly", label: "上下文装配", eyebrow: "区分来源与权威" },
      { id: "quick-triage", label: "失败路由", eyebrow: "先找正确处理层" },
    ],
    learn: [
      { id: "learn-input", label: "输入合同", eyebrow: "拆开责任边界" },
      { id: "learn-diagnose", label: "诊断与模板", eyebrow: "按症状选技术" },
      { id: "learn-release", label: "发布与验证", eyebrow: "绑定完整配置" },
    ],
    field: [
      { id: "evidence", label: "证据与边界", eyebrow: "说明来源能证明什么" },
      { id: "cloud-opportunities", label: "云能力与责任", eyebrow: "连接交付与验收" },
      { id: "qa", label: "客户问题", eyebrow: "带边界回答" },
    ],
  },
  conceptLinks: [
    { concept: "模型原理与上下文窗口", owner: "大语言模型原理", href: "/modules/llm", relation: "前置知识", local: "理解 token、上下文容量、指令遵循与生成不确定性。" },
    { concept: "模型候选与能力边界", owner: "模型格局与选型", href: "/modules/model-landscape", relation: "候选切换", local: "当能力、模态、时延或成本不达标时，先重新验证模型候选。" },
    { concept: "微调进入门", owner: "微调工程", href: "/modules/fine-tuning", relation: "行为适配", local: "只有轻量路线后仍存在稳定、可标注的行为缺口才进入训练。" },
    { concept: "RAG 与 Grounding", owner: "RAG · 检索增强生成", href: "/modules/rag", relation: "知识供给", local: "提示负责使用证据，不负责把正确证据检索出来。" },
    { concept: "Agent 与工具调用", owner: "Agent · 智能体", href: "/modules/ai-agent", relation: "行动扩展", local: "工具定义进入上下文；授权、执行和状态由应用控制。" },
    { concept: "工作流与结构化生成", owner: "场景解决方案", href: "/modules/solution-patterns", relation: "输出消费", local: "把自然语言结果约束为可被下游系统可靠处理的结构。" },
    { concept: "评估", owner: "评估", href: "/modules/evaluation", relation: "质量门槛", local: "提示版本必须用固定任务集回归，不能凭演示观感发布。" },
    { concept: "安全与治理", owner: "AI 安全", href: "/modules/security", relation: "风险控制", local: "提示注入（Prompt Injection）、数据泄漏和越权不能只靠系统提示（System Prompt）防御。" },
    { concept: "AI 网关", owner: "AI 网关", href: "/modules/ai-gateway", relation: "生产入口", local: "承载多模型路由、限流、密钥、策略、回滚与成本控制。" },
    { concept: "AI 可观测与运营", owner: "AI 可观测与运营", href: "/modules/ai-ops", relation: "上线后的持续改进", local: "关联提示版本、模型、输入、输出、时延、质量和单次成功成本。" },
  ],
  promptPatterns: [
    { name: "零样本提示 · Zero-shot Prompting", cue: "先建最小基线", pipeline: "目标 + 输入 + 约束 + 输出要求", boundary: "适合先做最小基线；复杂边界仅靠文字描述可能不稳定。" },
    { name: "少样本示例 · Few-shot Examples", cue: "用示例澄清边界", pipeline: "代表性输入 → 期望输出 → 边界 / 拒答样例", boundary: "示例占用上下文并可能携带偏差；应以评估收益决定数量。" },
    { name: "结构化输出 · Structured Outputs", cue: "约束结果形状", pipeline: "业务对象 → Schema → 模型输出 → 应用校验", boundary: "保证结构不等于保证字段值真实、合规或可执行。" },
    { name: "工具定义 · Tool Definition", cue: "声明可调用能力", pipeline: "名称 + 描述 + 参数 → 调用意图 → 应用执行", boundary: "模型不能自行获得权限；工具选择和参数仍需校验与审计。" },
    { name: "有据生成 · Grounding", cue: "让回答基于证据", pipeline: "权威上下文 + 来源标识 + 使用规则 + 拒答条件", boundary: "提示无法弥补漏检、过期来源或错误权限过滤。" },
  ],
  messageResponsibilities: [
    { code: "A", title: "平台 / 应用指令", body: "定义产品角色、允许任务、总体约束与输出规范。适合稳定策略，不应存放密钥、权限表或必须保密的系统信息。", control: "常见字段：System / Developer / Instructions；以所选 API 为准" },
    { code: "B", title: "用户消息 · User Message", body: "表达本次目标和输入。它是业务请求，不应有权修改身份、授权或后台策略；需要做长度、内容和敏感数据检查。", control: "信任边界：外部输入，默认不可信" },
    { code: "C", title: "上下文与示例 · Context & Examples", body: "文档、历史、少样本示例和工具结果可改善任务完成，但也可能包含过期事实、恶意指令或不适用的历史状态。", control: "治理重点：来源、权限、时效、token 预算" },
    { code: "D", title: "应用控制 · Application Control", body: "身份、授权、工具执行、数据写入、输出校验和最终业务动作必须由确定性系统执行，不能委托给自然语言提示。", control: "主归属：安全治理 / API / Agent / 工作流" },
  ],
  techniqueLadder: [
    { symptom: "任务目标或输出边界含糊", technique: "Zero-shot 基线", change: "明确任务、输入、约束、成功标准和输出契约", boundary: "先证明基础表达是否足够，不先堆技巧。" },
    { symptom: "标签、风格或边界容易误解", technique: "Few-shot Examples", change: "加入代表性正例、边界例与拒答例", boundary: "示例数量由评估增益决定，越多不一定越好。" },
    { symptom: "下游需要稳定字段", technique: "Structured Outputs", change: "使用 API Schema，并在应用侧校验类型与业务规则", boundary: "结构正确仍不证明字段值真实。" },
    { symptom: "单次任务过长或步骤互相干扰", technique: "Task Decomposition / Chaining", change: "拆成有明确中间产物与检查点的步骤", boundary: "固定步骤优先工作流；不要把链条全塞进一条 Prompt。" },
    { symptom: "需要查询工具并根据结果调整", technique: "ReAct / Agent", change: "把工具调用、观察、停止和授权交给编排层", boundary: "这是从 Prompt 进入 Agent 的边界，不是更长的系统提示。" },
    { symptom: "需要更深推理而非更多知识", technique: "Reasoning Model", change: "给清晰问题、证据、约束和推理预算", boundary: "通常不要求公开或手写冗长 Chain-of-Thought；仍需验证最终答案。" },
  ],
  contextBudgetZones: [
    { zone: "明确且稳定的指令", en: "Stable Instructions", content: "角色、任务边界、输出契约和长期规则", control: "版本、审批、回归；稳定前缀有利于缓存" },
    { zone: "可信状态", en: "Trusted State", content: "身份、权限、业务配置和权威系统结果", control: "由应用注入；模型不能自行改写" },
    { zone: "动态证据", en: "Dynamic Evidence", content: "RAG 文档、网页、历史、工具返回和用户内容", control: "来源、ACL、时效、长度与不可信标记" },
    { zone: "能力接口", en: "Tools & Schema", content: "工具说明、参数 Schema、可用动作与返回契约", control: "最小集合、清晰职责、应用侧授权与执行" },
  ],
  promptSecurityScenarios: [
    { threat: "直接提示注入", source: "用户试图覆盖系统指令", control: "输入分区、策略检查、最小权限、拒绝高风险越权" },
    { threat: "间接提示注入", source: "网页、邮件、PDF、RAG 证据或工具返回中的恶意指令", control: "把外部内容标为数据；隔离指令、限制工具并对高风险动作审批" },
    { threat: "越狱", source: "角色扮演、编码、分步诱导等绕过安全策略", control: "内容安全、策略组合、红队与模型外业务不变量" },
    { threat: "系统提示泄露", source: "模型复述隐藏指令、示例或敏感上下文", control: "不在 Prompt 存放密钥；最小披露、输出检查与日志脱敏" },
  ],
  systemLens: [
    {
      id: "prompt-call",
      label: "一次调用",
      title: "生产 Prompt 是一次受治理的上下文装配",
      description: "模型看到的不只是几句提示词，而是一组具有不同权威、来源、时效和执行后果的输入。",
      takeaway: "Prompt 的工作是表达任务；身份、权限、事实来源、工具执行和业务校验仍属于应用系统。",
      nodes: [
        { label: "明确且稳定的指令", en: "Stable Instructions", detail: "定义角色、任务、边界、成功标准与输出契约。", signal: "治理：版本、审批与回归" },
        { label: "可信状态", en: "Trusted State", detail: "由应用注入身份、权限、配置和权威业务状态。", signal: "治理：来源与不可篡改字段" },
        { label: "动态上下文", en: "Dynamic Context", detail: "用户内容、RAG 证据、历史和工具返回按预算进入。", signal: "治理：ACL、时效与不可信标记" },
        { label: "能力接口", en: "Tools & Schema", detail: "声明可用工具、参数、错误与结构化输出形状。", signal: "治理：最小集合与应用授权" },
        { label: "校验与执行", en: "Validate & Execute", detail: "应用校验结构、业务规则和动作权限后才消费结果。", signal: "治理：拒绝、回滚与审计" },
      ],
    },
    {
      id: "prompt-failure",
      label: "一次退化",
      title: "看起来像 Prompt 失效，根因可能来自整个调用剖面",
      description: "只改措辞会掩盖模型、上下文、工具和业务校验的真实变化，导致反复试错却无法复现。",
      takeaway: "每次只改变一个主要变量，并记录模型快照、提示版本、上下文装配记录、工具 Schema 和评估集。",
      nodes: [
        { label: "指令冲突", detail: "平台、应用、用户和外部内容对同一行为给出相互矛盾的要求。", signal: "检查：权威顺序与冲突测试" },
        { label: "上下文污染", detail: "过期证据、错误历史或间接提示注入进入模型输入。", signal: "检查：来源、ACL、时效与数据标记" },
        { label: "工具含糊", detail: "工具职责重叠、参数描述不清或错误语义不足。", signal: "检查：选择准确率与参数失败" },
        { label: "输出形对值错", detail: "Schema 正确，但字段内容不真实、不合规或不可执行。", signal: "检查：业务不变量与事实验证" },
        { label: "评估失真", detail: "只看少量演示或最终文字，忽略任务分布和失败终态。", signal: "检查：固定集、轨迹与线上反馈" },
      ],
    },
    {
      id: "prompt-release",
      label: "一次发布",
      title: "Prompt 行为版本的发布单位",
      description: "同一段提示在不同模型、上下文供给和工具契约下会表现不同；这些变化必须一起进入发布证据。",
      takeaway: "把 Prompt、模型、上下文策略、工具 Schema、评估结果和回滚开关绑定为同一发布包。",
      nodes: [
        { label: "冻结基线", detail: "记录当前生产版本、任务分布、质量、时延和成本。", signal: "产物：可复现的行为快照" },
        { label: "控制变更", detail: "只修改一个主要变量，并说明希望改善的失败类型。", signal: "产物：变更假设与责任人" },
        { label: "离线回归", detail: "测试正常、边界、拒答、注入和工具调用任务。", signal: "门禁：关键任务不得退化" },
        { label: "灰度观察", detail: "按租户或流量小范围发布，关联版本与真实业务结果。", signal: "门禁：质量、风险和成本阈值" },
        { label: "回滚与运营", detail: "保留一键回滚、退化告警和线上样本回流。", signal: "产物：版本谱系与持续评估" },
      ],
    },
  ],
};

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
  contentContract: deepFreeze({"principle":["Prompt 是什么，以及 Context Engineering 的边界"],"mechanism":["明确且稳定的指令","动态上下文","能力接口"],"boundary":["必须执行的规则应落在模型外"],"cloud":["提示词工程与云服务机会"],"customer":["客户高频问题与深度回答"]}),
  brief,
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
