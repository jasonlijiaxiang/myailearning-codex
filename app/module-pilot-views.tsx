import Link from "next/link";

import {
  InferenceLifecycleExplorer,
  McpResponsibilityExplorer,
  SolutionDecisionLoop,
} from "./focused-visual-explainers";
import {
  AgentAuthorityExplorer,
  LlmGenerationExplorer,
  ModuleKnowledgeExplorer,
  RagDualChainExplorer,
  SecurityBarrierExplorer,
  TuningRouteExplorer,
} from "./module-visual-explorers";
import { requireModuleExtensionView } from "./module-extension-views.mjs";
import { TermHintRow } from "./term-hint";

type ExtensionView = {
  id: string;
  layout: "spectrum" | "pipeline" | "boundary" | "lifecycle" | "loop" | "control" | "stack" | "topology";
  eyebrow: string;
  title: string;
  intro: string;
  termIds: string[];
  steps: Array<{ code: string; title: string; en: string; detail: string; signal: string }>;
  checks: Array<{ title: string; detail: string }>;
  application: string;
  links: Array<{ href: string; label: string }>;
};

type FocusedBrief = {
  principleTitle: string;
  criticalBoundary: string;
  principles: Array<{ zh: string; en: string; explanation: string; decision: string }>;
  decisions: Array<{ question: string; signal: string; recommendation: string; boundary: string }>;
  cloudHooks: Array<{ stage: string; services: string; value: string; discover: string }>;
};

const ragKnowledgeSteps: Array<[string, string, string, string]> = [
  ["01", "连接与解析", "Connect & Parse", "保留标题、表格、页码与来源坐标；失败内容进入处理队列。"],
  ["02", "切块与元数据", "Chunk & Describe", "建立版本、权限、时间、产品与父子关系，不只生成一段文本。"],
  ["03", "索引与同步", "Index & Refresh", "同时服务精确词项与语义召回，并处理新增、修改、撤回和删除。"],
  ["04", "质量检查", "Quality Gate", "用标准问题验证证据可召回、版本正确、权限不泄漏。"],
];

const ragServingSteps: Array<[string, string, string, string]> = [
  ["01", "理解查询", "Query Contract", "识别意图、实体、时间、产品版本与当前用户身份。"],
  ["02", "召回与重排", "Retrieve & Rerank", "关键词与向量互补找全候选，再过滤、融合和精排。"],
  ["03", "组装上下文", "Context Assembly", "去重、处理冲突与 Token 预算，保留稳定来源 ID。"],
  ["04", "回答或拒答", "Generate / Abstain", "逐项对齐主张与证据；证据不足、过期或冲突时停止。"],
];

export function RagArchitecturePrimer() {
  return (
    <section className="pilotPrimer pilotPrimer--rag" data-knowledge-view="application-architecture" aria-labelledby="rag-architecture-primer-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">ARCHITECTURE FIRST</p><h2 id="rag-architecture-primer-title">先看两条链，再讨论向量库与模型</h2></div>
        <p>面向企业技术售前：用架构先定位数据责任、在线责任与验收证据，再对应到具体云产品。</p>
      </header>
      <RagDualChainExplorer offline={ragKnowledgeSteps} online={ragServingSteps} />
      <TermHintRow label="RAG 架构缩写" termIds={["rag", "bm25", "ann", "hnsw", "rrf"]} />
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>先问知识怎样更新、权限怎样继承、错答怎样定位，再决定检索方案和云服务搭配。</p><nav aria-label="RAG 深入阅读"><a href="#production-rag">查看生产诊断</a><a href="#architecture">查看双链架构</a><a href="#poc">查看 PoC 通过条件</a></nav></footer>
    </section>
  );
}

