import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { balanceRows } from "../../layout-utils.mjs";
import { BalancedGrid, CriticalBoundary, ModuleEvidenceGrid, ModuleQaList } from "../../module-content-components";
import { promptEvidenceCards, promptQa } from "../../prompt-content.mjs";
import { sourceLedger } from "../../reference-content.mjs";

export const metadata: Metadata = {
  title: "提示词工程 · Prompt Engineering | 云计算 × AI 平台售前知识库",
  description: "提示词与上下文工程的基础机制、核心模式、版本治理、云服务连接、PoC 评估及售前深度问答。",
};

const conceptLinks = [
  { concept: "模型原理与上下文窗口", owner: "模型原理", href: "/modules/model-principles", relation: "前置知识", local: "理解 token、上下文容量、指令遵循与生成不确定性。" },
  { concept: "RAG 与 Grounding", owner: "RAG · 检索增强生成", href: "/modules/rag", relation: "知识供给", local: "提示负责使用证据，不负责把正确证据检索出来。" },
  { concept: "Agent 与工具调用", owner: "Agent · 智能体", href: "/modules/ai-agent", relation: "行动扩展", local: "工具定义进入上下文；授权、执行和状态由应用控制。" },
  { concept: "工作流与结构化生成", owner: "工作流与结构化生成", href: "/modules/workflow-structured-generation", relation: "输出消费", local: "把自然语言结果约束为可被下游系统可靠处理的结构。" },
  { concept: "评估", owner: "评估", href: "/modules/evaluation", relation: "质量门槛", local: "提示版本必须用固定任务集回归，不能凭演示观感发布。" },
  { concept: "安全与治理", owner: "安全与治理", href: "/modules/safety-governance", relation: "风险控制", local: "提示注入（Prompt Injection）、数据泄漏和越权不能只靠系统提示（System Prompt）防御。" },
  { concept: "推理与 AI 网关", owner: "推理与 AI 网关", href: "/modules/inference-ai-gateway", relation: "生产入口", local: "承载多模型路由、限流、密钥、策略、回滚与成本控制。" },
  { concept: "可观测与 FinOps", owner: "可观测与 FinOps", href: "/modules/observability-finops", relation: "运营闭环", local: "关联提示版本、模型、输入、输出、时延、质量和单次成功成本。" },
];

const conceptRows = balanceRows(conceptLinks, 4);

const promptPatterns = [
  { name: "零样本提示 · Zero-shot Prompting", cue: "先建最小基线", pipeline: "目标 + 输入 + 约束 + 输出要求", boundary: "适合先做最小基线；复杂边界仅靠文字描述可能不稳定。" },
  { name: "少样本示例 · Few-shot Examples", cue: "用示例澄清边界", pipeline: "代表性输入 → 期望输出 → 边界 / 拒答样例", boundary: "示例占用上下文并可能携带偏差；应以评估收益决定数量。" },
  { name: "结构化输出 · Structured Outputs", cue: "约束结果形状", pipeline: "业务对象 → Schema → 模型输出 → 应用校验", boundary: "保证结构不等于保证字段值真实、合规或可执行。" },
  { name: "工具定义 · Tool Definition", cue: "声明可调用能力", pipeline: "名称 + 描述 + 参数 → 调用意图 → 应用执行", boundary: "模型不能自行获得权限；工具选择和参数仍需校验与审计。" },
  { name: "有据生成 · Grounding", cue: "让回答基于证据", pipeline: "权威上下文 + 来源标识 + 使用规则 + 拒答条件", boundary: "提示无法弥补漏检、过期来源或错误权限过滤。" },
];

const messageResponsibilities = [
  { code: "A", title: "平台 / 应用指令", body: "定义产品角色、允许任务、总体约束与输出规范。适合稳定策略，不应存放密钥、权限表或必须保密的系统信息。", control: "常见字段：System / Developer / Instructions；以所选 API 为准" },
  { code: "B", title: "用户消息 · User Message", body: "表达本次目标和输入。它是业务请求，不应有权修改身份、授权或后台策略；需要做长度、内容和敏感数据检查。", control: "信任边界：外部输入，默认不可信" },
  { code: "C", title: "上下文与示例 · Context & Examples", body: "文档、历史、少样本示例和工具结果可改善任务完成，但也可能包含过期事实、恶意指令或不适用的历史状态。", control: "治理重点：来源、权限、时效、token 预算" },
  { code: "D", title: "应用控制 · Application Control", body: "身份、授权、工具执行、数据写入、输出校验和最终业务动作必须由确定性系统执行，不能委托给自然语言提示。", control: "主归属：安全治理 / API / Agent / 工作流" },
];

