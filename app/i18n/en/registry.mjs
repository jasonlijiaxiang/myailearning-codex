import { englishModule as solutionPatterns } from "./modules/solution-patterns.mjs";
import { englishModule as aiGovernance } from "./modules/ai-governance.mjs";
import { englishModule as modelLandscape } from "./modules/model-landscape.mjs";
import { englishModule as rag } from "./modules/rag.mjs";
import { englishModule as aiAgent } from "./modules/ai-agent.mjs";
import { englishModule as multimodal } from "./modules/multimodal.mjs";
import { englishModule as mcp } from "./modules/mcp.mjs";
import { englishModule as a2a } from "./modules/a2a.mjs";
import { englishModule as evaluation } from "./modules/evaluation.mjs";
import { englishModule as security } from "./modules/security.mjs";
import { englishModule as aiGateway } from "./modules/ai-gateway.mjs";
import { englishModule as aiOps } from "./modules/ai-ops.mjs";
import { englishModule as predictiveAiMlops } from "./modules/predictive-ai-mlops.mjs";
import { englishModule as llm } from "./modules/llm.mjs";
import { englishModule as promptEngineering } from "./modules/prompt-engineering.mjs";
import { englishModule as fineTuning } from "./modules/fine-tuning.mjs";
import { englishModule as llmTraining } from "./modules/llm-training.mjs";
import { englishModule as llmInference } from "./modules/llm-inference.mjs";
import { englishModule as dataEngineering } from "./modules/data-engineering.mjs";
import { englishModule as aiInfraPlatform } from "./modules/ai-infra-platform.mjs";
import { englishModule as aiInfraCompute } from "./modules/ai-infra-compute.mjs";
import { englishModuleSlugs } from "../locale-config.mjs";
import { englishCopyOwners, englishSourceCopyOverrides } from "./shared-copy-policy.mjs";

const localizedModules = [
  solutionPatterns,
  modelLandscape,
  rag,
  aiAgent,
  multimodal,
  mcp,
  a2a,
  evaluation,
  aiGovernance,
  security,
  aiGateway,
  aiOps,
  predictiveAiMlops,
  llm,
  promptEngineering,
  fineTuning,
  llmTraining,
  llmInference,
  dataEngineering,
  aiInfraPlatform,
  aiInfraCompute,
];

const moduleEntries = localizedModules.map((localizedModule) => [localizedModule.slug, Object.freeze(localizedModule)]);

export const englishModuleRegistry = Object.freeze(Object.fromEntries(moduleEntries));

const registeredSlugs = Object.keys(englishModuleRegistry).sort();
const expectedSlugs = [...englishModuleSlugs].sort();
if (JSON.stringify(registeredSlugs) !== JSON.stringify(expectedSlugs)) {
  throw new Error(`English module registry mismatch: expected ${expectedSlugs.join(", ")}; received ${registeredSlugs.join(", ")}`);
}

export function requireEnglishModule(slug) {
  const localizedModule = englishModuleRegistry[slug];
  if (!localizedModule) throw new Error(`Unknown English module: ${slug}`);
  return localizedModule;
}

function mergeLocalizedMap(field) {
  const variantsById = new Map();
  for (const localizedModule of Object.values(englishModuleRegistry)) {
    for (const [id, value] of Object.entries(localizedModule[field] ?? {})) {
      const variants = variantsById.get(id) ?? [];
      const serialized = JSON.stringify(value);
      const existing = variants.find((variant) => variant.serialized === serialized);
      if (existing) existing.moduleSlugs.push(localizedModule.slug);
      else variants.push({ moduleSlugs: [localizedModule.slug], serialized, value });
      variantsById.set(id, variants);
    }
  }

  const merged = {};
  const conflictIds = new Set();
  const ownerMap = englishCopyOwners[field] ?? {};

  for (const [id, variants] of variantsById) {
    if (variants.length === 1) {
      if (ownerMap[id]) throw new Error(`Stale English ${field} owner policy: ${id}`);
      merged[id] = variants[0].value;
      continue;
    }

    conflictIds.add(id);
    const ownerSlug = ownerMap[id];
    if (!ownerSlug) throw new Error(`Unresolved English ${field} conflict: ${id}`);
    const ownerModule = englishModuleRegistry[ownerSlug];
    if (!ownerModule?.[field]?.[id]) throw new Error(`Invalid English ${field} owner for ${id}: ${ownerSlug}`);

    if (field === "sources" && englishSourceCopyOverrides[id]) {
      const override = englishSourceCopyOverrides[id];
      if (JSON.stringify(Object.keys(override).sort()) !== JSON.stringify(["kind", "note", "shortTitle"])) {
        throw new Error(`Invalid English source override fields: ${id}`);
      }
      merged[id] = override;
    } else {
      merged[id] = ownerModule[field][id];
    }
  }

  for (const id of Object.keys(ownerMap)) {
    if (!conflictIds.has(id)) throw new Error(`Stale English ${field} owner policy: ${id}`);
  }
  if (field === "sources") {
    for (const id of Object.keys(englishSourceCopyOverrides)) {
      if (!conflictIds.has(id)) throw new Error(`Stale English source override: ${id}`);
    }
  }
  return Object.freeze(merged);
}

export const englishTermCopy = mergeLocalizedMap("terms");
export const englishSourceCopy = mergeLocalizedMap("sources");

export const englishQuestions = Object.freeze(Object.values(englishModuleRegistry).flatMap((localizedModule) =>
  localizedModule.qa.map((item) => Object.freeze({ ...item, moduleSlug: localizedModule.slug, moduleTitle: localizedModule.title })),
));
export const englishPilotQuestions = englishQuestions;
