import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { chinesePageMetadata } from "../../../i18n/chinese-page-metadata";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getModuleBySlug, legacyModuleAliases, moduleList } from "../../../knowledge-map.mjs";
import { balanceGridRows, gridSpan } from "../../../layout-utils.mjs";
import { requireModuleBrief } from "../../../module-brief-content.mjs";
import { ModuleCurriculumAtlas, ModuleDeepDiveBlocks, ModuleEvidenceGrid, ModuleLearningStudio, ModuleQaList, ModuleSectionHeader, ModuleUpdatedAt } from "../../../module-content-components";
import type { DeepDiveBlock, ModuleCurriculumContent, ModuleLearningContent } from "../../../module-content-components";
import { requireModuleCurriculum } from "../../../module-curriculum-content.mjs";
import { requireModuleLearning } from "../../../module-learning-content.mjs";
import { ModuleDecisionWorkbench } from "../../../module-decision-workbench";
import { getModuleExtensionView } from "../../../module-extension-views.mjs";
import { getPublishedModule, hasDedicatedModule } from "../../../module-publication.mjs";
import { sourceLedger } from "../../../reference-content.mjs";
import { requireTerm } from "../../../terminology.mjs";
import { SharedModulePrimer } from "../../../module-pilot-views";
import { getUnifiedBriefModuleConfig } from "../../../unified-brief-module-config.mjs";
import { buildBriefModuleDirectories, UnifiedBriefModulePage } from "../../../unified-brief-module-page";

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
  return chinesePageMetadata({
    title: `${currentModule.zh} | 云计算 × AI 平台售前知识库`,
    description: `${currentModule.zh}（${currentModule.en}）的核心原理、选型边界、云服务连接与客户深度问答。`,
    path: `/modules/${currentModule.slug}`,
    enPath: `/en/modules/${currentModule.slug}`,
  });
}

