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

  useEffect(() => {
    async function fetchData() {
      try {
        const [articleRes, catRes, tagRes] = await Promise.all([
          fetch(`/api/admin/articles/${id}`),
          fetch("/api/admin/categories"),
          fetch("/api/admin/tags"),
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

        setCategories(await catRes.json());
        setTags(await tagRes.json());
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
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "保存失败");
        return;
      }

      setStatus(newStatus);
      router.refresh();
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
    </div>
  );
}
