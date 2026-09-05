"use client";

import { Suspense, type KeyboardEvent, type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import styles from "./dense-module-reading-modes.module.css";
import type { UnifiedModuleLocale } from "./unified-module-hero";

export type ReadingModeId = string;

export type DenseChapterLink = {
  id: string;
  label: string;
  eyebrow?: string;
};

export type DenseReadingMode = {
  id: ReadingModeId;
  label: string;
  eyebrow: string;
  outcome: string;
};

const readerCopyByLocale: Record<UnifiedModuleLocale, {
  modes: readonly DenseReadingMode[];
  readingTask: string;
  readingModes: string;
  boundaryAria: string;
  boundaryLabel: string;
  entries: (count: number) => string;
  directory: (moduleName: string, modeLabel: string) => string;
  experience: (moduleName: string) => string;
}> = {
  "zh-CN": {
    modes: [
      { id: "quick", label: "10 分钟速查", eyebrow: "做判断", outcome: "用采用条件、机制主线和硬边界完成第一次方案判断。" },
      { id: "learn", label: "系统学习", eyebrow: "建模型", outcome: "沿真正影响判断的主题，建立对象、机制、失败模式、工程控制与验证方法。" },
      { id: "field", label: "现场查证", eyebrow: "带证据", outcome: "用问答、证据与责任清单回答客户，并说明来源和适用范围。" },
    ],
    readingTask: "当前阅读任务",
    readingModes: "阅读方式",
    boundaryAria: "重要边界",
    boundaryLabel: "生产硬边界",
    entries: (count) => `${count} 个入口`,
    directory: (moduleName, modeLabel) => `${moduleName}${modeLabel}目录`,
    experience: (moduleName) => `${moduleName}阅读方式`,
  },
  en: {
    modes: [
      { id: "quick", label: "10-minute scan", eyebrow: "Decide", outcome: "Use adoption conditions, the mechanism, and hard boundaries to make the first solution decision." },
      { id: "learn", label: "Systematic study", eyebrow: "Build a model", outcome: "Work through the objects, mechanisms, failure modes, engineering controls, and validation experiments." },
      { id: "field", label: "Field lookup", eyebrow: "Bring evidence", outcome: "Answer with questions, evidence, and responsibility checks while stating the source and scope." },
    ],
    readingTask: "Current reading task",
    readingModes: "Reading modes",
    boundaryAria: "Critical boundary",
    boundaryLabel: "Production hard boundary",
    entries: (count) => `${count} ${count === 1 ? "entry" : "entries"}`,
    directory: (moduleName, modeLabel) => `${moduleName} ${modeLabel} directory`,
    experience: (moduleName) => `${moduleName} reading modes`,
  },
};

type ModeMap<T> = Partial<Record<ReadingModeId, T>>;

function modeForHash(
  hash: string,
  hashGroups: ModeMap<readonly string[]> | undefined,
  directories: ModeMap<readonly DenseChapterLink[]>,
  readingModeIds: readonly ReadingModeId[],
) {
  const target = hash.replace(/^#/, "");
  if (!target) return null;

  for (const modeId of readingModeIds) {
    if (hashGroups?.[modeId]?.includes(target)) return modeId;
    if (directories[modeId]?.some((item) => item.id === target)) return modeId;
  }

  const containingPanel = typeof document === "undefined"
    ? null
    : document.getElementById(target)?.closest<HTMLElement>("[data-reading-mode]")?.dataset.readingMode;
  if (containingPanel && readingModeIds.includes(containingPanel)) return containingPanel;

  return target.startsWith("qa-") && readingModeIds.includes("field") ? "field" : null;
}

function directoryAnchorForTarget(
  targetId: string,
  modeId: ReadingModeId,
  directories: ModeMap<readonly DenseChapterLink[]>,
) {
  const directoryIds = new Set((directories[modeId] ?? []).map((item) => item.id));
  if (directoryIds.has(targetId)) return targetId;
  if (typeof document === "undefined") return undefined;

  let current: HTMLElement | null = document.getElementById(targetId);
  while (current) {
    if (current.id && directoryIds.has(current.id)) return current.id;
    current = current.parentElement;
  }
  return undefined;
}

function scrollHashTargetIntoView(hash: string) {
  const targetId = hash.replace(/^#/, "");
  const revealTarget = () => {
    const target = document.getElementById(targetId);
    if (!target) return;
    if (target instanceof HTMLDetailsElement) target.open = true;
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    target.scrollIntoView({ block: "start" });
    root.style.scrollBehavior = previousBehavior;
  };
  revealTarget();
  window.requestAnimationFrame(() => {
    revealTarget();
    window.requestAnimationFrame(revealTarget);
  });
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
  modeDefinitions,
  modePanels,
  defaultMode = "quick",
  hashGroups,
  criticalBoundary,
  readerId = "module-reading",
  modeDescriptions,
  locale = "zh-CN",
}: {
  moduleName: string;
  chapters: readonly DenseChapterLink[];
  directories?: ModeMap<readonly DenseChapterLink[]>;
  quick?: ReactNode;
  learn?: ReactNode;
  field?: ReactNode;
  /**
   * A module may declare only the reading tasks that make its argument more
   * usable. Omitting this keeps the established three-task preset.
   */
  modeDefinitions?: readonly DenseReadingMode[];
  /** Content keyed by the declared task IDs when a module uses a custom set. */
  modePanels?: ModeMap<ReactNode>;
  defaultMode?: ReadingModeId;
  hashGroups?: ModeMap<readonly string[]>;
  criticalBoundary?: string;
  readerId?: string;
  modeDescriptions?: ModeMap<string>;
  locale?: UnifiedModuleLocale;
}) {
  const copy = readerCopyByLocale[locale];
  const readingModes = useMemo(() => modeDefinitions?.length ? modeDefinitions : copy.modes, [copy.modes, modeDefinitions]);
  const firstReadingMode = readingModes[0];
  if (!firstReadingMode) throw new Error("A module reader needs at least one declared reading task.");
  const modeIds = useMemo(() => readingModes.map((mode) => mode.id), [readingModes]);
  if (new Set(modeIds).size !== modeIds.length) throw new Error("A module reader cannot reuse a reading-task ID.");
  const resolvedDefaultMode = modeIds.includes(defaultMode) ? defaultMode : firstReadingMode.id;
  const [requestedMode, setActiveMode] = useState<ReadingModeId>(resolvedDefaultMode);
  // The server render is the no-JavaScript reading path: it carries only the
  // default reading task. The other tasks mount on first selection (or on a
  // deep link into their content) and stay mounted afterwards, so switching
  // keeps their scroll and interaction state.
  const [mountedModes, setMountedModes] = useState<readonly ReadingModeId[]>(() => [resolvedDefaultMode]);
  const [activeAnchor, setActiveAnchor] = useState<string | undefined>();
  const [pendingHashReveal, setPendingHashReveal] = useState<{
    hash: string;
    mode: ReadingModeId;
    requestId: number;
  } | null>(null);
  const tabsId = useId();
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const hashRevealRequestRef = useRef(0);
  const directoryByMode = useMemo<ModeMap<readonly DenseChapterLink[]>>(() => Object.fromEntries(
    readingModes.map((mode) => [mode.id, directories?.[mode.id] ?? chapters]),
  ), [chapters, directories, readingModes]);
  // A reader may receive a revised task declaration during client navigation.
  // Keep the requested choice in state, but always render a declared task;
  // this avoids a corrective effect (and a transient empty tab state).
  const activeMode = modeIds.includes(requestedMode) ? requestedMode : resolvedDefaultMode;
  const activeDefinition = readingModes.find((mode) => mode.id === activeMode) ?? firstReadingMode;
  const activeDirectory = directoryByMode[activeMode] ?? chapters;
  const displayedActiveAnchor = activeDirectory.some((item) => item.id === activeAnchor) ? activeAnchor : activeDirectory[0]?.id;

  if (!mountedModes.includes(activeMode)) {
    // Adjusting state during render mounts the requested panel in the same
    // commit that activates it, so a hash reveal can scroll it immediately
    // instead of waiting for a follow-up effect round.
    setMountedModes((current) => [...current, activeMode]);
  }

  const revealHash = useCallback((hash: string) => {
    if (!hash.replace(/^#/, "")) {
      setActiveMode(resolvedDefaultMode);
      setActiveAnchor(undefined);
      setPendingHashReveal(null);
      return;
    }
    const nextMode = modeForHash(hash, hashGroups, directoryByMode, modeIds);
    if (!nextMode) {
      setPendingHashReveal(null);
      return;
    }
    const targetId = hash.replace(/^#/, "");
    setActiveMode(nextMode);
    setActiveAnchor(directoryAnchorForTarget(targetId, nextMode, directoryByMode) ?? targetId);
    setPendingHashReveal({
      hash,
      mode: nextMode,
      requestId: ++hashRevealRequestRef.current,
    });
  }, [directoryByMode, hashGroups, modeIds, resolvedDefaultMode]);

  useEffect(() => {
    const handleHashChange = () => revealHash(window.location.hash);
    const handleDocumentClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (
        event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
        || anchor?.target === "_blank"
        || !anchor?.hash
        || !modeForHash(anchor.hash, hashGroups, directoryByMode, modeIds)
      ) return;
      event.preventDefault();
      if (window.location.hash !== anchor.hash) {
        window.history.pushState(window.history.state, "", `${window.location.pathname}${window.location.search}${anchor.hash}`);
      }
      revealHash(anchor.hash);
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleDocumentClick);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [directoryByMode, hashGroups, modeIds, revealHash]);

  useEffect(() => {
    if (!pendingHashReveal || pendingHashReveal.mode !== activeMode) return;
    const { hash, requestId } = pendingHashReveal;
    scrollHashTargetIntoView(hash);
    window.queueMicrotask(() => {
      setPendingHashReveal((current) => current?.requestId === requestId ? null : current);
    });
  }, [activeMode, pendingHashReveal]);

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
    if (window.location.hash) window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
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

  const panels: ModeMap<ReactNode> = modePanels ?? { quick, learn, field };
  const missingPanelIds = readingModes
    .filter((mode) => !Object.prototype.hasOwnProperty.call(panels, mode.id) || panels[mode.id] === undefined)
    .map((mode) => mode.id);
  if (missingPanelIds.length) throw new Error(`A module reader is missing content for: ${missingPanelIds.join(", ")}`);
  const currentOutcome = modeDescriptions?.[activeMode] ?? activeDefinition.outcome;

  return (
    <section
      aria-label={copy.experience(moduleName)}
      className="moduleReadingExperience"
      data-module-reader="unified"
      id={readerId}
    >
      <header className={`moduleModeHeader ${styles.modeHeader}`}>
        <div className={styles.modePrompt}>
          <span>{copy.readingTask}</span>
          <strong>{moduleName}</strong>
        </div>
        <div className="moduleModeTabs" role="tablist" aria-label={copy.readingModes}>
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
        <aside className={styles.boundary} aria-label={copy.boundaryAria} data-importance="critical">
          <strong>{copy.boundaryLabel}</strong><p>{criticalBoundary}</p>
        </aside>
      ) : null}

      <details className={styles.mobileDirectory}>
        <summary>{activeDefinition.label}: {copy.entries(activeDirectory.length)}</summary>
        <nav aria-label={copy.directory(moduleName, activeDefinition.label)}><DirectoryList activeId={displayedActiveAnchor} items={activeDirectory} /></nav>
        <p>{currentOutcome}</p>
      </details>

      <div className={`moduleModeWorkspace ${styles.workspace}`}>
        <aside className={styles.directory} aria-label={copy.directory(moduleName, activeDefinition.label)}>
          <header><span>{copy.entries(activeDirectory.length)}</span><strong>{activeDefinition.label}</strong></header>
          <nav><DirectoryList activeId={displayedActiveAnchor} items={activeDirectory} /></nav>
          <footer aria-live="polite"><span>{activeDefinition.eyebrow}</span><p>{currentOutcome}</p></footer>
        </aside>

        <div className={`moduleModePanels ${styles.panels}`}>
          {readingModes.filter((mode) => mountedModes.includes(mode.id)).map((mode) => (
            <div
              aria-labelledby={`${tabsId}-${mode.id}-tab`}
              className={`moduleModePanel moduleModePanel--${mode.id} ${styles.panel}`}
              hidden={activeMode !== mode.id}
              id={`${tabsId}-${mode.id}`}
              key={mode.id}
              role="tabpanel"
              data-reading-mode={mode.id}
              tabIndex={0}
            >
              <Suspense fallback={null}>{panels[mode.id]}</Suspense>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
