import {
  a2aBrief,
  evaluationBrief,
  mcpBrief,
  multimodalBrief,
  securityBrief,
  solutionPatternsBrief,
} from "./module-briefs-app-protocol.mjs";
import { fineTuning, llm, llmTraining, modelLandscape } from "./module-briefs-foundations.mjs";
import { aiApplicationEngineeringBrief, aiFinopsBrief } from "./module-briefs-application-finops.mjs";
import { aiGovernanceBrief, predictiveAiMlopsBrief } from "./module-briefs-governance-mlops.mjs";
import {
  aiGatewayBrief,
  aiInfraComputeBrief,
  aiInfraPlatformBrief,
  aiOpsBrief,
  dataEngineeringBrief,
  llmInferenceBrief,
} from "./module-briefs-platform.mjs";
import { moduleQaExpansion } from "./module-qa-expansion.mjs";
import { completionQa } from "./module-completion-content.mjs";
import { moduleQuestionDepthExpansion } from "./module-question-depth-expansion.mjs";

const withExpandedQa = (brief) => Object.freeze({
  ...brief,
  qa: Object.freeze([
    ...brief.qa,
    ...moduleQaExpansion[brief.slug],
    ...(completionQa[brief.slug] ?? []),
    ...(moduleQuestionDepthExpansion[brief.slug] ?? []),
  ]),
});

export const moduleBriefs = Object.freeze({
  [solutionPatternsBrief.slug]: withExpandedQa(solutionPatternsBrief),
  [modelLandscape.slug]: withExpandedQa(modelLandscape),
  [multimodalBrief.slug]: withExpandedQa(multimodalBrief),
  [mcpBrief.slug]: withExpandedQa(mcpBrief),
  [a2aBrief.slug]: withExpandedQa(a2aBrief),
  [evaluationBrief.slug]: withExpandedQa(evaluationBrief),
  [aiApplicationEngineeringBrief.slug]: withExpandedQa(aiApplicationEngineeringBrief),
  [aiGovernanceBrief.slug]: withExpandedQa(aiGovernanceBrief),
  [securityBrief.slug]: withExpandedQa(securityBrief),
  [aiGatewayBrief.slug]: withExpandedQa(aiGatewayBrief),
  [aiOpsBrief.slug]: withExpandedQa(aiOpsBrief),
  [aiFinopsBrief.slug]: withExpandedQa(aiFinopsBrief),
  [predictiveAiMlopsBrief.slug]: withExpandedQa(predictiveAiMlopsBrief),
  [llm.slug]: withExpandedQa(llm),
  [fineTuning.slug]: withExpandedQa(fineTuning),
  [llmTraining.slug]: withExpandedQa(llmTraining),
  [llmInferenceBrief.slug]: withExpandedQa(llmInferenceBrief),
  [dataEngineeringBrief.slug]: withExpandedQa(dataEngineeringBrief),
  [aiInfraPlatformBrief.slug]: withExpandedQa(aiInfraPlatformBrief),
  [aiInfraComputeBrief.slug]: withExpandedQa(aiInfraComputeBrief),
});

export const moduleBriefSlugs = Object.freeze(Object.keys(moduleBriefs));

export function requireModuleBrief(slug) {
  const brief = moduleBriefs[slug];
  if (!brief) throw new Error(`Unknown module brief: ${slug}`);
  return brief;
}
