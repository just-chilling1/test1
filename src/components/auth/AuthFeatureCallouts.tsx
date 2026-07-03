"use client";

import { Brain, Shield, Zap, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: Brain,
    label: "AI POWERED",
    description: "Intelligent solutions for a smarter future.",
    position: "top-[18%] left-[4%] xl:left-[8%]",
    align: "items-start text-left",
  },
  {
    icon: Shield,
    label: "SECURE",
    description: "Bank-grade security to protect your data.",
    position: "bottom-[22%] left-[4%] xl:left-[8%]",
    align: "items-start text-left",
  },
  {
    icon: Zap,
    label: "REAL-TIME",
    description: "Lightning fast AI at your fingertips.",
    position: "top-[18%] right-[4%] xl:right-[8%]",
    align: "items-end text-right",
  },
  {
    icon: BarChart3,
    label: "GROWTH",
    description: "Scale your business with AI automation.",
    position: "bottom-[22%] right-[4%] xl:right-[8%]",
    align: "items-end text-right",
  },
] as const;

export function AuthFeatureCallouts() {
  return (
    <div className="hidden lg:block absolute inset-0 pointer-events-none">
      {FEATURES.map((feature, i) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
            className={`absolute ${feature.position} max-w-[200px] xl:max-w-[220px] flex flex-col gap-1.5 ${feature.align}`}
          >
            <div className={`flex items-center gap-2 ${feature.align.includes("end") ? "flex-row-reverse" : ""}`}>
              <div className="w-8 h-8 rounded-lg bg-[#00c9a7]/10 border border-[#00c9a7]/20 flex items-center justify-center">
                <Icon size={16} className="text-[#00f2ff]" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#00c9a7]">
                {feature.label}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#00f2ff]/70">{feature.description}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
