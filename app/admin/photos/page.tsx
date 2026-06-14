"use client";

import { useState, useEffect, useCallback } from "react";

interface Photo {
  id: number;
  title: string;
  description: string | null;
  url: string;
  tags: string | null;
  createdAt: string;
}

interface PhotoListResponse {
  photos: Photo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function AdminPhotosPage() {
  const [data, setData] = useState<PhotoListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Upload/Edit form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/photos?page=${page}&pageSize=12`);
      setData(await res.json());
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  function resetForm() {
    setUploadFile(null);
    setUploadPreview("");
    setTitle("");
    setDescription("");
    setTags("");
    setUploading(false);
    setSaving(false);
  }

  function openUpload() {
    resetForm();
    setShowUpload(true);
  }

  function openEdit(photo: Photo) {
    resetForm();
    setTitle(photo.title);
    setDescription(photo.description || "");
    setTags(parseTags(photo.tags).join("，"));
    setEditingPhoto(photo);
  }

  function parseTags(tagsStr: string | null): string[] {
    if (!tagsStr) return [];
    try {
      return JSON.parse(tagsStr);
    } catch {
      return tagsStr.split(/[,，]/).filter(Boolean);
    }
  }

  function formatTags(input: string): string {
    const arr = input
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return JSON.stringify(arr);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    if (!title) {
      setTitle(file.name.replace(/\.[^.]+$/, ""));
    }
  }

  async function handleUpload() {
    if (!uploadFile && !editingPhoto) return;
    if (uploading) return;

    setUploading(true);
    try {
      let url = editingPhoto?.url || "";

      if (uploadFile) {
        const formData = new FormData();
        formData.append("file", uploadFile);
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error);
        url = uploadData.url;
      }

      const photoData = {
        title,
        description: description || undefined,
        url,
        tags: tags ? formatTags(tags) : undefined,
      };

      if (editingPhoto) {
        const res = await fetch(`/api/admin/photos/${editingPhoto.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(photoData),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "更新失败");
        }
      } else {
        const res = await fetch("/api/admin/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(photoData),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "创建失败");
        }
      }

      setShowUpload(false);
      setEditingPhoto(null);
      resetForm();
      fetchPhotos();
    } catch (error) {
      console.error("Error saving photo:", error);
      alert(error instanceof Error ? error.message : "保存失败，请重试");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      setDeletingId(null);
      fetchPhotos();
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("删除失败");
    }
  }

  if (loading && !data) {
    return (
      <div className="text-center py-20 text-zinc-400">加载中...</div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          照片管理
        </h1>
        <button
          onClick={openUpload}
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all active:scale-95"
        >
          上传照片
        </button>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data?.photos?.map((photo) => (
          <div
            key={photo.id}
            className="group relative bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-2xl border border-white/30 dark:border-zinc-700/30 overflow-hidden"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {photo.title}
              </h3>
              {photo.tags && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {parseTags(photo.tags).map((tag, i) => (
                    <span
                      key={i}
                      className="inline-block px-1.5 py-0.5 text-[10px] rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Hover actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={() => openEdit(photo)}
                className="px-3 py-1.5 bg-white text-zinc-900 text-xs font-medium rounded-lg hover:bg-zinc-100 transition-colors"
              >
                编辑
              </button>
              <button
                onClick={() => setDeletingId(photo.id)}
                className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {data?.photos?.length === 0 && (
        <div className="text-center py-20 text-zinc-400">
          还没有照片，点击"上传照片"开始添加
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300/60 dark:border-zinc-600/60 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            上一页
          </button>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300/60 dark:border-zinc-600/60 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            下一页
          </button>
        </div>
      )}

      {/* Upload / Edit Modal */}
      {(showUpload || editingPhoto) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              {editingPhoto ? "编辑照片" : "上传照片"}
            </h2>

            {/* Image upload / preview */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                图片
              </label>
              {(uploadPreview || editingPhoto?.url) && (
                <div className="aspect-[4/3] mb-3 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={uploadPreview || editingPhoto?.url || ""}
                    alt="预览"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-700 dark:file:text-zinc-300 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700 transition-colors"
              />
              {!editingPhoto && (
                <p className="text-xs text-zinc-400 mt-1">
                  支持 JPG、PNG、WebP、GIF，最大 5MB
                </p>
              )}
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="照片标题"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-zinc-400"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="照片描述（可选）"
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-zinc-400 resize-none"
              />
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                标签
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="用逗号分隔，如：风光，建筑，人像"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-zinc-400"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  setShowUpload(false);
                  setEditingPhoto(null);
                  resetForm();
                }}
                className="px-4 py-2 text-sm rounded-xl border border-zinc-300/60 dark:border-zinc-600/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || (!uploadFile && !editingPhoto)}
                className="px-4 py-2 text-sm rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 transition-all active:scale-95"
              >
                {uploading ? "保存中..." : editingPhoto ? "保存修改" : "上传"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              确认删除
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              确定要删除这张照片吗？此操作不可撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-sm rounded-xl border border-zinc-300/60 dark:border-zinc-600/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all active:scale-95"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
