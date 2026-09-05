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
  title: "Model Capability Radar: Dated 20-Configuration Snapshot",
  description: "A dated 20-configuration snapshot from the default Intelligence view that separates the official index from transparent Coding and Agentic composites.",
  path: "/en/model-radar",
  zhPath: "/model-radar",
});

export default function EnglishModelRadarPage() {
  const benchmarks = englishModelRadarBenchmarkSourceIds.map((sourceId) => {
    const canonical = sourceLedger[sourceId];
    const copy = englishSourceCopy[sourceId as keyof typeof englishSourceCopy];
    const guide = englishModelRadarBenchmarkGuides[sourceId as keyof typeof englishModelRadarBenchmarkGuides];
    const scoreScale = englishModelRadarBenchmarkScales[sourceId as keyof typeof englishModelRadarBenchmarkScales];
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

        <div id="main-content" className="skipTarget" tabIndex={-1} />
        <div className="modelPosterHeroInner">
          <h1>AI model <span>capability snapshot: 20 configurations</span></h1>
          <p className="modelPosterHeroLead">View the same public model snapshot through the official Intelligence Index and this page’s transparent Coding and Agentic composites. The scoring scopes stay distinct; when same-version public data is unavailable, the page leaves the value blank rather than joining versions.</p>
        </div>
      </header>

      <section className="modelPosterSection" id="model-poster" aria-label="Model capability snapshot">
        <div className="modelPosterShell">
          <ModelRadarExplorer
            snapshots={englishModelRadarSnapshots}
            benchmarks={benchmarks}
            retention={englishModelRadarPolicy.retention}
            candidatePool={englishModelRadarPolicy.candidatePool}
            locale="en"
            referencesHref="/en/references"
            modelLandscapeHref="/en/modules/model-landscape#qa-contextual-model-choice"
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
