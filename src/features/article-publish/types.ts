export interface SeoMeta {
  title?: string;
  description?: string;
  tags?: string[];
}

export interface Article {
  id: string;
  user_id: string;
  title: string;
  body: string;
  niche: string | null;
  status: string;
  seo_meta: SeoMeta;
  hero_image_url: string | null;
  social_image_url: string | null;
  published_url: string | null;
  slug: string | null;
  created_at: string;
  updated_at: string;
}
