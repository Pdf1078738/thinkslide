import type { Outline, PresentationInput } from "@/schema/presentation";

function context(input: PresentationInput) {
  return [
    `受众：${input.audience}`,
    `场合：${input.occasion}`,
    `时长：${input.durationMinutes} 分钟`,
    `页数：${input.slideCount}`,
    `原始内容：\n${input.idea}`,
  ].join("\n");
}

export function outlinePrompt(input: PresentationInput) {
  return `你是演讲结构设计师。把输入整理成清晰、诚实、适合口头表达的中文大纲。保留用户的观点、术语和事实，不补充没有依据的数据或案例。章节应有明确的叙事顺序，每章提供 1～4 个要点。\n\n${context(input)}`;
}

export function deckPrompt(input: PresentationInput, outline: Outline) {
  return `你是演讲撰稿人和幻灯片设计师。根据定稿大纲生成 ${input.slideCount} 页演示文稿。首页使用 cover，最后一页使用 closing，其余页面从 agenda、bullets、twoColumn、quote 中选择。每页只表达一个核心意思，要点简洁；script 是与本页对应的自然口语讲稿；cues 提供简短的演讲提示。不得编造外部事实。\n\n${context(input)}\n\n定稿大纲：\n${JSON.stringify(outline)}`;
}
