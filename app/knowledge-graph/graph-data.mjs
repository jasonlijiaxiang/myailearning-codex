import { layers, moduleList } from "../knowledge-map.mjs";
import { explicitTermRelations, knowledgeRelationTypes, termPrimaryModules } from "../knowledge-relations.mjs";
import { moduleDiscovery } from "../module-discovery.mjs";
import { terminology } from "../terminology.mjs";

/**
 * Design 1 与 Design 2 的唯一图谱数据适配器。
 * 两种呈现不得复制模块、术语或关系内容，只能消费这里派生的稳定数据。
 */
export const graphLayers = Object.freeze(layers.map((layer) => Object.freeze({
  no: layer.no,
  name: layer.name,
  en: layer.en,
  moduleIds: Object.freeze(layer.modules.map((module) => module.slug)),
})));

export const graphModules = Object.freeze(moduleList.map((module) => Object.freeze({
  id: module.slug,
  zh: module.zh,
  en: module.en,
  href: module.href,
  layerNo: module.layerNo,
  layerName: module.layerName,
  summary: moduleDiscovery[module.slug].summary,
})));

export const graphTerms = Object.freeze(Object.entries(terminology).map(([termId, term]) => Object.freeze({
  id: termId,
  zh: term.zh,
  en: term.en,
  abbr: term.abbr,
  description: term.description,
  moduleIds: Object.freeze([...term.moduleSlugs]),
  primaryModuleId: termPrimaryModules[termId],
})));

export const graphRelations = Object.freeze(explicitTermRelations.map((relation) => Object.freeze({ ...relation })));
export const graphRelationTypes = Object.freeze(Object.fromEntries(
  Object.entries(knowledgeRelationTypes).map(([id, value]) => [id, Object.freeze({ ...value })]),
));

export const graphScalePolicy = Object.freeze({
  maxActiveNodes: 24,
  maxActiveEdges: 32,
  highDegreeWarning: 20,
});

export const graphHealth = Object.freeze((() => {
  const degree = new Map(graphTerms.map((term) => [term.id, term.moduleIds.length]));
  for (const relation of graphRelations) {
    degree.set(relation.from, (degree.get(relation.from) ?? 0) + 1);
    degree.set(relation.to, (degree.get(relation.to) ?? 0) + 1);
  }
  return {
    isolatedTermIds: Object.freeze(graphTerms.filter((term) => (degree.get(term.id) ?? 0) === 0).map((term) => term.id)),
    highDegreeTermIds: Object.freeze([...degree.entries()].filter(([, count]) => count > graphScalePolicy.highDegreeWarning).map(([id]) => id)),
    maximumDegree: Math.max(...degree.values()),
  };
})());
