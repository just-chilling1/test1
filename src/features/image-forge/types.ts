export interface GeneratedImage {
  id: string;
  user_id: string;
  prompt: string;
  image_url: string;
  template_id: string | null;
  created_at: string;
}

export interface ImageForgeTemplate {
  id: string;
  label: string;
  promptPrefix: string;
  description: string;
}
