"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

type ModeId = "quick" | "learn" | "field";
type MetricId = "input" | "concurrency" | "ttft" | "tpot" | "goodput" | "oom";

type CurriculumChapter = {
  title: string;
  en: string;
  explanation: string;
  decision: string;
  boundary: string;
  sourceIds: readonly string[];
};

type LearningStep = {
  title: string;
  learn: string;
  checkpoint: string;
};

type LearningLab = {
  title: string;
  scenario: string;
  tasks: readonly string[];
  deliverable: string;
  acceptance: string;
  sourceIds: readonly string[];
};

type InferenceStudioProps = {
  curriculum: { lead: string; chapters: readonly CurriculumChapter[] };
  evidenceCount: number;
  field: ReactNode;
  learningLabs: readonly LearningLab[];
  learningOutcomes: readonly string[];
  learningRoute: readonly LearningStep[];
  questionCount: number;
  sourceTitles: Readonly<Record<string, string>>;
  updatedAt?: string | null;
};

type Workload = {
  inputLabel: string;
  inputTokens: number;
  concurrency: number;
};

const modeDefinitions: Array<{ id: ModeId; label: string; icon: "clock" | "book" | "shield" }> = [
  { id: "quick", label: "10 分钟速查", icon: "clock" },
  { id: "learn", label: "系统学习", icon: "book" },
  { id: "field", label: "现场查证", icon: "shield" },
];

const metricDefinitions: Array<{ id: MetricId; label: string; color: string; detail: string }> = [
  { id: "input", label: "输入长度", color: "#153047", detail: "输入越长，Prefill 计算和每个活跃请求的 KV Cache 通常越大。" },
  { id: "concurrency", label: "并发", color: "#339fe3", detail: "并发会增加排队与动态显存压力；可服务并发不是一张卡的固定常数。" },
  { id: "ttft", label: "TTFT", color: "#aa91e5", detail: "本页服务端 TTFT 包含排队与 Prefill；用户端口径还要加入口和首包网络。" },
  { id: "tpot", label: "TPOT", color: "#58c7b4", detail: "每输出 Token 时间反映持续生成速度，单位应为 ms/token。" },
  { id: "goodput", label: "Goodput", color: "#f49a28", detail: "有效吞吐（Goodput）只统计同时满足质量与时延目标的请求。" },
  { id: "oom", label: "OOM", color: "#ef5b50", detail: "权重可加载不代表容量安全；KV Cache、工作区、碎片和运行余量都要入账。" },
];

const inputOptions = [
  { label: "1K", tokens: 1024 },
  { label: "2K", tokens: 2048 },
  { label: "4K", tokens: 4096 },
  { label: "8K", tokens: 8192 },
  { label: "16K", tokens: 16384 },
  { label: "32K", tokens: 32768 },
  { label: "64K", tokens: 65536 },
] as const;

const concurrencyOptions = [256, 128, 64, 32, 16, 8, 4, 1] as const;
const outputOptions = [128, 256, 512, 1024, 2048] as const;
const quickOutputTokens = 32;

const chapterNavigation: ReadonlyArray<{ number: string; label: string; href: `#${string}`; metric?: MetricId; target?: string }> = [
  { number: "01", label: "用户到底在等什么？", href: "#principle" },
  { number: "02", label: "推理延迟的三段式模型", href: "#request-timeline" },
  { number: "03", label: "输入长度的影响", href: "#metric-input", metric: "input", target: "latency-heatmap" },
  { number: "04", label: "并发与排队", href: "#metric-concurrency", metric: "concurrency", target: "latency-heatmap" },
  { number: "05", label: "TTFT 解析", href: "#metric-ttft", metric: "ttft", target: "request-timeline" },
  { number: "06", label: "TPOT 解析", href: "#metric-tpot", metric: "tpot", target: "request-timeline" },
  { number: "07", label: "Goodput 解析", href: "#metric-goodput", metric: "goodput", target: "selected-metric" },
  { number: "08", label: "OOM 与显存账", href: "#metric-oom", metric: "oom", target: "oom-case" },
  { number: "09", label: "显存账：权重 + KV Cache", href: "#chapter-runtime-memory" },
  { number: "10", label: "时间账：拆分与并行", href: "#chapter-workload" },
  { number: "11", label: "容量边界：三维约束", href: "#capacity-experiment" },
  { number: "12", label: "模型与精度的选择", href: "#chapter-quantization" },
  { number: "13", label: "推理服务架构", href: "#chapter-engines" },
  { number: "14", label: "vLLM 关键参数", href: "#chapter-scheduling" },
  { number: "15", label: "批处理与连续批", href: "#chapter-scheduling" },
  { number: "16", label: "KV Cache 策略", href: "#chapter-runtime-memory" },
  { number: "17", label: "流式输出的权衡", href: "#chapter-workload" },
  { number: "18", label: "多机多卡扩展", href: "#chapter-disaggregated" },
  { number: "19", label: "观测与告警", href: "#chapter-production" },
  { number: "20", label: "成本与效率优化", href: "#chapter-release" },
  { number: "21", label: "常见误区", href: "#qa" },
  { number: "22", label: "选型速查表", href: "#evidence" },
  { number: "23", label: "进一步阅读", href: "#related-modules" },
];

const quickMetricHashes = metricDefinitions.map((metric) => `metric-${metric.id}`);

function navigationTarget(entry: (typeof chapterNavigation)[number]) {
  return entry.target ?? entry.href.slice(1);
}

