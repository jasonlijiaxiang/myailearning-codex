import type { CSSProperties } from "react";
import Link from "next/link";

import { KnowledgeSearchLaunch, ModuleExplorer, ReadingProgress, type ExplorerModule, type KnowledgeSearchEntry } from "../fieldbook-interactions";
import { englishModuleRegistry, englishSourceCopy, englishTermCopy } from "../i18n/en/registry.mjs";
import { balanceGridRows, gridSpan } from "../layout-utils.mjs";
import { layers, moduleList } from "../knowledge-map.mjs";
import { publishedModuleSlugs } from "../module-publication.mjs";
import { sourceLedger } from "../reference-content.mjs";
import { homepageTermGroups } from "../terminology.mjs";

const englishModuleCount = Object.keys(englishModuleRegistry).length;
const totalModuleCount = moduleList.length;
const layerCount = layers.length;
const editionComplete = englishModuleCount === totalModuleCount;
const layerNames = new Map(layers.map((layer) => [layer.no, layer.en]));

const explorerModules: ExplorerModule[] = publishedModuleSlugs.map((slug) => {
  const canonical = moduleList.find((module) => module.slug === slug);
  const localized = englishModuleRegistry[slug];
  if (!canonical || !localized) throw new Error(`English module discovery data is incomplete: ${slug}`);
  return {
    ...canonical,
    href: `/en/modules/${slug}`,
    title: localized.title,
    subtitle: localized.subtitle,
    layerName: layerNames.get(canonical.layerNo) ?? canonical.layerName,
    summary: localized.definition,
    cue: localized.position,
  };
});

const knowledgeSearchEntries: KnowledgeSearchEntry[] = [
  ...Object.entries(englishTermCopy).map(([termId, term]) => ({
    id: `term-${termId}`,
    type: "Technical term",
    title: `${term.name}${term.abbr ? ` (${term.abbr})` : ""}`,
    subtitle: "Field glossary",
    href: `/en/glossary#term-${termId}`,
    keywords: `${term.name} ${term.abbr ?? ""} ${term.definition}`,
  })),
  ...Object.values(englishModuleRegistry).flatMap((module) => module.qa.map((item) => ({
    id: `qa-${module.slug}-${item.id}`,
    type: "Customer question",
    title: item.q,
    subtitle: `${module.title} · ${item.tag}`,
    href: `/en/modules/${module.slug}#qa-${item.id}`,
    keywords: `${module.title} ${item.q} ${item.a} ${item.depth} ${item.ask} ${item.tag}`,
  }))),
  ...Object.values(englishModuleRegistry).flatMap((module) => module.sections.flatMap((section) => section.blocks.flatMap((contentBlock) => contentBlock.items.map((item) => ({
    id: `section-${module.slug}-${item.id}`,
    type: "Module section",
    title: item.title,
    subtitle: `${module.title} · ${section.title}`,
    href: `/en/modules/${module.slug}#${item.id}`,
    keywords: `${module.title} ${section.title} ${section.lead ?? ""} ${item.title} ${item.body ?? ""} ${item.decision ?? ""} ${item.boundary ?? ""} ${(item.cells ?? []).join(" ")}`,
  }))))),
  ...Object.entries(englishSourceCopy).map(([sourceId, source]) => ({
    id: `source-${sourceId}`,
    type: "Source evidence",
    title: source.shortTitle,
    subtitle: `${sourceLedger[sourceId]?.grade ?? ""} evidence · ${source.kind}`,
    href: `/en/references#source-${sourceId}`,
    keywords: `${source.shortTitle} ${source.kind} ${source.note} ${sourceLedger[sourceId]?.title ?? ""}`,
  })),
];

const searchLabels = {
  ariaLabel: "Search the fieldbook",
  label: "Search modules, terms, customer questions, and sources",
  placeholder: "Try access inheritance, KV cache, tool authorization…",
  submit: "Search",
};

const explorerLabels = {
  kicker: "FIND THE RIGHT MODULE",
  title: "Start with the customer problem in front of you",
  intro: "Search a technology, scenario, constraint, or risk and move directly into the most relevant module or knowledge item.",
  searchLabel: "Search modules and knowledge",
  placeholder: "Try knowledge updates, quantization, tool calls, GPU utilization…",
  filterAria: "Filter by knowledge layer",
  allLayers: "All",
  foundPrefix: "Found",
  moduleNoun: "modules",
  knowledgeHitsPrefix: "plus",
  knowledgeHitsSuffix: "knowledge matches",
  questionsLink: "Browse all customer questions ↗",
  clear: "Clear filters",
  knowledgeAria: "Knowledge search results",
  knowledgeHeading: "Open the matching knowledge directly",
  showingPrefix: "Showing",
  showingSuffix: "matches",
  emptyTitle: "No module matches this search",
  emptyBody: "Try a different customer problem or clear the layer filter.",
};

