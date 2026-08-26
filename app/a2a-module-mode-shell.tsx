"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import styles from "./a2a-module-experience.module.css";

export type A2AReadingMode = "quick" | "learn" | "field";

export type A2AChapterLink = {
  id: string;
  label: string;
  eyebrow: string;
};

const modeDefinitions = [
  {
    id: "quick" as const,
    label: "10 分钟速查",
    eyebrow: "先判路径",
    description: "看清 Message 与 Task 的分叉、协议边界和三项独立验收。",
  },
  {
    id: "learn" as const,
    label: "系统学习",
    eyebrow: "走完 11 章",
    description: "从发现、状态到交付、身份、采用与实验，建立完整任务模型。",
  },
  {
    id: "field" as const,
    label: "现场查证",
    eyebrow: "带证据回答",
    description: "按 12 个问题核验对端声明、运行证据、责任边界和采用条件。",
  },
] as const;

function modeForHash(hash: string): A2AReadingMode | null {
  const target = hash.replace(/^#/, "");
  if (!target) return null;
  if (target === "principle" || target === "a2a-reading") return "quick";
  if (target === "study-guide" || target === "curriculum" || target.startsWith("a2a-chapter-")) return "learn";
  if (["qa", "evidence", "cloud", "related-modules"].includes(target) || target.startsWith("qa-")) return "field";
  return null;
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

export function A2AModuleModeShell({
  chapters,
  quick,
  learn,
  field,
  initialMode,
}: {
  chapters: readonly A2AChapterLink[];
  quick: ReactNode;
  learn: ReactNode;
  field: ReactNode;
  initialMode: A2AReadingMode;
}) {
  const [activeMode, setActiveMode] = useState<A2AReadingMode>(initialMode);
  const tabsId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panels: Record<A2AReadingMode, ReactNode> = { quick, learn, field };

  function activateMode(nextMode: A2AReadingMode, clearHash = true) {
    setActiveMode(nextMode);
    if (clearHash && window.location.hash) window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
    window.requestAnimationFrame(() => {
      document.getElementById("a2a-reading")?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  const revealHash = useCallback((hash: string) => {
    const nextMode = modeForHash(hash);
    if (!nextMode) return;
    setActiveMode(nextMode);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      scrollHashTargetIntoView(hash);
    }));
  }, []);

  useEffect(() => {
    const syncHash = () => revealHash(window.location.hash);
    const syncClickedHash = (event: globalThis.MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (anchor?.hash) revealHash(anchor.hash);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    document.addEventListener("click", syncClickedHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      document.removeEventListener("click", syncClickedHash);
    };
  }, [revealHash]);

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + modeDefinitions.length) % modeDefinitions.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % modeDefinitions.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = modeDefinitions.length - 1;
    activateMode(modeDefinitions[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  function openChapter(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    window.history.replaceState({}, "", `#${id}`);
    revealHash(`#${id}`);
  }

  const chapterDirectory = (
    <ol>
      {chapters.map((chapter, index) => (
        <li key={chapter.id}>
          <a href={`#${chapter.id}`} onClick={(event) => openChapter(event, chapter.id)}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{chapter.label}</strong>
            <small>{chapter.eyebrow}</small>
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <section className="moduleReadingExperience">
    <div className={styles.experience} id="a2a-reading" aria-label="A2A 阅读任务">
      <header className={styles.modeBar}>
        <div className={styles.modePrompt}>
          <span>当前任务</span>
          <strong>{modeDefinitions.find((mode) => mode.id === activeMode)?.description}</strong>
        </div>
        <div className={styles.modeTabs} role="tablist" aria-label="阅读方式">
          {modeDefinitions.map((mode, index) => (
            <button
              aria-controls={`${tabsId}-${mode.id}`}
              aria-selected={activeMode === mode.id}
              id={`${tabsId}-${mode.id}-tab`}
              key={mode.id}
              onClick={() => activateMode(mode.id)}
              onKeyDown={(event) => moveTab(event, index)}
              ref={(node) => { tabRefs.current[index] = node; }}
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

      <details className={styles.mobileDirectory}>
        <summary>11 章目录</summary>
        <nav aria-label="A2A 移动端章节目录">{chapterDirectory}</nav>
      </details>

      <div className={styles.workspace}>
        <aside className={styles.directory} aria-label="A2A 章节目录">
          <header>
            <span>CANONICAL ROUTE</span>
            <strong>11 章 · 一条主线</strong>
            <p>11 章依次覆盖发现、对象、状态、交付、身份、证据、采用与实验。</p>
          </header>
          <nav>{chapterDirectory}</nav>
          <footer>
            <span>先记住</span>
            <p>COMPLETED、产物校验、业务接受是三个事件。</p>
          </footer>
        </aside>

        <div className={styles.panels}>
          {modeDefinitions.map((mode) => (
            <div
              aria-labelledby={`${tabsId}-${mode.id}-tab`}
              className={styles.panel}
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
    </div>
    </section>
  );
}
