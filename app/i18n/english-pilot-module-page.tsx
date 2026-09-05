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
import { EnglishFieldPanel, EnglishLearnPanel } from "./english-reading-panels";
import { moduleManifests } from "../modules/index.mjs";
import { SiteFooter, SiteNav } from "../site-chrome";

const englishSourceCopyMap = englishSourceCopy as unknown as Record<string, { kind: string; note: string; shortTitle: string }>;

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
type EnglishReaderModeId = "quick" | "learn" | "field";
const englishReaderModeIds: readonly EnglishReaderModeId[] = ["quick", "learn", "field"];
type EnglishPrimer = {
  id: string;
  layout: "spectrum" | "pipeline" | "boundary" | "lifecycle" | "loop" | "control" | "stack" | "topology";
  eyebrow: string;
  title: string;
  intro: string;
  termIds: string[];
  steps: Array<{ code: string; label: string; title: string; detail: string; signal: string }>;
  controlPlaneStepCodes?: string[];
  checks: Array<{ title: string; detail: string }>;
  application: string;
  links: Array<{ href: string; label: string }>;
};
export type EnglishModule = {
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


const englishUnifiedReaderConfigs: Readonly<Record<string, EnglishUnifiedReaderConfig>> = Object.freeze(
  Object.fromEntries(
    moduleManifests
      .map((manifest) => [manifest.slug, manifest.englishReaderConfig] as const)
      .filter((entry) => Boolean(entry[1])),
  ),
) as Readonly<Record<string, EnglishUnifiedReaderConfig>>;


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
    controlPlaneStepCodes: primer.controlPlaneStepCodes,
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
const specialPrimerTermIds: Record<string, string[]> = {
  "solution-patterns": ["poc", "sla", "tco", "rag", "ai-agent"],
  "prompt-engineering": ["prompt-engineering", "context-engineering", "tools-schema", "structured-outputs", "prompt-injection"],
};

// A primer is a semantic projection, not the first N cards in a section.  The
// complete material remains in the reader below; these IDs identify the
// mechanism a learner should hold in mind before entering it.  Adding or
// reordering other material therefore cannot silently change the primer.
const derivedPrimerStepIds: Record<string, readonly string[]> = {
  "solution-patterns": [
    "solution-principle-outcome-unit",
    "solution-principle-constraint-envelope",
    "solution-principle-minimum-loop",
    "solution-principle-responsibility-architecture",
    "solution-principle-evidence-stage",
    "solution-principle-operations-economics-exit",
  ],
  "model-landscape": ["selection-task-capability", "selection-quality-risk", "selection-serving-constraints", "selection-lifecycle"],
  rag: ["mechanism-retrieval", "mechanism-augmentation", "mechanism-generation"],
  "ai-agent": ["agent-loop-perceive", "agent-loop-reason", "agent-loop-act", "agent-loop-observe", "agent-loop-continue-stop"],
  multimodal: ["inspection-task-contract", "inspection-capture-gate", "inspection-route-align", "inspection-ground-handoff", "inspection-degrade"],
  mcp: ["principle-host-client-server", "principle-tools-resources-prompts", "principle-versioned-lifecycle", "principle-transport-trust-boundary", "principle-mcp-function-calling"],
  a2a: ["task-submit-accept", "task-work-progress", "task-input-authorization", "task-terminal-state", "task-deliver-verify-artifact"],
  veadk: ["principle-upstream-contract", "principle-tool-proposal", "principle-state-separation", "principle-adapter-boundary"],
  agentkit: ["principle-artifact-before-runtime", "principle-binding-not-connection", "principle-externalize-state", "principle-platform-evidence"],
  evaluation: ["refund-decision-estimand", "refund-freeze-unit", "refund-sample-slice", "refund-grade-validly", "refund-repeat-decide", "refund-handoff"],
  "ai-governance": ["governance-principle-use", "governance-principle-tier-classification", "governance-principle-impact", "governance-principle-conditions", "governance-principle-change"],
  security: ["security-path-loss", "security-path-admission", "security-path-retrieval", "security-path-proposal", "security-path-authorize"],
  "ai-gateway": ["gateway-unified-access", "gateway-credential-isolation", "gateway-policy-routing", "gateway-traffic-cost", "gateway-safety-audit", "gateway-end-to-end-telemetry"],
  "ai-ops": ["principle-task-contract", "principle-configuration-bundle", "principle-layered-testing", "principle-controlled-release", "principle-end-to-end-trace", "principle-incident-stop", "principle-governed-improvement"],
  "prompt-engineering": ["claim-baseline", "claim-minimum-call", "claim-context-manifest", "claim-validate-authorize", "claim-release-bundle"],
  "llm-training": ["principle-data-preparation", "principle-pretraining", "principle-sft", "principle-preference", "principle-evaluation"],
  "llm-inference": ["principle-autoregressive", "principle-prefill-decode", "principle-kv-cache", "principle-continuous-batching", "principle-inference-optimization", "principle-distributed-inference"],
  "ai-infra-platform": ["principle-device-claim", "principle-gang-queue", "principle-sharing-isolation", "principle-environment-reproducibility", "principle-failure-recovery", "principle-serving-observability"],
  "ai-infra-compute": ["principle-workload-sizing", "principle-compute-precision", "principle-memory-hierarchy", "principle-scale-up", "principle-scale-out", "principle-storage-power-tco"],
};

// Control-plane membership is a projection of stable authored item IDs, never
// the display position assigned to a primer step. This keeps an added or
// reordered learning item from changing which controls the visual represents.
const controlPlanePrimerStepIds: Record<string, readonly string[]> = {
  "ai-agent": ["agent-loop-act", "agent-loop-continue-stop"],
  mcp: ["principle-host-client-server"],
  security: ["security-path-authorize"],
  "ai-gateway": ["gateway-policy-routing", "gateway-traffic-cost", "gateway-safety-audit"],
  "ai-infra-platform": ["principle-gang-queue", "principle-sharing-isolation"],
};

function selectPrimerItems(module: EnglishModule, itemIds: readonly string[], label: string) {
  const byId = new Map(module.sections.flatMap((section) => section.blocks.flatMap((block) => block.items).map((item) => [item.id, item])));
  if (new Set(itemIds).size !== itemIds.length) throw new Error(`${module.slug} ${label} repeats a content item`);
  return itemIds.map((itemId) => {
    const item = byId.get(itemId);
    if (!item) throw new Error(`${module.slug} ${label} references an unknown content item: ${itemId}`);
    return item;
  });
}

function deriveEnglishPrimer(module: EnglishModule, knowledgeView: string): EnglishPrimer {
  // Dedicated primers carry their own layout and do not need a generic
  // extension view.  Loading one here would make those otherwise complete
  // readers fail during SSR simply because no generic view is registered.
  const canonicalView = specialPrimerLayouts[module.slug]
    ? null
    : requireModuleExtensionView(module.slug) as { layout: EnglishPrimer["layout"]; termIds?: string[] };
  const layout = specialPrimerLayouts[module.slug] ?? canonicalView?.layout;
  if (!layout) throw new Error(`${module.slug} needs a primer layout`);
  const primarySection = module.sections.find((section) => /(?:principle|architecture|operating-model|flywheel|lifecycle|threat|blueprint|coordinate|context|protocol-model|policy-data-plane)/.test(section.id));
  if (!primarySection) throw new Error(`${module.slug} needs a semantic mechanism section for its primer`);
  const stepIds = derivedPrimerStepIds[module.slug];
  if (!stepIds?.length) throw new Error(`${module.slug} needs explicit primer step IDs rather than a positional projection`);
  const steps = selectPrimerItems(module, stepIds, "primer steps");
  const controlPlaneItemIds = controlPlanePrimerStepIds[module.slug] ?? [];
  const stepIdSet = new Set(stepIds);
  const invalidControlPlaneItemIds = controlPlaneItemIds.filter((itemId) => !stepIdSet.has(itemId));
  if (invalidControlPlaneItemIds.length) {
    throw new Error(`${module.slug} control-plane projection references a non-primer item: ${invalidControlPlaneItemIds.join(", ")}`);
  }
  if ((layout === "control" || layout === "boundary") && !controlPlaneItemIds.length) {
    throw new Error(`${module.slug} needs explicit semantic control-plane item IDs`);
  }
  const controlPlaneItemIdSet = new Set(controlPlaneItemIds);
  const decisionSection = module.sections.find((section) => /(?:decision|choice|when-to-use|release-evidence)/.test(section.id));
  const decisionItems = decisionSection?.blocks.flatMap((block) => block.items) ?? [];
  const explicitTermIds = specialPrimerTermIds[module.slug] ?? canonicalView?.termIds;
  const termIds = explicitTermIds?.filter((termId) => module.terms[termId]) ?? Object.keys(module.terms);
  const checkItems = decisionItems.length ? decisionItems : steps;
  const visibleGroups = selectVisibleEnglishSectionGroups(module) as EnglishSectionGroup[];

  return {
    id: knowledgeView,
    layout,
    eyebrow: primarySection.eyebrow,
    title: primarySection.title,
    intro: primarySection.lead ?? module.position,
    termIds,
    steps: steps.map((item, index) => ({
      code: String(index + 1).padStart(2, "0"),
      label: item.subtitle ?? primarySection.eyebrow,
      title: item.title,
      detail: item.body ?? item.cells?.join(" · ") ?? "Establish the mechanism, owner, and observable output for this stage.",
      signal: item.decision ?? item.boundary ?? "Define a testable decision signal before implementation.",
    })),
    ...(controlPlaneItemIds.length
      ? {
          controlPlaneStepCodes: steps.flatMap((item, index) => (
            controlPlaneItemIdSet.has(item.id) ? [String(index + 1).padStart(2, "0")] : []
          )),
        }
      : {}),
    checks: checkItems.map((item) => ({ title: item.title, detail: item.body ?? item.decision ?? item.boundary ?? "Validate this choice against the customer context." })),
    application: module.position,
    links: [
      ...visibleGroups.map((group) => ({ href: `#${group.id}`, label: `Review ${group.label}` })),
      { href: "#evidence", label: "Review evidence limits" },
      { href: "#qa", label: "Prepare customer questions" },
    ],
  };
}

function SourceLinks({ sourceIds }: { sourceIds?: string[] }) {
  if (!sourceIds?.length) return null;
  return (
    <div className="deepDiveSources" aria-label="Sources for this section">
      <span>Sources</span>
      {[...new Set(sourceIds)].map((sourceId) => {
        const source = sourceLedger[sourceId];
        const localizedSource = englishSourceCopyMap[sourceId];
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
            <h3>{item.title}{item.subtitle ? <small>{item.subtitle}</small> : null}</h3>
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

function readerBlockTitle(block: ContentBlock, sectionId: string) {
  if (sectionId.endsWith("-curriculum")
    && block.type === "cards"
    && /\bchapters$/i.test(block.title ?? "")) {
    return "Course map";
  }
  return block.title;
}

function ContentBlockView({ block, sectionId }: { block: ContentBlock; sectionId: string }) {
  const title = readerBlockTitle(block, sectionId);
  const legacyAnchors = block.items.flatMap((item) => item.legacyIds ?? []).map((legacyId) => <span className="anchorAlias" id={legacyId} aria-hidden="true" key={legacyId} />);
  if (block.type === "boundary") {
    return (
      <aside className="callout" data-importance="critical">
        {legacyAnchors}
        <div className="calloutTitle"><span>High-impact limitation</span><h3>{title ?? "Critical boundary"}</h3><small>Verify before you commit</small></div>
        {block.intro ? <p>{block.intro}</p> : null}
        {block.items.map((item) => <CardItem item={item} headingLevel={title ? 4 : 3} key={item.id} />)}
      </aside>
    );
  }

  if (block.type === "table") {
    const columns = block.columns ?? ["Topic", "Mechanism", "Decision", "Boundary"];
    const explicitCellCount = Math.max(0, ...block.items.map((item) => item.cells?.length ?? 0));
    const renderedColumns = explicitCellCount > 0 && columns.length === explicitCellCount ? ["Topic", ...columns] : columns;
    const tableLabel = title ?? `${sectionId} comparison`;
    return (
      <div className="tableWrap" role="region" aria-label={tableLabel} tabIndex={0}>
        {legacyAnchors}
        {title ? <h3>{title}</h3> : null}
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
          {title ? <h3>{title}</h3> : null}
          {block.intro ? <p>{block.intro}</p> : null}
          <EditorialStepList block={block} />
        </div>
      );
    }
    return (
      <div>
        {legacyAnchors}
        {title ? <h3>{title}</h3> : null}
        {block.intro ? <p>{block.intro}</p> : null}
        <DeepDiveRelationView
          locale="en"
          block={{
            kind: "sequence",
            title: title ?? "Process",
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
      {title ? <h3>{title}</h3> : null}
      {block.intro ? <p>{block.intro}</p> : null}
      <div className="balancedGrid deepDiveCards deepDiveCards--scenario" data-count={block.items.length} data-odd={block.items.length % 2 === 1 ? "true" : "false"}>
        {rows.flatMap((row) => row.map((item) => (
          <div className="balancedGridCell" key={item.id} style={{ "--balanced-span": gridSpan(row.length) } as CSSProperties}><CardItem item={item} headingLevel={title ? 4 : 3} /></div>
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
  const sectionGroups = buildEnglishSectionGroups(module) as EnglishSectionGroup[];
  const usesFocusedReadingProfile = publication.readingProfile === "focused";
  const visibleSectionGroups = completeFocusedProjection
    ? sectionGroups
    : selectVisibleEnglishSectionGroups(module, sectionGroups) as EnglishSectionGroup[];
  const visibleEvidenceCards = (completeFocusedProjection ? module.evidenceCards : selectVisibleEnglishEvidenceCards(module)) as EnglishModule["evidenceCards"];
  const visibleQuestions = (completeFocusedProjection ? module.qa : selectVisibleEnglishQuestions(module)) as EnglishModule["qa"];
  const contentReadingSections: ReadingSection[] = [
    ...visibleSectionGroups.map((group) => ({ id: group.id, label: group.label, eyebrow: group.eyebrow })),
    { id: "evidence", label: "Evidence and limits", eyebrow: "Know what sources prove" },
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
        const localizedSource = englishSourceCopyMap[card.sourceId];
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
            <div className="qaBasis" aria-label="Evidence for this answer"><div className="qaBasisHead"><p className="answerLabel">EVIDENCE AND LIMITS</p><span>{item.basis}</span></div><div className="qaBasisList" data-count={item.evidence.length} data-odd={item.evidence.length % 2 === 1 ? "true" : "false"}>{balanceGridRows(item.evidence, 3).flatMap((row) => row.map((evidence) => <Link href={`/en/references#source-${evidence.sourceId}`} key={evidence.sourceId} prefetch={false} style={{ "--qa-evidence-span": gridSpan(row.length) } as CSSProperties}><span className="qaEvidenceMeta">{sourceLedger[evidence.sourceId]?.grade} · {englishSourceCopyMap[evidence.sourceId]?.kind}</span><strong>{englishSourceCopyMap[evidence.sourceId]?.shortTitle ?? evidence.sourceId}</strong><small>{evidence.supports}</small></Link>))}</div></div>
            <div className="ask"><p className="answerLabel">RECOMMENDED DISCOVERY QUESTION</p><p>{discoveryQuestion(item.ask)}</p></div>
          </div>
        </details>
      ))}</div>
      {usesFocusedReadingProfile ? <p className="focusedDirectoryLink"><Link href={`/en/questions?module=${module.slug}`} prefetch={false}>Browse every customer question for this module →</Link></p> : null}
    </section>
  );

  const pageFooter = (
    <SiteFooter locale="en" brand="Cloud × AI Presales Fieldbook" note={<>{module.title}<ModuleUpdatedAt value={getEnglishUpdatedAt(module.slug) ?? publication.updatedAt ?? undefined} locale="en" /></>} />
  );

  if (reader === "unified") {
    if (!unifiedConfig) throw new Error(`The unified English reader is not configured for: ${module.slug}`);
    if (!primer) throw new Error(`The unified English ${module.slug} reader requires its architecture primer.`);

    const groupById = new Map(visibleSectionGroups.map((group) => [group.id, group]));
    const visibleGroupIds = visibleSectionGroups.map((group) => group.id);
    const duplicateVisibleGroupIds = visibleGroupIds.filter((groupId, index) => visibleGroupIds.indexOf(groupId) !== index);
    const reservedIds = new Set([primer.id, `${module.slug}-english-primer-title`, "evidence", "qa", "related-modules"]);
    const configuredModeByGroupId = new Map<string, EnglishReaderModeId>();
    const duplicateConfiguredGroupIds: string[] = [];
    for (const mode of englishReaderModeIds) {
      for (const groupId of unifiedConfig.groupIds[mode]) {
        if (configuredModeByGroupId.has(groupId)) duplicateConfiguredGroupIds.push(groupId);
        else configuredModeByGroupId.set(groupId, mode);
      }
    }
    const conflictingGroupIds = [...configuredModeByGroupId.keys()].filter((groupId) => reservedIds.has(groupId));
    if (duplicateVisibleGroupIds.length || duplicateConfiguredGroupIds.length || conflictingGroupIds.length) {
      throw new Error(`English ${module.slug} unified reader group identity mismatch: duplicate-visible=${duplicateVisibleGroupIds.join(",") || "none"}; duplicate-config=${duplicateConfiguredGroupIds.join(",") || "none"}; reserved=${conflictingGroupIds.join(",") || "none"}`);
    }

    // Reader configuration can choose a reading task for a known group, but it
    // never defines which sections exist. New or repeated authored groups fall
    // back to Systematic study and stay in authored order rather than making a
    // module fail because it does not match a six-role template.
    const groupIdsByMode: Record<EnglishReaderModeId, string[]> = { quick: [], learn: [], field: [] };
    for (const group of visibleSectionGroups) {
      groupIdsByMode[configuredModeByGroupId.get(group.id) ?? "learn"].push(group.id);
    }
    const renderUnifiedGroups = (groupIds: readonly string[], startNumber: number) => groupIds.map((groupId, index) => {
      const group = groupById.get(groupId);
      if (!group) return null;
      return <EnglishSectionGroupView group={group} number={startNumber + index} key={group.id} />;
    });
    const quickStart = 2;
    const quickGroups = renderUnifiedGroups(groupIdsByMode.quick, quickStart);
    const configuredDirectoryEntries = new Map(
      englishReaderModeIds.flatMap((mode) => unifiedConfig.directories[mode].map((entry) => [entry.id, entry] as const)),
    );
    const directoryEntryForGroup = (groupId: string): DenseChapterLink => {
      const group = groupById.get(groupId);
      return configuredDirectoryEntries.get(groupId) ?? {
        id: groupId,
        label: group?.label ?? groupId,
        eyebrow: group?.eyebrow,
      };
    };
    const configuredEntry = (id: string, fallback: DenseChapterLink): DenseChapterLink => configuredDirectoryEntries.get(id) ?? fallback;
    const primerEntry = configuredDirectoryEntries.get(`${module.slug}-english-primer-title`)
      ?? configuredEntry(primer.id, { id: `${module.slug}-english-primer-title`, label: "Primer", eyebrow: "Start with the model" });
    const directories = {
      quick: [
        primerEntry,
        ...groupIdsByMode.quick.map(directoryEntryForGroup),
      ],
      learn: groupIdsByMode.learn.map(directoryEntryForGroup),
      field: unifiedConfig.fieldGroupsBeforeEvidence
        ? [
          ...groupIdsByMode.field.map(directoryEntryForGroup),
          configuredEntry("evidence", { id: "evidence", label: "Evidence and limits", eyebrow: "State what sources prove" }),
          configuredEntry("qa", { id: "qa", label: "Customer questions", eyebrow: "Answer with boundaries" }),
          configuredEntry("related-modules", { id: "related-modules", label: "Related modules", eyebrow: "Explore adjacent topics" }),
        ]
        : [
          configuredEntry("evidence", { id: "evidence", label: "Evidence and limits", eyebrow: "State what sources prove" }),
          ...groupIdsByMode.field.map(directoryEntryForGroup),
          configuredEntry("qa", { id: "qa", label: "Customer questions", eyebrow: "Answer with boundaries" }),
          configuredEntry("related-modules", { id: "related-modules", label: "Related modules", eyebrow: "Explore adjacent topics" }),
        ],
    } satisfies EnglishUnifiedReaderConfig["directories"];
    const chapters = [...directories.quick, ...directories.learn, ...directories.field];

    // The deferred learn/field panels recompute their projection on the client
    // from the per-module English source file; they only receive the small
    // serializable reader config, the merged source metadata, and the related
    // module links instead of whole content trees.
    const panelConfig = {
      groupIds: unifiedConfig.groupIds,
      fieldGroupsBeforeEvidence: unifiedConfig.fieldGroupsBeforeEvidence,
      completeFocusedProjection: unifiedConfig.completeFocusedProjection,
    };
    const panelSourceMeta = Object.fromEntries(Object.keys(englishSourceCopyMap).map((sourceId) => [
      sourceId,
      {
        kind: englishSourceCopyMap[sourceId]?.kind ?? "",
        shortTitle: englishSourceCopyMap[sourceId]?.shortTitle ?? sourceId,
        grade: sourceLedger[sourceId]?.grade ?? "",
      },
    ]));
    const panelRelatedModules = module.relatedSlugs.map((slug) => {
      const related = getModuleBySlug(slug);
      if (!related) throw new Error(`Unknown related module: ${slug}`);
      const availableInEnglish = englishModuleSlugs.includes(slug);
      return {
        href: availableInEnglish ? `/en/modules/${slug}` : related.href,
        layerNo: related.layerNo,
        en: related.en,
        availableInEnglish,
      };
    });
    const panelManifest = moduleManifests.find((manifest) => manifest.slug === module.slug);
    const panelAuthored = !panelManifest?.brief || panelManifest.brief.presentation === "dedicated";

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
                directories={directories}
                field={<EnglishFieldPanel slug={module.slug} authored={panelAuthored} config={panelConfig} focused={usesFocusedReadingProfile} relatedModules={panelRelatedModules} sourceMeta={panelSourceMeta} />}
                hashGroups={groupIdsByMode}
                learn={<EnglishLearnPanel slug={module.slug} authored={panelAuthored} config={panelConfig} sourceMeta={panelSourceMeta} />}
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
        <SiteNav
          locale="en"
          ariaLabel="Module navigation"
          brand="presales"
          brandAriaLabel="Return to the fieldbook home"
          brandPrefetch={false}
          links={[
            { href: "#qa", label: "Questions" },
            { href: "/en/glossary", label: "Glossary", prefetch: false },
            { href: "/en/questions", label: "All customer questions", prefetch: false },
            { href: "/en/references", label: "References", prefetch: false },
            { href: `/modules/${module.slug}`, label: "Chinese", hrefLang: "zh-CN", lang: "zh-CN", prefetch: false },
          ]}
        />
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

          {visibleSectionGroups.map((group, index) => <EnglishSectionGroupView group={group} number={index + 2} key={group.id} />)}

          {renderEvidenceSection(visibleSectionGroups.length + 2)}

          {renderQaSection(visibleSectionGroups.length + 3)}
          {usesFocusedReadingProfile ? renderRelatedSection(visibleSectionGroups.length + 4) : null}
        </div>
      </div>

      {pageFooter}
    </main>
  );
}

// Kept as an internal compatibility alias while the full locale routes replace the pilot routes.
export const EnglishPilotModulePage = EnglishModulePage;
