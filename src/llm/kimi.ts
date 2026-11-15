import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, Output } from "ai";
import type { PresentationGenerator } from "./types";
import type { Deck, Outline, PresentationInput } from "@/schema/presentation";
import { deckSchema, outlineSchema } from "@/schema/presentation";
import { deckPrompt, outlinePrompt } from "@/prompts/presentation";

function kimiModel() {
  const apiKey = process.env.MOONSHOT_API_KEY;
  const model = process.env.MOONSHOT_MODEL;
  if (!apiKey || !model) {
    throw new Error("Kimi 尚未配置：请设置 MOONSHOT_API_KEY 和 MOONSHOT_MODEL");
  }

  const provider = createOpenAICompatible({
    name: "moonshot",
    baseURL: process.env.MOONSHOT_BASE_URL ?? "https://api.moonshot.cn/v1",
    apiKey,
  });
  return provider(model);
}

export class KimiGenerator implements PresentationGenerator {
  readonly provider = "kimi" as const;

  async draftOutline(input: PresentationInput): Promise<Outline> {
    const { output } = await generateText({
      model: kimiModel(),
      output: Output.object({ schema: outlineSchema }),
      prompt: outlinePrompt(input),
    });
    if (!output) throw new Error("模型没有返回大纲");
    return outlineSchema.parse(output);
  }

  async generateDeck(input: PresentationInput, outline: Outline): Promise<Deck> {
    const { output } = await generateText({
      model: kimiModel(),
      output: Output.object({ schema: deckSchema }),
      prompt: deckPrompt(input, outline),
    });
    if (!output) throw new Error("模型没有返回幻灯片");
    const deck = deckSchema.parse(output);
    if (deck.slides.length !== input.slideCount) {
      throw new Error(`模型返回 ${deck.slides.length} 页，要求为 ${input.slideCount} 页`);
    }
    return deck;
  }
}
