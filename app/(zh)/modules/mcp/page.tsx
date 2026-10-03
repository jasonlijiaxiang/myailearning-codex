import type { Metadata } from "next";
import { chinesePageMetadata } from "../../../i18n/chinese-page-metadata";

import { McpModuleExperience } from "../../../mcp-module-experience";

export const metadata: Metadata = chinesePageMetadata({
  title: "MCP · 模型上下文协议 | AI 学习手册",
  description: "MCP 的协议角色、服务原语、授权边界、版本契约、生产实验与查证。",
  path: "/modules/mcp",
  enPath: "/en/modules/mcp",
});

export default function McpPage() {
  return <McpModuleExperience />;
}
