import type { CSSProperties } from "react";
import Link from "next/link";

import { DenseModuleReadingModes, type DenseChapterLink } from "../dense-module-reading-modes";
import { ModuleReadingNav, ReadingProgress, type ReadingSection } from "../fieldbook-interactions";
import { balanceGridRows, gridSpan } from "../layout-utils.mjs";
import { getModuleBySlug } from "../knowledge-map.mjs";
import { ModuleHeroMetrics, ModuleUpdatedAt } from "../module-content-components";
import { DeepDiveRelationView } from "../deep-dive-relation-view";
import { requireModuleExtensionView } from "../module-extension-views.mjs";
import { ModuleKnowledgeExplorer, type ExtensionView } from "../module-visual-explorers";
import { getPublishedModule } from "../module-publication.mjs";
import { sourceLedger } from "../reference-content.mjs";
import { UnifiedModuleScaffold } from "../unified-module-hero";
import { englishSourceCopy } from "./en/registry.mjs";
import { getEnglishUpdatedAt } from "../english-update-dates.mjs";
import { shouldVisualizeEnglishSteps } from "./english-representation-assessment.mjs";
import {
  buildEnglishSectionGroups,
  selectVisibleEnglishEvidenceCards,
  selectVisibleEnglishQuestions,
  selectVisibleEnglishSectionGroups,
} from "./english-section-outline.mjs";
import { englishModuleSlugs } from "./locale-config.mjs";