const englishHomepageTermGroups = homepageTermGroups.map((group, index) => ({
  label: ["Models & inference", "Applications & context", "Protocols & platform", "Governance & delivery"][index],
  termIds: group.termIds,
}));

const learningPaths = [
  { no: "01", title: "First AI platform conversation", time: "Build a complete point of view", route: "Solution patterns → Model landscape → LLM → Evaluation", outcome: "Clarify the customer outcome before discussing models and products." },
  { no: "02", title: "Designing an enterprise knowledge assistant", time: "Plan a defensible PoC", route: "Data engineering → RAG → Security → AI gateway → AI Ops", outcome: "Connect knowledge, permissions, answer quality, and production operations." },
  { no: "03", title: "Letting AI execute business work", time: "Control action risk", route: "Agent → MCP / A2A → Security → Evaluation → AI Ops", outcome: "Separate model decisions, tool permissions, durable tasks, and authoritative business outcomes." },
  { no: "04", title: "Planning private AI infrastructure", time: "Build capacity evidence", route: "Model landscape → Inference → Platform → Compute → Data engineering", outcome: "Work backward from real workloads to serving, scheduling, networks, storage, and procurement." },
];

function EnglishHomeTermGroups() {
  return (
    <aside className="termHintGroups" aria-label="Core technical terms; hover, focus, or tap for definitions">
      <div className="termHintGroupList">
        {englishHomepageTermGroups.map((group) => (
          <section className="termHintGroup" key={group.label}>
            <h3>{group.label}</h3>
            <div>{group.termIds.map((termId) => {
              const term = englishTermCopy[termId];
              if (!term) throw new Error(`Unknown homepage term: ${termId}`);
              const label = term.abbr ?? term.name;
              return (
                <details className="termHint" data-term-id={termId} key={termId}>
                  <summary aria-label={`${label}: ${term.name}. ${term.definition}`}><span>{label}</span><i aria-hidden="true">?</i></summary>
                  <div className="termHintPopover"><span>{label}</span><strong>{term.name}</strong><p>{term.definition}</p></div>
                </details>
              );
            })}</div>
          </section>
        ))}
      </div>
      <footer><span>High-frequency concepts used across modules</span><Link href="/en/glossary" prefetch={false}>View all {Object.keys(englishTermCopy).length} terms <i aria-hidden="true">→</i></Link></footer>
    </aside>
  );
}

