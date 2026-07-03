import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { featureApiGuard } from "@/lib/feature-api-guard";

export async function GET() {
  const blocked = featureApiGuard("image-forge");
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("generated_images")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ images: data ?? [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load library";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const blocked = featureApiGuard("image-forge");
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const prompt = (body.prompt || "").trim();
    const imageUrl = (body.imageUrl || body.image_url || "").trim();
    const templateId = (body.templateId || body.template_id || null) as string | null;

    if (!prompt || !imageUrl) {
      return NextResponse.json({ error: "Prompt and image URL required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("generated_images")
      .insert([
        {
          user_id: user.id,
          prompt,
          image_url: imageUrl,
          template_id: templateId,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ image: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const blocked = featureApiGuard("image-forge");
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Image id required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("generated_images")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
