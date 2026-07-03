-- Image Forge — saved generated images library

CREATE TABLE IF NOT EXISTS public.generated_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt text NOT NULL,
    image_url text NOT NULL,
    template_id text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generated_images_user_id_idx ON public.generated_images (user_id);
CREATE INDEX IF NOT EXISTS generated_images_created_at_idx ON public.generated_images (created_at DESC);

ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS generated_images_user_all ON public.generated_images;
CREATE POLICY generated_images_user_all ON public.generated_images
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
