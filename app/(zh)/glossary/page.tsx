import type { Metadata } from "next";
import { chinesePageMetadata } from "../../i18n/chinese-page-metadata";
import Link from "next/link";

import { ReadingProgress } from "../../fieldbook-interactions";
import { GlossaryExplorer, type GlossaryGroupItem, type GlossaryTermItem } from "../../glossary-explorer";
import { moduleList } from "../../knowledge-map.mjs";
import { glossaryGroups, glossaryTermIds, requireTerm } from "../../terminology.mjs";
import { SiteFooter, SiteNav, type SiteNavItem, type SiteFooterLink } from "../../site-chrome";

export const metadata: Metadata = chinesePageMetadata({
  title: "专业术语库 | 云计算 × AI 平台售前知识库",
  description: "集中查询云计算、生成式 AI、RAG、Agent、模型训练推理、安全治理与售前交付的中英文专业术语。",
  path: "/glossary",
  enPath: "/en/glossary",
});

const moduleBySlug = new Map(moduleList.map((module) => [module.slug, module]));

const groups: GlossaryGroupItem[] = glossaryGroups.map((group) => ({ id: group.id, zh: group.zh, en: group.en }));
const terms: GlossaryTermItem[] = glossaryGroups.flatMap((group) => group.termIds.map((termId) => {
  const term = requireTerm(termId);
  const modules = term.moduleSlugs.map((slug) => {
    const knowledgeModule = moduleBySlug.get(slug);
    if (!knowledgeModule) throw new Error(`Glossary term ${termId} references unpublished module: ${slug}`);
    return { slug, zh: knowledgeModule.zh, en: knowledgeModule.en };
  });
  return {
    id: termId,
    groupId: group.id,
    zh: term.zh,
    en: term.en,
    abbr: term.abbr,
    description: term.description,
    modules,
  };
}));

const abbreviationCount = terms.filter((term) => term.abbr).length;

const glossaryNavLinks: readonly SiteNavItem[] = [
  { href: "/", label: "知识库首页" },
  { href: "/questions", label: "问题查询" },
  { href: "#glossary-directory", label: "术语目录" },
  { href: "/references", label: "来源与证据 / Reference" },
  { href: "/en/glossary", label: "English", hrefLang: "en", lang: "en", prefetch: false },
];

const glossaryFooterLinks: readonly SiteFooterLink[] = [
  { href: "/", label: "知识库首页" },
  { href: "/questions", label: "客户问题查询" },
  { href: "/references", label: "来源与证据" },
];

export default function GlossaryPage() {
  return (
    <main className="fieldbookTheme glossaryPage">
      <ReadingProgress />
      <header className="hero glossaryHero" id="top">
        <SiteNav locale="zh" ariaLabel="术语库导航" brandAriaLabel="返回云与 AI 售前知识库首页" links={glossaryNavLinks} />
        <div id="main-content" className="skipTarget" tabIndex={-1} />

        <div className="glossaryHeroGrid">
          <div className="heroCopy">
            <p className="eyebrow">FIELD GLOSSARY · 专业术语库</p>
            <h1>把术语讲清楚，<br />再做架构与选型</h1>
            <p className="heroLead">这里统一说明云与 AI 售前术语。每个词条包含中英文名称、简短定义和相关模块；有通行缩写时一并列出，并可继续查看机制、边界、客户问答与证据。</p>
            <div className="heroActions">
              <a className="primaryButton" href="#glossary-directory">搜索全部术语</a>
              <Link className="textButton" href="/#available-modules">从问题开始 <span>↗</span></Link>
            </div>
          </div>
          <aside className="glossaryHeroStats" aria-label="术语库内容概览">
            <div><strong>{glossaryTermIds.length}</strong><span>个统一术语</span></div>
            <div><strong>{glossaryGroups.length}</strong><span>个知识主题</span></div>
            <div><strong>{abbreviationCount}</strong><span>个通行缩写</span></div>
            <p>所有术语都关联到正式模块；解释用于快速建立共同语言，技术边界和证据仍回到模块与 Reference。</p>
          </aside>
        </div>
      </header>

      <section className="glossaryDirectorySection" id="glossary-directory" aria-labelledby="glossary-directory-title">
        <div className="glossaryDirectoryIntro">
          <div><p className="kicker">SEARCH BY CONCEPT</p><h2 id="glossary-directory-title">按知识关系查词，不按字母背词</h2></div>
          <p>可以搜索中文、英文、缩写或说明，也可以按模型、检索、Agent、安全、训练和交付等主题筛选。每个术语都提供继续阅读的模块和来源入口。</p>
        </div>
        <GlossaryExplorer groups={groups} terms={terms} />
      </section>

      <SiteFooter locale="zh" className="siteFooter glossaryFooter" note="专业术语库 / Field Glossary" links={glossaryFooterLinks} backToTop={{ label: "回到顶部 ↑" }} />
    </main>
  );
}
