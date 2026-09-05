// 搜索索引：集中构造两个首页与问题查询页的搜索条目。
// 构建时由 scripts/build-search-index.mjs 序列化为 public/search/*.json，
// 页面运行时按需 fetch，不再把整份语料作为 props 内联进 HTML。
import { buildEnglishSectionGroups } from "./i18n/english-section-outline.mjs";
import { englishModuleRegistry, englishQuestions, englishSourceCopy, englishTermCopy } from "./i18n/en/registry.mjs";
import { moduleContentRegistry } from "./module-content-registry.mjs";
import { moduleCurriculumContent } from "./module-curriculum-content.mjs";
import { moduleLearningContent } from "./module-learning-content.mjs";
import { moduleList } from "./knowledge-map.mjs";
import { sourceLedger, referenceModules } from "./reference-content.mjs";
import { terminology } from "./terminology.mjs";
import { questionDirectoryItems } from "./question-index.mjs";

const moduleNames = new Map(moduleList.map((module) => [module.slug, module.zh]));
const sourceModules = new Map();
referenceModules.forEach((module) => module.sourceIds.forEach((sourceId) => {
  sourceModules.set(sourceId, [...(sourceModules.get(sourceId) ?? []), module.zh]);
}));

// 搜索是发现入口而不是课程表：不因模块使用聚焦阅读器而隐藏问题、实验或机制。
// home-search-visibility.mjs 的三个恒等选择器退役后，这里直接保留恒等语义。
function buildChineseEntries() {
  const entries = [];

  for (const [termId, term] of Object.entries(terminology)) {
    const relatedNames = term.moduleSlugs.map((slug) => moduleNames.get(slug)).filter(Boolean);
    entries.push({
      id: `term-${termId}`,
      type: "专业术语",
      title: `${term.zh} · ${term.en}${term.abbr ? `（${term.abbr}）` : ""}`,
      subtitle: `${relatedNames.join(" / ")} · 术语库`,
      href: `/glossary#term-${termId}`,
      keywords: `${term.zh} ${term.en} ${term.abbr ?? ""} ${term.description} ${relatedNames.join(" ")}`,
    });
  }

  for (const [slug, content] of Object.entries(moduleContentRegistry)) {
    content.qa.forEach((item, index) => {
      entries.push({
        id: `qa-${slug}-${index + 1}`,
        type: "客户问答",
        title: item.q,
        subtitle: `${moduleNames.get(slug)} · ${item.tag}`,
        href: `/modules/${slug}#qa-${index + 1}`,
        keywords: `${moduleNames.get(slug)} ${item.q} ${item.tag}`,
      });
    });
  }

  for (const [slug, curriculum] of Object.entries(moduleCurriculumContent)) {
    for (const chapter of curriculum.chapters) {
      entries.push({
        id: `curriculum-${slug}-${chapter.en.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, "-")}`,
        type: "课程章节",
        title: chapter.title,
        subtitle: `${moduleNames.get(slug)} · ${chapter.en}`,
        href: `/modules/${slug}#curriculum`,
        keywords: `${moduleNames.get(slug)} ${chapter.title} ${chapter.en} ${chapter.explanation} ${chapter.decision} ${chapter.boundary}`,
      });
    }
  }

  for (const [slug, learning] of Object.entries(moduleLearningContent)) {
    learning.labs.forEach((lab, index) => {
      entries.push({
        id: `lab-${slug}-${index + 1}`,
        type: "实战练习",
        title: lab.title,
        subtitle: `${moduleNames.get(slug)} · 可验收练习`,
        href: `/modules/${slug}#study-guide`,
        keywords: `${moduleNames.get(slug)} ${lab.title} ${lab.scenario} ${lab.tasks.join(" ")} ${lab.deliverable} ${lab.acceptance}`,
      });
    });
  }

  for (const [slug, content] of Object.entries(moduleContentRegistry)) {
    if (Object.hasOwn(moduleLearningContent, slug) || !("learning" in content) || !content.learning) continue;
    content.learning.labs.forEach((lab, index) => {
      entries.push({
        id: `lab-${slug}-${index + 1}`,
        type: "实战练习",
        title: lab.title,
        subtitle: `${moduleNames.get(slug)} · 可验收练习`,
        href: `/modules/${slug}#practice`,
        keywords: `${moduleNames.get(slug)} ${lab.title} ${lab.scenario} ${lab.tasks.join(" ")} ${lab.deliverable} ${lab.acceptance}`,
      });
    });
  }

  for (const [sourceId, source] of Object.entries(sourceLedger)) {
    entries.push({
      id: `source-${sourceId}`,
      type: "来源证据",
      title: source.title,
      subtitle: `${source.grade} 类证据 · ${(sourceModules.get(sourceId) ?? []).join(" / ")}`,
      href: `/references#source-${sourceId}`,
      keywords: `${source.shortTitle} ${source.title} ${source.kind} ${(sourceModules.get(sourceId) ?? []).join(" ")}`,
    });
  }

  return entries;
}

