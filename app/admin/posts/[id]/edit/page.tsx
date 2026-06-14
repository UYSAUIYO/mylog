"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import MdxEditorWrapper from "@/components/MdxEditor";
import GlassMarkdownPreview from "@/components/markdown/GlassMarkdownPreview";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface SeriesOption {
  id: number;
  name: string;
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [status, setStatus] = useState<string>("DRAFT");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [initialSeriesId, setInitialSeriesId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [articleRes, catRes, tagRes, seriesRes] = await Promise.all([
          fetch(`/api/admin/articles/${id}`),
          fetch("/api/admin/categories"),
          fetch("/api/admin/tags"),
          fetch("/api/admin/series"),
        ]);

        const article = await articleRes.json();
        setTitle(article.title || "");
        setSlug(article.slug || "");
        setContent(article.content || "");
        setExcerpt(article.excerpt || "");
        setCoverImage(article.coverImage || "");
        setSeoTitle(article.seoTitle || "");
        setSeoDescription(article.seoDescription || "");
        setStatus(article.status || "DRAFT");
        setSelectedCategories(
          article.categories?.map(
            ({ category }: { category: Category }) => category.id
          ) || []
        );
        setSelectedTags(
          article.tags?.map(
            ({ tag }: { tag: Tag }) => tag.id
          ) || []
        );

        if (article.scheduledAt) {
          const d = new Date(article.scheduledAt);
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setScheduledAt(local);
          setShowSchedule(true);
        }

        setCategories(await catRes.json());
        setTags(await tagRes.json());

        const seriesData = await seriesRes.json();
        setSeriesList(seriesData || []);

        // Check if article belongs to any series
        const seriesArticles = seriesData?.filter((s: SeriesOption & { articles?: { article: { id: number } }[] }) =>
          s.articles?.some((sa: { article: { id: number } }) => sa.article.id === parseInt(id))
        );
        if (seriesArticles?.length > 0) {
          setSelectedSeriesId(seriesArticles[0].id);
          setInitialSeriesId(seriesArticles[0].id);
        }
      } catch (err) {
        console.error("Error loading article:", err);
        setError("加载文章失败");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  async function handleSave(newStatus: string) {
    if (!title || !content) {
      setError("标题和内容不能为空");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt: excerpt || content.substring(0, 200),
          coverImage: coverImage || undefined,
          categoryIds: selectedCategories,
          tagIds: selectedTags,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
          status: newStatus,
          scheduledAt: scheduledAt || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "保存失败");
        return;
      }

      setStatus(newStatus);
      router.refresh();

      // Handle series change
      if (selectedSeriesId !== initialSeriesId) {
        // Remove from old series
        if (initialSeriesId) {
          await fetch(`/api/admin/series/${initialSeriesId}/articles`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ articleId: parseInt(id) }),
          });
        }
        // Add to new series
        if (selectedSeriesId) {
          await fetch(`/api/admin/series/${selectedSeriesId}/articles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ articleId: parseInt(id) }),
          });
        }
        setInitialSeriesId(selectedSeriesId);
      }
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("确定要删除这篇文章吗？此操作不可恢复。")) return;
    try {
      await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      router.push("/admin/posts");
    } catch {
      setError("删除失败");
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-zinc-400">加载中...</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          编辑文章
        </h1>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full ${
              status === "PUBLISHED"
                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : status === "DRAFT"
                ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500"
            }`}
          >
            {status === "PUBLISHED"
              ? "已发布"
              : status === "DRAFT"
              ? "草稿"
              : "已归档"}
          </span>
          {status === "PUBLISHED" && (
            <a
              href={`/posts/${slug}`}
              target="_blank"
              className="text-xs text-blue-600 hover:text-blue-700 ml-2"
            >
              预览
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            分类
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setSelectedCategories((prev) =>
                    prev.includes(cat.id)
                      ? prev.filter((c) => c !== cat.id)
                      : [...prev, cat.id]
                  )
                }
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategories.includes(cat.id)
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            标签
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() =>
                  setSelectedTags((prev) =>
                    prev.includes(tag.id)
                      ? prev.filter((t) => t !== tag.id)
                      : [...prev, tag.id]
                  )
                }
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedTags.includes(tag.id)
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* 系列专栏 */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            所属专栏
          </label>
          <select
            value={selectedSeriesId || ""}
            onChange={(e) => setSelectedSeriesId(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">不属于任何专栏</option>
            {seriesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-400 mt-1">
            可在专栏管理页面中调整文章顺序
          </p>
        </div>
      </div>

      <div className="mb-6">
        <MdxEditorWrapper
          initialMarkdown={content}
          onChange={setContent}
        />
      </div>

      {/* 磨砂玻璃预览区 */}
      <div className="mb-6">
        <GlassMarkdownPreview content={content} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => handleSave("DRAFT")}
          disabled={saving}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          保存草稿
        </button>
        <button
          onClick={() => handleSave("PUBLISHED")}
          disabled={saving}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          发布
        </button>
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className="px-4 py-2 border border-orange-300 dark:border-orange-600 text-sm text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50"
          disabled={saving}
        >
          {scheduledAt ? "修改定时" : "定时发布"}
        </button>
        {status === "PUBLISHED" && (
          <button
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
            className="px-4 py-2 border border-yellow-300 dark:border-yellow-600 text-sm text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors disabled:opacity-50"
          >
            取消发布
          </button>
        )}
        <button
          onClick={() => handleSave("ARCHIVED")}
          disabled={saving}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-sm text-zinc-500 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          归档
        </button>
        <div className="flex-1" />
        <button
          onClick={handleDelete}
          className="px-4 py-2 border border-red-300 dark:border-red-700 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          删除
        </button>
      </div>

      {showSchedule && (
        <div className="mt-4 p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50/50 dark:bg-orange-900/10">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            设定发布时间
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <p className="text-xs text-zinc-500 mt-2">
            文章将保存为草稿，在设定时间后自动发布。
          </p>
          {scheduledAt && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={async () => { await handleSave("DRAFT"); }}
                disabled={saving}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "保存中..." : "保存定时发布"}
              </button>
              <button
                onClick={() => { setScheduledAt(""); }}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-sm text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                取消定时
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
