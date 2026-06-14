import { prisma } from "@/lib/prisma";
import type { Photo } from "@/generated/prisma/client";

export type { Photo };

export interface CreatePhotoInput {
  title: string;
  description?: string;
  url: string;
  tags?: string;
}

export interface UpdatePhotoInput {
  title?: string;
  description?: string;
  tags?: string;
}

const PAGE_SIZE = 12;

export async function getPhotos(page = 1, pageSize = PAGE_SIZE) {
  const skip = (page - 1) * pageSize;
  const [photos, total] = await Promise.all([
    prisma.photo.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.photo.count(),
  ]);

  return {
    photos,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPhotoById(id: number) {
  return prisma.photo.findUnique({ where: { id } });
}

export async function createPhoto(data: CreatePhotoInput) {
  return prisma.photo.create({ data });
}

export async function updatePhoto(id: number, data: UpdatePhotoInput) {
  return prisma.photo.update({ where: { id }, data });
}

export async function deletePhoto(id: number) {
  return prisma.photo.delete({ where: { id } });
}

export async function getPhotoCount() {
  return prisma.photo.count();
}
