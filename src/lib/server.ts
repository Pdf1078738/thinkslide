import { z } from "zod";

export function apiError(error: unknown) {
  if (error instanceof z.ZodError) {
    return Response.json({ error: error.issues[0]?.message ?? "输入无效" }, { status: 400 });
  }
  if (error instanceof SyntaxError) {
    return Response.json({ error: "请求不是有效的 JSON" }, { status: 400 });
  }
  const message = error instanceof Error ? error.message : "生成失败，请稍后重试";
  console.error("ThinkSlide API error:", message);
  return Response.json({ error: message }, { status: 502 });
}
