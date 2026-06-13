"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import type { Components } from "react-markdown";

// Custom sanitize schema to allow KaTeX and highlight.js classes
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code || []),
      ["className"],
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      ["className"],
    ],
    div: [
      ...(defaultSchema.attributes?.div || []),
      ["className", "data-processed"],
    ],
    pre: [
      ...(defaultSchema.attributes?.pre || []),
      ["className"],
    ],
    img: [
      ...(defaultSchema.attributes?.img || []),
      ["src", "alt", "title", "width", "height", "loading"],
    ],
    a: [
      ...(defaultSchema.attributes?.a || []),
      ["href", "title", "target", "rel"],
    ],
  },
};

interface MarkdownRendererProps {
  content: string;
}

function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderMermaid() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: {
            primaryColor: "#fff",
            primaryTextColor: "#000",
            primaryBorderColor: "#000",
            lineColor: "#000",
            secondaryColor: "#f5f5f5",
            secondaryTextColor: "#000",
            tertiaryColor: "#e5e5e5",
            tertiaryTextColor: "#000",
            noteTextColor: "#000",
            textColor: "#000",
            nodeBorder: "#000",
            clusterBkg: "#fff",
            clusterBorder: "#000",
            titleColor: "#000",
            edgeLabelBackground: "#fff",
          },
        });

        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, code);

        if (!cancelled) {
          setSvg(renderedSvg);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Mermaid 渲染失败");
        }
      }
    }

    renderMermaid();

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className="my-4 border border-red-300 dark:border-red-700 rounded-lg overflow-hidden">
        <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm text-red-600 dark:text-red-400 font-medium">
          流程图渲染失败
        </div>
        <pre className="bg-zinc-900 text-zinc-200 p-4 text-sm overflow-x-auto m-0 rounded-b-lg">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-4 flex items-center justify-center py-8 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-400 text-sm">
        正在渲染流程图...
      </div>
    );
  }

  return (
    <>
      <style>{`
        .mermaid-container svg text { fill: #000 !important; }
        .mermaid-container svg tspan { fill: #000 !important; }
        .mermaid-container svg .edgeLabel,
        .mermaid-container svg .edgeLabel p,
        .mermaid-container svg .edgeLabel span {
          color: #000 !important;
          background: transparent !important;
        }
        .mermaid-container svg .nodeLabel,
        .mermaid-container svg .nodeLabel p,
        .mermaid-container svg .nodeLabel span {
          color: #000 !important;
        }
        .mermaid-container svg .label,
        .mermaid-container svg .label p,
        .mermaid-container svg .label span {
          color: #000 !important;
        }
        .mermaid-container svg foreignObject * {
          color: #000 !important;
        }
        .mermaid-container svg path.flowchart-link { stroke: #000 !important; }
        .mermaid-container svg .edgePath path { stroke: #000 !important; }
        .mermaid-container svg marker path { fill: #000 !important; stroke: #000 !important; }
      `}</style>
      <div
        ref={containerRef}
        className="mermaid-container my-4 overflow-x-auto rounded-lg bg-white p-4 border border-zinc-200"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </>
  );
}

function HeadingId({ children, as: Tag }: { children: React.ReactNode; as: "h2" | "h3" }) {
  const text = typeof children === "string" ? children : "";
  const id = text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-");

  return (
    <Tag id={id} className="group scroll-mt-20">
      {children}
      <a
        href={`#${id}`}
        className="ml-2 opacity-0 group-hover:opacity-100 text-zinc-300 dark:text-zinc-600 hover:text-blue-500 transition-opacity text-base no-underline"
        aria-hidden="true"
      >
        #
      </a>
    </Tag>
  );
}

const customComponents: Components = {
  h2({ children }) {
    return <HeadingId as="h2">{children}</HeadingId>;
  },
  h3({ children }) {
    return <HeadingId as="h3">{children}</HeadingId>;
  },
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");

    // Mermaid code block
    if (match && match[1] === "mermaid") {
      return <MermaidBlock code={String(children).trim()} />;
    }

    if (match) {
      return (
        <div className="my-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
          <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono border-b border-zinc-200 dark:border-zinc-700">
            {match[1]}
          </div>
          <pre className="bg-[#0d1117] overflow-x-auto p-4 m-0">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    }

    // Inline code
    return (
      <code
        className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-1.5 py-0.5 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
  img({ src, alt, ...props }) {
    return (
      <img
        src={src}
        alt={alt || ""}
        loading="lazy"
        className="max-w-full h-auto rounded-lg my-4 mx-auto"
        {...props}
      />
    );
  },
  a({ href, children, ...props }) {
    const isExternal =
      href && (href.startsWith("http://") || href.startsWith("https://"));

    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300"
        {...props}
      >
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="my-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
          {children}
        </table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
        {children}
      </td>
    );
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-blue-500 pl-4 my-4 text-zinc-600 dark:text-zinc-400 italic bg-blue-50 dark:bg-blue-900/10 py-2 pr-4 rounded-r-lg">
        {children}
      </blockquote>
    );
  },
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [rehypeSanitize, sanitizeSchema],
          rehypeKatex,
          rehypeHighlight,
        ]}
        components={customComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
