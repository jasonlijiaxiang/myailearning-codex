/*
 * Model Radar data contract.
 *
 * The snapshot below is transcribed from Artificial Analysis' public model
 * page. The three displayed indices deliberately keep their provenance
 * separate: Intelligence is the official AA v4.1.1 score; Coding Composite
 * and Agentic Composite are fieldbook calculations from the official
 * component values using the 50/50 formulas shown on the page. Artificial
 * Analysis also publishes Coding Index and Agentic Index fields; those scores
 * are not substituted for the transparent component recomputations here.
 *
 * Missing values stay null. No model is promoted into an index by copying a
 * neighbour, treating an unavailable result as zero, or joining versions.
 */

const sourceRegistry = Object.freeze({
  "aa-models-2026-08-13": Object.freeze({
    sourceId: "artificial-analysis-models",
    label: "Artificial Analysis · Models",
    asOf: "2026-08-13",
    capturedAt: "2026-08-13T01:18:07Z",
    captureFingerprint: "HTTP ETag c91242cbbcf7b98fcf73da35386f05a7",
    version: "公开模型页默认 Intelligence 视图 · Intelligence Index v4.1.1",
  }),
  "aa-methodology-v4-1-1": Object.freeze({
    sourceId: "artificial-analysis-methodology",
    label: "Artificial Analysis · Methodology",
    asOf: "2026-08-13",
    version: "Intelligence Index v4.1.1",
  }),
  "terminal-bench-v2-1": Object.freeze({
    sourceId: "terminal-bench-v21",
    label: "Terminal-Bench v2.1",
    asOf: "2026-08-13",
    version: "2.1",
  }),
  scicode: Object.freeze({
    sourceId: "scicode",
    label: "SciCode",
    asOf: "2026-08-13",
    version: "Artificial Analysis 当前公开结果",
  }),
  "scicode-verified-2026": Object.freeze({
    sourceId: "scicode-verified-2026",
    label: "SciCode-Verified · Audit",
    asOf: "2026-08-13",
    version: "2026-08-05 预印本",
  }),
  "gdpval-aa-v2": Object.freeze({
    sourceId: "gdpval-aa-v2",
    label: "GDPval-AA v2",
    asOf: "2026-08-13",
    version: "GDPval-AA v2",
  }),
  "tau3-banking": Object.freeze({
    sourceId: "tau3-banking",
    label: "τ³-Banking",
    asOf: "2026-08-13",
    version: "upstream tau2-bench v1.0.1",
  }),
});

