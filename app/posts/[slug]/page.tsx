import { Metadata } from "next";
import { notFound } from "next/navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import TableOfContents from "@/components/TableOfContents";
import CategoryTree from "@/components/CategoryTree";
import GlassBadge from "@/components/glass/GlassBadge";
import ViewTracker from "@/components/ViewTracker";
import ArticleStatsBar from "@/components/ArticleStatsBar";
import SeriesNav from "@/components/SeriesNav";
import { prisma } from "@/lib/prisma";
import ReadingProgress from "@/components/ReadingProgress";
import RelatedArticles from "@/components/RelatedArticles";

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
        month: "2-digit",
        day: "2-digit",
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
      <ReadingProgress />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)_220px]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <div className="border-y border-zinc-300/80 py-4 text-xs uppercase tracking-[0.18em] text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
                <div className="mb-3 font-semibold text-zinc-950 dark:text-zinc-50">Article</div>
                {date && <div className="font-mono tracking-normal">{date}</div>}
                {article.readingTime > 0 && <div className="mt-2 tracking-normal">{article.readingTime} min read</div>}
                <div className="mt-2 tracking-normal">{article.viewCount} views</div>
              </div>
              <CategoryTree />
            </div>
          </aside>

          <main className="min-w-0">
            <header className="mb-10 border-b border-zinc-300/80 pb-8 dark:border-zinc-800">
              <div className="mb-5 flex flex-wrap gap-2">
                {article.categories.map(({ category }) => (
                  <GlassBadge key={category.slug} href={`/categories/${category.slug}`}>
                    {category.name}
                  </GlassBadge>
                ))}
              </div>

              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
                Journal Article
              </p>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.06em] text-zinc-950 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
                  {article.excerpt}
                </p>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-500">
                {date && <time className="font-mono tracking-normal">{date}</time>}
                {article.readingTime > 0 && <span>{article.readingTime} min</span>}
                <span>{article.viewCount} views</span>
              </div>

              {article.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {article.tags.map(({ tag }) => (
                    <GlassBadge key={tag.slug} href={`/tags/${tag.slug}`}>
                      {tag.name}
                    </GlassBadge>
                  ))}
                </div>
              )}
            </header>

            {article.coverImage && (
              <div className="mb-10 border border-zinc-300/80 bg-[#fbfaf7] p-2 dark:border-zinc-800 dark:bg-zinc-950">
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full grayscale"
                />
              </div>
            )}

            <article className="mb-12">
              <div className="prose prose-zinc max-w-[76ch] dark:prose-invert prose-headings:scroll-mt-24 prose-headings:text-zinc-950 dark:prose-headings:text-zinc-50 prose-p:text-zinc-700 dark:prose-p:text-zinc-200 prose-strong:text-zinc-950 dark:prose-strong:text-zinc-50 prose-li:text-zinc-700 dark:prose-li:text-zinc-200">
                <MarkdownRenderer content={article.content} />
              </div>
            </article>

            <ViewTracker slug={article.slug} />

            <div className="space-y-8 border-t border-zinc-300/80 pt-8 dark:border-zinc-800">
              <SeriesNav articleId={article.id} />
              <RelatedArticles
                articleId={article.id}
                tagIds={article.tags.map((t) => t.tag.id)}
                categoryIds={article.categories.map((c) => c.category.id)}
              />
              <ArticleStatsBar slug={article.slug} />
              <div id="comments">
                <CommentSection
                  articleId={article.id}
                  allowComment={article.allowComment}
                />
              </div>
            </div>
          </main>

          <aside className="hidden xl:block">
            <div className="sticky top-24">
              <TableOfContents content={article.content} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
