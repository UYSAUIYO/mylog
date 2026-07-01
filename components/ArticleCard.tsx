import Link from "next/link";
import GlassBadge from "@/components/glass/GlassBadge";

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

function formatDate(date?: string) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
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
  const date = formatDate(publishedAt);
  const category = categories?.[0]?.category;

  return (
    <article className="group flex h-full flex-col border border-zinc-300/80 bg-[#fbfaf7] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-500">
      {!compact && coverImage && (
        <Link href={`/posts/${slug}`} className="-mx-5 -mt-5 mb-5 block border-b border-zinc-300/80 dark:border-zinc-800">
          <div className="aspect-[16/9] overflow-hidden bg-zinc-200 dark:bg-zinc-900">
            <img
              src={coverImage}
              alt={title}
              className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
              loading="lazy"
            />
          </div>
        </Link>
      )}

      <div className="mb-6 flex items-start justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
        <div className="flex flex-wrap items-center gap-2">
          {isPinned && <span className="text-blue-600 dark:text-blue-400">Pinned</span>}
          {category ? (
            <Link href={`/categories/${category.slug}`} className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-100">
              {category.name}
            </Link>
          ) : (
            <span>Article</span>
          )}
        </div>
        {date && <time className="font-mono tracking-normal">{date}</time>}
      </div>

      <Link href={`/posts/${slug}`}>
        <h2
          className={`${
            compact ? "text-base" : "text-xl sm:text-2xl"
          } font-black leading-tight tracking-[-0.035em] text-zinc-950 transition-colors group-hover:text-blue-700 dark:text-zinc-50 dark:group-hover:text-blue-400`}
        >
          {title}
        </h2>
      </Link>

      {!compact && excerpt && (
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          {excerpt}
        </p>
      )}

      <div className="mt-auto pt-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-zinc-300/80 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          {readingTime !== undefined && readingTime > 0 && <span>{readingTime} min</span>}
          {viewCount !== undefined && viewCount > 0 && <span>{viewCount} views</span>}
          {commentCount !== undefined && commentCount > 0 && <span>{commentCount} comments</span>}
        </div>

        {!compact && tags && tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map(({ tag }) => (
              <GlassBadge key={tag.slug} href={`/tags/${tag.slug}`}>
                {tag.name}
              </GlassBadge>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
