import Link from "next/link";
import Pagination from "@/components/Pagination";
import GlassHero from "@/components/home/GlassHero";
import TopicCloud from "@/components/home/TopicCloud";
import ArticleCard from "@/components/ArticleCard";

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

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-zinc-300/80 pb-4 dark:border-zinc-800">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">
          {label}
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.045em] text-zinc-950 dark:text-zinc-50 sm:text-3xl">
          {title}
        </h2>
      </div>
    </div>
  );
}

function RecentList({ articles }: { articles: Article[] }) {
  return (
    <div className="divide-y divide-zinc-300/80 border-y border-zinc-300/80 dark:divide-zinc-800 dark:border-zinc-800">
      {articles.map((article, index) => (
        <Link
          key={article.id}
          href={`/posts/${article.slug}`}
          className="grid gap-3 py-4 transition-colors hover:text-blue-700 dark:hover:text-blue-400 sm:grid-cols-[64px_minmax(0,1fr)_120px] sm:items-center"
        >
          <span className="font-mono text-xs text-zinc-400">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span>
            <span className="block text-lg font-bold tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">
              {article.title}
            </span>
            <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-500">
              {article.categories[0]?.category.name || "Article"} · {article.readingTime || 0} min
            </span>
          </span>
          <time className="font-mono text-xs text-zinc-500 sm:text-right">
            {formatDate(article.publishedAt)}
          </time>
        </Link>
      ))}
    </div>
  );
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

  const leadPinned = pinnedArticles[0];
  const sidePinned = pinnedArticles.slice(1, 3);

  return (
    <div>
      <GlassHero />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {recentArticles.length > 0 && (
          <section className="mb-16">
            <SectionTitle label="Latest Issue" title="最近更新" />
            <RecentList articles={recentArticles} />
          </section>
        )}

        {pinnedArticles.length > 0 && (
          <section className="mb-16">
            <SectionTitle label="Featured" title="值得先看的文章" />
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
              {leadPinned && (
                <ArticleCard
                  title={leadPinned.title}
                  slug={leadPinned.slug}
                  excerpt={leadPinned.excerpt || undefined}
                  coverImage={leadPinned.coverImage || undefined}
                  publishedAt={leadPinned.publishedAt || undefined}
                  readingTime={leadPinned.readingTime}
                  viewCount={leadPinned.viewCount}
                  commentCount={leadPinned._count.comments}
                  isPinned={leadPinned.isPinned}
                  categories={leadPinned.categories}
                  tags={leadPinned.tags}
                />
              )}
              <div className="grid gap-5">
                {sidePinned.map((article) => (
                  <ArticleCard
                    key={article.id}
                    title={article.title}
                    slug={article.slug}
                    excerpt={article.excerpt || undefined}
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
            </div>
          </section>
        )}

        <section id="articles" className="mb-16">
          <SectionTitle label="Archive" title="全部文章" />
          {articles.length === 0 ? (
            <div className="border-y border-zinc-300/80 py-20 text-center dark:border-zinc-800">
              <p className="text-zinc-500">还没有文章</p>
              <Link
                href="/admin/posts/new"
                className="mt-4 inline-block text-sm font-semibold uppercase tracking-[0.16em] text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                写第一篇
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article: Article) => (
                  <ArticleCard
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

              <Pagination currentPage={page} totalPages={totalPages} baseUrl="/" />
            </>
          )}
        </section>

        <TopicCloud />
      </div>
    </div>
  );
}
