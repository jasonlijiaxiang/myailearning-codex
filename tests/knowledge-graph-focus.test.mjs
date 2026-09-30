import assert from "node:assert/strict";
import test from "node:test";

import { graphModuleRelations, graphModules, graphRelations } from "../app/knowledge-graph/graph-data.mjs";
import { referenceModules, sourceLedger } from "../app/reference-content.mjs";
import { edgePath } from "../app/knowledge-graph/edge-geometry.mjs";

test("directed edges keep source-to-target flow when the target is focused", () => {
  const point = { x: 250, y: 100 };
  assert.match(edgePath(point), /^M500 350 Q.* 250\.000 100\.000$/);
  assert.match(edgePath({ ...point, incoming: true }), /^M250\.000 100\.000 Q.* 500 350$/);
  assert.equal(edgePath(point).split(" Q")[1].split(" ").slice(0, 2).join(" "), edgePath({ ...point, incoming: true }).split(" Q")[1].split(" ").slice(0, 2).join(" "));
});

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
