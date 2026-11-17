import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';
import { parseMarkdownBlocks, type MarkdownBlock } from '../../lib/markdown/parse.ts';

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[12px] text-zinc-800">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function Block({ block }: { block: MarkdownBlock }) {
  switch (block.type) {
    case 'h1':
      return <h1 className="pt-2 text-lg font-bold text-ink">{block.text}</h1>;
    case 'h2':
      return <h2 className="border-b border-zinc-200 pt-3 pb-1 text-base font-semibold text-ink">{block.text}</h2>;
    case 'h3':
      return <h3 className="pt-2 text-sm font-semibold text-ink">{block.text}</h3>;
    case 'hr':
      return <hr className="my-4 border-zinc-200" />;
    case 'blockquote':
      return (
        <blockquote className="rounded-sm border border-zinc-200 bg-surface-muted px-4 py-2.5">
          {renderInline(block.text)}
        </blockquote>
      );
    case 'ul':
    case 'ol': {
      const List = block.type;
      return (
        <List className={cn('space-y-1.5 pl-5', List === 'ul' ? 'list-disc' : 'list-decimal tabular-nums')}>
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </List>
      );
    }
    case 'code':
      return <CodeBlock>{block.content}</CodeBlock>;
    case 'paragraph':
      return <p>{renderInline(block.text)}</p>;
  }
}

export function CodeBlock({ children, wrap = false }: { children: string; wrap?: boolean }) {
  return (
    <pre
      className={cn(
        'overflow-x-auto rounded-sm bg-night-800 p-4 font-mono text-xs leading-relaxed text-zinc-100',
        wrap && 'whitespace-pre-wrap',
      )}
    >
      <code>{children}</code>
    </pre>
  );
}

export function MarkdownView({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn('space-y-3 text-sm leading-relaxed text-zinc-700', className)}>
      {parseMarkdownBlocks(content).map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
