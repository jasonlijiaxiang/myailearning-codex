import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EnglishModulePage, englishUnifiedReaderSlugs, type EnglishModule } from "../../../../i18n/english-pilot-module-page";
import { englishPageMetadata } from "../../../../i18n/english-page-metadata";
import { englishModuleRegistry, requireEnglishModule } from "../../../../i18n/en/registry.mjs";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(englishModuleRegistry).filter((slug) => slug !== "rag").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const localizedModule = englishModuleRegistry[slug];
  if (!localizedModule || slug === "rag") return {};
  return englishPageMetadata({
    title: localizedModule.title,
    description: localizedModule.definition,
    path: `/en/modules/${slug}`,
    zhPath: `/modules/${slug}`,
  });
}

export default async function EnglishSharedModulePage({ params }: PageProps) {
  const { slug } = await params;
  if (slug === "rag" || !englishModuleRegistry[slug]) notFound();
  const reader = englishUnifiedReaderSlugs.includes(slug) ? "unified" : "legacy";
  return <EnglishModulePage module={requireEnglishModule(slug) as unknown as EnglishModule} reader={reader} />;
}
