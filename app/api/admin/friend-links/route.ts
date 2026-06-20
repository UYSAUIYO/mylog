import { NextRequest, NextResponse } from "next/server";
import { getFriendLinks, createFriendLink } from "@/lib/db/friendLinks";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  try {
    const links = await getFriendLinks();
    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching friend links:", error);
    return NextResponse.json({ error: "获取友情链接失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  try {
    const body = await request.json();
    if (!body.name || !body.url) {
      return NextResponse.json({ error: "名称和链接不能为空" }, { status: 400 });
    }
    const link = await createFriendLink({
      name: body.name,
      url: body.url,
      description: body.description || undefined,
      icon: body.icon || undefined,
      category: body.category || undefined,
    });
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Error creating friend link:", error);
    return NextResponse.json({ error: "创建友情链接失败" }, { status: 500 });
  }
}
