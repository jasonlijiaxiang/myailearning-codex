# English content xhigh cross-review

> Historical pre-remediation review. The blockers recorded below were subsequently remediated and re-adjudicated; use `ENGLISH-ULTRA-ADJUDICATION.md` for the current verdict.

Review date: 2026-07-22
Reviewer role: independent technical editor
Verdict: **BLOCK**

## Scope

All 21 English module sidecars were included in deterministic and cross-module checks. The review covered 122 sections, 329 customer questions, 99 evidence cards, 130 unique term IDs, and 121 unique source IDs.

The following high-risk modules received a field-level technical read in addition to the repository-wide checks:

- AI Agent
- Security
- AI Governance, Risk & Compliance
- AI Gateway
- Evaluation
- RAG
- AI Infrastructure Platform
- AI Compute Infrastructure
- LLM Training
- LLM Inference
- Prompt Engineering

MCP and A2A were also checked specifically for protocol, authentication, authorization, task-state, and business-outcome boundaries.

## Deterministic results

`npm run audit:english -- --require-all` passed for 21/21 modules. It confirmed:

- complete published-module coverage;
- canonical slugs and publication identities;
- question counts and order;
- evidence source-ID order for every question;
- evidence-card counts and source-ID order;
- `addedAt` parity;
- unique stable question, section, section-item, and evidence-card IDs;
- required terminology coverage and exact canonical English term names;
- source-ID resolution and localized-source field shape;
- no Chinese prose detected by the current gate.

`npm run report:english-conflicts` completed for 21 modules but reported **41 term-copy conflicts** and **39 source-copy conflicts**. These are not harmless while the runtime merge requires identical shared copies.

An independent numeric-scope comparison found one material loss: `prompt-engineering.qa[cost-beyond-caching].depth` omits the canonical requirement to compare success rate, P95, and cost per successful task after optimization. The other apparent numeric differences were translations rather than losses (`August 2026` and `24×7`).

The current American-English regex is incomplete. The deterministic command passes even though manual lexical checks still find British forms such as `memorise`, `synthesise`, `synchronisation`, `vectorisation`, `personalisation`, `vectorising`, `towards`, and `labour`.

## Release-blocking findings

### B1. Shared term and source copies cannot yet be merged safely

The conflict report found 41 shared term IDs and 39 shared source IDs with more than one English copy. A naive all-module registry merge will either throw or silently select inconsistent definitions, depending on implementation. Central resolution must produce one authoritative English definition and one authoritative English source note per shared ID; a contextual module can explain a local nuance in its body without redefining the shared record.

Exact conflict fields are `englishModule.terms.<termId>` and `englishModule.sources.<sourceId>` in the modules listed by `report:english-conflicts`. Required conflict families are listed in the next section.

### B2. Several infrastructure and training claims outrun their cited evidence

The prose is generally technically plausible, but the cited records do not directly entail several key claims. Generic risk frameworks, observability conventions, DRA documentation, FlashAttention, Chinchilla, and the vLLM PagedAttention paper cannot substitute for primary evidence about Slurm behavior, gang scheduling, distributed-training collectives, checkpoint completeness, facility engineering, quantization, or speculative decoding.

Release-blocking anchors:

- `ai-infra-platform.qa[kubernetes-versus-slurm].evidence`: neither `kubernetes-dra` nor `nvidia-gpu-operator` supports the Slurm comparison, gang scheduling, fairness, or checkpointing claims.
- `ai-infra-platform.sections[curriculum].blocks[0].items[curriculum-scheduling].sourceIds`: `kubernetes-dra` and `opentelemetry-semconv` do not establish gang-scheduling and queue-fragmentation behavior.
- `ai-infra-platform.qa[fifo-gpu-fairness].evidence`: DRA and generic telemetry semantics do not support the FIFO/fairness mechanism or recommended queue policy.
- `ai-infra-compute.qa[high-speed-interconnect].evidence`: Chinchilla and FlashAttention do not support cross-node tensor parallelism, collectives, topology, or effective-bandwidth claims.
- `ai-infra-compute.qa[double-gpu-not-double-speed].evidence` and `qa[highest-network-not-required].evidence`: OpenTelemetry conventions and Chinchilla do not establish AllReduce/All-to-All scaling behavior.
- `ai-infra-compute.qa[rack-space-not-facility-ready].evidence`: GPU Operator and the NIST GenAI Profile do not support specific power, cooling, fire-protection, thermal-density, or facility-acceptance guidance.
- `llm-training.qa[gpu-scaling-efficiency].evidence`: Chinchilla and FlashAttention do not establish distributed-training communication and straggler scaling.
- `llm-training.qa[checkpoint-resume-different-result].evidence`, `qa[loss-continuity-insufficient].evidence`, and `qa[checkpoint-frequency].evidence`: the cited risk framework and generic telemetry specification do not establish optimizer, scheduler, RNG, data-cursor, asynchronous-checkpoint, or recovery semantics.
- `llm-training.qa[parallelism-strategy].evidence`: FlashAttention and OpenTelemetry do not define data, tensor, and pipeline parallelism or their communication and pipeline-bubble trade-offs.
- `llm-inference.qa[quantization-speed-quality].evidence` and `qa[quantization-cost].evidence`: the vLLM PagedAttention paper is not quantization evidence; NIST only supports remeasurement after change.
- `llm-inference.qa[speculative-decoding-default].evidence`: neither the vLLM PagedAttention paper nor NIST establishes speculative-decoding mechanics or draft/target compatibility.
- `evaluation.evidenceCards[trace-to-release-gate]`: `opentelemetry-genai-semconv` supplies telemetry fields; it does not support the claim that component changes must trigger regression and hard release gates.

