import { NextRequest, NextResponse } from "next/server";
import {
  getCommentsByArticleId,
  createComment,
} from "@/lib/db/comments";
import { containsBannedWords } from "@/lib/sensitive-words";
import crypto from "crypto";

// Simple in-memory rate limiting
const commentRateLimit = new Map<string, number>();

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const articleId = parseInt(searchParams.get("articleId") || "0");
  const page = parseInt(searchParams.get("page") || "1");

  if (!articleId) {
    return NextResponse.json(
      { error: "缺少 articleId 参数" },
      { status: 400 }
    );
  }

  try {
    const result = await getCommentsByArticleId(articleId, page);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "获取评论失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      articleId,
      parentId,
      authorName,
      authorEmail,
      authorWebsite,
      content,
    } = body;

    // Validate required fields
    if (!articleId || !authorName || !authorEmail || !content) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length < 5 || content.length > 2000) {
      return NextResponse.json(
        { error: "评论内容长度应在5-2000个字符之间" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authorEmail)) {
      return NextResponse.json(
        { error: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    // Honeypot check
    if (body.website) {
      return NextResponse.json(
        { error: "评论提交失败" },
        { status: 400 }
      );
    }

    // 违禁词检测：包含违禁词直接拒绝，不入库
    if (containsBannedWords(content) || containsBannedWords(authorName)) {
      return NextResponse.json(
        { error: "评论内容包含违禁词，请修改后重新提交" },
        { status: 400 }
      );
    }

    // Rate limiting by IP + articleId
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateKey = `${ip}:${articleId}`;
    const now = Date.now();
    const lastTime = commentRateLimit.get(rateKey);

    if (lastTime && now - lastTime < 20000) {
      // 20 seconds cooldown
      return NextResponse.json(
        { error: "评论过于频繁，请稍后再试" },
        { status: 429 }
      );
    }

    commentRateLimit.set(rateKey, now);

    // Hash IP for storage
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    const comment = await createComment({
      articleId: parseInt(String(articleId)),
      parentId: parentId ? parseInt(String(parentId)) : undefined,
      authorName,
      authorEmail,
      authorWebsite,
      content,
      ipHash,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "评论提交成功，审核后将公开显示",
        comment: { id: comment.id, status: comment.status },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);

    if (error instanceof Error && error.message.includes("嵌套深度")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "评论提交失败" },
      { status: 500 }
    );
  }
}
