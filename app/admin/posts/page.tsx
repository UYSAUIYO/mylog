"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Article {
  id: number;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  scheduledAt: string | null;
  updatedAt: string;
  _count: { comments: number };
  categories: { category: { name: string } }[];
}

export default function AdminPostsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-400">加载中...</div>}>
      <AdminPostsContent />
    </Suspense>
  );
}

function AdminPostsContent() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: "20" });
        if (statusFilter) params.set("status", statusFilter);

        const res = await fetch(`/api/admin/articles?${params}`);
        const data = await res.json();
        setArticles(data.articles || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [page, statusFilter]);

  async function handleDelete(id: number) {
    if (!confirm("确定要删除这篇文章吗？")) return;
    try {
      await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      setArticles(articles.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  }

  const statuses = [
    { value: "", label: "全部" },
    { value: "PUBLISHED", label: "已发布" },
    { value: "DRAFT", label: "草稿" },
    { value: "ARCHIVED", label: "已归档" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          文章管理 ({total})
        </h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          新建文章
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => {
              setStatusFilter(s.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              statusFilter === s.value
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-400">加载中...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">暂无文章</div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="text-left px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  标题
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  状态
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  分类
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  更新时间
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr
                  key={article.id}
                  className="border-b border-zinc-100 dark:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-750"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/posts/${article.slug}`}
                      target="_blank"
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                          article.status === "PUBLISHED"
                            ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                            : article.status === "DRAFT"
                            ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                            : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {article.status === "PUBLISHED"
                          ? "已发布"
                          : article.status === "DRAFT"
                          ? "草稿"
                          : "已归档"}
                      </span>
                      {article.status === "DRAFT" && article.scheduledAt && (
                        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
                          定时 {new Date(article.scheduledAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {article.categories
                      .map(({ category }) => category.name)
                      .join(", ") || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {new Date(article.updatedAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/posts/${article.id}/edit`}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(total / 20) }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 text-sm rounded ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-zinc-800 border text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
