import { callChatGPT } from "@/features/core-workflow/lib/llm";

export async function generateOutreachComment(
  targetTitle: string,
  targetText: string,
  niche: string,
  promotionUrl: string
): Promise<string> {
  const prompt = `Write one natural, helpful forum comment for this discussion.

Topic/niche: ${niche}
Thread title: ${targetTitle}
Thread excerpt: ${targetText.slice(0, 400)}
Link to include naturally (only once): ${promotionUrl || "NONE"}

Rules:
- Sound like a real person sharing a useful resource
- 2-4 sentences max
- Include the link only if provided
- No prefixes like "Comment:" or "Reply:"
- Return ONLY the comment text`;

  const result = await callChatGPT([{ role: "user", content: prompt }]);
  return result.trim().replace(/^["']|["']$/g, "");
}
