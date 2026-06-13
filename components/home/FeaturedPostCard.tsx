import Link from "next/link";
import GlassCard from "@/components/glass/GlassCard";
import GlassBadge from "@/components/glass/GlassBadge";

interface FeaturedPostCardProps {
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

export default function FeaturedPostCard({
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
}: FeaturedPostCardProps) {
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <GlassCard
      as="article"
      variant={compact ? "sm" : "md"}
      hover
      diamond={!compact}
      className="group overflow-hidden"
    >
      {!compact && coverImage && (
        <Link href={`/posts/${slug}`} className="block -mx-6 -mt-6 mb-5">
          <div className="aspect-video overflow-hidden rounded-t-2xl">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {categories.map(({ category }) => (
            <GlassBadge key={category.slug} href={`/categories/${category.slug}`}>
              {category.name}
            </GlassBadge>
          ))}
        </div>
      )}

      {/* Title */}
      <Link href={`/posts/${slug}`}>
        <h2
          className={`${
            compact ? "text-sm" : "text-xl"
          } font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 leading-snug`}
        >
          {isPinned && (
            <span className="inline-block mr-1.5 text-amber-500 text-xs align-middle">
              &#x1F4CC;
            </span>
          )}
          {title}
        </h2>
      </Link>

      {/* Excerpt */}
      {!compact && excerpt && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
          {excerpt}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
        {date && <time>{date}</time>}
        {!compact && readingTime && readingTime > 0 && (
          <span>{readingTime} 分钟</span>
        )}
        {viewCount && viewCount > 0 && <span>{viewCount} 次浏览</span>}
        {commentCount && commentCount > 0 && (
          <span>{commentCount} 评论</span>
        )}
      </div>

      {/* Tags */}
      {!compact && tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-white/20 dark:border-zinc-700/30">
          {tags.map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className="text-xs px-2 py-0.5 rounded-md bg-white/20 dark:bg-zinc-800/30 border border-white/30 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:bg-white/30 dark:hover:bg-zinc-700/50 transition-all"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
