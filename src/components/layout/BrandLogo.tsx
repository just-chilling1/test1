"use client";

import { brand } from "@/config/brand.config";
import { BrandLogoMark } from "./BrandLogoMark";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  /** Hide tagline and use smaller title on narrow headers */
  compact?: boolean;
}

const SIZES = {
  sm: {
    title: "text-base sm:text-[18px] lg:text-[22px]",
    tagline: "text-[9px] sm:text-[10px]",
  },
  md: {
    title: "text-lg sm:text-[22px]",
    tagline: "text-[10px]",
  },
  lg: {
    title: "text-xl sm:text-[28px] lg:text-[32px]",
    tagline: "text-xs sm:text-sm",
  },
};

export function BrandLogo({ size = "sm", showTagline = true, compact = false }: BrandLogoProps) {
  const s = SIZES[size];

  return (
    <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
      <BrandLogoMark size={size} />
      <div className="flex flex-col min-w-0">
        <span
          className={`brand-font ${compact ? "text-sm sm:text-base" : s.title} text-text-primary tracking-tight leading-tight truncate`}
        >
          {brand.productName}
        </span>
        {showTagline && !compact && (
          <span className={`${s.tagline} font-bold text-text-muted mt-0.5 sm:mt-1 truncate`}>
            {brand.tagline}
          </span>
        )}
      </div>
    </div>
  );
}
