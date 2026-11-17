import { useId, type ReactNode } from 'react';
import { VALIDATION_METHODS, type ValidationMethod, type ValidationPlan } from '#shared/schema.ts';
import { EditableText } from '../../../components/ui/EditableText.tsx';
import { Field, SectionHeader } from '../../../components/ui/Section.tsx';
import { cn } from '../../../lib/cn.ts';
import { replaceAt, updateAt } from '../../../lib/immutable.ts';
import type { TabProps } from './types.ts';

type CriteriaKey = 'successCriteria' | 'failureCriteria' | 'requiredImplementationScope' | 'postValidationDecision';
type InterviewGuide = ValidationPlan['interviewGuide'];

const CRITERIA: {
  key: CriteriaKey;
  title: string;
  label: string;
  tone?: string;
  titleTone?: string;
}[] = [
  {
    key: 'successCriteria',
    title: '成功基準（GOの判定ライン）',
    label: '成功基準を編集',
    tone: 'bg-surface-muted',
    titleTone: 'text-brand-800',
  },
  {
    key: 'failureCriteria',
    title: '失敗基準（ピボット/撤退ライン）',
    label: '失敗基準を編集',
    tone: 'bg-red-50',
    titleTone: 'text-red-800',
  },
  {
    key: 'requiredImplementationScope',
    title: '必要な実装範囲',
    label: '必要な実装範囲を編集',
  },
  {
    key: 'postValidationDecision',
    title: '検証後の意思決定分岐',
    label: '検証後の意思決定を編集',
  },
];

const GUIDE_FIELDS: {
  key: 'objective' | 'screeningCriteria';
  title: string;
  label: string;
}[] = [
  {
    key: 'objective',
    title: 'インタビューの目的',
    label: 'インタビュー目的を編集',
  },
  {
    key: 'screeningCriteria',
    title: '対象者スクリーニング条件',
    label: 'スクリーニング条件を編集',
  },
];

const SMALL_TEXT = 'text-xs leading-relaxed text-zinc-700';
const SMALL_STRONG_TEXT = 'text-xs leading-relaxed text-zinc-800';

