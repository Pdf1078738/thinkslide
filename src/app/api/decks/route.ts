import { generateDeck } from "@/llm";
import { apiError } from "@/lib/server";
import { deckRequestSchema } from "@/schema/presentation";

export async function POST(request: Request) {
  try {
    const { input, outline } = deckRequestSchema.parse(await request.json());
    const deck = await generateDeck(input, outline);
    return Response.json({ deck });
  } catch (error) {
    return apiError(error);
  }
}
