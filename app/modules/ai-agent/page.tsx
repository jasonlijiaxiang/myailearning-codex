import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { agentDeepDives, agentEvidenceCards, agentQa } from "../../agent-content.mjs";
import { balanceGridRows, gridSpan } from "../../layout-utils.mjs";
import { BalancedGrid, CriticalBoundary, ModuleDeepDiveBlocks, ModuleEvidenceGrid, ModuleHeroMetrics, ModuleQaList, ModuleUpdatedAt } from "../../module-content-components";
import { ModuleReadingNav, ReadingProgress, SystemLens, type LensPanel, type ReadingSection } from "../../fieldbook-interactions";
import { AgentRunLab } from "../../flagship-labs";
import { sourceLedger } from "../../reference-content.mjs";
import { AgentControlPrimer } from "../../module-pilot-views";
import { getPublishedModule } from "../../module-publication.mjs";

export const metadata: Metadata = {
  title: "Agent · 智能体 | 云计算 × AI 平台售前知识库",
  description: "AI Agent 的基础概念、工作循环、架构边界、云服务连接、评估治理与售前高频问题。",
};

const agentPublication = getPublishedModule("ai-agent");

const conceptLinks = [
  { concept: "模型与推理", owner: "大语言模型原理", href: "/modules/llm", relation: "能力底座", local: "模型负责理解状态和选择下一步，但不应直接获得业务权限。" },
  { concept: "指令与上下文", owner: "提示词工程", href: "/modules/prompt-engineering", relation: "行为约束", local: "把角色、目标、边界、工具规则和输出契约组织为可版本化指令。" },
  { concept: "RAG 与知识", owner: "RAG · 检索增强生成", href: "/modules/rag", relation: "数据工具", local: "为 Agent 提供可更新证据；检索只是任务链中的一种工具能力。" },
  { concept: "工作流 · Workflow", owner: "场景解决方案", href: "/modules/solution-patterns", relation: "确定性骨架", local: "固定规则负责可预测路径，Agent 只处理真正需要动态判断的节点。" },
  { concept: "MCP", owner: "模型上下文协议", href: "/modules/mcp", relation: "工具互操作", local: "标准化工具与上下文的连接方式，不替代身份、授权和业务审批。" },
  { concept: "A2A", owner: "A2A · 智能体间协议", href: "/modules/a2a", relation: "Agent 协作", local: "面向 Agent 发现、委派与结果交换；不等于多 Agent 架构本身。" },
  { concept: "评估与治理", owner: "评估", href: "/modules/evaluation", relation: "上线检查", local: "用可验证的最终状态衡量任务成功，并检查轨迹、安全、时延与成本。" },
  { concept: "身份与授权", owner: "AI 安全", href: "/modules/security", relation: "执行边界", local: "应用在每次工具调用前绑定主体、验证权限、执行策略并留下审计证据。" },
];

const conceptRows = balanceGridRows(conceptLinks, 4);

const agentLoop = [
  { zh: "感知", en: "Perceive" },
  { zh: "思考", en: "Reason" },
  { zh: "行动", en: "Act" },
  { zh: "观察", en: "Observe" },
  { zh: "继续 / 终止", en: "Continue / Stop" },
];

const agentActions = [
  {
    code: "01",
    title: "感知 · Perceive",
    definition: "把用户请求、系统事件和当前环境状态，整理成 Agent 此刻能够处理的任务表示。感知不是把所有数据塞进上下文，而是识别目标、对象、约束、身份和仍缺少的信息。",
    mechanism: "入口层先完成身份绑定、意图识别、输入校验与上下文选择；必要时调用搜索、OCR、数据库或传感器接口补齐证据，再形成结构化任务状态。",
    io: "输入：自然语言、事件、会话状态、业务记录。输出：目标、已知事实、约束、风险等级、待确认项。",
    failure: "常见失败：误解目标、忽略附件或权限、把不可信内容当指令、上下文过载、引用了过期状态。",
    control: "工程控制：输入 Schema、来源标记、Prompt Injection 隔离、时效检查、缺失字段追问。",
    cloud: "云服务连接：多模态模型、文档解析 / OCR、托管搜索、事件总线、API 网关、身份服务。",
    presales: "售前判断：客户的任务入口有哪些？哪套系统是事实源？输入是否跨模态、跨租户或有实时性要求？",
  },
  {
    code: "02",
    title: "思考 · Reason",
    definition: "基于目标、当前状态和可用工具，判断下一步是补充信息、调用工具、修改计划、给出结果，还是停止并交还人工。这里的重点是可执行决策，不是展示模型内部推理文字。",
    mechanism: "模型把任务状态与工具契约进行匹配，评估候选动作的前置条件、风险与预期结果；复杂任务可先规划，简单任务可逐步决策，并在每次观察后重新判断。",
    io: "输入：任务状态、计划、记忆、工具目录、策略与预算。输出：结构化动作意图、参数草案、决策摘要或终止原因。",
    failure: "常见失败：凭空假设、目标漂移、选择错误工具、反复规划不行动、忽略业务规则或把不确定判断说成事实。",
    control: "工程控制：限定动作空间、结构化输出、风险规则、轮次 / token 预算、检查点、低置信度接管。",
    cloud: "云服务连接：模型服务与路由、AI 网关、内容安全、策略引擎、评估平台、Prompt 版本管理。",
    presales: "售前判断：哪些决策确实需要模型？正确性如何验证？是否允许模型在多个工具之间自主选择？",
  },
  {
    code: "03",
    title: "行动 · Act",
    definition: "把模型提出的动作意图交给应用执行：查询知识、调用 API、运行代码、发送消息或修改业务状态。模型提出调用，不代表它拥有凭据或可以绕过审批。",
    mechanism: "应用根据工具 Schema 校验参数，绑定用户或工作负载身份，执行授权与策略判断；通过后才调用真实系统，并把结果、错误与操作凭证返回给 Agent。",
    io: "输入：工具名、结构化参数、调用主体、策略上下文。输出：执行结果、错误码、资源版本、操作编号与可回滚信息。",
    failure: "常见失败：选错 API、参数越界、重复扣款 / 重复建单、超时后误重试、越权调用、部分成功未补偿。",
    control: "工程控制：最小权限、参数白名单、幂等键、预览与审批、超时重试、事务 / 补偿、沙箱与审计。",
    cloud: "云服务连接：API / MCP Gateway、函数计算、工作流、IAM、密钥管理、沙箱、私网连接与消息队列。",
    presales: "售前判断：哪些动作只读、可逆或高风险？现有 API 是否稳定？失败后能否回滚、补偿和追责？",
  },
  {
    code: "04",
    title: "观察 · Observe",
    definition: "读取行动产生的真实环境反馈，并判断预期状态是否已经发生。观察与感知的区别是：感知建立本轮起点，观察验证刚刚行动的结果。",
    mechanism: "解析工具返回、回读权威系统、比较前置 / 后置状态，更新任务状态和证据；随后触发下一轮思考，或确认完成、失败、超时和人工接管。",
    io: "输入：API 响应、数据库状态、事件、错误、Trace。输出：已验证事实、状态增量、异常、完成证据和下一轮信号。",
    failure: "常见失败：把 HTTP 200 当业务成功、忽略异步状态、相信模型生成的成功描述、未发现部分失败、旧结果污染下一轮。",
    control: "工程控制：后置条件、Read-after-Write、来源与时间戳、Checkpoint、异常分类、最终状态检查和人工复核。",
    cloud: "云服务连接：数据库 / 缓存、事件总线、Tracing、日志与指标、评估平台、告警和状态存储。",
    presales: "售前判断：客户用哪个系统状态证明任务完成？异步结果多久可见？失败和人工接管由谁运营？",
  },
];

