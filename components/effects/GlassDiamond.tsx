/**
 * 菱形深层纹理 — 纯 CSS 菱形网格图案
 * 叠加在玻璃卡片内部，营造类似钻石切割 / 光栅质感
 *
 * 用法：
 *   <GlassDiamond />              默认 opacity 10%，深色模式更低
 *   <GlassDiamond opacity="0.15" />  自定义透明度
 */
export default function GlassDiamond({
  opacity = "10",
  darkOpacity = "4",
}: {
  opacity?: string;
  darkOpacity?: string;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      style={{
        opacity: `${opacity}%`,
        // δ dark mode override via a synthetic layer that hides in light mode
      }}
    >
      {/* 菱形网格纹理 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(148,163,184,0.12) 0%, transparent 40%, transparent 60%, rgba(148,163,184,0.12) 100%),
            linear-gradient(-45deg, rgba(148,163,184,0.12) 0%, transparent 40%, transparent 60%, rgba(148,163,184,0.12) 100%),
            linear-gradient(45deg, transparent 40%, rgba(148,163,184,0.06) 40%, rgba(148,163,184,0.06) 60%, transparent 60%),
            linear-gradient(-45deg, transparent 40%, rgba(148,163,184,0.06) 40%, rgba(148,163,184,0.06) 60%, transparent 60%)
          `,
          backgroundSize: "20px 20px, 20px 20px, 20px 20px, 20px 20px",
          backgroundPosition: "0 0, 10px 10px, 10px 10px, 0 0",
        }}
      />

      {/* 暗色模式菱形 — 更淡 */}
      <div
        className="absolute inset-0 dark:opacity-100 opacity-0"
        style={{
          opacity: 0, // controlled by dark:opacity-100 in Tailwind
          backgroundImage: `
            linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%),
            linear-gradient(-45deg, rgba(255,255,255,0.05) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%),
            linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.025) 40%, rgba(255,255,255,0.025) 60%, transparent 60%),
            linear-gradient(-45deg, transparent 40%, rgba(255,255,255,0.025) 40%, rgba(255,255,255,0.025) 60%, transparent 60%)
          `,
          backgroundSize: "20px 20px, 20px 20px, 20px 20px, 20px 20px",
          backgroundPosition: "0 0, 10px 10px, 10px 10px, 0 0",
        }}
      />
    </div>
  );
}
