"use client";

import { useEffect, useMemo, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ content }: { content: string }) {
  const headings = useMemo(() => {
    const extracted: TOCItem[] = [];
    const regex = /^(#{2,3})\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fff\s-]/g, "")
        .replace(/[\s]+/g, "-")
        .replace(/-+/g, "-");
      extracted.push({ id, text, level });
    }
    return extracted;
  }, [content]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="border-y border-zinc-300/80 py-4 text-sm dark:border-zinc-800">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-600">
        Contents
      </div>
      <ul className="space-y-1">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block border-l py-1.5 pr-2 transition-colors ${
                level === 3 ? "pl-5" : "pl-3"
              } ${
                activeId === id
                  ? "border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-950 dark:text-zinc-500 dark:hover:border-zinc-700 dark:hover:text-zinc-100"
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
