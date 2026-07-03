import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";

export async function GET(req: Request) {
  const blocked = featureApiGuard("b2b-outreach");
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const niche = searchParams.get("niche");

    let query = supabase
      .from("offers")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (niche) {
      query = query.eq("niche", niche);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ offers: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load offers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
