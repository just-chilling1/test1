-- b2b-outreach: offers library, lead pool, saved emails, activity log
-- Offers and leads are shared pools seeded per client niche.
-- saved_emails and user_activity are per-user (RLS scoped).

-- ─── Offers ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.offers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    niche text,
    description text NOT NULL DEFAULT '',
    payout text,
    commission_type text,
    landing_url text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS offers_niche_idx ON public.offers (niche);
CREATE INDEX IF NOT EXISTS offers_is_active_idx ON public.offers (is_active);

-- ─── Leads ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name text NOT NULL,
    contact_name text,
    email text NOT NULL,
    website text,
    niche text,
    location text,
    -- null = in the shared pool; set = allocated to a user
    allocated_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    allocated_at timestamptz,
    used boolean NOT NULL DEFAULT false,
    used_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_niche_idx ON public.leads (niche);
CREATE INDEX IF NOT EXISTS leads_allocated_to_idx ON public.leads (allocated_to);
CREATE INDEX IF NOT EXISTS leads_used_idx ON public.leads (used);

-- ─── Saved emails ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_emails (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
    offer_id uuid REFERENCES public.offers(id) ON DELETE SET NULL,
    subject text NOT NULL DEFAULT '',
    body text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS saved_emails_user_id_idx ON public.saved_emails (user_id);

-- ─── User activity log ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_activity (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    description text NOT NULL DEFAULT '',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_activity_user_id_idx ON public.user_activity (user_id);

-- ─── RLS ─────────────────────────────────────────────────────────────
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Offers: readable by any authenticated user; writes via service role only.
DROP POLICY IF EXISTS offers_read ON public.offers;
CREATE POLICY offers_read ON public.offers
    FOR SELECT
    TO authenticated
    USING (true);

-- Leads: a user can read pool leads or their own; allocation is done via service role.
DROP POLICY IF EXISTS leads_read ON public.leads;
CREATE POLICY leads_read ON public.leads
    FOR SELECT
    TO authenticated
    USING (allocated_to IS NULL OR allocated_to = auth.uid());

DROP POLICY IF EXISTS leads_update_own ON public.leads;
CREATE POLICY leads_update_own ON public.leads
    FOR UPDATE
    TO authenticated
    USING (allocated_to = auth.uid())
    WITH CHECK (allocated_to = auth.uid());

-- Saved emails: per-user.
DROP POLICY IF EXISTS saved_emails_user_all ON public.saved_emails;
CREATE POLICY saved_emails_user_all ON public.saved_emails
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Activity: per-user.
DROP POLICY IF EXISTS user_activity_user_all ON public.user_activity;
CREATE POLICY user_activity_user_all ON public.user_activity
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
