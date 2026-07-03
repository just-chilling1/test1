import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { scrapeProductLink } from "@/features/article-wizard/lib/scrape-link";

export async function POST(req: Request) {
  const blocked = featureApiGuard("article-wizard");
  if (blocked) return blocked;

  try {
    const { user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const url = (body.url || "").trim();

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const scraped = await scrapeProductLink(url);
    return NextResponse.json({ scraped });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to scrape link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
