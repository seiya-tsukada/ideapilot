import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  FileCode2,
  FileText,
} from 'lucide-react';
import type { DecisionReport } from '../types/decision.ts';
import {
  businessModelToMarkdown,
  decisionBriefToMarkdown,
  executiveSummaryToMarkdown,
  mvpToMarkdown,
  proposalToMarkdown,
  reportToFullMarkdown,
  validationPlanToMarkdown,
} from '../utils/exportMarkdown.ts';
import { MarkdownView } from './MarkdownView.tsx';

interface ExportScreenProps {
  report: DecisionReport;
  onBackToEdit: () => void;
}

type DeliverableKey =
  | 'all'
  | 'executive-summary'
  | 'business-model'
  | 'decision-brief'
  | 'business-proposal'
  | 'mvp-specification'
  | 'validation-plan'
  | 'ai-studio-prompt';

export const ExportScreen: React.FC<ExportScreenProps> = ({ report, onBackToEdit }) => {
  const [selectedKey, setSelectedKey] = useState<DeliverableKey>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  const deliverables: Array<{
    key: DeliverableKey;
    label: string;
    content: string;
  }> = useMemo(
    () => [
      { key: 'all', label: '全成果物（統合Markdown）', content: reportToFullMarkdown(report) },
      {
        key: 'executive-summary',
        label: '01. Executive Summary',
        content: executiveSummaryToMarkdown(report),
      },
      {
        key: 'business-model',
        label: '02. Business Model',
        content: businessModelToMarkdown(report),
      },
      {
        key: 'decision-brief',
        label: '03. Decision Brief',
        content: decisionBriefToMarkdown(report),
      },
      {
        key: 'business-proposal',
        label: '04. Business Proposal（事業提案書）',
        content: proposalToMarkdown(report),
      },
      {
        key: 'mvp-specification',
        label: '05. MVP Specification（仕様書）',
        content: mvpToMarkdown(report),
      },
      {
        key: 'validation-plan',
        label: '06. Validation Plan（検証計画）',
        content: validationPlanToMarkdown(report),
      },
      {
        key: 'ai-studio-prompt',
        label: 'Google AI Studio用ビルドプロンプト',
        content: report.mvpSpecification.aiStudioBuildPrompt,
      },
    ],
    [report],
  );

  const selectedItem = deliverables.find((d) => d.key === selectedKey) ?? deliverables[0];

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => {
      setFeedback((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showFeedback(`「${label}」をクリップボードにコピーしました。`);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showFeedback(`「${label}」をクリップボードにコピーしました。`);
    }
  };

  const downloadMarkdownFile = (filename: string, content: string, label: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showFeedback(`「${label}」(${filename}) をダウンロードしました。`);
  };

  const safeSlug =
    report.ideaName
      .replace(/[^\p{L}\p{N}_-]+/gu, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'idea_decision_report';

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      {/* Feedback Banner */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#14532D] bg-[#EAF4EE] border border-[#9ECBAE] rounded-sm"
        >
          <Check className="w-4 h-4 text-[#166534] shrink-0" aria-hidden="true" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Single Continuous Editorial Export Folio */}
      <article className="bg-white border border-zinc-300/90 rounded-sm overflow-hidden">
        {/* Folio Header */}
        <header className="px-6 py-6 sm:px-8 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 bg-gradient-to-r from-[#F6F8F6] to-white">
          <div>
            <div className="text-xs font-mono text-[#166534] font-semibold">
              EXPORT & HANDOFF FOLIO · {report.input.purpose}
            </div>
            <h1 className="text-2xl font-bold text-[#161B18] mt-1">{report.ideaName}</h1>
            <p className="text-sm text-zinc-600 mt-1">
              生成した意思決定資料とMVP開発プロンプトを外部ドキュメントや開発環境へ出力します。
            </p>
          </div>
          <button
            type="button"
            onClick={onBackToEdit}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#161B18] bg-white border border-zinc-300 hover:bg-zinc-50 rounded-sm transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>生成内容を再編集する</span>
          </button>
        </header>

        {/* Seamless Two-Column Ruled Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
          {/* Left Action Ledger (4 cols) */}
          <aside className="lg:col-span-4 divide-y divide-zinc-200 bg-[#FAFBFA]">
            <div className="px-5 py-3 bg-gradient-to-r from-[#1B2822] to-[#141D18] text-emerald-200 text-xs font-mono font-semibold">
              COPY & DOWNLOAD ACTIONS
            </div>

            <button
              type="button"
              onClick={() => copyText(reportToFullMarkdown(report), '全成果物（Markdown形式）')}
              className="w-full text-left px-5 py-3.5 hover:bg-gradient-to-r hover:from-[#EDF5F0] hover:to-white transition-colors flex items-start gap-3"
            >
              <Copy className="w-4 h-4 text-[#166534] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-sm font-semibold text-[#161B18]">
                  全成果物をMarkdown形式でコピー
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">6成果物を統合してコピー</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                copyText(
                  report.mvpSpecification.aiStudioBuildPrompt,
                  'Google AI Studio用アプリ生成プロンプト',
                )
              }
              className="w-full text-left px-5 py-3.5 hover:bg-gradient-to-r hover:from-[#EDF5F0] hover:to-white transition-colors flex items-start gap-3"
            >
              <FileCode2 className="w-4 h-4 text-[#166534] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-sm font-semibold text-[#161B18]">
                  Google AI Studio用プロンプトをコピー
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">Buildモード投入用プロンプト</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => copyText(selectedItem.content, selectedItem.label)}
              className="w-full text-left px-5 py-3.5 hover:bg-gradient-to-r hover:from-[#EDF5F0] hover:to-white transition-colors flex items-start gap-3"
            >
              <FileText className="w-4 h-4 text-[#166534] mt-0.5 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#161B18]">
                  選択中の個別成果物をコピー
                </div>
                <div className="text-xs text-zinc-500 mt-0.5 truncate">
                  対象: {selectedItem.label}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                downloadMarkdownFile(
                  `${safeSlug}_proposal.md`,
                  proposalToMarkdown(report),
                  '事業提案書（Markdown）',
                )
              }
              className="w-full text-left px-5 py-3.5 hover:bg-gradient-to-r hover:from-[#EDF5F0] hover:to-white transition-colors flex items-start gap-3"
            >
              <Download className="w-4 h-4 text-[#166534] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-sm font-semibold text-[#161B18]">
                  提案書をMarkdownファイルとしてダウンロード
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {report.input.purpose}向け12セクション構成（.md）
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                downloadMarkdownFile(
                  `${safeSlug}_mvp_spec.md`,
                  mvpToMarkdown(report),
                  'MVP仕様書（Markdown）',
                )
              }
              className="w-full text-left px-5 py-3.5 hover:bg-gradient-to-r hover:from-[#EDF5F0] hover:to-white transition-colors flex items-start gap-3"
            >
              <Download className="w-4 h-4 text-[#166534] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-sm font-semibold text-[#161B18]">
                  MVP仕様書をMarkdownファイルとしてダウンロード
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  機能一覧・データ構造・AI開発プロンプト（.md）
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                downloadMarkdownFile(
                  `${safeSlug}_full_report.md`,
                  reportToFullMarkdown(report),
                  '全成果物一式（Markdown）',
                )
              }
              className="w-full text-left px-5 py-3.5 hover:bg-gradient-to-r hover:from-[#EDF5F0] hover:to-white transition-colors flex items-start gap-3"
            >
              <Download className="w-4 h-4 text-[#166534] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <div className="text-sm font-semibold text-[#161B18]">
                  全成果物一式をMarkdown保存
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">全6タブの統合アーカイブ</div>
              </div>
            </button>
          </aside>

          {/* Right Live Document Inspector (8 cols) */}
          <section className="lg:col-span-8 flex flex-col">
            <div className="px-6 py-3.5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#F7F8F7]">
              <div className="flex items-center gap-3">
                <label htmlFor="deliverable-select" className="text-xs font-semibold text-zinc-700">
                  プレビュー対象:
                </label>
                <select
                  id="deliverable-select"
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value as DeliverableKey)}
                  className="px-3 py-1.5 text-sm bg-white border border-zinc-300 rounded-sm text-[#161B18] focus:outline-none focus:border-[#1B6B47]"
                >
                  {deliverables.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => copyText(selectedItem.content, selectedItem.label)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#14532D] bg-[#EAF4EE] hover:bg-[#DCEEE3] border border-[#A7D3B9] rounded-sm transition-colors whitespace-nowrap shrink-0"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>この内容をコピー</span>
              </button>
            </div>

            <div className="p-6 sm:p-8 max-h-[700px] overflow-y-auto">
              {selectedKey === 'ai-studio-prompt' ? (
                <pre className="p-4 bg-[#16201B] text-zinc-100 rounded-sm text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
                  {selectedItem.content}
                </pre>
              ) : (
                <MarkdownView content={selectedItem.content} />
              )}
            </div>
          </section>
        </div>
      </article>
    </main>
  );
};
