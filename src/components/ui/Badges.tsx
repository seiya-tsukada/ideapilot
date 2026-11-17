import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle2, HelpCircle, Info, XOctagon } from 'lucide-react';
import {
  EPISTEMIC_TAGS,
  type DecisionVerdict,
  type EpistemicTag,
  type PriorityLevel,
} from '#shared/schema.ts';
import { cn } from '../../lib/cn.ts';

export const EPISTEMIC_META: Record<
  EpistemicTag,
  { short: string; label: string; description: string; text: string; tone: string; bar: string; icon: LucideIcon }
> = {
  FACT: {
    short: 'FACT',
    label: '確認済み',
    description: 'ユーザー入力や明示された事実に基づく情報',
    text: 'text-brand-800',
    tone: 'text-brand-800 bg-brand-50 border-brand-200',
    bar: 'bg-brand-600',
    icon: CheckCircle2,
  },
  HYPOTHESIS: {
    short: 'HYP',
    label: '仮説',
    description: '今後の顧客・市場検証が必要な仮説',
    text: 'text-hypothesis-800',
    tone: 'text-hypothesis-800 bg-hypothesis-50 border-hypothesis-200',
    bar: 'bg-hypothesis-500',
    icon: AlertTriangle,
  },
  ESTIMATE: {
    short: 'EST',
    label: '推定',
    description: '一般的な事業構造からの合理的な推定',
    text: 'text-estimate-800',
    tone: 'text-estimate-800 bg-estimate-50 border-estimate-200',
    bar: 'bg-estimate-500',
    icon: Info,
  },
  UNKNOWN: {
    short: 'UNK',
    label: '要調査',
    description: '根拠・一次情報が不足しているため調査が必要',
    text: 'text-zinc-500',
    tone: 'text-zinc-700 bg-zinc-100 border-zinc-300',
    bar: 'bg-zinc-400',
    icon: HelpCircle,
  },
};

const badgeBase =
  'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-xs border px-1.5 py-0.5 font-mono text-[11px] font-medium';

const nextTag = (tag: EpistemicTag) =>
  EPISTEMIC_TAGS[(EPISTEMIC_TAGS.indexOf(tag) + 1) % EPISTEMIC_TAGS.length];

interface EpistemicBadgeProps {
  tag: EpistemicTag;
  /** When provided, the badge becomes a button that cycles through tags. */
  onChange?: (next: EpistemicTag) => void;
}

export function EpistemicBadge({ tag, onChange }: EpistemicBadgeProps) {
  const meta = EPISTEMIC_META[tag] ?? EPISTEMIC_META.UNKNOWN;
  const Icon = meta.icon;
  const content = (
    <>
      <Icon className="size-3 shrink-0" aria-hidden />
      <span>{tag}</span>
      <span className="font-sans opacity-85">{meta.label}</span>
    </>
  );

  if (!onChange) {
    return (
      <span title={meta.description} className={cn(badgeBase, meta.tone)}>
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onChange(nextTag(tag))}
      title={`${meta.description}（クリックで区分を切り替え）`}
      className={cn(badgeBase, meta.tone, 'transition-opacity hover:opacity-80')}
    >
      {content}
    </button>
  );
}

const VERDICT_META: Record<DecisionVerdict, { label: string; tone: string; icon: LucideIcon }> = {
  GO: {
    label: 'GO（推進推奨）',
    tone: 'text-brand-800 bg-brand-50 border-brand-300',
    icon: CheckCircle2,
  },
  'CONDITIONAL GO': {
    label: 'CONDITIONAL GO（条件付き推進）',
    tone: 'text-hypothesis-800 bg-hypothesis-50 border-hypothesis-200',
    icon: AlertTriangle,
  },
  'NO-GO': {
    label: 'NO-GO（見送り・再検討）',
    tone: 'text-red-900 bg-red-50 border-red-300',
    icon: XOctagon,
  },
};

export const verdictTone = (verdict: DecisionVerdict) => VERDICT_META[verdict].tone;

export function VerdictBadge({ verdict, compact = false }: { verdict: DecisionVerdict; compact?: boolean }) {
  const { label, tone, icon: Icon } = VERDICT_META[verdict];
  return (
    <span className={cn(badgeBase, 'gap-1.5 px-2.5 py-1 text-xs font-semibold', tone)}>
      {!compact && <Icon className="size-4 shrink-0" aria-hidden />}
      <span>{compact ? verdict : label}</span>
    </span>
  );
}

const PRIORITY_TONE: Record<PriorityLevel, string> = {
  P0: 'text-brand-800 bg-brand-50 border-brand-200',
  P1: 'text-zinc-800 bg-zinc-100 border-zinc-300',
  P2: 'text-zinc-600 bg-white border-zinc-300',
};

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  return <span className={cn(badgeBase, 'font-semibold tabular-nums', PRIORITY_TONE[priority])}>{priority}</span>;
}
