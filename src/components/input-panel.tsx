"use client";

import type { PresentationInput } from "@/schema/presentation";
import type { RuntimeStatus } from "@/lib/api";
import { themeLabels } from "@/render/themes";

type Props = {
  input: PresentationInput;
  onChange: <K extends keyof PresentationInput>(key: K, value: PresentationInput[K]) => void;
  onGenerate: () => void;
  onLoadSample: () => void;
  busy: boolean;
  status: RuntimeStatus | null;
};

export default function InputPanel({ input, onChange, onGenerate, onLoadSample, busy, status }: Props) {
  return (
    <form className="input-panel" onSubmit={(event) => { event.preventDefault(); onGenerate(); }}>
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="step-label">01 / 内容</span>
            <h1>把想法或大纲放在这里</h1>
          </div>
          <button type="button" className="text-button" onClick={onLoadSample}>填入示例</button>
        </div>
        <textarea
          className="idea-input"
          value={input.idea}
          onChange={(event) => onChange("idea", event.target.value)}
          placeholder={"输入一段想法，或按行粘贴已有大纲。\n例如：\nAI 如何帮助普通人提升表达能力\n为什么零散想法难以讲清楚\n三个可以马上尝试的方法"}
          maxLength={12000}
          rows={14}
          required
        />
        <div className="field-footer">
          <span>本地模式会按行整理内容，后续可切换真实 AI 生成。</span>
          <span>{input.idea.length} / 12000</span>
        </div>
      </section>

      <aside className="panel settings-panel">
        <span className="step-label">02 / 设置</span>
        <h2>这次演示的基本要求</h2>
        <label>
          目标听众
          <input value={input.audience} onChange={(event) => onChange("audience", event.target.value)} maxLength={40} required />
        </label>
        <label>
          演讲场合
          <select value={input.occasion} onChange={(event) => onChange("occasion", event.target.value as PresentationInput["occasion"])}>
            {(["课程展示", "职场汇报", "快速提案"] as const).map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <div className="form-grid">
          <label>
            时长（分钟）
            <input type="number" min={1} max={120} value={input.durationMinutes} onChange={(event) => onChange("durationMinutes", Number(event.target.value))} required />
          </label>
          <label>
            页数
            <input type="number" min={3} max={12} value={input.slideCount} onChange={(event) => onChange("slideCount", Number(event.target.value))} required />
          </label>
        </div>
        <label>
          初始主题
          <select value={input.theme} onChange={(event) => onChange("theme", event.target.value as PresentationInput["theme"])}>
            {Object.entries(themeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <div className="provider-status">
          <span className={`status-dot${status?.configured ? " is-ready" : ""}`} />
          {status?.provider === "kimi" ? (status.configured ? "Kimi 已配置" : "Kimi 待配置") : "本地生成模式"}
        </div>
        <button className="primary-button" type="submit" disabled={busy || input.idea.trim().length < 10}>
          {busy ? "正在整理大纲…" : "生成并编辑大纲 →"}
        </button>
      </aside>
    </form>
  );
}
