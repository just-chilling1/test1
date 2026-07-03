import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { findSubNiches } from "@/features/niche-finder/lib/find-niches";

export async function POST(req: Request) {
  const blocked = featureApiGuard("niche-finder");
  if (blocked) return blocked;

  try {
    const { user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const topic = (body.topic || body.keyword || "").trim();

    if (!topic) {
      return NextResponse.json({ error: "Broad topic required" }, { status: 400 });
    }

    const niches = await findSubNiches(topic);
    return NextResponse.json({ topic, niches });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Niche search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
