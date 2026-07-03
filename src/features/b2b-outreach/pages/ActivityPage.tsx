"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Loader2 } from "lucide-react";
import { brand } from "@/config/brand.config";
import type { UserActivity } from "@/features/b2b-outreach/types";

export default function ActivityPage() {
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/activity");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load activity");
      setActivity(data.activity ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
          {brand.productName} · Outreach
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Activity log</h1>
        <p className="text-text-secondary text-sm max-w-2xl">
          A record of leads allocated, emails saved, and outreach actions.
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
          <span>Loading activity...</span>
        </div>
      ) : activity.length === 0 ? (
        <div className="card-base text-center text-text-secondary text-sm py-12">
          No activity yet. Allocate leads or save an email to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activity.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-base flex items-center gap-4 py-4"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Activity size={18} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">{item.description}</p>
                <span className="text-[10px] uppercase tracking-wider text-text-muted">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
