import { NextResponse } from "next/server";
import { getArticleStats } from "@/lib/db/articles";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const stats = await getArticleStats(slug);
    return NextResponse.json(stats);
  } catch (error) {
    if (error instanceof Error && error.message === "文章不存在") {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }
    return NextResponse.json({ error: "获取统计失败" }, { status: 500 });
  }
}
