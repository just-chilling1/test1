"use client";

import { brand } from "@/config/brand.config";
import { BrandLogoMark } from "@/components/layout/BrandLogoMark";

export function AuthBrandHeader() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <BrandLogoMark size="lg" />
      <span className="brand-font text-xl sm:text-2xl font-bold text-white tracking-tight leading-none">
        {brand.productName}
      </span>
    </div>
  );
}
