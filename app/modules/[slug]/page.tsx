import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getModuleBySlug, legacyModuleAliases, moduleList } from "../../knowledge-map.mjs";
import { balanceRows } from "../../layout-utils.mjs";
import { requireModuleBrief } from "../../module-brief-content.mjs";
import { CriticalBoundary, ModuleDeepDiveBlocks, ModuleEvidenceGrid, ModuleQaList } from "../../module-content-components";
import type { DeepDiveBlock } from "../../module-content-components";
import { getPublishedModule, hasDedicatedModule } from "../../module-publication.mjs";
import { sourceLedger } from "../../reference-content.mjs";
import { requireTerm } from "../../terminology.mjs";

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

  const rows = balanceRows(brief.principles, brief.presentation === "spectrum" ? 5 : 3);
  return (
    <div className={`briefPrinciples briefPrinciples--${brief.presentation}`} data-count={brief.principles.length} data-odd={brief.principles.length % 2 === 1 ? "true" : "false"}>
      {(rows as BriefPrinciple[][]).flatMap((row) => row.map((item) => (
        <article key={item.en} style={{ "--brief-span": 12 / row.length } as CSSProperties}>
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
  const publication = getPublishedModule(currentModule.canonicalSlug) as ModulePublication | undefined;
  if (!publication) notFound();

  const relatedModules = brief.relatedSlugs
    .map((relatedSlug) => getModuleBySlug(relatedSlug) as KnowledgeModule | undefined)
    .filter((related): related is KnowledgeModule => Boolean(related && related.canonicalSlug !== currentModule.canonicalSlug));
  const relatedRows = balanceRows(relatedModules, 4);
  const terms = publication.requiredTerms.map((termId: string) => requireTerm(termId) as Term);
  const hasDeepDives = Boolean(brief.deepDives?.length);

  return (
    <main className="modulePage moduleBriefPage">
      <header className="modulePageHero moduleBriefHero" id="top">
        <nav className="topbar" aria-label="模块导航">
          <Link className="brand" href="/" aria-label="返回云与 AI 售前知识库首页"><span className="brandMark">CA</span><span>Cloud × AI / Presales Fieldbook</span></Link>
          <div className="toplinks"><a href="#principle">核心机制</a><a href="#qa">高频问答</a><Link href="/references">Reference</Link></div>
        </nav>
        <div className="moduleBriefHeader">
          <p className="eyebrow">MODULE {currentModule.layerNo} · {currentModule.layerEn} · V1.1</p>
          <h1 className="moduleHeroTitle" id={publication.titleId}>{currentModule.zh}<span>{currentModule.en}</span></h1>
          <p className="moduleBriefDefinition">{brief.definition}</p>
          <p className="moduleBriefPosition">{brief.position}</p>
        </div>
      </header>

      <section className="subsection moduleBriefRelated" data-quality-section="related-modules" aria-labelledby="related-modules-title">
        <div className="subHead"><span>01</span><div><p className="kicker">RELATED MODULES</p><h2 id="related-modules-title">相关模块</h2></div></div>
        <div className="relatedModuleGrid" data-count={relatedModules.length} data-odd={relatedModules.length % 2 === 1 ? "true" : "false"}>
          {(relatedRows as KnowledgeModule[][]).flatMap((row) => row.map((related) => (
            <Link href={related.href} key={related.slug} style={{ "--related-span": 12 / row.length } as CSSProperties}>
              <span>{related.layerNo}</span><strong>{related.zh}</strong><small>{related.en}</small>
            </Link>
          )))}
        </div>
      </section>

      <section className="subsection moduleBriefSection" id="principle" data-quality-section="principle">
        <div className="subHead"><span>02</span><div><p className="kicker">MECHANISM, FAILURE &amp; CONTROL</p><h2>核心机制与售前判断</h2></div></div>
        <div className="moduleBriefIntro"><p className="miniLabel">机制、失败与控制</p><h3>{brief.principleTitle}</h3></div>
        <div className="termStrip" aria-label="核心术语">{terms.map((term) => <span key={term.en}><strong>{term.zh}</strong><small>{term.en}</small></span>)}</div>
        <PrincipleView brief={brief} />
      </section>

      <section className="subsection moduleBriefSection" id="decisions">
        <div className="subHead"><span>03</span><div><p className="kicker">DECISION WORKBENCH</p><h2>客户信号与方案选择</h2></div></div>
        <div className="tableWrap"><table><thead><tr><th>客户问题</th><th>判断信号</th><th>建议路线</th><th>不能越过的边界</th></tr></thead><tbody>
          {brief.decisions.map((item) => <tr key={item.question}><th>{item.question}</th><td>{item.signal}</td><td>{item.recommendation}</td><td>{item.boundary}</td></tr>)}
        </tbody></table></div>
        <CriticalBoundary>{brief.criticalBoundary}</CriticalBoundary>
      </section>

      {hasDeepDives ? (
        <section className="subsection moduleBriefSection" id="deep-dive" data-quality-section="deep-dive">
          <div className="subHead"><span>04</span><div><p className="kicker">INDEPENDENT KNOWLEDGE EXPANSION</p><h2>{brief.deepDiveTitle ?? "进一步理解与工程判断"}</h2></div></div>
          {brief.deepDiveLead ? <p className="sectionLead">{brief.deepDiveLead}</p> : null}
          <ModuleDeepDiveBlocks blocks={brief.deepDives ?? []} sourceLedger={sourceLedger} />
        </section>
      ) : null}

      <section className="subsection moduleBriefSection" id="evidence" data-quality-section="evidence">
        <div className="subHead"><span>{hasDeepDives ? "05" : "04"}</span><div><p className="kicker">EVIDENCE WITH BOUNDARIES</p><h2>证据与适用边界</h2></div></div>
        <ModuleEvidenceGrid cards={brief.evidenceCards} sourceLedger={sourceLedger} maxColumns={3} />
      </section>

      <section className="subsection moduleBriefSection cloudSection" id="cloud" data-quality-section="cloud">
        <div className="subHead"><span>{hasDeepDives ? "06" : "05"}</span><div><p className="kicker">CLOUD CONNECTION</p><h2>云服务连接</h2></div></div>
        <p className="sectionLead">先识别能力、客户价值和验收方式，再映射到目标云当期可用产品；地域、配额、SLA 与价格需要在采购时点重新核验。</p>
        <div className="tableWrap"><table><thead><tr><th>技术环节</th><th>可连接的云能力</th><th>客户价值</th><th>售前发现问题</th></tr></thead><tbody>
          {brief.cloudHooks.map((item) => <tr key={item.stage}><th>{item.stage}</th><td>{item.services}</td><td>{item.value}</td><td>{item.discover}</td></tr>)}
        </tbody></table></div>
      </section>

      <section className="subsection moduleBriefSection qaSection" id="qa" data-quality-section="qa">
        <div className="subHead"><span>{hasDeepDives ? "07" : "06"}</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h2>客户高频问题与深度回答</h2></div></div>
        <ModuleQaList items={brief.qa} sourceLedger={sourceLedger} />
      </section>

      <footer><div><span className="brandMark">CA</span><strong>云计算 × AI 平台售前知识库</strong></div><p>{currentModule.zh} · V1.1</p><a href="#top">返回顶部 ↑</a></footer>
    </main>
  );
}
