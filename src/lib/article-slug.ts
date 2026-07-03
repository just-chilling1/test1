export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return base || "article";
}

export async function ensureUniqueArticleSlug(
  supabase: {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (column: string, value: string) => {
          neq: (column: string, value: string) => {
            maybeSingle: () => Promise<{ data: { id: string } | null }>;
          };
        };
      };
    };
  },
  baseSlug: string,
  articleId: string
): Promise<string> {
  let slug = baseSlug;
  let attempt = 0;

  while (attempt < 10) {
    const { data } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", slug)
      .neq("id", articleId)
      .maybeSingle();

    if (!data) return slug;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  return `${baseSlug}-${articleId.slice(0, 8)}`;
}
