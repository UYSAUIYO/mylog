"use client";

import { useState, useEffect } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) {
        setProgress(0);
        setShowTop(false);
        return;
      }

      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setProgress(pct);
      setShowTop(scrollTop > 400);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] pointer-events-none">
        <div
          className="h-full bg-blue-600 transition-[width] duration-100 ease-out dark:bg-blue-400"
          style={{ width: `${progress}%`, opacity: progress >= 99 ? 0 : 1 }}
        />
      </div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        aria-label="返回顶部"
        className={`fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950/85 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 dark:bg-zinc-100/85 dark:text-zinc-950 sm:bottom-8 sm:right-8 ${
          showTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    </>
  );
}
