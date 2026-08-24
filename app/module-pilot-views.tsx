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
  ["01", "定义证据契约", "Evidence Contract", "明确权威来源、允许用途、稳定坐标、版本、权限、冲突规则和撤回条件。"],
  ["02", "生产证据单元", "Evidence Production", "连接、解析、清洗、去重和切片，并保留原文结构、来源坐标与失败状态。"],
  ["03", "发布检索版本", "Retrieval Release", "把 Chunk、元数据、ACL、Embedding 和索引作为可比较、可切换的版本组合。"],
  ["04", "证明变化生效", "Change Assurance", "用真实问题验证新增、修改、删除和撤权已经传播到索引、缓存和最终回答。"],
];

const ragServingSteps: Array<[string, string, string, string]> = [
  ["01", "建立查询契约", "Query Contract", "保留原问题、身份、时间、产品与风险；条件不足时先追问，不急着检索。"],
  ["02", "产生权限内候选", "Authorized Candidates", "按问题类型路由关键词、向量、SQL 或图谱，并在候选阶段执行授权与有效期过滤。"],
  ["03", "编译最终证据包", "Evidence Compilation", "融合、重排、去重、处理冲突与 Token 预算，保留稳定来源 ID 和适用范围。"],
  ["04", "回答、限定或停止", "Answer / Clarify / Abstain", "逐项对齐主张与证据；必要时限定回答、追问、拒答或转人工。"],
];

const ragAdoptionChecks = [
  { question: "业务结果是否依赖外部、动态或受权限控制的知识？", signal: "答案必须引用、更新、撤回，或不同用户看到不同证据。", recommendation: "把 RAG 作为候选路线，与搜索、长上下文、SQL / API 和人工流程对比。", boundary: "若语料小而稳定，直接上下文或搜索可能更简单。" },
  { question: "是否存在可以负责和裁决的权威资料？", signal: "来源、版本、使用许可、负责人和冲突规则能够明确。", recommendation: "先形成证据契约，再讨论切片、向量库和生成模型。", boundary: "没有权威来源时，RAG 只能更快地传播不确定内容。" },
  { question: "现状基线和不可接受结果是否可测？", signal: "当前耗时、错误、人工升级、风险损失与真实问题可以冻结。", recommendation: "用基线建立 PoC 的质量、风险、时延、成本和业务通过条件。", boundary: "没有基线就不能把模型分数解释为 ROI。" },
  { question: "谁负责上线后的资料、质量、安全和恢复？", signal: "数据、应用、安全、平台和业务团队都有明确责任与交接。", recommendation: "把版本、Trace、回滚、撤权传播和人工接管写进上线契约。", boundary: "托管 RAG 服务不会接管客户的内容权威、业务授权和结果责任。" },
];

export function RagArchitecturePrimer() {
  return (
    <section className="pilotPrimer pilotPrimer--rag focusedNarrative focusedNarrative--decision" id="fit" data-knowledge-view="application-architecture" data-quality-section="principle" aria-label="INTERACTIVE SYSTEM VIEW" aria-labelledby="rag-architecture-primer-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">ADOPTION &amp; EVIDENCE ARCHITECTURE</p><h2 id="rag-architecture-primer-title">RAG 的采用条件与两条生命周期</h2></div>
        <p>RAG 的采用理由不是“有一个向量库”，而是业务回答需要当前、授权、可追溯并能撤回的外部证据；离线链负责生产证据，在线链负责决定怎样使用证据。</p>
      </header>
      <section className="focusedDecisionLedger" aria-labelledby="rag-adoption-title">
        <header><p className="kicker">ADOPTION CHECK</p><h3 id="rag-adoption-title">四个条件没有回答清楚时，不要急着选模型</h3><p>这些问题共同形成业务基线、证据责任和上线责任。任何一项无法验证，都应先停在调研或小范围实验。</p></header>
        <div className="focusedDecisionRows">
          {ragAdoptionChecks.map((item, index) => (
            <article key={item.question}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h4>{item.question}</h4><p>{item.signal}</p></div>
              <div><strong>{item.recommendation}</strong><small>{item.boundary}</small></div>
            </article>
          ))}
        </div>
      </section>
      <RagDualChainExplorer offline={ragKnowledgeSteps} online={ragServingSteps} />
      <TermHintRow label="RAG 关键术语" termIds={["rag", "retrieval", "augmentation", "generation", "sparse-retrieval", "dense-retrieval", "reranking", "grounding"]} />
      <aside className="focusedBoundary" aria-label="重要边界" data-importance="critical"><span>CRITICAL BOUNDARY</span><p>向量检索只是候选发现手段之一。RAG 的交付对象是整条证据链：资料可用、候选可找、证据可编排、回答可核验、变化可撤回。</p></aside>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>先用四个采用问题建立基线与责任，再沿离线和在线生命周期逐段定义产物、失败、指标和验收；只有出现真实错误时才增加复杂度。</p><nav aria-label="RAG 深入阅读"><a href="#evidence-contract">定义证据契约</a><a href="#model-selection">准备模型选型</a><a href="#production">决定是否上线</a></nav></footer>
    </section>
  );
}

