"use client";

import { useId, useState } from "react";

export function MechanismCalculator({ kind }: { kind: "attention" | "zero-failure" | "serial-bottleneck" }) {
  const id = useId();
  const [queryDirection, setQueryDirection] = useState(1);
  const [sampleSize, setSampleSize] = useState(100);
  const [speedup, setSpeedup] = useState(2);
  if (kind === "attention") {
    const scores = [queryDirection, 0, -queryDirection];
    const exponentials = scores.map((score) => Math.exp(score - Math.max(...scores)));
    const denominator = exponentials.reduce((sum, value) => sum + value, 0);
    const weights = exponentials.map((value) => value / denominator);
    return (
      <section className="mechanismCalculator" aria-labelledby={`${id}-title`}>
        <h5 id={`${id}-title`}>改变查询方向，观察注意力聚合</h5>
        <label>查询方向<select value={queryDirection} onChange={(event) => setQueryDirection(Number(event.target.value))}><option value={1}>Q = [√2, 0]</option><option value={0}>Q = [0, 0]</option><option value={-1}>Q = [-√2, 0]</option></select></label>
        <p>K 固定为 [1,0]、[0,1]、[-1,0]，V 固定为 [10,0]、[0,10]、[0,0]。每个分数都除以 √2。</p>
        <div aria-live="polite">
          <p>缩放分数：[{scores.join(", ")}]</p>
          <ol>{weights.map((weight, index) => <li key={index}><span>位置 {index + 1}</span><strong>{(weight * 100).toFixed(2)}%</strong><i aria-hidden="true" style={{ width: `${weight * 100}%` }} /></li>)}</ol>
          <p>加权输出 = [{(weights[0] * 10).toFixed(4)}, {(weights[1] * 10).toFixed(4)}]</p>
        </div>
        <p>Q 为零时，分数相同，三个位置各占 1/3。改变 Q 会改变聚合；这些人为向量没有真实词义，权重也不能证明答案正确。</p>
      </section>
    );
  }
  if (kind === "zero-failure") {
    const upper = -Math.expm1(Math.log(0.05) / sampleSize);
    return (
      <section className="mechanismCalculator" aria-labelledby={`${id}-title`}>
        <h5 id={`${id}-title`}>零失败样本能说明多少</h5>
        <label>独立样本数<select value={sampleSize} onChange={(event) => setSampleSize(Number(event.target.value))}>{[30, 100, 300, 1000, 3000].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
        <output aria-live="polite">单侧 95% 失败率上限：{(upper * 100).toFixed(2)}%</output>
        <p>上限 = 1 − 0.05^(1/n)。假设每个样本独立、来自同一声明分布、失败概率稳定，且观察到零失败。这是统计上限，不是“真实风险有 95% 概率低于该值”，也不是上线标准。</p>
      </section>
    );
  }
  const original = 60 + 25 + 15;
  const upgraded = 60 / speedup + 25 + 15;
  return (
    <section className="mechanismCalculator" aria-labelledby={`${id}-title`}>
      <h5 id={`${id}-title`}>只升级计算阶段，总体能快多少</h5>
      <label>计算阶段加速倍数<select value={speedup} onChange={(event) => setSpeedup(Number(event.target.value))}>{[1, 2, 4, 8].map((factor) => <option key={factor} value={factor}>{factor} 倍</option>)}</select></label>
      <div aria-live="polite"><p>原步时：计算 60 + 通信 25 + 数据等待 15 = {original} ms</p><p>新步时：计算 {(60 / speedup).toFixed(1)} + 通信 25 + 数据等待 15 = {upgraded.toFixed(1)} ms</p><output>整体加速 {(original / upgraded).toFixed(2)} 倍</output></div>
      <p>本例三个阶段串行且不重叠。即使计算瞬间完成，通信和数据等待仍需 40 ms，总体上限是 2.5 倍。真实系统要用 Profile 检查关键路径与重叠。</p>
    </section>
  );
}
