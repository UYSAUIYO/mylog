"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "code", "pre", "a", "ul", "ol", "li",
  "blockquote", "h3", "h4", "del", "span",
];

const sanitizeSchema = {
  tagNames: ALLOWED_TAGS,
  attributes: {
    a: ["href", "title", "rel"],
    code: ["className"],
    span: ["className"],
    "*": [],
  },
  protocols: { href: ["http", "https", "mailto"] },
  strip: ["script", "style", "iframe", "object", "embed", "img"],
};

export default function CommentMarkdown({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-headings:text-zinc-800 dark:prose-headings:text-zinc-200 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-zinc-800 dark:prose-code:text-zinc-200 prose-pre:bg-zinc-900 prose-pre:text-zinc-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypeSanitize, sanitizeSchema],
          rehypeHighlight,
        ]}
        components={{
          // Limit heading size
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold mt-2 mb-1">{children}</h4>
          ),
          // External links open in new tab
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
