import { brand } from "./brand.config";

/**
 * Scale-training upsell sales page (feature: scale-upsell).
 * Set the client checkout URL and (optional) Vimeo VSL id before launch.
 * No in-app purchase — the CTA links to an external checkout (Digistore24, etc.).
 */
export const scaleTrainingContent = {
  badge: "Exclusive Training",
  headline: `Scale Your ${brand.productName} To $1,000+ Per Day`,
  subheadline:
    "Watch this exclusive training to multiply your results and automate your path to life-changing income.",
  /** Vimeo video id for the VSL — leave empty to hide the player */
  videoId: "",
  benefits: [
    "The exact system to scale past your first wins",
    "How to automate the repetitive work",
    "Advanced strategies used by top members",
    "Step-by-step walkthrough you can follow today",
  ],
  ctaLabel: "Click Here To Access Training",
  /** Client checkout / sales URL — replace with the real offer link before launch */
  ctaUrl: "https://example.com/scale-training",
} as const;
