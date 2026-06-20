import { prisma } from "@/lib/prisma";
import type { Note } from "@/generated/prisma/client";

export type { Note };

const PAGE_SIZE = 20;

export async function getNotes(page = 1, pageSize = PAGE_SIZE) {
  const skip = (page - 1) * pageSize;
  const [notes, total] = await Promise.all([
    prisma.note.findMany({ orderBy: { createdAt: "desc" }, skip, take: pageSize }),
    prisma.note.count(),
  ]);
  return { notes, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createNote(content: string, images?: string[]) {
  return prisma.note.create({
    data: {
      content,
      images: images && images.length > 0 ? JSON.stringify(images) : null,
    },
  });
}

export async function updateNote(id: number, content: string, images?: string[]) {
  return prisma.note.update({
    where: { id },
    data: {
      content,
      images: images ? JSON.stringify(images) : null,
    },
  });
}

export async function deleteNote(id: number) {
  return prisma.note.delete({ where: { id } });
}
