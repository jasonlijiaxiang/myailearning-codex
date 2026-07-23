import type { Metadata } from "next";
import Link from "next/link";

import { ReadingProgress } from "../fieldbook-interactions";
import { GlossaryExplorer, type GlossaryGroupItem, type GlossaryTermItem } from "../glossary-explorer";
import { moduleList } from "../knowledge-map.mjs";
import { glossaryGroups, glossaryTermIds, requireTerm } from "../terminology.mjs";

export const metadata: Metadata = {
  title: "专业术语库 | 云计算 × AI 平台售前知识库",
  description: "集中查询云计算、生成式 AI、RAG、Agent、模型训练推理、安全治理与售前交付的中英文专业术语。",
};

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

export default function GlossaryPage() {
  return (
    <main className="glossaryPage">
      <ReadingProgress />
      <header className="hero glossaryHero" id="top">
        <nav className="topbar" aria-label="术语库导航">
          <Link className="brand" href="/" aria-label="返回云与 AI 售前知识库首页">
            <span><strong>云与 AI 售前知识库</strong><small>Cloud × AI Presales Fieldbook</small></span>
          </Link>
          <div className="toplinks">
            <Link href="/">知识库首页</Link>
            <Link href="/questions">问题查询</Link>
            <a href="#glossary-directory">术语目录</a>
            <Link href="/references">来源与证据 / Reference</Link>
            <Link href="/en/glossary" hrefLang="en" lang="en" prefetch={false}>English</Link>
          </div>
        </nav>

        <div className="glossaryHeroGrid">
          <div className="heroCopy">
            <p className="eyebrow">FIELD GLOSSARY · 专业术语库</p>
            <h1>先把术语讲清楚，<br />再进入架构与选型</h1>
            <p className="heroLead">这里不是缩写清单，而是云与 AI 售前知识的概念入口：中文名、英文名、通行缩写、一句话定义和相关模块保持一致，读者可以从一个词继续进入机制、边界、客户问答与证据。</p>
            <div className="heroActions">
              <a className="primaryButton" href="#glossary-directory">搜索全部术语</a>
              <Link className="textButton" href="/#map">查看知识地图 <span>↗</span></Link>
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

      <footer className="siteFooter glossaryFooter">
        <p>专业术语库 / Field Glossary</p>
        <div><Link href="/">知识库首页</Link><Link href="/questions">客户问题查询</Link><Link href="/references">来源与证据</Link><a href="#top">回到顶部 ↑</a></div>
      </footer>
    </main>
  );
}
