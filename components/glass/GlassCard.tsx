"use client";

import type { ReactNode, HTMLAttributes } from "react";
import GlassDiamond from "@/components/effects/GlassDiamond";
import MouseGlow from "@/components/effects/MouseGlow";

type GlassVariant = "sm" | "md" | "lg" | "hero";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: GlassVariant;
  hover?: boolean;
  as?: "div" | "article" | "section";
  /** 启用菱形深层纹理 */
  diamond?: boolean;
  /** 启用鼠标跟随光晕动效 */
  glow?: boolean;
  /** 光晕颜色（亮色模式） */
  glowColor?: string;
  /** 光晕颜色（暗色模式） */
  glowDarkColor?: string;
}

const variantStyles: Record<GlassVariant, string> = {
  sm: "rounded-xl p-4 border border-white/50 dark:border-white/10",
  md: "rounded-2xl p-6 border border-white/60 dark:border-white/15",
  lg: "rounded-3xl p-8 border border-white/60 dark:border-white/15",
  hero: "rounded-3xl p-10 md:p-16 border border-white/50 dark:border-white/10",
};

const intensityStyles: Record<GlassVariant, string> = {
  sm: "bg-white/10 dark:bg-zinc-900/20 backdrop-blur-md",
  md: "bg-white/15 dark:bg-zinc-900/30 backdrop-blur-xl",
  lg: "bg-white/20 dark:bg-zinc-900/35 backdrop-blur-2xl",
  hero: "bg-white/10 dark:bg-zinc-900/40 backdrop-blur-3xl",
};

export default function GlassCard({
  children,
  variant = "md",
  hover = false,
  diamond = false,
  glow = false,
  glowColor,
  glowDarkColor,
  as: Tag = "div",
  className = "",
  ...rest
}: GlassCardProps) {
  const cardContent = (
    <Tag
      className={`relative ${variantStyles[variant]} ${intensityStyles[variant]} ${
        hover
          ? "hover:bg-white/25 dark:hover:bg-zinc-800/50 hover:border-white/70 dark:hover:border-white/25 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-900/5 dark:hover:shadow-black/20"
          : ""
      } ${className}`}
      {...rest}
    >
      {/* 菱形纹理层 */}
      {diamond && <GlassDiamond />}

      {/* 内容 */}
      <div className="relative z-10">{children}</div>
    </Tag>
  );

  // 启用光晕则在最外层包裹 MouseGlow
  if (glow) {
    return (
      <MouseGlow
        glowColor={glowColor}
        darkGlowColor={glowDarkColor}
      >
        {cardContent}
      </MouseGlow>
    );
  }

  return cardContent;
}
