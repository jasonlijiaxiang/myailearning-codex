"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  provider: string;
  market: string;
  surfaces: readonly string[];
  modelPolicy: string;
  implementation: string;
  harnessSignals: readonly string[];
  fit: string;
  boundary: string;
  status: string;
  verifiedAt: string;
  nextReviewAt: string;
  sourceIds: readonly string[];
};

export function CodingAgentExplorer({ products }: { products: readonly Product[] }) {
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState("全部");
  const [surface, setSurface] = useState("全部");
  const [modelPolicy, setModelPolicy] = useState("全部");

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-CN");
    return products.filter((item) => {
      const haystack = `${item.name} ${item.provider} ${item.market} ${item.surfaces.join(" ")} ${item.modelPolicy} ${item.implementation} ${item.harnessSignals.join(" ")} ${item.fit}`.toLocaleLowerCase("zh-CN");
      return (market === "全部" || item.market === market)
        && (surface === "全部" || item.surfaces.includes(surface))
        && (modelPolicy === "全部" || item.modelPolicy === modelPolicy)
        && (!normalized || haystack.includes(normalized));
    });
  }, [market, modelPolicy, products, query, surface]);

  const reset = () => { setQuery(""); setMarket("全部"); setSurface("全部"); setModelPolicy("全部"); };

  return (
    <div className="codingAgentExplorer">
      <div className="codingAgentControls">
        <label><span>搜索产品、厂商或 Harness 能力</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：CLI、开源、Checkpoint、腾讯……" /></label>
        <div className="codingAgentFilters" aria-label="产品筛选">
          <label>市场<select value={market} onChange={(event) => setMarket(event.target.value)}><option>全部</option><option>国际</option><option>中国</option></select></label>
          <label>形态<select value={surface} onChange={(event) => setSurface(event.target.value)}><option>全部</option><option>CLI</option><option>IDE</option><option>Cloud</option><option>Open Source</option></select></label>
          <label>模型策略<select value={modelPolicy} onChange={(event) => setModelPolicy(event.target.value)}><option>全部</option><option>第一方为主</option><option>平台托管</option><option>可选多模型</option><option>可接多模型</option><option>多 Agent 入口</option></select></label>
        </div>
      </div>

      <div className="codingAgentStatus" aria-live="polite"><span>当前显示 <strong>{visible.length}</strong> / {products.length} 个产品</span>{(query || market !== "全部" || surface !== "全部" || modelPolicy !== "全部") && <button type="button" onClick={reset}>清除筛选</button>}</div>

      <div className="codingAgentList">
        {visible.map((item) => (
          <article className="codingAgentItem" key={item.id}>
            <header><div><p>{item.market} · {item.provider}</p><h3>{item.name}</h3></div><span data-status={item.status}>{item.status === "watch" ? "重点复核" : "已核验"}</span></header>
            <div className="codingAgentFacts"><span><b>产品形态</b>{item.surfaces.join(" / ")}</span><span><b>模型策略</b>{item.modelPolicy}</span><span><b>实现方式</b>{item.implementation}</span></div>
            <div className="codingAgentSignals">{item.harnessSignals.map((signal) => <span key={signal}>{signal}</span>)}</div>
            <p><strong>适合先看：</strong>{item.fit}</p>
            <p className="codingAgentBoundary"><strong>边界：</strong>{item.boundary}</p>
            <footer><span>核验 {item.verifiedAt} · 下次复核不晚于 {item.nextReviewAt}</span><span>{item.sourceIds.map((sourceId) => <Link href={`/references#source-${sourceId}`} key={sourceId}>官方资料 ↗</Link>)}</span></footer>
          </article>
        ))}
      </div>
      {visible.length === 0 && <div className="emptySearch"><strong>没有符合当前条件的产品</strong><p>清除筛选，或换一个产品形态和关键词。</p><button type="button" onClick={reset}>查看全部产品</button></div>}
    </div>
  );
}
