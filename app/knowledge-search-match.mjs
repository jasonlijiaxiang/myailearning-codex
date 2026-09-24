// 首页搜索允许读者输入完整问题，也保留术语和型号的精确匹配。
const stopWords = new Set([
  "如何", "怎么", "怎样", "为什么", "什么", "是否", "能否", "可以", "应该", "需要", "哪些", "哪个", "只让",
  "the", "and", "for", "from", "with", "what", "when", "where", "which", "how", "does", "can", "should", "that", "this", "are", "you", "your", "use", "using", "who", "why", "do", "is", "in", "to", "of", "my",
]);

/** @type {Map<string, Intl.Segmenter>} */
const wordSegmenters = new Map();

/** @param {string} value @param {string} locale */
function normalize(value, locale) {
  return value.normalize("NFKC").toLocaleLowerCase(locale).trim();
}

/** @param {string} query @param {string} locale */
function queryTerms(query, locale) {
  let segmenter = wordSegmenters.get(locale);
  if (!segmenter) {
    segmenter = new Intl.Segmenter(locale, { granularity: "word" });
    wordSegmenters.set(locale, segmenter);
  }
  const segments = segmenter.segment(query);
  const terms = [];
  let singleHan = "";

  for (const part of segments) {
    if (!part.isWordLike) continue;
    const word = normalize(part.segment, locale);
    if (/^\p{Script=Han}$/u.test(word)) {
      // 中文分词器偶尔把一个普通词拆为两个字，例如「文」「档」。
      if (word !== "的" && word !== "了" && word !== "有") {
        if (singleHan) terms.push(`${singleHan}${word}`);
        singleHan = word;
      } else {
        singleHan = "";
      }
      continue;
    }
    singleHan = "";
    if (word.length < 2 || stopWords.has(word)) continue;
    terms.push(word);
  }

  return [...new Set(terms)];
}

/**
 * @template T
 * @param {readonly T[]} entries
 * @param {string} query
 * @param {string} locale
 * @param {(entry: T) => {title: string; subtitle?: string; keywords?: string}} fields
 * @returns {T[]}
 */
export function rankKnowledgeSearch(entries, query, locale, fields) {
  const phrase = normalize(query, locale);
  if (!phrase) return [...entries];
  const terms = queryTerms(query, locale);
  const requiredHits = terms.length > 1 ? Math.max(2, Math.ceil(terms.length / 2)) : 1;

  return entries.map((entry, index) => {
    const value = fields(entry);
    const title = normalize(value.title, locale);
    const subtitle = normalize(value.subtitle ?? "", locale);
    const keywords = normalize(value.keywords ?? "", locale);
    const fullPhraseMatch = title.includes(phrase) || subtitle.includes(phrase) || keywords.includes(phrase);
    let hits = 0;
    let score = title.includes(phrase) ? 100 : fullPhraseMatch ? 50 : 0;

    for (const term of terms) {
      if (title.includes(term)) { hits += 1; score += 8; }
      else if (subtitle.includes(term)) { hits += 1; score += 3; }
      else if (keywords.includes(term)) { hits += 1; score += 1; }
    }

    return { entry, index, score, matches: fullPhraseMatch || (hits >= requiredHits && terms.length > 0) };
  }).filter((item) => item.matches)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((item) => item.entry);
}
