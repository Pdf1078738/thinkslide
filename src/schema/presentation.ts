import { z } from "zod";

export const occasionSchema = z.enum(["课程展示", "职场汇报", "快速提案"]);
export const themeSchema = z.enum(["paper", "midnight", "ocean"]);
export const accentSchema = z.enum(["coral", "blue", "green", "gold"]);
export const layoutSchema = z.enum([
  "cover",
  "agenda",
  "bullets",
  "twoColumn",
  "quote",
  "closing",
]);

export const presentationInputSchema = z.object({
  idea: z.string().trim().min(10, "请至少输入 10 个字").max(12000),
  audience: z.string().trim().min(2, "请填写目标听众").max(40),
  occasion: occasionSchema,
  durationMinutes: z.number().int().min(1).max(120),
  slideCount: z.number().int().min(3).max(12),
  theme: themeSchema,
});

export const outlineSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(60),
  summary: z.string().trim().max(500),
  points: z.array(z.string().trim().min(1).max(120)).min(1).max(6),
});

export const outlineSchema = z.object({
  title: z.string().trim().min(1).max(80),
  subtitle: z.string().trim().max(120),
  coreMessage: z.string().trim().min(1).max(240),
  sections: z.array(outlineSectionSchema).min(1).max(8),
});

export const slideSchema = z.object({
  id: z.string().min(1),
  layout: layoutSchema,
  eyebrow: z.string().trim().max(60),
  heading: z.string().trim().min(1).max(100),
  points: z.array(z.string().trim().min(1).max(160)).max(6),
  script: z.string().trim().max(2400),
  cues: z.array(z.string().trim().min(1).max(100)).max(4),
  accent: accentSchema,
});

export const deckSchema = z.object({
  version: z.literal("0.1.0"),
  title: z.string().trim().min(1).max(80),
  subtitle: z.string().trim().max(120),
  audience: z.string().trim().min(2).max(40),
  occasion: occasionSchema,
  durationMinutes: z.number().int().min(1).max(120),
  sourceIdea: z.string().max(12000),
  theme: themeSchema,
  provider: z.enum(["local", "kimi"]),
  slides: z.array(slideSchema).min(1).max(20),
}).superRefine((deck, context) => {
  const ids = new Set<string>();
  deck.slides.forEach((slide, index) => {
    if (ids.has(slide.id)) {
      context.addIssue({
        code: "custom",
        message: `第 ${index + 1} 页使用了重复的页面 ID`,
        path: ["slides", index, "id"],
      });
    }
    ids.add(slide.id);
  });
});

export const deckRequestSchema = z.object({
  input: presentationInputSchema,
  outline: outlineSchema,
});

export const workspaceSchema = z.object({
  input: presentationInputSchema,
  outline: outlineSchema.nullable(),
  deck: deckSchema.nullable(),
  view: z.enum(["input", "outline", "editor"]),
});

export type PresentationInput = z.infer<typeof presentationInputSchema>;
export type Outline = z.infer<typeof outlineSchema>;
export type OutlineSection = z.infer<typeof outlineSectionSchema>;
export type Slide = z.infer<typeof slideSchema>;
export type Deck = z.infer<typeof deckSchema>;
export type Workspace = z.infer<typeof workspaceSchema>;
export type Layout = z.infer<typeof layoutSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type Accent = z.infer<typeof accentSchema>;
