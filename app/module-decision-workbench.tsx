"use client";

import { useState } from "react";

type Decision = {
  question: string;
  signal: string;
  recommendation: string;
  boundary: string;
};

export function ModuleDecisionWorkbench({
  decisions,
  moduleName,
}: {
  decisions: Decision[];
  moduleName: string;
}) {
  const [active, setActive] = useState(0);
  const selected = decisions[active] ?? decisions[0];
  if (!selected) return null;

  return (
    <div className="moduleDecisionWorkbench" data-active-decision={active + 1}>
      <header>
        <div><span>DECISION CHECK</span><h3>按客户条件核对方案</h3></div>
        <p>选择最接近现场的问题，对照观察信号、建议动作和约束。这里用于组织讨论，结论仍要由客户数据验证。</p>
      </header>
      <div className="moduleDecisionCanvas">
        <nav aria-label={`${moduleName}方案判断`}>
          {decisions.map((item, index) => (
            <button
              aria-pressed={active === index}
              key={item.question}
              onClick={() => setActive(index)}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.question}</strong>
            </button>
          ))}
        </nav>
        <article aria-live="polite">
          <p className="moduleDecisionPrompt">{selected.question}</p>
          <dl>
            <div><dt>观察</dt><dd>{selected.signal}</dd></div>
            <div className="isRecommendation"><dt>建议</dt><dd>{selected.recommendation}</dd></div>
            <div className="isConstraint"><dt>约束</dt><dd>{selected.boundary}</dd></div>
          </dl>
        </article>
      </div>
    </div>
  );
}
