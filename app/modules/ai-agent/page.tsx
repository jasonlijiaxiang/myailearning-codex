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
  { zh: "理解目标", en: "Understand Goal" },
  { zh: "读取状态", en: "Observe State" },
  { zh: "选择下一步", en: "Decide Next Step" },
  { zh: "调用工具", en: "Act with Tools" },
  { zh: "检查与停止", en: "Verify or Stop" },
];

const architecturePatterns = [
  { name: "确定性工作流 · Deterministic Workflow", cue: "步骤清楚、规则稳定、错误代价高", pipeline: "固定步骤 → 条件分支 → 人工审批", boundary: "最易测试和审计；不要为追求 Agent 标签而增加自治。" },
  { name: "单智能体 · Single Agent", cue: "步骤动态但职责集中", pipeline: "模型 ↔ 工具 ↔ 环境反馈，循环至退出", boundary: "默认起点；工具和上下文膨胀时质量会退化。" },
  { name: "编排者—执行者 · Orchestrator–Workers", cue: "子任务无法预先确定、可分工", pipeline: "管理者分解 → 执行者完成 → 汇总验证", boundary: "增加交接、重复调用、权限传播和轨迹评估成本。" },
  { name: "评估者—优化者 · Evaluator–Optimizer", cue: "有明确质量标准、迭代能提升", pipeline: "生成 → 评价 → 反馈 → 修正，直到门槛", boundary: "必须限制轮次和预算；评价器也会判断错误。" },
];

const coreCapabilities = [
  { code: "A", title: "工具调用 · Tool Use", body: "工具定义要说明唯一用途、参数、返回、错误与权限。模型提出调用，应用校验并执行；读、写和高风险动作分级。", control: "核心控制：Schema、授权、幂等、超时、审计" },
  { code: "B", title: "状态 · State", body: "记录当前任务目标、已完成步骤、工具结果和剩余预算。状态应结构化并可恢复，不只依赖不断增长的对话文本。", control: "核心控制：Run ID、Checkpoint、版本与恢复" },
  { code: "C", title: "记忆 · Memory", body: "短期会话与长期记忆分开。长期信息写入前需要提取、校验、来源、范围、保留期和删除机制。", control: "核心控制：主体、来源、TTL、撤回与隔离" },
  { code: "D", title: "规划 · Planning", body: "可以先列计划，也可以每一步只选择下一个动作。计划会被新事实推翻，必须允许修正并设置轮次和预算。", control: "核心控制：里程碑、停止条件、人工检查点" },
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
                <h4>Agent 是“观察—决策—行动—反馈”的受控循环</h4>
                <p>模型不是在一次回答中预知所有步骤，而是每执行一步就读取新的环境事实，再决定下一步。真正的工程难点，是让循环知道<strong>何时继续、何时完成、何时失败，以及何时必须交还人工</strong>。</p>
              </header>
              <div className="chainWrap">
                <div className="chainLabel"><strong>单次任务运行 · Run</strong><span>Controlled agent loop</span></div>
                <div className="flow runtimeFlow">
                  {agentLoop.map((step, index) => (
                    <div className="flowStep" key={step.zh}><span className="flowNo">{String(index + 1).padStart(2, "0")}</span><div className="flowTerm"><strong>{step.zh}</strong><small>{step.en}</small></div></div>
                  ))}
                </div>
              </div>
              <p className="paperBoundary"><strong>售前判断：</strong>模型可以建议下一步，但应用必须掌握工具清单、身份授权、真实执行、预算、超时、审批和终止条件。<strong>模型会调用 API，不等于模型拥有 API 权限。</strong></p>
              <div className="principleLimits">
                <article><span>A</span><h5>环境反馈是新的事实</h5><p>工具返回、数据库状态和执行错误决定下一步；不能只依赖模型自己的推测或旧对话。</p></article>
                <article><span>B</span><h5>循环必须有停止条件</h5><p>完成、失败、超时、超预算、最大轮次和人工接管都应是显式终态。</p></article>
                <article><span>C</span><h5>自治范围由业务划定</h5><p>Agent 可以动态规划，但高风险动作仍可由确定性规则、审批和人工控制。</p></article>
              </div>
              <Link className="paperAnchor" href="/references#source-react-2023">原理来源：ReAct 论文 ↗</Link>
            </div>

            <div className="workedExample">
              <div className="exampleQuestion"><span>客户任务</span><strong>“分析这张异常账单，并在符合政策时创建退款工单。”</strong></div>
              <div className="exampleSteps">
                <article><span>01</span><h4>理解与取证<small>Understand &amp; Retrieve</small></h4><p>确认客户身份、账单对象和意图；读取订单、合同、退款政策与历史记录。</p></article>
                <article><span>02</span><h4>判断与行动<small>Decide &amp; Act</small></h4><p>模型提出异常原因和下一步；应用验证权限、金额、参数和审批要求后执行。</p></article>
                <article><span>03</span><h4>验证与交付<small>Verify &amp; Handoff</small></h4><p>回读工单状态，给出证据和操作编号；冲突、超限或失败时交还人工。</p></article>
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
            <div className="subHead"><span>2.4</span><div><p className="kicker">CORE CAPABILITIES</p><h3>工具调用、记忆与规划如何落到工程</h3></div></div>
            <div className="mechanicGrid" data-count={coreCapabilities.length} data-odd={coreCapabilities.length % 2 === 1 ? "true" : "false"}>
              {coreCapabilityRows.flatMap((row) => row.map((item, index) => (
                <article className={index === row.length - 1 ? "mechanicRowEnd" : undefined} key={item.code} style={{ "--mechanic-span": 12 / row.length } as CSSProperties}>
                  <span className="mechanicNo">{item.code}</span><h4>{item.title}</h4><p>{item.body}</p><small>{item.control}</small>
                </article>
              )))}
            </div>
            <div className="technicalNotes">
              <article><p className="miniLabel">TOOL CONTRACT</p><h4>让工具难以被误用</h4><p>优先结构化参数、枚举、范围限制和预览接口；避免含义重叠的工具与模糊字段，错误信息要能指导下一步。</p></article>
              <article><p className="miniLabel">MEMORY IS DATA</p><h4>记忆不是模型魔法</h4><p>它通常落在会话存储、数据库或检索系统中。模型生成的总结只是候选记录，不能自动成为权威客户事实。</p></article>
              <article><p className="miniLabel">PLAN IS A HYPOTHESIS</p><h4>计划必须接受环境校验</h4><p>真实工具结果可能让原计划失效。Agent 的能力体现在依据事实修正，而不是固执地执行最初步骤。</p></article>
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
