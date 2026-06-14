"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SeriesItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  _count: { articles: number };
  articles?: {
    order: number;
    article: { id: number; title: string; slug: string; status: string };
  }[];
}

interface ArticleOption {
  id: number;
  title: string;
  slug: string;
}

export default function AdminSeriesPage() {
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // For managing articles in series
  const [managingSeriesId, setManagingSeriesId] = useState<number | null>(null);
  const [availableArticles, setAvailableArticles] = useState<ArticleOption[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

  useEffect(() => {
    fetchSeries();
  }, []);

  async function fetchSeries() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/series");
      setSeriesList(await res.json());
    } catch {
      setError("加载系列列表失败");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSeriesDetail(id: number) {
    try {
      const res = await fetch(`/api/admin/series/${id}`);
      const data = await res.json();
      // Update the series in list with detailed articles
      setSeriesList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...data } : s))
      );
    } catch {
      setError("加载系列详情失败");
    }
  }

  async function fetchAvailableArticles() {
    try {
      const res = await fetch("/api/admin/articles?pageSize=200&status=PUBLISHED");
      const data = await res.json();
      setAvailableArticles(
        (data.articles || []).map((a: ArticleOption) => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
        }))
      );
    } catch {
      // ignore
    }
  }

  function resetForm() {
    setName("");
    setSlug("");
    setDescription("");
    setCoverImage("");
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("名称不能为空");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = editingId
        ? `/api/admin/series/${editingId}`
        : "/api/admin/series";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || undefined,
          description: description || undefined,
          coverImage: coverImage || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "保存失败");
        return;
      }

      resetForm();
      fetchSeries();
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(series: SeriesItem) {
    setEditingId(series.id);
    setName(series.name);
    setSlug(series.slug);
    setDescription(series.description || "");
    setCoverImage(series.coverImage || "");
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("确定要删除这个系列吗？系列内的文章不会被删除。")) return;
    try {
      await fetch(`/api/admin/series/${id}`, { method: "DELETE" });
      fetchSeries();
    } catch {
      setError("删除失败");
    }
  }

  async function addArticleToSeries(seriesId: number, articleId: number) {
    try {
      await fetch(`/api/admin/series/${seriesId}/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      fetchSeriesDetail(seriesId);
      setSelectedArticleId(null);
    } catch {
      setError("添加文章失败");
    }
  }

  async function removeArticleFromSeries(seriesId: number, articleId: number) {
    try {
      await fetch(`/api/admin/series/${seriesId}/articles`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      fetchSeriesDetail(seriesId);
    } catch {
      setError("移除文章失败");
    }
  }

  async function toggleManage(series: SeriesItem) {
    if (managingSeriesId === series.id) {
      setManagingSeriesId(null);
      return;
    }
    setManagingSeriesId(series.id);
    await Promise.all([
      fetchSeriesDetail(series.id),
      fetchAvailableArticles(),
    ]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          专栏管理 ({seriesList.length})
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          新建专栏
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 space-y-3"
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {editingId ? "编辑专栏" : "新建专栏"}
          </h2>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug)
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^\w\s-]/g, "")
                      .replace(/[\s_]+/g, "-")
                  );
              }}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="专栏名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="series-slug"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="专栏简介（可选）"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              封面图 URL
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? "保存中..." : editingId ? "更新" : "创建"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-sm text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* Series List */}
      {loading ? (
        <div className="text-center py-20 text-zinc-400">加载中...</div>
      ) : seriesList.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">暂无专栏</div>
      ) : (
        <div className="space-y-4">
          {seriesList.map((series) => (
            <div
              key={series.id}
              className="border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 overflow-hidden"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {series.name}
                    </h3>
                    <span className="text-xs text-zinc-400">
                      /{series.slug}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                      {series._count.articles} 篇
                    </span>
                  </div>
                  {series.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                      {series.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleManage(series)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    {managingSeriesId === series.id ? "收起" : "管理文章"}
                  </button>
                  <Link
                    href={`/series/${series.slug}`}
                    target="_blank"
                    className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    预览
                  </Link>
                  <button
                    onClick={() => startEdit(series)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(series.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    删除
                  </button>
                </div>
              </div>

              {/* Articles management */}
              {managingSeriesId === series.id && series.articles && (
                <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-800/50">
                  {/* Current articles */}
                  {series.articles.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        系列文章（按顺序）
                      </h4>
                      <div className="space-y-1">
                        {series.articles.map((sa, idx) => (
                          <div
                            key={sa.article.id}
                            className="flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-700 rounded-lg"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs text-zinc-400 w-6 text-center font-mono">
                                {idx + 1}
                              </span>
                              <span className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                {sa.article.title}
                              </span>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${
                                  sa.article.status === "PUBLISHED"
                                    ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                                    : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                                }`}
                              >
                                {sa.article.status === "PUBLISHED"
                                  ? "已发布"
                                  : "草稿"}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                removeArticleFromSeries(
                                  series.id,
                                  sa.article.id
                                )
                              }
                              className="text-xs text-red-500 hover:text-red-700 ml-2 shrink-0"
                            >
                              移除
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add article */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedArticleId || ""}
                      onChange={(e) =>
                        setSelectedArticleId(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">选择文章添加到系列...</option>
                      {availableArticles
                        .filter(
                          (a) =>
                            !series.articles?.some(
                              (sa) => sa.article.id === a.id
                            )
                        )
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.title}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() =>
                        selectedArticleId &&
                        addArticleToSeries(series.id, selectedArticleId)
                      }
                      disabled={!selectedArticleId}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      添加
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
