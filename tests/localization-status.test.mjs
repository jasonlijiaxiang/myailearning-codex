// 轻量本地化状态账本测试：knowledge/localization/status.json 每模块一行，
// aligned/deferred 与 enSyncedCommit 必须真实可解析。
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { publishedModuleSlugs } from "../app/module-publication.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const status = JSON.parse(readFileSync(new URL("../knowledge/localization/status.json", import.meta.url), "utf8"));
const commitPattern = /^[0-9a-f]{40}$/;

test("localization status covers every published module exactly once with valid commits", () => {
  assert.equal(status.schemaVersion, 1, "schemaVersion must be 1");
  assert.deepEqual(Object.keys(status.modules).sort(), [...publishedModuleSlugs].sort());

  for (const [slug, record] of Object.entries(status.modules)) {
    const expectedKeys = record.status === "aligned"
      ? ["enSyncedCommit", "status"]
      : ["enSyncedCommit", "expiresAt", "openedAt", "reason", "status"];
    assert.deepEqual(Object.keys(record).sort(), expectedKeys, `${slug} record keys`);
    assert.ok(["aligned", "deferred"].includes(record.status), `${slug} status must be aligned or deferred`);
    assert.match(record.enSyncedCommit, commitPattern, `${slug} enSyncedCommit must be a full commit`);
    execFileSync("git", ["-C", root, "cat-file", "-e", `${record.enSyncedCommit}^{commit}`], { encoding: "utf8" });
  }
});

test("deferred modules carry open metadata and expired windows warn instead of failing", () => {
  const today = new Date().toISOString().slice(0, 10);
  for (const [slug, record] of Object.entries(status.modules)) {
    if (record.status !== "deferred") continue;
    assert.match(record.openedAt, /^\d{4}-\d{2}-\d{2}$/, `${slug} openedAt must be an ISO date`);
    assert.match(record.expiresAt, /^\d{4}-\d{2}-\d{2}$/, `${slug} expiresAt must be an ISO date`);
    assert.ok(record.reason?.trim(), `${slug} reason must explain the deferment`);
    if (record.expiresAt < today) console.warn(`${slug}: deferment expired on ${record.expiresAt}`);
  }
});
