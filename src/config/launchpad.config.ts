import { brand } from "@/config/brand.config";
import type { FeatureId } from "./features.config";

export interface LaunchpadAction {
  label: string;
  href: string;
  feature?: FeatureId;
}

export interface LaunchpadStep {
  id: string;
  title: string;
  description: string;
  actions: LaunchpadAction[];
}

/** Launch checklist steps — customize copy and module links per product */
export const launchpadSteps: LaunchpadStep[] = [
  {
    id: "connect",
    title: "Connect your affiliate program",
    description: `Sign up for a partner offer and save your tracking link inside ${brand.productName}.`,
    actions: [
      { label: "Open Link Vault", href: "/link-vault", feature: "money-links-vault" },
      { label: "Training", href: "/training", feature: "training" },
    ],
  },
  {
    id: "create",
    title: "Create your content",
    description: `Build visuals, articles, or reply copy that matches your niche using ${brand.productName} tools.`,
    actions: [
      { label: "Image Forge", href: "/image-forge", feature: "image-forge" },
      { label: "Create Article", href: "/create", feature: "article-wizard" },
      { label: "Start Workflow", href: "/search", feature: "core-workflow" },
    ],
  },
  {
    id: "share",
    title: "Share your link",
    description: "Post your affiliate link where your audience already spends time — forums, social, or email.",
    actions: [
      { label: "Create Replies", href: "/replies", feature: "core-workflow" },
      { label: "Copy from Vault", href: "/link-vault", feature: "money-links-vault" },
    ],
  },
  {
    id: "track",
    title: "Track your results",
    description: `Use ${brand.productName} to estimate earnings and refine what you promote next.`,
    actions: [
      { label: "Income Planner", href: "/calculator", feature: "income-calculator" },
      { label: "Home Dashboard", href: "/dashboard" },
    ],
  },
];
