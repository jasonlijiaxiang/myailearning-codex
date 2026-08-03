/*
 * Model Radar data contract.
 *
 * The snapshot below is transcribed from Artificial Analysis' public model
 * page. The three displayed indices deliberately keep their provenance
 * separate: Intelligence is the official AA v4.1 score; Coding and Agentic
 * are project indices calculated from the official component values using the
 * 50/50 formulas shown in the page.
 *
 * Missing values stay null. No model is promoted into an index by copying a
 * neighbour, treating an unavailable result as zero, or joining versions.
 */

const sourceRegistry = Object.freeze({
  "aa-models-2026-08-02": Object.freeze({
    sourceId: "artificial-analysis-models",
    label: "Artificial Analysis · Models",
    asOf: "2026-08-02",
    version: "公开模型页 · Intelligence Index v4.1",
  }),
  "aa-methodology-v4-1": Object.freeze({
    sourceId: "artificial-analysis-methodology",
    label: "Artificial Analysis · Methodology",
    asOf: "2026-08-02",
    version: "Intelligence Index v4.1",
  }),
  "terminal-bench-v2-1": Object.freeze({
    sourceId: "terminal-bench-v21",
    label: "Terminal-Bench 2.1",
    asOf: "2026-08-02",
    version: "2.1",
  }),
  scicode: Object.freeze({
    sourceId: "scicode",
    label: "SciCode",
    asOf: "2026-08-02",
    version: "官方公开结果 · 当前快照",
  }),
  "gdpval-aa-v2": Object.freeze({
    sourceId: "gdpval-aa-v2",
    label: "GDPval-AA v2",
    asOf: "2026-08-02",
    version: "GDPval-AA v2",
  }),
  "tau3-banking": Object.freeze({
    sourceId: "tau3-banking",
    label: "τ³-Banking",
    asOf: "2026-08-02",
    version: "τ³-Banking",
  }),
});

