import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

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
  assert.match(html, /RAG 的知识位置与模块依赖/);
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

  const conceptBlock = page.match(/const conceptLinks = \[([\s\S]*?)\n\];\n\nconst ragVariants/);
  assert.ok(conceptBlock, "应保留 RAG 跨模块概念清单");
  assert.equal((conceptBlock[1].match(/\bconcept:/g) ?? []).length, 8);
  assert.match(styles, /\.conceptGrid\s*\{[^}]*grid-template-columns:\s*repeat\(4,/s);
  assert.match(styles, /@media \(max-width: 1050px\)[\s\S]*?\.conceptGrid\s*\{\s*grid-template-columns:\s*repeat\(2,/);
  assert.match(styles, /@media \(max-width: 720px\)[\s\S]*?\.conceptGrid\s*\{\s*grid-template-columns:\s*1fr;/);
  assert.match(page, /className="mapStats" aria-label="7 层架构，28 个细分模块"/);
  assert.doesNotMatch(page, /<i aria-hidden="true">／<\/i>/);
  assert.match(styles, /\.mapStat\s*\{[^}]*flex:\s*0 0 auto;[^}]*white-space:\s*nowrap;/s);
  assert.match(styles, /\.mapStat \+ \.mapStat::before\s*\{[^}]*content:\s*"／";/s);
  assert.match(standard, /固定数量卡片/);
  assert.match(standard, /客观陈述/);
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
