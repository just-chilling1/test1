import { brand } from "@/config/brand.config";

/** CSS custom properties derived from brand.config — inject via BrandStyleProvider */
export function getBrandCssVars(): Record<string, string> {
  return {
    "--bg-page": brand.colors.page,
    "--bg-sidebar": brand.colors.sidebar,
    "--bg-panel": brand.colors.panel,
    "--bg-border": "#1C2540",
    "--bg-glass": "rgba(19, 26, 42, 0.8)",
    "--brand-primary": brand.colors.primary,
    "--brand-secondary": brand.colors.secondary,
    "--brand-accent": brand.colors.accent,
    "--brand-tint": `${brand.colors.primary}1a`,
    "--promo-accent": brand.colors.promoAccent,
    "--promo-cta": brand.colors.promoCta,
    "--text-primary": brand.colors.text,
    "--text-secondary": brand.colors.muted,
    "--text-muted": brand.colors.muted,
  };
}

export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
