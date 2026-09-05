import { promises as fs } from "node:fs";
import path from "node:path";
import { INDEX_FILE_MODIFIED_AT, REQUIRED_PORTABLE_FILES, REQUIRED_PORTABLE_ROOTS } from "./constants.mjs";
import { exists, hash, portablePath, qualityCommands, sameStringArray } from "./context.mjs";
import { auditPortableAttachments, attachmentAuditManifest } from "./attachments.mjs";
import { excluded } from "./source-collection.mjs";

function crcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
    }
    table[index] = value >>> 0;
  }
  return table;
}

const CRC_TABLE = crcTable();

function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function localHeader({ name, data, crc, modified }) {
  const header = Buffer.alloc(30);
  const { time, day } = dosDateTime(modified);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(time, 10);
  header.writeUInt16LE(day, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return header;
}

function centralHeader({ name, data, crc, modified, offset }) {
  const header = Buffer.alloc(46);
  const { time, day } = dosDateTime(modified);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(0x031e, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0800, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(time, 12);
  header.writeUInt16LE(day, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(data.length, 20);
  header.writeUInt32LE(data.length, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE((0o100644 << 16) >>> 0, 38);
  header.writeUInt32LE(offset, 42);
  return header;
}

export async function createZip(entries, outputFile) {
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.relative, "utf8");
    const crc = crc32(entry.data);
    const local = localHeader({ ...entry, name, crc });
    locals.push(local, name, entry.data);
    centrals.push(centralHeader({ ...entry, name, crc, offset }), name);
    offset += local.length + name.length + entry.data.length;
  }

  const centralDirectory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  const temporary = `${outputFile}.tmp-${process.pid}-${Date.now()}`;
  try {
    await fs.writeFile(temporary, Buffer.concat([...locals, centralDirectory, end]));
    return temporary;
  } catch (error) {
    await fs.rm(temporary, { force: true });
    throw error;
  }
}

async function assertReplaceableFile(file) {
  try {
    const stat = await fs.lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new Error(`Portable output target must be a regular file when it exists: ${file}`);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

export async function publishArchivePair(archiveTemporary, outputFile, sidecarTemporary, sidecar) {
  await assertReplaceableFile(outputFile);
  await assertReplaceableFile(sidecar);
  const nonce = `${process.pid}-${Date.now()}`;
  const archiveBackup = `${outputFile}.backup-${nonce}`;
  const sidecarBackup = `${sidecar}.backup-${nonce}`;
  let archiveBackedUp = false;
  let sidecarBackedUp = false;
  let archiveInstalled = false;
  let sidecarInstalled = false;

  try {
    if (await exists(outputFile)) {
      await fs.rename(outputFile, archiveBackup);
      archiveBackedUp = true;
    }
    if (await exists(sidecar)) {
      await fs.rename(sidecar, sidecarBackup);
      sidecarBackedUp = true;
    }
    await fs.rename(archiveTemporary, outputFile);
    archiveInstalled = true;
    if (process.env.NODE_ENV === "test"
      && process.env.PORTABLE_KB_TEST_FAIL_PUBLISH === "after-archive") {
      throw new Error("Injected portable publish failure after archive install");
    }
    await fs.rename(sidecarTemporary, sidecar);
    sidecarInstalled = true;
  } catch (error) {
    if (archiveInstalled) await fs.rm(outputFile, { force: true });
    if (sidecarInstalled) await fs.rm(sidecar, { force: true });
    if (archiveBackedUp) await fs.rename(archiveBackup, outputFile);
    if (sidecarBackedUp) await fs.rename(sidecarBackup, sidecar);
    throw error;
  }

  if (archiveBackedUp) await fs.rm(archiveBackup, { force: true });
  if (sidecarBackedUp) await fs.rm(sidecarBackup, { force: true });
}

export function verifyPortableZip(archive, config, includeSiteBinding, audience) {
  const endOffset = archive.length - 22;
  if (endOffset < 0 || archive.readUInt32LE(endOffset) !== 0x06054b50) {
    throw new Error("Portable ZIP is missing a valid end-of-central-directory record");
  }
  const entryCount = archive.readUInt16LE(endOffset + 10);
  const centralSize = archive.readUInt32LE(endOffset + 12);
  const centralOffset = archive.readUInt32LE(endOffset + 16);
  if (centralOffset + centralSize !== endOffset) {
    throw new Error("Portable ZIP central-directory size or offset is invalid");
  }

  const entries = new Map();
  let offset = centralOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > endOffset || archive.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error("Portable ZIP contains an invalid central-directory entry");
    }
    const flags = archive.readUInt16LE(offset + 8);
    const origin = archive.readUInt16LE(offset + 4) >>> 8;
    const method = archive.readUInt16LE(offset + 10);
    const expectedCrc = archive.readUInt32LE(offset + 16);
    const compressedSize = archive.readUInt32LE(offset + 20);
    const size = archive.readUInt32LE(offset + 24);
    const nameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    const localOffset = archive.readUInt32LE(offset + 42);
    const name = archive.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    offset += 46 + nameLength + extraLength + commentLength;

    if (origin !== 3 || (flags & 0x0800) === 0 || (flags & 0x0001) !== 0
      || method !== 0 || size !== compressedSize) {
      throw new Error(`Portable ZIP entry uses unsupported flags or compression: ${name}`);
    }
    if (!name || name.includes("\\") || name.includes("\0") || path.posix.isAbsolute(name)
      || path.posix.normalize(name) !== name || name.startsWith("../")) {
      throw new Error(`Portable ZIP entry has an unsafe path: ${name}`);
    }
    if (entries.has(name)) throw new Error(`Portable ZIP contains duplicate entry: ${name}`);
    if (localOffset + 30 > centralOffset || archive.readUInt32LE(localOffset) !== 0x04034b50) {
      throw new Error(`Portable ZIP entry has an invalid local header: ${name}`);
    }
    const localNameLength = archive.readUInt16LE(localOffset + 26);
    const localExtraLength = archive.readUInt16LE(localOffset + 28);
    const localName = archive
      .subarray(localOffset + 30, localOffset + 30 + localNameLength)
      .toString("utf8");
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataStart + size;
    if (localName !== name || dataEnd > centralOffset) {
      throw new Error(`Portable ZIP local entry does not match its central record: ${name}`);
    }
    const data = archive.subarray(dataStart, dataEnd);
    if (crc32(data) !== expectedCrc
      || archive.readUInt32LE(localOffset + 14) !== expectedCrc
      || archive.readUInt32LE(localOffset + 18) !== size
      || archive.readUInt32LE(localOffset + 22) !== size) {
      throw new Error(`Portable ZIP CRC or size verification failed: ${name}`);
    }
    entries.set(name, data);
  }
  if (offset !== endOffset || entries.size !== entryCount) {
    throw new Error("Portable ZIP entry count does not match its central directory");
  }

  const manifestData = entries.get("PORTABLE-MANIFEST.json");
  if (!manifestData) throw new Error("Portable ZIP is missing PORTABLE-MANIFEST.json");
  let manifest;
  try {
    manifest = JSON.parse(manifestData.toString("utf8"));
  } catch {
    throw new Error("Portable ZIP manifest is invalid JSON");
  }
  if (manifest.schemaVersion !== 1
    || manifest.projectId !== config.project.id
    || !Number.isFinite(Date.parse(manifest.generatedAt ?? ""))
    || manifest.siteBindingIncluded !== includeSiteBinding
    || manifest.distributionAudience !== audience
    || !sameStringArray(manifest.qualityCommands, qualityCommands(config))
    || !Array.isArray(manifest.files)
    || !manifest.attachmentAudit) {
    throw new Error("Portable ZIP manifest contract is invalid");
  }
  const manifestPaths = new Set();
  for (const file of manifest.files) {
    if (!file || typeof file.path !== "string" || manifestPaths.has(file.path)) {
      throw new Error("Portable ZIP manifest contains an invalid or duplicate path");
    }
    if (excluded(file.path, config, includeSiteBinding)) {
      throw new Error(`Portable ZIP manifest contains an excluded path: ${file.path}`);
    }
    manifestPaths.add(file.path);
    const data = entries.get(file.path);
    if (!data || data.length !== file.bytes || hash(data) !== file.sha256) {
      throw new Error(`Portable ZIP manifest integrity failed: ${file.path}`);
    }
  }
  const archivePaths = [...entries.keys()].filter((name) => name !== "PORTABLE-MANIFEST.json");
  if (archivePaths.length !== manifestPaths.size
    || archivePaths.some((name) => !manifestPaths.has(name))) {
    throw new Error("Portable ZIP manifest does not describe every archive entry exactly once");
  }
  for (const requiredFile of REQUIRED_PORTABLE_FILES) {
    if (!manifestPaths.has(requiredFile)) {
      throw new Error(`Portable ZIP is missing required file: ${requiredFile}`);
    }
  }
  for (const requiredRoot of REQUIRED_PORTABLE_ROOTS) {
    if (![...manifestPaths].some((name) => name.startsWith(`${requiredRoot}/`))) {
      throw new Error(`Portable ZIP is missing required root content: ${requiredRoot}`);
    }
  }
  const privateInbox = portablePath(config.capture.privateInbox);
  if ([...manifestPaths].some((name) => name === privateInbox || name.startsWith(`${privateInbox}/`))) {
    throw new Error("Portable ZIP manifest contains private inbox data");
  }
  if (!includeSiteBinding && manifestPaths.has(portablePath(config.publishing.sites.binding))) {
    throw new Error("Portable ZIP manifest contains the personal Sites binding");
  }
  if (includeSiteBinding && !manifestPaths.has(portablePath(config.publishing.sites.binding))) {
    throw new Error("Portable ZIP manifest is missing the explicitly requested Sites binding");
  }
  const archiveSources = [...entries.entries()]
    .filter(([name]) => name !== "PORTABLE-MANIFEST.json")
    .map(([relative, data]) => ({ relative, data, modified: INDEX_FILE_MODIFIED_AT }));
  const attachmentAudit = auditPortableAttachments(config, archiveSources, audience);
  if (attachmentAudit.errors.length > 0
    || JSON.stringify(manifest.attachmentAudit) !== JSON.stringify(attachmentAuditManifest(attachmentAudit))) {
    throw new Error("Portable ZIP attachment audit does not match its manifest");
  }
  return manifest;
}
