import type { ImageForgeTemplate } from "../types";

/** Prompt templates — customize per product in this file */
export const imageForgeTemplates: ImageForgeTemplate[] = [
  {
    id: "social-post",
    label: "Social Post",
    description: "Square share image",
    promptPrefix: "Square social media marketing image, eye-catching, no text overlay: ",
  },
  {
    id: "product-ad",
    label: "Product Ad",
    description: "Clean product promo",
    promptPrefix: "Professional product advertisement photo, studio lighting, no text: ",
  },
  {
    id: "blog-hero",
    label: "Blog Hero",
    description: "Wide header visual",
    promptPrefix: "Wide blog hero image, modern and clean, no text overlay: ",
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    description: "Authentic scene",
    promptPrefix: "Authentic lifestyle marketing photo, natural lighting, no text: ",
  },
];
