"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ClipboardCopy, Loader2 } from "lucide-react";
import { brand } from "@/config/brand.config";
import type { SavedEmail } from "@/features/b2b-outreach/types";

export default function SavedEmailsPage() {
  const [emails, setEmails] = useState<SavedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/emails/save");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load saved emails");
      setEmails(data.emails ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load saved emails");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  const handleCopy = async (email: SavedEmail) => {
    try {
      await navigator.clipboard.writeText(`${email.subject}\n\n${email.body}`);
      setCopiedId(email.id);
      setTimeout(() => setCopiedId(null), 2000);
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
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Saved emails</h1>
        <p className="text-text-secondary text-sm max-w-2xl">
          Your saved outreach templates. Copy and send from your email client.
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
          <span>Loading templates...</span>
        </div>
      ) : emails.length === 0 ? (
        <div className="card-base text-center text-text-secondary text-sm py-12">
          No saved templates yet. Build one in the{" "}
          <Link href="/email-builder" className="text-accent underline">
            Email Builder
          </Link>
          .
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {emails.map((email) => (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-base flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="brand-font text-lg text-text-primary">{email.subject || "(no subject)"}</h3>
                <button type="button" onClick={() => handleCopy(email)} className="btn-secondary shrink-0">
                  {copiedId === email.id ? <Check size={16} /> : <ClipboardCopy size={16} />}
                  {copiedId === email.id ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{email.body}</p>
              <span className="text-[10px] uppercase tracking-wider text-text-muted">
                {new Date(email.created_at).toLocaleDateString()}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
