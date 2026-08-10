import type { Metadata } from "next";
import Link from "next/link";

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

export const metadata: Metadata = {
  title: "大模型能力指数 Top 20 | 云计算 × AI 平台售前知识库",
  description: "用 Intelligence、Coding、Agentic 三项能力指数比较同一批 Top 20 大模型，并查看每项指数的组成与边界。",
};

export default function ModelRadarPage() {
  const benchmarks = modelRadarBenchmarkSourceIds.map((sourceId) => {
    const source = sourceLedger[sourceId];
    const guide = modelRadarBenchmarkGuides[sourceId];
    if (!source || !guide) throw new Error(`Missing model radar benchmark metadata: ${sourceId}`);
    return {
      sourceId,
      shortTitle: source.shortTitle,
      title: source.title,
      kind: source.kind,
      grade: source.grade,
      note: source.note,
      href: source.href,
      scoreScale: modelRadarBenchmarkScales[sourceId],
      guide,
    };
  });

  return (
    <main className="fieldbookTheme modelRadarPage modelPosterPage">
      <ReadingProgress />
      <header className="hero modelRadarHero modelPosterHero" id="top">
        <nav className="topbar" aria-label="模型对比导航">
          <Link className="brand" href="/" aria-label="返回云与 AI 售前知识库首页">
            <span><strong>云与 AI 售前知识库</strong><small>Cloud × AI Presales Fieldbook</small></span>
          </Link>
          <div className="toplinks">
            <Link href="/">知识库首页</Link>
            <Link href="/modules/model-landscape">模型格局模块</Link>
            <Link href="/coding-agents">Coding Agent</Link>
            <Link href="/references">来源与证据</Link>
            <Link href="/en/model-radar" hrefLang="en" lang="en">English</Link>
          </div>
        </nav>

        <div className="modelPosterHeroInner">
          <h1>AI 大模型 <span>能力指数榜单 TOP 20</span></h1>
          <p className="modelPosterHeroLead">同一批公开模型快照，切换 Intelligence、Coding、Agentic 三项指数；官方分数与本项目 50/50 组合分数分开标注，找不到权威数据就留空，不做推算。</p>
        </div>
      </header>

      <section className="modelPosterSection" id="model-poster" aria-label="模型榜单页面">
        <div className="modelPosterShell">
          <ModelRadarExplorer snapshots={modelRadarSnapshots} benchmarks={benchmarks} retention={modelRadarPolicy.retention} />
        </div>
      </section>

      <footer>
        <div><strong>云计算 × AI 平台售前知识库</strong></div>
        <p>Model Landscape · {modelRadarPolicy.retention} · 缺失数据不补值</p>
        <a href="#top">返回顶部 ↑</a>
      </footer>
    </main>
  );
}
