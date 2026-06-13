import { NextRequest, NextResponse } from "next/server";
import { toggleCommentLike } from "@/lib/db/comments";
import crypto from "crypto";

function getIpHash(request: NextRequest): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return crypto.createHash("sha256").update(ip).digest("hex");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const commentId = parseInt(id);
  if (isNaN(commentId)) {
    return NextResponse.json({ error: "无效的评论ID" }, { status: 400 });
  }

  const ipHash = getIpHash(request);

  try {
    const result = await toggleCommentLike(commentId, ipHash);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
