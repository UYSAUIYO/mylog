"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const navItems = [
    { href: "/admin", label: "仪表盘", icon: "📊" },
    { href: "/admin/posts", label: "文章管理", icon: "📝" },
    { href: "/admin/posts/new", label: "新建文章", icon: "➕" },
    { href: "/admin/series", label: "专栏管理", icon: "📚" },
    { href: "/admin/notes", label: "碎碎念", icon: "💭" },
    { href: "/admin/photos", label: "照片管理", icon: "📷" },
    { href: "/admin/friend-links", label: "友情链接", icon: "🔗" },
    { href: "/admin/categories", label: "分类管理", icon: "📁" },
    { href: "/admin/tags", label: "标签管理", icon: "🏷️" },
    { href: "/admin/comments", label: "评论审核", icon: "💬" },
  ];

  return (
<div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
{/* Mobile menu button */}
<button
  onClick={() => setSidebarOpen(!sidebarOpen)}
  className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700"
>
  <svg className="w-6 h-6 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {sidebarOpen ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    )}
  </svg>
</button>

{/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-14 flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/admin"
            className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
          >
            后台管理
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors mb-1"
          >
            查看博客
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            退出登录
          </button>
        </div>
</aside>

{/* Mobile overlay */}
{sidebarOpen && (
  <div
    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
    onClick={() => setSidebarOpen(false)}
  />
)}

{/* Main */}
<div className="flex-1 overflow-x-hidden lg:ml-0">
  <div className="max-w-5xl mx-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
