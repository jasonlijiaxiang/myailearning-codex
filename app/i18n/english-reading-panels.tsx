"use client";

import { use, type CSSProperties } from "react";
import Link from "next/link";

import { DeepDiveRelationView } from "../deep-dive-relation-view";
import { balanceGridRows, gridSpan } from "../layout-utils.mjs";
import { buildEnglishSectionGroups } from "./english-section-grouping.mjs";
import { shouldVisualizeEnglishSteps } from "./english-step-visualization.mjs";

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
type EnglishSectionGroup = {
  role: string;
  id: string;
  label: string;
  eyebrow: string;
  sections: EnglishSection[];
};
type EnglishReaderModeId = "quick" | "learn" | "field";

export type EnglishPanelSourceMeta = Readonly<Record<string, { kind: string; shortTitle: string; grade: string }>>;
export type EnglishPanelRelatedModule = {
  href: string;
  layerNo: string;
  en: string;
  availableInEnglish: boolean;
};
export type EnglishPanelReaderConfig = {
  groupIds: { quick: readonly string[]; learn: readonly string[]; field: readonly string[] };
  fieldGroupsBeforeEvidence: boolean;
  completeFocusedProjection?: boolean;
};

type EnglishModule = {
  slug: string;
  title: string;
  subtitle: string;
  definition: string;
  position: string;
  relatedSlugs: string[];
  sections: EnglishSection[];
  qa: Array<{ id: string; q: string; a: string; depth: string; ask: string; tag: string; basis: string; evidence: SourceRef[]; addedAt?: string }>;
  evidenceCards: Array<{ id: string; metric: string; title: string; finding: string; boundary: string; sourceId: string; accent?: boolean }>;
  terms: Record<string, { name: string; abbr?: string; definition: string }>;
};

const moduleDataCache = new Map<string, Promise<EnglishModule>>();

function loadEnglishModule(slug: string): Promise<EnglishModule> {
  let promise = moduleDataCache.get(slug);
  if (!promise) {
    promise = import(`./en/modules/${slug}.mjs`).then((module) => module.englishModule as EnglishModule);
    moduleDataCache.set(slug, promise);
  }
  return promise;
}

function SourceLinks({ sourceIds, sourceMeta }: { sourceIds?: string[]; sourceMeta: EnglishPanelSourceMeta }) {
  if (!sourceIds?.length) return null;
  return (
    <div className="deepDiveSources" aria-label="Sources for this section">
      <span>Sources</span>
      {[...new Set(sourceIds)].map((sourceId) => {
        const localizedSource = sourceMeta[sourceId];
        if (!localizedSource) throw new Error(`Unknown English sourceId: ${sourceId}`);
        return <Link href={`/en/references#source-${sourceId}`} key={sourceId} prefetch={false}>{localizedSource.shortTitle} ↘</Link>;
      })}
    </div>
  );
}

function CardItem({ item, headingLevel = 3, sourceMeta }: { item: BlockItem; headingLevel?: 3 | 4; sourceMeta: EnglishPanelSourceMeta }) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  return (
    <article id={item.id}>
      {item.subtitle ? <p className="miniLabel">{item.subtitle}</p> : null}
      <Heading>{item.title}</Heading>
      {item.body ? <p>{item.body}</p> : null}
      {item.decision ? <strong>{item.decision}</strong> : null}
      {item.boundary ? <small>{item.boundary}</small> : null}
      <SourceLinks sourceIds={item.sourceIds} sourceMeta={sourceMeta} />
    </article>
  );
}

function EditorialStepList({ block, sourceMeta }: { block: ContentBlock; sourceMeta: EnglishPanelSourceMeta }) {
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
            <SourceLinks sourceIds={item.sourceIds} sourceMeta={sourceMeta} />
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

function ContentBlockView({ block, sectionId, sourceMeta }: { block: ContentBlock; sectionId: string; sourceMeta: EnglishPanelSourceMeta }) {
  const title = readerBlockTitle(block, sectionId);
  const legacyAnchors = block.items.flatMap((item) => item.legacyIds ?? []).map((legacyId) => <span className="anchorAlias" id={legacyId} aria-hidden="true" key={legacyId} />);
  if (block.type === "boundary") {
    return (
      <aside className="callout" data-importance="critical">
        {legacyAnchors}
        <div className="calloutTitle"><span>High-impact limitation</span><h3>{title ?? "Critical boundary"}</h3><small>Verify before you commit</small></div>
        {block.intro ? <p>{block.intro}</p> : null}
        {block.items.map((item) => <CardItem item={item} headingLevel={title ? 4 : 3} sourceMeta={sourceMeta} key={item.id} />)}
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
            return <tr id={item.id} key={item.id}>{cells.map((cell, index) => index === 0 ? <th scope="row" key={`${item.id}-${index}`}>{cell}</th> : <td key={`${item.id}-${index}`}>{cell}{index === cells.length - 1 ? <SourceLinks sourceIds={item.sourceIds} sourceMeta={sourceMeta} /> : null}</td>)}</tr>;
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
          <EditorialStepList block={block} sourceMeta={sourceMeta} />
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
        <SourceLinks sourceIds={sourceIds} sourceMeta={sourceMeta} />
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
          <div className="balancedGridCell" key={item.id} style={{ "--balanced-span": gridSpan(row.length) } as CSSProperties}><CardItem item={item} headingLevel={title ? 4 : 3} sourceMeta={sourceMeta} /></div>
        )))}
      </div>
    </div>
  );
}

