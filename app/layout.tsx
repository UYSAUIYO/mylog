import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import GlobalGlow from "@/components/effects/GlobalGlow";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "YUWEN 技术知识库",
    template: "%s | YUWEN",
  },
  description: "嵌入式开发 · 芯片手册 · AI Agent · 前端工程 — 个人技术知识沉淀系统",
  openGraph: {
    title: "YUWEN 技术知识库",
    description: "嵌入式开发 · 芯片手册 · AI Agent · 前端工程 — 个人技术知识沉淀系统",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <ThemeProvider>
        <GlobalGlow>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-lg font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors tracking-tight"
              >
                YUWEN
              </Link>

              <nav className="hidden sm:flex items-center gap-6 text-sm">
                <Link
                  href="/"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  首页
                </Link>
                <Link
                  href="/search"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  搜索
                </Link>
                <Link
                  href="/series"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  专栏
                </Link>
                <Link
                  href="/photos"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  照片
                </Link>
                <Link
                  href="/notes"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  动态
                </Link>
                <Link
                  href="/links"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  友链
                </Link>
                <Link
                  href="/about"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  关于
                </Link>
                <a
                  href="/rss.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  RSS
                </a>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/admin"
                className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
              >
                管理
              </Link>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-zinc-200/60 dark:border-zinc-800 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
            <p>
              &copy; {new Date().getFullYear()} YUWEN. Powered by Next.js.
              Built with curiosity.
            </p>
          </div>
        </footer>
        </GlobalGlow>
        </ThemeProvider>
      </body>
    </html>
  );
}
