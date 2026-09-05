import path from "node:path";
import { inflateRawSync } from "node:zlib";
import { HANDOFF_AUDIENCES, OFFICE_ATTACHMENT_EXTENSIONS } from "./constants.mjs";
import { hash, portablePath } from "./context.mjs";
import { isConfiguredAttachmentPath } from "./source-collection.mjs";

export function findZipEndRecord(data) {
  const minimum = Math.max(0, data.length - 65_557);
  for (let offset = data.length - 22; offset >= minimum; offset -= 1) {
    if (data.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error("ZIP end record is missing");
}

export function attachmentZipEntries(data) {
  const end = findZipEndRecord(data);
  const count = data.readUInt16LE(end + 10);
  const centralSize = data.readUInt32LE(end + 12);
  const centralOffset = data.readUInt32LE(end + 16);
  if (centralOffset + centralSize > end) throw new Error("ZIP central directory is invalid");
  const entries = new Map();
  let offset = centralOffset;
  for (let index = 0; index < count; index += 1) {
    if (offset + 46 > end || data.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error("ZIP central entry is invalid");
    }
    const flags = data.readUInt16LE(offset + 8);
    const method = data.readUInt16LE(offset + 10);
    const compressedSize = data.readUInt32LE(offset + 20);
    const size = data.readUInt32LE(offset + 24);
    const nameLength = data.readUInt16LE(offset + 28);
    const extraLength = data.readUInt16LE(offset + 30);
    const commentLength = data.readUInt16LE(offset + 32);
    const localOffset = data.readUInt32LE(offset + 42);
    const nameEnd = offset + 46 + nameLength;
    if (nameEnd > end || localOffset + 30 > centralOffset) {
      throw new Error("ZIP entry bounds are invalid");
    }
    const name = data.subarray(offset + 46, nameEnd).toString("utf8");
    if (!name || name.includes("\\") || path.posix.isAbsolute(name)
      || path.posix.normalize(name) !== name || name.startsWith("../")) {
      throw new Error("ZIP entry path is unsafe");
    }
    if ((flags & 0x0001) !== 0) throw new Error("Encrypted ZIP metadata is unsupported");
    entries.set(name, { method, compressedSize, size, localOffset });
    offset = nameEnd + extraLength + commentLength;
  }
  return entries;
}

export function readAttachmentZipEntry(archive, entry) {
  if (!entry) return null;
  if (entry.size > 4 * 1024 * 1024 || entry.compressedSize > 4 * 1024 * 1024) {
    throw new Error("Attachment metadata entry is too large");
  }
  const nameLength = archive.readUInt16LE(entry.localOffset + 26);
  const extraLength = archive.readUInt16LE(entry.localOffset + 28);
  const start = entry.localOffset + 30 + nameLength + extraLength;
  const end = start + entry.compressedSize;
  if (end > archive.length) throw new Error("Attachment metadata entry exceeds archive bounds");
  const compressed = archive.subarray(start, end);
  let output;
  if (entry.method === 0) output = Buffer.from(compressed);
  else if (entry.method === 8) {
    output = inflateRawSync(compressed, { maxOutputLength: 4 * 1024 * 1024 });
  }
  else throw new Error(`Attachment metadata compression method ${entry.method} is unsupported`);
  if (output.length !== entry.size) throw new Error("Attachment metadata entry size does not match");
  return output;
}

export function decodeXmlValue(value) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function xmlElement(xml, qualifiedName) {
  const escaped = qualifiedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "i").exec(xml);
  return match ? decodeXmlValue(match[1]) : "";
}

export function inspectAttachmentMetadata(source) {
  const extension = path.posix.extname(source.relative).toLowerCase();
  const metadata = {
    creators: [],
    lastModifiedBy: [],
    company: [],
    manager: [],
    speakerNoteCount: 0,
    embeddedFileCount: 0,
    inspection: "not-supported",
  };
  if (OFFICE_ATTACHMENT_EXTENSIONS.has(extension)) {
    try {
      const entries = attachmentZipEntries(source.data);
      const core = readAttachmentZipEntry(source.data, entries.get("docProps/core.xml"));
      const app = readAttachmentZipEntry(source.data, entries.get("docProps/app.xml"));
      const coreXml = core?.toString("utf8") ?? "";
      const appXml = app?.toString("utf8") ?? "";
      for (const [key, value] of [
        ["creators", xmlElement(coreXml, "dc:creator")],
        ["lastModifiedBy", xmlElement(coreXml, "cp:lastModifiedBy")],
        ["company", xmlElement(appXml, "Company")],
        ["manager", xmlElement(appXml, "Manager")],
      ]) {
        if (value && !metadata[key].includes(value)) metadata[key].push(value);
      }
      const names = [...entries.keys()];
      metadata.speakerNoteCount = names.filter((name) => (
        /^ppt\/notesSlides\/notesSlide\d+\.xml$/i.test(name)
      )).length;
      metadata.embeddedFileCount = names.filter((name) => (
        /^ppt\/embeddings\//i.test(name) || /^word\/embeddings\//i.test(name)
      )).length;
      metadata.inspection = "inspected";
    } catch (error) {
      metadata.inspection = "error";
      metadata.inspectionError = error.message;
    }
  } else if (extension === ".pdf") {
    const text = source.data.subarray(0, Math.min(source.data.length, 4 * 1024 * 1024)).toString("latin1");
    const author = /\/Author\s*\(([^)]{1,512})\)/i.exec(text)?.[1]?.trim();
    if (author) metadata.creators.push(author);
    metadata.inspection = "inspected";
  }
  return metadata;
}

