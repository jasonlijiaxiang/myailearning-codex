import assert from "node:assert/strict";
import test from "node:test";

import { graphModuleRelations, graphModules, graphRelations } from "../app/knowledge-graph/graph-data.mjs";
import { referenceModules, sourceLedger } from "../app/reference-content.mjs";

test("cross-module graph explanations keep stable nodes, distinct edges, and verified sources", () => {
  const moduleIds = new Set(graphModules.map((module) => module.id));
  const relationIds = new Set();

  for (const relation of graphModuleRelations) {
    assert.ok(moduleIds.has(relation.from), `unknown source module: ${relation.from}`);
    assert.ok(moduleIds.has(relation.to), `unknown target module: ${relation.to}`);
    assert.notEqual(relation.from, relation.to, `self-link: ${relation.id}`);
    assert.equal(relation.id, `module:${relation.from}:${relation.type}:${relation.to}`);
    assert.equal(relation.direction, "directed");
    assert.equal(relation.status, "published");
    assert.ok(relation.explanation.length >= 30, `relationship needs a concrete explanation: ${relation.id}`);
    assert.ok(relation.explanationEn.length >= 30, `relationship needs independently readable English: ${relation.id}`);
    assert.ok(sourceLedger[relation.sourceId], `relationship cites an unknown source: ${relation.id}`);
    assert.ok(referenceModules.some((module) => module.sourceIds.includes(relation.sourceId)), `relationship lacks a public source anchor: ${relation.id}`);
    assert.equal(relationIds.has(relation.id), false, `duplicate module relation: ${relation.id}`);
    assert.ok(graphRelations.includes(relation), `relationship is missing from the public graph: ${relation.id}`);
    relationIds.add(relation.id);
  }

  for (const id of ["security", "ai-governance", "ai-ops"]) {
    assert.ok(graphModuleRelations.filter((relation) => relation.from === id || relation.to === id).length >= 2, `${id} needs cross-module explanations`);
  }
});
