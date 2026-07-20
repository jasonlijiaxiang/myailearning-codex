import { moduleList } from "./knowledge-map.mjs";
import { moduleContentRegistry } from "./module-content-registry.mjs";
import { publishedModules } from "./module-publication.mjs";

const moduleNames = new Map(moduleList.map((module) => [module.slug, module]));

export const questionDirectoryModules = Object.freeze(publishedModules.map((publication) => {
  const moduleEntry = moduleNames.get(publication.slug);
  const content = moduleContentRegistry[publication.slug];
  if (!moduleEntry || !content) throw new Error(`问题查询页缺少正式模块数据：${publication.slug}`);

  return Object.freeze({
    id: publication.slug,
    zh: moduleEntry.zh,
    en: moduleEntry.en,
    href: publication.path,
    count: content.qa.length,
  });
}));

export const questionDirectoryItems = Object.freeze(questionDirectoryModules.flatMap((moduleEntry) =>
  moduleContentRegistry[moduleEntry.id].qa.map((item, index) => Object.freeze({
    key: `${moduleEntry.id}-${index + 1}`,
    number: index + 1,
    moduleId: moduleEntry.id,
    moduleZh: moduleEntry.zh,
    moduleEn: moduleEntry.en,
    moduleHref: moduleEntry.href,
    originalHref: `${moduleEntry.href}#qa-${index + 1}`,
    tag: item.tag,
    question: item.q,
    answer: item.a,
    depth: item.depth,
    ask: item.ask,
    basis: item.basis,
    evidence: item.evidence,
    searchText: `${moduleEntry.zh} ${moduleEntry.en} ${item.tag} ${item.q} ${item.a} ${item.depth} ${item.ask} ${item.basis}`,
  })),
));
