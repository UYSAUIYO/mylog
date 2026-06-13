import { NextRequest, NextResponse } from "next/server";
import { toggleArticleLike, checkArticleLiked } from "@/lib/db/articles";
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
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ipHash = getIpHash(request);

  try {
    const result = await toggleArticleLike(slug, ipHash);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "文章不存在") {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ipHash = getIpHash(request);

  try {
    const liked = await checkArticleLiked(slug, ipHash);
    return NextResponse.json({ liked });
  } catch {
    return NextResponse.json({ liked: false });
  }
}
