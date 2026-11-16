import React, { useEffect, useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import type {
  CriticalAssumption,
  DecisionBrief,
  DecisionVerdict,
  KeyRiskItem,
  NextActionItem,
  OpportunityDimension,
} from '../../types/decision.ts';
import { EpistemicBadge, PriorityBadge, VerdictBadge } from '../EpistemicTag.tsx';
import { EditableText } from '../EditableText.tsx';

interface DecisionBriefTabProps {
  reportId?: string;
  brief: DecisionBrief;
  onUpdate: (next: DecisionBrief) => void;
}

const VERDICTS: DecisionVerdict[] = ['GO', 'CONDITIONAL GO', 'NO-GO'];

const SECTION_LINKS = [
  { id: 'db-decision', label: 'A. 暫定判断' },
  { id: 'db-opportunity', label: 'B. 5軸評価' },
  { id: 'db-risks', label: 'C. 6大リスク' },
  { id: 'db-assumptions', label: 'D. 重要仮説' },
  { id: 'db-actions', label: 'E. 次アクション' },
];

export const DecisionBriefTab: React.FC<DecisionBriefTabProps> = ({
  reportId = 'default',
  brief,
  onUpdate,
}) => {
  const ed = brief.executiveDecision;
  const storageKey = `ide_gate_checks_${reportId}`;

  const [checkedGates, setCheckedGates] = useState<Record<number, boolean>>(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as Record<number, boolean>) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      setCheckedGates(raw ? (JSON.parse(raw) as Record<number, boolean>) : {});
    } catch {
      setCheckedGates({});
    }
  }, [storageKey]);

  const toggleGate = (idx: number) => {
    setCheckedGates((prev) => {
      const next = { ...prev, [idx]: !prev[idx] };
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const completedGates = ed.conditionsToProceed.filter((_, idx) => checkedGates[idx]).length;

  const updateDecision = (patch: Partial<DecisionBrief['executiveDecision']>) => {
    onUpdate({
      ...brief,
      executiveDecision: { ...ed, ...patch },
    });
  };

  const updateOpportunity = (idx: number, patch: Partial<OpportunityDimension>) => {
    onUpdate({
      ...brief,
      opportunityAssessment: brief.opportunityAssessment.map((item, i) =>
        i === idx ? { ...item, ...patch } : item,
      ),
    });
  };

  const updateRisk = (idx: number, patch: Partial<KeyRiskItem>) => {
    onUpdate({
      ...brief,
      keyRisks: brief.keyRisks.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    });
  };

  const updateAssumption = (idx: number, patch: Partial<CriticalAssumption>) => {
    onUpdate({
      ...brief,
      criticalAssumptions: brief.criticalAssumptions.map((item, i) =>
        i === idx ? { ...item, ...patch } : item,
      ),
    });
  };

  const updateNextAction = (idx: number, patch: Partial<NextActionItem>) => {
    onUpdate({
      ...brief,
      nextActions: brief.nextActions.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    });
  };

  const jumpToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="divide-y divide-zinc-200">
      {/* In-Page Section Anchor Strip (UX quick navigation across A-E) */}
      <div className="px-6 py-2.5 sm:px-9 bg-[#FAFBFA] flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
        <span className="font-mono text-[11px] text-zinc-400">SECTIONS:</span>
        {SECTION_LINKS.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => jumpToSection(sec.id)}
            className="text-zinc-600 hover:text-[#166534] font-medium transition-colors whitespace-nowrap"
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* A. Executive Decision — Editorial Two-Column Spread */}
      <section id="db-decision" className="scroll-mt-20">
        <div className="px-6 py-5 sm:px-9 bg-gradient-to-r from-[#F5F7F5] to-white border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono font-semibold text-[#166534]">
              A. EXECUTIVE DECISION
            </span>
            <h2 className="text-base font-bold text-[#161B18] mt-0.5">暫定意思決定と判断理由</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <VerdictBadge verdict={ed.verdict} />
            <EpistemicBadge
              tag={ed.epistemic}
              onChange={(next) => updateDecision({ epistemic: next })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
          {/* Left 7 cols: Verdict Controls + Rationale */}
          <div className="lg:col-span-7 px-6 py-6 sm:px-9 space-y-5">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="text-zinc-500 font-medium">判断区分の変更:</span>
              <div className="inline-flex items-center p-0.5 bg-zinc-100 border border-zinc-200 rounded-sm">
                {VERDICTS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => updateDecision({ verdict: v })}
                    className={`px-2.5 py-1 font-mono text-[11px] font-medium rounded-xs transition-colors whitespace-nowrap ${
                      ed.verdict === v
                        ? 'bg-[#17211C] text-white'
                        : 'text-zinc-600 hover:text-[#161B18]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-zinc-500">
                判断理由（AIによる意思決定材料）
              </h3>
              <EditableText
                value={ed.rationale}
                label="判断理由を編集"
                textClassName="text-sm text-[#161B18] leading-relaxed"
                onSave={(next) => updateDecision({ rationale: next })}
              />
            </div>
          </div>

          {/* Right 5 cols: Uncertainties + Interactive Stage-Gate Checklist */}
          <div className="lg:col-span-5 divide-y divide-zinc-200">
            <div className="p-6 space-y-2.5">
              <h3 className="text-xs font-semibold text-zinc-700">主な不確実性</h3>
              <ul className="space-y-2">
                {ed.keyUncertainties.map((u, i) => (
                  <li key={i} className="text-xs text-zinc-700 flex items-start gap-2">
                    <span className="font-mono text-zinc-400 mt-0.5 shrink-0">•</span>
                    <div className="flex-1">
                      <EditableText
                        value={u}
                        multiline={false}
                        label={`不確実性 ${i + 1} を編集`}
                        textClassName="text-xs text-zinc-700 leading-relaxed"
                        onSave={(next) =>
                          updateDecision({
                            keyUncertainties: ed.keyUncertainties.map((x, idx) =>
                              idx === i ? next : x,
                            ),
                          })
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 space-y-3 bg-gradient-to-b from-[#F5F9F6] to-[#FAFBF9]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-[#14532D]">
                  次のステージへ進むための条件
                </h3>
                <span className="text-[11px] font-mono tabular-nums text-[#166534]">
                  {completedGates}/{ed.conditionsToProceed.length} 確認済
                </span>
              </div>
              <ul className="space-y-2.5">
                {ed.conditionsToProceed.map((c, i) => {
                  const checked = Boolean(checkedGates[i]);
                  return (
                    <li key={i} className="text-xs text-zinc-700 flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => toggleGate(i)}
                        aria-label={`進行条件 ${i + 1} の達成を切り替え`}
                        aria-pressed={checked}
                        className="mt-0.5 text-[#166534] hover:opacity-80 shrink-0"
                      >
                        {checked ? (
                          <CheckSquare className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                        )}
                      </button>
                      <div className={`flex-1 ${checked ? 'opacity-65 line-through' : ''}`}>
                        <EditableText
                          value={c}
                          multiline={false}
                          label={`進行条件 ${i + 1} を編集`}
                          textClassName="text-xs text-zinc-800 leading-relaxed"
                          onSave={(next) =>
                            updateDecision({
                              conditionsToProceed: ed.conditionsToProceed.map((x, idx) =>
                                idx === i ? next : x,
                              ),
                            })
                          }
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* B. Opportunity Assessment — Continuous Specification Ledger */}
      <section id="db-opportunity" className="scroll-mt-20">
        <div className="px-6 py-5 sm:px-9 bg-[#FAFBFA] border-b border-zinc-200 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <div>
            <span className="text-[11px] font-mono font-semibold text-[#166534]">
              B. OPPORTUNITY ASSESSMENT
            </span>
            <h2 className="text-base font-bold text-[#161B18] mt-0.5">
              事業機会と不確実性の5軸評価
            </h2>
          </div>
          <p className="text-xs text-zinc-500">
            根拠のない数値スコアを排除し、根拠・不足情報・確信度を併記
          </p>
        </div>

        <div className="divide-y divide-zinc-200">
          {brief.opportunityAssessment.map((opp, idx) => (
            <div
              key={opp.dimension}
              className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200"
            >
              <div className="lg:col-span-3 px-6 py-4 sm:pl-9 bg-[#F7F8F7] flex flex-col justify-between gap-2.5">
                <div>
                  <h3 className="text-sm font-bold text-[#161B18]">{opp.dimension}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="px-1.5 py-0.5 bg-white border border-zinc-300 rounded-xs text-[#161B18]">
                      評価: {opp.rating}
                    </span>
                    <span className="text-zinc-600">確信度: {opp.confidence}</span>
                  </div>
                </div>
                <div>
                  <EpistemicBadge
                    tag={opp.epistemic}
                    onChange={(next) => updateOpportunity(idx, { epistemic: next })}
                  />
                </div>
              </div>

              <div className="lg:col-span-3 p-4 space-y-1">
                <div className="text-[11px] font-semibold text-zinc-500">評価理由</div>
                <EditableText
                  value={opp.rationale}
                  label={`${opp.dimension} の評価理由を編集`}
                  textClassName="text-xs text-zinc-800 leading-relaxed"
                  onSave={(next) => updateOpportunity(idx, { rationale: next })}
                />
              </div>

              <div className="lg:col-span-3 p-4 space-y-1">
                <div className="text-[11px] font-semibold text-zinc-500">根拠となる情報</div>
                <EditableText
                  value={opp.evidence}
                  label={`${opp.dimension} の根拠情報を編集`}
                  textClassName="text-xs text-zinc-700 leading-relaxed"
                  onSave={(next) => updateOpportunity(idx, { evidence: next })}
                />
              </div>

              <div className="lg:col-span-3 p-4 sm:pr-9 space-y-1 bg-[#FAF8F2]">
                <div className="text-[11px] font-semibold text-[#6B4F1D]">
                  不足している情報（要確認）
                </div>
                <EditableText
                  value={opp.missingInfo}
                  label={`${opp.dimension} の不足情報を編集`}
                  textClassName="text-xs text-zinc-700 leading-relaxed"
                  onSave={(next) => updateOpportunity(idx, { missingInfo: next })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* C. Key Risks — Unified 2-Column Editorial Matrix */}
      <section id="db-risks" className="scroll-mt-20">
        <div className="px-6 py-5 sm:px-9 bg-[#FAFBFA] border-b border-zinc-200">
          <span className="text-[11px] font-mono font-semibold text-[#166534]">C. KEY RISKS</span>
          <h2 className="text-base font-bold text-[#161B18] mt-0.5">事業化における6大リスク</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-x divide-zinc-200">
          {brief.keyRisks.map((riskItem, idx) => (
            <div key={riskItem.category} className="px-6 py-5 sm:px-8 space-y-3">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#161B18]">{riskItem.category}</h3>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.5 rounded-xs border ${
                      riskItem.severity === '高'
                        ? 'text-red-900 bg-[#FDF2F2] border-[#DF9E9E]'
                        : riskItem.severity === '中'
                          ? 'text-[#6B4F1D] bg-[#FAF6EC] border-[#DFCFA9]'
                          : 'text-zinc-700 bg-zinc-100 border-zinc-300'
                    }`}
                  >
                    影響度: {riskItem.severity}
                  </span>
                </div>
                <EpistemicBadge
                  tag={riskItem.epistemic}
                  onChange={(next) => updateRisk(idx, { epistemic: next })}
                />
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="font-semibold text-zinc-500 mb-0.5">想定リスク</div>
                  <EditableText
                    value={riskItem.risk}
                    label={`${riskItem.category} のリスクを編集`}
                    textClassName="text-xs text-zinc-800 leading-relaxed"
                    onSave={(next) => updateRisk(idx, { risk: next })}
                  />
                </div>
                <div>
                  <div className="font-semibold text-zinc-500 mb-0.5">緩和・検証方針</div>
                  <EditableText
                    value={riskItem.mitigation}
                    label={`${riskItem.category} の緩和策を編集`}
                    textClassName="text-xs text-zinc-700 leading-relaxed"
                    onSave={(next) => updateRisk(idx, { mitigation: next })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* D. Critical Assumptions */}
      <section id="db-assumptions" className="scroll-mt-20">
        <div className="px-6 py-5 sm:px-9 bg-[#FAFBFA] border-b border-zinc-200">
          <span className="text-[11px] font-mono font-semibold text-[#166534]">
            D. CRITICAL ASSUMPTIONS
          </span>
          <h2 className="text-base font-bold text-[#161B18] mt-0.5">
            事業成立に必要な重要仮説と検証優先順位
          </h2>
        </div>

        <div className="divide-y divide-zinc-200">
          {brief.criticalAssumptions.map((item, idx) => (
            <div key={idx} className="px-6 py-5 sm:px-9 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={item.priority} />
                  <span className="text-xs font-mono text-zinc-400 tabular-nums">
                    ASSUMPTION #{idx + 1}
                  </span>
                </div>
                <EpistemicBadge
                  tag={item.epistemic}
                  onChange={(next) => updateAssumption(idx, { epistemic: next })}
                />
              </div>

              <EditableText
                value={item.assumption}
                label={`重要仮説 ${idx + 1} を編集`}
                textClassName="text-sm font-semibold text-[#161B18] leading-relaxed"
                onSave={(next) => updateAssumption(idx, { assumption: next })}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-zinc-100 text-xs">
                <div>
                  <div className="font-semibold text-zinc-500 mb-1">なぜ重要か</div>
                  <EditableText
                    value={item.whyImportant}
                    label="重要性を編集"
                    textClassName="text-xs text-zinc-700 leading-relaxed"
                    onSave={(next) => updateAssumption(idx, { whyImportant: next })}
                  />
                </div>
                <div>
                  <div className="font-semibold text-zinc-500 mb-1">現時点の根拠</div>
                  <EditableText
                    value={item.currentEvidence}
                    label="現時点の根拠を編集"
                    textClassName="text-xs text-zinc-700 leading-relaxed"
                    onSave={(next) => updateAssumption(idx, { currentEvidence: next })}
                  />
                </div>
                <div>
                  <div className="font-semibold text-[#14532D] mb-1">検証方法</div>
                  <EditableText
                    value={item.validationMethod}
                    label="検証方法を編集"
                    textClassName="text-xs text-zinc-700 leading-relaxed"
                    onSave={(next) => updateAssumption(idx, { validationMethod: next })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* E. Next Actions — Unified 3-Column Action Strip */}
      <section id="db-actions" className="scroll-mt-20">
        <div className="px-6 py-5 sm:px-9 bg-[#FAFBFA] border-b border-zinc-200">
          <span className="text-[11px] font-mono font-semibold text-[#166534]">E. NEXT ACTIONS</span>
          <h2 className="text-base font-bold text-[#161B18] mt-0.5">
            次に実施すべき3つの具体的アクション
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
          {brief.nextActions.map((act, idx) => (
            <div key={idx} className="px-6 py-6 sm:px-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-[#166534] tabular-nums">
                  ACTION 0{idx + 1}
                </div>
                <EditableText
                  value={act.action}
                  multiline={false}
                  label={`アクション ${idx + 1} を編集`}
                  textClassName="text-sm font-bold text-[#161B18]"
                  onSave={(next) => updateNextAction(idx, { action: next })}
                />
                <div className="space-y-2.5 pt-2 border-t border-zinc-100 text-xs">
                  <div>
                    <div className="font-semibold text-zinc-500 mb-0.5">目的</div>
                    <EditableText
                      value={act.purpose}
                      label="目的を編集"
                      textClassName="text-xs text-zinc-700 leading-relaxed"
                      onSave={(next) => updateNextAction(idx, { purpose: next })}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-500 mb-0.5">具体的な進め方</div>
                    <EditableText
                      value={act.executionSteps}
                      label="進め方を編集"
                      textClassName="text-xs text-zinc-700 leading-relaxed"
                      onSave={(next) => updateNextAction(idx, { executionSteps: next })}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-500 mb-0.5">必要な成果物</div>
                    <EditableText
                      value={act.requiredDeliverable}
                      multiline={false}
                      label="必要な成果物を編集"
                      textClassName="text-xs text-zinc-700"
                      onSave={(next) => updateNextAction(idx, { requiredDeliverable: next })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 bg-gradient-to-b from-[#F5F9F6] to-white -mx-6 -mb-6 px-6 py-4 sm:-mx-7 sm:px-7 text-xs">
                <div className="font-semibold text-[#14532D] mb-0.5">成功条件</div>
                <EditableText
                  value={act.successCriteria}
                  label="成功条件を編集"
                  textClassName="text-xs text-[#161B18] leading-relaxed"
                  onSave={(next) => updateNextAction(idx, { successCriteria: next })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
