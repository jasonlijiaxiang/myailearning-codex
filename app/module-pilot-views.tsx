import Link from "next/link";

import { TermHintRow } from "./term-hint";

const ragKnowledgeSteps = [
  ["01", "连接与解析", "Connect & Parse", "保留标题、表格、页码与来源坐标；失败内容进入处理队列。"],
  ["02", "切块与元数据", "Chunk & Describe", "建立版本、权限、时间、产品与父子关系，不只生成一段文本。"],
  ["03", "索引与同步", "Index & Refresh", "同时服务精确词项与语义召回，并处理新增、修改、撤回和删除。"],
  ["04", "质量检查", "Quality Gate", "用标准问题验证证据可召回、版本正确、权限不泄漏。"],
];

const ragServingSteps = [
  ["01", "理解查询", "Query Contract", "识别意图、实体、时间、产品版本与当前用户身份。"],
  ["02", "召回与重排", "Retrieve & Rerank", "关键词与向量互补找全候选，再过滤、融合和精排。"],
  ["03", "组装上下文", "Context Assembly", "去重、处理冲突与 Token 预算，保留稳定来源 ID。"],
  ["04", "回答或拒答", "Generate / Abstain", "逐项对齐主张与证据；证据不足、过期或冲突时停止。"],
];

function ArchitectureLane({
  label,
  title,
  outcome,
  steps,
}: {
  label: string;
  title: string;
  outcome: string;
  steps: string[][];
}) {
  return (
    <section className="ragArchitectureLane" aria-label={title}>
      <header><span>{label}</span><div><h3>{title}</h3><p>{outcome}</p></div></header>
      <ol>
        {steps.map(([no, zh, en, detail]) => (
          <li key={en}><span>{no}</span><div><h4>{zh}<small>{en}</small></h4><p>{detail}</p></div></li>
        ))}
      </ol>
    </section>
  );
}

export function RagArchitecturePrimer() {
  return (
    <section className="pilotPrimer pilotPrimer--rag" data-knowledge-view="application-architecture" aria-labelledby="rag-architecture-primer-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">ARCHITECTURE FIRST</p><h2 id="rag-architecture-primer-title">先看两条链，再讨论向量库与模型</h2></div>
        <p>面向企业技术售前：用架构先定位数据责任、在线责任与验收证据，再对应到具体云产品。</p>
      </header>
      <TermHintRow label="RAG 架构缩写" termIds={["rag", "bm25", "ann", "hnsw", "rrf"]} />
      <div className="ragArchitecture">
        <ArchitectureLane label="OFFLINE" title="离线知识链" outcome="把原始资料变成可授权、可更新、可追踪的证据单元" steps={ragKnowledgeSteps} />
        <ArchitectureLane label="ONLINE" title="在线回答链" outcome="把一次客户问题变成可核验回答或明确拒答" steps={ragServingSteps} />
        <aside className="ragControlPlane" aria-label="RAG 两条链共同使用的控制部分">
          <div><span>CONTROL PLANE</span><strong>身份与权限</strong><p>主体、租户、文档与字段级授权</p></div>
          <div><strong>版本与时效</strong><p>权威来源、生效日期、撤回与重新索引</p></div>
          <div><strong>评估与观测</strong><p>Recall@K、忠实度、引用、拒答、时延与成功成本</p></div>
        </aside>
      </div>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>先问知识怎样更新、权限怎样继承、错答怎样定位，再决定检索方案和云服务搭配。</p><nav aria-label="RAG 深入阅读"><a href="#production-rag">查看生产诊断</a><a href="#architecture">查看双链架构</a><a href="#poc">查看 PoC 通过条件</a></nav></footer>
    </section>
  );
}

const agentLoopSteps = [
  ["01", "感知", "读取任务、身份与环境事实"],
  ["02", "思考", "提出下一动作或停止原因"],
  ["03", "行动", "提交结构化动作意图"],
  ["04", "观察", "回读权威系统的真实状态"],
];

