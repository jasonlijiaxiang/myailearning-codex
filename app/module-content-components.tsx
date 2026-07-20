import { Children, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";

import { balanceGridRows, gridSpan } from "./layout-utils.mjs";
import { QaFilterShell } from "./fieldbook-interactions";

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
  evidence: QaEvidence[];
};

export type ModuleLearningContent = {
  outcomes: string[];
  route: Array<{
    title: string;
    learn: string;
    checkpoint: string;
  }>;
  labs: Array<{
    title: string;
    scenario: string;
    tasks: string[];
    deliverable: string;
    acceptance: string;
    sourceIds: string[];
  }>;
};

export function ModuleHeroMetrics({
  sectionCount,
  questionCount,
  evidenceCount,
}: {
  sectionCount: number;
  questionCount: number;
  evidenceCount: number;
}) {
  return (
    <dl className="moduleHeroMetrics" aria-label="模块内容概览">
      <div><dt>阅读章节</dt><dd><strong>{sectionCount}</strong><span>章</span></dd></div>
      <div><dt>客户问题</dt><dd><strong>{questionCount}</strong><span>题</span></dd></div>
      <div><dt>证据卡</dt><dd><strong>{evidenceCount}</strong><span>张</span></dd></div>
    </dl>
  );
}

export type ModuleCurriculumContent = {
  lead: string;
  chapters: Array<{
    title: string;
    en: string;
    explanation: string;
    decision: string;
    boundary: string;
    sourceIds: string[];
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
  items: DeepDiveItem[];
  sourceIds: string[];
  maxColumns?: number;
  columnLabels?: {
    name: string;
    mechanism: string;
    decision: string;
    boundary: string;
  };
};

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
    <aside className="callout" aria-label="重要边界" data-importance="critical">
      <div className="calloutTitle">
        <span>高影响限制</span>
        <strong>重要边界</strong>
        <small>Critical Boundary</small>
      </div>
      <p>{children}</p>
    </aside>
  );
}

