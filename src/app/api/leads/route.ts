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
    const scope = searchParams.get("scope"); // "mine" | "pool"

    let query = supabase.from("leads").select("*").order("created_at", { ascending: false });

    if (scope === "pool") {
      query = query.is("allocated_to", null);
    } else {
      query = query.eq("allocated_to", user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ leads: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load leads";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