const agentActionRows = balanceGridRows(agentActions, 2);

const engineeringScopes = [
  { scope: "一次交互", name: "Prompt Engineering", question: "这一轮应该怎样告诉模型？", owns: "任务说明、示例、约束与输出契约。" },
  { scope: "每次调用", name: "Context Engineering", question: "每一步应该让模型看到什么？", owns: "身份、历史、证据、工具定义与当前状态的选择和装配。" },
  { scope: "完整任务", name: "Harness Engineering", question: "整个任务如何运行、行动、验证、恢复和受控？", owns: "运行循环、工具执行、状态、权限、预算、验证、恢复和观测。" },
  { scope: "完整产品", name: "Agent 工程 · Agent Engineering", question: "如何把模型、Harness 与业务系统做成可运营产品？", owns: "业务流程、体验、组织责任、发布、治理与长期运营。" },
];

const harnessLayers = [
  { title: "内层 Harness", en: "Inner Harness", body: "直接围绕模型调用：上下文装配、工具选择与参数、循环、压缩、停止、结构化输出和局部评分。" },
  { title: "外层 Harness", en: "Outer Harness", body: "围绕完整任务运行：身份与审批、沙箱、工作区、检查点、重试、终态验证、Trace、发布与人工接管。" },
];

const harnessNeighbors = [
  { name: "Tool", role: "提供一个可调用能力", boundary: "不负责完整任务循环与恢复。" },
  { name: "MCP", role: "标准化工具、资源与 Prompt 的连接", boundary: "不自动提供业务授权和终态验证。" },
  { name: "Skill / Rule", role: "提供可复用知识、步骤或约束", boundary: "通常由 Harness 发现、注入和执行。" },
  { name: "Workflow", role: "以代码或流程图确定路径与状态", boundary: "可包住 Agent，也可被 Harness 调用。" },
  { name: "Framework", role: "提供开发抽象和组件 API", boundary: "实现范围可能只覆盖部分 Harness。" },
  { name: "Sandbox", role: "隔离命令、代码、网络和文件副作用", boundary: "是 Harness 的执行控制之一。" },
  { name: "Agent Platform", role: "把运行时、身份、观测与运营产品化", boundary: "通常承载一个或多个 Harness。" },
];

const harnessEvaluationDimensions = [
  "任务成功与关键后置条件",
  "多次运行稳定性与复现率",
  "Token、P95 与成功任务成本",
  "工具、权限和轨迹正确性",
  "策略违规与不可逆误执行",
  "崩溃恢复、幂等和人工接管",
  "Trace、版本与失败归因",
  "模型、环境与业务迁移成本",
];

const architecturePatterns = [
  { name: "确定性工作流 · Deterministic Workflow", cue: "步骤清楚、规则稳定、错误代价高", pipeline: "固定步骤 → 条件分支 → 人工审批", boundary: "最易测试和审计；不要为追求 Agent 标签而增加自治。" },
  { name: "单智能体 · Single Agent", cue: "步骤动态但职责集中", pipeline: "模型 ↔ 工具 ↔ 环境反馈，循环至退出", boundary: "默认起点；工具和上下文膨胀时质量会退化。" },
  { name: "编排者—执行者 · Orchestrator–Workers", cue: "子任务无法预先确定、可分工", pipeline: "管理者分解 → 执行者完成 → 汇总验证", boundary: "增加交接、重复调用、权限传播和轨迹评估成本。" },
  { name: "评估者—优化者 · Evaluator–Optimizer", cue: "有明确质量标准、迭代能提升", pipeline: "生成 → 评价 → 反馈 → 修正，直到门槛", boundary: "必须限制轮次和预算；评价器也会判断错误。" },
];

