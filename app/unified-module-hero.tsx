import type { ReactNode } from "react";
import Link from "next/link";

import { ReadingProgress } from "./fieldbook-interactions";
import { englishModulePath } from "./i18n/locale-config.mjs";
import { ModuleHeroMetrics } from "./module-content-components";
import styles from "./unified-module-reader.module.css";

export type UnifiedModuleFact = {
  label: string;
  value: string;
};

export type UnifiedModuleHeroProps = {
  anchorId: string;
  titleId: string;
  shortTitle: string;
  zhTitle: string;
  enTitle: string;
  definition: string;
  position: string;
  slug: string;
  questionCount: number;
  evidenceCount: number;
  facts: readonly UnifiedModuleFact[];
};

export function UnifiedModuleHero({
  anchorId,
  titleId,
  shortTitle,
  zhTitle,
  enTitle,
  definition,
  position,
  slug,
  questionCount,
  evidenceCount,
  facts,
}: UnifiedModuleHeroProps) {
  const englishPath = englishModulePath(slug);

  return (
    <header className={styles.hero} data-module-hero="unified" id={anchorId} aria-labelledby={titleId}>
      <nav className={styles.siteNav} aria-label="模块导航">
        <Link className={styles.brand} href="/" aria-label="返回云与 AI 售前知识库首页">
          Cloud × AI / Presales Fieldbook
        </Link>
        <div className={styles.siteLinks}>
          <Link href="/">首页</Link>
          <a href="#qa">本模块问答</a>
          <Link href={`/references#module-${slug}`}>来源</Link>
          <Link href="/glossary">术语库</Link>
          {englishPath ? <Link href={englishPath} hrefLang="en" lang="en" prefetch={false}>English</Link> : null}
        </div>
        <details key={slug} className={styles.mobileMenu}>
          <summary aria-label="模块导航菜单"><span /><span /><span /></summary>
          <div>
            <Link href="/">首页</Link>
            <a href="#qa">本模块问答</a>
            <Link href={`/references#module-${slug}`}>来源</Link>
            <Link href="/glossary">术语库</Link>
            {englishPath ? <Link href={englishPath} hrefLang="en" lang="en" prefetch={false}>English</Link> : null}
          </div>
        </details>
      </nav>

      <div className={styles.heroGrid}>
        <div className={styles.identity}>
          <h1 id={titleId}>
            <span>{shortTitle}</span>
            <small>{zhTitle}<em> · {enTitle}</em></small>
          </h1>
        </div>
        <div className={styles.summary}>
          <p className={styles.definition}>{definition}</p>
          <p className={styles.position}>{position}</p>
          <ModuleHeroMetrics
            sectionCount={3}
            questionCount={questionCount}
            evidenceCount={evidenceCount}
            labels={{
              ariaLabel: "模块内容概览",
              sections: "阅读方式",
              sectionUnit: "种",
              questions: "问题库",
              questionUnit: "题",
              evidence: "证据卡",
              evidenceUnit: "张",
            }}
          />
        </div>
      </div>

      <dl className={styles.factLedger} aria-label={`${shortTitle} 核心判断`}>
        {facts.map((fact) => (
          <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
        ))}
      </dl>
    </header>
  );
}

export function UnifiedModuleScaffold({
  children,
  className,
  hero,
}: {
  children: ReactNode;
  className: string;
  hero: UnifiedModuleHeroProps;
}) {
  return (
    <>
      <ReadingProgress />
      <UnifiedModuleHero {...hero} />
      <main id="main-content" className={className} data-module-content="unified" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
