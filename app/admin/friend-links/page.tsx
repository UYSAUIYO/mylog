"use client";

import { useState, useEffect, useCallback } from "react";
import type { FriendLink } from "@/generated/prisma/client";

export default function AdminFriendLinksPage() {
  const [links, setLinks] = useState<FriendLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FriendLink | null>(null);
  const [form, setForm] = useState({
    name: "",
    url: "",
    description: "",
    icon: "",
    category: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/friend-links");
      const data = await res.json();
      setLinks(data.links || data || []);
    } catch (err) {
      console.error("Failed to load links:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  function resetForm() {
    setForm({ name: "", url: "", description: "", icon: "", category: "" });
    setEditing(null);
  }

  function handleEdit(link: FriendLink) {
    setEditing(link);
    setForm({
      name: link.name,
      url: link.url,
      description: link.description || "",
      icon: link.icon || "",
      category: link.category || "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) return;
    setSubmitting(true);

    try {
      if (editing) {
        const res = await fetch(`/api/admin/friend-links/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "更新失败");
        }
      } else {
        const res = await fetch("/api/admin/friend-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "创建失败");
        }
      }
      resetForm();
      fetchLinks();
    } catch (err) {
      alert(err instanceof Error ? err.message : "操作失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除此友情链接？")) return;
    try {
      const res = await fetch(`/api/admin/friend-links/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("删除失败");
      fetchLinks();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          友情链接管理
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
          {editing ? "编辑友链" : "添加友链"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="名称 *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/30"
              required
            />
            <input
              type="url"
              placeholder="网址 * (https://...)"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/30"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="描述"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <input
              type="text"
              placeholder="图标 URL"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <input
              type="text"
              placeholder="分类"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-40 transition-all"
            >
              {submitting ? "提交中..." : editing ? "更新" : "添加"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                取消
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-zinc-400">加载中...</div>
      ) : links.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">暂无友情链接</div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="text-left px-4 py-3 font-medium">名称</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                  网址
                </th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  分类
                </th>
                <th className="text-right px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {links.map((link) => (
                <tr
                  key={link.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {link.icon ? (
                        <img
                          src={link.icon}
                          alt=""
                          className="w-6 h-6 rounded object-cover"
                        />
                      ) : (
                        <span className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                          {link.name.charAt(0)}
                        </span>
                      )}
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {link.name}
                        </div>
                        {link.description && (
                          <div className="text-xs text-zinc-400 line-clamp-1">
                            {link.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px] inline-block align-middle"
                    >
                      {link.url}
                    </a>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-zinc-500 dark:text-zinc-400">
                    {link.category || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(link)}
                      className="text-blue-600 dark:text-blue-400 hover:underline mr-3"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="text-red-500 hover:underline"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
