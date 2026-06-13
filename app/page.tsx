import Link from "next/link";
import Pagination from "@/components/Pagination";
import GlassHero from "@/components/home/GlassHero";
import TopicCloud from "@/components/home/TopicCloud";
import FeaturedPostCard from "@/components/home/FeaturedPostCard";

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  readingTime: number;
  viewCount: number;
  isPinned: boolean;
  categories: { category: { name: string; slug: string } }[];
  tags: { tag: { name: string; slug: string } }[];
  _count: { comments: number };
}

async function getArticles(page: number) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/articles?page=${page}&pageSize=6`, {
    cache: "no-store",
  });
  if (!res.ok) return { articles: [], total: 0 };
  return res.json();
}

async function getRecentArticles() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/articles?page=1&pageSize=5`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.articles as Article[];
}

async function getPinnedArticles() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/articles?page=1&pageSize=4`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.articles as Article[]).filter((a) => a.isPinned).slice(0, 4);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const [articlesData, recentArticles, pinnedArticles] = await Promise.all([
    getArticles(page),
    getRecentArticles(),
    getPinnedArticles(),
  ]);
  const { articles, total } = articlesData;
  const totalPages = Math.ceil(total / 6);

  return (
    <div>
      {/* Hero */}
      <GlassHero />

      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* 最近更新 - 横向光带 */}
        {recentArticles.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                最近更新
              </h2>
              <Link
                href="/"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                查看全部
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {recentArticles.map((article: Article) => (
                <FeaturedPostCard
                  key={article.id}
                  title={article.title}
                  slug={article.slug}
                  excerpt={article.excerpt || undefined}
                  coverImage={article.coverImage || undefined}
                  publishedAt={article.publishedAt || undefined}
                  readingTime={article.readingTime}
                  viewCount={article.viewCount}
                  commentCount={article._count.comments}
                  isPinned={article.isPinned}
                  categories={article.categories}
                  tags={article.tags}
                  compact
                />
              ))}
            </div>
          </section>
        )}

        {/* 主区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-10">
          {/* 左侧：TopicCloud */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-6">
              <TopicCloud />
            </div>
          </aside>

          {/* 右侧：文章列表 */}
          <div className="min-w-0">
            {/* 精选文章 */}
            {pinnedArticles.length > 0 && (
              <section className="mb-12">
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-6">
                  精选文章
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {pinnedArticles.map((article: Article) => (
                    <FeaturedPostCard
                      key={article.id}
                      title={article.title}
                      slug={article.slug}
                      excerpt={article.excerpt || undefined}
                      coverImage={article.coverImage || undefined}
                      publishedAt={article.publishedAt || undefined}
                      readingTime={article.readingTime}
                      viewCount={article.viewCount}
                      commentCount={article._count.comments}
                      isPinned={article.isPinned}
                      categories={article.categories}
                      tags={article.tags}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 全部分类文章 */}
            <section>
              {articles.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-zinc-400 text-lg">还没有文章</p>
                  <Link
                    href="/admin/posts/new"
                    className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    去写第一篇
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article: Article) => (
                      <FeaturedPostCard
                        key={article.id}
                        title={article.title}
                        slug={article.slug}
                        excerpt={article.excerpt || undefined}
                        coverImage={article.coverImage || undefined}
                        publishedAt={article.publishedAt || undefined}
                        readingTime={article.readingTime}
                        viewCount={article.viewCount}
                        commentCount={article._count.comments}
                        isPinned={article.isPinned}
                        categories={article.categories}
                        tags={article.tags}
                      />
                    ))}
                  </div>

                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    baseUrl="/"
                  />
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
