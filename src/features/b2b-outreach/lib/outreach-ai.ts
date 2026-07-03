import { callChatGPT } from "@/features/core-workflow/lib/llm";
import type { EmailVariant, Lead, Offer } from "@/features/b2b-outreach/types";

function parseJsonArray<T>(raw: string): T[] {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("Expected JSON array");
  return parsed as T[];
}

export interface GeneratedOffer {
  name: string;
  description: string;
  payout: string;
  commission_type: string;
}

export async function generateOffers(niche: string, count = 5): Promise<GeneratedOffer[]> {
  const prompt = `Act as an affiliate network manager. Invent ${count} realistic B2B affiliate offers for the "${niche}" niche.
For each offer include: a product/service name, a 1-sentence description, a payout (e.g. "$120 / sale" or "30% recurring"), and a commission_type ("one-time" or "recurring").

Return ONLY a JSON array of objects: [{"name": "...", "description": "...", "payout": "...", "commission_type": "one-time"}]`;

  const result = await callChatGPT([{ role: "user", content: prompt }]);
  return parseJsonArray<GeneratedOffer>(result).slice(0, count);
}

export async function generateOutreachEmails(
  lead: Pick<Lead, "business_name" | "contact_name" | "niche" | "website">,
  offer: Pick<Offer, "name" | "description" | "payout" | "landing_url">
): Promise<EmailVariant[]> {
  const prompt = `Write 3 distinct, personalized cold outreach emails from an affiliate marketer to a business prospect.

PROSPECT:
- Business: ${lead.business_name}
- Contact: ${lead.contact_name || "there"}
- Niche: ${lead.niche || "general"}
- Website: ${lead.website || "n/a"}

OFFER TO PITCH:
- Name: ${offer.name}
- Description: ${offer.description}
- Payout / value: ${offer.payout || "attractive commissions"}
- Link: ${offer.landing_url || "[OFFER_LINK]"}

STYLES:
1. Short & direct (under 90 words)
2. Value-first (leads with a specific benefit for their business)
3. Curiosity hook (opens a loop, asks a question)

RULES:
- Personalize to the business and niche.
- Natural, human tone. No spammy phrasing.
- Each email needs a subject line and body.
- Use "${offer.landing_url || "[OFFER_LINK]"}" as the link.

Return ONLY a JSON array of objects: [{"subject": "...", "body": "..."}]`;

  const result = await callChatGPT([{ role: "user", content: prompt }]);
  return parseJsonArray<EmailVariant>(result).slice(0, 3);
}