export function attachmentPolicyFromSources(config, sources) {
  const policyPath = portablePath(config.handoff.attachmentPolicy);
  const policySource = sources.find((source) => source.relative === policyPath);
  if (!policySource) throw new Error(`Portable attachment policy is missing: ${policyPath}`);
  let policy;
  try {
    policy = JSON.parse(policySource.data.toString("utf8"));
  } catch (error) {
    throw new Error(`Portable attachment policy is invalid JSON: ${error.message}`);
  }
  return policy;
}

export function auditPortableAttachments(config, sources, audience) {
  if (!HANDOFF_AUDIENCES.includes(audience)) {
    throw new Error(`Handoff audience must be one of: ${HANDOFF_AUDIENCES.join(", ")}`);
  }
  const policy = attachmentPolicyFromSources(config, sources);
  const policyMap = new Map((policy.items ?? []).map((item) => [portablePath(item.path), item]));
  const attachments = sources
    .filter((source) => isConfiguredAttachmentPath(source.relative, config))
    .map((source) => {
      const policyItem = policyMap.get(source.relative);
      const sha256 = hash(source.data);
      const authorizationMatch = policyItem ? policyItem.sha256 === sha256 : null;
      const authorization = authorizationMatch ? policyItem.authorization : "unknown";
      const allowedAudiences = authorizationMatch ? policyItem.allowedAudiences : [];
      return {
        path: source.relative,
        sha256,
        policySha256: policyItem?.sha256 ?? null,
        authorizationMatch,
        authorization,
        allowedAudiences,
        metadata: inspectAttachmentMetadata(source),
      };
    });
  const warnings = [];
  const errors = [];
  for (const item of attachments) {
    if (item.authorizationMatch === false) {
      const message = `Attachment content SHA-256 does not match its authorization record for ${audience} distribution: ${item.path}`;
      if (audience === "external") errors.push(message);
      else warnings.push(message);
    }
    if (item.authorization === "denied") {
      errors.push(`Attachment distribution is denied: ${item.path}`);
      continue;
    }
    if (item.authorization === "confirmed" && !item.allowedAudiences.includes(audience)) {
      errors.push(`Attachment authorization does not include ${audience}: ${item.path}`);
      continue;
    }
    if (item.authorization === "unknown" && item.authorizationMatch !== false) {
      const message = `Attachment authorization is unknown for ${audience} distribution: ${item.path}`;
      if (audience === "external") errors.push(message);
      else warnings.push(message);
    }
    if (item.metadata.inspection === "error") {
      warnings.push(`Attachment metadata could not be inspected: ${item.path} (${item.metadata.inspectionError})`);
    }
  }
  const metadataVisible = attachments.filter((item) => (
    item.metadata.creators.length > 0
    || item.metadata.lastModifiedBy.length > 0
    || item.metadata.company.length > 0
    || item.metadata.manager.length > 0
    || item.metadata.speakerNoteCount > 0
    || item.metadata.embeddedFileCount > 0
  )).length;
  return {
    audience,
    summary: {
      total: attachments.length,
      confirmed: attachments.filter((item) => item.authorization === "confirmed").length,
      unknown: attachments.filter((item) => item.authorization === "unknown").length,
      denied: attachments.filter((item) => item.authorization === "denied").length,
      metadataVisible,
    },
    attachments,
    warnings,
    errors,
  };
}

export function attachmentAuditManifest(audit) {
  return {
    audience: audit.audience,
    summary: audit.summary,
    attachments: audit.attachments,
  };
}

export function printAttachmentAudit(audit, { json = false } = {}) {
  if (json) {
    console.log(JSON.stringify(audit, null, 2));
    return;
  }
  console.log(
    `Handoff attachments: audience=${audit.audience}; total=${audit.summary.total}; `
    + `confirmed=${audit.summary.confirmed}; unknown=${audit.summary.unknown}; `
    + `denied=${audit.summary.denied}; metadata-visible=${audit.summary.metadataVisible}`,
  );
  for (const item of audit.attachments) {
    const attribution = [
      ...item.metadata.creators.map((value) => `creator=${value}`),
      ...item.metadata.lastModifiedBy.map((value) => `lastModifiedBy=${value}`),
      ...item.metadata.company.map((value) => `company=${value}`),
      ...item.metadata.manager.map((value) => `manager=${value}`),
    ];
    console.log(
      `ATTACHMENT ${item.path} authorization=${item.authorization} `
      + `audiences=${item.allowedAudiences.join(",") || "none"} `
      + `notes=${item.metadata.speakerNoteCount} embedded=${item.metadata.embeddedFileCount}`
      + `${attribution.length > 0 ? ` ${attribution.join("; ")}` : ""}`,
    );
  }
  for (const warning of audit.warnings) console.warn(`WARNING ${warning}`);
  for (const error of audit.errors) console.error(`ERROR ${error}`);
}