const modelDefinitions = [
  { id: "claude-opus-5", name: "Claude Opus 5 (max)", provider: "Anthropic", openness: "专有模型", intelligence: 60.6918740157091, gdpval: 0.6789, tauBanking: 0.303092783505155, terminalBench: 0.891385767790262, sciCode: 0.556712962962963 },
  { id: "claude-fable-5", name: "Claude Fable 5 (with fallback)", provider: "Anthropic", openness: "专有模型", intelligence: 59.8606463217303, gdpval: 0.622035, tauBanking: 0.268041237113402, terminalBench: 0.846441947565543, sciCode: 0.601851851851852 },
  { id: "gpt-5-6-sol", name: "GPT-5.6 Sol (max)", provider: "OpenAI", openness: "专有模型", intelligence: 58.889831189723, gdpval: 0.61625, tauBanking: 0.329896907216495, terminalBench: 0.880149812734082, sciCode: 0.561342592592593 },
  { id: "kimi-k3", name: "Kimi K3 (max)", provider: "Kimi", openness: "专有模型", intelligence: 57.1123394372091, gdpval: 0.593715, tauBanking: 0.334020618556701, terminalBench: 0.850187265917603, sciCode: 0.586805555555556 },
  { id: "gpt-5-6-terra", name: "GPT-5.6 Terra (max)", provider: "OpenAI", openness: "专有模型", intelligence: 54.9528567569231, gdpval: 0.54135, tauBanking: 0.317525773195876, terminalBench: 0.880149812734082, sciCode: 0.539351851851852 },
  { id: "grok-4-5", name: "Grok 4.5 (high)", provider: "SpaceXAI", openness: "专有模型", intelligence: 53.8265951657731, gdpval: 0.5139400000000001, tauBanking: 0.325773195876289, terminalBench: 0.816479400749064, sciCode: 0.540509259259259 },
  { id: "claude-sonnet-5", name: "Claude Sonnet 5 (max)", provider: "Anthropic", openness: "专有模型", intelligence: 53.3500026989169, gdpval: 0.54996, tauBanking: 0.282474226804124, terminalBench: 0.805243445692884, sciCode: 0.53587962962963 },
  { id: "gpt-5-6-luna", name: "GPT-5.6 Luna (max)", provider: "OpenAI", openness: "专有模型", intelligence: 51.2359331798034, gdpval: 0.5409700000000001, tauBanking: 0.272164948453608, terminalBench: 0.808988764044944, sciCode: 0.525462962962963 },
  { id: "glm-5-2", name: "GLM-5.2 (max)", provider: "Z AI", openness: "专有模型", intelligence: 51.0858347714416, gdpval: 0.5049750000000001, tauBanking: 0.268041237113402, terminalBench: 0.779026217228464, sciCode: 0.50462962962963 },
  { id: "muse-spark-1-1", name: "Muse Spark 1.1 (xhigh)", provider: "Meta", openness: "专有模型", intelligence: 50.6229899483333, gdpval: 0.43753, tauBanking: 0.251546391752577, terminalBench: 0.779026217228464, sciCode: 0.582175925925926 },
  { id: "gemini-3-6-flash", name: "Gemini 3.6 Flash", provider: "Google", openness: "专有模型", intelligence: 50.0675324362393, gdpval: 0.461515, tauBanking: 0.245360824742268, terminalBench: 0.775280898876405, sciCode: 0.52662037037037 },
  { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash 0731 (max)", provider: "DeepSeek", openness: "开放权重", intelligence: 49.9276679335021, gdpval: 0.5293049999999999, tauBanking: 0.311340206185567, terminalBench: 0.786516853932584, sciCode: 0.498842592592593 },
  { id: "qwen3-7-max", name: "Qwen3.7 Max", provider: "Alibaba", openness: "专有模型", intelligence: 45.9937184770221, gdpval: 0.38518499999999994, tauBanking: 0.109278350515464, terminalBench: 0.745318352059925, sciCode: 0.488425925925926 },
  { id: "minimax-m3", name: "MiniMax-M3", provider: "MiniMax", openness: "开放权重", intelligence: 44.4372686326056, gdpval: 0.44503, tauBanking: 0.129896907216495, terminalBench: 0.651685393258427, sciCode: 0.453703703703704 },
  { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro (max)", provider: "DeepSeek", openness: "开放权重", intelligence: 44.2735554261611, gdpval: 0.402245, tauBanking: 0.257731958762887, terminalBench: 0.640449438202247, sciCode: 0.5 },
  { id: "mimo-v2-5-pro", name: "MiMo-V2.5-Pro", provider: "Xiaomi", openness: "开放权重", intelligence: 42.2394366693508, gdpval: 0.38223, tauBanking: 0.0865979381443299, terminalBench: 0.651685393258427, sciCode: 0.502314814814815 },
  { id: "inkling", name: "Inkling (xhigh)", provider: "Thinking Machines", openness: "专有模型", intelligence: 40.736927521956, gdpval: 0.368375, tauBanking: 0.237113402061856, terminalBench: 0.550561797752809, sciCode: 0.460648148148148 },
  { id: "nemotron-3-ultra", name: "Nemotron 3 Ultra", provider: "NVIDIA", openness: "开放权重", intelligence: 37.7619546243905, gdpval: 0.33098, tauBanking: 0.138144329896907, terminalBench: 0.539325842696629, sciCode: 0.399305555555556 },
  { id: "gemini-3-5-flash-lite", name: "Gemini 3.5 Flash-Lite", provider: "Google", openness: "专有模型", intelligence: 36.4776366072529, gdpval: 0.319025, tauBanking: 0.164948453608247, terminalBench: 0.535580524344569, sciCode: 0.408564814814815 },
  { id: "mistral-medium-3-5", name: "Mistral Medium 3.5", provider: "Mistral", openness: "专有模型", intelligence: 29.947307563003, gdpval: 0.21596499999999996, tauBanking: 0.144329896907216, terminalBench: 0.50561797752809, sciCode: 0.395833333333333 },
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
  const sourceRefs = ["aa-models-2026-08-02", "aa-methodology-v4-1", "terminal-bench-v2-1", "scicode", "gdpval-aa-v2", "tau3-banking"];
  return Object.freeze({
    id: item.id,
    shortName: item.name,
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
    tag: "官方快照",
    strengths: Object.freeze({
      "intelligence-index": "官方 v4.1",
      "coding-index": "终端 + 科学编程",
      "agentic-index": "自主执行 + 工具调用",
    }),
    evidence: sourceRefs.map((sourceRef) => sourceRegistry[sourceRef].label),
    sourceRefs,
    note: "模型版本与组件结果取自同一公开快照；不跨版本拼接，不把缺失值当作零。",
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
    id: "artificial-analysis-2026-08-02",
    label: "2026-08-02",
    kind: "source",
    asOf: "2026-08-02",
    models: currentModels,
  }),
]);

export const modelRadarSources = sourceRegistry;

export const modelRadarBenchmarkScales = Object.freeze({
  "intelligence-index": Object.freeze({ min: 0, max: 100, unit: "指数分" }),
  "coding-index": Object.freeze({ min: 0, max: 100, unit: "50/50 指数分" }),
  "agentic-index": Object.freeze({ min: 0, max: 100, unit: "50/50 指数分" }),
});

export const modelRadarMetrics = Object.freeze({
  intelligence: Object.freeze({ label: "Intelligence Index", shortLabel: "智能" }),
  overall: Object.freeze({ label: "Intelligence Index", shortLabel: "智能" }),
  coding: Object.freeze({ label: "Coding Index", shortLabel: "编程" }),
  agentic: Object.freeze({ label: "Agentic Index", shortLabel: "Agentic" }),
});

export const modelRadarPolicy = Object.freeze({
  verifiedAt: "2026-08-02",
  cadence: "只保留仍能找到原始来源的快照",
  candidatePool: "当前快照取 Artificial Analysis 公开模型页的 Intelligence Index v4.1 前 20 个模型；三项指数共享候选池，保证横向比较的是同一组模型版本",
  eligibility: "Intelligence Index 采用 Artificial Analysis v4.1 官方分数；Coding 与 Agentic 仅在两个组成 benchmark 都有同一模型快照结果时计算",
  score: "Intelligence Index 为官方分数；Coding = (Terminal-Bench 2.1 + SciCode) / 2；Agentic = (GDPval-AA v2 + τ³-Banking) / 2",
  confidence: "缺失证据显示为 —，不记零、不用同系列或相近版本代替；50/50 两项为本项目指数，不称为 Artificial Analysis 官方同名指数",
  retention: "最近两周与最近三个月内能找到的原始快照；找不到就不补",
});

export const modelRadarBenchmarkSourceIds = Object.freeze([
  "intelligence-index",
  "coding-index",
  "agentic-index",
]);
