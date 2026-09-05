import type { Metadata } from "next";
import Link from "next/link";

import { CodingAgentExplorer } from "../../../coding-agent-explorer";
import {
  englishCodingAgentBenchmarks,
  englishCodingAgentExplorerLabels,
  englishCodingAgentLandscapePolicy,
  englishCodingAgentProducts,
} from "../../../i18n/en/coding-agent-landscape.mjs";
import { englishPageMetadata } from "../../../i18n/english-page-metadata";
import { englishSourceCopy } from "../../../i18n/en/registry.mjs";
import { ReadingProgress } from "../../../fieldbook-interactions";

export const metadata: Metadata = englishPageMetadata({
  title: "Coding Agent and Harness Radar",
  description: "A dated, evidence-backed comparison surface for coding-agent products, harnesses, benchmarks, and customer PoCs.",
  path: "/en/coding-agents",
  zhPath: "/coding-agents",
});

const evaluationDimensions = [
  ["Task outcome", "End-to-end completion, critical postconditions, and failure slices."],
  ["Process quality", "Correct tools, arguments, traces, verification, and stop behavior."],
  ["Efficiency", "P95 latency, tokens, calls, and cost per task that meets stated criteria."],
  ["Control", "Permissions, approvals, sandboxing, networking, and irreversible side effects."],
  ["Recovery", "Checkpoints, idempotency, unknown outcomes, and human takeover."],
  ["Observability", "Traces, versions, replay, failure attribution, and operating ownership."],
  ["Portability", "The cost of moving models, environments, rules, data, and workflows."],
  ["Developer experience", "Interaction speed, comprehensibility, review effort, and teamwork."],
];

