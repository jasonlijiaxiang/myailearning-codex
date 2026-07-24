import type { CSSProperties } from "react";
import Link from "next/link";

import { ModuleReadingNav, ReadingProgress, type ReadingSection } from "../fieldbook-interactions";
import { balanceGridRows, gridSpan } from "../layout-utils.mjs";
import { getModuleBySlug } from "../knowledge-map.mjs";
import { ModuleHeroMetrics } from "../module-content-components";
import { requireModuleExtensionView } from "../module-extension-views.mjs";
import { getPublishedModule } from "../module-publication.mjs";
import { sourceLedger } from "../reference-content.mjs";
import { englishSourceCopy } from "./en/registry.mjs";
import { buildEnglishSectionGroups } from "./english-section-outline.mjs";
import { englishModuleSlugs } from "./locale-config.mjs";

type SourceRef = { sourceId: string; supports?: string };
type BlockItem = {
  id: string;
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
  return (
    <section className={`pilotPrimer extensionPrimer extensionPrimer--${primer.layout}`} data-knowledge-view={primer.id} aria-labelledby={`${module.slug}-english-primer-title`}>
      <header className="pilotPrimerHeader">
        <div><p className="kicker">{primer.eyebrow}</p><h2 id={`${module.slug}-english-primer-title`}>{primer.title}</h2></div>
        <p>{primer.intro}</p>
      </header>
      <EnglishTermHintRow module={module} primer={primer} />
      <div className="extensionPrimerBody">
        <ol className="extensionPrimerMap" aria-label={`${primer.title}: key stages`}>
          {primer.steps.map((step) => (
            <li key={step.code}><span>{step.code}</span><div><p className="miniLabel">{step.label}</p><h3>{step.title}</h3><p>{step.detail}</p><strong>{step.signal}</strong></div></li>
          ))}
        </ol>
        <aside className="extensionPrimerChecks" aria-label="Decision checks">
          <p className="miniLabel">DECISION CHECKS</p>
          {primer.checks.map((check, index) => <article key={check.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{check.title}</h3><p>{check.detail}</p></div></article>)}
        </aside>
      </div>
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
  "solution-patterns": 4,
  rag: 4,
  "ai-agent": 4,
  security: 5,
  llm: 6,
  "fine-tuning": 6,
};

function deriveEnglishPrimer(module: EnglishModule, knowledgeView: string): EnglishPrimer {
  let layout = specialPrimerLayouts[module.slug];
  let stepCount = specialPrimerStepCounts[module.slug];
  if (!layout) {
    const canonicalView = requireModuleExtensionView(module.slug) as { layout: EnglishPrimer["layout"]; steps: unknown[] };
    layout = canonicalView.layout;
    stepCount = canonicalView.steps.length;
  }

  const primarySection = module.sections.find((section) => /(?:principle|architecture|operating-model|flywheel|lifecycle|threat|blueprint|coordinate|context|protocol-model|policy-data-plane)/.test(section.id)) ?? module.sections[0];
  const orderedSections = [primarySection, ...module.sections.filter((section) => section !== primarySection)];
  const primaryItems = orderedSections.flatMap((section) => section.blocks.flatMap((block) => block.items));
  const decisionSection = module.sections.find((section) => /(?:decision|choice|when-to-use|release-evidence)/.test(section.id));
  const decisionItems = decisionSection?.blocks.flatMap((block) => block.items) ?? [];
  const termIds = Object.entries(module.terms)
    .sort(([, left], [, right]) => Number(Boolean(right.abbr)) - Number(Boolean(left.abbr)))
    .slice(0, 5)
    .map(([termId]) => termId);
  const fallbackChecks = primaryItems.slice(0, 3).map((item) => ({ title: item.title, detail: item.decision ?? item.boundary ?? item.body ?? "Validate this stage against the customer workload." }));

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
    links: module.sections.slice(0, 3).map((section) => ({ href: `#${section.id}`, label: `Review ${section.title}` })),
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

function CardItem({ item }: { item: BlockItem }) {
  return (
    <article id={item.id}>
      {item.subtitle ? <p className="miniLabel">{item.subtitle}</p> : null}
      <h4>{item.title}</h4>
      {item.body ? <p>{item.body}</p> : null}
      {item.decision ? <strong>{item.decision}</strong> : null}
      {item.boundary ? <small>{item.boundary}</small> : null}
      <SourceLinks sourceIds={item.sourceIds} />
    </article>
  );
}

function ContentBlockView({ block }: { block: ContentBlock }) {
  if (block.type === "boundary") {
    return (
      <aside className="callout" data-importance="critical">
        <div className="calloutTitle"><span>High-impact limitation</span><strong>{block.title ?? "Critical boundary"}</strong><small>Verify before you commit</small></div>
        {block.intro ? <p>{block.intro}</p> : null}
        {block.items.map((item) => <CardItem item={item} key={item.id} />)}
      </aside>
    );
  }

  if (block.type === "table") {
    const columns = block.columns ?? ["Topic", "Mechanism", "Decision", "Boundary"];
    const explicitCellCount = Math.max(0, ...block.items.map((item) => item.cells?.length ?? 0));
    const renderedColumns = explicitCellCount > 0 && columns.length === explicitCellCount ? ["Topic", ...columns] : columns;
    return (
      <div className="tableWrap">
        {block.title ? <h3>{block.title}</h3> : null}
        {block.intro ? <p>{block.intro}</p> : null}
        <table><thead><tr>{renderedColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>
          {block.items.map((item) => {
            const cells = item.cells ? [item.title, ...item.cells] : [item.title, item.body ?? "—", item.decision ?? "—", item.boundary ?? "—"];
            return <tr id={item.id} key={item.id}>{cells.map((cell, index) => index === 0 ? <th key={`${item.id}-${index}`}>{cell}</th> : <td key={`${item.id}-${index}`}>{cell}{index === cells.length - 1 ? <SourceLinks sourceIds={item.sourceIds} /> : null}</td>)}</tr>;
          })}
        </tbody></table>
      </div>
    );
  }

  if (block.type === "steps") {
    return (
      <div>
        {block.title ? <h3>{block.title}</h3> : null}
        {block.intro ? <p>{block.intro}</p> : null}
        <ol className="deepDiveSequence" data-count={block.items.length}>
          {block.items.map((item, index) => (
            <li id={item.id} key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><div><h4>{item.title}{item.subtitle ? <small>{item.subtitle}</small> : null}</h4>{item.body ? <p>{item.body}</p> : null}{item.decision ? <strong>{item.decision}</strong> : null}{item.boundary ? <em>{item.boundary}</em> : null}<SourceLinks sourceIds={item.sourceIds} /></div></li>
          ))}
        </ol>
      </div>
    );
  }

  const rows = balanceGridRows(block.items, 3);
  return (
    <div>
      {block.title ? <h3>{block.title}</h3> : null}
      {block.intro ? <p>{block.intro}</p> : null}
      <div className="balancedGrid deepDiveCards deepDiveCards--scenario" data-count={block.items.length} data-odd={block.items.length % 2 === 1 ? "true" : "false"}>
        {rows.flatMap((row) => row.map((item) => (
          <div className="balancedGridCell" key={item.id} style={{ "--balanced-span": gridSpan(row.length) } as CSSProperties}><CardItem item={item} /></div>
        )))}
      </div>
    </div>
  );
}

function EnglishSectionGroupView({ group, number }: { group: EnglishSectionGroup; number: number }) {
  const singleSection = group.sections.length === 1 ? group.sections[0] : null;
  return (
    <section className="subsection moduleBriefSection" id={group.id} data-section-role={group.role}>
      <div className="subHead">
        <span>{String(number).padStart(2, "0")}</span>
        <div>
          <p className="kicker">{singleSection?.eyebrow ?? group.eyebrow}</p>
          <h2>{singleSection?.title ?? group.label}</h2>
        </div>
      </div>
      {group.sections.map((section) => (
        <div id={section.id === group.id ? undefined : section.id} key={section.id}>
          {!singleSection ? <div className="moduleBriefIntro"><p className="miniLabel">{section.eyebrow}</p><h3>{section.title}</h3></div> : null}
          {section.lead ? <p className="sectionLead">{section.lead}</p> : null}
          {section.blocks.map((block, index) => <ContentBlockView block={block} key={`${section.id}-${index}`} />)}
        </div>
      ))}
    </section>
  );
}

export function EnglishModulePage({ module }: { module: EnglishModule }) {
  const publication = getPublishedModule(module.slug);
  if (!publication) throw new Error(`English module is not published in Chinese: ${module.slug}`);
  const canonicalModule = getModuleBySlug(module.slug);
  if (!canonicalModule) throw new Error(`English module is missing from the knowledge map: ${module.slug}`);
  if (!publication.knowledgeView) throw new Error(`English module is missing its canonical knowledge view: ${module.slug}`);
  const primer = module.primer ?? deriveEnglishPrimer(module, publication.knowledgeView);
  const sectionGroups = buildEnglishSectionGroups(module) as EnglishSectionGroup[];
  const usesFocusedReadingProfile = publication.readingProfile === "focused";
  const cloudGroups = sectionGroups.filter((group) => group.role === "cloud");
  const mainGroups = sectionGroups.filter((group) => group.role !== "cloud");
  const contentReadingSections: ReadingSection[] = [
    ...mainGroups.map((group) => ({ id: group.id, label: group.label, eyebrow: group.eyebrow })),
    { id: "evidence", label: "Evidence and limits", eyebrow: "Know what sources prove" },
    ...cloudGroups.map((group) => ({ id: group.id, label: group.label, eyebrow: group.eyebrow })),
    { id: "qa", label: "Customer questions", eyebrow: "Use in customer conversations" },
  ];
  const relatedReadingSection: ReadingSection = { id: "related-modules", label: "Related modules", eyebrow: "Build connections" };
  const readingSections = usesFocusedReadingProfile
    ? [...contentReadingSections, relatedReadingSection]
    : [relatedReadingSection, ...contentReadingSections];
  const relatedSection = (
    <section className={`subsection moduleBriefRelated${usesFocusedReadingProfile ? " focusedRelated" : ""}`} id="related-modules">
      <div className="subHead"><span>{usesFocusedReadingProfile ? "06" : "01"}</span><div><p className="kicker">RELATED MODULES</p><h2>Continue through the knowledge map</h2></div></div>
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

  return (
    <main lang="en" className={`modulePage moduleBriefPage${publication.visualProfile === "dense-reading" ? " modulePilot" : ""}${usesFocusedReadingProfile ? " moduleFocused" : ""}`}>
      <ReadingProgress />
      <header className="modulePageHero moduleBriefHero" id="top">
        <nav className="topbar" aria-label="Module navigation">
          <Link className="brand" href="/en" aria-label="Return to the fieldbook home" prefetch={false}><span>Cloud × AI / Presales Fieldbook</span></Link>
          <div className="toplinks">
            <a href="#qa">Questions</a>
            <Link href="/en/glossary" prefetch={false}>Glossary</Link>
            <Link href="/en/questions" prefetch={false}>All customer questions</Link>
            <Link href="/en/references" prefetch={false}>References</Link>
            <Link href={`/modules/${module.slug}`} hrefLang="zh-CN" lang="zh-CN" prefetch={false}>中文</Link>
          </div>
        </nav>
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
          { href: `/modules/${module.slug}`, label: "中文原版" },
        ]} labels={{ navigation: "section navigation", progress: "Reading", quickLinks: "Quick links" }} />
        <div className="moduleArticleContent">
          <EnglishModulePrimer module={module} primer={primer} />
          {!usesFocusedReadingProfile ? relatedSection : null}

          {mainGroups.map((group, index) => <EnglishSectionGroupView group={group} number={index + 2} key={group.id} />)}

          <section className="subsection moduleBriefSection" id="evidence">
            <div className="subHead"><span>{String(mainGroups.length + 2).padStart(2, "0")}</span><div><p className="kicker">EVIDENCE WITH LIMITS</p><h2>Evidence cards</h2></div></div>
            <div className="evidenceGrid" data-count={module.evidenceCards.length} data-odd={module.evidenceCards.length % 2 === 1 ? "true" : "false"}>{balanceGridRows(module.evidenceCards, 3).flatMap((row) => row.map((card) => {
              const source = sourceLedger[card.sourceId];
              const localizedSource = englishSourceCopy[card.sourceId];
              if (!source || !localizedSource) throw new Error(`Unknown evidence sourceId: ${card.sourceId}`);
              return <article className={`metricCard${card.accent ? " accent" : ""}`} id={`evidence-${card.id}`} key={card.id} style={{ "--evidence-span": gridSpan(row.length) } as CSSProperties}><p className="metric">{card.metric}</p><h4>{card.title}</h4><p className="metricFinding">{card.finding}</p><p className="metricBoundary"><strong>Evidence limit</strong>{card.boundary}</p><Link href={`/en/references#source-${card.sourceId}`} prefetch={false}>{localizedSource.shortTitle} ↘</Link></article>;
            }))}</div>
          </section>

          {cloudGroups.map((group, index) => <EnglishSectionGroupView group={group} number={mainGroups.length + index + 3} key={group.id} />)}

          <section className="subsection moduleBriefSection qaSection" id="qa">
            <div className="subHead"><span>{String(mainGroups.length + cloudGroups.length + 3).padStart(2, "0")}</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h2>Common questions and evidence-backed answers</h2></div></div>
            <div className="qaList">{module.qa.map((item, index) => (
              <details className="qaItem" id={`qa-${item.id}`} key={item.id}>
                <summary><span className="qaNo">Q{String(index + 1).padStart(2, "0")}</span><span className="qaQuestion"><strong>{item.q}</strong>{item.addedAt ? <small>Added on {item.addedAt}</small> : null}</span><span className="qaTag">{item.tag}</span><span className="plus">＋</span></summary>
                <div className="qaAnswer">
                  <div><p className="answerLabel">SHORT ANSWER</p><p>{item.a}</p></div>
                  <div><p className="answerLabel">TECHNICAL DETAIL</p><p>{item.depth}</p></div>
                  <div className="qaBasis" aria-label="Evidence for this answer"><div className="qaBasisHead"><p className="answerLabel">EVIDENCE AND LIMITS</p><span>{item.basis}</span></div><div className="qaBasisList" data-count={item.evidence.length} data-odd={item.evidence.length % 2 === 1 ? "true" : "false"}>{balanceGridRows(item.evidence, 3).flatMap((row) => row.map((evidence) => <Link href={`/en/references#source-${evidence.sourceId}`} key={evidence.sourceId} prefetch={false} style={{ "--qa-evidence-span": gridSpan(row.length) } as CSSProperties}><span className="qaEvidenceMeta">{sourceLedger[evidence.sourceId]?.grade} · {englishSourceCopy[evidence.sourceId]?.kind}</span><strong>{englishSourceCopy[evidence.sourceId]?.shortTitle ?? evidence.sourceId}</strong><small>{evidence.supports}</small></Link>))}</div></div>
                  <div className="ask"><p className="answerLabel">RECOMMENDED DISCOVERY QUESTION</p><p>{item.ask}</p></div>
                </div>
              </details>
            ))}</div>
          </section>
          {usesFocusedReadingProfile ? relatedSection : null}
        </div>
      </div>

      <footer><div><strong>Cloud × AI Presales Fieldbook</strong></div><p>{module.title}</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}

// Kept as an internal compatibility alias while the full locale routes replace the pilot routes.
export const EnglishPilotModulePage = EnglishModulePage;
