import type { Metadata } from "next";
import { chinesePageMetadata } from "../../i18n/chinese-page-metadata";
import Link from "next/link";

import {
  QuestionDirectoryShell,
  ReadingProgress,
  type QuestionDirectoryModule,
} from "../../fieldbook-interactions";
import { questionDirectoryItems, questionDirectoryModules } from "../../question-index.mjs";
import { fallbackScripts, intentDefinitions } from "../../question-field-kit.mjs";
import { SiteFooter, SiteNav, type SiteNavItem, type SiteFooterLink } from "../../site-chrome";

export const metadata: Metadata = chinesePageMetadata({
  title: "客户问题查询 | 云计算 × AI 平台售前知识库",
  description: "集中查询云计算与 AI 平台售前知识库全部模块的客户问题、短答、深答、售前下一问与证据。",
  path: "/questions",
  enPath: "/en/questions",
});

const filterModules: QuestionDirectoryModule[] = questionDirectoryModules.map((module) => ({
  id: module.id as string,
  label: `${module.zh} · ${module.en}`,
  count: module.count,
}));

const uniqueTagCount = new Set(questionDirectoryItems.map((/** @type {any} */ item) => item.tag)).size;
const fieldKitCount = questionDirectoryItems.filter((/** @type {any} */ item) => item.tier).length;
const moduleCountLead = `这里汇总 ${questionDirectoryModules.length} 个模块的客户问题。可按客户原话、技术概念、风险或方案取舍搜索，查看结论短答、机制、售前下一问和题内证据；会前可先看 ${fieldKitCount} 道精选题。`;

const questionsNavLinks: readonly SiteNavItem[] = [
  { href: "/", label: "知识库首页 / Home" },
  { href: "/glossary", label: "专业术语库" },
  { href: "#question-directory", label: "查询全部问题" },
  { href: "/references", label: "Reference" },
  { href: "/en/questions", label: "English", hrefLang: "en", lang: "en", prefetch: false },
];

const questionsFooterLinks: readonly SiteFooterLink[] = [
  { href: "/", label: "知识库首页" },
  { href: "/references", label: "来源与证据" },
];

/** @param {string} value */
function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

type QuestionDirectoryEntry = {
  key: string;
  moduleId: string;
  question: string;
  answer: string;
  displayPhrase?: string | null;
  originalHref: string;
};

// 问题条目列表以静态 HTML 字符串整体输出（dangerouslySetInnerHTML），避免 355 个条目在
// RSC flight 载荷中再次按元素树序列化。每个模块是一个原生 <details>：无 JS 时全部问题的
// 结论短答可见可到达；深答、下一问与证据由客户端在模块展开时按需注入
// （/search/question-directory.zh.json），不进入初始 HTML。
function buildQuestionDirectoryListHtml() {
  const entriesByModule = new Map<string, QuestionDirectoryEntry[]>(questionDirectoryModules.map((module) => [module.id, []]));
  for (const item of questionDirectoryItems) entriesByModule.get(item.moduleId)?.push(item);

  const sections = questionDirectoryModules.map((module) => {
    const items = entriesByModule.get(module.id) ?? [];
    const entries = items.map((item) => (
      `<article class="questionDirectoryItem" data-question-key="${item.key}">` +
      `<h3><a href="${item.originalHref}">${escapeHtml(item.question)}</a></h3>` +
      `<p class="questionDirectoryShort"><span>结论短答</span>${escapeHtml(item.answer)}</p>` +
      `</article>`
    )).join("");
    return (
      `<details class="questionDirectoryModule" data-question-module="${module.id}">` +
      `<summary><a href="${module.href}">${escapeHtml(`${module.zh} · ${module.en}`)}</a><small>${items.length} 道题</small></summary>` +
      entries +
      `</details>`
    );
  }).join("");
  return sections;
}

const questionDirectoryListHtml = buildQuestionDirectoryListHtml();

type QuestionsSearchParams = { view?: string; module?: string; intent?: string };

