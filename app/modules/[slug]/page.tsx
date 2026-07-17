import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getModuleBySlug, moduleList } from "../../knowledge-map.mjs";
import { balanceRows } from "../../layout-utils.mjs";
import { isPublishedModule } from "../../module-publication.mjs";

type ModulePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return moduleList
    .filter((module) => !isPublishedModule(module.slug))
    .map((module) => ({ slug: module.slug }));
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { slug } = await params;
  const currentModule = getModuleBySlug(slug);

  if (!currentModule) return {};

  return {
    title: `${currentModule.zh} | 云计算 × AI 平台售前知识库`,
    description: `${currentModule.zh}（${currentModule.en}）独立模块页面。`,
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params;
  const currentModule = getModuleBySlug(slug);

  if (!currentModule || isPublishedModule(slug)) notFound();

  const relatedModules = moduleList.filter(
    (candidate) => candidate.layerNo === currentModule.layerNo && candidate.slug !== currentModule.slug,
  );
  const relatedRows = balanceRows(relatedModules, 3);

  return (
    <main className="modulePage">
      <header className="modulePageHero">
        <nav className="topbar" aria-label="主导航">
          <Link className="brand" href="/" aria-label="云与 AI 售前知识库首页">
            <span className="brandMark">CA</span>
            <span>Cloud × AI / Presales Fieldbook</span>
          </Link>
          <div className="toplinks">
            <Link href="/#available-modules">学习模块</Link>
            <Link href="/#map">知识地图</Link>
            <Link href="/references">Reference</Link>
          </div>
        </nav>

        <div className="modulePageHeader">
          <p className="eyebrow">MODULE {currentModule.layerNo} · {currentModule.layerEn}</p>
          <h1>{currentModule.zh}</h1>
          <p className="moduleEnglish">{currentModule.en}</p>
        </div>
      </header>

      <section className="relatedModules" aria-labelledby="related-modules-title">
        <div className="relatedModulesHead">
          <p className="kicker">RELATED MODULES</p>
          <h2 id="related-modules-title">同层相关模块</h2>
        </div>
        <div
          className="relatedModuleGrid"
          data-count={relatedModules.length}
          data-odd={relatedModules.length % 2 === 1 ? "true" : "false"}
        >
          {relatedRows.flatMap((row) =>
            row.map((related) => (
              <Link
                href={related.href}
                key={related.slug}
                style={{ "--related-span": 12 / row.length } as CSSProperties}
              >
                <span>{related.layerNo}</span>
                <strong>{related.zh}</strong>
                <small>{related.en}</small>
              </Link>
            )),
          )}
        </div>
      </section>

      <footer>
        <Link href="/#map">返回知识地图</Link>
        <Link href="/references">查看统一来源台账</Link>
      </footer>
    </main>
  );
}