export function AgentControlPrimer() {
  return (
    <section className="pilotPrimer pilotPrimer--agent" data-knowledge-view="control-architecture" aria-labelledby="agent-control-primer-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">CONTROL ARCHITECTURE</p><h2 id="agent-control-primer-title">先分清谁提议、谁授权、谁执行</h2></div>
        <p>面向企业技术售前：Agent 的价值来自动态决策，可信度来自模型外的确定性控制和可恢复业务状态。</p>
      </header>
      <TermHintRow label="Agent 控制缩写" termIds={["ai-agent", "api", "iam", "hitl", "mcp"]} />
      <div className="agentControlMap">
        <section className="agentLoop" aria-label="模型循环">
          <header><span>PROBABILISTIC</span><h3>模型循环 · Model Loop</h3><p>负责理解、规划与提出动作，不直接拥有业务权限。</p></header>
          <ol>{agentLoopSteps.map(([no, title, detail]) => <li key={no}><span>{no}</span><strong>{title}</strong><p>{detail}</p></li>)}</ol>
        </section>
        <section className="agentDeterministicPlane" aria-label="确定性控制部分">
          <header><span>DETERMINISTIC</span><h3>确定性控制部分</h3></header>
          <div><strong>Schema 校验</strong><p>动作名、参数、前置条件</p></div>
          <div><strong>身份与授权</strong><p>主体、最小权限、动态策略</p></div>
          <div><strong>风险与审批</strong><p>金额、范围、人工审批</p></div>
          <div><strong>状态与恢复</strong><p>幂等键、检查点、补偿与最终状态</p></div>
        </section>
        <section className="agentExecutionPlane" aria-label="业务执行与事实平面">
          <header><span>AUTHORITATIVE</span><h3>执行与事实平面</h3></header>
          <div><strong>获准工具</strong><p>API、数据库、工作流、沙箱</p></div>
          <div><strong>业务系统</strong><p>订单、工单、资源与审批状态</p></div>
          <div><strong>人工接管</strong><p>高风险、模糊状态、不可逆动作</p></div>
        </section>
      </div>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>客户问“能不能自动执行”时，先画出动作风险、权威状态、授权点和人工接管，再讨论模型与编排框架。</p><nav aria-label="Agent 深入阅读"><a href="#agent-principle">查看工作循环</a><a href="#memory-interaction">查看状态与互操作</a><a href="#architecture">查看参考架构</a></nav></footer>
    </section>
  );
}

const llmGenerationStages = [
  ["01", "Token", "文本被切成模型词表中的离散单元"],
  ["02", "Embedding + Position", "Token 与位置信息变成可计算表示"],
  ["03", "Self-Attention", "每个位置按当前上下文聚合相关信息"],
  ["04", "Transformer Blocks", "注意力与前馈网络反复加工表示"],
  ["05", "Logits", "最后一层产生下一 Token 的候选分数"],
  ["06", "Sampling", "温度、Top-p 与约束把分布变成具体输出"],
];

