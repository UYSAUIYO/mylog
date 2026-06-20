import { NextResponse } from "next/server";
import { getPublishedPages } from "@/lib/db/pages";

export async function GET() {
  try {
    const pages = await getPublishedPages();
    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching published pages:", error);
    return NextResponse.json({ error: "获取页面列表失败" }, { status: 500 });
  }
}
