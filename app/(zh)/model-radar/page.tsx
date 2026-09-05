import type { Metadata } from "next";
import { chinesePageMetadata } from "../../i18n/chinese-page-metadata";

import { ReadingProgress } from "../../fieldbook-interactions";
import { ModelRadarExplorer } from "../../model-radar-explorer";
import {
  modelRadarBenchmarkScales,
  modelRadarBenchmarkSourceIds,
  modelRadarPolicy,
  modelRadarSnapshots,
} from "../../model-radar-data.mjs";
import {
  modelRadarBenchmarkGuides,
  sourceLedger,
} from "../../reference-content.mjs";
import { SiteFooter, SiteNav } from "../../site-chrome";

export const metadata: Metadata = chinesePageMetadata({
  title: "大模型能力快照 · 20 个配置 | 云计算 × AI 平台售前知识库",
  description: "用官方 Intelligence Index 与透明复算的 Coding、Agentic Composite 比较默认视图捕获的 20 个模型配置，并查看每项分数的组成与边界。",
  path: "/model-radar",
  enPath: "/en/model-radar",
});

export default function ModelRadarPage() {
  const benchmarks = modelRadarBenchmarkSourceIds.map((sourceId) => {
    const source = sourceLedger[sourceId];
    const guide = modelRadarBenchmarkGuides[sourceId as keyof typeof modelRadarBenchmarkGuides];
    if (!source || !guide) throw new Error(`Missing model radar benchmark metadata: ${sourceId}`);
    return {
      sourceId,
      shortTitle: source.shortTitle,
      title: source.title,
      kind: source.kind,
      grade: source.grade,
      note: source.note,
      href: source.href,
      scoreScale: modelRadarBenchmarkScales[sourceId as keyof typeof modelRadarBenchmarkScales],
      guide,
    };
  });

  return (
    <main className="fieldbookTheme modelRadarPage modelPosterPage">
      <ReadingProgress />
      <header className="hero modelRadarHero modelPosterHero" id="top">
        <SiteNav
          locale="zh"
          ariaLabel="模型对比导航"
          brandAriaLabel="返回云与 AI 售前知识库首页"
          links={[
            { href: "/", label: "知识库首页" },
            { href: "/modules/model-landscape", label: "模型格局模块" },
            { href: "/coding-agents", label: "Coding Agent" },
            { href: "/references", label: "来源与证据" },
            { href: "/en/model-radar", label: "English", hrefLang: "en", lang: "en" },
          ]}
        />
        <div id="main-content" className="skipTarget" tabIndex={-1} />

        <div className="modelPosterHeroInner">
          <h1>AI 大模型 <span>能力快照 · 20 个配置</span></h1>
          <p className="modelPosterHeroLead">同一批公开模型快照，切换官方 Intelligence Index 与本页透明复算的 Coding、Agentic Composite；分数口径分开标注，找不到同版本公开数据就留空，不跨版本拼接。</p>
        </div>
      </header>

      <section className="modelPosterSection" id="model-poster" aria-label="模型榜单页面">
        <div className="modelPosterShell">
          <ModelRadarExplorer snapshots={modelRadarSnapshots} benchmarks={benchmarks} retention={modelRadarPolicy.retention} candidatePool={modelRadarPolicy.candidatePool} />
        </div>
      </section>

      <SiteFooter locale="zh" brand="云计算 × AI 平台售前知识库" note={`Model Landscape · ${modelRadarPolicy.retention} · 缺失数据不补值`} />
    </main>
  );
}
