import type { CSSProperties } from "react";
import type { Deck, Slide } from "@/schema/presentation";
import { accentTokens, themeTokens } from "@/render/themes";

type Props = {
  deck: Deck;
  slide: Slide;
  index: number;
  compact?: boolean;
};

export default function SlideCanvas({ deck, slide, index, compact = false }: Props) {
  const theme = themeTokens[deck.theme];
  const style = {
    "--slide-bg": `#${theme.background}`,
    "--slide-text": `#${theme.text}`,
    "--slide-muted": `#${theme.muted}`,
    "--slide-panel": `#${theme.panel}`,
    "--slide-accent": `#${accentTokens[slide.accent]}`,
  } as CSSProperties;
  const middle = Math.ceil(slide.points.length / 2);
  const columns = [slide.points.slice(0, middle), slide.points.slice(middle)];

  return (
    <article
      className={`slide-canvas slide-canvas--${slide.layout}${compact ? " slide-canvas--compact" : ""}`}
      style={style}
      aria-label={`第 ${index + 1} 页：${slide.heading}`}
    >
      <header className="slide-header">
        <span>{slide.eyebrow || deck.occasion}</span>
        <span>THINKSLIDE</span>
      </header>
      <div className="slide-content">
        <h2>{slide.heading || "未命名页面"}</h2>
        {slide.layout === "agenda" ? (
          <ol className="slide-agenda">
            {slide.points.map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}
          </ol>
        ) : null}
        {slide.layout === "twoColumn" ? (
          <div className="slide-columns">
            {columns.map((column, columnIndex) => (
              <ul key={columnIndex}>
                {column.map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}
              </ul>
            ))}
          </div>
        ) : null}
        {slide.layout === "quote" ? (
          <blockquote>{slide.points[0] ?? deck.title}</blockquote>
        ) : null}
        {["cover", "agenda", "twoColumn", "quote"].includes(slide.layout) ? null : (
          <ul className="slide-points">
            {slide.points.map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}
          </ul>
        )}
      </div>
      <footer className="slide-footer">
        <span>{deck.title}</span>
        <span>{index + 1} / {deck.slides.length}</span>
      </footer>
    </article>
  );
}
