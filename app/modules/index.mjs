// 23 个正式模块 manifest 的统一注册表。
// 顺序与发布注册表一致：新增模块 = 新建 manifest + 在这里登记一行 import。
import solutionPatternsManifest from "./solution-patterns/manifest.mjs";
import modelLandscapeManifest from "./model-landscape/manifest.mjs";
import ragManifest from "./rag/manifest.mjs";
import aiAgentManifest from "./ai-agent/manifest.mjs";
import multimodalManifest from "./multimodal/manifest.mjs";
import mcpManifest from "./mcp/manifest.mjs";
import a2aManifest from "./a2a/manifest.mjs";
import veadkManifest from "./veadk/manifest.mjs";
import agentkitManifest from "./agentkit/manifest.mjs";
import evaluationManifest from "./evaluation/manifest.mjs";
import aiGovernanceManifest from "./ai-governance/manifest.mjs";
import securityManifest from "./security/manifest.mjs";
import aiGatewayManifest from "./ai-gateway/manifest.mjs";
import aiOpsManifest from "./ai-ops/manifest.mjs";
import predictiveAiMlopsManifest from "./predictive-ai-mlops/manifest.mjs";
import llmManifest from "./llm/manifest.mjs";
import promptEngineeringManifest from "./prompt-engineering/manifest.mjs";
import fineTuningManifest from "./fine-tuning/manifest.mjs";
import llmTrainingManifest from "./llm-training/manifest.mjs";
import llmInferenceManifest from "./llm-inference/manifest.mjs";
import dataEngineeringManifest from "./data-engineering/manifest.mjs";
import aiInfraPlatformManifest from "./ai-infra-platform/manifest.mjs";
import aiInfraComputeManifest from "./ai-infra-compute/manifest.mjs";

/** @type {readonly import("./types.mjs").ModuleManifest[]} */
export const moduleManifests = Object.freeze([
  solutionPatternsManifest,
  modelLandscapeManifest,
  ragManifest,
  aiAgentManifest,
  multimodalManifest,
  mcpManifest,
  a2aManifest,
  veadkManifest,
  agentkitManifest,
  evaluationManifest,
  aiGovernanceManifest,
  securityManifest,
  aiGatewayManifest,
  aiOpsManifest,
  predictiveAiMlopsManifest,
  llmManifest,
  promptEngineeringManifest,
  fineTuningManifest,
  llmTrainingManifest,
  llmInferenceManifest,
  dataEngineeringManifest,
  aiInfraPlatformManifest,
  aiInfraComputeManifest,
]);

/** @type {Readonly<Record<string, import("./types.mjs").ModuleManifest>>} */
export const moduleManifestBySlug = Object.freeze(Object.fromEntries(
  moduleManifests.map((manifest) => [manifest.slug, manifest]),
));
