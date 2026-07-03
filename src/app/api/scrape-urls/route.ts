import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { scrapeTrafficUrls } from "@/features/traffic-hub/lib/scrape-urls";

export async function POST(req: Request) {
  const blocked = featureApiGuard("traffic-hub");
  if (blocked) return blocked;

  try {
    const { user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const niche = (body.niche || body.keyword || "").trim();

    if (!niche) {
      return NextResponse.json({ error: "Niche required" }, { status: 400 });
    }

    const targets = await scrapeTrafficUrls(niche);
    return NextResponse.json({ targets });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to discover URLs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
