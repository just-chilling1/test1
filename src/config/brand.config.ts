type BrandLogo =
  | { type: "image"; src: string; alt: string }
  | { type: "icon"; icon: string };

export const brand = {
  /** Software display name — set via NEXT_PUBLIC_PRODUCT_NAME in .env */
  productName: process.env.NEXT_PUBLIC_PRODUCT_NAME ?? "NovaAI",
  storagePrefix: "novaai",
  tagline: "AI-Powered Platform",
  authTagline: "Secure member access",
  signupTagline: "Create your account",
  logo: {
    type: "image",
    src: "/logo.png",
    alt: "NovaAI",
  } as BrandLogo,
  colors: {
    primary: "#00D084",
    secondary: "#22D3EE",
    accent: "#8B5CF6",
    promoAccent: "#8B5CF6",
    promoCta: "#00D084",
    page: "#080A12",
    sidebar: "#131A2A",
    panel: "#131A2A",
    authPage: "#080A12",
    text: "#FFFFFF",
    muted: "#A5B4C7",
  },
  fonts: {
    brand: "Plus Jakarta Sans",
    ui: "Inter",
  },
  get metadata() {
    const name = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? "NovaAI";
    return {
      title: `${name} | AI-Powered Platform`,
      description: "NovaAI — your AI-powered platform for smarter workflows.",
    };
  },
} as const;

export type BrandConfig = typeof brand;
