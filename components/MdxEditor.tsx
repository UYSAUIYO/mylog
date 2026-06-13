"use client";

import { useState, useCallback } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface MdxEditorWrapperProps {
  initialMarkdown?: string;
  onChange?: (markdown: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function MdxEditorWrapper({
  initialMarkdown = "",
  onChange,
  onImageUpload,
}: MdxEditorWrapperProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [showSource, setShowSource] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setMarkdown(value);
      onChange?.(value);
    },
    [onChange]
  );

  const insertMarkdown = useCallback(
    (before: string, after: string = "", placeholder: string = "") => {
      const textarea = document.querySelector(
        ".mdx-editor-textarea"
      ) as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end) || placeholder;
      const newText =
        markdown.substring(0, start) +
        before +
        selectedText +
        after +
        markdown.substring(end);

      setMarkdown(newText);
      onChange?.(newText);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selectedText.length
        );
      }, 0);
    },
    [markdown, onChange]
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (onImageUpload) {
        try {
          const url = await onImageUpload(file);
          insertMarkdown(`![${file.name}](${url})`);
        } catch {
          alert("图片上传失败");
        }
      } else {
        // Fallback: convert to data URL for quick preview
        const reader = new FileReader();
        reader.onload = () => {
          insertMarkdown(`![${file.name}](${reader.result})`);
        };
        reader.readAsDataURL(file);
      }

      e.target.value = "";
    },
    [insertMarkdown, onImageUpload]
  );

  const toolbarButtons = [
    { label: "H2", action: () => insertMarkdown("## ", "", "标题") },
    { label: "H3", action: () => insertMarkdown("### ", "", "小标题") },
    { label: "B", action: () => insertMarkdown("**", "**", "加粗文本") },
    { label: "I", action: () => insertMarkdown("*", "*", "斜体文本") },
    { label: "~~", action: () => insertMarkdown("~~", "~~", "删除文本") },
    { label: "`", action: () => insertMarkdown("`", "`", "代码") },
    {
      label: "```",
      action: () => insertMarkdown("```\n", "\n```\n", "代码块"),
    },
    { label: ">", action: () => insertMarkdown("> ", "", "引用") },
    {
      label: "Link",
      action: () => insertMarkdown("[", "](url)", "链接文本"),
    },
    {
      label: "Img",
      action: () => insertMarkdown("![", "](url)", "图片描述"),
    },
    {
      label: "Table",
      action: () =>
        insertMarkdown(
          "| 列1 | 列2 |\n|-----|-----|\n| 内容 | 内容 |\n",
          "",
          ""
        ),
    },
    {
      label: "Math",
      action: () => insertMarkdown("$$\n", "\n$$\n", "数学公式"),
    },
    {
      label: "Mermaid",
      action: () =>
        insertMarkdown(
          "```mermaid\ngraph TD\n    A[开始] --> B[结束]\n",
          "\n```\n",
          ""
        ),
    },
    { label: "---", action: () => insertMarkdown("\n---\n", "", "") },
    {
      label: "-",
      action: () => insertMarkdown("- ", "", "列表项"),
    },
    {
      label: "1.",
      action: () => insertMarkdown("1. ", "", "有序列表"),
    },
    {
      label: "[]",
      action: () => insertMarkdown("- [ ] ", "", "任务"),
    },
  ];

  return (
    <div className="border border-zinc-300 dark:border-zinc-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.action}
            className="px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
            title={btn.label}
          >
            {btn.label}
          </button>
        ))}

        <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-600 mx-1" />

        {/* Image upload */}
        <label className="px-2 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors cursor-pointer">
          Upload
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        <div className="flex-1" />

        {/* Source toggle */}
        <button
          type="button"
          onClick={() => setShowSource(!showSource)}
          className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
            showSource
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          Source
        </button>
      </div>

      {/* Editor area */}
      <div className="flex" style={{ minHeight: "400px" }}>
        {/* Markdown textarea */}
        <div className={`${showSource ? "w-full" : "w-1/2"} border-r border-zinc-200 dark:border-zinc-700`}>
          <textarea
            className="mdx-editor-textarea w-full h-full min-h-[400px] p-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono text-sm resize-none focus:outline-none"
            value={markdown}
            onChange={handleChange}
            placeholder="开始写 Markdown..."
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {!showSource && (
          <div className="w-1/2 p-4 bg-white dark:bg-zinc-900 overflow-y-auto">
            <div className="text-xs text-zinc-400 mb-2 font-medium">预览</div>
            <MarkdownRenderer content={markdown} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-400">
        <span>Markdown</span>
        <span>{markdown.length} 字符</span>
      </div>
    </div>
  );
}
