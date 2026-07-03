import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";

const SELECT = "*, generated_images ( image_url )";

export async function GET() {
  const blocked = featureApiGuard("money-links-vault");
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("money_links")
      .select(SELECT)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ links: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load links";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const blocked = featureApiGuard("money-links-vault");
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const label = (body.label || "").trim();
    const url = (body.url || "").trim();
    const niche = (body.niche || "").trim() || null;
    const notes = (body.notes || "").trim() || null;
    const imageId = body.imageId || body.image_id || null;

    if (!label || !url) {
      return NextResponse.json({ error: "Label and URL required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("money_links")
      .insert([
        {
          user_id: user.id,
          label,
          url,
          niche,
          notes,
          image_id: imageId,
        },
      ])
      .select(SELECT)
      .single();

    if (error) throw error;

    return NextResponse.json({ link: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const blocked = featureApiGuard("money-links-vault");
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const id = (body.id || "").trim();
    if (!id) {
      return NextResponse.json({ error: "Link id required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.label !== undefined) updates.label = String(body.label).trim();
    if (body.url !== undefined) updates.url = String(body.url).trim();
    if (body.niche !== undefined) updates.niche = String(body.niche).trim() || null;
    if (body.notes !== undefined) updates.notes = String(body.notes).trim() || null;
    if (body.imageId !== undefined || body.image_id !== undefined) {
      updates.image_id = body.imageId || body.image_id || null;
    }

    const { data, error } = await supabase
      .from("money_links")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(SELECT)
      .single();

    if (error) throw error;

    return NextResponse.json({ link: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const blocked = featureApiGuard("money-links-vault");
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Link id required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("money_links")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
