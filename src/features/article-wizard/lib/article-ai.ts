import { callChatGPT } from "@/features/core-workflow/lib/llm";
import type { ScrapedLinkContext } from "@/features/article-wizard/lib/scrape-link";
import { formatScrapedContext } from "@/features/article-wizard/lib/scrape-link";

function parseJsonArray(raw: string): string[] {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("Expected JSON array");
  return parsed.map((item) => String(item).trim()).filter(Boolean);
}

function buildContextBlock(scraped?: ScrapedLinkContext | null, notes?: string): string {
  const parts: string[] = [];
  if (scraped) parts.push(formatScrapedContext(scraped));
  if (notes?.trim()) parts.push(`Additional notes: ${notes.trim()}`);
  return parts.length ? `\n\nContext:\n${parts.join("\n")}` : "";
}

export async function suggestHeadlines(
  niche: string,
  scraped?: ScrapedLinkContext | null,
  notes?: string
): Promise<string[]> {
  const prompt = `Act as an SEO copywriter. Suggest 8 compelling, click-worthy blog headlines for the niche "${niche}".${buildContextBlock(scraped, notes)}

Return ONLY a JSON array of headline strings. No numbering or markdown.`;

  const result = await callChatGPT([{ role: "user", content: prompt }]);
  return parseJsonArray(result).slice(0, 8);
}

export async function suggestTags(
  title: string,
  niche: string,
  body?: string
): Promise<string[]> {
  const prompt = `Suggest 6-8 SEO keyword tags for this article.
Title: ${title}
Niche: ${niche}
${body ? `Excerpt: ${body.slice(0, 600)}` : ""}

Return ONLY a JSON array of tag strings.`;

  const result = await callChatGPT([{ role: "user", content: prompt }]);
  return parseJsonArray(result).slice(0, 8);
}

export async function generateArticleBody(options: {
  title: string;
  niche: string;
  scraped?: ScrapedLinkContext | null;
  notes?: string;
  affiliateLink?: string;
}): Promise<string> {
  const { title, niche, scraped, notes, affiliateLink } = options;
  const linkInstruction = affiliateLink
    ? `Use this affiliate link where appropriate: ${affiliateLink}`
    : "Use the placeholder [AFFILIATE_LINK] where an affiliate link should be inserted.";

  const prompt = `Write a full SEO-optimized blog article for this headline: "${title}"
Niche: ${niche}${buildContextBlock(scraped, notes)}

Requirements:
- 800-1200 words with an engaging introduction and 4-6 sections using markdown ## headings
- Conversational, helpful tone with practical tips
- Include 2-3 natural call-to-action paragraphs
- ${linkInstruction}
- End with a strong conclusion and CTA
- Return ONLY the article body in markdown. Do not repeat the headline as an H1.`;

  const result = await callChatGPT([{ role: "user", content: prompt }]);
  return result.replace(/^```markdown|```$/g, "").trim();
}
