"use client";

import type { ReactNode } from "react";

export default function GlobalGlow({ children }: { children: ReactNode }) {
  return <div className="min-h-full flex flex-col">{children}</div>;
}
