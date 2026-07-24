"use client";

import { useState } from "react";

type DecisionStage = {
  no: string;
  title: string;
  question: string;
  output: string;
};

type ResponsibilityRole = {
  id: string;
  code: string;
  title: string;
  owner: string;
  boundary: string;
};

type InvocationStep = {
  code: string;
  title: string;
  detail: string;
};

type InferencePhase = {
  id: string;
  no: string;
  title: string;
  detail: string;
  metric: string;
};

const levelLabels = {
  short: "短",
  medium: "中",
  long: "长",
  low: "低",
  high: "高",
} as const;

export function SolutionDecisionLoop({ stages }: { stages: DecisionStage[] }) {
  const [active, setActive] = useState(3);
  const selected = stages[active];

  return (
    <div className="solutionDecisionLoop" data-active-stage={active + 1}>
      <ol aria-label="从业务结果到运营责任的方案决策闭环">
        {stages.map((stage, index) => (
          <li key={stage.no} className={index === active ? "isActive" : undefined}>
            <button type="button" aria-pressed={index === active} onClick={() => setActive(index)}>
              <span>{stage.no}</span>
              <strong>{stage.title}</strong>
              <small>{stage.question}</small>
            </button>
            {index < stages.length - 1 ? <i aria-hidden="true">→</i> : null}
          </li>
        ))}
      </ol>
      <svg className="solutionFeedbackPaths" viewBox="0 0 1000 150" role="img" aria-label="证据不足返回边界与能力设计，运营结果返回业务目标">
        <defs>
          <marker id="decision-return-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>
        <path className="evidenceReturn" d="M 700 18 C 700 78 610 82 500 82 L 300 82 C 255 82 250 60 250 40" markerEnd="url(#decision-return-arrow)" />
        <text x="470" y="73">证据不足：回到任务边界或能力搭配</text>
        <path className="operationsReturn" d="M 900 18 C 900 132 720 132 500 132 L 110 132 C 60 132 50 90 50 40" markerEnd="url(#decision-return-arrow)" />
        <text x="405" y="123">运行指标反馈：修正下一轮业务目标</text>
      </svg>
      <section className="solutionStageDetail" aria-live="polite">
        <div>
          <span>{selected.no}</span>
          <h3>{selected.title}</h3>
          <p>{selected.question}</p>
        </div>
        <div>
          <small>本关通过条件</small>
          <strong>{selected.output}</strong>
        </div>
        <p>点击上方任一节点，只查看当前决策要点。</p>
      </section>
    </div>
  );
}

