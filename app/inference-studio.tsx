"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { DenseModuleReadingModes, type DenseChapterLink } from "./dense-module-reading-modes";
import { learningLabAnchor } from "./knowledge-anchor.mjs";
import { estimateTeachingMemory } from "./inference-teaching-model.mjs";
import { WorkedExample, type WorkedExampleContent } from "./worked-example";

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
  workedExample?: WorkedExampleContent;
  title: string;
  scenario: string;
  tasks: readonly string[];
  deliverable: string;
  acceptance: string;
  sourceIds: readonly string[];
};

type InferenceStudioProps = {
  curriculum: { lead: string; chapters: readonly CurriculumChapter[] };
  criticalBoundary: string;
  field: ReactNode;
  learningLabs: readonly LearningLab[];
  learningOutcomes: readonly string[];
  learningRoute: readonly LearningStep[];
  sourceTitles: Readonly<Record<string, string>>;
  updatedAt?: string | null;
};

type Workload = {
  inputLabel: string;
  inputTokens: number;
  concurrency: number;
};

const metricDefinitions: Array<{ id: MetricId; label: string; color: string; detail: string }> = [
  { id: "input", label: "输入长度", color: "#153047", detail: "输入越长，Prefill 计算和每个活跃请求的 KV Cache 通常越大。" },
  { id: "concurrency", label: "并发", color: "#339fe3", detail: "并发会增加排队与动态显存压力；可服务并发不是一张卡的固定常数。" },
  { id: "ttft", label: "TTFT", color: "#aa91e5", detail: "本页服务端 TTFT 包含排队与 Prefill；用户端口径还要加入口和首包网络。" },
  { id: "tpot", label: "TPOT", color: "#58c7b4", detail: "每输出 Token 时间反映持续生成速度，单位应为 ms/token。" },
  { id: "goodput", label: "Goodput", color: "#f49a28", detail: "本图按达标请求的输出 Token 计有效吞吐，单位 token/s；按请求计数则用请求/s。分子都只取质量与时延同时合格的请求。" },
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

const quickMetricHashes = metricDefinitions.map((metric) => `metric-${metric.id}`);

const inferenceDirectories = {
  quick: [
    { id: "principle", label: "延迟与容量地图", eyebrow: "拆开时间账与显存账" },
    { id: "latency-heatmap", label: "负载热力图", eyebrow: "输入长度 × 并发" },
    { id: "oom-case", label: "OOM 复盘", eyebrow: "从现象到恢复证据" },
  ],
  learn: [
    { id: "study-guide", label: "学习路线", eyebrow: "先读单请求" },
    { id: "curriculum", label: "知识地图", eyebrow: "再看多请求竞争" },
    { id: "capacity-experiment", label: "容量实验", eyebrow: "形成容量曲线" },
    { id: "practice", label: "实战任务", eyebrow: "交付可复核产物" },
  ],
  field: [
    { id: "mechanism-index", label: "机制索引", eyebrow: "对应服务决定" },
    { id: "decision-guide", label: "方案判断", eyebrow: "先看信号再建议" },
    { id: "deep-dive", label: "容量诊断", eyebrow: "定位瓶颈与失败" },
    { id: "evidence", label: "证据与边界", eyebrow: "说明测量条件" },
    { id: "cloud", label: "云能力与责任", eyebrow: "连接交付与验收" },
    { id: "qa", label: "客户问题", eyebrow: "带边界回答" },
    { id: "related-modules", label: "相关模块", eyebrow: "继续上下游主题" },
  ],
} satisfies Record<"quick" | "learn" | "field", readonly DenseChapterLink[]>;

const inferenceChapters = [
  ...inferenceDirectories.quick,
  ...inferenceDirectories.learn,
  ...inferenceDirectories.field,
] as const;

type LearningArtifactKind = "request-lifecycle" | "capacity-estimate";

function topicAnchorId(topic: CurriculumChapter) {
  const slug = topic.en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `inference-topic-${slug || "untitled"}`;
}

function learningArtifactFor(topic: CurriculumChapter): LearningArtifactKind | null {
  if (topic.en === "Workload & Request Lifecycle") return "request-lifecycle";
  if (topic.en === "Runtime Memory") return "capacity-estimate";
  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function workloadMetrics(workload: Workload) {
  const inputPower = Math.log2(workload.inputTokens / 1024);
  const concurrencyPressure = Math.sqrt(workload.concurrency / 32);
  const queue = 0.06 + Math.pow(workload.concurrency / 32, 0.6) * 0.32 + inputPower * 0.0133;
  const prefill = 0.32 + inputPower * 0.115 + concurrencyPressure * 0.115;
  const network = 0.1;
  const memoryEstimate = estimateTeachingMemory({ ...workload, outputTokens: quickOutputTokens });
  const memory = memoryEstimate.memoryGiB;
  const tpotMs = 24.1 + inputPower * 1.7 + concurrencyPressure * 2.9;
  const decode = 0.03 + (tpotMs / 1000) * (quickOutputTokens - 1);
  const ttft = queue + prefill;
  const total = ttft + decode + network;
  const oom = memoryEstimate.exceedsBudget;
  const rawThroughput = workload.concurrency * 1000 / tpotMs;
  // A declared classroom assumption, never a measured percentile or pass rate.
  const sloPassRate = !oom && ttft <= 2 && tpotMs <= 40 ? 0.8 : 0;
  const goodput = rawThroughput * sloPassRate;
  return { queue, prefill, ttft, decode, network, total, memory, tpotMs, goodput, rawThroughput, oom };
}

function formatSeconds(value: number) {
  if (value >= 10) return `${value.toFixed(1)} s`;
  return `${value.toFixed(2)} s`;
}

function LearningSourceLinks({ sourceIds, sourceTitles }: { sourceIds: readonly string[]; sourceTitles: Readonly<Record<string, string>> }) {
  return <footer className="learningSourceLinks" aria-label="本节依据">{sourceIds.map((sourceId) => <Link href={`/references#source-${sourceId}`} key={sourceId}>{sourceTitles[sourceId] ?? sourceId} ↗</Link>)}</footer>;
}

function MetricStrip({ active, onChange }: { active: MetricId; onChange: (metric: MetricId) => void }) {
  return (
    <div className="inferenceMetricStrip" role="group" aria-label="选择观察指标">
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
      <span className="anchorAlias" id="metric-input" aria-hidden="true" />
      <span className="anchorAlias" id="metric-concurrency" aria-hidden="true" />
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
                    aria-label={`${input.label} 输入，并发 ${concurrency}，${metrics.oom ? "超过教学显存预算" : `示例延迟 ${formatSeconds(metrics.total)}`}`}
                    aria-selected={isSelected}
                    className={`heatmapCell heatLevel--${level}${metrics.oom ? " isRisk" : ""}${isSelected ? " isSelected" : ""}`}
                    data-memory-gib={metrics.memory.toFixed(1)}
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
    { label: "流式传输", en: "与生成重叠", value: metrics.decode + metrics.network, start: metrics.ttft, color: "#76c9ea" },
  ];
  return (
    <section className="requestTimeline" id="request-timeline" aria-labelledby="timeline-title">
      <span className="anchorAlias" id="metric-ttft" aria-hidden="true" />
      <span className="anchorAlias" id="metric-tpot" aria-hidden="true" />
      <header>
        <div><h3 id="timeline-title">请求时间线</h3><p>所选单元格：输入 {workload.inputLabel} × 并发 {workload.concurrency}</p></div>
        <output><span>端到端延迟（示例）</span><strong>{formatSeconds(metrics.total)}</strong></output>
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
      <div className="timelineTotal"><span>总时延（示例）</span><strong>{formatSeconds(metrics.total)}</strong></div>
      <p className="inferenceFigureNote">服务端 TTFT = 排队 + Prefill；用户端还要加入口与首包网络。流式输出随生成传输，两段会重叠，不能把整段网络耗时再串行相加。TTFT 已包含首 Token，剩余生成时间按（输出数 − 1）× TPOT 计算，另加 0.03 秒结束处理和 0.1 秒链路尾延迟。时间来自假设的服务曲线，没有请求样本，不能计算 P95 或 P99。</p>
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
      <section><h4>教学示例值</h4><dl><div><dt>TTFT</dt><dd>{metrics.ttft.toFixed(2)} s</dd></div><div><dt>TPOT</dt><dd>{metrics.tpotMs.toFixed(1)} ms/token</dd></div><div><dt>达标 Token 吞吐</dt><dd>{metrics.goodput.toFixed(0)} token/s <small>原始吞吐 {metrics.rawThroughput.toFixed(0)}</small></dd></div><div><dt>显存预算</dt><dd className={metrics.oom ? "isDanger" : "isSafe"}>{metrics.oom ? "超出假设预算" : "预算内，仍需实测"}</dd></div></dl><p>假设 TTFT ≤ 2 秒、TPOT ≤ 40 ms/token 时，80% 输出通过质量检查；预算不足时不计达标吞吐。实际达标率须逐请求测量。</p></section>
      <section className="memoryGauge"><h4>显存占用（估算）</h4><div><i style={{ width: `${clamp(memoryPercent, 0, 100)}%` }} /></div><p><strong>{metrics.memory.toFixed(1)}</strong> / 64 GiB <span>{Math.round(memoryPercent)}%</span></p><small>另预留 4 GiB；完整架构假设见容量实验。</small></section>
      <button className="capacityLink" onClick={onCapacity} type="button">查看容量实验 <span>→</span></button>
      <footer><strong>证据与来源</strong><a href="#evidence">查看测量边界与来源 ↗</a><small>示例估算 · 非实测数据</small></footer>
    </aside>
  );
}

function CaseReview() {
  return (
    <section className="focusedDecisionLedger" id="oom-case" aria-labelledby="oom-case-title">
      <span className="anchorAlias" id="metric-oom" aria-hidden="true" />
      <div className="inferenceCaseReview">
        <header><span aria-hidden="true" /><h2 id="oom-case-title">案例复盘：长输入 + 高并发导致 OOM</h2><small>示例场景</small></header>
        <div className="caseReviewGrid">
        <div className="caseNarrative">
          <h3>背景</h3><p>某客服总结任务把输入窗口从 8K 放宽到 32K，同时将并发上限从 32 提到 128；权重仍能加载，但高峰期开始出现失败。</p>
          <h3>症状</h3><ul><li>CUDA out of memory 增多</li><li>排队与 TTFT 的 P95 同时上升</li><li>重试进一步放大瞬时到达率</li></ul>
        </div>
        <figure className="memoryTrendFigure">
          <figcaption><strong>示例证据：显存使用趋势</strong><span>示意图 · GiB</span></figcaption>
          <svg role="img" aria-label="并发升高后显存超过 60 GiB 教学预算的示意趋势" viewBox="0 0 620 220">
            <defs><linearGradient id="memory-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#339fe3" stopOpacity=".22"/><stop offset="1" stopColor="#339fe3" stopOpacity="0"/></linearGradient></defs>
            <g className="chartGrid"><path d="M42 30H600M42 78H600M42 126H600M42 174H600"/><path d="M42 30V190M154 30V190M266 30V190M378 30V190M490 30V190M600 30V190"/></g>
            <path className="chartThreshold" d="M42 70H600"/><text x="48" y="61">教学预算（60 GiB）</text>
            <path fill="url(#memory-area)" d="M42 170 86 168 130 165 174 170 218 158 262 145 306 132 350 124 394 115 438 92 468 48 490 82 512 36 534 88 556 60 578 66 600 58 600 190 42 190Z"/>
            <path className="chartLine" d="M42 170 86 168 130 165 174 170 218 158 262 145 306 132 350 124 394 115 438 92 468 48 490 82 512 36 534 88 556 60 578 66 600 58"/>
            <circle cx="468" cy="48" r="6"/><text x="480" y="43">示例故障点</text>
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
      <aside className="requestSharedCache"><strong>KV Cache · 键值缓存</strong><p>Prefill 建立输入 Token 的缓存；Decode 持续读取历史缓存，并追加新 Token 的 K、V。它贯穿两段计算，不是生成结束后的独立步骤。</p></aside>
      <footer><strong>关键指标</strong><span>TTFT · 首 token 时间</span><span>TPOT（ms/token）</span><span>吞吐（token/s）</span><span>显存（GiB）</span></footer>
      <p className="srOnly">键值缓存 · Key-Value Cache；连续批处理 · Continuous Batching；首个 Token 时间 · Time to First Token；每个输出 Token 时间 · Time per Output Token。</p>
    </div>
  );
}

type CapacityInputs = { inputTokens: number; concurrency: number; outputTokens: number };

// Deliberately deterministic: this is a teaching model for causal direction, not a benchmark model.
function estimateCapacityMetrics(run: CapacityInputs) {
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
  const memoryEstimate = estimateTeachingMemory(run);
  const memory = memoryEstimate.memoryGiB;
  return { queue, prefill, ttft, tpot, throughput, rawThroughput, memory, kvGiB: memoryEstimate.kvGiB, unsafe: memoryEstimate.exceedsBudget || ttft > 2 };
}

function CapacityExperiment() {
  const [inputTokens, setInputTokens] = useState(8192);
  const [concurrency, setConcurrency] = useState(32);
  const [outputTokens, setOutputTokens] = useState(512);
  const [run, setRun] = useState({ inputTokens: 8192, concurrency: 32, outputTokens: 512, revision: 0 });
  const result = useMemo(() => estimateCapacityMetrics(run), [run]);
  const trend = useMemo(() => {
    const concurrencySamples = [...new Set([1, 8, 16, 32, 48, 64, 96, 128, run.concurrency])].sort((a, b) => a - b);
    const samples = concurrencySamples.map((sampleConcurrency) => ({
      concurrency: sampleConcurrency,
      result: estimateCapacityMetrics({ ...run, concurrency: sampleConcurrency }),
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
    setRun((current) => ({ inputTokens, concurrency, outputTokens, revision: current.revision + 1 }));
  }

  return (
    <div className="capacityExperiment" id="capacity-experiment">
      <header className="capacityAssumptions">
        <p className="capacityTeachingLabel">因果教学示例 · 确定性估算 · 非压测结果</p>
        <h3>容量关系估算器</h3>
        <p><strong>架构假设：</strong>32 层完整注意力、8 个 KV 头、头维度 128、BF16；权重 14 GiB，工作区 6 GiB，设备 64 GiB，另留 4 GiB。无前缀共享、淘汰或 KV 量化，所有活跃序列等长。教学门槛为显存预算 60 GiB、TTFT ≤ 2 秒，不是产品默认值。</p>
        <p>KV 每 Token = 2 × 32 × 8 × 128 × 2 = 131,072 字节。KV GiB = 每 Token 字节数 × 并发 ×（输入 + 输出）÷ 2³⁰；总缓存序列长度（输入 + 输出）或并发翻倍，KV 部分随之翻倍。时间和吞吐仍是假设曲线，不能预测具体硬件。</p>
      </header>
      <form onSubmit={(event) => { event.preventDefault(); executeExperiment(); }}>
        <h4>调整负载</h4>
        <fieldset><legend>输入长度（Token）</legend><div>{inputOptions.map((input) => <button aria-pressed={inputTokens === input.tokens} key={input.label} onClick={() => setInputTokens(input.tokens)} type="button">{input.label}</button>)}</div></fieldset>
        <label className="capacityRange">并发（请求数）<output>{concurrency}</output><input aria-label="并发请求数" max="128" min="1" onChange={(event) => setConcurrency(Number(event.target.value))} step="1" type="range" value={concurrency}/><span><small>1</small><small>32</small><small>64</small><small>128</small></span></label>
        <fieldset><legend>输出长度（Token）</legend><div>{outputOptions.map((output) => <button aria-pressed={outputTokens === output} key={output} onClick={() => setOutputTokens(output)} type="button">{output >= 1024 ? `${output / 1024}K` : output}</button>)}</div></fieldset>
        <button className="runExperiment" type="submit">更新示例估算</button>
      </form>
      <section className="capacityResults" aria-live="polite">
        <header><h4>估算输出</h4><span>{run.inputTokens / 1024}K 输入 · {run.concurrency} 并发 · 输出 {run.outputTokens}</span></header>
        <div className="capacityMetricCards">
          <article><span>TTFT（示例）</span><strong>≈ {result.ttft.toFixed(2)}<small>s</small></strong><p>排队 + Prefill</p></article>
          <article><span>TPOT（示例）</span><strong>≈ {result.tpot.toFixed(1)}<small>ms/token</small></strong><p>持续生成速度</p></article>
          <article><span>吞吐（示例）</span><strong>≈ {result.throughput}<small>token/s</small></strong><p>{result.memory + 4 > 64 ? "忽略显存约束的假设曲线；当前负载超预算" : "假设曲线，仍需实测"}</p></article>
          <article><span>显存占用</span><strong>≈ {result.memory.toFixed(1)}<small>/ 64 GiB</small></strong><p>权重 14 + 工作区 6 + KV {result.kvGiB.toFixed(1)} GiB；另留 4 GiB</p></article>
        </div>
        <figure className="capacityTrend">
          <figcaption><strong>负载关系示意</strong><span>当前点：并发 {run.concurrency}</span></figcaption>
          <svg role="img" aria-label="教学估算中，随着并发变化的 TTFT、TPOT 与吞吐趋势，各自归一化" viewBox="0 -20 660 290">
            <g className="chartGrid"><path d="M54 28H620M54 78H620M54 128H620M54 178H620M54 228H620"/><path d="M54 28V228M166 28V228M278 28V228M390 28V228M502 28V228M620 28V228"/></g>
            <path className="trendTtft" d={trend.path.ttft}/>
            <path className="trendTpot" d={trend.path.tpot}/>
            <path className="trendThroughput" d={trend.path.throughput}/>
            <line className="trendCurrent" x1={trend.currentX} x2={trend.currentX} y1="28" y2="228"/>
            <circle className="trendCurrentPoint trendCurrentPoint--ttft" cx={trend.currentX} cy={trend.currentY.ttft} r="4"/>
            <circle className="trendCurrentPoint trendCurrentPoint--tpot" cx={trend.currentX} cy={trend.currentY.tpot} r="4"/>
            <circle className="trendCurrentPoint trendCurrentPoint--throughput" cx={trend.currentX} cy={trend.currentY.throughput} r="4"/>
            <text className="trendCurrentLabel" x={Math.min(trend.currentX + 8, 510)} y="22">当前点</text>
            <g className="trendAxisLabels"><text x="48" y="245">1</text><text x="190" y="245">32</text><text x="334" y="245">64</text><text x="602" y="245">128</text><text x="8" y="20">延迟</text><text x="585" y="20">吞吐</text></g>
          </svg>
          <div><span className="legendTtft">TTFT</span><span className="legendTpot">TPOT</span><span className="legendThroughput">吞吐</span></div>
          <p className="inferenceFigureNote">三条曲线各自归一化，只用于观察变化方向，不能横向比较高低。具体示例值读上方卡片；超过显存预算时，吞吐曲线也不代表可用容量。</p>
        </figure>
      </section>
      <aside className={`capacityConclusion${result.unsafe ? " isUnsafe" : ""}`}>
        <header><span>{result.unsafe ? "!" : "✓"}</span><h4>教学示例判断</h4></header>
        <p>{result.unsafe ? "当前组合超过 60 GiB 教学显存预算或 2 秒 TTFT 目标，应先降低并发、缩短输入或分池，再重新验证。" : "当前组合满足教学显存预算与时间目标，上线前仍需用真实流量完成稳态、突发和故障测试。"}</p>
        <h5>建议</h5><ul><li>以 P95 / P99 与拒绝率确定并发上限</li><li>按输入长度和优先级分层准入</li><li>记录模型、模板、引擎、硬件与日期</li></ul>
        <section className="capacityRunPack" aria-labelledby="capacity-run-pack-title">
          <h5 id="capacity-run-pack-title">真实压测的 Run Pack：最小字段</h5>
          <p>每次曲线都带上这一组记录，才可以跨版本、机器或负载比较。</p>
          <dl>
            <div><dt>工作负载</dt><dd>模型与版本、Tokenizer / 模板、输入与输出分布、到达率、优先级和质量门槛。</dd></div>
            <div><dt>运行环境</dt><dd>镜像、引擎与参数、量化、GPU / CPU / 内存、网络，以及测试日期。</dd></div>
            <div><dt>执行方法</dt><dd>预热、持续时长、并发与准入策略、稳态 / 突发 / 故障切片。</dd></div>
            <div><dt>结果与失败</dt><dd>请求量、接受 / 拒绝、TTFT / TPOT / 端到端分位数、Goodput、OOM、超时、重试和恢复时间。</dd></div>
          </dl>
        </section>
        <a href="#deep-dive">查看容量报告要素</a>
        <small>该互动图仅用于解释变量关系，不构成容量承诺或压测结论。</small>
      </aside>
    </div>
  );
}

function TopicArtifact({ kind }: { kind: LearningArtifactKind }) {
  if (kind === "request-lifecycle") return <SingleRequestDiagram />;
  return <CapacityExperiment />;
}

function TopicSemantics({ followsArtifact, topic, sourceTitles }: {
  followsArtifact: boolean;
  topic: CurriculumChapter;
  sourceTitles: Readonly<Record<string, string>>;
}) {
  return (
    <div className={`chapterBrief${followsArtifact ? " chapterBrief--afterArtifact" : ""}`}>
      <div className="chapterMechanism"><span>机制</span><p>{topic.explanation}</p></div>
      <dl>
        <div><dt>会改变什么决定</dt><dd>{topic.decision}</dd></div>
        <div><dt>适用边界</dt><dd>{topic.boundary}</dd></div>
      </dl>
      <LearningSourceLinks sourceIds={topic.sourceIds} sourceTitles={sourceTitles}/>
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
  const [openChapters, setOpenChapters] = useState<Set<number>>(() => new Set(curriculum.chapters.map((_, index) => index)));
  const topicIds = useMemo(() => curriculum.chapters.map(topicAnchorId), [curriculum.chapters]);
  const capacityTopicIndex = useMemo(
    () => curriculum.chapters.findIndex((topic) => learningArtifactFor(topic) === "capacity-estimate"),
    [curriculum.chapters],
  );

  useEffect(() => {
    const revealLinkedChapter = () => {
      const hash = window.location.hash.replace(/^#/, "");
      const chapterIndex = hash === "capacity-experiment" ? capacityTopicIndex : topicIds.indexOf(hash);
      if (chapterIndex < 0 || chapterIndex >= curriculum.chapters.length) return;
      setOpenChapters((current) => new Set([...current, chapterIndex]));
    };
    revealLinkedChapter();
    window.addEventListener("hashchange", revealLinkedChapter);
    return () => window.removeEventListener("hashchange", revealLinkedChapter);
  }, [capacityTopicIndex, curriculum.chapters.length, topicIds]);

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
        <ol>{learningRoute.map((step, index) => <li className={index === 0 ? "isActive" : undefined} key={step.title}><span>{index + 1}</span><div><strong>{step.title}</strong><small>{step.learn}</small><em>检查：{step.checkpoint}</em></div></li>)}</ol>
      </section>
      <section className="learningChapters" id="curriculum" aria-label="系统学习主题">
        {curriculum.chapters.map((chapter, index) => {
          const open = openChapters.has(index);
          const topicId = topicIds[index];
          const artifact = learningArtifactFor(chapter);
          return (
            <article className={open ? "isOpen" : undefined} id={topicId} key={chapter.title}>
              <button aria-expanded={open} aria-controls={`${topicId}-content`} onClick={() => toggleChapter(index)} type="button">
                <span>主题</span><strong>{chapter.title}</strong><small>{chapter.en}</small><i aria-hidden="true">⌄</i>
              </button>
              <div hidden={!open} id={`${topicId}-content`}>
                {artifact ? <TopicArtifact kind={artifact}/> : null}
                <TopicSemantics followsArtifact={Boolean(artifact)} sourceTitles={sourceTitles} topic={chapter}/>
              </div>
            </article>
          );
        })}
      </section>
      <section className="inferenceLearningPractice" id="practice">
        <header><p>学习结果</p><h2>做完这组内容，你可以</h2></header>
        <ul className="learningOutcomeList">{learningOutcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
        <div className="learningStart"><h2>把示例变成证据</h2><p>先用估算器理解变量方向；随后将目标模型、请求切片、硬件和 SLO 写进 Run Pack，在真实压测里验证曲线、失败与恢复。</p></div>
        <div className="learningLabList">
          <h2>动手做一遍</h2>
          {learningLabs.map((lab, index) => <article id={learningLabAnchor("llm-inference", index)} key={lab.title}>
            <span>{String(index + 1).padStart(2, "0")}</span><div><h3>{lab.title}</h3><p>{lab.scenario}</p><ol>{lab.tasks.map((task) => <li key={task}>{task}</li>)}</ol><dl><div><dt>交付物</dt><dd>{lab.deliverable}</dd></div><div><dt>通过标准</dt><dd>{lab.acceptance}</dd></div></dl><WorkedExample example={lab.workedExample}/><LearningSourceLinks sourceIds={lab.sourceIds} sourceTitles={sourceTitles}/></div>
          </article>)}
        </div>
        <a href="#curriculum">返回知识地图 ↑</a>
      </section>
    </div>
  );
}

export function InferenceStudio({ criticalBoundary, curriculum, field, learningLabs, learningOutcomes, learningRoute, sourceTitles, updatedAt }: InferenceStudioProps) {
  const [activeMetric, setActiveMetric] = useState<MetricId>("input");
  const [workload, setWorkload] = useState<Workload>({ inputLabel: "8K", inputTokens: 8192, concurrency: 32 });
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const inspectorCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const inspectorOpenButtonRef = useRef<HTMLButtonElement | null>(null);
  const learningTopicHashes = useMemo(() => curriculum.chapters.map(topicAnchorId), [curriculum.chapters]);

  useEffect(() => {
    const selectMetricFromHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      const metric = metricDefinitions.find((item) => `metric-${item.id}` === hash)?.id;
      setActiveMetric(metric ?? "input");
      setInspectorOpen(true);
    };
    selectMetricFromHash();
    window.addEventListener("hashchange", selectMetricFromHash);
    return () => window.removeEventListener("hashchange", selectMetricFromHash);
  }, []);

  function selectMetric(metric: MetricId) {
    setActiveMetric(metric);
    setInspectorOpen(true);
    const nextHash = `#metric-${metric}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(window.history.state, "", `${window.location.pathname}${window.location.search}${nextHash}`);
    }
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  function closeInspector() {
    setInspectorOpen(false);
    window.requestAnimationFrame(() => inspectorOpenButtonRef.current?.focus());
  }

  function openInspector() {
    setInspectorOpen(true);
    window.requestAnimationFrame(() => inspectorCloseButtonRef.current?.focus());
  }

  function revealCapacity() {
    if (window.location.hash === "#capacity-experiment") window.dispatchEvent(new HashChangeEvent("hashchange"));
    else window.location.hash = "capacity-experiment";
  }

  const quick = (
    <section className="inferenceQuick focusedNarrative" id="principle" data-knowledge-view="latency-capacity-map" data-quality-section="principle" aria-label="INTERACTIVE SYSTEM VIEW">
      <p className="srOnly">机制速览 · 方案判断 · 重要边界</p>
      <div className="inferenceQuickGrid">
        <header className="inferenceSectionTitle"><span aria-hidden="true"/><div><h2>用户到底在等什么？</h2><p>从输入、排队到首字与持续生成，先定位慢在哪一段。</p></div></header>
        <div className="inferenceExplorer">
          <MetricStrip active={activeMetric} onChange={selectMetric}/>
          <div className="inferenceDashboard"><Heatmap onSelect={setWorkload} selected={workload}/><RequestTimeline workload={workload}/></div>
          <button className="mobileCapacityLink" onClick={revealCapacity} type="button">查看容量实验 <span>→</span></button>
        </div>
        <div className="metricInspectorSlot" id="selected-metric">
          <span className="anchorAlias" id="metric-goodput" aria-hidden="true" />
          {inspectorOpen ? <MetricInspector activeMetric={activeMetric} closeButtonRef={inspectorCloseButtonRef} onCapacity={revealCapacity} onClose={closeInspector} workload={workload}/> : <button className="openInspector" onClick={openInspector} ref={inspectorOpenButtonRef} type="button">展开指标说明</button>}
        </div>
        <CaseReview/>
      </div>
    </section>
  );

  return (
    <>
      <DenseModuleReadingModes
        moduleName="大模型推理"
        chapters={inferenceChapters}
        criticalBoundary={criticalBoundary}
        directories={inferenceDirectories}
        hashGroups={{
          quick: ["principle", "latency-heatmap", "request-timeline", "selected-metric", "oom-case", ...quickMetricHashes],
          learn: ["study-guide", "curriculum", "capacity-experiment", "practice", ...learningTopicHashes, ...learningLabs.map((_, index) => learningLabAnchor("llm-inference", index))],
          field: ["field-guide", "mechanism-index", "decision-guide", "deep-dive", "evidence", "boundary", "cloud", "qa", "related-modules"],
        }}
        readerId="module-reading"
        quick={<div className="inferenceStudio inferenceContentScope">{quick}</div>}
        learn={<div className="inferenceStudio inferenceContentScope"><LearningPanel curriculum={curriculum} learningLabs={learningLabs} learningOutcomes={learningOutcomes} learningRoute={learningRoute} sourceTitles={sourceTitles}/></div>}
        field={<div className="inferenceStudio inferenceContentScope inferenceFieldPanel">{field}</div>}
      />
      <footer className="inferenceStudio inferenceContentScope inferenceFooter"><strong>Cloud × AI Presales Fieldbook</strong><span>大模型推理</span>{updatedAt ? <span className="moduleUpdatedAt">最近更新于 {updatedAt}</span> : null}<a href="#top">返回顶部 ↑</a></footer>
    </>
  );
}
