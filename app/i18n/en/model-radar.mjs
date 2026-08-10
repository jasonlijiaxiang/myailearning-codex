import {
  modelRadarBenchmarkSourceIds,
  modelRadarPolicy,
  modelRadarSnapshots,
} from "../../model-radar-data.mjs";

const evidenceLabels = Object.freeze({
  "aa-models-2026-08-02": "Artificial Analysis · Models",
  "aa-methodology-v4-1": "Artificial Analysis · Methodology",
  "terminal-bench-v2-1": "Terminal-Bench 2.1",
  scicode: "SciCode",
  "gdpval-aa-v2": "GDPval-AA v2",
  "tau3-banking": "τ³-Banking",
});

const openness = Object.freeze({
  "专有模型": "Proprietary",
  "开放权重": "Open-weight",
});

function localizeModel(model) {
  const localizedOpenness = openness[model.openness];
  if (!localizedOpenness) throw new Error(`Missing English openness label: ${model.openness}`);
  return Object.freeze({
    ...model,
    openness: localizedOpenness,
    tag: "Source snapshot",
    strengths: Object.freeze({
      "intelligence-index": "Official v4.1 score",
      "coding-index": "Terminal + scientific coding",
      "agentic-index": "Autonomous execution + tool use",
    }),
    evidence: Object.freeze(model.sourceRefs.map((sourceRef) => {
      const label = evidenceLabels[sourceRef];
      if (!label) throw new Error(`Missing English model-radar evidence label: ${sourceRef}`);
      return label;
    })),
    note: "Model versions and component results come from the same public snapshot. The page neither joins scores across versions nor treats missing values as zero.",
  });
}

export const englishModelRadarSnapshots = Object.freeze(modelRadarSnapshots.map((snapshot) => Object.freeze({
  ...snapshot,
  kind: "source snapshot",
  models: Object.freeze(snapshot.models.map(localizeModel)),
})));

export const englishModelRadarBenchmarkSourceIds = modelRadarBenchmarkSourceIds;

export const englishModelRadarBenchmarkScales = Object.freeze({
  "intelligence-index": Object.freeze({ min: 0, max: 100, unit: "index points" }),
  "coding-index": Object.freeze({ min: 0, max: 100, unit: "50/50 index points" }),
  "agentic-index": Object.freeze({ min: 0, max: 100, unit: "50/50 index points" }),
});

export const englishModelRadarBenchmarkGuides = Object.freeze({
  "intelligence-index": Object.freeze({
    summary: "The official composite capability index across four domains.",
    what: "Artificial Analysis Intelligence Index v4.1 combines agentic tasks, coding, scientific reasoning, and general knowledge with long-context evaluation at weights of 34%, 24%, 24%, and 18%.",
    usefulFor: "A quick view of relative position in a public composite suite and a starting point for selecting more specific benchmarks.",
    limitation: "A composite public-evaluation signal does not establish customer-task success, cost, latency, security, or a procurement conclusion.",
    readScore: "Confirm v4.1, the model version, and the snapshot date before reading the difference as meaningful; do not translate it directly into business ROI.",
  }),
  "coding-index": Object.freeze({
    summary: "A transparent project index that weights terminal work and scientific coding equally.",
    what: "Coding Index = (Terminal-Bench 2.1 + SciCode) / 2. The first measures multi-step work in a real terminal environment; the second measures code understanding, generation, and verification for scientific problems.",
    usefulFor: "A combined view of writing code and operating a development environment without treating algorithmic questions as all of software engineering.",
    limitation: "This is a transparent project index, not an official Artificial Analysis Coding Index. It does not represent a customer repository, harness, budget, or engineering process in production.",
    readScore: "Both components must come from the same model-version snapshot. If either component is missing, no score is calculated or filled with zero.",
  }),
  "agentic-index": Object.freeze({
    summary: "A transparent project index that weights knowledge-work delivery and tool-mediated stateful tasks equally.",
    what: "Agentic Index = (GDPval-AA v2 + τ³-Banking) / 2. The first measures complex knowledge-work deliverables; the second measures tool use, rule-following, and backend state changes.",
    usefulFor: "A signal for whether a model can plan, call tools, and move a multi-step task toward a verifiable result.",
    limitation: "This is a transparent project index, not an official Artificial Analysis Agentic Index. It does not replace customer workflow, authorization, security, or human acceptance.",
    readScore: "Read the value as an average across two public task slices. Inspect the task configuration, review method, and exact model version before comparing ranks.",
  }),
});

export const englishModelRadarPolicy = Object.freeze({
  verifiedAt: modelRadarPolicy.verifiedAt,
  retention: "Keep only snapshots whose original source can still be located from the last two weeks or three months; do not reconstruct a missing snapshot.",
  candidatePool: "This snapshot uses the top 20 models in the Artificial Analysis public Intelligence Index v4.1. The three indices share that candidate pool so the comparison covers the same model versions.",
  eligibility: "Intelligence uses the official Artificial Analysis v4.1 score. Coding and Agentic are calculated only when both component benchmarks have results for the same model snapshot.",
  score: "Intelligence is the official score. Coding = (Terminal-Bench 2.1 + SciCode) / 2. Agentic = (GDPval-AA v2 + τ³-Banking) / 2.",
  confidence: "Missing evidence displays as —. The page neither assigns zero nor substitutes a related model or version. The two 50/50 values are project indices, not official Artificial Analysis indices of the same name.",
});
