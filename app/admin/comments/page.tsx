"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: number;
  articleId: number;
  parentId: number | null;
  authorName: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SPAM";
  createdAt: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    setLoading(true);
    try {
      // Fetch all comments (simplified - in prod would need admin API for all)
      const res = await fetch("/api/comments?articleId=-1");
      if (!res.ok) {
        setComments([]);
        return;
      }
      setComments([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    id: number,
    status: "APPROVED" | "REJECTED" | "SPAM"
  ) {
    try {
      await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setComments(comments.filter((c) => c.id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除此评论？")) return;
    try {
      await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      setComments(comments.filter((c) => c.id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-zinc-400">加载中...</div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        评论审核
      </h1>

      {comments.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">暂无待审核评论</div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-zinc-400 ml-2">
                    {new Date(comment.createdAt).toLocaleString("zh-CN")}
                  </span>
                  <span
                    className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                      comment.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : comment.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {comment.status === "PENDING"
                      ? "待审核"
                      : comment.status === "APPROVED"
                      ? "已通过"
                      : comment.status === "REJECTED"
                      ? "已拒绝"
                      : "垃圾"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">
                {comment.content}
              </p>
              <div className="flex gap-2">
                {comment.status !== "APPROVED" && (
                  <button
                    onClick={() => handleStatusChange(comment.id, "APPROVED")}
                    className="text-xs px-2.5 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-200"
                  >
                    通过
                  </button>
                )}
                {comment.status !== "REJECTED" && (
                  <button
                    onClick={() => handleStatusChange(comment.id, "REJECTED")}
                    className="text-xs px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100"
                  >
                    拒绝
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange(comment.id, "SPAM")}
                  className="text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded hover:bg-zinc-200"
                >
                  垃圾评论
                </button>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs px-2.5 py-1 text-red-500 hover:bg-red-50 rounded"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
