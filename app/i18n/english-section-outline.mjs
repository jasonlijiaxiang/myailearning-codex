import { publishedModules } from "../module-publication.mjs";
import { moduleManifests } from "../modules/index.mjs";

// 英文统一 reader 的“自撰分组/共享分组”跟随英文内容形态：没有 brief 的模块
// 拥有完整自撰分组。mcp、a2a、llm-inference 的中文路由虽然改为 dedicated，
// 其英文内容仍是共享分组形态，因此这里按“是否有 brief”而不是中文 routeKind 判断。
const englishAuthoredModuleSlugs = Object.freeze(
  moduleManifests.filter((manifest) => !manifest.brief).map((manifest) => manifest.slug),
);

export const sharedSectionRoles = Object.freeze({
  learning: Object.freeze({ id: "study-guide", label: "Learning & practice", eyebrow: "Know how to master it" }),
  curriculum: Object.freeze({ id: "curriculum", label: "Curriculum map", eyebrow: "Complete the knowledge map" }),
  principle: Object.freeze({ id: "principle", label: "Core mechanisms", eyebrow: "Understand why it works" }),
  decision: Object.freeze({ id: "decisions", label: "Solution choices", eyebrow: "Compare real constraints" }),
  deep: Object.freeze({ id: "deep-dive", label: "Production deep dive", eyebrow: "Production judgment" }),
  cloud: Object.freeze({ id: "cloud", label: "Cloud connections", eyebrow: "Map to available services" }),
});

const focusedEnglishModuleSlugs = Object.freeze(
  publishedModules.filter((module) => module.readingProfile === "focused").map((module) => module.slug),
);

// Kept for the English module pages: the legacy branch still renders the full
// authored selection for modules without a unified reader config.
/** @param {any} module */
export function selectVisibleEnglishSectionGroups(module, sectionGroups = buildEnglishSectionGroups(module)) {
  return sectionGroups;
}

/** @param {any} module */
export function selectVisibleEnglishEvidenceCards(module) {
  return module.evidenceCards;
}

/** @param {any} module */
export function selectVisibleEnglishQuestions(module) {
  return module.qa;
}

/** @param {any} module */
export function usesFocusedEnglishPreview(module) {
  return focusedEnglishModuleSlugs.includes(module.slug) && !englishAuthoredModuleSlugs.includes(module.slug);
}

/** @param {any} section */
export function classifySharedSection(section) {
  if (/(?:study-guide|study|practice|learning-studio)/.test(section.id)) return "learning";
  if (/(?:curriculum|course-map)/.test(section.id)) return "curriculum";
  if (/(?:decision|choice|when-to-use)/.test(section.id)) return "decision";
  if (/cloud/.test(section.id)) return "cloud";
  if (/(?:principle|protocol-model|operating-model|flywheel|model-lifecycle|tuning-lifecycle|policy-data-plane|threat-path|selection-coordinate|decision-blueprint|concept-map|collaboration-model)/.test(section.id)) return "principle";
  return "deep";
}

/** @param {any} module */
export function buildEnglishSectionGroups(module) {
  if (englishAuthoredModuleSlugs.includes(module.slug)) {
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
    const sharedRole = sharedSectionRoles[role];
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

