import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";

export async function POST(req: Request) {
  const blocked = featureApiGuard("b2b-outreach");
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const id = (body.id || "").trim();

    if (!id) {
      return NextResponse.json({ error: "Lead id required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("leads")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", id)
      .eq("allocated_to", user.id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    await supabase.from("user_activity").insert([
      {
        user_id: user.id,
        type: "lead_used",
        description: `Used lead ${data.business_name}`,
        metadata: { lead_id: id },
      },
    ]);

    return NextResponse.json({ lead: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to mark lead used";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