function discoveryQuestion(value: string) {
  const question = value.replace(/^Ask the customer:\s*/i, "");
  return question.replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

type SourceRef = { sourceId: string; supports?: string };
type BlockItem = {
  id: string;
  legacyIds?: string[];
  title: string;
  subtitle?: string;
  body?: string;
  decision?: string;
  boundary?: string;
  sourceIds?: string[];
  cells?: string[];
};
type ContentBlock = {
  type: "cards" | "steps" | "table" | "boundary";
  title?: string;
  intro?: string;
  columns?: string[];
  items: BlockItem[];
};
type EnglishSection = { id: string; eyebrow: string; title: string; lead?: string; blocks: ContentBlock[] };
type SharedSectionRole = "learning" | "curriculum" | "principle" | "decision" | "deep" | "cloud";
type EnglishSectionGroup = {
  role: SharedSectionRole | "authored";
  id: string;
  label: string;
  eyebrow: string;
  sections: EnglishSection[];
};
type EnglishPrimer = {
  id: string;
  layout: "spectrum" | "pipeline" | "boundary" | "lifecycle" | "loop" | "control" | "stack" | "topology";
  eyebrow: string;
  title: string;
  intro: string;
  termIds: string[];
  steps: Array<{ code: string; label: string; title: string; detail: string; signal: string }>;
  checks: Array<{ title: string; detail: string }>;
  application: string;
  links: Array<{ href: string; label: string }>;
};
type EnglishModule = {
  slug: string;
  title: string;
  subtitle: string;
  definition: string;
  position: string;
  relatedSlugs: string[];
  primer?: EnglishPrimer;
  sections: EnglishSection[];
  qa: Array<{ id: string; q: string; a: string; depth: string; ask: string; tag: string; basis: string; evidence: SourceRef[]; addedAt?: string }>;
  evidenceCards: Array<{ id: string; metric: string; title: string; finding: string; boundary: string; sourceId: string; accent?: boolean }>;
  terms: Record<string, { name: string; abbr?: string; definition: string }>;
};

const ragQuickDirectory = [
  { id: "rag-english-primer-title", label: "Primer", eyebrow: "Evidence system" },
  { id: "concept-map", label: "Decision map", eyebrow: "Start with the outcome" },
  { id: "when-to-use", label: "Adoption test", eyebrow: "Choose the simplest route" },
] satisfies readonly DenseChapterLink[];

const ragLearnDirectory = [
  { id: "rag-principle", label: "Usable evidence", eyebrow: "Authority and scope" },
  { id: "architecture", label: "Reference architecture", eyebrow: "Offline and online chains" },
  { id: "retrieval-basics", label: "Retrieval foundations", eyebrow: "Evidence objects" },
  { id: "production-rag", label: "Online answer path", eyebrow: "Answer or safe stop" },
  { id: "choice", label: "Stack selection", eyebrow: "Target the bottleneck" },
  { id: "rag-independent-depth", label: "Lifecycle consistency", eyebrow: "Access and versions" },
  { id: "poc", label: "PoC decision", eyebrow: "Go, Repair, or Stop" },
  { id: "rag-variants", label: "Extension patterns", eyebrow: "Add measured complexity" },
  { id: "rag-evidence-practice", label: "Practice outputs", eyebrow: "Learn by deliverable" },
] satisfies readonly DenseChapterLink[];

const ragFieldDirectory = [
  { id: "cloud-opportunities", label: "Cloud capabilities", eyebrow: "Map value and ownership" },
  { id: "rag-customer-question-guide", label: "Question guide", eyebrow: "Use the pack" },
  { id: "evidence", label: "Evidence and limits", eyebrow: "Know what sources prove" },
  { id: "qa", label: "Customer questions", eyebrow: "Answer with boundaries" },
  { id: "related-modules", label: "Related modules", eyebrow: "Follow responsibility" },
] satisfies readonly DenseChapterLink[];

const ragUnifiedGroupIds = {
  quick: ["concept-map", "when-to-use"],
  learn: ["rag-principle", "architecture", "retrieval-basics", "production-rag", "choice", "rag-independent-depth", "poc", "rag-variants", "rag-evidence-practice"],
  field: ["cloud-opportunities", "rag-customer-question-guide"],
} as const;

type EnglishUnifiedReaderConfig = {
  titleId: string;
  shortTitle: string;
  criticalBoundary: string;
  facts: readonly { label: string; value: string }[];
  directories: {
    quick: readonly DenseChapterLink[];
    learn: readonly DenseChapterLink[];
    field: readonly DenseChapterLink[];
  };
  groupIds: {
    quick: readonly string[];
    learn: readonly string[];
    field: readonly string[];
  };
  fieldGroupsBeforeEvidence: boolean;
  completeFocusedProjection?: boolean;
};

function standardUnifiedDirectories(primer: DenseChapterLink) {
  return {
    quick: [primer, { id: "decisions", label: "Solution decisions", eyebrow: "Assign the handoff" }],
    learn: [
      { id: "principle", label: "Mechanism", eyebrow: "Build the working model" },
      { id: "study-guide", label: "Study and practice", eyebrow: "Produce reviewable work" },
      { id: "curriculum", label: "Knowledge map", eyebrow: "Complete the theory" },
      { id: "deep-dive", label: "Engineering depth", eyebrow: "Diagnose failure and limits" },
    ],
    field: [
      { id: "evidence", label: "Evidence and limits", eyebrow: "State what sources prove" },
      { id: "cloud", label: "Cloud capabilities", eyebrow: "Map delivery and ownership" },
      { id: "qa", label: "Customer questions", eyebrow: "Answer with boundaries" },
      { id: "related-modules", label: "Related modules", eyebrow: "Explore adjacent topics" },
    ],
  } satisfies EnglishUnifiedReaderConfig["directories"];
}

const standardUnifiedGroupIds = {
  quick: ["decisions"],
  learn: ["principle", "study-guide", "curriculum", "deep-dive"],
  field: ["cloud"],
} as const;

const englishUnifiedReaderConfigs: Readonly<Record<string, EnglishUnifiedReaderConfig>> = {
  rag: {
    titleId: "rag-english-title",
    shortTitle: "RAG",
    criticalBoundary: "RAG does not turn retrieved text into truth. It turns governed external material into candidate evidence and preserves enough identity, scope, and provenance for the application to decide whether a claim may be made.",
    facts: [
      { label: "Adoption condition", value: "Changing evidence, access, citation, or withdrawal" },
      { label: "Evidence path", value: "Source → evidence object → answer decision" },
      { label: "Production gate", value: "Authority, identity, version, citation, and safe stop" },
      { label: "Extension rule", value: "Add Agent, MCP, or A2A only for a measured need" },
    ],
    directories: { quick: ragQuickDirectory, learn: ragLearnDirectory, field: ragFieldDirectory },
    groupIds: ragUnifiedGroupIds,
    fieldGroupsBeforeEvidence: true,
  },
  "model-landscape": {
    titleId: "model-landscape-english-title",
    shortTitle: "Model Selection",
    criticalBoundary: "Catalogs, prices, versions, and platform capabilities are time-sensitive. Bind every customer comparison to its verification date, region, exact candidate identity, and like-for-like pilot. A leaderboard, one demo, or consumer product experience cannot establish the customer-use-case conclusion.",
    facts: [
      { label: "Decision start", value: "Task, unacceptable loss, and delivery hard gates" },
      { label: "Candidate identity", value: "Provider × endpoint × region × exact version × delivery form" },
      { label: "Pilot contract", value: "Same prompt, context, tools, schema, budget, and test set" },
      { label: "Exit proof", value: "A reserve passes the same gates; otherwise block or hand off" },
    ],
    directories: standardUnifiedDirectories({ id: "model-landscape-english-primer-title", label: "Selection coordinates", eyebrow: "From business loss to exit proof" }),
    groupIds: standardUnifiedGroupIds,
    fieldGroupsBeforeEvidence: false,
  },
  multimodal: {
    titleId: "multimodal-english-title",
    shortTitle: "Multimodal",
    criticalBoundary: "A larger model cannot recover pixels, sound, or pages that were never captured. Perception does not grant tool permission; MCP or A2A is not required for read-only understanding. Success at one gate does not authorize the next.",
    facts: [
      { label: "Adoption condition", value: "Non-text information changes the task decision" },
      { label: "Evidence coordinates", value: "Asset × page or region × interval or speaker" },
      { label: "Route choice", value: "Compare specialist, native, and hybrid paths on the same difficult cases" },
      { label: "Safe degradation", value: "Recapture, specialist processing, or accountable review" },
    ],
    directories: standardUnifiedDirectories({ id: "multimodal-english-primer-title", label: "Evidence pipeline", eyebrow: "Locate information loss" }),
    groupIds: standardUnifiedGroupIds,
    fieldGroupsBeforeEvidence: false,
  },
  llm: {
    titleId: "llm-english-title",
    shortTitle: "LLM",
    criticalBoundary: "Fluent output does not establish factual correctness, authorization, or the validity of a business action. External systems must validate factual claims and enforce security, permissions, and deterministic business rules.",
    facts: [
      { label: "Generation path", value: "Token representation → context interaction → autoregressive sampling" },
      { label: "Diagnosis order", value: "Separate capability, evidence, instruction, decoding, serving, and orchestration" },
      { label: "Performance handoff", value: "Move capacity and latency to inference only after quality passes" },
      { label: "Production boundary", value: "Fluency does not prove truth, authority, or a valid business action" },
    ],
    directories: standardUnifiedDirectories({ id: "llm-english-primer-title", label: "Generation path", eyebrow: "From tokens to output" }),
    groupIds: standardUnifiedGroupIds,
    fieldGroupsBeforeEvidence: false,
  },
  "data-engineering": {
    titleId: "data-engineering-english-title",
    shortTitle: "AI Data",
    criticalBoundary: "Business and data owners decide authoritative meaning and permitted use; Data Engineering publishes traceable derivatives and propagates lifecycle state, while Security, IAM, and the application enforce current authorization.",
    facts: [
      { label: "Admission conditions", value: "Authoritative source, permitted purpose, and stable identity" },
      { label: "Lifecycle", value: "Connect → parse → adjudicate → derive → publish → withdraw" },
      { label: "Production gate", value: "Verifiable structure, version, policy reference, quality, and lineage" },
      { label: "Completion proof", value: "State reaches every derivative and negative probes pass" },
    ],
    directories: standardUnifiedDirectories({ id: "data-engineering-english-primer-title", label: "Data lineage", eyebrow: "From authority to withdrawal" }),
    groupIds: standardUnifiedGroupIds,
    fieldGroupsBeforeEvidence: false,
  },
  "ai-agent": {
    titleId: "ai-agent-english-title",
    shortTitle: "AI Agent",
    criticalBoundary: "A tool-call intent, successful tool execution, and business completion are three different claims. Deterministic controls must retain identity, authorization, real-world execution, stopping, and final acceptance.",
    facts: [
      { label: "Adoption condition", value: "New evidence changes the next step" },
      { label: "Model responsibility", value: "Propose structured action intent" },
      { label: "Application responsibility", value: "Identity, policy, execution, and stopping" },
      { label: "Completion proof", value: "Authoritative business postconditions" },
    ],
    directories: {
      quick: [
        { id: "ai-agent-english-primer-title", label: "Control loop", eyebrow: "Separate intent from authority" },
        { id: "agent-adoption-decision", label: "Adoption decision", eyebrow: "Prove the path must adapt" },
      ],
      learn: [
        { id: "agent-operating-model", label: "Operating model", eyebrow: "Bound the run" },
        { id: "agent-harness-engineering", label: "Harness engineering", eyebrow: "Control model-facing state" },
        { id: "agent-control-architecture", label: "Control architecture", eyebrow: "Place deterministic authority" },
        { id: "agent-production-runtime", label: "Production runtime", eyebrow: "Recover durable work" },
        { id: "agent-interoperability", label: "Interoperability", eyebrow: "Delegate without broad authority" },
        { id: "agent-memory-poisoning", label: "Memory controls", eyebrow: "Preserve provenance and recovery" },
      ],
      field: [
        { id: "agent-low-code-choice", label: "Delivery choice", eyebrow: "Test platform fit" },
        { id: "agent-cloud-evaluation", label: "Cloud and PoC", eyebrow: "Map controls and proof" },
        { id: "evidence", label: "Evidence and limits", eyebrow: "State what sources prove" },
        { id: "qa", label: "Customer questions", eyebrow: "Answer with boundaries" },
        { id: "related-modules", label: "Related modules", eyebrow: "Explore adjacent topics" },
      ],
    },
    groupIds: {
      quick: ["agent-adoption-decision"],
      learn: ["agent-operating-model", "agent-harness-engineering", "agent-control-architecture", "agent-production-runtime", "agent-interoperability", "agent-memory-poisoning"],
      field: ["agent-low-code-choice", "agent-cloud-evaluation"],
    },
    fieldGroupsBeforeEvidence: true,
  },
  mcp: {
    titleId: "mcp-english-title",
    shortTitle: "MCP",
    criticalBoundary: "MCP standardizes discovery and invocation. It does not grant authority, establish a supplier's identity, validate business semantics, or make an action safe. Preserve the API gateway, identity, policy, transaction, validation, and audit controls that existed before MCP.",
    facts: [
      { label: "Adoption condition", value: "Repeated integration across real Hosts or providers" },
      { label: "Protocol primitives", value: "Tool · Resource · Prompt" },
      { label: "Authority", value: "Existing identity, policy, gateway, and business systems" },
      { label: "Version boundary", value: "2026-07-28 current · 2025-11-25 legacy" },
    ],
    directories: standardUnifiedDirectories({ id: "mcp-english-primer-title", label: "Protocol boundary", eyebrow: "Standardize exchange, not authority" }),
    groupIds: standardUnifiedGroupIds,
    fieldGroupsBeforeEvidence: false,
    completeFocusedProjection: true,
  },
  a2a: {
    titleId: "a2a-english-title",
    shortTitle: "A2A",
    criticalBoundary: "A2A coordinates independently operated agents through a Message-or-Task contract. MCP or conventional APIs connect tools and data, while local orchestration keeps fine-grained work inside one trust domain. Discovery, protocol-level COMPLETED, and Artifact delivery establish neither authorization nor business acceptance.",
    facts: [
      { label: "Adoption condition", value: "Independent-agent delegation across an ownership or trust boundary" },
      { label: "Response object", value: "Message or server-created Task" },
      { label: "Operating responsibility", value: "Delegator and provider validate separately" },
      { label: "Completion evidence", value: "Task state + optional Artifact validation + business acceptance" },
    ],
    directories: standardUnifiedDirectories({ id: "a2a-english-primer-title", label: "Message or Task", eyebrow: "Choose the response object" }),
    groupIds: standardUnifiedGroupIds,
    fieldGroupsBeforeEvidence: false,
  },
  veadk: {
    titleId: "veadk-english-title",
    shortTitle: "VeADK",
    criticalBoundary: "VeADK helps define and execute agent logic; it does not provision a cloud Runtime, establish trusted end-user identity, authorize business actions, or make process-local state safe across replicas. A registered Tool, completed local run, or successful create_agentkit_app call is not proof of permission, authoritative business completion, or production readiness.",
    facts: [
      { label: "Pinned implementation", value: "VeADK Agent and Runner extend Google ADK abstractions" },
      { label: "Execution record", value: "Versioned root_agent, Runner events, and Session scope" },
      { label: "State boundary", value: "Conversation, long-term memory, and authoritative truth stay separate" },
      { label: "Production handoff", value: "create_agentkit_app ≠ deployed Runtime or customer SLO" },
    ],
    directories: standardUnifiedDirectories({ id: "veadk-english-primer-title", label: "Framework execution boundary", eyebrow: "From inheritance to application handoff" }),
    groupIds: standardUnifiedGroupIds,
    fieldGroupsBeforeEvidence: false,
  },
  agentkit: {
    titleId: "agentkit-english-title",
    shortTitle: "AgentKit",
    criticalBoundary: "AgentKit manages application delivery, the Runtime lifecycle, and resource bindings. The application team still owns agent logic, trusted identity, shared state, business authorization, quality, load, recovery, and the release decision. Runtime Ready is a platform state, not proof of a customer SLO or production acceptance.",
    facts: [
      { label: "Application contract", value: "Entry point × dependencies × configuration × invocation surface" },
      { label: "Delivery chain", value: "Source → image → Runtime → target-environment verification" },
      { label: "State boundary", value: "Shared sessions and governed memory stay separate from authoritative truth" },
      { label: "Release proof", value: "Runtime Ready ≠ customer SLO or production acceptance" },
    ],
    directories: standardUnifiedDirectories({ id: "agentkit-english-primer-title", label: "Application to Runtime", eyebrow: "From application contract to release evidence" }),
    groupIds: standardUnifiedGroupIds,
    fieldGroupsBeforeEvidence: false,
  },
  evaluation: {
    titleId: "evaluation-english-title",
    shortTitle: "Evaluation",
    criticalBoundary: "A score is meaningful only with its contract: version, population, tasks, graders, trials, slices, uncertainty, and decision rules. An aggregate cannot compensate for unauthorized action, sensitive-data exposure, an incorrect business state, or another non-compensable failure.",
    facts: [
      { label: "Evaluation unit", value: "Version tuple × tasks and slices × environment × graders" },
      { label: "Grader split", value: "Code for authoritative state · calibrated judge for semantics · people for adjudication" },
      { label: "Release gate", value: "Repeated trials, critical slices, uncertainty, and non-compensable gates" },
      { label: "Owner handoff", value: "Evaluation recommends · AI Ops executes · Governance accepts exceptions" },
    ],
    directories: standardUnifiedDirectories({ id: "evaluation-english-primer-title", label: "Evaluation contract", eyebrow: "Define the decision before the score" }),
    groupIds: standardUnifiedGroupIds,
    fieldGroupsBeforeEvidence: false,
  },
  "ai-governance": {
    titleId: "ai-governance-english-title",
    shortTitle: "AI Governance",
    criticalBoundary: "Governance defines the use inventory, evidence requirements, approval gates, exception process, and reassessment triggers. The authorized business owner decides whether the use operates and accepts residual business risk within delegated authority. Governance does not perform Security's attack testing, Evaluation's measurement, AI Ops' release and recovery work, the ATS owner's transaction authorization, or counsel's legal classification.",
    facts: [
      { label: "Governed identity", value: "Use × affected people × decision × data × supplier × region × owner" },
      { label: "Assurance path", value: "Register → tier → assess → assign controls → assemble evidence → decide → operate → reassess" },
      { label: "Decision states", value: "Approve · conditionally approve · hold · reject" },
      { label: "Change gate", value: "Suspend affected scope; refresh evidence; restore, restrict, or retire" },
    ],
    directories: standardUnifiedDirectories({ id: "ai-governance-english-primer-title", label: "Governance assurance loop", eyebrow: "From governed use to reassessment" }),
    groupIds: standardUnifiedGroupIds,
    fieldGroupsBeforeEvidence: false,
  },
};

export const englishUnifiedReaderSlugs = Object.freeze(Object.keys(englishUnifiedReaderConfigs));

function EnglishTermHintRow({ module, primer }: { module: EnglishModule; primer: EnglishPrimer }) {
  return (
    <aside className="termHintRow" aria-label={`${module.title} abbreviations; hover, focus, or tap for definitions`}>
      <p><strong>Common abbreviations</strong><span>Hover, focus, or tap to see the full name and definition</span><Link href="/en/glossary" prefetch={false}>Full glossary ↗</Link></p>
      <div>{primer.termIds.map((termId) => {
        const term = module.terms[termId];
        if (!term) throw new Error(`${module.slug} primer references an unknown English term: ${termId}`);
        const label = term.abbr ?? term.name;
        return (
          <details className="termHint" data-term-id={termId} key={termId}>
            <summary aria-label={`${label}: ${term.name}. ${term.definition}`}><span>{label}</span><i aria-hidden="true">?</i></summary>
            <div className="termHintPopover"><span>{term.abbr ?? term.name}</span><strong>{term.name}</strong><p>{term.definition}</p></div>
          </details>
        );
      })}</div>
    </aside>
  );
}

function EnglishModulePrimer({ module, primer }: { module: EnglishModule; primer: EnglishPrimer }) {
  const explorerView: ExtensionView = {
    id: primer.id,
    layout: primer.layout,
    title: primer.title,
    steps: primer.steps.map((step) => ({
      code: step.code,
      title: step.title,
      en: step.label,
      detail: step.detail,
      signal: step.signal,
    })),
    checks: primer.checks,
  };

  return (
    <section className={`pilotPrimer extensionPrimer extensionPrimer--${primer.layout}`} data-knowledge-view={primer.id} aria-labelledby={`${module.slug}-english-primer-title`}>
      <header className="pilotPrimerHeader">
        <div><p className="kicker">{primer.eyebrow}</p><h2 id={`${module.slug}-english-primer-title`}>{primer.title}</h2></div>
        <p>{primer.intro}</p>
      </header>
      <ModuleKnowledgeExplorer view={explorerView} locale="en" />
      <EnglishTermHintRow module={module} primer={primer} />
      <footer className="pilotPrimerActions"><strong>Presales use</strong><p>{primer.application}</p><nav aria-label={`${module.title} further reading`}>{primer.links.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}</nav></footer>
    </section>
  );
}

const specialPrimerLayouts: Record<string, EnglishPrimer["layout"]> = {
  "solution-patterns": "pipeline",
  rag: "pipeline",
  "ai-agent": "control",
  security: "boundary",
  llm: "stack",
  "fine-tuning": "lifecycle",
};
const specialPrimerStepCounts: Record<string, number> = {
  "solution-patterns": 6,
  rag: 4,
  "ai-agent": 4,
  security: 5,
  llm: 6,
  "fine-tuning": 6,
};
const specialPrimerTermIds: Record<string, string[]> = {
  "solution-patterns": ["poc", "sla", "tco", "rag", "ai-agent"],
};

function deriveEnglishPrimer(module: EnglishModule, knowledgeView: string): EnglishPrimer {
  let layout = specialPrimerLayouts[module.slug];
  let stepCount = specialPrimerStepCounts[module.slug];
  let canonicalTermIds: string[] | undefined;
  if (!layout) {
    const canonicalView = requireModuleExtensionView(module.slug) as { layout: EnglishPrimer["layout"]; steps: unknown[]; termIds?: string[] };
    layout = canonicalView.layout;
    stepCount = canonicalView.steps.length;
    canonicalTermIds = canonicalView.termIds;
  }

  const primarySection = module.sections.find((section) => /(?:principle|architecture|operating-model|flywheel|lifecycle|threat|blueprint|coordinate|context|protocol-model|policy-data-plane)/.test(section.id)) ?? module.sections[0];
  const orderedSections = [primarySection, ...module.sections.filter((section) => section !== primarySection)];
  const primaryItems = orderedSections.flatMap((section) => section.blocks.flatMap((block) => block.items));
  const decisionSection = module.sections.find((section) => /(?:decision|choice|when-to-use|release-evidence)/.test(section.id));
  const decisionItems = decisionSection?.blocks.flatMap((block) => block.items) ?? [];
  const explicitTermIds = specialPrimerTermIds[module.slug] ?? canonicalTermIds;
  const termIds = explicitTermIds?.filter((termId) => module.terms[termId]) ?? Object.entries(module.terms)
    .sort(([, left], [, right]) => Number(Boolean(right.abbr)) - Number(Boolean(left.abbr)))
    .slice(0, 5)
    .map(([termId]) => termId);
  const fallbackChecks = primaryItems.slice(0, 3).map((item) => ({ title: item.title, detail: item.decision ?? item.boundary ?? item.body ?? "Validate this stage against the customer workload." }));
  const visibleGroups = selectVisibleEnglishSectionGroups(module);
  const focusedReadingTarget = visibleGroups.find((group) => /(?:production|deep)/.test(group.id))?.id ?? visibleGroups[0]?.id ?? "evidence";

  return {
    id: knowledgeView,
    layout,
    eyebrow: primarySection.eyebrow,
    title: primarySection.title,
    intro: primarySection.lead ?? module.position,
    termIds,
    steps: primaryItems.slice(0, stepCount).map((item, index) => ({
      code: String(index + 1).padStart(2, "0"),
      label: item.subtitle ?? primarySection.eyebrow,
      title: item.title,
      detail: item.body ?? item.cells?.join(" · ") ?? "Establish the mechanism, owner, and observable output for this stage.",
      signal: item.decision ?? item.boundary ?? "Define a testable decision signal before implementation.",
    })),
    checks: (decisionItems.length ? decisionItems.slice(0, 3).map((item) => ({ title: item.title, detail: item.body ?? item.decision ?? item.boundary ?? "Validate this choice against the customer context." })) : fallbackChecks),
    application: module.position,
    links: getPublishedModule(module.slug)?.readingProfile === "focused"
      ? [{ href: `#${focusedReadingTarget}`, label: "Follow the production argument" }, { href: "#evidence", label: "Review evidence limits" }, { href: "#qa", label: "Prepare customer questions" }]
      : module.sections.slice(0, 3).map((section) => ({ href: `#${section.id}`, label: `Review ${section.title}` })),
  };
}

function SourceLinks({ sourceIds }: { sourceIds?: string[] }) {
  if (!sourceIds?.length) return null;
  return (
    <div className="deepDiveSources" aria-label="Sources for this section">
      <span>Sources</span>
      {[...new Set(sourceIds)].map((sourceId) => {
        const source = sourceLedger[sourceId];
        const localizedSource = englishSourceCopy[sourceId];
        if (!source || !localizedSource) throw new Error(`Unknown English sourceId: ${sourceId}`);
        return <Link href={`/en/references#source-${sourceId}`} key={sourceId} prefetch={false}>{localizedSource.shortTitle} ↘</Link>;
      })}
    </div>
  );
}

function CardItem({ item, headingLevel = 3 }: { item: BlockItem; headingLevel?: 3 | 4 }) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  return (
    <article id={item.id}>
      {item.subtitle ? <p className="miniLabel">{item.subtitle}</p> : null}
      <Heading>{item.title}</Heading>
      {item.body ? <p>{item.body}</p> : null}
      {item.decision ? <strong>{item.decision}</strong> : null}
      {item.boundary ? <small>{item.boundary}</small> : null}
      <SourceLinks sourceIds={item.sourceIds} />
    </article>
  );
}

