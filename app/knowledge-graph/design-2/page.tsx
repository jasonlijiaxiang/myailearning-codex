import type { Metadata } from "next";
import Link from "next/link";

import { ReadingProgress } from "../../fieldbook-interactions";
import {
  graphLayers,
  graphModules,
  graphRelations,
  graphRelationTypes,
  graphScalePolicy,
  graphTerms,
} from "../graph-data.mjs";
import { KnowledgeConstellation } from "./knowledge-constellation";
import styles from "./knowledge-constellation.module.css";

export const metadata: Metadata = {
  title: "知识星图 Design 2 | 云计算 × AI 平台售前知识库",
  description: "以动态聚焦、语义缩放和一跳关系探索云计算与 AI 平台知识。",
};

export default function KnowledgeConstellationPage() {
  return (
    <main className={styles.page}>
      <ReadingProgress />
      <nav className={styles.topbar} aria-label="知识星图导航">
        <Link className={styles.brand} href="/">
          <strong>云与 AI 售前知识库</strong>
          <small>Cloud × AI Presales Fieldbook</small>
        </Link>
        <div>
          <Link href="/knowledge-graph">Design 1</Link>
          <Link href="/glossary">术语库</Link>
          <Link href="/references">来源与证据</Link>
        </div>
      </nav>

      <header className={styles.intro}>
        <div>
          <h1>全局知识关系图</h1>
          <p>从模块进入知识点，沿明确关系理解原理、机制与边界。</p>
        </div>
        <dl aria-label={`${graphLayers.length} 层知识，${graphModules.length} 个模块，${graphTerms.length} 个术语`}>
          <div><dt>{graphLayers.length}</dt><dd>层知识</dd></div>
          <div><dt>{graphModules.length}</dt><dd>个模块</dd></div>
          <div><dt>{graphTerms.length}</dt><dd>个术语</dd></div>
        </dl>
      </header>

      <KnowledgeConstellation
        layers={graphLayers}
        modules={graphModules}
        terms={graphTerms}
        relations={graphRelations}
        relationTypes={graphRelationTypes}
        scalePolicy={graphScalePolicy}
      />

      <footer className={styles.footer}>
        <p>图中只展示已经整理的明确关系，不表示所有可能联系。</p>
        <Link href="/knowledge-graph">返回 Design 1 阅读模式</Link>
      </footer>
    </main>
  );
}
