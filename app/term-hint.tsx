import Link from "next/link";

import { requireTerm } from "./terminology.mjs";

type HintTerm = {
  zh: string;
  en: string;
  abbr?: string;
  description?: string;
};

export function TermHint({ termId }: { termId: string }) {
  const term = requireTerm(termId) as HintTerm;
  const label = term.abbr ?? term.en;

  if (!term.description) {
    throw new Error(`TermHint requires description: ${termId}`);
  }

  return (
    <details className="termHint" data-term-id={termId}>
      <summary aria-label={`${label}：${term.zh}，${term.en}。${term.description}`}>
        <span>{label}</span><i aria-hidden="true">?</i>
      </summary>
      <div className="termHintPopover">
        <span>{term.zh}</span>
        <strong>{term.en}</strong>
        <p>{term.description}</p>
      </div>
    </details>
  );
}

export function TermHintRow({ label, termIds }: { label: string; termIds: readonly string[] }) {
  return (
    <aside className="termHintRow" aria-label={`${label}，桌面悬停或聚焦查看，触屏点击查看`}>
      <p><strong>{label}</strong><span>悬停 / 点击查看全称与说明</span><Link href="/glossary">完整术语库 ↗</Link></p>
      <div>{termIds.map((termId) => <TermHint key={termId} termId={termId} />)}</div>
    </aside>
  );
}

export function TermHintGroups({ groups, total }: { groups: ReadonlyArray<{ label: string; termIds: readonly string[] }>; total: number }) {
  return (
    <aside className="termHintGroups" aria-label="核心专业术语，桌面悬停或聚焦查看，触屏点击查看">
      <div className="termHintGroupList">
        {groups.map((group) => (
          <section className="termHintGroup" key={group.label}>
            <h3>{group.label}</h3>
            <div>{group.termIds.map((termId) => <TermHint key={termId} termId={termId} />)}</div>
          </section>
        ))}
      </div>
      <footer><span>首页展示跨模块高频概念</span><Link href="/glossary">查看全部 {total} 个术语 <i aria-hidden="true">→</i></Link></footer>
    </aside>
  );
}
