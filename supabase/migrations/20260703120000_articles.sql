-- Articles table (shared by article-wizard, article-images, article-publish, portfolio)
CREATE TABLE IF NOT EXISTS public.articles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL DEFAULT '',
    body text NOT NULL DEFAULT '',
    niche text,
    status text NOT NULL DEFAULT 'draft',
    seo_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
    hero_image_url text,
    social_image_url text,
    published_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS articles_user_id_idx ON public.articles (user_id);
CREATE INDEX IF NOT EXISTS articles_status_idx ON public.articles (status);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS articles_user_all ON public.articles;
CREATE POLICY articles_user_all ON public.articles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
