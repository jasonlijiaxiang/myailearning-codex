"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

export type VisualStep = {
  code: string;
  title: string;
  en: string;
  detail: string;
  signal: string;
};

export type VisualCheck = {
  title: string;
  detail: string;
};

export type ExtensionView = {
  id: string;
  layout: "spectrum" | "pipeline" | "boundary" | "lifecycle" | "loop" | "control" | "stack" | "topology";
  title: string;
  steps: VisualStep[];
  checks: VisualCheck[];
};

type StepCanvasProps = {
  view: ExtensionView;
  active: number;
  onSelect: (index: number) => void;
  locale: "zh" | "en";
};

const pipelineReturnLabels: Record<string, string> = {
  "multimodal-evidence-pipeline": "结论必须能返回原始页面、区域、时间或说话人",
  "training-supply-chain": "评估未通过：返回数据、目标或后训练阶段",
  "ai-data-lineage": "撤权与删除沿全部派生层反向传播",
};

const lifecycleBranchLabels: Record<string, [string, string]> = {
  "delegated-task-lifecycle": ["取消 / 超时", "恢复 / 人工接管"],
  "predictive-model-lifecycle": ["漂移调查", "回滚 / 重新训练"],
};

function StepButton({
  step,
  selected,
  onClick,
}: {
  step: VisualStep;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick}>
      <span>{step.code}</span>
      <strong>{step.title}</strong>
      <small>{step.en}</small>
    </button>
  );
}

function SpectrumCanvas({ view, active, onSelect, locale }: StepCanvasProps) {
  return (
    <div className="visualSpectrumCanvas" aria-label={locale === "en" ? `${view.title} constraint coordinates` : `${view.title}的约束坐标`}>
      <div className="spectrumAxis spectrumAxis--x" aria-hidden="true"><i /><span>{locale === "en" ? "Delivery constraints" : "交付约束"}</span></div>
      <div className="spectrumAxis spectrumAxis--y" aria-hidden="true"><i /><span>{locale === "en" ? "Quality & risk" : "质量与风险"}</span></div>
      <div className="spectrumDecisionRegion"><span>{locale === "en" ? "Candidate region" : "候选区域"}</span><strong>{locale === "en" ? "Intersection of hard gates" : "硬门槛的交集"}</strong></div>
      <i className="spectrumCandidate spectrumCandidate--a" aria-label={locale === "en" ? "Candidate A" : "候选 A"} />
      <i className="spectrumCandidate spectrumCandidate--b" aria-label={locale === "en" ? "Candidate B" : "候选 B"} />
      <i className="spectrumCandidate spectrumCandidate--c" aria-label={locale === "en" ? "Candidate C" : "候选 C"} />
      {view.steps.map((step, index) => (
        <div className={`spectrumPoint spectrumPoint--${index}`} key={step.code}>
          <StepButton step={step} selected={active === index} onClick={() => onSelect(index)} />
        </div>
      ))}
    </div>
  );
}

function PipelineCanvas({ view, active, onSelect, locale }: StepCanvasProps) {
  const returnLabel = locale === "en"
    ? "Failure evidence returns upstream to improve the next pass"
    : pipelineReturnLabels[view.id] ?? "失败证据返回上游，修正下一次处理";
  return (
    <div className="visualPipelineCanvas">
      <ol style={{ "--visual-step-count": view.steps.length } as CSSProperties} aria-label={locale === "en" ? `${view.title} processing pipeline` : `${view.title}的处理管道`}>
        {view.steps.map((step, index) => (
          <li className={active === index ? "isActive" : undefined} key={step.code}>
            <StepButton step={step} selected={active === index} onClick={() => onSelect(index)} />
            {index < view.steps.length - 1 ? <i aria-hidden="true">→</i> : null}
          </li>
        ))}
      </ol>
      <div className="visualReturnPath"><span aria-hidden="true">↶</span><strong>{returnLabel}</strong></div>
    </div>
  );
}

