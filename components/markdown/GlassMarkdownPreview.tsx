"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import GlassCard from "@/components/glass/GlassCard";

const MarkdownRenderer = lazy(
  () => import("@/components/MarkdownRenderer")
);

interface GlassMarkdownPreviewProps {
  content: string;
}

export default function GlassMarkdownPreview({
  content,
}: GlassMarkdownPreviewProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!content) {
    return (
      <GlassCard variant="sm" diamond className="min-h-[400px] flex items-center justify-center">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">预览区域</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="sm" diamond className="overflow-auto">
      <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-3 font-medium">
        预览效果
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20 text-zinc-400 text-sm">
            加载预览...
          </div>
        }
      >
        <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none">
          <MarkdownRenderer content={content} />
        </div>
      </Suspense>
    </GlassCard>
  );
}
