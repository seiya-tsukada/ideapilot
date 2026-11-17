import { useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import type { ExecutiveSummary, IdeaInput, TaggedItem } from '#shared/schema.ts';
import { EpistemicBadge } from '../../../components/ui/Badges.tsx';
import { Button, IconButton } from '../../../components/ui/Button.tsx';
import { EditableText } from '../../../components/ui/EditableText.tsx';
import { NumberedTitle, SectionHeader } from '../../../components/ui/Section.tsx';
import { cn } from '../../../lib/cn.ts';
import { pad2 } from '../../../lib/format.ts';
import { removeAt, updateAt } from '../../../lib/immutable.ts';
import type { TabProps } from './types.ts';

type SingleFieldKey = Exclude<keyof ExecutiveSummary, 'keyIssuesToResolve'>;

const SINGLE_FIELDS: { key: SingleFieldKey; title: string }[] = [
  { key: 'ideaOverview', title: '事業アイデアの概要' },
  { key: 'customerProblem', title: '解決する顧客課題' },
  { key: 'targetCustomer', title: 'ターゲット顧客' },
  { key: 'valueProposition', title: '提供価値' },
  { key: 'monetizationDirection', title: '収益化の方向性' },
  { key: 'competitiveAdvantageHypothesis', title: '競争優位性の仮説' },
];

const NEW_ISSUE: TaggedItem = { content: '新しく確認すべき論点を入力してください', epistemic: 'UNKNOWN' };

export function ExecutiveSummaryTab({ report, onChange }: TabProps<'executiveSummary'>) {
  const summary = report.executiveSummary;
  const issues = summary.keyIssuesToResolve;

  const patchField = (key: SingleFieldKey, patch: Partial<TaggedItem>) =>
    onChange({ ...summary, [key]: { ...summary[key], ...patch } });

  const setIssues = (next: TaggedItem[]) => onChange({ ...summary, keyIssuesToResolve: next });

  return (
    <div className="divide-y divide-zinc-200">
      <RawInputPanel input={report.input} />

      <div className="grid grid-cols-1 divide-y divide-zinc-200 md:grid-cols-2 md:divide-x">
        {SINGLE_FIELDS.map(({ key, title }, i) => {
          const item = summary[key];
          return (
            <section key={key} className="space-y-3 px-6 py-6 sm:px-8">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                <NumberedTitle index={i + 1}>{title}</NumberedTitle>
                <EpistemicBadge tag={item.epistemic} onChange={(epistemic) => patchField(key, { epistemic })} />
              </div>
              <EditableText
                value={item.content}
                label={`${title}を編集`}
                onSave={(content) => patchField(key, { content })}
              />
              {item.sourceNote && (
                <div className="border-t border-zinc-100 pt-1.5 text-xs text-zinc-500">補足: {item.sourceNote}</div>
              )}
            </section>
          );
        })}
      </div>

      <section>
        <SectionHeader
          title="事業化に向けた重要な論点"
          description="経営判断・PoC進行の前に解消または検証すべき主要論点"
          actions={
            <Button variant="soft" size="xs" onClick={() => setIssues([...issues, NEW_ISSUE])}>
              <Plus className="size-3.5" aria-hidden />
              論点を追加
            </Button>
          }
        />
        <ul className="divide-y divide-zinc-200">
          {issues.map((issue, i) => (
            <li key={i} className="flex items-start gap-3.5 px-6 py-4 sm:px-9">
              <span className="mt-1 shrink-0 font-mono text-xs text-zinc-400 tabular-nums">{pad2(i + 1)}.</span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <EpistemicBadge
                  tag={issue.epistemic}
                  onChange={(epistemic) => setIssues(updateAt(issues, i, { epistemic }))}
                />
                <EditableText
                  value={issue.content}
                  label={`論点 ${i + 1} を編集`}
                  onSave={(content) => setIssues(updateAt(issues, i, { content }))}
                />
              </div>
              {issues.length > 1 && (
                <IconButton tone="danger" label={`論点 ${i + 1} を削除`} onClick={() => setIssues(removeAt(issues, i))}>
                  <Trash2 className="size-3.5" aria-hidden />
                </IconButton>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function RawInputPanel({ input }: { input: IdeaInput }) {
  const [open, setOpen] = useState(false);
  const rows = [
    ['事業アイデア', input.idea],
    ['想定顧客', input.targetCustomer],
    ['解決したい課題', input.problem],
    ['提供したい価値', input.valueProposition],
  ] as const;

  return (
    <div className="bg-surface-subtle px-6 py-3.5 sm:px-9">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-600">
          各要素には <span className="font-mono font-medium">FACT / HYPOTHESIS / ESTIMATE / UNKNOWN</span>{' '}
          区分を明示しています（クリックで切替可能）。
        </p>
        <Button variant="link" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} aria-hidden />
          元のユーザー入力を確認
        </Button>
      </div>

      {open && (
        <dl className="mt-3 grid grid-cols-1 gap-3 border-t border-zinc-200 pt-3 text-xs text-zinc-700 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="inline font-semibold text-ink">{label}: </dt>
              <dd className="inline">{value || '（未入力）'}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
