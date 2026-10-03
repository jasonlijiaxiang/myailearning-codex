/** 离线教学模型：预设记录与确定性算术，不调用生成、识别或评分服务。 */
export const videoCandidates = Object.freeze([
  { id: "候选 A", specification: true, subject: true, motion: false, speech: true, reason: "画面规格合格，但手穿过杯柄，动作因果不成立。" },
  { id: "候选 B", specification: true, subject: true, motion: true, speech: false, reason: "无对白片段可用；带对白版本需先区分时间偏移与嘴形内容错误，再按故障对齐或重做并重新验收。" },
  { id: "候选 C", specification: true, subject: false, motion: true, speech: true, reason: "人物和动作可接受，但商品标识变形；不能靠平均分放行。" },
]);

/** @param {boolean} dialogue */
export function reviewVideoCandidates(dialogue) {
  return videoCandidates.map((candidate) => ({ ...candidate,
    accepted: candidate.specification && candidate.subject && candidate.motion && (!dialogue || candidate.speech),
  }));
}

export const dramaShots = Object.freeze([
  { id: "S01", action: "主角进门", assets: ["costume", "voice"], seconds: 4 },
  { id: "S02", action: "主角递出戒指并说话", assets: ["costume", "ring", "voice"], seconds: 6 },
  { id: "S03", action: "对手拿起戒指", assets: ["ring"], seconds: 5 },
]);

/** @param {string} asset @param {number} offsetFrames */
export function dramaRevisionImpact(asset, offsetFrames) {
  const affected = dramaShots.filter((shot) => shot.assets.includes(asset));
  return { shotIds: affected.map((shot) => shot.id), seconds: affected.reduce((sum, shot) => sum + shot.seconds, 0), offsetMs: offsetFrames / 24 * 1000 };
}

/** @param {number} generatedMs @param {number} playedMs @param {number} cancellationMs */
export function voiceInterruptionState(generatedMs, playedMs, cancellationMs) {
  if (![generatedMs, playedMs, cancellationMs].every(Number.isFinite) || generatedMs < 0 || playedMs < 0 || playedMs > generatedMs || cancellationMs < 0) throw new Error("Invalid playback timeline");
  return { retainedMs: playedMs, discardedMs: generatedMs - playedMs, residualMs: Math.min(cancellationMs, generatedMs - playedMs) };
}

export const documentCandidates = Object.freeze([
  { id: "D01", confidence: .99, amount: 1080, expected: 1000, provenance: "原页", accountVerified: true },
  { id: "D02", confidence: .94, amount: 1000, expected: 1000, provenance: "原页", accountVerified: true },
  { id: "D03", confidence: .98, amount: 1000, expected: 1000, provenance: "外部补全", accountVerified: false },
  { id: "D04", confidence: .82, amount: 1000, expected: 1000, provenance: "原页", accountVerified: true },
]);

/** @param {number} threshold @param {boolean} validate */
export function documentReviewDecision(threshold, validate) {
  return documentCandidates.map((candidate) => {
    const reasons = [];
    if (candidate.confidence < threshold) reasons.push("低于本例人工复核阈值");
    if (validate && candidate.amount !== candidate.expected) reasons.push("合计校验失败");
    if (validate && !candidate.accountVerified) reasons.push("外部补全账户未由权威系统确认");
    return { ...candidate, reasons, accepted: reasons.length === 0 };
  });
}
