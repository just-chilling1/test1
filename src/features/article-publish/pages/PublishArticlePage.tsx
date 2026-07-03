"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ClipboardCopy,
  ExternalLink,
  Globe,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { brand } from "@/config/brand.config";
import { isFeatureEnabled } from "@/config/features.config";
import { buildArticleExportHtml, buildArticlePreviewBody } from "@/features/article-publish/lib/article-html";
import type { Article, SeoMeta } from "@/features/article-publish/types";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function PublishArticlePage() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get("articleId");

  const [article, setArticle] = useState<Article | null>(null);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaTags, setMetaTags] = useState("");
  const [loading, setLoading] = useState(true);
  const [generatingMeta, setGeneratingMeta] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [copied, setCopied] = useState<"html" | "url" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewHtml = useMemo(
    () => (article ? buildArticlePreviewBody(article) : ""),
    [article]
  );

  const exportHtml = useMemo(() => {
    if (!article) return "";
    return buildArticleExportHtml({
      ...article,
      seo_meta: {
        title: metaTitle,
        description: metaDescription,
        tags: parseTags(metaTags),
      },
    });
  }, [article, metaDescription, metaTags, metaTitle]);

  const loadArticle = useCallback(async () => {
    if (!articleId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/articles?id=${encodeURIComponent(articleId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load article");

      const loaded = data.article as Article;
      setArticle(loaded);

      const meta = (loaded.seo_meta ?? {}) as SeoMeta;
      setMetaTitle(meta.title || loaded.title || "");
      setMetaDescription(meta.description || "");
      setMetaTags(Array.isArray(meta.tags) ? meta.tags.join(", ") : "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load article");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  const saveSeoMeta = async () => {
    if (!article) return null;

    setSavingMeta(true);
    setError(null);

    try {
      const seo_meta: SeoMeta = {
        title: metaTitle.trim(),
        description: metaDescription.trim(),
        tags: parseTags(metaTags),
      };

      const res = await fetch("/api/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: article.id,
          seo_meta,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save SEO meta");

      setArticle(data.article);
      return data.article as Article;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save SEO meta");
      return null;
    } finally {
      setSavingMeta(false);
    }
  };

  const generateMetaDescription = async () => {
    if (!article) return;

    setGeneratingMeta(true);
    setError(null);

    try {
      const res = await fetch("/api/seo-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: metaTitle || article.title,
          body: article.body,
          niche: article.niche,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate meta description");
      setMetaDescription(data.description || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate meta description");
    } finally {
      setGeneratingMeta(false);
    }
  };

  const publishHosted = async () => {
    if (!article) return;

    setPublishing(true);
    setError(null);

    try {
      await saveSeoMeta();

      const res = await fetch("/api/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: article.id,
          status: "published",
          seo_meta: {
            title: metaTitle.trim(),
            description: metaDescription.trim(),
            tags: parseTags(metaTags),
          },
          publish_hosted: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish article");

      setArticle(data.article);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish article");
    } finally {
      setPublishing(false);
    }
  };

  const markPublishedExternal = async () => {
    if (!article) return;

    setPublishing(true);
    setError(null);

    try {
      const saved = await saveSeoMeta();
      if (!saved) return;

      const res = await fetch("/api/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: article.id,
          status: "published",
          seo_meta: {
            title: metaTitle.trim(),
            description: metaDescription.trim(),
            tags: parseTags(metaTags),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setArticle(data.article);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setPublishing(false);
    }
  };

  const copyText = async (text: string, kind: "html" | "url") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  };

  if (!articleId) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Publish</h1>
        <p className="text-text-secondary text-sm">
          Open this step from article images with an{" "}
          <code className="text-accent">articleId</code> in the URL, for example{" "}
          <code className="text-accent">/publish?articleId=...</code>
        </p>
        {isFeatureEnabled("article-wizard") && (
          <Link href="/create" className="btn-secondary w-fit">
            Go to Create Article
          </Link>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-text-muted gap-3">
        <Loader2 className="animate-spin" size={22} />
        <span>Loading article...</span>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col gap-4 max-w-xl">
        <h1 className="brand-font text-2xl text-text-primary">Article not found</h1>
        <p className="text-text-secondary text-sm">{error || "This draft could not be loaded."}</p>
        <Link href="/dashboard" className="btn-secondary w-fit">
          Back to Home
        </Link>
      </div>
    );
  }

  const isPublished = article.status === "published";

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
          {brand.productName} · Publish
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Preview & publish</h1>
        <p className="text-text-secondary text-sm max-w-2xl">
          Review your article, tune SEO meta, then copy HTML for external sites or publish to a public{" "}
          {brand.productName} URL.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {isPublished && article.published_url && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-base flex flex-col sm:flex-row sm:items-center gap-3 border border-accent/20"
        >
          <div className="flex items-center gap-2 text-accent">
            <Check size={18} />
            <span className="text-sm font-semibold">Published</span>
          </div>
          <a
            href={article.published_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-secondary hover:text-accent truncate flex-1"
          >
            {article.published_url}
          </a>
          <button
            type="button"
            onClick={() => copyText(article.published_url!, "url")}
            className="btn-secondary shrink-0"
          >
            {copied === "url" ? <Check size={16} /> : <ClipboardCopy size={16} />}
            {copied === "url" ? "Copied" : "Copy URL"}
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-base flex flex-col gap-4 xl:col-span-1"
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Preview</span>
            <h2 className="brand-font text-xl text-text-primary mt-2">{article.title}</h2>
            {article.niche && <p className="text-sm text-text-secondary mt-1">Niche: {article.niche}</p>}
          </div>

          {article.hero_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.hero_image_url}
              alt={article.title}
              className="w-full rounded-xl border border-border-dim object-cover max-h-56"
            />
          )}

          <div
            className="prose prose-invert max-w-none text-sm text-text-secondary [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </motion.div>

        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card-base flex flex-col gap-4"
          >
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">SEO meta</span>
              <p className="text-sm text-text-secondary mt-1">
                These fields power search snippets and social previews.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                Meta title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="input-base w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                Meta description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={4}
                className="input-base w-full resize-y"
              />
              <button
                type="button"
                onClick={generateMetaDescription}
                disabled={generatingMeta}
                className="btn-secondary w-full sm:w-auto"
              >
                {generatingMeta ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate description
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Tags</label>
              <input
                type="text"
                value={metaTags}
                onChange={(e) => setMetaTags(e.target.value)}
                placeholder="seo, affiliate, marketing"
                className="input-base w-full"
              />
            </div>

            <button
              type="button"
              onClick={saveSeoMeta}
              disabled={savingMeta}
              className="btn-secondary w-full sm:w-auto"
            >
              {savingMeta ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                "Save SEO meta"
              )}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-base flex flex-col gap-4"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              Publish options
            </span>

            <button
              type="button"
              onClick={() => copyText(exportHtml, "html")}
              className="btn-secondary w-full justify-start"
            >
              {copied === "html" ? <Check size={18} /> : <ClipboardCopy size={18} />}
              {copied === "html" ? "HTML copied" : "Copy export HTML"}
            </button>

            {appUrl ? (
              <button
                type="button"
                onClick={publishHosted}
                disabled={publishing}
                className="btn-primary w-full justify-start"
              >
                {publishing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Globe size={18} />
                    Publish to {brand.productName} URL
                  </>
                )}
              </button>
            ) : (
              <p className="text-xs text-text-muted">
                Set <code className="text-accent">NEXT_PUBLIC_APP_URL</code> to enable hosted public pages.
              </p>
            )}

            <div className="rounded-xl border border-border-dim bg-page/40 p-4 flex flex-col gap-3">
              <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <ExternalLink size={16} className="text-accent" />
                Manual publish
              </p>
              <ol className="text-sm text-text-secondary list-decimal list-inside space-y-1">
                <li>Copy the export HTML and paste it into your site builder or CMS.</li>
                <li>Set the page slug and meta fields to match what you entered above.</li>
                <li>Mark as published here once the live page is up.</li>
              </ol>
              <button
                type="button"
                onClick={markPublishedExternal}
                disabled={publishing}
                className="btn-secondary w-full sm:w-auto"
              >
                Mark as published
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {isFeatureEnabled("portfolio") && isPublished && (
          <Link href="/portfolio" className="btn-primary">
            View in Portfolio
            <ArrowRight size={18} />
          </Link>
        )}
        <button type="button" onClick={loadArticle} className="btn-secondary">
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>
    </div>
  );
}
