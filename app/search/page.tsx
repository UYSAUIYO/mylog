"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FeaturedPostCard from "@/components/home/FeaturedPostCard";
import GlassCard from "@/components/glass/GlassCard";
import Pagination from "@/components/Pagination";

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
  snippet: string | null;
}

/**
 * Highlight matching keywords in text by wrapping them with <mark> tags.
 */
function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-yellow-200/80 dark:bg-yellow-500/30 text-zinc-900 dark:text-zinc-100 rounded-sm px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        搜索文章
      </h1>
      <Suspense fallback={<div className="text-center py-24 text-zinc-400">加载中...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQ = searchParams.get("q") || "";
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [query, setQuery] = useState(initialQ);
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQ);

  const doSearch = useCallback(
    async (q: string, p: number) => {
      if (!q.trim()) return;
      setLoading(true);
      setSearched(true);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&page=${p}`
        );
        const data = await res.json();
        setArticles(data.articles || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (initialQ) {
      doSearch(initialQ, initialPage);
    }
  }, [initialQ, initialPage, doSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    router.push(`/search?q=${encodeURIComponent(query)}&page=1`);
    doSearch(query, 1);
  }

  const totalPages = Math.ceil(total / 9);

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-10">
        <GlassCard variant="md" diamond>
          <div className="flex items-center gap-3">
            {/* 搜索图标 */}
            <svg
              className="w-5 h-5 shrink-0 text-zinc-400 dark:text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            {/* 输入框 */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索技术文章、笔记、芯片手册..."
              className="flex-1 bg-transparent border-none outline-none text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />

            {/* 清除按钮 */}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  router.push("/search");
                }}
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-zinc-200/80 dark:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* 分隔线 */}
            <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700" />

            {/* 搜索按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 inline-flex items-center gap-1.5 px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-40 transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  搜索中
                </>
              ) : (
                "搜索"
              )}
            </button>
          </div>
        </GlassCard>
      </form>

      {!searched && (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 dark:bg-zinc-800/20 backdrop-blur-md border border-white/30 dark:border-zinc-700/30 mb-4">
            <svg className="w-8 h-8 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-zinc-400 dark:text-zinc-500 text-lg">输入关键词开始搜索</p>
          <p className="text-zinc-500 dark:text-zinc-600 text-sm mt-1">
            支持文章标题、内容全文检索
          </p>
        </div>
      )}

      {searched && loading && (
        <div className="text-center py-24">
          <svg className="w-8 h-8 mx-auto animate-spin text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-zinc-400 dark:text-zinc-500 mt-3">搜索中...</p>
        </div>
      )}

      {searched && !loading && articles.length === 0 && (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 dark:bg-zinc-800/20 backdrop-blur-md border border-white/30 dark:border-zinc-700/30 mb-4">
            <svg className="w-8 h-8 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </div>
          <p className="text-zinc-400 dark:text-zinc-500 text-lg">未找到相关文章</p>
          <p className="text-zinc-500 dark:text-zinc-600 text-sm mt-1">
            尝试使用其他关键词搜索
          </p>
        </div>
      )}

      {searched && !loading && articles.length > 0 && (
        <>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            找到 {total} 篇相关文章
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <div key={article.id}>
                <FeaturedPostCard
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
                {/* Snippet preview with highlighting */}
                {article.snippet && (
                  <div className="mt-2 px-4 py-2.5 rounded-xl bg-white/40 dark:bg-zinc-800/30 backdrop-blur-sm border border-white/20 dark:border-zinc-700/30">
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                      {highlightText(article.snippet, query)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/search"
            searchParams={{ q: query }}
          />
        </>
      )}
    </>
  );
}
