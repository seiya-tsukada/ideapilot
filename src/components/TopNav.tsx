import React from 'react';
import { Compass } from 'lucide-react';
import type { ScreenView } from '../types/decision.ts';

interface TopNavProps {
  currentScreen: ScreenView;
  hasActiveReport: boolean;
  historyCount: number;
  onNavigate: (screen: ScreenView) => void;
  onOpenHistory: () => void;
  onLoadSample: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentScreen,
  hasActiveReport,
  historyCount,
  onNavigate,
  onOpenHistory,
  onLoadSample,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-[#141A17] via-[#19231E] to-[#141A17] text-white border-b border-[#29362F]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('input')}
          className="flex items-center gap-2.5 text-white font-semibold text-base tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm"
        >
          <Compass className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>Idea Decision Engine</span>
        </button>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav
          aria-label="メインナビゲーション"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => onNavigate('input')}
            className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              currentScreen === 'input'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            アイデア入力
          </button>
          <button
            type="button"
            onClick={() => hasActiveReport && onNavigate('report')}
            disabled={!hasActiveReport}
            className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              currentScreen === 'report'
                ? 'border-emerald-400 text-white'
                : hasActiveReport
                  ? 'border-transparent text-zinc-400 hover:text-white'
                  : 'border-transparent text-zinc-600 cursor-not-allowed'
            }`}
          >
            分析レポート
          </button>
          <button
            type="button"
            onClick={() => hasActiveReport && onNavigate('export')}
            disabled={!hasActiveReport}
            className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
              currentScreen === 'export'
                ? 'border-emerald-400 text-white'
                : hasActiveReport
                  ? 'border-transparent text-zinc-400 hover:text-white'
                  : 'border-transparent text-zinc-600 cursor-not-allowed'
            }`}
          >
            エクスポート
          </button>
          <button
            type="button"
            onClick={onOpenHistory}
            className="py-1 whitespace-nowrap shrink-0 border-b-2 border-transparent text-zinc-400 hover:text-white transition-colors tabular-nums"
          >
            履歴 ({historyCount})
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          {currentScreen === 'report' ? (
            <button
              type="button"
              onClick={() => onNavigate('export')}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-b from-[#1F6E4A] to-[#165539] hover:from-[#1B6040] hover:to-[#12472F] border border-emerald-700/40 rounded-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141A17] focus-visible:ring-emerald-400"
            >
              出力・共有へ進む
            </button>
          ) : currentScreen === 'export' ? (
            <button
              type="button"
              onClick={() => onNavigate('input')}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-b from-[#1F6E4A] to-[#165539] hover:from-[#1B6040] hover:to-[#12472F] border border-emerald-700/40 rounded-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141A17] focus-visible:ring-emerald-400"
            >
              新規アイデア入力
            </button>
          ) : (
            <button
              type="button"
              onClick={onLoadSample}
              className="px-4 py-2 text-xs font-semibold text-emerald-100 bg-[#212E28] hover:bg-[#2A3A32] border border-[#374A40] rounded-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141A17] focus-visible:ring-emerald-400"
            >
              サンプル結果を見る
            </button>
          )}
        </div>
      </div>

      {/* Mobile compact secondary bar */}
      <div className="md:hidden border-t border-[#29362F] px-4 py-1.5 flex items-center justify-between gap-2 overflow-x-auto text-xs font-medium bg-[#1A241F]">
        <button
          type="button"
          onClick={() => onNavigate('input')}
          className={`px-2 py-1 whitespace-nowrap shrink-0 rounded-sm ${
            currentScreen === 'input' ? 'text-white bg-[#1B6B47]' : 'text-zinc-400'
          }`}
        >
          入力
        </button>
        <button
          type="button"
          onClick={() => hasActiveReport && onNavigate('report')}
          disabled={!hasActiveReport}
          className={`px-2 py-1 whitespace-nowrap shrink-0 rounded-sm ${
            currentScreen === 'report'
              ? 'text-white bg-[#1B6B47]'
              : hasActiveReport
                ? 'text-zinc-400'
                : 'text-zinc-600'
          }`}
        >
          レポート
        </button>
        <button
          type="button"
          onClick={() => hasActiveReport && onNavigate('export')}
          disabled={!hasActiveReport}
          className={`px-2 py-1 whitespace-nowrap shrink-0 rounded-sm ${
            currentScreen === 'export'
              ? 'text-white bg-[#1B6B47]'
              : hasActiveReport
                ? 'text-zinc-400'
                : 'text-zinc-600'
          }`}
        >
          出力
        </button>
        <button
          type="button"
          onClick={onOpenHistory}
          className="px-2 py-1 whitespace-nowrap shrink-0 text-zinc-300 tabular-nums"
        >
          履歴 ({historyCount})
        </button>
      </div>
    </header>
  );
};
