import * as cheerio from "cheerio";
import type { OutreachTarget } from "../types";

function stableId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function platformFromUrl(url: string): string {
  if (url.includes("reddit.com")) return "Forum";
  if (url.includes("quora.com")) return "Q&A";
  if (url.includes("medium.com")) return "Blog";
  if (url.includes("youtube.com")) return "Video";
  return "Web";
}

function fallbackTargets(niche: string): OutreachTarget[] {
  const topic = niche.trim() || "this topic";
  return [
    {
      id: stableId(`${topic}-1`),
      platform: "Forum",
      title: `Best resources for ${topic}?`,
      text: `Looking for honest recommendations and guides about ${topic}. What has worked for you?`,
      url: `https://www.reddit.com/search/?q=${encodeURIComponent(topic)}`,
    },
    {
      id: stableId(`${topic}-2`),
      platform: "Q&A",
      title: `How do I get started with ${topic}?`,
      text: `New to ${topic} and trying to figure out the first steps. Any advice welcome.`,
      url: `https://www.quora.com/search?q=${encodeURIComponent(topic)}`,
    },
    {
      id: stableId(`${topic}-3`),
      platform: "Blog",
      title: `${topic} — what beginners should know`,
      text: `Searching for practical tips and real experiences related to ${topic}.`,
      url: `https://www.google.com/search?q=${encodeURIComponent(topic + " forum discussion")}`,
    },
  ];
}

async function scrapeViaGoogle(niche: string): Promise<OutreachTarget[]> {
  const scraperKey = process.env.SCRAPERAPI_KEY?.trim();
  if (!scraperKey) throw new Error("Missing SCRAPERAPI_KEY");

  const query = `site:reddit.com OR site:quora.com OR site:medium.com ${niche}`;
  const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  const scraperUrl = `https://api.scraperapi.com/?api_key=${scraperKey}&url=${encodeURIComponent(targetUrl)}&render=true&premium=true`;

  const response = await fetch(scraperUrl, { cache: "no-store" });
  if (!response.ok) throw new Error(`ScraperAPI status: ${response.status}`);

  const html = await response.text();
  const $ = cheerio.load(html);
  const results: OutreachTarget[] = [];

  $(".tF2Cxc, div.g, div.MjjYud").each((_, el) => {
    const url = $(el).find("a").first().attr("href") || "";
    const title = $(el).find("h3").first().text().trim();
    const snippet =
      $(el).find(".VwiC3b").text().trim() ||
      $(el).find(".y4550c").text().trim() ||
      $(el).text().trim().slice(0, 200);

    if (!url || !title || title.length < 10) return;
    if (!url.startsWith("http")) return;

    const platform = platformFromUrl(url);
    if (!results.find((r) => r.url === url)) {
      results.push({
        id: stableId(url),
        platform,
        title,
        text: snippet || title,
        url,
      });
    }
  });

  if (results.length === 0) throw new Error("No targets parsed");
  return results.slice(0, 20);
}

export async function scrapeTrafficUrls(niche: string): Promise<OutreachTarget[]> {
  const trimmed = niche.trim();
  if (!trimmed) return [];

  try {
    return await scrapeViaGoogle(trimmed);
  } catch {
    return fallbackTargets(trimmed);
  }
}
