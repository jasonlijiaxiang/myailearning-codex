// Search is a discovery surface, not a lesson plan.  Do not make a question,
// lab, or mechanism disappear merely because its module uses a focused reader.
export function searchableQuestions(_slug, questions, _locale = "zh") {
  return questions;
}

export function exposesLongFormSearchSections(_slug) {
  return true;
}

export function searchableEnglishSectionGroups(_slug, groups) {
  return groups;
}
