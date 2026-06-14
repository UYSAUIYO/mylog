"use client";

import { useEffect, useCallback } from "react";

interface PhotoItem {
  id: number;
  title: string;
  description: string | null;
  url: string;
  tags: string | null;
}

interface PhotoLightboxProps {
  photos: PhotoItem[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function parseTags(tagsStr: string | null): string[] {
  if (!tagsStr) return [];
  try {
    return JSON.parse(tagsStr);
  } catch {
    return tagsStr.split(/[,，]/).filter(Boolean);
  }
}

export default function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: PhotoLightboxProps) {
  const photo = photos[currentIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrev();
          break;
        case "ArrowRight":
          onNext();
          break;
      }
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors text-xl"
        aria-label="关闭"
      >
        &times;
      </button>

      {/* Prev button */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors text-xl"
          aria-label="上一张"
        >
          &larr;
        </button>
      )}

      {/* Next button */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors text-xl"
          aria-label="下一张"
        >
          &rarr;
        </button>
      )}

      {/* Image & Info */}
      <div
        className="max-w-[90vw] max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 flex items-center justify-center min-h-0">
          <img
            src={photo.url}
            alt={photo.title}
            className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
          />
        </div>

        <div className="mt-4 text-center max-w-lg">
          <h3 className="text-lg font-bold text-white">{photo.title}</h3>
          {photo.description && (
            <p className="mt-1 text-sm text-white/60">{photo.description}</p>
          )}
          {photo.tags && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {parseTags(photo.tags).map((tag, i) => (
                <span
                  key={i}
                  className="inline-block px-2 py-0.5 text-xs rounded-md bg-white/10 text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 text-xs text-white/30">
            {currentIndex + 1} / {photos.length}
          </div>
        </div>
      </div>
    </div>
  );
}
