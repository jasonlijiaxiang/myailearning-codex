"use client";

import { type KeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";

import styles from "./dense-module-reading-modes.module.css";

type ReadingModeId = "quick" | "learn" | "field";

export type DenseChapterLink = {
  id: string;
  label: string;
  eyebrow?: string;
};

const readingModes = [
  { id: "quick", label: "10 分钟速查", eyebrow: "抓住主线", outcome: "讲清采用条件、控制边界和完成证据" },
  { id: "learn", label: "系统学习", eyebrow: "读懂机制", outcome: "按章节核对定义、机制、失败模式与工程控制" },
  { id: "field", label: "现场查证", eyebrow: "带来源回答", outcome: "回答包含依据、适用范围和客户追问" },
] as const;

const defaultHashGroups: Record<ReadingModeId, Set<string>> = {
  quick: new Set(["agent-principle"]),
  learn: new Set(["learn-run", "concept-map", "agent-loop", "learn-harness", "harness", "boundaries", "capabilities", "memory-interaction", "learn-release", "patterns", "architecture", "agent-independent-depth", "poc"]),
  field: new Set(["cloud-opportunities", "evidence", "qa"]),
};

function modeForHash(hash: string, hashGroups?: Partial<Record<ReadingModeId, string[]>>) {
  const target = hash.replace(/^#/, "");
  if (!target) return null;
  for (const mode of readingModes) {
    if (hashGroups?.[mode.id]?.includes(target)) return mode.id;
    if (defaultHashGroups[mode.id].has(target)) return mode.id;
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

export function DenseModuleReadingModes({
  moduleName,
  chapters,
  quick,
  learn,
  field,
  defaultMode = "quick",
  hashGroups,
}: {
  moduleName: string;
  chapters: readonly DenseChapterLink[];
  quick: ReactNode;
  learn: ReactNode;
  field: ReactNode;
  defaultMode?: ReadingModeId;
  hashGroups?: Partial<Record<ReadingModeId, string[]>>;
}) {
  const [activeMode, setActiveMode] = useState<ReadingModeId>(defaultMode);
  const tabsId = useId();
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const activeDefinition = readingModes.find((mode) => mode.id === activeMode) ?? readingModes[0];

  const revealHash = useCallback((hash: string) => {
    const nextMode = modeForHash(hash, hashGroups);
    if (!nextMode) return;
    setActiveMode(nextMode);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      scrollHashTargetIntoView(hash);
    }));
  }, [hashGroups]);

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

  function activateMode(nextMode: ReadingModeId) {
    setActiveMode(nextMode);
    if (window.location.hash) window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
  }

  function revealLinkedSection(event: ReactMouseEvent<HTMLElement>) {
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (anchor) revealHash(anchor.hash);
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

  return (
    <section className="moduleReadingExperience" id="module-reading" aria-label={`${moduleName}阅读方式`} onClickCapture={revealLinkedSection}>
      <header className="moduleModeHeader">
        <div><span>选择当前任务</span><strong>{moduleName}</strong></div>
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

      <div className={`moduleModeWorkspace ${styles.workspace}`}>
        <aside className={styles.directory} aria-label={`${moduleName}章节目录`}>
          <header><span>{chapters.length} 章主目录</span><strong>{moduleName}</strong></header>
          <ol>
            {chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <a href={`#${chapter.id}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{chapter.label}</strong>
                  {chapter.eyebrow ? <small>{chapter.eyebrow}</small> : null}
                </a>
              </li>
            ))}
          </ol>
          <footer aria-live="polite"><span>{activeDefinition.label}</span><p>{activeDefinition.outcome}</p></footer>
        </aside>

        <div className="moduleModePanels">
          {readingModes.map((mode) => (
            <div
              aria-labelledby={`${tabsId}-${mode.id}-tab`}
              className={`moduleModePanel moduleModePanel--${mode.id}`}
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
