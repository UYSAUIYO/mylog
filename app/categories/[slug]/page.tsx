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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 border-b border-zinc-300/80 pb-8 dark:border-zinc-800">
        <Link href="/" className="mb-5 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400">
          ← Back Home
        </Link>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400 dark:text-zinc-600">
          Category
        </p>
        <h1 className="text-5xl font-black tracking-[-0.07em] text-zinc-950 dark:text-zinc-50 sm:text-7xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            {category.description}
          </p>
        )}
        <p className="mt-5 font-mono text-xs text-zinc-500">{total} ARTICLES</p>
      </header>

      {articles.length === 0 ? (
        <div className="border-y border-zinc-300/80 py-20 text-center dark:border-zinc-800">
          <p className="text-zinc-500">该分类下暂无文章</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