function DeepDiveSourceLinks({ sourceIds, sourceLedger }: { sourceIds: string[]; sourceLedger: SourceLedger }) {
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
  blocks: DeepDiveBlock[];
  sourceLedger: SourceLedger;
}) {
  if (blocks.length === 0) return null;

  return (
    <div className="deepDiveList">
      {blocks.map((block, blockIndex) => {
        const labels = block.columnLabels ?? {
          name: block.kind === "diagnostic" ? "现象 / 检查点" : "对象",
          mechanism: block.kind === "diagnostic" ? "可能机制" : "工作机制",
          decision: block.kind === "diagnostic" ? "验证与处理" : "售前判断",
          boundary: "适用边界",
        };

        return (
          <article className={`deepDiveBlock deepDiveBlock--${block.kind}`} key={block.title}>
            <header className="deepDiveHeader">
              <span>{String(blockIndex + 1).padStart(2, "0")}</span>
              <div><p className="miniLabel">{block.eyebrow}</p><h3>{block.title}</h3><p>{block.intro}</p></div>
            </header>

            {block.kind === "sequence" ? (
              <ol className="deepDiveSequence" data-count={block.items.length}>
                {block.items.map((item, index) => (
                  <li key={item.name}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div><h4>{item.name}{item.en ? <small>{item.en}</small> : null}</h4><p>{item.mechanism}</p><strong>{item.decision}</strong>{item.boundary ? <em>{item.boundary}</em> : null}</div>
                  </li>
                ))}
              </ol>
            ) : block.kind === "checklist" || block.kind === "scenario" ? (
              <BalancedGrid className={`deepDiveCards deepDiveCards--${block.kind}`} maxColumns={block.maxColumns ?? 3}>
                {block.items.map((item) => (
                  <article key={item.name}>
                    <p className="miniLabel">{item.en ?? block.eyebrow}</p>
                    <h4>{item.name}</h4>
                    <p>{item.mechanism}</p>
                    <strong>{item.decision}</strong>
                    {item.boundary ? <small>{item.boundary}</small> : null}
                  </article>
                ))}
              </BalancedGrid>
            ) : (
              <div className="tableWrap deepDiveTable"><table><thead><tr><th>{labels.name}</th><th>{labels.mechanism}</th><th>{labels.decision}</th><th>{labels.boundary}</th></tr></thead><tbody>
                {block.items.map((item) => <tr key={item.name}><th>{item.name}{item.en ? <small>{item.en}</small> : null}</th><td>{item.mechanism}</td><td>{item.decision}</td><td>{item.boundary ?? "—"}</td></tr>)}
              </tbody></table></div>
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
    <div className="curriculumAtlas">
      <p className="curriculumAtlasLead">{content.lead}</p>
      <BalancedGrid className="curriculumChapterGrid" maxColumns={2}>
        {content.chapters.map((chapter, index) => (
          <article className="curriculumChapter" key={chapter.title}>
            <header>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{chapter.title}</h3><p>{chapter.en}</p></div>
            </header>
            <p className="curriculumExplanation">{chapter.explanation}</p>
            <dl>
              <div><dt>售前判断</dt><dd>{chapter.decision}</dd></div>
              <div><dt>关键边界</dt><dd>{chapter.boundary}</dd></div>
            </dl>
            <DeepDiveSourceLinks sourceIds={chapter.sourceIds} sourceLedger={sourceLedger} />
          </article>
        ))}
      </BalancedGrid>
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
          <h3 id="learning-outcomes-title">学完后，你应该能独立完成</h3>
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
          <h3 id="learning-route-title">三步学习路线</h3>
          <p>每一步都以“能做出什么判断”作为检查点，而不是以读完多少内容作为完成标准。</p>
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
          <h3 id="learning-labs-title">用真实产物证明掌握</h3>
          <p>练习围绕真实生产问题组织，实验结果可以直接进入方案评审、PoC 或复盘。</p>
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
}: {
  cards: EvidenceCard[];
  sourceLedger: SourceLedger;
  maxColumns?: number;
}) {
  if (cards.length === 0) return null;

  const rows = balanceGridRows(cards, maxColumns);

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
              <h4>{card.title}</h4>
              <p className="metricFinding">{card.finding}</p>
              <p className="metricBoundary"><strong>适用边界</strong>{card.boundary}</p>
              <Link href={`/references#source-${card.sourceId}`}>对应来源 · {source.shortTitle} ↓</Link>
            </article>
          );
        }),
      )}
    </div>
  );
}

export function ModuleQaList({ items, sourceLedger }: { items: QaItem[]; sourceLedger: SourceLedger }) {
  if (items.length === 0) return null;

  return (
    <QaFilterShell items={items.map((item) => ({ tag: item.tag, text: `${item.q} ${item.a} ${item.depth} ${item.ask}` }))}>
      <div className="qaList">
        {items.map((item, index) => (
        <details id={`qa-${index + 1}`} key={item.q} open={index === 0} data-qa-tag={item.tag}>
          <summary>
            <span className="qaNo">Q{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.q}</strong>
            <span className="qaTag">{item.tag}</span>
            <span className="plus">＋</span>
          </summary>
          <div className="qaAnswer">
            <div><p className="answerLabel">结论短答</p><p>{item.a}</p></div>
            <div><p className="answerLabel">深一层</p><p>{item.depth}</p></div>
            <div className="qaBasis" aria-label="本题依据">
              <div className="qaBasisHead">
                <p className="answerLabel">本题依据 / Evidence</p>
                <span>{item.basis}</span>
              </div>
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
            <div className="ask"><p className="answerLabel">售前下一问</p><p>{item.ask}</p></div>
          </div>
          </details>
        ))}
      </div>
    </QaFilterShell>
  );
}
