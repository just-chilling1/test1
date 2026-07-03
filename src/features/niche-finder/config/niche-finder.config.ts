import { brand } from "@/config/brand.config";

/** UI copy — use "topic" / "smaller topic" terminology per client preference */
export const nicheFinderCopy = {
  pageTitle: "Find your niche",
  pageSubtitle: `Discover profitable smaller topics inside a broad topic, then launch a digital product with ${brand.productName}.`,
  topicLabel: "Broad topic",
  topicPlaceholder: 'e.g. "fitness", "parenting", "side hustles"',
  topicHint: "Start with a general market you want to explore.",
  searchButton: "Find smaller topics",
  resultsTitle: "Smaller topics to explore",
  resultsEmpty: "Enter a broad topic above to get AI-powered sub-niche ideas.",
  signalLabel: "Why it works",
  demandLabel: "Demand",
  createProductCta: "Create product",
  productWizardHint: "Opens the product wizard with this niche pre-filled.",
} as const;
