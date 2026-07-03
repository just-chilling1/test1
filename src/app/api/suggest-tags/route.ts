import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { suggestTags } from "@/features/article-wizard/lib/article-ai";

export async function POST(req: Request) {
  const blocked = featureApiGuard("article-wizard");
  if (blocked) return blocked;

  try {
    const { user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const title = (body.title || "").trim();
    const niche = (body.niche || "").trim();
    const articleBody = (body.body || "").trim();

    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }
    if (!niche) {
      return NextResponse.json({ error: "Niche required" }, { status: 400 });
    }

    const tags = await suggestTags(title, niche, articleBody);
    return NextResponse.json({ tags });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to suggest tags";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
