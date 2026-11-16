import React, { useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Check, Download, Share2 } from 'lucide-react';
import type { DecisionReport, EpistemicTag, ReportTabId } from '../types/decision.ts';
import { EditableText } from './EditableText.tsx';
import { ExecutiveSummaryTab } from './tabs/ExecutiveSummaryTab.tsx';
import { BusinessModelTab } from './tabs/BusinessModelTab.tsx';
import { DecisionBriefTab } from './tabs/DecisionBriefTab.tsx';
import { BusinessProposalTab } from './tabs/BusinessProposalTab.tsx';
import { MvpSpecTab } from './tabs/MvpSpecTab.tsx';
import { ValidationPlanTab } from './tabs/ValidationPlanTab.tsx';

interface DecisionReportScreenProps {
  report: DecisionReport;
  activeTab: ReportTabId;
  saveStatus: 'saved' | 'saving';
  onTabChange: (tab: ReportTabId) => void;
  onUpdateReport: (updater: (prev: DecisionReport) => DecisionReport) => void;
  onGoToExport: () => void;
}

const TABS: Array<{ id: ReportTabId; num: string; label: string; jaHint: string }> = [
  { id: 'executive-summary', num: '01', label: 'Executive Summary', jaHint: '経営サマリー' },
  { id: 'business-model', num: '02', label: 'Business Model', jaHint: '事業構造・収益比較' },
  { id: 'decision-brief', num: '03', label: 'Decision Brief', jaHint: 'GO/NO-GO 判断材料' },
  { id: 'business-proposal', num: '04', label: 'Business Proposal', jaHint: '12章 事業提案書' },
  { id: 'mvp-specification', num: '05', label: 'MVP Specification', jaHint: '3日MVP・開発指示' },
  { id: 'validation-plan', num: '06', label: 'Validation Plan', jaHint: '検証計画・質問集' },
];

function countEpistemicTags(report: DecisionReport): Record<EpistemicTag, number> {
  const counts: Record<EpistemicTag, number> = {
    FACT: 0,
    HYPOTHESIS: 0,
    ESTIMATE: 0,
    UNKNOWN: 0,
  };

  const add = (tag?: EpistemicTag) => {
    if (tag && tag in counts) counts[tag] += 1;
  };

  const es = report.executiveSummary;
  add(es.ideaOverview.epistemic);
  add(es.customerProblem.epistemic);
  add(es.targetCustomer.epistemic);
  add(es.valueProposition.epistemic);
  add(es.monetizationDirection.epistemic);
  add(es.competitiveAdvantageHypothesis.epistemic);
  es.keyIssuesToResolve.forEach((i) => add(i.epistemic));

  report.businessModel.blocks.forEach((b) => b.items.forEach((i) => add(i.epistemic)));
  report.businessModel.revenueModelComparisons.forEach((c) => add(c.epistemic));

  add(report.decisionBrief.executiveDecision.epistemic);
  report.decisionBrief.opportunityAssessment.forEach((o) => add(o.epistemic));
  report.decisionBrief.keyRisks.forEach((r) => add(r.epistemic));
  report.decisionBrief.criticalAssumptions.forEach((a) => add(a.epistemic));

  report.businessProposal.sections.forEach((s) => add(s.epistemic));
  add(report.mvpSpecification.productConcept.epistemic);
  add(report.mvpSpecification.targetUsers.epistemic);
  add(report.mvpSpecification.problemSolved.epistemic);

  return counts;
}

