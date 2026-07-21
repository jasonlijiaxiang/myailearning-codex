import type { Metadata } from "next";
import Link from "next/link";

import { ReadingProgress } from "../fieldbook-interactions";
import { KnowledgeGraphExplorer, type GraphLayer, type GraphModule, type GraphRelation, type GraphTerm, type GraphRelationType } from "./knowledge-graph-explorer";
import { layers, moduleList } from "../knowledge-map.mjs";
import { explicitTermRelations, knowledgeRelationTypes, termPrimaryModules } from "../knowledge-relations.mjs";
import { moduleDiscovery } from "../module-discovery.mjs";
import { terminology } from "../terminology.mjs";
import styles from "./knowledge-graph.module.css";

export const metadata: Metadata = {
  title: "全局知识关系图 | 云计算 × AI 平台售前知识库",
  description: "从知识模块进入专业术语，沿明确关系理解云计算与 AI 平台的原理、机制与边界。",
};

const graphLayers: GraphLayer[] = layers.map((layer) => ({
  no: layer.no,
  name: layer.name,
  en: layer.en,
  moduleIds: layer.modules.map((module) => module.slug),
}));

const graphModules: GraphModule[] = moduleList.map((module) => ({
  id: module.slug,
  zh: module.zh,
  en: module.en,
  href: module.href,
  layerNo: module.layerNo,
  layerName: module.layerName,
  summary: moduleDiscovery[module.slug as keyof typeof moduleDiscovery].summary,
}));

const graphTerms: GraphTerm[] = Object.entries(terminology).map(([termId, term]) => ({
  id: termId,
  zh: term.zh,
  en: term.en,
  abbr: term.abbr,
  description: term.description,
  moduleIds: [...term.moduleSlugs],
  primaryModuleId: termPrimaryModules[termId],
}));

const graphRelations: GraphRelation[] = explicitTermRelations.map((relation) => ({ ...relation }));
const graphRelationTypes = Object.fromEntries(Object.entries(knowledgeRelationTypes).map(([id, value]) => [id, { ...value }])) as Record<string, GraphRelationType>;

export default function KnowledgeGraphPage() {
  return (
    <main className={styles.page}>
      <ReadingProgress />
      <header className={styles.header}>
        <nav className="topbar" aria-label="知识关系图导航">
          <Link className="brand" href="/" aria-label="返回云与 AI 售前知识库首页">
            <span><strong>云与 AI 售前知识库</strong><small>Cloud × AI Presales Fieldbook</small></span>
          </Link>
          <div className="toplinks">
            <Link href="/">知识库首页</Link>
            <Link href="/glossary">术语库</Link>
            <Link href="/references">来源与证据</Link>
          </div>
        </nav>

        <div className={styles.intro}>
          <div>
            <h1>全局知识关系图</h1>
            <p>从模块进入知识点，沿明确关系理解原理、机制与边界。</p>
          </div>
          <dl className={styles.stats} aria-label={`${graphLayers.length} 层知识，${graphModules.length} 个模块，${graphTerms.length} 个术语`}>
            <div><dt>{graphLayers.length}</dt><dd>层知识</dd></div>
            <div><dt>{graphModules.length}</dt><dd>个模块</dd></div>
            <div><dt>{graphTerms.length}</dt><dd>个术语</dd></div>
          </dl>
        </div>
      </header>

      <KnowledgeGraphExplorer
        layers={graphLayers}
        modules={graphModules}
        terms={graphTerms}
        relations={graphRelations}
        relationTypes={graphRelationTypes}
      />

      <section className={styles.howTo} aria-labelledby="knowledge-graph-how-to-title">
        <h2 id="knowledge-graph-how-to-title">怎样读这张图</h2>
        <ol>
          <li><span>1</span><div><strong>先选模块</strong><p>从七层知识结构中选择当前要理解的模块。</p></div></li>
          <li><span>2</span><div><strong>再看知识点</strong><p>区分主要讲解与跨模块使用，不把所有连线理解成依赖。</p></div></li>
          <li><span>3</span><div><strong>最后沿关系继续学习</strong><p>点击术语查看机制、前置、控制或指标关系，再回到正式正文。</p></div></li>
        </ol>
      </section>

      <footer className={`siteFooter ${styles.footer}`}>
        <p>全局知识关系图 / Knowledge Relationship Map</p>
        <div><Link href="/">知识库首页</Link><Link href="/glossary">专业术语库</Link><Link href="/references">来源与证据</Link></div>
      </footer>
    </main>
  );
}
