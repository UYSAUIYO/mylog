import { NextRequest, NextResponse } from "next/server";
import { getPages, createPage } from "@/lib/db/pages";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  try {
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    return NextResponse.json(await getPages(page));
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json({ error: "获取页面列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  try {
    const body = await request.json();
    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json({ error: "标题、slug 和内容不能为空" }, { status: 400 });
    }
    const page = await createPage({
      title: body.title,
      slug: body.slug,
      content: body.content,
      isPublished: body.isPublished ?? true,
    });
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "创建页面失败";
    console.error("Error creating page:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
