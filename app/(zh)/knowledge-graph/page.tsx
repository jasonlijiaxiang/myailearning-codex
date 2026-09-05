import type { Metadata } from "next";
import { chinesePageMetadata } from "../../i18n/chinese-page-metadata";
import Link from "next/link";

import { ReadingProgress } from "../../fieldbook-interactions";
import {
  graphLayers,
  graphModules,
  graphRelations,
  graphRelationTypes,
  graphTerms,
} from "../../knowledge-graph/graph-data.mjs";
import { KnowledgeConstellation } from "../../knowledge-graph/design-2/knowledge-constellation";
import styles from "../../knowledge-graph/design-2/knowledge-constellation.module.css";
import { SiteFooter, SiteNav, type SiteNavItem } from "../../site-chrome";

export const metadata: Metadata = chinesePageMetadata({
  title: "动态探索 | 云计算 × AI 平台售前知识库",
  description: "从模块进入知识点，以动态聚焦、语义缩放和一跳关系探索云计算与 AI 平台知识。",
  path: "/knowledge-graph",
  enPath: "/en/knowledge-graph",
});

const graphNavLinks: readonly SiteNavItem[] = [
  { href: "/", label: "知识库首页" },
  { href: "/questions", label: "问题查询" },
  { href: "/glossary", label: "术语库" },
  { href: "/#available-modules", label: "从问题开始" },
  { href: "/references", label: "来源与证据 / Reference" },
];

export default function KnowledgeGraphPage() {
  return (
    <main className={`${styles.page} fieldbookTheme fieldbookGraphTheme`}>
      <ReadingProgress />
      <header className={styles.siteHeader}>
        <SiteNav locale="zh" ariaLabel="动态探索导航" brandAriaLabel="返回云与 AI 售前知识库首页" links={graphNavLinks} />
        <div id="main-content" className="skipTarget" tabIndex={-1} />
      </header>

      <header className={styles.intro}>
        <div>
          <h1>动态知识关系图</h1>
          <p>从模块进入知识点，沿明确关系动态探索原理、机制与边界。</p>
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
      />

      <SiteFooter locale="zh" className={styles.footer}><p>图中只展示已经整理的明确关系，不表示所有可能联系。</p><Link href="/#available-modules">从问题开始</Link></SiteFooter>
    </main>
  );
}
