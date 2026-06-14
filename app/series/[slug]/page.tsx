import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import GlassCard from "@/components/glass/GlassCard";
import { getSeriesBySlug } from "@/lib/db/series";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);

  if (!series) return { title: "专栏不存在" };

  return {
    title: series.name,
    description: series.description || `${series.name} 系列文章`,
    openGraph: {
      title: series.name,
      description: series.description || undefined,
      images: series.coverImage ? [{ url: series.coverImage }] : [],
    },
  };
}

export default async function SeriesPage({ params }: PageProps) {
  const { slug } = await params;
  const series = await getSeriesBySlug(slug);

  if (!series) {
    notFound();
  }

  const publishedArticles = series.articles.filter(
    (sa) => sa.article.status === "PUBLISHED"
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Series Header */}
      <GlassCard variant="sm" className="mb-10">
        {series.coverImage && (
          <img
            src={series.coverImage}
            alt={series.name}
            className="w-full rounded-lg mb-6 max-h-64 object-cover"
          />
        )}
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          {series.name}
        </h1>
        {series.description && (
          <p className="text-zinc-600 dark:text-zinc-400 text-base mb-4">
            {series.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{publishedArticles.length} 篇文章</span>
          <span>
            更新于{" "}
            {new Date(series.updatedAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </GlassCard>

      {/* Article List */}
      <div className="space-y-4">
        {publishedArticles.map((sa, idx) => (
          <Link key={sa.article.id} href={`/posts/${sa.article.slug}`}>
            <GlassCard
              variant="sm"
              className="hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {sa.article.title}
                  </h2>
                  {sa.article.excerpt && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2">
                      {sa.article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    {sa.article.publishedAt && (
                      <time>
                        {new Date(sa.article.publishedAt).toLocaleDateString(
                          "zh-CN"
                        )}
                      </time>
                    )}
                    {sa.article.readingTime > 0 && (
                      <span>{sa.article.readingTime} 分钟阅读</span>
                    )}
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-zinc-300 dark:text-zinc-600 shrink-0 mt-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      {publishedArticles.length === 0 && (
        <div className="text-center py-20 text-zinc-400">
          该专栏暂无已发布的文章
        </div>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
