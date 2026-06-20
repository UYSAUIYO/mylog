import { prisma } from "@/lib/prisma";
import type { FriendLink } from "@/generated/prisma/client";

export type { FriendLink };

export interface CreateFriendLinkInput {
  name: string;
  url: string;
  description?: string;
  icon?: string;
  category?: string;
}

export interface UpdateFriendLinkInput {
  name?: string;
  url?: string;
  description?: string;
  icon?: string;
  category?: string;
}

export async function getFriendLinks() {
  return prisma.friendLink.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
}

export interface GroupedFriendLinks {
  category: string;
  links: FriendLink[];
}

export async function getFriendLinksByCategory(): Promise<GroupedFriendLinks[]> {
  const links = await getFriendLinks();
  const map = new Map<string, FriendLink[]>();
  for (const link of links) {
    const cat = link.category || "其他";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(link);
  }
  return Array.from(map.entries()).map(([category, links]) => ({ category, links }));
}

export async function createFriendLink(data: CreateFriendLinkInput) {
  return prisma.friendLink.create({ data });
}

export async function updateFriendLink(id: number, data: UpdateFriendLinkInput) {
  return prisma.friendLink.update({ where: { id }, data });
}

export async function deleteFriendLink(id: number) {
  return prisma.friendLink.delete({ where: { id } });
}
