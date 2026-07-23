# English complete-edition Ultra adjudication

Review date: 2026-07-22
Review stage: post-remediation exception adjudication

## Final verdict

- **Local 21-module English integration: PASS.** The complete edition is structurally valid, the original B1–B6 content blockers are resolved, and no remaining content blocker was found in this adjudication.
- **Release candidate: PASS.** The content, shared-copy ownership, complete module-role coverage, English document language, interactive discovery experience, and structured four-stage review records satisfy the local release gates.
- **Public deployment: pending release workflow.** Git synchronization, exact-commit packaging, Sites deployment, and public-route verification are operational steps recorded after this adjudication; they do not change the content verdict.

This report is not evidence that Git push or Sites deployment has occurred. Those actions require their own exact-commit evidence.

## Reviewed scope

- Published English modules: 21/21.
- Sections: 122.
- Customer questions: 329.
- Evidence cards: 99.
- Unique English term IDs: 133.
- Unique English source IDs: 132.
- Shared-copy conflicts: 41 term IDs and 39 source IDs.
- Explicit conflict owners: 80.
- Direct source-copy overrides: 0.
- New direct or official source records reviewed for B2: 11.

The review covered the English editorial standard, all English module sidecars, the canonical Chinese content owners, publication and content registries, terminology and source ledgers, shared-copy policy, conflict report, runtime registry, and the original xhigh findings in `docs/ENGLISH-CONTENT-XHIGH-REVIEW.md`.

## B1 — Shared-copy conflicts: resolved

`app/i18n/en/shared-copy-policy.mjs` still exactly covers the live conflict set:

- 41 conflicting term IDs have one owner each.
- 39 conflicting source IDs have one owner each.
- Every owner module exists and contains the assigned ID.
- No mapping is stale.
- No ID has both an owner and an override.
- `englishSourceCopyOverrides` remains empty because an evidence-bounded module copy exists for every source conflict.

The runtime registry imports all 21 modules and applies this policy. Import succeeded with 130 merged terms, 132 merged sources, and 329 questions. It fails by design for a missing owner, invalid owner, stale mapping, or invalid override shape.

The high-risk choices remain appropriate: `security` owns identity and authorization, MCP security, zero trust, prompt-injection, and regulatory-scope copies; `prompt-engineering` owns model/tool interface copies that preserve application responsibility; `ai-agent` owns A2A/MCP architecture and ReAct copies that preserve protocol and benchmark boundaries; `model-landscape` owns dynamic model catalogs; and research-result owners retain experiment-specific non-extrapolation limits.

## B2 — Source entailment: resolved

All 16 original B2 anchors were reread against their current canonical evidence and the underlying primary or official source. The repair replaces title-level relevance with direct mechanism evidence and preserves non-extrapolation boundaries.

### AI Infrastructure Platform

- `kubernetes-versus-slurm` now uses the Slurm overview, Kueue all-or-nothing admission, Kueue fair sharing, and Kubernetes DRA for their respective responsibilities.
- `curriculum-scheduling` limits its claim to synchronized-job admission, quota, priority, preemption, topology, and request-shape fragmentation. It explicitly identifies `waitForPodsReady` as one Kueue implementation rather than a universal Kubernetes guarantee.
- `fifo-gpu-fairness` uses the Slurm multifactor-priority and Kueue fair-sharing documentation. The prose leaves the definition of business fairness and disruption cost to the organization.

### AI Compute Infrastructure

- `high-speed-interconnect`, `double-gpu-not-double-speed`, and `highest-network-not-required` now use Megatron 3D Parallelism and NCCL for composed parallelism, collective operations, cross-node communication, waiting, and diagnostics. No paper result is converted into a universal scaling or network-procurement promise.
- `rack-space-not-facility-ready` now uses the NVIDIA DGX H100 data-center design guide for power, cooling, airflow, cabling, safety, and cross-team facility planning. Its numbers remain explicitly product- and design-specific.

### LLM Training

- `gpu-scaling-efficiency` and `parallelism-strategy` now use Megatron and NCCL for data, tensor, and pipeline parallelism, collectives, cross-node communication, and pipeline bubbles. Reported throughput and scaling remain limited to the paper's configuration.
- `checkpoint-resume-different-result`, `loss-continuity-insufficient`, and `checkpoint-frequency` now use TorchSnapshot and CheckFreq. The copy distinguishes explicitly registered framework state from customer-specific data-cursor, topology, completion, and recovery requirements.

### LLM Inference