function EditorialStepList({ block }: { block: ContentBlock }) {
  return (
    <ol className="deepDiveEditorialChecklist adaptiveEditorialSequence" data-adaptive-prose="steps">
      {block.items.map((item, index) => (
        <li id={item.id} key={item.id}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h4>{item.title}{item.subtitle ? <small>{item.subtitle}</small> : null}</h4>
            {item.body ? <p>{item.body}</p> : null}
            {item.decision ? <strong>{item.decision}</strong> : null}
            {item.boundary ? <em>{item.boundary}</em> : null}
            <SourceLinks sourceIds={item.sourceIds} />
          </div>
        </li>
      ))}
    </ol>
  );
}

function ContentBlockView({ block, sectionId }: { block: ContentBlock; sectionId: string }) {
  const legacyAnchors = block.items.flatMap((item) => item.legacyIds ?? []).map((legacyId) => <span className="anchorAlias" id={legacyId} aria-hidden="true" key={legacyId} />);
  if (block.type === "boundary") {
    return (
      <aside className="callout" data-importance="critical">
        {legacyAnchors}
        <div className="calloutTitle"><span>High-impact limitation</span><h3>{block.title ?? "Critical boundary"}</h3><small>Verify before you commit</small></div>
        {block.intro ? <p>{block.intro}</p> : null}
        {block.items.map((item) => <CardItem item={item} headingLevel={block.title ? 4 : 3} key={item.id} />)}
      </aside>
    );
  }

  if (block.type === "table") {
    const columns = block.columns ?? ["Topic", "Mechanism", "Decision", "Boundary"];
    const explicitCellCount = Math.max(0, ...block.items.map((item) => item.cells?.length ?? 0));
    const renderedColumns = explicitCellCount > 0 && columns.length === explicitCellCount ? ["Topic", ...columns] : columns;
    const tableLabel = block.title ?? `${sectionId} comparison`;
    return (
      <div className="tableWrap" role="region" aria-label={tableLabel} tabIndex={0}>
        {legacyAnchors}
        {block.title ? <h3>{block.title}</h3> : null}
        {block.intro ? <p>{block.intro}</p> : null}
        <table><caption className="srOnly">{tableLabel}</caption><thead><tr>{renderedColumns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>
          {block.items.map((item) => {
            const cells = item.cells ? [item.title, ...item.cells] : [item.title, item.body ?? "—", item.decision ?? "—", item.boundary ?? "—"];
            return <tr id={item.id} key={item.id}>{cells.map((cell, index) => index === 0 ? <th scope="row" key={`${item.id}-${index}`}>{cell}</th> : <td key={`${item.id}-${index}`}>{cell}{index === cells.length - 1 ? <SourceLinks sourceIds={item.sourceIds} /> : null}</td>)}</tr>;
          })}
        </tbody></table>
      </div>
    );
  }

  if (block.type === "steps") {
    const sourceIds = [...new Set(block.items.flatMap((item) => item.sourceIds ?? []))];
    if (!shouldVisualizeEnglishSteps(sectionId, block)) {
      return (
        <div>
          {legacyAnchors}
          {block.title ? <h3>{block.title}</h3> : null}
          {block.intro ? <p>{block.intro}</p> : null}
          <EditorialStepList block={block} />
        </div>
      );
    }
    return (
      <div>
        {legacyAnchors}
        {block.title ? <h3>{block.title}</h3> : null}
        {block.intro ? <p>{block.intro}</p> : null}
        <DeepDiveRelationView
          locale="en"
          block={{
            kind: "sequence",
            title: block.title ?? "Process",
            items: block.items.map((item) => ({
              id: item.id,
              name: item.title,
              en: item.subtitle,
              mechanism: item.body ?? "Establish the mechanism and observable state for this step.",
              decision: item.decision ?? "Define the decision signal before moving forward.",
              boundary: item.boundary,
            })),
          }}
        />
        <SourceLinks sourceIds={sourceIds} />
      </div>
    );
  }

  const rows = balanceGridRows(block.items, 3);
  return (
    <div>
      {legacyAnchors}
      {block.title ? <h3>{block.title}</h3> : null}
      {block.intro ? <p>{block.intro}</p> : null}
      <div className="balancedGrid deepDiveCards deepDiveCards--scenario" data-count={block.items.length} data-odd={block.items.length % 2 === 1 ? "true" : "false"}>
        {rows.flatMap((row) => row.map((item) => (
          <div className="balancedGridCell" key={item.id} style={{ "--balanced-span": gridSpan(row.length) } as CSSProperties}><CardItem item={item} headingLevel={block.title ? 4 : 3} /></div>
        )))}
      </div>
    </div>
  );
}

function EnglishSectionGroupView({ group, number }: { group: EnglishSectionGroup; number: number }) {
  const singleSection = group.sections.length === 1 ? group.sections[0] : null;
  const headingId = `${group.id}-section-title`;
  return (
    <section aria-labelledby={headingId} className="subsection moduleBriefSection" id={group.id} data-section-role={group.role}>
      <div className="subHead">
        <span>{String(number).padStart(2, "0")}</span>
        <div>
          <p className="kicker">{singleSection?.eyebrow ?? group.eyebrow}</p>
          <h2 id={headingId}>{singleSection?.title ?? group.label}</h2>
        </div>
      </div>
      {group.sections.map((section) => (
        <div id={section.id === group.id ? undefined : section.id} key={section.id}>
          {!singleSection ? <div className="moduleBriefIntro"><p className="miniLabel">{section.eyebrow}</p><h3>{section.title}</h3></div> : null}
          {section.lead ? <p className="sectionLead">{section.lead}</p> : null}
          {section.blocks.map((block, index) => <ContentBlockView block={block} sectionId={section.id} key={`${section.id}-${index}`} />)}
        </div>
      ))}
    </section>
  );
}

export function EnglishModulePage({ module, reader = "legacy" }: { module: EnglishModule; reader?: "legacy" | "unified" }) {
  const publication = getPublishedModule(module.slug);
  if (!publication) throw new Error(`English module is not published in Chinese: ${module.slug}`);
  const canonicalModule = getModuleBySlug(module.slug);
  if (!canonicalModule) throw new Error(`English module is missing from the knowledge map: ${module.slug}`);
  const primer = publication.knowledgeView ? module.primer ?? deriveEnglishPrimer(module, publication.knowledgeView) : null;
  const unifiedConfig = reader === "unified" ? englishUnifiedReaderConfigs[module.slug] : undefined;
  const completeFocusedProjection = Boolean(unifiedConfig?.completeFocusedProjection);
  const sectionGroups = buildEnglishSectionGroups(module, { completeFocusedProjection }) as EnglishSectionGroup[];
  const usesFocusedReadingProfile = publication.readingProfile === "focused";
  const visibleSectionGroups = completeFocusedProjection
    ? sectionGroups
    : selectVisibleEnglishSectionGroups(module, sectionGroups) as EnglishSectionGroup[];
  const cloudGroups = visibleSectionGroups.filter((group) => group.role === "cloud");
  const visibleMainGroups = visibleSectionGroups.filter((group) => group.role !== "cloud");
  const visibleEvidenceCards = completeFocusedProjection ? module.evidenceCards : selectVisibleEnglishEvidenceCards(module);
  const visibleQuestions = completeFocusedProjection ? module.qa : selectVisibleEnglishQuestions(module);
  const contentReadingSections: ReadingSection[] = [
    ...visibleMainGroups.map((group) => ({ id: group.id, label: group.label, eyebrow: group.eyebrow })),
    { id: "evidence", label: "Evidence and limits", eyebrow: "Know what sources prove" },
    ...cloudGroups.map((group) => ({ id: group.id, label: group.label, eyebrow: group.eyebrow })),
    { id: "qa", label: "Customer questions", eyebrow: "Use in customer conversations" },
  ];
  const relatedReadingSection: ReadingSection = { id: "related-modules", label: "Related modules", eyebrow: "Build connections" };
  const readingSections = usesFocusedReadingProfile
    ? [...contentReadingSections, relatedReadingSection]
    : [relatedReadingSection, ...contentReadingSections];
  const renderRelatedSection = (number: number) => (
    <section aria-labelledby="related-modules-section-title" className={`subsection moduleBriefRelated${usesFocusedReadingProfile ? " focusedRelated" : ""}`} id="related-modules">
      <div className="subHead"><span>{String(number).padStart(2, "0")}</span><div><p className="kicker">RELATED MODULES</p><h2 id="related-modules-section-title">Continue through the knowledge map</h2></div></div>
      <div className="relatedModuleGrid" data-count={module.relatedSlugs.length} data-odd={module.relatedSlugs.length % 2 === 1 ? "true" : "false"}>
        {module.relatedSlugs.map((slug) => {
          const related = getModuleBySlug(slug);
          if (!related) throw new Error(`Unknown related module: ${slug}`);
          const availableInEnglish = englishModuleSlugs.includes(slug);
          return <Link href={availableInEnglish ? `/en/modules/${slug}` : related.href} hrefLang={availableInEnglish ? "en" : "zh-CN"} key={slug} prefetch={false}><span>{related.layerNo}</span><strong>{related.en}</strong><small>{availableInEnglish ? "Open module" : "Available in Chinese"}</small></Link>;
        })}
      </div>
    </section>
  );

  const renderEvidenceSection = (number: number) => (
    <section aria-labelledby="evidence-section-title" className={`subsection moduleBriefSection${usesFocusedReadingProfile ? " focusedSection" : ""}`} id="evidence">
      <div className="subHead"><span>{String(number).padStart(2, "0")}</span><div><p className="kicker">EVIDENCE WITH LIMITS</p><h2 id="evidence-section-title">Evidence cards</h2></div></div>
      <div className="evidenceGrid" data-count={visibleEvidenceCards.length} data-odd={visibleEvidenceCards.length % 2 === 1 ? "true" : "false"}>{balanceGridRows(visibleEvidenceCards, 3).flatMap((row) => row.map((card) => {
        const source = sourceLedger[card.sourceId];
        const localizedSource = englishSourceCopy[card.sourceId];
        if (!source || !localizedSource) throw new Error(`Unknown evidence sourceId: ${card.sourceId}`);
        return <article className={`metricCard${card.accent ? " accent" : ""}`} id={`evidence-${card.id}`} key={card.id} style={{ "--evidence-span": gridSpan(row.length) } as CSSProperties}><p className="metric">{card.metric}</p><h3>{card.title}</h3><p className="metricFinding">{card.finding}</p><p className="metricBoundary"><strong>Evidence limit</strong>{card.boundary}</p><Link href={`/en/references#source-${card.sourceId}`} prefetch={false}>{localizedSource.shortTitle} ↘</Link></article>;
      }))}</div>
      {usesFocusedReadingProfile ? <p className="focusedDirectoryLink"><Link href={`/en/references?module=${module.slug}`} prefetch={false}>Review this module’s source ledger and verification dates →</Link></p> : null}
    </section>
  );

  const renderQaSection = (number: number) => (
    <section aria-labelledby="qa-section-title" className={`subsection moduleBriefSection qaSection${usesFocusedReadingProfile ? " focusedSection" : ""}`} id="qa">
      <div className="subHead"><span>{String(number).padStart(2, "0")}</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h2 id="qa-section-title">Common questions and evidence-backed answers</h2></div></div>
      <div className="qaList">{visibleQuestions.map((item, index) => (
        <details className="qaItem" id={`qa-${item.id}`} key={item.id}>
          <summary><span className="qaNo">Q{String(index + 1).padStart(2, "0")}</span><span className="qaQuestion"><strong>{item.q}</strong>{item.addedAt ? <small>Added on {item.addedAt}</small> : null}</span><span className="qaTag">{item.tag}</span><span className="plus">＋</span></summary>
          <div className="qaAnswer">
            <div><p className="answerLabel">SHORT ANSWER</p><p>{item.a}</p></div>
            <div><p className="answerLabel">TECHNICAL DETAIL</p><p>{item.depth}</p></div>
            <div className="qaBasis" aria-label="Evidence for this answer"><div className="qaBasisHead"><p className="answerLabel">EVIDENCE AND LIMITS</p><span>{item.basis}</span></div><div className="qaBasisList" data-count={item.evidence.length} data-odd={item.evidence.length % 2 === 1 ? "true" : "false"}>{balanceGridRows(item.evidence, 3).flatMap((row) => row.map((evidence) => <Link href={`/en/references#source-${evidence.sourceId}`} key={evidence.sourceId} prefetch={false} style={{ "--qa-evidence-span": gridSpan(row.length) } as CSSProperties}><span className="qaEvidenceMeta">{sourceLedger[evidence.sourceId]?.grade} · {englishSourceCopy[evidence.sourceId]?.kind}</span><strong>{englishSourceCopy[evidence.sourceId]?.shortTitle ?? evidence.sourceId}</strong><small>{evidence.supports}</small></Link>))}</div></div>
            <div className="ask"><p className="answerLabel">RECOMMENDED DISCOVERY QUESTION</p><p>{discoveryQuestion(item.ask)}</p></div>
          </div>
        </details>
      ))}</div>
      {usesFocusedReadingProfile ? <p className="focusedDirectoryLink"><Link href={`/en/questions?module=${module.slug}`} prefetch={false}>Browse every customer question for this module →</Link></p> : null}
    </section>
  );

  const pageFooter = (
    <footer><div><strong>Cloud × AI Presales Fieldbook</strong></div><p>{module.title}<ModuleUpdatedAt value={getEnglishUpdatedAt(module.slug) ?? publication.updatedAt ?? undefined} locale="en" /></p><a href="#top">Back to top ↑</a></footer>
  );

  if (reader === "unified") {
    if (!unifiedConfig) throw new Error(`The unified English reader is not configured for: ${module.slug}`);
    if (!primer) throw new Error(`The unified English ${module.slug} reader requires its architecture primer.`);

    const groupById = new Map(visibleSectionGroups.map((group) => [group.id, group]));
    const assignedGroupIds = [...unifiedConfig.groupIds.quick, ...unifiedConfig.groupIds.learn, ...unifiedConfig.groupIds.field];
    const assignedGroupIdSet = new Set<string>(assignedGroupIds);
    const duplicateGroupIds = assignedGroupIds.filter((groupId, index) => assignedGroupIds.indexOf(groupId) !== index);
    const unknownGroupIds = assignedGroupIds.filter((groupId) => !groupById.has(groupId));
    const missingGroupIds = visibleSectionGroups.map((group) => group.id).filter((groupId) => !assignedGroupIdSet.has(groupId));
    const visibleGroupIds = visibleSectionGroups.map((group) => group.id);
    const duplicateVisibleGroupIds = visibleGroupIds.filter((groupId, index) => visibleGroupIds.indexOf(groupId) !== index);
    const reservedIds = new Set([primer.id, `${module.slug}-english-primer-title`, "evidence", "qa", "related-modules"]);
    const conflictingGroupIds = assignedGroupIds.filter((groupId) => reservedIds.has(groupId));
    if (duplicateVisibleGroupIds.length || duplicateGroupIds.length || unknownGroupIds.length || missingGroupIds.length || conflictingGroupIds.length) {
      throw new Error(`English ${module.slug} unified reader group contract mismatch: duplicate-visible=${duplicateVisibleGroupIds.join(",") || "none"}; duplicate-config=${duplicateGroupIds.join(",") || "none"}; unknown=${unknownGroupIds.join(",") || "none"}; missing=${missingGroupIds.join(",") || "none"}; reserved=${conflictingGroupIds.join(",") || "none"}`);
    }

    const renderUnifiedGroups = (groupIds: readonly string[], startNumber: number) => groupIds.map((groupId, index) => {
      const group = groupById.get(groupId);
      if (!group) throw new Error(`English ${module.slug} unified reader references an unknown group: ${groupId}`);
      return <EnglishSectionGroupView group={group} number={startNumber + index} key={group.id} />;
    });
    const quickStart = 2;
    const learnStart = quickStart + unifiedConfig.groupIds.quick.length;
    const fieldBase = learnStart + unifiedConfig.groupIds.learn.length;
    const quickGroups = renderUnifiedGroups(unifiedConfig.groupIds.quick, quickStart);
    const learnGroups = renderUnifiedGroups(unifiedConfig.groupIds.learn, learnStart);
    const fieldGroupStart = unifiedConfig.fieldGroupsBeforeEvidence ? fieldBase : fieldBase + 1;
    const fieldGroups = renderUnifiedGroups(unifiedConfig.groupIds.field, fieldGroupStart);
    const evidenceNumber = unifiedConfig.fieldGroupsBeforeEvidence
      ? fieldBase + unifiedConfig.groupIds.field.length
      : fieldBase;
    const qaNumber = fieldBase + unifiedConfig.groupIds.field.length + 1;
    const relatedNumber = qaNumber + 1;
    const fieldContent = unifiedConfig.fieldGroupsBeforeEvidence
      ? <>{fieldGroups}{renderEvidenceSection(evidenceNumber)}{renderQaSection(qaNumber)}{renderRelatedSection(relatedNumber)}</>
      : <>{renderEvidenceSection(evidenceNumber)}{fieldGroups}{renderQaSection(qaNumber)}{renderRelatedSection(relatedNumber)}</>;
    const chapters = [
      ...unifiedConfig.directories.quick,
      ...unifiedConfig.directories.learn,
      ...unifiedConfig.directories.field,
    ];

    return (
      <UnifiedModuleScaffold
        className={`fieldbookTheme modulePage moduleBriefPage modulePilot${module.slug === "rag" ? " modulePilot--dedicated" : ""}${usesFocusedReadingProfile ? " moduleFocused" : ""}`}
        hero={{
          anchorId: "top",
          titleId: unifiedConfig.titleId,
          shortTitle: unifiedConfig.shortTitle,
          zhTitle: "",
          enTitle: module.title,
          definition: module.definition,
          position: module.position,
          slug: module.slug,
          questionCount: visibleQuestions.length,
          evidenceCount: visibleEvidenceCards.length,
          locale: "en",
          facts: unifiedConfig.facts,
        }}
      >
        <div className="dedicatedArticleLayout moduleReadingHost">
          <section className={module.slug === "rag" ? "section ragBody" : "section"} aria-label={`${module.title} core content`}>
            <div className="sectionNumber">02</div>
            <div className="sectionBody">
              <DenseModuleReadingModes
                chapters={chapters}
                criticalBoundary={unifiedConfig.criticalBoundary}
                directories={unifiedConfig.directories}
                field={fieldContent}
                hashGroups={unifiedConfig.groupIds}
                learn={<>{learnGroups}</>}
                locale="en"
                moduleName={module.title}
                quick={<><EnglishModulePrimer module={module} primer={primer} />{quickGroups}</>}
                readerId="module-reading"
              />
            </div>
          </section>
        </div>
        {pageFooter}
      </UnifiedModuleScaffold>
    );
  }

  return (
    <main lang="en" className={`fieldbookTheme modulePage moduleBriefPage${publication.visualProfile === "dense-reading" ? " modulePilot" : ""}${usesFocusedReadingProfile ? " moduleFocused" : ""}`}>
      <ReadingProgress />
      <header className="modulePageHero moduleBriefHero" id="top">
        <nav className="topbar" aria-label="Module navigation">
          <Link className="brand" href="/en" aria-label="Return to the fieldbook home" prefetch={false}><span>Cloud × AI / Presales Fieldbook</span></Link>
          <div className="toplinks">
            <a href="#qa">Questions</a>
            <Link href="/en/glossary" prefetch={false}>Glossary</Link>
            <Link href="/en/questions" prefetch={false}>All customer questions</Link>
            <Link href="/en/references" prefetch={false}>References</Link>
            <Link href={`/modules/${module.slug}`} hrefLang="zh-CN" lang="zh-CN" prefetch={false}>Chinese</Link>
          </div>
        </nav>
        <div id="main-content" className="skipTarget" tabIndex={-1} />
        <div className="moduleBriefHeader">
          {!usesFocusedReadingProfile ? <p className="eyebrow">MODULE {canonicalModule.layerNo} · {canonicalModule.layerEn}</p> : null}
          <h1 className="moduleHeroTitle">{module.title}<span>{module.subtitle}</span></h1>
          <p className="moduleBriefDefinition">{module.definition}</p>
          <p className="moduleBriefPosition">{module.position}</p>
          {!usesFocusedReadingProfile ? <ModuleHeroMetrics sectionCount={readingSections.length} questionCount={module.qa.length} evidenceCount={module.evidenceCards.length} labels={{ ariaLabel: "Module content overview", sections: "Sections", questions: "Customer questions", evidence: "Evidence cards" }} /> : null}
        </div>
      </header>

      <div className="moduleArticleLayout">
        <ModuleReadingNav moduleName={module.title} sections={readingSections} quickLinks={[
          { href: "#evidence", label: "Evidence" },
          { href: "#qa", label: "Customer questions" },
          { href: `/modules/${module.slug}`, label: "Chinese original" },
        ]} labels={{ navigation: "section navigation", progress: "Reading", quickLinks: "Quick links" }} />
        <div className="moduleArticleContent">
          {primer ? <EnglishModulePrimer module={module} primer={primer} /> : null}
          {!usesFocusedReadingProfile ? renderRelatedSection(1) : null}

          {visibleMainGroups.map((group, index) => <EnglishSectionGroupView group={group} number={index + 2} key={group.id} />)}

          {renderEvidenceSection(visibleMainGroups.length + 2)}

          {cloudGroups.map((group, index) => <EnglishSectionGroupView group={group} number={visibleMainGroups.length + index + 3} key={group.id} />)}

          {renderQaSection(visibleMainGroups.length + cloudGroups.length + 3)}
          {usesFocusedReadingProfile ? renderRelatedSection(visibleMainGroups.length + cloudGroups.length + 4) : null}
        </div>
      </div>

      {pageFooter}
    </main>
  );
}

// Kept as an internal compatibility alias while the full locale routes replace the pilot routes.
export const EnglishPilotModulePage = EnglishModulePage;
