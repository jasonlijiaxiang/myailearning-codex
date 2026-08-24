"use client";

import { type KeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";

type ReadingModeId = "quick" | "learn" | "field";

type ModeDefinition = {
  id: ReadingModeId;
  label: string;
  eyebrow: string;
  description: string;
  outcome: string;
};

const readingModes: ModeDefinition[] = [
  {
    id: "quick",
    label: "10 分钟速查",
    eyebrow: "抓住主线",
    description: "会前快速确认工作机制、选型条件和主要约束。",
    outcome: "可以用客户语言解释机制，并指出下一步要核实的条件",
  },
  {
    id: "learn",
    label: "系统学习",
    eyebrow: "完成练习",
    description: "按路线完成章节、实验和工程细节，并留下可复核的产物。",
    outcome: "完成路线中的检查点，产物可由同事复跑或复核",
  },
  {
    id: "field",
    label: "现场查证",
    eyebrow: "带来源回答",
    description: "集中查证据、责任边界和客户问题，供会前准备或会中核对。",
    outcome: "回答包含依据、适用范围，以及一个需要客户确认的问题",
  },
];

const defaultHashGroups: Record<ReadingModeId, Set<string>> = {
  quick: new Set(["fit", "principle", "mechanism-summary", "decisions", "architecture", "agent-principle"]),
  learn: new Set([
    "study-guide",
    "curriculum",
    "deep-dive",
    "prompt-foundation",
    "prompt-techniques",
    "prompt-diagnostics",
    "memory-interaction",
    "evidence-contract",
    "model-selection",
  ]),
  field: new Set([
    "evidence",
    "cloud",
    "qa",
    "related-modules",
    "poc",
    "production",
    "version-governance",
  ]),
};

function modeForHash(hash: string, hashGroups?: Partial<Record<ReadingModeId, string[]>>) {
  const target = hash.replace(/^#/, "");
  if (!target) return null;

  for (const mode of readingModes) {
    if (hashGroups?.[mode.id]?.includes(target)) return mode.id;
  }
  for (const mode of readingModes) {
    if (defaultHashGroups[mode.id].has(target)) return mode.id;
  }
  return target.startsWith("qa-") ? "field" : null;
}

export function ModuleReadingModes({
  moduleName,
  quick,
  learn,
  field,
  defaultMode = "quick",
  hashGroups,
}: {
  moduleName: string;
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
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById(hash.replace(/^#/, ""))?.scrollIntoView({ block: "start" });
      });
    });
  }, [hashGroups]);

  useEffect(() => {
    const handleHashChange = () => revealHash(window.location.hash);
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [revealHash]);

  function revealLinkedSection(event: ReactMouseEvent<HTMLElement>) {
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor) return;
    revealHash(anchor.hash);
  }

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + readingModes.length) % readingModes.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % readingModes.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = readingModes.length - 1;
    const nextMode = readingModes[nextIndex];
    setActiveMode(nextMode.id);
    tabsRef.current[nextIndex]?.focus();
  }

  const panels: Record<ReadingModeId, ReactNode> = { quick, learn, field };

  return (
    <section className="moduleReadingExperience" id="module-reading" aria-label={`${moduleName}阅读方式`} onClickCapture={revealLinkedSection}>
      <header className="moduleModeHeader">
        <div>
          <span>选择当前任务</span>
          <strong>{moduleName}</strong>
        </div>
        <div className="moduleModeTabs" role="tablist" aria-label="阅读方式">
          {readingModes.map((mode, index) => (
            <button
              aria-controls={`${tabsId}-${mode.id}`}
              aria-selected={activeMode === mode.id}
              id={`${tabsId}-${mode.id}-tab`}
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
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

      <div className="moduleModeWorkspace">
        <aside className="moduleModeGuide" aria-live="polite">
          <span>当前视图</span>
          <h2>{activeDefinition.label}</h2>
          <p>{activeDefinition.description}</p>
          <dl>
            <div><dt>适用任务</dt><dd>{activeMode === "quick" ? "初次进入、会前热身" : activeMode === "learn" ? "系统补课、方案复盘" : "客户现场、证据核对"}</dd></div>
            <div><dt>完成条件</dt><dd>{activeDefinition.outcome}</dd></div>
          </dl>
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