const agentLoopSteps: Array<[string, string, string]> = [
  ["01", "感知", "读取任务、身份与环境事实"],
  ["02", "思考", "提出下一动作或停止原因"],
  ["03", "行动", "提交结构化动作意图"],
  ["04", "观察", "回读权威系统的真实状态"],
];

const agentAdoptionChecks = [
  {
    question: "业务结果能否先用确定性流程建立基线？",
    signal: "理赔材料完整率、初审周期、返工、人工升级和关键错误都有当前数据。",
    recommendation: "先固定字段校验、必填规则、权威状态读取和人工队列，再确认剩余缺口。",
    boundary: "没有确定性基线，就无法证明 Agent 带来的增益与 ROI。",
  },
  {
    question: "剩余路径是否会因新证据或工具结果而改变？",
    signal: "缺件、条款冲突、跨区域规则或异常状态无法提前枚举，下一步必须动态选择。",
    recommendation: "只把这段自适应调查交给 bounded Agent；固定提取或分类仍留在 Workflow 的单个 LLM 步骤。",
    boundary: "路径稳定、例外可枚举时，Workflow 通常更容易测试、审计和运营。",
  },
  {
    question: "Run 的身份、动作和业务终态是否可验证？",
    signal: "每次调用都有主体、参数、审批、幂等键和 operation ID，完成由理赔系统后置条件证明。",
    recommendation: "先定义 Run 契约、动作契约、结果未知恢复和人工接管，再扩大自治。",
    boundary: "final_output、Tool 成功或模型声称完成，都不等于理赔业务已经完成。",
  },
  {
    question: "业务收益是否覆盖完整 TCO 与残余风险？",
    signal: "同一任务集可比较周期、返工、人工、关键错误、P95、接管、恢复和每个成功任务成本。",
    recommendation: "从 Shadow / Draft 开始，只有客户门槛通过才开放确认后的低风险写入。",
    boundary: "不预设通用 ROI 数值，也不默认多 Agent、MCP 或托管平台一定更优。",
  },
];

