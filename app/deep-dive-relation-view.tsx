"use client";

import { useState } from "react";

type RelationItem = {
  id?: string;
  name: string;
  en?: string;
  mechanism: string;
  decision: string;
  boundary?: string;
};

type RelationBlock = {
  kind: "sequence" | "matrix" | "diagnostic" | "scenario" | "checklist";
  title: string;
  items: readonly RelationItem[];
  columnLabels?: {
    name: string;
    mechanism: string;
    decision: string;
    boundary: string;
  };
};

function DetailPanel({ item, mode, locale }: { item: RelationItem; mode: RelationBlock["kind"]; locale: "zh" | "en" }) {
  const mechanismLabel = locale === "en"
    ? mode === "diagnostic" ? "Possible mechanism" : mode === "scenario" ? "Scenario mechanism" : "How it works"
    : mode === "diagnostic" ? "可能机制" : mode === "scenario" ? "场景机制" : "工作机制";
  const decisionLabel = locale === "en"
    ? mode === "diagnostic" ? "Verify and respond" : "Presales decision"
    : mode === "diagnostic" ? "验证与处理" : "售前判断";

  return (
    <section className="relationDetail" aria-live="polite">
      <div><span>{mechanismLabel}</span><p>{item.mechanism}</p></div>
      <div><span>{decisionLabel}</span><strong>{item.decision}</strong></div>
      {item.boundary ? <div className="relationBoundary"><span>{locale === "en" ? "Boundary" : "适用边界"}</span><p>{item.boundary}</p></div> : null}
    </section>
  );
}

function SequenceView({ block, active, onSelect, locale }: { block: RelationBlock; active: number; onSelect: (index: number) => void; locale: "zh" | "en" }) {
  return (
    <div className="relationSequence" data-count={block.items.length}>
      <ol>
        {block.items.map((item, index) => (
          <li className={active === index ? "isActive" : undefined} id={item.id} key={item.name}>
            <button type="button" aria-pressed={active === index} onClick={() => onSelect(index)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.name}</strong>
              {item.en ? <small>{item.en}</small> : null}
            </button>
            {index < block.items.length - 1 ? <i aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
      <DetailPanel item={block.items[active]} mode="sequence" locale={locale} />
    </div>
  );
}

function DiagnosticView({ block, active, onSelect }: { block: RelationBlock; active: number; onSelect: (index: number) => void }) {
  const item = block.items[active];

  return (
    <div className="relationDiagnostic">
      <nav aria-label={`${block.title}：选择现象或检查点`}>
        {block.items.map((candidate, index) => (
          <button type="button" aria-pressed={active === index} onClick={() => onSelect(index)} key={candidate.name}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{candidate.name}</strong>
          </button>
        ))}
      </nav>
      <div className="diagnosticPath">
        <div><span>现象 / 检查点</span><strong>{item.name}</strong></div>
        <i aria-hidden="true" />
        <div><span>可能机制</span><p>{item.mechanism}</p></div>
        <i aria-hidden="true" />
        <div><span>验证与处理</span><p>{item.decision}</p></div>
      </div>
      {item.boundary ? <p className="diagnosticBoundary"><span>边界</span>{item.boundary}</p> : null}
    </div>
  );
}

function MatrixView({ block, active, onSelect }: { block: RelationBlock; active: number; onSelect: (index: number) => void }) {
  const labels = block.columnLabels ?? {
    name: "对象",
    mechanism: "工作机制",
    decision: "售前判断",
    boundary: "适用边界",
  };

  return (
    <div className="relationMatrix">
      <div className="relationMatrixScroll" role="region" aria-label={block.title} tabIndex={0}>
        <table>
          <caption className="srOnly">{block.title}</caption>
          <thead><tr><th scope="col">{labels.name}</th><th scope="col">{labels.mechanism}</th><th scope="col">{labels.decision}</th><th scope="col">{labels.boundary}</th></tr></thead>
          <tbody>
            {block.items.map((item, index) => (
              <tr className={active === index ? "isActive" : undefined} key={item.name}>
                <th scope="row"><button type="button" aria-pressed={active === index} onClick={() => onSelect(index)}><span>{String(index + 1).padStart(2, "0")}</span>{item.name}{item.en ? <small>{item.en}</small> : null}</button></th>
                <td>{item.mechanism}</td>
                <td>{item.decision}</td>
                <td>{item.boundary ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="relationMatrixFocus"><span>当前比较</span><strong>{block.items[active].name}</strong>{block.items[active].decision}</p>
    </div>
  );
}

function ScenarioView({ block, active, onSelect }: { block: RelationBlock; active: number; onSelect: (index: number) => void }) {
  return (
    <div className="relationScenario">
      <div className="scenarioQuestion"><span>DECISION FORK</span><strong>条件不同，选择与责任怎样变化？</strong></div>
      <nav aria-label={`${block.title}：选择场景`}>
        {block.items.map((item, index) => (
          <button type="button" aria-pressed={active === index} onClick={() => onSelect(index)} key={item.name}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.name}</strong>
            {item.en ? <small>{item.en}</small> : null}
          </button>
        ))}
      </nav>
      <DetailPanel item={block.items[active]} mode="scenario" locale="zh" />
    </div>
  );
}

export function DeepDiveRelationView({ block, locale = "zh" }: { block: RelationBlock; locale?: "zh" | "en" }) {
  const [active, setActive] = useState(0);

  return (
    <div className={`deepDiveRelation deepDiveRelation--${block.kind}`} data-adaptive-visual={block.kind} data-active-item={active}>
      {block.kind === "sequence" ? <SequenceView block={block} active={active} onSelect={setActive} locale={locale} /> : null}
      {block.kind === "diagnostic" ? <DiagnosticView block={block} active={active} onSelect={setActive} /> : null}
      {block.kind === "matrix" ? <MatrixView block={block} active={active} onSelect={setActive} /> : null}
      {block.kind === "scenario" ? <ScenarioView block={block} active={active} onSelect={setActive} /> : null}
    </div>
  );
}
