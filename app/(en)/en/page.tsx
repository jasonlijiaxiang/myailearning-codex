import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { KnowledgeSearchLaunch, ModuleExplorer, ReadingProgress, type ExplorerModule } from "../../fieldbook-interactions";
import { englishPageMetadata } from "../../i18n/english-page-metadata";
import { englishModuleRegistry, englishTermCopy } from "../../i18n/en/registry.mjs";
import { balanceGridRows, gridSpan } from "../../layout-utils.mjs";
import { layers, moduleList } from "../../knowledge-map.mjs";
import { publishedModuleSlugs } from "../../module-publication.mjs";
import { homepageTermGroups } from "../../terminology.mjs";

export const metadata: Metadata = englishPageMetadata({
  title: "Cloud × AI Presales Fieldbook",
  description: "An evidence-backed fieldbook for cloud and AI presales learning, architecture decisions, and customer conversations.",
  path: "/en",
  zhPath: "/",
});

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
  indexLoading: "Loading knowledge index…",
  indexError: "Knowledge index failed to load; module filtering still works",
  emptyTitle: "No module matches this search",
  emptyBody: "Try a different customer problem or clear the layer filter.",
};

const englishHomepageTermGroups = homepageTermGroups.map((group) => ({
  label: group.en,
  termIds: group.termIds,
}));

type LearningPathModule = { slug: string; label: string };

