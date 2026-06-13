import { NextRequest, NextResponse } from "next/server";
import { incrementViewCount } from "@/lib/db/articles";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    await incrementViewCount(slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