export function LlmTheoryPrimer() {
  return (
    <section className="pilotPrimer pilotPrimer--llm" data-knowledge-view="theory-atlas" aria-labelledby="llm-theory-primer-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">THEORY ATLAS</p><h2 id="llm-theory-primer-title">把一次生成拆成六个可观察阶段</h2></div>
        <p>面向云与 AI 技术售前：理论用于解释质量、上下文、首字延迟、输出速度与显存边界，不以背公式为目标。</p>
      </header>
      <TermHintRow label="LLM 原理缩写" termIds={["llm", "qkv", "kv-cache", "ttft", "tpot", "moe"]} />
      <ol className="llmGenerationRail" aria-label="大语言模型生成阶段">
        {llmGenerationStages.map(([no, title, detail]) => <li key={no}><span>{no}</span><h3>{title}</h3><p>{detail}</p></li>)}
      </ol>
      <div className="llmTheoryFocus">
        <section className="attentionBoard" aria-labelledby="attention-board-title">
          <div className="attentionFormula"><span>Scaled dot-product attention</span><strong>softmax(QKᵀ / √d<sub>k</sub>) · V</strong></div>
          <header><p className="kicker">SELF-ATTENTION</p><h3 id="attention-board-title">Q、K、V 分别在回答什么</h3></header>
          <div className="qkvGrid">
            <article><span>Q</span><strong>当前要找什么？</strong><p>当前位置提出的查询特征。</p></article>
            <article><span>K</span><strong>各位置提供什么索引？</strong><p>用于与 Query 计算匹配程度。</p></article>
            <article><span>V</span><strong>匹配后实际取走什么？</strong><p>按注意力权重聚合的信息表示。</p></article>
          </div>
        </section>
        <aside className="llmBoundaryBoard" aria-label="理论到售前判断">
          <p className="kicker">FROM THEORY TO DECISION</p>
          <h3>三个不能混淆的边界</h3>
          <dl>
            <div><dt>注意力权重</dt><dd>表示计算中的信息聚合，不等于完整因果解释。</dd></div>
            <div><dt>下一 Token 概率</dt><dd>表示语言分布，不等于事实真实性或业务授权。</dd></div>
            <div><dt>上下文窗口上限</dt><dd>表示最多可接收的 Token，不等于全部内容都能被可靠利用。</dd></div>
          </dl>
          <Link href="/references#source-transformer-2017">原始 Transformer 论文与证据边界 ↗</Link>
        </aside>
      </div>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>用六阶段区分“模型不会”“上下文没给对”“首字慢”“输出慢”和“并发显存不足”，再选择模型、RAG 或推理平台方案。</p><nav aria-label="LLM 原理深入阅读"><a href="#curriculum">查看理论地图</a><a href="#principle">查看模型栈</a><a href="#decisions">查看方案判断</a></nav></footer>
    </section>
  );
}

const solutionDecisionStages = [
  ["01", "业务结果", "Outcome", "谁的哪项工作需要发生改变？", "写清成功、失败和责任人"],
  ["02", "任务边界", "Task Boundary", "系统提供信息、建议，还是会执行动作？", "确定人工接管与不可接受结果"],
  ["03", "能力搭配", "Capability Mix", "需要检索、生成、工具、规则或多模态吗？", "只加入能解释其作用的组件"],
  ["04", "验证与运营", "Proof & Operations", "用什么数据验收，上线后由谁维护？", "约定通过条件、成本和故障处理"],
];

const solutionCapabilityChoices = [
  { verb: "找", title: "检索证据", en: "Retrieve", when: "答案依赖企业知识、版本和权限", choice: "RAG、搜索、数据库", boundary: "找到了资料也要验证回答是否正确" },
  { verb: "写", title: "生成内容", en: "Generate", when: "需要总结、改写、分类或结构化输出", choice: "LLM、Prompt、结构约束", boundary: "生成文字不能替代业务事实和审批" },
  { verb: "做", title: "执行任务", en: "Act", when: "需要跨系统创建、修改或推进状态", choice: "工作流、Agent、工具接口", boundary: "动作必须经过身份、授权和结果回读" },
  { verb: "审", title: "人工负责", en: "Review", when: "错误高风险、规则模糊或结果不可逆", choice: "审批、复核、人工接管", boundary: "人工环节也要定义时限、证据和责任" },
];

