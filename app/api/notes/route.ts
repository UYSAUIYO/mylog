import { NextRequest, NextResponse } from "next/server";
import { getNotes } from "@/lib/db/notes";

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    return NextResponse.json(await getNotes(page));
  } catch (error) {
    console.error("Error fetching public notes:", error);
    return NextResponse.json({ error: "获取动态失败" }, { status: 500 });
  }
}
