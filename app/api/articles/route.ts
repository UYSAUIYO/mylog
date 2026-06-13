import { NextRequest, NextResponse } from "next/server";
import { getArticles } from "@/lib/db/articles";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const categorySlug = searchParams.get("category") || undefined;
  const tagSlug = searchParams.get("tag") || undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const result = await getArticles({
      page,
      pageSize,
      status: "PUBLISHED",
      categorySlug,
      tagSlug,
      search,
      orderBy: "publishedAt",
      order: "desc",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "获取文章列表失败" },
      { status: 500 }
    );
  }
}
