import type { CSSProperties } from "react";
import Link from "next/link";

import { KnowledgeSearchLaunch, ModuleExplorer, ReadingProgress, type ExplorerModule, type KnowledgeSearchEntry } from "./fieldbook-interactions";
import { balanceGridRows, gridSpan } from "./layout-utils.mjs";
import { layers, moduleList } from "./knowledge-map.mjs";
import { moduleContentRegistry } from "./module-content-registry.mjs";
import { moduleCurriculumContent } from "./module-curriculum-content.mjs";
import { moduleDiscovery } from "./module-discovery.mjs";
import { moduleLearningContent } from "./module-learning-content.mjs";
import { publishedModuleSlugs } from "./module-publication.mjs";
import { referenceModules, sourceLedger } from "./reference-content.mjs";
import { glossaryTermIds, homepageTermGroups, terminology } from "./terminology.mjs";
import { TermHintGroups } from "./term-hint";

const layerCount = layers.length;
const moduleCount = moduleList.length;
const explorerModules: ExplorerModule[] = publishedModuleSlugs.map((slug) => {
  const item = moduleList.find((module) => module.slug === slug);
  const discovery = moduleDiscovery[slug as keyof typeof moduleDiscovery];
  if (!item || !discovery) throw new Error(`首页模块发现信息不完整：${slug}`);
  return { ...item, ...discovery };
});

const moduleNames = new Map(moduleList.map((module) => [module.slug, module.zh]));
const sourceModules = new Map<string, string[]>();
referenceModules.forEach((module) => module.sourceIds.forEach((sourceId) => {
  sourceModules.set(sourceId, [...(sourceModules.get(sourceId) ?? []), module.zh]);
}));

const knowledgeSearchEntries: KnowledgeSearchEntry[] = [
  ...Object.entries(terminology).map(([termId, term]) => {
    const relatedNames = term.moduleSlugs.map((slug) => moduleNames.get(slug)).filter(Boolean);
    return {
      id: `term-${termId}`,
      type: "专业术语" as const,
      title: `${term.zh} · ${term.en}${term.abbr ? `（${term.abbr}）` : ""}`,
      subtitle: `${relatedNames.join(" / ")} · 术语库`,
      href: `/glossary#term-${termId}`,
      keywords: `${term.zh} ${term.en} ${term.abbr ?? ""} ${term.description} ${relatedNames.join(" ")}`,
    };
  }),
  ...Object.entries(moduleContentRegistry).flatMap(([slug, content]) => content.qa.map((item, index) => ({
    id: `qa-${slug}-${index + 1}`,
    type: "客户问答" as const,
    title: item.q,
    subtitle: `${moduleNames.get(slug)} · ${item.tag}`,
    href: `/modules/${slug}#qa-${index + 1}`,
    keywords: `${moduleNames.get(slug)} ${item.q} ${item.tag}`,
  }))),
  ...Object.entries(moduleCurriculumContent).flatMap(([slug, curriculum]) => curriculum.chapters.map((chapter) => ({
    id: `curriculum-${slug}-${chapter.en.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, "-")}`,
    type: "课程章节" as const,
    title: chapter.title,
    subtitle: `${moduleNames.get(slug)} · ${chapter.en}`,
    href: `/modules/${slug}#curriculum`,
    keywords: `${moduleNames.get(slug)} ${chapter.title} ${chapter.en} ${chapter.explanation} ${chapter.decision} ${chapter.boundary}`,
  }))),
  ...Object.entries(moduleLearningContent).flatMap(([slug, learning]) => learning.labs.map((lab, index) => ({
    id: `lab-${slug}-${index + 1}`,
    type: "实战练习" as const,
    title: lab.title,
    subtitle: `${moduleNames.get(slug)} · 可验收练习`,
    href: `/modules/${slug}#study-guide`,
    keywords: `${moduleNames.get(slug)} ${lab.title} ${lab.scenario} ${lab.tasks.join(" ")} ${lab.deliverable} ${lab.acceptance}`,
  }))),
  ...Object.entries(sourceLedger).map(([sourceId, source]) => ({
    id: `source-${sourceId}`,
    type: "来源证据" as const,
    title: source.title,
    subtitle: `${source.grade} 类证据 · ${(sourceModules.get(sourceId) ?? []).join(" / ")}`,
    href: `/references#source-${sourceId}`,
    keywords: `${source.shortTitle} ${source.title} ${source.kind} ${(sourceModules.get(sourceId) ?? []).join(" ")}`,
  })),
];