const coreCapabilities = [
  {
    code: "P",
    title: "规划 · Planning",
    definition: "把目标分解为可检查的子目标，并选择顺序、工具、依赖和停止条件。规划是当前信息下的行动假设，不是必须照做到底的脚本。",
    mechanism: "简单任务采用逐步规划（每轮只定下一步）；长任务采用计划—执行（先列里程碑，再逐项验证）；可并行任务可由编排者拆给执行者，汇总后再校验。",
    io: "输入：目标、当前状态、工具能力、约束、时间与成本预算。输出：里程碑、候选动作、依赖、预期结果、检查点和退出条件。",
    failure: "常见失败：过度规划、遗漏前置条件、计划与工具不匹配、环境变化后仍照旧执行、拆分过细导致成本激增。",
    control: "工程控制：计划 Schema、最大深度 / 轮次、预算、关键里程碑审批、每次观察后重规划、最终状态检查。",
    cloud: "云服务连接：Agent Runtime、工作流 / 任务编排、模型路由、队列、分布式任务、评估与 Trace。",
    presales: "售前判断：路径为什么不可预先确定？任务最长多久？哪些里程碑必须人工确认？并行带来的收益是否覆盖成本？",
  },
  {
    code: "M",
    title: "记忆 · Memory",
    definition: "为后续决策保留有用信息。当前 Run 的工作状态、跨轮会话信息和跨会话长期记忆用途不同；记忆不是把全部聊天记录永久保存。",
    mechanism: "运行状态保存本次任务的目标、步骤、工具结果与预算；短期会话记忆保存当前会话事件与上下文；情节记忆保存过去任务经历；语义记忆保存经过核验的偏好或事实。长期写入前提取、去重、校验来源，读取时按主体、任务和时效检索。",
    io: "输入：对话、工具结果、用户确认、业务事件。输出：带主体、来源、时间、置信度、范围与保留期的记忆条目，或与当前任务相关的记忆片段。",
    failure: "常见失败：错误总结被永久化、跨用户串记忆、旧偏好覆盖新事实、敏感信息过度保留、检索到记忆却忽略适用范围。",
    control: "工程控制：命名空间、来源、TTL、版本、用户确认、访问控制、加密、纠正 / 删除、写入与读取评估。",
    cloud: "云服务连接：会话存储、数据库、向量检索、对象存储、缓存、KMS、数据治理与生命周期管理。",
    presales: "售前判断：要记住什么、为谁记、保存多久？谁能纠正和删除？哪些事实必须每次回到权威系统读取？",
  },
  {
    code: "T",
    title: "工具 · Tools",
    definition: "Agent 与外部世界交互的受控能力接口，包括知识工具（搜索 / RAG）、动作工具（业务 API）、计算工具（代码 / 函数）和协作工具（消息 / 其他 Agent）。",
    mechanism: "工具目录向模型暴露名称、唯一用途、输入输出 Schema、错误语义和使用边界；模型选择并生成参数，应用负责校验、授权、执行，把真实结果送回观察阶段。",
    io: "输入：工具描述、调用意图、结构化参数、身份与策略。输出：结构化结果、错误、操作凭证、资源状态和审计记录。",
    failure: "常见失败：工具职责重叠、描述含糊、参数幻觉、返回内容注入、读写权限混放、错误语义不足导致无限重试。",
    control: "工程控制：清晰 Tool Contract、最小工具集、读写分级、Schema、IAM、幂等、超时、限流、审批、审计与沙箱。",
    cloud: "云服务连接：API Gateway、MCP Gateway、函数计算、SaaS 连接器、服务目录、IAM、密钥、工作流与服务网格。",
    presales: "售前判断：工具是否已有 API？模型能否清楚区分？谁是调用主体？哪些写操作需要预览、审批和补偿？",
  },
];

const coreCapabilityRows = balanceGridRows(coreCapabilities, 4);

const memoryLayers = [
  { layer: "当前任务状态", en: "Work State", stores: "目标、当前步骤、工具结果、预算、停止原因", read: "每一轮", write: "运行时在检查点更新", boundary: "任务结束后按审计与恢复要求保留；不能冒充业务事实源。" },
  { layer: "会话状态", en: "Session State", stores: "本次会话历史、临时偏好、未完成事项", read: "当前会话", write: "对话或事件触发", boundary: "应有 TTL、用户与租户隔离，避免无限累积。" },
  { layer: "长期记忆", en: "Long-term Memory", stores: "经确认的偏好、情节摘要、可复用经验", read: "与主体和任务相关时", write: "提取、去重、校验后", boundary: "允许纠正与删除；模型总结不能自动成为长期真相。" },
  { layer: "权威业务事实", en: "Authoritative Facts", stores: "订单、余额、政策、权限、资源真实状态", read: "需要做决定或验收时", write: "只由业务系统和获授权流程", boundary: "Agent 可以读取或提出变更，但不能把 Memory 当作权威记录。" },
];

const interactionBoundaries = [
  { capability: "Function Calling", purpose: "表达一次工具调用意图和结构化参数", owns: "模型 ↔ 应用", boundary: "应用仍负责授权、执行、幂等、回读与审批。" },
  { capability: "MCP", purpose: "统一发现并连接工具、资源与提示原语", owns: "Agent / AI 应用 ↔ 工具与数据", boundary: "不是 Agent 编排器，也不提供天然安全认证。" },
  { capability: "A2A", purpose: "发现其他 Agent、委派任务并交换任务状态与产物", owns: "Agent ↔ Agent", boundary: "单系统内部编排不必为了使用协议而拆成分布式协作。" },
  { capability: "API / RPA / Computer Use", purpose: "把决策变成外部系统动作", owns: "应用侧控制规则 ↔ 目标系统", boundary: "有稳定 API 时优先 API；界面操作需隔离环境、最小权限与回放证据。" },
];

const cloudHooks = [
  { stage: "模型与路由", services: "模型即服务、模型目录、推理端点、AI 网关、内容安全", value: "按任务复杂度选择模型并统一限流、版本和策略", discover: "哪些决策需要强模型？是否允许跨地域或多模型？" },
  { stage: "Agent Runtime", services: "托管 Agent 运行时、Serverless、容器、Kubernetes、任务队列", value: "运行循环和长任务，管理状态、超时、重试与弹性", discover: "任务持续多久？同步还是异步？失败如何恢复？" },
  { stage: "工具接入", services: "API 网关、MCP Gateway、函数计算、工作流、事件总线、SaaS 连接器", value: "把业务 API 变成可发现、可校验、可治理的工具", discover: "有哪些现成 API？读写动作如何分级和审批？" },
  { stage: "知识与状态", services: "托管搜索、向量库、数据库、对象存储、缓存、会话与 Memory", value: "保存证据、任务状态和经过治理的长期记忆", discover: "哪些状态是权威事实？谁能修改、撤回和删除？" },
  { stage: "身份与安全", services: "IAM、工作负载身份、密钥管理、策略引擎、WAF、私网与沙箱", value: "让每次工具调用绑定真实主体并执行最小权限", discover: "用用户身份还是服务身份？哪些动作不可逆？" },
  { stage: "可观测与评估", services: "Tracing、日志、指标、APM、评估平台、告警、SIEM", value: "还原任务轨迹，定位失败并持续检查质量和风险", discover: "怎样确认任务最终完成？日志能否关联模型与工具步骤？" },
  { stage: "运营与 FinOps", services: "预算、配额、成本分析、缓存、容量与发布平台", value: "控制轮次、工具消耗和每个成功任务成本", discover: "P95、并发、任务预算和回滚要求是什么？" },
];

