import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

import { balanceRows } from "../app/layout-utils.mjs";

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
  assert.match(html, /aria-label="7 层架构，28 个细分模块"/);
  assert.match(html, /Retrieval-Augmented Generation/);
  assert.doesNotMatch(html, /语言规范 \/ Language Standard/);
  assert.doesNotMatch(html, /编辑原则：|跨模块阅读规则|aria-label="知识库定义"/);
  assert.match(html, /MCP · 模型上下文协议/);
  assert.match(html, /Model Context Protocol/);
  assert.match(html, /Chunking &amp; Metadata/);
  assert.match(html, /href="#rag"[^>]*aria-label="RAG · 检索增强生成：跳转到对应模块"/);
  assert.doesNotMatch(html, /BUILD BRIEF/);
  assert.match(html, /RAG 在知识地图中的位置与相关模块/);
  assert.match(html, /RAG 的外部记忆机制/);
  assert.match(html, /检索<small>Retrieval<\/small>/);
  assert.match(html, /增强<small>Augmentation<\/small>/);
  assert.match(html, /生成<small>Generation<\/small>/);
  assert.match(html, /必须记住/);
  assert.match(html, /Critical Boundary/);
  assert.match(html, /PARAMETRIC MEMORY/);
  assert.match(html, /BM25 \/ Sparse/);
  assert.match(html, /ANN \/ HNSW/);
  assert.match(html, /RAG 技术环节与云服务机会/);
  assert.match(html, /内容优先，载体后置/);
  assert.match(html, /客户高频问题与深度回答/);
  assert.match(html, /时效性不是页脚日期/);
  assert.match(html, /上下文窗口已经很长，为什么还需要 RAG/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("enforces the reusable content and composition rules", async () => {
  const [page, styles, standard] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../docs/CONTENT-DESIGN-STANDARD.md", import.meta.url), "utf8"),
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
  assert.match(page, /className="mapStats" aria-label="7 层架构，28 个细分模块"/);
  assert.doesNotMatch(page, /<i aria-hidden="true">／<\/i>/);
  assert.match(styles, /\.mapStat\s*\{[^}]*flex:\s*0 0 auto;[^}]*white-space:\s*nowrap;/s);
  assert.match(styles, /\.mapStat \+ \.mapStat::before\s*\{[^}]*content:\s*"／";/s);
  assert.match(standard, /动态均衡卡片/);
  assert.match(standard, /客观陈述/);
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

test("keeps source links and starter cleanup intact", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /arxiv\.org\/abs\/2005\.11401/);
  assert.match(page, /anthropic\.com\/engineering\/contextual-retrieval/);
  assert.match(page, /genai\.owasp\.org\/llmrisk\/llm01-prompt-injection/);
  assert.match(layout, /lang="zh-CN"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
