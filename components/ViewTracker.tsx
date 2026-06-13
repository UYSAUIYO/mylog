"use client";

import { useEffect } from "react";

/**
 * 文章浏览计数 — 组件挂载时 POST 一次 view API
 */
export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/articles/${slug}/view`, { method: "POST" }).catch(() => {});
  }, [slug]);

  return null;
}
