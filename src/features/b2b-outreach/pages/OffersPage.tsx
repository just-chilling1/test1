"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles, Star, Tag } from "lucide-react";
import { brand } from "@/config/brand.config";
import { getActiveOfferId, setActiveOfferId } from "@/features/b2b-outreach/lib/active-offer";
import type { Offer } from "@/features/b2b-outreach/types";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/offers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load offers");
      setOffers(data.offers ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setActiveId(getActiveOfferId());
    loadOffers();
  }, [loadOffers]);

  const handleSetActive = (id: string) => {
    setActiveOfferId(id);
    setActiveId(id);
  };

  const handleGenerate = async () => {
    if (!niche.trim()) {
      setError("Enter a niche to generate offers");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/offers/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate offers");
      setNiche("");
      await loadOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate offers");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
          {brand.productName} · Outreach
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Offer library</h1>
        <p className="text-text-secondary text-sm max-w-2xl">
          Set your active offer, then head to Leads and the Email Builder to pitch it.
        </p>
      </div>

      <div className="card-base flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
            Generate offers for a niche
          </label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. dental clinics, SaaS tools"
            className="input-base w-full"
          />
        </div>
        <button type="button" onClick={handleGenerate} disabled={generating} className="btn-primary shrink-0">
          {generating ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh] text-text-muted gap-3">
          <Loader2 className="animate-spin" size={22} />
          <span>Loading offers...</span>
        </div>
      ) : offers.length === 0 ? (
        <div className="card-base text-center text-text-secondary text-sm py-12">
          No offers yet. Generate a batch for your niche above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer) => {
            const isActive = offer.id === activeId;
            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card-base flex flex-col gap-3 ${isActive ? "border border-accent/40" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="brand-font text-lg text-text-primary">{offer.name}</h3>
                  {offer.payout && (
                    <span className="text-xs font-bold text-accent whitespace-nowrap">{offer.payout}</span>
                  )}
                </div>
                <p className="text-sm text-text-secondary">{offer.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {offer.niche && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/5 text-text-muted flex items-center gap-1">
                      <Tag size={10} />
                      {offer.niche}
                    </span>
                  )}
                  {offer.commission_type && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/5 text-text-muted">
                      {offer.commission_type}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleSetActive(offer.id)}
                  className={isActive ? "btn-secondary w-full" : "btn-primary w-full"}
                >
                  {isActive ? (
                    <>
                      <Check size={16} />
                      Active offer
                    </>
                  ) : (
                    <>
                      <Star size={16} />
                      Set active
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
