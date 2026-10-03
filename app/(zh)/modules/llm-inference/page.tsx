import type { Metadata } from "next";
import { chinesePageMetadata } from "../../../i18n/chinese-page-metadata";

import { InferenceModulePage } from "../../../inference-module-page";

export const metadata: Metadata = chinesePageMetadata({
  title: "大模型推理 | AI 学习手册",
  description: "大模型推理（LLM Inference）的核心原理、选型边界、云服务连接与深度问答。",
  path: "/modules/llm-inference",
  enPath: "/en/modules/llm-inference",
});

export default function LlmInferencePage() {
  return <InferenceModulePage />;
}