export default function EnglishCodingAgentsPage() {
  return (
    <main lang="en" className="fieldbookTheme codingAgentPage">
      <ReadingProgress />
      <header className="hero heroV2 codingAgentHero" id="top">
        <nav className="topbar" aria-label="Coding agent radar navigation">
          <Link className="brand" href="/en" prefetch={false}><span>Cloud × AI / Presales Fieldbook</span></Link>
          <div className="toplinks"><Link href="/en" prefetch={false}>Home</Link><Link href="/en/modules/ai-agent#harness" prefetch={false}>Harness design</Link><a href="#products">Product radar</a><Link href="/en/references" prefetch={false}>References</Link><Link href="/coding-agents" hrefLang="zh-CN" lang="zh-CN" prefetch={false}>Chinese</Link></div>
        </nav>
        <div id="main-content" className="skipTarget" tabIndex={-1} />
        <div className="codingAgentHeroGrid">
          <div><p className="eyebrow">LIVING REFERENCE · VERIFIED {englishCodingAgentLandscapePolicy.verifiedAt}</p><h1>Coding Agent<br /><span>Product and Harness Radar</span></h1><p>This radar separates <strong>official product facts</strong>, <strong>independent benchmark results</strong>, and <strong>the customer&apos;s own PoC evidence</strong>. Test the model, harness, task, and environment separately. No product is a permanent winner outside a defined task.</p></div>
          <aside><strong>{englishCodingAgentLandscapePolicy.productCount}</strong><span>verified product entry points</span><strong>30 days</strong><span>maximum review window for dynamic facts</span><strong>0</strong><span>permanent winners outside a task</span></aside>
        </div>
      </header>

      <section className="section codingAgentMethod" aria-labelledby="method-title">
        <div className="sectionNumber">01</div><div className="sectionBody">
          <div className="sectionIntro splitIntro"><div><p className="kicker">COMPARISON METHOD</p><h2 id="method-title">Freeze the experiment before comparing harnesses</h2></div><p>A fair comparison holds the task, repository snapshot, model version, inference settings, tools, network, permissions, budget, maximum turns, and human-intervention rules constant. Change only the harness, then repeat the run and inject failures.</p></div>
          <div className="codingAgentDimensionGrid">{evaluationDimensions.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
          <aside className="callout" data-importance="critical"><div className="calloutTitle"><span>METHOD BOUNDARY</span><strong>Critical boundary</strong><small>Critical Boundary</small></div><p>The same model can produce different results in different products. The same product can change when its model, repository rules, permissions, or network change. Compare <strong>Model × Harness × Task × Environment</strong>; do not treat a product name as a stable capability value.</p></aside>
        </div>
      </section>

      <section className="section codingAgentBenchmarks" aria-labelledby="benchmarks-title">
        <div className="sectionNumber">02</div><div className="sectionBody">
          <div className="sectionIntro splitIntro"><div><p className="kicker">LIVE LEADERBOARDS &amp; RESEARCH</p><h2 id="benchmarks-title">A leaderboard is an evidence entry point, not a procurement conclusion</h2></div><p>Every leaderboard covers only one task space. When opening the original result, record its date, model snapshot, harness version, cost, and retry conditions. Do not combine scores from different configurations into a single ranking.</p></div>
          <div className="codingBenchmarkList">{englishCodingAgentBenchmarks.map((item) => { const source = (englishSourceCopy as unknown as Record<string, { shortTitle: string; kind: string; note: string } | undefined>)[item.sourceId]; if (!source) throw new Error(`Missing English source copy: ${item.sourceId}`); return <article key={item.id}><p>{item.scope}</p><h3>{item.name}</h3><strong>{item.use}</strong><span>{item.boundary}</span><Link href={`/en/references#source-${item.sourceId}`}>{source.shortTitle} · source and boundary ↗</Link></article>; })}</div>
        </div>
      </section>

      <section className="section codingAgentProducts" id="products" aria-labelledby="products-title">
        <div className="sectionNumber">03</div><div className="sectionBody">
          <div className="sectionIntro splitIntro"><div><p className="kicker">PRODUCT LANDSCAPE</p><h2 id="products-title">Compare and filter coding-agent products</h2></div><p>Only products with current official material appear here. Geographic coverage is not balanced, and a single media review does not establish superiority. Use the filters to build a shortlist, then run the same PoC task for each candidate.</p></div>
          <CodingAgentExplorer products={englishCodingAgentProducts} labels={englishCodingAgentExplorerLabels} referencesHref="/en/references" />
        </div>
      </section>

      <section className="section codingAgentFreshness" aria-labelledby="freshness-title">
        <div className="sectionNumber">04</div><div className="sectionBody">
          <div className="sectionIntro splitIntro"><div><p className="kicker">FRESHNESS CONTRACT</p><h2 id="freshness-title">Keep the radar from becoming stale</h2></div><p>Review product, pricing, specification, model, and benchmark facts at least every 30 days; review stable platform documentation every 90 days and methodology every 180 days. Review immediately after a launch, deprecation, migration, or security event.</p></div>
          <div className="codingFreshnessFlow"><article><span>01</span><h3>Official facts</h3><p>Confirm product surface, model policy, deployment, permissions, and lifecycle only from official material.</p></article><article><span>02</span><h3>Independent evidence</h3><p>Record each leaderboard or study’s configuration, date, task, and limit on generalization.</p></article><article><span>03</span><h3>Status management</h3><p>Keep every dynamic fact’s verification date, next review date, and active, watch, or replaced state.</p></article><article><span>04</span><h3>Customer retest</h3><p>Run candidate products against the same real repository, permissions, task, and release criteria.</p></article></div>
          <p className="paperBoundary"><strong>Current review priority:</strong> Gemini CLI requests from individual accounts have moved to Antigravity CLI, while enterprise licenses, Google Cloud, and paid API-key paths remain supported, so the entry is marked watch. Read the <Link href="/en/references#source-product-gemini-cli-individual-transition">official status update and its scope ↗</Link></p>
        </div>
      </section>

      <footer><div><strong>Cloud × AI Presales Fieldbook</strong></div><p>Coding Agent &amp; Harness Landscape · verified {englishCodingAgentLandscapePolicy.verifiedAt}</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
