import type { Metadata } from "next";
import Link from "next/link";

import { CodingAgentExplorer } from "../coding-agent-explorer";
import { codingAgentBenchmarks, codingAgentLandscapePolicy, codingAgentProducts } from "../coding-agent-landscape.mjs";
import { ReadingProgress } from "../fieldbook-interactions";
import { sourceLedger } from "../reference-content.mjs";

export const metadata: Metadata = {
  title: "Coding Agent 产品与 Harness 选型雷达 | 云计算 × AI 平台售前知识库",
  description: "按官方资料、独立基准、产品形态和 Harness 能力持续更新的 Coding Agent 选型与比较入口。",
};

const evaluationDimensions = [
  ["任务结果", "端到端成功、关键后置条件与失败切片"],
  ["过程质量", "工具、参数、轨迹、验证与停止是否正确"],
  ["效率", "P95、Token、调用次数与每个成功任务成本"],
  ["控制", "权限、审批、沙箱、网络和不可逆副作用"],
  ["恢复", "Checkpoint、幂等、结果未知与人工接管"],
  ["可观测", "Trace、版本、重放、失败归因和运营责任"],
  ["可移植", "模型、环境、规则、数据和工作流的迁移成本"],
  ["开发体验", "交互速度、可理解性、审阅负担和团队协作"],
];

export default function CodingAgentsPage() {
  return (
    <main className="codingAgentPage">
      <ReadingProgress />
      <header className="hero heroV2 codingAgentHero" id="top">
        <nav className="topbar" aria-label="Coding Agent 选型页导航">
          <Link className="brand" href="/"><span>Cloud × AI / Presales Fieldbook</span></Link>
          <div className="toplinks"><Link href="/">知识库首页</Link><Link href="/modules/ai-agent#harness">Harness 章节</Link><a href="#products">产品雷达</a><Link href="/references">Reference</Link></div>
        </nav>
        <div className="codingAgentHeroGrid">
          <div><p className="eyebrow">LIVING REFERENCE · VERIFIED {codingAgentLandscapePolicy.verifiedAt}</p><h1>Coding Agent<br /><span>产品与 Harness 选型雷达</span></h1><p>这里不发布一个永久的“谁最好”总榜。我们把<strong>官方产品事实</strong>、<strong>独立 Benchmark</strong>和<strong>客户自己的 PoC</strong>分开，让模型、Harness、任务与环境的影响可以被逐层判断。</p></div>
          <aside><strong>{codingAgentLandscapePolicy.productCount}</strong><span>个已核验产品入口</span><strong>30 天</strong><span>动态事实最长复核周期</span><strong>0</strong><span>个脱离任务的永久总冠军</span></aside>
        </div>
      </header>

      <section className="section codingAgentMethod" aria-labelledby="method-title">
        <div className="sectionNumber">01</div><div className="sectionBody">
          <div className="sectionIntro splitIntro"><div><p className="kicker">COMPARISON METHOD</p><h2 id="method-title">先固定实验，再谈哪套 Harness 更好</h2></div><p>公平比较要求固定任务、仓库快照、模型版本、推理配置、工具、网络、权限、预算、最大轮次与人工介入规则。只替换 Harness，并做多次运行和失败注入。</p></div>
          <div className="codingAgentDimensionGrid">{evaluationDimensions.map(([title, body]) => <article key={title}><span>{String(evaluationDimensions.findIndex((item) => item[0] === title) + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
          <aside className="callout" data-importance="critical"><div className="calloutTitle"><span>METHOD BOUNDARY</span><strong>重要边界</strong><small>Critical Boundary</small></div><p>同一个模型放进不同产品，结果可以不同；同一产品更换模型、仓库规则、权限或网络，结果也会不同。需要比较的是<strong>Model × Harness × Task × Environment</strong>，不是把产品名当作稳定能力值。</p></aside>
        </div>
      </section>

      <section className="section codingAgentBenchmarks" aria-labelledby="benchmarks-title">
        <div className="sectionNumber">02</div><div className="sectionBody">
          <div className="sectionIntro splitIntro"><div><p className="kicker">LIVE LEADERBOARDS &amp; RESEARCH</p><h2 id="benchmarks-title">排行榜是证据入口，不是采购结论</h2></div><p>每个榜单都只覆盖一个任务空间。打开原榜时要同时记录条目日期、模型快照、Harness 版本、成本与重试条件；不要把不同配置的分数拼成一个总榜。</p></div>
          <div className="codingBenchmarkList">{codingAgentBenchmarks.map((item) => { const source = sourceLedger[item.sourceId as keyof typeof sourceLedger]; return <article key={item.id}><p>{item.scope}</p><h3>{item.name}</h3><strong>{item.use}</strong><span>{item.boundary}</span><Link href={`/references#source-${item.sourceId}`}>{source.shortTitle} · 查看来源与边界 ↗</Link></article>; })}</div>
        </div>
      </section>

      <section className="section codingAgentProducts" id="products" aria-labelledby="products-title">
        <div className="sectionNumber">03</div><div className="sectionBody">
          <div className="sectionIntro splitIntro"><div><p className="kicker">PRODUCT LANDSCAPE</p><h2 id="products-title">中国与国际 Coding Agent 产品雷达</h2></div><p>只收录能找到当前官方资料的产品；不追求中美数量相等，也不根据一次媒体测评给出绝对优劣。筛选结果用于形成候选短名单，最后仍要进入同任务 PoC。</p></div>
          <CodingAgentExplorer products={codingAgentProducts} />
        </div>
      </section>

      <section className="section codingAgentFreshness" aria-labelledby="freshness-title">
        <div className="sectionNumber">04</div><div className="sectionBody">
          <div className="sectionIntro splitIntro"><div><p className="kicker">FRESHNESS CONTRACT</p><h2 id="freshness-title">怎样让这张雷达不过期</h2></div><p>产品、价格、规格、模型与 Benchmark 条目最长 30 天复核一次；稳定平台文档 90 天，方法论 180 天。发布、弃用、迁移或安全事件出现时立即复核。</p></div>
          <div className="codingFreshnessFlow"><article><span>01</span><h3>官方事实</h3><p>产品形态、模型策略、部署、权限和生命周期只由官方资料确认。</p></article><article><span>02</span><h3>独立证据</h3><p>榜单与研究记录具体配置、日期、任务和不可外推边界。</p></article><article><span>03</span><h3>状态管理</h3><p>每条动态事实保留核验日、下次复核日和 active / watch / replaced 状态。</p></article><article><span>04</span><h3>客户复测</h3><p>候选产品用同一真实仓库、权限、任务和验收门槛重新运行。</p></article></div>
          <p className="paperBoundary"><strong>当前重点复核：</strong>Google 已公告 Gemini CLI 向 Antigravity CLI 迁移，因此相关条目标记为 watch。查看<Link href="/references#source-product-antigravity-migration">官方迁移公告与适用边界 ↗</Link></p>
        </div>
      </section>

      <footer><div><strong>云计算 × AI 平台售前知识库</strong></div><p>Coding Agent &amp; Harness Landscape · 核验于 {codingAgentLandscapePolicy.verifiedAt}</p><a href="#top">返回顶部 ↑</a></footer>
    </main>
  );
}
