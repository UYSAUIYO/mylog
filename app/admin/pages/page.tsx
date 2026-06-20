"use client";

import { useState, useEffect, useCallback } from "react";

interface PageItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PageItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      setPages(data.pages || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  function resetForm() { setTitle(""); setSlug(""); setContent(""); setIsPublished(true); setSaving(false); }

  function openCreate() { resetForm(); setShowCreate(true); setEditing(null); }

  function openEdit(p: PageItem) {
    resetForm();
    setTitle(p.title); setSlug(p.slug); setContent(p.content); setIsPublished(p.isPublished);
    setEditing(p); setShowCreate(false);
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const body = { title, slug, content, isPublished };
      const url = editing ? `/api/admin/pages/${editing.id}` : "/api/admin/pages";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "保存失败"); }
      setShowCreate(false); setEditing(null); resetForm(); fetchPages();
    } catch (e) {
      alert(e instanceof Error ? e.message : "保存失败");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      setDeletingId(null); fetchPages();
    } catch { alert("删除失败"); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">页面管理</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all active:scale-95">新建页面</button>
      </div>

      {loading && !pages.length ? <div className="text-center py-20 text-zinc-400">加载中...</div> : (
        <div className="space-y-3">
          {pages.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl border border-white/30 dark:border-zinc-700/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${p.isPublished ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500"}`}>{p.isPublished ? "已发布" : "草稿"}</span>
                </div>
                <div className="text-sm text-zinc-400 mt-1">/{p.slug}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">编辑</button>
                <button onClick={() => setDeletingId(p.id)} className="px-3 py-1.5 text-xs rounded-lg border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">删除</button>
              </div>
            </div>
          ))}
          {pages.length === 0 && <div className="text-center py-20 text-zinc-400">还没有独立页面</div>}
        </div>
      )}

      {/* Modal: create / edit */}
      {(showCreate || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">{editing ? "编辑页面" : "新建页面"}</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">标题</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" /></div>
              <div><label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Slug</label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="about" className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" /></div>
              <div><label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">内容 (Markdown)</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={12} className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" /></div>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="rounded" /> 已发布
              </label>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button onClick={() => { setShowCreate(false); setEditing(null); resetForm(); }} className="px-4 py-2 text-sm rounded-xl border border-zinc-300/60 dark:border-zinc-600/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">取消</button>
              <button onClick={handleSave} disabled={saving || !title || !slug || !content} className="px-4 py-2 text-sm rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium disabled:opacity-50 transition-all active:scale-95">{saving ? "保存中..." : "保存"}</button>
            </div>
          </div>
        </div>
      )}

      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">确认删除</h3>
            <p className="text-sm text-zinc-500 mb-6">确定要删除这个页面吗？</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeletingId(null)} className="px-4 py-2 text-sm rounded-xl border border-zinc-300/60 dark:border-zinc-600/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">取消</button>
              <button onClick={() => handleDelete(deletingId)} className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all active:scale-95">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
