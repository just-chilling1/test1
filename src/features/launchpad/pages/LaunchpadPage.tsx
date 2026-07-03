"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Circle, Rocket } from "lucide-react";
import { brand } from "@/config/brand.config";
import { isFeatureEnabled } from "@/config/features.config";
import { launchpadSteps } from "@/config/launchpad.config";
import { storageKeys } from "@/lib/storage-keys";
import { clsx } from "clsx";

function loadCompleted(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(storageKeys.launchpadCompleted);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveCompleted(completed: Set<string>) {
  localStorage.setItem(storageKeys.launchpadCompleted, JSON.stringify([...completed]));
}

export default function LaunchpadPage() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCompleted(loadCompleted());
    setHydrated(true);
  }, []);

  const progress = useMemo(() => {
    if (launchpadSteps.length === 0) return 0;
    return Math.round((completed.size / launchpadSteps.length) * 100);
  }, [completed]);

  const toggleStep = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveCompleted(next);
      return next;
    });
  };

  const resetProgress = () => {
    const next = new Set<string>();
    setCompleted(next);
    saveCompleted(next);
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-text-muted text-sm">
        Loading checklist...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
          {brand.productName} · Launchpad
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Your launch checklist</h1>
        <p className="text-text-secondary text-sm max-w-2xl">
          Follow these steps to connect an offer, create content, share your link, and track progress.
        </p>
      </div>

      <div className="card-base flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Rocket size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">
                {completed.size} of {launchpadSteps.length} complete
              </p>
              <p className="text-xs text-text-muted">{progress}% launch progress</p>
            </div>
          </div>
          {completed.size > 0 && (
            <button type="button" onClick={resetProgress} className="text-xs text-text-muted hover:text-accent">
              Reset
            </button>
          )}
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-border-dim/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-accent rounded-full"
          />
        </div>
      </div>

      <ol className="flex flex-col gap-4">
        {launchpadSteps.map((step, index) => {
          const done = completed.has(step.id);
          const visibleActions = step.actions.filter(
            (action) => !action.feature || isFeatureEnabled(action.feature)
          );

          return (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={clsx(
                "card-base flex flex-col gap-4 transition-colors",
                done && "border-accent/30 bg-accent/5"
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggleStep(step.id)}
                  aria-label={done ? `Mark step ${index + 1} incomplete` : `Mark step ${index + 1} complete`}
                  className={clsx(
                    "mt-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                    done
                      ? "bg-accent border-accent text-black"
                      : "border-border-dim text-text-muted hover:border-accent/50"
                  )}
                >
                  {done ? <Check size={16} strokeWidth={3} /> : <Circle size={14} />}
                </button>
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                      Step {index + 1}
                    </span>
                    {done && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                        Complete
                      </span>
                    )}
                  </div>
                  <h2 className="brand-font text-lg text-text-primary">{step.title}</h2>
                  <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
                </div>
              </div>

              {visibleActions.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-12">
                  {visibleActions.map((action) => (
                    <Link
                      key={`${step.id}-${action.href}-${action.label}`}
                      href={action.href}
                      className="btn-secondary py-2 px-4 text-xs"
                    >
                      {action.label}
                      <ArrowRight size={14} />
                    </Link>
                  ))}
                </div>
              )}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
