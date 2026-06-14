"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PhotoLightbox from "@/components/PhotoLightbox";

interface PhotoItem {
  id: number;
  title: string;
  description: string | null;
  url: string;
  tags: string | null;
  createdAt: string;
}

interface PhotoListResponse {
  photos: PhotoItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function parseTags(tagsStr: string | null): string[] {
  if (!tagsStr) return [];
  try {
    return JSON.parse(tagsStr);
  } catch {
    return tagsStr.split(/[,，]/).filter(Boolean);
  }
}

export default function PhotosPage() {
  const [data, setData] = useState<PhotoListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/photos?page=${page}&pageSize=12`);
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

  const photos = data?.photos || [];

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 text-sm text-zinc-400 dark:text-zinc-500 mb-3">
            <Link href="/" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">
              首页
            </Link>
            <span>/</span>
            <span className="text-zinc-600 dark:text-zinc-400">照片</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            照片
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            专业美图分享，记录光影瞬间
          </p>
        </div>

        {/* Loading */}
        {loading && !data && (
          <div className="text-center py-20 text-zinc-400">加载中...</div>
        )}

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => setLightboxIndex(index)}
              className="group cursor-pointer bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-2xl border border-white/30 dark:border-zinc-700/30 overflow-hidden hover:border-blue-300/60 dark:hover:border-blue-600/40 transition-all hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {photo.title}
                </h3>
                {photo.tags && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {parseTags(photo.tags).slice(0, 3).map((tag, i) => (
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
            </div>
          ))}
        </div>

        {/* Empty state */}
        {!loading && photos.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-zinc-400 dark:text-zinc-500">还没有照片</p>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 text-sm rounded-xl border border-zinc-300/60 dark:border-zinc-600/60 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md disabled:opacity-40 hover:bg-white/80 dark:hover:bg-zinc-700/80 transition-all"
            >
              上一页
            </button>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {page} / {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="px-4 py-2 text-sm rounded-xl border border-zinc-300/60 dark:border-zinc-600/60 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md disabled:opacity-40 hover:bg-white/80 dark:hover:bg-zinc-700/80 transition-all"
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && photos.length > 0 && (
        <PhotoLightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() =>
            setLightboxIndex((prev) =>
              prev !== null ? (prev - 1 + photos.length) % photos.length : 0
            )
          }
          onNext={() =>
            setLightboxIndex((prev) =>
              prev !== null ? (prev + 1) % photos.length : 0
            )
          }
        />
      )}
    </div>
  );
}
