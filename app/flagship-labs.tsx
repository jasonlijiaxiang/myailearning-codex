"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

type LabOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

function LabTabs<T extends string>({
  idPrefix,
  label,
  options,
  panelId,
  value,
  onChange,
}: {
  idPrefix: string;
  label: string;
  options: Array<LabOption<T>>;
  panelId: string;
  value: T;
  onChange: (next: T) => void;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveFocus = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    const horizontal = event.key === "ArrowLeft" || event.key === "ArrowRight";
    const vertical = event.key === "ArrowUp" || event.key === "ArrowDown";
    if (!horizontal && !vertical && event.key !== "Home" && event.key !== "End") return;

    event.preventDefault();
    const last = options.length - 1;
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? last
        : (index + (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
    const next = options[nextIndex];
    onChange(next.value);
    refs.current[nextIndex]?.focus();
  };

  return (
    <div className="flagshipLab__tabs" role="tablist" aria-label={label}>
      {options.map((option, index) => (
        <button
          className="flagshipLab__tab"
          data-active={option.value === value ? "true" : "false"}
          id={`${idPrefix}-tab-${option.value}`}
          aria-controls={panelId}
          aria-selected={option.value === value}
          role="tab"
          tabIndex={option.value === value ? 0 : -1}
          type="button"
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => moveFocus(event, index)}
          ref={(node) => {
            refs.current[index] = node;
          }}
          key={option.value}
        >
          <span>{option.label}</span>
          {option.hint ? <small>{option.hint}</small> : null}
        </button>
      ))}
    </div>
  );
}

type RetrievalStrategy = "bm25" | "vector" | "hybrid" | "rerank";

type RetrievalCandidate = {
  id: string;
  title: string;
  signal: string;
  correct?: boolean;
};

type RetrievalResult = {
  candidates: RetrievalCandidate[];
  failure: string;
  conclusion: string;
};

type RetrievalScenario = {
  id: string;
  label: string;
  query: string;
  challenge: string;
  correctEvidence: string;
  results: Record<RetrievalStrategy, RetrievalResult>;
};

const retrievalStrategies: Array<LabOption<RetrievalStrategy>> = [
  { value: "bm25", label: "关键词检索 BM25", hint: "精确词项优先" },
  { value: "vector", label: "向量检索 Vector", hint: "语义相似优先" },
  { value: "hybrid", label: "混合检索 Hybrid + RRF", hint: "合并两路候选" },
  { value: "rerank", label: "重排序 Rerank", hint: "对候选精排" },
];

const retrievalScenarios: RetrievalScenario[] = [
  {
    id: "exact-policy",
    label: "精确条款",
    query: "企业版审计日志保留多久？",
    challenge: "产品名与“审计日志保留”都是强关键词；答案还必须来自当前版本，而不是通用安全说明。",
    correctEvidence: "《企业版安全与合规规格 v2026.06》· 审计日志章节",
    results: {
      bm25: {
        candidates: [
          { id: "SEC-2606", title: "企业版安全与合规规格 v2026.06", signal: "命中：企业版、审计日志、保留", correct: true },
          { id: "OPS-118", title: "日志服务容量规划指南", signal: "命中：日志、保留" },
          { id: "SEC-2509", title: "企业版安全规格 v2025.09", signal: "高词项匹配，但版本已旧" },
        ],
        failure: "当客户改用“留痕保存多久”一类表达，或文档扫描质量差导致关键词缺失时，排名会明显下滑。",
        conclusion: "有稳定产品名、术语和版本号时，BM25 是低成本强基线；上线前仍要做版本过滤。",
      },
      vector: {
        candidates: [
          { id: "OPS-118", title: "日志服务容量规划指南", signal: "“日志生命周期”语义接近，但不是产品承诺" },
          { id: "SEC-2606", title: "企业版安全与合规规格 v2026.06", signal: "语义相关且版本正确", correct: true },
          { id: "REG-041", title: "金融行业数据留存建议", signal: "讨论留存，但属于行业建议" },
        ],
        failure: "语义相似不等于适用范围一致；通用指南可能压过精确的产品条款。",
        conclusion: "向量检索能接住改写问法，但不能替代产品、地域、版本等结构化过滤。",
      },
      hybrid: {
        candidates: [
          { id: "SEC-2606", title: "企业版安全与合规规格 v2026.06", signal: "两路均召回，精确词与语义共同支持", correct: true },
          { id: "OPS-118", title: "日志服务容量规划指南", signal: "语义强、词项中等" },
          { id: "SEC-2509", title: "企业版安全规格 v2025.09", signal: "词项强，但版本过滤降权" },
        ],
        failure: "如果融合前不做权限、版本和产品过滤，两路检索会一起放大错误候选。",
        conclusion: "混合检索适合企业知识库默认起点，但元数据过滤必须发生在可控位置。",
      },
      rerank: {
        candidates: [
          { id: "SEC-2606", title: "企业版安全与合规规格 v2026.06", signal: "问题—段落匹配最完整，且版本有效", correct: true },
          { id: "SEC-2509", title: "企业版安全规格 v2025.09", signal: "内容直接，但因旧版本降至第二" },
          { id: "OPS-118", title: "日志服务容量规划指南", signal: "主题相关，不构成产品承诺" },
        ],
        failure: "重排序只能重排已召回内容；正确证据未进入候选集时，它无法补救。",
        conclusion: "当候选之间只差版本、适用范围等细节时，Reranker 的价值高于继续扩大 Top-K。",
      },
    },
  },
  {
    id: "semantic-rewrite",
    label: "语义改写",
    query: "制度换版后，知识库能不能自动跟着更新？",
    challenge: "客户没有使用“增量同步、版本生效、索引重建”等文档术语，需要跨越口语与工程语言。",
    correctEvidence: "《知识更新与版本生效规则》· 增量同步及撤回机制",
    results: {
      bm25: {
        candidates: [
          { id: "DOC-014", title: "知识库产品常见问题", signal: "命中：知识库、更新" },
          { id: "SYNC-031", title: "内容同步故障排查", signal: "命中：同步、更新" },
          { id: "OPS-063", title: "模型版本升级手册", signal: "命中：版本、升级，但对象错误" },
        ],
        failure: "正确文档使用“版本生效”和“撤回”，与客户口语重合少，因此未进入 Top-3。",
        conclusion: "口语化问题不能只靠词面匹配；售前 PoC 应专门准备同义改写测试集。",
      },
      vector: {
        candidates: [
          { id: "GOV-208", title: "知识更新与版本生效规则", signal: "语义覆盖换版、同步与生效", correct: true },
          { id: "SYNC-031", title: "内容同步故障排查", signal: "覆盖同步异常，但不是正常机制" },
          { id: "DOC-014", title: "知识库产品常见问题", signal: "主题接近，信息深度不足" },
        ],
        failure: "当多个文档都谈“更新”时，纯向量相似度仍可能忽略是否支持撤回、延迟和一致性边界。",
        conclusion: "语义检索适合承接口语，但答案要同时返回生效时间、失败回滚和可观测状态。",
      },
      hybrid: {
        candidates: [
          { id: "GOV-208", title: "知识更新与版本生效规则", signal: "语义召回后由“版本、生效”词项增强", correct: true },
          { id: "SYNC-031", title: "内容同步故障排查", signal: "两路均有信号，但属于异常处理" },
          { id: "DOC-014", title: "知识库产品常见问题", signal: "词项命中较多，证据粒度较粗" },
        ],
        failure: "若切块把“同步、索引、生效”拆散，融合也只能看到不完整证据。",
        conclusion: "混合检索需和切块、标题继承、版本元数据一起验收，不能单看召回算法名称。",
      },
      rerank: {
        candidates: [
          { id: "GOV-208", title: "知识更新与版本生效规则", signal: "完整回答同步、生效、撤回与延迟", correct: true },
          { id: "SYNC-031", title: "内容同步故障排查", signal: "只回答失败场景" },
          { id: "DOC-014", title: "知识库产品常见问题", signal: "结论正确但缺少工程边界" },
        ],
        failure: "Reranker 会增加延迟和成本，且对领域术语不熟时可能错误偏好更流畅的段落。",
        conclusion: "把重排序放在小而干净的候选集上，并用业务问题评估 NDCG、答案引用与延迟。",
      },
    },
  },
  {
    id: "compound-constraints",
    label: "复合约束",
    query: "亚太区金融客户，必须私网部署且资料不得跨区，应该选哪个方案？",
    challenge: "问题同时包含行业、地域、网络和数据驻留约束；“大致相似”的方案可能在关键边界上不可用。",
    correctEvidence: "《金融行业亚太区私网部署矩阵 v3.2》· 区域与数据驻留表",
    results: {
      bm25: {
        candidates: [
          { id: "NET-071", title: "私网接入配置手册", signal: "私网词项很强，但没有行业与跨区边界" },
          { id: "FIN-AP32", title: "金融行业亚太区私网部署矩阵 v3.2", signal: "四项约束全部出现", correct: true },
          { id: "FIN-GEN", title: "金融行业解决方案概览", signal: "行业匹配，部署信息过于概括" },
        ],
        failure: "单个高频约束可能主导排名，使只满足“私网”的配置手册排在完整答案之前。",
        conclusion: "BM25 能暴露强约束词，但复合资格判断需要字段过滤或后续精排。",
      },
      vector: {
        candidates: [
          { id: "FIN-GEN", title: "金融行业解决方案概览", signal: "整体语义最像，但未承诺数据驻留" },
          { id: "FIN-AP32", title: "金融行业亚太区私网部署矩阵 v3.2", signal: "约束完整、表格信息密集", correct: true },
          { id: "NET-071", title: "私网接入配置手册", signal: "网络相关，缺地域与行业" },
        ],
        failure: "向量相似度容易偏好叙述完整的概览，而不是包含关键布尔约束的表格行。",
        conclusion: "涉及合规资格时，结构化字段和表格解析比“语义更像”更重要。",
      },
      hybrid: {
        candidates: [
          { id: "NET-071", title: "私网接入配置手册", signal: "关键词强，仍缺两个约束" },
          { id: "FIN-AP32", title: "金融行业亚太区私网部署矩阵 v3.2", signal: "两路稳定召回，完整性更高", correct: true },
          { id: "FIN-GEN", title: "金融行业解决方案概览", signal: "语义强，证据不够具体" },
        ],
        failure: "RRF 只融合名次，不理解“必须”代表硬约束，因此完整证据未必自动排第一。",
        conclusion: "混合召回解决“找得到”，硬约束匹配和精排负责“放得对”。",
      },
      rerank: {
        candidates: [
          { id: "FIN-AP32", title: "金融行业亚太区私网部署矩阵 v3.2", signal: "行业、地域、私网、驻留四项均满足", correct: true },
          { id: "NET-071", title: "私网接入配置手册", signal: "满足私网，但不能证明数据不跨区" },
          { id: "FIN-GEN", title: "金融行业解决方案概览", signal: "行业匹配，缺部署承诺" },
        ],
        failure: "若区域矩阵没有被正确解析为行级证据，Reranker 仍可能看不到完整约束。",
        conclusion: "对选型资格问题，最佳链路通常是元数据过滤 → 混合召回 → 约束感知重排序 → 引用原表。",
      },
    },
  },
];

/**
 * 对比不同检索链如何改变同一客户问题的证据排名。
 */
export function RagRetrievalLab() {
  const uid = useId();
  const [scenarioId, setScenarioId] = useState(retrievalScenarios[0].id);
  const [strategy, setStrategy] = useState<RetrievalStrategy>("bm25");
  const scenario = retrievalScenarios.find((item) => item.id === scenarioId) ?? retrievalScenarios[0];
  const result = scenario.results[strategy];
  const correctIndex = result.candidates.findIndex((candidate) => candidate.correct);
  const strategyLabel = retrievalStrategies.find((item) => item.value === strategy)?.label ?? strategy;
  const scenarioPanelId = `${uid}-rag-scenario-panel`;
  const strategyPanelId = `${uid}-rag-result-panel`;

  return (
    <section className="flagshipLab flagshipLab--rag" aria-labelledby={`${uid}-rag-title`}>
      <header className="flagshipLab__header">
        <div>
          <p className="flagshipLab__eyebrow">INTERACTIVE LAB · RETRIEVAL</p>
          <h3 id={`${uid}-rag-title`}>RAG 检索链实验</h3>
        </div>
        <p>固定客户问题，只替换检索策略，观察正确证据如何上升、消失或被错误候选遮蔽。</p>
      </header>

      <div className="flagshipLab__controlGroup">
        <span className="flagshipLab__controlLabel">第一步：选择查询场景 Query scenario</span>
        <LabTabs
          idPrefix={`${uid}-scenario`}
          label="选择 RAG 查询场景"
          options={retrievalScenarios.map((item) => ({ value: item.id, label: item.label, hint: item.query }))}
          panelId={scenarioPanelId}
          value={scenario.id}
          onChange={setScenarioId}
        />
      </div>

      <article
        className="flagshipLab__scenario"
        id={scenarioPanelId}
        role="tabpanel"
        aria-labelledby={`${uid}-scenario-tab-${scenario.id}`}
      >
        <p className="flagshipLab__label">客户查询 Customer query</p>
        <blockquote>{scenario.query}</blockquote>
        <dl className="flagshipLab__facts">
          <div><dt>检索难点</dt><dd>{scenario.challenge}</dd></div>
          <div><dt>正确证据 Gold evidence</dt><dd>{scenario.correctEvidence}</dd></div>
        </dl>
      </article>

      <div className="flagshipLab__controlGroup">
        <span className="flagshipLab__controlLabel">第二步：切换检索策略 Retrieval strategy</span>
        <LabTabs
          idPrefix={`${uid}-strategy`}
          label="选择检索策略"
          options={retrievalStrategies}
          panelId={strategyPanelId}
          value={strategy}
          onChange={setStrategy}
        />
      </div>

      <div
        className="flagshipLab__panel"
        id={strategyPanelId}
        role="tabpanel"
        aria-labelledby={`${uid}-strategy-tab-${strategy}`}
      >
        <div className="flagshipLab__status" aria-live="polite" aria-atomic="true">
          <span>当前结果</span>
          <strong>{scenario.label} · {strategyLabel}</strong>
          <p>正确证据位置：{correctIndex >= 0 ? `第 ${correctIndex + 1} 名` : "未进入 Top-3"}</p>
        </div>

        <div className="flagshipLab__tableWrap">
          <table className="flagshipLab__ranking">
            <caption>{strategyLabel} 的 Top-3 候选排名</caption>
            <thead><tr><th scope="col">排名 Rank</th><th scope="col">候选证据 Candidate</th><th scope="col">命中信号 Signal</th><th scope="col">判断</th></tr></thead>
            <tbody>
              {result.candidates.map((candidate, index) => (
                <tr data-correct={candidate.correct ? "true" : "false"} key={candidate.id}>
                  <th scope="row">{index + 1}</th>
                  <td><strong>{candidate.title}</strong><small>{candidate.id}</small></td>
                  <td>{candidate.signal}</td>
                  <td>{candidate.correct ? "正确证据" : "干扰候选"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flagshipLab__insights">
          <article><p className="flagshipLab__label">何时会失败 Failure boundary</p><p>{result.failure}</p></article>
          <article><p className="flagshipLab__label">售前结论 Presales takeaway</p><p>{result.conclusion}</p></article>
        </div>
      </div>
    </section>
  );
}

type AgentStepId = "perceive" | "reason" | "act" | "observe" | "stop";

type AgentStepView = {
  status: string;
  before: string;
  transition: string;
  after: string;
  checkpoint: string;
  idempotency: string;
  handoff: string;
};

type AgentStep = {
  id: AgentStepId;
  label: string;
  en: string;
  purpose: string;
  normal: AgentStepView;
  timeout?: AgentStepView;
};

const agentSteps: AgentStep[] = [
  {
    id: "perceive",
    label: "感知",
    en: "Perceive",
    purpose: "读取客户请求、身份、会话状态与可用工具；先形成可执行输入，而不是立刻调用模型。",
    normal: {
      status: "输入已标准化",
      before: "新请求：为客户创建 PoC 环境",
      transition: "提取客户 ID、区域、规格和审批要求",
      after: "形成结构化任务；缺少预算中心字段",
      checkpoint: "尚未落盘；下一步前保存输入快照。",
      idempotency: "尚未生成；工具调用前由任务 ID 派生。",
      handoff: "缺关键字段时询问客户，不把猜测当作事实。",
    },
  },
  {
    id: "reason",
    label: "思考",
    en: "Reason",
    purpose: "选择计划、工具和停止条件；把“要完成什么”变成可检查的下一步。",
    normal: {
      status: "计划已生成",
      before: "结构化任务 + 工具目录 + 企业策略",
      transition: "补齐预算中心 → 校验配额 → 调用云资源 API → 验证结果",
      after: "选择 provision_sandbox 工具；写明成功与转人工条件",
      checkpoint: "保存 cp-02：输入、计划、策略版本和下一动作。",
      idempotency: "生成 key=task-482/provision，绑定一次业务意图。",
      handoff: "策略冲突或超预算时停止，不通过重复推理绕过审批。",
    },
  },
  {
    id: "act",
    label: "行动",
    en: "Act",
    purpose: "按照工具 Schema 发起有边界的操作；外部系统调用是副作用发生点。",
    normal: {
      status: "工具调用成功",
      before: "cp-02 + 已校验参数 + 幂等键",
      transition: "调用 provision_sandbox，服务端返回 operation_id=op-731",
      after: "资源创建进入运行中；记录工具响应和耗时",
      checkpoint: "保存 cp-03：operation_id 与已提交参数。",
      idempotency: "同一 key 重试只查询/复用 op-731，不再创建第二套资源。",
      handoff: "无需接管；异常码才进入恢复分支。",
    },
    timeout: {
      status: "工具超时，远端结果未知",
      before: "cp-02 + 已校验参数 + 幂等键",
      transition: "请求已发出，但 30 秒内没有收到响应",
      after: "标记 UNKNOWN；禁止直接重新创建",
      checkpoint: "从 cp-02 恢复，不重新规划已确认的业务参数。",
      idempotency: "用原 key 查询远端结果；避免超时后重复创建资源。",
      handoff: "若查询接口也不可用，暂停任务并向值班人员提供完整上下文。",
    },
  },
  {
    id: "observe",
    label: "观察",
    en: "Observe",
    purpose: "解释工具结果、更新世界状态，并判断继续、重试、回滚还是转人工。",
    normal: {
      status: "外部状态已确认",
      before: "operation_id=op-731，状态 RUNNING",
      transition: "查询资源状态与审计日志；核对区域、规格和标签",
      after: "状态 SUCCEEDED，结果满足计划约束",
      checkpoint: "保存 cp-04：实际资源 ID 与验证证据。",
      idempotency: "后续查询不产生新副作用；创建键进入已消费状态。",
      handoff: "验证不一致时转人工，不把“API 成功”误判为“业务完成”。",
    },
    timeout: {
      status: "恢复查询仍无法确认结果",
      before: "UNKNOWN + 原幂等键 + cp-02",
      transition: "先按幂等键查询，再查审计日志；两路均暂不可用",
      after: "保持 SUSPENDED，不自动执行第二次创建",
      checkpoint: "保留 cp-02 和所有调用时间线，可由人工安全续跑。",
      idempotency: "把“不确定”限制在一次业务意图内，避免重复资源与重复计费。",
      handoff: "生成接管包：客户、参数、策略、调用 ID、时间线和建议动作。",
    },
  },
  {
    id: "stop",
    label: "停止",
    en: "Stop",
    purpose: "以成功、拒绝或转人工之一结束本轮；停止条件是 Agent 控制面的必要组成。",
    normal: {
      status: "任务成功结束",
      before: "资源已创建且验证通过",
      transition: "写入最终状态，生成客户可读摘要和内部审计记录",
      after: "COMPLETED；返回资源 ID、边界与下一步",
      checkpoint: "最终快照不可变，支持后续审计与复盘。",
      idempotency: "重复提交同一任务返回既有结果，不重复执行。",
      handoff: "无需接管；后续变更形成新的业务意图和新任务。",
    },
    timeout: {
      status: "任务暂停，等待人工接管",
      before: "结果未知且自动恢复路径耗尽",
      transition: "冻结副作用动作，通知值班人员并设置接管超时",
      after: "SUSPENDED；客户看到“处理中”，而不是虚假成功",
      checkpoint: "人工从最后可信 checkpoint 续跑，不重做已确认步骤。",
      idempotency: "原业务键持续有效，人工操作前先核对是否已有远端资源。",
      handoff: "人工决定确认既有结果、补偿回滚或在确认无资源后安全重试。",
    },
  },
];

/**
 * 回放 Agent 状态机，并展示工具超时下的可恢复性控制。
 */
export function AgentRunLab() {
  const uid = useId();
  const [stepIndex, setStepIndex] = useState(0);
  const [timeoutInjected, setTimeoutInjected] = useState(false);
  const step = agentSteps[stepIndex];
  const view = timeoutInjected && step.timeout ? step.timeout : step.normal;
  const failurePending = timeoutInjected && stepIndex < agentSteps.findIndex((item) => item.id === "act");
  const panelId = `${uid}-agent-panel`;
  const statusText = failurePending ? `${view.status}；工具超时将在“行动 Act”步骤触发` : view.status;

  return (
    <section className="flagshipLab flagshipLab--agent" aria-labelledby={`${uid}-agent-title`}>
      <header className="flagshipLab__header">
        <div>
          <p className="flagshipLab__eyebrow">INTERACTIVE LAB · AGENT RUNTIME</p>
          <h3 id={`${uid}-agent-title`}>Agent 运行与恢复实验</h3>
        </div>
        <p>逐步查看感知、思考、行动、观察和停止如何改变状态；再注入一次工具超时，比较“可恢复”与“盲目重试”。</p>
      </header>

      <div className="flagshipLab__toolbar">
        <label className="flagshipLab__switch">
          <input
            type="checkbox"
            checked={timeoutInjected}
            onChange={(event) => setTimeoutInjected(event.target.checked)}
          />
          <span>故障注入：工具超时 Tool timeout</span>
        </label>
        <p>超时不等于失败：关键是能否确认副作用是否已发生。</p>
      </div>

      <LabTabs
        idPrefix={`${uid}-agent-step`}
        label="Agent 运行步骤"
        options={agentSteps.map((item) => ({ value: item.id, label: `${item.label} ${item.en}` }))}
        panelId={panelId}
        value={step.id}
        onChange={(next) => setStepIndex(agentSteps.findIndex((item) => item.id === next))}
      />

      <div className="flagshipLab__stepControls" aria-label="Agent 步骤翻页">
        <button type="button" onClick={() => setStepIndex((current) => Math.max(0, current - 1))} disabled={stepIndex === 0}>← 上一步 Previous</button>
        <span>步骤 {stepIndex + 1} / {agentSteps.length}</span>
        <button type="button" onClick={() => setStepIndex((current) => Math.min(agentSteps.length - 1, current + 1))} disabled={stepIndex === agentSteps.length - 1}>下一步 Next →</button>
      </div>

      <article
        className="flagshipLab__panel"
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${uid}-agent-step-tab-${step.id}`}
      >
        <div className="flagshipLab__status" aria-live="polite" aria-atomic="true">
          <span>{step.label} · {step.en}</span>
          <strong>{statusText}</strong>
          <p>{step.purpose}</p>
        </div>

        <ol className="flagshipLab__stateFlow" aria-label={`${step.label}步骤的状态变化`}>
          <li><span>01</span><div><strong>进入状态 State in</strong><p>{view.before}</p></div></li>
          <li><span>02</span><div><strong>执行变化 Transition</strong><p>{view.transition}</p></div></li>
          <li><span>03</span><div><strong>离开状态 State out</strong><p>{view.after}</p></div></li>
        </ol>

        <div className="flagshipLab__recovery" aria-label="恢复控制的当前作用">
          <article><p className="flagshipLab__label">检查点 Checkpoint</p><p>{view.checkpoint}</p></article>
          <article><p className="flagshipLab__label">幂等 Idempotency</p><p>{view.idempotency}</p></article>
          <article><p className="flagshipLab__label">人工接管 Human handoff</p><p>{view.handoff}</p></article>
        </div>
      </article>
    </section>
  );
}

type PromptMode = "bad" | "baseline" | "production";

type PromptLayer = {
  name: string;
  en: string;
  state: "缺失" | "薄弱" | "已配置";
  content: string;
  purpose: string;
};

type PromptProfile = {
  label: string;
  level: string;
  task: string;
  layers: PromptLayer[];
  assembled: string[];
  expected: string;
  risk: string;
  takeaway: string;
};

const promptModeOptions: Array<LabOption<PromptMode>> = [
  { value: "bad", label: "坏提示 Bad Prompt", hint: "只有一句任务" },
  { value: "baseline", label: "基线 Baseline", hint: "目标与资料已给出" },
  { value: "production", label: "生产级 Production", hint: "约束、工具与验证闭环" },
];

const promptProfiles: Record<PromptMode, PromptProfile> = {
  bad: {
    label: "坏提示 Bad Prompt",
    level: "上下文剖面 1 / 5",
    task: "帮我判断这个客户该用哪个云上 RAG 方案，顺便创建 PoC。",
    layers: [
      { name: "系统指令", en: "System", state: "缺失", content: "未定义角色、目标、权限和拒答边界。", purpose: "固定长期行为与优先级。" },
      { name: "用户请求", en: "User", state: "薄弱", content: "业务目标混合选型与执行，没有给客户约束。", purpose: "描述本轮任务与成功条件。" },
      { name: "检索上下文", en: "Context", state: "缺失", content: "没有产品规格、地域、预算或来源。", purpose: "提供可核验事实，而不是让模型猜。" },
      { name: "工具定义", en: "Tool Schema", state: "缺失", content: "没有工具名、参数、权限或副作用说明。", purpose: "约束可执行动作的输入输出。" },
      { name: "输出验证", en: "Validation", state: "缺失", content: "没有格式、引用、校验或人工批准要求。", purpose: "把“看起来合理”变成“可以验收”。" },
    ],
    assembled: ["User：帮我判断方案并创建 PoC。"],
    expected: "可能直接推荐一个看似合适的方案，并声称已经创建环境；输出形式和依据不可预测。",
    risk: "把建议与执行混为一体；缺少客户边界、证据和工具授权，容易产生幻觉或越权动作。",
    takeaway: "短提示不是低成本，而是把缺失信息和控制风险转移到了运行期。",
  },
  baseline: {
    label: "基线 Baseline",
    level: "上下文剖面 3 / 5",
    task: "根据已核验产品资料，为新加坡金融客户比较托管 RAG 与自建方案；只给建议，不执行创建。",
    layers: [
      { name: "系统指令", en: "System", state: "已配置", content: "角色为云 AI 技术售前；只使用给定资料，信息不足时明确提问。", purpose: "固定长期行为与优先级。" },
      { name: "用户请求", en: "User", state: "已配置", content: "给出地域、行业、两种候选方案和“仅建议”的动作边界。", purpose: "描述本轮任务与成功条件。" },
      { name: "检索上下文", en: "Context", state: "已配置", content: "附产品规格、数据驻留说明和客户需求摘要。", purpose: "提供可核验事实，而不是让模型猜。" },
      { name: "工具定义", en: "Tool Schema", state: "缺失", content: "本轮不调用工具；若后续执行，需要单独定义。", purpose: "约束可执行动作的输入输出。" },
      { name: "输出验证", en: "Validation", state: "薄弱", content: "要求列出依据，但未规定字段、引用格式和冲突处理。", purpose: "把“看起来合理”变成“可以验收”。" },
    ],
    assembled: [
      "System：你是云 AI 技术售前，只按资料回答，不执行资源操作。",
      "User：比较托管与自建方案，客户为新加坡金融机构。",
      "Context：数据驻留、私网、SLA、团队能力与预算约束。",
    ],
    expected: "输出结构化比较和建议，能引用资料；遇到冲突时可能仍给出单一结论，字段稳定性一般。",
    risk: "缺少强制验证和固定输出契约，后续系统难以可靠消费；资料冲突时处理方式不一致。",
    takeaway: "Baseline 足以验证模型是否理解任务，但还不能证明方案可以安全接入业务流程。",
  },
  production: {
    label: "生产级 Production",
    level: "上下文剖面 5 / 5",
    task: "先输出可审计选型建议；客户确认后，才允许调用 PoC 工具，并在执行前再次展示参数与成本上限。",
    layers: [
      { name: "系统指令", en: "System", state: "已配置", content: "定义售前角色、事实优先级、拒答条件、工具权限和人工批准边界。", purpose: "固定长期行为与优先级。" },
      { name: "用户请求", en: "User", state: "已配置", content: "客户目标、硬约束、候选范围、交付格式和本轮动作明确分离。", purpose: "描述本轮任务与成功条件。" },
      { name: "检索上下文", en: "Context", state: "已配置", content: "每段带 sourceId、产品版本、生效日期、地域与权限标签；冲突资料不静默合并。", purpose: "提供可核验事实，而不是让模型猜。" },
      { name: "工具定义", en: "Tool Schema", state: "已配置", content: "provision_poc 的必填参数、枚举、预算上限、幂等键和副作用均已声明。", purpose: "约束可执行动作的输入输出。" },
      { name: "输出验证", en: "Validation", state: "已配置", content: "JSON Schema、引用完整性、约束覆盖、冲突/缺证据拒答和执行前确认共同验收。", purpose: "把“看起来合理”变成“可以验收”。" },
    ],
    assembled: [
      "System：事实优先级、拒答、权限与人工确认规则。",
      "User：客户硬约束 + 本轮只做选型建议。",
      "Context：带版本与 sourceId 的最小充分证据集。",
      "Tool Schema：参数、成本上限、幂等键和副作用。",
      "Validation：固定字段、引用校验、冲突检测、执行前确认。",
    ],
    expected: "先返回带证据的选型矩阵、未决问题和推荐边界；只有收到明确批准后才生成工具调用，并可被程序校验。",
    risk: "上下文更长、治理成本更高；若资料本身过期或验证器覆盖不足，仍可能稳定地产生错误结果。",
    takeaway: "生产级 Prompt 是上下文装配与控制契约，不是堆更多形容词；效果仍依赖数据、工具和评估。",
  },
};

/**
 * 对照三档 Prompt 装配方式及其输出可控性。
 */
export function PromptAssemblyLab() {
  const uid = useId();
  const [mode, setMode] = useState<PromptMode>("bad");
  const profile = promptProfiles[mode];
  const panelId = `${uid}-prompt-panel`;
  const configuredCount = useMemo(() => profile.layers.filter((layer) => layer.state === "已配置").length, [profile]);

  return (
    <section className="flagshipLab flagshipLab--prompt" aria-labelledby={`${uid}-prompt-title`}>
      <header className="flagshipLab__header">
        <div>
          <p className="flagshipLab__eyebrow">INTERACTIVE LAB · PROMPT ASSEMBLY</p>
          <h3 id={`${uid}-prompt-title`}>Prompt 装配实验</h3>
        </div>
        <p>保持客户任务方向不变，逐步加入系统边界、证据、工具契约与验证，观察输出从“会说”走向“可控”。</p>
      </header>

      <LabTabs
        idPrefix={`${uid}-prompt-mode`}
        label="选择 Prompt 装配等级"
        options={promptModeOptions}
        panelId={panelId}
        value={mode}
        onChange={setMode}
      />

      <article
        className="flagshipLab__panel"
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${uid}-prompt-mode-tab-${mode}`}
      >
        <div className="flagshipLab__status" aria-live="polite" aria-atomic="true">
          <span>{profile.label}</span>
          <strong>{profile.level} · 完整配置 {configuredCount} 项</strong>
          <p>{profile.task}</p>
        </div>

        <div className="flagshipLab__promptLayout">
          <section aria-labelledby={`${uid}-profile-title`}>
            <h4 id={`${uid}-profile-title`}>上下文剖面 Context profile</h4>
            <ol className="flagshipLab__promptLayers">
              {profile.layers.map((layer, index) => (
                <li data-state={layer.state} key={layer.en}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <header><strong>{layer.name} <small>{layer.en}</small></strong><em>{layer.state}</em></header>
                    <p>{layer.content}</p>
                    <small>{layer.purpose}</small>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <aside className="flagshipLab__assembly" aria-labelledby={`${uid}-assembly-title`}>
            <h4 id={`${uid}-assembly-title`}>送入模型的装配顺序 Assembly</h4>
            <ol>{profile.assembled.map((item) => <li key={item}>{item}</li>)}</ol>
          </aside>
        </div>

        <div className="flagshipLab__outcomes">
          <article><p className="flagshipLab__label">预期输出 Expected output</p><p>{profile.expected}</p></article>
          <article><p className="flagshipLab__label">主要风险 Risk</p><p>{profile.risk}</p></article>
          <article><p className="flagshipLab__label">售前结论 Presales takeaway</p><p>{profile.takeaway}</p></article>
        </div>
      </article>
    </section>
  );
}
