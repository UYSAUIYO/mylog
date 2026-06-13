import { prisma } from "@/lib/prisma";
import type { Comment, Prisma } from "@/generated/prisma/client";

export type CommentWithReplies = Prisma.CommentGetPayload<{
  include: {
    replies: {
      include: {
        replies: true;
      };
    };
  };
}>;

export async function getCommentsByArticleId(
  articleId: number,
  page = 1,
  pageSize = 20
): Promise<{ comments: CommentWithReplies[]; total: number }> {
  const where: Prisma.CommentWhereInput = {
    articleId,
    status: "APPROVED",
    parentId: null, // Get top-level comments only
  };

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: {
        replies: {
          where: { status: "APPROVED" },
          include: {
            replies: {
              where: { status: "APPROVED" },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.comment.count({ where }),
  ]);

  return { comments, total };
}

export interface CreateCommentInput {
  articleId: number;
  parentId?: number;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  content: string;
  ipHash?: string;
  userAgent?: string;
}

export async function createComment(
  input: CreateCommentInput
): Promise<Comment> {
  // Check nesting depth (max 2 levels)
  if (input.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: input.parentId },
      select: { parentId: true },
    });
    // If parent has a parentId, it's already a level 2 reply
    if (parent?.parentId) {
      throw new Error("评论嵌套深度不能超过2层");
    }
  }

  return prisma.comment.create({
    data: {
      articleId: input.articleId,
      parentId: input.parentId ?? null,
      authorName: input.authorName,
      authorEmail: input.authorEmail,
      authorWebsite: input.authorWebsite ?? null,
      content: input.content,
      ipHash: input.ipHash ?? null,
      userAgent: input.userAgent ?? null,
      status: "PENDING",
    },
  });
}

export async function updateCommentStatus(
  id: number,
  status: "APPROVED" | "REJECTED" | "SPAM"
): Promise<Comment> {
  return prisma.comment.update({
    where: { id },
    data: { status },
  });
}

export async function deleteComment(id: number): Promise<void> {
  await prisma.comment.delete({ where: { id } });
}

export async function getPendingCommentCount(): Promise<number> {
  return prisma.comment.count({ where: { status: "PENDING" } });
}

/**
 * 切换评论点赞
 */
export async function toggleCommentLike(
  commentId: number,
  ipHash: string
): Promise<{ liked: boolean; likeCount: number }> {
  const existing = await prisma.commentLike.findUnique({
    where: { commentId_ipHash: { commentId, ipHash } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.commentLike.delete({ where: { id: existing.id } }),
      prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    const updated = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { likeCount: true },
    });
    return { liked: false, likeCount: updated!.likeCount };
  } else {
    await prisma.$transaction([
      prisma.commentLike.create({ data: { commentId, ipHash } }),
      prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);
    const updated = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { likeCount: true },
    });
    return { liked: true, likeCount: updated!.likeCount };
  }
}
