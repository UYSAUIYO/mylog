import { NextRequest, NextResponse } from "next/server";
import { getNotes, createNote } from "@/lib/db/notes";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  try {
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    return NextResponse.json(await getNotes(page));
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "获取碎碎念失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  try {
    const body = await request.json();
    if (!body.content?.trim()) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }
    const images: string[] = body.images || [];
    const note = await createNote(body.content.trim(), images);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "创建碎碎念失败" }, { status: 500 });
  }
}
