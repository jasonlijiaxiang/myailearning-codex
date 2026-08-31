import { hasDedicatedModule, publishedModules } from "../module-publication.mjs";

export const sharedSectionRoles = Object.freeze({
  learning: Object.freeze({ id: "study-guide", label: "Learning & practice", eyebrow: "Know how to master it" }),
  curriculum: Object.freeze({ id: "curriculum", label: "Curriculum map", eyebrow: "Complete the knowledge map" }),
  principle: Object.freeze({ id: "principle", label: "Core mechanisms", eyebrow: "Understand why it works" }),
  decision: Object.freeze({ id: "decisions", label: "Solution choices", eyebrow: "Compare real constraints" }),
  deep: Object.freeze({ id: "deep-dive", label: "Production deep dive", eyebrow: "Production judgment" }),
  cloud: Object.freeze({ id: "cloud", label: "Cloud connections", eyebrow: "Map to available services" }),
});

export const sharedSectionRoleOrder = Object.freeze(["learning", "curriculum", "principle", "decision", "deep", "cloud"]);
// Kept as a public compatibility export. A focused visual treatment must not
// silently become a content projection that drops the learning map.
export const focusedSectionRoleOrder = sharedSectionRoleOrder;
export const focusedEnglishModuleSlugs = Object.freeze(
  publishedModules.filter((module) => module.readingProfile === "focused").map((module) => module.slug),
);

export function usesFocusedEnglishPreview(module) {
  return focusedEnglishModuleSlugs.includes(module.slug) && !hasDedicatedModule(module.slug);
}

export function classifySharedSection(section) {
  if (/(?:study-guide|study|practice|learning-studio)/.test(section.id)) return "learning";
  if (/(?:curriculum|course-map)/.test(section.id)) return "curriculum";
  if (/(?:decision|choice|when-to-use)/.test(section.id)) return "decision";
  if (/cloud/.test(section.id)) return "cloud";
  if (/(?:principle|protocol-model|operating-model|flywheel|model-lifecycle|tuning-lifecycle|policy-data-plane|threat-path|selection-coordinate|decision-blueprint|concept-map|collaboration-model)/.test(section.id)) return "principle";
  return "deep";
}

export function buildEnglishSectionGroups(module, { completeFocusedProjection = false } = {}) {
  if (hasDedicatedModule(module.slug)) {
    return module.sections.map((section) => ({
      role: "authored",
      id: section.id,
      label: section.title,
      eyebrow: section.eyebrow,
      sections: [section],
    }));
  }

  const grouped = new Map();
  for (const section of module.sections) {
    const role = classifySharedSection(section);
    grouped.set(role, [...(grouped.get(role) ?? []), section]);
  }

  const roleOrder = sharedSectionRoleOrder;
  return roleOrder.flatMap((role) => {
    const sections = grouped.get(role);
    if (!sections?.length) return [];
    const sharedRole = sharedSectionRoles[role];
    return [{
      role,
      ...sharedRole,
      label: role === "deep" && sections.length === 1 ? sections[0].title : sharedRole.label,
      sections,
    }];
  });
}

export function selectVisibleEnglishSectionGroups(module, sectionGroups = buildEnglishSectionGroups(module)) {
  return sectionGroups;
}

export function selectVisibleEnglishEvidenceCards(module) {
  return module.evidenceCards;
}

export function selectVisibleEnglishQuestions(module) {
  return module.qa;
}
