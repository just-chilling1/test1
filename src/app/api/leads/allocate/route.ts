import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

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
    const batchSize = Math.min(Math.max(Number(body.batchSize) || 5, 1), 25);

    const admin = createAdminSupabaseClient();

    let poolQuery = admin
      .from("leads")
      .select("id")
      .is("allocated_to", null)
      .limit(batchSize);

    if (niche) {
      poolQuery = poolQuery.eq("niche", niche);
    }

    const { data: pool, error: poolError } = await poolQuery;
    if (poolError) throw poolError;

    if (!pool || pool.length === 0) {
      return NextResponse.json({ leads: [], allocated: 0 });
    }

    const ids = pool.map((row) => row.id);
    const nowIso = new Date().toISOString();

    const { data, error } = await admin
      .from("leads")
      .update({ allocated_to: user.id, allocated_at: nowIso })
      .in("id", ids)
      .is("allocated_to", null)
      .select("*");

    if (error) throw error;

    const allocated = data ?? [];

    if (allocated.length > 0) {
      await admin.from("user_activity").insert([
        {
          user_id: user.id,
          type: "leads_allocated",
          description: `Allocated ${allocated.length} lead${allocated.length === 1 ? "" : "s"}${niche ? ` in ${niche}` : ""}`,
          metadata: { count: allocated.length, niche: niche || null },
        },
      ]);
    }

    return NextResponse.json({ leads: allocated, allocated: allocated.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to allocate leads";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
