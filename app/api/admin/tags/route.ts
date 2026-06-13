import { NextRequest, NextResponse } from "next/server";
import { getTags, createTag, generateSlug } from "@/lib/db/tags";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const tags = await getTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: "获取标签列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "标签名称不能为空" },
        { status: 400 }
      );
    }

    const slug = body.slug || generateSlug(name);
    const tag = await createTag(name, slug);

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json({ error: "创建标签失败" }, { status: 500 });
  }
}
