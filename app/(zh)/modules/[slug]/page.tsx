import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getModuleBySlug, legacyModuleAliases, moduleList } from "../../../knowledge-map.mjs";
import { balanceGridRows, gridSpan } from "../../../layout-utils.mjs";
import { requireModuleBrief } from "../../../module-brief-content.mjs";
import { CriticalBoundary, ModuleCurriculumAtlas, ModuleDeepDiveBlocks, ModuleEvidenceGrid, ModuleHeroMetrics, ModuleLearningStudio, ModuleQaList, ModuleSectionHeader, ModuleUpdatedAt } from "../../../module-content-components";
import type { DeepDiveBlock, ModuleCurriculumContent, ModuleLearningContent } from "../../../module-content-components";
import { requireModuleCurriculum } from "../../../module-curriculum-content.mjs";
import { requireModuleLearning } from "../../../module-learning-content.mjs";
import { ReadingProgress } from "../../../fieldbook-interactions";
import { ModuleDecisionWorkbench } from "../../../module-decision-workbench";
import { getChineseModuleExtensionView } from "../../../module-extension-views-zh.mjs";
import { getPublishedModule, hasDedicatedModule } from "../../../module-publication.mjs";
import { ModuleReadingModes } from "../../../module-reading-modes";
import { sourceLedger } from "../../../reference-content.mjs";
import { requireTerm } from "../../../terminology.mjs";
import { SharedModulePrimer } from "../../../module-pilot-views";
import { englishModulePath } from "../../../i18n/locale-config.mjs";
import { getUnifiedBriefModuleConfig } from "../../../unified-brief-module-config.mjs";
import { UnifiedBriefModulePage } from "../../../unified-brief-module-page";

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
            <div><h4>{item.zh}<small>{item.en}</small></h4><p>{item.explanation}</p><strong>{item.decision}</strong></div>
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
          <p className="miniLabel">{item.en}</p><h4>{item.zh}</h4><p>{item.explanation}</p><strong>{item.decision}</strong>
        </article>
      )))}
    </div>
  );
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params;
  const currentModule = getModuleBySlug(slug);
  if (!currentModule) notFound();
  if (currentModule.canonicalSlug === "llm-inference") {
    const { InferenceModulePage } = await import("../../../inference-module-page");
    return <InferenceModulePage />;
  }
  if (hasDedicatedModule(currentModule.canonicalSlug)) notFound();

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
  const extensionView = getChineseModuleExtensionView(currentModule.canonicalSlug) ?? undefined;
  const primerOwnsPrincipleId = ["decision-blueprint", "mcp-host-server-boundary", "latency-capacity-map"].includes(publication.knowledgeView ?? "");
  const primerDecisionCount = primerOwnsPrincipleId ? 4 : 0;
  const remainingDecisions = brief.decisions.slice(primerDecisionCount);
  const pageClassName = `fieldbookTheme modulePage moduleBriefPage${usesDenseReadingProfile ? " modulePilot" : ""}${usesFocusedReadingProfile ? " moduleFocused" : ""}`;
  const unifiedConfig = getUnifiedBriefModuleConfig(currentModule.canonicalSlug);
  const primer = <SharedModulePrimer slug={currentModule.canonicalSlug} knowledgeView={publication.knowledgeView} brief={brief} extensionView={extensionView} />;
  const decisionSection = (showCriticalBoundary: boolean) => remainingDecisions.length ? (
    <section className="subsection moduleBriefSection" id="decisions" data-quality-section="decisions">
      <ModuleSectionHeader code="Q1" title="方案判断" />
      <ModuleDecisionWorkbench decisions={remainingDecisions} moduleName={currentModule.zh} />
      {showCriticalBoundary && !usesFocusedReadingProfile ? <CriticalBoundary>{brief.criticalBoundary}</CriticalBoundary> : null}
    </section>
  ) : null;
  const learnContent = (
    <>
      <section className="subsection moduleBriefSection" id={primerOwnsPrincipleId ? "mechanism-summary" : "principle"} data-quality-section="principle">
        <ModuleSectionHeader code="L1" eyebrow="机制速览 · 工作方式与失败信号" title={brief.principleTitle} />
        <div className="termStrip" aria-label="核心术语">{terms.map((term) => <span key={term.en}><strong>{term.zh}</strong><small>{term.en}</small></span>)}</div>
        <PrincipleView brief={brief} />
      </section>

      <section className="subsection moduleBriefSection learningStudioSection" id="study-guide" data-quality-section="study-guide">
        <div className="subHead"><span>L2</span><div><h2>学习路线与实战</h2></div></div>
        <p className="sectionLead">从心智模型进入方案练习，每一步都有检查点和可交付产物。</p>
        <ModuleLearningStudio content={learningContent} sourceLedger={sourceLedger} />
      </section>

      <section className="subsection moduleBriefSection curriculumSection" id="curriculum" data-quality-section="curriculum">
        <div className="subHead"><span>L3</span><div><h2>知识地图</h2></div></div>
        <p className="sectionLead">章节按实际判断展开：为什么重要、会改变什么决定、适用范围在哪里。</p>
        <ModuleCurriculumAtlas content={curriculumContent} sourceLedger={sourceLedger} />
      </section>

      {hasDeepDives ? (
        <section className="subsection moduleBriefSection" id="deep-dive" data-quality-section="deep-dive">
          <div className="subHead"><span>L4</span><div><h2>{brief.deepDiveTitle ?? "工程深挖"}</h2></div></div>
          {brief.deepDiveLead ? <p className="sectionLead">{brief.deepDiveLead}</p> : null}
          <ModuleDeepDiveBlocks blocks={brief.deepDives ?? []} sourceLedger={sourceLedger} />
        </section>
      ) : null}
    </>
  );
  const fieldContent = (
    <>
      <section className="subsection moduleBriefSection" id="evidence" data-quality-section="evidence">
        <div className="subHead"><span>F1</span><div><h2>证据能说明什么</h2></div></div>
        <ModuleEvidenceGrid cards={brief.evidenceCards} sourceLedger={sourceLedger} maxColumns={3} headingLevel={3} />
        <p className="focusedDirectoryLink"><Link href={`/references#module-${currentModule.canonicalSlug}`}>查看来源、核验日期与完整适用范围 →</Link></p>
      </section>

      <section className="subsection moduleBriefSection cloudSection" id="cloud" data-quality-section="cloud">
        <div className="subHead"><span>F2</span><div><h2>云能力与责任</h2></div></div>
        <p className="sectionLead">这里按能力和验收组织，不绑定某个时期的产品目录。地域、配额、SLA 与价格在采购时复核。</p>
        <div className="focusedCloudRows">
          {brief.cloudHooks.map((item) => <article key={item.stage}><h3>{item.stage}</h3><p><strong>{item.value}</strong>{item.services}</p><small>现场可问：{item.discover}</small></article>)}
        </div>
      </section>

      <section className="subsection moduleBriefSection qaSection" id="qa" data-quality-section="qa">
        <div className="subHead"><span>F3</span><div><h2>客户问题</h2></div></div>
        <ModuleQaList items={brief.qa} sourceLedger={sourceLedger} directoryHref={`/questions?module=${currentModule.canonicalSlug}`} />
      </section>

      <section className="subsection moduleBriefRelated" id="related-modules" data-quality-section="related-modules" aria-labelledby="related-modules-title">
        <div className="subHead"><span>F4</span><div><h2 id="related-modules-title">接着看什么</h2></div></div>
        <div className="relatedModuleGrid" data-count={relatedModules.length} data-odd={relatedModules.length % 2 === 1 ? "true" : "false"}>
          {(relatedRows as KnowledgeModule[][]).flatMap((row) => row.map((related) => (
            <Link href={related.href} key={related.slug} style={{ "--related-span": gridSpan(row.length) } as CSSProperties}>
              <span>{related.layerNo}</span><strong>{related.zh}</strong><small>{related.en}</small>
            </Link>
          )))}
        </div>
      </section>
    </>
  );
  const pageFooter = <footer><div><strong>云计算 × AI 平台售前知识库</strong></div><p>{currentModule.zh}<ModuleUpdatedAt value={publication.updatedAt ?? undefined} /></p><a href="#top">返回顶部 ↑</a></footer>;

  if (unifiedConfig) {
    return (
      <UnifiedBriefModulePage
        className={pageClassName}
        contentAriaLabel={`${currentModule.zh}核心内容`}
        criticalBoundary={brief.criticalBoundary}
        directories={unifiedConfig.directories}
        field={fieldContent}
        footer={pageFooter}
        hero={{
          anchorId: "top",
          titleId: publication.titleId,
          shortTitle: unifiedConfig.shortTitle,
          zhTitle: currentModule.zh,
          enTitle: currentModule.en,
          definition: brief.definition,
          position: brief.position,
          slug: currentModule.canonicalSlug,
          questionCount: brief.qa.length,
          evidenceCount: brief.evidenceCards.length,
          facts: unifiedConfig.facts,
        }}
        learn={learnContent}
        moduleName={currentModule.zh}
        quick={<>{primer}{decisionSection(false)}</>}
      />
    );
  }

  return (
    <main className={pageClassName}>
      <ReadingProgress />
      <header className="modulePageHero moduleBriefHero" id="top">
        <nav className="topbar" aria-label="模块导航">
          <Link className="brand" href="/" aria-label="返回云与 AI 售前知识库首页"><span>Cloud × AI / Presales Fieldbook</span></Link>
          <div className="toplinks"><a href="#module-reading">选择阅读方式</a><Link href={`/questions?module=${currentModule.canonicalSlug}`}>本模块问答</Link><Link href="/glossary">术语库</Link><Link href="/references">来源</Link>{englishPath ? <Link href={englishPath} hrefLang="en" lang="en" prefetch={false}>English</Link> : null}</div>
        </nav>
        <div id="main-content" className="skipTarget" tabIndex={-1} />
        <div className="moduleBriefHeader">
          {!usesFocusedReadingProfile ? <p className="eyebrow">MODULE {currentModule.layerNo} · {currentModule.layerEn}</p> : null}
          <h1 className="moduleHeroTitle" id={publication.titleId}>{currentModule.zh}<span>{currentModule.en}</span></h1>
          <p className="moduleBriefDefinition">{brief.definition}</p>
          <p className="moduleBriefPosition">{brief.position}</p>
          <ModuleHeroMetrics
            sectionCount={3}
            questionCount={brief.qa.length}
            evidenceCount={brief.evidenceCards.length}
            labels={{ ariaLabel: "模块内容概览", sections: "阅读方式", sectionUnit: "种", questions: "问题库", questionUnit: "题", evidence: "证据卡", evidenceUnit: "张" }}
          />
        </div>
      </header>

      <ModuleReadingModes
        moduleName={currentModule.zh}
        hashGroups={primerOwnsPrincipleId
          ? { quick: ["principle", "decisions"], learn: ["mechanism-summary"] }
          : { quick: ["decisions"], learn: ["principle"] }}
        quick={<>{primer}{decisionSection(true)}</>}
        learn={learnContent}
        field={fieldContent}
      />

      {pageFooter}
    </main>
  );
}
