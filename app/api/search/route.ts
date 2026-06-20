import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/lib/db/articles";

/**
 * Extract a snippet from content around the first occurrence of the query keyword.
 */
function extractSnippet(content: string, query: string, contextLen = 80): string | null {
  if (!content || !query.trim()) return null;
  const lower = content.toLowerCase();
  const kw = query.toLowerCase().trim();
  const idx = lower.indexOf(kw);
  if (idx === -1) return null;

  const start = Math.max(0, idx - contextLen);
  const end = Math.min(content.length, idx + kw.length + contextLen);
  let snippet = content.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < content.length) snippet = snippet + "...";
  return snippet;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ articles: [], total: 0 });
  }

  try {
    const result = await getArticles({
      search: q,
      status: "PUBLISHED",
      pageSize: 20,
      orderBy: "publishedAt",
      order: "desc",
    });

    // Add snippets to each article
    const articlesWithSnippets = result.articles.map((article) => ({
      ...article,
      snippet: extractSnippet(article.content, q) || article.excerpt || null,
    }));

    return NextResponse.json({
      articles: articlesWithSnippets,
      total: result.total,
    });
  } catch (error) {
    console.error("Error searching articles:", error);
    return NextResponse.json({ error: "搜索失败" }, { status: 500 });
  }
}
