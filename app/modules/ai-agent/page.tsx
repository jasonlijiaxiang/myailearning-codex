import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { agentEvidenceCards, agentQa } from "../../agent-content.mjs";
import { balanceRows } from "../../layout-utils.mjs";
import { ModuleEvidenceGrid, ModuleQaList } from "../../module-content-components";
import { referenceModules, sourceLedger } from "../../reference-content.mjs";

export const metadata: Metadata = {
  title: "Agent · 智能体 | 云计算 × AI 平台售前知识库",
  description: "AI Agent 的基础概念、工作循环、架构边界、云服务连接、评估治理与售前高频问题。",
};

const conceptLinks = [
  { concept: "模型与推理", owner: "模型原理", href: "/modules/model-principles", relation: "能力底座", local: "模型负责理解状态和选择下一步，但不应直接获得业务权限。" },
  { concept: "指令与上下文", owner: "提示词工程", href: "/modules/prompt-engineering", relation: "行为约束", local: "把角色、目标、边界、工具规则和输出契约组织为可版本化指令。" },
  { concept: "RAG 与知识", owner: "RAG · 检索增强生成", href: "/modules/rag", relation: "数据工具", local: "为 Agent 提供可更新证据；检索只是任务链中的一种工具能力。" },
  { concept: "工作流 · Workflow", owner: "工作流与结构化生成", href: "/modules/workflow-structured-generation", relation: "确定性骨架", local: "固定规则负责可预测路径，Agent 只处理真正需要动态判断的节点。" },
  { concept: "MCP", owner: "模型上下文协议", href: "/modules/mcp", relation: "工具互操作", local: "标准化工具与上下文的连接方式，不替代身份、授权和业务审批。" },
  { concept: "A2A", owner: "A2A · 智能体间协议", href: "/modules/a2a", relation: "Agent 协作", local: "面向 Agent 发现、委派与结果交换；不等于多 Agent 架构本身。" },
  { concept: "评估与治理", owner: "评估", href: "/modules/evaluation", relation: "上线门槛", local: "用可验证终态衡量任务成功，并检查轨迹、安全、时延与成本。" },
  { concept: "身份与授权", owner: "身份与授权边界", href: "/modules/identity-authorization-boundaries", relation: "执行边界", local: "应用在每次工具调用前绑定主体、验证权限、执行策略并留下审计证据。" },
];

const conceptRows = balanceRows(conceptLinks, 4);

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
    control: "工程控制：后置条件、Read-after-Write、来源与时间戳、Checkpoint、异常分类、终态断言和人工复核。",
    cloud: "云服务连接：数据库 / 缓存、事件总线、Tracing、日志与指标、评估平台、告警和状态存储。",
    presales: "售前判断：客户用哪个系统状态证明任务完成？异步结果多久可见？失败和人工接管由谁运营？",
  },
];

const agentActionRows = balanceRows(agentActions, 2);

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
    control: "工程控制：计划 Schema、最大深度 / 轮次、预算、关键里程碑审批、每次观察后重规划、终态检查。",
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

const coreCapabilityRows = balanceRows(coreCapabilities, 4);

const cloudHooks = [
  { stage: "模型与路由", services: "模型即服务、模型目录、推理端点、AI 网关、内容安全", value: "按任务复杂度选择模型并统一限流、版本和策略", discover: "哪些决策需要强模型？是否允许跨地域或多模型？" },
  { stage: "Agent Runtime", services: "托管 Agent 运行时、Serverless、容器、Kubernetes、任务队列", value: "承载循环、状态、超时、重试、弹性和长任务", discover: "任务持续多久？同步还是异步？失败如何恢复？" },
  { stage: "工具接入", services: "API 网关、MCP Gateway、函数计算、工作流、事件总线、SaaS 连接器", value: "把业务 API 变成可发现、可校验、可治理的工具", discover: "有哪些现成 API？读写动作如何分级和审批？" },
  { stage: "知识与状态", services: "托管搜索、向量库、数据库、对象存储、缓存、会话与 Memory", value: "保存证据、任务状态和经过治理的长期记忆", discover: "哪些状态是权威事实？谁能修改、撤回和删除？" },
  { stage: "身份与安全", services: "IAM、工作负载身份、密钥管理、策略引擎、WAF、私网与沙箱", value: "让每次工具调用绑定真实主体并执行最小权限", discover: "用用户身份还是服务身份？哪些动作不可逆？" },
  { stage: "可观测与评估", services: "Tracing、日志、指标、APM、评估平台、告警、SIEM", value: "还原任务轨迹，定位失败并持续检查质量和风险", discover: "成功终态是什么？日志能否关联模型与工具步骤？" },
  { stage: "运营与 FinOps", services: "预算、配额、成本分析、缓存、容量与发布平台", value: "控制轮次、工具消耗和每个成功任务成本", discover: "P95、并发、任务预算和回滚要求是什么？" },
];

