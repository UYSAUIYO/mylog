import { NextRequest, NextResponse } from "next/server";
import { getArticleBySlug } from "@/lib/db/articles";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const article = await getArticleBySlug(slug);

    if (!article) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }

    if (article.status !== "PUBLISHED") {
      return NextResponse.json({ error: "文章未发布" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "获取文章详情失败" },
      { status: 500 }
    );
  }
}
