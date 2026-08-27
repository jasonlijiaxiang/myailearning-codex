"use client";

import { type KeyboardEvent, type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import styles from "./dense-module-reading-modes.module.css";

export type ReadingModeId = "quick" | "learn" | "field";

export type DenseChapterLink = {
  id: string;
  label: string;
  eyebrow?: string;
};

const readingModes = [
  { id: "quick", label: "10 分钟速查", eyebrow: "做判断", outcome: "用采用条件、机制主线和硬边界完成第一次方案判断。" },
  { id: "learn", label: "系统学习", eyebrow: "建模型", outcome: "按章节掌握对象、机制、失败模式、工程控制与验证实验。" },
  { id: "field", label: "现场查证", eyebrow: "带证据", outcome: "用问答、证据与责任清单回答客户，并说明来源和适用范围。" },
] as const;

type ModeMap<T> = Partial<Record<ReadingModeId, T>>;

function modeForHash(
  hash: string,
  hashGroups: ModeMap<readonly string[]> | undefined,
  directories: Record<ReadingModeId, readonly DenseChapterLink[]>,
) {
  const target = hash.replace(/^#/, "");
  if (!target) return null;

  for (const mode of readingModes) {
    if (hashGroups?.[mode.id]?.includes(target)) return mode.id;
    if (directories[mode.id].some((item) => item.id === target)) return mode.id;
  }

  return target.startsWith("qa-") ? "field" : null;
}

function scrollHashTargetIntoView(hash: string) {
  const target = document.getElementById(hash.replace(/^#/, ""));
  if (!target) return;
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  target.scrollIntoView({ block: "start" });
  root.style.scrollBehavior = previousBehavior;
}

function DirectoryList({ items, activeId }: { items: readonly DenseChapterLink[]; activeId?: string }) {
  return (
    <ol>
      {items.map((item, index) => (
        <li key={item.id}>
          <a aria-current={activeId === item.id ? "location" : undefined} href={`#${item.id}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.label}</strong>
            {item.eyebrow ? <small>{item.eyebrow}</small> : null}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function DenseModuleReadingModes({
  moduleName,
  chapters,
  directories,
  quick,
  learn,
  field,
  defaultMode = "quick",
  hashGroups,
  criticalBoundary,
  readerId = "module-reading",
  modeDescriptions,
}: {
  moduleName: string;
  chapters: readonly DenseChapterLink[];
  directories?: ModeMap<readonly DenseChapterLink[]>;
  quick: ReactNode;
  learn: ReactNode;
  field: ReactNode;
  defaultMode?: ReadingModeId;
  hashGroups?: ModeMap<readonly string[]>;
  criticalBoundary?: string;
  readerId?: string;
  modeDescriptions?: ModeMap<string>;
}) {
  const [activeMode, setActiveMode] = useState<ReadingModeId>(defaultMode);
  const [activeAnchor, setActiveAnchor] = useState<string | undefined>();
  const tabsId = useId();
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const directoryByMode = useMemo<Record<ReadingModeId, readonly DenseChapterLink[]>>(() => ({
    quick: directories?.quick ?? chapters,
    learn: directories?.learn ?? chapters,
    field: directories?.field ?? chapters,
  }), [chapters, directories]);
  const activeDefinition = readingModes.find((mode) => mode.id === activeMode) ?? readingModes[0];
  const activeDirectory = directoryByMode[activeMode];
  const displayedActiveAnchor = activeDirectory.some((item) => item.id === activeAnchor) ? activeAnchor : activeDirectory[0]?.id;

  const revealHash = useCallback((hash: string) => {
    if (!hash.replace(/^#/, "")) {
      setActiveMode(defaultMode);
      setActiveAnchor(undefined);
      return;
    }
    const nextMode = modeForHash(hash, hashGroups, directoryByMode);
    if (!nextMode) return;
    setActiveMode(nextMode);
    setActiveAnchor(hash.replace(/^#/, ""));
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      scrollHashTargetIntoView(hash);
    }));
  }, [defaultMode, directoryByMode, hashGroups]);

  useEffect(() => {
    const handleHashChange = () => revealHash(window.location.hash);
    const handleDocumentClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (anchor?.hash) revealHash(anchor.hash);
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleDocumentClick);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [revealHash]);

  useEffect(() => {
    const targets = activeDirectory
      .map((item) => document.getElementById(item.id))
      .filter((target): target is HTMLElement => Boolean(target));
    if (targets.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
      if (visible?.target.id) setActiveAnchor(visible.target.id);
    }, { rootMargin: "-104px 0px -62% 0px", threshold: [0, .01] });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [activeDirectory]);

  function activateMode(nextMode: ReadingModeId) {
    setActiveMode(nextMode);
    if (window.location.hash) window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
    window.requestAnimationFrame(() => document.getElementById(readerId)?.scrollIntoView({ block: "start" }));
  }

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + readingModes.length) % readingModes.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % readingModes.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = readingModes.length - 1;
    activateMode(readingModes[nextIndex].id);
    tabsRef.current[nextIndex]?.focus();
  }

  const panels: Record<ReadingModeId, ReactNode> = { quick, learn, field };
  const currentOutcome = modeDescriptions?.[activeMode] ?? activeDefinition.outcome;

  return (
    <section
      aria-label={`${moduleName}阅读方式`}
      className="moduleReadingExperience"
      data-module-reader="unified"
      id={readerId}
    >
      <header className={`moduleModeHeader ${styles.modeHeader}`}>
        <div className={styles.modePrompt}>
          <span>当前阅读任务</span>
          <strong>{moduleName}</strong>
        </div>
        <div className="moduleModeTabs" role="tablist" aria-label="阅读方式">
          {readingModes.map((mode, index) => (
            <button
              aria-controls={`${tabsId}-${mode.id}`}
              aria-selected={activeMode === mode.id}
              id={`${tabsId}-${mode.id}-tab`}
              key={mode.id}
              onClick={() => activateMode(mode.id)}
              onKeyDown={(event) => moveTab(event, index)}
              ref={(node) => { tabsRef.current[index] = node; }}
              role="tab"
              tabIndex={activeMode === mode.id ? 0 : -1}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{mode.label}</strong>
              <small>{mode.eyebrow}</small>
            </button>
          ))}
        </div>
      </header>

      {criticalBoundary ? (
        <aside className={styles.boundary} aria-label="重要边界" data-importance="critical">
          <strong>生产硬边界</strong><p>{criticalBoundary}</p>
        </aside>
      ) : null}

      <details className={styles.mobileDirectory}>
        <summary>{activeDefinition.label} · {activeDirectory.length} 个入口</summary>
        <nav aria-label={`${moduleName}${activeDefinition.label}目录`}><DirectoryList activeId={displayedActiveAnchor} items={activeDirectory} /></nav>
        <p>{currentOutcome}</p>
      </details>

      <div className={`moduleModeWorkspace ${styles.workspace}`}>
        <aside className={styles.directory} aria-label={`${moduleName}${activeDefinition.label}目录`}>
          <header><span>{activeDirectory.length} 个入口</span><strong>{activeDefinition.label}</strong></header>
          <nav><DirectoryList activeId={displayedActiveAnchor} items={activeDirectory} /></nav>
          <footer aria-live="polite"><span>{activeDefinition.eyebrow}</span><p>{currentOutcome}</p></footer>
        </aside>

        <div className={`moduleModePanels ${styles.panels}`}>
          {readingModes.map((mode) => (
            <div
              aria-labelledby={`${tabsId}-${mode.id}-tab`}
              className={`moduleModePanel moduleModePanel--${mode.id} ${styles.panel}`}
              hidden={activeMode !== mode.id}
              id={`${tabsId}-${mode.id}`}
              key={mode.id}
              role="tabpanel"
              tabIndex={0}
            >
              {panels[mode.id]}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
