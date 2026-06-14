import { NextRequest, NextResponse } from "next/server";
import { getPhotoById, updatePhoto, deletePhoto } from "@/lib/db/photos";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const photo = await getPhotoById(parseInt(id));

    if (!photo) {
      return NextResponse.json({ error: "照片不存在" }, { status: 404 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json({ error: "获取照片失败" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, tags } = body;

    const existing = await getPhotoById(parseInt(id));
    if (!existing) {
      return NextResponse.json({ error: "照片不存在" }, { status: 404 });
    }

    const photo = await updatePhoto(parseInt(id), {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(tags !== undefined && { tags }),
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error updating photo:", error);
    return NextResponse.json({ error: "更新照片失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existing = await getPhotoById(parseInt(id));
    if (!existing) {
      return NextResponse.json({ error: "照片不存在" }, { status: 404 });
    }

    await deletePhoto(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json({ error: "删除照片失败" }, { status: 500 });
  }
}
