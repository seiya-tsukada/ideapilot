import React from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import type { DecisionReport } from '../types/decision.ts';

interface HistoryDrawerProps {
  isOpen: boolean;
  reports: DecisionReport[];
  activeReportId: string | null;
  onClose: () => void;
  onSelectReport: (report: DecisionReport) => void;
  onDeleteReport: (reportId: string) => void;
  onCreateNew: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  reports,
  activeReportId,
  onClose,
  onSelectReport,
  onDeleteReport,
  onCreateNew,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-zinc-950/35"
      role="dialog"
      aria-modal="true"
      aria-label="過去の生成履歴"
    >
      <div className="w-full max-w-md bg-white h-full border-l border-zinc-200 flex flex-col">
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-[#F7F8F7]">
          <div>
            <h2 className="text-base font-bold text-[#161B18]">保存済みの分析履歴</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              ブラウザのローカルストレージに保存されています
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="履歴パネルを閉じる"
            className="p-1.5 text-zinc-500 hover:text-[#161B18] rounded-sm hover:bg-zinc-200/70"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-4 border-b border-zinc-200">
          <button
            type="button"
            onClick={() => {
              onCreateNew();
              onClose();
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-b from-[#1F6E4A] to-[#165539] hover:from-[#1B6040] hover:to-[#12472F] rounded-sm transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>新しい事業アイデアを入力する</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {reports.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-500">
              まだ保存された分析レポートはありません。
            </div>
          ) : (
            reports.map((rep) => {
              const isActive = rep.id === activeReportId;
              return (
                <div
                  key={rep.id}
                  className={`p-3.5 rounded-sm border transition-colors ${
                    isActive
                      ? 'border-[#1B6B47] bg-gradient-to-r from-[#EAF4EE] to-[#F6FAF7]'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectReport(rep);
                        onClose();
                      }}
                      className="text-left flex-1 min-w-0"
                    >
                      <div className="text-sm font-semibold text-[#161B18] truncate">
                        {rep.ideaName}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 tabular-nums">
                        <span>{rep.input.purpose}</span>
                        <span aria-hidden="true">·</span>
                        <span>{rep.decisionBrief.executiveDecision.verdict}</span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(rep.updatedAt).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteReport(rep.id)}
                      aria-label={`「${rep.ideaName}」を削除`}
                      className="p-1.5 text-zinc-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
