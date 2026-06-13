import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import Pagination from "@/components/Pagination";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getTag(slug: string) {
  return prisma.tag.findUnique({ where: { slug } });
}

async function getArticles(tagSlug: string, page: number) {
  const pageSize = 9;
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        tags: { some: { tag: { slug: tagSlug } } },
      },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        _count: { select: { comments: { where: { status: "APPROVED" } } } },
      },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        tags: { some: { tag: { slug: tagSlug } } },
      },
    }),
  ]);

  return { articles, total };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  if (!tag) return { title: "标签不存在" };

  return {
    title: `#${tag.name}`,
    description: `标签「${tag.name}」下的所有文章`,
  };
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page || "1");

  const tag = await getTag(slug);
  if (!tag) notFound();

  const { articles, total } = await getArticles(slug, page);
  const totalPages = Math.ceil(total / 9);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block">
          &larr; 返回首页
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          #{tag.name}
        </h1>
        <p className="text-sm text-zinc-400 mt-1">{total} 篇文章</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg">该标签下暂无文章</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                slug={article.slug}
                excerpt={article.excerpt || undefined}
                coverImage={article.coverImage || undefined}
                publishedAt={article.publishedAt?.toISOString()}
                readingTime={article.readingTime}
                viewCount={article.viewCount}
                commentCount={article._count.comments}
                isPinned={article.isPinned}
                categories={article.categories}
                tags={article.tags}
              />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/tags/${slug}`}
          />
        </>
      )}
    </div>
  );
}