function PrincipleView({ brief }: { brief: ModuleBrief }) {
  const isSequential = brief.presentation === "pipeline" || brief.presentation === "loop" || brief.presentation === "stack";

  if (isSequential) {
    return (
      <ol className={`briefPrinciples briefPrinciples--${brief.presentation}`} data-count={brief.principles.length}>
        {brief.principles.map((item, index) => (
          <li key={item.en}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><h3>{item.zh}<small>{item.en}</small></h3><p>{item.explanation}</p><strong>{item.decision}</strong></div>
          </li>
        ))}
      </ol>
    );
  }

  const rows = balanceGridRows(brief.principles, brief.presentation === "spectrum" ? 5 : 3);
  return (
    <div className={`briefPrinciples briefPrinciples--${brief.presentation}`} data-count={brief.principles.length} data-odd={brief.principles.length % 2 === 1 ? "true" : "false"}>
      {rows.flatMap((row) => row.map((item) => (
        <article key={item.en} style={{ "--brief-span": gridSpan(row.length) } as CSSProperties}>
          <p className="miniLabel">{item.en}</p><h3>{item.zh}</h3><p>{item.explanation}</p><strong>{item.decision}</strong>
        </article>
      )))}
    </div>
  );
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params;
  const currentModule = getModuleBySlug(slug);
  if (!currentModule) notFound();

  // 专用模块的正式地址由静态路由承载（mcp / a2a / llm-inference 各有独立页面）；
  // 历史别名仍经本动态路由解析，继续渲染合并后主要模块的专用页面，避免旧链接失效。
  if (currentModule.requestedSlug !== currentModule.canonicalSlug) {
    if (currentModule.canonicalSlug === "mcp") {
      const { McpModuleExperience } = await import("../../../mcp-module-experience");
      return <McpModuleExperience />;
    }
    if (currentModule.canonicalSlug === "a2a") {
      const { A2AModuleExperience } = await import("../../../a2a-module-experience");
      return <A2AModuleExperience />;
    }
    if (currentModule.canonicalSlug === "llm-inference") {
      const { InferenceModulePage } = await import("../../../inference-module-page");
      return <InferenceModulePage />;
    }
  }
  if (hasDedicatedModule(currentModule.canonicalSlug)) notFound();

  const brief = requireModuleBrief(currentModule.canonicalSlug) as ModuleBrief;
  const curriculumContent = requireModuleCurriculum(currentModule.canonicalSlug) as unknown as ModuleCurriculumContent;
  const learningContent = requireModuleLearning(currentModule.canonicalSlug) as unknown as ModuleLearningContent;
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
  const extensionView = getModuleExtensionView(currentModule.canonicalSlug) ?? undefined;
  const primerOwnsPrincipleId = ["decision-blueprint", "mcp-host-server-boundary", "latency-capacity-map"].includes(publication.knowledgeView ?? "");
  // The primer summarizes a mechanism; it does not consume the first N
  // decisions. Keep the complete decision ledger available regardless of
  // content order or how many decisions the module needs.
  const remainingDecisions = brief.decisions;
  const pageClassName = `fieldbookTheme modulePage moduleBriefPage${usesDenseReadingProfile ? " modulePilot" : ""}${usesFocusedReadingProfile ? " moduleFocused" : ""}`;
  const unifiedConfig = getUnifiedBriefModuleConfig(currentModule.canonicalSlug);
  if (!unifiedConfig) throw new Error(`Missing unified reader configuration for published brief: ${currentModule.canonicalSlug}`);
  const directories = buildBriefModuleDirectories({
    hasDeepDives,
    mechanismId: unifiedConfig.mechanismId,
    primer: unifiedConfig.primer,
  });
  const primer = <SharedModulePrimer slug={currentModule.canonicalSlug} knowledgeView={publication.knowledgeView} brief={brief} extensionView={extensionView} showCriticalBoundary={false} />;
  const decisionSection = remainingDecisions.length ? (
    <section className="subsection moduleBriefSection" id="decisions" data-quality-section="decisions">
      <ModuleSectionHeader code="判断" title="方案判断" />
      <ModuleDecisionWorkbench decisions={remainingDecisions} moduleName={currentModule.zh} />
    </section>
  ) : null;
  const learnContent = (
    <>
      <section className="subsection moduleBriefSection" id={primerOwnsPrincipleId ? "mechanism-summary" : "principle"} data-quality-section="principle">
        <ModuleSectionHeader code="机制" eyebrow="工作方式与失败信号" title={brief.principleTitle} />
        <div className="termStrip" aria-label="核心术语">{terms.map((term) => <span key={term.en}><strong>{term.zh}</strong><small>{term.en}</small></span>)}</div>
        <PrincipleView brief={brief} />
      </section>

      <section className="subsection moduleBriefSection curriculumSection" id="curriculum" data-quality-section="curriculum">
        <div className="subHead"><span>主题</span><div><h2>主题地图</h2></div></div>
        <ModuleCurriculumAtlas content={curriculumContent} sourceLedger={sourceLedger} />
      </section>

      <section className="subsection moduleBriefSection learningStudioSection" id="study-guide" data-quality-section="study-guide">
        <div className="subHead"><span>应用</span><div><h2>把判断做成产物</h2></div></div>
        <ModuleLearningStudio content={learningContent} sourceLedger={sourceLedger} />
      </section>

      {hasDeepDives ? (
        <section className="subsection moduleBriefSection" id="deep-dive" data-quality-section="deep-dive">
          <div className="subHead"><span>深挖</span><div><h2>{brief.deepDiveTitle ?? "工程深挖"}</h2></div></div>
          {brief.deepDiveLead ? <p className="sectionLead">{brief.deepDiveLead}</p> : null}
          <ModuleDeepDiveBlocks blocks={brief.deepDives ?? []} sourceLedger={sourceLedger} />
        </section>
      ) : null}
    </>
  );
  const fieldContent = (
    <>
      <section className="subsection moduleBriefSection" id="evidence" data-quality-section="evidence">
        <div className="subHead"><span>依据</span><div><h2>证据能说明什么</h2></div></div>
        <ModuleEvidenceGrid cards={brief.evidenceCards} sourceLedger={sourceLedger} maxColumns={3} headingLevel={3} />
        <p className="focusedDirectoryLink"><Link href={`/references#module-${currentModule.canonicalSlug}`}>查看来源、核验日期与完整适用范围 →</Link></p>
      </section>

      <section className="subsection moduleBriefSection cloudSection" id="cloud" data-quality-section="cloud">
        <div className="subHead"><span>责任</span><div><h2>云能力与责任</h2></div></div>
        <div className="focusedCloudRows">
          {brief.cloudHooks.map((item) => <article key={item.stage}><h3>{item.stage}</h3><p><strong>{item.value}</strong>{item.services}</p><small>现场可问：{item.discover}</small></article>)}
        </div>
      </section>

      <section className="subsection moduleBriefSection qaSection" id="qa" data-quality-section="qa">
        <div className="subHead"><span>问答</span><div><h2>客户问题</h2></div></div>
        <ModuleQaList items={brief.qa} sourceLedger={sourceLedger} directoryHref={`/questions?module=${currentModule.canonicalSlug}`} />
      </section>

      <section className="subsection moduleBriefRelated" id="related-modules" data-quality-section="related-modules" aria-labelledby="related-modules-title">
        <div className="subHead"><span>延伸</span><div><h2 id="related-modules-title">接着看什么</h2></div></div>
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

  return (
    <UnifiedBriefModulePage
      className={pageClassName}
      contentAriaLabel={`${currentModule.zh}核心内容`}
      criticalBoundary={brief.criticalBoundary}
      directories={directories}
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
      quick={<>{primer}{decisionSection}</>}
    />
  );
}
