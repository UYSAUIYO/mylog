import { Metadata } from "next";
import Link from "next/link";
import GlassCard from "@/components/glass/GlassCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "专栏",
  description: "YUWEN 技术知识库 - 系列专栏",
};

async function getAllSeries() {
  const series = await prisma.series.findMany({
    include: {
      articles: {
        where: { article: { status: "PUBLISHED", deletedAt: null } },
        select: { articleId: true },
      },
      _count: { select: { articles: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return series
    .filter((s) => s.articles.length > 0)
    .map(({ articles, ...rest }) => ({
      ...rest,
      publishedCount: articles.length,
    }));
}

export default async function SeriesIndexPage() {
  const allSeries = await getAllSeries();

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        专栏
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-10">
        系统化整理的技术系列文章
      </p>

      {allSeries.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          暂无专栏
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allSeries.map((series) => (
            <Link key={series.id} href={`/series/${series.slug}`}>
              <GlassCard
                variant="sm"
                className="h-full hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                {series.coverImage && (
                  <img
                    src={series.coverImage}
                    alt={series.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                )}
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {series.name}
                </h2>
                {series.description && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
                    {series.description}
                  </p>
                )}
                <div className="text-xs text-zinc-400">
                  {series.publishedCount} 篇文章
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
