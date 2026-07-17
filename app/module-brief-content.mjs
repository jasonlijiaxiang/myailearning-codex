import {
  a2aBrief,
  evaluationBrief,
  mcpBrief,
  multimodalBrief,
  securityBrief,
  solutionPatternsBrief,
} from "./module-briefs-app-protocol.mjs";
import { fineTuning, llm, llmTraining, modelLandscape } from "./module-briefs-foundations.mjs";
import {
  aiGatewayBrief,
  aiInfraComputeBrief,
  aiInfraPlatformBrief,
  aiOpsBrief,
  dataEngineeringBrief,
  llmInferenceBrief,
} from "./module-briefs-platform.mjs";

export const moduleBriefs = Object.freeze({
  [solutionPatternsBrief.slug]: Object.freeze(solutionPatternsBrief),
  [modelLandscape.slug]: Object.freeze(modelLandscape),
  [multimodalBrief.slug]: Object.freeze(multimodalBrief),
  [mcpBrief.slug]: Object.freeze(mcpBrief),
  [a2aBrief.slug]: Object.freeze(a2aBrief),
  [evaluationBrief.slug]: Object.freeze(evaluationBrief),
  [securityBrief.slug]: Object.freeze(securityBrief),
  [aiGatewayBrief.slug]: Object.freeze(aiGatewayBrief),
  [aiOpsBrief.slug]: Object.freeze(aiOpsBrief),
  [llm.slug]: Object.freeze(llm),
  [fineTuning.slug]: Object.freeze(fineTuning),
  [llmTraining.slug]: Object.freeze(llmTraining),
  [llmInferenceBrief.slug]: Object.freeze(llmInferenceBrief),
  [dataEngineeringBrief.slug]: Object.freeze(dataEngineeringBrief),
  [aiInfraPlatformBrief.slug]: Object.freeze(aiInfraPlatformBrief),
  [aiInfraComputeBrief.slug]: Object.freeze(aiInfraComputeBrief),
});

export const moduleBriefSlugs = Object.freeze(Object.keys(moduleBriefs));

export function requireModuleBrief(slug) {
  const brief = moduleBriefs[slug];
  if (!brief) throw new Error(`Unknown module brief: ${slug}`);
  return brief;
}
