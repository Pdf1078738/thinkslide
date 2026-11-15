import type PptxGenJS from "pptxgenjs";
import type { Deck, Slide } from "@/schema/presentation";
import { accentTokens, themeTokens } from "./themes";

function addPoints(
  pptx: PptxGenJS,
  page: PptxGenJS.Slide,
  slide: Slide,
  color: string,
) {
  const common = {
    fontFace: "Microsoft YaHei",
    fontSize: 20,
    color,
    margin: 0.08,
    breakLine: true,
    fit: "shrink" as const,
    valign: "top" as const,
  };

  if (slide.layout === "twoColumn") {
    const middle = Math.ceil(slide.points.length / 2);
    const columns = [slide.points.slice(0, middle), slide.points.slice(middle)];
    columns.forEach((points, index) => {
      if (points.length === 0) return;
      page.addText(points.join("\n"), {
        ...common,
        x: 0.85 + index * 6.1,
        y: 2.65,
        w: 5.45,
        h: 3.5,
        bullet: { code: "2022", indent: 16 },
        breakLine: true,
        paraSpaceAfter: 14,
      });
    });
    return;
  }

  if (slide.points.length === 0) return;
  const isQuote = slide.layout === "quote";
  page.addText(slide.points.join("\n"), {
    ...common,
    x: isQuote ? 1.2 : 0.95,
    y: isQuote ? 3.2 : 2.65,
    w: isQuote ? 10.9 : 11.4,
    h: isQuote ? 1.8 : 3.4,
    fontSize: isQuote ? 26 : slide.layout === "agenda" ? 24 : 20,
    bold: isQuote,
    align: isQuote ? "center" : "left",
    bullet: isQuote || slide.layout === "closing" ? undefined : { code: "2022", indent: 16 },
    paraSpaceAfter: slide.layout === "agenda" ? 18 : 12,
  });
}

export async function exportPptx(deck: Deck) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "ThinkSlide";
  pptx.company = "ThinkSlide";
  pptx.subject = deck.subtitle;
  pptx.title = deck.title;
  pptx.theme = {
    headFontFace: "Microsoft YaHei",
    bodyFontFace: "Microsoft YaHei",
  };

  deck.slides.forEach((slide, index) => {
    const theme = themeTokens[deck.theme];
    const accent = accentTokens[slide.accent];
    const page = pptx.addSlide();
    const centered = slide.layout === "cover" || slide.layout === "closing";
    page.background = { color: theme.background };
    page.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.333,
      h: 0.09,
      fill: { color: accent },
      line: { color: accent },
    });
    page.addText(slide.eyebrow || deck.occasion, {
      x: 0.8,
      y: 0.55,
      w: 11.7,
      h: 0.35,
      fontFace: "Microsoft YaHei",
      fontSize: 12,
      bold: true,
      color: accent,
      margin: 0,
      charSpacing: 1.2,
    });
    page.addText(slide.heading, {
      x: 0.85,
      y: centered ? 2.05 : 1.2,
      w: 11.65,
      h: centered ? 1.45 : 1.15,
      fontFace: "Microsoft YaHei",
      fontSize: centered ? 34 : 28,
      bold: true,
      color: theme.text,
      margin: 0,
      fit: "shrink",
      align: centered ? "center" : "left",
      valign: "middle",
    });
    addPoints(pptx, page, slide, theme.text);
    page.addText(deck.title, {
      x: 0.8,
      y: 6.85,
      w: 8.5,
      h: 0.25,
      fontFace: "Microsoft YaHei",
      fontSize: 9,
      color: theme.muted,
      margin: 0,
    });
    page.addText(`${index + 1} / ${deck.slides.length}`, {
      x: 11.4,
      y: 6.85,
      w: 1.1,
      h: 0.25,
      fontFace: "Microsoft YaHei",
      fontSize: 9,
      color: theme.muted,
      align: "right",
      margin: 0,
    });
    page.addNotes(`${slide.script}\n\n演讲提示：${slide.cues.join("；")}`);
  });

  const fileName = `${deck.title.replace(/[<>:"/\\|?*]/g, "-") || "ThinkSlide"}.pptx`;
  await pptx.writeFile({ fileName, compression: true });
}
