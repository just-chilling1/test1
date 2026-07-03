"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ClipboardCopy, Loader2, Save, Sparkles } from "lucide-react";
import { brand } from "@/config/brand.config";
import { getActiveOfferId } from "@/features/b2b-outreach/lib/active-offer";
import type { EmailVariant, Lead, Offer } from "@/features/b2b-outreach/types";

export default function EmailBuilderPage() {
  const searchParams = useSearchParams();
  const initialLeadId = searchParams.get("leadId") ?? "";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [leadId, setLeadId] = useState(initialLeadId);
  const [offerId, setOfferId] = useState("");
  const [variants, setVariants] = useState<EmailVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [leadsRes, offersRes] = await Promise.all([
        fetch("/api/leads?scope=mine"),
        fetch("/api/offers"),
      ]);
      const leadsData = await leadsRes.json();
      const offersData = await offersRes.json();
      if (!leadsRes.ok) throw new Error(leadsData.error || "Failed to load leads");
      if (!offersRes.ok) throw new Error(offersData.error || "Failed to load offers");

      setLeads(leadsData.leads ?? []);
      setOffers(offersData.offers ?? []);

      const active = getActiveOfferId();
      if (active && (offersData.offers ?? []).some((o: Offer) => o.id === active)) {
        setOfferId(active);
      } else if ((offersData.offers ?? []).length > 0) {
        setOfferId(offersData.offers[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerate = async () => {
    if (!leadId || !offerId) {
      setError("Pick a lead and an offer");
      return;
    }
    setGenerating(true);
    setError(null);
    setVariants([]);
    setSavedIndex(null);
    try {
      const res = await fetch("/api/emails/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, offerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate emails");
      setVariants(data.variants ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate emails");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (variant: EmailVariant, index: number) => {
    setSavingIndex(index);
    setError(null);
    try {
      const res = await fetch("/api/emails/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: variant.subject,
          body: variant.body,
          leadId,
          offerId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save email");

      await fetch("/api/leads/mark-used", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId }),
      }).catch(() => {});

      setSavedIndex(index);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save email");
    } finally {
      setSavingIndex(null);
    }
  };

  const handleCopy = async (variant: EmailVariant, index: number) => {
    try {
      await navigator.clipboard.writeText(`${variant.subject}\n\n${variant.body}`);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
          {brand.productName} · Outreach
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Email builder</h1>
        <p className="text-text-secondary text-sm max-w-2xl">
          Pick a lead and offer, then generate three personalized cold email variants.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh] text-text-muted gap-3">
          <Loader2 className="animate-spin" size={22} />
          <span>Loading...</span>
        </div>
      ) : (
        <>
          <div className="card-base flex flex-col gap-4">
            {leads.length === 0 ? (
              <p className="text-sm text-text-secondary">
                No allocated leads yet.{" "}
                <Link href="/leads" className="text-accent underline">
                  Allocate leads
                </Link>{" "}
                first.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Lead</label>
                <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className="input-base w-full">
                  <option value="">Select a lead...</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.business_name} — {lead.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {offers.length === 0 ? (
              <p className="text-sm text-text-secondary">
                No offers yet.{" "}
                <Link href="/offers" className="text-accent underline">
                  Generate offers
                </Link>{" "}
                first.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Offer</label>
                <select value={offerId} onChange={(e) => setOfferId(e.target.value)} className="input-base w-full">
                  <option value="">Select an offer...</option>
                  {offers.map((offer) => (
                    <option key={offer.id} value={offer.id}>
                      {offer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !leadId || !offerId}
              className="btn-primary w-full sm:w-auto"
            >
              {generating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate 3 variants
                </>
              )}
            </button>
          </div>

          {variants.map((variant, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-base flex flex-col gap-3"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                Variant {index + 1}
              </span>
              <input
                type="text"
                value={variant.subject}
                onChange={(e) =>
                  setVariants((prev) =>
                    prev.map((v, i) => (i === index ? { ...v, subject: e.target.value } : v))
                  )
                }
                className="input-base w-full font-semibold"
              />
              <textarea
                value={variant.body}
                onChange={(e) =>
                  setVariants((prev) =>
                    prev.map((v, i) => (i === index ? { ...v, body: e.target.value } : v))
                  )
                }
                rows={8}
                className="input-base w-full resize-y"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleSave(variant, index)}
                  disabled={savingIndex === index}
                  className="btn-primary"
                >
                  {savingIndex === index ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : savedIndex === index ? (
                    <>
                      <Check size={16} />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save template
                    </>
                  )}
                </button>
                <button type="button" onClick={() => handleCopy(variant, index)} className="btn-secondary">
                  {copiedIndex === index ? <Check size={16} /> : <ClipboardCopy size={16} />}
                  {copiedIndex === index ? "Copied" : "Copy"}
                </button>
              </div>
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
}