export default async function QuestionsPage({ searchParams }: { searchParams?: Promise<QuestionsSearchParams> }) {
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({})) as QuestionsSearchParams;
  const initialView = resolvedSearchParams.view === "field-kit" || resolvedSearchParams.view === "core" || resolvedSearchParams.view === "situational" ? resolvedSearchParams.view : "all";
  const requestedModule = resolvedSearchParams.module;
  const requestedIntent = resolvedSearchParams.intent;
  const initialModuleId = requestedModule && questionDirectoryModules.some((module) => module.id === requestedModule) ? requestedModule : "all";
  const initialIntentId = requestedIntent && intentDefinitions.some((intent) => intent.id === requestedIntent) ? requestedIntent : "all";

  return (
    <main className="fieldbookTheme questionPage">
      <ReadingProgress />
      <header className="hero questionHero" id="top">
        <SiteNav locale="zh" ariaLabel="问题查询页导航" brand="presales" brandAriaLabel="返回云与 AI 售前知识库首页" links={questionsNavLinks} />
        <div id="main-content" className="skipTarget" tabIndex={-1} />

        <div className="questionHeroGrid">
          <div className="heroCopy">
            <p className="eyebrow">CUSTOMER QUESTION DIRECTORY · 问题查询</p>
            <h1>客户问题查询<br /><span>Question Directory</span></h1>
            <p className="heroLead">{moduleCountLead}</p>
            <div className="heroActions">
              <a className="primaryButton" href="#question-directory">开始查询</a>
              <Link className="textButton" href="/#available-modules">从问题开始 <span>↗</span></Link>
            </div>
          </div>
          <aside className="questionHeroStats" aria-label="问题查询页内容概览">
            <div><strong>{questionDirectoryItems.length}</strong><span>个客户问题</span></div>
            <div><strong>{questionDirectoryModules.length}</strong><span>个正式模块</span></div>
            <div><strong>{uniqueTagCount}</strong><span>个问题类别</span></div>
            <p>覆盖概念边界、方案选择、工程风险、上线运营与客户反对意见，可从问题直接进入完整回答；现场题不复制答案，仍指向正式问答。</p>
          </aside>
        </div>
      </header>

      <section className="questionFieldKit" id="field-kit" aria-labelledby="field-kit-title">
        <div className="questionFieldKitIntro">
          <div><p className="kicker">FIELD KIT · 现场备战层</p><h2 id="field-kit-title">会前先看现场题，答不上来时用兜底话术</h2></div>
          <p>现场精选直接绑定正式问答，不建立第二份答案。按问题意图缩小范围，或用客户口语搜索；遇到信息不足、动态事实、法律安全和业务状态未知时，使用下方四类兜底话术。</p>
        </div>
        <div className="questionIntentStrip">
          {intentDefinitions.map((intent) => <span key={intent.id}><strong>{intent.zh}</strong><small>{intent.scope}</small></span>)}
        </div>
        <div className="fallbackScriptGrid">
          {fallbackScripts.map((script) => (
            <article key={script.id}>
              <span>{script.title}</span>
              <h3>{script.trigger}</h3>
              <p>{script.script}</p>
              <strong>还需要确认：{script.need}</strong>
              <small>不能越过：{script.boundary}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="questionDirectorySection" id="question-directory" aria-labelledby="question-directory-title">
        <div className="questionDirectoryIntro">
          <div><p className="kicker">SEARCH, ANSWER, THEN ASK</p><h2 id="question-directory-title">从客户问题找到结论和依据</h2></div>
          <p>默认展示全部问题的结论短答，可按模块展开。可以组合关键词、模块、类别和问题意图筛选，也可以只看现场精选；展开模块后按需加载每条问题的深答、下一问与证据，并可返回原模块上下文。</p>
        </div>

        <QuestionDirectoryShell
          modules={filterModules}
          intentDefinitions={intentDefinitions}
          initialView={initialView}
          initialModuleId={initialModuleId}
          initialIntentId={initialIntentId}
          questionIndexUrl="/search/questions.zh.json"
          questionDirectoryUrl="/search/question-directory.zh.json"
        >
          <div className="questionDirectoryList" dangerouslySetInnerHTML={{ __html: questionDirectoryListHtml }} />
        </QuestionDirectoryShell>
      </section>

      <SiteFooter locale="zh" className="siteFooter questionFooter" note="客户问题查询 / Question Directory" links={questionsFooterLinks} backToTop={{ label: "回到顶部 ↑" }} />
    </main>
  );
}