const agentReadingSections: ReadingSection[] = [
  { id: "concept-map", label: "知识连接", eyebrow: "相关模块" },
  { id: "agent-principle", label: "工作循环", eyebrow: "四个关键动作" },
  { id: "harness", label: "Harness", eyebrow: "运行、验证与恢复" },
  { id: "boundaries", label: "模式边界", eyebrow: "不要滥用 Agent" },
  { id: "capabilities", label: "关键组件", eyebrow: "规划、记忆与工具" },
  { id: "memory-interaction", label: "状态与互操作", eyebrow: "事实、记忆与协议" },
  { id: "patterns", label: "架构模式", eyebrow: "自治怎样增加" },
  { id: "architecture", label: "参考架构", eyebrow: "模型与控制规则" },
  { id: "agent-independent-depth", label: "生产级扩展", eyebrow: "状态机与恢复" },
  { id: "cloud-opportunities", label: "云服务机会", eyebrow: "能力到产品" },
  { id: "poc", label: "PoC 剧本", eyebrow: "按动作风险推进" },
  { id: "evidence", label: "数据与证据", eyebrow: "知道适用边界" },
  { id: "qa", label: "客户问答", eyebrow: "现场快速使用" },
];

const agentSystemLens: LensPanel[] = [
  {
    id: "agent-run",
    label: "一次 Run",
    title: "一次 Agent Run 按受控状态机推进",
    description: "每一轮都要从环境事实开始，以可验证状态结束；模型负责提出下一步，应用负责执行和确认。",
    takeaway: "工具返回成功不等于业务完成，必须由权威系统状态和最终状态检查来结束 Run。",
    nodes: [
      { label: "感知", en: "Perceive", detail: "绑定身份，读取请求、事件、事实源与仍缺少的信息。", signal: "输出：结构化任务状态" },
      { label: "思考", en: "Reason", detail: "在工具、策略、预算和当前状态下选择下一步。", signal: "输出：动作意图或停止原因" },
      { label: "行动", en: "Act", detail: "应用校验参数、授权、审批和幂等后调用真实系统。", signal: "输出：操作编号与真实返回" },
      { label: "观察", en: "Observe", detail: "回读权威状态，判断预期后置条件是否发生。", signal: "输出：已验证事实与异常" },
      { label: "继续或终止", en: "Continue / Stop", detail: "更新检查点，继续下一轮、交还人工或记录最终状态。", signal: "输出：可恢复的 Run 状态" },
    ],
  },
  {
    id: "agent-controls",
    label: "控制规则",
    title: "自治能力越强，模型外控制必须越明确",
    description: "规划、记忆和工具让 Agent 能持续运行；身份、策略、检查点与人工接管让它可被企业接受。",
    takeaway: "不要把 Prompt 写成权限系统；授权、金额、审批、补偿与审计必须落在确定性系统。",
    nodes: [
      { label: "规划", detail: "把目标拆成可检查里程碑，并为每一步定义预期结果。", signal: "控制：深度、轮次与预算" },
      { label: "记忆", detail: "区分任务状态、会话状态、长期记忆和权威业务事实。", signal: "控制：主体、来源、TTL 与删除" },
      { label: "工具契约", detail: "定义唯一用途、Schema、错误语义、读写级别和补偿能力。", signal: "控制：最小工具集与参数校验" },
      { label: "身份与策略", detail: "在动作发生时绑定用户或工作负载身份并重新授权。", signal: "控制：最小权限与动态策略" },
      { label: "检查点与人审", detail: "在高风险动作前暂停，在失败后从持久状态恢复。", signal: "控制：审批、超时与恢复责任" },
    ],
  },
  {
    id: "agent-recovery",
    label: "一次故障",
    title: "动作结果未知是最危险的失败",
    description: "长任务、异步 API 和网络重试会产生模糊状态；可靠 Agent 必须能恢复、确认、补偿并留下证据。",
    takeaway: "每个写操作都需要幂等键、操作编号、后置条件和可恢复检查点，高风险路径还需要人工接管。",
    nodes: [
      { label: "动作已提交", detail: "Agent 发起退款、建单或资源变更，请求可能已被系统接受。", signal: "记录：幂等键与业务操作号" },
      { label: "进程中断", detail: "模型超时、Worker 崩溃或响应在网络中丢失。", signal: "保存：动作前检查点与调用证据" },
      { label: "恢复 Run", detail: "从持久状态恢复，而不是重新生成整段计划。", signal: "读取：已执行步骤与未决动作" },
      { label: "回读事实", detail: "查询业务系统确认动作成功、失败、仍处理中或状态未知。", signal: "判断：权威后置条件" },
      { label: "继续、补偿或人审", detail: "只在状态明确后继续；未知或高风险状态交还人工。", signal: "留下：最终状态、原因与审计轨迹" },
    ],
  },
];