function LifecycleCanvas({ view, active, onSelect, locale }: StepCanvasProps) {
  const branches = locale === "en"
    ? ["Fail / stop", "Recover / next cycle"]
    : lifecycleBranchLabels[view.id] ?? ["失败 / 停止", "恢复 / 下一轮"];
  return (
    <div className="visualLifecycleCanvas">
      <ol style={{ "--visual-step-count": view.steps.length } as CSSProperties} aria-label={locale === "en" ? `${view.title} state lifecycle` : `${view.title}的状态生命周期`}>
        {view.steps.map((step, index) => (
          <li className={active === index ? "isActive" : undefined} key={step.code}>
            <StepButton step={step} selected={active === index} onClick={() => onSelect(index)} />
            {index < view.steps.length - 1 ? <i aria-hidden="true">→</i> : null}
          </li>
        ))}
      </ol>
      <div className="lifecycleBranches" aria-label={locale === "en" ? "Exception branches" : "异常分支"}>
        <span>{branches[0]}</span><i aria-hidden="true">········································</i><span>{branches[1]}</span>
      </div>
    </div>
  );
}

function LoopCanvas({ view, active, onSelect, locale }: StepCanvasProps) {
  return (
    <div className="visualLoopCanvas" aria-label={locale === "en" ? `${view.title} feedback loop` : `${view.title}的闭环`}>
      <div className="loopDecisionGate"><span>DECISION GATE</span><strong>{locale === "en" ? "Is the evidence sufficient for the next cycle?" : "证据是否足以进入下一轮？"}</strong></div>
      {view.steps.map((step, index) => {
        const angle = -90 + (360 / view.steps.length) * index;
        return (
          <div
            className={`loopNode${active === index ? " isActive" : ""}`}
            style={{ "--node-angle": `${angle}deg` } as CSSProperties}
            key={step.code}
          >
            <StepButton step={step} selected={active === index} onClick={() => onSelect(index)} />
          </div>
        );
      })}
      <div className="loopEvidenceReturn"><span>{locale === "en" ? "Production evidence / incidents / feedback" : "线上证据 / 事件 / 反馈"}</span><i aria-hidden="true">↺</i></div>
    </div>
  );
}

function ControlCanvas({ view, active, onSelect, locale }: StepCanvasProps) {
  const [first, second, third, fourth] = view.steps;
  return (
    <div className="visualControlCanvas" aria-label={locale === "en" ? `${view.title} control and execution planes` : `${view.title}的控制面与执行面`}>
      <section className="controlPolicyPlane">
        <header><strong>{locale === "en" ? "Policy & control plane" : "策略与控制面"}</strong><span>{locale === "en" ? "Version, quota, identity, priority, and rollback" : "版本、配额、身份、优先级与回滚"}</span></header>
        {[second, third].filter(Boolean).map((step) => {
          const index = view.steps.indexOf(step);
          return <StepButton key={step.code} step={step} selected={active === index} onClick={() => onSelect(index)} />;
        })}
      </section>
      <div className="controlPlaneLink" aria-hidden="true"><span>{locale === "en" ? "Policy down" : "策略下发"}</span><i>↓</i><span>{locale === "en" ? "Evidence up" : "证据回传"}</span></div>
      <section className="controlDataPlane">
        {[first, third, fourth].filter(Boolean).map((step) => {
          const index = view.steps.indexOf(step);
          return (
            <div className={active === index ? "isActive" : undefined} key={`${step.code}-${index}`}>
              <StepButton step={step} selected={active === index} onClick={() => onSelect(index)} />
              {step !== fourth ? <i aria-hidden="true">→</i> : null}
            </div>
          );
        })}
      </section>
    </div>
  );
}

function StackCanvas({ view, active, onSelect, locale }: StepCanvasProps) {
  const trust = locale === "en"
    ? ["High · stable", "High · read-only", "Medium · revocable", "Low · validate"]
    : ["高 · 稳定", "高 · 只读", "中 · 可撤回", "低 · 需校验"];
  return (
    <div className="visualStackCanvas" aria-label={locale === "en" ? `${view.title} context layers` : `${view.title}的上下文分层`}>
      <div className="stackLayers">
        {view.steps.map((step, index) => (
          <div className={active === index ? "isActive" : undefined} key={step.code}>
            <span className="stackTrust">{trust[index] ?? (locale === "en" ? "Govern by source" : "按来源治理")}</span>
            <StepButton step={step} selected={active === index} onClick={() => onSelect(index)} />
          </div>
        ))}
      </div>
      <aside className="stackBudgetRail">
        <span>{locale === "en" ? "Context budget" : "上下文预算"}</span>
        <div><i style={{ height: `${36 + active * 15}%` }} /></div>
        <strong>{locale === "en" ? (active < 2 ? "Preserve stable layers first" : "Trim dynamic layers by task") : (active < 2 ? "稳定区优先保留" : "动态区按任务裁剪")}</strong>
      </aside>
    </div>
  );
}

