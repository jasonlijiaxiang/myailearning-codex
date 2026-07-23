import type { Metadata } from "next";
import Link from "next/link";

import { ReadingProgress } from "../../fieldbook-interactions";
import {
  englishGraphLayers,
  englishGraphModules,
  englishGraphRelations,
  englishGraphRelationTypes,
  englishGraphScalePolicy,
  englishGraphTerms,
} from "../../i18n/en/graph-data.mjs";
import { KnowledgeConstellation } from "../../knowledge-graph/design-2/knowledge-constellation";
import styles from "../../knowledge-graph/design-2/knowledge-constellation.module.css";

export const metadata: Metadata = {
  title: "Dynamic Knowledge Explorer",
  description: "Explore direct relationships among cloud and AI modules, mechanisms, controls, and technical terms.",
};

export default function EnglishKnowledgeGraphPage() {
  return (
    <main lang="en" className={styles.page}>
      <ReadingProgress />
      <header className={styles.siteHeader}>
        <nav className="topbar" aria-label="Dynamic explorer navigation">
          <Link className="brand" href="/en" aria-label="Return to the fieldbook home" prefetch={false}><span><strong>Cloud × AI Presales Fieldbook</strong><small>Evidence-backed technical field guide</small></span></Link>
          <div className="toplinks">
            <Link href="/en" prefetch={false}>Home</Link>
            <Link href="/en/questions" prefetch={false}>Questions</Link>
            <Link href="/en/glossary" prefetch={false}>Glossary</Link>
            <Link href="/en#available-modules" prefetch={false}>Find modules</Link>
            <Link href="/en/references" prefetch={false}>References</Link>
            <Link href="/knowledge-graph" hrefLang="zh-CN" lang="zh-CN" prefetch={false}>中文</Link>
          </div>
        </nav>
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
        scalePolicy={englishGraphScalePolicy}
        language="en"
      />

      <footer className={styles.footer}>
        <p>The graph shows curated explicit relationships; an omitted connection is not proof that two concepts are unrelated.</p>
        <Link href="/en#map" prefetch={false}>Return to the knowledge map</Link>
      </footer>
    </main>
  );
}
