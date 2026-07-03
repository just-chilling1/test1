"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Link2,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { brand } from "@/config/brand.config";
import type { ScrapedLinkContext } from "@/features/article-wizard/lib/scrape-link";

type WizardStep = "input" | "headlines" | "generate" | "review";

const STEPS: { id: WizardStep; label: string }[] = [
  { id: "input", label: "Topic" },
  { id: "headlines", label: "Headline" },
  { id: "generate", label: "Write" },
  { id: "review", label: "Save" },
];

export default function CreateArticlePage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("input");

  const [niche, setNiche] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [notes, setNotes] = useState("");
  const [scraped, setScraped] = useState<ScrapedLinkContext | null>(null);
  const [scrapeWarning, setScrapeWarning] = useState<string | null>(null);

  const [headlines, setHeadlines] = useState<string[]>([]);
  const [selectedHeadline, setSelectedHeadline] = useState("");
  const [customHeadline, setCustomHeadline] = useState("");
  const [draftTitle, setDraftTitle] = useState("");

  const [articleBody, setArticleBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedTitle = (selectedHeadline || customHeadline).trim();
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const runScrape = async (url: string) => {
    const res = await fetch("/api/scrape-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to scrape URL");
    return data.scraped as ScrapedLinkContext;
  };

  const handleInputContinue = async () => {
    if (!niche.trim()) {
      setError("Enter a niche or topic");
      return;
    }

    setLoading(true);
    setError(null);
    setScrapeWarning(null);

    try {
      let context = scraped;
      if (productUrl.trim()) {
        try {
          context = await runScrape(productUrl.trim());
          setScraped(context);
        } catch (err) {
          setScraped(null);
          setScrapeWarning(
            err instanceof Error ? err.message : "Could not scrape URL — continuing with niche only."
          );
          context = null;
        }
      }

      const res = await fetch("/api/suggest-headlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: niche.trim(),
          notes,
          scraped: context,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to suggest headlines");

      setHeadlines(data.headlines ?? []);
      setSelectedHeadline(data.headlines?.[0] ?? "");
      setStep("headlines");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!resolvedTitle) {
      setError("Pick or enter a headline");
      return;
    }

    setLoading(true);
    setError(null);
    setStep("generate");

    try {
      const [generateRes, tagsRes] = await Promise.all([
        fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: resolvedTitle,
            niche: niche.trim(),
            notes,
            affiliateLink: affiliateLink.trim(),
            scraped,
          }),
        }),
        fetch("/api/suggest-tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: resolvedTitle,
            niche: niche.trim(),
          }),
        }),
      ]);

      const generateData = await generateRes.json();
      if (!generateRes.ok) throw new Error(generateData.error || "Article generation failed");

      const tagsData = await tagsRes.json();
      setArticleBody(generateData.body || "");
      setTags(tagsRes.ok ? (tagsData.tags ?? []) : []);
      setDraftTitle(resolvedTitle);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Article generation failed");
      setStep("headlines");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!draftTitle.trim() || !articleBody.trim()) {
      setError("Article title and body are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draftTitle.trim(),
          niche: niche.trim(),
          body: articleBody,
          seo_meta: {
            title: draftTitle.trim(),
            tags,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save draft");

      router.push(`/images?articleId=${data.article.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
          {brand.productName} · Create Article
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">AI article wizard</h1>
        <p className="text-text-secondary text-sm max-w-2xl">
          Enter your niche or product URL, pick a headline, and let AI write a full SEO draft with CTAs.
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((s, index) => {
          const done = index < stepIndex;
          const active = s.id === step;
          return (
            <div key={s.id} className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div
                className={`wizard-step-circle ${
                  done
                    ? "wizard-step-circle--done"
                    : active
                      ? "wizard-step-circle--active"
                      : "wizard-step-circle--inactive"
                }`}
              >
                {done ? <Check size={14} /> : index + 1}
              </div>
              <span
                className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate ${
                  active ? "wizard-step-label--active" : "wizard-step-label--inactive"
                }`}
              >
                {s.label}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={`hidden sm:block wizard-step-divider ${done ? "wizard-step-divider--done" : ""}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {scrapeWarning && step !== "input" && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-300 text-sm">
          {scrapeWarning}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card-base flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                Niche / topic *
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. keto meal prep, email marketing tools"
                className="input-base w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Link2 size={12} />
                Product URL (optional)
              </label>
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://affiliate-product-page.com"
                className="input-base w-full"
              />
              <p className="text-xs text-text-muted">
                We scrape the page for context when suggesting headlines and writing the article.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                Affiliate link (optional)
              </label>
              <input
                type="url"
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                placeholder="https://your-affiliate-link.com"
                className="input-base w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                Extra notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Angle, audience, or key points to cover..."
                className="input-base w-full resize-y"
              />
            </div>

            <button
              type="button"
              onClick={handleInputContinue}
              disabled={loading}
              className="btn-primary w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Analyzing...
                </>
              ) : (
                <>
                  Suggest headlines
                  <Sparkles size={18} />
                </>
              )}
            </button>
          </motion.div>
        )}

        {step === "headlines" && (
          <motion.div
            key="headlines"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-5"
          >
            <div className="card-base flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Pick a headline
                </span>
                <p className="text-sm text-text-secondary mt-1">
                  Niche: <span className="text-text-primary">{niche}</span>
                  {scraped && (
                    <>
                      {" "}
                      · Scraped: <span className="text-text-primary">{scraped.title}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {headlines.map((headline) => (
                  <button
                    key={headline}
                    type="button"
                    onClick={() => {
                      setSelectedHeadline(headline);
                      setCustomHeadline("");
                    }}
                    className={`text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                      selectedHeadline === headline && !customHeadline
                        ? "border-accent bg-accent/10 text-text-primary"
                        : "border-border-dim hover:border-accent/30 text-text-secondary"
                    }`}
                  >
                    {headline}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-border-dim">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Or write your own
                </label>
                <input
                  type="text"
                  value={customHeadline}
                  onChange={(e) => {
                    setCustomHeadline(e.target.value);
                    setSelectedHeadline("");
                  }}
                  placeholder="Custom headline"
                  className="input-base w-full"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => setStep("input")} className="btn-secondary">
                <ArrowLeft size={18} />
                Back
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !resolvedTitle}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Writing article...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Generate article
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === "generate" && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card-base flex flex-col items-center justify-center gap-4 py-16 text-center"
          >
            <Loader2 className="animate-spin text-accent" size={36} />
            <div>
              <p className="brand-font text-xl text-text-primary">Writing your article</p>
              <p className="text-sm text-text-secondary mt-2 max-w-md">
                AI is drafting SEO sections, CTAs, and affiliate placeholders for &ldquo;{resolvedTitle}&rdquo;.
              </p>
            </div>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col gap-5"
          >
            <div className="card-base flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Review draft
                </span>
                <h2 className="brand-font text-xl text-text-primary mt-2">{draftTitle}</h2>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent/10 text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Headline
                </label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="input-base w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                  Article body
                </label>
                <textarea
                  value={articleBody}
                  onChange={(e) => setArticleBody(e.target.value)}
                  rows={16}
                  className="input-base w-full resize-y min-h-[320px] font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setStep("headlines")}
                disabled={loading}
                className="btn-secondary"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Saving draft...
                  </>
                ) : (
                  <>
                    Save & continue to images
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
