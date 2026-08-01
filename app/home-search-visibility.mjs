import { getPublishedModule } from "./module-publication.mjs";

export const focusedQuestionPreviewCount = 5;

export function hasFocusedSearchProfile(slug) {
  return getPublishedModule(slug)?.readingProfile === "focused";
}

export function searchableQuestions(slug, questions, locale = "zh") {
  const publication = getPublishedModule(slug);
  const usesFocusedBriefRoute = publication?.readingProfile === "focused" && (locale === "en" || publication.routeKind === "brief");
  return usesFocusedBriefRoute ? questions.slice(0, focusedQuestionPreviewCount) : questions;
}

export function exposesLongFormSearchSections(slug) {
  return !hasFocusedSearchProfile(slug);
}

export function searchableEnglishSectionGroups(slug, groups) {
  return hasFocusedSearchProfile(slug) ? groups.filter((group) => ["decision", "deep"].includes(group.role)) : groups;
}
