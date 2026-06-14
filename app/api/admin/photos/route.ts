import { NextRequest, NextResponse } from "next/server";
import { getPhotos, createPhoto } from "@/lib/db/photos";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "12");

    const result = await getPhotos(page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json({ error: "获取照片列表失败" }, { status: 500 });
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
    const { title, description, url, tags } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: "标题和图片地址不能为空" },
        { status: 400 }
      );
    }

    const photo = await createPhoto({
      title,
      description: description || undefined,
      url,
      tags: tags || undefined,
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Error creating photo:", error instanceof Error ? error.message : error, error instanceof Error ? error.stack : "");
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建照片失败" },
      { status: 500 }
    );
  }
}
