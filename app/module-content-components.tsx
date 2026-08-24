import { Children, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";

import { balanceGridRows, gridSpan } from "./layout-utils.mjs";
import { DeepDiveRelationView } from "./deep-dive-relation-view";
import { QaFilterShell } from "./fieldbook-interactions";
import { formatModuleUpdatedAt, formatQuestionAddedAt } from "./content-update-metadata.mjs";
import { requireDeepDiveRepresentation } from "./module-representation-assessment.mjs";

type SourceSummary = {
  grade: string;
  kind: string;
  shortTitle: string;
};

type SourceLedger = Record<string, SourceSummary>;

type EvidenceCard = {
  metric: string;
  title: string;
  finding: string;
  boundary: string;
  sourceId: string;
  accent?: boolean;
};

type QaEvidence = {
  sourceId: string;
  supports: string;
};

type QaItem = {
  q: string;
  a: string;
  depth: string;
  ask: string;
  tag: string;
  basis: string;
  evidence: readonly QaEvidence[];
  addedAt?: string;
};

export type ModuleLearningContent = {
  outcomes: readonly string[];
  route: ReadonlyArray<{
    title: string;
    learn: string;
    checkpoint: string;
  }>;
  labs: ReadonlyArray<{
    title: string;
    scenario: string;
    tasks: readonly string[];
    deliverable: string;
    acceptance: string;
    sourceIds: readonly string[];
  }>;
};

export function ModuleSectionHeader({
  code,
  title,
  eyebrow,
}: {
  code: string;
  title: string;
  eyebrow?: string;
}) {
  return (
    <div className="subHead">
      <span>{code}</span>
      <div>
        {eyebrow ? <p className="miniLabel">{eyebrow}</p> : null}
        <h2>{title}</h2>
      </div>
    </div>
  );
}

export function ModuleHeroMetrics({
  sectionCount,
  questionCount,
  evidenceCount,
  labels = {
    ariaLabel: "模块内容概览",
    sections: "阅读章节",
    sectionUnit: "章",
    questions: "客户问题",
    questionUnit: "题",
    evidence: "证据卡",
    evidenceUnit: "张",
  },
}: {
  sectionCount: number;
  questionCount: number;
  evidenceCount: number;
  labels?: {
    ariaLabel: string;
    sections: string;
    sectionUnit?: string;
    questions: string;
    questionUnit?: string;
    evidence: string;
    evidenceUnit?: string;
  };
}) {
  return (
    <dl className="moduleHeroMetrics" aria-label={labels.ariaLabel}>
      <div><dt>{labels.sections}</dt><dd><strong>{sectionCount}</strong>{labels.sectionUnit ? <span>{labels.sectionUnit}</span> : null}</dd></div>
      <div><dt>{labels.questions}</dt><dd><strong>{questionCount}</strong>{labels.questionUnit ? <span>{labels.questionUnit}</span> : null}</dd></div>
      <div><dt>{labels.evidence}</dt><dd><strong>{evidenceCount}</strong>{labels.evidenceUnit ? <span>{labels.evidenceUnit}</span> : null}</dd></div>
    </dl>
  );
}

export type ModuleCurriculumContent = {
  lead: string;
  chapters: ReadonlyArray<{
    title: string;
    en: string;
    explanation: string;
    decision: string;
    boundary: string;
    sourceIds: readonly string[];
  }>;
};

export type DeepDiveItem = {
  name: string;
  en?: string;
  mechanism: string;
  decision: string;
  boundary?: string;
};

export type DeepDiveBlock = {
  kind: "sequence" | "matrix" | "diagnostic" | "checklist" | "scenario";
  eyebrow: string;
  title: string;
  intro: string;
  items: readonly DeepDiveItem[];
  sourceIds: readonly string[];
  maxColumns?: number;
  columnLabels?: {
    name: string;
    mechanism: string;
    decision: string;
    boundary: string;
  };
};

export function ModuleUpdatedAt({ value, locale = "zh-CN" }: { value?: string | readonly string[]; locale?: "zh-CN" | "en" }) {
  const dateValue = Array.isArray(value) ? value.at(-1) : value;
  const canonicalLabel = formatModuleUpdatedAt(dateValue);
  if (!canonicalLabel || !dateValue) return null;
  const label = locale === "en" ? `Last updated ${dateValue}` : canonicalLabel;

  return <span className="moduleUpdatedAt"> · <time dateTime={dateValue}>{label}</time></span>;
}

export function QuestionAddedAt({ value, className }: { value?: string; className?: string }) {
  const label = formatQuestionAddedAt(value);
  if (!label || !value) return null;

  return <time className={`questionAddedAt${className ? ` ${className}` : ""}`} dateTime={value}>{label}</time>;
}

function requireSource(sourceLedger: SourceLedger, sourceId: string) {
  const source = sourceLedger[sourceId];

  if (!source) {
    throw new Error(`Unknown module sourceId: ${sourceId}`);
  }

  return source;
}

export function BalancedGrid({
  children,
  className,
  maxColumns = 4,
}: {
  children: ReactNode;
  className?: string;
  maxColumns?: number;
}) {
  const items = Children.toArray(children);
  if (items.length === 0) return null;

  const rows = balanceGridRows(items, maxColumns);

  return (
    <div
      className={`balancedGrid${className ? ` ${className}` : ""}`}
      data-count={items.length}
      data-odd={items.length % 2 === 1 ? "true" : "false"}
    >
      {rows.flatMap((row, rowIndex) =>
        row.map((item, index) => (
          <div
            className="balancedGridCell"
            key={`${rowIndex}-${index}`}
            style={{ "--balanced-span": gridSpan(row.length) } as CSSProperties}
          >
            {item}
          </div>
        )),
      )}
    </div>
  );
}

export function CriticalBoundary({ children }: { children: ReactNode }) {
  return (
    <aside className="callout" aria-label="需要单独验证的约束" data-importance="critical">
      <div className="calloutTitle">
        <span>约束</span>
        <strong>需要单独验证</strong>
        <small>Verify separately</small>
      </div>
      <p>{children}</p>
    </aside>
  );
}

function DeepDiveSourceLinks({ sourceIds, sourceLedger }: { sourceIds: readonly string[]; sourceLedger: SourceLedger }) {
  if (sourceIds.length === 0) return null;

  return (
    <div className="deepDiveSources" aria-label="本节依据">
      <span>本节依据</span>
      {sourceIds.map((sourceId) => {
        const source = requireSource(sourceLedger, sourceId);
        return <Link href={`/references#source-${sourceId}`} key={sourceId}>{source.shortTitle} ↘</Link>;
      })}
    </div>
  );
}

export function ModuleDeepDiveBlocks({
  blocks,
  sourceLedger,
}: {
  blocks: readonly DeepDiveBlock[];
  sourceLedger: SourceLedger;
}) {
  if (blocks.length === 0) return null;

  return (
    <div className="deepDiveList">
      {blocks.map((block, blockIndex) => {
        const labels = block.columnLabels ?? {
          name: block.kind === "diagnostic" ? "现象 / 检查点" : "对象",
          mechanism: block.kind === "diagnostic" ? "可能机制" : "工作机制",
          decision: block.kind === "diagnostic" ? "验证与处理" : "方案判断",
          boundary: "适用边界",
        };

        return (
          <article className={`deepDiveBlock deepDiveBlock--${block.kind}`} key={block.title}>
            <header className="deepDiveHeader">
              <span>{String(blockIndex + 1).padStart(2, "0")}</span>
              <div>
                <p className="miniLabel">{block.eyebrow}</p>
                <h3>{block.title}</h3>
                <p>{block.intro}</p>
              </div>
            </header>

            {requireDeepDiveRepresentation(block.kind) === "editorial-checklist" ? (
              <ol className="deepDiveEditorialChecklist" data-adaptive-prose="checklist">
                {block.items.map((item, index) => (
                  <li key={item.name}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div><h4>{item.name}{item.en ? <small>{item.en}</small> : null}</h4><p>{item.mechanism}</p><strong>{item.decision}</strong>{item.boundary ? <em>{item.boundary}</em> : null}</div>
                  </li>
                ))}
              </ol>
            ) : (
              <DeepDiveRelationView block={{ ...block, columnLabels: labels }} />
            )}

            <DeepDiveSourceLinks sourceIds={block.sourceIds} sourceLedger={sourceLedger} />
          </article>
        );
      })}
    </div>
  );
}

export function ModuleCurriculumAtlas({
  content,
  sourceLedger,
}: {
  content: ModuleCurriculumContent;
  sourceLedger: SourceLedger;
}) {
  return (
    <div className="curriculumAtlas" data-curriculum-representation="progressive-outline">
      <p className="curriculumAtlasLead">{content.lead}</p>
      <div className="curriculumOutline">
        {content.chapters.map((chapter, index) => (
          <details className="curriculumChapter" open={index === 0} key={chapter.title}>
            <summary>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{chapter.title}</h3>
                <p>{chapter.en}</p>
              </div>
              <strong>{chapter.decision}</strong>
              <i aria-hidden="true" />
            </summary>
            <div className="curriculumChapterBody">
              <p className="curriculumExplanation">{chapter.explanation}</p>
              <dl>
                <div><dt>适用范围</dt><dd>{chapter.boundary}</dd></div>
              </dl>
              <DeepDiveSourceLinks sourceIds={chapter.sourceIds} sourceLedger={sourceLedger} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export function ModuleLearningStudio({
  content,
  sourceLedger,
}: {
  content: ModuleLearningContent;
  sourceLedger: SourceLedger;
}) {
  return (
    <div className="learningStudio">
      <div className="learningOutcomes" aria-labelledby="learning-outcomes-title">
        <div className="learningStudioHeading">
          <p className="miniLabel">LEARNING OUTCOMES</p>
          <h3 id="learning-outcomes-title">做完这组内容，你可以</h3>
        </div>
        <ol>
          {content.outcomes.map((outcome, index) => (
            <li key={outcome}><span>{String(index + 1).padStart(2, "0")}</span><strong>{outcome}</strong></li>
          ))}
        </ol>
      </div>

      <div className="learningRoute" aria-labelledby="learning-route-title">
        <div className="learningStudioHeading">
          <p className="miniLabel">RECOMMENDED ROUTE</p>
          <h3 id="learning-route-title">从这里开始</h3>
          <p>检查点看的是能否做出判断，而不是读到了第几章。</p>
        </div>
        <ol>
          {content.route.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h4>{step.title}</h4><p>{step.learn}</p><strong>掌握检查：{step.checkpoint}</strong></div>
            </li>
          ))}
        </ol>
      </div>

      <div className="learningLabs" aria-labelledby="learning-labs-title">
        <div className="learningStudioHeading">
          <p className="miniLabel">PRACTICE LABS</p>
          <h3 id="learning-labs-title">动手做一遍</h3>
          <p>练习围绕生产问题组织，结果可以直接进入方案评审、PoC 或复盘。</p>
        </div>
        <BalancedGrid className="learningLabGrid" maxColumns={2}>
          {content.labs.map((lab, index) => (
            <article className="learningLab" key={lab.title}>
              <header><span>LAB {String(index + 1).padStart(2, "0")}</span><h4>{lab.title}</h4></header>
              <p className="learningLabScenario"><strong>情境</strong>{lab.scenario}</p>
              <ol>{lab.tasks.map((task) => <li key={task}>{task}</li>)}</ol>
              <dl>
                <div><dt>产物</dt><dd>{lab.deliverable}</dd></div>
                <div><dt>通过标准</dt><dd>{lab.acceptance}</dd></div>
              </dl>
              <DeepDiveSourceLinks sourceIds={lab.sourceIds} sourceLedger={sourceLedger} />
            </article>
          ))}
        </BalancedGrid>
      </div>
    </div>
  );
}

export function ModuleEvidenceGrid({
  cards,
  sourceLedger,
  maxColumns = 4,
  headingLevel = 4,
}: {
  cards: EvidenceCard[];
  sourceLedger: SourceLedger;
  maxColumns?: number;
  headingLevel?: 3 | 4;
}) {
  if (cards.length === 0) return null;

  const rows = balanceGridRows(cards, maxColumns);

  const Heading = headingLevel === 3 ? "h3" : "h4";

  return (
    <div className="evidenceGrid" data-count={cards.length} data-odd={cards.length % 2 === 1 ? "true" : "false"}>
      {rows.flatMap((row) =>
        row.map((card) => {
          const source = requireSource(sourceLedger, card.sourceId);

          return (
            <article
              className={`metricCard${card.accent ? " accent" : ""}`}
              key={card.title}
              style={{ "--evidence-span": gridSpan(row.length) } as CSSProperties}
            >
              <p className="metric">{card.metric}</p>
              <Heading>{card.title}</Heading>
              <p className="metricFinding">{card.finding}</p>
              <p className="metricBoundary"><span>范围</span>{card.boundary}</p>
              <Link href={`/references#source-${card.sourceId}`}>对应来源 · {source.shortTitle} ↓</Link>
            </article>
          );
        }),
      )}
    </div>
  );
}

export function ModuleQaList({
  items,
  sourceLedger,
  initialLimit = 8,
  directoryHref,
}: {
  items: readonly QaItem[];
  sourceLedger: SourceLedger;
  initialLimit?: number;
  directoryHref?: string;
}) {
  if (items.length === 0) return null;

  return (
    <QaFilterShell
      directoryHref={directoryHref}
      initialLimit={initialLimit}
      items={items.map((item) => ({ tag: item.tag, text: `${item.q} ${item.a} ${item.depth} ${item.ask}` }))}
    >
      <div className="qaList">
        {items.map((item, index) => (
        <details id={`qa-${index + 1}`} key={item.q} open={index === 0} data-qa-tag={item.tag}>
          <summary>
            <span className="qaNo">Q{String(index + 1).padStart(2, "0")}</span>
            <span className="qaQuestion"><strong>{item.q}</strong><QuestionAddedAt value={item.addedAt} className="qaAddedAt" /></span>
            <span className="qaTag">{item.tag}</span>
            <span className="plus">＋</span>
          </summary>
          <div className="qaAnswer">
            <p className="qaAnswerLead">{item.a}</p>
            <p className="qaAnswerContext">{item.depth}</p>
            <details className="qaEvidenceDisclosure">
              <summary>查看依据与适用范围 <span>＋</span></summary>
              <div className="qaBasis" aria-label="本题依据">
                <p className="qaBasisNote">{item.basis}</p>
                <div className="qaBasisList" data-count={item.evidence.length} data-odd={item.evidence.length % 2 === 1 ? "true" : "false"}>
                  {balanceGridRows(item.evidence, 3).flatMap((row) =>
                    row.map((reference) => {
                      const source = requireSource(sourceLedger, reference.sourceId);

                      return (
                        <Link
                          href={`/references#source-${reference.sourceId}`}
                          key={reference.sourceId}
                          style={{ "--qa-evidence-span": gridSpan(row.length) } as CSSProperties}
                        >
                          <span className="qaEvidenceMeta">{source.grade} · {source.kind}</span>
                          <strong>{source.shortTitle}</strong>
                          <small>{reference.supports}</small>
                        </Link>
                      );
                    }),
                  )}
                </div>
              </div>
            </details>
            <p className="qaNextQuestion"><span>可以接着问</span>{item.ask}</p>
          </div>
          </details>
        ))}
      </div>
    </QaFilterShell>
  );
}
