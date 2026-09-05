import type { Metadata } from "next";

type ChinesePageMetadataInput = {
  title: string;
  description: string;
  path: string;
  enPath: string;
};

// 中文页面元数据：与 englishPageMetadata 对称，输出 canonical 与 hreflang 双语交替链接。
// metadataBase 已在 app/(zh)/layout.tsx 设置，这里只写站内路径。
export function chinesePageMetadata({ title, description, path, enPath }: ChinesePageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { "zh-CN": path, en: enPath },
    },
  };
}
