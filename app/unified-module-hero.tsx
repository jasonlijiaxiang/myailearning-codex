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

export type UnifiedModuleLocale = "zh-CN" | "en";

const heroCopyByLocale = {
  "zh-CN": {
    navigation: "模块导航",
    brandAria: "返回云与 AI 售前知识库首页",
    home: "首页",
    questions: "本模块问答",
    sources: "来源",
    glossary: "术语库",
    language: "English",
    mobileMenu: "模块导航菜单",
    metrics: {
      ariaLabel: "模块内容概览",
      sections: "阅读方式",
      sectionUnit: "种",
      questions: "问题库",
      questionUnit: "题",
      evidence: "证据卡",
      evidenceUnit: "张",
    },
    facts: (shortTitle: string) => `${shortTitle} 核心判断`,
  },
  en: {
    navigation: "Module navigation",
    brandAria: "Return to the Cloud and AI Presales Fieldbook home",
    home: "Home",
    questions: "Questions",
    sources: "Sources",
    glossary: "Glossary",
    language: "Chinese",
    mobileMenu: "Module navigation menu",
    metrics: {
      ariaLabel: "Module content overview",
      sections: "Reading modes",
      questions: "Questions",
      evidence: "Evidence cards",
    },
    facts: (shortTitle: string) => `${shortTitle} decision facts`,
  },
} as const;

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
  locale?: UnifiedModuleLocale;
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
  locale = "zh-CN",
}: UnifiedModuleHeroProps) {
  const copy = heroCopyByLocale[locale];
  const isEnglish = locale === "en";
  const languagePath = isEnglish ? `/modules/${slug}` : englishModulePath(slug);
  const homePath = isEnglish ? "/en" : "/";
  const sourcesPath = isEnglish ? `/en/references?module=${slug}` : `/references#module-${slug}`;
  const glossaryPath = isEnglish ? "/en/glossary" : "/glossary";

  const navigationLinks = (
    <>
      <Link href={homePath}>{copy.home}</Link>
      <a href="#qa">{copy.questions}</a>
      <Link href={sourcesPath}>{copy.sources}</Link>
      <Link href={glossaryPath}>{copy.glossary}</Link>
      {languagePath ? (
        <Link
          href={languagePath}
          hrefLang={isEnglish ? "zh-CN" : "en"}
          lang={isEnglish ? "zh-CN" : "en"}
          prefetch={false}
        >
          {copy.language}
        </Link>
      ) : null}
    </>
  );

  return (
    <header className={styles.hero} data-module-hero="unified" id={anchorId} aria-labelledby={titleId} lang={isEnglish ? "en" : undefined}>
      <nav className={styles.siteNav} aria-label={copy.navigation}>
        <Link className={styles.brand} href={homePath} aria-label={copy.brandAria}>
          Cloud × AI / Presales Fieldbook
        </Link>
        <div className={styles.siteLinks}>{navigationLinks}</div>
        <details key={slug} className={styles.mobileMenu}>
          <summary aria-label={copy.mobileMenu}><span /><span /><span /></summary>
          <div>{navigationLinks}</div>
        </details>
      </nav>

      <div className={styles.heroGrid}>
        <div className={styles.identity}>
          <h1 id={titleId}>
            <span>{shortTitle}</span>
            {isEnglish ? <small>{enTitle}</small> : <small>{zhTitle}<em lang="en"> · {enTitle}</em></small>}
          </h1>
        </div>
        <div className={styles.summary}>
          <p className={styles.definition}>{definition}</p>
          <p className={styles.position}>{position}</p>
          <ModuleHeroMetrics
            questionCount={questionCount}
            evidenceCount={evidenceCount}
            labels={copy.metrics}
          />
        </div>
      </div>

      <dl className={styles.factLedger} aria-label={copy.facts(shortTitle)}>
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
      <main id="main-content" className={className} data-module-content="unified" lang={hero.locale === "en" ? "en" : undefined} tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
