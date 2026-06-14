import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSeriesById, updateSeries, deleteSeries } from "@/lib/db/series";

async function checkAuth() {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAuth();
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;
  const series = await getSeriesById(parseInt(id));

  if (!series) {
    return NextResponse.json({ error: "系列不存在" }, { status: 404 });
  }

  return NextResponse.json(series);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAuth();
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const series = await updateSeries(parseInt(id), body);
    return NextResponse.json(series);
  } catch (error) {
    console.error("Error updating series:", error);
    return NextResponse.json({ error: "更新系列失败" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAuth();
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteSeries(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting series:", error);
    return NextResponse.json({ error: "删除系列失败" }, { status: 500 });
  }
}
