import * as cheerio from "cheerio";

export interface ScrapedLinkContext {
  url: string;
  title: string;
  description: string;
  excerpt: string;
}

function trimText(value: string, max = 2000): string {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export async function scrapeProductLink(url: string): Promise<ScrapedLinkContext> {
  const scraperKey = process.env.SCRAPERAPI_KEY?.trim();
  if (!scraperKey) {
    throw new Error("Missing SCRAPERAPI_KEY");
  }

  const target = url.trim();
  if (!/^https?:\/\//i.test(target)) {
    throw new Error("Enter a valid http(s) URL");
  }

  const scraperUrl = `https://api.scraperapi.com/?api_key=${scraperKey}&url=${encodeURIComponent(target)}&render=true`;

  const response = await fetch(scraperUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`ScraperAPI status: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  $("script, style, nav, footer, header, noscript, iframe").remove();

  const title =
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("title").first().text().trim() ||
    $("h1").first().text().trim() ||
    "Product page";

  const description =
    $('meta[property="og:description"]').attr("content")?.trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    "";

  const paragraphs = $("article p, main p, .product-description p, p")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((text) => text.length > 40);

  const excerpt = trimText(
    paragraphs.slice(0, 6).join(" ") || description || $("body").text(),
    2000
  );

  return {
    url: target,
    title: trimText(title, 200),
    description: trimText(description, 500),
    excerpt,
  };
}

export function formatScrapedContext(context: ScrapedLinkContext): string {
  return [
    `Product URL: ${context.url}`,
    `Page title: ${context.title}`,
    context.description ? `Description: ${context.description}` : "",
    context.excerpt ? `Page excerpt: ${context.excerpt}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