function buildEnglishEntries() {
  const entries = [];

  for (const [termId, term] of Object.entries(englishTermCopy)) {
    entries.push({
      id: `term-${termId}`,
      type: "Technical term",
      title: `${term.name}${term.abbr ? ` (${term.abbr})` : ""}`,
      subtitle: "Field glossary",
      href: `/en/glossary#term-${termId}`,
      keywords: `${term.name} ${term.abbr ?? ""} ${term.definition}`,
    });
  }

  for (const englishModule of Object.values(englishModuleRegistry)) {
    for (const item of englishModule.qa) {
      entries.push({
        id: `qa-${englishModule.slug}-${item.id}`,
        type: "Customer question",
        title: item.q,
        subtitle: `${englishModule.title} · ${item.tag}`,
        href: `/en/modules/${englishModule.slug}#qa-${item.id}`,
        keywords: `${englishModule.title} ${item.q} ${item.a} ${item.depth} ${item.ask} ${item.tag}`,
      });
    }
  }

  for (const englishModule of Object.values(englishModuleRegistry)) {
    for (const group of buildEnglishSectionGroups(englishModule)) {
      for (const section of group.sections) {
        for (const contentBlock of section.blocks) {
          for (const item of contentBlock.items) {
            entries.push({
              id: `section-${englishModule.slug}-${item.id}`,
              type: "Module section",
              title: item.title,
              subtitle: `${englishModule.title} · ${section.title}`,
              href: `/en/modules/${englishModule.slug}#${item.id}`,
              keywords: `${englishModule.title} ${section.title} ${section.lead ?? ""} ${item.title} ${item.body ?? ""} ${item.decision ?? ""} ${item.boundary ?? ""} ${(item.cells ?? []).join(" ")}`,
            });
          }
        }
      }
    }
  }

  for (const [sourceId, source] of Object.entries(englishSourceCopy)) {
    entries.push({
      id: `source-${sourceId}`,
      type: "Source evidence",
      title: source.shortTitle,
      subtitle: `${sourceLedger[sourceId]?.grade ?? ""} evidence · ${source.kind}`,
      href: `/en/references#source-${sourceId}`,
      keywords: `${source.shortTitle} ${source.kind} ${source.note} ${sourceLedger[sourceId]?.title ?? ""}`,
    });
  }

  return entries;
}

export function buildKnowledgeSearchEntries(locale) {
  if (locale === "zh") return buildChineseEntries();
  if (locale === "en") return buildEnglishEntries();
  throw new Error(`Unsupported search index locale: ${locale}`);
}

// 每道问题的检索文本：键与问题查询页条目的 key 对齐，页面按需加载后做关键词匹配。
export function buildQuestionSearchText(locale) {
  if (locale === "zh") {
    return Object.fromEntries(questionDirectoryItems.map((item) => [item.key, [
      item.moduleZh,
      item.moduleEn,
      item.tag,
      item.question,
      item.answer,
      item.depth,
      item.ask,
      item.basis,
      item.addedAt ?? "",
      item.intentName,
      item.tier ?? "",
      item.customerPhrases.join(" "),
    ].join(" ")]));
  }
  if (locale === "en") {
    return Object.fromEntries(englishQuestions.map((item) => [
      `question-${item.moduleSlug}-${item.id}`,
      `${item.moduleTitle} ${item.tag} ${item.q} ${item.a} ${item.depth} ${item.ask} ${item.basis}`,
    ]));
  }
  throw new Error(`Unsupported search index locale: ${locale}`);
}
