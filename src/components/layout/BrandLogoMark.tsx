"use client";

import { getNavIcon } from "@/lib/nav-icons";
import { brand } from "@/config/brand.config";

interface BrandLogoMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const MARK_SIZES = {
  sm: { box: "w-11 h-11 sm:w-12 sm:h-12", px: 48 },
  md: { box: "w-14 h-14 sm:w-16 sm:h-16", px: 64 },
  lg: { box: "w-16 h-16 sm:w-20 sm:h-20", px: 80 },
};

export function BrandLogoMark({ size = "sm", className = "" }: BrandLogoMarkProps) {
  const s = MARK_SIZES[size];

  if (brand.logo.type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brand.logo.src}
        alt={brand.logo.alt}
        width={s.px}
        height={s.px}
        className={`${s.box} object-contain shrink-0 ${className}`}
      />
    );
  }

  const Icon = getNavIcon(brand.logo.icon);
  const iconSize = size === "lg" ? 28 : size === "md" ? 22 : 20;

  return (
    <div
      className={`${s.box} bg-accent flex items-center justify-center rounded-lg shadow-gold shrink-0 ${className}`}
    >
      <Icon size={iconSize} className="text-black" />
    </div>
  );
}
