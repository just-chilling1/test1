import type { Article, SeoMeta } from "@/features/article-publish/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveSeoMeta(article: Article): Required<Pick<SeoMeta, "title" | "description">> & { tags: string[] } {
  const meta = article.seo_meta ?? {};
  return {
    title: (meta.title || article.title || "").trim(),
    description: (meta.description || "").trim(),
    tags: Array.isArray(meta.tags) ? meta.tags.filter(Boolean) : [],
  };
}

function renderBodyHtml(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "";

  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

export function buildArticleExportHtml(article: Article): string {
  const seo = resolveSeoMeta(article);
  const tagsMeta = seo.tags.map((tag) => `<meta name="keywords" content="${escapeHtml(tag)}">`).join("\n  ");
  const hero = article.hero_image_url
    ? `<figure><img src="${escapeHtml(article.hero_image_url)}" alt="${escapeHtml(article.title)}" style="max-width:100%;height:auto;border-radius:12px;" /></figure>`
    : "";
  const ogImage = article.social_image_url || article.hero_image_url;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(seo.title)}</title>
  <meta name="description" content="${escapeHtml(seo.description)}">
  ${tagsMeta}
  <meta property="og:title" content="${escapeHtml(seo.title)}">
  <meta property="og:description" content="${escapeHtml(seo.description)}">
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}">` : ""}
  <style>
    body { font-family: Georgia, serif; line-height: 1.7; color: #111; max-width: 720px; margin: 0 auto; padding: 2rem 1.25rem; }
    h1 { font-size: 2rem; line-height: 1.2; margin-bottom: 1.5rem; }
    figure { margin: 0 0 1.5rem; }
  </style>
</head>
<body>
  <article>
    ${hero}
    <h1>${escapeHtml(article.title)}</h1>
    ${renderBodyHtml(article.body)}
  </article>
</body>
</html>`;
}

export function buildArticlePreviewBody(article: Article): string {
  return renderBodyHtml(article.body);
}
