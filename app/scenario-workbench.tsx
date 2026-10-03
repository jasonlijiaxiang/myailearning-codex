"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { documentReviewDecision, dramaRevisionImpact, dramaShots, reviewVideoCandidates, voiceInterruptionState } from "./scenario-teaching-model.mjs";
import styles from "./scenario-workbench.module.css";

export type ScenarioKind = "ai-video" | "ai-short-drama" | "voice-service" | "document-processing";

const subscribeToHydration = () => () => {};
const clientIsEnhanced = () => true;
const serverIsEnhanced = () => false;

export function ScenarioWorkbench({ kind }: { kind: ScenarioKind }) {
  const id = useId();
  const enhanced = useSyncExternalStore(subscribeToHydration, clientIsEnhanced, serverIsEnhanced);
  const [dialogue, setDialogue] = useState(false);
  const [route, setRoute] = useState("image");
  const [asset, setAsset] = useState("costume");
  const [frames, setFrames] = useState(6);
  const [played, setPlayed] = useState(1200);
  const [cancellation, setCancellation] = useState(120);
  const [threshold, setThreshold] = useState(.9);
  const [validate, setValidate] = useState(true);
  let body;
  let title;
  if (kind === "ai-video") {
    title = "单镜头：输入控制与候选验收";
    const constraints: Record<string, string> = {
      text: "文字描述主体、环境和运动意图，空间关系仍由模型生成。适合探索；不适合据此承诺商品细节或指定人物完全一致。",
      image: "首帧约束起始外观和构图，后续帧仍需生成。镜头转动后露出的背面、反射和遮挡关系没有因此被锁定。",
      frames: "首尾帧约束两端状态，中间过程仍需模型补全。结尾正确也可能经过错误的运动路径。",
      reference: "参考资产提供外观条件；是否支持多图、对象类型和组合取决于具体模型。它不能代替连续性或商标逐帧验收。",
    };
    const candidates = reviewVideoCandidates(dialogue);
    body = <>
      <div className={styles.controls}><label>输入路线<select disabled={!enhanced} value={route} onChange={(event) => setRoute(event.target.value)}><option value="text">文字生成</option><option value="image">首帧生成</option><option value="frames">首尾帧生成</option><option value="reference">参考资产生成</option></select></label><label className={styles.check}><input disabled={!enhanced} type="checkbox" checked={dialogue} onChange={(event) => setDialogue(event.target.checked)} />交付要求包含同步对白</label></div>
      <p>{constraints[route]}</p><p>下面三条是人为编写的候选验收记录，切换输入路线不会生成新视频，也不会改变记录。对白开关只改变本次交付必须通过的条件。</p>
      <ol className={styles.records}>{candidates.map((candidate) => <li key={candidate.id}><strong>{candidate.id} · {candidate.accepted ? "可进入后续制作" : "退回处理"}</strong><p>{candidate.reason}</p><span>规格：{candidate.specification ? "通过" : "失败"} / 主体：{candidate.subject ? "通过" : "失败"} / 动作：{candidate.motion ? "通过" : "失败"} / 对白：{candidate.speech ? "通过" : "失败"}</span></li>)}</ol>
      <output aria-live="polite">本次通过 {candidates.filter((candidate) => candidate.accepted).length} / {candidates.length}。任一必需条件失败就退回；这是教学条件判断，不能估计真实模型通过率。</output>
    </>;
  } else if (kind === "ai-short-drama") {
    title = "短剧：资产改版会影响哪些镜头";
    const impact = dramaRevisionImpact(asset, frames);
    body = <>
      <div className={styles.controls}><label>改版资产<select disabled={!enhanced} value={asset} onChange={(event) => setAsset(event.target.value)}><option value="costume">主角服装 v1 → v2</option><option value="ring">戒指 v1 → v2</option><option value="voice">主角声音 v1 → v2</option></select></label><label>音画偏移（24 fps）<select disabled={!enhanced} value={frames} onChange={(event) => setFrames(Number(event.target.value))}>{[0, 2, 6, 12].map((value) => <option key={value} value={value}>{value} 帧</option>)}</select></label></div>
      <ol className={styles.records}>{dramaShots.map((shot) => <li key={shot.id}><strong>{shot.id} · {shot.action} · {shot.seconds} 秒</strong><p>{impact.shotIds.includes(shot.id) ? "引用了已改版资产，原镜头需重新检查并决定重做。" : "未引用改版资产，可保留素材版本，但合片仍需检查连续性。"}</p></li>)}</ol>
      <div aria-live="polite"><output>直接影响：{impact.shotIds.join("、")}，共 {impact.seconds} 秒素材；音画偏移 {impact.offsetMs.toFixed(1)} ms。</output><p>{asset === "voice" ? "声音改版先重做对应音轨；可见说话镜头再验收口型。" : "画面改版先重做受影响镜头；原配音可能复用，但镜头时长或剪点变化会让字幕、音轨位置和合片失效。"}任何素材替换都应重新导出并验收最终成片。</p><p>{frames === 0 ? "整体时间偏移为零仍不能证明每个音素都与嘴形同步。" : "当前成片暂缓交付：先对齐时间轴，再检查逐音素口型；移动整条音轨只能消除整体偏移。"}</p></div>
    </>;
  } else if (kind === "voice-service") {
    title = "语音：打断之后，系统还知道用户听到了什么吗";
    const state = voiceInterruptionState(3000, played, cancellation);
    body = <>
      <p>假设回复“申请尚未完成，请确认尾号 1234”已经生成 3,000 ms 音频，用户在播放中纠正尾号。时间均为教学假设，截断位置由实际播放进度提供。</p>
      <div className={styles.controls}><label>打断时已播放<select disabled={!enhanced} value={played} onChange={(event) => setPlayed(Number(event.target.value))}>{[600, 1200, 2400, 3000].map((value) => <option key={value} value={value}>{value} ms</option>)}</select></label><label>本地停止播放延迟<select disabled={!enhanced} value={cancellation} onChange={(event) => setCancellation(Number(event.target.value))}>{[0, 120, 400].map((value) => <option key={value} value={value}>{value} ms</option>)}</select></label></div>
      <ol className={styles.records}><li><strong>检测打断与取消生成</strong><p>新语音进入当前轮次。取消旧回复的生成只能阻止后续产出，不能自动清空已排入播放器的音频。</p></li><li><strong>停止播放与清空缓冲</strong><p>播放器以单调时钟记录播放位置；电话桥接的缓冲清理确认也要与实际播放记录区分。</p></li><li><strong>修正对话状态</strong><p>WebSocket 链路由客户端按已播放位置请求截断；WebRTC/SIP 在启用 VAD 且 interrupt_response=true 时按服务端机制自动截断；关闭自动打断时仍需主动取消和清理。继续使用已听到的上下文，重新确认业务参数。</p></li></ol>
      <div aria-live="polite"><output>检测打断时已播放 {state.retainedMs} ms；未播放 {state.discardedMs} ms；此假设缓冲下，最多残留 {state.residualMs} ms。</output><p>若停止播放有延迟，最终截断应依据停止后的确认位置重新核对。本例只演示音频状态，不能证明真实用户听清，更不能凭回复内容认定申请已提交。</p></div>
    </>;
  } else {
    title = "文档：高置信度字段为什么仍不能自动入账";
    const records = documentReviewDecision(threshold, validate);
    body = <>
      <p>四张虚构单据各含“应付金额”和“收款账户”字段。置信度是预设教学值；它没有经过概率校准，也不是整单正确率。</p>
      <div className={styles.controls}><label>本例复核阈值<select disabled={!enhanced} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))}>{[.8, .9, .95, .99].map((value) => <option key={value} value={value}>{value.toFixed(2)}</option>)}</select></label><label className={styles.check}><input disabled={!enhanced} type="checkbox" checked={validate} onChange={(event) => setValidate(event.target.checked)} />启用合计和账户来源校验</label></div>
      <ol className={styles.records}>{records.map((record) => <li key={record.id}><strong>{record.id} · 置信度 {record.confidence.toFixed(2)} · {record.accepted ? "通过本例候选检查" : "送人工审阅"}</strong><p>抽取金额 {record.amount} 元 / 规则期望 {record.expected} 元；账户来源：{record.provenance}。</p><span>{record.reasons.length ? record.reasons.join("；") : "未触发本例检查项；仍需权限、重复单据和业务入账门禁。"}</span></li>)}</ol>
      <output aria-live="polite">通过本例候选检查 {records.filter((record) => record.accepted).length} / {records.length}。{validate ? "D01 的高置信度无法抵消合计错误，D03 的补全账户仍缺权威确认。" : "校验被关闭：高置信度错金额和外部补全账户可能被放行，这是故意展示的失败路径。"}</output>
    </>;
  }
  return <section id="scenario-workshop" className={styles.workbench} aria-labelledby={`${id}-title`} data-scenario-demo={kind}><p className={styles.label}>离线教学演示 · 预设数据</p><h2 id={`${id}-title`}>{title}</h2><noscript><p>改变条件需要启用 JavaScript；当前预设结果和下方参考推演仍可直接阅读。</p></noscript>{body}</section>;
}
