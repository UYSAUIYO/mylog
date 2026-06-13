"use client";

import { useState, useEffect } from "react";

interface Tag {
  id: number;
  name: string;
  slug: string;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    try {
      const res = await fetch("/api/admin/tags");
      setTags(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newName) return;
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          slug: newSlug || undefined,
        }),
      });
      if (res.ok) {
        setNewName("");
        setNewSlug("");
        fetchTags();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleUpdate(id: number) {
    try {
      await fetch(`/api/admin/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, slug: editSlug }),
      });
      setEditingId(null);
      fetchTags();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除此标签？")) return;
    try {
      await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
      fetchTags();
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-zinc-400">加载中...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        标签管理
      </h1>

      {/* Create */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 mb-6">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          新建标签
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm text-zinc-900 dark:text-zinc-100"
            placeholder="标签名称"
          />
          <input
            type="text"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            className="w-40 px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm text-zinc-900 dark:text-zinc-100"
            placeholder="slug（可选）"
          />
          <button
            onClick={handleCreate}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            添加
          </button>
        </div>
      </div>

      {/* Tag list */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full"
          >
            {editingId === tag.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-24 px-2 py-0.5 text-sm border rounded bg-white dark:bg-zinc-700"
                  autoFocus
                />
                <button
                  onClick={() => handleUpdate(tag.id)}
                  className="text-xs text-blue-600"
                >
                  保存
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs text-zinc-400"
                >
                  取消
                </button>
              </div>
            ) : (
              <>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {tag.name}
                </span>
                <button
                  onClick={() => {
                    setEditingId(tag.id);
                    setEditName(tag.name);
                    setEditSlug(tag.slug);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-xs text-blue-500"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-red-500"
                >
                  删除
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