const agentLoopSteps: Array<[string, string, string]> = [
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
      <AgentAuthorityExplorer steps={agentLoopSteps} />
      <TermHintRow label="Agent 控制缩写" termIds={["ai-agent", "api", "iam", "hitl", "mcp"]} />
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>客户问“能不能自动执行”时，先画出动作风险、权威状态、授权点和人工接管，再讨论模型与编排框架。</p><nav aria-label="Agent 深入阅读"><a href="#agent-principle">查看工作循环</a><a href="#memory-interaction">查看状态与互操作</a><a href="#architecture">查看参考架构</a></nav></footer>
    </section>
  );
}

const llmGenerationStages: Array<[string, string, string]> = [
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
      <LlmGenerationExplorer stages={llmGenerationStages} />
      <TermHintRow label="LLM 原理缩写" termIds={["llm", "qkv", "kv-cache", "ttft", "tpot", "moe"]} />
      <p className="visualEvidenceLink"><Link href="/references#source-transformer-2017">原始 Transformer 论文与证据边界 ↗</Link></p>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>用六阶段区分“模型不会”“上下文没给对”“首字慢”“输出慢”和“并发显存不足”，再选择模型、RAG 或推理平台方案。</p><nav aria-label="LLM 原理深入阅读"><a href="#curriculum">查看理论地图</a><a href="#principle">查看模型栈</a><a href="#decisions">查看方案判断</a></nav></footer>
    </section>
  );
}

const solutionDecisionStages = [
  ["01", "业务结果", "Outcome", "谁的哪项工作需要发生改变？", "写清成功、失败和责任人"],
  ["02", "任务边界", "Task Boundary", "系统提供信息、建议，还是会执行动作？", "确定人工接管与不可接受结果"],
  ["03", "能力搭配", "Capability Mix", "需要检索、生成、工具、规则或多模态吗？", "只加入能解释其作用的组件"],
  ["04", "验证证据", "Proof", "哪些样本、切片与失败条件可以推翻方案？", "先写验收和停止条件，再开始 PoC"],
  ["05", "运营责任", "Operations", "上线后由谁维护质量、成本、权限与故障？", "把负责人、预算、回滚和复盘写入方案"],
];

const solutionCapabilityChoices = [
  { verb: "找", title: "检索证据", en: "Retrieve", when: "答案依赖企业知识、版本和权限", choice: "RAG、搜索、数据库", boundary: "找到了资料也要验证回答是否正确" },
  { verb: "写", title: "生成内容", en: "Generate", when: "需要总结、改写、分类或结构化输出", choice: "LLM、Prompt、结构约束", boundary: "生成文字不能替代业务事实和审批" },
  { verb: "做", title: "执行任务", en: "Act", when: "需要跨系统创建、修改或推进状态", choice: "工作流、Agent、工具接口", boundary: "动作必须经过身份、授权和结果回读" },
  { verb: "审", title: "人工负责", en: "Review", when: "错误高风险、规则模糊或结果不可逆", choice: "审批、复核、人工接管", boundary: "人工环节也要定义时限、证据和责任" },
];

const solutionScenarioAtlas = [
  ["客服", "解决问题或辅助坐席", "解决率 · 转接质量", "错误承诺"],
  ["企业搜索", "找到有权限的证据", "检索覆盖 · 引用正确", "越权与旧版本"],
  ["内容生成", "产出可发布资产", "通过审核 · 复用率", "版权与品牌"],
  ["AI Coding", "缩短可靠交付周期", "通过测试 · 返工率", "不安全变更"],
  ["数字人", "批量内容或实时服务", "完成率 · 端到端时延", "授权与误导"],
  ["ChatBI", "按统一口径回答经营问题", "口径正确 · 查询成功", "越权与错口径"],
  ["会议助手", "记录决定并推进事项", "决定召回 · 责任人正确", "隐私与错误归责"],
];

