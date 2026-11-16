import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, Info, XOctagon } from 'lucide-react';
import type { DecisionVerdict, EpistemicTag, PriorityLevel } from '../types/decision.ts';
import { EPISTEMIC_META } from '../utils/validation.ts';

interface EpistemicTagProps {
  tag: EpistemicTag;
  onChange?: (next: EpistemicTag) => void;
}

const EPISTEMIC_ORDER: EpistemicTag[] = ['FACT', 'HYPOTHESIS', 'ESTIMATE', 'UNKNOWN'];

export const EpistemicBadge: React.FC<EpistemicTagProps> = ({ tag, onChange }) => {
  const meta = EPISTEMIC_META[tag] ?? EPISTEMIC_META.UNKNOWN;

  const icon =
    tag === 'FACT' ? (
      <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
    ) : tag === 'HYPOTHESIS' ? (
      <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
    ) : tag === 'ESTIMATE' ? (
      <Info className="w-3 h-3 shrink-0" aria-hidden="true" />
    ) : (
      <HelpCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
    );

  const tagTone =
    tag === 'FACT'
      ? 'text-[#14532D] bg-[#EAF4EE] border-[#A7D3B9]'
      : tag === 'HYPOTHESIS'
        ? 'text-[#6B4F1D] bg-[#FAF6EC] border-[#DFCFA9]'
        : tag === 'ESTIMATE'
          ? 'text-[#2D473A] bg-[#EEF3F0] border-[#BCCDC3]'
          : 'text-zinc-700 bg-zinc-100 border-zinc-300';

  if (onChange) {
    const handleCycle = () => {
      const idx = EPISTEMIC_ORDER.indexOf(tag);
      const next = EPISTEMIC_ORDER[(idx + 1) % EPISTEMIC_ORDER.length];
      onChange(next);
    };

    return (
      <button
        type="button"
        onClick={handleCycle}
        title={`${meta.description}（クリックで区分を切り替え）`}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono font-medium border rounded-xs whitespace-nowrap shrink-0 transition-colors hover:opacity-80 ${tagTone}`}
      >
        {icon}
        <span>{meta.label}</span>
        <span className="font-sans text-[11px] opacity-85">{meta.jaLabel}</span>
      </button>
    );
  }

  return (
    <span
      title={meta.description}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono font-medium border rounded-xs whitespace-nowrap shrink-0 ${tagTone}`}
    >
      {icon}
      <span>{meta.label}</span>
      <span className="font-sans text-[11px] opacity-85">{meta.jaLabel}</span>
    </span>
  );
};

export const VerdictBadge: React.FC<{ verdict: DecisionVerdict }> = ({ verdict }) => {
  if (verdict === 'GO') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold border border-[#74B58E] bg-[#EAF4EE] text-[#14532D] rounded-xs whitespace-nowrap shrink-0">
        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>GO（推進推奨）</span>
      </span>
    );
  }
  if (verdict === 'NO-GO') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold border border-[#DF9E9E] bg-[#FDF2F2] text-[#7F1D1D] rounded-xs whitespace-nowrap shrink-0">
        <XOctagon className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>NO-GO（見送り・再検討）</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold border border-[#D6BE8A] bg-[#FAF5EA] text-[#614512] rounded-xs whitespace-nowrap shrink-0">
      <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>CONDITIONAL GO（条件付き推進）</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  const style =
    priority === 'P0'
      ? 'text-[#14532D] bg-[#EAF4EE] border-[#9ECBAE]'
      : priority === 'P1'
        ? 'text-zinc-800 bg-zinc-100 border-zinc-300'
        : 'text-zinc-600 bg-white border-zinc-300';

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono font-semibold border rounded-xs tabular-nums whitespace-nowrap shrink-0 ${style}`}
    >
      {priority}
    </span>
  );
};
