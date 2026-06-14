import { Metadata } from "next";
import { notFound } from "next/navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import TableOfContents from "@/components/TableOfContents";
import CategoryTree from "@/components/CategoryTree";
import GlassCard from "@/components/glass/GlassCard";
import GlassBadge from "@/components/glass/GlassBadge";
import Link from "next/link";
import ViewTracker from "@/components/ViewTracker";
import ArticleStatsBar from "@/components/ArticleStatsBar";
import SeriesNav from "@/components/SeriesNav";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug, deletedAt: null },
    include: {
      author: {
        select: { id: true, username: true, displayName: true, avatar: true },
      },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article || article.status !== "PUBLISHED") {
    return { title: "文章不存在" };
  }

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt || "";
  const ogImage = article.ogImage || article.coverImage || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      images: ogImage ? [{ url: ogImage }] : [],
    },
    alternates: {
      canonical: article.canonicalUrl || undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.author.displayName || article.author.username,
    },
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_200px] gap-8">
          {/* 左侧分类导航 */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <CategoryTree />
            </div>
          </aside>

          {/* 中间正文 */}
          <main className="min-w-0">
            {/* 封面图——弱玻璃 */}
            {article.coverImage && (
              <GlassCard variant="sm" className="mb-8 p-2 overflow-hidden">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full rounded-lg"
                />
              </GlassCard>
            )}

            {/* 元信息条 — 弱玻璃 + 菱形纹理 */}
            <GlassCard variant="sm" diamond className="mb-8">
              {article.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {article.categories.map(({ category }) => (
                    <GlassBadge
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                    >
                      {category.name}
                    </GlassBadge>
                  ))}
                </div>
              )}

              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 leading-tight">
                {article.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                {date && <time>{date}</time>}
                {article.readingTime > 0 && (
                  <span>{article.readingTime} 分钟阅读</span>
                )}
                <span>{article.viewCount} 次浏览</span>
              </div>

              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {article.tags.map(({ tag }) => (
                    <Link
                      key={tag.slug}
                      href={`/tags/${tag.slug}`}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-white/15 dark:bg-zinc-800/30 border border-white/30 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:bg-white/25 dark:hover:bg-zinc-700/50 transition-all"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* 正文 —— 极简 prose，高对比 */}
            <div className="mb-12">
              <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50 prose-p:text-zinc-700 dark:prose-p:text-zinc-200 prose-strong:text-zinc-900 dark:prose-strong:text-zinc-50 prose-code:text-zinc-800 dark:prose-code:text-zinc-200">
                <MarkdownRenderer content={article.content} />
              </div>
            </div>

            {/* View count */}
            <ViewTracker slug={article.slug} />

            {/* Series navigation */}
            <SeriesNav articleId={article.id} />

            {/* 统计栏 */}
            <div className="mb-12">
              <ArticleStatsBar slug={article.slug} />
            </div>

            {/* Comments */}
            <div id="comments">
            <CommentSection
              articleId={article.id}
              allowComment={article.allowComment}
            />
            </div>
          </main>

          {/* 右侧文章目录 */}
          <aside className="hidden xl:block">
            <div className="sticky top-20">
              <GlassCard variant="sm">
                <TableOfContents content={article.content} />
              </GlassCard>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
