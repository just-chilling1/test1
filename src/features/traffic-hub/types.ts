export interface OutreachTarget {
  id: string;
  platform: string;
  title: string;
  text: string;
  url: string;
}

export interface BridgeOption {
  id: string;
  title: string;
  url: string;
  niche: string | null;
}