Resolution: add direct primary or official sources for each mechanism, or narrow the prose to the limited inference the existing source actually supports. The source note must state the boundary.

### B3. Governance assigns universal accountability more narrowly than its evidence supports

`ai-governance.qa[ai-risk-accountability-model].a` states that the business owner of the specific use is ultimately accountable. ISO/IEC 42001 and the NIST AI RMF support assigned roles, responsibilities, lifecycle risk management, and accountable ownership; the cited summaries do not prescribe one universal organizational function as the ultimate owner in every governance model or jurisdiction.

Resolution: require an explicitly named accountable owner with authority to accept residual risk, restrict use, and stop operation; present a business-use owner as a common operating pattern rather than a universal standards requirement.

### B4. Prompt Engineering loses a quantitative acceptance dimension

`prompt-engineering.qa[cost-beyond-caching].depth` preserves the cost components and regression requirement but drops the canonical comparison of success rate, **P95**, and cost per successful task. This is a second-order translation loss because a specific tail-latency acceptance dimension becomes an unstated general optimization goal.

Resolution: restore the three-way comparison explicitly, without broadening the provider-specific prompt-caching evidence into an end-to-end savings claim.

### B5. MCP advances the evidence date beyond the canonical source verification date

The following fields say “As of July 22, 2026,” while `reference-content.mjs` records `mcp-2026-07-28-rc.verifiedAt` as `2026-07-21`:

- `mcp.sections[mcp-protocol-model].lead`
- `mcp.qa[mcp-rc-production-switch].a`
- `mcp.evidenceCards[mcp-final-versus-rc].finding`

The final-versus-RC distinction is professionally correct, and the authorization boundary is strong. The freshness claim nevertheless must not be one day newer than its centrally recorded verification evidence.

Resolution: either reverify the official MCP pages and update the canonical ledger date, or retain the 2026-07-21 as-of boundary in the English copy.

### B6. The American-English gate has false negatives

The editorial standard requires American English, but the current audit does not detect several forms still present:

- `model-landscape.sections[study-guide].lead`: `memorise`
- `rag.sections[retrieval-variants].items[variant-agentic-rag].body`: `synthesise`
- multiple RAG fields: `synchronisation`, `vectorisation`, `personalisation`, `vectorising`, and `towards`
- `evaluation.qa[judge-replace-human].basis`: `division of labour`

Resolution: normalize editorial prose to American English and extend the gate so the same family cannot recur. Official source titles must remain unchanged.

## Conflict families requiring central resolution

The following families cover all high-impact conflicts reported by the deterministic conflict tool. The central registry should own the shared wording.

### Identity, security, and governance

- Terms: `identity-authorization`, `hitl`, `ai-risk-tiering`, `impact-assessment`, `governance-evidence`, `prompt-injection`, `data-lineage`, `deletion-propagation`, `dlp`.
- Sources: `nist-zero-trust`, `nist-genai-profile`, `mcp-authorization`, `mcp-security`, `owasp-prompt-injection`, `owasp-vector-weaknesses`, `eu-ai-act`, `china-ai-content-labeling`.

The canonical definitions must preserve the difference between authentication, protocol authorization, resource-side business authorization, approval, and outcome verification.

### Evaluation, observability, and release operations

- Terms: `evaluation`, `observability`, `golden-set`, `release-evaluation`, `ai-ops`, `model-lifecycle`, `shadow-traffic`, `capability-matrix`, `poc`, `sla`.
- Sources: `opentelemetry-genai-semconv`, `opentelemetry-semconv`, `openai-eval-best-practices`, `ragas`.

The shared copy must not make telemetry equivalent to evaluation, a framework equivalent to a release threshold, or shadow observation equivalent to side-effect isolation.

### Retrieval, document processing, and grounding

- Terms: `rag`, `retrieval`, `sparse-retrieval`, `dense-retrieval`, `bm25`, `ann`, `hnsw`, `grounding`, `generation`, `ocr`, `document-intelligence`.
- Sources: `dpr-2020`, `hnsw-2016`, `docling-report`, `pp-ocr-2020`, `colpali-2025`, `lost-middle`.

