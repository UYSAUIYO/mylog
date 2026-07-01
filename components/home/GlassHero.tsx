"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const Hero3DScene = dynamic(() => import("@/components/home/Hero3DScene"), {
  ssr: false,
});

export default function GlassHero() {
  return (
    <section className="border-b border-zinc-300/80 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
              Independent Tech Journal
            </p>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.07em] text-zinc-950 dark:text-zinc-50 sm:text-7xl lg:text-8xl">
              YUWEN.LOG
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-700 dark:text-zinc-300 sm:text-xl sm:leading-9">
              写代码，也记录踩坑。这里是关于嵌入式、前端工程、AI Agent 和折腾项目的个人技术刊物。
            </p>

            <div className="relative mt-10 hidden h-[280px] max-w-3xl overflow-hidden border border-zinc-300/80 bg-[#fbfaf7] dark:border-zinc-800 dark:bg-zinc-950 sm:block lg:h-[320px]">
              <div className="absolute left-4 top-4 z-10 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-600">
                3D Core / Live
              </div>
              <div className="absolute bottom-4 right-4 z-10 font-mono text-[10px] uppercase text-zinc-400 dark:text-zinc-600">
                R3F.01
              </div>
              <Hero3DScene />
            </div>
          </div>

          <div className="border-l-0 border-zinc-300/80 pt-6 dark:border-zinc-800 lg:border-l lg:pl-8 lg:pt-0">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm lg:grid-cols-1">
              {[
                ["Focus", "Embedded / Frontend"],
                ["Format", "Notes / Essays / Logs"],
                ["Updated", "When things break"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-600">
                    {label}
                  </dt>
                  <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="border border-zinc-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-950 transition-colors hover:bg-zinc-950 hover:text-white dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-950"
              >
                Search
              </Link>
              <Link
                href="/about"
                className="border border-zinc-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600 transition-colors hover:border-zinc-950 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-100 dark:hover:text-zinc-100"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
