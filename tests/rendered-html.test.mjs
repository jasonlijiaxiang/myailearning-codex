import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

import { balanceRows } from "../app/layout-utils.mjs";
import { evidenceCards, ragQa, sourceLedger } from "../app/rag-content.mjs";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the complete presales knowledge base", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/i);
  assert.match(html, /<title>云计算 × AI 平台售前知识库<\/title>/i);
  assert.match(html, /<h2 id="map-title">知识地图<\/h2>/);
  assert.match(html, /aria-label="\d+ 层架构，\d+ 个细分模块"/);
  assert.match(html, /Retrieval-Augmented Generation/);
  assert.doesNotMatch(html, /语言规范 \/ Language Standard/);
  assert.doesNotMatch(html, /编辑原则：|跨模块阅读规则|aria-label="知识库定义"/);
  assert.match(html, /MCP · 模型上下文协议/);
  assert.match(html, /Model Context Protocol/);
  assert.match(html, /Chunking &amp; Metadata/);
  assert.match(html, /href="#rag"[^>]*aria-label="RAG · 检索增强生成：跳转到对应模块"/);
  assert.doesNotMatch(html, /BUILD BRIEF/);
  assert.match(html, /RAG 在知识地图中的位置与相关模块/);
  assert.match(html, /RAG 的概率模型与工程机制/);
  assert.match(html, /检索<small>Retrieval<\/small>/);
  assert.match(html, /增强<small>Augmentation<\/small>/);
  assert.match(html, /生成<small>Generation<\/small>/);
  assert.match(html, /必须记住/);
  assert.match(html, /Critical Boundary/);
  assert.match(html, /PARAMETRIC MEMORY/);
  assert.match(html, /BM25 \/ Sparse/);
  assert.match(html, /ANN \/ HNSW/);
  assert.match(html, /RAG 技术环节与云服务机会/);
  assert.match(html, /客户高频问题与深度回答/);
  assert.match(html, /潜变量/);
  assert.match(html, /边缘化/);
  assert.match(html, /RAG-Sequence/);
  assert.match(html, /RAG-Token/);
  assert.match(html, /RAG-SEQUENCE · LATENT-DOCUMENT MARGINALIZATION/);
  assert.match(html, /不是所有现代 RAG 实现的统一公式/);
  assert.match(html, /Candidate Retrieval/);
  assert.match(html, /Context Assembly/);
  assert.match(html, /召回是证据可用性的上限/);
  assert.match(html, /增强发生在上下文/);
  assert.match(html, /上下文窗口已经很长，为什么还需要 RAG/);
  assert.match(html, /RAG 检到了正确文档，为什么仍可能答错/);
  assert.match(html, /RAG-Sequence 和 RAG-Token 是两种部署架构吗/);
  assert.match(html, /企业做 RAG，必须把检索器和生成模型端到端联合训练吗/);
  assert.match(html, /Top-K 是不是越大越好/);
  assert.match(html, /本题依据 \/ Evidence/);
  assert.equal((html.match(/aria-label="本题依据"/g) ?? []).length, ragQa.length);
  assert.match(html, /id="source-rag-original-2020"/);
  assert.match(html, /id="source-nist-zero-trust"/);
  assert.match(html, /id="source-docling-report"/);
  assert.doesNotMatch(
    html,
    /MAINTENANCE BY DESIGN|时效性不是页脚日期|claim_id|review_by|layerNote|href="#maintenance"|30 天时效等级|复核节奏|事实最小单元/,
  );
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("enforces the reusable content and composition rules", async () => {
  const [page, styles, standard, maintenance, ragContent] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../docs/CONTENT-DESIGN-STANDARD.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/CONTENT-MAINTENANCE.md", import.meta.url), "utf8"),
    readFile(new URL("../app/rag-content.mjs", import.meta.url), "utf8"),
  ]);

  const headings = [...page.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/g)]
    .map((match) => match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  for (const heading of headings) {
    assert.doesNotMatch(
      heading,
      /^(?:先(?:确定|理解|选择|判断)|再(?:判断|选择|来看)|把\S|不要|我们(?:先|来|需要)|你(?:需要|应该|可以))/,
      `标题应使用客观知识库语气：${heading}`,
    );
  }

  assert.match(page, /const conceptRows = balanceRows\(conceptLinks, 4\)/);
  assert.match(page, /data-count=\{conceptLinks\.length\}/);
  assert.match(page, /data-odd=\{conceptLinks\.length % 2 === 1/);
  assert.match(page, /"--concept-span": 12 \/ row\.length/);
  assert.match(styles, /\.conceptGrid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  assert.match(styles, /\.conceptGrid article\s*\{[^}]*grid-column:\s*span var\(--concept-span\);/s);
  assert.match(styles, /@media \(max-width: 1050px\)[\s\S]*?\.conceptGrid article\s*\{\s*grid-column:\s*span 6;/);
  assert.match(styles, /\.conceptGrid\[data-odd="true"\] article:last-child\s*\{\s*grid-column:\s*span 12;/);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*?\.conceptGrid article,[^{]*\{\s*grid-column:\s*span 12;/);
  assert.match(page, /const layerCount = layers\.length/);
  assert.match(page, /const moduleCount = layers\.reduce/);
  assert.match(page, /className="mapStats" aria-label=\{`\$\{layerCount\} 层架构，\$\{moduleCount\} 个细分模块`\}/);
  assert.doesNotMatch(page, /aria-label="\d+ 层架构，\d+ 个细分模块"/);
  assert.doesNotMatch(page, /<i aria-hidden="true">／<\/i>/);
  assert.match(styles, /\.mapStat\s*\{[^}]*flex:\s*0 0 auto;[^}]*white-space:\s*nowrap;/s);
  assert.match(styles, /\.mapStat \+ \.mapStat::before\s*\{[^}]*content:\s*"／";/s);
  assert.match(page, /balanceRows\(layer\.modules, 4\)/);
  assert.match(page, /"--module-span": 12 \/ row\.length/);
  assert.match(page, /data-count=\{layer\.modules\.length\}/);
  assert.match(page, /data-odd=\{layer\.modules\.length % 2 === 1/);
  assert.match(styles, /\.chips\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  assert.match(
    styles,
    /\.chips > span, \.chips > a\s*\{[^}]*grid-column:\s*span var\(--module-span\);/s,
  );
  assert.match(styles, /@media \(max-width: 1050px\)[\s\S]*?\.chips > span, \.chips > a\s*\{\s*grid-column:\s*span 6;/);
  assert.match(styles, /\.chips\[data-odd="true"\] > :last-child\s*\{\s*grid-column:\s*span 12;/);
  assert.match(page, /const evidenceRows = balanceRows\(evidenceCards, 4\)/);
  assert.match(page, /data-count=\{evidenceCards\.length\}/);
  assert.match(page, /"--evidence-span": 12 \/ row\.length/);
  assert.match(styles, /\.evidenceGrid\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  assert.match(styles, /\.metricCard\s*\{[^}]*grid-column:\s*span var\(--evidence-span\);/s);
  assert.match(page, /aria-label="本题依据"/);
  assert.match(page, /id=\{`source-\$\{sourceId\}`\}/);
  assert.doesNotMatch(page, /https?:\/\//, "来源 URL 只能在统一来源台账维护");
  assert.match(page, /balanceRows\(item\.evidence, 3\)/);
  assert.match(page, /"--qa-evidence-span": 12 \/ row\.length/);
  assert.match(styles, /\.qaBasisList\s*\{[^}]*grid-template-columns:\s*repeat\(12,/s);
  assert.match(ragContent, /export const sourceLedger/);
  assert.match(ragContent, /export const ragQa/);
  assert.match(ragContent, /export const evidenceCards/);
  assert.doesNotMatch(page, /layerNote|id="maintenance"|href="#maintenance"/);
  assert.doesNotMatch(styles, /\.layerNote\b|\.maintenance(?:Head|Grid)?\b/);
  assert.match(standard, /动态均衡卡片/);
  assert.match(standard, /客观陈述/);
  assert.match(maintenance, /不进入读者页面/);
  for (const field of [
    "claim_id",
    "claim",
    "scope",
    "source_url",
    "evidence_grade",
    "verified_at",
    "review_by",
    "owner",
    "status",
  ]) {
    assert.match(maintenance, new RegExp(`\\b${field}\\b`));
  }
  assert.match(maintenance, /30 天/);
  assert.match(maintenance, /90 天/);
  assert.match(maintenance, /180 天/);
});

test("balances arbitrary concept-card counts without hard-coding eight", () => {
  const cases = new Map([
    [1, [1]],
    [2, [2]],
    [3, [3]],
    [4, [4]],
    [5, [3, 2]],
    [6, [3, 3]],
    [7, [4, 3]],
    [8, [4, 4]],
    [9, [3, 3, 3]],
    [10, [4, 3, 3]],
    [11, [4, 4, 3]],
    [12, [4, 4, 4]],
  ]);

  for (const [count, expected] of cases) {
    const items = Array.from({ length: count }, (_, index) => index);
    const rows = balanceRows(items, 4);
    assert.deepEqual(rows.map((row) => row.length), expected);
    assert.deepEqual(rows.flat(), items);
    assert.ok(Math.max(...rows.map((row) => row.length)) <= 4);
    assert.ok(Math.max(...rows.map((row) => row.length)) - Math.min(...rows.map((row) => row.length)) <= 1);
  }

  for (const count of [13, 25]) {
    const items = Array.from({ length: count }, (_, index) => index);
    const rows = balanceRows(items, 4);
    const sizes = rows.map((row) => row.length);
    assert.equal(rows.length, Math.ceil(count / 4));
    assert.deepEqual(rows.flat(), items);
    assert.ok(Math.max(...sizes) <= 4);
    assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1);
  }

  assert.deepEqual(balanceRows([], 4), []);
  assert.throws(() => balanceRows([1], 0), /positive integer/);
});

test("keeps every RAG answer and evidence card connected to the source ledger", async () => {
  const sourceEntries = Object.entries(sourceLedger);
  const sourceIds = new Set(sourceEntries.map(([sourceId]) => sourceId));
  const hrefs = sourceEntries.map(([, source]) => source.href);

  assert.equal(new Set(hrefs).size, hrefs.length, "来源 URL 不应重复维护");
  for (const [sourceId, source] of sourceEntries) {
    assert.match(sourceId, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.match(source.href, /^https:\/\//);
    assert.match(source.verifiedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(source.grade && source.kind && source.shortTitle && source.title && source.note);
  }

  for (const requiredQuestion of [
    /检到了正确文档.*答错/,
    /RAG-Sequence.*RAG-Token/,
    /端到端联合训练/,
    /Top-K.*Reranker/,
    /PDF.*扫描件.*表格.*图片/,
  ]) {
    assert.ok(ragQa.some((item) => requiredQuestion.test(item.q)), `缺少关键知识问答：${requiredQuestion}`);
  }
  for (const item of ragQa) {
    assert.ok(item.q && item.a && item.depth && item.ask && item.tag && item.basis);
    assert.ok(item.evidence.length > 0, `问答缺少本题依据：${item.q}`);
    assert.equal(
      new Set(item.evidence.map((reference) => reference.sourceId)).size,
      item.evidence.length,
      `同一问题不应重复引用同一来源：${item.q}`,
    );
    for (const reference of item.evidence) {
      assert.ok(sourceIds.has(reference.sourceId), `未知来源 ID：${reference.sourceId}`);
      assert.match(reference.supports, /支持|直接定义/, `应说明来源具体支持什么：${item.q}`);
    }
  }

  assert.ok(evidenceCards.length > 0);
  for (const card of evidenceCards) {
    assert.ok(sourceIds.has(card.sourceId), `证据卡引用未知来源：${card.sourceId}`);
    assert.ok(card.finding && card.boundary, `证据卡必须同时说明发现与边界：${card.title}`);
  }

  const response = await render();
  const html = await response.text();
  for (const sourceId of new Set([
    ...ragQa.flatMap((item) => item.evidence.map((reference) => reference.sourceId)),
    ...evidenceCards.map((card) => card.sourceId),
  ])) {
    assert.match(html, new RegExp(`href="#source-${sourceId}"`));
    assert.match(html, new RegExp(`id="source-${sourceId}"`));
  }
});

test("keeps source links and starter cleanup intact", async () => {
  const [ragContent, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/rag-content.mjs", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(ragContent, /proceedings\.neurips\.cc\/paper\/2020/);
  assert.match(ragContent, /aclanthology\.org\/2020\.emnlp-main\.550/);
  assert.match(ragContent, /aclanthology\.org\/2024\.eacl-demo\.16/);
  assert.match(ragContent, /research\.ibm\.com\/publications\/docling-technical-report/);
  assert.match(ragContent, /arxiv\.org\/abs\/2009\.09941/);
  assert.match(ragContent, /proceedings\.iclr\.cc\/paper_files\/paper\/2025/);
  assert.match(ragContent, /csrc\.nist\.gov\/pubs\/sp\/800\/207\/final/);
  assert.match(ragContent, /anthropic\.com\/engineering\/contextual-retrieval/);
  assert.match(ragContent, /genai\.owasp\.org\/llmrisk\/llm01-prompt-injection/);
  assert.match(layout, /lang="zh-CN"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
