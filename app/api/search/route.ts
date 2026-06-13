import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/lib/db/articles";

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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching articles:", error);
    return NextResponse.json({ error: "搜索失败" }, { status: 500 });
  }
}
