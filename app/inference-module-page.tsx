import type { CSSProperties } from "react";
import Link from "next/link";

import "./inference-studio.css";

import { balanceGridRows, gridSpan } from "./layout-utils.mjs";
import { InferenceStudio } from "./inference-studio";
import { requireModuleBrief } from "./module-brief-content.mjs";
import {
  ModuleDeepDiveBlocks,
  ModuleEvidenceGrid,
  ModuleQaList,
  type DeepDiveBlock,
  type ModuleCurriculumContent,
  type ModuleLearningContent,
} from "./module-content-components";
import { requireModuleCurriculum } from "./module-curriculum-content.mjs";
import { requireModuleLearning } from "./module-learning-content.mjs";
import { getModuleBySlug } from "./knowledge-map.mjs";
import { getPublishedModule } from "./module-publication.mjs";
import { sourceLedger } from "./reference-content.mjs";
import { UnifiedModuleScaffold } from "./unified-module-hero";

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

type InferenceBrief = {
  criticalBoundary: string;
  cloudHooks: BriefCloudHook[];
  decisions: BriefDecision[];
  definition: string;
  deepDiveLead?: string;
  deepDiveTitle?: string;
  deepDives?: DeepDiveBlock[];
  evidenceCards: BriefEvidenceCard[];
  position: string;
  principles: BriefPrinciple[];
  principleTitle: string;
  qa: BriefQaItem[];
  relatedSlugs: string[];
};

type RelatedModule = {
  en: string;
  href: string;
  layerNo: string;
  slug: string;
  zh: string;
};

