import type { PresentationInput, Slide } from "@/schema/presentation";

export const defaultInput: PresentationInput = {
  idea: "",
  audience: "课程听众",
  occasion: "课程展示",
  durationMinutes: 10,
  slideCount: 8,
  theme: "paper",
};

export const sampleIdea = `AI 如何帮助普通人提升表达能力
很多人不是没有想法，而是不知道怎样把零散想法组织成清楚的结构
AI 更适合作为表达教练，而不是替人思考
先口述自己的想法，再让 AI 协助整理结构
最后保留自己的判断和语言风格
通过真实练习和反馈持续改进表达`;

export function createEmptySlide(): Slide {
  return {
    id: crypto.randomUUID(),
    layout: "bullets",
    eyebrow: "内容",
    heading: "新页面",
    points: ["在右侧编辑页面要点"],
    script: "",
    cues: [],
    accent: "coral",
  };
}
