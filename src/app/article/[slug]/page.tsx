import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand.config";
import { isFeatureEnabled } from "@/config/features.config";
import { buildArticlePreviewBody } from "@/features/article-publish/lib/article-html";
import type { SeoMeta } from "@/features/article-publish/types";
import { createApiSupabaseClient } from "@/lib/api-auth";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadPublishedArticle(slug: string) {
  const supabase = await createApiSupabaseClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!isFeatureEnabled("article-publish")) {
    return { title: "Not found" };
  }

  const { slug } = await params;
  const article = await loadPublishedArticle(slug);
  if (!article) return { title: "Not found" };

  const meta = (article.seo_meta ?? {}) as SeoMeta;
  const title = meta.title || article.title;
  const description = meta.description || article.body.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: article.social_image_url || article.hero_image_url || undefined,
    },
  };
}

export default async function PublicArticlePage({ params }: PageProps) {
  if (!isFeatureEnabled("article-publish")) notFound();

  const { slug } = await params;
  const article = await loadPublishedArticle(slug);
  if (!article) notFound();

  const meta = (article.seo_meta ?? {}) as SeoMeta;
  const bodyHtml = buildArticlePreviewBody({
    ...article,
    seo_meta: meta,
  });

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold tracking-wide text-neutral-500">{brand.productName}</span>
          {Array.isArray(meta.tags) && meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end">
              {meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] uppercase tracking-wider px-2 py-1 rounded-full bg-neutral-100 text-neutral-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {article.hero_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.hero_image_url}
            alt={article.title}
            className="w-full rounded-2xl mb-8 object-cover max-h-[420px]"
          />
        )}

        <h1 className="text-3xl sm:text-4xl font-serif font-bold leading-tight mb-8">{article.title}</h1>

        <div
          className="prose prose-neutral max-w-none text-lg leading-relaxed [&_p]:mb-5"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </main>
    </div>
  );
}
