import { getModuleBySlug } from "./knowledge-map.mjs";
import { requireModuleBrief } from "./module-brief-content.mjs";
import { requireModuleContent } from "./module-content-registry.mjs";
import { requireModuleCurriculum } from "./module-curriculum-content.mjs";
import { requireModuleLearning } from "./module-learning-content.mjs";
import { getPublishedModule } from "./module-publication.mjs";
import { sourceLedger } from "./reference-content.mjs";
import { terminology } from "./terminology.mjs";
import { McpModuleExperienceClient, type McpExperienceData } from "./mcp-module-experience-client";

type SourceLedgerEntry = {
  grade: string;
  kind: string;
  shortTitle: string;
  title: string;
  note: string;
  verifiedAt: string;
  href: string;
};

function collectSourceIds(data: {
  evidenceCards: ReadonlyArray<{ sourceId: string }>;
  qa: ReadonlyArray<{ evidence: ReadonlyArray<{ sourceId: string }> }>;
  deepDives: ReadonlyArray<{ sourceIds?: readonly string[] }>;
  chapters: ReadonlyArray<{ sourceIds: readonly string[] }>;
  labs: ReadonlyArray<{ sourceIds: readonly string[] }>;
}) {
  return new Set([
    ...data.evidenceCards.map((card) => card.sourceId),
    ...data.qa.flatMap((item) => item.evidence.map((evidence) => evidence.sourceId)),
    ...data.deepDives.flatMap((block) => block.sourceIds ?? []),
    ...data.chapters.flatMap((chapter) => chapter.sourceIds),
    ...data.labs.flatMap((lab) => lab.sourceIds),
  ]);
}

export function McpModuleExperience() {
  const knowledgeModule = getModuleBySlug("mcp");
  if (!knowledgeModule) throw new Error("Missing MCP knowledge-map entry");

  const brief = requireModuleBrief("mcp");
  const registry = requireModuleContent("mcp");
  const curriculum = requireModuleCurriculum("mcp");
  const learning = requireModuleLearning("mcp");
  const publication = getPublishedModule("mcp");
  if (!publication) throw new Error("Missing MCP publication entry");
  const ledger = sourceLedger as Record<string, SourceLedgerEntry | undefined>;
  const sourceIds = collectSourceIds({
    evidenceCards: registry.evidenceCards,
    qa: registry.qa,
    deepDives: registry.deepDives,
    chapters: curriculum.chapters,
    labs: learning.labs,
  });

  const sources = Object.fromEntries(
    [...sourceIds].map((sourceId) => {
      const source = ledger[sourceId];
      if (!source) throw new Error(`Unknown MCP source: ${sourceId}`);
      return [sourceId, {
        grade: source.grade,
        kind: source.kind,
        shortTitle: source.shortTitle,
        title: source.title,
        note: source.note,
        verifiedAt: source.verifiedAt,
        href: source.href,
      }];
    }),
  );

  const data: McpExperienceData = {
    module: {
      zh: knowledgeModule.zh.replace(/^MCP\s*·\s*/, ""),
      en: knowledgeModule.en,
      layerName: knowledgeModule.layerName,
      titleId: publication.titleId,
      updatedAt: publication.updatedAt,
      knowledgeView: publication.knowledgeView ?? "mcp-host-server-boundary",
    },
    terms: publication.requiredTerms.map((termId) => {
      const term = terminology[termId];
      if (!term) throw new Error(`Unknown MCP term: ${termId}`);
      return { id: termId, zh: term.zh, en: term.en, description: term.description };
    }),
    definition: brief.definition,
    position: brief.position,
    principleTitle: brief.principleTitle,
    principles: brief.principles,
    decisions: brief.decisions,
    criticalBoundary: brief.criticalBoundary,
    cloudHooks: brief.cloudHooks,
    qa: registry.qa,
    evidenceCards: registry.evidenceCards,
    deepDives: registry.deepDives,
    curriculum,
    learning,
    sources,
  };

  return <McpModuleExperienceClient data={data} />;
}

export default McpModuleExperience;
