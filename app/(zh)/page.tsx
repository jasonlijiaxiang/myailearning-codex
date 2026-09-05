import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ModuleExplorer, ReadingProgress, type ExplorerModule } from "../fieldbook-interactions";
import { chinesePageMetadata } from "../i18n/chinese-page-metadata";
import { layers, moduleList } from "../knowledge-map.mjs";
import { moduleDiscovery } from "../module-discovery.mjs";
import { publishedModuleSlugs } from "../module-publication.mjs";
import { glossaryTermIds, homepageTermGroups } from "../terminology.mjs";
import { TermHintGroups } from "../term-hint";
import { scenarioDefinitionsForHome, timeBudgetPaths } from "../home-learning-paths.mjs";
import HomeStyles from "../home-styles";

export const metadata: Metadata = chinesePageMetadata({
  title: "云计算 × AI 平台售前知识库",
  description: "面向售前人员的云计算与 AI 平台知识地图、实战模块与客户问答手册。",
  path: "/",
  enPath: "/en",
});

const layerCount = layers.length;
const moduleCount = moduleList.length;
const explorerModules: ExplorerModule[] = publishedModuleSlugs.map((slug) => {
  const item = moduleList.find((module) => module.slug === slug);
  const discovery = moduleDiscovery[slug as keyof typeof moduleDiscovery];
  if (!item || !discovery) throw new Error(`首页模块发现信息不完整：${slug}`);
  return { ...item, ...discovery };
});

const moduleNames = new Map(moduleList.map((module) => [module.slug, module.zh]));

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
    title: "第一次与客户聊 AI 平台",
    time: "建立全局判断",
    steps: [
      [{ slug: "solution-patterns", label: "场景解决方案" }],
      [{ slug: "model-landscape", label: "模型格局" }],
      [{ slug: "llm", label: "LLM" }],
      [{ slug: "evaluation", label: "评估" }],
    ],
    outcome: "先判断客户真正要解决的问题，再讨论模型和产品。",
  },
  {
    no: "02",
    title: "正在设计企业知识助手",
    time: "规划 PoC 验证",
    steps: [
      [{ slug: "data-engineering", label: "数据工程" }],
      [{ slug: "rag", label: "RAG" }],
      [{ slug: "security", label: "安全" }],
      [{ slug: "ai-gateway", label: "AI 网关" }],
      [{ slug: "ai-ops", label: "AI Ops" }],
    ],
    outcome: "把知识、权限、回答质量和上线运营连成完整方案。",
  },
  {
    no: "03",
    title: "客户希望 AI 执行业务任务",
    time: "控制行动风险",
    steps: [
      [{ slug: "ai-agent", label: "Agent" }],
      [{ slug: "mcp", label: "MCP" }, { slug: "a2a", label: "A2A" }],
      [{ slug: "security", label: "安全" }],
      [{ slug: "evaluation", label: "评估" }],
      [{ slug: "ai-ops", label: "AI Ops" }],
    ],
    outcome: "区分模型决策、工具权限、持久任务与业务完成状态。",
  },
  {
    no: "04",
    title: "准备规划私有化 AI 基础设施",
    time: "评估算力需求",
    steps: [
      [{ slug: "model-landscape", label: "模型格局" }],
      [{ slug: "llm-inference", label: "推理" }],
      [{ slug: "ai-infra-platform", label: "平台" }],
      [{ slug: "ai-infra-compute", label: "算力" }],
      [{ slug: "data-engineering", label: "数据工程" }],
    ],
    outcome: "用实际业务负载估算模型服务、GPU、网络和存储需求，再决定部署和采购。",
  },
];

