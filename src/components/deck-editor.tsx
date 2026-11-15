"use client";

import { useState } from "react";
import type { Accent, Deck, Layout, Slide, Theme } from "@/schema/presentation";
import { accentTokens, layoutLabels, themeLabels } from "@/render/themes";
import { createEmptySlide } from "@/lib/defaults";
import SlideCanvas from "./slide-canvas";

type Props = {
  deck: Deck;
  selectedSlideId: string;
  onSelectSlide: (id: string) => void;
  onChange: (deck: Deck) => void;
  onPresent: () => void;
  onExport: () => void;
  exporting: boolean;
};

export default function DeckEditor({ deck, selectedSlideId, onSelectSlide, onChange, onPresent, onExport, exporting }: Props) {
  const [tab, setTab] = useState<"content" | "notes" | "design">("content");
  const selectedIndex = Math.max(0, deck.slides.findIndex((slide) => slide.id === selectedSlideId));
  const current = deck.slides[selectedIndex];

  function updateSlide<K extends keyof Slide>(key: K, value: Slide[K]) {
    onChange({
      ...deck,
      slides: deck.slides.map((slide) => slide.id === current.id ? { ...slide, [key]: value } : slide),
    });
  }

  function addSlide() {
    const slide = createEmptySlide();
    const slides = [...deck.slides];
    slides.splice(selectedIndex + 1, 0, slide);
    onChange({ ...deck, slides });
    onSelectSlide(slide.id);
  }

  function duplicateSlide() {
    const slide = { ...current, id: crypto.randomUUID(), heading: `${current.heading} 副本`.slice(0, 100) };
    const slides = [...deck.slides];
    slides.splice(selectedIndex + 1, 0, slide);
    onChange({ ...deck, slides });
    onSelectSlide(slide.id);
  }

  function deleteSlide() {
    if (deck.slides.length === 1) return;
    const slides = deck.slides.filter((slide) => slide.id !== current.id);
    onChange({ ...deck, slides });
    onSelectSlide(slides[Math.max(0, selectedIndex - 1)].id);
  }

  function moveSlide(direction: -1 | 1) {
    const target = selectedIndex + direction;
    if (target < 0 || target >= deck.slides.length) return;
    const slides = [...deck.slides];
    [slides[selectedIndex], slides[target]] = [slides[target], slides[selectedIndex]];
    onChange({ ...deck, slides });
  }

  return (
    <div className="deck-editor">
      <div className="editor-toolbar">
        <div>
          <span className="step-label">03 / 编辑</span>
          <strong>{deck.title}</strong>
          <span className="muted-text">{deck.slides.length} 页 · {deck.durationMinutes} 分钟</span>
        </div>
        <div className="button-row">
          <button className="secondary-button" onClick={onPresent}>▶ 放映</button>
          <button className="primary-button" onClick={onExport} disabled={exporting}>{exporting ? "正在导出…" : "下载 PPTX"}</button>
        </div>
      </div>

      <div className="editor-layout">
        <aside className="slide-sidebar panel">
          <div className="slide-list">
            {deck.slides.map((slide, index) => (
              <button
                className={`slide-list-item${slide.id === current.id ? " is-active" : ""}`}
                key={slide.id}
                onClick={() => onSelectSlide(slide.id)}
                aria-current={slide.id === current.id ? "page" : undefined}
              >
                <span>{index + 1}</span>
                <strong>{slide.heading}</strong>
                <small>{layoutLabels[slide.layout]}</small>
              </button>
            ))}
          </div>
          <div className="slide-actions">
            <button onClick={addSlide}>新增</button>
            <button onClick={duplicateSlide}>复制</button>
            <button disabled={selectedIndex === 0} onClick={() => moveSlide(-1)}>上移</button>
            <button disabled={selectedIndex === deck.slides.length - 1} onClick={() => moveSlide(1)}>下移</button>
            <button className="danger-button" disabled={deck.slides.length === 1} onClick={deleteSlide}>删除</button>
          </div>
        </aside>

        <main className="slide-workspace panel">
          <div className="canvas-frame">
            <SlideCanvas deck={deck} slide={current} index={selectedIndex} />
          </div>
          <p className="workspace-hint">第 {selectedIndex + 1} 页 · 在右侧修改内容，预览与导出会同步更新</p>
        </main>

        <aside className="inspector panel">
          <div className="inspector-tabs" role="tablist" aria-label="页面编辑">
            {([["content", "内容"], ["notes", "讲稿"], ["design", "设计"]] as const).map(([value, label]) => (
              <button key={value} role="tab" aria-selected={tab === value} className={tab === value ? "is-active" : ""} onClick={() => setTab(value)}>{label}</button>
            ))}
          </div>

          {tab === "content" ? (
            <div className="inspector-fields">
              <label>页眉短句<input value={current.eyebrow} maxLength={60} onChange={(event) => updateSlide("eyebrow", event.target.value)} /></label>
              <label>页面标题<textarea rows={3} value={current.heading} maxLength={100} onChange={(event) => updateSlide("heading", event.target.value)} /></label>
              <label>页面要点（每行一条）<textarea rows={9} value={current.points.join("\n")} onChange={(event) => updateSlide("points", event.target.value.split("\n"))} /></label>
              <p className="field-help">最多 6 条要点，每条最多 160 字。</p>
            </div>
          ) : null}

          {tab === "notes" ? (
            <div className="inspector-fields">
              <label>逐页讲稿<textarea rows={12} value={current.script} maxLength={2400} onChange={(event) => updateSlide("script", event.target.value)} /></label>
              <label>演讲提示（每行一条）<textarea rows={5} value={current.cues.join("\n")} onChange={(event) => updateSlide("cues", event.target.value.split("\n"))} /></label>
              <p className="field-help">讲稿和提示会写入 PPTX 对应页面的演讲者备注。</p>
            </div>
          ) : null}

          {tab === "design" ? (
            <div className="inspector-fields">
              <label>页面版式
                <select value={current.layout} onChange={(event) => updateSlide("layout", event.target.value as Layout)}>
                  {Object.entries(layoutLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <fieldset>
                <legend>强调色</legend>
                <div className="accent-options">
                  {(Object.keys(accentTokens) as Accent[]).map((accent) => (
                    <button
                      key={accent}
                      className={current.accent === accent ? "is-active" : ""}
                      style={{ backgroundColor: `#${accentTokens[accent]}` }}
                      title={accent}
                      aria-label={`使用 ${accent} 强调色`}
                      aria-pressed={current.accent === accent}
                      onClick={() => updateSlide("accent", accent)}
                    />
                  ))}
                </div>
              </fieldset>
              <label>整套主题
                <select value={deck.theme} onChange={(event) => onChange({ ...deck, theme: event.target.value as Theme })}>
                  {Object.entries(themeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>整套标题<input value={deck.title} maxLength={80} onChange={(event) => onChange({ ...deck, title: event.target.value })} /></label>
              <label>整套副标题<input value={deck.subtitle} maxLength={120} onChange={(event) => onChange({ ...deck, subtitle: event.target.value })} /></label>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
