import { prisma } from "@/lib/prisma";
import RSS from "rss";

export async function GET() {
  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
    },
    orderBy: { publishedAt: "desc" },
    take: 30,
    include: {
      categories: {
        include: { category: true },
      },
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const feed = new RSS({
    title: "My Blog",
    description: "分享技术学习笔记与项目经验的个人博客",
    site_url: siteUrl,
    feed_url: `${siteUrl}/rss.xml`,
    language: "zh-CN",
    pubDate: articles[0]?.publishedAt?.toISOString() || new Date().toISOString(),
  });

  for (const article of articles) {
    feed.item({
      title: article.title,
      description: article.excerpt || "",
      url: `${siteUrl}/posts/${article.slug}`,
      date: article.publishedAt?.toISOString() || article.createdAt.toISOString(),
      categories: article.categories.map(({ category }) => category.name),
    });
  }

  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
