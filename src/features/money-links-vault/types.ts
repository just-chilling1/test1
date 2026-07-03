export interface MoneyLink {
  id: string;
  user_id: string;
  label: string;
  url: string;
  niche: string | null;
  notes: string | null;
  image_id: string | null;
  created_at: string;
  updated_at: string;
  generated_images?: { image_url: string } | null;
}

export interface MoneyLinkForm {
  label: string;
  url: string;
  niche: string;
  notes: string;
  imageId: string | null;
}

export const emptyLinkForm: MoneyLinkForm = {
  label: "",
  url: "",
  niche: "",
  notes: "",
  imageId: null,
};
