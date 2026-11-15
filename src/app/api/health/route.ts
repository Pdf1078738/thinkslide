import { generationProvider } from "@/llm";

export function GET() {
  const provider = generationProvider();
  return Response.json({
    ok: true,
    provider,
    configured: provider === "local" || Boolean(process.env.MOONSHOT_API_KEY && process.env.MOONSHOT_MODEL),
  });
}
