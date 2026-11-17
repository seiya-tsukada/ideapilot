import { useEffect, useRef } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { DecisionReport } from '#shared/schema.ts';
import { cn } from '../../lib/cn.ts';
import { formatDate } from '../../lib/format.ts';
import { Button, IconButton } from '../ui/Button.tsx';

interface HistoryDrawerProps {
  open: boolean;
  reports: DecisionReport[];
  activeReportId: string | null;
  onClose: () => void;
  onSelect: (report: DecisionReport) => void;
  onDelete: (reportId: string) => void;
  onCreateNew: () => void;
}

export function HistoryDrawer({ open, reports, activeReportId, onClose, onSelect, onDelete, onCreateNew }: HistoryDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const closeAfter = (action: () => void) => () => {
    action();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="過去の生成履歴"
      onClose={onClose}
      // Clicking the backdrop targets the <dialog> element itself.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-md border-l border-zinc-200 bg-white p-0 text-ink backdrop:bg-zinc-950/35"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-surface-muted px-5 py-4">
          <div>
            <h2 className="text-base font-bold">保存済みの分析履歴</h2>
            <p className="mt-0.5 text-xs text-zinc-500">ブラウザのローカルストレージに保存されています</p>
          </div>
          <IconButton label="履歴パネルを閉じる" onClick={onClose}>
            <X className="size-5" aria-hidden />
          </IconButton>
        </div>

        <div className="border-b border-zinc-200 p-4">
          <Button size="md" className="w-full" onClick={closeAfter(onCreateNew)}>
            <Plus className="size-4" aria-hidden />
            新しい事業アイデアを入力する
          </Button>
        </div>

        <ul className="flex-1 space-y-2.5 overflow-y-auto p-4">
          {reports.length === 0 && (
            <li className="py-12 text-center text-sm text-zinc-500">まだ保存された分析レポートはありません。</li>
          )}
          {reports.map((report) => (
            <li
              key={report.id}
              className={cn(
                'flex items-start justify-between gap-2 rounded-sm border p-3.5 transition-colors',
                report.id === activeReportId ? 'border-brand-600 bg-brand-50' : 'border-zinc-200 hover:border-zinc-300',
              )}
            >
              <button type="button" onClick={closeAfter(() => onSelect(report))} className="min-w-0 flex-1 text-left">
                <div className="truncate text-sm font-semibold">{report.ideaName}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 tabular-nums">
                  <span>{report.input.purpose}</span>
                  <span aria-hidden>·</span>
                  <span>{report.decisionBrief.executiveDecision.verdict}</span>
                  <span aria-hidden>·</span>
                  <span>{formatDate(report.updatedAt)}</span>
                </div>
              </button>
              <IconButton tone="danger" label={`「${report.ideaName}」を削除`} onClick={() => onDelete(report.id)}>
                <Trash2 className="size-4" aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
