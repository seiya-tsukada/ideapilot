import { useState, type ReactNode } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import {
  VERDICTS,
  type CriticalAssumption,
  type DecisionBrief,
  type KeyRiskItem,
  type NextActionItem,
  type OpportunityDimension,
} from '#shared/schema.ts';
import { EpistemicBadge, PriorityBadge, VerdictBadge } from '../../../components/ui/Badges.tsx';
import { EditableText } from '../../../components/ui/EditableText.tsx';
import { Field, SectionHeader } from '../../../components/ui/Section.tsx';
import { cn } from '../../../lib/cn.ts';
import { pad2 } from '../../../lib/format.ts';
import { replaceAt, updateAt } from '../../../lib/immutable.ts';
import type { TabProps } from './types.ts';

type Decision = DecisionBrief['executiveDecision'];

const SECTION_LINKS = [
  { id: 'db-decision', label: 'A. 暫定判断' },
  { id: 'db-opportunity', label: 'B. 5軸評価' },
  { id: 'db-risks', label: 'C. 6大リスク' },
  { id: 'db-assumptions', label: 'D. 重要仮説' },
  { id: 'db-actions', label: 'E. 次アクション' },
] as const;

const SEVERITY_TONE: Record<KeyRiskItem['severity'], string> = {
  高: 'text-red-900 bg-red-50 border-red-300',
  中: 'text-hypothesis-800 bg-hypothesis-50 border-hypothesis-200',
  低: 'text-zinc-700 bg-zinc-100 border-zinc-300',
};

const OPPORTUNITY_FIELDS: { key: 'rationale' | 'evidence'; label: string; edit: string }[] = [
  { key: 'rationale', label: '評価理由', edit: '評価理由' },
  { key: 'evidence', label: '根拠となる情報', edit: '根拠情報' },
];

const RISK_FIELDS: { key: 'risk' | 'mitigation'; label: string; edit: string }[] = [
  { key: 'risk', label: '想定リスク', edit: 'リスク' },
  { key: 'mitigation', label: '緩和・検証方針', edit: '緩和策' },
];

const ASSUMPTION_FIELDS: {
  key: Exclude<keyof CriticalAssumption, 'assumption' | 'priority' | 'epistemic'>;
  label: string;
  edit: string;
}[] = [
  { key: 'whyImportant', label: 'なぜ重要か', edit: '重要性' },
  { key: 'currentEvidence', label: '現時点の根拠', edit: '現時点の根拠' },
  { key: 'validationMethod', label: '検証方法', edit: '検証方法' },
];

const ACTION_FIELDS: {
  key: Exclude<keyof NextActionItem, 'action' | 'successCriteria'>;
  label: string;
  edit: string;
  multiline?: boolean;
}[] = [
  { key: 'purpose', label: '目的', edit: '目的' },
  { key: 'executionSteps', label: '具体的な進め方', edit: '進め方' },
  { key: 'requiredDeliverable', label: '必要な成果物', edit: '必要な成果物', multiline: false },
];

const TEXT_XS = 'text-xs leading-relaxed text-zinc-700';

