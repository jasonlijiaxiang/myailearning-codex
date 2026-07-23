import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");
const KB_TOOL = path.join(
  PROJECT_ROOT,
  ".agents/skills/curate-portable-knowledge-base/scripts/kb-tool.mjs",
);
const QUALITY_COMMANDS = ["npm run kb:validate", "npm run lint", "npm test"];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeFile(file, value = "fixture\n") {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, value);
}

function runTool(root, args, extraEnv = {}) {
  return spawnSync(process.execPath, [KB_TOOL, ...args], {
    cwd: root,
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORTABLE_KB_TEST_ROOT: root,
      ...extraEnv,
    },
    encoding: "utf8",
    shell: false,
  });
}

function runGit(root, args) {
  return spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    shell: false,
  });
}

function requireGit(root, args) {
  const result = runGit(root, args);
  assert.equal(result.status, 0, result.stderr || `git ${args.join(" ")} failed`);
  return result;
}

async function initializeGitFixture(root) {
  requireGit(root, ["init", "-q"]);
  requireGit(root, ["config", "user.name", "Portable Contract Test"]);
  requireGit(root, ["config", "user.email", "portable-contract@example.invalid"]);
  requireGit(root, ["add", "-A"]);
  requireGit(root, ["commit", "-q", "-m", "fixture"]);
}

function storedZipEntries(archive) {
  const entries = new Map();
  let offset = 0;
  while (offset + 30 <= archive.length && archive.readUInt32LE(offset) === 0x04034b50) {
    const size = archive.readUInt32LE(offset + 18);
    const nameLength = archive.readUInt16LE(offset + 26);
    const extraLength = archive.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const name = archive.subarray(nameStart, nameStart + nameLength).toString("utf8");
    entries.set(name, archive.subarray(dataStart, dataStart + size));
    offset = dataStart + size;
  }
  return entries;
}

