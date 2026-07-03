import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuardAny } from "@/lib/feature-api-guard";
import { buildArticleImagePrompt, generateImageFromPrompt } from "@/lib/generate-image";

export async function POST(req: Request) {
  const blocked = featureApiGuardAny(["image-forge", "article-images"]);
  if (blocked) return blocked;

  try {
    const { user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const prompt = (body.prompt || "").trim();
    const title = (body.title || "").trim();
    const niche = (body.niche || "").trim() || null;
    const variant = body.variant === "social" ? "social" : "hero";

    const finalPrompt =
      prompt || (title ? buildArticleImagePrompt(title, niche, variant) : "");

    if (!finalPrompt) {
      return NextResponse.json({ error: "Prompt or title required" }, { status: 400 });
    }

    const imageUrl = await generateImageFromPrompt(finalPrompt);
    return NextResponse.json({ imageUrl, prompt: finalPrompt });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Image generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
