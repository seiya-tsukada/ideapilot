import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Circle, Loader2, RefreshCw } from 'lucide-react';
import type { StepStatus } from '#shared/analysis.ts';
import { Button } from '../../components/ui/Button.tsx';
import { cn } from '../../lib/cn.ts';
import { pad2 } from '../../lib/format.ts';
import type { AnalysisState } from './useAnalysis.ts';

interface AnalysisScreenProps {
  state: AnalysisState;
  onRetry: () => void;
  onCancel: () => void;
  onUseSample: () => void;
}

const STATUS_META: Record<StepStatus, { label: string; tone: string }> = {
  pending: { label: 'QUEUED', tone: 'text-zinc-400' },
  in_progress: { label: 'RUNNING', tone: 'font-semibold text-brand-600' },
  completed: { label: 'DONE', tone: 'font-medium text-brand-700' },
  error: { label: 'ERROR', tone: 'font-semibold text-red-700' },
};

function StepIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="size-5 text-brand-700" aria-hidden />;
    case 'in_progress':
      return <Loader2 className="size-5 animate-spin text-brand-600" aria-hidden />;
    case 'error':
      return <AlertCircle className="size-5 text-red-600" aria-hidden />;
    case 'pending':
      return <Circle className="size-5 text-zinc-300" aria-hidden />;
  }
}

/** Seconds since `startedAt`, ticking until `finishedAt` is set. */
function useElapsedSeconds(startedAt: number | null, finishedAt: number | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt === null || finishedAt !== null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [startedAt, finishedAt]);

  if (startedAt === null) return 0;
  return Math.max(0, Math.floor(((finishedAt ?? now) - startedAt) / 1000));
}

export function AnalysisScreen({ state, onRetry, onCancel, onUseSample }: AnalysisScreenProps) {
  const { input, steps, message, error } = state;
  const elapsed = useElapsedSeconds(state.startedAt, state.finishedAt);
  const completed = steps.filter((s) => s.status === 'completed').length;
  const percent = Math.round((completed / steps.length) * 100);

  return (
    <main className="mx-auto max-w-[920px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <article className="sheet">
        <header className="space-y-5 border-b border-night-600 bg-night-700 px-6 py-7 text-white sm:px-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow text-brand-300">AI DECISION ANALYSIS · {input?.purpose.toUpperCase()}</span>
              <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                {error ? '分析処理が中断されました' : '事業構想・意思決定資料を構築しています'}
              </h1>
            </div>

            <dl className="flex shrink-0 items-baseline gap-6 font-mono tabular-nums">
              <div>
                <dt className="text-[11px] text-zinc-400">PROGRESS</dt>
                <dd className="text-3xl font-bold">{percent}%</dd>
              </div>
              <div>
                <dt className="text-[11px] text-zinc-400">ELAPSED</dt>
                <dd className="text-2xl font-semibold text-brand-300">{elapsed}s</dd>
              </div>
            </dl>
          </div>

          <div
            className="h-1.5 w-full overflow-hidden rounded-xs bg-night-600"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn('h-full transition-all duration-300', error ? 'bg-red-500' : 'bg-brand-400')}
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex flex-col gap-2 border-t border-night-600 pt-2 text-xs sm:flex-row sm:items-center sm:justify-between">
            <span className="text-zinc-200" aria-live="polite">
              {message}
            </span>
            <span className="shrink-0 font-mono text-zinc-400 tabular-nums">
              {completed} / {steps.length} STEPS COMPLETED
            </span>
          </div>
        </header>

        <div className="border-b border-zinc-200 bg-surface-muted px-6 py-4 sm:px-9">
          <div className="mb-1 font-mono text-[11px] text-zinc-500">TARGET IDEA</div>
          <p className="line-clamp-3 text-xs leading-relaxed text-ink">{input?.idea}</p>
        </div>

        {error && (
          <div role="alert" className="space-y-3 border-b border-red-200 bg-red-50 px-6 py-5 sm:px-9">
            <div className="flex items-start gap-2.5 text-sm text-red-900">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
              <div>
                <div className="font-semibold">生成エラーが発生しました</div>
                <p className="mt-1 text-xs leading-relaxed text-red-800">{error}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button onClick={onRetry}>
                <RefreshCw className="size-3.5" aria-hidden />
                再実行する
              </Button>
              <Button variant="secondary" onClick={onUseSample}>
                サンプルデータで主要画面を確認する
              </Button>
              <Button variant="ghost" onClick={onCancel}>
                入力画面へ戻る
              </Button>
            </div>
          </div>
        )}

        <ol className="divide-y divide-zinc-200" aria-label="AI分析ステップの進捗">
          {steps.map((item) => {
            const meta = STATUS_META[item.status];
            const isReached = item.status === 'in_progress' || item.status === 'completed';
            return (
              <li
                key={item.step}
                className={cn(
                  'flex items-start gap-4 px-6 py-4 transition-colors sm:px-9',
                  item.status === 'in_progress' && 'bg-brand-50',
                  item.status === 'error' && 'bg-red-50/50',
                )}
              >
                <div className="mt-0.5 shrink-0">
                  <StepIcon status={item.status} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-sm font-semibold tabular-nums', isReached ? 'text-ink' : 'text-zinc-500')}>
                      {pad2(item.step)}. {item.title}
                    </span>
                    <span className={cn('whitespace-nowrap font-mono text-[11px]', meta.tone)}>{meta.label}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-600">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </article>
    </main>
  );
}
