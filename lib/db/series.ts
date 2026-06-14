import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

// Types
export interface CreateSeriesInput {
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
}

export interface UpdateSeriesInput {
  name?: string;
  slug?: string;
  description?: string;
  coverImage?: string;
}

const SERIES_INCLUDE = {
  _count: { select: { articles: true } },
} satisfies Prisma.SeriesInclude;

export type SeriesWithCount = Prisma.SeriesGetPayload<{
  include: typeof SERIES_INCLUDE;
}>;

export async function getSeriesList(): Promise<SeriesWithCount[]> {
  return prisma.series.findMany({
    include: SERIES_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

export async function getSeriesBySlug(slug: string) {
  return prisma.series.findUnique({
    where: { slug },
    include: {
      articles: {
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              publishedAt: true,
              readingTime: true,
              status: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
      _count: { select: { articles: true } },
    },
  });
}

export async function getSeriesById(id: number) {
  return prisma.series.findUnique({
    where: { id },
    include: {
      articles: {
        include: {
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
      _count: { select: { articles: true } },
    },
  });
}

export async function createSeries(input: CreateSeriesInput): Promise<SeriesWithCount> {
  return prisma.series.create({
    data: input,
    include: SERIES_INCLUDE,
  });
}

export async function updateSeries(id: number, input: UpdateSeriesInput): Promise<SeriesWithCount> {
  return prisma.series.update({
    where: { id },
    data: input,
    include: SERIES_INCLUDE,
  });
}

export async function deleteSeries(id: number): Promise<void> {
  await prisma.series.delete({ where: { id } });
}

export async function addArticleToSeries(seriesId: number, articleId: number): Promise<void> {
  const maxOrder = await prisma.seriesArticle.aggregate({
    where: { seriesId },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  await prisma.seriesArticle.create({
    data: { seriesId, articleId, order: nextOrder },
  });
}

export async function removeArticleFromSeries(seriesId: number, articleId: number): Promise<void> {
  await prisma.seriesArticle.delete({
    where: { seriesId_articleId: { seriesId, articleId } },
  });
}

export async function reorderSeriesArticles(
  seriesId: number,
  articleIds: number[]
): Promise<void> {
  await prisma.$transaction(
    articleIds.map((articleId, index) =>
      prisma.seriesArticle.update({
        where: { seriesId_articleId: { seriesId, articleId } },
        data: { order: index + 1 },
      })
    )
  );
}

export function generateSeriesSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);
}
