import Link from "next/link";
import GlassCard from "@/components/glass/GlassCard";

export default function GlassHero() {
  return (
    <section className="relative overflow-hidden">
      {/* 背景光晕 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28">
        <GlassCard
          variant="hero"
          diamond
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            YUWEN
            <span className="block mt-2 text-xl sm:text-2xl md:text-3xl font-normal text-zinc-500 dark:text-zinc-400">
              个人技术知识库
            </span>
          </h1>
          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto">
            嵌入式开发 · 芯片手册 · AI Agent · 前端工程
            <br />
            记录技术探索的每一步，构建可复用的知识体系。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-zinc-900/80 dark:bg-white/90 text-white dark:text-zinc-900 text-sm font-medium rounded-xl backdrop-blur-sm hover:opacity-80 transition-opacity w-full sm:w-auto"
            >
              探索知识库
            </Link>
            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-white/20 dark:bg-zinc-800/40 border border-white/30 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-xl backdrop-blur-sm hover:bg-white/30 dark:hover:bg-zinc-700/50 transition-colors w-full sm:w-auto"
            >
              RSS 订阅
            </a>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
