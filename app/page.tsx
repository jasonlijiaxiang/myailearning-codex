import Link from "next/link";

import { ModuleExplorer, ReadingProgress, type ExplorerModule, type KnowledgeSearchEntry } from "./fieldbook-interactions";
import { exposesLongFormSearchSections, searchableQuestions } from "./home-search-visibility.mjs";
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
  ...Object.entries(moduleContentRegistry).flatMap(([slug, content]) => searchableQuestions(slug, content.qa).map((item, index) => ({
    id: `qa-${slug}-${index + 1}`,
    type: "客户问答" as const,
    title: item.q,
    subtitle: `${moduleNames.get(slug)} · ${item.tag}`,
    href: `/modules/${slug}#qa-${index + 1}`,
    keywords: `${moduleNames.get(slug)} ${item.q} ${item.tag}`,
  }))),
  ...Object.entries(moduleCurriculumContent).flatMap(([slug, curriculum]) => exposesLongFormSearchSections(slug) ? curriculum.chapters.map((chapter) => ({
    id: `curriculum-${slug}-${chapter.en.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, "-")}`,
    type: "课程章节" as const,
    title: chapter.title,
    subtitle: `${moduleNames.get(slug)} · ${chapter.en}`,
    href: `/modules/${slug}#curriculum`,
    keywords: `${moduleNames.get(slug)} ${chapter.title} ${chapter.en} ${chapter.explanation} ${chapter.decision} ${chapter.boundary}`,
  })) : []),
  ...Object.entries(moduleLearningContent).flatMap(([slug, learning]) => exposesLongFormSearchSections(slug) ? learning.labs.map((lab, index) => ({
    id: `lab-${slug}-${index + 1}`,
    type: "实战练习" as const,
    title: lab.title,
    subtitle: `${moduleNames.get(slug)} · 可验收练习`,
    href: `/modules/${slug}#study-guide`,
    keywords: `${moduleNames.get(slug)} ${lab.title} ${lab.scenario} ${lab.tasks.join(" ")} ${lab.deliverable} ${lab.acceptance}`,
  })) : []),
  ...Object.entries(moduleContentRegistry).flatMap(([slug, content]) => {
    if (Object.hasOwn(moduleLearningContent, slug) || !("learning" in content) || !content.learning) return [];
    return content.learning.labs.map((lab, index) => ({
      id: `lab-${slug}-${index + 1}`,
      type: "实战练习" as const,
      title: lab.title,
      subtitle: `${moduleNames.get(slug)} · 可验收练习`,
      href: `/modules/${slug}#practice`,
      keywords: `${moduleNames.get(slug)} ${lab.title} ${lab.scenario} ${lab.tasks.join(" ")} ${lab.deliverable} ${lab.acceptance}`,
    }));
  }),
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
  { no: "04", title: "准备规划私有化 AI 基础设施", time: "评估算力需求", route: "模型格局 → 推理 → 平台 → 算力 → 数据工程", outcome: "用实际业务负载估算模型服务、GPU、网络和存储需求，再决定部署和采购。" },
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
            <a href="#available-modules">从问题开始</a>
            <Link href="/glossary">术语库</Link>
            <Link href="/coding-agents">Coding Agent 选型</Link>
            <Link href="/knowledge-graph">模块关系</Link>
            <Link href="/references">来源与证据 / Reference</Link>
            <Link href="/en" hrefLang="en" lang="en" prefetch={false}>English</Link>
          </div>
        </nav>

        <div className="heroGrid heroGridV2">
          <div className="heroCopy">
            <h1>讲清 AI 技术，<br />心中有数，丝毫不慌</h1>
            <p className="heroLead">理解方案背后的原理与限制，才能真正赢得客户，从容应对每一次追问。</p>
            <div className="heroActions">
              <a className="textButton" href="#learning-paths">按任务开始 <span>→</span></a>
              <a className="textButton" href="#available-modules">直接找问题 <span>→</span></a>
            </div>
          </div>

          <aside className="heroDecisionPanel" aria-label="知识库可以帮助完成的任务">
            <h2>三种阅读深度</h2>
            <ol>
              <li><span>30 秒</span><div><strong>先拿到判断</strong><p>定义、场景、边界和下一问。</p></div></li>
              <li><span>10 分钟</span><div><strong>理解系统机制</strong><p>沿处理流程理解机制和责任边界。</p></div></li>
              <li><span>客户现场</span><div><strong>搜索问题并查证</strong><p>从问题查短答、追问与来源。</p></div></li>
            </ol>
            <div className="heroDecisionFoot"><strong>{moduleCount}</strong><span>个独立模块</span><strong>{layerCount}</strong><span>层知识地图</span></div>
          </aside>
        </div>
      </header>

      <section className="learningPathsV2" id="learning-paths" aria-labelledby="learning-paths-title">
        <header><p className="kicker">MISSION-BASED PATHS</p><h2 id="learning-paths-title">从场景开始</h2><p>从客户正在面对的场景进入，沿着路径形成下一步判断。</p></header>
        <div className="learningPathList">
          {learningPaths.map((path) => (
            <article key={path.no}><span>{path.no}</span><div><p>{path.time}</p><h3>{path.title}</h3></div><strong>{path.route}</strong><p>{path.outcome}</p></article>
          ))}
        </div>
      </section>

      <div id="available-modules" className="explorerAnchor">
        <ModuleExplorer
          modules={explorerModules}
          knowledgeEntries={knowledgeSearchEntries}
          structureGuide={{
            badge: `${layerCount} 层 · ${moduleCount} 个模块`,
            title: "先从问题搜，需要时按层缩小范围",
            body: "筛选项已按九层结构排列；客户问题还不清晰时，先选一层缩小范围。需要看模块关系，再进入动态探索。",
            href: "/knowledge-graph",
            link: "查看模块关系",
          }}
        />
      </div>

      <section className="homeTermGuide" aria-labelledby="home-term-guide-title">
        <div>
          <p className="kicker">FIELD GLOSSARY</p>
          <h2 id="home-term-guide-title">核心术语速查</h2>
          <p>按模型、应用、协议与治理快速建立知识版图；这里保留跨模块高频概念，完整定义和全部术语进入独立术语库。</p>
        </div>
        <TermHintGroups groups={homepageTermGroups} total={glossaryTermIds.length} />
      </section>

      <footer><span>Cloud × AI Presales Fieldbook</span><span>V2.0 · {moduleCount} 模块阅读版</span></footer>
    </main>
  );
}
