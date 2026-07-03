import { brand } from "@/config/brand.config";

/** Traffic Hub UI copy — customize nav label in navigation.config.ts */
export const trafficHubCopy = {
  pageTitle: "Get visitors to your page",
  pageSubtitle: `Pick a promotion URL and niche, find places to comment, and drive traffic with ${brand.productName}.`,
  bridgeLabel: "Promotion URL",
  bridgePlaceholder: "https://your-bridge-page.com/review/...",
  bridgeHint: "Paste the page you want people to visit (bridge page, article, or affiliate link).",
  nicheLabel: "Niche / topic",
  nichePlaceholder: 'e.g. "weight loss tips", "home office setup"',
  discoverButton: "Find promotion targets",
  targetsTitle: "Promotion targets",
  targetsEmpty: "Enter a niche and click Find promotion targets to discover forums and Q&A threads.",
  generateComment: "Generate comment",
  copyComment: "Copy comment",
  openTarget: "Open thread",
} as const;
