import React from 'react';
import { parseMarkdownBlocks } from '../utils/exportMarkdown.ts';

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-[#161B18]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 text-[12px] font-mono bg-zinc-100 text-zinc-800 rounded"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export const MarkdownView: React.FC<{ content: string; className?: string }> = ({
  content,
  className = '',
}) => {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`space-y-3 text-sm text-zinc-700 leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'h1') {
          return (
            <h1 key={idx} className="text-lg font-bold text-[#161B18] pt-2">
              {block.text}
            </h1>
          );
        }
        if (block.type === 'h2') {
          return (
            <h2
              key={idx}
              className="text-base font-semibold text-[#161B18] pt-3 pb-1 border-b border-zinc-200"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === 'h3') {
          return (
            <h3 key={idx} className="text-sm font-semibold text-[#161B18] pt-2">
              {block.text}
            </h3>
          );
        }
        if (block.type === 'hr') {
          return <hr key={idx} className="border-zinc-200 my-4" />;
        }
        if (block.type === 'blockquote') {
          return (
            <blockquote
              key={idx}
              className="px-4 py-2.5 bg-[#F7F8F7] border border-zinc-200 rounded-sm text-zinc-700"
            >
              {renderInlineFormatting(block.text)}
            </blockquote>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1.5">
              {block.items.map((item, i) => (
                <li key={i}>{renderInlineFormatting(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-1.5 tabular-nums">
              {block.items.map((item, i) => (
                <li key={i}>{renderInlineFormatting(item)}</li>
              ))}
            </ol>
          );
        }
        if (block.type === 'code') {
          return (
            <pre
              key={idx}
              className="p-4 bg-[#16201B] text-zinc-100 rounded-sm overflow-x-auto text-xs font-mono leading-relaxed"
            >
              <code>{block.content}</code>
            </pre>
          );
        }
        return <p key={idx}>{renderInlineFormatting(block.text)}</p>;
      })}
    </div>
  );
};
