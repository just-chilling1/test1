import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";

export async function GET() {
  const blocked = featureApiGuard("b2b-outreach");
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ activity: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load activity";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
