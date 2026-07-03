import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { suggestHeadlines } from "@/features/article-wizard/lib/article-ai";
import type { ScrapedLinkContext } from "@/features/article-wizard/lib/scrape-link";

export async function POST(req: Request) {
  const blocked = featureApiGuard("article-wizard");
  if (blocked) return blocked;

  try {
    const { user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const niche = (body.niche || "").trim();
    const notes = (body.notes || "").trim();
    const scraped = (body.scraped ?? null) as ScrapedLinkContext | null;

    if (!niche) {
      return NextResponse.json({ error: "Niche required" }, { status: 400 });
    }

    const headlines = await suggestHeadlines(niche, scraped, notes);
    return NextResponse.json({ headlines });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to suggest headlines";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
