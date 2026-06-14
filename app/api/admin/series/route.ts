import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getSeriesList,
  createSeries,
  generateSeriesSlug,
} from "@/lib/db/series";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const series = await getSeriesList();
    return NextResponse.json(series);
  } catch (error) {
    console.error("Error fetching series:", error);
    return NextResponse.json({ error: "获取系列列表失败" }, { status: 500 });
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
    const { name, description, coverImage } = body;

    if (!name) {
      return NextResponse.json({ error: "名称不能为空" }, { status: 400 });
    }

    let slug = body.slug || generateSeriesSlug(name);

    const series = await createSeries({
      name,
      slug,
      description,
      coverImage,
    });

    return NextResponse.json(series, { status: 201 });
  } catch (error) {
    console.error("Error creating series:", error);
    return NextResponse.json({ error: "创建系列失败" }, { status: 500 });
  }
}
