import type { Metadata } from "next";
import Link from "next/link";

import { ReadingProgress } from "../../../fieldbook-interactions";
import { englishPageMetadata } from "../../../i18n/english-page-metadata";
import { englishSourceCopy } from "../../../i18n/en/registry.mjs";
import {
  englishModelRadarBenchmarkGuides,
  englishModelRadarBenchmarkScales,
  englishModelRadarBenchmarkSourceIds,
  englishModelRadarPolicy,
  englishModelRadarSnapshots,
} from "../../../i18n/en/model-radar.mjs";
import { ModelRadarExplorer } from "../../../model-radar-explorer";
import { sourceLedger } from "../../../reference-content.mjs";

export const metadata: Metadata = englishPageMetadata({
  title: "Model Capability Radar: Top 20 Snapshot",
  description: "A dated Top 20 capability snapshot that keeps official model scores, transparent project indices, and their benchmark limits separate.",
  path: "/en/model-radar",
  zhPath: "/model-radar",
});

export default function EnglishModelRadarPage() {
  const benchmarks = englishModelRadarBenchmarkSourceIds.map((sourceId) => {
    const canonical = sourceLedger[sourceId];
    const copy = englishSourceCopy[sourceId];
    const guide = englishModelRadarBenchmarkGuides[sourceId];
    const scoreScale = englishModelRadarBenchmarkScales[sourceId];
    if (!canonical || !copy || !guide || !scoreScale) throw new Error(`Missing English model-radar benchmark: ${sourceId}`);
    return {
      sourceId,
      shortTitle: copy.shortTitle,
      title: copy.shortTitle,
      kind: copy.kind,
      grade: canonical.grade,
      note: copy.note,
      href: canonical.href,
      scoreScale,
      guide,
    };
  });

  return (
    <main lang="en" className="fieldbookTheme modelRadarPage modelPosterPage">
      <ReadingProgress />
      <header className="hero modelRadarHero modelPosterHero" id="top">
        <nav className="topbar" aria-label="Model capability radar navigation">
          <Link className="brand" href="/en" aria-label="Return to the fieldbook home" prefetch={false}>
            <span><strong>Cloud × AI Presales Fieldbook</strong><small>Evidence-backed technical field guide</small></span>
          </Link>
          <div className="toplinks">
            <Link href="/en" prefetch={false}>Home</Link>
            <Link href="/en/modules/model-landscape" prefetch={false}>Model landscape</Link>
            <Link href="/en/coding-agents" prefetch={false}>Coding agents</Link>
            <Link href="/en/references" prefetch={false}>References</Link>
            <Link href="/model-radar" hrefLang="zh-CN" lang="zh-CN" prefetch={false}>Chinese</Link>
          </div>
        </nav>

        <div className="modelPosterHeroInner">
          <h1>AI model <span>capability snapshot: Top 20</span></h1>
          <p className="modelPosterHeroLead">The same public model snapshot can be viewed through Intelligence, Coding, and Agentic indices. Official scores and this fieldbook’s transparent 50/50 indices stay distinct; where authoritative data is unavailable, the page leaves the value blank rather than estimating it.</p>
        </div>
      </header>

      <section className="modelPosterSection" id="model-poster" aria-label="Model capability snapshot">
        <div className="modelPosterShell">
          <ModelRadarExplorer
            snapshots={englishModelRadarSnapshots}
            benchmarks={benchmarks}
            retention={englishModelRadarPolicy.retention}
            locale="en"
            referencesHref="/en/references"
            modelLandscapeHref="/en/modules/model-landscape#qa-1"
          />
        </div>
      </section>

      <footer>
        <div><strong>Cloud × AI Presales Fieldbook</strong></div>
        <p>Model Landscape · verified {englishModelRadarPolicy.verifiedAt} · missing data is not inferred</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
