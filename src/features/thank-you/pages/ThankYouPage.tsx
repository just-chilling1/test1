"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, AlertTriangle } from "lucide-react";
import { brand } from "@/config/brand.config";
import { thankYouContent } from "@/config/thank-you.config";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/motion/ScrollReveal";

function StepCta({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  const className =
    "inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-base sm:text-lg transition-all hover:opacity-90 active:scale-[0.98] shadow-lg";
  const style = { backgroundColor: brand.colors.promoCta, color: "#000" };

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {label}
        <ExternalLink size={18} />
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style}>
      {label}
      <ArrowRight size={18} />
    </Link>
  );
}

export function ThankYouPage() {
  const { headline, subheadline, steps, attention, disclaimer } = thankYouContent;

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ backgroundColor: brand.colors.page }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] rounded-full blur-[120px] opacity-30"
          style={{ backgroundColor: brand.colors.primary }}
        />
      </div>

      <ScrollReveal variant="fadeDown" className="relative z-10 flex justify-center pt-8 sm:pt-12 px-4">
        <BrandLogo size="md" />
      </ScrollReveal>

      <main className="relative z-10 flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10 sm:gap-14">
        <ScrollReveal className="text-center flex flex-col gap-4">
          <p
            className="text-sm sm:text-base font-black uppercase tracking-[0.25em]"
            style={{ color: brand.colors.promoAccent }}
          >
            {headline}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            {subheadline}
          </h1>
        </ScrollReveal>

        <ScrollRevealGroup className="flex flex-col gap-6 sm:gap-8">
          {steps.map((step) => (
            <ScrollRevealItem key={step.step}>
              <div className="glass-card p-6 sm:p-8 flex flex-col items-center gap-4 text-center border-white/10">
                <span
                  className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${brand.colors.primary}20`, color: brand.colors.primary }}
                >
                  Step {step.step}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white">{step.title}</h2>
                <StepCta href={step.href} label={step.ctaLabel} external={step.external} />
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealGroup>

        {attention.enabled && (
          <ScrollReveal variant="scale">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 sm:p-8 flex flex-col gap-4 text-center">
              <div className="flex items-center justify-center gap-2 text-amber-300">
                <AlertTriangle size={20} />
                <h3 className="text-lg font-black uppercase tracking-wider">{attention.title}</h3>
              </div>
              <p className="text-sm text-amber-100/90 leading-relaxed">{attention.body}</p>
              <p className="text-sm font-semibold text-white">{attention.signupNote}</p>
              <p className="text-xs text-amber-200/70">{attention.replyNote}</p>
              <StepCta href={attention.ctaUrl} label={attention.ctaLabel} external />
            </div>
          </ScrollReveal>
        )}
      </main>

      {disclaimer.enabled && (
        <ScrollReveal variant="fadeIn" amount={0.3}>
          <footer className="relative z-10 border-t border-white/5 px-4 sm:px-6 py-8 mt-auto">
            <div className="max-w-3xl mx-auto flex flex-col gap-4 text-center">
              <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed">{disclaimer.text}</p>
              <p className="text-[10px] sm:text-xs text-slate-600">{disclaimer.copyright}</p>
            </div>
          </footer>
        </ScrollReveal>
      )}
    </div>
  );
}

export default ThankYouPage;
