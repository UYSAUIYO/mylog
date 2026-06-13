"use client";

import type { ReactNode } from "react";
import MouseGlow from "@/components/effects/MouseGlow";

/**
 * 全局背景鼠标光晕 — 整个页面背景跟随鼠标移动的径向渐变光晕
 * 只在首页和文章详情页等需要氛围感的页面生效
 */
export default function GlobalGlow({ children }: { children: ReactNode }) {
  return (
    <MouseGlow
      glowColor="rgba(99,102,241,0.06)"
      darkGlowColor="rgba(129,140,248,0.08)"
      glowSize="800px"
      className="min-h-full flex flex-col"
    >
      {children}
    </MouseGlow>
  );
}
