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
      ? "inline-flex items-center border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors"
      : "inline-flex items-center border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition-colors";

  const activeStyle = active
    ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-zinc-950"
    : "border-zinc-300 bg-transparent text-zinc-500 hover:border-zinc-950 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-300 dark:hover:text-zinc-100";

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
