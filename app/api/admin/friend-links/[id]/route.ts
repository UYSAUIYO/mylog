import { NextRequest, NextResponse } from "next/server";
import { updateFriendLink, deleteFriendLink } from "@/lib/db/friendLinks";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  try {
    const body = await request.json();
    const link = await updateFriendLink(parseInt((await params).id), {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.url !== undefined && { url: body.url }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.icon !== undefined && { icon: body.icon }),
      ...(body.category !== undefined && { category: body.category }),
    });
    return NextResponse.json(link);
  } catch (error) {
    console.error("Error updating friend link:", error);
    return NextResponse.json({ error: "更新友情链接失败" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  try {
    await deleteFriendLink(parseInt((await params).id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting friend link:", error);
    return NextResponse.json({ error: "删除友情链接失败" }, { status: 500 });
  }
}
