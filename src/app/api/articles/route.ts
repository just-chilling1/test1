import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { ensureUniqueArticleSlug, slugifyTitle } from "@/lib/article-slug";
import { featureApiGuardAny } from "@/lib/feature-api-guard";

const ARTICLE_FEATURES = [
  "article-wizard",
  "article-images",
  "article-publish",
  "portfolio",
] as const;

export async function GET(req: Request) {
  const blocked = featureApiGuardAny([...ARTICLE_FEATURES]);
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return NextResponse.json({ articles: data ?? [] });
    }

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ article: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load article";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const blocked = featureApiGuardAny(["article-wizard"]);
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const title = (body.title || "").trim();
    const articleBody = (body.body || "").trim();
    const niche = (body.niche || "").trim() || null;

    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }

    const insert: Record<string, unknown> = {
      user_id: user.id,
      title,
      body: articleBody,
      niche,
      status: "draft",
    };

    if (body.seo_meta && typeof body.seo_meta === "object") {
      insert.seo_meta = body.seo_meta;
    }

    const { data, error } = await supabase
      .from("articles")
      .insert([insert])
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ article: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create article";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const blocked = featureApiGuardAny([...ARTICLE_FEATURES]);
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const id = (body.id || "").trim();

    if (!id) {
      return NextResponse.json({ error: "Article id required" }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (typeof body.hero_image_url === "string") updates.hero_image_url = body.hero_image_url;
    if (typeof body.social_image_url === "string") updates.social_image_url = body.social_image_url;
    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.body === "string") updates.body = body.body;
    if (typeof body.status === "string") updates.status = body.status;
    if (typeof body.published_url === "string") updates.published_url = body.published_url;
    if (body.seo_meta && typeof body.seo_meta === "object") updates.seo_meta = body.seo_meta;

    const nextSeoMeta =
      body.seo_meta && typeof body.seo_meta === "object"
        ? (body.seo_meta as { title?: string })
        : (existing.seo_meta as { title?: string } | null);
    const publishHosted = body.publish_hosted === true;
    const nextStatus = typeof body.status === "string" ? body.status : existing.status;

    if (publishHosted && nextStatus === "published") {
      const slugSource =
        (typeof nextSeoMeta?.title === "string" && nextSeoMeta.title.trim()) ||
        (typeof body.title === "string" && body.title.trim()) ||
        existing.title;
      const slug = await ensureUniqueArticleSlug(
        supabase,
        slugifyTitle(slugSource),
        id
      );
      updates.slug = slug;
      updates.status = "published";

      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
      if (appUrl) {
        updates.published_url = `${appUrl}/article/${slug}`;
      }
    }

    const { data, error } = await supabase
      .from("articles")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ article: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update article";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const blocked = featureApiGuardAny(["portfolio"]);
  if (blocked) return blocked;

  try {
    const { supabase, user } = await getApiUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Article id required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete article";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
