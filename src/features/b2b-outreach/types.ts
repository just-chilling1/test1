export interface Offer {
  id: string;
  name: string;
  niche: string | null;
  description: string;
  payout: string | null;
  commission_type: string | null;
  landing_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  business_name: string;
  contact_name: string | null;
  email: string;
  website: string | null;
  niche: string | null;
  location: string | null;
  allocated_to: string | null;
  allocated_at: string | null;
  used: boolean;
  used_at: string | null;
  created_at: string;
}

export interface SavedEmail {
  id: string;
  user_id: string;
  lead_id: string | null;
  offer_id: string | null;
  subject: string;
  body: string;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  type: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface EmailVariant {
  subject: string;
  body: string;
}