The shared copy should separate retrieval relevance, final-context coverage, faithful generation, factual authority, and document-structure recovery.

### Models, training, serving, and selection

- Terms: `llm`, `fine-tuning`, `access-spectrum`, `model-routing`, `feature-store`, `point-in-time-correctness`, `training-serving-skew`.
- Sources: `vllm-2023`, `instructgpt-2022`, `dpo-2023`, `deepseek-r1-2025`, `hf-trl-sft-trainer`, `hf-trl-data-formats`, `openai-models`, `anthropic-models`, `google-models`.

The shared copy must preserve experiment scope and distinguish a model mechanism, a framework capability, a current product catalog, and a customer deployment commitment.

### Economics and delivery

- Terms: `tco`, `finops`, `cost-allocation`, `cost-anomaly`.
- Sources: `finops-framework`, `finops-ai-overview`, `finops-ai-category`.

The canonical definitions should use cost per accepted business outcome without implying that a framework proves ROI or guaranteed savings.

### Agent and protocol interoperability

- Sources: `a2a-concepts`, `mcp-architecture`, `openai-function-calling`, `anthropic-effective-agents`, `anthropic-tool-search`, `react-2023`, `openapi-3-1-1`.

Contextual notes can differ in emphasis, but the central copy must preserve protocol scope: MCP capability exchange, A2A delegated-task exchange, model-proposed function calls, and application-owned authorization and execution are not interchangeable.

## Nonblocking editorial findings

- `Ask the customer:` prefixes 120 of 329 discovery questions (36.5%). The repetition is understandable during authoring but creates a template-generated voice. The UI already identifies the field as the next discovery question, so a final copy pass can usually remove the prefix.
- Several infrastructure phrases are accurate but sound translated or underspecified in native technical prose: `conforming result`, `useful job utilization`, and `delivery capacity`. Prefer an explicit measurable noun such as `accepted result`, `goodput`, `completed job`, or `capacity that meets the SLO`.
- Protocol modules capitalize `Tool`, `Server`, `Client`, `Task`, and `Artifact` more consistently than application modules. Keep specification-defined object names capitalized only when referring to the protocol object; use lowercase for generic tools, servers, tasks, and artifacts.
- Canonical term names are preserved, but combined labels such as `AI Application Engineering & GenAIOps` need one centrally approved definition because the current module copies emphasize different ownership boundaries.

## High-risk module conclusions

- **AI Agent — PASS after central copy resolution.** The module consistently separates model proposals from application authorization, external execution, postcondition verification, and business completion. Numeric benchmark claims are scoped to named experiments.
- **Security — PASS after central copy resolution.** Authentication, authorization, prompt-injection, resource-side enforcement, and model-versus-application responsibilities are correctly separated. Regulatory statements include role and legal-review boundaries.
- **AI Governance — REVISE.** The framework and certification boundaries are strong; the universal assignment of ultimate accountability requires narrowing.
- **AI Gateway — PASS after central copy resolution.** Routing, fallback, cache, gateway identity, and resource-side business authorization are correctly separated. No claim that one endpoint creates behavioral equivalence was found.
- **Evaluation — REVISE.** The evaluator hierarchy and RAG/agent diagnosis are strong; the OpenTelemetry evidence card and American-English wording require correction.
- **RAG — PASS after editorial normalization and central copy resolution.** Retrieval, context assembly, generation, access, freshness, and evidence authority are consistently separated; numerical evidence cards retain experiment scope.
- **AI Infrastructure Platform — BLOCK on evidence.** Several scheduler, Slurm, gang, fairness, and Goodput claims lack directly entailing sources.
- **AI Compute Infrastructure — BLOCK on evidence.** Several fabric, scaling, collective-communication, and facility claims rely on papers or frameworks that do not establish those mechanisms.
- **LLM Training — BLOCK on evidence.** Parallelism and checkpoint semantics require direct systems or framework sources.
- **LLM Inference — BLOCK on evidence.** Quantization and speculative-decoding claims require direct evidence distinct from PagedAttention.
- **Prompt Engineering — REVISE.** Model/application/tool authority boundaries are strong; restore the lost P95 acceptance dimension.
- **MCP and A2A — REVISE MCP freshness only.** Protocol, identity, authorization, task-state, cancellation, artifact, and business-outcome boundaries are otherwise strong.

## Verdict

**BLOCK for release and all-module registry integration.**

The English edition is structurally complete and substantially professional. It is not blocked by translation quality in the core Agent, Security, Gateway, RAG, or Prompt responsibility boundaries. It is blocked by unresolved shared-copy conflicts, several source-entailment gaps in infrastructure/training/inference, one governance overstatement, one quantitative scope loss, one MCP freshness mismatch, and an incomplete American-English gate.

After those items are corrected, rerun the complete deterministic audit and conflict report, then perform the planned highest-capability adjudication on the revised conflict families and source claims.
