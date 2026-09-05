import {
  a2aBrief,
  evaluationBrief,
  mcpBrief,
  multimodalBrief,
  securityBrief,
  solutionPatternsBrief,
} from "./module-briefs-app-protocol.mjs";
import { fineTuning, llm, llmTraining, modelLandscape } from "./module-briefs-foundations.mjs";
import { aiGovernanceBrief, predictiveAiMlopsBrief } from "./module-briefs-governance-mlops.mjs";
import { agentPlatformBriefs } from "./module-content-agent-platforms.mjs";
import {
  aiGatewayBrief,
  aiInfraComputeBrief,
  aiInfraPlatformBrief,
  aiOpsBrief,
  dataEngineeringBrief,
  llmInferenceBrief,
} from "./module-briefs-platform.mjs";

/** @type {Record<string, any>} */
export const moduleBriefs = Object.freeze({
  [solutionPatternsBrief.slug]: solutionPatternsBrief,
  [modelLandscape.slug]: modelLandscape,
  [multimodalBrief.slug]: multimodalBrief,
  [mcpBrief.slug]: mcpBrief,
  [a2aBrief.slug]: a2aBrief,
  [agentPlatformBriefs.veadk.slug]: agentPlatformBriefs.veadk,
  [agentPlatformBriefs.agentkit.slug]: agentPlatformBriefs.agentkit,
  [evaluationBrief.slug]: evaluationBrief,
  [aiGovernanceBrief.slug]: aiGovernanceBrief,
  [securityBrief.slug]: securityBrief,
  [aiGatewayBrief.slug]: aiGatewayBrief,
  [aiOpsBrief.slug]: aiOpsBrief,
  [predictiveAiMlopsBrief.slug]: predictiveAiMlopsBrief,
  [llm.slug]: llm,
  [fineTuning.slug]: fineTuning,
  [llmTraining.slug]: llmTraining,
  [llmInferenceBrief.slug]: llmInferenceBrief,
  [dataEngineeringBrief.slug]: dataEngineeringBrief,
  [aiInfraPlatformBrief.slug]: aiInfraPlatformBrief,
  [aiInfraComputeBrief.slug]: aiInfraComputeBrief,
});

/**
 * @param {string} slug
 */
export function requireModuleBrief(slug) {
  const brief = moduleBriefs[slug];
  if (!brief) throw new Error(`Unknown module brief: ${slug}`);
  return brief;
}
