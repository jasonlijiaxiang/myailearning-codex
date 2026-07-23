import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { requireModuleContent } from "../app/module-content-registry.mjs";
import { publishedModuleSlugs, getPublishedModule } from "../app/module-publication.mjs";
import { sourceLedger } from "../app/reference-content.mjs";
import { terminology } from "../app/terminology.mjs";

const modulesDirectory = path.resolve("app/i18n/en/modules");
const requireAll = process.argv.includes("--require-all");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const sourceCopyFields = ["kind", "note", "shortTitle"];
const nonUsEditorialSpellings = /\b(?:analys(?:e|ed|es|ing)|anonymis(?:e|ed|es|ing|ation)|artefacts?|(?:un)?authoris(?:ation|ations|e|ed|es|ing)|behaviou(?:r|rs|ral|rally)|catalogu(?:e|ed|es|ing)|centralis(?:e|ed|es|ing|ation)|colou(?:r|rs|red|ring)|customis(?:e|ed|es|ing|ation)|defence|emphasis(?:e|ed|es|ing)|favour(?:s|ed|ing|able)?|fulfil(?:s|led|ling|ment)?|generalis(?:e|ed|es|ing|ation)|judgement|labell(?:ed|ing)|labou(?:r|rs|red|ring)|licence|localis(?:e|ed|es|ing|ation)|maximis(?:e|ed|es|ing|ation)|memoris(?:e|ed|es|ing|ation)|minimis(?:e|ed|es|ing|ation)|modelled|modelling|normalis(?:e|ed|es|ing|ation)|optimis(?:e|ed|es|ing|ation|ations)|organis(?:e|ed|es|ing|ation|ations|ational)|personalis(?:e|ed|es|ing|ation)|practise|practised|practising|prioritis(?:e|ed|es|ing|ation)|programme|quantis(?:e|ed|es|ing|ation)|recognis(?:e|ed|es|ing)|serialis(?:e|ed|es|ing|ation)|specialis(?:e|ed|es|ing|ation)|standardis(?:e|ed|es|ing|ation)|summaris(?:e|ed|es|ing|ation)|synchronis(?:e|ed|es|ing|ation|ations)|synthes(?:ise|ised|ises|ising)|towards|utilis(?:e|ed|es|ing|ation)|vectoris(?:e|ed|es|ing|ation)|visualis(?:e|ed|es|ing|ation))\b/i;

function collectSourceIds(value, result = new Set()) {
  if (Array.isArray(value)) value.forEach((item) => collectSourceIds(item, result));
  else if (value && typeof value === "object") {
    if (typeof value.sourceId === "string") result.add(value.sourceId);
    if (Array.isArray(value.sourceIds)) value.sourceIds.forEach((sourceId) => result.add(sourceId));
    Object.values(value).forEach((item) => collectSourceIds(item, result));
  }
  return result;
}

function assertUniqueIds(items, label) {
  const ids = items.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, `${label} IDs must be unique`);
  ids.forEach((id) => assert.match(id, slugPattern, `${label} ID must be a stable slug: ${id}`));
}

const files = (await readdir(modulesDirectory)).filter((name) => name.endsWith(".mjs")).sort();
const discoveredSlugs = files.map((name) => name.slice(0, -4));
const unknownSlugs = discoveredSlugs.filter((slug) => !publishedModuleSlugs.includes(slug));
assert.deepEqual(unknownSlugs, [], `Unknown English module files: ${unknownSlugs.join(", ")}`);

if (requireAll) {
  assert.deepEqual([...discoveredSlugs].sort(), [...publishedModuleSlugs].sort(), "English edition must cover every published module");
}

