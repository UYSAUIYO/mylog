import Link from "next/link";
import GlassCard from "@/components/glass/GlassCard";
import { prisma } from "@/lib/prisma";

interface SeriesNavProps {
  articleId: number;
}

export default async function SeriesNav({ articleId }: SeriesNavProps) {
  const seriesArticle = await prisma.seriesArticle.findFirst({
    where: { articleId },
    include: {
      series: {
        include: {
          articles: {
            include: {
              article: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  status: true,
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!seriesArticle) return null;

  const { series } = seriesArticle;
  const publishedArticles = series.articles.filter(
    (sa) => sa.article.status === "PUBLISHED"
  );
  const currentIndex = publishedArticles.findIndex(
    (sa) => sa.article.id === articleId
  );

  if (currentIndex === -1) return null;

  const prevArticle = currentIndex > 0 ? publishedArticles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < publishedArticles.length - 1
      ? publishedArticles[currentIndex + 1]
      : null;

  return (
    <div className="mb-8">
      {/* Series info bar */}
      <GlassCard variant="sm" className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
            专栏
          </span>
          <Link
            href={`/series/${series.slug}`}
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {series.name}
          </Link>
          <span className="text-xs text-zinc-400 ml-auto">
            {currentIndex + 1} / {publishedArticles.length}
          </span>
        </div>

        {/* Prev / Next navigation */}
        <div className="flex items-stretch gap-3">
          {prevArticle ? (
            <Link
              href={`/posts/${prevArticle.article.slug}`}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-zinc-800/50 hover:bg-white/80 dark:hover:bg-zinc-700/50 transition-colors group"
            >
              <svg
                className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <div className="min-w-0">
                <div className="text-xs text-zinc-400">上一篇</div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {prevArticle.article.title}
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {nextArticle ? (
            <Link
              href={`/posts/${nextArticle.article.slug}`}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 dark:bg-zinc-800/50 hover:bg-white/80 dark:hover:bg-zinc-700/50 transition-colors group text-right"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs text-zinc-400">下一篇</div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {nextArticle.article.title}
                </div>
              </div>
              <svg
                className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </GlassCard>
    </div>
  );
}