function TopologyCanvas({ view, active, onSelect, locale }: StepCanvasProps) {
  return (
    <div className="visualTopologyCanvas" aria-label={locale === "en" ? `${view.title} end-to-end path` : `${view.title}的端到端路径`}>
      <ol style={{ "--visual-step-count": view.steps.length } as CSSProperties}>
        {view.steps.map((step, index) => (
          <li className={active === index ? "isActive" : undefined} key={step.code}>
            <StepButton step={step} selected={active === index} onClick={() => onSelect(index)} />
            {index < view.steps.length - 1 ? <i aria-hidden="true"><span>{locale === "en" ? "link" : "链路"}</span></i> : null}
          </li>
        ))}
      </ol>
      <div className="topologyDiagnosis"><span>{locale === "en" ? "Current checkpoint" : "当前检查点"}</span><strong>{locale === "en" ? "End-to-end delivery is limited by the narrowest stage" : "整条链的交付能力受最窄环节限制"}</strong></div>
    </div>
  );
}

function VisualCanvas(props: StepCanvasProps) {
  if (props.view.layout === "spectrum") return <SpectrumCanvas {...props} />;
  if (props.view.layout === "pipeline") return <PipelineCanvas {...props} />;
  if (props.view.layout === "loop") return <LoopCanvas {...props} />;
  if (props.view.layout === "control" || props.view.layout === "boundary") return <ControlCanvas {...props} />;
  if (props.view.layout === "stack") return <StackCanvas {...props} />;
  if (props.view.layout === "topology") return <TopologyCanvas {...props} />;
  return <LifecycleCanvas {...props} />;
}

export function ModuleKnowledgeExplorer({ view, locale = "zh" }: { view: ExtensionView; locale?: "zh" | "en" }) {
  const [active, setActive] = useState(0);
  const [activeCheck, setActiveCheck] = useState(0);
  const selected = view.steps[active];
  const check = view.checks[activeCheck];

  return (
    <div
      className={`moduleKnowledgeExplorer moduleKnowledgeExplorer--${view.layout}`}
      data-knowledge-explorer="interactive"
      data-knowledge-view={view.id}
      data-active-step={selected.code}
    >
      <VisualCanvas view={view} active={active} onSelect={setActive} locale={locale} />
      <section className="knowledgeStepDetail" aria-live="polite">
        <div><span>{selected.code}</span><p>{selected.en}</p><h3>{selected.title}</h3></div>
        <p>{selected.detail}</p>
        <strong>{selected.signal}</strong>
      </section>
      <section className="knowledgeDecisionChecks" aria-label={locale === "en" ? "Decision checks" : "方案检查重点"}>
        <nav>
          {view.checks.map((item, index) => (
            <button key={item.title} type="button" aria-pressed={activeCheck === index} onClick={() => setActiveCheck(index)}>
              <span>{String(index + 1).padStart(2, "0")}</span>{item.title}
            </button>
          ))}
        </nav>
        <p aria-live="polite"><strong>{check.title}</strong>{check.detail}</p>
      </section>
    </div>
  );
}

type RagStep = [string, string, string, string];

export function RagDualChainExplorer({
  offline,
  online,
}: {
  offline: RagStep[];
  online: RagStep[];
}) {
  const [lane, setLane] = useState<"offline" | "online">("online");
  const [active, setActive] = useState(0);
  const steps = lane === "offline" ? offline : online;
  const selected = steps[active] ?? steps[0];

  function changeLane(next: "offline" | "online") {
    setLane(next);
    setActive(0);
  }

  return (
    <div className="ragDualChainExplorer" data-knowledge-explorer="interactive" data-lane={lane}>
      <nav aria-label="选择 RAG 架构链">
        <button type="button" aria-pressed={lane === "offline"} onClick={() => changeLane("offline")}><span>OFFLINE</span>离线知识链</button>
        <button type="button" aria-pressed={lane === "online"} onClick={() => changeLane("online")}><span>ONLINE</span>在线回答链</button>
      </nav>
      <div className="ragChainCanvas">
        <ol aria-label={lane === "offline" ? "离线知识链" : "在线回答链"}>
          {steps.map(([no, title, en], index) => (
            <li className={active === index ? "isActive" : undefined} key={no}>
              <button type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
                <span>{no}</span><strong>{title}</strong><small>{en}</small>
              </button>
              {index < steps.length - 1 ? <i aria-hidden="true">→</i> : null}
            </li>
          ))}
        </ol>
        <div className="ragEvidenceReturn"><span>{lane === "offline" ? "质量失败返回解析、切块或同步" : "证据不足返回召回与上下文装配"}</span><i aria-hidden="true">↶</i></div>
      </div>
      <section className="ragChainDetail" aria-live="polite">
        <div><span>{selected[0]}</span><h3>{selected[1]}</h3><small>{selected[2]}</small></div>
        <p>{selected[3]}</p>
      </section>
      <aside className="ragSharedControls" aria-label="两条链共同使用的控制部分">
        <article><strong>身份与权限</strong><p>主体、租户、文档与字段级授权</p></article>
        <article><strong>版本与时效</strong><p>权威来源、生效日期、撤回与重新索引</p></article>
        <article><strong>评估与观测</strong><p>召回、忠实度、引用、拒答、时延与成功成本</p></article>
      </aside>
    </div>
  );
}

