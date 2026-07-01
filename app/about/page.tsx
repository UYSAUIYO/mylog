import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "关于我",
  description: "YUWEN — Embedded Developer / Builder / Writer",
};

const focus = [
  ["01", "Embedded Systems", "寄存器、外设、驱动、芯片手册。"],
  ["02", "Frontend Engineering", "把工具和想法做成能长期使用的界面。"],
  ["03", "AI Agents", "研究如何把 AI 真正接入工作流，而不是只停留在演示。"],
  ["04", "Writing", "把踩过的坑、做过的项目和零散想法留下来。"],
];

const stack = ["C/C++", "STM32", "ARM", "Python", "TypeScript", "Next.js", "Linux", "MariaDB", "AI Agent"];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="border-b border-zinc-300/80 pb-10 dark:border-zinc-800 sm:pb-14">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">
          Profile
        </p>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <h1 className="text-6xl font-black leading-[0.9] tracking-[-0.075em] text-zinc-950 dark:text-zinc-50 sm:text-8xl lg:text-9xl">
              YUWEN
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-zinc-700 dark:text-zinc-300">
              Embedded Developer / Builder / Writer. 写代码，也记录踩坑。
            </p>
          </div>
          <div className="border-l-0 border-zinc-300/80 pt-6 dark:border-zinc-800 lg:border-l lg:pl-8 lg:pt-0">
            <p className="text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              大部分时间在跟寄存器、驱动和 datasheet 较劲。偶尔写前端和 AI 小工具，
              主要是想把自己遇到的问题做成能复用的东西。
            </p>
          </div>
        </div>
      </header>

      <main className="grid gap-12 py-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-16">
        <aside className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-600">
          About / 2026
        </aside>

        <div className="space-y-14">
          <section className="grid gap-6 border-b border-zinc-300/80 pb-12 dark:border-zinc-800 md:grid-cols-[180px_minmax(0,1fr)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-950 dark:text-zinc-50">
              Profile
            </h2>
            <div className="space-y-5 text-base leading-8 text-zinc-700 dark:text-zinc-300">
              <p>
                写博客没什么宏大的目标，就是怕自己忘了。有些坑踩完不记下来，过一阵子再遇到还得重新踩一遍，挺浪费时间。
              </p>
              <p>
                这里会放开发记录、项目笔记、部署踩坑和一些零散想法。内容不一定总是完整教程，但尽量保证是真实遇到过、能帮之后的自己少绕路的东西。
              </p>
            </div>
          </section>

          <section className="grid gap-6 border-b border-zinc-300/80 pb-12 dark:border-zinc-800 md:grid-cols-[180px_minmax(0,1fr)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-950 dark:text-zinc-50">
              Focus
            </h2>
            <div className="divide-y divide-zinc-300/80 border-y border-zinc-300/80 dark:divide-zinc-800 dark:border-zinc-800">
              {focus.map(([no, title, desc]) => (
                <div key={no} className="grid gap-3 py-5 sm:grid-cols-[64px_220px_minmax(0,1fr)]">
                  <span className="font-mono text-xs text-zinc-400">{no}</span>
                  <h3 className="font-bold tracking-[-0.02em] text-zinc-950 dark:text-zinc-50">
                    {title}
                  </h3>
                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 border-b border-zinc-300/80 pb-12 dark:border-zinc-800 md:grid-cols-[180px_minmax(0,1fr)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-950 dark:text-zinc-50">
              Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {stack.map((item) => (
                <span
                  key={item}
                  className="border border-zinc-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-[180px_minmax(0,1fr)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-950 dark:text-zinc-50">
              Contact
            </h2>
            <div className="flex flex-wrap gap-3">
              <ContactLink href="mailto:sunyuwen404@163.com" label="Email" />
              <ContactLink href="https://github.com/UYSAUIYO" label="GitHub" />
              <ContactLink href="/rss.xml" label="RSS" />
              <Link
                href="/links"
                className="border border-zinc-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600 transition-colors hover:border-zinc-950 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-100 dark:hover:text-zinc-100"
              >
                Links
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ContactLink({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="border border-zinc-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600 transition-colors hover:border-zinc-950 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-100 dark:hover:text-zinc-100"
    >
      {label}
    </a>
  );
}
