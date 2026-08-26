import type { Metadata } from "next";

import { McpModuleExperience } from "../../../mcp-module-experience";

export const metadata: Metadata = {
  title: "MCP · 模型上下文协议 | 云计算 × AI 平台售前知识库",
  description: "MCP 的协议角色、服务原语、授权边界、版本契约、生产实验与客户查证。",
};

export default function McpPage() {
  return <McpModuleExperience />;
}