type AgentLoopStep = [string, string, string];

const agentRiskModes = {
  read: { label: "只读查询", result: "最小权限只读调用；结果回读后再生成回答。" },
  write: { label: "受控写入", result: "Schema、身份、策略与审批通过后才改变状态。" },
  irreversible: { label: "不可逆动作", result: "强制人工确认、一次性凭据和补偿预案。" },
} as const;

export function AgentAuthorityExplorer({ steps }: { steps: AgentLoopStep[] }) {
  const [active, setActive] = useState(1);
  const [risk, setRisk] = useState<keyof typeof agentRiskModes>("write");
  const selected = steps[active];

  return (
    <div className="agentAuthorityExplorer" data-knowledge-explorer="interactive" data-risk={risk}>
      <section className="agentProposalLoop">
        <header><span>PROBABILISTIC</span><strong>模型只提出下一步</strong></header>
        <ol>
          {steps.map(([no, title, detail], index) => (
            <li className={active === index ? "isActive" : undefined} key={no}>
              <button type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
                <span>{no}</span><strong>{title}</strong><small>{detail}</small>
              </button>
            </li>
          ))}
        </ol>
      </section>
      <div className="agentAuthorityFlow">
        <article><span>01</span><strong>动作提议</strong><p>{selected[1]}：{selected[2]}</p></article>
        <i aria-hidden="true">→</i>
        <article className="agentPolicyGate"><span>02</span><strong>确定性控制</strong><p>Schema · 身份 · 策略 · 审批</p></article>
        <i aria-hidden="true">→</i>
        <article><span>03</span><strong>权威系统</strong><p>执行、回读最终状态并保留审计</p></article>
      </div>
      <section className="agentRiskSelector">
        <nav aria-label="动作风险">
          {Object.entries(agentRiskModes).map(([id, mode]) => (
            <button key={id} type="button" aria-pressed={risk === id} onClick={() => setRisk(id as keyof typeof agentRiskModes)}>{mode.label}</button>
          ))}
        </nav>
        <output aria-live="polite"><span>当前控制要求</span><strong>{agentRiskModes[risk].result}</strong></output>
      </section>
    </div>
  );
}

type LlmStage = [string, string, string];

const llmStageSignals = [
  "检查 Tokenizer、语言与输入长度，不要把分词差异误判为模型推理能力。",
  "检查位置、上下文顺序与有效窗口，不要只看标称最大长度。",
  "相关性聚合不等于事实验证，也不等于完整因果解释。",
  "层数和算子影响计算量；能力问题与服务问题需要分开诊断。",
  "分数表示下一 Token 候选，不代表事实真实性或业务许可。",
  "温度、Top-p 和约束改变输出分布，需要与任务评估一起设置。",
];

export function LlmGenerationExplorer({ stages }: { stages: LlmStage[] }) {
  const [active, setActive] = useState(2);
  const selected = stages[active];

  return (
    <div className="llmGenerationExplorer" data-knowledge-explorer="interactive" data-stage={active + 1}>
      <ol className="llmSignalPath" aria-label="大语言模型生成阶段">
        {stages.map(([no, title], index) => (
          <li className={active === index ? "isActive" : undefined} key={no}>
            <button type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
              <span>{no}</span><strong>{title}</strong>
            </button>
            {index < stages.length - 1 ? <i aria-hidden="true">→</i> : null}
          </li>
        ))}
      </ol>
      <section className="llmStageDetail" aria-live="polite">
        <div><span>{selected[0]}</span><h3>{selected[1]}</h3></div>
        <p>{selected[2]}</p>
        <strong>{llmStageSignals[active]}</strong>
      </section>
      <section className="llmAttentionLens" aria-label="Self-Attention 的 Q K V 关系">
        <div><span>Q</span><strong>当前要找什么？</strong></div>
        <i aria-hidden="true">×</i>
        <div><span>K</span><strong>各位置提供什么索引？</strong></div>
        <i aria-hidden="true">→</i>
        <div><span>V</span><strong>匹配后取走什么表示？</strong></div>
        <p>softmax(QKᵀ / √d<sub>k</sub>) · V</p>
      </section>
    </div>
  );
}

