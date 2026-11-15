import type { Deck, Outline, PresentationInput } from "@/schema/presentation";

export type GenerationProvider = "local" | "kimi";

export interface PresentationGenerator {
  readonly provider: GenerationProvider;
  draftOutline(input: PresentationInput): Promise<Outline>;
  generateDeck(input: PresentationInput, outline: Outline): Promise<Deck>;
}