export function InferenceModulePage() {
  const brief = requireModuleBrief("llm-inference") as InferenceBrief;
  const curriculum = requireModuleCurriculum("llm-inference") as unknown as ModuleCurriculumContent;
  const learning = requireModuleLearning("llm-inference") as unknown as ModuleLearningContent;
  const publication = getPublishedModule("llm-inference");
  const learningSourceIds = [...new Set([
    ...curriculum.chapters.flatMap((chapter) => chapter.sourceIds),
    ...learning.labs.flatMap((lab) => lab.sourceIds),
  ])];
  const sourceTitles = Object.fromEntries(learningSourceIds.map((sourceId) => [sourceId, sourceLedger[sourceId]?.shortTitle ?? sourceId]));
  const relatedModules = brief.relatedSlugs
    .map((slug) => getModuleBySlug(slug) as RelatedModule | undefined)
    .filter((module): module is RelatedModule => Boolean(module));
  const relatedRows = balanceGridRows(relatedModules, 4);

  const field = (
    <div className="inferenceFieldContent" id="field-guide">
      <header className="inferenceFieldIntro">
        <p>现场查证</p>
        <h2>先写清测量条件，再给容量结论</h2>
        <span>这里放证据、适用范围，以及还需要补做的验证。</span>
      </header>

      <section className="inferenceFieldSection inferenceMechanismIndex" id="mechanism-index">
        <header><span>F0</span><div><h2>{brief.principleTitle}</h2><p>每一项都落到一个可验证的服务决定。</p></div></header>
        <div>{brief.principles.map((item, index) => <article key={item.zh}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.zh}<small>{item.en}</small></h3><p>{item.explanation}</p><strong>{item.decision}</strong></div></article>)}</div>
      </section>

      <section className="inferenceFieldSection inferenceDecisionGuide" id="decision-guide">
        <header><span>FD</span><div><h2>方案怎么选</h2><p>先找信号，再给建议；边界单独写。</p></div></header>
        <div>{brief.decisions.map((item, index) => <details key={item.question} open={index === 0}><summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.question}</strong></summary><div><p><b>什么时候问</b>{item.signal}</p><p><b>建议</b>{item.recommendation}</p><p><b>边界</b>{item.boundary}</p></div></details>)}</div>
      </section>

      <section className="inferenceFieldSection" id="deep-dive" data-quality-section="deep-dive">
        <header><span>F1</span><div><h2>{brief.deepDiveTitle ?? "容量诊断"}</h2><p>{brief.deepDiveLead}</p></div></header>
        <ModuleDeepDiveBlocks blocks={brief.deepDives ?? []} sourceLedger={sourceLedger}/>
      </section>

      <section className="inferenceFieldSection" id="evidence" data-quality-section="evidence">
        <header><span>F2</span><div><h2>证据能说明什么</h2><p>每条证据都标出它支持什么，以及不能推出什么。</p></div></header>
        <ModuleEvidenceGrid cards={brief.evidenceCards} sourceLedger={sourceLedger} maxColumns={3} headingLevel={3}/>
        <p className="inferenceSourceLink"><Link href="/references#module-llm-inference">查看来源、核验日期与完整适用范围 →</Link></p>
      </section>

      <section className="inferenceFieldSection inferenceBoundarySection" id="boundary" data-quality-section="boundary">
        <header><span>F3</span><div><h2>不能越过的边界</h2></div></header>
        <blockquote aria-label="重要边界" data-importance="critical"><strong>容量结论必须绑定运行包络</strong><p>{brief.criticalBoundary}</p></blockquote>
      </section>

      <section className="inferenceFieldSection" id="cloud" data-quality-section="cloud">
        <header><span>F4</span><div><h2>云能力与责任</h2><p>按能力和验收组织，地域、配额、SLA 与价格在采购时复核。</p></div></header>
        <div className="focusedCloudRows">
          {brief.cloudHooks.map((item) => <article key={item.stage}><h3>{item.stage}</h3><p><strong>{item.value}</strong>{item.services}</p><small>现场可问：{item.discover}</small></article>)}
        </div>
      </section>

      <section className="inferenceFieldSection" id="qa" data-quality-section="qa">
        <header><span>F5</span><div><h2>客户问题</h2><p>回答里写清依据和前提，也列出需要向客户补问的信息。</p></div></header>
        <ModuleQaList items={brief.qa} sourceLedger={sourceLedger} directoryHref="/questions?module=llm-inference"/>
      </section>

      <section className="inferenceFieldSection" id="related-modules" data-quality-section="related-modules" aria-labelledby="inference-related-title">
        <header><span>F6</span><div><h2 id="inference-related-title">接着看什么</h2><p>相关模块按模型、网关、算力、平台、评估和运营串起来。</p></div></header>
        <div className="relatedModuleGrid" data-count={relatedModules.length} data-odd={relatedModules.length % 2 === 1 ? "true" : "false"}>
          {(relatedRows as RelatedModule[][]).flatMap((row) => row.map((related) => (
            <Link href={related.href} key={related.slug} style={{ "--related-span": gridSpan(row.length) } as CSSProperties}>
              <span>{related.layerNo}</span><strong>{related.zh}</strong><small>{related.en}</small>
            </Link>
          )))}
        </div>
      </section>
    </div>
  );

  return (
    <UnifiedModuleScaffold
      className="fieldbookTheme modulePage modulePilot moduleFocused"
      hero={{
        anchorId: "top",
        definition: brief.definition,
        enTitle: "LLM Inference",
        evidenceCount: brief.evidenceCards.length,
        facts: [
          { label: "发布单元", value: "模型 × Tokenizer × 模板 × 量化制品 × 引擎 × 调度配置" },
          { label: "时间账", value: "排队 × Prefill × Decode × 结果传输" },
          { label: "显存账", value: "权重 × KV Cache × 工作区 / 碎片 × 运行余量" },
          { label: "验收口径", value: "质量 × SLO × Goodput × 单位达标任务成本" },
        ],
        position: brief.position,
        questionCount: brief.qa.length,
        shortTitle: "LLM 推理",
        slug: "llm-inference",
        titleId: "llm-inference-title",
        zhTitle: "大模型推理",
      }}
    >
      <InferenceStudio
        curriculum={curriculum}
        criticalBoundary="模型能加载不等于能以目标并发稳定服务。图中数值只解释指标怎样联动，不是容量承诺；采购和上线前仍要用目标模型、硬件与真实请求分布重跑。"
        field={field}
        learningLabs={learning.labs}
        learningOutcomes={learning.outcomes}
        learningRoute={learning.route}
        sourceTitles={sourceTitles}
        updatedAt={publication?.updatedAt as string | null | undefined}
      />
    </UnifiedModuleScaffold>
  );
}
