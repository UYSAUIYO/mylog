import { Metadata } from "next";
import Link from "next/link";
import GlassCard from "@/components/glass/GlassCard";

export const metadata: Metadata = {
  title: "关于我",
  description: "YUWEN — 嵌入式开发者、技术博主、终身学习者",
};

const techStack = [
  { name: "C/C++", desc: "嵌入式系统开发", icon: "⚡" },
  { name: "STM32/ARM", desc: "MCU 与 SoC 开发", icon: "🔧" },
  { name: "Python", desc: "脚本工具 & AI 应用", icon: "🐍" },
  { name: "TypeScript", desc: "前端工程 & 全栈开发", icon: "🎨" },
  { name: "Linux", desc: "驱动开发与系统调试", icon: "🐧" },
  { name: "AI Agent", desc: "大模型应用与 RAG", icon: "🤖" },
];

const interests = [
  { label: "嵌入式系统", emoji: "🔌" },
  { label: "芯片架构", emoji: "🧠" },
  { label: "开源硬件", emoji: "🛠️" },
  { label: "AI 工程化", emoji: "🚀" },
  { label: "技术写作", emoji: "✍️" },
  { label: "摄影", emoji: "📷" },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Hero */}
      <section className="mb-16 text-center">
        <div className="relative inline-block mb-6">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-[3px] mx-auto">
            <div className="w-full h-full rounded-full bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Y
              </span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-400 dark:bg-green-500 border-4 border-zinc-50 dark:border-zinc-950 flex items-center justify-center">
            <span className="text-xs">👋</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          Hi, 我是{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            YUWEN
          </span>
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-4 max-w-xl mx-auto leading-relaxed">
          嵌入式工程师 / 技术博主 / 终身学习者
        </p>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 max-w-lg mx-auto leading-relaxed">
          专注于嵌入式开发、芯片手册解读、AI Agent 探索与前端工程实践。
          在这里记录技术思考，分享踩坑经验，构建个人知识体系。
        </p>
      </section>

      {/* About */}
      <section className="mb-16">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
          关于我
        </h2>
        <GlassCard variant="md" diamond glow>
          <div className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed text-[15px]">
            <p>
              我是一名热衷于底层技术的嵌入式工程师，日常与 MCU、寄存器和示波器打交道，
              同时也热爱前端开发，享受从零搭建系统的过程。
            </p>
            <p>
              这个博客是我的技术沉淀空间 —— 从 STM32 驱动开发到芯片手册深度解读，
              从 AI Agent 的探索实践到前端工程的最佳实践。我相信，
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                写下来才是真正理解的开始
              </span>
              。
            </p>
            <p>
              工作之余，我喜欢研究开源硬件项目、尝试新技术栈、用摄影记录生活。
              如果你也对技术充满好奇，欢迎一起交流！
            </p>
          </div>
        </GlassCard>
      </section>

      {/* Tech Stack */}
      <section className="mb-16">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
          技术栈
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {techStack.map((tech) => (
            <GlassCard key={tech.name} variant="sm" hover>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tech.icon}</span>
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                    {tech.name}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {tech.desc}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Interests */}
      <section className="mb-16">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-pink-500 to-orange-500" />
          兴趣领域
        </h2>
        <div className="flex flex-wrap gap-3">
          {interests.map((item) => (
            <div
              key={item.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm border border-white/40 dark:border-zinc-700/40 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-white/60 dark:hover:bg-zinc-700/60 transition-colors"
            >
              <span>{item.emoji}</span>
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mb-16">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-orange-500 to-yellow-500" />
          博客数据
        </h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {[
            { label: "技术文章", value: "持续更新" },
            { label: "专栏系列", value: "深度整理" },
            { label: "代码提交", value: "日常迭代" },
            { label: "建站时长", value: "Since 2024" },
          ].map((stat) => (
            <GlassCard key={stat.label} variant="sm" className="text-center">
              <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="mb-16">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-5 flex items-center gap-2">
          <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-yellow-500 to-green-500" />
          联系方式
        </h2>
        <GlassCard variant="md">
          <div className="flex flex-wrap items-center gap-4">
            <ContactLink
              href="mailto:yuwen@example.com"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              label="Email"
            />
            <ContactLink
              href="https://github.com/"
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              }
              label="GitHub"
            />
            <ContactLink
              href="/rss.xml"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              }
              label="RSS"
            />
            <Link
              href="/links"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              友情链接
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* Footer quote */}
      <div className="text-center pb-8">
        <GlassCard variant="sm" className="inline-block">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
            &ldquo;代码是写给人看的，顺便能在机器上运行。&rdquo;
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 text-right">
            — Harold Abelson
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

function ContactLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto");
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
    >
      {icon}
      {label}
    </a>
  );
}
