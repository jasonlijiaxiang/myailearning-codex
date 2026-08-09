import type { Metadata } from "next";

type EnglishPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  zhPath: string;
};

export function englishPageMetadata({ title, description, path, zhPath }: EnglishPageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { en: path, "zh-CN": zhPath },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "Cloud × AI Presales Fieldbook",
      title,
      description,
      images: [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [],
    },
  };
}