const learningPaths: Array<{
  no: string;
  title: string;
  time: string;
  steps: LearningPathModule[][];
  outcome: string;
}> = [
  {
    no: "01",
    title: "First AI platform conversation",
    time: "Build a complete point of view",
    steps: [
      [{ slug: "solution-patterns", label: "Solution patterns" }],
      [{ slug: "model-landscape", label: "Model landscape" }],
      [{ slug: "llm", label: "LLM" }],
      [{ slug: "evaluation", label: "Evaluation" }],
    ],
    outcome: "Clarify the customer outcome before discussing models and products.",
  },
  {
    no: "02",
    title: "Designing an enterprise knowledge assistant",
    time: "Plan a defensible PoC",
    steps: [
      [{ slug: "data-engineering", label: "Data engineering" }],
      [{ slug: "rag", label: "RAG" }],
      [{ slug: "security", label: "Security" }],
      [{ slug: "ai-gateway", label: "AI gateway" }],
      [{ slug: "ai-ops", label: "AI Ops" }],
    ],
    outcome: "Connect knowledge, permissions, answer quality, and production operations.",
  },
  {
    no: "03",
    title: "Letting AI execute business work",
    time: "Control action risk",
    steps: [
      [{ slug: "ai-agent", label: "Agent" }],
      [{ slug: "mcp", label: "MCP" }, { slug: "a2a", label: "A2A" }],
      [{ slug: "security", label: "Security" }],
      [{ slug: "evaluation", label: "Evaluation" }],
      [{ slug: "ai-ops", label: "AI Ops" }],
    ],
    outcome: "Separate model decisions, tool permissions, durable tasks, and authoritative business outcomes.",
  },
  {
    no: "04",
    title: "Planning private AI infrastructure",
    time: "Build capacity evidence",
    steps: [
      [{ slug: "model-landscape", label: "Model landscape" }],
      [{ slug: "llm-inference", label: "Inference" }],
      [{ slug: "ai-infra-platform", label: "Platform" }],
      [{ slug: "ai-infra-compute", label: "Compute" }],
      [{ slug: "data-engineering", label: "Data engineering" }],
    ],
    outcome: "Work backward from real workloads to serving, scheduling, networks, storage, and procurement.",
  },
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
    <main lang="en" className="fieldbookTheme fieldbookHome fieldbookHomeEn">
      <ReadingProgress />
      <header className="hero heroV2" id="top">
        <nav className="topbar" aria-label="Main navigation">
          <Link className="brand" href="/en" prefetch={false}><span><strong>Cloud × AI Presales Fieldbook</strong><small>Evidence-backed technical field guide</small></span></Link>
          <div className="toplinks"><Link href="/en/questions" prefetch={false}>Questions</Link><Link href="/en/glossary" prefetch={false}>Glossary</Link><a href="#available-modules">Find modules</a><Link href="/en/knowledge-graph" prefetch={false}>Dynamic explorer</Link><Link href="/en/model-radar" prefetch={false}>Model radar</Link><Link href="/en/coding-agents" prefetch={false}>Coding agents</Link><Link href="/en/references" prefetch={false}>References</Link><Link href="/" hrefLang="zh-CN" lang="zh-CN" prefetch={false}>Chinese</Link></div>
          <details className="homeMobileNav">
            <summary>More</summary>
            <nav aria-label="More navigation">
              <Link href="/en/questions" prefetch={false}>Questions</Link>
              <Link href="/en/glossary" prefetch={false}>Glossary</Link>
              <a href="#available-modules">Find modules</a>
              <Link href="/en/knowledge-graph" prefetch={false}>Dynamic explorer</Link>
              <Link href="/en/model-radar" prefetch={false}>Model radar</Link>
              <Link href="/en/coding-agents" prefetch={false}>Coding agents</Link>
              <Link href="/en/references" prefetch={false}>References</Link>
              <Link href="/" hrefLang="zh-CN" lang="zh-CN" prefetch={false}>Chinese</Link>
            </nav>
          </details>
        </nav>
        <div id="main-content" className="skipTarget" tabIndex={-1} />
        <div className="heroGrid heroGridV2">
          <div className="heroCopy"><p className="kicker">EVIDENCE-BACKED FIELD GUIDE</p><h1>Turn complex AI technology into decisions customers can act on</h1><p className="heroLead">This technical fieldbook connects system principles and architecture with failure analysis, cloud capabilities, acceptance evidence, and answers for customer conversations. Use it for focused study or during a presales meeting.</p><KnowledgeSearchLaunch labels={searchLabels} /><div className="heroActions"><a className="textButton" href="#learning-paths">Follow a mission-based path <span>→</span></a><a className="textButton" href="#map">Browse the knowledge map <span>→</span></a></div></div>
          <aside className="heroDecisionPanel" aria-label="Ways to use the fieldbook"><h2>Use the same knowledge for different reading tasks</h2><ol><li><span>30 sec</span><div><strong>Get the decision first</strong><p>See the definition, use case, critical boundary, and next discovery question immediately.</p></div></li><li><span>10 min</span><div><strong>Understand the system</strong><p>Follow inputs, processing, outputs, failure points, and control responsibilities.</p></div></li><li><span>Meeting</span><div><strong>Search questions and verify</strong><p>Move from a customer question to the short answer, deeper reasoning, and primary evidence.</p></div></li></ol><div className="heroDecisionFoot"><strong>{englishModuleCount}</strong><span>independent modules</span><strong>{layerCount}</strong><span>knowledge layers</span></div></aside>
        </div>
      </header>

      <div id="available-modules" className="explorerAnchor">
        <ModuleExplorer modules={explorerModules} knowledgeIndexUrl="/search/knowledge.en.json" labels={explorerLabels} locale="en-US" questionsHref="/en/questions" />
      </div>

      <section className="homeTermGuide" aria-labelledby="english-home-term-guide-title">
        <div><p className="kicker">FIELD GLOSSARY</p><h2 id="english-home-term-guide-title">Core terminology at a glance</h2><p>Build the knowledge map through high-frequency concepts, then move into the full glossary for definitions, boundaries, and related modules.</p></div>
        <EnglishHomeTermGroups />
      </section>

      <section className="fieldbookPromise" aria-labelledby="english-reading-depth-title">
        <div className="promiseIntro"><p className="kicker">READING EXPERIENCE</p><h2 id="english-reading-depth-title">One fieldbook, different reading tasks</h2></div>
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
        <header><p className="kicker">MISSION-BASED PATHS</p><h2 id="english-learning-paths-title">Follow the customer task, not the table of contents</h2><p>Each path ends with a customer decision and a deliverable supported by evidence. Completing a list of modules is not the goal.</p></header>
        <div className="learningPathList">
          {learningPaths.map((path) => (
            <article key={path.no}>
              <span>{path.no}</span>
              <div><p>{path.time}</p><h3>{path.title}</h3></div>
              <p className="learningPathRoute">
                {path.steps.map((step, stepIndex) => (
                  <span className="learningPathRouteStep" key={step.map((module) => module.slug).join("-")}>
                    {stepIndex > 0 ? <i className="learningPathRouteSeparator" aria-hidden="true">→</i> : null}
                    {step.map((module, moduleIndex) => {
                      if (!englishModuleRegistry[module.slug]) throw new Error(`Unknown learning path module: ${module.slug}`);
                      return (
                        <span className="learningPathRouteModule" key={module.slug}>
                          {moduleIndex > 0 ? <i className="learningPathRouteSeparator" aria-hidden="true">/</i> : null}
                          <Link className="learningPathModuleLink" href={`/en/modules/${module.slug}`} aria-label={`Open ${module.label} module`}>{module.label}</Link>
                        </span>
                      );
                    })}
                  </span>
                ))}
              </p>
              <p className="learningPathOutcome">{path.outcome}</p>
            </article>
          ))}
        </div>
      </section>
      <footer><div><strong>Cloud × AI Presales Fieldbook</strong></div><p>{englishModuleCount} modules · {layerCount} knowledge layers</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