export default function Home() {
  return (
    <main className="fieldbookTheme fieldbookHome fieldbookHomeZh">
      <HomeStyles />
      <ReadingProgress />
      <header className="hero heroV2" id="top">
        <nav className="topbar" aria-label="主导航">
          <Link className="brand" href="/" aria-label="云与 AI 售前知识库首页">
            <span><strong>云与 AI 售前知识库</strong><small>Cloud × AI Presales Fieldbook</small></span>
          </Link>
          <div className="toplinks">
            <a href="#available-modules">从问题开始</a>
            <Link href="/glossary">术语库</Link>
            <Link href="/knowledge-graph">模块关系</Link>
            <details className="homeSelectionMenu">
              <summary>选型</summary>
              <div className="homeSelectionMenuList">
                <Link href="/model-radar">模型</Link>
                <Link href="/coding-agents">Code Agent</Link>
              </div>
            </details>
            <Link href="/references">来源与证据 / Reference</Link>
            <Link href="/en" hrefLang="en" lang="en" prefetch={false}>English</Link>
          </div>
          <details className="homeMobileNav">
            <summary>更多</summary>
            <nav aria-label="更多导航">
              <a href="#available-modules">从问题开始</a>
              <Link href="/glossary">术语库</Link>
              <Link href="/knowledge-graph">模块关系</Link>
              <details className="homeSelectionMenu">
                <summary>选型</summary>
                <div className="homeSelectionMenuList">
                  <Link href="/model-radar">模型</Link>
                  <Link href="/coding-agents">Code Agent</Link>
                </div>
              </details>
              <Link href="/references">来源与证据</Link>
              <Link href="/en" hrefLang="en" lang="en" prefetch={false}>English</Link>
            </nav>
          </details>
        </nav>
        <div id="main-content" className="skipTarget" tabIndex={-1} />

        <div className="heroGrid heroGridV2 heroGridWithArtwork">
          <div className="heroCopy">
            <h1><span>讲清 AI 技术，</span><span>心中有数，丝毫不慌</span></h1>
            <p className="heroLead">理解方案背后的原理和适用限制，用它们回答客户追问。</p>
            <div className="heroActions">
              <a className="homePrimaryAction" href="#learning-paths">按任务开始 <span>→</span></a>
              <a className="homeSecondaryAction" href="#available-modules">直接找问题 <span>→</span></a>
            </div>
          </div>

          <figure className="heroFlightIllustration" aria-hidden="true">
            <span className="heroFlightSignal" />
            <Image
              className="heroFlightArtwork"
              src="/hero-ai-fieldbook-flight.png"
              alt=""
              width={1080}
              height={810}
              priority
              unoptimized
              sizes="(min-width: 981px) 42vw, (min-width: 721px) 72vw, 100vw"
            />
          </figure>

          <aside className="heroDecisionPanel" aria-label="知识库可以帮助完成的任务">
            <h2 className="srOnly">按不同任务进入知识库</h2>
            <ol>
              <li><span>快速了解</span><div><strong>先看结论与边界</strong><p>快速确认这是什么、何时适用，以及下一步该问什么。</p></div></li>
              <li><span>深入理解</span><div><strong>理清系统机制</strong><p>沿处理流程理解机制和责任边界。</p></div></li>
              <li><span>现场查证</span><div><strong>搜索问题与来源</strong><p>从客户问题进入短答、追问和一手来源。</p></div></li>
            </ol>
          </aside>
        </div>
      </header>

      <section className="learningPathsV2" id="learning-paths" aria-labelledby="learning-paths-title">
        <header><h2 id="learning-paths-title">从场景开始</h2><p>先选客户正在面对的场景，再沿路径准备下一步判断。</p></header>
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
                      if (!moduleNames.has(module.slug)) throw new Error(`学习路径引用了未知模块：${module.slug}`);
                      return (
                        <span className="learningPathRouteModule" key={module.slug}>
                          {moduleIndex > 0 ? <i className="learningPathRouteSeparator" aria-hidden="true">/</i> : null}
                          <Link className="learningPathModuleLink" href={`/modules/${module.slug}`} aria-label={`进入 ${module.label} 模块`}>{module.label}</Link>
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

      <div id="available-modules" className="explorerAnchor">
        <ModuleExplorer
          modules={explorerModules}
          knowledgeIndexUrl="/search/knowledge.zh.json"
          structureGuide={{
            badge: `${layerCount} 层 · ${moduleCount} 个模块`,
            title: "先从问题搜，需要时按层缩小范围",
            body: "筛选项已按知识层排列；客户问题还不清晰时，先选一层缩小范围。需要看模块关系，再进入动态探索。",
            href: "/knowledge-graph",
            link: "查看模块关系",
          }}
        />
      </div>

      <section className="timeBudgetPathsV2" id="time-budget-paths" aria-labelledby="time-budget-paths-title">
        <header>
          <h2 id="time-budget-paths-title">从时间开始</h2>
          <p>从 10 分钟现场速查到系统学习，每条路径都只指向正式问题、模块和实战入口；不新增第二份答案内容。</p>
        </header>
        <div className="timeBudgetPathList">
          {timeBudgetPaths.map((path) => (
            <article key={path.id}>
              <span>{path.duration}</span>
              <h3>{path.label}</h3>
              <p>{path.focus}</p>
              <ol>
                {path.steps.map((step) => (
                  <li key={`${path.id}-${step.label}`}>
                    {step.type === "module" ? <Link href={`/modules/${step.slug}`}>{step.label} ↗</Link> : <Link href={path.href}>{step.label} ↗</Link>}
                  </li>
                ))}
              </ol>
              <strong>{path.deliverable}</strong>
            </article>
          ))}
        </div>
        <div className="timeBudgetScenarioIndex" aria-label="场景入口">
          {scenarioDefinitionsForHome.map((scenario) => <Link href={scenario.href} key={scenario.id}>{scenario.title} ↗</Link>)}
        </div>
      </section>

      <section className="homeTermGuide" aria-labelledby="home-term-guide-title">
        <div>
          <h2 id="home-term-guide-title">核心术语速查</h2>
          <p>按模型、应用、协议与治理快速建立知识版图；这里保留跨模块高频概念，完整定义和全部术语进入独立术语库。</p>
        </div>
        <TermHintGroups groups={homepageTermGroups} total={glossaryTermIds.length} />
      </section>

      <footer><span>Cloud × AI Presales Fieldbook</span><span>{moduleCount} 模块阅读版</span></footer>
    </main>
  );
}
