import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getModuleBySlug, legacyModuleAliases, moduleList } from "../../knowledge-map.mjs";
import { balanceGridRows, gridSpan } from "../../layout-utils.mjs";
import { requireModuleBrief } from "../../module-brief-content.mjs";
import { CriticalBoundary, ModuleCurriculumAtlas, ModuleDeepDiveBlocks, ModuleEvidenceGrid, ModuleHeroMetrics, ModuleLearningStudio, ModuleQaList, ModuleUpdatedAt } from "../../module-content-components";
import type { DeepDiveBlock, ModuleCurriculumContent, ModuleLearningContent } from "../../module-content-components";
import { requireModuleCurriculum } from "../../module-curriculum-content.mjs";
import { requireModuleLearning } from "../../module-learning-content.mjs";
import { ModuleReadingNav, ReadingProgress, SystemLens, type LensPanel, type ReadingSection } from "../../fieldbook-interactions";
import { getPublishedModule, hasDedicatedModule } from "../../module-publication.mjs";
import { sourceLedger } from "../../reference-content.mjs";
import { requireTerm } from "../../terminology.mjs";
import { SharedModulePrimer } from "../../module-pilot-views";
import { englishModulePath } from "../../i18n/locale-config.mjs";

type ModulePageProps = { params: Promise<{ slug: string }> };

type PresentationKind = "decision" | "pipeline" | "stack" | "loop" | "spectrum";

type BriefPrinciple = {
  zh: string;
  en: string;
  explanation: string;
  decision: string;
};

type BriefDecision = {
  question: string;
  signal: string;
  recommendation: string;
  boundary: string;
};

type BriefCloudHook = {
  stage: string;
  services: string;
  value: string;
  discover: string;
};

type BriefEvidenceCard = {
  metric: string;
  title: string;
  finding: string;
  boundary: string;
  sourceId: string;
  accent?: boolean;
};

type BriefQaItem = {
  q: string;
  a: string;
  depth: string;
  ask: string;
  tag: string;
  basis: string;
  evidence: Array<{ sourceId: string; supports: string }>;
  addedAt?: string;
};

type ModuleBrief = {
  definition: string;
  position: string;
  presentation: PresentationKind;
  principleTitle: string;
  principles: BriefPrinciple[];
  decisions: BriefDecision[];
  criticalBoundary: string;
  cloudHooks: BriefCloudHook[];
  relatedSlugs: string[];
  qa: BriefQaItem[];
  evidenceCards: BriefEvidenceCard[];
  deepDiveTitle?: string;
  deepDiveLead?: string;
  deepDives?: DeepDiveBlock[];
};

type KnowledgeModule = {
  zh: string;
  en: string;
  slug: string;
  href: string;
  layerNo: string;
  layerName: string;
  layerEn: string;
  layerPurpose: string;
  requestedSlug: string;
  canonicalSlug: string;
};

type Term = { zh: string; en: string };

type ModulePublication = {
  titleId: string;
  requiredTerms: readonly string[];
  visualProfile: "dense-reading" | "standard";
  readingProfile?: "focused";
  knowledgeView: string | null;
  updatedAt: string | null;
};

