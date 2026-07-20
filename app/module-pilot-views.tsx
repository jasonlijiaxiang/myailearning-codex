import Link from "next/link";

const ragKnowledgeSteps = [
  ["01", "连接与解析", "Connect & Parse", "保留标题、表格、页码与来源坐标；失败内容进入处理队列。"],
  ["02", "切块与元数据", "Chunk & Describe", "建立版本、权限、时间、产品与父子关系，不只生成一段文本。"],
  ["03", "索引与同步", "Index & Refresh", "同时服务精确词项与语义召回，并处理新增、修改、撤回和删除。"],
  ["04", "质量门禁", "Quality Gate", "用标准问题验证证据可召回、版本正确、权限不泄漏。"],
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
        <p>面向企业技术售前：用架构先定位数据责任、在线责任与验收证据，再映射具体云产品。</p>
      </header>
      <div className="ragArchitecture">
        <ArchitectureLane label="OFFLINE" title="离线知识链" outcome="把原始资料变成可授权、可更新、可追踪的证据单元" steps={ragKnowledgeSteps} />
        <ArchitectureLane label="ONLINE" title="在线回答链" outcome="把一次客户问题变成可核验回答或明确拒答" steps={ragServingSteps} />
        <aside className="ragControlPlane" aria-label="RAG 跨链控制面">
          <div><span>CONTROL PLANE</span><strong>身份与权限</strong><p>主体、租户、文档与字段级授权</p></div>
          <div><strong>版本与时效</strong><p>权威来源、生效日期、撤回与重新索引</p></div>
          <div><strong>评估与观测</strong><p>Recall@K、忠实度、引用、拒答、时延与成功成本</p></div>
        </aside>
      </div>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>先问知识怎样更新、权限怎样继承、错答怎样定位，再决定检索路线和云服务组合。</p><nav aria-label="RAG 深入阅读"><a href="#production-rag">查看生产诊断</a><a href="#architecture">查看双链架构</a><a href="#poc">查看 PoC 门禁</a></nav></footer>
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
      <div className="agentControlMap">
        <section className="agentLoop" aria-label="模型循环">
          <header><span>PROBABILISTIC</span><h3>模型循环 · Model Loop</h3><p>负责理解、规划与提出动作，不直接拥有业务权限。</p></header>
          <ol>{agentLoopSteps.map(([no, title, detail]) => <li key={no}><span>{no}</span><strong>{title}</strong><p>{detail}</p></li>)}</ol>
        </section>
        <section className="agentDeterministicPlane" aria-label="确定性控制平面">
          <header><span>DETERMINISTIC</span><h3>确定性控制平面</h3></header>
          <div><strong>Schema 校验</strong><p>动作名、参数、前置条件</p></div>
          <div><strong>身份与授权</strong><p>主体、最小权限、动态策略</p></div>
          <div><strong>风险与审批</strong><p>金额、范围、人工门禁</p></div>
          <div><strong>状态与恢复</strong><p>幂等键、检查点、补偿与终态</p></div>
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
