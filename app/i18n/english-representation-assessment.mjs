import { englishModuleRegistry } from "./en/registry.mjs";

const nonVisualStepSectionPattern = /(?:study-guide|practice|learning-studio|concept-map)$/;
const nonVisualStepTitlePattern = /(?:recommended (?:learning )?route|how to use|worked example|operating principles)$/i;
const relationshipStepSectionPattern = /(?:deep-dive|production|architecture|operating-model|runtime|pipeline|lifecycle|task-lifecycle|trust-chain|delivery-chain|context-assembly|tool-contracts|release-governance|flywheel|assurance-loop|threat-path|policy-data-plane|independent-depth)$/;
const relationshipStepTitlePattern = /(?:pipeline|lifecycle|chain|loop|sequence|transitions|action path|context manifest|control points|control gates|trust boundaries)$/i;

export function shouldVisualizeEnglishSteps(sectionId, block) {
  if (nonVisualStepSectionPattern.test(sectionId) || nonVisualStepTitlePattern.test(block.title ?? "")) return false;
  return relationshipStepSectionPattern.test(sectionId) || relationshipStepTitlePattern.test(block.title ?? "");
}

function assessBlock(sectionId, block, index) {
  if (block.type === "steps") {
    const visual = shouldVisualizeEnglishSteps(sectionId, block);
    return Object.freeze({
      id: `${sectionId}-${index}`,
      type: block.type,
      title: block.title ?? null,
      representation: visual ? "interactive-flow" : "editorial-steps",
      visual,
    });
  }

  const representationByType = {
    table: "comparison-table",
    boundary: "critical-boundary",
    cards: "editorial-cards",
  };
  const representation = representationByType[block.type];
  if (!representation) throw new Error(`Unknown English content block type: ${block.type}`);
  return Object.freeze({
    id: `${sectionId}-${index}`,
    type: block.type,
    title: block.title ?? null,
    representation,
    visual: false,
  });
}

export const englishRepresentationAssessment = Object.freeze(Object.fromEntries(
  Object.values(englishModuleRegistry).map((module) => {
    const blocks = module.sections.flatMap((section) =>
      section.blocks.map((block, index) => assessBlock(section.id, block, index)),
    );
    return [module.slug, Object.freeze({
      slug: module.slug,
      blocks: Object.freeze(blocks),
      visualStepCount: blocks.filter((block) => block.visual).length,
    })];
  }),
));

export function requireEnglishRepresentationAssessment(slug) {
  const assessment = englishRepresentationAssessment[slug];
  if (!assessment) throw new Error(`Unknown English representation assessment: ${slug}`);
  return assessment;
}
