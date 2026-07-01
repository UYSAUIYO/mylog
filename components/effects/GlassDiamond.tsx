export default function GlassDiamond({
  opacity = "3",
  darkOpacity = "3",
}: {
  opacity?: string;
  darkOpacity?: string;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          opacity: `${opacity}%`,
          backgroundImage:
            "linear-gradient(90deg, rgba(20,20,20,0.45) 1px, transparent 1px), linear-gradient(0deg, rgba(20,20,20,0.45) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          opacity: `${darkOpacity}%`,
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}
