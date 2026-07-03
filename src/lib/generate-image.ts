function extractImageUrl(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;

  const candidates = [
    record.url,
    record.image,
    record.image_url,
    record.output,
    record.result,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.startsWith("http")) return value;
  }

  if (Array.isArray(record.images)) {
    const first = record.images[0];
    if (typeof first === "string" && first.startsWith("http")) return first;
    if (first && typeof first === "object" && typeof (first as { url?: string }).url === "string") {
      return (first as { url: string }).url;
    }
  }

  if (Array.isArray(record.data)) {
    const first = record.data[0];
    if (typeof first === "string" && first.startsWith("http")) return first;
    if (first && typeof first === "object" && typeof (first as { url?: string }).url === "string") {
      return (first as { url: string }).url;
    }
  }

  const nested = record.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return extractImageUrl(nested);
  }

  if (typeof record.base64 === "string" && record.base64.length > 0) {
    const mime = typeof record.mime === "string" ? record.mime : "image/png";
    return `data:${mime};base64,${record.base64}`;
  }

  return null;
}

export async function generateImageFromPrompt(prompt: string): Promise<string> {
  const apiKey = process.env.RAPIDAPI_KEY?.trim();
  const host = process.env.RAPIDAPI_HOST_IMAGE?.trim();
  const path = process.env.RAPIDAPI_IMAGE_PATH?.trim() || "/generate";

  if (!apiKey) throw new Error("Missing RAPIDAPI_KEY");
  if (!host) throw new Error("Missing RAPIDAPI_HOST_IMAGE");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`https://${host}${path}`, {
      method: "POST",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": host,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        text: prompt,
        n: 1,
        size: "1024x1024",
        width: 1024,
        height: 1024,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image API error: ${response.status} - ${errorText.slice(0, 300)}`);
    }

    const data = await response.json();
    const url = extractImageUrl(data);
    if (!url) {
      throw new Error("Image API returned an unexpected response format");
    }
    return url;
  } finally {
    clearTimeout(timeout);
  }
}

export function buildArticleImagePrompt(
  title: string,
  niche: string | null,
  variant: "hero" | "social"
): string {
  const context = niche ? `${title}, ${niche} niche` : title;
  if (variant === "hero") {
    return `Professional blog hero image, modern and clean, no text overlay: ${context}`;
  }
  return `Square social media share image, eye-catching, no text overlay: ${context}`;
}