export function SolutionPatternPrimer() {
  return (
    <section className="pilotPrimer pilotPrimer--solution" data-knowledge-view="decision-blueprint" aria-labelledby="solution-pattern-primer-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">DECISION BLUEPRINT</p><h2 id="solution-pattern-primer-title">把业务目标变成可以验收的方案</h2></div>
        <p>场景方案从业务变化出发，依次确定任务边界、需要搭配的能力、验收证据和后续负责人；产品名称在这些问题明确后再进入。</p>
      </header>
      <TermHintRow label="方案讨论常用缩写" termIds={["poc", "sla", "tco", "rag", "ai-agent"]} />
      <div className="solutionBlueprint">
        <ol className="solutionDecisionRail" aria-label="从业务目标到可运营方案的四步决策">
          {solutionDecisionStages.map(([no, title, en, question, output]) => (
            <li key={no}><span>{no}</span><h3>{title}<small>{en}</small></h3><p>{question}</p><strong>{output}</strong></li>
          ))}
        </ol>
        <div className="solutionCapabilityGrid" aria-label="检索、生成、行动和人工控制的选择">
          {solutionCapabilityChoices.map((item) => (
            <article key={item.en}>
              <span>{item.verb}</span>
              <div><p className="miniLabel">{item.en}</p><h3>{item.title}</h3></div>
              <dl><div><dt>什么时候需要</dt><dd>{item.when}</dd></div><div><dt>常见选择</dt><dd>{item.choice}</dd></div></dl>
              <p>{item.boundary}</p>
            </article>
          ))}
        </div>
      </div>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>先用四步决策把模糊需求缩成一个可验证场景，再选择“找、写、做、审”的必要组合；每增加一项能力，都要同时增加验收方法和负责人。</p><nav aria-label="场景解决方案深入阅读"><a href="#decisions">查看方案选择</a><a href="#study-guide">完成场景练习</a><a href="#cloud">对应云服务</a></nav></footer>
    </section>
  );
}

const securityThreatSteps = [
  ["01", "不可信内容进入", "网页、文档、邮件、用户输入或工具结果携带恶意指令。"],
  ["02", "进入模型上下文", "内容与系统规则、用户目标和企业知识一起被模型处理。"],
  ["03", "模型提出危险动作", "模型选择高权限工具，或生成越权、泄漏、破坏性的参数。"],
  ["04", "应用决定是否执行", "身份、策略、参数校验和审批决定动作能否真正发生。"],
  ["05", "外部系统状态变化", "工单、资金、数据、消息或生产资源被读取、修改或删除。"],
];

const securityDefenseLayers = [
  { no: "A", title: "数据入口", en: "INPUT & DATA", detail: "来源标记、恶意内容检测、DLP、知识准入和检索 ACL。", proves: "不可信内容被识别，敏感数据按身份过滤" },
  { no: "B", title: "上下文与模型", en: "CONTEXT & MODEL", detail: "指令与数据分隔、最小上下文、输出约束和模型安全测试。", proves: "攻击即使进入上下文，也只能影响受限建议" },
  { no: "C", title: "身份与行动", en: "IDENTITY & ACTION", detail: "短期身份、最小权限、Schema 校验、策略引擎、审批和沙箱。", proves: "模型不能自行扩大权限或绕过业务规则" },
  { no: "D", title: "监控与恢复", en: "MONITOR & RECOVER", detail: "完整 Trace、异常检测、凭据撤销、补偿、隔离和事件响应。", proves: "风险发生后能确认影响、停止扩散并恢复" },
];

export function SecurityThreatPrimer() {
  return (
    <section className="pilotPrimer pilotPrimer--security" data-knowledge-view="threat-path" aria-labelledby="security-threat-primer-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">THREAT PATH</p><h2 id="security-threat-primer-title">沿一条攻击路径看清每道防线</h2></div>
        <p>AI 安全不只检查输入内容。真正需要控制的是：不可信内容怎样影响模型，模型建议怎样获得权限，以及动作发生后能否确认影响和恢复。</p>
      </header>
      <TermHintRow label="安全架构常用缩写" termIds={["iam", "acl", "dlp", "hitl", "api"]} />
      <div className="securityThreatMap">
        <ol className="securityThreatPath" aria-label="从不可信内容到外部系统状态变化的攻击路径">
          {securityThreatSteps.map(([no, title, detail]) => (
            <li key={no}><span>{no}</span><h3>{title}</h3><p>{detail}</p></li>
          ))}
        </ol>
        <div className="securityDefenseStack" aria-label="四层外部安全控制">
          {securityDefenseLayers.map((layer) => (
            <article key={layer.no}><span>{layer.no}</span><div><p className="miniLabel">{layer.en}</p><h3>{layer.title}</h3></div><p>{layer.detail}</p><strong>需要证明：{layer.proves}</strong></article>
          ))}
        </div>
      </div>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>先选一条最危险的 Source → Sink 路径，逐步说明内容从哪里来、会影响什么、谁负责授权、怎样留下证据；不要用一个 Guardrail 产品代替完整威胁模型。</p><nav aria-label="AI 安全深入阅读"><a href="#principle">查看分层威胁</a><a href="#deep-dive">查看事件处理</a><a href="#cloud">对应安全服务</a></nav></footer>
    </section>
  );
}

