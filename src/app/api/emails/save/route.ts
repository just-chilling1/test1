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
      .from("saved_emails")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ emails: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load saved emails";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const blocked = featureApiGuard("b2b-outreach");
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const subject = (body.subject || "").trim();
    const emailBody = (body.body || "").trim();
    const leadId = (body.leadId || "").trim() || null;
    const offerId = (body.offerId || "").trim() || null;

    if (!subject && !emailBody) {
      return NextResponse.json({ error: "Subject or body required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("saved_emails")
      .insert([
        {
          user_id: user.id,
          lead_id: leadId,
          offer_id: offerId,
          subject,
          body: emailBody,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    await supabase.from("user_activity").insert([
      {
        user_id: user.id,
        type: "email_saved",
        description: `Saved email template: ${subject || "(no subject)"}`,
        metadata: { saved_email_id: data.id },
      },
    ]);

    return NextResponse.json({ email: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
