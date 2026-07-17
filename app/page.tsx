import type { CSSProperties } from "react";
import Link from "next/link";

import { balanceRows } from "./layout-utils.mjs";
import { layers, moduleList } from "./knowledge-map.mjs";

const layerCount = layers.length;
const moduleCount = moduleList.length;

export default function Home() {
  return (
    <main>
      <header className="hero" id="top">
        <nav className="topbar" aria-label="主导航">
          <Link className="brand" href="/" aria-label="云与 AI 售前知识库首页">
            <span className="brandMark">CA</span>
            <span>Cloud × AI / Presales Fieldbook</span>
          </Link>
          <div className="toplinks">
            <a href="#map">知识地图</a>
            <Link href="/modules/rag">RAG</Link>
            <Link href="/references">Reference</Link>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <p className="eyebrow">READING EDITION · V0.9</p>
            <h1>云计算 × AI 平台<br />售前知识库</h1>
            <p className="heroLead">
              从客户问题出发，把概念、架构、选择、证据和回答话术连成一条可复用的售前路径。
              中文为主，关键术语中英对照；兼顾理论深度与客户现场可用性。
            </p>
            <div className="heroActions">
              <Link className="primaryButton" href="/modules/rag">阅读 RAG 模块</Link>
              <a className="textButton" href="#map">浏览完整框架 <span>↘</span></a>
            </div>
          </div>
        </div>
      </header>

      <section className="principles section" aria-labelledby="principles-title">
        <div className="sectionNumber">00</div>
        <div className="sectionBody">
          <div className="sectionIntro">
            <p className="kicker">HOW TO USE</p>
            <h2 id="principles-title">模块阅读框架</h2>
          </div>
          <div className="principleGrid">
            <article><span>01</span><h3>业务目标与边界</h3><p>业务问题、适用边界、非目标与价值假设。</p></article>
            <article><span>02</span><h3>架构判断与选型</h3><p>架构模式、关键变量、选型矩阵与反例。</p></article>
            <article><span>03</span><h3>证据与验收</h3><p>数据、评测、来源类别与验收门槛。</p></article>
            <article><span>04</span><h3>客户沟通</h3><p>客户问题、短答、深答、追问和风险提示。</p></article>
          </div>
        </div>
      </section>

      <section className="section mapSection" id="map" aria-labelledby="map-title">
        <div className="sectionNumber">01</div>
        <div className="sectionBody">
          <div className="sectionIntro splitIntro mapIntro">
            <div className="mapHeading">
              <p className="kicker">KNOWLEDGE MAP</p>
              <h2 id="map-title">知识地图</h2>
              <div className="mapStats" aria-label={`${layerCount} 层架构，${moduleCount} 个细分模块`}>
                <span className="mapStat"><strong>{layerCount}</strong><span>层架构</span></span>
                <span className="mapStat"><strong>{moduleCount}</strong><span>个细分模块</span></span>
              </div>
            </div>
            <p>从售前场景进入应用模式，再向协议、工程、模型、数据与算力层展开；每个模块都可单独阅读与分享。</p>
          </div>

          <div className="layerStack">
            {layers.map((layer) => (
              <article className="layer" key={layer.no}>
                <div className="layerIndex">{layer.no}</div>
                <div className="layerTitle">
                  <h3>{layer.name}</h3>
                  <p>{layer.en}</p>
                </div>
                <div className="layerContent">
                  <div
                    className="chips"
                    data-count={layer.modules.length}
                    data-odd={layer.modules.length % 2 === 1 ? "true" : "false"}
                  >
                    {balanceRows(layer.modules, 4).flatMap((row) =>
                      row.map((module) => (
                        <Link
                          key={module.slug}
                          href={module.href}
                          style={{ "--module-span": 12 / row.length } as CSSProperties}
                          aria-label={`${module.zh}：打开独立模块页面`}
                        >
                          <strong>{module.zh}</strong>
                          <small>{module.en}</small>
                        </Link>
                      )),
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="curriculum">
            <div>
              <p className="kicker">LEARNING PATHS</p>
              <h3>任务导向的学习路径</h3>
            </div>
            <div className="pathCards">
              <article><strong>新入门 · 4 周</strong><p>模型基础 → RAG → 评估 → 场景方案</p></article>
              <article><strong>做 PoC · 2 周</strong><p>场景 → 数据 → RAG / Agent → 验收与安全</p></article>
              <article><strong>做平台规划</strong><p>方案组合 → 工程保障 → 数据 / 算力底座 → TCO</p></article>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <span>Cloud × AI Presales Fieldbook</span>
        <span>V0.9 · 中文主版本 · 模块化阅读</span>
      </footer>
    </main>
  );
}