const tuningMethodChoices = [
  { method: "Prompt / Schema", signal: "模型知道答案，但格式、步骤或约束不稳定", strength: "改动快、易回滚", limit: "复杂稳定行为可能仍漂移" },
  { method: "RAG", signal: "缺少最新、私有、需引用或按权限变化的知识", strength: "知识可更新、撤回和追踪", limit: "不会自动改变模型的默认行为" },
  { method: "Fine-tuning", signal: "需要长期稳定的语气、格式或窄任务行为", strength: "把行为模式写入模型或 Adapter", limit: "更新和归因比 Prompt、RAG 更重" },
  { method: "换基础模型", signal: "当前模型缺少核心能力、模态或上下文能力", strength: "直接提升能力上限", limit: "成本、兼容和回归范围可能扩大" },
];

const tuningLifecycle = [
  ["01", "定义目标", "区分知识、行为与能力问题"],
  ["02", "固定考卷", "保留未见样本与高风险切片"],
  ["03", "准备数据", "清洗、去重、授权并统一样本格式"],
  ["04", "训练 Adapter", "从 SFT、LoRA 或 QLoRA 小步试验"],
  ["05", "比较与回归", "同时检查目标提升、通用能力和安全"],
  ["06", "灰度与回滚", "绑定基座、Adapter、模板和运行版本"],
];

export function FineTuningPrimer() {
  return (
    <section className="pilotPrimer pilotPrimer--tuning" data-knowledge-view="tuning-lifecycle" aria-labelledby="fine-tuning-primer-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">METHOD TRIAGE &amp; RELEASE</p><h2 id="fine-tuning-primer-title">先判断该不该训练，再管理完整发布过程</h2></div>
        <p>微调适合修正稳定行为，不适合替代实时知识、业务数据库或权限规则。方法选择和发布回滚应该在训练开始前就被一起设计。</p>
      </header>
      <TermHintRow label="微调方法常用缩写" termIds={["sft", "lora", "qlora", "dpo", "llm"]} />
      <div className="tuningDecisionBoard">
        <div className="tuningMethodGrid" aria-label="Prompt、RAG、微调和更换基础模型的选择">
          {tuningMethodChoices.map((item, index) => (
            <article className={index === 2 ? "preferred" : undefined} key={item.method}>
              <span>{String(index + 1).padStart(2, "0")}</span><h3>{item.method}</h3><p>{item.signal}</p><dl><div><dt>优势</dt><dd>{item.strength}</dd></div><div><dt>限制</dt><dd>{item.limit}</dd></div></dl>
            </article>
          ))}
        </div>
        <ol className="tuningLifecycle" aria-label="微调从目标定义到灰度回滚的六个阶段">
          {tuningLifecycle.map(([no, title, detail]) => (
            <li key={no}><span>{no}</span><h3>{title}</h3><p>{detail}</p></li>
          ))}
        </ol>
      </div>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>先用四种方法分诊证明微调确有必要，再把训练数据、冻结评估集、Adapter、基础模型、服务模板和回滚方案当作一个发布单元共同验收。</p><nav aria-label="微调深入阅读"><a href="#decisions">查看方法选择</a><a href="#curriculum">查看训练方法</a><a href="#cloud">查看训练与部署</a></nav></footer>
    </section>
  );
}
