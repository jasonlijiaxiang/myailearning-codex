const freeze = Object.freeze;
const items = (values) => freeze(values.map((value) => freeze(value)));
const block = (type, title, values, extra = {}) => freeze({ type, title, ...extra, items: items(values) });
const section = (id, eyebrow, title, lead, blocks) => freeze({ id, eyebrow, title, lead, blocks: freeze(blocks) });
const question = (id, copy) => freeze({ id, ...copy, evidence: items(copy.evidence) });

export const englishModule = freeze({
  slug: "evaluation",
  title: "Evaluation",
  subtitle: "Define the decision, freeze the measuring system, and report evidence that can change an action",
  definition: "Evaluation binds a versioned system under test to a target population and task set, valid graders, repeated trials, a baseline, uncertainty, and decision rules. Its purpose is not to manufacture a score; it is to support screening, acceptance, diagnosis, and an accountable release recommendation.",
  position: "Evaluation owns the measuring contract, governed cases and slices, grader validity, uncertainty, results, and recommendation. AI Ops owns automation, staged traffic, alerts, stop, rollback, and recovery; Governance owns risk exceptions; Security owns adversarial testing and controls; component owners repair the mechanism that failed.",
  relatedSlugs: freeze(["rag", "ai-agent", "prompt-engineering", "fine-tuning", "security", "ai-ops"]),
  sections: freeze([
    section(
      "evaluation-flywheel",
      "REFUND AGENT CASE",
      "Start with the decision the evidence must support",
      "A candidate agent explains policy, reads an order, and may submit a refund. The prose has many acceptable forms, but authorization and the final refund state are verifiable. The evaluation must decide whether the complete candidate is acceptable for a limited operational handoff.",
      [
        block("steps", "A decision-first evaluation", [
          { id: "refund-decision-estimand", title: "State the decision and estimand", body: "Specify screening, acceptance, release recommendation, or diagnosis; identify the target users and tasks; distinguish performance on this fixed case set from a claim about similar future cases.", decision: "Write the action that Pass, Fail, or Uncertain will trigger.", boundary: "A score without a decision and population has no stable operational meaning." },
          { id: "refund-freeze-unit", title: "Freeze the unit under test", body: "Record the agent, model, prompt, tools, policies, retrieval, data, environment, budget, grader, and baseline versions.", decision: "Compare complete candidate tuples under the same conditions.", boundary: "A model name, endpoint alias, or code commit alone cannot identify application behavior." },
          { id: "refund-sample-slice", title: "Sample the work and its risks", body: "Cover normal requests, policy edges, unauthorized attempts, tool failure, high-value refunds, languages, and historical incidents.", decision: "Keep critical slices and non-compensable failures visible outside the aggregate.", boundary: "More cases do not repair biased sampling or incorrect expected behavior." },
          { id: "refund-grade-validly", title: "Assign valid graders", body: "Use code for authorization and authoritative refund state, a calibrated judge for open explanations, and people for rubric ownership, disputes, and high-impact cases.", decision: "Version and test the measuring system as carefully as the candidate.", boundary: "A judge rationale is not business truth, and a person is not automatically consistent." },
          { id: "refund-repeat-decide", title: "Repeat, quantify, and decide", body: "Run comparable trials, retain per-case results, report critical slices, severe-failure frequency, sample size, and uncertainty, then apply hard gates.", decision: "Produce Go, Hold, No-Go, or a request for more evidence.", boundary: "The best run and one average cannot authorize release." },
          { id: "refund-handoff", title: "Hand evidence to the responsible owners", body: "Evaluation transfers the result contract and unresolved failures to AI Ops, Governance, Security, and component owners.", decision: "Keep measurement advice distinct from exception approval and traffic execution.", boundary: "Evaluation does not approve its own risk exception or perform rollout and rollback." },
        ]),
        block("boundary", "Critical boundary", [
          { id: "evaluation-critical-boundary", title: "A score is meaningful only with its contract", body: "Version, population, tasks, graders, trials, slices, uncertainty, and decision rules determine what a result can support.", boundary: "An aggregate cannot compensate for unauthorized action, sensitive-data exposure, an incorrect business state, or another non-compensable failure." },
        ]),
      ],
    ),
    section(
      "evaluation-curriculum",
      "EVALUATION MATRIX",
      "Locate every claim by object and lifecycle",
      "Two axes reconcile local diagnosis with end-to-end evidence. The object axis asks what is being measured; the lifecycle axis asks where the evidence came from.",
      [
        block("table", "Object × lifecycle", [
          { id: "matrix-model", title: "Model", cells: freeze(["General capability and benchmark assumptions", "Customer-task behavior under fixed application conditions", "Version drift and observed call behavior"]) },
          { id: "matrix-component", title: "Component", cells: freeze(["Retriever, judge, or tool-specific tests", "Independent regression and fault localization", "Dependency change, failure, and runtime distribution"]) },
          { id: "matrix-application", title: "Application or workflow", cells: freeze(["Usually limited evidence", "End-to-end task, permission, cost, and authoritative final state", "Real interaction, side effects, and emergent failure"]) },
          { id: "matrix-business", title: "Business outcome", cells: freeze(["Cannot be established", "Baseline, acceptance threshold, and expected effect", "Actual value, harm, workload, and unintended consequence"]) },
        ], { columns: freeze(["Benchmark or screening", "Offline acceptance", "Deployed operation"]) }),
        block("cards", "Interpretation rules", [
          { id: "matrix-local-diagnostic", title: "Local evidence diagnoses", body: "Component scores help explain where a failure begins.", decision: "Do not let a strong local metric replace end-to-end acceptance." },
          { id: "matrix-stage-boundary", title: "Lifecycle evidence does not substitute across stages", body: "Controlled tests support comparison; deployed monitoring reveals live distribution and consequence.", decision: "State the stage with every claim.", boundary: "Predeployment success cannot prove that production will remain effective." },
          { id: "matrix-editorial-synthesis", title: "The matrix is a decision framework", body: "It organizes evidence responsibilities for this knowledge base.", decision: "Use it to ask what is missing, not to claim an external certification standard." },
        ]),
      ],
    ),
    section(
      "evaluation-decisions",
      "EVALUATION CONTRACT",
      "Make the measuring system replayable before running it",
      "A reviewer who did not build the candidate should be able to reconstruct what was tested, what the result means, and what each outcome requires next.",
      [
        block("steps", "Five contract elements", [
          { id: "contract-decision-unit", title: "Decision, unit, and baseline", body: "Declare the intended decision and freeze the candidate and current baseline across model, prompt, retrieval, tools, policy, data, environment, and budget.", decision: "Treat the evaluated-version tuple as an input to the AI release manifest.", boundary: "It is not the complete operational release package." },
          { id: "contract-population-estimand", title: "Population, tasks, and estimand", body: "State who and what the cases represent, the time boundary, and whether the result describes the fixed cases or generalizes to a similar task population.", decision: "Publish sampling and generalization assumptions.", boundary: "Benchmark Accuracy and Generalized Accuracy answer different questions." },
          { id: "contract-graders-truth", title: "Graders, rubric, and truth", body: "Assign code, judge, or human responsibility by dimension; retain rubric, examples, grader versions, calibration, and adjudication.", decision: "Prefer authoritative postconditions where available.", boundary: "Neither a judge nor reviewer opinion automatically becomes system-of-record truth." },
          { id: "contract-trials-uncertainty", title: "Trials, slices, and uncertainty", body: "Retain per-case output, severe failures, critical slices, repeated-run distribution, sample size, and uncertainty suitable for the estimand.", decision: "Apply non-compensable gates before trading quality against latency or cost.", boundary: "Statistics cannot repair wrong labels, selection bias, or a missing risk requirement." },
          { id: "contract-rule-handoff", title: "Decision rule and owner handoff", body: "Predefine what Pass, Fail, and Uncertain mean and retain unresolved failures, recommendation, and owner.", decision: "Evaluation recommends; AI Ops executes traffic; Governance handles exceptions; component owners remediate.", boundary: "Telemetry availability is not a quality gate or business outcome." },
        ]),
      ],
    ),
    section(
      "evaluation-study-guide",
      "MEASURING METHOD",
      "Build cases, graders, and uncertainty around the claim",
      "The evaluation set is a governed measurement asset, not an ever-growing folder of prompts.",
      [
        block("cards", "Dataset roles", [
          { id: "dataset-development", title: "Development set", body: "Supports rapid error analysis and iteration and is expected to influence the design.", decision: "Do not present it as unseen evidence." },
          { id: "dataset-regression", title: "Frozen regression set", body: "Protects known capability and confirmed production failures under a versioned contract.", decision: "Adjudicate every promoted case and compare candidates on the same release." },
          { id: "dataset-holdout", title: "Blind holdout", body: "Checks whether improvement transfers beyond the cases used for tuning.", decision: "Restrict exposure and rotate deliberately.", boundary: "Production failure intake must not silently contaminate the active holdout." },
        ]),
        block("cards", "Practice labs", [
          { id: "lab-refund-agent-contract", title: "Evaluate a refund agent", body: "Freeze the candidate tuple; stratify normal, boundary, unauthorized, tool-failure, and high-value tasks; use code for permissions and final state, a calibrated judge for explanation, and people for disputes; repeat trials and apply hard gates.", decision: "Deliverable: evaluation contract, per-slice results, uncertainty, and Go/Hold/No-Go recommendation.", boundary: "Acceptance: no average hides an unauthorized or incorrect refund, and the lab does not claim to execute rollout.", sourceIds: freeze(["anthropic-agent-evals", "llm-as-judge-2023", "nist-ai-800-3"]) },
          { id: "lab-score-change", title: "Diagnose a score change", body: "Separate changes to candidate behavior, sample composition, rubric, judge, runtime, and live population. Inspect critical slices and ask whether the difference exceeds natural variation.", decision: "Deliverable: attribution tree and a repair, accept, reject, or collect-more-evidence recommendation.", boundary: "Acceptance: telemetry helps attribution but is not presented as the release threshold.", sourceIds: freeze(["nist-ai-800-3", "nist-ai-800-4", "opentelemetry-genai-semconv"]) },
        ]),
      ],
    ),
    section(
      "evaluation-result-contract",
      "DECISION EVIDENCE",
      "Hand measurement evidence to release operations",
      "Evaluation owns validity and the recommendation. AI Ops owns the complete manifest, gate automation, staged traffic, stop conditions, rollback, and recovery.",
      [
        block("cards", "The result contract", [
          { id: "result-version-tuple", title: "Evaluated-version tuple", body: "Record candidate and baseline model, prompt, retrieval, tool, policy, data, environment, grader, and budget versions needed to interpret the result.", boundary: "This tuple is an input to, not a replacement for, the AI Ops release manifest." },
          { id: "result-slice-uncertainty", title: "Cases, slices, and uncertainty", body: "Retain per-case outcomes, critical slices, severe-failure frequency, sample size, repeated-run distribution, and assumptions.", boundary: "Selected examples and a single total cannot support the recommendation." },
          { id: "result-hard-gates", title: "Hard gates and trade-offs", body: "Separate non-compensable failures from quality, latency, cost, and review-load trade-offs among candidates that passed.", boundary: "Economic or quality gains do not cancel unauthorized action or critical-task failure." },
          { id: "result-unresolved-recommendation", title: "Unresolved failures and recommendation", body: "List failed or uncertain items, responsible owner, proposed remediation, and Go, Hold, No-Go, or evidence-needed advice.", boundary: "Evaluation records residual uncertainty; it does not approve the exception." },
          { id: "result-online-handoff", title: "Online measurement handoff", body: "Define authoritative outcomes, protected slices, sampling and adjudication requirements that production evidence should support.", boundary: "AI Ops controls traffic, monitoring, stop, rollback, incident handling, and recovery." },
        ]),
      ],
    ),
    section(
      "evaluation-cloud",
      "CLOUD AND OPERATING RESPONSIBILITIES",
      "Automate runs without automating judgment",
      "Platforms can store cases, run graders, correlate versions, and collect production signals. The customer still owns valid tasks, authoritative truth, risk tolerance, and accountability.",
      [
        block("table", "Four operating stages", [
          { id: "cloud-datasets-experiments", title: "Datasets and experiments", cells: freeze(["Object storage, warehouse, case management, experiment tracking, and version control", "Separate development, frozen regression, and blind holdout assets with provenance and access.", "Who supplies truth, who adjudicates, and which cases must never enter training?"]) },
          { id: "cloud-offline-evaluation", title: "Offline evaluation", cells: freeze(["Batch execution, managed evaluation, judge services, and RAG or agent evaluation frameworks", "Compare complete candidates under one contract and retain per-case and slice evidence.", "Which claims use code, a calibrated judge, or people, and how many repeated trials are justified?"]) },
          { id: "cloud-decision-interface", title: "Decision interface", cells: freeze(["Reports, policy rules, model registry, and accountable decision records", "Transfer Go, Hold, No-Go, or evidence-needed advice and unresolved failures.", "Which gates are non-compensable, who executes release, and who may accept an exception?"]) },
          { id: "cloud-production-monitoring", title: "Deployed monitoring", cells: freeze(["Tracing, logs, metrics, sampled review, A/B tests, alerts, business outcomes, and FinOps", "Let AI Ops expose new populations and failures for Evaluation to adjudicate.", "What is the authoritative outcome, how is telemetry minimized, and which signals are only investigative rather than labels?"]) },
        ], { columns: freeze(["Capabilities", "Value", "Discovery question"]) }),
      ],
    ),
  ]),
  qa: items([
    question("benchmark-versus-customer-evaluation", {
      q: "Why run customer evaluation when a model ranks highly on public benchmarks?",
      a: "A benchmark measures a defined dataset and protocol. The customer needs evidence about its own language, work, tools, risks, costs, and complete application.",
      depth: "Use relevant benchmarks to narrow candidates and document their task, version, protocol, and assumptions. Then compare complete candidates under the same customer tasks, environment, budget, baseline, and hard gates. Also state whether the reported number describes the fixed benchmark cases or is being generalized to similar future cases.",
      ask: "Which tasks represent customer value, which errors are non-compensable, and what population must the result support?",
      tag: "Model selection",
      basis: "Estimand plus contextual acceptance",
      evidence: [
        { sourceId: "nist-ai-800-3", supports: "Distinguishes accuracy on a fixed benchmark from generalization to a similar task population and requires assumptions and uncertainty to be explicit." },
        { sourceId: "nist-genai-profile", supports: "Supports measurement tied to context of use, affected parties, and organizational risk tolerance." },
      ],
    }),
    question("judge-replace-human", {
      q: "Can LLM-as-a-Judge replace people completely?",
      a: "No. A judge can scale open-ended review, but people still own the rubric, calibration, disputes, high-impact cases, and the connection to business truth.",
      depth: "Calibrate against independently reviewed cases; swap answer order, perturb verbosity, sample across model families, and measure disagreement. Version judge model, prompt, rubric, and configuration together. Use code rather than a judge for schema, permission, and authoritative business postconditions.",
      ask: "Which dimensions are subjective, which have an authoritative state, and who adjudicates disagreement?",
      tag: "Evaluation method",
      basis: "Grader validation and responsibility",
      evidence: [
        { sourceId: "llm-as-judge-2023", supports: "Documents model-judge biases such as position and verbosity effects and supports calibration rather than automatic truth." },
        { sourceId: "nist-genai-profile", supports: "Supports combining automated measurement, domain expertise, and accountable human oversight." },
      ],
    }),
    question("rag-retrieval-versus-generation", {
      q: "When a RAG answer is wrong, how do we tell retrieval failure from generation failure?",
      a: "First ask whether the necessary evidence existed, was retrieved, ranked, and admitted to context; then ask whether the response used it faithfully and cited or declined correctly.",
      depth: "Measure candidate recall and precision separately from grounded answer behavior. Changing the generator rarely repairs missing evidence, while increasing Top-K can worsen distraction and cost. Keep retrieval and generation diagnostics even when the release decision uses an end-to-end task outcome.",
      ask: "Did the correct evidence exist, enter the candidate set and final context, and actually support the answer?",
      tag: "RAG diagnosis",
      basis: "Layered retrieval and generation analysis",
      evidence: [
        { sourceId: "ragas", supports: "Introduces dimensions that help separate context coverage and relevance from answer faithfulness." },
      ],
    }),
    question("agent-final-answer-insufficient", {
      q: "Why is an agent's final answer insufficient for evaluation?",
      a: "Plausible text can follow an unauthorized action, wasted calls, a hidden failure, or no actual change in the authoritative business system.",
      depth: "Verify the environment or business postcondition first, then inspect permission, safety constraints, side effects, latency, and cost per accepted task. Use trajectory for diagnosis and impose a path requirement only when that path is itself part of a safety or business contract.",
      ask: "Which system state proves completion, which actions or permissions must never occur, and which trajectory fields are diagnostic only?",
      tag: "Agent evaluation",
      basis: "Authoritative outcome plus constrained trajectory",
      evidence: [
        { sourceId: "anthropic-agent-evals", supports: "Separates tasks, trials, graders, trajectories, and environment outcomes and emphasizes verifiable postconditions." },
      ],
    }),
    question("open-ended-task-evaluation", {
      q: "How can an open-ended task be evaluated when there is no single reference answer?",
      a: "Define observable rubric dimensions, positive and negative examples, and hard factual or policy constraints; then combine code, calibrated model review, and accountable human adjudication.",
      depth: "Decompose task completion, evidence support, format, safety, and style. Use deterministic validation for fields, citations, permissions, and authoritative state. Use model review only where semantics are genuinely open, and sample its agreement, order effects, and failure modes against human review.",
      ask: "Which dimensions are computable, which require semantic judgment, and who resolves business disagreement?",
      tag: "Review method",
      basis: "Rubric decomposition plus calibration",
      evidence: [
        { sourceId: "llm-as-judge-2023", supports: "Supports model-based review for open-ended generation while documenting position and verbosity biases that require human calibration." },
        { sourceId: "nist-genai-profile", supports: "Supports selecting measurement methods for the context and documenting their limitations." },
      ],
    }),
    question("offline-pass-online-regression", {
      q: "Why can a system regress online after passing offline evaluation?",
      a: "A controlled set cannot cover all live populations, dependencies, interaction, load, human behavior, or consequences.",
      depth: "Evaluation declares the offline population, slices, and generalization boundary. AI Ops correlates model, prompt, retrieval, tool, policy, and environment versions with quality, latency, cost, risk, and authoritative outcomes, and controls canary, stop, and rollback. Production signals identify new distributions and candidate failures; they become labels only after adjudication.",
      ask: "Which deployed outcome proves task completion, and how are candidate failures sampled, de-identified, reviewed, and promoted?",
      tag: "Continuous evaluation",
      basis: "Predeployment boundary plus deployed monitoring",
      evidence: [
        { sourceId: "nist-ai-800-4", supports: "Separates deployed functional, operational, human-factors, security, and broader-outcome monitoring from predeployment evaluation." },
        { sourceId: "opentelemetry-genai-semconv", supports: "Provides shared runtime semantics for generative-AI and agent operations; it does not define quality truth or a release gate." },
      ],
    }),
    question("production-failures-in-golden-set", {
      q: "How can a new evaluation-set version absorb production failures without contaminating the blind holdout?",
      a: "Let AI Ops collect candidate failures; Evaluation de-identifies, deduplicates, adjudicates, slices, and versions them into the next regression release, not the active blind holdout.",
      depth: "Record source, candidate version, task slice, failure class, expected behavior, adjudicator, and validity period. Merge repetitive cases while preserving rare high-risk and affected-population failures. Keep development, frozen regression, and blind holdout roles separate and compare candidates on the same evaluation release.",
      ask: "Who may adjudicate a production case, which dataset role receives it, and how will results remain comparable after the set changes?",
      tag: "Golden-set governance",
      basis: "Measurement-asset governance plus contamination control",
      evidence: [
        { sourceId: "nist-genai-profile", supports: "Supports documenting measurement data, limitations, and newly observed risks." },
        { sourceId: "nist-ai-800-4", supports: "Supports deployed monitoring as a source of new evidence without defining production signals as automatic ground truth." },
      ],
    }),
    question("high-accuracy-still-blocked", {
      q: "Why can high overall accuracy still be insufficient for release?",
      a: "An aggregate can hide severe failure on high-risk work, minority languages, long inputs, affected groups, or boundary conditions.",
      depth: "Slice by task value, user group, language, length, tool, risk, and data source. Set minimums and zero-tolerance rules before running the comparison. Evaluation reports worst critical slices, repeated trials, sample size, uncertainty, and Go/Hold/No-Go advice; AI Ops executes traffic and Governance decides exceptions.",
      ask: "Which task cannot tolerate even one failure, can the evaluation isolate it, and who has authority to accept an exception?",
      tag: "Slice evaluation",
      basis: "Risk slices plus decision rules",
      evidence: [
        { sourceId: "nist-genai-profile", supports: "Supports identifying affected groups, contexts of use, and differentiated risk." },
        { sourceId: "nist-ai-800-3", supports: "Supports explicit assumptions and uncertainty when moving from fixed benchmark results to broader claims." },
      ],
    }),
    question("red-team-versus-model-evaluation", {
      q: "Does completing a security red team mean evaluation is complete?",
      a: "No. Red teaming searches actively for attack paths; routine evaluation measures expected and difficult task behavior. Their objectives and samples differ.",
      depth: "Security owns adversarial threat testing and controls. Evaluation explains how confirmed findings enter repeatable safety regression and why they cannot replace normal quality, business-outcome, human-factors, and deployed evidence. Passing a fixed attack set never proves unknown risk is absent.",
      ask: "Which threats ordinary task samples miss, and who converts a confirmed finding into a durable control and regression case?",
      tag: "Red-team boundary",
      basis: "Adversarial testing plus routine measurement",
      evidence: [
        { sourceId: "nist-genai-profile", supports: "Supports combining routine measurement, adversarial testing, and continuous risk management." },
      ],
    }),
    question("quality-versus-latency-cost", {
      q: "If quality improves but latency and cost double, should evaluation declare a winner?",
      a: "Not on quality alone. Apply the customer's minimum quality, risk, and service gates first, then compare latency and cost per accepted outcome among candidates that pass.",
      depth: "Keep non-compensable failures separate. Show a Pareto frontier or explicit business weighting rather than hiding every dimension in one total. A high-value task may justify more cost; a low-risk batch task may not. Runtime telemetry supplies latency and use evidence, not the business preference.",
      ask: "Which dimensions are hard constraints, and what additional time or cost is acceptable for incremental quality on each task class?",
      tag: "Multi-objective evaluation",
      basis: "Hard gates plus efficiency trade-off",
      evidence: [
        { sourceId: "nist-genai-profile", supports: "Supports deployment decisions that combine performance, impact, and organizational risk tolerance." },
        { sourceId: "opentelemetry-genai-semconv", supports: "Supports relating versioned runtime calls to latency and usage evidence; it does not set the trade-off." },
      ],
    }),
    question("nondeterministic-score-reporting", {
      q: "When repeated runs produce different scores, should we report the best run or the average?",
      a: "Neither alone. Freeze controllable variables, repeat the complete candidate, and report the distribution, estimand-appropriate uncertainty, and severe failures.",
      depth: "Generation and model grading can both vary. Distinguish variability on the fixed case set from uncertainty in a claim about similar future tasks. Do not present a small-sample difference as certain improvement, and treat any non-compensable failure independently even if it occurs once.",
      ask: "Does the result describe this fixed set or a similar task population, is the difference larger than natural variation, and are sample size and repetitions adequate?",
      tag: "Statistical confidence",
      basis: "Repeated measurement plus estimand and uncertainty",
      evidence: [
        { sourceId: "nist-ai-800-3", supports: "Supports distinct uncertainty statements for fixed Benchmark Accuracy and Generalized Accuracy." },
        { sourceId: "nist-genai-profile", supports: "Supports documenting measurement validity, limitations, and uncertainty." },
      ],
    }),
  ]),
  evidenceCards: items([
    { id: "object-lifecycle-evidence", metric: "Object × lifecycle", title: "Name what is measured and where the evidence came from", finding: "Models, components, applications, and business outcomes are different objects; screening, offline acceptance, and deployed monitoring answer different questions.", boundary: "A local score cannot replace end-to-end state, and predeployment evidence cannot prove live effectiveness.", sourceId: "nist-genai-profile", accent: true },
    { id: "grader-division", metric: "Code → judge → human", title: "Choose the grader by verifiability", finding: "Use code for authoritative postconditions, calibrated judges for open semantics, and people for rubric ownership, disputes, and high-impact decisions.", boundary: "Every grader requires validation; neither judge nor reviewer automatically becomes business truth.", sourceId: "anthropic-agent-evals" },
    { id: "benchmark-generalization", metric: "Fixed cases ≠ similar population", title: "Define the estimand before interpreting uncertainty", finding: "Performance on a fixed benchmark and a claim about similar tasks require different assumptions and uncertainty statements.", boundary: "Statistics cannot repair wrong cases, selection bias, or a missing customer threshold.", sourceId: "nist-ai-800-3" },
    { id: "offline-deployed-evidence", metric: "Offline → deployed", title: "Deployed monitoring is another evidence system", finding: "Controlled evaluation cannot cover live traffic, dynamic input, interaction, dependencies, or every consequence.", boundary: "NIST AI 800-4 organizes monitoring challenges; it is not a complete monitoring standard and does not guarantee risk detection.", sourceId: "nist-ai-800-4" },
  ]),
  terms: freeze({
    "capability-matrix": freeze({ name: "Capability Matrix", definition: "A task-sliced comparison of quality, latency, cost, risk, and operational constraints." }),
    "model-lifecycle": freeze({ name: "Model Lifecycle Governance", definition: "Continuous control of model identity, regression evidence, rollout, rollback, retirement, and replacement." }),
    grounding: freeze({ name: "Grounding", definition: "Constraining an answer with traceable facts, sources, or system state and declining when adequate evidence is unavailable." }),
    evaluation: freeze({ name: "Evaluation", definition: "A repeatable decision discipline that binds a versioned system, tasks and population, graders, trials, baseline, uncertainty, and action rules." }),
    "evaluation-contract": freeze({ name: "Evaluation Contract", definition: "A replayable agreement that binds the system-under-test version, target tasks and population, dataset and slices, evaluators, baseline, thresholds, accountable owners, and actions for pass, fail, or uncertainty." }),
    "golden-set": freeze({ name: "Golden Evaluation Set", definition: "A versioned, provenance-checked set of representative and critical-risk cases with adjudicated expected behavior, protected from ongoing tuning and governed for stable regression comparison." }),
    observability: freeze({ name: "Observability", definition: "Metrics, logs, traces, and version context used to explain system behavior; observability does not itself define quality truth or release authority." }),
    "evaluation-layers": freeze({ name: "Evaluation Matrix", definition: "A two-axis view of the measured object—model, component, application or workflow, and business outcome—and the evidence lifecycle—screening, offline acceptance, and deployed monitoring." }),
    "llm-as-judge": freeze({ name: "LLM-as-a-Judge", definition: "Using a language model to scale semantic review under a calibrated, versioned rubric while monitoring bias, disagreement, and scope." }),
    "release-evaluation": freeze({ name: "Release Evaluation", definition: "A versioned comparison against task, risk, and performance criteria that produces measurement evidence and a Go, Hold, or No-Go recommendation for release operations." }),
    "impact-assessment": freeze({ name: "AI Impact Assessment", definition: "A structured analysis of how an AI use may affect people, organizations, and society, including controls and residual risk." }),
    "governance-evidence": freeze({ name: "Governance Evidence Package", definition: "An auditable link among use, version, evaluation, controls, approvals, operating events, and review conclusions." }),
    "ai-ops": freeze({ name: "AI Application Engineering & GenAIOps", definition: "The engineering lifecycle that versions, releases, observes, attributes, and recovers a multi-component AI application." }),
    hitl: freeze({ name: "Human in the Loop", abbr: "HITL", definition: "Accountable human review, approval, correction, or takeover at ambiguous, high-risk, or irreversible steps." }),
    poc: freeze({ name: "Proof of Concept", abbr: "PoC", definition: "A controlled exercise that tests critical assumptions, risks, and acceptance criteria without implying production completion." }),
  }),
  sources: freeze({
    "nist-genai-profile": freeze({ kind: "Official risk-management framework", shortTitle: "NIST AI 600-1", note: "Supports context-specific generative-AI measurement and risk management. It is voluntary guidance, not a benchmark, product certification, or universal release threshold." }),
    "nist-ai-800-3": freeze({ kind: "Official technical report", shortTitle: "NIST AI 800-3", note: "Distinguishes fixed-set Benchmark Accuracy from Generalized Accuracy and explains how statistical models, assumptions, repeated trials, and uncertainty affect interpretation. It does not set customer sample sizes, thresholds, or release authority." }),
    "nist-ai-800-4": freeze({ kind: "Official technical report", shortTitle: "NIST AI 800-4", note: "Surveys deployed functional, operational, human-factors, security, compliance, and broader-impact monitoring challenges. It is not a complete monitoring standard and does not define alerts, sampling, or incident response." }),
    ragas: freeze({ kind: "Peer-reviewed research paper", shortTitle: "RAGAS", note: "Introduces automated dimensions for retrieval-augmented generation. It does not supply customer business truth, security boundaries, or release thresholds." }),
    "llm-as-judge-2023": freeze({ kind: "Research paper", shortTitle: "Judging LLM-as-a-Judge", note: "Examines model-based evaluation and documents biases including position and verbosity. Experiment-specific agreement does not make a judge authoritative." }),
    "anthropic-agent-evals": freeze({ kind: "Provider engineering guide", shortTitle: "Anthropic Agent Evals", note: "Explains evaluation of tasks, trials, graders, trajectories, harness, and environment outcomes. The method still requires customer-specific calibration and independent risk decisions." }),
    "opentelemetry-genai-semconv": freeze({ kind: "Open observability specification", shortTitle: "OTel GenAI Conventions", note: "Provides evolving runtime semantics for generative-AI and agent operations. Pin versions and add business outcomes, privacy, approval, and risk fields; the specification is not a quality gate." }),
  }),
});
