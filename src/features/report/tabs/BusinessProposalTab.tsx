import { useState } from 'react';
import { Eye, Pencil, type LucideIcon } from 'lucide-react';
import type { ProposalSection } from '#shared/schema.ts';
import { EpistemicBadge } from '../../../components/ui/Badges.tsx';
import { EditableText } from '../../../components/ui/EditableText.tsx';
import { MarkdownView } from '../../../components/ui/MarkdownView.tsx';
import { NumberedTitle } from '../../../components/ui/Section.tsx';
import { cn } from '../../../lib/cn.ts';
import { pad2 } from '../../../lib/format.ts';
import { proposalToMarkdown } from '../../../lib/markdown/export.ts';
import type { TabProps } from './types.ts';

type ViewMode = 'sections' | 'markdown';

const VIEW_MODES: { value: ViewMode; label: string; icon: LucideIcon }[] = [
  { value: 'sections', label: 'セクション別編集', icon: Pencil },
  { value: 'markdown', label: 'Markdownプレビュー', icon: Eye },
];

const PURPOSE_NOTE = {
  Corporate: '経営陣・社内稟議向けに、既存事業シナジー・PoC計画・意思決定事項を整理した構成です。',
  Startup: '投資家・共同創業者向けに、Market Opportunity・GTM・Investment Thesisを整理した構成です。',
} as const;

const chapterId = (n: number) => `bp-sec-${n}`;

export function BusinessProposalTab({ report, onChange }: TabProps<'businessProposal'>) {
  const proposal = report.businessProposal;
  const [mode, setMode] = useState<ViewMode>('sections');

  // Sections are matched by chapter number, which is stable even if the array is reordered.
  const patchSection = (number: number, patch: Partial<ProposalSection>) =>
    onChange({
      ...proposal,
      sections: proposal.sections.map((s) => (s.number === number ? { ...s, ...patch } : s)),
    });

  return (
    <div className="divide-y divide-zinc-200">
      <div className="space-y-3 bg-surface-subtle px-6 py-4 sm:px-9">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="eyebrow">BUSINESS PROPOSAL · {proposal.purpose} 構成（12セクション）</div>
            <p className="mt-0.5 text-xs text-zinc-600">{PURPOSE_NOTE[proposal.purpose]}</p>
          </div>

          <div
            role="group"
            className="inline-flex shrink-0 items-center self-start rounded-sm border border-zinc-200 bg-zinc-100 p-0.5 sm:self-auto"
          >
            {VIEW_MODES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
                className={cn(
                  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-xs px-3 py-1.5 text-xs font-medium transition-colors',
                  mode === value ? 'bg-night-800 text-white' : 'text-zinc-600 hover:text-ink',
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>

        {mode === 'sections' && (
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-zinc-200/80 pt-2 font-mono text-[11px]">
            <span className="text-zinc-400">CHAPTERS:</span>
            {proposal.sections.map(({ number, title }) => (
              <button
                key={number}
                type="button"
                title={title}
                onClick={() =>
                  document.getElementById(chapterId(number))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                className="whitespace-nowrap text-zinc-600 transition-colors hover:text-brand-700"
              >
                {pad2(number)}.{title}
              </button>
            ))}
          </nav>
        )}
      </div>

      {mode === 'markdown' ? (
        <div className="px-6 py-7 sm:px-9">
          <MarkdownView content={proposalToMarkdown(report)} />
        </div>
      ) : (
        <div className="divide-y divide-zinc-200">
          {proposal.sections.map((section) => (
            <article
              key={section.number}
              id={chapterId(section.number)}
              className="scroll-mt-20 space-y-3 px-6 py-6 sm:px-9"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                <NumberedTitle index={section.number} className="text-base">
                  {section.title}
                </NumberedTitle>
                <EpistemicBadge
                  tag={section.epistemic}
                  onChange={(epistemic) => patchSection(section.number, { epistemic })}
                />
              </div>

              <div className="max-w-[78ch] space-y-3">
                <EditableText
                  value={section.content}
                  label={`${section.number}. ${section.title} を編集`}
                  onSave={(content) => patchSection(section.number, { content })}
                />

                {section.unknownsOrAssumptions.length > 0 && (
                  <div className="space-y-1.5 rounded-sm border border-zinc-200 bg-surface-muted px-4 py-3">
                    <h4 className="text-xs font-semibold text-zinc-700">仮定・要調査事項（未確定数値の明示）</h4>
                    <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-600">
                      {section.unknownsOrAssumptions.map((note, i) => (
                        <li key={i}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
