"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownPreviewProps = {
  content: string;
  className?: string;
};

export function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  return (
    <div
      className={`font-body text-gray-900 leading-relaxed [&_h1]:font-heading [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:rounded-chip [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:scrollbar [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-700 ${className}`.trim()}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || ""}</ReactMarkdown>
    </div>
  );
}