- `quantization-speed-quality` and `quantization-cost` now use GPTQ for one weight-quantization method on named model and hardware families. The copy rejects cross-model, kernel, hardware, task, and service-cost extrapolation.
- `speculative-decoding-default` now uses the original speculative-decoding paper. The 2x–3x result is retained only for the reported T5-XXL experiments with identical outputs; it is not a default production expectation.

### Evaluation

- `trace-to-release-gate` now says OpenTelemetry attributes can correlate component versions and help diagnose regression. Its boundary explicitly states that telemetry semantics do not provide evaluation thresholds or release policy.

The 11 added source records all resolve to HTTPS primary or official pages, carry `verifiedAt: "2026-07-22"`, and include scope or non-extrapolation boundaries:

- `megatron-3d-parallelism-2021`
- `torchsnapshot-checkpoint`
- `checkfreq-2021`
- `gptq-2023`
- `speculative-decoding-2023`
- `kueue-all-or-nothing`
- `kueue-fair-sharing`
- `slurm-overview`
- `slurm-multifactor-priority`
- `nccl-collectives`
- `nvidia-dgx-h100-data-center`

No source note was used to invent benchmark, facility, framework, or customer metadata.

## B3 — Governance accountability: resolved in both languages

The English and canonical Chinese answers now require an explicitly named accountable owner with authority to accept residual risk, restrict use, and stop operation. Both describe a business-use owner as a common operating pattern and state that the cited standards do not prescribe one universal organizational function for every governance model or jurisdiction.

The previous universal statement that the business owner is ultimately accountable is no longer present. The module `updatedAt` remains `2026-07-22`.

## B4 — Prompt cost acceptance parity: resolved

`prompt-engineering.qa[cost-beyond-caching].depth` now explicitly compares every candidate with the baseline on:

- success rate;
- P95 end-to-end latency;
- cost per successful task.

The English answer matches the canonical acceptance dimensions and states that a lower token bill is not an improvement when success falls or tail latency breaches the SLO. The provider-specific prompt-caching source is still bounded to documented cache behavior rather than presented as an end-to-end savings guarantee.

## B5 — MCP freshness: resolved

The three affected MCP fields now say “As of July 21, 2026,” matching `mcp-2026-07-28-rc.verifiedAt: "2026-07-21"`:

- the `mcp-protocol-model` section lead;
- the `mcp-rc-production-switch` answer;
- the `mcp-final-versus-rc` evidence finding.

They continue to separate the current 2025-11-25 final specification from the announced 2026-07-28 release candidate and require revalidation at final publication.

## B6 — American English: resolved and guarded

The reported British editorial forms were normalized in module prose. The deterministic gate now covers the relevant `labour`, `memorise`, `personalise`, `synchronise`, `synthesise`, `towards`, and `vectorise` families in addition to its prior rules. A focused scan found none of the original false-negative forms in the 21 serialized modules. Official source short titles remain excluded from editorial spelling normalization.

## Validation results

- `npm run audit:english:complete` — PASS for 21/21 modules.
- `npm run report:english-conflicts` — PASS; live set remains 41 term and 39 source conflicts.
- `npm run audit:english:reviews` — PASS; 84 schema-conformant records cover 21 modules across authoring, semantic, language, and exception-adjudication stages.
- Runtime import of `app/i18n/en/registry.mjs` — PASS; 21 modules, 133 terms, 132 sources, and 329 questions.
- `npm run lint` — PASS.
- Focused B2–B6 source, parity, date, spelling, and policy assertions — PASS.
- Live primary/official source review for the 11 B2 additions — PASS within the scope recorded above.

## Release workflow status

The former non-content blockers were resolved as follows:

1. English routes set the hydrated document root to `lang="en"` through the locale layout and restore the previous language when leaving the subtree.
2. The home page now provides full fieldbook search, module-layer filtering, mission-based paths, terminology, the 21-module map, and a localized dynamic knowledge explorer.
3. Every shared module exposes the full canonical role sequence, including decisions, deep dives, and cloud connections where previously absent.
4. Eighty-four stored review records are regenerated from current canonical and English content hashes and validated on every bilingual test run.
5. The remaining Git, release-check, and Sites steps are intentionally performed only against the final integrated commit.

The production preview also exposes an inherited Vinext 0.0.50 RSC prefetch console error on both Chinese and English routes. Direct rendering and navigation complete successfully, so this is recorded as a framework-wide maintenance item rather than an English-edition regression or content blocker.
