import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EnglishModulePage } from "../../../i18n/english-pilot-module-page";
import { englishModuleRegistry, requireEnglishModule } from "../../../i18n/en/registry.mjs";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(englishModuleRegistry).filter((slug) => slug !== "rag").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const localizedModule = englishModuleRegistry[slug];
  if (!localizedModule || slug === "rag") return {};
  return {
    title: localizedModule.title,
    description: localizedModule.definition,
    alternates: { canonical: `/en/modules/${slug}`, languages: { en: `/en/modules/${slug}`, "zh-CN": `/modules/${slug}` } },
  };
}

export default async function EnglishSharedModulePage({ params }: PageProps) {
  const { slug } = await params;
  if (slug === "rag" || !englishModuleRegistry[slug]) notFound();
  return <EnglishModulePage module={requireEnglishModule(slug)} />;
}