function crc32(value) {
  let crc = 0xffffffff;
  for (const byte of value) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function storedZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const [relative, value] of entries) {
    const name = Buffer.from(relative, "utf8");
    const data = Buffer.isBuffer(value) ? value : Buffer.from(value);
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x031e, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE((0o100644 << 16) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    localParts.push(local, name, data);
    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }
  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function deflatedZip(relative, value, declaredSize = value.length) {
  const name = Buffer.from(relative, "utf8");
  const data = Buffer.isBuffer(value) ? value : Buffer.from(value);
  const compressed = deflateRawSync(data);
  const crc = crc32(data);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6);
  local.writeUInt16LE(8, 8);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(declaredSize, 22);
  local.writeUInt16LE(name.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(0x031e, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(8, 10);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(declaredSize, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt32LE((0o100644 << 16) >>> 0, 38);
  const centralOffset = local.length + name.length + compressed.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + name.length, 12);
  end.writeUInt32LE(centralOffset, 16);
  return Buffer.concat([local, name, compressed, central, name, end]);
}

async function createFixture(root) {
  const config = {
    schemaVersion: 1,
    project: {
      id: "portable-contract-test",
      requiredNode: ">=22.13.0",
    },
    capture: {
      privateInbox: "knowledge/private-inbox",
      storeRawTranscript: false,
      maxTranscriptBytes: 26_214_400,
      maxCaptureBytesPerEvent: 8_388_608,
      rawRetentionDays: 14,
    },
    curation: {
      candidates: "knowledge/private-inbox/.runtime/candidates/index.json",
      claims: "knowledge/claims/index.json",
      releaseManifest: "knowledge/release-manifest.json",
      releaseSchema: "knowledge/schemas/release.schema.json",
      publicAdapter: "existing-app-registry",
      publicationRegistry: "app/module-publication.mjs",
      contentRegistry: "app/module-content-registry.mjs",
      sourceLedger: "app/reference-content.mjs",
      terminology: "app/terminology.mjs",
    },
    quality: { commands: QUALITY_COMMANDS },
    publishing: {
      defaultMode: "local",
      sites: { binding: ".openai/hosting.json" },
    },
    handoff: {
      defaultAudience: "internal",
      attachmentRoots: ["docs/attachments"],
      attachmentPolicy: "knowledge/attachment-distribution.json",
      attachmentSchema: "knowledge/schemas/attachment-distribution.schema.json",
    },
    packaging: {
      outputDirectory: "outputs/portable",
      maxArchiveBytes: 32 * 1024 * 1024,
      includeSiteBindingByDefault: false,
      include: [
        ".agents/skills/curate-portable-knowledge-base",
        ".codex/hooks.json",
        ".gitignore",
        ".node-version",
        "AGENTS.md",
        "HANDOFF-READ-FIRST.html",
        "HANDOFF.md",
        "README.md",
        "kb.config.json",
        "package.json",
        "package-lock.json",
        "app",
        "public",
        "knowledge/attachment-distribution.json",
        "knowledge/claims",
        "knowledge/release-manifest.json",
        "knowledge/schemas",
        "scripts",
        "tests",
        "docs",
      ],
      exclude: [
        ".git",
        "node_modules",
        "dist",
        ".next",
        ".vinext",
        ".wrangler",
        "outputs",
        "work",
        "coverage",
        "knowledge/private-inbox",
        ".openai/hosting.json",
      ],
    },
  };
  await writeJson(path.join(root, "kb.config.json"), config);
  await writeFile(path.join(root, "AGENTS.md"));
  await writeFile(path.join(root, "HANDOFF-READ-FIRST.html"));
  await writeFile(path.join(root, "HANDOFF.md"));
  await writeFile(path.join(root, "README.md"));
  await writeJson(path.join(root, "package.json"), { name: "portable-contract-test" });
  await writeJson(path.join(root, "package-lock.json"), {
    name: "portable-contract-test",
    lockfileVersion: 3,
  });
  await writeFile(
    path.join(root, ".gitignore"),
    "/knowledge/private-inbox/*\n/.openai/hosting.json\n",
  );
  await writeFile(path.join(root, ".node-version"), "22.13.0\n");
  await writeFile(
    path.join(root, ".agents/skills/curate-portable-knowledge-base/SKILL.md"),
    '---\nname: curate-portable-knowledge-base\ndescription: "Contract fixture."\n---\n',
  );
  await writeFile(
    path.join(root, ".agents/skills/curate-portable-knowledge-base/references/handoff-audit.md"),
    "# Handoff audit fixture\n",
  );
  for (const script of ["capture-turn.mjs", "hook-bootstrap.mjs", "kb-tool.mjs", "private-runtime.mjs"]) {
    await writeFile(
      path.join(root, ".agents/skills/curate-portable-knowledge-base/scripts", script),
      "export {};\n",
    );
  }
  await fs.mkdir(path.join(root, ".codex"), { recursive: true });
  await fs.copyFile(
    path.join(PROJECT_ROOT, ".codex/hooks.json"),
    path.join(root, ".codex/hooks.json"),
  );
  await writeFile(
    path.join(root, "app/module-publication.mjs"),
    'export const publishedModules = [{ slug: "known-module" }];\n',
  );
  await writeFile(path.join(root, "app/module-content-registry.mjs"), "export default {};\n");
  await writeFile(
    path.join(root, "app/reference-content.mjs"),
    'export const sourceLedger = { "known-source": { grade: "A" } };\n',
  );
  await writeFile(path.join(root, "app/terminology.mjs"), "export default {};\n");
  await writeFile(path.join(root, "public/site.css"));
  await writeFile(path.join(root, "scripts/release-check.mjs"), "export {};\n");
  await writeFile(path.join(root, "tests/smoke.test.mjs"), "export {};\n");
  await writeFile(path.join(root, "docs/kept.txt"), "KEPT\n");
  await fs.mkdir(path.join(root, "knowledge/private-inbox"), { recursive: true });
  await writeJson(path.join(root, "knowledge/attachment-distribution.json"), {
    $schema: "./schemas/attachment-distribution.schema.json",
    schemaVersion: 2,
    items: [],
  });
  await writeJson(path.join(root, "knowledge/claims/index.json"), { schemaVersion: 1, items: [] });
  await writeJson(path.join(root, "knowledge/release-manifest.json"), {
    $schema: "./schemas/release.schema.json",
    schemaVersion: 1,
    releases: [],
  });
  for (const schema of [
    "attachment-distribution.schema.json",
    "candidate.schema.json",
    "claim.schema.json",
    "release.schema.json",
  ]) {
    await fs.mkdir(path.join(root, "knowledge/schemas"), { recursive: true });
    await fs.copyFile(
      path.join(PROJECT_ROOT, "knowledge/schemas", schema),
      path.join(root, "knowledge/schemas", schema),
    );
  }
  return config;
}

async function createCapture(root, overrides = {}) {
  const sessionKey = `s_${"1".repeat(32)}`;
  const turnKey = `t_${"2".repeat(32)}`;
  const captureId = `cap_${"3".repeat(32)}`;
  const runtime = path.join(root, "knowledge/private-inbox/.runtime");
  const user = Buffer.from("user payload");
  const assistant = Buffer.from("assistant payload");
  const userPath = `user-messages/${sessionKey}/${turnKey}.txt`;
  const assistantPath = `assistant-messages/${sessionKey}/${turnKey}.txt`;
  await writeFile(path.join(runtime, userPath), user);
  await writeFile(path.join(runtime, assistantPath), assistant);
  const capture = {
    captureId,
    sessionKey,
    turnKey,
    firstCapturedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completeness: "visible-messages",
    messages: {
      user: { status: "captured", path: userPath, bytes: user.length, sha256: sha256(user) },
      assistant: {
        status: "captured",
        path: assistantPath,
        bytes: assistant.length,
        sha256: sha256(assistant),
      },
    },
    transcript: { status: "unavailable", deltas: [] },
    curation: { status: "pending", result: null, reason: null },
    ...overrides,
  };
  const captureFile = path.join(runtime, "captures", sessionKey, `${turnKey}.json`);
  await writeJson(captureFile, capture);
  return { capture, captureFile, runtime, userPath, turnKey };
}

function candidate(turnKey, overrides = {}) {
  return {
    id: "candidate-one",
    title: "Candidate",
    kind: "decision",
    summary: "A reusable decision.",
    capturedTurnIds: [turnKey],
    sourceIds: [],
    contentHash: sha256("candidate-one"),
    status: "pending",
    visibility: "private",
    sensitivity: "none",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function addDays(date, days) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

test("portable config and ZIP enforce nested exclusions, required roots, and pair rollback", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-contract-package-"));
  try {
    const config = await createFixture(root);
    await writeFile(path.join(root, "docs/vendor/node_modules/secret.txt"), "NODE_MODULE_SECRET");
    await writeFile(path.join(root, "docs/vendor/.git/config"), "GIT_SECRET");
    await writeFile(path.join(root, "docs/vendor/dist/bundle.js"), "DIST_SECRET");
    const output = path.join(root, "portable.zip");
    const packaged = runTool(root, ["package", "--output", output]);
    assert.equal(packaged.status, 0, packaged.stderr);
    const originalArchive = await fs.readFile(output);
    const originalSidecar = await fs.readFile(`${output}.sha256`);
    const entries = storedZipEntries(originalArchive);
    const manifest = JSON.parse(entries.get("PORTABLE-MANIFEST.json").toString("utf8"));
    const paths = new Set(manifest.files.map((file) => file.path));
    assert.deepEqual(manifest.qualityCommands, QUALITY_COMMANDS);
    assert.ok(paths.has("docs/kept.txt"));
    assert.ok(![...paths].some((item) => item.split("/").includes("node_modules")));
    assert.ok(![...paths].some((item) => item.split("/").includes(".git")));
    assert.ok(![...paths].some((item) => item.split("/").includes("dist")));

    const defaultPackage = runTool(root, ["package"]);
    assert.equal(defaultPackage.status, 0, defaultPackage.stderr);
    const defaultOutputs = await fs.readdir(path.join(root, "outputs/portable"));
    const defaultArchive = defaultOutputs.find((name) => (
      /^portable-knowledge-base-\d{12}\.zip$/.test(name)
    ));
    assert.ok(defaultArchive, `unexpected default package names: ${defaultOutputs.join(", ")}`);
    assert.ok(defaultOutputs.includes(`${defaultArchive}.sha256`));

    const injected = runTool(
      root,
      ["package", "--output", output],
      { PORTABLE_KB_TEST_FAIL_PUBLISH: "after-archive" },
    );
    assert.notEqual(injected.status, 0);
    assert.deepEqual(await fs.readFile(output), originalArchive);
    assert.deepEqual(await fs.readFile(`${output}.sha256`), originalSidecar);
    assert.deepEqual(
      (await fs.readdir(root)).filter((name) => name.includes(".backup-") || name.includes(".tmp-")),
      [],
    );

    await fs.rm(path.join(root, "public/site.css"));
    const missingRoot = runTool(root, ["package", "--output", output]);
    assert.notEqual(missingRoot.status, 0);
    assert.match(missingRoot.stderr, /missing required root content: public/);
    assert.deepEqual(await fs.readFile(output), originalArchive);
    await writeFile(path.join(root, "public/site.css"));

    config.packaging.exclude.push("app");
    await writeJson(path.join(root, "kb.config.json"), config);
    const conflict = runTool(root, ["validate"]);
    assert.notEqual(conflict.status, 0);
    assert.match(conflict.stderr, /include app is fully covered by exclude app/);

    config.packaging.exclude.pop();
    config.quality.commands = ["npm run kb:validate", "node unsafe.mjs", "npm test"];
    config.packaging.includeSiteBindingByDefault = true;
    await writeJson(path.join(root, "kb.config.json"), config);
    const unsafeConfig = runTool(root, ["validate"]);
    assert.notEqual(unsafeConfig.status, 0);
    assert.match(unsafeConfig.stderr, /quality\.commands must be exactly/);
    assert.match(unsafeConfig.stderr, /includeSiteBindingByDefault must remain false/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("handoff attachment audit inventories attribution, warns internally, and blocks unknown external distribution", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-contract-handoff-"));
  try {
    await createFixture(root);
    const attachmentPath = "docs/attachments/training.pptx";
    const core = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<cp:coreProperties xmlns:cp="urn:cp" xmlns:dc="urn:dc">',
      "<dc:creator>Fixture Author</dc:creator>",
      "<cp:lastModifiedBy>Fixture Editor</cp:lastModifiedBy>",
      "</cp:coreProperties>",
    ].join("");
    const app = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<Properties><Company>Fixture Company</Company><Manager>Fixture Manager</Manager></Properties>",
    ].join("");
    const attachment = storedZip([
      ["docProps/core.xml", core],
      ["docProps/app.xml", app],
      ["ppt/notesSlides/notesSlide1.xml", "<notes>private review note</notes>"],
      ["ppt/embeddings/Workbook1.xlsx", Buffer.from([0, 1, 2, 3])],
    ]);
    await writeFile(path.join(root, attachmentPath), attachment);

    let audit = runTool(root, ["handoff-audit", "--audience", "internal", "--json"]);
    assert.equal(audit.status, 0, audit.stderr);
    let report = JSON.parse(audit.stdout);
    assert.deepEqual(report.summary, {
      total: 1,
      confirmed: 0,
      unknown: 1,
      denied: 0,
      metadataVisible: 1,
    });
    assert.deepEqual(report.attachments[0].metadata.creators, ["Fixture Author"]);
    assert.deepEqual(report.attachments[0].metadata.lastModifiedBy, ["Fixture Editor"]);
    assert.deepEqual(report.attachments[0].metadata.company, ["Fixture Company"]);
    assert.deepEqual(report.attachments[0].metadata.manager, ["Fixture Manager"]);
    assert.equal(report.attachments[0].metadata.speakerNoteCount, 1);
    assert.equal(report.attachments[0].metadata.embeddedFileCount, 1);
    assert.equal(report.warnings.length, 1);

    audit = runTool(root, ["handoff-audit", "--audience", "external", "--json"]);
    assert.notEqual(audit.status, 0);
    report = JSON.parse(audit.stdout);
    assert.equal(report.errors.length, 1);
    assert.match(audit.stderr, /Handoff attachment audit failed/);

    await writeJson(path.join(root, "knowledge/attachment-distribution.json"), {
      $schema: "./schemas/attachment-distribution.schema.json",
      schemaVersion: 2,
      items: [{
        path: attachmentPath,
        authorization: "confirmed",
        allowedAudiences: ["internal", "external"],
        basis: "Fixture record intentionally omits its content digest.",
        reviewedAt: new Date().toISOString().slice(0, 10),
        reviewer: "fixture-reviewer",
      }],
    });
    const missingDigest = runTool(root, ["validate"]);
    assert.notEqual(missingDigest.status, 0);
    assert.match(missingDigest.stderr, /Attachment distribution policy\.items\[0\]\.sha256 is required/);

    await writeJson(path.join(root, "knowledge/attachment-distribution.json"), {
      $schema: "./schemas/attachment-distribution.schema.json",
      schemaVersion: 2,
      items: [{
        path: attachmentPath,
        sha256: sha256(attachment),
        authorization: "confirmed",
        allowedAudiences: ["internal", "external"],
        basis: "Fixture owner explicitly authorized redistribution.",
        reviewedAt: new Date().toISOString().slice(0, 10),
        reviewer: "fixture-reviewer",
      }],
    });
    audit = runTool(root, ["handoff-audit", "--audience", "external", "--json"]);
    assert.equal(audit.status, 0, audit.stderr);
    report = JSON.parse(audit.stdout);
    assert.equal(report.summary.confirmed, 1);
    assert.equal(report.errors.length, 0);

    const output = path.join(root, "external.zip");
    const packaged = runTool(root, ["package", "--audience", "external", "--output", output]);
    assert.equal(packaged.status, 0, packaged.stderr);
    const entries = storedZipEntries(await fs.readFile(output));
    const manifest = JSON.parse(entries.get("PORTABLE-MANIFEST.json").toString("utf8"));
    assert.equal(manifest.distributionAudience, "external");
    assert.equal(manifest.attachmentAudit.summary.confirmed, 1);
    assert.deepEqual(
      manifest.attachmentAudit.attachments[0].metadata.creators,
      ["Fixture Author"],
    );

    const replacementAttachment = Buffer.concat([attachment, Buffer.from("replacement bytes")]);
    await writeFile(path.join(root, attachmentPath), replacementAttachment);
    audit = runTool(root, ["handoff-audit", "--audience", "external", "--json"]);
    assert.notEqual(audit.status, 0);
    report = JSON.parse(audit.stdout);
    assert.equal(report.summary.confirmed, 0);
    assert.equal(report.summary.unknown, 1);
    assert.equal(report.attachments[0].authorizationMatch, false);
    assert.equal(report.attachments[0].sha256, sha256(replacementAttachment));
    assert.equal(report.attachments[0].policySha256, sha256(attachment));
    assert.match(report.errors[0], /content SHA-256 does not match/);

    audit = runTool(root, ["handoff-audit", "--audience", "internal", "--json"]);
    assert.equal(audit.status, 0, audit.stderr);
    report = JSON.parse(audit.stdout);
    assert.equal(report.summary.unknown, 1);
    assert.match(report.warnings[0], /content SHA-256 does not match/);

    await writeJson(path.join(root, "knowledge/attachment-distribution.json"), {
      $schema: "./schemas/attachment-distribution.schema.json",
      schemaVersion: 2,
      items: [{
        path: attachmentPath,
        sha256: sha256(replacementAttachment),
        authorization: "denied",
        allowedAudiences: [],
        basis: "Fixture denial.",
        reviewedAt: new Date().toISOString().slice(0, 10),
        reviewer: "fixture-reviewer",
      }],
    });
    const denied = runTool(root, ["handoff-audit", "--audience", "internal"]);
    assert.notEqual(denied.status, 0);
    assert.match(denied.stderr, /Attachment distribution is denied/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("handoff metadata inspection caps deflated ZIP output", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-contract-handoff-inflate-"));
  try {
    await createFixture(root);
    const attachmentPath = "docs/attachments/oversized-metadata.pptx";
    const archive = deflatedZip(
      "docProps/core.xml",
      Buffer.alloc(5 * 1024 * 1024, 0x41),
      1,
    );
    await writeFile(path.join(root, attachmentPath), archive);

    const audit = runTool(root, ["handoff-audit", "--audience", "internal", "--json"]);
    assert.equal(audit.status, 0, audit.stderr);
    const report = JSON.parse(audit.stdout);
    assert.equal(report.attachments[0].metadata.inspection, "error");
    assert.match(
      report.attachments[0].metadata.inspectionError,
      /larger than 4194304 bytes|maxOutputLength|Cannot create a Buffer/i,
    );
    assert.ok(report.warnings.some((warning) => /metadata could not be inspected/.test(warning)));
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("Git packaging uses the staged index, rejects hidden state, and only admits an explicit binding", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-contract-git-"));
  try {
    await createFixture(root);
    await initializeGitFixture(root);
    const output = path.join(root, "portable.zip");
    const untrackedSecret = path.join(root, "docs/untracked-secret.txt");
    await writeFile(untrackedSecret, `sk-${"x".repeat(32)}\n`);
    await writeJson(path.join(root, ".openai/hosting.json"), { site: "explicit-fixture" });

    let packaged = runTool(root, ["package", "--output", output]);
    assert.equal(packaged.status, 0, packaged.stderr);
    let entries = storedZipEntries(await fs.readFile(output));
    assert.ok(!entries.has("docs/untracked-secret.txt"));
    assert.ok(!entries.has(".openai/hosting.json"));

    await writeFile(path.join(root, "docs/staged-new.txt"), "STAGED\n");
    requireGit(root, ["add", "docs/staged-new.txt"]);
    packaged = runTool(root, ["package", "--output", output]);
    assert.equal(packaged.status, 0, packaged.stderr);
    entries = storedZipEntries(await fs.readFile(output));
    assert.equal(entries.get("docs/staged-new.txt").toString("utf8"), "STAGED\n");

    await writeFile(path.join(root, "docs/staged-new.txt"), `sk-${"y".repeat(32)}\n`);
    requireGit(root, ["add", "docs/staged-new.txt"]);
    const stagedSecret = runTool(root, ["package", "--output", output]);
    assert.notEqual(stagedSecret.status, 0);
    assert.match(stagedSecret.stderr, /secret token: docs\/staged-new\.txt/);
    await writeFile(path.join(root, "docs/staged-new.txt"), "STAGED\n");
    requireGit(root, ["add", "docs/staged-new.txt"]);

    await writeFile(path.join(root, "docs/kept.txt"), "UNSTAGED\n");
    const unstaged = runTool(root, ["package", "--output", output]);
    assert.notEqual(unstaged.status, 0);
    assert.match(unstaged.stderr, /all tracked changes to be staged/);
    await writeFile(path.join(root, "docs/kept.txt"), "KEPT\n");

    requireGit(root, ["update-index", "--assume-unchanged", "docs/kept.txt"]);
    const assumed = runTool(root, ["package", "--output", output]);
    assert.notEqual(assumed.status, 0);
    assert.match(assumed.stderr, /skip-worktree or assume-unchanged: docs\/kept\.txt/);
    requireGit(root, ["update-index", "--no-assume-unchanged", "docs/kept.txt"]);

    requireGit(root, ["update-index", "--skip-worktree", "docs/kept.txt"]);
    const skipped = runTool(root, ["package", "--output", output]);
    assert.notEqual(skipped.status, 0);
    assert.match(skipped.stderr, /skip-worktree or assume-unchanged: docs\/kept\.txt/);
    requireGit(root, ["update-index", "--no-skip-worktree", "docs/kept.txt"]);

    packaged = runTool(root, ["package", "--include-site-binding", "--output", output]);
    assert.equal(packaged.status, 0, packaged.stderr);
    entries = storedZipEntries(await fs.readFile(output));
    assert.ok(entries.has(".openai/hosting.json"));
    assert.ok(!entries.has("docs/untracked-secret.txt"));

    requireGit(root, ["rm", "--cached", "knowledge/schemas/release.schema.json"]);
    const missingRequired = runTool(root, ["package", "--output", output]);
    assert.notEqual(missingRequired.status, 0);
    assert.match(missingRequired.stderr, /missing required file: knowledge\/schemas\/release\.schema\.json/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("no-Git packaging scans every included text source for local paths and credentials", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-contract-no-git-"));
  try {
    await createFixture(root);
    const output = path.join(root, "portable.zip");
    const leak = path.join(root, "docs/leak.txt");
    await writeFile(leak, `sk-${"z".repeat(32)}\n`);
    let packaged = runTool(root, ["package", "--output", output]);
    assert.notEqual(packaged.status, 0);
    assert.match(packaged.stderr, /secret token: docs\/leak\.txt/);

    await writeFile(leak, ["", "Users", "fixture-user", "private", "note.txt"].join("/"));
    packaged = runTool(root, ["package", "--output", output]);
    assert.notEqual(packaged.status, 0);
    assert.match(packaged.stderr, /host-local absolute path: docs\/leak\.txt/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("hook validation requires the exact synchronous canonical structure and command hash", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-contract-hooks-"));
  try {
    await createFixture(root);
    const hooksFile = path.join(root, ".codex/hooks.json");
    const canonical = JSON.parse(await fs.readFile(hooksFile, "utf8"));
    let hooks = structuredClone(canonical);
    hooks.hooks.Stop[0].hooks[0].command += " ";
    hooks.hooks.Stop[0].hooks[0].commandWindows += " ";
    await writeJson(hooksFile, hooks);
    let validation = runTool(root, ["validate"]);
    assert.notEqual(validation.status, 0);
    assert.match(validation.stderr, /canonical SHA-256/);

    hooks = structuredClone(canonical);
    hooks.hooks.Stop[0].hooks[0].async = true;
    await writeJson(hooksFile, hooks);
    validation = runTool(root, ["validate"]);
    assert.notEqual(validation.status, 0);
    assert.match(validation.stderr, /handler keys do not match the canonical synchronous command hook/);

    hooks = structuredClone(canonical);
    hooks.hooks.Stop[0].matcher = "*";
    await writeJson(hooksFile, hooks);
    validation = runTool(root, ["validate"]);
    assert.notEqual(validation.status, 0);
    assert.match(validation.stderr, /without matcher or disable fields/);

    hooks = structuredClone(canonical);
    hooks.hooks.SessionStart = [];
    await writeJson(hooksFile, hooks);
    validation = runTool(root, ["validate"]);
    assert.notEqual(validation.status, 0);
    assert.match(validation.stderr, /Hook events must be exactly UserPromptSubmit and Stop/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("processed capture requires intact payloads, processable completeness, and a traced real result", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-contract-mark-"));
  try {
    await createFixture(root);
    const captureState = await createCapture(root);
    await writeJson(path.join(root, "knowledge/private-inbox/.runtime/candidates/index.json"), {
      schemaVersion: 1,
      items: [candidate(captureState.turnKey)],
    });

    const marked = runTool(root, ["mark", captureState.capture.captureId, "processed", "candidate:candidate-one"]);
    assert.equal(marked.status, 0, marked.stderr);
    let envelope = JSON.parse(await fs.readFile(captureState.captureFile, "utf8"));
    assert.equal(envelope.curation.result, "candidate:candidate-one");
    assert.ok(Number.isFinite(Date.parse(envelope.curation.resultVerifiedAt)));

    const old = "2000-01-01T00:00:00.000Z";
    envelope.curation.updatedAt = old;
    envelope.updatedAt = old;
    await writeJson(captureState.captureFile, envelope);
    await fs.unlink(path.join(root, "knowledge/private-inbox/.runtime/candidates/index.json"));
    const retained = runTool(root, ["inbox", "--json"]);
    assert.equal(retained.status, 0, retained.stderr);
    const retention = JSON.parse(retained.stdout).retention;
    assert.equal(retention.purgedCaptures, 0);
    assert.equal(retention.overdueUnresolved, 1);
    assert.equal(
      await fs.readFile(path.join(captureState.runtime, captureState.userPath), "utf8"),
      "user payload",
    );
    const invalidated = runTool(root, ["validate"]);
    assert.notEqual(invalidated.status, 0);
    assert.match(invalidated.stderr, /processed result does not exist/);
    await writeJson(path.join(root, "knowledge/private-inbox/.runtime/candidates/index.json"), {
      schemaVersion: 1,
      items: [candidate(captureState.turnKey)],
    });

    envelope = JSON.parse(await fs.readFile(captureState.captureFile, "utf8"));
    envelope.updatedAt = new Date().toISOString();
    envelope.curation = { status: "pending", result: null, reason: null };
    await writeJson(captureState.captureFile, envelope);
    const today = new Date().toISOString().slice(0, 10);
    await writeJson(path.join(root, "knowledge/claims/index.json"), {
      schemaVersion: 1,
      items: [{
        id: "claim-one",
        claim: "A claim result must trace back to the capture being processed.",
        scope: "contract fixture",
        sourceIds: ["known-source"],
        evidenceGrade: "A",
        verifiedAt: today,
        reviewBy: addDays(today, 30),
        reviewCadenceDays: 30,
        owner: "fixture",
        status: "watch",
        derivedFrom: [`t_${"9".repeat(32)}`],
      }],
    });
    const untracedClaim = runTool(root, ["mark", envelope.captureId, "processed", "claim:claim-one"]);
    assert.notEqual(untracedClaim.status, 0);
    assert.match(untracedClaim.stderr, /result does not trace back/);
    await writeJson(path.join(root, "knowledge/claims/index.json"), { schemaVersion: 1, items: [] });

    await writeJson(path.join(root, "knowledge/private-inbox/.runtime/candidates/index.json"), {
      schemaVersion: 1,
      items: [candidate(captureState.turnKey, { integratedResultIds: ["module:known-module"] })],
    });
    const fakeIntegration = runTool(root, ["mark", envelope.captureId, "processed", "module:known-module"]);
    assert.notEqual(fakeIntegration.status, 0);
    assert.match(fakeIntegration.stderr, /cannot declare integratedResultIds before integrated/);
    await writeJson(path.join(root, "knowledge/private-inbox/.runtime/candidates/index.json"), {
      schemaVersion: 1,
      items: [candidate(captureState.turnKey)],
    });

    envelope.messages.user.path = "user-messages/../candidates/index.json";
    await writeJson(captureState.captureFile, envelope);
    const escapedPayload = runTool(
      root,
      ["mark", envelope.captureId, "processed", "candidate:candidate-one"],
    );
    assert.notEqual(escapedPayload.status, 0);
    assert.match(escapedPayload.stderr, /invalid private payload path/);
    envelope.messages.user.path = captureState.userPath;
    await writeJson(captureState.captureFile, envelope);

    await fs.writeFile(path.join(captureState.runtime, captureState.userPath), "tampered");
    const tampered = runTool(root, ["mark", envelope.captureId, "processed", "candidate:candidate-one"]);
    assert.notEqual(tampered.status, 0);
    assert.match(tampered.stderr, /byte count does not match|SHA-256 does not match/);

    await fs.writeFile(path.join(captureState.runtime, captureState.userPath), "user payload");
    envelope.completeness = "prompt-only";
    await writeJson(captureState.captureFile, envelope);
    const partial = runTool(root, ["mark", envelope.captureId, "processed", "candidate:candidate-one"]);
    assert.notEqual(partial.status, 0);
    assert.match(partial.stderr, /cannot be processed/);

    envelope.completeness = "visible-messages";
    await writeJson(captureState.captureFile, envelope);
    const missing = runTool(root, ["mark", envelope.captureId, "processed", "candidate:missing"]);
    assert.notEqual(missing.status, 0);
    assert.match(missing.stderr, /result does not exist/);

    const remarked = runTool(root, ["mark", envelope.captureId, "processed", "candidate:candidate-one"]);
    assert.equal(remarked.status, 0, remarked.stderr);
    envelope = JSON.parse(await fs.readFile(captureState.captureFile, "utf8"));
    delete envelope.curation.resultVerifiedAt;
    await writeJson(captureState.captureFile, envelope);
    const unverified = runTool(root, ["validate"]);
    assert.notEqual(unverified.status, 0);
    assert.match(unverified.stderr, /needs resultVerifiedAt/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("inbox, mark, and validate fail closed on private-runtime symlinks", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-contract-symlink-"));
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), "portable-contract-outside-"));
  try {
    await createFixture(root);
    const runtime = path.join(root, "knowledge/private-inbox/.runtime");
    await writeJson(path.join(outside, "outside.json"), { private: true });
    await fs.mkdir(runtime, { recursive: true });
    try {
      await fs.symlink(outside, path.join(runtime, "captures"), "junction");
    } catch (error) {
      if (["EPERM", "EACCES", "ENOTSUP"].includes(error?.code)) {
        context.skip(`symlinks unavailable: ${error.code}`);
        return;
      }
      throw error;
    }

    for (const [command, args] of [
      ["inbox", ["inbox", "--json"]],
      ["mark", ["mark", `cap_${"3".repeat(32)}`, "pending"]],
      ["validate", ["validate"]],
    ]) {
      const result = runTool(root, args);
      assert.notEqual(result.status, 0, `${command} followed an internal capture symlink`);
      assert.match(result.stderr, /Unsafe private runtime path/);
    }

    await fs.unlink(path.join(runtime, "captures"));
    const captureState = await createCapture(root);
    await writeJson(path.join(runtime, "candidates/index.json"), {
      schemaVersion: 1,
      items: [candidate(captureState.turnKey)],
    });
    const outsidePayload = path.join(outside, "payload.txt");
    await fs.writeFile(outsidePayload, "user payload");
    await fs.unlink(path.join(runtime, captureState.userPath));
    await fs.symlink(outsidePayload, path.join(runtime, captureState.userPath));

    const inbox = runTool(root, ["inbox", "--json"]);
    const mark = runTool(
      root,
      ["mark", captureState.capture.captureId, "processed", "candidate:candidate-one"],
    );
    const validation = runTool(root, ["validate"]);
    for (const result of [inbox, mark, validation]) {
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Unsafe private runtime path|private payload is missing or unreadable/);
    }
  } finally {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  }
});

test("candidate, claim, and release registries enforce deduplication, evidence, cadence, and real IDs", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "portable-contract-registry-"));
  try {
    await createFixture(root);
    const today = new Date().toISOString().slice(0, 10);
    const portableTurnId = `t_${"9".repeat(32)}`;
    await writeJson(path.join(root, "knowledge/claims/index.json"), {
      schemaVersion: 1,
      items: [{
        id: "portable-claim",
        claim: "A portable claim may retain hashed provenance without its private inbox.",
        scope: "contract fixture",
        sourceIds: ["known-source"],
        evidenceGrade: "A",
        verifiedAt: today,
        reviewBy: addDays(today, 30),
        reviewCadenceDays: 30,
        owner: "fixture",
        status: "watch",
        derivedFrom: [portableTurnId],
      }],
    });
    let validation = runTool(root, ["validate"]);
    assert.equal(validation.status, 0, validation.stderr);

    const captureState = await createCapture(root);
    const { turnKey } = captureState;
    validation = runTool(root, ["validate"]);
    assert.equal(validation.status, 0, validation.stderr);
    const secondSession = `s_${"4".repeat(32)}`;
    const secondTurn = `t_${"5".repeat(32)}`;
    const reusedPayloadCapture = {
      ...captureState.capture,
      captureId: `cap_${"6".repeat(32)}`,
      sessionKey: secondSession,
      turnKey: secondTurn,
    };
    const reusedCaptureFile = path.join(
      captureState.runtime,
      "captures",
      secondSession,
      `${secondTurn}.json`,
    );
    await writeJson(reusedCaptureFile, reusedPayloadCapture);
    validation = runTool(root, ["validate"]);
    assert.notEqual(validation.status, 0);
    assert.match(validation.stderr, /reuses payload owned by private capture/);
    await fs.unlink(reusedCaptureFile);

    await writeJson(path.join(root, "knowledge/claims/index.json"), { schemaVersion: 1, items: [] });

    const first = candidate(turnKey);
    const second = candidate(turnKey, { id: "candidate-two" });
    await writeJson(path.join(root, "knowledge/private-inbox/.runtime/candidates/index.json"), {
      schemaVersion: 1,
      items: [first, second],
    });
    validation = runTool(root, ["validate"]);
    assert.notEqual(validation.status, 0);
    assert.match(validation.stderr, /duplicate contentHash/);

    await writeJson(path.join(root, "knowledge/private-inbox/.runtime/candidates/index.json"), {
      schemaVersion: 1,
      items: [candidate(turnKey, { status: "ready" })],
    });
    validation = runTool(root, ["validate"]);
    assert.notEqual(validation.status, 0);
    assert.match(validation.stderr, /non-sensitive and public-candidate/);
    assert.match(validation.stderr, /decision note/);
    assert.match(validation.stderr, /current A\/B source or claim/);

    const integrated = {
      status: "integrated",
      visibility: "public-candidate",
      decision: "Verified and integrated.",
      sourceIds: ["known-source"],
      integratedResultIds: ["source:known-source"],
    };
    await writeJson(path.join(root, "knowledge/private-inbox/.runtime/candidates/index.json"), {
      schemaVersion: 1,
      items: [candidate(turnKey, integrated)],
    });
    validation = runTool(root, ["validate"]);
    assert.equal(validation.status, 0, validation.stderr);

    await writeJson(path.join(root, "knowledge/private-inbox/.runtime/candidates/index.json"), {
      schemaVersion: 1,
      items: [candidate(turnKey, { ...integrated, integratedResultIds: ["module:known-module"] })],
    });
    validation = runTool(root, ["validate"]);
    assert.notEqual(validation.status, 0);
    assert.match(validation.stderr, /moduleId must equal integrated module known-module/);

    await writeJson(path.join(root, "knowledge/private-inbox/.runtime/candidates/index.json"), {
      schemaVersion: 1,
      items: [candidate(turnKey, {
        ...integrated,
        moduleId: "known-module",
        integratedResultIds: ["module:known-module"],
      })],
    });
    validation = runTool(root, ["validate"]);
    assert.equal(validation.status, 0, validation.stderr);

    await fs.rm(path.join(root, "knowledge/private-inbox/.runtime/candidates/index.json"));
    await writeJson(path.join(root, "knowledge/claims/index.json"), {
      schemaVersion: 1,
      items: [{
        id: "claim-one",
        claim: "A testable claim.",
        scope: "contract fixture",
        sourceIds: ["known-source"],
        evidenceGrade: "A",
        verifiedAt: today,
        reviewBy: addDays(today, 31),
        reviewCadenceDays: 30,
        owner: "fixture",
        status: "watch",
        derivedFrom: [turnKey],
      }],
    });
    validation = runTool(root, ["validate"]);
    assert.notEqual(validation.status, 0);
    assert.match(validation.stderr, /exceeds its 30-day cadence/);

    const scheduledFor = addDays(today, 7);
    const currentClaim = {
      id: "claim-current",
      claim: "The current standard remains effective until the announced replacement is verified.",
      scope: "contract fixture",
      sourceIds: ["known-source"],
      evidenceGrade: "A",
      verifiedAt: today,
      reviewBy: addDays(today, 30),
      reviewCadenceDays: 30,
      owner: "fixture",
      status: "watch",
    };
    const announcedReplacement = {
      id: "claim-announcement",
      claim: "A replacement release candidate has been announced for a future date.",
      scope: "The announcement is not yet an effective final standard.",
      sourceIds: ["known-source"],
      evidenceGrade: "A",
      verifiedAt: today,
      reviewBy: scheduledFor,
      reviewCadenceDays: 30,
      owner: "fixture",
      status: "watch",
      announcement: {
        kind: "scheduled-replacement",
        targetClaimId: "claim-current",
        scheduledFor,
      },
    };
    await writeJson(path.join(root, "knowledge/claims/index.json"), {
      schemaVersion: 1,
      items: [currentClaim, announcedReplacement],
    });
    validation = runTool(root, ["validate"]);
    assert.notEqual(validation.status, 0);
    assert.match(validation.stderr, /claim-current reviewBy exceeds announced replacement date/);

    await writeJson(path.join(root, "knowledge/claims/index.json"), {
      schemaVersion: 1,
      items: [{ ...currentClaim, reviewBy: scheduledFor }, announcedReplacement],
    });
    validation = runTool(root, ["validate"]);
    assert.equal(validation.status, 0, validation.stderr);

    await writeJson(path.join(root, "knowledge/claims/index.json"), { schemaVersion: 1, items: [] });
    await writeJson(path.join(root, "knowledge/release-manifest.json"), {
      $schema: "./schemas/release.schema.json",
      schemaVersion: 1,
      releases: [{
        id: "rel_contract-one",
        mode: "sites",
        status: "deployed",
        projectId: "portable-contract-test",
        createdAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
        commitSha: "a".repeat(40),
        archiveSha256: null,
        archiveBytes: null,
        archiveFileCount: null,
        siteBindingIncluded: true,
        versionId: "version-one",
        publicUrl: "https://example.test",
        qualityCommands: QUALITY_COMMANDS,
        knowledgeResults: ["module:missing"],
      }],
    });
    validation = runTool(root, ["validate"]);
    assert.notEqual(validation.status, 0);
    assert.match(validation.stderr, /missing or non-public knowledge result: module:missing/);

    const manifest = JSON.parse(await fs.readFile(path.join(root, "knowledge/release-manifest.json"), "utf8"));
    manifest.releases[0].knowledgeResults = ["module:known-module"];
    await writeJson(path.join(root, "knowledge/release-manifest.json"), manifest);
    validation = runTool(root, ["validate"]);
    assert.equal(validation.status, 0, validation.stderr);

    manifest.releases[0].knowledgeResults = [];
    await writeJson(path.join(root, "knowledge/release-manifest.json"), manifest);
    validation = runTool(root, ["validate"]);
    assert.equal(validation.status, 0, validation.stderr);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
