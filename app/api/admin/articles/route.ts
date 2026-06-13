import { NextRequest, NextResponse } from "next/server";
import { getArticles, createArticle, generateSlug } from "@/lib/db/articles";
import { requireAdmin } from "@/lib/auth";
import { getCategories } from "@/lib/db/categories";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const status = searchParams.get("status") as
    | "DRAFT"
    | "PUBLISHED"
    | "ARCHIVED"
    | undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const result = await getArticles({
      page,
      pageSize,
      status: status || undefined,
      search,
      orderBy: "updatedAt",
      order: "desc",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching admin articles:", error);
    return NextResponse.json(
      { error: "获取文章列表失败" },
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
    const {
      title,
      content,
      excerpt,
      coverImage,
      categoryIds,
      tagIds,
      authorId,
      seoTitle,
      seoDescription,
      ogImage,
      canonicalUrl,
      allowComment,
      status,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "标题和内容不能为空" },
        { status: 400 }
      );
    }

    let slug = body.slug || generateSlug(title);

    // Check slug uniqueness
    const { slugExists } = await import("@/lib/db/articles");
    if (await slugExists(slug)) {
      slug = `${slug}-${Date.now()}`;
    }

    const article = await createArticle({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200),
      coverImage,
      categoryIds,
      tagIds,
      authorId: authorId || 1,
      seoTitle,
      seoDescription,
      ogImage,
      canonicalUrl,
      allowComment: allowComment ?? true,
    });

    // If status is PUBLISHED, update it
    if (status === "PUBLISHED") {
      const { updateArticle } = await import("@/lib/db/articles");
      await updateArticle(article.id, { status: "PUBLISHED" });
    }

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json({ error: "创建文章失败" }, { status: 500 });
  }
}
