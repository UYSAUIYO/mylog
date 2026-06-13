import Link from "next/link";

interface ArticleCardProps {
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: string;
  readingTime?: number;
  viewCount?: number;
  commentCount?: number;
  isPinned?: boolean;
  categories?: { category: { name: string; slug: string } }[];
  tags?: { tag: { name: string; slug: string } }[];
  compact?: boolean;
}

export default function ArticleCard({
  title,
  slug,
  excerpt,
  coverImage,
  publishedAt,
  readingTime,
  viewCount,
  commentCount,
  isPinned,
  categories,
  tags,
  compact,
}: ArticleCardProps) {
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article className={`group bg-white dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors overflow-hidden ${compact ? "" : ""}`}>
      {!compact && coverImage && (
        <Link href={`/posts/${slug}`}>
          <div className="aspect-video overflow-hidden">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      <div className={compact ? "p-3" : "p-5"}>
        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {categories.map(({ category }) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/posts/${slug}`}>
          <h2 className={`${compact ? "text-sm leading-snug" : "text-lg leading-snug"} font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5`}>
            {isPinned && (
              <span className="inline-block mr-1.5 text-red-500 text-xs align-middle">
                &#x1F4CC;
              </span>
            )}
            {title}
          </h2>
        </Link>

        {/* Excerpt */}
        {!compact && excerpt && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          {date && <time>{date}</time>}
          {!compact && readingTime !== undefined && readingTime > 0 && (
            <span>{readingTime} 分钟阅读</span>
          )}
          {viewCount !== undefined && viewCount > 0 && (
            <span>{viewCount} 次浏览</span>
          )}
          {commentCount !== undefined && commentCount > 0 && (
            <span>{commentCount} 条评论</span>
          )}
        </div>

        {/* Tags */}
        {!compact && tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700/50">
            {tags.map(({ tag }) => (
              <Link
                key={tag.slug}
                href={`/tags/${tag.slug}`}
                className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