const messageResponsibilityRows = balanceRows(messageResponsibilities, 4);

const cloudHooks = [
  { stage: "模型接入", services: "模型即服务、模型目录、推理端点、多模型路由", value: "在质量、时延、成本与数据边界间选择模型", discover: "是否需要跨厂商？固定快照还是自动升级？" },
  { stage: "模板管理", services: "Prompt 管理、配置中心、代码仓库、密钥管理", value: "把模板、变量、审批和回滚纳入版本治理", discover: "谁能修改？能否追踪一次回答使用的确切版本？" },
  { stage: "上下文供给", services: "托管搜索、向量库、数据库、对象存储、会话状态", value: "按身份和任务动态提供证据与状态", discover: "上下文来自哪里？多久更新？是否分权限？" },
  { stage: "结构与工具", services: "API 网关、函数计算、工作流、事件总线、Schema Registry", value: "连接业务 API 并让输出可被系统消费", discover: "哪些动作只读、哪些改变状态、哪些需要审批？" },
  { stage: "安全治理", services: "IAM、KMS、WAF、内容安全、DLP、私网、审计", value: "隔离不可信输入并控制数据与动作权限", discover: "是否含敏感数据？提示和日志能否留存？" },
  { stage: "评估发布", services: "评估平台、CI/CD、灰度、特征开关、模型网关", value: "提示与模型升级前回归，失败时快速回滚", discover: "上线门槛、审批人和回滚目标是什么？" },
  { stage: "观测运营", services: "Tracing、APM、日志、告警、成本分析、提示缓存（Prompt Cache）", value: "定位退化并核算每个成功任务成本", discover: "需要保存哪些输入输出？保留期和脱敏要求是什么？" },
];

