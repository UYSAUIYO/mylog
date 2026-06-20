"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface NoteItem {
  id: number;
  content: string;
  images: string | null;
  createdAt: string;
}

function parseImages(images: string | null): string[] {
  if (!images) return [];
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default function NotesPage() {
  const [data, setData] = useState<{ notes: NoteItem[]; total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes?page=${page}`);
      setData(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const notes = data?.notes || [];

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 text-sm text-zinc-400 dark:text-zinc-500 mb-3">
          <Link href="/" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">首页</Link>
          <span>/</span>
          <span className="text-zinc-600 dark:text-zinc-400">动态</span>
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">碎碎念</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-10">随手记录，灵感碎片</p>

        {loading && !data && <div className="text-center py-20 text-zinc-400">加载中...</div>}

        <div className="space-y-6">
          {notes.map((note) => {
            const date = new Date(note.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
            return (
              <div key={note.id} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
                <div className="absolute left-0 top-3 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-zinc-950" />
                <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-2xl border border-white/30 dark:border-zinc-700/30 p-5">
                  <time className="text-xs text-zinc-400 dark:text-zinc-500 mb-2 block">{date}</time>
                  <div className="text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">{note.content}</div>
                  {(() => {
                    const imgs = parseImages(note.images);
                    if (imgs.length === 0) return null;
                    return (
                      <div className={`flex flex-wrap gap-2 mt-3 ${imgs.length === 1 ? "" : "grid grid-cols-3 gap-2 mt-3"}`}>
                        {imgs.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt=""
                            className={`${imgs.length === 1 ? "max-w-sm w-full" : "w-full aspect-square object-cover"} rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:opacity-90 transition-opacity`}
                            onClick={() => window.open(url, "_blank")}
                            loading="lazy"
                          />
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && notes.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💭</div>
            <p className="text-zinc-400 dark:text-zinc-500">还没有碎碎念</p>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 text-sm rounded-xl border border-zinc-300/60 dark:border-zinc-600/60 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md disabled:opacity-40 hover:bg-white/80 dark:hover:bg-zinc-700/80 transition-all">上一页</button>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{page} / {data.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages} className="px-4 py-2 text-sm rounded-xl border border-zinc-300/60 dark:border-zinc-600/60 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md disabled:opacity-40 hover:bg-white/80 dark:hover:bg-zinc-700/80 transition-all">下一页</button>
          </div>
        )}
      </div>
    </div>
  );
}
