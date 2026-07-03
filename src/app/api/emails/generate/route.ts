import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";
import { generateOutreachEmails } from "@/features/b2b-outreach/lib/outreach-ai";

export async function POST(req: Request) {
  const blocked = featureApiGuard("b2b-outreach");
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const leadId = (body.leadId || "").trim();
    const offerId = (body.offerId || "").trim();

    if (!leadId || !offerId) {
      return NextResponse.json({ error: "Lead and offer required" }, { status: 400 });
    }

    const [{ data: lead }, { data: offer }] = await Promise.all([
      supabase.from("leads").select("*").eq("id", leadId).eq("allocated_to", user.id).maybeSingle(),
      supabase.from("offers").select("*").eq("id", offerId).maybeSingle(),
    ]);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const variants = await generateOutreachEmails(lead, offer);
    return NextResponse.json({ variants });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate emails";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
