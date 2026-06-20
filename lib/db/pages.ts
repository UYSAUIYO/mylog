import { prisma } from "@/lib/prisma";
import type { Page } from "@/generated/prisma/client";

export type { Page };

export interface CreatePageInput {
  title: string;
  slug: string;
  content: string;
  isPublished?: boolean;
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  content?: string;
  isPublished?: boolean;
}

const PAGE_SIZE = 10;

export async function getPages(page = 1, pageSize = PAGE_SIZE) {
  const skip = (page - 1) * pageSize;
  const [pages, total] = await Promise.all([
    prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.page.count(),
  ]);
  return { pages, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getPublishedPages() {
  return prisma.page.findMany({
    where: { isPublished: true },
    select: { id: true, title: true, slug: true },
    orderBy: { title: "asc" },
  });
}

export async function getPageBySlug(slug: string) {
  return prisma.page.findUnique({ where: { slug, isPublished: true } });
}

export async function getPageById(id: number) {
  return prisma.page.findUnique({ where: { id } });
}

export async function createPage(data: CreatePageInput) {
  return prisma.page.create({ data });
}

export async function updatePage(id: number, data: UpdatePageInput) {
  return prisma.page.update({ where: { id }, data });
}

export async function deletePage(id: number) {
  return prisma.page.delete({ where: { id } });
}