const sourceCount = referenceModules.find((module) => module.id === "ai-agent")?.sourceIds.length ?? 0;
export default function AgentModulePage() {
  return (
    <main>
      <section className="ragHero" id="agent" aria-labelledby="agent-title">
        <nav className="topbar" aria-label="模块导航">
          <Link className="brand" href="/" aria-label="返回云与 AI 售前知识库首页">
            <span className="brandMark">CA</span>
            <span>Cloud × AI / Presales Fieldbook</span>
          </Link>
          <div className="toplinks">
            <Link href="#agent-principle">Agent 原理</Link>
            <Link href="#qa">高频问答</Link>
            <Link href="/references">Reference</Link>
          </div>
        </nav>
        <div className="ragHeader">
          <div>
            <p className="kicker light">MODULE · APPLICATION PATTERN · V0.9</p>
            <h2 id="agent-title">Agent<br /><span>智能体 · AI Agent</span></h2>
          </div>
          <div className="ragDefinition">
            <p>让模型在受控边界内，根据环境反馈选择下一步并调用工具完成任务；核心不是“更自主”，而是把动态判断、确定性控制和业务授权正确分层。</p>
            <div className="moduleMeta"><span>基础概念 + 工程 + 售前</span><span>云服务机会串联</span><span>{sourceCount} 份核验来源</span></div>
          </div>
        </div>
      </section>

      <section className="section ragBody" aria-label="Agent 核心内容">
        <div className="sectionNumber">02</div>
        <div className="sectionBody">
          <div className="decisionBanner">
            <p className="kicker">PRESALES POSITION</p>
            <h3>一句话定位</h3>
            <p>客户购买的不是“会自己想办法的模型”，而是一套能识别目标、调用获准工具、验证结果，并在失败或高风险时停下来交还人工的任务执行系统。</p>
          </div>

          <div className="subsection" id="concept-map">
            <div className="subHead"><span>2.1</span><div><p className="kicker">KNOWLEDGE CONNECTIONS</p><h3>Agent 在知识地图中的位置与相关模块</h3></div></div>
            <p className="sectionLead">Agent 聚焦“由模型动态管理任务执行”。模型、Prompt、RAG、协议、身份与评估各有独立主模块；这里解释它们如何在一个可执行系统中协作。</p>
            <div className="conceptGrid" data-count={conceptLinks.length} data-odd={conceptLinks.length % 2 === 1 ? "true" : "false"}>
              {conceptRows.flatMap((row) => row.map((item) => (
                <article key={item.concept} style={{ "--concept-span": 12 / row.length } as CSSProperties}>
                  <div className="conceptCard">
                    <div className="conceptMeta"><span>{item.relation}</span><Link href={item.href}>{item.owner} ↗</Link></div>
                    <h4>{item.concept}</h4><p>{item.local}</p>
                  </div>
                </article>
              )))}
            </div>
          </div>

          <div className="subsection foundationSection" id="agent-principle">
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
                <p>模型根据目标与当前状态选择动作，读取真实工具结果后继续、修正、完成或退出，但所有动作仍受应用控制面约束。</p>
              </article>
            </div>

            <div className="principleDepth">
              <header className="principleDepthIntro">
                <p className="miniLabel">PRESALES MECHANISM</p>
                <h4>Agent 的四个关键动作：感知—思考—行动—观察</h4>
                <p>Agent 不是一次回答，而是一个闭环：先把输入整理成当前任务状态，再选择并执行动作，随后读取真实环境结果。传统抽象常写作“观察—决策—行动—反馈”；这里进一步区分感知与行动后的观察。每次观察都会成为下一轮感知与思考的新依据，直到<strong>完成、失败、超时、超预算或交还人工</strong>。</p>
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
                  <article className={index === row.length - 1 ? "mechanicRowEnd" : undefined} key={item.code} style={{ "--mechanic-span": 12 / row.length } as CSSProperties}>
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
                <article><span>B</span><h5>循环必须有显式终态</h5><p>完成、失败、超时、超预算、最大轮次和人工接管都要能被系统识别与审计。</p></article>
                <article><span>C</span><h5>应用控制面约束每一步</h5><p>模型可以建议下一步，但工具、身份、预算、审批、执行和终止条件仍由应用掌握。</p></article>
              </div>
              <Link className="paperAnchor" href="/references#source-react-2023">原理来源：ReAct 论文 ↗</Link>
            </div>

            <div className="workedExample">
              <div className="exampleQuestion"><span>客户任务</span><strong>“分析这张异常账单，并在符合政策时创建退款工单。”</strong></div>
              <div className="exampleSteps">
                <article><span>01</span><h4>感知<small>Perceive</small></h4><p>把身份、账单、客户意图、退款政策与待确认信息整理为当前任务状态。</p></article>
                <article><span>02</span><h4>思考与行动<small>Reason &amp; Act</small></h4><p>判断应先查合同还是订单；模型提出调用，应用校验金额、权限和审批后执行。</p></article>
                <article><span>03</span><h4>观察与闭环<small>Observe &amp; Close</small></h4><p>回读工单和退款状态；有操作编号才确认完成，冲突、超限或失败则进入下一轮或交还人工。</p></article>
              </div>
            </div>
            <aside className="callout" aria-label="重要边界">
              <div className="calloutTitle"><span>必须记住</span><strong>重要边界</strong><small>Critical Boundary</small></div>
              <p>Agent 的“思考”不能替代业务控制。身份、权限、金额、审批、幂等、补偿和审计必须由确定性系统执行；Prompt 不是授权策略，模型输出也不是系统事实。</p>
            </aside>
          </div>

          <div className="subsection" id="boundaries">
            <div className="subHead"><span>2.3</span><div><p className="kicker">BOUNDARY MAP</p><h3>智能体、工作流、RAG 与聊天机器人的边界</h3></div></div>
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
            <div className="subHead"><span>2.4</span><div><p className="kicker">CORE COMPONENTS</p><h3>规划、记忆与工具：让四个动作持续运转</h3></div></div>
            <p className="sectionLead">四个动作描述 Agent 每一轮“做什么”，三类组件说明它“靠什么持续完成多步任务”。规划决定路径，记忆保留必要信息，工具连接外部世界；三者共享一个可恢复、可审计的运行状态（Run State）。</p>
            <div className="mechanicGrid" data-count={coreCapabilities.length} data-odd={coreCapabilities.length % 2 === 1 ? "true" : "false"}>
              {coreCapabilityRows.flatMap((row) => row.map((item, index) => (
                <article className={index === row.length - 1 ? "mechanicRowEnd" : undefined} key={item.code} style={{ "--mechanic-span": 12 / row.length } as CSSProperties}>
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
            <div className="technicalNotes">
              <article><p className="miniLabel">DATA TOOLS</p><h4>数据工具 · Data Tools</h4><p>搜索、RAG、数据库查询和文件读取为判断提供证据，通常只读，但返回内容仍可能过期、越权或包含注入指令。</p></article>
              <article><p className="miniLabel">ACTION TOOLS</p><h4>动作工具 · Action Tools</h4><p>创建工单、修改订单、发消息或执行代码会改变外部状态，必须强化身份、幂等、审批、回读与补偿。</p></article>
              <article><p className="miniLabel">ORCHESTRATION TOOLS</p><h4>编排工具 · Orchestration Tools</h4><p>工作流、队列、子 Agent 和任务调度负责长任务、并行与交接；需要明确输入输出、超时、所有权和聚合验证。</p></article>
            </div>
          </div>

          <div className="subsection" id="patterns">
            <div className="subHead"><span>2.5</span><div><p className="kicker">ARCHITECTURE PATTERNS</p><h3>从确定性到动态编排的四种模式</h3></div></div>
            <div className="variantList">
              {architecturePatterns.map((item) => (
                <article key={item.name}><div><p className="miniLabel">{item.cue}</p><h4>{item.name}</h4></div><p className="variantPipeline">{item.pipeline}</p><p>{item.boundary}</p></article>
              ))}
            </div>
            <div className="fitGrid" style={{ marginTop: 18 }}>
              <article className="fit"><h4><span>✓</span>适合 Agent 的任务</h4><ul><li>步骤数量或工具路径无法提前确定</li><li>需要综合非结构化信息和环境反馈</li><li>有清晰成功终态、沙箱和人工接管</li><li>动态判断带来的收益高于新增风险与成本</li></ul></article>
              <article className="fit maybe"><h4><span>!</span>优先不用 Agent</h4><ul><li>固定规则已经能稳定、低成本完成</li><li>缺少可验证终态或真实工具反馈</li><li>高风险动作无法审批、回滚或补偿</li><li>没有代表性任务集和责任人持续运营</li></ul></article>
            </div>
          </div>

          <div className="subsection" id="architecture">
            <div className="subHead"><span>2.6</span><div><p className="kicker">REFERENCE ARCHITECTURE</p><h3>Agent 生产参考架构</h3></div></div>
            <div className="chainWrap">
              <div className="chainLabel"><strong>设计与治理链</strong><span>Design &amp; governance</span></div>
              <div className="flow">
                {[{zh:"任务与终态",en:"Task & Outcome"},{zh:"指令与工具",en:"Instructions & Tools"},{zh:"身份与策略",en:"Identity & Policy"},{zh:"评测与红队",en:"Evals & Red Team"},{zh:"版本与发布",en:"Version & Release"}].map((step, i) => <div className="flowStep" key={step.zh}><span className="flowNo">{String(i+1).padStart(2,"0")}</span><div className="flowTerm"><strong>{step.zh}</strong><small>{step.en}</small></div></div>)}
              </div>
              <div className="chainLabel runtime"><strong>在线任务链</strong><span>Serving pipeline</span></div>
              <div className="flow runtimeFlow">
                {[{zh:"请求与身份",en:"Request & Identity"},{zh:"Agent 循环",en:"Agent Loop"},{zh:"策略与工具",en:"Policy & Tools"},{zh:"状态与记忆",en:"State & Memory"},{zh:"验证或接管",en:"Verify / Handoff"}].map((step, i) => <div className="flowStep" key={step.zh}><span className="flowNo">{String(i+1).padStart(2,"0")}</span><div className="flowTerm"><strong>{step.zh}</strong><small>{step.en}</small></div></div>)}
              </div>
            </div>
            <div className="architectureNotes">
              <p><strong>共同控制面</strong>：模型与 Prompt 版本、工具目录、身份策略、预算、Trace、评测集、发布和回滚。</p>
              <p><strong>关键分界</strong>：模型负责提出决策；应用与云平台负责验证身份、授权工具、执行动作并确认真实终态。</p>
            </div>
          </div>

          <div className="subsection cloudSection" id="cloud-opportunities">
            <div className="subHead"><span>2.7</span><div><p className="kicker">CLOUD OPPORTUNITY MAP</p><h3>Agent 技术环节与云服务机会</h3></div></div>
            <div className="cloudIntro"><p>Agent 会把模型服务延伸成跨运行时、API、身份、数据、安全和运维的整体方案。售前应先用厂商中立能力拆解，再映射当期云产品、地域、配额和计费。</p><span>模型不是全部</span><span>身份贯穿每次调用</span><span>按成功任务核算成本</span></div>
            <div className="cloudTable tableWrap">
              <table><thead><tr><th>Agent 环节</th><th>可连接的云服务</th><th>客户价值</th><th>售前发现问题</th></tr></thead><tbody>
                {cloudHooks.map((item) => <tr key={item.stage}><th>{item.stage}</th><td>{item.services}</td><td>{item.value}</td><td>{item.discover}</td></tr>)}
              </tbody></table>
            </div>
            <div className="solutionBundles">
              <article><p className="miniLabel">BUNDLE A</p><h4>企业服务 Agent</h4><p>模型服务 + RAG / 搜索 + CRM / 工单工具 + API 网关 + 用户身份 + 审批流 + Trace。</p><small>价值：从回答问题延伸到受控地完成服务流程</small></article>
              <article><p className="miniLabel">BUNDLE B</p><h4>Agent 工具与身份平台</h4><p>托管 Runtime + MCP / API Gateway + 工作负载身份 + 密钥 + 策略引擎 + 沙箱。</p><small>价值：把零散 API 变成可发现、可授权、可审计的工具面</small></article>
              <article><p className="miniLabel">BUNDLE C</p><h4>AgentOps 控制面</h4><p>Tracing / APM + 评估平台 + 日志 / SIEM + 发布回滚 + 配额预算 + FinOps。</p><small>价值：把长轨迹失败、风险和成本变成持续运营指标</small></article>
            </div>
          </div>

          <div className="subsection" id="poc">
            <div className="subHead"><span>2.8</span><div><p className="kicker">POC PLAYBOOK</p><h3>10 个工作日 Agent PoC 验证包</h3></div></div>
            <div className="pocGrid">
              <article><span>D1–2</span><h4>任务与终态</h4><p>选 2–3 个高价值任务；冻结初始数据、可验证终态、风险等级和人工基线。</p></article>
              <article><span>D3–5</span><h4>最小工具闭环</h4><p>先用单 Agent 接入最少工具；实现结构化参数、身份、超时、停止和审计。</p></article>
              <article><span>D6–8</span><h4>失败与安全</h4><p>测试工具选错、参数错误、注入、越权、循环、超预算、部分失败和人工接管。</p></article>
              <article><span>D9–10</span><h4>验收与容量</h4><p>对比工作流（Workflow）/ 人工基线；输出成功率、P95、成本、上线门槛和扩容方案。</p></article>
            </div>
            <div className="gates"><h4>建议的 Go / No-Go 门槛结构</h4><div className="gateList"><span>端到端任务成功率</span><span>关键步骤完成率</span><span>策略违规 = 0</span><span>高风险误执行 = 0</span><span>人工接管率</span><span>P95 / 完成时长</span><span>每个成功任务成本</span><span>可恢复 / 可回滚</span></div><p>具体数值按业务风险、人工基线与 PoC 共同决定；总体平均不能掩盖高风险场景失败。</p></div>
          </div>

          <div className="subsection" id="evidence">
            <div className="subHead"><span>2.9</span><div><p className="kicker">DATA WITH CAVEATS</p><h3>可引用事实及适用边界</h3></div></div>
            <ModuleEvidenceGrid cards={agentEvidenceCards} sourceLedger={sourceLedger} />
          </div>

          <div className="subsection qaSection" id="qa">
            <div className="subHead"><span>2.10</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h3>客户高频问题与深度回答</h3></div></div>
            <p className="qaGuide">现场先给“结论短答”，客户继续追问时再展开“深一层”。每题同时标出具体依据、证据支持范围和售前必须确认的下一问。</p>
            <ModuleQaList items={agentQa} sourceLedger={sourceLedger} />
          </div>
        </div>
      </section>

      <footer><div><span className="brandMark">CA</span><strong>云计算 × AI 平台售前知识库</strong></div><p>Agent 独立模块 V0.9 · 2026-07-17</p><a href="#agent">返回顶部 ↑</a></footer>
    </main>
  );
}
