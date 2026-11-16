import React, { useEffect, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';

interface EditableTextProps {
  value: string;
  onSave: (nextValue: string) => void;
  multiline?: boolean;
  label?: string;
  className?: string;
  textClassName?: string;
  placeholder?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  multiline = true,
  label = '内容を編集',
  className = '',
  textClassName = 'text-sm text-zinc-700 leading-relaxed',
  placeholder = '内容を入力してください',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleConfirm = () => {
    const trimmed = draft.trim();
    if (trimmed !== value) {
      onSave(trimmed || value);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        {multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder={placeholder}
            aria-label={label}
            className="w-full px-3 py-2 text-sm text-[#161B18] bg-white border border-[#1B6B47] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B47]/20 leading-relaxed"
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            aria-label={label}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirm();
              if (e.key === 'Escape') handleCancel();
            }}
            className="w-full px-3 py-1.5 text-sm text-[#161B18] bg-white border border-[#1B6B47] rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B47]/20"
            autoFocus
          />
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-gradient-to-b from-[#1F6E4A] to-[#165539] hover:from-[#1B6040] hover:to-[#12472F] rounded-sm transition-colors"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <span>保存</span>
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-sm transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>キャンセル</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative flex items-start justify-between gap-3 ${className}`}>
      <div className={`flex-1 whitespace-pre-wrap ${textClassName}`}>{value}</div>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        aria-label={label}
        title={label}
        className="opacity-70 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-[#166534] hover:bg-[#EAF4EE] rounded-sm transition-colors shrink-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B6B47]"
      >
        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};
