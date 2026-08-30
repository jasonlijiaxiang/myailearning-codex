import type { ReactNode } from "react";

import { DenseModuleReadingModes, type DenseChapterLink } from "./dense-module-reading-modes";
import { UnifiedModuleScaffold, type UnifiedModuleHeroProps } from "./unified-module-hero";

type DirectorySet = {
  quick: readonly DenseChapterLink[];
  learn: readonly DenseChapterLink[];
  field: readonly DenseChapterLink[];
};

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
