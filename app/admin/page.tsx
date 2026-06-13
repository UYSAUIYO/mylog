"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  articleCount: number;
  publishedCount: number;
  draftCount: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  approvedComments: number;
  pendingComments: number;
  categoryCount: number;
  tagCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        setStats(await res.json());
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-zinc-400">加载中...</div>
    );
  }

  const statCards = stats
    ? [
        { label: "总文章数", value: stats.articleCount, href: "/admin/posts", color: "from-blue-500/10 to-cyan-500/5" },
        { label: "已发布", value: stats.publishedCount, href: "/admin/posts?status=PUBLISHED", color: "from-emerald-500/10 to-teal-500/5" },
        { label: "草稿", value: stats.draftCount, href: "/admin/posts?status=DRAFT", color: "from-amber-500/10 to-yellow-500/5" },
        { label: "总浏览量", value: stats.totalViews, href: null, color: "from-purple-500/10 to-pink-500/5" },
        { label: "总点赞", value: stats.totalLikes, href: null, color: "from-red-500/10 to-rose-500/5" },
        { label: "总评论", value: stats.totalComments, extra: `${stats.approvedComments} 已通过`, href: "/admin/comments", color: "from-violet-500/10 to-indigo-500/5" },
        { label: "待审核", value: stats.pendingComments, href: "/admin/comments?status=PENDING", color: "from-orange-500/10 to-red-500/5" },
        { label: "分类数", value: stats.categoryCount, href: "/admin/categories", color: "from-sky-500/10 to-blue-500/5" },
        { label: "标签数", value: stats.tagCount, href: "/admin/tags", color: "from-teal-500/10 to-green-500/5" },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        仪表盘
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => {
          const content = (
            <div
              className={`relative bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md rounded-2xl border border-white/30 dark:border-zinc-700/30 p-5 overflow-hidden ${
                card.href ? "hover:border-blue-300/60 dark:hover:border-blue-600/40 transition-colors" : ""
              }`}
            >
              {/* 彩色渐变更底 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} pointer-events-none`} />
              <div className="relative">
                <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1 tabular-nums">
                  {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {card.label}
                </div>
                {card.extra && (
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    {card.extra}
                  </div>
                )}
              </div>
            </div>
          );

          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all active:scale-95"
        >
          写新文章
        </Link>
        <Link
          href="/"
          target="_blank"
          className="px-4 py-2 border border-zinc-300/60 dark:border-zinc-600/60 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md text-sm text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-white/80 dark:hover:bg-zinc-700/80 transition-all"
        >
          查看博客
        </Link>
      </div>
    </div>
  );
}
