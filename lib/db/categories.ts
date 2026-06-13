import { prisma } from "@/lib/prisma";
import type { Category } from "@/generated/prisma/client";

export async function getCategories(): Promise<Category[]> {
  return prisma.category.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getCategoryById(id: number): Promise<Category | null> {
  return prisma.category.findUnique({ where: { id } });
}

export async function createCategory(
  name: string,
  slug: string,
  description?: string
): Promise<Category> {
  return prisma.category.create({
    data: { name, slug, description },
  });
}

export async function updateCategory(
  id: number,
  data: { name?: string; slug?: string; description?: string }
): Promise<Category> {
  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(id: number): Promise<void> {
  await prisma.category.delete({ where: { id } });
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}
