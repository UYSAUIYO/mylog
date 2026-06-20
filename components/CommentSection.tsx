"use client";

import { useState, useEffect } from "react";
import CommentMarkdown from "./CommentMarkdown";

interface Comment {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
  authorWebsite?: string;
  likeCount: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  articleId: number;
  allowComment: boolean;
}

function CommentForm({
  articleId,
  parentId,
  onSuccess,
  onCancel,
}: {
  articleId: number;
  parentId?: number;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorWebsite, setAuthorWebsite] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!authorName.trim() || !authorEmail.trim() || !content.trim()) {
      setError("请填写所有必填字段");
      return;
    }

    if (content.length < 5) {
      setError("评论内容不能少于5个字符");
      return;
    }

    if (content.length > 2000) {
      setError("评论内容不能超过2000个字符");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          parentId,
          authorName,
          authorEmail,
          authorWebsite: authorWebsite || undefined,
          content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "评论提交失败");
        return;
      }

      setAuthorName("");
      setAuthorEmail("");
      setAuthorWebsite("");
      setContent("");
      onSuccess();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            昵称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3 py-2 sm:py-1.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="你的昵称"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            邮箱 <span className="text-red-500">*</span>
            <span className="text-zinc-400 font-normal text-xs ml-1">
              （不公开）
            </span>
          </label>
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className="w-full px-3 py-2 sm:py-1.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          网站
        </label>
        <input
          type="url"
          value={authorWebsite}
          onChange={(e) => setAuthorWebsite(e.target.value)}
          className="w-full px-3 py-2 sm:py-1.5 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            评论 <span className="text-red-500">*</span>
            <span className="text-zinc-400 font-normal text-xs ml-2">
              支持 Markdown
            </span>
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                !showPreview
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              编写
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                showPreview
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              预览
            </button>
          </div>
        </div>
        {showPreview ? (
          <div className="w-full min-h-[80px] px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-sm">
            {content.trim() ? (
              <CommentMarkdown content={content} />
            ) : (
              <p className="text-zinc-400 text-sm">暂无内容</p>
            )}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            placeholder="写下你的想法... 支持 **粗体** *斜体* `代码` ```代码块``` [链接](url)"
            required
          />
        )}
        <p className="text-xs text-zinc-400 mt-1">{content.length}/2000</p>
      </div>

      {/* Honeypot field */}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-4 py-2 sm:py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-40 transition-all active:scale-95"
        >
          {submitting ? "提交中..." : "提交评论"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 sm:py-1.5 border border-zinc-300 dark:border-zinc-600 text-sm text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}

function CommentLikeButton({ commentId, likeCount: initialCount }: { commentId: number; likeCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLike() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.likeCount);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`inline-flex items-center gap-1 text-xs transition-colors ${
        liked
          ? "text-red-500 hover:text-red-600"
          : "text-zinc-400 dark:text-zinc-500 hover:text-red-400"
      }`}
      title={liked ? "取消点赞" : "点赞"}
    >
      <svg className="w-3.5 h-3.5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {count > 0 && <span className="tabular-nums">{count}</span>}
    </button>
  );
}

function CommentItem({
  comment,
  articleId,
  depth = 0,
  onReply,
}: {
  comment: Comment;
  articleId: number;
  depth?: number;
  onReply: (parentId: number) => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const maxDepth = 2;

  const date = new Date(comment.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="group">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {comment.authorName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {comment.authorName}
            </span>
            {comment.authorWebsite && (
              <a
                href={comment.authorWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600"
              >
                网站
              </a>
            )}
            <span className="text-xs text-zinc-400">{date}</span>
          </div>
          <div className="text-sm text-zinc-700 dark:text-zinc-300">
            <CommentMarkdown content={comment.content} />
          </div>
          <div className="flex items-center gap-4 mt-2">
            {/* 点赞 */}
            <CommentLikeButton commentId={comment.id} likeCount={comment.likeCount} />

            {/* 回复 */}
            {depth < maxDepth - 1 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-blue-500 transition-colors"
              >
                {showReplyForm ? "取消回复" : "回复"}
              </button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                articleId={articleId}
                parentId={comment.id}
                onSuccess={() => {
                  setShowReplyForm(false);
                  onReply(comment.id);
                }}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 sm:mt-3 ml-2 pl-3 sm:pl-4 border-l-2 border-zinc-100 dark:border-zinc-800 space-y-2 sm:space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  articleId={articleId}
                  depth={depth + 1}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({
  articleId,
  allowComment,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/comments?articleId=${articleId}`);
        const data = await res.json();
        setComments(data.comments || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [articleId, refreshKey]);

  return (
    <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-700">
      <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 sm:mb-6">
        评论 ({comments.length})
      </h2>

      {allowComment ? (
        <>
          {!showNewForm && (
            <button
              onClick={() => setShowNewForm(true)}
              className="w-full sm:w-auto px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-sm text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors mb-4 sm:mb-6"
            >
              发表评论
            </button>
          )}

          {showNewForm && (
            <div className="mb-6">
              <CommentForm
                articleId={articleId}
                onSuccess={() => {
                  setShowNewForm(false);
                  setRefreshKey((k) => k + 1);
                }}
                onCancel={() => setShowNewForm(false)}
              />
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          该文章已关闭评论
        </p>
      )}

      {loading ? (
        <div className="text-center py-8 text-zinc-400 text-sm">
          加载评论中...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-zinc-400 text-sm">
          暂无评论，来抢沙发吧
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleId={articleId}
              onReply={() => setRefreshKey((k) => k + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
