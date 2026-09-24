/** @param {string} slug @param {number} index @param {string} chapterEnglishTitle */
export function curriculumChapterAnchor(slug, index, chapterEnglishTitle) {
  if (slug === "mcp") return `mcp-chapter-${index + 1}`;
  if (slug === "llm-inference") {
    const topic = chapterEnglishTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `inference-topic-${topic || "untitled"}`;
  }
  return `curriculum-${slug}-${index + 1}`;
}

/** @param {string} slug @param {number} index */
export function learningLabAnchor(slug, index) {
  return `lab-${slug}-${index + 1}`;
}
