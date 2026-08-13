import {
  modelRadarBenchmarkSourceIds,
  modelRadarPolicy,
  modelRadarSnapshots,
} from "../../model-radar-data.mjs";

const evidenceLabels = Object.freeze({
  "aa-models-2026-08-13": "Artificial Analysis · Models",
  "aa-methodology-v4-1-1": "Artificial Analysis · Methodology",
  "terminal-bench-v2-1": "Terminal-Bench v2.1",
  scicode: "SciCode",
  "scicode-verified-2026": "SciCode-Verified · Audit",
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
      "intelligence-index": "Official v4.1.1 score",
      "coding-index": "Terminal + scientific coding",
      "agentic-index": "Autonomous execution + tool use",
    }),
    evidence: Object.freeze(model.sourceRefs.map((sourceRef) => {
      const label = evidenceLabels[sourceRef];
      if (!label) throw new Error(`Missing English model-radar evidence label: ${sourceRef}`);
      return label;
    })),
    note: "Intelligence and the components come from the same public snapshot. The two composites are recalculated from the displayed components and are distinct from the separately published Artificial Analysis Coding Index and Agentic Index fields.",
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
  "coding-index": Object.freeze({ min: 0, max: 100, unit: "50/50 composite points" }),
  "agentic-index": Object.freeze({ min: 0, max: 100, unit: "50/50 composite points" }),
});

export const englishModelRadarBenchmarkGuides = Object.freeze({
  "intelligence-index": Object.freeze({
    summary: "The official composite capability index across four categories.",
    what: "Artificial Analysis Intelligence Index v4.1.1 combines nine evaluations across Agents, Coding, Scientific Reasoning, and General at weights of 34%, 24%, 24%, and 18%.",
    usefulFor: "A quick view of relative position in a public composite suite and a starting point for selecting more specific benchmarks.",
    limitation: "Artificial Analysis Intelligence Index v4.1.1 changed the τ³-Banking implementation and several graders. Scores from v4.1.1 and earlier methodologies do not form a like-for-like trend line, and a public composite does not establish customer-task success, cost, latency, security, or a procurement conclusion.",
    readScore: "Confirm v4.1.1, the model version, and the snapshot date before treating a difference as meaningful; do not translate it directly into business ROI.",
  }),
  "coding-index": Object.freeze({
    summary: "A transparent fieldbook composite that weights terminal work and scientific coding equally.",
    what: "Coding Composite = (Terminal-Bench v2.1 + SciCode) / 2. The first measures multi-step work in a real terminal environment; the second measures code understanding, generation, and verification for scientific problems.",
    usefulFor: "A combined view of writing code and operating a development environment without treating algorithmic questions as all of software engineering.",
    limitation: "This page recalculates the displayed components instead of importing the separately published Artificial Analysis Coding Index field. A 2026 SciCode audit materially challenged the original benchmark's test specifications and scoring validity, so the result is provisional and does not measure performance in a customer's repository, harness, budget, or engineering process.",
    readScore: "Both components must come from the same model-version snapshot. If either is missing, no score is calculated or filled with zero; inspect SciCode's audit risk before comparing small gaps.",
  }),
  "agentic-index": Object.freeze({
    summary: "A transparent fieldbook composite that weights knowledge-work delivery and tool-mediated stateful tasks equally.",
    what: "Agentic Composite = (GDPval-AA v2 + τ³-Banking) / 2. The first measures complex knowledge-work deliverables; the second measures tool use, rule-following, and backend state changes.",
    usefulFor: "A signal for whether a model can plan, call tools, and move a multi-step task toward a verifiable result.",
    limitation: "This page's component average does not reproduce the Artificial Analysis Agentic Index score. In the 2026-08-13 v4.1.1 capture, that score did not equal the average of the displayed component fields. The public sources do not explain the discrepancy. Neither value replaces customer workflow, authorization, security, or human acceptance.",
    readScore: "Read the value only as an average of the two displayed public task slices. Inspect the method version, task configuration, review method, and exact model version before comparing ranks.",
  }),
});

export const englishModelRadarPolicy = Object.freeze({
  verifiedAt: modelRadarPolicy.verifiedAt,
  retention: "Keep only snapshots whose original source can still be located from the last two weeks or three months; do not reconstruct a missing snapshot",
  candidatePool: "This snapshot freezes the first 20 model configurations captured from the default Artificial Analysis Intelligence Index view at 2026-08-13 01:18:07 UTC. It is not a global top 20 across all 604 available inference configurations in that capture.",
  eligibility: "Intelligence uses the official Artificial Analysis v4.1.1 score. The two composites are calculated only when both component benchmarks have results for the same model snapshot.",
  score: "Intelligence is the official score. Coding Composite = (Terminal-Bench v2.1 + SciCode) / 2. Agentic Composite = (GDPval-AA v2 + τ³-Banking) / 2.",
  confidence: "Missing evidence displays as —. The page neither assigns zero nor substitutes a related model or version. The two 50/50 composites are page-level recalculations and must be read separately from the Artificial Analysis Coding Index and Agentic Index fields.",
});
