import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Cron endpoint: publish scheduled articles whose scheduledAt <= now
 * Call with: GET /api/cron/publish?secret=YOUR_CRON_SECRET
 * Configure Vercel Cron or external scheduler to hit this endpoint periodically.
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    const result = await prisma.article.updateMany({
      where: {
        status: "DRAFT",
        deletedAt: null,
        scheduledAt: { lte: now },
      },
      data: {
        status: "PUBLISHED",
        isPublished: true,
        publishedAt: now,
        scheduledAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      published: result.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron publish error:", error);
    return NextResponse.json(
      { error: "Failed to publish scheduled articles" },
      { status: 500 }
    );
  }
}
