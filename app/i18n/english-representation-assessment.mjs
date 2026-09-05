import { englishModuleRegistry } from "./en/registry.mjs";
import { shouldVisualizeEnglishSteps } from "./english-step-visualization.mjs";
export { shouldVisualizeEnglishSteps };

/**
 * @param {string} sectionId
 * @param {any} block
 * @param {number} index
 */
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
  const representation = representationByType[/** @type {keyof typeof representationByType} */ (block.type)];
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
    const blocks = /** @type {any[]} */ (module.sections).flatMap((section) =>
      (/** @type {any[]} */ (section.blocks)).map((block, index) => assessBlock(section.id, block, index)),
    );
    return [module.slug, Object.freeze({
      slug: module.slug,
      blocks: Object.freeze(blocks),
      visualStepCount: blocks.filter((block) => block.visual).length,
    })];
  }),
));

/** @param {string} slug */
export function requireEnglishRepresentationAssessment(slug) {
  const assessment = englishRepresentationAssessment[slug];
  if (!assessment) throw new Error(`Unknown English representation assessment: ${slug}`);
  return assessment;
}
