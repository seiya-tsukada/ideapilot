import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { DecisionReport, EpistemicTag, ExecutiveSummary, TaggedItem } from '../../types/decision.ts';
import { EpistemicBadge } from '../EpistemicTag.tsx';
import { EditableText } from '../EditableText.tsx';

interface ExecutiveSummaryTabProps {
  report: DecisionReport;
  onUpdate: (next: ExecutiveSummary) => void;
}

const SINGLE_FIELDS: Array<{
  key: keyof Omit<ExecutiveSummary, 'keyIssuesToResolve'>;
  num: string;
  title: string;
}> = [
  { key: 'ideaOverview', num: '01', title: '事業アイデアの概要' },
  { key: 'customerProblem', num: '02', title: '解決する顧客課題' },
  { key: 'targetCustomer', num: '03', title: 'ターゲット顧客' },
  { key: 'valueProposition', num: '04', title: '提供価値' },
  { key: 'monetizationDirection', num: '05', title: '収益化の方向性' },
  { key: 'competitiveAdvantageHypothesis', num: '06', title: '競争優位性の仮説' },
];

export const ExecutiveSummaryTab: React.FC<ExecutiveSummaryTabProps> = ({ report, onUpdate }) => {
  const es = report.executiveSummary;
  const [showRawInput, setShowRawInput] = useState(false);

  const updateTaggedField = (
    key: keyof Omit<ExecutiveSummary, 'keyIssuesToResolve'>,
    patch: Partial<TaggedItem>,
  ) => {
    onUpdate({
      ...es,
      [key]: {
        ...es[key],
        ...patch,
      },
    });
  };

  const updateIssue = (index: number, patch: Partial<TaggedItem>) => {
    const nextIssues = es.keyIssuesToResolve.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    onUpdate({ ...es, keyIssuesToResolve: nextIssues });
  };

  const addIssue = () => {
    onUpdate({
      ...es,
      keyIssuesToResolve: [
        ...es.keyIssuesToResolve,
        { content: '新しく確認すべき論点を入力してください', epistemic: 'UNKNOWN' },
      ],
    });
  };

  const removeIssue = (index: number) => {
    onUpdate({
      ...es,
      keyIssuesToResolve: es.keyIssuesToResolve.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="divide-y divide-zinc-200">
      {/* User Input Separation Toggle Strip */}
      <div className="px-6 py-3.5 sm:px-9 bg-[#FAFBFA]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-zinc-600">
            各要素には <span className="font-mono font-medium">FACT / HYPOTHESIS / ESTIMATE / UNKNOWN</span> 区分を明示しています（クリックで切替可能）。
          </div>
          <button
            type="button"
            onClick={() => setShowRawInput((prev) => !prev)}
            aria-expanded={showRawInput}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#166534] hover:underline whitespace-nowrap shrink-0"
          >
            {showRawInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>元のユーザー入力を確認</span>
          </button>
        </div>

        {showRawInput && (
          <div className="mt-3 pt-3 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-700">
            <div>
              <span className="font-semibold text-[#161B18]">事業アイデア: </span>
              <span>{report.input.idea}</span>
            </div>
            <div>
              <span className="font-semibold text-[#161B18]">想定顧客: </span>
              <span>{report.input.targetCustomer || '（未入力）'}</span>
            </div>
            <div>
              <span className="font-semibold text-[#161B18]">解決したい課題: </span>
              <span>{report.input.problem || '（未入力）'}</span>
            </div>
            <div>
              <span className="font-semibold text-[#161B18]">提供したい価値: </span>
              <span>{report.input.valueProposition || '（未入力）'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 6 Core Blocks in a Continuous 2-Column Editorial Spread */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-x divide-zinc-200">
        {SINGLE_FIELDS.map(({ key, num, title }) => {
          const item = es[key];
          return (
            <section key={key} className="px-6 py-6 sm:px-8 space-y-3">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                <h3 className="text-sm font-bold text-[#161B18] tabular-nums">
                  <span className="font-mono text-[#166534] mr-1.5">{num}.</span>
                  {title}
                </h3>
                <EpistemicBadge
                  tag={item.epistemic}
                  onChange={(next: EpistemicTag) => updateTaggedField(key, { epistemic: next })}
                />
              </div>
              <EditableText
                value={item.content}
                label={`${title}を編集`}
                onSave={(nextText) => updateTaggedField(key, { content: nextText })}
              />
              {item.sourceNote && (
                <div className="text-xs text-zinc-500 pt-1.5 border-t border-zinc-100">
                  補足: {item.sourceNote}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Key Issues Ledger */}
      <section>
        <div className="px-6 py-4 sm:px-9 bg-gradient-to-r from-[#F4F6F4] to-white border-b border-zinc-200 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#161B18]">事業化に向けた重要な論点</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              経営判断・PoC進行の前に解消または検証すべき主要論点
            </p>
          </div>
          <button
            type="button"
            onClick={addIssue}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#14532D] bg-[#EAF4EE] hover:bg-[#DCEEE3] border border-[#A7D3B9] rounded-sm transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>論点を追加</span>
          </button>
        </div>

        <ul className="divide-y divide-zinc-200">
          {es.keyIssuesToResolve.map((issue, idx) => (
            <li key={idx} className="px-6 py-4 sm:px-9 flex items-start gap-3.5">
              <span className="text-xs font-mono text-zinc-400 tabular-nums mt-1 shrink-0">
                0{idx + 1}.
              </span>
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <EpistemicBadge
                    tag={issue.epistemic}
                    onChange={(next) => updateIssue(idx, { epistemic: next })}
                  />
                </div>
                <EditableText
                  value={issue.content}
                  label={`論点 ${idx + 1} を編集`}
                  onSave={(nextText) => updateIssue(idx, { content: nextText })}
                />
              </div>
              {es.keyIssuesToResolve.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIssue(idx)}
                  aria-label={`論点 ${idx + 1} を削除`}
                  className="p-1.5 text-zinc-400 hover:text-red-700 rounded transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
