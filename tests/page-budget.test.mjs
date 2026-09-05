// 页面体积预算：复用 rendered-html 的 worker fetch 渲染方式，断言代表路由的
// HTML 总字节数与「不带 src 的 <script>」内联内容字节数不超过预算。
// 预算 = 改后实测值 × 1.15 向上取整到 10 KB；硬上限见执行手册 S0-T3。
import assert from "node:assert/strict";
import test from "node:test";

let workerPromise;

async function render(path = "/") {
  assert.match(path, /^\//, "render(path) 必须接收站内绝对路径");
  workerPromise ??= import(new URL("../dist/server/index.js", import.meta.url).href).then(({ default: worker }) => worker);
  const worker = await workerPromise;
  return worker.fetch(
    new Request(new URL(path, "http://localhost"), {
      headers: { accept: "text/html" },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

/** @param {string} path */
async function renderHtml(path) {
  const response = await render(path);
  assert.equal(response.status, 200, `${path} 应可正常访问`);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

/** @param {string} html */
function inlineScriptBytes(html) {
  let total = 0;
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!/\bsrc\s*=/.test(match[1])) total += Buffer.byteLength(match[2], "utf8");
  }
  return total;
}

/** @param {number} actualBytes */
function budgetFor(actualBytes) {
  return Math.ceil((actualBytes * 1.15) / 10240) * 10240;
}

// 改后实测值（S0-T3 回执；/questions 行在问题目录 DOM 瘦身时改为 html 口径更新；
//   /en/modules/rag 行在阅读模式按需挂载后更新）：
//   / html=108,333 · /en html=157,859 · /questions html=387,322（原 inline=1,434,465）
//   /en/questions inline=374,774 · /modules/rag html=389,404 · /en/modules/rag html=127,801
const MEASURED = {
  "/": { metric: "html", bytes: 108_333, hardCap: 250_000 },
  "/en": { metric: "html", bytes: 157_859, hardCap: 350_000 },
  "/questions": { metric: "html", bytes: 387_322, hardCap: 400_000 },
  "/en/questions": { metric: "inline", bytes: 374_774, hardCap: 500_000 },
  "/modules/rag": { metric: "html", bytes: 389_404, hardCap: 450_000 },
  "/en/modules/rag": { metric: "html", bytes: 127_801, hardCap: 600_000 },
};

for (const [path, spec] of Object.entries(MEASURED)) {
  test(`page budget ${path} (${spec.metric})`, async () => {
    const html = await renderHtml(path);
    const size = spec.metric === "inline" ? inlineScriptBytes(html) : Buffer.byteLength(html, "utf8");
    const budget = budgetFor(spec.bytes);
    assert.ok(
      size <= budget,
      `${path} ${spec.metric} 字节 ${size} 超过预算 ${budget}`,
    );
    assert.ok(
      size <= spec.hardCap,
      `${path} ${spec.metric} 字节 ${size} 超过硬上限 ${spec.hardCap}（改法未生效）`,
    );
  });
}
