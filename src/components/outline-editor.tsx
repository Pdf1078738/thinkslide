"use client";

import type { Outline, OutlineSection } from "@/schema/presentation";

type Props = {
  outline: Outline;
  onChange: (outline: Outline) => void;
  onGenerate: () => void;
  onBack: () => void;
  busy: boolean;
};

export default function OutlineEditor({ outline, onChange, onGenerate, onBack, busy }: Props) {
  function updateSection(id: string, changes: Partial<OutlineSection>) {
    onChange({
      ...outline,
      sections: outline.sections.map((section) => section.id === id ? { ...section, ...changes } : section),
    });
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= outline.sections.length) return;
    const sections = [...outline.sections];
    [sections[index], sections[target]] = [sections[target], sections[index]];
    onChange({ ...outline, sections });
  }

  function removeSection(id: string) {
    if (outline.sections.length === 1) return;
    onChange({ ...outline, sections: outline.sections.filter((section) => section.id !== id) });
  }

  function addSection() {
    const section: OutlineSection = {
      id: crypto.randomUUID(),
      title: "新章节",
      summary: "",
      points: ["新要点"],
    };
    onChange({ ...outline, sections: [...outline.sections, section] });
  }

  const invalid = !outline.title.trim() || !outline.coreMessage.trim() || outline.sections.some((section) =>
    !section.title.trim() || section.points.length === 0 || section.points.some((point) => !point.trim())
  );

  return (
    <div className="outline-editor">
      <div className="section-heading">
        <div>
          <span className="step-label">02 / 大纲</span>
          <h1>先确认要表达什么</h1>
        </div>
        <div className="button-row">
          <button className="secondary-button" onClick={onBack}>返回输入</button>
          <button className="primary-button" onClick={onGenerate} disabled={busy || invalid}>
            {busy ? "正在生成…" : "生成完整 PPT →"}
          </button>
        </div>
      </div>

      <section className="panel outline-meta">
        <div className="form-grid">
          <label>演讲标题<input value={outline.title} onChange={(event) => onChange({ ...outline, title: event.target.value })} /></label>
          <label>副标题<input value={outline.subtitle} onChange={(event) => onChange({ ...outline, subtitle: event.target.value })} /></label>
        </div>
        <label>核心观点<textarea rows={2} value={outline.coreMessage} onChange={(event) => onChange({ ...outline, coreMessage: event.target.value })} /></label>
      </section>

      <div className="outline-sections">
        {outline.sections.map((section, index) => (
          <section className="panel outline-section" key={section.id}>
            <div className="outline-section-header">
              <span>章节 {index + 1}</span>
              <div className="icon-actions">
                <button title="上移" aria-label={`上移第 ${index + 1} 章`} disabled={index === 0} onClick={() => moveSection(index, -1)}>↑</button>
                <button title="下移" aria-label={`下移第 ${index + 1} 章`} disabled={index === outline.sections.length - 1} onClick={() => moveSection(index, 1)}>↓</button>
                <button title="删除" aria-label={`删除第 ${index + 1} 章`} disabled={outline.sections.length === 1} onClick={() => removeSection(section.id)}>×</button>
              </div>
            </div>
            <label>章节标题<input value={section.title} onChange={(event) => updateSection(section.id, { title: event.target.value })} /></label>
            <label>章节摘要<textarea rows={2} value={section.summary} onChange={(event) => updateSection(section.id, { summary: event.target.value })} /></label>
            <label>要点（每行一条）<textarea rows={4} value={section.points.join("\n")} onChange={(event) => updateSection(section.id, { points: event.target.value.split("\n") })} /></label>
          </section>
        ))}
      </div>
      <button className="secondary-button add-section-button" onClick={addSection} disabled={outline.sections.length >= 8}>＋ 添加章节</button>
    </div>
  );
}
