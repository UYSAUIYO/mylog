"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { label: "首页", href: "/" },
  { label: "搜索", href: "/search" },
  { label: "专栏", href: "/series" },
  { label: "照片", href: "/photos" },
  { label: "动态", href: "/notes" },
  { label: "友链", href: "/links" },
  { label: "关于", href: "/about" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-300/80 bg-[#f7f6f2]/95 dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="group flex items-baseline gap-2 tracking-tight"
        >
          <span className="text-lg font-black text-zinc-950 dark:text-zinc-50">
            YUWEN.LOG
          </span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-400 group-hover:text-blue-600 dark:text-zinc-600 dark:group-hover:text-blue-400 sm:inline">
            Journal
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.16em] md:flex">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-2 transition-colors ${
                  active
                    ? "text-zinc-950 dark:text-zinc-50 after:absolute after:-bottom-[17px] after:left-0 after:h-px after:w-full after:bg-blue-600 dark:after:bg-blue-400"
                    : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-100"
          >
            RSS
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/admin"
            className="hidden border border-zinc-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:border-zinc-950 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-300 dark:hover:text-zinc-100 sm:inline-flex"
          >
            管理
          </Link>
          <button
            type="button"
            aria-label={open ? "关闭导航菜单" : "打开导航菜单"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center border border-zinc-300 text-zinc-700 transition-colors hover:border-zinc-950 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-300 md:hidden"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-zinc-300/80 bg-[#f7f6f2] px-4 py-5 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <nav className="mx-auto max-w-7xl divide-y divide-zinc-300/80 border-y border-zinc-300/80 text-sm font-semibold uppercase tracking-[0.16em] dark:divide-zinc-800 dark:border-zinc-800">
            {navItems.map((item, index) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between py-3 transition-colors ${
                    active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-xs text-zinc-400">{String(index + 1).padStart(2, "0")}</span>
                </Link>
              );
            })}
            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between py-3 text-zinc-700 dark:text-zinc-300"
            >
              <span>RSS</span>
              <span className="font-mono text-xs text-zinc-400">08</span>
            </a>
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between py-3 text-zinc-700 dark:text-zinc-300 sm:hidden"
            >
              <span>管理</span>
              <span className="font-mono text-xs text-zinc-400">09</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