export const DecisionReportScreen: React.FC<DecisionReportScreenProps> = ({
  report,
  activeTab,
  saveStatus,
  onTabChange,
  onUpdateReport,
  onGoToExport,
}) => {
  const mobileActiveTabRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    mobileActiveTabRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeTab]);

  const epistemicCounts = useMemo(() => countEpistemicTags(report), [report]);
  const totalTags =
    epistemicCounts.FACT +
    epistemicCounts.HYPOTHESIS +
    epistemicCounts.ESTIMATE +
    epistemicCounts.UNKNOWN || 1;

  const formattedDate = new Date(report.createdAt).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const verdict = report.decisionBrief.executiveDecision.verdict;
  const verdictLabelTone =
    verdict === 'GO'
      ? 'text-[#14532D] bg-[#EAF4EE] border-[#8EC3A2]'
      : verdict === 'NO-GO'
        ? 'text-[#7F1D1D] bg-[#FDF2F2] border-[#DF9E9E]'
        : 'text-[#614512] bg-[#FAF5EA] border-[#D6BE8A]';

  const activeTabMeta = TABS.find((t) => t.id === activeTab) ?? TABS[2];

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Mobile Horizontal Tab Strip */}
      <div className="lg:hidden mb-4 border-b border-zinc-300 bg-white rounded-sm">
        <div
          role="tablist"
          aria-label="意思決定成果物タブ（モバイル）"
          className="flex items-center gap-1 overflow-x-auto px-2"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={isActive ? mobileActiveTabRef : undefined}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-[#1B6B47] text-[#14532D] font-semibold'
                    : 'border-transparent text-zinc-600'
                }`}
              >
                {tab.num}. {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Quiet Editorial Marginalia Index (No heavy box/card stacks) */}
        <aside className="hidden lg:flex lg:w-[232px] shrink-0 flex-col gap-6 sticky top-20 pt-1">
          {/* Compact Verdict & Epistemic Ratio */}
          <div className="space-y-3 pb-5 border-b border-zinc-300">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>DOSSIER VERDICT</span>
              <span className="tabular-nums">
                {new Date(report.createdAt).toLocaleDateString('ja-JP')}
              </span>
            </div>

            <div
              className={`inline-flex items-center px-2.5 py-1 text-xs font-mono font-semibold border rounded-xs ${verdictLabelTone}`}
            >
              {verdict}
            </div>

            {/* Epistemic Proportion Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="h-1.5 w-full bg-zinc-200 rounded-xs overflow-hidden flex">
                <div
                  className="bg-[#1F6E4A] h-full"
                  style={{ width: `${(epistemicCounts.FACT / totalTags) * 100}%` }}
                  title={`FACT ${epistemicCounts.FACT}`}
                />
                <div
                  className="bg-[#7A9C8A] h-full"
                  style={{ width: `${(epistemicCounts.ESTIMATE / totalTags) * 100}%` }}
                  title={`ESTIMATE ${epistemicCounts.ESTIMATE}`}
                />
                <div
                  className="bg-[#C7A96B] h-full"
                  style={{ width: `${(epistemicCounts.HYPOTHESIS / totalTags) * 100}%` }}
                  title={`HYPOTHESIS ${epistemicCounts.HYPOTHESIS}`}
                />
                <div
                  className="bg-zinc-400 h-full"
                  style={{ width: `${(epistemicCounts.UNKNOWN / totalTags) * 100}%` }}
                  title={`UNKNOWN ${epistemicCounts.UNKNOWN}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono tabular-nums text-zinc-600">
                <div className="flex items-center justify-between">
                  <span className="text-[#14532D]">FACT</span>
                  <span className="font-semibold text-[#161B18]">{epistemicCounts.FACT}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B4F1D]">HYP</span>
                  <span className="font-semibold text-[#161B18]">{epistemicCounts.HYPOTHESIS}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#2D473A]">EST</span>
                  <span className="font-semibold text-[#161B18]">{epistemicCounts.ESTIMATE}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">UNK</span>
                  <span className="font-semibold text-[#161B18]">{epistemicCounts.UNKNOWN}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Typographic Table of Contents */}
          <nav
            role="tablist"
            aria-label="意思決定成果物タブ"
            aria-orientation="vertical"
            className="space-y-1"
          >
            <div className="text-[11px] font-mono text-zinc-500 mb-2 tracking-wider">
              DELIVERABLES INDEX
            </div>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full text-left pl-3 pr-2 py-2 border-l-2 transition-colors flex items-start gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B6B47] ${
                    isActive
                      ? 'border-[#1B6B47] text-[#161B18]'
                      : 'border-zinc-300/80 text-zinc-600 hover:border-zinc-500 hover:text-[#161B18]'
                  }`}
                >
                  <span
                    className={`text-xs font-mono tabular-nums pt-0.5 shrink-0 ${
                      isActive ? 'text-[#166534] font-bold' : 'text-zinc-400'
                    }`}
                  >
                    {tab.num}
                  </span>
                  <div className="min-w-0">
                    <div
                      className={`text-[13px] leading-snug ${
                        isActive ? 'font-bold text-[#161B18]' : 'font-medium text-zinc-700'
                      }`}
                    >
                      {tab.label}
                    </div>
                    <div className="text-[11px] text-zinc-500">{tab.jaHint}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Quiet Export Trigger */}
          <div className="pt-4 border-t border-zinc-300">
            <button
              type="button"
              onClick={onGoToExport}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-white bg-gradient-to-b from-[#1F6E4A] to-[#165539] hover:from-[#1B6040] hover:to-[#12472F] rounded-sm transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Markdown出力・取得</span>
            </button>
          </div>
        </aside>

        {/* Right Continuous White Executive Dossier Sheet (Single Folio) */}
        <article className="flex-1 min-w-0 bg-white border border-zinc-300/90 rounded-sm overflow-hidden">
          {/* Integrated Document Masthead */}
          <header className="px-6 py-6 sm:px-9 sm:py-7 border-b border-zinc-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-zinc-500 tabular-nums">
                  <span className="font-mono font-semibold text-[#166534]">
                    {report.input.purpose}
                  </span>
                  <span>暫定判断: {verdict}</span>
                  <span>生成日時: {formattedDate}</span>
                  {report.isSample && <span>サンプルデータ</span>}
                  <span className="inline-flex items-center gap-1 text-[#166534] font-medium">
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{saveStatus === 'saving' ? '保存中...' : '自動保存済み'}</span>
                  </span>
                </div>

                <EditableText
                  value={report.ideaName}
                  multiline={false}
                  label="事業アイデア名を編集"
                  textClassName="text-xl sm:text-[26px] font-bold text-[#161B18] tracking-tight leading-snug"
                  onSave={(nextName) =>
                    onUpdateReport((prev) => ({
                      ...prev,
                      ideaName: nextName,
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
              </div>

              <button
                type="button"
                onClick={onGoToExport}
                className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-sm transition-colors whitespace-nowrap shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>コピー / ダウンロード</span>
              </button>
            </div>

            {/* Editorial Abstract Band */}
            <div className="bg-gradient-to-r from-[#F6F8F6] to-[#FAFBFA] border border-zinc-200/90 rounded-sm px-4 py-3.5 sm:px-5">
              <div className="text-[11px] font-mono font-semibold text-[#166534] mb-1">
                OVERALL SUMMARY
              </div>
              <EditableText
                value={report.overallSummary}
                label="全体の要約を編集"
                textClassName="text-sm text-zinc-700 leading-relaxed"
                onSave={(nextSummary) =>
                  onUpdateReport((prev) => ({
                    ...prev,
                    overallSummary: nextSummary,
                    updatedAt: new Date().toISOString(),
                  }))
                }
              />
            </div>

            {/* Integrated Chapter Ribbon & Decision Shortcut */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-baseline gap-2.5">
                <span className="text-xs font-mono font-bold text-[#166534] tabular-nums">
                  CHAPTER {activeTabMeta.num}
                </span>
                <span className="text-base font-bold text-[#161B18]">{activeTabMeta.label}</span>
                <span className="text-xs text-zinc-500 hidden sm:inline">
                  — {activeTabMeta.jaHint}
                </span>
              </div>

              {activeTab !== 'decision-brief' && (
                <button
                  type="button"
                  onClick={() => onTabChange('decision-brief')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] hover:underline whitespace-nowrap"
                >
                  <span>Decision Brief（判断材料）を見る</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </header>

          {/* Active Deliverable Body — Rendered directly onto the single white folio */}
          <div
            role="tabpanel"
            aria-label={activeTabMeta.label}
            className="divide-y divide-zinc-200"
          >
            {activeTab === 'executive-summary' && (
              <ExecutiveSummaryTab
                report={report}
                onUpdate={(nextEs) =>
                  onUpdateReport((prev) => ({
                    ...prev,
                    executiveSummary: nextEs,
                    updatedAt: new Date().toISOString(),
                  }))
                }
              />
            )}

            {activeTab === 'business-model' && (
              <BusinessModelTab
                businessModel={report.businessModel}
                onUpdate={(nextBm) =>
                  onUpdateReport((prev) => ({
                    ...prev,
                    businessModel: nextBm,
                    updatedAt: new Date().toISOString(),
                  }))
                }
              />
            )}

            {activeTab === 'decision-brief' && (
              <DecisionBriefTab
                reportId={report.id}
                brief={report.decisionBrief}
                onUpdate={(nextBrief) =>
                  onUpdateReport((prev) => ({
                    ...prev,
                    decisionBrief: nextBrief,
                    updatedAt: new Date().toISOString(),
                  }))
                }
              />
            )}

            {activeTab === 'business-proposal' && (
              <BusinessProposalTab
                report={report}
                onUpdate={(nextProposal) =>
                  onUpdateReport((prev) => ({
                    ...prev,
                    businessProposal: nextProposal,
                    updatedAt: new Date().toISOString(),
                  }))
                }
              />
            )}

            {activeTab === 'mvp-specification' && (
              <MvpSpecTab
                spec={report.mvpSpecification}
                onUpdate={(nextSpec) =>
                  onUpdateReport((prev) => ({
                    ...prev,
                    mvpSpecification: nextSpec,
                    updatedAt: new Date().toISOString(),
                  }))
                }
              />
            )}

            {activeTab === 'validation-plan' && (
              <ValidationPlanTab
                plan={report.validationPlan}
                onUpdate={(nextPlan) =>
                  onUpdateReport((prev) => ({
                    ...prev,
                    validationPlan: nextPlan,
                    updatedAt: new Date().toISOString(),
                  }))
                }
              />
            )}
          </div>
        </article>
      </div>
    </main>
  );
};
