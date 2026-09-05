import { moduleList } from "./knowledge-map.mjs";
import { moduleContentRegistry } from "./module-content-registry.mjs";
import { publishedModules } from "./module-publication.mjs";
import { fieldQuestionByRef, intentDefinitions, resolveQuestionIntent } from "./question-field-kit.mjs";

const moduleNames = new Map(moduleList.map((module) => [module.slug, module]));
const intentNameById = new Map(intentDefinitions.map((intent) => [intent.id, intent.zh]));

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
  moduleContentRegistry[moduleEntry.id].qa.map((item, index) => {
    const number = index + 1;
    const overrideKey = `${moduleEntry.id}-${number}`;
    const fieldEntry = fieldQuestionByRef[overrideKey];
    const intentId = fieldEntry?.intentId ?? resolveQuestionIntent(moduleEntry.id, number, item.tag, overrideKey);
    const intentName = intentNameById.get(intentId) ?? "概念与机制";
    return Object.freeze({
      key: overrideKey,
      number,
      moduleId: moduleEntry.id,
      moduleZh: moduleEntry.zh,
      moduleEn: moduleEntry.en,
      moduleHref: moduleEntry.href,
      originalHref: `${moduleEntry.href}#qa-${number}`,
      tag: item.tag,
      question: item.q,
      answer: item.a,
      depth: item.depth,
      ask: item.ask,
      basis: item.basis,
      evidence: item.evidence,
      addedAt: item.addedAt ?? null,
      intentId,
      intentName,
      tier: fieldEntry?.tier ?? null,
      scenarioIds: fieldEntry?.scenarioIds ?? Object.freeze([]),
      customerPhrases: fieldEntry?.customerPhrases ?? Object.freeze([]),
      displayPhrase: fieldEntry?.displayPhrase ?? null,
      fieldId: fieldEntry?.fieldId ?? null,
    });
  }),
));