type ThreatStep = [string, string, string];

type DefenseLayer = {
  no: string;
  title: string;
  en: string;
  detail: string;
  proves: string;
};

export function SecurityBarrierExplorer({
  threats,
  defenses,
}: {
  threats: ThreatStep[];
  defenses: DefenseLayer[];
}) {
  const [active, setActive] = useState(2);
  const selected = defenses[active];

  return (
    <div className="securityBarrierExplorer" data-knowledge-explorer="interactive" data-defense={selected.no}>
      <ol className="securitySourceSinkPath" aria-label="从不可信内容到外部系统状态变化的攻击路径">
        {threats.map(([no, title, detail], index) => (
          <li key={no}>
            <span>{no}</span><strong>{title}</strong><small>{detail}</small>
            {index < threats.length - 1 ? <i aria-hidden="true">→</i> : null}
          </li>
        ))}
      </ol>
      <section className="securityBarrierMatrix" aria-label="攻击路径上的四层防线">
        {defenses.map((layer, index) => (
          <button type="button" aria-pressed={active === index} onClick={() => setActive(index)} key={layer.no}>
            <span>{layer.no}</span><strong>{layer.title}</strong><small>{layer.en}</small><i aria-hidden="true">◆</i>
          </button>
        ))}
      </section>
      <aside className="securityBarrierDetail" aria-live="polite">
        <div><span>{selected.no}</span><h3>{selected.title}</h3><small>{selected.en}</small></div>
        <p>{selected.detail}</p>
        <strong>需要证明：{selected.proves}</strong>
      </aside>
      <p className="securitySurfaceRail" aria-label="AI 系统五类风险面">
        {["指令", "数据", "模型与组件", "工具与 Agent", "输出与运营"].map((surface, index) => (
          <span key={surface}><i>{String(index + 1).padStart(2, "0")}</i>{surface}</span>
        ))}
      </p>
    </div>
  );
}

type TuningChoice = {
  method: string;
  signal: string;
  strength: string;
  limit: string;
};

type TuningStage = [string, string, string];

const tuningProblems = [
  { id: "format", label: "格式或步骤不稳定", method: 0 },
  { id: "knowledge", label: "缺少最新私有知识", method: 1 },
  { id: "behavior", label: "稳定行为需要改变", method: 2 },
  { id: "capability", label: "核心能力不足", method: 3 },
] as const;

export function TuningRouteExplorer({
  methods,
  lifecycle,
}: {
  methods: TuningChoice[];
  lifecycle: TuningStage[];
}) {
  const [problem, setProblem] = useState<(typeof tuningProblems)[number]["id"]>("behavior");
  const [activeStage, setActiveStage] = useState(1);
  const route = tuningProblems.find((item) => item.id === problem) ?? tuningProblems[2];
  const method = methods[route.method];

  return (
    <div className="tuningRouteExplorer" data-knowledge-explorer="interactive" data-route={problem}>
      <section className="tuningRouteDecision">
        <nav aria-label="选择问题类型">
          {tuningProblems.map((item) => (
            <button type="button" aria-pressed={problem === item.id} onClick={() => setProblem(item.id)} key={item.id}>{item.label}</button>
          ))}
        </nav>
        <i aria-hidden="true">→</i>
        <article aria-live="polite">
          <span>建议先验证</span><h3>{method.method}</h3><p>{method.signal}</p>
          <dl><div><dt>优势</dt><dd>{method.strength}</dd></div><div><dt>限制</dt><dd>{method.limit}</dd></div></dl>
        </article>
      </section>
      <ol className="tuningReleasePath" aria-label="微调发布生命周期">
        {lifecycle.map(([no, title, detail], index) => (
          <li className={activeStage === index ? "isActive" : undefined} key={no}>
            <button type="button" aria-pressed={activeStage === index} onClick={() => setActiveStage(index)}>
              <span>{no}</span><strong>{title}</strong><small>{detail}</small>
            </button>
            {index < lifecycle.length - 1 ? <i aria-hidden="true">→</i> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
