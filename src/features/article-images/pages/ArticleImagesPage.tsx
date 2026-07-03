"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ImageIcon, Loader2, RefreshCw, Share2 } from "lucide-react";
import { brand } from "@/config/brand.config";
import { isFeatureEnabled } from "@/config/features.config";
import type { Article } from "@/features/article-images/types";

type ImageVariant = "hero" | "social";

export default function ArticleImagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("articleId");

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<ImageVariant | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setArticle(data.article);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load article");
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  const generateImage = async (variant: ImageVariant) => {
    if (!article) return;

    setGenerating(variant);
    setError(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          niche: article.niche,
          variant,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed");

      const field = variant === "hero" ? "hero_image_url" : "social_image_url";
      setArticle((prev) => (prev ? { ...prev, [field]: data.imageUrl } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setGenerating(null);
    }
  };

  const saveAndContinue = async () => {
    if (!article) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: article.id,
          hero_image_url: article.hero_image_url,
          social_image_url: article.social_image_url,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save images");

      if (isFeatureEnabled("article-publish")) {
        router.push(`/publish?articleId=${article.id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save images");
    } finally {
      setSaving(false);
    }
  };

  if (!articleId) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Article Images</h1>
        <p className="text-text-secondary text-sm">
          Open this step from the article wizard with an{" "}
          <code className="text-accent">articleId</code> in the URL, for example{" "}
          <code className="text-accent">/images?articleId=...</code>
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

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
          {brand.productName} · Article Images
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Generate visuals</h1>
        <p className="text-text-secondary text-sm max-w-2xl">
          Create a hero image and social share image for your draft, then continue to publish.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base flex flex-col gap-2"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Article</span>
        <h2 className="brand-font text-xl text-text-primary">{article.title}</h2>
        {article.niche && <p className="text-sm text-text-secondary">Niche: {article.niche}</p>}
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageCard
          label="Hero image"
          description="Wide blog header visual"
          icon={ImageIcon}
          imageUrl={article.hero_image_url}
          loading={generating === "hero"}
          onGenerate={() => generateImage("hero")}
        />
        <ImageCard
          label="Social image"
          description="Square share preview"
          icon={Share2}
          imageUrl={article.social_image_url}
          loading={generating === "social"}
          onGenerate={() => generateImage("social")}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={saveAndContinue}
          disabled={saving || (!article.hero_image_url && !article.social_image_url)}
          className="btn-primary"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Saving...
            </>
          ) : (
            <>
              Save & Continue
              <ArrowRight size={18} />
            </>
          )}
        </button>
        <button type="button" onClick={loadArticle} className="btn-secondary">
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>
    </div>
  );
}

function ImageCard({
  label,
  description,
  icon: Icon,
  imageUrl,
  loading,
  onGenerate,
}: {
  label: string;
  description: string;
  icon: typeof ImageIcon;
  imageUrl: string | null;
  loading: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="card-base flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-accent" />
        </div>
        <div>
          <h3 className="brand-font text-lg text-text-primary">{label}</h3>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>
      </div>

      <div className="aspect-video rounded-xl border border-border-dim bg-page overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-text-muted uppercase tracking-widest">No image yet</span>
        )}
      </div>

      <button type="button" onClick={onGenerate} disabled={loading} className="btn-secondary w-full">
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw size={18} />
            {imageUrl ? "Regenerate" : "Generate"}
          </>
        )}
      </button>
    </div>
  );
}
