import type { Metadata } from "next";
import Link from "next/link";

import { ReadingProgress } from "../../../fieldbook-interactions";
import { englishPageMetadata } from "../../../i18n/english-page-metadata";
import {
  englishGraphLayers,
  englishGraphModules,
  englishGraphRelations,
  englishGraphRelationTypes,
  englishGraphTerms,
} from "../../../i18n/en/graph-data.mjs";
import { KnowledgeConstellation } from "../../../knowledge-graph/design-2/knowledge-constellation";
import styles from "../../../knowledge-graph/design-2/knowledge-constellation.module.css";
import { SiteFooter, SiteNav } from "../../../site-chrome";

export const metadata: Metadata = englishPageMetadata({
  title: "Dynamic Knowledge Explorer",
  description: "Explore direct relationships among cloud and AI modules, mechanisms, controls, and technical terms.",
  path: "/en/knowledge-graph",
  zhPath: "/knowledge-graph",
});

export default function EnglishKnowledgeGraphPage() {
  return (
    <main lang="en" className={`${styles.page} fieldbookTheme fieldbookGraphTheme`}>
      <ReadingProgress />
      <header className={styles.siteHeader}>
        <SiteNav
          locale="en"
          ariaLabel="Dynamic explorer navigation"
          brandAriaLabel="Return to the fieldbook home"
          brandPrefetch={false}
          links={[
            { href: "/en", label: "Home", prefetch: false },
            { href: "/en/questions", label: "Questions", prefetch: false },
            { href: "/en/glossary", label: "Glossary", prefetch: false },
            { href: "/en#available-modules", label: "Find modules", prefetch: false },
            { href: "/en/references", label: "References", prefetch: false },
            { href: "/knowledge-graph", label: "Chinese", hrefLang: "zh-CN", lang: "zh-CN", prefetch: false },
          ]}
        />
        <div id="main-content" className="skipTarget" tabIndex={-1} />
      </header>

      <header className={styles.intro}>
        <div><h1>Dynamic knowledge relationships</h1><p>Start with a module or term, then follow explicit direct relationships across mechanisms, controls, evidence, and decision boundaries.</p></div>
        <dl aria-label={`${englishGraphLayers.length} knowledge layers, ${englishGraphModules.length} modules, and ${englishGraphTerms.length} terms`}>
          <div><dt>{englishGraphLayers.length}</dt><dd>knowledge layers</dd></div>
          <div><dt>{englishGraphModules.length}</dt><dd>modules</dd></div>
          <div><dt>{englishGraphTerms.length}</dt><dd>terms</dd></div>
        </dl>
      </header>

      <KnowledgeConstellation
        layers={englishGraphLayers}
        modules={englishGraphModules}
        terms={englishGraphTerms}
        relations={englishGraphRelations}
        relationTypes={englishGraphRelationTypes}
        language="en"
      />

      <SiteFooter locale="en" className={styles.footer}><p>The graph shows curated explicit relationships; an omitted connection is not proof that two concepts are unrelated.</p><Link href="/en#map" prefetch={false}>Return to the knowledge map</Link></SiteFooter>
    </main>
  );
}
