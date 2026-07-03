"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Scan, Sparkles, TrendingUp } from "lucide-react";
import { brand } from "@/config/brand.config";
import { isFeatureEnabled } from "@/config/features.config";
import { nicheFinderCopy } from "@/features/niche-finder/config/niche-finder.config";
import type { SubNiche } from "@/features/niche-finder/types";
import { clsx } from "clsx";

function DemandBadge({ demand }: { demand: SubNiche["demand"] }) {
  return (
    <span
      className={clsx(
        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
        demand === "High" && "text-green-400 border-green-500/30 bg-green-500/10",
        demand === "Medium" && "text-accent border-accent/30 bg-accent/10",
        demand === "Low" && "text-text-muted border-border-dim bg-surface"
      )}
    >
      {demand} demand
    </span>
  );
}

export default function FindNichePage() {
  const copy = nicheFinderCopy;
  const [topic, setTopic] = useState("");
  const [searchedTopic, setSearchedTopic] = useState("");
  const [niches, setNiches] = useState<SubNiche[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasProductWizard = isFeatureEnabled("product-wizard");

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/find-niche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");

      setSearchedTopic(data.topic || trimmed);
      setNiches(data.niches ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
          {brand.productName} · Find Niche
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">{copy.pageTitle}</h1>
        <p className="text-text-secondary text-sm max-w-2xl">{copy.pageSubtitle}</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSearch}
        className="card-base flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Scan size={18} className="text-accent" />
          </div>
          <div>
            <label htmlFor="topic" className="brand-font text-lg text-text-primary">
              {copy.topicLabel}
            </label>
            <p className="text-sm text-text-secondary">{copy.topicHint}</p>
          </div>
        </div>

        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={copy.topicPlaceholder}
          className="input-base w-full h-12"
        />

        <button type="submit" disabled={loading || !topic.trim()} className="btn-primary w-full sm:w-fit">
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Finding topics...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              {copy.searchButton}
            </>
          )}
        </button>
      </motion.form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <TrendingUp size={18} className="text-accent" />
          <h2 className="brand-font text-xl text-text-primary">{copy.resultsTitle}</h2>
          {searchedTopic && (
            <span className="text-xs text-text-muted">
              for &ldquo;{searchedTopic}&rdquo;
            </span>
          )}
        </div>

        {niches.length === 0 ? (
          <div className="card-base text-center py-12 text-sm text-text-muted">{copy.resultsEmpty}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {niches.map((item, index) => (
              <motion.div
                key={`${item.niche}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="card-base flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="brand-font text-lg text-text-primary leading-snug">{item.niche}</h3>
                  <DemandBadge demand={item.demand} />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    {copy.signalLabel}
                  </span>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.signal}</p>
                </div>

                {hasProductWizard ? (
                  <Link
                    href={`/new?niche=${encodeURIComponent(item.niche)}`}
                    className="btn-primary w-full mt-1"
                  >
                    {copy.createProductCta}
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <p className="text-xs text-text-muted mt-1">{copy.productWizardHint}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
