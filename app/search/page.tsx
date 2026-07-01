"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
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

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-blue-100 px-0.5 text-zinc-950 dark:bg-blue-500/20 dark:text-zinc-100"
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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 border-b border-zinc-300/80 pb-8 dark:border-zinc-800">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
          Search
        </p>
        <h1 className="text-5xl font-black tracking-[-0.07em] text-zinc-950 dark:text-zinc-50 sm:text-7xl">
          Search the journal
        </h1>
      </header>
      <Suspense fallback={<div className="py-24 text-center text-zinc-500">加载中...</div>}>
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

  const doSearch = useCallback(async (q: string, p: number) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&page=${p}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialQ) return;
    const timer = window.setTimeout(() => {
      doSearch(initialQ, initialPage);
    }, 0);
    return () => window.clearTimeout(timer);
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
        <div className="grid gap-3 border-y border-zinc-300/80 py-4 dark:border-zinc-800 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="sr-only" htmlFor="journal-search">
            搜索文章
          </label>
          <input
            id="journal-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, chips, agents..."
            className="min-h-14 bg-transparent text-2xl font-black tracking-[-0.04em] text-zinc-950 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-700 sm:text-3xl"
          />
          <div className="flex gap-2">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  router.push("/search");
                }}
                className="border border-zinc-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:border-zinc-950 hover:text-zinc-950 dark:border-zinc-800 dark:hover:border-zinc-100 dark:hover:text-zinc-100"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="border border-zinc-950 bg-zinc-950 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-transparent hover:text-zinc-950 disabled:opacity-40 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-transparent dark:hover:text-zinc-100"
            >
              {loading ? "Searching" : "Search"}
            </button>
          </div>
        </div>
      </form>

      {!searched && (
        <div className="border-y border-zinc-300/80 py-20 text-center dark:border-zinc-800">
          <p className="text-lg font-bold tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">
            输入关键词开始搜索
          </p>
          <p className="mt-2 text-sm text-zinc-500">支持文章标题、内容全文检索</p>
        </div>
      )}

      {searched && loading && (
        <div className="border-y border-zinc-300/80 py-20 text-center text-zinc-500 dark:border-zinc-800">
          搜索中...
        </div>
      )}

      {searched && !loading && articles.length === 0 && (
        <div className="border-y border-zinc-300/80 py-20 text-center dark:border-zinc-800">
          <p className="text-lg font-bold tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">
            未找到相关文章
          </p>
          <p className="mt-2 text-sm text-zinc-500">尝试使用其他关键词搜索</p>
        </div>
      )}

      {searched && !loading && articles.length > 0 && (
        <>
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
            {total} results
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <div key={article.id}>
                <ArticleCard
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
                {article.snippet && (
                  <div className="mt-2 border border-zinc-300/80 bg-[#fbfaf7] p-3 dark:border-zinc-800 dark:bg-zinc-950">
                    <p className="line-clamp-3 text-xs leading-6 text-zinc-600 dark:text-zinc-400">
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
