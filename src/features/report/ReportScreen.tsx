import { useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Check, Download, Share2 } from 'lucide-react';
import { EPISTEMIC_TAGS, type DecisionReport } from '#shared/schema.ts';
import { EPISTEMIC_META, VerdictBadge } from '../../components/ui/Badges.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { EditableText } from '../../components/ui/EditableText.tsx';
import { cn } from '../../lib/cn.ts';
import { formatDate, formatDateTime, pad2 } from '../../lib/format.ts';
import { REPORT_TABS, countEpistemicTags, type ReportTabId } from './sections.ts';
import { BusinessModelTab } from './tabs/BusinessModelTab.tsx';
import { BusinessProposalTab } from './tabs/BusinessProposalTab.tsx';
import { DecisionBriefTab } from './tabs/DecisionBriefTab.tsx';
import { ExecutiveSummaryTab } from './tabs/ExecutiveSummaryTab.tsx';
import { MvpSpecTab } from './tabs/MvpSpecTab.tsx';
import type { ReportSectionKey } from './tabs/types.ts';
import { ValidationPlanTab } from './tabs/ValidationPlanTab.tsx';

interface ReportScreenProps {
  report: DecisionReport;
  activeTab: ReportTabId;
  onTabChange: (tab: ReportTabId) => void;
  onUpdate: (updater: (report: DecisionReport) => DecisionReport) => void;
  onGoToExport: () => void;
}

