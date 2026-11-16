import React from 'react';
import { AlertCircle, CheckCircle2, Circle, Loader2, RefreshCw } from 'lucide-react';
import type { AnalysisStepState } from '../types/decision.ts';

interface AnalysisProgressScreenProps {
  ideaText: string;
  purpose: 'Corporate' | 'Startup';
  steps: AnalysisStepState[];
  statusMessage: string;
  elapsedSeconds: number;
  errorMessage: string | null;
  onRetry: () => void;
  onCancel: () => void;
  onUseSampleFallback: () => void;
}

export const AnalysisProgressScreen: React.FC<AnalysisProgressScreenProps> = ({
  ideaText,
  purpose,
  steps,
  statusMessage,
  elapsedSeconds,
  errorMessage,
  onRetry,
  onCancel,
  onUseSampleFallback,
}) => {
  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <main className="max-w-[920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <article className="bg-white border border-zinc-300/90 rounded-sm overflow-hidden">
        {/* Top Telemetry Masthead */}
        <header className="bg-gradient-to-br from-[#1B2822] via-[#16201B] to-[#111815] text-white px-6 py-7 sm:px-9 space-y-5 border-b border-[#29362F]">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-medium text-emerald-300 tracking-wider">
                AI DECISION ANALYSIS · {purpose.toUpperCase()}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {errorMessage
                  ? '分析処理が中断されました'
                  : '事業構想・意思決定資料を構築しています'}
              </h1>
            </div>

            <div className="flex items-baseline gap-6 shrink-0 font-mono tabular-nums">
              <div>
                <div className="text-[11px] text-zinc-400">PROGRESS</div>
                <div className="text-3xl font-bold text-white">{progressPercent}%</div>
              </div>
              <div>
                <div className="text-[11px] text-zinc-400">ELAPSED</div>
                <div className="text-2xl font-semibold text-emerald-300">{elapsedSeconds}s</div>
              </div>
            </div>
          </div>

          <div className="h-1.5 w-full bg-[#24322B] rounded-xs overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                errorMessage
                  ? 'bg-red-500'
                  : 'bg-gradient-to-r from-[#2D9366] to-[#52C48D]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-[#2A3931] text-xs">
            <span className="text-zinc-200">{statusMessage}</span>
            <span className="text-zinc-400 font-mono tabular-nums shrink-0">
              {completedCount} / {steps.length} STEPS COMPLETED
            </span>
          </div>
        </header>

        {/* Target Idea Summary Strip */}
        <div className="px-6 py-4 sm:px-9 bg-[#F7F8F7] border-b border-zinc-200">
          <div className="text-[11px] font-mono text-zinc-500 mb-1">TARGET IDEA</div>
          <p className="text-xs text-[#161B18] leading-relaxed line-clamp-3">{ideaText}</p>
        </div>

        {/* Top-pinned Error Recovery State */}
        {errorMessage && (
          <div
            role="alert"
            className="px-6 py-5 sm:px-9 bg-red-50 border-b border-red-200 space-y-3"
          >
            <div className="flex items-start gap-2.5 text-sm text-red-900">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-semibold">生成エラーが発生しました</div>
                <p className="mt-1 text-xs text-red-800 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-b from-[#1F6E4A] to-[#165539] hover:from-[#1B6040] hover:to-[#12472F] rounded-sm transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>再実行する</span>
              </button>
              <button
                type="button"
                onClick={onUseSampleFallback}
                className="px-4 py-2 text-xs font-medium text-zinc-800 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-sm transition-colors"
              >
                サンプルデータで主要画面を確認する
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-2 text-xs font-medium text-zinc-600 hover:text-[#161B18]"
              >
                入力画面へ戻る
              </button>
            </div>
          </div>
        )}

        {/* 6-Step Pipeline Ledger */}
        <ol className="divide-y divide-zinc-200" aria-label="AI分析ステップの進捗">
          {steps.map((item) => {
            const isActive = item.status === 'in_progress';
            const isDone = item.status === 'completed';
            const isError = item.status === 'error';

            return (
              <li
                key={item.step}
                className={`px-6 py-4 sm:px-9 flex items-start gap-4 transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-[#EBF4EE] to-[#F7FAF8]'
                    : isError
                      ? 'bg-red-50/50'
                      : 'bg-white'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-[#166534]" aria-hidden="true" />
                  ) : isActive ? (
                    <Loader2
                      className="w-5 h-5 text-[#1B6B47] animate-spin"
                      aria-hidden="true"
                    />
                  ) : isError ? (
                    <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-300" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        isActive || isDone ? 'text-[#161B18]' : 'text-zinc-500'
                      }`}
                    >
                      0{item.step}. {item.title}
                    </span>
                    <span
                      className={`text-[11px] font-mono whitespace-nowrap ${
                        isDone
                          ? 'text-[#166534] font-medium'
                          : isActive
                            ? 'text-[#1B6B47] font-semibold'
                            : isError
                              ? 'text-red-700 font-semibold'
                              : 'text-zinc-400'
                      }`}
                    >
                      {isDone
                        ? 'DONE'
                        : isActive
                          ? 'RUNNING'
                          : isError
                            ? 'ERROR'
                            : 'QUEUED'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </article>
    </main>
  );
};
