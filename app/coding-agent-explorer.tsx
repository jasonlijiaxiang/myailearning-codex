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

export type CodingAgentExplorerLabels = {
  locale: string;
  all: string;
  markets: readonly string[];
  surfaces: readonly string[];
  modelPolicies: readonly string[];
  searchLabel: string;
  searchPlaceholder: string;
  filtersAriaLabel: string;
  marketLabel: string;
  surfaceLabel: string;
  modelPolicyLabel: string;
  showingPrefix: string;
  showingSuffix: string;
  clear: string;
  activeStatus: string;
  watchStatus: string;
  productShape: string;
  implementation: string;
  fit: string;
  boundary: string;
  verified: string;
  nextReview: string;
  sourceLink: string;
  emptyTitle: string;
  emptyBody: string;
  showAll: string;
};

const chineseLabels: CodingAgentExplorerLabels = {
  locale: "zh-CN",
  all: "全部",
  markets: ["国际", "中国"],
  surfaces: ["CLI", "IDE", "Cloud", "Open Source"],
  modelPolicies: ["第一方为主", "平台托管", "可选多模型", "可接多模型", "多 Agent 入口"],
  searchLabel: "搜索产品、厂商或 Harness 能力",
  searchPlaceholder: "例如：CLI、开源、Checkpoint、腾讯……",
  filtersAriaLabel: "产品筛选",
  marketLabel: "市场",
  surfaceLabel: "形态",
  modelPolicyLabel: "模型策略",
  showingPrefix: "当前显示",
  showingSuffix: "个产品",
  clear: "清除筛选",
  activeStatus: "已核验",
  watchStatus: "重点复核",
  productShape: "产品形态",
  implementation: "实现方式",
  fit: "适合先看：",
  boundary: "边界：",
  verified: "核验",
  nextReview: "下次复核不晚于",
  sourceLink: "官方资料 ↗",
  emptyTitle: "没有符合当前条件的产品",
  emptyBody: "清除筛选，或换一个产品形态和关键词。",
  showAll: "查看全部产品",
};

export function CodingAgentExplorer({
  products,
  labels = chineseLabels,
  referencesHref = "/references",
}: {
  products: readonly Product[];
  labels?: CodingAgentExplorerLabels;
  referencesHref?: string;
}) {
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState(labels.all);
  const [surface, setSurface] = useState(labels.all);
  const [modelPolicy, setModelPolicy] = useState(labels.all);

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(labels.locale);
    return products.filter((item) => {
      const haystack = `${item.name} ${item.provider} ${item.market} ${item.surfaces.join(" ")} ${item.modelPolicy} ${item.implementation} ${item.harnessSignals.join(" ")} ${item.fit}`.toLocaleLowerCase(labels.locale);
      return (market === labels.all || item.market === market)
        && (surface === labels.all || item.surfaces.includes(surface))
        && (modelPolicy === labels.all || item.modelPolicy === modelPolicy)
        && (!normalized || haystack.includes(normalized));
    });
  }, [labels, market, modelPolicy, products, query, surface]);

  const reset = () => { setQuery(""); setMarket(labels.all); setSurface(labels.all); setModelPolicy(labels.all); };
  const hasFilters = query || market !== labels.all || surface !== labels.all || modelPolicy !== labels.all;

  return (
    <div className="codingAgentExplorer">
      <div className="codingAgentControls">
        <label><span>{labels.searchLabel}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.searchPlaceholder} /></label>
        <div className="codingAgentFilters" aria-label={labels.filtersAriaLabel}>
          <label>{labels.marketLabel}<select value={market} onChange={(event) => setMarket(event.target.value)}><option>{labels.all}</option>{labels.markets.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>{labels.surfaceLabel}<select value={surface} onChange={(event) => setSurface(event.target.value)}><option>{labels.all}</option>{labels.surfaces.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>{labels.modelPolicyLabel}<select value={modelPolicy} onChange={(event) => setModelPolicy(event.target.value)}><option>{labels.all}</option>{labels.modelPolicies.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
      </div>

      <div className="codingAgentStatus" aria-live="polite"><span>{labels.showingPrefix} <strong>{visible.length}</strong> / {products.length} {labels.showingSuffix}</span>{hasFilters && <button type="button" onClick={reset}>{labels.clear}</button>}</div>

      <div className="codingAgentList">
        {visible.map((item) => (
          <article className="codingAgentItem" key={item.id}>
            <header><div><p>{item.market} · {item.provider}</p><h3>{item.name}</h3></div><span data-status={item.status}>{item.status === "watch" ? labels.watchStatus : labels.activeStatus}</span></header>
            <div className="codingAgentFacts"><span><b>{labels.productShape}</b>{item.surfaces.join(" / ")}</span><span><b>{labels.modelPolicyLabel}</b>{item.modelPolicy}</span><span><b>{labels.implementation}</b>{item.implementation}</span></div>
            <div className="codingAgentSignals">{item.harnessSignals.map((signal) => <span key={signal}>{signal}</span>)}</div>
            <p><strong>{labels.fit}</strong>{item.fit}</p>
            <p className="codingAgentBoundary"><strong>{labels.boundary}</strong>{item.boundary}</p>
            <footer><span>{labels.verified} {item.verifiedAt} · {labels.nextReview} {item.nextReviewAt}</span><span>{item.sourceIds.map((sourceId) => <Link href={`${referencesHref}#source-${sourceId}`} key={sourceId}>{labels.sourceLink}</Link>)}</span></footer>
          </article>
        ))}
      </div>
      {visible.length === 0 && <div className="emptySearch"><strong>{labels.emptyTitle}</strong><p>{labels.emptyBody}</p><button type="button" onClick={reset}>{labels.showAll}</button></div>}
    </div>
  );
}
