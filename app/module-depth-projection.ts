import { moduleDepthContent } from "./module-depth-content.mjs";
import { sourceLedger } from "./reference-content.mjs";
import type { DepthStudyContent } from "./module-depth-study";

export function getModuleDepthStudy(slug: string): DepthStudyContent | undefined {
  const study = (moduleDepthContent as Record<string, Omit<DepthStudyContent, "sourceLinks"> & { sourceIds: string[] }>)[slug];
  if (!study) return undefined;
  return { ...study, sourceLinks: study.sourceIds.map((id) => {
    const source = sourceLedger[id];
    if (!source) throw new Error(`Missing depth-study source: ${id}`);
    return { id, label: source.shortTitle };
  }) };
}