for (const file of files) {
  const slug = file.slice(0, -4);
  const { englishModule } = await import(pathToFileURL(path.join(modulesDirectory, file)).href);
  const canonical = requireModuleContent(slug);
  const publication = getPublishedModule(slug);

  assert.ok(publication, `${slug} must be published`);
  assert.equal(englishModule.slug, slug, `${slug} filename and module slug must match`);
  assert.ok(englishModule.definition?.trim(), `${slug} needs a definition`);
  assert.ok(englishModule.position?.trim(), `${slug} needs a position statement`);
  assert.ok(englishModule.sections?.length, `${slug} needs structured sections`);
  if (englishModule.primer) {
    assert.equal(englishModule.primer.id, publication.knowledgeView, `${slug} English primer must reuse the canonical knowledge-view ID`);
    assert.ok(englishModule.primer.steps?.length >= 3, `${slug} English primer needs a meaningful mechanism view`);
    assert.ok(englishModule.primer.checks?.length >= 3, `${slug} English primer needs decision checks`);
    englishModule.primer.termIds.forEach((termId) => assert.ok(englishModule.terms[termId], `${slug} primer has unknown localized term ${termId}`));
  }
  const serializedModule = JSON.stringify(englishModule);
  assert.doesNotMatch(serializedModule, /[\u3400-\u9fff]/, `${slug} contains unexplained Chinese prose`);
  const spellingSerializedModule = JSON.stringify({
    ...englishModule,
    sources: Object.fromEntries(Object.entries(englishModule.sources).map(([sourceId, copy]) => [sourceId, { ...copy, shortTitle: "" }])),
  });
  const spellingDrift = spellingSerializedModule.match(nonUsEditorialSpellings);
  if (spellingDrift) throw new Error(`${slug} contains non-US editorial spelling: ${spellingDrift[0]}`);

  assert.equal(englishModule.qa.length, canonical.qa.length, `${slug} question count`);
  assertUniqueIds(englishModule.qa, `${slug} question`);
  englishModule.qa.forEach((item, index) => {
    const canonicalItem = canonical.qa[index];
    assert.deepEqual(item.evidence.map((entry) => entry.sourceId), canonicalItem.evidence.map((entry) => entry.sourceId), `${slug} / ${item.id} evidence order`);
    assert.equal(item.addedAt ?? null, canonicalItem.addedAt ?? null, `${slug} / ${item.id} addedAt`);
  });

  assert.equal(englishModule.evidenceCards.length, canonical.evidenceCards.length, `${slug} evidence-card count`);
  assertUniqueIds(englishModule.evidenceCards, `${slug} evidence card`);
  assert.deepEqual(englishModule.evidenceCards.map((card) => card.sourceId), canonical.evidenceCards.map((card) => card.sourceId), `${slug} evidence-card source order`);

  assertUniqueIds(englishModule.sections, `${slug} section`);
  const sectionItemIds = englishModule.sections.flatMap((section) => section.blocks.flatMap((block) => block.items.map((item) => item.id)));
  assert.equal(new Set(sectionItemIds).size, sectionItemIds.length, `${slug} section-item IDs must be unique`);
  sectionItemIds.forEach((id) => assert.match(id, slugPattern, `${slug} section-item ID must be a stable slug: ${id}`));
  englishModule.sections.forEach((section) => assert.ok(!["evidence", "qa"].includes(section.id), `${slug} section ID ${section.id} conflicts with a generated page section`));

  for (const termId of publication.requiredTerms) {
    assert.ok(englishModule.terms[termId], `${slug} missing required term ${termId}`);
  }
  for (const [termId, copy] of Object.entries(englishModule.terms)) {
    assert.ok(terminology[termId], `${slug} has unknown term ${termId}`);
    assert.equal(copy.name, terminology[termId].en, `${slug} must preserve the canonical English name for ${termId}`);
  }

  for (const sourceId of collectSourceIds(englishModule)) {
    assert.ok(sourceLedger[sourceId], `${slug} has unknown source ${sourceId}`);
    assert.ok(englishModule.sources[sourceId], `${slug} is missing English source copy ${sourceId}`);
  }
  for (const [sourceId, copy] of Object.entries(englishModule.sources)) {
    assert.ok(sourceLedger[sourceId], `${slug} has unknown localized source ${sourceId}`);
    assert.deepEqual(Object.keys(copy).sort(), sourceCopyFields, `${slug} / ${sourceId} may not duplicate canonical URL, grade, or verification metadata`);
  }

  console.log(`PASS ${slug}: ${englishModule.sections.length} sections, ${englishModule.qa.length} questions, ${englishModule.evidenceCards.length} evidence cards`);
}

console.log(`English module audit passed for ${files.length}/${publishedModuleSlugs.length} modules${requireAll ? " (complete edition)" : ""}.`);