function EnglishSectionGroupView({ group, number, sourceMeta }: { group: EnglishSectionGroup; number: number; sourceMeta: EnglishPanelSourceMeta }) {
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
          {section.blocks.map((block, index) => <ContentBlockView block={block} sectionId={section.id} sourceMeta={sourceMeta} key={`${section.id}-${index}`} />)}
        </div>
      ))}
    </section>
  );
}

/**
 * The systematic-study and field panels render on the client only. They
 * recompute the same authored projection the server page uses for the reader
 * directories, so the mounted panel keeps identical numbering and content.
 */
function useEnglishReaderProjection(slug: string, config: EnglishPanelReaderConfig, authored: boolean) {
  const localizedModule = use(loadEnglishModule(slug));
  const sectionGroups = buildEnglishSectionGroups(localizedModule, authored) as EnglishSectionGroup[];
  const configuredModeByGroupId = new Map<string, EnglishReaderModeId>();
  for (const mode of ["quick", "learn", "field"] as const) {
    for (const groupId of config.groupIds[mode]) configuredModeByGroupId.set(groupId, mode);
  }
  const groupIdsByMode: Record<EnglishReaderModeId, string[]> = { quick: [], learn: [], field: [] };
  for (const group of sectionGroups) {
    groupIdsByMode[configuredModeByGroupId.get(group.id) ?? "learn"].push(group.id);
  }
  const groupById = new Map(sectionGroups.map((group) => [group.id, group]));
  const quickStart = 2;
  const learnStart = quickStart + groupIdsByMode.quick.length;
  const fieldBase = learnStart + groupIdsByMode.learn.length;
  return { module: localizedModule, sectionGroups, groupIdsByMode, groupById, learnStart, fieldBase };
}

export function EnglishLearnPanel({ slug, config, authored, sourceMeta }: {
  slug: string;
  config: EnglishPanelReaderConfig;
  authored: boolean;
  sourceMeta: EnglishPanelSourceMeta;
}) {
  const projection = useEnglishReaderProjection(slug, config, authored);
  const { groupIdsByMode, groupById, learnStart } = projection;
  return (
    <>
      {groupIdsByMode.learn.map((groupId, index) => {
        const group = groupById.get(groupId);
        if (!group) return null;
        return <EnglishSectionGroupView group={group} number={learnStart + index} sourceMeta={sourceMeta} key={group.id} />;
      })}
    </>
  );
}