const learningPaths = [
  { no: "01", title: "第一次与客户聊 AI 平台", time: "建立全局判断", route: "场景解决方案 → 模型格局 → LLM → 评估", outcome: "先判断客户真正要解决的问题，再讨论模型和产品。" },
  { no: "02", title: "正在设计企业知识助手", time: "规划 PoC 验证", route: "数据工程 → RAG → 安全 → AI 网关 → AI Ops", outcome: "把知识、权限、回答质量和上线运营连成完整方案。" },
  { no: "03", title: "客户希望 AI 执行业务任务", time: "控制行动风险", route: "Agent → MCP / A2A → 安全 → 评估 → AI Ops", outcome: "区分模型决策、工具权限、持久任务与业务完成状态。" },
  { no: "04", title: "准备规划私有化 AI 基础设施", time: "形成容量证据", route: "模型格局 → 推理 → 平台 → 算力 → 数据工程", outcome: "从真实负载反推模型服务、调度、网络、存储与采购。" },
];

export default function Home() {
  return (
    <main className="fieldbookHome">
      <ReadingProgress />
      <header className="hero heroV2" id="top">
        <nav className="topbar" aria-label="主导航">
          <Link className="brand" href="/" aria-label="云与 AI 售前知识库首页">
            <span><strong>云与 AI 售前知识库</strong><small>Cloud × AI Presales Fieldbook</small></span>
          </Link>
          <div className="toplinks">
            <Link href="/questions">问题查询</Link>
            <Link href="/glossary">术语库</Link>
            <Link href="/coding-agents">Coding Agent 选型</Link>
            <a href="#available-modules">查找模块</a>
            <Link href="/knowledge-graph">动态探索</Link>
            <Link href="/references">来源与证据 / Reference</Link>
          </div>
        </nav>

        <div className="heroGrid heroGridV2">
          <div className="heroCopy">
            <h1>把复杂 AI 技术，<br />变成客户能做的决定</h1>
            <p className="heroLead">这里把原理、架构、失败原因、云服务、验收证据和客户回答整理成一本技术手册：既能搜索和深入阅读，也能在客户现场随手查阅。</p>
            <KnowledgeSearchLaunch />
            <div className="heroActions">
              <a className="textButton" href="#learning-paths">按任务学习 <span>→</span></a>
              <a className="textButton" href="#map">浏览知识地图 <span>→</span></a>
            </div>
          </div>

          <aside className="heroDecisionPanel" aria-label="知识库可以帮助完成的任务">
            <h2>同一份知识，按场景切换阅读深度</h2>
            <ol>
              <li><span>30 秒</span><div><strong>先拿到判断</strong><p>定义、适用场景、关键边界和下一步问题直接可见。</p></div></li>
              <li><span>10 分钟</span><div><strong>理解系统机制</strong><p>沿输入、处理、输出、失败点和责任边界深入阅读。</p></div></li>
              <li><span>客户现场</span><div><strong>搜索问题并查证</strong><p>从客户问题进入短答、深答、追问和一手来源。</p></div></li>
            </ol>
            <div className="heroDecisionFoot"><strong>{moduleCount}</strong><span>个独立模块</span><strong>{layerCount}</strong><span>层知识地图</span></div>
          </aside>
        </div>
      </header>

      <div id="available-modules" className="explorerAnchor">
        <ModuleExplorer modules={explorerModules} knowledgeEntries={knowledgeSearchEntries} />
      </div>

      <section className="homeTermGuide" aria-labelledby="home-term-guide-title">
        <div>
          <p className="kicker">FIELD GLOSSARY</p>
          <h2 id="home-term-guide-title">核心术语速查</h2>
          <p>按模型、应用、协议与治理快速建立知识版图；这里保留跨模块高频概念，完整定义和全部术语进入独立术语库。</p>
        </div>
        <TermHintGroups groups={homepageTermGroups} total={glossaryTermIds.length} />
      </section>

      <section className="fieldbookPromise" aria-labelledby="promise-title">
        <div className="promiseIntro"><p className="kicker">READING EXPERIENCE</p><h2 id="promise-title">同一份知识，支持三种阅读深度</h2></div>
        <div className="promiseGrid">
          <article><span>30 秒</span><h3>先拿到判断</h3><p>先看到定义、客户遇到的问题、建议方案和必须注意的限制。</p></article>
          <article><span>10 分钟</span><h3>理解系统为什么这样工作</h3><p>把工作原理、数据如何流转、谁负责控制，以及常见故障串起来讲。</p></article>
          <article><span>客户现场</span><h3>搜索问题并回到证据</h3><p>按场景筛选高频问答，短答、深答、追问和来源在同一处。</p></article>
        </div>
      </section>

      <section className="section mapSection mapSectionV2" id="map" aria-labelledby="map-title">
        <div className="sectionNumber">01</div>
        <div className="sectionBody">
          <div className="sectionIntro splitIntro mapIntro">
            <div className="mapHeading">
              <p className="kicker">KNOWLEDGE SYSTEM</p>
              <h2 id="map-title">知识地图</h2>
              <div className="mapStats" aria-label={`${layerCount} 层架构，${moduleCount} 个细分模块`}>
                <span className="mapStat"><strong>{layerCount}</strong><span>层架构</span></span>
                <span className="mapStat"><strong>{moduleCount}</strong><span>个细分模块</span></span>
              </div>
            </div>
            <div className="mapIntroGuide">
              <p>地图按客户对话从上到下展开：先明确业务方案，再选择应用模式和互操作方式，最后落实工程、模型、数据与算力。</p>
              <Link className="mapGraphLink" href="/knowledge-graph">
                <span><strong>查看模块之间的关系</strong><small>进入动态知识探索</small></span><i aria-hidden="true">→</i>
              </Link>
            </div>
          </div>

          <div className="layerStack layerStackV2">
            {layers.map((layer) => (
              <article className="layer" key={layer.no}>
                <div className="layerIndex">{layer.no}</div>
                <div className="layerTitle"><h3>{layer.name}</h3><p>{layer.en}</p></div>
                <div className="layerContent">
                  <div className="chips" data-count={layer.modules.length} data-odd={layer.modules.length % 2 === 1 ? "true" : "false"}>
                    {balanceGridRows(layer.modules, 4).flatMap((row) => row.map((module) => (
                      <Link key={module.slug} href={module.href} style={{ "--module-span": gridSpan(row.length) } as CSSProperties} aria-label={`${module.zh}：打开独立模块页面`}>
                        <strong>{module.zh}</strong><small>{module.en}</small><i aria-hidden="true">↗</i>
                      </Link>
                    )))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="learningPathsV2" id="learning-paths" aria-labelledby="learning-paths-title">
        <header><p className="kicker">MISSION-BASED PATHS</p><h2 id="learning-paths-title">不要按章节学，按任务走</h2><p>每条路径都以客户要完成的决策结束，而不是以“看完若干模块”结束。</p></header>
        <div className="learningPathList">
          {learningPaths.map((path) => (
            <article key={path.no}><span>{path.no}</span><div><p>{path.time}</p><h3>{path.title}</h3></div><strong>{path.route}</strong><p>{path.outcome}</p></article>
          ))}
        </div>
      </section>

      <footer><span>Cloud × AI Presales Fieldbook</span><span>V2.0 · {moduleCount} 模块阅读版</span></footer>
    </main>
  );
}
