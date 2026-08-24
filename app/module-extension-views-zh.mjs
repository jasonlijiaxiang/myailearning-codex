import { moduleExtensionViews } from "./module-extension-views.mjs";

const conciseTitles = Object.freeze({
  "model-landscape": "模型选型的业务损失坐标",
  multimodal: "照片、语音和视频在哪一步丢了信息",
  mcp: "MCP 交换能力，业务系统决定授权",
  a2a: "一项跨 Agent 任务如何暂停、恢复或失败",
  veadk: "把 VeADK 应用交到平台手里",
  agentkit: "AgentKit 上云后，谁负责运行结果",
  evaluation: "把“效果不错”写成评估合同",
  "ai-governance": "谁批准 AI 用途，靠什么持续证明",
  "ai-gateway": "沿一条请求检查 AI 网关",
  "ai-ops": "发布失败后，系统怎样停下并恢复",
  "prompt-engineering": "生产 Prompt 到底装进了什么",
  "predictive-ai-mlops": "让一次预测可以复现、替换和回滚",
  "llm-training": "训练产物如何一路进入可部署模型",
  "llm-inference": "推理慢，先看时间账还是显存账",
  "data-engineering": "一份资料怎样变成可撤回的 AI 数据",
  "ai-infra-platform": "平台管什么，工作负载自己管什么",
  "ai-infra-compute": "GPU 很忙，数据可能还没到它手里",
});

export function getChineseModuleExtensionView(slug) {
  const view = moduleExtensionViews[slug];
  if (!view) return null;
  const title = conciseTitles[slug] ?? view.title;
  const steps = slug === "mcp"
    ? view.steps.map((step) => step.code === "CLIENT"
      ? Object.freeze({
          ...step,
          en: "Request-scoped Exchange",
          detail: "面向一个 Server 发送自包含请求；版本与能力元数据随请求表达，不建立协议级 Session。",
          signal: "请求身份与最终资源权限仍是两层控制。",
        })
      : step)
    : view.steps;

  return Object.freeze({ ...view, title, steps: Object.freeze(steps) });
}