export function AgentControlPrimer() {
  return (
    <section className="pilotPrimer pilotPrimer--agent focusedNarrative focusedNarrative--decision" data-knowledge-view="control-architecture" data-quality-section="principle" aria-labelledby="agent-control-primer-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">ADOPTION &amp; CONTROL ARCHITECTURE</p><h2 id="agent-control-primer-title">Agent 的采用条件与 Run 生命周期</h2></div>
        <p>以跨区域理赔材料补件与初审为主案例：确定性流程是骨架，Agent 只处理会随新证据改变路径的局部；身份、授权、真实动作与最终赔付责任始终留在模型外。</p>
      </header>
      <section className="focusedDecisionLedger" aria-labelledby="agent-adoption-title">
        <header><p className="kicker">ADOPTION CHECK</p><h3 id="agent-adoption-title">四道门决定是 Workflow、LLM 步骤还是 Agent</h3><p>先回答业务基线、动态性、可验证控制和完整经济性。任何一项说不清，都应停在确定性方案或受限实验。</p></header>
        <div className="focusedDecisionRows">
          {agentAdoptionChecks.map((item, index) => (
            <article key={item.question}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h4>{item.question}</h4><p>{item.signal}</p></div>
              <div><strong>{item.recommendation}</strong><small>{item.boundary}</small></div>
            </article>
          ))}
        </div>
      </section>
      <div className="workedExample">
        <div className="exampleQuestion"><span>贯穿案例</span><strong>跨区域保险理赔材料补件与初审</strong></div>
        <div className="exampleSteps">
          <article><span>01</span><h4>确定性骨架<small>Workflow baseline</small></h4><p>字段、必填规则、案件状态、条款版本和人工队列由代码与权威系统控制。</p></article>
          <article><span>02</span><h4>受限动态调查<small>Bounded agent</small></h4><p>只在缺件、证据冲突和异常状态改变下一步时，让模型选择获准的读取与草稿工具。</p></article>
          <article><span>03</span><h4>外部授权与验收<small>External authority</small></h4><p>补件通知经确认后发送；最终赔付资格、金额和案件状态永不由 Agent 自行决定。</p></article>
        </div>
      </div>
      <AgentAuthorityExplorer steps={agentLoopSteps} />
      <TermHintRow label="Agent 控制缩写" termIds={["ai-agent", "api", "iam", "hitl", "mcp"]} />
      <aside className="focusedBoundary" aria-label="重要边界" data-importance="critical"><span>CRITICAL BOUNDARY</span><p>本手册把 Agent 定义为受应用控制的 Run：模型可以根据当前状态选择下一步，但应用始终拥有身份、授权、执行、业务成功与停止权。</p></aside>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>用同一任务、工具、权限和终态比较 Workflow 与单 Agent；只有独立并行、上下文隔离或权限隔离被数据证明时，才讨论多 Agent。</p><nav aria-label="Agent 深入阅读"><a href="#agent-principle">查看工作循环</a><a href="#memory-interaction">查看状态与互操作</a><a href="#poc">验证 PoC 与 ROI</a></nav></footer>
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
        <div><p className="kicker">APPLICATION-LED THEORY ATLAS</p><h2 id="llm-theory-primer-title">从一次知识助手失败，看懂六个生成阶段</h2></div>
        <p>客户说“模型答错、答慢或不稳定”时，先还原文本怎样进入模型、上下文怎样被利用、输出怎样形成，再把问题转交给模型选型、Prompt、RAG、推理或外部控制责任层。</p>
      </header>
      <LlmGenerationExplorer stages={llmGenerationStages} />
      <TermHintRow label="LLM 原理缩写" termIds={["llm", "qkv", "kv-cache", "ttft", "tpot", "moe"]} />
      <p className="visualEvidenceLink"><Link href="/references#source-transformer-2017">原始 Transformer 论文与证据边界 ↗</Link></p>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>固定用户问题、实际上下文、模型与采样配置、运行指标和外部调用；每次只改变一个变量，区分“基础能力不足”“证据没给对”“生成控制漂移”“推理服务变慢”和“模型外动作错误”。</p><nav aria-label="LLM 原理深入阅读"><a href="#curriculum">查看理论地图</a><a href="#deep-dive">完成故障归因</a><a href="#decisions">查看责任转交</a></nav></footer>
    </section>
  );
}

const solutionDecisionStages = [
  ["01", "结果与基线", "Outcome", "当前怎样完成，什么状态证明真正成功？", "冻结现状、目标、损失和责任人"],
  ["02", "约束包络", "Constraints", "质量、风险、时延、恢复、成本和迁移哪些不能妥协？", "把约束写成可测场景和优先级"],
  ["03", "最小闭环", "Minimum Loop", "无 AI、规则或单次模型还缺哪项必要责任？", "只增加能解释必要性的能力"],
  ["04", "责任架构", "Responsibility", "数据、模型、状态、动作与人工分别由谁负责？", "为接口、失败、替换和接管定责"],
  ["05", "证据阶段门", "Evidence", "什么结果会支持 Go、Hold、No-Go 或 Exit？", "先写样本、阈值和停止条件"],
  ["06", "运营与退出", "Operate & Exit", "上线后谁维护，何时扩大、限制、迁移或停止？", "绑定版本、回滚、单位经济和退出资产"],
];