export function ValidationPlanTab({ report, onChange }: TabProps<'validationPlan'>) {
  const plan = report.validationPlan;
  const guide = plan.interviewGuide;
  const methodSelectId = useId();

  const patch = (next: Partial<ValidationPlan>) => onChange({ ...plan, ...next });
  const patchGuide = (next: Partial<InterviewGuide>) => patch({ interviewGuide: { ...guide, ...next } });

  return (
    <div className="divide-y divide-zinc-200">
      <p className="bg-hypothesis-50 px-6 py-3.5 text-xs text-hypothesis-800 sm:px-9">
        検証設計の原則：プロトタイプへの好意的なコメント（「便利そうですね」）だけで事業性が証明されたと判断せず、実際の行動・時間投資・支払意思を測る基準を設定しています。
      </p>

      <div className="grid grid-cols-1 divide-y divide-zinc-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <Panel title="検証したい中核仮説">
          <ol className="space-y-2.5">
            {plan.hypothesesToValidate.map((hypothesis, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                <span className="mt-0.5 font-mono font-semibold text-brand-700 tabular-nums">H{i + 1}.</span>
                <EditableText
                  value={hypothesis}
                  label={`検証仮説 ${i + 1} を編集`}
                  className="flex-1"
                  textClassName={SMALL_STRONG_TEXT}
                  onSave={(next) =>
                    patch({
                      hypothesesToValidate: replaceAt(plan.hypothesesToValidate, i, next),
                    })
                  }
                />
              </li>
            ))}
          </ol>
          <div className="border-t border-zinc-100 pt-2">
            <Field label="検証対象ユーザー">
              <EditableText
                value={plan.targetValidationUsers}
                label="検証対象ユーザーを編集"
                textClassName={SMALL_STRONG_TEXT}
                onSave={(targetValidationUsers) => patch({ targetValidationUsers })}
              />
            </Field>
          </div>
        </Panel>

        <Panel title="推奨検証方法と選定理由">
          <div>
            <label htmlFor={methodSelectId} className="mb-1.5 block text-xs font-semibold text-zinc-500">
              検証手法（6つの手法から選択）
            </label>
            <select
              id={methodSelectId}
              value={plan.recommendedMethod}
              onChange={(e) => patch({ recommendedMethod: e.target.value as ValidationMethod })}
              className="w-full rounded-sm border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800 focus:border-brand-600 focus:outline-none"
            >
              {VALIDATION_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          <Field label="手法の選定理由">
            <EditableText
              value={plan.methodRationale}
              label="選定理由を編集"
              textClassName={SMALL_TEXT}
              onSave={(methodRationale) => patch({ methodRationale })}
            />
          </Field>
        </Panel>
      </div>

      <Panel title="検証シナリオとKPI" className="space-y-4 sm:px-9">
        <Field label="具体的な検証シナリオ">
          <EditableText
            value={plan.validationScenario}
            label="検証シナリオを編集"
            onSave={(validationScenario) => patch({ validationScenario })}
          />
        </Field>
        <div className="border-t border-zinc-100 pt-2">
          <div className="mb-2.5 text-xs font-semibold text-zinc-700">計測KPI</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-2 pr-4 font-semibold">指標（KPI）</th>
                  <th className="px-4 py-2 font-semibold">目標基準</th>
                  <th className="py-2 pl-4 font-semibold">計測方法</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {plan.kpis.map((kpi, i) => (
                  <tr key={i}>
                    <td className="py-2.5 pr-4 font-semibold text-ink">{kpi.metric}</td>
                    <td className="px-4 py-2.5 font-mono text-brand-700 tabular-nums">{kpi.target}</td>
                    <td className="py-2.5 pl-4 text-zinc-600">{kpi.measurementNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 divide-y divide-zinc-200 md:grid-cols-2 md:divide-x">
        {CRITERIA.map(({ key, title, label, tone, titleTone = 'text-ink' }) => (
          <section key={key} className={cn('space-y-2 px-6 py-5 sm:px-8', tone)}>
            <h3 className={cn('text-sm font-bold', titleTone)}>{title}</h3>
            <EditableText
              value={plan[key]}
              label={label}
              textClassName={SMALL_TEXT}
              onSave={(next) => patch({ [key]: next })}
            />
          </section>
        ))}
      </div>

      <section>
        <SectionHeader eyebrow="INTERVIEW GUIDE" title="顧客検証インタビューガイド" />
        <div className="space-y-5 px-6 py-6 sm:px-9">
          <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 pb-4 md:grid-cols-2">
            {GUIDE_FIELDS.map(({ key, title, label }) => (
              <Field key={key} label={title}>
                <EditableText
                  value={guide[key]}
                  label={label}
                  textClassName={SMALL_TEXT}
                  onSave={(next) => patchGuide({ [key]: next })}
                />
              </Field>
            ))}
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-zinc-700">質問項目リスト</div>
            <ol className="divide-y divide-zinc-200 border-y border-zinc-200">
              {guide.questions.map((q, i) => (
                <li key={i} className="space-y-1.5 py-3.5">
                  <div className="text-xs font-semibold text-brand-800 tabular-nums">
                    Q{i + 1}. {q.topic}
                  </div>
                  <EditableText
                    value={q.question}
                    label={`質問 ${i + 1} を編集`}
                    textClassName="text-xs leading-relaxed font-medium text-ink"
                    onSave={(question) =>
                      patchGuide({
                        questions: updateAt(guide.questions, i, { question }),
                      })
                    }
                  />
                  <div className="text-[11px] text-zinc-500">確認したい意図: {q.intent}</div>
                </li>
              ))}
            </ol>
          </div>

          <p className="rounded-sm border border-zinc-200 bg-surface-muted px-4 py-3 text-xs text-zinc-700">
            <span className="font-semibold text-ink">ヒアリング時の注意点: </span>
            {guide.cautionNotes}
          </p>
        </div>
      </section>
    </div>
  );
}

function Panel({
  title,
  className = 'space-y-3 sm:px-8',
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn('px-6 py-6', className)}>
      <h3 className="border-b border-zinc-100 pb-2 text-sm font-bold text-ink">{title}</h3>
      {children}
    </section>
  );
}
