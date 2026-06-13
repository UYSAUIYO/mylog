import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

// Types
export interface ArticleListParams {
  page?: number;
  pageSize?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
  orderBy?: "publishedAt" | "createdAt" | "updatedAt";
  order?: "asc" | "desc";
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  categoryIds?: number[];
  tagIds?: number[];
  authorId: number;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  allowComment?: boolean;
}

export interface UpdateArticleInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  categoryIds?: number[];
  tagIds?: number[];
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  allowComment?: boolean;
  isPinned?: boolean;
}

const ARTICLE_INCLUDE = {
  author: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
    },
  },
  categories: {
    include: {
      category: true,
    },
  },
  tags: {
    include: {
      tag: true,
    },
  },
  _count: {
    select: {
      comments: {
        where: { status: "APPROVED" },
      },
    },
  },
} satisfies Prisma.ArticleInclude;

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: typeof ARTICLE_INCLUDE;
}>;

// Query functions
export async function getArticles(
  params: ArticleListParams = {}
): Promise<{ articles: ArticleWithRelations[]; total: number }> {
  const {
    page = 1,
    pageSize = 10,
    status,
    categorySlug,
    tagSlug,
    search,
    orderBy = "publishedAt",
    order = "desc",
  } = params;

  const where: Prisma.ArticleWhereInput = {
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  if (categorySlug) {
    where.categories = {
      some: {
        category: { slug: categorySlug },
      },
    };
  }

  if (tagSlug) {
    where.tags = {
      some: {
        tag: { slug: tagSlug },
      },
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { content: { contains: search } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: ARTICLE_INCLUDE,
      orderBy: [{ isPinned: "desc" }, { [orderBy]: order }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, total };
}

export async function getArticleBySlug(
  slug: string
): Promise<ArticleWithRelations | null> {
  return prisma.article.findUnique({
    where: { slug, deletedAt: null },
    include: ARTICLE_INCLUDE,
  });
}

export async function getArticleById(
  id: number
): Promise<ArticleWithRelations | null> {
  return prisma.article.findUnique({
    where: { id, deletedAt: null },
    include: ARTICLE_INCLUDE,
  });
}

export async function createArticle(
  input: CreateArticleInput
): Promise<ArticleWithRelations> {
  const { categoryIds, tagIds, ...data } = input;

  // Calculate reading time (approx 300 chars/min)
  const wordCount = data.content.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 300));

  return prisma.article.create({
    data: {
      ...data,
      wordCount,
      readingTime,
      categories: categoryIds
        ? {
            create: categoryIds.map((categoryId) => ({
              category: { connect: { id: categoryId } },
            })),
          }
        : undefined,
      tags: tagIds
        ? {
            create: tagIds.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          }
        : undefined,
    },
    include: ARTICLE_INCLUDE,
  });
}

export async function updateArticle(
  id: number,
  input: UpdateArticleInput
): Promise<ArticleWithRelations> {
  const { categoryIds, tagIds, content, status, ...data } = input;

  // Calculate reading time if content changes
  const updateData: Prisma.ArticleUpdateInput = { ...data };

  if (content) {
    updateData.content = content;
    updateData.wordCount = content.length;
    updateData.readingTime = Math.max(1, Math.ceil(content.length / 300));
  }

  if (status === "PUBLISHED") {
    updateData.status = "PUBLISHED";
    updateData.isPublished = true;
    updateData.publishedAt = updateData.publishedAt ?? new Date();
  } else if (status) {
    updateData.status = status;
    updateData.isPublished = false;
  }

  // Handle categories
  if (categoryIds !== undefined) {
    await prisma.articleCategory.deleteMany({ where: { articleId: id } });
    if (categoryIds.length > 0) {
      await prisma.articleCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          articleId: id,
          categoryId,
        })),
      });
    }
  }

  // Handle tags
  if (tagIds !== undefined) {
    await prisma.articleTag.deleteMany({ where: { articleId: id } });
    if (tagIds.length > 0) {
      await prisma.articleTag.createMany({
        data: tagIds.map((tagId) => ({
          articleId: id,
          tagId,
        })),
      });
    }
  }

  return prisma.article.update({
    where: { id },
    data: updateData,
    include: ARTICLE_INCLUDE,
  });
}

export async function deleteArticle(id: number): Promise<void> {
  // Soft delete
  await prisma.article.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function incrementViewCount(slug: string): Promise<void> {
  await prisma.article.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  });
}

export async function slugExists(
  slug: string,
  excludeId?: number
): Promise<boolean> {
  const where: Prisma.ArticleWhereInput = { slug, deletedAt: null };
  if (excludeId) {
    where.id = { not: excludeId };
  }
  const count = await prisma.article.count({ where });
  return count > 0;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);
}

/**
 * 切换文章点赞：已点赞则取消，未点赞则点赞
 * @returns { liked: boolean; likeCount: number }
 */
export async function toggleArticleLike(
  slug: string,
  ipHash: string
): Promise<{ liked: boolean; likeCount: number }> {
  const article = await prisma.article.findUnique({
    where: { slug, deletedAt: null },
    select: { id: true },
  });
  if (!article) throw new Error("文章不存在");

  const existing = await prisma.articleLike.findUnique({
    where: { articleId_ipHash: { articleId: article.id, ipHash } },
  });

  if (existing) {
    // 取消点赞
    await prisma.$transaction([
      prisma.articleLike.delete({ where: { id: existing.id } }),
      prisma.article.update({
        where: { id: article.id },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    const updated = await prisma.article.findUnique({
      where: { id: article.id },
      select: { likeCount: true },
    });
    return { liked: false, likeCount: updated!.likeCount };
  } else {
    // 点赞
    await prisma.$transaction([
      prisma.articleLike.create({
        data: { articleId: article.id, ipHash },
      }),
      prisma.article.update({
        where: { id: article.id },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    const updated = await prisma.article.findUnique({
      where: { id: article.id },
      select: { likeCount: true },
    });
    return { liked: true, likeCount: updated!.likeCount };
  }
}

/**
 * 获取文章统计数据
 */
export async function getArticleStats(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug, deletedAt: null },
    select: {
      viewCount: true,
      likeCount: true,
      _count: { select: { comments: { where: { status: "APPROVED" } } } },
    },
  });
  if (!article) throw new Error("文章不存在");
  return {
    viewCount: article.viewCount,
    likeCount: article.likeCount,
    commentCount: article._count.comments,
  };
}

/**
 * 检查用户是否已点赞某篇文章
 */
export async function checkArticleLiked(
  slug: string,
  ipHash: string
): Promise<boolean> {
  const article = await prisma.article.findUnique({
    where: { slug, deletedAt: null },
    select: { id: true },
  });
  if (!article) return false;
  const like = await prisma.articleLike.findUnique({
    where: { articleId_ipHash: { articleId: article.id, ipHash } },
  });
  return !!like;
}
