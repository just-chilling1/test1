"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { scaleTrainingContent } from "@/config/scale-training.config";

export default function ScaleTrainingPage() {
    const { badge, headline, subheadline, videoId, benefits, ctaLabel, ctaUrl } =
        scaleTrainingContent;

    return (
        <div className="flex flex-col gap-10 pb-10 max-w-3xl mx-auto w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center text-center gap-6"
            >
                <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-5 py-2">
                    <Sparkles size={14} className="text-accent" />
                    <span className="text-xs font-bold text-accent uppercase tracking-[0.15em]">{badge}</span>
                </div>

                <h1 className="brand-font text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                    {headline}
                </h1>

                <p className="text-text-secondary text-base md:text-lg max-w-xl">
                    {subheadline}
                </p>
            </motion.div>

            {/* Video embed */}
            {videoId && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl overflow-hidden border border-border-dim bg-black"
                >
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        <iframe
                            src={`https://player.vimeo.com/video/${videoId}?badge=0&autopause=0`}
                            className="absolute inset-0 w-full h-full"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title="Scale Training"
                        />
                    </div>
                </motion.div>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
                <motion.ul
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex flex-col gap-3 max-w-xl mx-auto w-full"
                >
                    {benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <span className="mt-0.5 w-5 h-5 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
                                <Check size={12} className="text-accent" strokeWidth={3} />
                            </span>
                            <span className="text-sm text-text-secondary leading-relaxed">{benefit}</span>
                        </li>
                    ))}
                </motion.ul>
            )}

            {/* CTA Button */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center"
            >
                <a
                    href={ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center gap-3 bg-accent hover:bg-yellow-500 text-black font-bold text-lg px-10 py-5 rounded-xl transition-all shadow-gold hover:shadow-[0_0_40px_rgba(234,179,8,0.3)]"
                >
                    <span className="brand-font tracking-wide">{ctaLabel}</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
            </motion.div>
        </div>
    );
}
