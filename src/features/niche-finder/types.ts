export interface SubNiche {
  niche: string;
  signal: string;
  demand: "High" | "Medium" | "Low";
}

export type SubNicheResult = SubNiche[];
