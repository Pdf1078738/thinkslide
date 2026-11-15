"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Deck, Outline, PresentationInput } from "@/schema/presentation";
import { deckSchema, workspaceSchema } from "@/schema/presentation";
import { getRuntimeStatus, requestDeck, requestOutline, type RuntimeStatus } from "@/lib/api";
import { defaultInput, sampleIdea } from "@/lib/defaults";
import { exportPptx } from "@/render/export-pptx";
import InputPanel from "./input-panel";
import OutlineEditor from "./outline-editor";
import DeckEditor from "./deck-editor";

const PresentationMode = dynamic(() => import("./presentation-mode"), { ssr: false });
const STORAGE_KEY = "thinkslide.workspace.v1";

type View = "input" | "outline" | "editor";
type Busy = "outline" | "deck" | "export" | null;

export default function Studio() {
  const [input, setInput] = useState<PresentationInput>(defaultInput);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [view, setView] = useState<View>("input");
  const [selectedSlideId, setSelectedSlideId] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<RuntimeStatus | null>(null);
  const [ready, setReady] = useState(false);
  const [saveLabel, setSaveLabel] = useState("尚未保存");
  const [presenting, setPresenting] = useState(false);
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const result = workspaceSchema.safeParse(JSON.parse(stored));
        if (result.success) {
          setInput(result.data.input);
          setOutline(result.data.outline);
          setDeck(result.data.deck);
          setView(result.data.view);
          setSelectedSlideId(result.data.deck?.slides[0]?.id ?? "");
          setSaveLabel("已恢复上次内容");
        } else {
          setError("上次保存的内容不完整，可以新建或导入备份");
        }
      } catch {
        setError("上次保存的内容无法读取，可以新建或导入备份");
      }
    }
    setReady(true);
    getRuntimeStatus().then((value) => {
      if (mounted) setStatus(value);
    }).catch(() => {
      if (mounted) setStatus({ ok: true, provider: "local", configured: true });
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const result = workspaceSchema.safeParse({ input, outline, deck, view });
    if (!result.success) {
      setSaveLabel("有未完成内容");
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
      setSaveLabel("已自动保存");
    } catch {
      setSaveLabel("本地保存失败");
    }
  }, [ready, input, outline, deck, view]);

  function updateInput<K extends keyof PresentationInput>(key: K, value: PresentationInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function generateOutline() {
    setBusy("outline");
    setError("");
    try {
      const result = await requestOutline(input);
      setOutline(result.outline);
      setDeck(null);
      setView("outline");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "大纲生成失败");
    } finally {
      setBusy(null);
    }
  }

  async function generateDeck() {
    if (!outline) return;
    setBusy("deck");
    setError("");
    try {
      const result = await requestDeck(input, outline);
      setDeck(result);
      setSelectedSlideId(result.slides[0].id);
      setView("editor");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "PPT 生成失败");
    } finally {
      setBusy(null);
    }
  }

  function newWorkspace() {
    if ((outline || deck || input.idea) && !window.confirm("新建会清空当前工作区，请先下载需要保留的备份。")) return;
    setInput(defaultInput);
    setOutline(null);
    setDeck(null);
    setSelectedSlideId("");
    setView("input");
    setError("");
  }

  function saveWorkspace() {
    const result = workspaceSchema.safeParse({ input, outline, deck, view });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "请先补全内容");
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
    setSaveLabel("已保存到本机");
    setError("");
  }

  function downloadJson() {
    if (!deck) return;
    const result = deckSchema.safeParse(deck);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "请先补全页面内容");
      return;
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.data.title || "ThinkSlide"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      const result = deckSchema.parse(JSON.parse(await file.text()));
      setDeck(result);
      setOutline(null);
      setInput({
        idea: result.sourceIdea,
        audience: result.audience,
        occasion: result.occasion,
        durationMinutes: result.durationMinutes,
        slideCount: Math.min(12, Math.max(3, result.slides.length)),
        theme: result.theme,
      });
      setSelectedSlideId(result.slides[0].id);
      setView("editor");
    } catch {
      setError("导入失败：请选择由 ThinkSlide 导出且内容完整的 JSON 文件");
    }
  }

  async function downloadPptx() {
    if (!deck) return;
    setBusy("export");
    setError("");
    try {
      const result = deckSchema.parse(deck);
      await exportPptx(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "PPTX 导出失败");
    } finally {
      setBusy(null);
    }
  }

  const activeView = view === "editor" && !deck ? (outline ? "outline" : "input") : view === "outline" && !outline ? "input" : view;
  const selectedIndex = deck ? Math.max(0, deck.slides.findIndex((slide) => slide.id === selectedSlideId)) : 0;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand"><span className="brand-mark">TS</span><strong>ThinkSlide</strong><span>v0.1.0</span></div>
        <nav className="workflow-nav" aria-label="工作流程">
          <button className={activeView === "input" ? "is-active" : ""} onClick={() => setView("input")}>1 内容</button>
          <button className={activeView === "outline" ? "is-active" : ""} disabled={!outline} onClick={() => setView("outline")}>2 大纲</button>
          <button className={activeView === "editor" ? "is-active" : ""} disabled={!deck} onClick={() => setView("editor")}>3 幻灯片</button>
        </nav>
        <div className="header-actions">
          <button onClick={newWorkspace}>新建</button>
          <button onClick={() => importInput.current?.click()}>导入</button>
          <button disabled={!deck} onClick={downloadJson}>备份</button>
          <button onClick={saveWorkspace}>保存</button>
          <input
            ref={importInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(event) => {
              void importJson(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>
      </header>

      <div className="save-status"><span className="status-dot is-ready" />{saveLabel} · 数据仅保存在当前浏览器</div>
      {error ? <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="关闭错误提示">×</button></div> : null}

      <main className="app-main">
        {activeView === "input" ? (
          <InputPanel
            input={input}
            onChange={updateInput}
            onGenerate={generateOutline}
            onLoadSample={() => updateInput("idea", sampleIdea)}
            busy={busy === "outline"}
            status={status}
          />
        ) : null}
        {activeView === "outline" && outline ? (
          <OutlineEditor outline={outline} onChange={setOutline} onGenerate={generateDeck} onBack={() => setView("input")} busy={busy === "deck"} />
        ) : null}
        {activeView === "editor" && deck ? (
          <DeckEditor
            deck={deck}
            selectedSlideId={selectedSlideId || deck.slides[0].id}
            onSelectSlide={setSelectedSlideId}
            onChange={setDeck}
            onPresent={() => setPresenting(true)}
            onExport={downloadPptx}
            exporting={busy === "export"}
          />
        ) : null}
      </main>

      {presenting && deck ? (
        <PresentationMode deck={deck} initialSlide={selectedIndex} onClose={() => setPresenting(false)} />
      ) : null}
    </div>
  );
}
