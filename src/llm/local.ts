import type { PresentationGenerator } from "./types";
import type {
  Accent,
  Deck,
  Outline,
  PresentationInput,
  Slide,
} from "@/schema/presentation";
import { outlineSchema } from "@/schema/presentation";

const accents: Accent[] = ["coral", "blue", "green", "gold"];

function clean(text: string) {
  return text.replace(/^\s*(#{1,6}|[-*•]|\d+[.、])\s*/, "").trim();
}

function short(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function fragments(source: string) {
  const lines = source.split(/\n+/).map(clean).filter(Boolean);
  if (lines.length > 1) return lines;
  return source.split(/(?<=[。！？!?；;])/).map(clean).filter(Boolean);
}

export class LocalGenerator implements PresentationGenerator {
  readonly provider = "local" as const;

  async draftOutline(input: PresentationInput): Promise<Outline> {
    const parts = fragments(input.idea);
    const title = short(parts[0] ?? "未命名演示", 40);
    const content = parts.slice(1).length > 0 ? parts.slice(1) : parts;
    const sections = content.slice(0, 6).map((part, index) => ({
      id: `section-${index + 1}`,
      title: short(part, 32),
      summary: part,
      points: [short(part, 100)],
    }));

    return outlineSchema.parse({
      title,
      subtitle: `面向${input.audience}的${input.occasion}`,
      coreMessage: short(parts[0] ?? title, 120),
      sections: sections.length > 0 ? sections : [{
        id: "section-1",
        title: "核心内容",
        summary: input.idea,
        points: [short(input.idea, 100)],
      }],
    });
  }

  async generateDeck(input: PresentationInput, outline: Outline): Promise<Deck> {
    const slides: Slide[] = [];
    const contentCount = input.slideCount - 2;

    for (let index = 0; index < input.slideCount; index += 1) {
      const section = outline.sections[(index - 1) % outline.sections.length];
      const accent = accents[index % accents.length];
      const common = {
        id: `slide-${index + 1}`,
        accent,
        cues: ["先讲结论，再展开要点", "在关键句后稍作停顿"],
      };

      if (index === 0) {
        slides.push({
          ...common,
          layout: "cover",
          eyebrow: input.occasion,
          heading: outline.title,
          points: [],
          script: `大家好，今天分享的主题是“${outline.title}”。${outline.coreMessage}`,
        });
      } else if (index === input.slideCount - 1) {
        slides.push({
          ...common,
          layout: "closing",
          eyebrow: "总结",
          heading: short(outline.coreMessage, 60),
          points: ["回顾核心观点", "明确下一步行动"],
          script: `最后，希望这场分享能传达一个清晰的信息：${outline.coreMessage}。谢谢大家。`,
        });
      } else if (index === 1 && input.slideCount >= 4) {
        slides.push({
          ...common,
          layout: "agenda",
          eyebrow: "内容大纲",
          heading: "今天的内容",
          points: outline.sections.map((item) => item.title).slice(0, 6),
          script: `今天的内容分为${outline.sections.length}个部分。接下来会按照页面顺序逐一展开。`,
        });
      } else {
        const contentIndex = index - (input.slideCount >= 4 ? 2 : 1);
        const current = outline.sections[contentIndex % outline.sections.length] ?? section;
        slides.push({
          ...common,
          layout: contentIndex % 3 === 2 ? "twoColumn" : "bullets",
          eyebrow: `第 ${contentIndex + 1} 部分`,
          heading: current.title,
          points: current.points,
          script: `${current.summary || current.title}。这一页重点说明${current.points.join("、")}。`,
        });
      }
    }

    return {
      version: "0.1.0",
      title: outline.title,
      subtitle: outline.subtitle,
      audience: input.audience,
      occasion: input.occasion,
      durationMinutes: input.durationMinutes,
      sourceIdea: input.idea,
      theme: input.theme,
      provider: "local",
      slides,
    };
  }
}
