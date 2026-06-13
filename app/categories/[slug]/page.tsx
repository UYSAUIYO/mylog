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

async function getCategory(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

async function getArticles(categorySlug: string, page: number) {
  const pageSize = 9;
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        categories: { some: { category: { slug: categorySlug } } },
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
        categories: { some: { category: { slug: categorySlug } } },
      },
    }),
  ]);

  return { articles, total };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "分类不存在" };

  return {
    title: category.name,
    description: category.description || `${category.name} 下的所有文章`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseInt(sp.page || "1");

  const category = await getCategory(slug);
  if (!category) notFound();

  const { articles, total } = await getArticles(slug, page);
  const totalPages = Math.ceil(total / 9);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block">
          &larr; 返回首页
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            {category.description}
          </p>
        )}
        <p className="text-sm text-zinc-400 mt-1">{total} 篇文章</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-lg">该分类下暂无文章</p>
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
            baseUrl={`/categories/${slug}`}
          />
        </>
      )}
    </div>
  );
}
