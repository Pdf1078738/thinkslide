"use client";

import { useEffect, useRef, useState } from "react";
import type { RevealApi } from "reveal.js";
import "reveal.js/reveal.css";
import type { Deck } from "@/schema/presentation";
import SlideCanvas from "./slide-canvas";

type Props = {
  deck: Deck;
  initialSlide: number;
  onClose: () => void;
};

export default function PresentationMode({ deck, initialSlide, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const revealElement = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(initialSlide);

  useEffect(() => {
    let disposed = false;
    let instance: RevealApi | null = null;

    async function initialize() {
      const { default: Reveal } = await import("reveal.js");
      if (disposed || !revealElement.current) return;
      instance = new Reveal(revealElement.current, {
        embedded: true,
        controls: true,
        progress: true,
        center: false,
        hash: false,
        keyboard: true,
        transition: "fade",
        width: 1200,
        height: 675,
        margin: 0.04,
      });
      instance.on("slidechanged", () => setActive(instance?.getIndices().h ?? 0));
      await instance.initialize();
      instance.slide(initialSlide);
    }

    initialize();
    return () => {
      disposed = true;
      instance?.destroy();
    };
  }, [initialSlide]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="presentation-overlay" ref={root} role="dialog" aria-modal="true" aria-label="幻灯片放映">
      <div className="presentation-toolbar">
        <span>{active + 1} / {deck.slides.length}</span>
        <div>
          <button onClick={() => root.current?.requestFullscreen()}>浏览器全屏</button>
          <button onClick={onClose}>退出放映</button>
        </div>
      </div>
      <div className="reveal" ref={revealElement}>
        <div className="slides">
          {deck.slides.map((slide, index) => (
            <section key={slide.id}>
              <SlideCanvas deck={deck} slide={slide} index={index} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