export default function AgentModulePage() {
  return (
    <main className="modulePage modulePilot modulePilot--dedicated">
      <ReadingProgress />
      <section className="ragHero" id="agent" aria-labelledby="agent-title">
        <nav className="topbar" aria-label="模块导航">
          <Link className="brand" href="/" aria-label="返回云与 AI 售前知识库首页">
            <span>Cloud × AI / Presales Fieldbook</span>
          </Link>
          <div className="toplinks">
            <Link href="#agent-principle">Agent 原理</Link>
            <Link href="/coding-agents">Coding Agent 选型</Link>
            <Link href="#qa">本模块问答</Link>
            <Link href="/glossary">术语库</Link>
            <Link href="/questions">全部问题</Link>
            <Link href="/references">Reference</Link>
          </div>
        </nav>
        <div className="ragHeader">
          <div>
            <p className="kicker light">MODULE · APPLICATION PATTERN · V2.0</p>
            <h1
              className="moduleHeroTitle"
              id="agent-title"
              style={{ "--module-title-size": "clamp(76px,10vw,148px)", "--module-title-mobile-size": "clamp(68px,22vw,88px)" } as CSSProperties}
            >Agent<br /><span>智能体 · AI Agent</span></h1>
          </div>
          <div className="ragDefinition">
            <p>让模型在受控边界内，根据环境反馈选择下一步并调用工具完成任务；系统需要明确区分模型的动态判断、应用的确定性控制和业务授权。</p>
            <ModuleHeroMetrics sectionCount={agentReadingSections.length} questionCount={agentQa.length} evidenceCount={agentEvidenceCards.length} />
          </div>
        </div>
      </section>

      <div className="moduleArticleLayout dedicatedArticleLayout">
        <ModuleReadingNav moduleName="Agent · 智能体" sections={agentReadingSections} quickLinks={[
          { href: "#agent-principle", label: "先懂原理" },
          { href: "#cloud-opportunities", label: "找云机会" },
          { href: "#qa", label: "准备客户问答" },
        ]} />
      <section className="section ragBody" aria-label="Agent 核心内容">
        <div className="sectionNumber">02</div>
        <div className="sectionBody">
          <div className="decisionBanner">
            <p className="kicker">PRESALES POSITION</p>
            <h3>一句话定位</h3>
            <p>客户真正需要的是能够识别目标、调用获准工具、验证结果，并在失败或高风险时停下来交还人工的任务执行系统。</p>
          </div>

          <AgentControlPrimer />

          <div className="subsection" id="concept-map" data-quality-section="related-modules">
            <div className="subHead"><span>2.1</span><div><p className="kicker">KNOWLEDGE CONNECTIONS</p><h3>Agent 在知识地图中的位置与相关模块</h3></div></div>
            <p className="sectionLead">Agent 聚焦“由模型动态管理任务执行”。模型、Prompt、RAG、协议、身份与评估各有独立主模块；这里解释它们如何在一个可执行系统中协作。</p>
            <div className="conceptGrid" data-count={conceptLinks.length} data-odd={conceptLinks.length % 2 === 1 ? "true" : "false"}>
              {conceptRows.flatMap((row) => row.map((item) => (
                <article key={item.concept} style={{ "--concept-span": gridSpan(row.length) } as CSSProperties}>
                  <div className="conceptCard">
                    <div className="conceptMeta"><span>{item.relation}</span><Link href={item.href}>{item.owner} ↗</Link></div>
                    <h4>{item.concept}</h4><p>{item.local}</p>
                  </div>
                </article>
              )))}
            </div>
          </div>

          <div className="subsection foundationSection" id="agent-principle" data-quality-section="principle">
            <div className="subHead"><span>2.2</span><div><p className="kicker">FOUNDATION &amp; LOOP</p><h3>Agent 的基础概念与工作循环</h3></div></div>
            <div className="memoryCompare">
              <article>
                <p className="miniLabel">LLM APPLICATION</p>
                <h4>模型参与某一步</h4>
                <p>应用决定何时调用模型、输入什么和下一步走向；适合分类、抽取、生成和固定流程中的局部判断。</p>
              </article>
              <article className="externalMemory">
                <p className="miniLabel">AI AGENT</p>
                <h4>模型管理下一步</h4>
                <p>模型根据目标与当前状态选择动作，读取真实工具结果后继续、修正、完成或退出，但每个动作仍受应用侧控制规则（Control Plane）约束。</p>
              </article>
            </div>

            <div className="principleDepth">
              <header className="principleDepthIntro">
                <p className="miniLabel">PRESALES MECHANISM</p>
                <h4>Agent 的四个关键动作：感知—思考—行动—观察</h4>
                <p>Agent 会反复执行一组动作：把输入整理成当前任务状态，选择并执行动作，再读取真实环境结果。传统抽象常写作“观察—决策—行动—反馈”；这里进一步区分感知与行动后的观察。每次观察都会成为下一轮感知与思考的新依据，直到<strong>完成、失败、超时、超预算或交还人工</strong>。</p>
              </header>
              <div className="chainWrap">
                <div className="chainLabel"><strong>单次任务运行 · Run</strong><span>Controlled agent loop</span></div>
                <div className="flow runtimeFlow">
                  {agentLoop.map((step, index) => (
                    <div className="flowStep" key={step.zh}><span className="flowNo">{String(index + 1).padStart(2, "0")}</span><div className="flowTerm"><strong>{step.zh}</strong><small>{step.en}</small></div></div>
                  ))}
                </div>
              </div>
              <p className="paperBoundary"><strong>术语边界：</strong>为了教学，这里把<strong>感知（Perceive）</strong>定义为“把用户、事件和多模态输入标准化为当前任务状态”，把<strong>观察（Observe）</strong>定义为“读取工具与环境返回的 ground truth，更新状态并判断继续或终止”。不同框架可能把两者统称为 observation、context 或 state update，评估产品时应看实际数据流，不只看名称。</p>
              <div className="mechanicGrid" data-count={agentActions.length} data-odd={agentActions.length % 2 === 1 ? "true" : "false"}>
                {agentActionRows.flatMap((row) => row.map((item, index) => (
                  <article className={index === row.length - 1 ? "mechanicRowEnd" : undefined} key={item.code} style={{ "--mechanic-span": gridSpan(row.length) } as CSSProperties}>
                    <span className="mechanicNo">{item.code}</span>
                    <h4>{item.title}</h4>
                    <p><strong>定义：</strong>{item.definition}</p>
                    <p><strong>机制：</strong>{item.mechanism}</p>
                    <p><strong>输入 → 输出：</strong>{item.io}</p>
                    <p><strong>常见失败：</strong>{item.failure}</p>
                    <p><strong>工程控制：</strong>{item.control}</p>
                    <small><strong>云服务连接：</strong>{item.cloud}<br /><strong>售前判断：</strong>{item.presales}</small>
                  </article>
                )))}
              </div>
              <p className="paperBoundary"><strong>生产可观测边界：</strong>“思考（Reason）”不等于要求模型公开隐藏的思维链（Chain-of-Thought）。系统应记录可审计的<strong>计划、决策摘要、工具调用、环境结果、策略判断与停止原因</strong>；这些足以复盘行为，同时避免把冗长推理文字误当成真实依据。<strong>模型会调用 API，不等于模型拥有 API 权限。</strong></p>
              <div className="principleLimits">
                <article><span>A</span><h5>真实反馈优先于模型描述</h5><p>工具返回、权威数据库状态和执行错误决定下一步；“模型说成功”不等于业务已经成功。</p></article>
                <article><span>B</span><h5>循环必须有明确的最终状态</h5><p>完成、失败、超时、超预算、最大轮次和人工接管都要能被系统识别与审计。</p></article>
                <article><span>C</span><h5>应用侧控制每一步</h5><p>模型可以建议下一步，但工具、身份、预算、审批、执行和终止条件仍由应用掌握。</p></article>
              </div>
              <Link className="paperAnchor" href="/references#source-react-2023">原理来源：ReAct 论文 ↗</Link>
            </div>

            <div className="workedExample">
              <div className="exampleQuestion"><span>客户任务</span><strong>“分析这张异常账单，并在符合政策时创建退款工单。”</strong></div>
              <div className="exampleSteps">
                <article><span>01</span><h4>感知<small>Perceive</small></h4><p>把身份、账单、客户意图、退款政策与待确认信息整理为当前任务状态。</p></article>
                <article><span>02</span><h4>思考与行动<small>Reason &amp; Act</small></h4><p>判断应先查合同还是订单；模型提出调用，应用校验金额、权限和审批后执行。</p></article>
                <article><span>03</span><h4>观察并决定是否继续<small>Observe &amp; Close</small></h4><p>回读工单和退款状态；有操作编号才确认完成，冲突、超限或失败则进入下一轮或交还人工。</p></article>
              </div>
            </div>
            <CriticalBoundary>Agent 的“思考”不能替代业务控制。身份、权限、金额、审批、幂等、补偿和审计必须由确定性系统执行；Prompt 不是授权策略，模型输出也不是系统事实。</CriticalBoundary>
            <SystemLens title="从运行、控制与恢复理解 Agent" lead="三个视角共同回答：Agent 如何推进任务、企业怎样限制它，以及失败后如何知道真实世界发生了什么。" panels={agentSystemLens} />
            <AgentRunLab />
          </div>

          <div className="subsection" id="harness" data-quality-section="principle">
            <div className="subHead"><span>2.3</span><div><p className="kicker">AGENT RUNTIME &amp; CONTROL</p><h3>Harness：把模型能力变成可运行、可验证的任务系统</h3></div></div>
            <p className="sectionLead">这里保留英文 Harness，不强行指定单一中文译名。它不是又一个模型，也不只是 Agent Framework：它是围绕模型与环境建立的<strong>执行、反馈和控制系统</strong>。可以先用一个工作公式理解：<strong>Agent System = Model + Harness + Environment + Domain Rules</strong>。</p>

            <div className="tableWrap">
              <table>
                <thead><tr><th>工程范围</th><th>名称</th><th>主要问题</th><th>主要责任</th></tr></thead>
                <tbody>
                  {engineeringScopes.map((item) => <tr className={item.name === "Harness Engineering" ? "highlight" : undefined} key={item.name}><th>{item.scope}</th><td>{item.name}</td><td>{item.question}</td><td>{item.owns}</td></tr>)}
                </tbody>
              </table>
            </div>

            <div className="memoryCompare retrievalCompare">
              {harnessLayers.map((item, index) => (
                <article className={index === 1 ? "externalMemory" : undefined} key={item.en}>
                  <p className="miniLabel">{item.en.toLocaleUpperCase("en-US")}</p>
                  <h4>{item.title} · {item.en}</h4>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>

            <CriticalBoundary>用户感受到的效果不是“模型能力”的单变量结果，而是<strong>Model × Harness × Task × Environment</strong>。同一个模型放进不同 Coding Agent，可能因为上下文策略、工具、补丁方式、命令沙箱、验证循环和恢复机制不同而得到完全不同的结果。</CriticalBoundary>

            <BalancedGrid className="technicalNotes" maxColumns={4}>
              {harnessNeighbors.map((item) => <article key={item.name}><p className="miniLabel">NEIGHBORING CONCEPT</p><h4>{item.name}</h4><p>{item.role}</p><small>{item.boundary}</small></article>)}
            </BalancedGrid>

            <div className="gates">
              <h4>怎样判断一套 Harness 更好</h4>
              <div className="gateList">{harnessEvaluationDimensions.map((item) => <span key={item}>{item}</span>)}</div>
              <p>先固定任务、模型快照、代码或数据、网络、权限和预算，再进行多次运行与失败注入。SWE-bench、Terminal-Bench、SWE-ReBench 等只能回答特定任务；Harness-Bench 正尝试分离 Harness 效应，NIST 也在推进 Agent 标准工作，但目前没有覆盖所有 Agent 的统一总分。</p>
            </div>

            <div className="workedExample">
              <div className="exampleQuestion"><span>持续更新的选型资料</span><strong>Coding Agent 产品与 Harness 选型雷达</strong></div>
              <div className="exampleSteps">
                <article><span>01</span><h4>官方事实<small>Product Facts</small></h4><p>确认产品形态、模型策略、执行环境、权限与生命周期，不用媒体印象代替产品文档。</p></article>
                <article><span>02</span><h4>独立测评<small>Benchmarks</small></h4><p>按任务和实验配置读取排行榜，明确模型、Harness、预算、日期和复现条件。</p></article>
                <article><span>03</span><h4>客户 PoC<small>Field Validation</small></h4><p>用同一真实仓库、权限、任务和验收标准复测，最终按客户约束做选择。</p></article>
              </div>
              <Link className="paperAnchor" href="/coding-agents">打开 Coding Agent 产品与 Harness 选型雷达 ↗</Link>
            </div>
            <div className="deepDiveSources" aria-label="本节依据"><span>本节依据</span><Link href="/references#source-openai-harness-engineering">OpenAI Harness Engineering ↘</Link><Link href="/references#source-anthropic-agent-evals">Anthropic Agent Evals ↘</Link><Link href="/references#source-harness-bench-2026">Harness-Bench ↘</Link></div>
          </div>

          <div className="subsection" id="boundaries">
            <div className="subHead"><span>2.4</span><div><p className="kicker">BOUNDARY MAP</p><h3>智能体、工作流、RAG 与聊天机器人的边界</h3></div></div>
            <div className="tableWrap">
              <table>
                <thead><tr><th>模式</th><th>谁决定下一步</th><th>主要作用</th><th>是否改变外部状态</th><th>售前判断</th></tr></thead>
                <tbody>
                  <tr><th>聊天机器人 · Chatbot</th><td>通常由用户对话推进</td><td>自然语言交互与回答</td><td>不一定</td><td>“能聊天”不是 Agent 证明</td></tr>
                  <tr><th>RAG</th><td>检索链或应用预设</td><td>给模型提供外部证据</td><td>通常不改变</td><td>是 Agent 可使用的数据工具</td></tr>
                  <tr><th>工作流 · Workflow</th><td>代码、规则或流程图</td><td>稳定执行已知步骤</td><td>可以</td><td>高确定性路径优先</td></tr>
                  <tr className="highlight"><th>Agent</th><td>模型基于状态动态选择</td><td>处理开放、多步与例外任务</td><td>可以，但必须授权</td><td>只把必要决策交给模型</td></tr>
                </tbody>
              </table>
            </div>
            <p className="sectionFootnote">生产系统常采用“工作流（Workflow）包住 Agent 决策点，Agent 再调用 RAG 与业务工具”的组合，不需要在四者中只选一个。</p>
          </div>

          <div className="subsection" id="capabilities">
            <div className="subHead"><span>2.5</span><div><p className="kicker">CORE COMPONENTS</p><h3>规划、记忆与工具：让四个动作持续运转</h3></div></div>
            <p className="sectionLead">四个动作描述 Agent 每一轮“做什么”，三类组件说明它“靠什么持续完成多步任务”。规划决定路径，记忆保留必要信息，工具连接外部世界；三者共享一个可恢复、可审计的运行状态（Run State）。</p>
            <div className="mechanicGrid" data-count={coreCapabilities.length} data-odd={coreCapabilities.length % 2 === 1 ? "true" : "false"}>
              {coreCapabilityRows.flatMap((row) => row.map((item, index) => (
                <article className={index === row.length - 1 ? "mechanicRowEnd" : undefined} key={item.code} style={{ "--mechanic-span": gridSpan(row.length) } as CSSProperties}>
                  <span className="mechanicNo">{item.code}</span>
                  <h4>{item.title}</h4>
                  <p><strong>定义：</strong>{item.definition}</p>
                  <p><strong>机制：</strong>{item.mechanism}</p>
                  <p><strong>输入 → 输出：</strong>{item.io}</p>
                  <p><strong>常见失败：</strong>{item.failure}</p>
                  <p><strong>工程控制：</strong>{item.control}</p>
                  <small><strong>云服务连接：</strong>{item.cloud}<br /><strong>售前判断：</strong>{item.presales}</small>
                </article>
              )))}
            </div>
            <div className="memoryCompare retrievalCompare">
              <article>
                <p className="miniLabel">RUN STATE ≠ MEMORY</p>
                <h4>运行状态是共同底座</h4>
                <p>运行状态记录本次任务的目标、当前步骤、工具结果、预算和停止原因，应通过 Run ID、Checkpoint 与版本恢复。短期会话只服务当前交互；长期记忆才跨会话保留。Memory 是需治理的数据，不是模型魔法；不能把不断增长的聊天文本同时当状态机、数据库和审计日志。</p>
              </article>
              <article className="externalMemory">
                <p className="miniLabel">RAG ≠ MEMORY</p>
                <h4>知识检索不等于记住用户</h4>
                <p>RAG 从外部知识库取回可更新证据，回答“组织知道什么”；Memory 保存与主体和历史交互相关的信息，回答“这个 Agent 需要为谁记住什么”。二者都需要来源、权限和时效控制，但写入责任与生命周期不同。</p>
              </article>
            </div>
            <BalancedGrid className="technicalNotes" maxColumns={3}>
              <article><p className="miniLabel">DATA TOOLS</p><h4>数据工具 · Data Tools</h4><p>搜索、RAG、数据库查询和文件读取为判断提供证据，通常只读，但返回内容仍可能过期、越权或包含注入指令。</p></article>
              <article><p className="miniLabel">ACTION TOOLS</p><h4>动作工具 · Action Tools</h4><p>创建工单、修改订单、发消息或执行代码会改变外部状态，必须强化身份、幂等、审批、回读与补偿。</p></article>
              <article><p className="miniLabel">ORCHESTRATION TOOLS</p><h4>编排工具 · Orchestration Tools</h4><p>工作流、队列、子 Agent 和任务调度负责长任务、并行与交接；需要明确输入输出、超时、所有权和聚合验证。</p></article>
            </BalancedGrid>
          </div>

          <div className="subsection" id="memory-interaction">
            <div className="subHead"><span>2.6</span><div><p className="kicker">MEMORY &amp; INTERACTION</p><h3>记忆分层与外部交互边界</h3></div></div>
            <p className="sectionLead">Agent 的 Memory 不是一个不断增长的聊天框。任务状态、会话、长期记忆和权威事实有不同的写入责任、保留期和授权方式；工具调用、MCP、A2A 与 Computer Use 也解决不同连接问题。</p>
            <div className="tableWrap">
              <table>
                <thead><tr><th>状态层</th><th>保存什么</th><th>何时读取</th><th>谁能写入</th><th>重要边界</th></tr></thead>
                <tbody>{memoryLayers.map((item) => <tr key={item.en}><th>{item.layer}<small>{item.en}</small></th><td>{item.stores}</td><td>{item.read}</td><td>{item.write}</td><td>{item.boundary}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="tableWrap" style={{ marginTop: 18 }}>
              <table>
                <thead><tr><th>连接能力</th><th>主要解决什么</th><th>责任边界</th><th>不能替代什么</th></tr></thead>
                <tbody>{interactionBoundaries.map((item) => <tr key={item.capability}><th>{item.capability}</th><td>{item.purpose}</td><td>{item.owns}</td><td>{item.boundary}</td></tr>)}</tbody>
              </table>
            </div>
            <CriticalBoundary>RAG 主要提供组织知识，Memory 主要保存任务与主体相关状态，权威业务事实仍应回到事实源读取。连接协议能降低集成成本，却不会自动赋予身份、权限或生产可靠性。</CriticalBoundary>
          </div>

          <div className="subsection" id="patterns">
            <div className="subHead"><span>2.7</span><div><p className="kicker">ARCHITECTURE PATTERNS</p><h3>从确定性到动态编排的四种模式</h3></div></div>
            <div className="variantList">
              {architecturePatterns.map((item) => (
                <article key={item.name}><div><p className="miniLabel">{item.cue}</p><h4>{item.name}</h4></div><p className="variantPipeline">{item.pipeline}</p><p>{item.boundary}</p></article>
              ))}
            </div>
            <div className="fitGrid" style={{ marginTop: 18 }}>
              <article className="fit"><h4><span>✓</span>适合 Agent 的任务</h4><ul><li>步骤数量或工具路径无法提前确定</li><li>需要综合非结构化信息和环境反馈</li><li>有清晰的成功状态、沙箱和人工接管</li><li>动态判断带来的收益高于新增风险与成本</li></ul></article>
              <article className="fit maybe"><h4><span>!</span>优先不用 Agent</h4><ul><li>固定规则已经能稳定、低成本完成</li><li>缺少可验证的最终状态或真实工具反馈</li><li>高风险动作无法审批、回滚或补偿</li><li>没有代表性任务集和责任人持续运营</li></ul></article>
            </div>
          </div>

          <div className="subsection" id="architecture">
            <div className="subHead"><span>2.8</span><div><p className="kicker">REFERENCE ARCHITECTURE</p><h3>Agent 生产参考架构</h3></div></div>
            <div className="chainWrap">
              <div className="chainLabel"><strong>设计与治理链</strong><span>Design &amp; governance</span></div>
              <div className="flow">
                {[{zh:"任务与最终状态",en:"Task & Outcome"},{zh:"指令与工具",en:"Instructions & Tools"},{zh:"身份与策略",en:"Identity & Policy"},{zh:"评测与红队",en:"Evals & Red Team"},{zh:"版本与发布",en:"Version & Release"}].map((step, i) => <div className="flowStep" key={step.zh}><span className="flowNo">{String(i+1).padStart(2,"0")}</span><div className="flowTerm"><strong>{step.zh}</strong><small>{step.en}</small></div></div>)}
              </div>
              <div className="chainLabel runtime"><strong>在线任务链</strong><span>Serving pipeline</span></div>
              <div className="flow runtimeFlow">
                {[{zh:"请求与身份",en:"Request & Identity"},{zh:"Agent 循环",en:"Agent Loop"},{zh:"策略与工具",en:"Policy & Tools"},{zh:"状态与记忆",en:"State & Memory"},{zh:"验证或接管",en:"Verify / Handoff"}].map((step, i) => <div className="flowStep" key={step.zh}><span className="flowNo">{String(i+1).padStart(2,"0")}</span><div className="flowTerm"><strong>{step.zh}</strong><small>{step.en}</small></div></div>)}
              </div>
            </div>
            <div className="architectureNotes">
              <p><strong>共同使用的控制部分（Control Plane）</strong>：模型与 Prompt 版本、工具目录、身份策略、预算、Trace、评测集、发布和回滚。</p>
              <p><strong>关键分界</strong>：模型负责提出决策；应用与云平台负责验证身份、授权工具、执行动作并确认真实的最终状态。</p>
            </div>
          </div>

          <div className="subsection" id="agent-independent-depth" data-quality-section="deep-dive">
            <div className="subHead"><span>2.9</span><div><p className="kicker">INDEPENDENT KNOWLEDGE EXPANSION</p><h3>让 Agent 成为可托管的生产执行系统</h3></div></div>
            <p className="sectionLead">本节围绕一次真实任务的生命周期展开：Run 如何结束、工具怎样安全执行、崩溃后怎样恢复、记忆与委托怎样缩小信任。重点是客户长期托管能力，而不是框架功能清单。</p>
            <ModuleDeepDiveBlocks blocks={agentDeepDives} sourceLedger={sourceLedger} />
          </div>

          <div className="subsection cloudSection" id="cloud-opportunities" data-quality-section="cloud">
            <div className="subHead"><span>2.10</span><div><p className="kicker">CLOUD OPPORTUNITY MAP</p><h3>Agent 技术环节与云服务机会</h3></div></div>
            <div className="cloudIntro"><p>Agent 会把模型服务延伸到运行时、API、身份、数据、安全和运维。售前应先用厂商中立的能力描述拆解需求，再对应到当前云产品、地域、配额和计费。</p><span>模型只是其中一部分</span><span>身份贯穿每次调用</span><span>按成功任务核算成本</span></div>
            <div className="cloudTable tableWrap">
              <table><thead><tr><th>Agent 环节</th><th>可连接的云服务</th><th>客户价值</th><th>售前发现问题</th></tr></thead><tbody>
                {cloudHooks.map((item) => <tr key={item.stage}><th>{item.stage}</th><td>{item.services}</td><td>{item.value}</td><td>{item.discover}</td></tr>)}
              </tbody></table>
            </div>
            <BalancedGrid className="solutionBundles" maxColumns={3}>
              <article><p className="miniLabel">BUNDLE A</p><h4>企业服务 Agent</h4><p>模型服务 + RAG / 搜索 + CRM / 工单工具 + API 网关 + 用户身份 + 审批流 + Trace。</p><small>价值：从回答问题延伸到受控地完成服务流程</small></article>
              <article><p className="miniLabel">BUNDLE B</p><h4>Agent 工具与身份平台</h4><p>托管 Runtime + MCP / API Gateway + 工作负载身份 + 密钥 + 策略引擎 + 沙箱。</p><small>价值：把零散 API 变成可发现、可授权、可审计的工具面</small></article>
              <article><p className="miniLabel">BUNDLE C</p><h4>AgentOps 管理与监控</h4><p>Tracing / APM + 评估平台 + 日志 / SIEM + 发布回滚 + 配额预算 + FinOps。</p><small>价值：把长轨迹失败、风险和成本变成持续运营指标</small></article>
            </BalancedGrid>
          </div>

          <div className="subsection" id="poc">
            <div className="subHead"><span>2.11</span><div><p className="kicker">POC PLAYBOOK</p><h3>按自治风险逐级验证 Agent</h3></div></div>
            <div className="pocGrid">
              <article><span>SHADOW</span><h4>任务与最终状态</h4><p>先以观察或建议模式运行，固定真实任务、可验证的最终状态、风险等级和现有人工 / 工作流表现。</p></article>
              <article><span>READ ONLY</span><h4>最小可用工具流程</h4><p>接入完成任务必需的最少只读工具；验证身份、结构化参数、超时、停止、Trace 和后置条件。</p></article>
              <article><span>CONTROLLED WRITE</span><h4>受控副作用</h4><p>只开放可逆或低风险写入，验证审批绑定、幂等、重复消息、结果未知、部分成功、补偿和恢复。</p></article>
              <article><span>OPERATIONS</span><h4>灰度与运营交接</h4><p>按风险分别验收成功率、接管率、P95 和成功任务成本；通过当前检查后再扩大自治，不预设固定天数。</p></article>
            </div>
            <div className="gates"><h4>建议的通过 / 暂停条件</h4><div className="gateList"><span>端到端任务成功率</span><span>关键步骤完成率</span><span>策略违规 = 0</span><span>高风险误执行 = 0</span><span>人工接管率</span><span>P95 / 完成时长</span><span>每个成功任务成本</span><span>可恢复 / 可回滚</span></div><p>具体数值按业务风险、现有人工表现与 PoC 共同决定；总体平均不能掩盖高风险场景失败。</p></div>
          </div>

          <div className="subsection" id="evidence" data-quality-section="evidence">
            <div className="subHead"><span>2.12</span><div><p className="kicker">DATA WITH CAVEATS</p><h3>可引用事实及适用边界</h3></div></div>
            <ModuleEvidenceGrid cards={agentEvidenceCards} sourceLedger={sourceLedger} />
          </div>

          <div className="subsection qaSection" id="qa" data-quality-section="qa">
            <div className="subHead"><span>2.13</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h3>客户高频问题与深度回答</h3></div></div>
            <ModuleQaList items={agentQa} sourceLedger={sourceLedger} />
          </div>
        </div>
      </section>
      </div>

      <footer><div><strong>云计算 × AI 平台售前知识库</strong></div><p>Agent 独立模块 V2.0<ModuleUpdatedAt value={agentPublication?.updatedAt ?? undefined} /></p><a href="#agent">返回顶部 ↑</a></footer>
    </main>
  );
}