export function ReportScreen({ report, activeTab, onTabChange, onUpdate, onGoToExport }: ReportScreenProps) {
  const tabIndex = Math.max(
    0,
    REPORT_TABS.findIndex((t) => t.id === activeTab),
  );
  const tab = REPORT_TABS[tabIndex];
  const verdict = report.decisionBrief.executiveDecision.verdict;

  const patch =
    <K extends keyof DecisionReport>(key: K) =>
    (value: DecisionReport[K]) =>
      onUpdate((prev) => ({ ...prev, [key]: value }));

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <MobileTabStrip activeTab={activeTab} onTabChange={onTabChange} />

      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <aside className="sticky top-20 hidden w-[232px] shrink-0 flex-col gap-6 pt-1 lg:flex">
          <div className="space-y-3 border-b border-zinc-300 pb-5">
            <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
              <span>DOSSIER VERDICT</span>
              <span className="tabular-nums">{formatDate(report.createdAt)}</span>
            </div>
            <VerdictBadge verdict={verdict} compact />
            <EpistemicBreakdown report={report} />
          </div>

          <nav role="tablist" aria-label="意思決定成果物タブ" aria-orientation="vertical" className="space-y-1">
            <div className="mb-2 font-mono text-[11px] tracking-wider text-zinc-500">DELIVERABLES INDEX</div>
            {REPORT_TABS.map((t, i) => {
              const active = t.id === activeTab;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onTabChange(t.id)}
                  className={cn(
                    'flex w-full items-start gap-2.5 border-l-2 py-2 pr-2 pl-3 text-left transition-colors',
                    'focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none',
                    active ? 'border-brand-600' : 'border-zinc-300/80 text-zinc-600 hover:border-zinc-500 hover:text-ink',
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0 pt-0.5 font-mono text-xs tabular-nums',
                      active ? 'font-bold text-brand-700' : 'text-zinc-400',
                    )}
                  >
                    {pad2(i + 1)}
                  </span>
                  <span className="min-w-0">
                    <span className={cn('block text-[13px] leading-snug', active ? 'font-bold' : 'font-medium text-zinc-700')}>
                      {t.label}
                    </span>
                    <span className="block text-[11px] text-zinc-500">{t.hint}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-zinc-300 pt-4">
            <Button className="w-full" onClick={onGoToExport}>
              <Download className="size-3.5" aria-hidden />
              Markdown出力・取得
            </Button>
          </div>
        </aside>

        <article className="sheet min-w-0 flex-1">
          <header className="space-y-5 border-b border-zinc-200 px-6 py-6 sm:px-9 sm:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-zinc-500 tabular-nums">
                  <span className="font-mono font-semibold text-brand-700">{report.input.purpose}</span>
                  <span>暫定判断: {verdict}</span>
                  <span>生成日時: {formatDateTime(report.createdAt)}</span>
                  {report.isSample && <span>サンプルデータ</span>}
                  <span className="inline-flex items-center gap-1 font-medium text-brand-700">
                    <Check className="size-3.5" aria-hidden />
                    自動保存済み
                  </span>
                </div>
                <EditableText
                  value={report.ideaName}
                  multiline={false}
                  label="事業アイデア名を編集"
                  textClassName="text-xl font-bold leading-snug tracking-tight text-ink sm:text-[26px]"
                  onSave={patch('ideaName')}
                />
              </div>
              <Button variant="secondary" className="lg:hidden" onClick={onGoToExport}>
                <Share2 className="size-3.5" aria-hidden />
                コピー / ダウンロード
              </Button>
            </div>

            <div className="rounded-sm border border-zinc-200 bg-surface-muted px-4 py-3.5 sm:px-5">
              <div className="eyebrow mb-1">OVERALL SUMMARY</div>
              <EditableText value={report.overallSummary} label="全体の要約を編集" onSave={patch('overallSummary')} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-xs font-bold text-brand-700 tabular-nums">CHAPTER {pad2(tabIndex + 1)}</span>
                <span className="text-base font-bold">{tab.label}</span>
                <span className="hidden text-xs text-zinc-500 sm:inline">— {tab.hint}</span>
              </div>
              {activeTab !== 'decision-brief' && (
                <Button variant="link" onClick={() => onTabChange('decision-brief')}>
                  Decision Brief（判断材料）を見る
                  <ArrowRight className="size-3.5" aria-hidden />
                </Button>
              )}
            </div>
          </header>

          <div role="tabpanel" aria-label={tab.label}>
            <TabContent section={tab.section} report={report} patch={patch} />
          </div>
        </article>
      </div>
    </main>
  );
}

function TabContent({
  section,
  report,
  patch,
}: {
  section: ReportSectionKey;
  report: DecisionReport;
  patch: <K extends ReportSectionKey>(key: K) => (value: DecisionReport[K]) => void;
}) {
  switch (section) {
    case 'executiveSummary':
      return <ExecutiveSummaryTab report={report} onChange={patch(section)} />;
    case 'businessModel':
      return <BusinessModelTab report={report} onChange={patch(section)} />;
    case 'decisionBrief':
      return <DecisionBriefTab report={report} onChange={patch(section)} />;
    case 'businessProposal':
      return <BusinessProposalTab report={report} onChange={patch(section)} />;
    case 'mvpSpecification':
      return <MvpSpecTab report={report} onChange={patch(section)} />;
    case 'validationPlan':
      return <ValidationPlanTab report={report} onChange={patch(section)} />;
  }
}

function EpistemicBreakdown({ report }: { report: DecisionReport }) {
  const counts = useMemo(() => countEpistemicTags(report), [report]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  // Bar order: most to least certain.
  const barOrder = ['FACT', 'ESTIMATE', 'HYPOTHESIS', 'UNKNOWN'] as const;

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex h-1.5 w-full overflow-hidden rounded-xs bg-zinc-200">
        {barOrder.map((tag) => (
          <div
            key={tag}
            className={cn('h-full', EPISTEMIC_META[tag].bar)}
            style={{ width: `${(counts[tag] / total) * 100}%` }}
            title={`${tag} ${counts[tag]}`}
          />
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px] text-zinc-600 tabular-nums">
        {EPISTEMIC_TAGS.map((tag) => (
          <div key={tag} className="flex items-center justify-between">
            <dt className={EPISTEMIC_META[tag].text}>{EPISTEMIC_META[tag].short}</dt>
            <dd className="font-semibold text-ink">{counts[tag]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function MobileTabStrip({ activeTab, onTabChange }: { activeTab: ReportTabId; onTabChange: (tab: ReportTabId) => void }) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeTab]);

  return (
    <div className="mb-4 rounded-sm border-b border-zinc-300 bg-white lg:hidden">
      <div role="tablist" aria-label="意思決定成果物タブ（モバイル）" className="flex items-center gap-1 overflow-x-auto px-2">
        {REPORT_TABS.map((t, i) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              ref={active ? activeRef : undefined}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(t.id)}
              className={cn(
                'shrink-0 border-b-2 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors',
                active ? 'border-brand-600 font-semibold text-brand-800' : 'border-transparent text-zinc-600',
              )}
            >
              {pad2(i + 1)}. {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