export default function PromptEngineeringModulePage() {
  return (
    <main>
      <section className="ragHero" id="prompt-engineering" aria-labelledby="prompt-title">
        <nav className="topbar" aria-label="模块导航">
          <Link className="brand" href="/" aria-label="返回云与 AI 售前知识库首页">
            <span className="brandMark">CA</span>
            <span>Cloud × AI / Presales Fieldbook</span>
          </Link>
          <div className="toplinks">
            <Link href="#prompt-foundation">基础机制</Link>
            <Link href="#qa">高频问答</Link>
            <Link href="/references">Reference</Link>
          </div>
        </nav>
        <div className="ragHeader">
          <div>
            <p className="kicker light">MODULE · MODEL FOUNDATION · V0.9</p>
            <h1
              className="moduleHeroTitle"
              id="prompt-title"
              style={{ "--module-title-size": "clamp(64px,7vw,106px)", "--module-title-mobile-size": "clamp(48px,15vw,62px)" } as CSSProperties}
            >提示词工程<br /><span>Prompt Engineering</span></h1>
          </div>
          <div className="ragDefinition">
            <p>把业务目标、上下文、约束与输出契约翻译成模型可执行的输入，并通过版本、评估和安全控制持续验证；它是系统工程的一部分，不是寻找一句“万能咒语”。</p>
          </div>
        </div>
      </section>

      <section className="section ragBody" aria-label="提示词工程核心内容">
        <div className="sectionNumber">05</div>
        <div className="sectionBody">
          <div className="decisionBanner">
            <p className="kicker">PRESALES POSITION</p>
            <h3>一句话定位</h3>
            <p>客户需要的不是“更会写 Prompt 的个人”，而是一套能把提示、模型、上下文和工具作为同一发布单元进行测试、审计、回滚和运营的能力。</p>
          </div>

          <div className="subsection" id="concept-map" data-quality-section="related-modules">
            <div className="subHead"><span>5.1</span><div><p className="kicker">KNOWLEDGE CONNECTIONS</p><h3>提示词工程在知识地图中的位置与相关模块</h3></div></div>
            <p className="sectionLead">本模块聚焦“如何表达任务并治理模型输入”。知识检索、Agent 规划、API 授权、模型推理和评估各有独立主模块；这里给出必要连接，避免把整个 AI 应用都误称为 Prompt Engineering。</p>
            <div className="conceptGrid" data-count={conceptLinks.length} data-odd={conceptLinks.length % 2 === 1 ? "true" : "false"}>
              {conceptRows.flatMap((row) => row.map((item) => (
                <article key={item.concept} style={{ "--concept-span": 12 / row.length } as CSSProperties}>
                  <div className="conceptCard">
                    <div className="conceptMeta"><span>{item.relation}</span><Link href={item.href}>{item.owner} ↗</Link></div>
                    <h4>{item.concept}</h4>
                    <p>{item.local}</p>
                  </div>
                </article>
              )))}
            </div>
          </div>

          <div className="subsection foundationSection" id="prompt-foundation" data-quality-section="principle">
            <div className="subHead"><span>5.2</span><div><p className="kicker">FOUNDATION &amp; BOUNDARY</p><h3>Prompt 是什么，以及 Context Engineering 的边界</h3></div></div>
            <div className="memoryCompare">
              <article>
                <p className="miniLabel">PROMPT ENGINEERING</p>
                <h4>提示词工程 · Prompt Engineering</h4>
                <p>设计任务、规则、示例和输出要求，让模型更稳定地完成一个已定义任务；主要优化“怎么表达、怎样验证”。</p>
              </article>
              <article className="externalMemory">
                <p className="miniLabel">CONTEXT ENGINEERING</p>
                <h4>上下文工程 · Context Engineering</h4>
                <p>在每次调用前动态选择并组装指令、身份、会话、证据、工具和结果；主要优化“此刻应该让模型看到什么”。</p>
              </article>
            </div>

            <div className="principleDepth">
              <header className="principleDepthIntro">
                <p className="miniLabel">PRESALES MECHANISM</p>
                <h4>从“写一句话”升级为“构造一次受控调用”</h4>
                <p>生产请求不是单一文字，而是由不同责任方提供的多段输入。技术售前应先解释每段信息的来源、信任级别和生命周期，再讨论措辞优化。</p>
              </header>
              <div className="ragMechanism" aria-label="提示调用的三类输入">
                <article><span>01</span><h5>稳定指令 · Instructions</h5><p>应用目标、行为边界、语气和输出契约；由产品与工程维护，并进入版本、审批和回归流程。</p></article>
                <article><span>02</span><h5>动态上下文 · Context</h5><p>用户问题、身份、会话、检索证据和业务状态；每次调用都可能不同，必须做权限、长度和来源控制。</p></article>
                <article><span>03</span><h5>能力接口 · Tools &amp; Schema</h5><p>工具定义告诉模型可提出哪些调用；Schema 约束结果形状。真正授权、执行与业务校验仍在应用侧。</p></article>
              </div>
              <CriticalBoundary>消息角色与指令层级能帮助模型区分来源，却不是通用安全协议。不同模型 API 的角色、优先级与能力并不完全一致；<strong>必须执行的规则应落在模型外</strong>。</CriticalBoundary>
            </div>
          </div>

          <div className="subsection" id="message-hierarchy">
            <div className="subHead"><span>5.3</span><div><p className="kicker">MESSAGE &amp; RESPONSIBILITY</p><h3>消息、指令与应用责任</h3></div></div>
            <div className="mechanicGrid" data-count={messageResponsibilities.length} data-odd={messageResponsibilities.length % 2 === 1 ? "true" : "false"}>
              {messageResponsibilityRows.flatMap((row) => row.map((item, index) => (
                <article className={index === row.length - 1 ? "mechanicRowEnd" : undefined} key={item.code} style={{ "--mechanic-span": 12 / row.length } as CSSProperties}>
                  <span className="mechanicNo">{item.code}</span><h4>{item.title}</h4><p>{item.body}</p><small>{item.control}</small>
                </article>
              )))}
            </div>
          </div>

          <div className="subsection" id="patterns">
            <div className="subHead"><span>5.4</span><div><p className="kicker">CORE PATTERNS</p><h3>五种常用模式及适用边界</h3></div></div>
            <div className="variantList">
              {promptPatterns.map((item) => (
                <article key={item.name}>
                  <div><p className="miniLabel">{item.cue}</p><h4>{item.name}</h4></div>
                  <p className="variantPipeline">{item.pipeline}</p>
                  <p>{item.boundary}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="subsection" id="templates">
            <div className="subHead"><span>5.5</span><div><p className="kicker">TEMPLATES &amp; VARIABLES</p><h3>可维护的提示模板 · Prompt Template</h3></div></div>
            <div className="tableWrap">
              <table>
                <thead><tr><th>组成</th><th>放什么</th><th>不要放什么</th><th>治理方式</th><th>售前发现问题</th></tr></thead>
                <tbody>
                  <tr><th>目标 / Task</th><td>单一可验证任务与成功定义</td><td>多个互相冲突的目标</td><td>任务 ID + 负责人</td><td>成功由谁判断？</td></tr>
                  <tr><th>约束 / Constraints</th><td>适用范围、拒答和输出规则</td><td>真正的授权或密钥</td><td>策略版本 + 安全评审</td><td>哪些规则必须硬执行？</td></tr>
                  <tr><th>变量 / Variables</th><td>已校验输入、身份与业务状态</td><td>未分隔的不可信字符串</td><td>类型、长度、来源、脱敏</td><td>变量来自谁？能否被篡改？</td></tr>
                  <tr><th>示例 / Examples</th><td>主路径、边界和拒答样例</td><td>偶然 Demo 或过时政策</td><td>与评估集联动复核</td><td>示例覆盖哪些真实分组？</td></tr>
                  <tr><th>输出 / Output Contract</th><td>面向用户的格式或系统 Schema</td><td>只写“请输出 JSON”</td><td>Schema + 应用校验</td><td>下游如何处理失败？</td></tr>
                </tbody>
              </table>
            </div>
            <BalancedGrid className="technicalNotes" maxColumns={3}>
              <article><p className="miniLabel">SEPARATION</p><h4>指令与数据分离</h4><p>使用清晰字段、标签或消息边界标记指令、示例和外部数据；分隔有助理解，但本身不能阻止提示注入。</p></article>
              <article><p className="miniLabel">TYPED INPUT</p><h4>变量先校验再注入</h4><p>动态值应经过类型、长度、权限和敏感级别校验；不要让模板字符串拼接成为隐蔽的数据入口。</p></article>
              <article><p className="miniLabel">REUSABLE PREFIX</p><h4>稳定前缀便于缓存</h4><p>把稳定指令和常用示例放在前部、动态数据放在后部，既便于维护，也可能利用模型服务的提示缓存（Prompt Caching）。</p></article>
            </BalancedGrid>
          </div>

          <div className="subsection" id="fit-check">
            <div className="subHead"><span>5.6</span><div><p className="kicker">FIT CHECK</p><h3>什么问题适合由 Prompt 解决</h3></div></div>
            <div className="fitGrid">
              <article className="fit yes">
                <h4><span>✓</span> 优先提示优化</h4>
                <ul><li>任务目标、语气或输出要求表达不清</li><li>模型需要少量示例理解标签或边界</li><li>证据已进入上下文但使用方式不稳定</li><li>需要结构化输出或明确拒答条件</li><li>同一任务需要可维护模板和变量</li></ul>
              </article>
              <article className="fit maybe">
                <h4><span>△</span> 应先改其他层</h4>
                <ul><li>缺少最新、权威或有权限的知识</li><li>任务超过模型能力或上下文容量</li><li>需要确定性计算、授权或事务执行</li><li>检索、工具或源数据本身错误</li><li>核心瓶颈是延迟、容量或成本</li></ul>
              </article>
            </div>
          </div>

          <div className="subsection" id="version-governance">
            <div className="subHead"><span>5.7</span><div><p className="kicker">MODEL &amp; VERSION GOVERNANCE</p><h3>模型差异、提示版本与发布控制</h3></div></div>
            <div className="tableWrap">
              <table>
                <thead><tr><th>变化项</th><th>可能影响</th><th>必须记录</th><th>发布检查</th><th>回滚单位</th></tr></thead>
                <tbody>
                  <tr><th>Prompt 模板</th><td>指令遵循、语气、拒答、token</td><td>prompt_version、变更人、目的</td><td>任务集 + 边界集回归</td><td>模板版本</td></tr>
                  <tr><th>模型 / 快照</th><td>能力、角色处理、时延、价格</td><td>provider、model_id、snapshot</td><td>同输入影子对比</td><td>模型路由</td></tr>
                  <tr><th>上下文策略</th><td>证据覆盖、噪声、位置与成本</td><td>检索、组装和截断版本</td><td>证据覆盖与忠实度</td><td>上下文策略</td></tr>
                  <tr><th>Tool / Schema</th><td>工具选择、参数与下游兼容</td><td>tool_set、schema_version</td><td>模拟执行 + 负例</td><td>工具 / Schema</td></tr>
                  <tr className="highlight"><th>完整调用配置</th><td>端到端任务成功与风险</td><td>以上全部 + eval_set</td><td>灰度、告警、人工签署</td><td>发布 Bundle</td></tr>
                </tbody>
              </table>
            </div>
            <p className="sectionFootnote">Prompt 的可迁移部分是业务意图与测试集；角色名称、工具协议、结构化输出和模型特有技巧应放在薄适配层，不应假设跨模型逐字复制仍然等价。</p>
          </div>

          <div className="subsection" id="evidence" data-quality-section="evidence">
            <div className="subHead"><span>5.8</span><div><p className="kicker">EVIDENCE WITH BOUNDARIES</p><h3>可引用事实及适用边界</h3></div></div>
            <ModuleEvidenceGrid cards={promptEvidenceCards} sourceLedger={sourceLedger} maxColumns={3} />
          </div>

          <div className="subsection cloudSection" id="cloud-opportunities" data-quality-section="cloud">
            <div className="subHead"><span>5.9</span><div><p className="kicker">CLOUD OPPORTUNITY MAP</p><h3>提示词工程与云服务机会</h3></div></div>
            <div className="cloudIntro">
              <p>Prompt 是整体方案中的一个配置面。真正可销售、可验收的能力来自模型接入、上下文供给、工具编排、安全、发布和持续运营的组合。</p>
              <span>能力先于产品名</span><span>模型与提示共同验收</span><span>当期规格单独核验</span>
            </div>
            <div className="cloudTable tableWrap">
              <table>
                <thead><tr><th>环节</th><th>可连接的云服务</th><th>客户价值</th><th>售前发现问题</th></tr></thead>
                <tbody>{cloudHooks.map((item) => <tr key={item.stage}><th>{item.stage}</th><td>{item.services}</td><td>{item.value}</td><td>{item.discover}</td></tr>)}</tbody>
              </table>
            </div>
            <BalancedGrid className="solutionBundles" maxColumns={3}>
              <article><p className="miniLabel">BUNDLE A</p><h4>生产级模型接入</h4><p>模型服务 + AI 网关 + Prompt / 配置管理 + 密钥 + 限流 + Tracing。</p><small>购买角色：应用平台、云平台、安全与架构团队</small></article>
              <article><p className="miniLabel">BUNDLE B</p><h4>可评估发布流水线</h4><p>评估集 + CI/CD + 模型 / Prompt 注册 + 灰度 + 回滚 + 质量告警。</p><small>购买角色：AI 平台、测试、产品与业务负责人</small></article>
              <article><p className="miniLabel">BUNDLE C</p><h4>安全工具与数据连接</h4><p>API 网关 + IAM + 工作流 / 函数 + DLP + 审批 + 审计 + 私网连接。</p><small>购买角色：集成团队、安全、数据与业务系统负责人</small></article>
            </BalancedGrid>
          </div>

          <div className="subsection" id="poc">
            <div className="subHead"><span>5.10</span><div><p className="kicker">POC PLAYBOOK</p><h3>10 个工作日 Prompt PoC 验证包</h3></div></div>
            <div className="pocGrid">
              <article><span>D1–2</span><h4>定义任务与基线</h4><p>选 2–3 个高价值任务；冻结真实输入、期望输出、错误成本、边界和现有流程基线。</p></article>
              <article><span>D3–5</span><h4>建立模板与模式</h4><p>从 Zero-shot 开始；按失败加入示例、Grounding、Schema 或 Tool Definition，一次只改变一类变量。</p></article>
              <article><span>D6–8</span><h4>模型与版本对比</h4><p>固定评估集比较候选模型、Prompt 版本和上下文策略；记录质量、P95、token 与成功成本。</p></article>
              <article><span>D9–10</span><h4>安全与发布验收</h4><p>测试注入、敏感数据、拒答、错误工具参数、模型升级和回滚；输出门槛、责任与上线差距。</p></article>
            </div>
            <div className="gates">
              <h4>建议的 Go / No-Go 门槛结构</h4>
              <div className="gateList"><span>任务成功率</span><span>关键字段正确率</span><span>Schema 通过率</span><span>拒答正确率</span><span>工具选择 / 参数</span><span>注入与越权</span><span>P95 / token</span><span>单次成功成本</span></div>
              <p>具体阈值由客户风险、现有基线和候选云服务实测共同确定；平均分不能掩盖高风险场景失败。</p>
            </div>
          </div>

          <div className="subsection qaSection" id="qa" data-quality-section="qa">
            <div className="subHead"><span>5.11</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h3>客户高频问题与深度回答</h3></div></div>
            <p className="qaGuide">现场先给“结论短答”，客户继续追问时再展开“深一层”。每题同时给出证据边界和售前下一问。</p>
            <ModuleQaList items={promptQa} sourceLedger={sourceLedger} />
          </div>
        </div>
      </section>

      <footer>
        <div><span className="brandMark">CA</span><strong>云计算 × AI 平台售前知识库</strong></div>
        <p>提示词工程独立模块 V0.9 · 2026-07-17</p>
        <a href="#prompt-engineering">返回顶部 ↑</a>
      </footer>
    </main>
  );
}
