import type { ReactNode } from "react";

import { DenseModuleReadingModes, type DenseChapterLink } from "./dense-module-reading-modes";
import { UnifiedModuleScaffold, type UnifiedModuleHeroProps } from "./unified-module-hero";

type DirectorySet = {
  quick: readonly DenseChapterLink[];
  learn: readonly DenseChapterLink[];
  field: readonly DenseChapterLink[];
};

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
      { id: mechanismId, label: "机制速览", eyebrow: "建立工作模型" },
      { id: "study-guide", label: "学习与练习", eyebrow: "形成可复核产物" },
      { id: "curriculum", label: "知识地图", eyebrow: "补齐理论版图" },
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
  directories,
  field,
  footer,
  hero,
  learn,
  moduleName,
  quick,
}: {
  className: string;
  contentAriaLabel: string;
  criticalBoundary: string;
  directories: DirectorySet;
  field: ReactNode;
  footer: ReactNode;
  hero: UnifiedModuleHeroProps;
  learn: ReactNode;
  moduleName: string;
  quick: ReactNode;
}) {
  const chapters = [...directories.quick, ...directories.learn, ...directories.field];

  return (
    <UnifiedModuleScaffold className={className} hero={hero}>
      <div className="dedicatedArticleLayout moduleReadingHost">
        <section className="section" aria-label={contentAriaLabel}>
          <div className="sectionNumber">02</div>
          <div className="sectionBody">
            <DenseModuleReadingModes
              chapters={chapters}
              criticalBoundary={criticalBoundary}
              directories={directories}
              field={field}
              learn={learn}
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
