"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Globe, Loader2, Mail, MapPin, Plus } from "lucide-react";
import { brand } from "@/config/brand.config";
import type { Lead } from "@/features/b2b-outreach/types";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [niche, setNiche] = useState("");
  const [batchSize, setBatchSize] = useState(5);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads?scope=mine");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load leads");
      setLeads(data.leads ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleAllocate = async () => {
    setAllocating(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/leads/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), batchSize }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to allocate leads");
      if (data.allocated === 0) {
        setNotice("No unallocated leads left in the pool for that filter.");
      } else {
        setNotice(`Allocated ${data.allocated} new lead${data.allocated === 1 ? "" : "s"}.`);
      }
      await loadLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to allocate leads");
    } finally {
      setAllocating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
          {brand.productName} · Outreach
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Lead finder</h1>
        <p className="text-text-secondary text-sm max-w-2xl">
          Allocate a batch of business leads from the shared pool, then build emails for them.
        </p>
      </div>

      <div className="card-base flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
            Niche filter (optional)
          </label>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. dental clinics"
            className="input-base w-full"
          />
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-32">
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Batch</label>
          <input
            type="number"
            min={1}
            max={25}
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="input-base w-full"
          />
        </div>
        <button type="button" onClick={handleAllocate} disabled={allocating} className="btn-primary shrink-0">
          {allocating ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Allocating...
            </>
          ) : (
            <>
              <Plus size={18} />
              Allocate leads
            </>
          )}
        </button>
      </div>

      {notice && (
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-accent text-sm">{notice}</div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh] text-text-muted gap-3">
          <Loader2 className="animate-spin" size={22} />
          <span>Loading leads...</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="card-base text-center text-text-secondary text-sm py-12">
          No leads yet. Allocate a batch from the pool above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leads.map((lead) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-base flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="brand-font text-lg text-text-primary flex items-center gap-2">
                  <Building2 size={16} className="text-accent" />
                  {lead.business_name}
                </h3>
                {lead.used && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300">
                    Used
                  </span>
                )}
              </div>
              {lead.contact_name && <p className="text-sm text-text-secondary">{lead.contact_name}</p>}
              <p className="text-sm text-text-secondary flex items-center gap-2">
                <Mail size={14} className="text-text-muted" />
                {lead.email}
              </p>
              {lead.website && (
                <p className="text-sm text-text-secondary flex items-center gap-2">
                  <Globe size={14} className="text-text-muted" />
                  {lead.website}
                </p>
              )}
              {lead.location && (
                <p className="text-sm text-text-secondary flex items-center gap-2">
                  <MapPin size={14} className="text-text-muted" />
                  {lead.location}
                </p>
              )}
              <Link href={`/email-builder?leadId=${lead.id}`} className="btn-secondary w-full mt-2">
                Build email
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
