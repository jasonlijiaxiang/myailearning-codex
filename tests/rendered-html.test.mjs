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
  assert.match(html, /知识地图：7 层、28 个细分模块/);
  assert.match(html, /Retrieval-Augmented Generation/);
  assert.match(html, /给模型增加可查的外部记忆/);
  assert.match(html, /PARAMETRIC MEMORY/);
  assert.match(html, /BM25 \/ Sparse/);
  assert.match(html, /ANN \/ HNSW/);
  assert.match(html, /把每个技术环节连接到云服务机会/);
  assert.match(html, /内容优先，载体后置/);
  assert.match(html, /客户高频问题与深度回答/);
  assert.match(html, /时效性不是页脚日期/);
  assert.match(html, /上下文窗口已经很长，为什么还需要 RAG/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
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
