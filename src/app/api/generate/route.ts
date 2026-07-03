import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { generateArticleBody } from "@/features/article-wizard/lib/article-ai";
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
    const title = (body.title || "").trim();
    const niche = (body.niche || "").trim();
    const notes = (body.notes || "").trim();
    const affiliateLink = (body.affiliateLink || "").trim();
    const scraped = (body.scraped ?? null) as ScrapedLinkContext | null;

    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }
    if (!niche) {
      return NextResponse.json({ error: "Niche required" }, { status: 400 });
    }

    const articleBody = await generateArticleBody({
      title,
      niche,
      scraped,
      notes,
      affiliateLink: affiliateLink || undefined,
    });

    return NextResponse.json({ body: articleBody });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Article generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
