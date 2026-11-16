import React, { useState } from 'react';
import { Eye, Pencil } from 'lucide-react';
import type { BusinessProposal, DecisionReport, ProposalSection } from '../../types/decision.ts';
import { proposalToMarkdown } from '../../utils/exportMarkdown.ts';
import { EpistemicBadge } from '../EpistemicTag.tsx';
import { EditableText } from '../EditableText.tsx';
import { MarkdownView } from '../MarkdownView.tsx';

interface BusinessProposalTabProps {
  report: DecisionReport;
  onUpdate: (next: BusinessProposal) => void;
}

export const BusinessProposalTab: React.FC<BusinessProposalTabProps> = ({ report, onUpdate }) => {
  const bp = report.businessProposal;
  const [viewMode, setViewMode] = useState<'sections' | 'markdown'>('sections');

  const updateSection = (number: number, patch: Partial<ProposalSection>) => {
    onUpdate({
      ...bp,
      sections: bp.sections.map((sec) => (sec.number === number ? { ...sec, ...patch } : sec)),
    });
  };

  const jumpToChapter = (chapterNum: number) => {
    const el = document.getElementById(`bp-sec-${chapterNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="divide-y divide-zinc-200">
      {/* Toolbar + 12-Chapter Quick Index */}
      <div className="px-6 py-4 sm:px-9 bg-[#FAFBFA] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono font-semibold text-[#166534]">
              BUSINESS PROPOSAL · {bp.purpose} 構成（12セクション）
            </div>
            <p className="text-xs text-zinc-600 mt-0.5">
              {bp.purpose === 'Corporate'
                ? '経営陣・社内稟議向けに、既存事業シナジー・PoC計画・意思決定事項を整理した構成です。'
                : '投資家・共同創業者向けに、Market Opportunity・GTM・Investment Thesisを整理した構成です。'}
            </p>
          </div>

          <div className="inline-flex items-center p-0.5 bg-zinc-100 border border-zinc-200 rounded-sm shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('sections')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xs transition-colors whitespace-nowrap ${
                viewMode === 'sections'
                  ? 'bg-[#17211C] text-white'
                  : 'text-zinc-600 hover:text-[#161B18]'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              <span>セクション別編集</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('markdown')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xs transition-colors whitespace-nowrap ${
                viewMode === 'markdown'
                  ? 'bg-[#17211C] text-white'
                  : 'text-zinc-600 hover:text-[#161B18]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Markdownプレビュー</span>
            </button>
          </div>
        </div>

        {viewMode === 'sections' && (
          <div className="pt-2 border-t border-zinc-200/80 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            <span className="font-mono text-zinc-400">CHAPTERS:</span>
            {bp.sections.map((s) => (
              <button
                key={s.number}
                type="button"
                onClick={() => jumpToChapter(s.number)}
                className="font-mono text-zinc-600 hover:text-[#166534] transition-colors whitespace-nowrap"
                title={s.title}
              >
                {String(s.number).padStart(2, '0')}.{s.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {viewMode === 'markdown' ? (
        <div className="px-6 py-7 sm:px-9">
          <MarkdownView content={proposalToMarkdown(report)} />
        </div>
      ) : (
        <div className="divide-y divide-zinc-200">
          {bp.sections.map((section) => (
            <article
              id={`bp-sec-${section.number}`}
              key={section.number}
              className="px-6 py-6 sm:px-9 space-y-3 scroll-mt-20"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                <h3 className="text-base font-bold text-[#161B18] tabular-nums">
                  <span className="font-mono text-[#166534] mr-2">
                    {String(section.number).padStart(2, '0')}.
                  </span>
                  {section.title}
                </h3>
                <EpistemicBadge
                  tag={section.epistemic}
                  onChange={(next) => updateSection(section.number, { epistemic: next })}
                />
              </div>

              <div className="max-w-[78ch]">
                <EditableText
                  value={section.content}
                  label={`${section.number}. ${section.title} を編集`}
                  onSave={(nextText) => updateSection(section.number, { content: nextText })}
                />
              </div>

              {section.unknownsOrAssumptions.length > 0 && (
                <div className="mt-3 px-4 py-3 bg-[#F7F8F7] border border-zinc-200 rounded-sm space-y-1.5 max-w-[78ch]">
                  <div className="text-xs font-semibold text-zinc-700">
                    仮定・要調査事項（未確定数値の明示）
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-600">
                    {section.unknownsOrAssumptions.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