const scrollToSection = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export function DecisionBriefTab({ report, onChange }: TabProps<'decisionBrief'>) {
  const brief = report.decisionBrief;
  const decision = brief.executiveDecision;

  const patchDecision = (patch: Partial<Decision>) =>
    onChange({ ...brief, executiveDecision: { ...decision, ...patch } });
  const patchOpportunity = (i: number, patch: Partial<OpportunityDimension>) =>
    onChange({ ...brief, opportunityAssessment: updateAt(brief.opportunityAssessment, i, patch) });
  const patchRisk = (i: number, patch: Partial<KeyRiskItem>) =>
    onChange({ ...brief, keyRisks: updateAt(brief.keyRisks, i, patch) });
  const patchAssumption = (i: number, patch: Partial<CriticalAssumption>) =>
    onChange({ ...brief, criticalAssumptions: updateAt(brief.criticalAssumptions, i, patch) });
  const patchAction = (i: number, patch: Partial<NextActionItem>) =>
    onChange({ ...brief, nextActions: updateAt(brief.nextActions, i, patch) });

  return (
    <div className="divide-y divide-zinc-200">
      <nav className="flex flex-wrap items-center gap-x-5 gap-y-1.5 bg-surface-subtle px-6 py-2.5 text-xs sm:px-9">
        <span className="font-mono text-[11px] text-zinc-400">SECTIONS:</span>
        {SECTION_LINKS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollToSection(id)}
            className="whitespace-nowrap font-medium text-zinc-600 transition-colors hover:text-brand-700"
          >
            {label}
          </button>
        ))}
      </nav>

      <BriefSection
        id="db-decision"
        eyebrow="A. EXECUTIVE DECISION"
        title="暫定意思決定と判断理由"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <VerdictBadge verdict={decision.verdict} />
            <EpistemicBadge tag={decision.epistemic} onChange={(epistemic) => patchDecision({ epistemic })} />
          </div>
        }
      >
        <div className="grid grid-cols-1 divide-y divide-zinc-200 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          <div className="space-y-5 px-6 py-6 sm:px-9 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="font-medium text-zinc-500">判断区分の変更:</span>
              <div
                role="group"
                className="inline-flex items-center rounded-sm border border-zinc-200 bg-zinc-100 p-0.5"
              >
                {VERDICTS.map((verdict) => (
                  <button
                    key={verdict}
                    type="button"
                    aria-pressed={decision.verdict === verdict}
                    onClick={() => patchDecision({ verdict })}
                    className={cn(
                      'whitespace-nowrap rounded-xs px-2.5 py-1 font-mono text-[11px] font-medium transition-colors',
                      decision.verdict === verdict ? 'bg-night-800 text-white' : 'text-zinc-600 hover:text-ink',
                    )}
                  >
                    {verdict}
                  </button>
                ))}
              </div>
            </div>

            <Field label="判断理由（AIによる意思決定材料）">
              <EditableText
                value={decision.rationale}
                label="判断理由を編集"
                textClassName="text-sm leading-relaxed text-ink"
                onSave={(rationale) => patchDecision({ rationale })}
              />
            </Field>
          </div>

          <div className="divide-y divide-zinc-200 lg:col-span-5">
            <div className="space-y-2.5 p-6">
              <h3 className="text-xs font-semibold text-zinc-700">主な不確実性</h3>
              <ul className="space-y-2">
                {decision.keyUncertainties.map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 font-mono text-xs text-zinc-400">•</span>
                    <EditableText
                      className="flex-1"
                      value={text}
                      multiline={false}
                      label={`不確実性 ${i + 1} を編集`}
                      textClassName={TEXT_XS}
                      onSave={(next) =>
                        patchDecision({ keyUncertainties: replaceAt(decision.keyUncertainties, i, next) })
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>

            <GateChecklist
              reportId={report.id}
              conditions={decision.conditionsToProceed}
              onChange={(conditionsToProceed) => patchDecision({ conditionsToProceed })}
            />
          </div>
        </div>
      </BriefSection>

      <BriefSection
        id="db-opportunity"
        eyebrow="B. OPPORTUNITY ASSESSMENT"
        title="事業機会と不確実性の5軸評価"
        description="根拠のない数値スコアを排除し、根拠・不足情報・確信度を併記"
      >
        <div className="divide-y divide-zinc-200">
          {brief.opportunityAssessment.map((opp, i) => (
            <div
              key={opp.dimension}
              className="grid grid-cols-1 divide-y divide-zinc-200 lg:grid-cols-4 lg:divide-x lg:divide-y-0"
            >
              <div className="flex flex-col justify-between gap-2.5 bg-surface-muted px-6 py-4 sm:pl-9">
                <div>
                  <h3 className="text-sm font-bold text-ink">{opp.dimension}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="rounded-xs border border-zinc-300 bg-white px-1.5 py-0.5 text-ink">
                      評価: {opp.rating}
                    </span>
                    <span className="text-zinc-600">確信度: {opp.confidence}</span>
                  </div>
                </div>
                <div>
                  <EpistemicBadge tag={opp.epistemic} onChange={(epistemic) => patchOpportunity(i, { epistemic })} />
                </div>
              </div>

              {OPPORTUNITY_FIELDS.map(({ key, label, edit }) => (
                <div key={key} className="p-4">
                  <TextField
                    label={label}
                    editLabel={`${opp.dimension} の${edit}を編集`}
                    value={opp[key]}
                    onSave={(value) => patchOpportunity(i, { [key]: value })}
                  />
                </div>
              ))}

              <div className="bg-hypothesis-50 p-4 sm:pr-9">
                <TextField
                  label="不足している情報（要確認）"
                  labelClassName="text-hypothesis-800"
                  editLabel={`${opp.dimension} の不足情報を編集`}
                  value={opp.missingInfo}
                  onSave={(missingInfo) => patchOpportunity(i, { missingInfo })}
                />
              </div>
            </div>
          ))}
        </div>
      </BriefSection>

      <BriefSection id="db-risks" eyebrow="C. KEY RISKS" title="事業化における6大リスク">
        <div className="grid grid-cols-1 divide-y divide-zinc-200 md:grid-cols-2 md:divide-x">
          {brief.keyRisks.map((risk, i) => (
            <div key={risk.category} className="space-y-3 px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-ink">{risk.category}</h3>
                  <span
                    className={cn(
                      'rounded-xs border px-1.5 py-0.5 font-mono text-[11px]',
                      SEVERITY_TONE[risk.severity],
                    )}
                  >
                    影響度: {risk.severity}
                  </span>
                </div>
                <EpistemicBadge tag={risk.epistemic} onChange={(epistemic) => patchRisk(i, { epistemic })} />
              </div>

              <div className="space-y-2.5">
                {RISK_FIELDS.map(({ key, label, edit }) => (
                  <TextField
                    key={key}
                    label={label}
                    editLabel={`${risk.category} の${edit}を編集`}
                    value={risk[key]}
                    onSave={(value) => patchRisk(i, { [key]: value })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </BriefSection>

      <BriefSection
        id="db-assumptions"
        eyebrow="D. CRITICAL ASSUMPTIONS"
        title="事業成立に必要な重要仮説と検証優先順位"
      >
        <div className="divide-y divide-zinc-200">
          {brief.criticalAssumptions.map((item, i) => (
            <div key={i} className="space-y-3 px-6 py-5 sm:px-9">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={item.priority} />
                  <span className="font-mono text-xs text-zinc-400 tabular-nums">ASSUMPTION #{i + 1}</span>
                </div>
                <EpistemicBadge tag={item.epistemic} onChange={(epistemic) => patchAssumption(i, { epistemic })} />
              </div>

              <EditableText
                value={item.assumption}
                label={`重要仮説 ${i + 1} を編集`}
                textClassName="text-sm font-semibold leading-relaxed text-ink"
                onSave={(assumption) => patchAssumption(i, { assumption })}
              />

              <div className="grid grid-cols-1 gap-4 border-t border-zinc-100 pt-2 md:grid-cols-3">
                {ASSUMPTION_FIELDS.map(({ key, label, edit }) => (
                  <TextField
                    key={key}
                    label={label}
                    labelClassName={key === 'validationMethod' ? 'text-brand-800' : undefined}
                    editLabel={`${edit}を編集`}
                    value={item[key]}
                    onSave={(value) => patchAssumption(i, { [key]: value })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </BriefSection>

      <BriefSection id="db-actions" eyebrow="E. NEXT ACTIONS" title="次に実施すべき3つの具体的アクション">
        <div className="grid grid-cols-1 divide-y divide-zinc-200 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {brief.nextActions.map((action, i) => (
            <div key={i} className="flex flex-col justify-between">
              <div className="space-y-3 px-6 py-6 sm:px-7">
                <div className="font-mono text-xs font-bold text-brand-700 tabular-nums">ACTION {pad2(i + 1)}</div>
                <EditableText
                  value={action.action}
                  multiline={false}
                  label={`アクション ${i + 1} を編集`}
                  textClassName="text-sm font-bold text-ink"
                  onSave={(next) => patchAction(i, { action: next })}
                />
                <div className="space-y-2.5 border-t border-zinc-100 pt-2">
                  {ACTION_FIELDS.map(({ key, label, edit, multiline }) => (
                    <TextField
                      key={key}
                      label={label}
                      editLabel={`${edit}を編集`}
                      multiline={multiline}
                      value={action[key]}
                      onSave={(value) => patchAction(i, { [key]: value })}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-200 bg-surface-muted px-6 py-4 sm:px-7">
                <TextField
                  label="成功条件"
                  labelClassName="text-brand-800"
                  textClassName="text-xs leading-relaxed text-ink"
                  value={action.successCriteria}
                  onSave={(successCriteria) => patchAction(i, { successCriteria })}
                />
              </div>
            </div>
          ))}
        </div>
      </BriefSection>
    </div>
  );
}

function BriefSection({
  id,
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onSave,
  editLabel = `${label}を編集`,
  multiline,
  labelClassName,
  textClassName = TEXT_XS,
}: {
  label: string;
  value: string;
  onSave: (next: string) => void;
  editLabel?: string;
  multiline?: boolean;
  labelClassName?: string;
  textClassName?: string;
}) {
  return (
    <Field label={label} labelClassName={labelClassName}>
      <EditableText
        value={value}
        label={editLabel}
        multiline={multiline}
        textClassName={textClassName}
        onSave={onSave}
      />
    </Field>
  );
}

/** Gate check state is a per-browser progress aid, so it lives in localStorage rather than in the report. */
function GateChecklist({
  reportId,
  conditions,
  onChange,
}: {
  reportId: string;
  conditions: string[];
  onChange: (next: string[]) => void;
}) {
  const [checked, toggle] = useGateChecks(reportId);
  const done = conditions.filter((_, i) => checked[i]).length;

  return (
    <div className="space-y-3 bg-surface-muted p-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold text-brand-800">次のステージへ進むための条件</h3>
        <span className="font-mono text-[11px] text-brand-700 tabular-nums">
          {done}/{conditions.length} 確認済
        </span>
      </div>
      <ul className="space-y-2.5">
        {conditions.map((condition, i) => {
          const isChecked = Boolean(checked[i]);
          const Icon = isChecked ? CheckSquare : Square;
          return (
            <li key={i} className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-label={`進行条件 ${i + 1} の達成を切り替え`}
                aria-pressed={isChecked}
                className="mt-0.5 shrink-0 text-brand-700 hover:opacity-80"
              >
                <Icon className={cn('size-4', !isChecked && 'text-zinc-400')} aria-hidden />
              </button>
              <EditableText
                className={cn('flex-1', isChecked && 'line-through opacity-65')}
                value={condition}
                multiline={false}
                label={`進行条件 ${i + 1} を編集`}
                textClassName="text-xs leading-relaxed text-zinc-800"
                onSave={(next) => onChange(replaceAt(conditions, i, next))}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type GateChecks = Record<number, boolean>;

const gateStorageKey = (reportId: string) => `ide_gate_checks_${reportId}`;

function loadGateChecks(reportId: string): GateChecks {
  try {
    return JSON.parse(localStorage.getItem(gateStorageKey(reportId)) ?? '{}') as GateChecks;
  } catch {
    return {};
  }
}

function useGateChecks(reportId: string) {
  const [state, setState] = useState(() => ({ reportId, checks: loadGateChecks(reportId) }));

  // Reload when switching to another report without remounting.
  if (state.reportId !== reportId) setState({ reportId, checks: loadGateChecks(reportId) });

  const toggle = (index: number) =>
    setState((prev) => {
      const checks = { ...prev.checks, [index]: !prev.checks[index] };
      try {
        localStorage.setItem(gateStorageKey(prev.reportId), JSON.stringify(checks));
      } catch {
        // Storage may be unavailable (private mode, quota); the toggle still works in memory.
      }
      return { ...prev, checks };
    });

  return [state.checks, toggle] as const;
}
