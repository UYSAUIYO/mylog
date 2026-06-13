"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";

/**
 *  鼠标光晕交互 — 跟随鼠标位置的径向渐变光晕
 *
 * 原理：在容器上监听 mousemove，动态移动一个 600px 的 radial-gradient 至鼠标坐标。
 * 离开时渐变平滑归零。使用 CSS transition 实现缓出动画。
 *
 * 用法：
 *   <MouseGlow glowColor="rgba(59,130,246,0.12)">
 *     <div>...内容...</div>
 *   </MouseGlow>
 */
export default function MouseGlow({
  children,
  glowColor = "rgba(99,102,241,0.15)",
  darkGlowColor = "rgba(99,102,241,0.18)",
  glowSize = "600px",
  className = "",
}: {
  children: ReactNode;
  glowColor?: string;
  darkGlowColor?: string;
  glowSize?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    el.style.setProperty("--mo", "1");
  }

  function handleMouseLeave() {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty("--mo", "0");
  }

  // 用 <style> 注入 CSS 自定义属性，避免内联 style 覆盖 children
  const dynamicStyles: Record<string, string> = {
    "--glow-color": glowColor,
    "--glow-dark-color": darkGlowColor,
    "--glow-size": glowSize,
  } as Record<string, string>;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={dynamicStyles as CSSProperties}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 光晕层 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 ease-out"
        style={{
          opacity: "var(--mo, 0)",
          background:
            "radial-gradient(circle var(--glow-size) at var(--mx, 50%) var(--my, 50%), var(--glow-color), transparent 70%)",
        }}
      />
      {/* 暗色模式光晕 — 叠加第二层不同颜色 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 hidden dark:block transition-opacity duration-700 ease-out"
        style={{
          opacity: "var(--mo, 0)",
          background:
            "radial-gradient(circle var(--glow-size) at var(--mx, 50%) var(--my, 50%), var(--glow-dark-color), transparent 70%)",
        }}
      />

      {/* 内容 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
