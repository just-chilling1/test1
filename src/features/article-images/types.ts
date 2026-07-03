export interface Article {
  id: string;
  user_id: string;
  title: string;
  body: string;
  niche: string | null;
  status: string;
  seo_meta: Record<string, unknown>;
  hero_image_url: string | null;
  social_image_url: string | null;
  published_url: string | null;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

export type ArticleImageField = "hero_image_url" | "social_image_url";
