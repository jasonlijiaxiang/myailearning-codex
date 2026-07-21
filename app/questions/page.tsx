import type { Metadata } from "next";
import Link from "next/link";

import {
  QuestionDirectoryShell,
  ReadingProgress,
  type QuestionDirectoryFilterItem,
  type QuestionDirectoryModule,
} from "../fieldbook-interactions";
import { questionDirectoryItems, questionDirectoryModules } from "../question-index.mjs";
import { sourceLedger } from "../reference-content.mjs";
import { QuestionAddedAt } from "../module-content-components";

export const metadata: Metadata = {
  title: "客户问题查询 | 云计算 × AI 平台售前知识库",
  description: "集中查询云计算与 AI 平台售前知识库全部模块的客户问题、短答、深答、售前下一问与证据。",
};

const filterItems: QuestionDirectoryFilterItem[] = questionDirectoryItems.map((item) => ({
  key: item.key,
  moduleId: item.moduleId,
  tag: item.tag,
  text: item.searchText,
}));

const filterModules: QuestionDirectoryModule[] = questionDirectoryModules.map((module) => ({
  id: module.id,
  label: `${module.zh} · ${module.en}`,
  count: module.count,
}));

const uniqueTagCount = new Set(questionDirectoryItems.map((item) => item.tag)).size;

export default function QuestionsPage() {
  return (
    <main className="questionPage">
      <ReadingProgress />
      <header className="hero questionHero" id="top">
        <nav className="topbar" aria-label="问题查询页导航">
          <Link className="brand" href="/" aria-label="返回云与 AI 售前知识库首页">
            <span>Cloud × AI / Presales Fieldbook</span>
          </Link>
          <div className="toplinks">
            <Link href="/">知识库首页 / Home</Link>
            <Link href="/glossary">专业术语库</Link>
            <a href="#question-directory">查询全部问题</a>
            <Link href="/references">Reference</Link>
          </div>
        </nav>

        <div className="questionHeroGrid">
          <div className="heroCopy">
            <p className="eyebrow">CUSTOMER QUESTION DIRECTORY · 一站式问题查询</p>
            <h1>客户问题查询<br /><span>Question Directory</span></h1>
            <p className="heroLead">把 19 个模块的客户问题集中在一个入口。搜索客户原话、技术概念、风险或方案取舍，先拿到结论短答，再展开机制、售前下一问和题内证据。</p>
            <div className="heroActions">
              <a className="primaryButton" href="#question-directory">开始查询</a>
              <Link className="textButton" href="/#map">查看知识地图 <span>↗</span></Link>
            </div>
          </div>
          <aside className="questionHeroStats" aria-label="问题查询页内容概览">
            <div><strong>{questionDirectoryItems.length}</strong><span>个客户问题</span></div>
            <div><strong>{questionDirectoryModules.length}</strong><span>个正式模块</span></div>
            <div><strong>{uniqueTagCount}</strong><span>个问题类别</span></div>
            <p>覆盖概念边界、方案选择、工程风险、上线运营与客户反对意见，可从问题直接进入完整回答。</p>
          </aside>
        </div>
      </header>

      <section className="questionDirectorySection" id="question-directory" aria-labelledby="question-directory-title">
        <div className="questionDirectoryIntro">
          <div><p className="kicker">SEARCH, ANSWER, THEN ASK</p><h2 id="question-directory-title">从客户的一句话，进入完整判断链</h2></div>
          <p>默认展示全部问题。可以组合关键词、模块和类别筛选；每条结果都保留短答、深答、下一问、证据，以及返回原模块上下文的入口。</p>
        </div>

        <QuestionDirectoryShell items={filterItems} modules={filterModules}>
          <div className="questionDirectoryList">
            {questionDirectoryItems.map((item) => (
              <article
                id={`question-${item.key}`}
                className="questionDirectoryItem"
                data-question-key={item.key}
                data-question-module={item.moduleId}
                data-question-tag={item.tag}
                key={item.key}
              >
                <header>
                  <Link href={item.moduleHref}>{item.moduleZh}<span>{item.moduleEn}</span></Link>
                  <span className="questionDirectoryTag">{item.tag}</span>
                  <span className="questionDirectoryNo">Q{String(item.number).padStart(2, "0")}</span>
                </header>
                <h3>{item.question}</h3>
                <QuestionAddedAt value={item.addedAt ?? undefined} className="questionDirectoryAddedAt" />
                <div className="questionDirectoryShort"><span>结论短答</span><p>{item.answer}</p></div>
                <details>
                  <summary><span>展开深答、下一问与证据</span><i aria-hidden="true">＋</i></summary>
                  <div className="questionDirectoryDepth">
                    <section><p className="answerLabel">深一层</p><p>{item.depth}</p></section>
                    <section className="questionDirectoryAsk"><p className="answerLabel">售前下一问</p><p>{item.ask}</p></section>
                    <section className="questionDirectoryEvidence" aria-label="本题依据">
                      <div><p className="answerLabel">本题依据 / Evidence</p><span>{item.basis}</span></div>
                      <ul>
                        {item.evidence.map((reference) => {
                          const source = sourceLedger[reference.sourceId as keyof typeof sourceLedger];
                          return <li key={reference.sourceId}><Link href={`/references#source-${reference.sourceId}`}><strong>{source.shortTitle}</strong><span>{reference.supports}</span></Link></li>;
                        })}
                      </ul>
                    </section>
                  </div>
                </details>
                <footer><Link href={item.originalHref}>回到原模块中的这个问题 <span>↗</span></Link></footer>
              </article>
            ))}
          </div>
        </QuestionDirectoryShell>
      </section>

      <footer className="siteFooter questionFooter">
        <p>客户问题查询 / Question Directory</p>
        <div><Link href="/">知识库首页</Link><Link href="/references">来源与证据</Link><a href="#top">回到顶部 ↑</a></div>
      </footer>
    </main>
  );
}
