import type { Metadata } from "next";

import { A2AModuleExperience } from "../../../a2a-module-experience";

export const metadata: Metadata = {
  title: "A2A · 智能体间协议 | 云计算 × AI 平台售前知识库",
  description: "A2A 的 Agent Card、Message 与 Task、九个状态、恢复交付、身份授权与采用边界。",
};

export default function A2APage() {
  return <A2AModuleExperience />;
}
