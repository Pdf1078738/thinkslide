import type { Deck, Outline, PresentationInput } from "@/schema/presentation";
import { KimiGenerator } from "./kimi";
import { LocalGenerator } from "./local";
import type { GenerationProvider, PresentationGenerator } from "./types";

export function generationProvider(): GenerationProvider {
  return process.env.AI_PROVIDER === "kimi" ? "kimi" : "local";
}

function generator(): PresentationGenerator {
  return generationProvider() === "kimi" ? new KimiGenerator() : new LocalGenerator();
}

export async function draftOutline(input: PresentationInput): Promise<{ outline: Outline; provider: GenerationProvider }> {
  const active = generator();
  const outline = await active.draftOutline(input);
  return { outline, provider: active.provider };
}

export async function generateDeck(input: PresentationInput, outline: Outline): Promise<Deck> {
  return generator().generateDeck(input, outline);
}
