import Link from "next/link";
import GlassBadge from "@/components/glass/GlassBadge";
import { prisma } from "@/lib/prisma";

async function getCategoriesWithCount() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          articles: { where: { article: { status: "PUBLISHED", deletedAt: null } } },
        },
      },
    },
  });
}

async function getTagsWithCount() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          articles: { where: { article: { status: "PUBLISHED", deletedAt: null } } },
        },
      },
    },
    take: 24,
  });
}

export default async function TopicCloud() {
  const [categories, tags] = await Promise.all([
    getCategoriesWithCount(),
    getTagsWithCount(),
  ]);

  return (
    <section className="border-t border-zinc-300/80 pt-8 dark:border-zinc-800">
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-600">
            Topics Index
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-zinc-950 dark:text-zinc-50">
            分类与标签
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
              Categories
            </h3>
            <div className="divide-y divide-zinc-300/80 border-y border-zinc-300/80 dark:divide-zinc-800 dark:border-zinc-800">
              <Link href="/" className="flex items-center justify-between py-2 text-sm text-zinc-700 transition-colors hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400">
                <span>全部文章</span>
                <span className="font-mono text-xs text-zinc-400">ALL</span>
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="flex items-center justify-between py-2 text-sm text-zinc-700 transition-colors hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
                >
                  <span>{cat.name}</span>
                  <span className="font-mono text-xs text-zinc-400">{cat._count.articles}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-500">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <GlassBadge key={tag.slug} href={`/tags/${tag.slug}`}>
                  {tag.name} · {tag._count.articles}
                </GlassBadge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
