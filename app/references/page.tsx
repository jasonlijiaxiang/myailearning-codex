import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";

import { ReadingProgress, ReferenceFilterShell, type ReferenceFilterItem } from "../fieldbook-interactions";
import { balanceGridRows, gridSpan } from "../layout-utils.mjs";
import { referenceModules, sourceLedger } from "../reference-content.mjs";

export const metadata: Metadata = {
  title: "来源与证据 | 云计算 × AI 平台售前知识库",
  description: "云计算与 AI 平台售前知识库的统一来源台账、证据类别、适用边界与核验日期。",
};

const evidenceLegend = [
  {
    grade: "O",
    zh: "官方出版物与框架",
    en: "Official Publications & Frameworks",
    note: "标准机构或公共机构发布的规范、架构与风险管理材料。",
  },
  {
    grade: "P",
    zh: "官方产品与技术文档",
    en: "Official Product & Technical Documentation",
    note: "厂商官方发布的 API、平台能力与工程说明；功能、地域、配额、价格和发布阶段需按采购时点复核。",
  },
  {
    grade: "A",
    zh: "学术研究与权威教材",
    en: "Academic Research & Authoritative Textbooks",
    note: "同行评审论文、一手研究、技术报告、研究综述与权威教材。",
  },
  {
    grade: "B",
    zh: "厂商工程指南与实验",
    en: "Vendor Engineering Guidance & Evidence",
    note: "厂商公开的工程方法、实践指南与实验结果；用于形成方案判断或 PoC 假设，不直接作为客户承诺。",
  },
  {
    grade: "G",
    zh: "行业社区指南",
    en: "Industry & Community Guidance",
    note: "行业组织或社区维护的风险清单与工程实践指南。",
  },
];

const referenceModuleRows = balanceGridRows(referenceModules, 4);
const sourceAnchorOwner = new Map<string, string>();

for (const referenceModule of referenceModules) {
  for (const sourceId of referenceModule.sourceIds) {
    if (!sourceAnchorOwner.has(sourceId)) sourceAnchorOwner.set(sourceId, referenceModule.id);
  }
}

const referenceFilterItems: ReferenceFilterItem[] = referenceModules.flatMap((module) => module.sourceIds.map((sourceId) => {
  const source = sourceLedger[sourceId as keyof typeof sourceLedger];
  return {
    key: `${module.id}:${sourceId}`,
    moduleId: module.id,
    grade: source.grade,
    text: `${module.zh} ${module.en} ${module.shortTitle} ${source.shortTitle} ${source.title} ${source.kind} ${source.note}`,
  };
}));

