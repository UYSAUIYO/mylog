import { NextRequest, NextResponse } from "next/server";
import { updateNote, deleteNote } from "@/lib/db/notes";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  try {
    const body = await request.json();
    if (!body.content?.trim()) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }
    const images: string[] = body.images || [];
    const note = await updateNote(parseInt((await params).id), body.content.trim(), images);
    return NextResponse.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "更新碎碎念失败" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  try {
    await deleteNote(parseInt((await params).id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "删除碎碎念失败" }, { status: 500 });
  }
}
