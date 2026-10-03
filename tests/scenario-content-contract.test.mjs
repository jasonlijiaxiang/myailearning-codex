import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { moduleManifests } from "../app/modules/index.mjs";
import { moduleDepthContent } from "../app/module-depth-content.mjs";
import { moduleContentRegistry } from "../app/module-content-registry.mjs";
import { sourceLedger, referenceModules } from "../app/reference-content.mjs";
import { scenarioDefinitionsForHome } from "../app/home-learning-paths.mjs";
import { buildKnowledgeSearchEntries } from "../app/search-index.mjs";
import { englishModulePath, englishModuleSlugs } from "../app/i18n/locale-config.mjs";

const scenarios = moduleManifests.filter((module) => module.category === "scenario");
const localization = JSON.parse(await readFile(new URL("../knowledge/localization/status.json", import.meta.url), "utf8"));

test("Chinese scene modules have complete independent content and truthful language availability", () => {
  assert.ok(scenarios.length > 0);
  for (const manifest of scenarios) {
    assert.deepEqual(manifest.locales, ["zh-CN"]);
    assert.equal(englishModulePath(manifest.slug), null);
    assert.ok(!englishModuleSlugs.includes(manifest.slug));
    assert.equal(localization.modules[manifest.slug].status, "not-started");
    assert.equal(localization.modules[manifest.slug].enSyncedCommit, null);
    assert.equal(manifest.unifiedBriefConfig.scenarioKind, manifest.slug);
    assert.ok(manifest.brief.definition && manifest.brief.criticalBoundary);
    assert.ok(manifest.brief.qa.length && manifest.brief.qa.every((/** @type {{addedAt: string}} */ q) => q.addedAt === manifest.introducedAt));
    assert.ok(manifest.curriculum.chapters.length && manifest.learning.labs.length);
    assert.equal(manifest.extensionViews.id, manifest.knowledgeView);
    assert.ok(scenarioDefinitionsForHome.some((entry) => entry.href === `/modules/${manifest.slug}`));
  }
});

test("mechanism studies are discoverable teaching cases with grouped primary sources", () => {
  const entries = buildKnowledgeSearchEntries("zh");
  for (const [slug, study] of Object.entries(moduleDepthContent)) {
    assert.equal(moduleContentRegistry[slug].depthStudy, study);
    assert.ok(study.example.premise && study.example.steps.length && study.example.result && study.example.boundary);
    for (const id of study.sourceIds) {
      assert.ok(sourceLedger[id], `${slug}: ${id}`);
      assert.ok(referenceModules.find((manifest) => manifest.id === slug)?.sourceIds.includes(id), `${slug}: grouped ${id}`);
    }
    assert.ok(entries.some((entry) => entry.href === `/modules/${slug}?view=learn#depth-study` && entry.title === study.title));
  }
  for (const manifest of moduleManifests.filter((item) => item.category !== "scenario")) assert.ok(moduleDepthContent[manifest.slug], `${manifest.slug}: mechanism study`);
});


test("polish scheduling covers the live published set with no second publication inventory", async () => {
  const plan = JSON.parse(await readFile(new URL("../knowledge/module-polish/plan.json", import.meta.url), "utf8"));
  const plannedSlugs = plan.batches.flatMap((/** @type {{modules: string[]}} */ batch) => batch.modules);
  assert.equal(new Set(plannedSlugs).size, plannedSlugs.length);
  assert.deepEqual([...plannedSlugs].sort(), moduleManifests.map((manifest) => manifest.slug).sort());
});
