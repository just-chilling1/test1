import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { generateOutreachComment } from "@/features/traffic-hub/lib/generate-comment";

export async function POST(req: Request) {
  const blocked = featureApiGuard("traffic-hub");
  if (blocked) return blocked;

  try {
    const { user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const title = (body.title || "").trim();
    const text = (body.text || "").trim();
    const niche = (body.niche || "").trim();
    const promotionUrl = (body.promotionUrl || body.bridgeUrl || "").trim();

    if (!title && !text) {
      return NextResponse.json({ error: "Target title or text required" }, { status: 400 });
    }

    const comment = await generateOutreachComment(title, text, niche, promotionUrl);
    return NextResponse.json({ comment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Comment generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