export default function ReferencesPage() {
  return (
    <main className="referencePage">
      <ReadingProgress />
      <header className="hero referenceHero" id="top">
        <nav className="topbar" aria-label="来源页导航">
          <Link className="brand" href="/" aria-label="返回云与 AI 售前知识库首页">
            <span className="brandMark">CA</span>
            <span>Cloud × AI / Presales Fieldbook</span>
          </Link>
          <div className="toplinks">
            <Link href="/">知识库首页 / Home</Link>
            <a href="#reference-modules">模块来源目录 / Modules</a>
          </div>
        </nav>

        <div className="heroGrid referenceHeroGrid">
          <div className="heroCopy">
            <p className="eyebrow">REFERENCE LEDGER · 来源与证据</p>
            <h1>统一来源台账<br />Reference Library</h1>
            <p className="heroLead">
              所有模块的论文、标准、教材、官方产品文档、厂商实验与行业指南集中汇总在这里。
              正文只引用稳定的来源标识；本页统一呈现来源原文、证据类别、适用边界和最近核验日期。
            </p>
            <div className="heroActions">
              <a className="primaryButton" href="#reference-modules">按模块查看来源</a>
              <Link className="textButton" href="/#map">返回知识地图 <span>↗</span></Link>
            </div>
          </div>
        </div>
      </header>

      <section className="section referenceGuideSection" aria-labelledby="reference-guide-title">
        <div className="sectionNumber">00</div>
        <div className="sectionBody">
          <div className="sectionIntro splitIntro">
            <div>
              <p className="kicker">HOW TO READ THE EVIDENCE</p>
              <h2 id="reference-guide-title">如何使用来源台账</h2>
            </div>
            <p>
              证据类别用于说明来源性质，不代表简单的高低评分。每条摘要同时写明它能支撑什么、不能外推到哪里；
              “核验日期”表示链接与内容在该日被检查，不等于结论永久有效。
            </p>
          </div>

          <div className="subsection referenceGuideContent">
            <div className="sourceGuide">
              <p>
                论文和标准用于解释原理、方法与风险边界；云服务规格、价格、区域可用性、SLA 与客户效果仍需结合当期产品资料和客户 PoC 核验。
                后续模块会继续写入同一台账，并在本页按模块独立分组。
              </p>
              <div className="sourceLegend" aria-label="来源与证据类别图例">
                {evidenceLegend.map((item) => (
                  <span key={item.grade} title={item.note}>
                    <strong>{item.grade}</strong> {item.zh} / {item.en}
                  </span>
                ))}
              </div>
            </div>

            <nav
              className="referenceModuleNav"
              id="reference-modules"
              aria-label="来源模块目录"
              data-count={referenceModules.length}
              data-odd={referenceModules.length % 2 === 1 ? "true" : "false"}
            >
              {referenceModuleRows.flatMap((row) =>
                row.map((module) => (
                  <a
                    className="referenceModuleLink"
                    href={`#module-${module.id}`}
                    key={module.id}
                    style={{ "--reference-span": gridSpan(row.length) } as CSSProperties}
                  >
                    <span>{module.shortTitle}</span>
                    <strong>{module.zh}</strong>
                    <small>{module.en} · {module.sourceIds.length} 条来源</small>
                  </a>
                )),
              )}
            </nav>
          </div>
        </div>
      </section>

      <ReferenceFilterShell items={referenceFilterItems}>
        {referenceModules.map((module, moduleIndex) => (
          <section
            className="section referenceModuleSection"
            id={`module-${module.id}`}
            aria-labelledby={`module-${module.id}-title`}
            data-reference-module={module.id}
            key={module.id}
          >
            <div className="sectionNumber">{String(moduleIndex + 1).padStart(2, "0")}</div>
            <div className="sectionBody">
              <div className="sectionIntro splitIntro">
                <div>
                  <p className="kicker">{module.shortTitle} REFERENCES</p>
                  <h2 id={`module-${module.id}-title`}>{module.zh}</h2>
                </div>
                <p>
                  {module.en} · 当前收录 {module.sourceIds.length} 条已核验来源。
                  <br />
                  <Link href={module.href}>进入 {module.shortTitle} 模块，查看这些来源支撑的原理、判断与客户回答 ↗</Link>
                </p>
              </div>

              <div className="subsection referenceModuleContent">
                <div className="sourceList">
                  {module.sourceIds.map((sourceId) => {
                    const source = sourceLedger[sourceId as keyof typeof sourceLedger];

                    return (
                      <a
                        className="sourceItem"
                        id={sourceAnchorOwner.get(sourceId) === module.id ? `source-${sourceId}` : undefined}
                        data-reference-key={`${module.id}:${sourceId}`}
                        data-source-grade={source.grade}
                        href={source.href}
                        target="_blank"
                        rel="noreferrer"
                        key={sourceId}
                      >
                        <span className="sourceLevel">{source.grade} / {source.kind}</span>
                      <span className="sourceTitle">
                        <strong>{source.title}</strong>
                        <small><b className="sourceShortTitle">{source.shortTitle}</b>{source.note}</small>
                      </span>
                        <span className="sourceDate">核验：{source.verifiedAt}<br />打开原文 ↗</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        ))}
      </ReferenceFilterShell>

      <footer>
        <div><span className="brandMark">CA</span><strong>云计算 × AI 平台售前知识库</strong></div>
        <p>统一来源台账 / Reference Library</p>
        <a href="#top">返回顶部 ↑</a>
      </footer>
    </main>
  );
}
