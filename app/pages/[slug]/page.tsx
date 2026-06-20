import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/db/pages";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import GlassCard from "@/components/glass/GlassCard";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StaticPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500 mb-6">
        <Link href="/" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">首页</Link>
        <span>/</span>
        <span className="text-zinc-600 dark:text-zinc-400">{page.title}</span>
      </div>

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">{page.title}</h1>

      <GlassCard variant="md" diamond>
        <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50 prose-p:text-zinc-700 dark:prose-p:text-zinc-200">
          <MarkdownRenderer content={page.content} />
        </div>
      </GlassCard>
    </div>
  );
}