export function generateStaticParams() {
  return [
    ...moduleList.filter((module) => !hasDedicatedModule(module.slug)).map((module) => ({ slug: module.slug })),
    ...Object.keys(legacyModuleAliases).map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { slug } = await params;
  const currentModule = getModuleBySlug(slug);
  if (!currentModule) return {};
  return {
    title: `${currentModule.zh} | 云计算 × AI 平台售前知识库`,
    description: `${currentModule.zh}（${currentModule.en}）的核心原理、选型边界、云服务连接与客户深度问答。`,
  };
}

function PrincipleView({ brief }: { brief: ModuleBrief }) {
  const isSequential = brief.presentation === "pipeline" || brief.presentation === "loop" || brief.presentation === "stack";

  if (isSequential) {
    return (
      <ol className={`briefPrinciples briefPrinciples--${brief.presentation}`} data-count={brief.principles.length}>
        {brief.principles.map((item, index) => (
          <li key={item.en}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><h4>{item.zh}<small>{item.en}</small></h4><p>{item.explanation}</p><strong>售前判断：{item.decision}</strong></div>
          </li>
        ))}
      </ol>
    );
  }

  const rows = balanceGridRows(brief.principles, brief.presentation === "spectrum" ? 5 : 3);
  return (
    <div className={`briefPrinciples briefPrinciples--${brief.presentation}`} data-count={brief.principles.length} data-odd={brief.principles.length % 2 === 1 ? "true" : "false"}>
      {(rows as BriefPrinciple[][]).flatMap((row) => row.map((item) => (
        <article key={item.en} style={{ "--brief-span": gridSpan(row.length) } as CSSProperties}>
          <p className="miniLabel">{item.en}</p><h4>{item.zh}</h4><p>{item.explanation}</p><strong>售前判断：{item.decision}</strong>
        </article>
      )))}
    </div>
  );
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params;
  const currentModule = getModuleBySlug(slug);
  if (!currentModule || hasDedicatedModule(currentModule.canonicalSlug)) notFound();

  const brief = requireModuleBrief(currentModule.canonicalSlug) as ModuleBrief;
  const curriculumContent = requireModuleCurriculum(currentModule.canonicalSlug) as ModuleCurriculumContent;
  const learningContent = requireModuleLearning(currentModule.canonicalSlug) as ModuleLearningContent;
  const publication = getPublishedModule(currentModule.canonicalSlug) as ModulePublication | undefined;
  if (!publication) notFound();

  const relatedModules = brief.relatedSlugs
    .map((relatedSlug) => getModuleBySlug(relatedSlug) as KnowledgeModule | undefined)
    .filter((related): related is KnowledgeModule => Boolean(related && related.canonicalSlug !== currentModule.canonicalSlug));
  const relatedRows = balanceGridRows(relatedModules, 4);
  const terms = publication.requiredTerms.map((termId: string) => requireTerm(termId) as Term);
  const hasDeepDives = Boolean(brief.deepDives?.length);
  const usesDenseReadingProfile = publication.visualProfile === "dense-reading";
  const usesFocusedReadingProfile = publication.readingProfile === "focused";
  const englishPath = englishModulePath(currentModule.canonicalSlug);
  const standardReadingSections: ReadingSection[] = [
    { id: "related-modules", label: "相关模块", eyebrow: "建立连接" },
    { id: "study-guide", label: "学习与实战", eyebrow: "知道如何掌握" },
    { id: "curriculum", label: "课程地图", eyebrow: "补齐知识版图" },
    { id: "principle", label: "核心机制", eyebrow: "理解为什么" },
    { id: "decisions", label: "方案选择", eyebrow: "看清实际情况" },
    ...(hasDeepDives ? [{ id: "deep-dive", label: brief.deepDiveTitle ?? "进一步理解", eyebrow: "生产级判断" }] : []),
    { id: "evidence", label: "证据与边界", eyebrow: "知道能证明什么" },
    { id: "cloud", label: "云服务连接", eyebrow: "对应可用服务" },
    { id: "qa", label: "客户问答", eyebrow: "现场快速使用" },
  ];
  const focusedReadingSections: ReadingSection[] = [
    { id: "principle", label: "核心判断", eyebrow: "先抓住主要矛盾" },
    ...(hasDeepDives ? [{ id: "deep-dive", label: brief.deepDiveTitle ?? "生产深挖", eyebrow: "沿问题继续深入" }] : []),
    { id: "evidence", label: "证据边界", eyebrow: "知道能证明什么" },
    { id: "cloud", label: "落地连接", eyebrow: "对应能力与责任" },
    { id: "qa", label: "现场问答", eyebrow: "处理常见异议" },
    { id: "related-modules", label: "继续阅读", eyebrow: "再建立跨模块连接" },
  ];
  const readingSections = usesFocusedReadingProfile ? focusedReadingSections : standardReadingSections;
  const systemLensPanels: LensPanel[] = [
    {
      id: `${currentModule.slug}-mechanism`,
      label: "系统如何工作",
      title: brief.principleTitle,
      description: "把核心机制放进同一条因果链，先理解输入怎样经过处理成为可验收结果。",
      takeaway: brief.criticalBoundary,
      nodes: brief.principles.map((item) => ({ label: item.zh, en: item.en, detail: item.explanation, signal: `售前判断：${item.decision}` })),
    },
    {
      id: `${currentModule.slug}-decision`,
      label: "客户怎样选择",
      title: "根据客户的实际情况选择方案",
      description: "同一技术名称可能对应不同客户问题；先看清限制条件，再提出建议，不从产品功能表开始。",
      takeaway: "建议必须同时说明适用条件和不可越过的边界，并在 PoC 中形成可验证信号。",
      nodes: brief.decisions.map((item) => ({ label: item.question, detail: item.signal, signal: `${item.recommendation}；边界：${item.boundary}` })),
    },
    {
      id: `${currentModule.slug}-cloud`,
      label: "云服务怎样提供支持",
      title: "把需要的能力、客户价值和云服务对应起来",
      description: "先确认每个技术环节由谁负责、怎样验收，再对应到目标云当前可用的产品。",
      takeaway: "产品名称会变化；客户真正需要的是能验收的服务搭配、明确的责任分工和后续维护方式。",
      nodes: brief.cloudHooks.map((item) => ({ label: item.stage, detail: item.value, signal: `${item.services}；发现问题：${item.discover}` })),
    },
  ];

  return (
    <main className={`modulePage moduleBriefPage${usesDenseReadingProfile ? " modulePilot" : ""}${usesFocusedReadingProfile ? " moduleFocused" : ""}`}>
      <ReadingProgress />
      <header className="modulePageHero moduleBriefHero" id="top">
        <nav className="topbar" aria-label="模块导航">
          <Link className="brand" href="/" aria-label="返回云与 AI 售前知识库首页"><span>Cloud × AI / Presales Fieldbook</span></Link>
          <div className="toplinks"><a href="#principle">核心机制</a><a href="#qa">本模块问答</a><Link href="/glossary">术语库</Link><Link href="/questions">全部问题</Link><Link href="/references">Reference</Link>{englishPath ? <Link href={englishPath} hrefLang="en" lang="en" prefetch={false}>English</Link> : null}</div>
        </nav>
        <div className="moduleBriefHeader">
          {!usesFocusedReadingProfile ? <p className="eyebrow">MODULE {currentModule.layerNo} · {currentModule.layerEn} · V2.0</p> : null}
          <h1 className="moduleHeroTitle" id={publication.titleId}>{currentModule.zh}<span>{currentModule.en}</span></h1>
          <p className="moduleBriefDefinition">{brief.definition}</p>
          <p className="moduleBriefPosition">{brief.position}</p>
          {usesDenseReadingProfile && !usesFocusedReadingProfile ? <ModuleHeroMetrics sectionCount={readingSections.length} questionCount={brief.qa.length} evidenceCount={brief.evidenceCards.length} /> : null}
        </div>
      </header>

      <div className="moduleArticleLayout">
        <ModuleReadingNav moduleName={currentModule.zh} sections={readingSections} quickLinks={[
          { href: "#principle", label: "先懂原理" },
          { href: "#cloud", label: "找云机会" },
          { href: "#qa", label: "准备客户问答" },
        ]} />
        <div className="moduleArticleContent">
      {usesFocusedReadingProfile ? (
        <>
      <p className="focusedReadingCue"><span>核心机制与售前判断</span><span>机制、失败与控制</span></p>
      <SharedModulePrimer slug={currentModule.canonicalSlug} knowledgeView={publication.knowledgeView} brief={brief} />
      <div className="termStrip focusedTermStrip" aria-label="核心术语">{terms.map((term) => <span key={term.en}><strong>{term.zh}</strong><small>{term.en}</small></span>)}</div>

      {hasDeepDives ? (
        <section className="subsection moduleBriefSection focusedSection" id="deep-dive" data-quality-section="deep-dive">
          <div className="subHead"><span>02</span><div><p className="kicker">FOLLOW THE PROBLEM</p><h2>{brief.deepDiveTitle ?? "进一步理解与工程判断"}</h2></div></div>
          {brief.deepDiveLead ? <p className="sectionLead">{brief.deepDiveLead}</p> : null}
          <ModuleDeepDiveBlocks blocks={brief.deepDives ?? []} sourceLedger={sourceLedger} />
        </section>
      ) : null}

      <section className="subsection moduleBriefSection focusedSection" id="evidence" data-quality-section="evidence">
        <div className="subHead"><span>03</span><div><p className="kicker">WHAT THE EVIDENCE PROVES</p><h2>证据与适用边界</h2></div></div>
        <ModuleEvidenceGrid cards={brief.evidenceCards.slice(0, 4)} sourceLedger={sourceLedger} maxColumns={2} />
        <p className="focusedDirectoryLink"><Link href={`/references#module-${currentModule.canonicalSlug}`}>在 Reference 台账查看本模块全部来源与核验日期 →</Link></p>
      </section>

      <section className="subsection moduleBriefSection cloudSection focusedSection" id="cloud" data-quality-section="cloud">
        <div className="subHead"><span>04</span><div><p className="kicker">CAPABILITY, OWNER, PROOF</p><h2>云服务连接</h2></div></div>
        <p className="sectionLead">产品名称不是这一段的主角。先确认需要的能力、责任人和验收方式，再核验目标地域当前可用的产品、配额、SLA 与价格。</p>
        <div className="focusedCloudRows">
          {brief.cloudHooks.map((item) => <article key={item.stage}><h3>{item.stage}</h3><p><strong>{item.value}</strong>{item.services}</p><small>发现问题：{item.discover}</small></article>)}
        </div>
      </section>

      <section className="subsection moduleBriefSection qaSection focusedSection" id="qa" data-quality-section="qa">
        <div className="subHead"><span>05</span><div><p className="kicker">FIVE QUESTIONS FOR THE ROOM</p><h2>客户高频问题与深度回答</h2></div></div>
        <ModuleQaList items={brief.qa.slice(0, 5)} sourceLedger={sourceLedger} />
        <p className="focusedDirectoryLink"><Link href={`/questions?module=${currentModule.canonicalSlug}`}>继续查询本模块全部客户问题 →</Link></p>
      </section>

      <section className="subsection moduleBriefRelated focusedRelated" id="related-modules" data-quality-section="related-modules" aria-labelledby="related-modules-title">
        <div className="subHead"><span>06</span><div><p className="kicker">CONTINUE THE ARGUMENT</p><h2 id="related-modules-title">相关模块</h2></div></div>
        <div className="relatedModuleGrid" data-count={relatedModules.length} data-odd={relatedModules.length % 2 === 1 ? "true" : "false"}>
          {(relatedRows as KnowledgeModule[][]).flatMap((row) => row.map((related) => (
            <Link href={related.href} key={related.slug} style={{ "--related-span": gridSpan(row.length) } as CSSProperties}>
              <span>{related.layerNo}</span><strong>{related.zh}</strong><small>{related.en}</small>
            </Link>
          )))}
        </div>
      </section>
        </>
      ) : (
        <>
      <SharedModulePrimer slug={currentModule.canonicalSlug} knowledgeView={publication.knowledgeView} />
      <section className="subsection moduleBriefRelated" id="related-modules" data-quality-section="related-modules" aria-labelledby="related-modules-title">
        <div className="subHead"><span>01</span><div><p className="kicker">RELATED MODULES</p><h2 id="related-modules-title">相关模块</h2></div></div>
        <div className="relatedModuleGrid" data-count={relatedModules.length} data-odd={relatedModules.length % 2 === 1 ? "true" : "false"}>
          {(relatedRows as KnowledgeModule[][]).flatMap((row) => row.map((related) => (
            <Link href={related.href} key={related.slug} style={{ "--related-span": gridSpan(row.length) } as CSSProperties}>
              <span>{related.layerNo}</span><strong>{related.zh}</strong><small>{related.en}</small>
            </Link>
          )))}
        </div>
      </section>

      <section className="subsection moduleBriefSection learningStudioSection" id="study-guide" data-quality-section="study-guide">
        <div className="subHead"><span>02</span><div><p className="kicker">LEARN, PRACTICE, PROVE</p><h2>学习顺序与实战练习</h2></div></div>
        <p className="sectionLead">先建立心智模型，再完成方案判断，最后用可复核产物证明掌握；每一步都连接到后续章节与真实方案工作。</p>
        <ModuleLearningStudio content={learningContent} sourceLedger={sourceLedger} />
      </section>

      <section className="subsection moduleBriefSection curriculumSection" id="curriculum" data-quality-section="curriculum">
        <div className="subHead"><span>03</span><div><p className="kicker">CURRICULUM ATLAS</p><h2>课程地图与知识展开</h2></div></div>
        <p className="sectionLead">先看完整知识版图，再进入核心机制、方案选择和生产深挖；每个主题同时说明为什么重要、会改变什么判断，以及不能越过的边界。</p>
        <ModuleCurriculumAtlas content={curriculumContent} sourceLedger={sourceLedger} />
      </section>

      <section className="subsection moduleBriefSection" id="principle" data-quality-section="principle">
        <div className="subHead"><span>04</span><div><p className="kicker">MECHANISM, FAILURE &amp; CONTROL</p><h2>核心机制与售前判断</h2></div></div>
        <div className="moduleBriefIntro"><p className="miniLabel">机制、失败与控制</p><h3>{brief.principleTitle}</h3></div>
        <div className="termStrip" aria-label="核心术语">{terms.map((term) => <span key={term.en}><strong>{term.zh}</strong><small>{term.en}</small></span>)}</div>
        <PrincipleView brief={brief} />
        <SystemLens title={`用三个视角理解${currentModule.zh}`} lead="分别从工作原理、客户选择和云服务支持方式来看同一个问题，避免把概念、产品和验收拆成互不相关的清单。" panels={systemLensPanels} />
      </section>

      <section className="subsection moduleBriefSection" id="decisions">
        <div className="subHead"><span>05</span><div><p className="kicker">DECISION WORKBENCH</p><h2>客户情况与方案选择</h2></div></div>
        <div className="tableWrap"><table><thead><tr><th>客户问题</th><th>判断线索</th><th>建议方案</th><th>不能越过的边界</th></tr></thead><tbody>
          {brief.decisions.map((item) => <tr key={item.question}><th>{item.question}</th><td>{item.signal}</td><td>{item.recommendation}</td><td>{item.boundary}</td></tr>)}
        </tbody></table></div>
        <CriticalBoundary>{brief.criticalBoundary}</CriticalBoundary>
      </section>

      {hasDeepDives ? (
        <section className="subsection moduleBriefSection" id="deep-dive" data-quality-section="deep-dive">
          <div className="subHead"><span>06</span><div><p className="kicker">INDEPENDENT KNOWLEDGE EXPANSION</p><h2>{brief.deepDiveTitle ?? "进一步理解与工程判断"}</h2></div></div>
          {brief.deepDiveLead ? <p className="sectionLead">{brief.deepDiveLead}</p> : null}
          <ModuleDeepDiveBlocks blocks={brief.deepDives ?? []} sourceLedger={sourceLedger} />
        </section>
      ) : null}

      <section className="subsection moduleBriefSection" id="evidence" data-quality-section="evidence">
        <div className="subHead"><span>{hasDeepDives ? "07" : "06"}</span><div><p className="kicker">EVIDENCE WITH BOUNDARIES</p><h2>证据与适用边界</h2></div></div>
        <ModuleEvidenceGrid cards={brief.evidenceCards} sourceLedger={sourceLedger} maxColumns={3} />
      </section>

      <section className="subsection moduleBriefSection cloudSection" id="cloud" data-quality-section="cloud">
        <div className="subHead"><span>{hasDeepDives ? "08" : "07"}</span><div><p className="kicker">CLOUD CONNECTION</p><h2>云服务连接</h2></div></div>
        <p className="sectionLead">先识别需要的能力、客户价值和验收方式，再对应到目标云当前可用的产品；地域、配额、SLA 与价格需要在采购时重新核验。</p>
        <div className="tableWrap"><table><thead><tr><th>技术环节</th><th>可连接的云能力</th><th>客户价值</th><th>售前发现问题</th></tr></thead><tbody>
          {brief.cloudHooks.map((item) => <tr key={item.stage}><th>{item.stage}</th><td>{item.services}</td><td>{item.value}</td><td>{item.discover}</td></tr>)}
        </tbody></table></div>
      </section>

      <section className="subsection moduleBriefSection qaSection" id="qa" data-quality-section="qa">
        <div className="subHead"><span>{hasDeepDives ? "09" : "08"}</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h2>客户高频问题与深度回答</h2></div></div>
        <ModuleQaList items={brief.qa} sourceLedger={sourceLedger} />
      </section>
        </>
      )}
        </div>
      </div>

      <footer><div><strong>云计算 × AI 平台售前知识库</strong></div><p>{currentModule.zh} · V2.0<ModuleUpdatedAt value={publication.updatedAt ?? undefined} /></p><a href="#top">返回顶部 ↑</a></footer>
    </main>
  );
}
