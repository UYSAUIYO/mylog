import Link from "next/link";
import type { ReactNode } from "react";

interface GlassBadgeProps {
  children: ReactNode;
  href?: string;
  active?: boolean;
  size?: "sm" | "md";
}

export default function GlassBadge({
  children,
  href,
  active = false,
  size = "sm",
}: GlassBadgeProps) {
  const base =
    size === "sm"
      ? "inline-flex items-center text-xs px-2.5 py-0.5 rounded-full backdrop-blur-md border transition-all duration-200"
      : "inline-flex items-center text-sm px-3 py-1 rounded-full backdrop-blur-md border transition-all duration-200";

  const activeStyle = active
    ? "bg-blue-500/20 border-blue-400/40 text-blue-700 dark:text-blue-300"
    : "bg-white/20 dark:bg-zinc-800/30 border-white/30 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400 hover:bg-white/30 dark:hover:bg-zinc-700/50 hover:border-white/50 dark:hover:border-zinc-600/60";

  const classes = `${base} ${activeStyle}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <span className={classes}>{children}</span>;
}
