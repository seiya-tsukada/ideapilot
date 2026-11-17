import { useState, type KeyboardEvent } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { cn } from '../../lib/cn.ts';
import { Button, IconButton } from './Button.tsx';

interface EditableTextProps {
  value: string;
  onSave: (next: string) => void;
  multiline?: boolean;
  label?: string;
  className?: string;
  textClassName?: string;
  placeholder?: string;
}

export function EditableText({
  value,
  onSave,
  multiline = true,
  label = '内容を編集',
  className,
  textClassName = 'text-sm leading-relaxed text-zinc-700',
  placeholder = '内容を入力してください',
}: EditableTextProps) {
  // `draft === null` means "not editing".
  const [draft, setDraft] = useState<string | null>(null);

  const cancel = () => setDraft(null);
  const confirm = () => {
    const next = draft?.trim();
    if (next && next !== value) onSave(next);
    setDraft(null);
  };

  if (draft === null) {
    return (
      <div className={cn('group flex items-start justify-between gap-3', className)}>
        <div className={cn('flex-1 whitespace-pre-wrap', textClassName)}>{value}</div>
        <IconButton
          label={label}
          onClick={() => setDraft(value)}
          className="opacity-70 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Pencil className="size-3.5" aria-hidden />
        </IconButton>
      </div>
    );
  }

  const fieldProps = {
    value: draft,
    placeholder,
    'aria-label': label,
    autoFocus: true,
    className: 'field bg-white',
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancel();
      if (e.key === 'Enter' && (!multiline || e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        confirm();
      }
    },
  };

  return (
    <div className={cn('space-y-2', className)}>
      {multiline ? (
        <textarea rows={4} onChange={(e) => setDraft(e.target.value)} {...fieldProps} />
      ) : (
        <input type="text" onChange={(e) => setDraft(e.target.value)} {...fieldProps} />
      )}
      <div className="flex items-center gap-2">
        <Button size="xs" onClick={confirm}>
          <Check className="size-3.5" aria-hidden />
          保存
        </Button>
        <Button size="xs" variant="secondary" onClick={cancel}>
          <X className="size-3.5" aria-hidden />
          キャンセル
        </Button>
      </div>
    </div>
  );
}
