"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { brand } from "@/config/brand.config";
import { isFeatureEnabled } from "@/config/features.config";
import type { Article } from "@/features/article-images/types";
import { clsx } from "clsx";

type StatusFilter = "all" | "draft" | "published";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getEditHref(article: Article): string {
  if (isFeatureEnabled("article-publish")) {
    return `/publish?articleId=${article.id}`;
  }
  if (isFeatureEnabled("article-images")) {
    return `/images?articleId=${article.id}`;
  }
  return `/create`;
}

export default function PortfolioPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/articles");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load articles");
      setArticles(data.articles ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const filtered = useMemo(() => {
    if (filter === "all") return articles;
    return articles.filter((a) => a.status === filter);
  }, [articles, filter]);

  const counts = useMemo(
    () => ({
      all: articles.length,
      draft: articles.filter((a) => a.status === "draft").length,
      published: articles.filter((a) => a.status === "published").length,
    }),
    [articles]
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/articles?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete article");
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete article");
    } finally {
      setDeletingId(null);
    }
  };

  const filters: { id: StatusFilter; label: string }[] = [
    { id: "all", label: `All (${counts.all})` },
    { id: "draft", label: `Drafts (${counts.draft})` },
    { id: "published", label: `Published (${counts.published})` },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
            {brand.productName} · Portfolio
          </p>
          <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Your articles</h1>
          <p className="text-text-secondary text-sm max-w-2xl">
            Browse drafts and published pieces. Open to edit or re-publish, or remove items you no longer need.
          </p>
        </div>
        {isFeatureEnabled("article-wizard") && (
          <Link href="/create" className="btn-primary shrink-0">
            <FileText size={18} />
            New article
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={clsx(
              "px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all",
              filter === item.id
                ? "bg-accent text-black border-accent"
                : "border-border-dim/40 text-text-muted hover:border-accent/30 hover:text-text-primary"
            )}
          >
            {item.label}
          </button>
        ))}
        <button type="button" onClick={loadArticles} className="btn-secondary py-1.5 px-3 text-xs ml-auto">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-text-muted text-sm py-12">
          <Loader2 className="animate-spin" size={18} />
          Loading articles...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-base text-center py-14 flex flex-col items-center gap-4">
          <FileText size={36} className="text-text-muted/30" />
          <p className="text-sm text-text-muted">
            {filter === "all"
              ? "No articles yet. Create your first draft to see it here."
              : `No ${filter} articles.`}
          </p>
          {filter === "all" && isFeatureEnabled("article-wizard") && (
            <Link href="/create" className="btn-primary">
              Create article
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((article, index) => {
            const isPublished = article.status === "published";
            return (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="card-base flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="brand-font text-lg text-text-primary line-clamp-2">{article.title}</h2>
                    {article.niche && (
                      <p className="text-xs text-text-secondary mt-1">Niche: {article.niche}</p>
                    )}
                  </div>
                  <span
                    className={clsx(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border shrink-0",
                      isPublished
                        ? "text-green-400 border-green-500/30 bg-green-500/10"
                        : "text-text-muted border-border-dim bg-surface"
                    )}
                  >
                    {isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <p className="text-[11px] text-text-muted">
                  Updated {formatDate(article.updated_at)}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href={getEditHref(article)} className="btn-primary flex-1 py-2 text-xs">
                    <Pencil size={14} />
                    {isPublished ? "Re-publish" : "Edit"}
                  </Link>
                  {isPublished && article.published_url && (
                    <a
                      href={article.published_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary py-2 px-3"
                      aria-label="View published article"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(article.id)}
                    disabled={deletingId === article.id}
                    className="btn-secondary py-2 px-3 text-red-400 hover:text-red-300"
                    aria-label="Delete article"
                  >
                    {deletingId === article.id ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