export function SolutionPatternPrimer({ brief }: { brief?: FocusedBrief }) {
  const decisionRows = brief?.decisions.slice(0, 4) ?? [];
  return (
    <section className="pilotPrimer pilotPrimer--solution focusedNarrative focusedNarrative--decision" id="principle" data-knowledge-view="decision-blueprint" data-quality-section="principle" aria-label="INTERACTIVE SYSTEM VIEW" aria-labelledby="solution-pattern-primer-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">DECISION BLUEPRINT</p><h2 id="solution-pattern-primer-title">把业务目标变成可以验收的方案</h2></div>
        <p>场景方案从业务变化出发，依次确定任务边界、需要搭配的能力、验收证据和后续负责人；产品名称在这些问题明确后再进入。</p>
      </header>
      <div className="solutionBlueprint">
        <SolutionDecisionLoop stages={solutionDecisionStages.map(([no, title, , question, output]) => ({ no, title, question, output }))} />
        <div className="solutionCapabilityMatrix" role="table" aria-label="检索、生成、行动和人工控制的选择">
          <div className="solutionCapabilityMatrixHead" role="row"><span>动作</span><span>什么时候需要</span><span>常见选择</span><span>不可忽略的边界</span></div>
          {solutionCapabilityChoices.map((item) => (
            <div className="solutionCapabilityMatrixRow" role="row" key={item.en}>
              <strong><span>{item.verb}</span>{item.title}</strong>
              <p>{item.when}</p>
              <p>{item.choice}</p>
              <p>{item.boundary}</p>
            </div>
          ))}
        </div>
      </div>
      <TermHintRow label="方案讨论常用缩写" termIds={["poc", "sla", "tco", "rag", "ai-agent"]} />
      {decisionRows.length ? (
        <section className="focusedDecisionLedger" aria-labelledby="solution-decision-ledger-title">
          <header><p className="kicker">PROBLEM CONTRACT</p><h3 id="solution-decision-ledger-title">先把问题写成一页可反驳的方案契约</h3><p>下面不是通用功能表，而是把客户实际情况、建议与失败边界放在同一行。任何一行无法验证，都不应进入采购清单。</p></header>
          <div className="focusedDecisionRows" role="table" aria-label="问题契约">
            {decisionRows.map((item, index) => (
              <article role="row" key={item.question}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><p className="miniLabel">客户问题</p><h4>{item.question}</h4><p>{item.signal}</p></div>
                <div><p className="miniLabel">建议与证伪</p><strong>{item.recommendation}</strong><small>{item.boundary}</small></div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <div className="primerAtlas" aria-label="七类常见场景的目标、指标和隐藏风险">
        <div className="primerAtlasHeader"><h3>七类场景，七套验收重点</h3><p>复用的是能力积木，不是同一套指标。</p></div>
        <div className="primerAtlasTable" role="table">
          <div className="primerAtlasRow primerAtlasRow--head" role="row"><span>场景</span><span>要改变的工作</span><span>主要指标</span><span>容易漏掉</span></div>
          {solutionScenarioAtlas.map(([scene, outcome, metric, risk]) => <div className="primerAtlasRow" role="row" key={scene}><strong>{scene}</strong><span>{outcome}</span><span>{metric}</span><span>{risk}</span></div>)}
        </div>
      </div>
      {brief ? <aside className="focusedBoundary" aria-label="重要边界" data-importance="critical"><span>CRITICAL BOUNDARY</span><p>{brief.criticalBoundary}</p></aside> : null}
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>先用五道决策门把模糊需求缩成一个可验证场景，再选择“找、写、做、审”的必要组合；每增加一项能力，都要同时增加验收方法和负责人。</p><nav aria-label="场景解决方案深入阅读"><a href="#deep-dive">检查生产边界</a><a href="#evidence">核对证据</a><a href="#cloud">对应云服务</a></nav></footer>
    </section>
  );
}

function McpFocusedPrimer({ brief }: { brief: FocusedBrief }) {
  const view = requireModuleExtensionView("mcp") as ExtensionView;
  return (
    <section className="pilotPrimer focusedNarrative focusedNarrative--protocol" id="principle" data-knowledge-view={view.id} data-quality-section="principle" aria-label="INTERACTIVE SYSTEM VIEW" aria-labelledby="mcp-focused-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">PROTOCOL RESPONSIBILITY MAP</p><h2 id="mcp-focused-title">先分清四方责任，再讨论工具接入</h2></div>
        <p>协议解决能力如何被发现和调用；身份从哪里来、业务系统是否授权、调用结果是否可信，仍由协议外的应用与平台控制共同完成。</p>
      </header>
      <McpResponsibilityExplorer
        roles={[
          { id: "user", code: "USER", title: "用户", owner: "提出业务目标、确认高风险动作并判断最终结果。", boundary: "不负责协议实现，也不应被迫理解工具内部细节。" },
          { id: "host", code: "HOST", title: "承载用户目标", owner: "组织上下文、用户交互、Client 生命周期与最终体验。", boundary: "不能把用户身份、同意和审批责任下放给模型。" },
          { id: "client", code: "CLIENT", title: "维护协议会话", owner: "与一个 Server 建立隔离连接，完成能力协商与消息路由。", boundary: "会调用不代表已经获得业务系统授权。" },
          { id: "server", code: "SERVER", title: "暴露能力契约", owner: "提供 Tool、Resource、Prompt 以及结果和错误语义。", boundary: "不能绕过下游系统的身份、权限与审计控制。" },
          { id: "system", code: "SYSTEM", title: "执行真实业务", owner: "校验主体、策略、数据权限并形成权威业务状态。", boundary: "不通过 MCP 暴露内部实现细节，也不把协议连接当作最终授权。" },
        ]}
        sequence={[
          { code: "01", title: "发现", detail: "Client 读取 Server 声明的能力与 Schema" },
          { code: "02", title: "选择", detail: "Host 根据用户目标选择必要能力" },
          { code: "03", title: "授权", detail: "应用与业务系统确认主体和权限" },
          { code: "04", title: "执行", detail: "Server 调用下游系统完成受控动作" },
          { code: "05", title: "回读", detail: "结果逐层返回并由 Host 呈现给用户" },
        ]}
      />
      <TermHintRow label="MCP 角色与能力" termIds={view.termIds} />
      <section className="focusedDecisionLedger" aria-labelledby="mcp-decision-title">
        <header><p className="kicker">ADOPTION CHECK</p><h3 id="mcp-decision-title">哪些条件不成立时，不要急着引入 MCP</h3></header>
        <div className="focusedDecisionRows">
          {brief.decisions.slice(0, 4).map((item, index) => <article key={item.question}><span>{String(index + 1).padStart(2, "0")}</span><div><h4>{item.question}</h4><p>{item.signal}</p></div><div><strong>{item.recommendation}</strong><small>{item.boundary}</small></div></article>)}
        </div>
      </section>
      <aside className="focusedBoundary" aria-label="重要边界" data-importance="critical"><span>CRITICAL BOUNDARY</span><p>{brief.criticalBoundary}</p></aside>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>沿“发现—选择—授权—执行—回读”逐段确认主体、责任人、错误语义和审计证据；只要其中一段说不清，就还不是可上线的工具接入。</p><nav aria-label="MCP 深入阅读"><a href="#deep-dive">部署与长任务</a><a href="#evidence">协议证据</a><a href="#cloud">平台连接</a></nav></footer>
    </section>
  );
}

function InferenceFocusedPrimer({ brief }: { brief: FocusedBrief }) {
  const view = requireModuleExtensionView("llm-inference") as ExtensionView;
  const diagnosticRows = brief.decisions.slice(0, 4);
  return (
    <section className="pilotPrimer focusedNarrative focusedNarrative--diagnostic" id="principle" data-knowledge-view={view.id} data-quality-section="principle" aria-label="INTERACTIVE SYSTEM VIEW" aria-labelledby="inference-focused-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">LATENCY × MEMORY × CAPACITY</p><h2 id="inference-focused-title">把“推理慢”拆成一条可以测量的请求链</h2></div>
        <p>先区分排队、Prefill、Decode 与结果传输，再把时间指标和显存占用对应起来。只有定位瓶颈，批处理、量化、缓存或扩容才有明确目的。</p>
      </header>
      <InferenceLifecycleExplorer phases={[
        { id: "queue", no: "01", title: "排队", detail: "等待调度、批次和计算资源。", metric: "排队等待时间" },
        { id: "prefill", no: "02", title: "Prefill", detail: "并行处理输入上下文，建立首 token 所需状态。", metric: "TTFT 的主要计算阶段" },
        { id: "first-token", no: "03", title: "首 token", detail: "第一个输出到达，用户开始感知响应。", metric: "TTFT · 首 token 时间" },
        { id: "decode", no: "04", title: "Decode", detail: "逐 token 生成后续输出，受内存带宽与调度影响。", metric: "TPOT / ITL · token 间延迟" },
        { id: "delivery", no: "05", title: "结果传输", detail: "网关缓冲、网络与客户端渲染共同影响最终体验。", metric: "端到端延迟 · E2E" },
      ]} />
      <TermHintRow label="推理性能常用缩写" termIds={view.termIds} />
      <section className="focusedDecisionLedger" aria-labelledby="inference-diagnostic-title">
        <header><p className="kicker">DIAGNOSTIC LEDGER</p><h3 id="inference-diagnostic-title">症状不是结论：每个优化动作都要对应一个可观察信号</h3></header>
        <div className="focusedDecisionRows">
          {diagnosticRows.map((item, index) => <article key={item.question}><span>{String(index + 1).padStart(2, "0")}</span><div><h4>{item.question}</h4><p>{item.signal}</p></div><div><strong>{item.recommendation}</strong><small>{item.boundary}</small></div></article>)}
        </div>
      </section>
      <aside className="focusedBoundary" aria-label="重要边界" data-importance="critical"><span>CRITICAL BOUNDARY</span><p>{brief.criticalBoundary}</p></aside>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>带着真实输入长度、输出长度、并发、SLO 与硬件组合做负载测试；分别记录 TTFT、TPOT、吞吐、显存和失败率，再决定优化顺序。</p><nav aria-label="推理优化深入阅读"><a href="#deep-dive">诊断生产瓶颈</a><a href="#evidence">核对测量边界</a><a href="#cloud">容量与服务</a></nav></footer>
    </section>
  );
}

const securityThreatSteps: Array<[string, string, string]> = [
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
      <SecurityBarrierExplorer threats={securityThreatSteps} defenses={securityDefenseLayers} />
      <TermHintRow label="安全架构常用缩写" termIds={["iam", "acl", "dlp", "hitl", "api"]} />
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

const tuningLifecycle: Array<[string, string, string]> = [
  ["01", "定义目标", "区分知识、行为与能力问题"],
  ["02", "固定考卷", "保留未见样本与高风险切片"],
  ["03", "准备数据", "清洗、去重、授权并统一样本格式"],
  ["04", "训练 Adapter", "从 SFT、LoRA 或 QLoRA 小步试验"],
  ["05", "比较与回归", "同时检查目标提升、通用能力和安全"],
  ["06", "灰度与回滚", "绑定基座、Adapter、模板和运行版本"],
];

const tuningMethodMatrix = [
  ["全参微调", "全部权重", "能力变化大、数据与算力充分", "训练、存储与回归最重"],
  ["LoRA", "低秩增量参数", "稳定行为与多个任务版本", "仍要绑定基座与模板"],
  ["QLoRA", "量化基座上的 LoRA", "显存受限的试验与适配", "数值和部署组合更复杂"],
];

export function FineTuningPrimer() {
  return (
    <section className="pilotPrimer pilotPrimer--tuning" data-knowledge-view="tuning-lifecycle" aria-labelledby="fine-tuning-primer-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">METHOD TRIAGE &amp; RELEASE</p><h2 id="fine-tuning-primer-title">先判断该不该训练，再管理完整发布过程</h2></div>
        <p>微调适合修正稳定行为，不适合替代实时知识、业务数据库或权限规则。方法选择和发布回滚应该在训练开始前就被一起设计。</p>
      </header>
      <TuningRouteExplorer methods={tuningMethodChoices} lifecycle={tuningLifecycle} />
      <TermHintRow label="微调方法常用缩写" termIds={["sft", "lora", "qlora", "dpo", "llm"]} />
      <div className="tuningEvidenceBoard">
        <div><p className="miniLabel">PARAMETER UPDATE</p><h3>三种参数更新方式</h3></div>
        <div className="tuningMethodMatrix" role="table">
          <div className="tuningMethodRow tuningMethodRow--head" role="row"><span>方法</span><span>更新什么</span><span>更适合</span><span>主要代价</span></div>
          {tuningMethodMatrix.map(([method, update, fit, cost]) => <div className="tuningMethodRow" role="row" key={method}><strong>{method}</strong><span>{update}</span><span>{fit}</span><span>{cost}</span></div>)}
        </div>
        <div className="tuningEvidenceChecks" aria-label="微调发布需要的四层证据">
          <article><span>01</span><h3>数据</h3><p>来源、格式、模板、去重、许可与泄漏</p></article>
          <article><span>02</span><h3>训练</h3><p>Loss、学习率、稳定性与可复现环境</p></article>
          <article><span>03</span><h3>任务</h3><p>目标提升、未见切片、通用能力与安全</p></article>
          <article><span>04</span><h3>服务</h3><p>显存、时延、吞吐、成本、灰度与回滚</p></article>
        </div>
      </div>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>先比较四种方法，确认微调确有必要，再把训练数据、冻结评估集、Adapter、基础模型、服务模板和回滚方案当作一个发布单元共同验收。</p><nav aria-label="微调深入阅读"><a href="#decisions">查看方法选择</a><a href="#curriculum">查看训练方法</a><a href="#cloud">查看训练与部署</a></nav></footer>
    </section>
  );
}

export function ModuleExtensionPrimer({ slug }: { slug: string }) {
  const view = requireModuleExtensionView(slug) as ExtensionView;

  return (
    <section
      className={`pilotPrimer extensionPrimer extensionPrimer--${view.layout}`}
      data-knowledge-view={view.id}
      aria-labelledby={`${slug}-extension-primer-title`}
    >
      <header className="pilotPrimerHeader">
        <div><p className="kicker">{view.eyebrow}</p><h2 id={`${slug}-extension-primer-title`}>{view.title}</h2></div>
        <p>{view.intro}</p>
      </header>
      <ModuleKnowledgeExplorer view={view} />
      <TermHintRow label="本模块常用缩写" termIds={view.termIds} />
      <footer className="pilotPrimerActions">
        <strong>技术售前用法</strong>
        <p>{view.application}</p>
        <nav aria-label={`${view.title}深入阅读`}>{view.links.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}</nav>
      </footer>
    </section>
  );
}

export function SharedModulePrimer({ slug, knowledgeView, brief }: { slug: string; knowledgeView: string | null; brief?: FocusedBrief }) {
  if (knowledgeView === "theory-atlas") return <LlmTheoryPrimer />;
  if (knowledgeView === "decision-blueprint") return <SolutionPatternPrimer brief={brief} />;
  if (knowledgeView === "mcp-host-server-boundary" && brief) return <McpFocusedPrimer brief={brief} />;
  if (knowledgeView === "latency-capacity-map" && brief) return <InferenceFocusedPrimer brief={brief} />;
  if (knowledgeView === "threat-path") return <SecurityThreatPrimer />;
  if (knowledgeView === "tuning-lifecycle") return <FineTuningPrimer />;
  return <ModuleExtensionPrimer slug={slug} />;
}
