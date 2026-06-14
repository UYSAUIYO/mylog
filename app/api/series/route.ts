import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const series = await prisma.series.findMany({
      include: {
        _count: { select: { articles: true } },
        articles: {
          where: { article: { status: "PUBLISHED", deletedAt: null } },
          select: { articleId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Only include series with published articles
    const filtered = series
      .filter((s) => s.articles.length > 0)
      .map(({ articles, ...rest }) => ({
        ...rest,
        publishedCount: articles.length,
      }));

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching public series:", error);
    return NextResponse.json({ error: "获取系列列表失败" }, { status: 500 });
  }
}
