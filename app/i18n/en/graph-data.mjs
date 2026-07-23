import {
  graphLayers as canonicalLayers,
  graphModules as canonicalModules,
  graphRelations,
  graphScalePolicy,
  graphTerms as canonicalTerms,
} from "../../knowledge-graph/graph-data.mjs";
import { englishModuleRegistry, englishTermCopy } from "./registry.mjs";

export const englishGraphLayers = Object.freeze(canonicalLayers.map((layer) => Object.freeze({
  ...layer,
  name: layer.en,
})));

export const englishGraphModules = Object.freeze(canonicalModules.map((module) => {
  const localized = englishModuleRegistry[module.id];
  if (!localized) throw new Error(`Knowledge graph is missing module copy: ${module.id}`);
  return Object.freeze({
    ...module,
    zh: localized.title,
    en: localized.subtitle,
    href: `/en/modules/${module.id}`,
    layerName: englishGraphLayers.find((layer) => layer.no === module.layerNo)?.name ?? module.layerName,
    summary: localized.definition,
  });
}));

export const englishGraphTerms = Object.freeze(canonicalTerms.map((term) => {
  const localized = englishTermCopy[term.id];
  if (!localized) throw new Error(`Knowledge graph is missing term copy: ${term.id}`);
  return Object.freeze({
    ...term,
    zh: localized.name,
    en: localized.abbr ?? "",
    abbr: localized.abbr,
    description: localized.definition,
  });
}));

export const englishGraphRelationTypes = Object.freeze({
  "primary-owner": Object.freeze({ label: "Primary owner", description: "This module owns the concept definition, core mechanism, and critical boundaries." }),
  "contextual-use": Object.freeze({ label: "Contextual use", description: "This module uses the concept in a specific mechanism or solution decision." }),
  prerequisite: Object.freeze({ label: "Prerequisite", description: "Understanding the first concept helps explain why the second works." }),
  component: Object.freeze({ label: "Component", description: "The first concept forms part of the second concept's process, structure, or implementation." }),
  control: Object.freeze({ label: "Control", description: "The first concept constrains, protects, or governs the second concept's operating boundary." }),
  metric: Object.freeze({ label: "Metric", description: "The first concept measures or evaluates the second concept's behavior." }),
});

export { graphRelations as englishGraphRelations, graphScalePolicy as englishGraphScalePolicy };
