import type { CSSProperties } from "react";
import Link from "next/link";

import { balanceRows } from "./layout-utils.mjs";

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

function requireSource(sourceLedger: SourceLedger, sourceId: string) {
  const source = sourceLedger[sourceId];

  if (!source) {
    throw new Error(`Unknown module sourceId: ${sourceId}`);
  }

  return source;
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

  const rows = balanceRows(cards, maxColumns);

  return (
    <div className="evidenceGrid" data-count={cards.length} data-odd={cards.length % 2 === 1 ? "true" : "false"}>
      {rows.flatMap((row) =>
        row.map((card) => {
          const source = requireSource(sourceLedger, card.sourceId);

          return (
            <article
              className={`metricCard${card.accent ? " accent" : ""}`}
              key={card.title}
              style={{ "--evidence-span": 12 / row.length } as CSSProperties}
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
    <div className="qaList">
      {items.map((item, index) => (
        <details key={item.q} open={index === 0}>
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
                {balanceRows(item.evidence, 3).flatMap((row) =>
                  row.map((reference) => {
                    const source = requireSource(sourceLedger, reference.sourceId);

                    return (
                      <Link
                        href={`/references#source-${reference.sourceId}`}
                        key={reference.sourceId}
                        style={{ "--qa-evidence-span": 12 / row.length } as CSSProperties}
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
  );
}
