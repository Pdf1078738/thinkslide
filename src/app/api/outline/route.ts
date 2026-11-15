import { draftOutline } from "@/llm";
import { apiError } from "@/lib/server";
import { presentationInputSchema } from "@/schema/presentation";

export async function POST(request: Request) {
  try {
    const input = presentationInputSchema.parse(await request.json());
    const result = await draftOutline(input);
    return Response.json(result);
  } catch (error) {
    return apiError(error);
  }
}