export function McpResponsibilityExplorer({
  roles,
  sequence,
}: {
  roles: ResponsibilityRole[];
  sequence: InvocationStep[];
}) {
  const [activeRole, setActiveRole] = useState("client");
  const [activeHop, setActiveHop] = useState(0);
  const selected = roles.find((role) => role.id === activeRole) ?? roles[0];

  return (
    <div className="mcpArchitectureExplorer" data-active-role={activeRole}>
      <div className="mcpArchitectureCanvas" aria-label="MCP 责任与协议边界图">
        <div className="mcpUserNode">
          <button type="button" aria-pressed={activeRole === "user"} onClick={() => setActiveRole("user")}>
            <span>USER</span><strong>提出目标与确认结果</strong>
          </button>
          <i aria-hidden="true">↓</i>
        </div>
        <section className="mcpArchitectureBand mcpArchitectureBand--application" aria-label="应用侧">
          <header><strong>应用侧</strong><span>用户体验、上下文与授权确认</span></header>
          <button type="button" className="mcpRoleNode mcpRoleNode--host" aria-pressed={activeRole === "host"} onClick={() => setActiveRole("host")}>
            <span>HOST</span><strong>编排用户体验并管理 Client</strong>
          </button>
        </section>
        <section className="mcpArchitectureBand mcpArchitectureBand--protocol" aria-label="MCP 协议边界">
          <header><strong>MCP 协议边界</strong><span>会话、能力协商与结构化消息</span></header>
          <button type="button" className="mcpRoleNode mcpRoleNode--client" aria-pressed={activeRole === "client"} onClick={() => setActiveRole("client")}>
            <span>CLIENT</span><strong>一条到特定 Server 的隔离连接</strong>
          </button>
          <div className="mcpProtocolLink" aria-hidden="true"><span>JSON-RPC / MCP</span><i>↔</i></div>
          <button type="button" className="mcpRoleNode mcpRoleNode--server" aria-pressed={activeRole === "server"} onClick={() => setActiveRole("server")}>
            <span>SERVER</span><strong>暴露 Tools、Resources 与 Prompts</strong>
          </button>
        </section>
        <section className="mcpArchitectureBand mcpArchitectureBand--business" aria-label="业务侧">
          <header><strong>业务侧</strong><span>真实数据、动作与审计</span></header>
          <button type="button" className="mcpRoleNode mcpRoleNode--system" aria-pressed={activeRole === "system"} onClick={() => setActiveRole("system")}>
            <span>SYSTEM</span><strong>执行业务鉴权与最终状态变更</strong>
          </button>
        </section>
      </div>
      <aside className="mcpRoleDetail" aria-live="polite">
        <div><span>{selected.code}</span><h3>{selected.title}</h3></div>
        <dl>
          <div><dt>负责</dt><dd>{selected.owner}</dd></div>
          <div><dt>不负责</dt><dd>{selected.boundary}</dd></div>
        </dl>
      </aside>
      <ol className="mcpInteractiveTrace" aria-label="一次工具调用的典型路径">
        {sequence.map((step, index) => (
          <li key={step.code} className={index === activeHop ? "isActive" : undefined}>
            <button type="button" aria-pressed={index === activeHop} onClick={() => setActiveHop(index)}>
              <span>{index + 1}</span><strong>{step.title}</strong><small>{step.detail}</small>
            </button>
            {index < sequence.length - 1 ? <i aria-hidden="true">→</i> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function InferenceLifecycleExplorer({
  phases,
}: {
  phases: InferencePhase[];
}) {
  const [activePhase, setActivePhase] = useState("prefill");
  const [contextLength, setContextLength] = useState<"short" | "medium" | "long">("medium");
  const [concurrency, setConcurrency] = useState<"low" | "medium" | "high">("medium");
  const selected = phases.find((phase) => phase.id === activePhase) ?? phases[0];
  const pressure = contextLength === "long" || concurrency === "high"
    ? "KV Cache 占用上升，可服务并发下降"
    : contextLength === "short" && concurrency === "low"
      ? "KV Cache 压力较低，但仍需保留运行余量"
      : "KV Cache 与并发处于中等压力，需要用真实分布验证";

  return (
    <div className="inferenceExplorer" data-phase={activePhase} data-context={contextLength} data-concurrency={concurrency}>
      <section className="inferenceTimeline" aria-labelledby="inference-time-title">
        <header><h3 id="inference-time-title">用户等在哪里？</h3><p>一次请求的生命周期</p></header>
        <ol>
          {phases.map((phase) => (
            <li key={phase.id} className={phase.id === activePhase ? "isActive" : undefined}>
              <button type="button" aria-pressed={phase.id === activePhase} onClick={() => setActivePhase(phase.id)}>
                <span>{phase.no}</span><strong>{phase.title}</strong><small>{phase.detail}</small>
              </button>
            </li>
          ))}
        </ol>
        <div className="latencyMeasures" aria-label="推理延迟指标覆盖范围">
          <span className="latencyQueue">排队延迟</span>
          <span className="latencyTtft">TTFT · 首 token 时间</span>
          <span className="latencyTpot">TPOT / ITL · token 间延迟</span>
          <span className="latencyE2e">端到端延迟 · E2E</span>
        </div>
        <aside className="inferencePhaseDetail" aria-live="polite">
          <span>{selected.metric}</span><strong>{selected.title}</strong><p>{selected.detail}</p>
        </aside>
      </section>

      <section className="inferenceMemoryMap" aria-labelledby="inference-memory-title">
        <header><h3 id="inference-memory-title">并发为什么被吃掉？</h3><p>显存构成与请求生命周期对齐</p></header>
        <div className="memoryComposition" aria-label="显存构成">
          <div className="memoryRow memoryRow--weights"><span><strong>模型权重</strong><small>固定基座</small></span><i>加载后长期占用</i></div>
          <div className="memoryRow memoryRow--kv"><span><strong>KV Cache</strong><small>动态增长</small></span><i>随上下文长度与并发请求增加</i></div>
          <div className="memoryRow memoryRow--workspace"><span><strong>激活值 / 工作空间</strong><small>临时占用</small></span><i>Prefill 与 Decode 的计算过程使用</i></div>
          <div className="memoryRow memoryRow--headroom"><span><strong>碎片与预留余量</strong><small>安全空间</small></span><i>避免容量计算贴线导致 OOM</i></div>
        </div>
        <form className="inferenceControls" onSubmit={(event) => event.preventDefault()}>
          <fieldset>
            <legend>上下文长度</legend>
            {(["short", "medium", "long"] as const).map((level) => (
              <button key={level} type="button" aria-pressed={contextLength === level} onClick={() => setContextLength(level)}>{levelLabels[level]}</button>
            ))}
          </fieldset>
          <fieldset>
            <legend>并发请求数</legend>
            {(["low", "medium", "high"] as const).map((level) => (
              <button key={level} type="button" aria-pressed={concurrency === level} onClick={() => setConcurrency(level)}>{levelLabels[level]}</button>
            ))}
          </fieldset>
          <output aria-live="polite"><span>当前影响</span><strong>{pressure}</strong></output>
        </form>
      </section>
    </div>
  );
}
