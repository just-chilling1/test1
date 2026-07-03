import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { generateOffers } from "@/features/b2b-outreach/lib/outreach-ai";

export async function POST(req: Request) {
  const blocked = featureApiGuard("b2b-outreach");
  if (blocked) return blocked;

  try {
    const { user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const niche = (body.niche || "").trim();
    const count = Math.min(Math.max(Number(body.count) || 5, 1), 10);

    if (!niche) {
      return NextResponse.json({ error: "Niche required" }, { status: 400 });
    }

    const generated = await generateOffers(niche, count);

    const admin = createAdminSupabaseClient();
    const rows = generated.map((offer) => ({
      name: offer.name,
      description: offer.description,
      payout: offer.payout,
      commission_type: offer.commission_type,
      niche,
      is_active: true,
    }));

    const { data, error } = await admin.from("offers").insert(rows).select("*");
    if (error) throw error;

    return NextResponse.json({ offers: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate offers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
