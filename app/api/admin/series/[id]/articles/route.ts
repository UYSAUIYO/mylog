import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  addArticleToSeries,
  removeArticleFromSeries,
  reorderSeriesArticles,
} from "@/lib/db/series";

async function checkAuth() {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

// POST: Add article to series
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAuth();
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json({ error: "缺少 articleId" }, { status: 400 });
    }

    await addArticleToSeries(parseInt(id), parseInt(articleId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding article to series:", error);
    return NextResponse.json({ error: "添加文章到系列失败" }, { status: 500 });
  }
}

// DELETE: Remove article from series
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAuth();
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return NextResponse.json({ error: "缺少 articleId" }, { status: 400 });
    }

    await removeArticleFromSeries(parseInt(id), parseInt(articleId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing article from series:", error);
    return NextResponse.json({ error: "从系列移除文章失败" }, { status: 500 });
  }
}

// PUT: Reorder articles in series
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAuth();
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { articleIds } = body;

    if (!Array.isArray(articleIds)) {
      return NextResponse.json({ error: "缺少 articleIds 数组" }, { status: 400 });
    }

    await reorderSeriesArticles(parseInt(id), articleIds.map(Number));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering series articles:", error);
    return NextResponse.json({ error: "重新排序失败" }, { status: 500 });
  }
}
