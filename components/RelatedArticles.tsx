import { prisma } from "@/lib/prisma";
import FeaturedPostCard from "@/components/home/FeaturedPostCard";

interface RelatedArticlesProps {
  articleId: number;
  tagIds: number[];
  categoryIds: number[];
}

export default async function RelatedArticles({
  articleId,
  tagIds,
  categoryIds,
}: RelatedArticlesProps) {
  // If no tags or categories, nothing to match
  if (tagIds.length === 0 && categoryIds.length === 0) return null;

  // Find related articles: same tags > same category > recent, exclude current
  const related = await prisma.article.findMany({
    where: {
      id: { not: articleId },
      deletedAt: null,
      status: "PUBLISHED",
      OR: [
        ...(tagIds.length > 0
          ? [{ tags: { some: { tagId: { in: tagIds } } } }]
          : []),
        ...(categoryIds.length > 0
          ? [{ categories: { some: { categoryId: { in: categoryIds } } } }]
          : []),
      ],
    },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: { where: { status: "APPROVED" } } } },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  if (related.length === 0) return null;

  return (
    <section className="mb-6 sm:mb-12">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
        <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
        相关推荐
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {related.map((article) => (
          <FeaturedPostCard
            key={article.id}
            title={article.title}
            slug={article.slug}
            excerpt={article.excerpt || undefined}
            publishedAt={article.publishedAt?.toISOString()}
            readingTime={article.readingTime}
            viewCount={article.viewCount}
            commentCount={article._count.comments}
            isPinned={article.isPinned}
            categories={article.categories}
            tags={article.tags}
            compact
          />
        ))}
      </div>
    </section>
  );
}