export function EnglishFieldPanel({ slug, config, authored, focused, sourceMeta, relatedModules }: {
  slug: string;
  config: EnglishPanelReaderConfig;
  authored: boolean;
  focused: boolean;
  sourceMeta: EnglishPanelSourceMeta;
  relatedModules: readonly EnglishPanelRelatedModule[];
}) {
  const {
    module,
    groupIdsByMode,
    groupById,
    fieldBase,
  } = useEnglishReaderProjection(slug, config, authored);
  const fieldGroupStart = config.fieldGroupsBeforeEvidence ? fieldBase : fieldBase + 1;
  const fieldGroups = groupIdsByMode.field.map((groupId, index) => {
    const group = groupById.get(groupId);
    if (!group) return null;
    return <EnglishSectionGroupView group={group} number={fieldGroupStart + index} sourceMeta={sourceMeta} key={group.id} />;
  });
  const evidenceNumber = config.fieldGroupsBeforeEvidence
    ? fieldBase + groupIdsByMode.field.length
    : fieldBase;
  const qaNumber = fieldBase + groupIdsByMode.field.length + 1;
  const relatedNumber = qaNumber + 1;
  const renderRelatedSection = (number: number) => (
    <section aria-labelledby="related-modules-section-title" className={`subsection moduleBriefRelated${focused ? " focusedRelated" : ""}`} id="related-modules">
      <div className="subHead"><span>{String(number).padStart(2, "0")}</span><div><p className="kicker">RELATED MODULES</p><h2 id="related-modules-section-title">Continue through the knowledge map</h2></div></div>
      <div className="relatedModuleGrid" data-count={relatedModules.length} data-odd={relatedModules.length % 2 === 1 ? "true" : "false"}>
        {relatedModules.map((related) => (
          <Link href={related.href} hrefLang={related.availableInEnglish ? "en" : "zh-CN"} key={related.href} prefetch={false}><span>{related.layerNo}</span><strong>{related.en}</strong><small>{related.availableInEnglish ? "Open module" : "Available in Chinese"}</small></Link>
        ))}
      </div>
    </section>
  );
  const renderEvidenceSection = (number: number) => (
    <section aria-labelledby="evidence-section-title" className={`subsection moduleBriefSection${focused ? " focusedSection" : ""}`} id="evidence">
      <div className="subHead"><span>{String(number).padStart(2, "0")}</span><div><p className="kicker">EVIDENCE WITH LIMITS</p><h2 id="evidence-section-title">Evidence cards</h2></div></div>
      <div className="evidenceGrid" data-count={module.evidenceCards.length} data-odd={module.evidenceCards.length % 2 === 1 ? "true" : "false"}>{balanceGridRows(module.evidenceCards, 3).flatMap((row) => row.map((card) => {
        const localizedSource = sourceMeta[card.sourceId];
        if (!localizedSource) throw new Error(`Unknown evidence sourceId: ${card.sourceId}`);
        return <article className={`metricCard${card.accent ? " accent" : ""}`} id={`evidence-${card.id}`} key={card.id} style={{ "--evidence-span": gridSpan(row.length) } as CSSProperties}><p className="metric">{card.metric}</p><h3>{card.title}</h3><p className="metricFinding">{card.finding}</p><p className="metricBoundary"><strong>Evidence limit</strong>{card.boundary}</p><Link href={`/en/references#source-${card.sourceId}`} prefetch={false}>{localizedSource.shortTitle} ↘</Link></article>;
      }))}</div>
      {focused ? <p className="focusedDirectoryLink"><Link href={`/en/references?module=${module.slug}`} prefetch={false}>Review this module’s source ledger and verification dates →</Link></p> : null}
    </section>
  );
  const renderQaSection = (number: number) => (
    <section aria-labelledby="qa-section-title" className={`subsection moduleBriefSection qaSection${focused ? " focusedSection" : ""}`} id="qa">
      <div className="subHead"><span>{String(number).padStart(2, "0")}</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h2 id="qa-section-title">Common questions and evidence-backed answers</h2></div></div>
      <div className="qaList">{module.qa.map((item, index) => (
        <details className="qaItem" id={`qa-${item.id}`} key={item.id}>
          <summary><span className="qaNo">Q{String(index + 1).padStart(2, "0")}</span><span className="qaQuestion"><strong>{item.q}</strong>{item.addedAt ? <small>Added on {item.addedAt}</small> : null}</span><span className="qaTag">{item.tag}</span><span className="plus">＋</span></summary>
          <div className="qaAnswer">
            <div><p className="answerLabel">SHORT ANSWER</p><p>{item.a}</p></div>
            <div><p className="answerLabel">TECHNICAL DETAIL</p><p>{item.depth}</p></div>
            <div className="qaBasis" aria-label="Evidence for this answer"><div className="qaBasisHead"><p className="answerLabel">EVIDENCE AND LIMITS</p><span>{item.basis}</span></div><div className="qaBasisList" data-count={item.evidence.length} data-odd={item.evidence.length % 2 === 1 ? "true" : "false"}>{balanceGridRows(item.evidence, 3).flatMap((row) => row.map((evidence) => <Link href={`/en/references#source-${evidence.sourceId}`} key={evidence.sourceId} prefetch={false} style={{ "--qa-evidence-span": gridSpan(row.length) } as CSSProperties}><span className="qaEvidenceMeta">{sourceMeta[evidence.sourceId]?.grade} · {sourceMeta[evidence.sourceId]?.kind}</span><strong>{sourceMeta[evidence.sourceId]?.shortTitle ?? evidence.sourceId}</strong><small>{evidence.supports}</small></Link>))}</div></div>
            <div className="ask"><p className="answerLabel">RECOMMENDED DISCOVERY QUESTION</p><p>{discoveryQuestion(item.ask)}</p></div>
          </div>
        </details>
      ))}</div>
      {focused ? <p className="focusedDirectoryLink"><Link href={`/en/questions?module=${module.slug}`} prefetch={false}>Browse every customer question for this module →</Link></p> : null}
    </section>
  );
  return config.fieldGroupsBeforeEvidence
    ? <>{fieldGroups}{renderEvidenceSection(evidenceNumber)}{renderQaSection(qaNumber)}{renderRelatedSection(relatedNumber)}</>
    : <>{renderEvidenceSection(evidenceNumber)}{fieldGroups}{renderQaSection(qaNumber)}{renderRelatedSection(relatedNumber)}</>;
}
