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
  /** 兼容旧 API：Editorial 风格下仅作为极淡纸纹 */
  diamond?: boolean;
  /** 兼容旧 API：默认不建议使用 */
  glow?: boolean;
  glowColor?: string;
  glowDarkColor?: string;
}

const variantStyles: Record<GlassVariant, string> = {
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
  hero: "p-6 sm:p-10 md:p-12",
};

const surfaceStyles: Record<GlassVariant, string> = {
  sm: "border border-zinc-300/80 bg-[#fbfaf7] dark:border-zinc-800 dark:bg-zinc-950",
  md: "border border-zinc-300/80 bg-[#fbfaf7] dark:border-zinc-800 dark:bg-zinc-950",
  lg: "border border-zinc-300/80 bg-[#fbfaf7] dark:border-zinc-800 dark:bg-zinc-950",
  hero: "border-y border-zinc-300/80 bg-transparent dark:border-zinc-800",
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
      className={`relative ${variantStyles[variant]} ${surfaceStyles[variant]} ${
        hover
          ? "transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-950 dark:hover:border-zinc-500"
          : ""
      } ${className}`}
      {...rest}
    >
      {diamond && <GlassDiamond />}
      <div className="relative z-10">{children}</div>
    </Tag>
  );

  if (glow) {
    return (
      <MouseGlow glowColor={glowColor} darkGlowColor={glowDarkColor}>
        {cardContent}
      </MouseGlow>
    );
  }

  return cardContent;
}
