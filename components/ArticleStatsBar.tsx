"use client";

import { useState, useEffect } from "react";

interface ArticleStatsBarProps {
  slug: string;
}

export default function ArticleStatsBar({ slug }: ArticleStatsBarProps) {
  const [stats, setStats] = useState({ viewCount: 0, likeCount: 0, commentCount: 0 });
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 获取统计
    fetch(`/api/articles/${slug}/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});

    // 检查点赞状态
    fetch(`/api/articles/${slug}/like`)
      .then((r) => r.json())
      .then((d) => setLiked(d.liked))
      .catch(() => {});
  }, [slug]);

  async function handleLike() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${slug}/like`, { method: "POST" });
      const data = await res.json();
      setLiked(data.liked);
      setStats((prev) => ({ ...prev, likeCount: data.likeCount }));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  const items = [
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      label: "浏览",
      value: stats.viewCount,
      href: undefined,
    },
    {
      icon: (
        <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      label: "点赞",
      value: stats.likeCount,
      isLike: true,
      active: liked,
    },
    {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      label: "评论",
      value: stats.commentCount,
      href: "#comments",
    },
  ];

  return (
    <div className="flex items-center gap-5 py-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          {item.isLike ? (
            <button
              onClick={handleLike}
              disabled={loading}
              className={`inline-flex items-center gap-1.5 transition-all ${
                item.active
                  ? "text-red-500 hover:text-red-600"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-red-400"
              }`}
              title={item.active ? "取消点赞" : "点赞"}
            >
              {item.icon}
              <span className="text-sm tabular-nums">{item.value}</span>
            </button>
          ) : item.href ? (
            <a href={item.href} className="inline-flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 hover:text-blue-500 transition-colors">
              {item.icon}
              <span className="text-sm tabular-nums">{item.value}</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500">
              {item.icon}
              <span className="text-sm tabular-nums">{item.value}</span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
