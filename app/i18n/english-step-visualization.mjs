// Leaf decision module: whether an English steps block should visualize as an
// interactive relationship view. No registry imports so client panels can
// bundle it without pulling the whole English content library.
const nonVisualStepSectionPattern = /(?:study-guide|practice|learning-studio|concept-map)$/;
const nonVisualStepTitlePattern = /(?:recommended (?:learning )?route|how to use|worked example|operating principles)$/i;
const relationshipStepSectionPattern = /(?:deep-dive|production|architecture|operating-model|runtime|pipeline|lifecycle|task-lifecycle|trust-chain|delivery-chain|context-assembly|tool-contracts|release-governance|flywheel|assurance-loop|threat-path|policy-data-plane|independent-depth)$/;
const relationshipStepTitlePattern = /(?:pipeline|lifecycle|chain|loop|sequence|transitions|action path|context manifest|control points|control gates|trust boundaries)$/i;

/**
 * @param {string} sectionId
 * @param {any} block
 */
export function shouldVisualizeEnglishSteps(sectionId, block) {
  if (nonVisualStepSectionPattern.test(sectionId) || nonVisualStepTitlePattern.test(block.title ?? "")) return false;
  return relationshipStepSectionPattern.test(sectionId) || relationshipStepTitlePattern.test(block.title ?? "");
}
