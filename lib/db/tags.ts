import { prisma } from "@/lib/prisma";
import type { Tag } from "@/generated/prisma/client";

export async function getTags(): Promise<Tag[]> {
  return prisma.tag.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  return prisma.tag.findUnique({ where: { slug } });
}

export async function getTagById(id: number): Promise<Tag | null> {
  return prisma.tag.findUnique({ where: { id } });
}

export async function createTag(name: string, slug: string): Promise<Tag> {
  return prisma.tag.create({
    data: { name, slug },
  });
}

export async function updateTag(
  id: number,
  data: { name?: string; slug?: string }
): Promise<Tag> {
  return prisma.tag.update({
    where: { id },
    data,
  });
}

export async function deleteTag(id: number): Promise<void> {
  await prisma.tag.delete({ where: { id } });
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100);
}