const modelDefinitions = [
  { id: "claude-opus-5", shortName: "Claude Opus 5", name: "Claude Opus 5 (Adaptive Reasoning, Max Effort)", provider: "Anthropic", openness: "专有模型", intelligence: 63.0532452071291, gdpval: 0.674385, tauBanking: 0.420618556701031, terminalBench: 0.891385767790262, sciCode: 0.556712962962963 },
  { id: "claude-fable-5", shortName: "Claude Fable 5", name: "Claude Fable 5 (Adaptive Reasoning, Max Effort, Opus 4.8 Fallback)", provider: "Anthropic", openness: "专有模型", intelligence: 62.0726622017462, gdpval: 0.620445, tauBanking: 0.381443298969072, terminalBench: 0.846441947565543, sciCode: 0.601851851851852 },
  { id: "gpt-5-6-sol", name: "GPT-5.6 Sol (max)", provider: "OpenAI", openness: "专有模型", intelligence: 60.9298701329203, gdpval: 0.6138899999999999, tauBanking: 0.443298969072165, terminalBench: 0.880149812734082, sciCode: 0.561342592592593 },
  { id: "grok-4-6", name: "Grok 4.6 (high)", provider: "SpaceXAI", openness: "专有模型", intelligence: 60.92297113115, gdpval: 0.6246, tauBanking: 0.507216494845361, terminalBench: 0.883895131086142, sciCode: 0.53587962962963 },
  { id: "kimi-k3", name: "Kimi K3 (max)", provider: "Kimi", openness: "开放权重", intelligence: 59.6994671342592, gdpval: 0.591145, tauBanking: 0.45979381443299, terminalBench: 0.850187265917603, sciCode: 0.586805555555556 },
  { id: "qwen3-8-max", name: "Qwen3.8 Max", provider: "Alibaba", openness: "专有模型", intelligence: 58.0774404479668, gdpval: 0.6184850000000001, tauBanking: 0.51340206185567, terminalBench: 0.812734082397004, sciCode: 0.528935185185185 },
  { id: "muse-spark-1-2", name: "Muse Spark 1.2 (xhigh)", provider: "Meta", openness: "专有模型", intelligence: 56.7615911905642, gdpval: 0.564, tauBanking: 0.348453608247423, terminalBench: 0.801498127340824, sciCode: 0.563657407407407 },
  { id: "gpt-5-6-terra", name: "GPT-5.6 Terra (max)", provider: "OpenAI", openness: "专有模型", intelligence: 56.5755675890213, gdpval: 0.539, tauBanking: 0.402061855670103, terminalBench: 0.880149812734082, sciCode: 0.539351851851852 },
  { id: "glm-5-2", name: "GLM-5.2 (max)", provider: "Z AI", openness: "开放权重", intelligence: 52.6409563457385, gdpval: 0.5030549999999999, tauBanking: 0.34639175257732, terminalBench: 0.779026217228464, sciCode: 0.50462962962963 },
  { id: "gpt-5-6-luna", name: "GPT-5.6 Luna (max)", provider: "OpenAI", openness: "专有模型", intelligence: 52.3180827840984, gdpval: 0.540365, tauBanking: 0.311340206185567, terminalBench: 0.808988764044944, sciCode: 0.525462962962963 },
  { id: "gemini-3-6-flash", shortName: "Gemini 3.6 Flash", name: "Gemini 3.6 Flash (high)", provider: "Google", openness: "专有模型", intelligence: 51.5819376989529, gdpval: 0.461, tauBanking: 0.298969072164948, terminalBench: 0.775280898876405, sciCode: 0.52662037037037 },
  { id: "motif-3", name: "Motif 3", provider: "Motif Technologies", openness: "专有模型", intelligence: 47.3602493365956, gdpval: 0.38727, tauBanking: 0.352577319587629, terminalBench: 0.749063670411985, sciCode: 0.40625 },
  { id: "minimax-m3", name: "MiniMax-M3", provider: "MiniMax", openness: "开放权重", intelligence: 45.3968506399702, gdpval: 0.4443099999999999, tauBanking: 0.152577319587629, terminalBench: 0.651685393258427, sciCode: 0.453703703703704 },
  { id: "inkling", shortName: "Inkling", name: "Inkling (xhigh)", provider: "Thinking Machines", openness: "开放权重", intelligence: 42.2947721285326, gdpval: 0.36979999999999996, tauBanking: 0.290721649484536, terminalBench: 0.550561797752809, sciCode: 0.460648148148148 },
  { id: "nvidia-nemotron-3-ultra-550b-a55b", shortName: "Nemotron 3 Ultra", name: "Nemotron 3 Ultra 550B A55B (Reasoning)", provider: "NVIDIA", openness: "开放权重", intelligence: 38.3185469149774, gdpval: 0.33152, tauBanking: 0.142268041237113, terminalBench: 0.539325842696629, sciCode: 0.399305555555556 },
  { id: "gemini-3-5-flash-lite", name: "Gemini 3.5 Flash-Lite", provider: "Google", openness: "专有模型", intelligence: 37.4387063722681, gdpval: 0.31996500000000005, tauBanking: 0.175257731958763, terminalBench: 0.535580524344569, sciCode: 0.408564814814815 },
  { id: "solar-open2-250b", name: "Solar Open2 250B", provider: "Upstage", openness: "开放权重", intelligence: 37.4265535921632, gdpval: 0.31095000000000006, tauBanking: 0.216494845360825, terminalBench: 0.441947565543071, sciCode: 0.456018518518519 },
  { id: "muse-glimmer", name: "Muse Glimmer (high)", provider: "Meta", openness: "开放权重", intelligence: 35.0641823105374, gdpval: 0.2265, tauBanking: 0.235051546391753, terminalBench: 0.51685393258427, sciCode: 0.436342592592593 },
  { id: "a-x-k2", name: "A.X-K2", provider: "SK Telecom", openness: "开放权重", intelligence: 35.0147941618563, gdpval: 0.3047, tauBanking: 0.160824742268041, terminalBench: 0.389513108614232, sciCode: 0.385416666666667 },
  { id: "k-exaone-2-0-0803", name: "K-EXAONE 2.0 0803", provider: "LG AI Research", openness: "专有模型", intelligence: 30.9845435318094, gdpval: 0.23955, tauBanking: 0.115463917525773, terminalBench: 0.404494382022472, sciCode: 0.409722222222222 },
];

function asPercent(value) {
  return value === null || value === undefined ? null : Number((value * 100).toFixed(2));
}

function average(left, right) {
  return left === null || right === null ? null : Number(((left + right) / 2).toFixed(2));
}

