-- Slug + public read for article-publish hosted pages
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS articles_slug_unique_idx
    ON public.articles (slug)
    WHERE slug IS NOT NULL;

DROP POLICY IF EXISTS articles_public_read ON public.articles;
CREATE POLICY articles_public_read ON public.articles
    FOR SELECT
    USING (status = 'published' AND slug IS NOT NULL);
