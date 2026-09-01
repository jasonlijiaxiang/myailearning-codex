import type { ReactNode } from "react";

import {
  DenseModuleReadingModes,
  type DenseChapterLink,
  type DenseReadingMode,
  type ReadingModeId,
} from "./dense-module-reading-modes";
import { UnifiedModuleScaffold, type UnifiedModuleHeroProps } from "./unified-module-hero";

/**
 * A directory reflects the tasks a module actually needs to support. The
 * familiar quick / learn / field keys are a reusable preset, not a contract
 * that every future module has to fill.
 */
export type DirectorySet = Partial<Record<ReadingModeId, readonly DenseChapterLink[]>>;

export function buildBriefModuleDirectories({
  hasDeepDives,
  mechanismId = "principle",
  primer,
}: {
  hasDeepDives: boolean;
  mechanismId?: string;
  primer?: DenseChapterLink;
}): DirectorySet {
  return {
    quick: [
      ...(primer ? [primer] : []),
      { id: "decisions", label: "方案判断", eyebrow: "明确责任转交" },
    ],
    learn: [
      { id: mechanismId, label: "工作机制", eyebrow: "建立工作模型" },
      { id: "curriculum", label: "主题地图", eyebrow: "解释判断与边界" },
      { id: "study-guide", label: "可复核练习", eyebrow: "形成评审产物" },
      ...(hasDeepDives ? [{ id: "deep-dive", label: "工程深挖", eyebrow: "定位失败与边界" }] : []),
    ],
    field: [
      { id: "evidence", label: "证据与边界", eyebrow: "说明来源能证明什么" },
      { id: "cloud", label: "云能力与责任", eyebrow: "连接交付与验收" },
      { id: "qa", label: "客户问题", eyebrow: "带边界回答" },
      { id: "related-modules", label: "相关模块", eyebrow: "查看上下游主题" },
    ],
  };
}

export function UnifiedBriefModulePage({
  className,
  contentAriaLabel,
  criticalBoundary,
  defaultMode,
  directories,
  field,
  footer,
  hashGroups,
  hero,
  learn,
  modeDefinitions,
  modePanels,
  moduleName,
  quick,
}: {
  className: string;
  contentAriaLabel: string;
  criticalBoundary: string;
  directories: DirectorySet;
  defaultMode?: ReadingModeId;
  field?: ReactNode;
  footer: ReactNode;
  hashGroups?: Partial<Record<ReadingModeId, readonly string[]>>;
  hero: UnifiedModuleHeroProps;
  learn?: ReactNode;
  modeDefinitions?: readonly DenseReadingMode[];
  modePanels?: Partial<Record<ReadingModeId, ReactNode>>;
  moduleName: string;
  quick?: ReactNode;
}) {
  const chapters = Object.values(directories).flatMap((directory) => directory ?? []);

  return (
    <UnifiedModuleScaffold className={className} hero={hero}>
      <div className="dedicatedArticleLayout moduleReadingHost">
        <section className="section" aria-label={contentAriaLabel}>
          <div className="sectionNumber">02</div>
          <div className="sectionBody">
            <DenseModuleReadingModes
              chapters={chapters}
              criticalBoundary={criticalBoundary}
              defaultMode={defaultMode}
              directories={directories}
              field={field}
              hashGroups={hashGroups}
              learn={learn}
              modeDefinitions={modeDefinitions}
              modePanels={modePanels}
              moduleName={moduleName}
              quick={quick}
              readerId="module-reading"
            />
          </div>
        </section>
      </div>
      {footer}
    </UnifiedModuleScaffold>
  );
}
