import { NextRequest, NextResponse } from "next/server";
import {
  getCategories,
  createCategory,
  generateSlug,
} from "@/lib/db/categories";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "获取分类列表失败" },
      { status: 500 }
    );
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "分类名称不能为空" },
        { status: 400 }
      );
    }

    const slug = body.slug || generateSlug(name);
    const category = await createCategory(name, slug, description);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "创建分类失败" }, { status: 500 });
  }
}