const solutionCapabilityChoices = [
  { verb: "果", title: "业务结果", en: "Outcome", when: "每一个方案", choice: "当前基线、权威终态、Owner", boundary: "模型输出通常不是业务完成" },
  { verb: "证", title: "数据与证据", en: "Evidence", when: "结果依赖当前、私有或可撤回事实", choice: "RAG、搜索、数据库、数据产品", boundary: "检索命中不代表正确或有权" },
  { verb: "智", title: "模型判断", en: "Model", when: "需要开放理解、生成或分类", choice: "LLM、Prompt、多模态、结构约束", boundary: "模型不能成为事实或授权主体" },
  { verb: "编", title: "编排与状态", en: "Orchestration", when: "任务跨步骤、等待或系统", choice: "工作流、队列、Agent Runtime", boundary: "final output 不等于权威状态" },
  { verb: "控", title: "规则与动作", en: "Control", when: "需要读取或改变外部状态", choice: "代码、IAM、策略、幂等与补偿", boundary: "模型不能扩大动作和权限范围" },
  { verb: "人", title: "人工责任", en: "Human", when: "结果高影响、不可逆或存在争议", choice: "审批、复核、接管和例外处理", boundary: "人工环节也需要证据、时限和审计" },
  { verb: "验", title: "持续评估与日常运营", en: "Assurance", when: "系统会变化并进入生产", choice: "评估、Trace、发布、事件与反馈", boundary: "遥测不能单独证明业务成功" },
  { verb: "营", title: "经济与退出", en: "Economics", when: "需要投资、扩展或采购决定", choice: "完整成本、单位经济、迁移与停服", boundary: "单位经济不自动证明因果 ROI" },
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
        <p>场景方案从业务变化出发，依次冻结结果与基线、约束包络、最小闭环、责任架构、证据阶段门，以及运营经济与退出；产品名称在这些问题明确后再进入。</p>
      </header>
      <div className="solutionBlueprint">
        <SolutionDecisionLoop stages={solutionDecisionStages.map(([no, title, , question, output]) => ({ no, title, question, output }))} />
        <div className="workedExample">
          <div className="exampleQuestion"><span>贯穿案例</span><strong>企业客户服务：从“回答问题”走向“可核验解决”</strong></div>
          <div className="exampleSteps">
            <article><span>01</span><h4>建立现状基线<small>Current baseline</small></h4><p>区分已解决、转人工、放弃、错误承诺和返工，并由 CRM 或工单系统确认终态。</p></article>
            <article><span>02</span><h4>形成最小闭环<small>Minimum loop</small></h4><p>只为授权知识引入 RAG，为业务查询和受限动作接入确定性工作流，复杂例外再交给有界 Agent 与人工。</p></article>
            <article><span>03</span><h4>用结果决定投资<small>Evidence and economics</small></h4><p>同时验收解决率、关键错误、P95、接管、恢复与每解决一单的完整成本，并预设限制、回滚和退出。</p></article>
          </div>
        </div>
        <div className="solutionCapabilityMatrix" role="table" aria-label="八层解决方案责任架构">
          <div className="solutionCapabilityMatrixHead" role="row"><span role="columnheader">责任层</span><span role="columnheader">什么时候需要</span><span role="columnheader">常见选择</span><span role="columnheader">不可忽略的边界</span></div>
          {solutionCapabilityChoices.map((item) => (
            <div className="solutionCapabilityMatrixRow" role="row" key={item.en}>
              <strong role="rowheader"><span>{item.verb}</span>{item.title}</strong>
              <p role="cell">{item.when}</p>
              <p role="cell">{item.choice}</p>
              <p role="cell">{item.boundary}</p>
            </div>
          ))}
        </div>
      </div>
      <TermHintRow label="方案讨论常用缩写" termIds={["poc", "sla", "tco", "rag", "ai-agent"]} />
      {decisionRows.length ? (
        <section className="focusedDecisionLedger" aria-labelledby="solution-decision-ledger-title">
          <header><p className="kicker">PROBLEM CONTRACT</p><h3 id="solution-decision-ledger-title">先把问题写成可验证的方案说明</h3><p>下面不是通用功能表，而是把客户实际情况、建议与失败边界放在同一行。任何一行无法验证，都不应进入采购清单。</p></header>
          <div className="focusedDecisionRows" role="list" aria-label="问题契约">
            {decisionRows.map((item, index) => (
              <article role="listitem" key={item.question}>
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
          <div className="primerAtlasRow primerAtlasRow--head" role="row"><span role="columnheader">场景</span><span role="columnheader">要改变的工作</span><span role="columnheader">主要指标</span><span role="columnheader">容易漏掉</span></div>
          {solutionScenarioAtlas.map(([scene, outcome, metric, risk]) => <div className="primerAtlasRow" role="row" key={scene}><strong role="rowheader">{scene}</strong><span role="cell">{outcome}</span><span role="cell">{metric}</span><span role="cell">{risk}</span></div>)}
        </div>
      </div>
      {brief ? <aside className="focusedBoundary" aria-label="重要边界" data-importance="critical"><span>CRITICAL BOUNDARY</span><p>{brief.criticalBoundary}</p></aside> : null}
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>先用六道决策门把模糊需求缩成一个可验证闭环，再沿八层责任架构逐项检查必要性、Owner、证据、失败响应和退出条件；技术越复杂，证明责任越重。</p><nav aria-label="场景解决方案深入阅读"><a href="#deep-dive">检查生产边界</a><a href="#evidence">核对证据</a><a href="#cloud">对应云服务</a></nav></footer>
    </section>
  );
}

function McpFocusedPrimer({ brief, view = requireModuleExtensionView("mcp") as ExtensionView }: { brief: FocusedBrief; view?: ExtensionView }) {
  return (
    <section className="pilotPrimer focusedNarrative focusedNarrative--protocol" id="principle" data-knowledge-view={view.id} data-quality-section="principle" aria-label="INTERACTIVE SYSTEM VIEW" aria-labelledby="mcp-focused-title">
      <header className="pilotPrimerHeader">
        <div><p className="kicker">REUSE DECISION &amp; RESPONSIBILITY MAP</p><h2 id="mcp-focused-title">MCP 的复用价值与四方责任</h2></div>
        <p>以企业工单能力服务客服 Agent、员工助手和运维助手为案例：MCP 只在重复适配已经形成成本时提供标准化价值；身份、业务授权、执行结果与长期维护仍由协议外系统负责。</p>
      </header>
      <McpResponsibilityExplorer
        roles={[
          { id: "user", code: "USER", title: "用户", owner: "提出业务目标、确认高风险动作并判断最终结果。", boundary: "不负责协议实现，也不应被迫理解工具内部细节。" },
          { id: "host", code: "HOST", title: "承载用户目标", owner: "组织上下文、用户交互、Client 生命周期与最终体验。", boundary: "不能把用户身份、同意和审批责任下放给模型。" },
          { id: "client", code: "CLIENT", title: "维护隔离协议边界", owner: "逻辑上连接一个 Server；自包含请求必须携带版本与能力元数据，并应携带 Client identity 元数据。", boundary: "无协议级 Session 不等于无应用状态，会调用也不代表已经获得业务授权。" },
          { id: "server", code: "SERVER", title: "暴露能力契约", owner: "提供 Tool、Resource、Prompt 以及结果和错误语义。", boundary: "不能绕过下游系统的身份、权限与审计控制。" },
          { id: "system", code: "SYSTEM", title: "执行真实业务", owner: "校验主体、策略、数据权限并形成权威业务状态。", boundary: "不通过 MCP 暴露内部实现细节，也不把协议连接当作最终授权。" },
        ]}
        sequence={[
          { code: "01", title: "发现", detail: "Client 可先调用 server/discover，并核验 Server 与版本" },
          { code: "02", title: "选择", detail: "Host 按用户目标和控制主体选择必要原语" },
          { code: "03", title: "授权", detail: "应用与业务系统确认主体和权限" },
          { code: "04", title: "执行", detail: "Server 调用下游系统完成受控动作" },
          { code: "05", title: "回读", detail: "Host 用权威业务状态验证结果并呈现给用户" },
        ]}
      />
      <TermHintRow label="MCP 角色与能力" termIds={view.termIds} />
      <div className="workedExample">
        <div className="exampleQuestion"><span>贯穿案例</span><strong>同一企业工单能力需要被三个独立 AI 应用复用</strong></div>
        <div className="exampleSteps">
          <article><span>01</span><h4>先算重复适配<small>Reuse signal</small></h4><p>冻结三个客户端当前的发现、Schema、错误、鉴权和审计适配成本，确认不是单应用的偶发需求。</p></article>
          <article><span>02</span><h4>保留业务 API<small>Thin adapter</small></h4><p>在已有工单 API 上增加薄 MCP Server；授权、幂等、工单状态和审计仍由原系统负责。</p></article>
          <article><span>03</span><h4>证明单位经济<small>Go / Hold / No-Go</small></h4><p>复用收益必须覆盖协议、契约测试、安全准入、观测、升级与退休成本，否则继续直接 API / Function Calling。</p></article>
        </div>
      </div>
      <section className="focusedDecisionLedger" aria-labelledby="mcp-decision-title">
        <header><p className="kicker">ADOPTION CHECK</p><h3 id="mcp-decision-title">哪些条件不成立时，不要急着引入 MCP</h3></header>
        <div className="focusedDecisionRows">
          {brief.decisions.slice(0, 4).map((item, index) => <article key={item.question}><span>{String(index + 1).padStart(2, "0")}</span><div><h4>{item.question}</h4><p>{item.signal}</p></div><div><strong>{item.recommendation}</strong><small>{item.boundary}</small></div></article>)}
        </div>
      </section>
      <aside className="focusedBoundary" aria-label="重要边界" data-importance="critical"><span>CRITICAL BOUNDARY</span><p>{brief.criticalBoundary}</p></aside>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>先比较直接 API / Function Calling 与薄 MCP 适配，再沿“发现—选择—授权—执行—回读”确认主体、错误语义和证据；复用价值或责任归属任一项说不清，就不进入生产。</p><nav aria-label="MCP 深入阅读"><a href="#deep-dive">原语、部署与长任务</a><a href="#evidence">协议证据</a><a href="#cloud">平台连接</a></nav></footer>
    </section>
  );
}

function InferenceFocusedPrimer({ brief, view = requireModuleExtensionView("llm-inference") as ExtensionView }: { brief: FocusedBrief; view?: ExtensionView }) {
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
        <header><p className="kicker">DIAGNOSTIC GUIDE</p><h3 id="inference-diagnostic-title">症状不是结论：每个优化动作都要对应一个可观察信号</h3></header>
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
  { no: "B", title: "上下文、模型与安全检查", en: "CONTEXT & MODEL", detail: "指令与数据分隔、最小上下文、输出约束和模型安全测试。", proves: "攻击即使进入上下文，也只能影响受限建议" },
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
  { method: "Tool / 规则", signal: "需要权威状态、业务计算、权限或外部动作", strength: "结果和授权可由确定性系统控制", limit: "模型只能提出调用，不能自行获得权限" },
  { method: "Fine-tuning", signal: "轻量路线后仍有稳定、可重复、可标注的行为缺口", strength: "把行为模式写入模型或 Adapter", limit: "更新、撤回和归因比轻量路线更重" },
  { method: "换基础模型", signal: "当前模型缺少核心能力、模态或上下文能力", strength: "直接提升能力上限", limit: "成本、兼容和回归范围可能扩大" },
];

const tuningLifecycle: Array<[string, string, string]> = [
  ["01", "隔离剩余缺口", "对照 Prompt、RAG、Tool、规则和换模型"],
  ["02", "执行不微调门", "核对数据权利、评测、规模、版本与回滚"],
  ["03", "建立数据合同", "清洗、去重、裁决并统一模板与拆分"],
  ["04", "最小方法试验", "按条件选择 SFT、PEFT / LoRA、QLoRA 或 DPO"],
  ["05", "四层验收", "检查目标、保留能力、安全、服务与完整成本"],
  ["06", "灰度、回滚与停止", "绑定完整运行元组；轻量路线反超时退出"],
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
        <div><p className="kicker">METHOD TRIAGE &amp; RELEASE</p><h2 id="fine-tuning-primer-title">微调适用性与完整发布过程</h2></div>
        <p>以理赔材料初审为例：条款证据归 RAG、案件状态与动作归 Tool/规则、最终批准归授权人员；只有轻量路线后仍稳定存在的行为缺口才进入训练。</p>
      </header>
      <TuningRouteExplorer methods={tuningMethodChoices} lifecycle={tuningLifecycle} />
      <TermHintRow label="微调方法常用缩写" termIds={["sft", "peft", "lora", "qlora", "dpo", "llm"]} />
      <div className="tuningEvidenceBoard">
        <div><p className="miniLabel">PARAMETER UPDATE</p><h3>三种参数更新方式</h3></div>
        <div className="tuningMethodMatrix" role="table">
          <div className="tuningMethodRow tuningMethodRow--head" role="row"><span role="columnheader">方法</span><span role="columnheader">更新什么</span><span role="columnheader">更适合</span><span role="columnheader">主要代价</span></div>
          {tuningMethodMatrix.map(([method, update, fit, cost]) => <div className="tuningMethodRow" role="row" key={method}><strong role="rowheader">{method}</strong><span role="cell">{update}</span><span role="cell">{fit}</span><span role="cell">{cost}</span></div>)}
        </div>
        <div className="tuningEvidenceChecks" aria-label="微调发布需要的四层证据">
          <article><span>01</span><h3>数据</h3><p>来源、格式、模板、去重、许可与泄漏</p></article>
          <article><span>02</span><h3>训练</h3><p>Loss、学习率、稳定性与可复现环境</p></article>
          <article><span>03</span><h3>任务</h3><p>目标提升、未见切片、通用能力与安全</p></article>
          <article><span>04</span><h3>服务</h3><p>显存、时延、吞吐、成本、灰度与回滚</p></article>
        </div>
      </div>
      <footer className="pilotPrimerActions"><strong>技术售前用法</strong><p>先按失败类型比较五条路线，再把训练数据、冻结评估集、基座、Adapter、Tokenizer、Chat Template、Runtime、Policy、单位经济和停止条件作为一个发布单元共同验收。</p><nav aria-label="微调深入阅读"><a href="#decisions">查看方法选择</a><a href="#curriculum">查看训练方法</a><a href="#cloud">查看训练与部署</a></nav></footer>
    </section>
  );
}

export function ModuleExtensionPrimer({ slug, view = requireModuleExtensionView(slug) as ExtensionView }: { slug: string; view?: ExtensionView }) {

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
        <strong>会议用法</strong>
        <p>{view.application}</p>
        <nav aria-label={`${view.title}深入阅读`}>{view.links.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}</nav>
      </footer>
    </section>
  );
}

export function SharedModulePrimer({ slug, knowledgeView, brief, extensionView }: { slug: string; knowledgeView: string | null; brief?: FocusedBrief; extensionView?: ExtensionView }) {
  if (!knowledgeView) return null;
  if (knowledgeView === "theory-atlas") return <LlmTheoryPrimer />;
  if (knowledgeView === "decision-blueprint") return <SolutionPatternPrimer brief={brief} />;
  if (knowledgeView === "mcp-host-server-boundary" && brief) return <McpFocusedPrimer brief={brief} view={extensionView} />;
  if (knowledgeView === "latency-capacity-map" && brief) return <InferenceFocusedPrimer brief={brief} view={extensionView} />;
  if (knowledgeView === "threat-path") return <SecurityThreatPrimer />;
  if (knowledgeView === "tuning-lifecycle") return <FineTuningPrimer />;
  return <ModuleExtensionPrimer slug={slug} view={extensionView} />;
}
