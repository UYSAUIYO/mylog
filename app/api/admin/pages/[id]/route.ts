import { NextRequest, NextResponse } from "next/server";
import { getPageById, updatePage, deletePage } from "@/lib/db/pages";
import { requireAdmin } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  try {
    const page = await getPageById(parseInt((await params).id));
    if (!page) return NextResponse.json({ error: "页面不存在" }, { status: 404 });
    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json({ error: "获取页面失败" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  try {
    const body = await request.json();
    const page = await updatePage(parseInt((await params).id), {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
    });
    return NextResponse.json(page);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "更新页面失败";
    console.error("Error updating page:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  try {
    await deletePage(parseInt((await params).id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "删除页面失败" }, { status: 500 });
  }
}
