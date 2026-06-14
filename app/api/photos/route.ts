import { NextRequest, NextResponse } from "next/server";
import { getPhotos } from "@/lib/db/photos";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "12");

    const result = await getPhotos(page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching public photos:", error);
    return NextResponse.json({ error: "获取照片列表失败" }, { status: 500 });
  }
}
