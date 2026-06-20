"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [newImages, setNewImages] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notes");
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "上传失败");
    }
    const data = await res.json();
    return data.url;
  }

  async function handleFileSelect(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        if (url) urls.push(url);
      }
      setter((prev) => [...prev, ...urls]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(
    index: number,
    images: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    setter(images.filter((_, i) => i !== index));
  }

  async function handlePost() {
    if (posting || !newContent.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent.trim(), images: newImages }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "发布失败");
      }
      setNewContent("");
      setNewImages([]);
      fetchNotes();
    } catch (e) {
      alert(e instanceof Error ? e.message : "发布失败");
    } finally {
      setPosting(false);
    }
  }

  async function handleUpdate(id: number) {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/admin/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim(), images: editImages }),
      });
      if (!res.ok) throw new Error("更新失败");
      setEditingId(null);
      setEditContent("");
      setEditImages([]);
      fetchNotes();
    } catch {
      alert("更新失败");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除这条碎碎念？")) return;
    try {
      const res = await fetch(`/api/admin/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      fetchNotes();
    } catch {
      alert("删除失败");
    }
  }

  function ImagePreviewGrid({
    images,
    onRemove,
  }: {
    images: string[];
    onRemove: (index: number) => void;
  }) {
    if (images.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2 mb-3">
        {images.map((url, i) => (
          <div key={i} className="relative group w-16 h-16">
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              x
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        碎碎念管理
      </h1>

      {/* Quick post */}
      <div className="mb-8 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-2xl border border-white/30 dark:border-zinc-700/30 p-4">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="写点什么..."
          rows={3}
          className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm resize-none focus:outline-none mb-3"
        />

        <ImagePreviewGrid
          images={newImages}
          onRemove={(i) => removeImage(i, newImages, setNewImages)}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, setNewImages)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/50 disabled:opacity-50 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {uploading ? "上传中..." : "添加图片"}
            </button>
            {newImages.length > 0 && (
              <span className="text-xs text-zinc-400">
                {newImages.length} 张图片
              </span>
            )}
          </div>

          <button
            onClick={handlePost}
            disabled={posting || !newContent.trim() || uploading}
            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 transition-all active:scale-95"
          >
            {posting ? "发布中..." : "发布"}
          </button>
        </div>
      </div>

      {loading && !notes.length ? (
        <div className="text-center py-10 text-zinc-400">加载中...</div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => {
            const date = new Date(n.createdAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            const noteImages = parseImages(n.images);

            return (
              <div
                key={n.id}
                className="p-4 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-xl border border-white/30 dark:border-zinc-700/30"
              >
                {editingId === n.id ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 text-sm resize-none focus:outline-none mb-2"
                    />

                    <ImagePreviewGrid
                      images={editImages}
                      onRemove={(i) =>
                        removeImage(i, editImages, setEditImages)
                      }
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          ref={editFileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) =>
                            handleFileSelect(e, setEditImages)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/50 disabled:opacity-50 transition-all"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {uploading ? "上传中..." : "添加图片"}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditContent("");
                            setEditImages([]);
                          }}
                          className="px-3 py-1 text-xs rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleUpdate(n.id)}
                          className="px-3 py-1 text-xs rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">
                        {date}
                      </div>
                      <div className="text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap">
                        {n.content}
                      </div>
                      {noteImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {noteImages.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt=""
                              className="w-20 h-20 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(url, "_blank")}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingId(n.id);
                          setEditContent(n.content);
                          setEditImages(noteImages);
                        }}
                        className="p-1 text-xs text-zinc-400 hover:text-blue-500 transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1 text-xs text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {notes.length === 0 && (
            <div className="text-center py-10 text-zinc-400">
              还没有碎碎念
            </div>
          )}
        </div>
      )}
    </div>
  );
}
