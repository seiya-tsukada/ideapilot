import { Compass } from 'lucide-react';
import { cn } from '../../lib/cn.ts';
import { NAV_ITEMS, type Screen } from '../../navigation.ts';
import { Button } from '../ui/Button.tsx';

interface TopNavProps {
  current: Screen;
  hasActiveReport: boolean;
  historyCount: number;
  onNavigate: (screen: Screen) => void;
  onOpenHistory: () => void;
  onLoadSample: () => void;
}

export function TopNav({ current, hasActiveReport, historyCount, onNavigate, onOpenHistory, onLoadSample }: TopNavProps) {
  const items = NAV_ITEMS.map((item) => ({
    ...item,
    active: current === item.screen,
    disabled: item.requiresReport && !hasActiveReport,
  }));

  const primaryAction =
    current === 'report' ? (
      <Button onClick={() => onNavigate('export')}>出力・共有へ進む</Button>
    ) : current === 'export' ? (
      <Button onClick={() => onNavigate('input')}>新規アイデア入力</Button>
    ) : (
      <Button variant="inverse" onClick={onLoadSample}>
        サンプル結果を見る
      </Button>
    );

  return (
    <header className="sticky top-0 z-30 border-b border-night-600 bg-night-800 text-white">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate('input')}
          className="flex shrink-0 items-center gap-2.5 rounded-sm text-base font-semibold tracking-tight whitespace-nowrap focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:outline-none"
        >
          <Compass className="size-5 shrink-0 text-brand-400" aria-hidden />
          IdeaPilot
        </button>

        <nav aria-label="メインナビゲーション" className="hidden items-center gap-7 text-sm font-medium md:flex">
          {items.map((item) => (
            <button
              key={item.screen}
              type="button"
              disabled={item.disabled}
              aria-current={item.active ? 'page' : undefined}
              onClick={() => onNavigate(item.screen)}
              className={cn(
                'border-b-2 py-1 whitespace-nowrap transition-colors',
                item.active ? 'border-brand-400 text-white' : 'border-transparent text-zinc-400 hover:text-white',
                'disabled:cursor-not-allowed disabled:text-zinc-600 disabled:hover:text-zinc-600',
              )}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onOpenHistory}
            className="border-b-2 border-transparent py-1 whitespace-nowrap text-zinc-400 tabular-nums transition-colors hover:text-white"
          >
            履歴 ({historyCount})
          </button>
        </nav>

        <div className="flex shrink-0 items-center">{primaryAction}</div>
      </div>

      <nav
        aria-label="メインナビゲーション（モバイル）"
        className="flex items-center justify-between gap-2 overflow-x-auto border-t border-night-600 bg-night-700 px-4 py-1.5 text-xs font-medium md:hidden"
      >
        {items.map((item) => (
          <button
            key={item.screen}
            type="button"
            disabled={item.disabled}
            aria-current={item.active ? 'page' : undefined}
            onClick={() => onNavigate(item.screen)}
            className={cn(
              'shrink-0 rounded-sm px-2 py-1 whitespace-nowrap disabled:text-zinc-600',
              item.active ? 'bg-brand-600 text-white' : 'text-zinc-400',
            )}
          >
            {item.shortLabel}
          </button>
        ))}
        <button type="button" onClick={onOpenHistory} className="shrink-0 px-2 py-1 whitespace-nowrap text-zinc-300 tabular-nums">
          履歴 ({historyCount})
        </button>
      </nav>
    </header>
  );
}
