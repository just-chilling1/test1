import { callChatGPT } from "@/features/core-workflow/lib/llm";
import type { SubNiche } from "../types";

function normalizeDemand(value: string): SubNiche["demand"] {
  const lower = value.toLowerCase();
  if (lower.includes("high")) return "High";
  if (lower.includes("low")) return "Low";
  return "Medium";
}

function fallbackSubNiches(topic: string): SubNiche[] {
  const base = topic.trim() || "your market";
  return [
    {
      niche: `${base} for beginners`,
      signal: "Beginners actively search for step-by-step guides and starter kits.",
      demand: "High",
    },
    {
      niche: `${base} on a budget`,
      signal: "Price-sensitive buyers compare affordable options before purchasing.",
      demand: "Medium",
    },
    {
      niche: `${base} for busy professionals`,
      signal: "Time-saving solutions convert well for people with limited hours.",
      demand: "High",
    },
    {
      niche: `${base} tools and templates`,
      signal: "Done-for-you resources sell consistently in problem-aware niches.",
      demand: "Medium",
    },
    {
      niche: `${base} mistakes to avoid`,
      signal: "Pain-point content attracts buyers looking for trusted shortcuts.",
      demand: "Low",
    },
  ];
}

export async function findSubNiches(topic: string): Promise<SubNiche[]> {
  const trimmed = topic.trim();
  if (!trimmed) return [];

  const prompt = `You are a digital product niche researcher. Given the broad topic "${trimmed}", return 6-8 specific smaller topics (sub-niches) someone could build an ebook or course around.

For each sub-niche include:
- niche: a specific, searchable sub-topic name
- signal: one sentence on why buyers spend money here
- demand: exactly "High", "Medium", or "Low"

Return ONLY a JSON array. Example:
[{"niche":"...","signal":"...","demand":"High"}]`;

  try {
    const result = await callChatGPT([{ role: "user", content: prompt }]);
    const cleaned = result.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as SubNiche[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return fallbackSubNiches(trimmed);
    }

    return parsed
      .filter((item) => item?.niche && item?.signal)
      .map((item) => ({
        niche: String(item.niche).trim(),
        signal: String(item.signal).trim(),
        demand: normalizeDemand(String(item.demand || "Medium")),
      }));
  } catch {
    return fallbackSubNiches(trimmed);
  }
}
