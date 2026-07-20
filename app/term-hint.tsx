import { requireTerm } from "./terminology.mjs";

type HintTerm = {
  zh: string;
  en: string;
  abbr?: string;
  description?: string;
};

export function TermHint({ termId }: { termId: string }) {
  const term = requireTerm(termId) as HintTerm;

  if (!term.abbr || !term.description) {
    throw new Error(`TermHint requires abbr and description: ${termId}`);
  }

  return (
    <details className="termHint" data-term-id={termId}>
      <summary aria-label={`${term.abbr}：${term.en}。${term.description}`}>
        <span>{term.abbr}</span><i aria-hidden="true">?</i>
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
      <p><strong>{label}</strong><span>悬停 / 点击查看全称与说明</span></p>
      <div>{termIds.map((termId) => <TermHint key={termId} termId={termId} />)}</div>
    </aside>
  );
}