function makeBenchmarkScores(item) {
  return Object.freeze({
    "intelligence-index": item.intelligence,
    "coding-index": average(asPercent(item.terminalBench), asPercent(item.sciCode)),
    "agentic-index": average(asPercent(item.gdpval), asPercent(item.tauBanking)),
  });
}

function makeModel(item) {
  const coding = average(asPercent(item.terminalBench), asPercent(item.sciCode));
  const agentic = average(asPercent(item.gdpval), asPercent(item.tauBanking));
  const sourceRefs = ["aa-models-2026-08-13", "aa-methodology-v4-1-1", "terminal-bench-v2-1", "scicode", "scicode-verified-2026", "gdpval-aa-v2", "tau3-banking"];
  return Object.freeze({
    id: item.id,
    shortName: item.shortName ?? item.name,
    name: item.name,
    provider: item.provider,
    family: item.provider,
    openness: item.openness,
    overall: item.intelligence,
    intelligence: item.intelligence,
    coding,
    agentic,
    finance: null,
    efficiency: null,
    tag: "来源快照",
    strengths: Object.freeze({
      "intelligence-index": "官方 v4.1.1",
      "coding-index": "终端 + 科学编程",
      "agentic-index": "自主执行 + 工具调用",
    }),
    evidence: sourceRefs.map((sourceRef) => sourceRegistry[sourceRef].label),
    sourceRefs,
    note: "Intelligence 与组件结果取自同一公开快照；两个 Composite 按显示组件重算，不等同于 Artificial Analysis 另行发布的同名字段。",
    componentScores: Object.freeze({
      "terminal-bench-v21": asPercent(item.terminalBench),
      scicode: asPercent(item.sciCode),
      "gdpval-aa-v2": asPercent(item.gdpval),
      "tau3-banking": asPercent(item.tauBanking),
    }),
    metrics: Object.freeze({
      intelligence: item.intelligence,
      overall: item.intelligence,
      coding,
      agentic,
      reasoning: null,
      finance: null,
      costEfficiency: null,
      latencyEfficiency: null,
      throughput: null,
      contextCapacity: null,
    }),
    benchmarkScores: makeBenchmarkScores(item),
  });
}

const currentModels = Object.freeze(modelDefinitions.map(makeModel));

export const modelRadarSnapshots = Object.freeze([
  Object.freeze({
    id: "artificial-analysis-2026-08-13",
    label: "2026-08-13",
    kind: "source",
    asOf: "2026-08-13",
    capturedAt: "2026-08-13T01:18:07Z",
    methodologyVersion: "v4.1.1",
    models: currentModels,
  }),
]);

export const modelRadarSources = sourceRegistry;

export const modelRadarBenchmarkScales = Object.freeze({
  "intelligence-index": Object.freeze({ min: 0, max: 100, unit: "指数分" }),
  "coding-index": Object.freeze({ min: 0, max: 100, unit: "50/50 组合分" }),
  "agentic-index": Object.freeze({ min: 0, max: 100, unit: "50/50 组合分" }),
});

export const modelRadarMetrics = Object.freeze({
  intelligence: Object.freeze({ label: "Intelligence Index", shortLabel: "智能" }),
  overall: Object.freeze({ label: "Intelligence Index", shortLabel: "智能" }),
  coding: Object.freeze({ label: "Coding Composite", shortLabel: "编程" }),
  agentic: Object.freeze({ label: "Agentic Composite", shortLabel: "Agentic" }),
});

export const modelRadarPolicy = Object.freeze({
  verifiedAt: "2026-08-13",
  cadence: "只保留仍能找到原始来源的快照",
  candidatePool: "本快照冻结 Artificial Analysis 公开模型页默认 Intelligence Index 视图在 2026-08-13 01:18:07 UTC 捕获的前 20 个模型配置；它不是该次抓取全部 604 个可用推理配置的全局 Top 20。",
  eligibility: "Intelligence Index 采用 Artificial Analysis v4.1.1 官方分数；两个 Composite 仅在两个组成 benchmark 都有同一模型快照结果时计算",
  score: "Intelligence Index 为官方分数；Coding Composite = (Terminal-Bench v2.1 + SciCode) / 2；Agentic Composite = (GDPval-AA v2 + τ³-Banking) / 2",
  confidence: "缺失证据显示为 —，不记零、不用同系列或相近版本代替；两个 50/50 Composite 是本页复算值，与 Artificial Analysis 另行发布的同名字段分开阅读",
  retention: "最近两周与最近三个月内能找到的原始快照；找不到就不补",
});

export const modelRadarBenchmarkSourceIds = Object.freeze([
  "intelligence-index",
  "coding-index",
  "agentic-index",
]);