export default function EnglishHome() {
  return (
    <main lang="en" className="fieldbookHome">
      <ReadingProgress />
      <header className="hero heroV2" id="top">
        <nav className="topbar" aria-label="Main navigation">
          <Link className="brand" href="/en" prefetch={false}><span><strong>Cloud × AI Presales Fieldbook</strong><small>Evidence-backed technical field guide</small></span></Link>
          <div className="toplinks"><Link href="/en/questions" prefetch={false}>Questions</Link><Link href="/en/glossary" prefetch={false}>Glossary</Link><a href="#available-modules">Find modules</a><Link href="/en/knowledge-graph" prefetch={false}>Dynamic explorer</Link><Link href="/en/references" prefetch={false}>References</Link><Link href="/" hrefLang="zh-CN" lang="zh-CN" prefetch={false}>中文</Link></div>
        </nav>
        <div className="heroGrid heroGridV2">
          <div className="heroCopy"><p className="kicker">EVIDENCE-BACKED FIELD GUIDE</p><h1>Turn complex AI technology<br />into decisions customers can act on</h1><p className="heroLead">A technical fieldbook that connects principles, architecture, failure analysis, cloud capabilities, acceptance evidence, and customer-ready answers—built for focused learning and live presales conversations.</p><KnowledgeSearchLaunch labels={searchLabels} /><div className="heroActions"><a className="textButton" href="#learning-paths">Follow a mission-based path <span>→</span></a><a className="textButton" href="#map">Browse the knowledge map <span>→</span></a></div></div>
          <aside className="heroDecisionPanel" aria-label="Ways to use the fieldbook"><h2>Use the same knowledge at three reading depths</h2><ol><li><span>30 sec</span><div><strong>Get the decision first</strong><p>See the definition, use case, critical boundary, and next discovery question immediately.</p></div></li><li><span>10 min</span><div><strong>Understand the system</strong><p>Follow inputs, processing, outputs, failure points, and control responsibilities.</p></div></li><li><span>Meeting</span><div><strong>Search questions and verify</strong><p>Move from a customer question to the short answer, deeper reasoning, and primary evidence.</p></div></li></ol><div className="heroDecisionFoot"><strong>{englishModuleCount}</strong><span>independent modules</span><strong>{layerCount}</strong><span>knowledge layers</span></div></aside>
        </div>
      </header>

      <div id="available-modules" className="explorerAnchor">
        <ModuleExplorer modules={explorerModules} knowledgeEntries={knowledgeSearchEntries} labels={explorerLabels} locale="en-US" questionsHref="/en/questions" />
      </div>

      <section className="homeTermGuide" aria-labelledby="english-home-term-guide-title">
        <div><p className="kicker">FIELD GLOSSARY</p><h2 id="english-home-term-guide-title">Core terminology at a glance</h2><p>Build the knowledge map through high-frequency concepts, then move into the full glossary for definitions, boundaries, and related modules.</p></div>
        <EnglishHomeTermGroups />
      </section>

      <section className="fieldbookPromise" aria-labelledby="english-reading-depth-title">
        <div className="promiseIntro"><p className="kicker">READING EXPERIENCE</p><h2 id="english-reading-depth-title">One fieldbook, three reading depths</h2></div>
        <div className="promiseGrid">
          <article><span>30 sec</span><h3>Reach a defensible judgment</h3><p>Start with the definition, customer problem, recommended direction, and boundary that must not be crossed.</p></article>
          <article><span>10 min</span><h3>Understand why the system works this way</h3><p>Connect the mechanism, data flow, control owner, operating evidence, and common failure modes.</p></article>
          <article><span>Customer meeting</span><h3>Answer, probe, and return to evidence</h3><p>Use decision-ready answers, recommended discovery questions, and traceable source boundaries in one place.</p></article>
        </div>
      </section>

      <section className="section mapSection mapSectionV2" id="map" aria-labelledby="english-map-title">
        <div className="sectionNumber">01</div><div className="sectionBody"><div className="sectionIntro splitIntro mapIntro"><div className="mapHeading"><p className="kicker">KNOWLEDGE SYSTEM</p><h2 id="english-map-title">{editionComplete ? `The complete ${totalModuleCount}-module fieldbook` : `${englishModuleCount} professionally reviewed modules`}</h2><div className="mapStats" aria-label={`${layerCount} knowledge layers and ${englishModuleCount} modules`}><span className="mapStat"><strong>{layerCount}</strong><span>knowledge layers</span></span><span className="mapStat"><strong>{englishModuleCount}</strong><span>modules</span></span></div></div><div className="mapIntroGuide"><p>{editionComplete ? "Move from the customer outcome through applications and interoperability, then into delivery, models, data, and compute." : "Module coverage is expanding under the same evidence and quality contract."}</p><Link className="mapGraphLink" href="/en/knowledge-graph" prefetch={false}><span><strong>Explore module relationships</strong><small>Open the dynamic knowledge explorer</small></span><i aria-hidden="true">→</i></Link></div></div>
          <div className="layerStack layerStackV2">
            {layers.map((layer) => {
              const availableModules = layer.modules.filter((module) => englishModuleRegistry[module.slug]);
              if (!availableModules.length) return null;
              return (
                <article className="layer" key={layer.no}>
                  <div className="layerIndex">{layer.no}</div>
                  <div className="layerTitle"><h3>{layer.en}</h3><p>Knowledge layer</p></div>
                  <div className="layerContent">
                    <div className="chips" data-count={availableModules.length} data-odd={availableModules.length % 2 === 1 ? "true" : "false"}>
                      {balanceGridRows(availableModules, 4).flatMap((row) => row.map((canonicalModule) => {
                        const localizedModule = englishModuleRegistry[canonicalModule.slug];
                        return <Link key={localizedModule.slug} href={`/en/modules/${localizedModule.slug}`} prefetch={false} style={{ "--module-span": gridSpan(row.length) } as CSSProperties} aria-label={`Open ${localizedModule.title}`}><strong>{localizedModule.title}</strong><small>{localizedModule.subtitle}</small><i aria-hidden="true">↗</i></Link>;
                      }))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="learningPathsV2" id="learning-paths" aria-labelledby="english-learning-paths-title">
        <header><p className="kicker">MISSION-BASED PATHS</p><h2 id="english-learning-paths-title">Follow the customer task, not the table of contents</h2><p>Each path ends in a customer decision and an evidence-bearing deliverable—not merely a list of modules read.</p></header>
        <div className="learningPathList">{learningPaths.map((path) => <article key={path.no}><span>{path.no}</span><div><p>{path.time}</p><h3>{path.title}</h3></div><strong>{path.route}</strong><p>{path.outcome}</p></article>)}</div>
      </section>
      <footer><div><strong>Cloud × AI Presales Fieldbook</strong></div><p>{englishModuleCount} modules · {layerCount} knowledge layers</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
