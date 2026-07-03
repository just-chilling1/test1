import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { callChatGPT } from "@/features/core-workflow/lib/llm";

export async function POST(req: Request) {
  const blocked = featureApiGuard("article-publish");
  if (blocked) return blocked;

  try {
    const { user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const title = (body.title || "").trim();
    const articleBody = (body.body || "").trim();
    const niche = (body.niche || "").trim();

    if (!title && !articleBody) {
      return NextResponse.json({ error: "Title or body required" }, { status: 400 });
    }

    const prompt = `Write a concise SEO meta description (140-160 characters) for this article.
Title: ${title || "Untitled"}
${niche ? `Niche: ${niche}` : ""}
Article excerpt: ${articleBody.slice(0, 1200)}

Return ONLY the meta description text. No quotes, labels, or markdown.`;

    const description = (await callChatGPT([{ role: "user", content: prompt }]))
      .replace(/^["']|["']$/g, "")
      .trim()
      .slice(0, 320);

    return NextResponse.json({ description });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate meta description";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
