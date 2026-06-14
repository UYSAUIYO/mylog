"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [catRes, tagRes, seriesRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/tags"),
        fetch("/api/admin/series"),
      ]);
      setCategories(await catRes.json());
      setTags(await tagRes.json());
      setSeriesList((await seriesRes.json()) || []);
    }
    fetchData();
  }, []);

  function generateSlug(text: string) {
    const s = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 200);
    setSlug(s);
  }

  async function handleSave(status: "DRAFT" | "PUBLISHED") {
    if (!title || !content) {
      setError("标题和内容不能为空");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || undefined,
          content,
          excerpt: excerpt || content.substring(0, 200),
          coverImage: coverImage || undefined,
          categoryIds: selectedCategories,
          tagIds: selectedTags,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
          status,
          scheduledAt: scheduledAt || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "保存失败");
        return;
      }

      const article = await res.json();

      // Add to series if selected
      if (selectedSeriesId) {
        await fetch(`/api/admin/series/${selectedSeriesId}/articles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId: article.id }),
        });
      }

      router.push(`/admin/posts/${article.id}/edit`);
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        新建文章
      </h1>

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
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug) generateSlug(e.target.value);
            }}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="文章标题"
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
            placeholder="article-slug"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            摘要
          </label>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="文章摘要（可选）"
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
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://... 或上传后填入链接"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              SEO 标题
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="留空则使用文章标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              SEO 描述
            </label>
            <input
              type="text"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="留空则使用摘要"
            />
          </div>
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
                      ? prev.filter((id) => id !== cat.id)
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
                      ? prev.filter((id) => id !== tag.id)
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

      <div className="flex gap-3 flex-wrap">
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
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "保存中..." : "立即发布"}
        </button>
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className="px-4 py-2 border border-orange-300 dark:border-orange-600 text-sm text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50"
          disabled={saving}
        >
          定时发布
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
            文章将保存为草稿，在设定时间后自动发布。需要配置定时任务（CRON）才能生效。
          </p>
          {scheduledAt && (
            <button
              onClick={async () => {
                await handleSave("DRAFT");
              }}
              disabled={saving}
              className="mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? "保存中..." : `保存并设定于 ${scheduledAt} 发布`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
