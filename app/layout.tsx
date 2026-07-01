import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GlobalGlow from "@/components/effects/GlobalGlow";
import SiteHeader from "@/components/SiteHeader";
import ThemeProvider from "@/components/ThemeProvider";
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
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||((t==='system'||!t)&&d)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-[#f7f6f2] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
        <ThemeProvider>
          <GlobalGlow>
            <SiteHeader />

            <main className="flex-1">{children}</main>

            <footer className="border-t border-zinc-300/80 py-10 dark:border-zinc-800">
              <div className="mx-auto grid max-w-7xl gap-6 px-4 text-sm text-zinc-500 dark:text-zinc-500 sm:grid-cols-[1fr_auto] sm:px-6">
                <div>
                  <p className="font-semibold uppercase tracking-[0.22em] text-zinc-950 dark:text-zinc-50">
                    YUWEN.LOG
                  </p>
                  <p className="mt-2 max-w-md leading-6">
                    写代码，也记录踩坑。嵌入式、前端、AI Agent 和折腾项目的个人技术刊物。
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-4 text-xs font-semibold uppercase tracking-[0.16em]">
                  <a href="/rss.xml" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                    RSS
                  </a>
                  <a href="https://github.com/UYSAUIYO" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-600 dark:hover:text-blue-400">
                    GitHub
                  </a>
                  <span>&copy; {new Date().getFullYear()}</span>
                </div>
              </div>
            </footer>
          </GlobalGlow>
        </ThemeProvider>
      </body>
    </html>
  );
}
