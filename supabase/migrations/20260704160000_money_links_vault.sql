-- Money Links Vault — saved affiliate links

CREATE TABLE IF NOT EXISTS public.money_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label text NOT NULL,
    url text NOT NULL,
    niche text,
    notes text,
    image_id uuid REFERENCES public.generated_images(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS money_links_user_id_idx ON public.money_links (user_id);
CREATE INDEX IF NOT EXISTS money_links_created_at_idx ON public.money_links (created_at DESC);

ALTER TABLE public.money_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS money_links_user_all ON public.money_links;
CREATE POLICY money_links_user_all ON public.money_links
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
