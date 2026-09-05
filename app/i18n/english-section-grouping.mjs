// Leaf grouping module for the English reader: pure functions over a module's
// authored sections. No registry imports so client panels can bundle it without
// pulling the whole English content library.
export const sharedSectionRoles = Object.freeze({
  learning: Object.freeze({ id: "study-guide", label: "Learning & practice", eyebrow: "Know how to master it" }),
  curriculum: Object.freeze({ id: "curriculum", label: "Curriculum map", eyebrow: "Complete the knowledge map" }),
  principle: Object.freeze({ id: "principle", label: "Core mechanisms", eyebrow: "Understand why it works" }),
  decision: Object.freeze({ id: "decisions", label: "Solution choices", eyebrow: "Compare real constraints" }),
  deep: Object.freeze({ id: "deep-dive", label: "Production deep dive", eyebrow: "Production judgment" }),
  cloud: Object.freeze({ id: "cloud", label: "Cloud connections", eyebrow: "Map to available services" }),
});

/** @param {any} section */
export function classifySharedSection(section) {
  if (/(?:study-guide|study|practice|learning-studio)/.test(section.id)) return "learning";
  if (/(?:curriculum|course-map)/.test(section.id)) return "curriculum";
  if (/(?:decision|choice|when-to-use)/.test(section.id)) return "decision";
  if (/cloud/.test(section.id)) return "cloud";
  if (/(?:principle|protocol-model|operating-model|flywheel|model-lifecycle|tuning-lifecycle|policy-data-plane|threat-path|selection-coordinate|decision-blueprint|concept-map|collaboration-model)/.test(section.id)) return "principle";
  return "deep";
}

/**
 * @param {any} module
 * @param {boolean} authored
 */
export function buildEnglishSectionGroups(module, authored) {
  if (authored) {
    return /** @type {any[]} */ (module.sections).map((section) => ({
      role: "authored",
      id: section.id,
      label: section.title,
      eyebrow: section.eyebrow,
      sections: [section],
    }));
  }

  /** @type {any[]} */
  const grouped = [];
  for (const section of module.sections) {
    const role = classifySharedSection(section);
    const previous = grouped.at(-1);
    if (previous?.role === role) {
      previous.sections.push(section);
      continue;
    }
    const sharedRole = sharedSectionRoles[/** @type {keyof typeof sharedSectionRoles} */ (role)];
    grouped.push({
      role,
      label: sharedRole.label,
      eyebrow: sharedRole.eyebrow,
      sections: [section],
    });
  }

  // A role anchor may be safely owned by a group only when an authored
  // section outside that group does not already use it. This preserves an
  // authored section's public anchor while still letting a same-group section
  // be represented by the outer group container.
  const authoredSectionIds = new Set(/** @type {any[]} */ (module.sections).map((section) => section.id));
  const allocatedIds = new Set();
  return grouped.map((group) => {
    const ownSectionIds = new Set(/** @type {any[]} */ (group.sections).map((section) => section.id));
    const baseId = /** @type {any} */ (sharedSectionRoles[/** @type {keyof typeof sharedSectionRoles} */ (group.role)]).id;
    let suffix = 1;
    let id = baseId;
    while (
      allocatedIds.has(id)
      || (authoredSectionIds.has(id) && !ownSectionIds.has(id))
    ) {
      suffix += 1;
      id = `${baseId}-${suffix}`;
    }
    allocatedIds.add(id);
    return {
      ...group,
      id,
      label: group.role === "deep" && group.sections.length === 1 ? group.sections[0].title : group.label,
    };
  });
}
