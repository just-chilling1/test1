-- Core workflow tables (search → analysis → radar → replies)

CREATE TABLE IF NOT EXISTS public.keyword_variations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_keyword text NOT NULL,
    variations jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS keyword_variations_parent_keyword_idx
    ON public.keyword_variations (parent_keyword);
CREATE INDEX IF NOT EXISTS keyword_variations_user_id_idx
    ON public.keyword_variations (user_id);

CREATE TABLE IF NOT EXISTS public.search_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    keyword text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS search_history_user_id_idx ON public.search_history (user_id);
CREATE INDEX IF NOT EXISTS search_history_created_at_idx ON public.search_history (created_at DESC);

CREATE TABLE IF NOT EXISTS public.analysis_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    keyword text NOT NULL,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analysis_results_user_id_idx ON public.analysis_results (user_id);
CREATE INDEX IF NOT EXISTS analysis_results_keyword_idx ON public.analysis_results (keyword);

CREATE TABLE IF NOT EXISTS public.saved_keywords (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    keyword text NOT NULL,
    label text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS saved_keywords_user_id_idx ON public.saved_keywords (user_id);

CREATE TABLE IF NOT EXISTS public.saved_replies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id text,
    post_text text,
    reply_text text NOT NULL,
    affiliate_link text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS saved_replies_user_id_idx ON public.saved_replies (user_id);

ALTER TABLE public.keyword_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS keyword_variations_user_all ON public.keyword_variations;
CREATE POLICY keyword_variations_user_all ON public.keyword_variations
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS search_history_user_all ON public.search_history;
CREATE POLICY search_history_user_all ON public.search_history
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS analysis_results_user_all ON public.analysis_results;
CREATE POLICY analysis_results_user_all ON public.analysis_results
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS saved_keywords_user_all ON public.saved_keywords;
CREATE POLICY saved_keywords_user_all ON public.saved_keywords
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS saved_replies_user_all ON public.saved_replies;
CREATE POLICY saved_replies_user_all ON public.saved_replies
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