const chapterIds = [
  "chapter-workload",
  "chapter-runtime-memory",
  "chapter-scheduling",
  "chapter-engines",
  "chapter-quantization",
  "chapter-speculative",
  "chapter-disaggregated",
  "chapter-production",
  "chapter-release",
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function workloadMetrics(workload: Workload) {
  const inputPower = Math.log2(workload.inputTokens / 1024);
  const concurrencyPressure = Math.sqrt(workload.concurrency / 32);
  const queue = 0.06 + Math.pow(workload.concurrency / 32, 0.6) * 0.32 + inputPower * 0.0133;
  const prefill = 0.32 + inputPower * 0.115 + concurrencyPressure * 0.115;
  const network = 0.1;
  const concurrencyPower = Math.log2(workload.concurrency / 32);
  const memory = Math.max(18, 21.1 + inputPower * 7.5 + concurrencyPower * 6.2);
  const tpotMs = 24.1 + inputPower * 1.7 + concurrencyPressure * 2.9;
  const decode = 0.03 + (tpotMs / 1000) * quickOutputTokens;
  const ttft = queue + prefill;
  const total = ttft + decode + network;
  const oom = memory > 61.5;
  const rawThroughput = workload.concurrency * 1000 / tpotMs;
  const sloPassRate = oom ? 0.15 : clamp(0.88 - Math.max(0, total - 2) * 0.08, 0.35, 0.9);
  const goodput = rawThroughput * sloPassRate;
  return { queue, prefill, ttft, decode, network, total, memory, tpotMs, goodput, rawThroughput, oom };
}

function formatSeconds(value: number) {
  if (value >= 10) return `${value.toFixed(1)} s`;
  return `${value.toFixed(2)} s`;
}

function ModeIcon({ name }: { name: "clock" | "book" | "shield" }) {
  if (name === "clock") {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></svg>;
  }
  if (name === "book") {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 5.5c2.7-.7 5.4.1 8 2v11c-2.6-1.9-5.3-2.7-8-2V5.5Zm16 0c-2.7-.7-5.4.1-8 2v11c2.6-1.9 5.3-2.7 8-2V5.5Z" /></svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m12 3 7 3v5c0 4.6-2.8 8-7 10-4.2-2-7-5.4-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
}

function LearningSourceLinks({ sourceIds, sourceTitles }: { sourceIds: readonly string[]; sourceTitles: Readonly<Record<string, string>> }) {
  return <footer className="learningSourceLinks" aria-label="本节依据">{sourceIds.map((sourceId) => <Link href={`/references#source-${sourceId}`} key={sourceId}>{sourceTitles[sourceId] ?? sourceId} ↗</Link>)}</footer>;
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
    </svg>
  );
}

function MetricStrip({ active, onChange }: { active: MetricId; onChange: (metric: MetricId) => void }) {
  return (
    <div className="inferenceMetricStrip" aria-label="选择观察指标">
      {metricDefinitions.map((metric) => (
        <button
          aria-pressed={active === metric.id}
          key={metric.id}
          onClick={() => onChange(metric.id)}
          type="button"
        >
          <i aria-hidden="true" style={{ "--metric-color": metric.color } as CSSProperties} />
          {metric.label}
        </button>
      ))}
    </div>
  );
}

function Heatmap({
  selected,
  onSelect,
}: {
  selected: Workload;
  onSelect: (next: Workload) => void;
}) {
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function moveCell(event: KeyboardEvent<HTMLButtonElement>, row: number, column: number) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextRow = row;
    let nextColumn = column;
    if (event.key === "ArrowLeft") nextColumn = Math.max(0, column - 1);
    if (event.key === "ArrowRight") nextColumn = Math.min(inputOptions.length - 1, column + 1);
    if (event.key === "ArrowUp") nextRow = Math.max(0, row - 1);
    if (event.key === "ArrowDown") nextRow = Math.min(concurrencyOptions.length - 1, row + 1);
    if (event.key === "Home") nextColumn = 0;
    if (event.key === "End") nextColumn = inputOptions.length - 1;
    const index = nextRow * inputOptions.length + nextColumn;
    const input = inputOptions[nextColumn];
    onSelect({ inputLabel: input.label, inputTokens: input.tokens, concurrency: concurrencyOptions[nextRow] });
    cellRefs.current[index]?.focus();
  }

  return (
    <section className="inferenceHeatmapPanel" id="latency-heatmap" aria-labelledby="heatmap-title">
      <header>
        <h3 id="heatmap-title">输入长度 × 并发热力图 <small>固定输出 {quickOutputTokens} Token · 延迟：秒</small></h3>
        <p>并发（请求数）</p>
      </header>
      <div className="heatmapWithLegend">
        <div className="heatmapMatrix" role="grid" aria-label={`固定输出 ${quickOutputTokens} Token 时，输入长度与并发的示例端到端延迟`}>
          {concurrencyOptions.map((concurrency, row) => (
            <div className="heatmapRow" role="row" key={concurrency}>
              <span className={selected.concurrency === concurrency ? "isActive" : undefined} aria-hidden="true">{concurrency}</span>
              {inputOptions.map((input, column) => {
                const workload = { inputLabel: input.label, inputTokens: input.tokens, concurrency };
                const metrics = workloadMetrics(workload);
                const isSelected = selected.inputTokens === input.tokens && selected.concurrency === concurrency;
                const level = metrics.total < 1.5 ? 0
                  : metrics.total < 2 ? 1
                    : metrics.total < 3 ? 2
                      : metrics.total < 5 ? 3
                        : metrics.total < 8 ? 4 : 5;
                const index = row * inputOptions.length + column;
                return (
                  <button
                    aria-label={`${input.label} 输入，并发 ${concurrency}，${metrics.oom ? "超过示例显存安全线" : `示例延迟 ${formatSeconds(metrics.total)}`}`}
                    aria-selected={isSelected}
                    className={`heatmapCell heatLevel--${level}${metrics.oom ? " isRisk" : ""}${isSelected ? " isSelected" : ""}`}
                    data-memory-gb={metrics.memory.toFixed(1)}
                    key={input.label}
                    onClick={() => onSelect(workload)}
                    onKeyDown={(event) => moveCell(event, row, column)}
                    ref={(node) => { cellRefs.current[index] = node; }}
                    role="gridcell"
                    tabIndex={isSelected ? 0 : -1}
                    type="button"
                  >
                    {isSelected ? (metrics.oom ? "OOM" : metrics.total.toFixed(2)) : null}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="heatmapXAxis" aria-hidden="true">
            <span />
            {inputOptions.map((input) => <strong className={selected.inputTokens === input.tokens ? "isActive" : undefined} key={input.label}>{input.label}</strong>)}
          </div>
          <p className="heatmapAxisTitle">输入长度（Token）</p>
          <div className="heatmapRiskLabel" aria-hidden="true">OOM 风险区</div>
        </div>
        <div className="heatmapLegend" aria-hidden="true">
          <span>延迟（秒）</span>
          <div />
          <small>≥ 8</small><small>8</small><small>5</small><small>3</small><small>2</small><small>1.5</small><small>&lt; 1.5</small>
        </div>
      </div>
      <p className="inferenceFigureNote">交互示意：输入长度指本次请求的上下文长度，输出固定为 {quickOutputTokens} Token。图中数值只解释指标怎样联动，不是容量承诺；采购和上线前仍要用目标模型、硬件与真实请求分布重跑。</p>
    </section>
  );
}

function RequestTimeline({ workload }: { workload: Workload }) {
  const metrics = workloadMetrics(workload);
  const chartMax = Math.max(3, Math.ceil(metrics.total));
  const rows = [
    { label: "排队等待", en: "Queueing", value: metrics.queue, start: 0, color: "#b7a5e8" },
    { label: "Prefill", en: "首 Token 处理", value: metrics.prefill, start: metrics.queue, color: "#58c7b4" },
    { label: "解码生成", en: "Decode", value: metrics.decode, start: metrics.ttft, color: "#3bb7a3" },
    { label: "网络传输", en: "输出链路", value: metrics.network, start: metrics.ttft + metrics.decode, color: "#76c9ea" },
  ];
  return (
    <section className="requestTimeline" id="request-timeline" aria-labelledby="timeline-title">
      <header>
        <div><h3 id="timeline-title">请求时间线</h3><p>所选单元格：输入 {workload.inputLabel} × 并发 {workload.concurrency}</p></div>
        <output><span>端到端延迟（P95）</span><strong>{formatSeconds(metrics.total)}</strong></output>
      </header>
      <div className="timelineScale" aria-hidden="true">
        {Array.from({ length: chartMax + 1 }, (_, tick) => <span key={tick} style={{ left: `${(tick / chartMax) * 100}%` }}>{tick}</span>)}
      </div>
      <div className="timelineRows">
        {rows.map((row) => (
          <div className="timelineRow" key={row.label}>
            <span><strong>{row.label}</strong><small>{row.en}</small></span>
            <div>
              <i
                style={{
                  "--bar-color": row.color,
                  "--bar-left": `${(row.start / chartMax) * 100}%`,
                  "--bar-width": `${Math.max((row.value / chartMax) * 100, 3)}%`,
                } as CSSProperties}
              >{formatSeconds(row.value)}</i>
            </div>
          </div>
        ))}
      </div>
      <div className="timelineTotal"><span>总时延（P95）</span><strong>{formatSeconds(metrics.total)}</strong></div>
      <p className="inferenceFigureNote">本页 TTFT 从服务收到请求算到模型产生首 Token，等于排队 + Prefill；若从用户端测量，还要计入入口与首包网络。TPOT 是平均每个输出 Token 的生成时间。四段相加等于这组固定输出 {quickOutputTokens} Token 的示例总时延。</p>
    </section>
  );
}

function MetricInspector({
  activeMetric,
  closeButtonRef,
  onCapacity,
  onClose,
  workload,
}: {
  activeMetric: MetricId;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onCapacity: () => void;
  onClose: () => void;
  workload: Workload;
}) {
  const metric = metricDefinitions.find((item) => item.id === activeMetric) ?? metricDefinitions[0];
  const metrics = workloadMetrics(workload);
  const memoryPercent = (metrics.memory / 64) * 100;
  return (
    <aside className="metricInspector" aria-labelledby="selected-metric-title">
      <header><h3 id="selected-metric-title">所选指标</h3><button aria-label="关闭指标说明" onClick={onClose} ref={closeButtonRef} type="button">×</button></header>
      <div className="inspectorMetric"><i style={{ "--metric-color": metric.color } as CSSProperties} /><strong>{metric.label}</strong><p>{metric.detail}</p></div>
      <section><h4>当前选择</h4><dl><div><dt>输入长度</dt><dd>{workload.inputLabel} Token</dd></div><div><dt>并发</dt><dd>{workload.concurrency} 请求</dd></div></dl></section>
      <section><h4>指标值（P95）</h4><dl><div><dt>TTFT</dt><dd>{metrics.ttft.toFixed(2)} s</dd></div><div><dt>TPOT</dt><dd>{metrics.tpotMs.toFixed(1)} ms/token</dd></div><div><dt>有效吞吐（Goodput）</dt><dd>{metrics.goodput.toFixed(0)} token/s <small>≤ 原始吞吐 {metrics.rawThroughput.toFixed(0)}</small></dd></div><div><dt>OOM 状态</dt><dd className={metrics.oom ? "isDanger" : "isSafe"}>{metrics.oom ? "风险" : "安全"}</dd></div></dl></section>
      <section className="memoryGauge"><h4>显存占用（估算）</h4><div><i style={{ width: `${clamp(memoryPercent, 0, 100)}%` }} /></div><p><strong>{metrics.memory.toFixed(1)}</strong> / 64 GB <span>{Math.round(memoryPercent)}%</span></p></section>
      <button className="capacityLink" onClick={onCapacity} type="button">查看容量实验 <span>→</span></button>
      <footer><strong>证据与来源</strong><a href="#evidence">查看测量边界与来源 ↗</a><small>示例估算 · 非实测数据</small></footer>
    </aside>
  );
}

function CaseReview() {
  return (
    <section className="focusedDecisionLedger" id="oom-case" aria-labelledby="oom-case-title">
      <div className="inferenceCaseReview">
        <header><span aria-hidden="true" /><h2 id="oom-case-title">案例复盘：长输入 + 高并发导致 OOM</h2><small>示例场景</small></header>
        <div className="caseReviewGrid">
        <div className="caseNarrative">
          <h3>背景</h3><p>某客服总结任务把输入窗口从 8K 放宽到 32K，同时将并发上限从 32 提到 128；权重仍能加载，但高峰期开始出现失败。</p>
          <h3>症状</h3><ul><li>CUDA out of memory 增多</li><li>排队与 TTFT 的 P95 同时上升</li><li>重试进一步放大瞬时到达率</li></ul>
        </div>
        <figure className="memoryTrendFigure">
          <figcaption><strong>示例证据：显存使用趋势</strong><span>示意图 · GB</span></figcaption>
          <svg role="img" aria-label="并发升高后显存超过 64GB 安全阈值的示意趋势" viewBox="0 0 620 220">
            <defs><linearGradient id="memory-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#339fe3" stopOpacity=".22"/><stop offset="1" stopColor="#339fe3" stopOpacity="0"/></linearGradient></defs>
            <g className="chartGrid"><path d="M42 30H600M42 78H600M42 126H600M42 174H600"/><path d="M42 30V190M154 30V190M266 30V190M378 30V190M490 30V190M600 30V190"/></g>
            <path className="chartThreshold" d="M42 70H600"/><text x="48" y="61">OOM 安全线（64 GB）</text>
            <path fill="url(#memory-area)" d="M42 170 86 168 130 165 174 170 218 158 262 145 306 132 350 124 394 115 438 92 468 48 490 82 512 36 534 88 556 60 578 66 600 58 600 190 42 190Z"/>
            <path className="chartLine" d="M42 170 86 168 130 165 174 170 218 158 262 145 306 132 350 124 394 115 438 92 468 48 490 82 512 36 534 88 556 60 578 66 600 58"/>
            <circle cx="468" cy="48" r="6"/><text x="480" y="43">首次出现 OOM</text>
          </svg>
        </figure>
        <aside className="caseAction">
          <h3>根因判断</h3><ol><li>32K 输入放大单请求 KV Cache</li><li>并发 128 使动态缓存叠加越过安全余量</li><li>失败重试反过来抬高排队和峰值</li></ol>
          <h3>处置顺序</h3><ol><li>先限流、背压并停止无界重试</li><li>按长度分池，给长请求独立配额</li><li>再比较检索 / 摘要、缓存策略和扩容</li></ol>
          <p className="caseAcceptance">容量曲线要绑定真实负载、质量和 SLO；等待上限、背压和拒绝语义都要一起测。扩容不能替代过载准入。</p>
        </aside>
        </div>
      </div>
    </section>
  );
}

function SingleRequestDiagram() {
  const stages = [
    { name: "请求输入", en: "Prompt", detail: "Token 化 · 长度与模板" },
    { name: "Prefill", en: "预填充", detail: "并行处理输入 · 建立 KV" },
    { name: "Decode", en: "解码生成", detail: "逐 Token 生成 · 受 TPOT 影响" },
    { name: "KV Cache", en: "显存", detail: "保存历史状态 · 支撑复用" },
  ];
  return (
    <div className="singleRequestDiagram" aria-label="Prefill、Decode 与 KV Cache 关系图">
      {stages.map((stage, index) => (
        <div className={`requestStage requestStage--${index}`} key={stage.name}>
          <header><strong>{stage.name}</strong><small>{stage.en}</small></header>
          <div aria-hidden="true">{index === 0
            ? <span>今天下午很好，适合出门散步。</span>
            : Array.from({ length: 6 }, (_, cell) => <i key={cell} />)}</div>
          <p>{stage.detail}</p>
          {index < stages.length - 1 ? <span aria-hidden="true">→</span> : null}
        </div>
      ))}
      <footer><strong>关键指标</strong><span>TTFT · 首 token 时间</span><span>TPOT（ms/token）</span><span>吞吐（token/s）</span><span>显存（GB）</span></footer>
      <p className="srOnly">键值缓存 · Key-Value Cache；连续批处理 · Continuous Batching；首个 Token 时间 · Time to First Token；每个输出 Token 时间 · Time per Output Token。</p>
    </div>
  );
}

type CapacityInputs = { inputTokens: number; concurrency: number; outputTokens: number };

function capacityMetrics(run: CapacityInputs) {
  const inputPower = Math.log2(run.inputTokens / 1024);
  const outputPower = Math.log2(run.outputTokens / 128);
  const pressure = Math.sqrt(run.concurrency / 32);
  const queue = 0.08 + Math.pow(run.concurrency / 32, 0.7) * 0.18 + inputPower * 0.01;
  const prefill = 0.18 + inputPower * 0.08 + pressure * 0.07;
  const ttft = queue + prefill;
  const tpot = 14.8 + outputPower * 1.3 + inputPower * 0.7 + pressure * 1.9;
  const rawThroughput = run.concurrency * 1000 / tpot;
  const concurrencyEfficiency = clamp(0.358 + Math.log2(run.concurrency) * 0.02, 0.358, 0.5);
  const engineLimit = Math.max(320, 1400 - inputPower * 20 - outputPower * 15);
  const throughput = Math.round(Math.min(rawThroughput * concurrencyEfficiency, engineLimit));
  const concurrencyPower = Math.log2(run.concurrency / 32);
  const memory = Math.max(18, 21.1 + inputPower * 7.5 + concurrencyPower * 6.2 + outputPower * 5.3);
  return { queue, prefill, ttft, tpot, throughput, rawThroughput, memory, unsafe: memory > 61.5 || ttft > 2 };
}

function CapacityExperiment() {
  const [inputTokens, setInputTokens] = useState(8192);
  const [concurrency, setConcurrency] = useState(32);
  const [outputTokens, setOutputTokens] = useState(512);
  const [run, setRun] = useState({ inputTokens: 8192, concurrency: 32, outputTokens: 512, revision: 0 });
  const result = useMemo(() => capacityMetrics(run), [run]);
  const trend = useMemo(() => {
    const concurrencySamples = [...new Set([1, 8, 16, 32, 48, 64, 96, 128, run.concurrency])].sort((a, b) => a - b);
    const samples = concurrencySamples.map((sampleConcurrency) => ({
      concurrency: sampleConcurrency,
      result: capacityMetrics({ ...run, concurrency: sampleConcurrency }),
    }));
    const project = (key: "ttft" | "tpot" | "throughput", top: number, bottom: number) => {
      const values = samples.map((sample) => sample.result[key]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      return samples.map((sample) => ({
        x: 54 + ((sample.concurrency - 1) / 127) * 566,
        y: bottom - ((sample.result[key] - min) / Math.max(max - min, 0.0001)) * (bottom - top),
      }));
    };
    const series = {
      ttft: project("ttft", 38, 208),
      tpot: project("tpot", 126, 194),
      throughput: project("throughput", 48, 208),
    };
    const path = (points: Array<{ x: number; y: number }>) => points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
    const currentIndex = concurrencySamples.indexOf(run.concurrency);
    return {
      currentX: series.ttft[currentIndex].x,
      currentY: { ttft: series.ttft[currentIndex].y, tpot: series.tpot[currentIndex].y, throughput: series.throughput[currentIndex].y },
      path: { ttft: path(series.ttft), tpot: path(series.tpot), throughput: path(series.throughput) },
    };
  }, [run]);

  function executeExperiment() {
    setRun({ inputTokens, concurrency, outputTokens, revision: run.revision + 1 });
  }

  return (
    <div className="capacityExperiment" id="capacity-experiment">
      <form onSubmit={(event) => { event.preventDefault(); executeExperiment(); }}>
        <h4>实验输入</h4>
        <label>模型<select defaultValue="qwen"><option value="qwen">Qwen2.5-7B-Instruct · BF16 示例</option></select></label>
        <fieldset><legend>输入长度（Token）</legend><div>{inputOptions.map((input) => <button aria-pressed={inputTokens === input.tokens} key={input.label} onClick={() => setInputTokens(input.tokens)} type="button">{input.label}</button>)}</div></fieldset>
        <label className="capacityRange">并发（请求数）<output>{concurrency}</output><input aria-label="并发请求数" max="128" min="1" onChange={(event) => setConcurrency(Number(event.target.value))} step="1" type="range" value={concurrency}/><span><small>1</small><small>32</small><small>64</small><small>128</small></span></label>
        <fieldset><legend>输出长度（Token）</legend><div>{outputOptions.map((output) => <button aria-pressed={outputTokens === output} key={output} onClick={() => setOutputTokens(output)} type="button">{output >= 1024 ? `${output / 1024}K` : output}</button>)}</div></fieldset>
        <button className="runExperiment" type="submit">运行实验</button>
        <p>示例环境：单卡 64 GB、BF16、固定模型与引擎。结果只用来观察指标之间的变化。</p>
      </form>
      <section className="capacityResults" aria-live="polite">
        <header><h4>实验结果</h4><span>{run.inputTokens / 1024}K 输入 · {run.concurrency} 并发 · 输出 {run.outputTokens}</span></header>
        <div className="capacityMetricCards">
          <article><span>TTFT（P95）</span><strong>{result.ttft.toFixed(2)}<small>s</small></strong><p>排队 + Prefill</p></article>
          <article><span>TPOT（平均）</span><strong>{result.tpot.toFixed(1)}<small>ms/token</small></strong><p>持续生成速度</p></article>
          <article><span>吞吐（平均）</span><strong>{result.throughput}<small>token/s</small></strong><p>聚合输出速度</p></article>
          <article><span>显存占用</span><strong>{result.memory.toFixed(1)}<small>/ 64 GB</small></strong><p>{Math.round((result.memory / 64) * 100)}% 估算</p></article>
        </div>
        <figure className="capacityTrend">
          <figcaption><strong>延迟与吞吐趋势</strong><span>当前点：并发 {run.concurrency}</span></figcaption>
          <svg role="img" aria-label="随着并发变化的 TTFT、TPOT 与吞吐示意曲线" viewBox="0 0 660 250">
            <g className="chartGrid"><path d="M54 28H620M54 78H620M54 128H620M54 178H620M54 228H620"/><path d="M54 28V228M166 28V228M278 28V228M390 28V228M502 28V228M620 28V228"/></g>
            <path className="trendTtft" d={trend.path.ttft}/>
            <path className="trendTpot" d={trend.path.tpot}/>
            <path className="trendThroughput" d={trend.path.throughput}/>
            <line className="trendCurrent" x1={trend.currentX} x2={trend.currentX} y1="28" y2="228"/>
            <circle className="trendCurrentPoint trendCurrentPoint--ttft" cx={trend.currentX} cy={trend.currentY.ttft} r="4"/>
            <circle className="trendCurrentPoint trendCurrentPoint--tpot" cx={trend.currentX} cy={trend.currentY.tpot} r="4"/>
            <circle className="trendCurrentPoint trendCurrentPoint--throughput" cx={trend.currentX} cy={trend.currentY.throughput} r="4"/>
            <text className="trendCurrentLabel" x={Math.min(trend.currentX + 8, 570)} y="22">当前点</text>
            <g className="trendAxisLabels"><text x="48" y="245">1</text><text x="190" y="245">32</text><text x="334" y="245">64</text><text x="602" y="245">128</text><text x="8" y="20">延迟</text><text x="585" y="20">吞吐</text></g>
          </svg>
          <div><span className="legendTtft">TTFT</span><span className="legendTpot">TPOT</span><span className="legendThroughput">吞吐</span></div>
        </figure>
      </section>
      <aside className={`capacityConclusion${result.unsafe ? " isUnsafe" : ""}`}>
        <header><span>{result.unsafe ? "!" : "✓"}</span><h4>示例容量判断</h4></header>
        <p>{result.unsafe ? "当前组合越过示例安全线，应先降低并发、缩短输入或分池，再重新验证。" : "当前组合仍在示例安全线内，但上线前仍需用真实流量完成稳态、突发和故障测试。"}</p>
        <h5>建议</h5><ul><li>以 P95 / P99 与拒绝率确定并发上限</li><li>按输入长度和优先级分层准入</li><li>记录模型、模板、引擎、硬件与日期</li></ul>
        <a href="#deep-dive">查看容量报告要素</a>
        <small>示例估算，不构成容量承诺</small>
      </aside>
    </div>
  );
}

function LearningPanel({
  curriculum,
  learningLabs,
  learningOutcomes,
  learningRoute,
  sourceTitles,
}: {
  curriculum: InferenceStudioProps["curriculum"];
  learningLabs: readonly LearningLab[];
  learningOutcomes: readonly string[];
  learningRoute: readonly LearningStep[];
  sourceTitles: Readonly<Record<string, string>>;
}) {
  const [openChapters, setOpenChapters] = useState<Set<number>>(() => new Set([0, 1]));
  const route = learningRoute.slice(0, 3);

  useEffect(() => {
    const revealLinkedChapter = () => {
      const hash = window.location.hash.replace(/^#/, "");
      const linkedIndex = chapterIds.indexOf(hash as (typeof chapterIds)[number]);
      const chapterIndex = hash === "capacity-experiment" ? 1 : linkedIndex;
      if (chapterIndex < 0) return;
      setOpenChapters((current) => new Set([...current, chapterIndex]));
      window.requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: "start" }));
    };
    revealLinkedChapter();
    window.addEventListener("hashchange", revealLinkedChapter);
    return () => window.removeEventListener("hashchange", revealLinkedChapter);
  }, []);

  function toggleChapter(index: number) {
    setOpenChapters((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="inferenceLearning" id="study-guide">
      <section className="learningRoute" aria-labelledby="learning-route-title">
        <h2 id="learning-route-title">学习路线</h2>
        <ol>{route.map((step, index) => <li className={index === 0 ? "isActive" : undefined} key={step.title}><span>{index + 1}</span><div><strong>{index === 0 ? "读懂单请求" : index === 1 ? "理解多请求竞争" : "完成容量实验"}</strong><small>{index === 2 ? "得到容量曲线与过载处置" : step.checkpoint}</small></div></li>)}</ol>
      </section>
      <section className="learningChapters" id="curriculum" aria-label="系统学习章节">
        {curriculum.chapters.map((chapter, index) => {
          const open = openChapters.has(index);
          return (
            <article className={open ? "isOpen" : undefined} id={chapterIds[index]} key={chapter.title}>
              <button aria-expanded={open} aria-controls={`inference-chapter-${index}`} onClick={() => toggleChapter(index)} type="button">
                <span>第 {index + 1} 章</span><strong>{index === 0 ? "Prefill、Decode 与 KV Cache" : index === 1 ? "实验：输入长度 × 并发容量实验" : chapter.title}</strong><small>{chapter.en}</small><i aria-hidden="true">⌄</i>
              </button>
              <div hidden={!open} id={`inference-chapter-${index}`}>
                {index === 0 ? <><SingleRequestDiagram /><LearningSourceLinks sourceIds={chapter.sourceIds} sourceTitles={sourceTitles}/></> : index === 1 ? <><CapacityExperiment /><LearningSourceLinks sourceIds={chapter.sourceIds} sourceTitles={sourceTitles}/></> : (
                  <div className="chapterBrief">
                    <p>{chapter.explanation}</p>
                    <dl><div><dt>会改变什么决定</dt><dd>{chapter.decision}</dd></div><div><dt>适用边界</dt><dd>{chapter.boundary}</dd></div></dl>
                    <LearningSourceLinks sourceIds={chapter.sourceIds} sourceTitles={sourceTitles}/>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>
      <section className="inferenceLearningPractice" id="practice">
        <header><p>学习结果</p><h2>做完这组内容，你可以</h2></header>
        <ul className="learningOutcomeList">{learningOutcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
        <div className="learningStart"><h2>从这里开始</h2><p>先用默认负载跑一遍知识地图，再替换成客户的模型、长度分布和 SLO。</p></div>
        <ol className="learningFullRoute">{learningRoute.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.learn}</p><strong>检查：{step.checkpoint}</strong></div></li>)}</ol>
        <div className="learningLabList">
          <h2>动手做一遍</h2>
          {learningLabs.map((lab, index) => <article key={lab.title}>
            <span>{String(index + 1).padStart(2, "0")}</span><div><h3>{lab.title}</h3><p>{lab.scenario}</p><ol>{lab.tasks.map((task) => <li key={task}>{task}</li>)}</ol><dl><div><dt>交付物</dt><dd>{lab.deliverable}</dd></div><div><dt>通过标准</dt><dd>{lab.acceptance}</dd></div></dl><LearningSourceLinks sourceIds={lab.sourceIds} sourceTitles={sourceTitles}/></div>
          </article>)}
        </div>
        <a href="#curriculum">返回知识地图 ↑</a>
      </section>
    </div>
  );
}

export function InferenceStudio({ curriculum, evidenceCount, field, learningLabs, learningOutcomes, learningRoute, questionCount, sourceTitles, updatedAt }: InferenceStudioProps) {
  const [activeMode, setActiveMode] = useState<ModeId>("quick");
  const [activeMetric, setActiveMetric] = useState<MetricId>("input");
  const [activeAnchor, setActiveAnchor] = useState("principle");
  const [activeNavNumber, setActiveNavNumber] = useState("01");
  const [workload, setWorkload] = useState<Workload>({ inputLabel: "8K", inputTokens: 8192, concurrency: 32 });
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const tabsId = useId();
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);
  const inspectorCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const inspectorOpenButtonRef = useRef<HTMLButtonElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const selectFromHash = (shouldFocus = false) => {
      const hash = window.location.hash.replace(/^#/, "");
      if (["principle", "latency-heatmap", "request-timeline", "selected-metric", "oom-case", ...quickMetricHashes].includes(hash)) setActiveMode("quick");
      if (["study-guide", "curriculum", "capacity-experiment", "practice", ...chapterIds].includes(hash)) setActiveMode("learn");
      if (["field-guide", "mechanism-index", "decision-guide", "evidence", "deep-dive", "boundary", "cloud", "qa", "related-modules"].includes(hash)) setActiveMode("field");
      const linkedEntry = chapterNavigation.find((entry) => entry.href === `#${hash}`);
      if (hash) {
        setActiveAnchor(hash);
        if (linkedEntry) setActiveNavNumber(linkedEntry.number);
        if (linkedEntry?.metric) {
          setActiveMetric(linkedEntry.metric);
          setInspectorOpen(true);
        }
      }
      const targetId = linkedEntry ? navigationTarget(linkedEntry) : hash;
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        const target = document.getElementById(targetId);
        target?.scrollIntoView({ block: "start" });
        if (shouldFocus && target) {
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
      }));
    };
    selectFromHash();
    const handleHashChange = () => selectFromHash(true);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 760px)");
    const closeAfterResize = (event: MediaQueryListEvent) => {
      if (!event.matches) setMenuOpen(false);
    };
    mobileViewport.addEventListener("change", closeAfterResize);
    return () => mobileViewport.removeEventListener("change", closeAfterResize);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    const menu = menuRef.current;
    if (!menu) return;
    const focusable = () => [...menu.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')]
      .filter((element) => getComputedStyle(element).visibility !== "hidden");
    window.requestAnimationFrame(() => focusable()[0]?.focus());
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !menu.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !menu.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function closeMenuAndRestoreFocus() {
    const shouldRestoreFocus = menuOpen && window.matchMedia("(max-width: 760px)").matches;
    setMenuOpen(false);
    if (shouldRestoreFocus) window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  function selectMetric(metric: MetricId) {
    const entry = chapterNavigation.find((item) => item.metric === metric);
    setActiveMetric(metric);
    setInspectorOpen(true);
    if (!entry) return;
    setActiveAnchor(entry.href.slice(1));
    setActiveNavNumber(entry.number);
    window.history.replaceState(null, "", entry.href);
  }

  function closeInspector() {
    setInspectorOpen(false);
    window.requestAnimationFrame(() => inspectorOpenButtonRef.current?.focus());
  }

  function openInspector() {
    setInspectorOpen(true);
    window.requestAnimationFrame(() => inspectorCloseButtonRef.current?.focus());
  }

  function changeMode(next: ModeId) {
    setActiveMode(next);
    setMenuOpen(false);
    const nextHash = next === "quick" ? "principle" : next === "learn" ? "study-guide" : "field-guide";
    window.history.replaceState(null, "", `#${nextHash}`);
    setActiveAnchor(nextHash);
    if (next !== "field") setActiveNavNumber("01");
  }

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + modeDefinitions.length) % modeDefinitions.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % modeDefinitions.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = modeDefinitions.length - 1;
    changeMode(modeDefinitions[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  function revealCapacity() {
    setActiveMode("learn");
    window.history.replaceState(null, "", "#capacity-experiment");
    window.dispatchEvent(new Event("hashchange"));
    const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    window.requestAnimationFrame(() => {
      const chapter = document.getElementById("chapter-runtime-memory");
      chapter?.scrollIntoView({ block: "start", behavior });
      window.requestAnimationFrame(() => document.getElementById("capacity-experiment")?.scrollIntoView({ block: "center", behavior }));
    });
  }

  return (
    <>
      <header className="inferenceTopbar">
        <Link className="inferenceBrand" href="/" aria-label="返回首页"><span className="brandDesktop">Cloud × AI Presales Fieldbook</span><span className="brandMobile">Cloud × AI Fieldbook</span></Link>
        <nav className="inferenceGlobalNav" aria-label="全站导航">
          <Link href="/">首页</Link><Link className="isActive" href="/#knowledge-map">知识库</Link><Link href="/modules/solution-patterns">场景方案</Link><button onClick={revealCapacity} type="button">容量实验</button><Link href="/modules/ai-ops">最佳实践</Link><Link href="/questions">工具箱</Link>
          <span aria-hidden="true" />
          <Link href="/questions">⌕ 搜索</Link><a href="#related-modules">相关模块</a>
        </nav>
        <button className="mobileMenuButton" aria-expanded={menuOpen} aria-controls="inference-mobile-menu" aria-label={menuOpen ? "关闭目录" : "打开目录"} onClick={() => menuOpen ? closeMenuAndRestoreFocus() : setMenuOpen(true)} ref={menuButtonRef} type="button"><MenuIcon open={menuOpen}/></button>
      </header>

      <aside aria-modal={menuOpen ? "true" : undefined} className={`inferenceChapterRail${menuOpen ? " isOpen" : ""}`} id="inference-mobile-menu" aria-label="大模型推理目录" ref={menuRef} role={menuOpen ? "dialog" : undefined}>
        <header><strong>大模型推理 · 目录</strong><button aria-label="关闭目录" onClick={closeMenuAndRestoreFocus} type="button">×</button></header>
        <nav>
          {chapterNavigation.map(({ number, label, href, metric }) => {
            return <a className={number === activeNavNumber && href === `#${activeAnchor}` ? "isActive" : undefined} href={href} key={`${number}-${label}`} onClick={() => { setActiveAnchor(href.slice(1)); setActiveNavNumber(number); if (metric) { setActiveMetric(metric); setInspectorOpen(true); } closeMenuAndRestoreFocus(); }}><span>{number}</span>{label}</a>;
          })}
        </nav>
        <footer><Link href="/references#module-llm-inference">↓ 查看本页来源</Link><Link href="/en/modules/llm-inference" hrefLang="en" lang="en" prefetch={false}>English</Link></footer>
      </aside>

      <div className={`inferenceMain${inspectorOpen ? "" : " inspectorClosed"}`}>
        <div id="main-content" className="skipTarget" tabIndex={-1}/>
        <header className="inferenceHero" id="top">
          <h1 id="llm-inference-title">大模型推理</h1>
          <p className="inferenceHeroEn">LLM Inference</p>
          <p className="inferenceHeroLead">{activeMode === "quick"
            ? "把一次推理拆成时间账、显存账和容量边界。"
            : activeMode === "learn"
              ? "先读懂单请求，再看多请求怎样争抢显存和算力，最后跑一遍容量实验。"
              : "先看证据和测量条件，再回答客户的容量问题。"}</p>
          <p className="srOnly">机制速览 · 方案判断 · 重要边界</p>
          <dl className="moduleHeroMetrics" aria-label="模块内容概览"><div><dt>阅读方式</dt><dd><strong>3</strong><span>种</span></dd></div><div><dt>问题库</dt><dd><strong>{questionCount}</strong><span>题</span></dd></div><div><dt>证据卡</dt><dd><strong>{evidenceCount}</strong><span>张</span></dd></div></dl>
        </header>

        <section className="moduleReadingExperience" id="module-reading" aria-label="大模型推理阅读方式">
          <div className="inferenceModeTabs" role="tablist" aria-label="阅读方式">
            {modeDefinitions.map((mode, index) => (
              <button
                aria-controls={`${tabsId}-${mode.id}`}
                aria-selected={activeMode === mode.id}
                id={`${tabsId}-${mode.id}-tab`}
                key={mode.id}
                onClick={() => changeMode(mode.id)}
                onKeyDown={(event) => moveTab(event, index)}
                ref={(node) => { tabRefs.current[index] = node; }}
                role="tab"
                tabIndex={activeMode === mode.id ? 0 : -1}
                type="button"
              ><ModeIcon name={mode.icon}/><strong>{mode.label}</strong></button>
            ))}
          </div>

          <div aria-labelledby={`${tabsId}-quick-tab`} hidden={activeMode !== "quick"} id={`${tabsId}-quick`} role="tabpanel" tabIndex={0}>
            <section className="inferenceQuick focusedNarrative" id="principle" data-knowledge-view="latency-capacity-map" data-quality-section="principle" aria-label="INTERACTIVE SYSTEM VIEW">
              <div className="inferenceQuickGrid">
                <header className="inferenceSectionTitle"><span aria-hidden="true"/><div><h2>用户到底在等什么？</h2><p>从输入、排队到首字与持续生成，先定位慢在哪一段。</p></div></header>
                <div className="inferenceExplorer">
                  <MetricStrip active={activeMetric} onChange={selectMetric}/>
                  <div className="inferenceDashboard"><Heatmap onSelect={setWorkload} selected={workload}/><RequestTimeline workload={workload}/></div>
                  <button className="mobileCapacityLink" onClick={revealCapacity} type="button">查看容量实验 <span>→</span></button>
                </div>
                <div className="metricInspectorSlot" id="selected-metric">
                  {inspectorOpen ? <MetricInspector activeMetric={activeMetric} closeButtonRef={inspectorCloseButtonRef} onCapacity={revealCapacity} onClose={closeInspector} workload={workload}/> : <button className="openInspector" onClick={openInspector} ref={inspectorOpenButtonRef} type="button">展开指标说明</button>}
                </div>
                <CaseReview/>
              </div>
            </section>
          </div>

          <div aria-labelledby={`${tabsId}-learn-tab`} hidden={activeMode !== "learn"} id={`${tabsId}-learn`} role="tabpanel" tabIndex={0}>
            <LearningPanel curriculum={curriculum} learningLabs={learningLabs} learningOutcomes={learningOutcomes} learningRoute={learningRoute} sourceTitles={sourceTitles}/>
          </div>

          <div aria-labelledby={`${tabsId}-field-tab`} className="inferenceFieldPanel" hidden={activeMode !== "field"} id={`${tabsId}-field`} role="tabpanel" tabIndex={0}>{field}</div>
        </section>

        <footer className="inferenceFooter"><strong>Cloud × AI Presales Fieldbook</strong><span>大模型推理</span>{updatedAt ? <span className="moduleUpdatedAt">最近更新于 {updatedAt}</span> : null}<a href="#top">返回顶部 ↑</a></footer>
      </div>
      {menuOpen ? <button aria-label="关闭目录遮罩" className="inferenceMenuScrim" onClick={closeMenuAndRestoreFocus} type="button"/> : null}
    </>
  );
}
