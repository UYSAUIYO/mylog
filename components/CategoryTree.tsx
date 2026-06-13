import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface CategoryWithCount {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  _count: { articles: number };
}

async function getCategoriesWithCount(): Promise<CategoryWithCount[]> {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { articles: { where: { article: { status: "PUBLISHED", deletedAt: null } } } },
      },
    },
  });
}

async function getTagsWithCount() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { articles: { where: { article: { status: "PUBLISHED", deletedAt: null } } } },
      },
    },
    take: 15,
  });
}

export default async function CategoryTree() {
  const [categories, tags] = await Promise.all([
    getCategoriesWithCount(),
    getTagsWithCount(),
  ]);

  return (
    <nav className="space-y-6">
      {/* 分类导航 */}
      <div>
        <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
          分类
        </div>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/"
              className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-md text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              全部文章
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/categories/${cat.slug}`}
                className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-md text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors group"
              >
                <span>{cat.name}</span>
                {cat._count.articles > 0 && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                    {cat._count.articles}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 标签筛选 */}
      <div>
        <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
          标签
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              {tag.name}
              <span className="text-zinc-400 dark:text-zinc-500">{tag._count.articles}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
