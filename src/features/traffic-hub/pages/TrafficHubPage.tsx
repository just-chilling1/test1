"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { brand } from "@/config/brand.config";
import { isFeatureEnabled } from "@/config/features.config";
import { trafficHubCopy } from "@/features/traffic-hub/config/traffic-hub.config";
import type { OutreachTarget } from "@/features/traffic-hub/types";
import { clsx } from "clsx";

function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border text-text-muted border-border-dim bg-surface">
      {platform}
    </span>
  );
}

export default function TrafficHubPage() {
  const copy = trafficHubCopy;
  const [promotionUrl, setPromotionUrl] = useState("");
  const [niche, setNiche] = useState("");
  const [targets, setTargets] = useState<OutreachTarget[]>([]);
  const [commentsById, setCommentsById] = useState<Record<string, string>>({});
  const [loadingDiscover, setLoadingDiscover] = useState(false);
  const [loadingCommentId, setLoadingCommentId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDiscover = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!niche.trim()) return;

    setLoadingDiscover(true);
    setError(null);

    try {
      const res = await fetch("/api/scrape-urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to find targets");
      setTargets(data.targets ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find targets");
    } finally {
      setLoadingDiscover(false);
    }
  };

  const handleGenerateComment = async (target: OutreachTarget) => {
    setLoadingCommentId(target.id);
    setError(null);

    try {
      const res = await fetch("/api/generate-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: target.title,
          text: target.text,
          niche: niche.trim(),
          promotionUrl: promotionUrl.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate comment");
      setCommentsById((prev) => ({ ...prev, [target.id]: data.comment }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate comment");
    } finally {
      setLoadingCommentId(null);
    }
  };

  const handleCopy = async (targetId: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(targetId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
          {brand.productName} · Traffic Hub
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">{copy.pageTitle}</h1>
        <p className="text-text-secondary text-sm max-w-2xl">{copy.pageSubtitle}</p>
      </div>

      {isFeatureEnabled("wealth-sync") && (
        <p className="text-xs text-text-muted">
          Tip: create bridge pages in{" "}
          <Link href="/bridges" className="text-accent hover:underline">
            My Pages
          </Link>{" "}
          and paste the public URL below.
        </p>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleDiscover}
        className="card-base flex flex-col gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Activity size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="brand-font text-lg text-text-primary">Setup</h2>
            <p className="text-sm text-text-secondary">Choose what to promote and which niche to target.</p>
          </div>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{copy.bridgeLabel}</span>
          <input
            type="url"
            value={promotionUrl}
            onChange={(e) => setPromotionUrl(e.target.value)}
            placeholder={copy.bridgePlaceholder}
            className="input-base w-full"
          />
          <span className="text-xs text-text-muted">{copy.bridgeHint}</span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{copy.nicheLabel}</span>
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder={copy.nichePlaceholder}
            className="input-base w-full"
            required
          />
        </label>

        <button type="submit" disabled={loadingDiscover || !niche.trim()} className="btn-primary w-full sm:w-fit">
          {loadingDiscover ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Finding targets...
            </>
          ) : (
            <>
              <Search size={18} />
              {copy.discoverButton}
            </>
          )}
        </button>
      </motion.form>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="brand-font text-xl text-text-primary">{copy.targetsTitle}</h2>
          {targets.length > 0 && (
            <button
              type="button"
              onClick={() => handleDiscover()}
              disabled={loadingDiscover}
              className="btn-secondary py-2 px-3 text-sm"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          )}
        </div>

        {targets.length === 0 ? (
          <div className="card-base text-center py-12 text-sm text-text-muted">{copy.targetsEmpty}</div>
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
            {targets.map((target, index) => {
              const comment = commentsById[target.id];
              return (
                <motion.article
                  key={target.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="card-base flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <PlatformBadge platform={target.platform} />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-2">{target.title}</h3>
                  <p className="text-xs text-text-secondary line-clamp-3">{target.text}</p>

                  {comment && (
                    <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 text-xs text-text-secondary leading-relaxed">
                      {comment}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleGenerateComment(target)}
                      disabled={loadingCommentId === target.id}
                      className="btn-primary flex-1 py-2 text-xs"
                    >
                      {loadingCommentId === target.id ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          {copy.generateComment}
                        </>
                      )}
                    </button>
                    {comment && (
                      <button
                        type="button"
                        onClick={() => handleCopy(target.id, comment)}
                        className={clsx(
                          "btn-secondary flex-1 py-2 text-xs",
                          copiedId === target.id && "border-green-500/40 text-green-400"
                        )}
                      >
                        {copiedId === target.id ? (
                          <>
                            <Check size={14} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            {copy.copyComment}
                          </>
                        )}
                      </button>
                    )}
                    <a
                      href={target.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary py-2 px-3 text-xs inline-flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={14} />
                      {copy.openTarget}
                    </a>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {!promotionUrl.trim() && targets.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm text-text-secondary">
          <MessageSquare size={18} className="text-accent shrink-0 mt-0.5" />
          <p>Add a promotion URL above so generated comments can include your link.</p>
        </div>
      )}
    </div>
  );
}
