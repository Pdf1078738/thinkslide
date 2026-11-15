import { z } from "zod";
import {
  deckSchema,
  outlineSchema,
  type Deck,
  type Outline,
  type PresentationInput,
} from "@/schema/presentation";

const outlineResponseSchema = z.object({
  outline: outlineSchema,
  provider: z.enum(["local", "kimi"]),
});
const deckResponseSchema = z.object({ deck: deckSchema });
const healthSchema = z.object({
  ok: z.boolean(),
  provider: z.enum(["local", "kimi"]),
  configured: z.boolean(),
});

export type RuntimeStatus = z.infer<typeof healthSchema>;

async function post(url: string, body: unknown): Promise<unknown> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    const message = z.object({ error: z.string() }).safeParse(data);
    throw new Error(message.success ? message.data.error : "请求失败");
  }
  return data;
}

export async function requestOutline(input: PresentationInput) {
  const data = await post("/api/outline", input);
  return outlineResponseSchema.parse(data);
}

export async function requestDeck(input: PresentationInput, outline: Outline): Promise<Deck> {
  const data = await post("/api/decks", { input, outline });
  return deckResponseSchema.parse(data).deck;
}

export async function getRuntimeStatus(): Promise<RuntimeStatus> {
  const response = await fetch("/api/health", { cache: "no-store" });
  if (!response.ok) throw new Error("无法读取模型配置状态");
  return healthSchema.parse(await response.json());
}
