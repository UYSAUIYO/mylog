import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      articleCount,
      publishedCount,
      draftCount,
      totalViews,
      totalLikes,
      totalComments,
      approvedComments,
      pendingComments,
      categoryCount,
      tagCount,
    ] = await Promise.all([
      prisma.article.count({ where: { deletedAt: null } }),
      prisma.article.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
      prisma.article.count({ where: { deletedAt: null, status: "DRAFT" } }),
      prisma.article.aggregate({ _sum: { viewCount: true }, where: { deletedAt: null } }),
      prisma.article.aggregate({ _sum: { likeCount: true }, where: { deletedAt: null } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: "APPROVED" } }),
      prisma.comment.count({ where: { status: "PENDING" } }),
      prisma.category.count(),
      prisma.tag.count(),
    ]);

    return NextResponse.json({
      articleCount,
      publishedCount,
      draftCount,
      totalViews: totalViews._sum.viewCount || 0,
      totalLikes: totalLikes._sum.likeCount || 0,
      totalComments,
      approvedComments,
      pendingComments,
      categoryCount,
      tagCount,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "获取统计失败" }, { status: 500 });
  }
}
