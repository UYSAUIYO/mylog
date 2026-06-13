import Link from "next/link";
import GlassCard from "@/components/glass/GlassCard";
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
    take: 20,
  });
}

export default async function TopicCloud() {
  const [categories, tags] = await Promise.all([
    getCategoriesWithCount(),
    getTagsWithCount(),
  ]);

  return (
    <GlassCard variant="sm" className="space-y-6">
      {/* 分类 */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
          分类
        </h4>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/"
              className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-white/20 dark:hover:bg-zinc-700/30 transition-colors"
            >
              全部文章
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/categories/${cat.slug}`}
                className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-white/20 dark:hover:bg-zinc-700/30 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
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

      {/* 标签云 */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
          标签
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-white/20 dark:bg-zinc-800/30 border border-white/30 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:bg-white/30 dark:hover:bg-zinc-700/50 hover:border-white/50 dark:hover:border-zinc-600/60 hover:text-zinc-700 dark:hover:text-zinc-300 transition-all"
            >
              {tag.name}
              <span className="text-zinc-400 dark:text-zinc-500">
                {tag._count.articles}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
