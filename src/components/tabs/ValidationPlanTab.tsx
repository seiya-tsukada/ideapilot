import React from 'react';
import type { ValidationMethod, ValidationPlan } from '../../types/decision.ts';
import { EditableText } from '../EditableText.tsx';

interface ValidationPlanTabProps {
  plan: ValidationPlan;
  onUpdate: (next: ValidationPlan) => void;
}

const VALIDATION_METHODS: ValidationMethod[] = [
  'ユーザーインタビュー',
  '画面プロトタイプテスト',
  'ランディングページテスト',
  'Wizard of Oz型の疑似サービス',
  '実際の業務でのPoC',
  '実サービスMVP',
];

export const ValidationPlanTab: React.FC<ValidationPlanTabProps> = ({ plan, onUpdate }) => {
  return (
    <div className="divide-y divide-zinc-200">
      {/* Validation Principle Notice Strip */}
      <div className="px-6 py-3.5 sm:px-9 bg-gradient-to-r from-[#FAF6EC] to-[#FDFBF5] text-xs text-[#614512]">
        検証設計の原則：プロトタイプへの好意的なコメント（「便利そうですね」）だけで事業性が証明されたと判断せず、実際の行動・時間投資・支払意思を測る基準を設定しています。
      </div>

      {/* Method Selection & Hypotheses Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200">
        <section className="px-6 py-6 sm:px-8 space-y-3">
          <h3 className="text-sm font-bold text-[#161B18] pb-2 border-b border-zinc-100">
            検証したい中核仮説
          </h3>
          <ul className="space-y-2.5">
            {plan.hypothesesToValidate.map((h, idx) => (
              <li key={idx} className="text-xs text-zinc-700 flex items-start gap-2">
                <span className="font-mono font-semibold text-[#166534] mt-0.5 tabular-nums">
                  H{idx + 1}.
                </span>
                <div className="flex-1">
                  <EditableText
                    value={h}
                    label={`検証仮説 ${idx + 1} を編集`}
                    textClassName="text-xs text-zinc-800 leading-relaxed"
                    onSave={(next) =>
                      onUpdate({
                        ...plan,
                        hypothesesToValidate: plan.hypothesesToValidate.map((x, i) =>
                          i === idx ? next : x,
                        ),
                      })
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="pt-2 border-t border-zinc-100">
            <div className="text-xs font-semibold text-zinc-500 mb-1">検証対象ユーザー</div>
            <EditableText
              value={plan.targetValidationUsers}
              label="検証対象ユーザーを編集"
              textClassName="text-xs text-zinc-800 leading-relaxed"
              onSave={(next) => onUpdate({ ...plan, targetValidationUsers: next })}
            />
          </div>
        </section>

        <section className="px-6 py-6 sm:px-8 space-y-3">
          <h3 className="text-sm font-bold text-[#161B18] pb-2 border-b border-zinc-100">
            推奨検証方法と選定理由
          </h3>
          <div>
            <label
              htmlFor="validation-method-select"
              className="block text-xs font-semibold text-zinc-500 mb-1.5"
            >
              検証手法（6つの手法から選択）
            </label>
            <select
              id="validation-method-select"
              value={plan.recommendedMethod}
              onChange={(e) =>
                onUpdate({ ...plan, recommendedMethod: e.target.value as ValidationMethod })
              }
              className="w-full px-3 py-2 text-sm font-semibold text-[#14532D] bg-gradient-to-r from-[#EAF4EE] to-[#F5FAF7] border border-[#9ECBAE] rounded-sm focus:outline-none focus:border-[#1B6B47]"
            >
              {VALIDATION_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-500 mb-1">手法の選定理由</div>
            <EditableText
              value={plan.methodRationale}
              label="選定理由を編集"
              textClassName="text-xs text-zinc-700 leading-relaxed"
              onSave={(next) => onUpdate({ ...plan, methodRationale: next })}
            />
          </div>
        </section>
      </div>

      {/* Scenario & KPIs */}
      <section className="px-6 py-6 sm:px-9 space-y-4">
        <h3 className="text-sm font-bold text-[#161B18] pb-2 border-b border-zinc-100">
          検証シナリオとKPI
        </h3>
        <div>
          <div className="text-xs font-semibold text-zinc-500 mb-1">具体的な検証シナリオ</div>
          <EditableText
            value={plan.validationScenario}
            label="検証シナリオを編集"
            onSave={(next) => onUpdate({ ...plan, validationScenario: next })}
          />
        </div>

        <div className="pt-2 border-t border-zinc-100">
          <div className="text-xs font-semibold text-zinc-700 mb-2.5">計測KPI</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-2 pr-4 font-semibold">指標（KPI）</th>
                  <th className="py-2 px-4 font-semibold">目標基準</th>
                  <th className="py-2 pl-4 font-semibold">計測方法</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {plan.kpis.map((kpi, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 pr-4 font-semibold text-[#161B18]">{kpi.metric}</td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-[#166534]">
                      {kpi.target}
                    </td>
                    <td className="py-2.5 pl-4 text-zinc-600">{kpi.measurementNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Success / Failure Criteria Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-x divide-zinc-200">
        <section className="px-6 py-5 sm:px-8 space-y-2 bg-gradient-to-b from-[#F5F9F6] to-white">
          <h3 className="text-sm font-bold text-[#14532D]">成功基準（GOの判定ライン）</h3>
          <EditableText
            value={plan.successCriteria}
            label="成功基準を編集"
            textClassName="text-xs text-zinc-700 leading-relaxed"
            onSave={(next) => onUpdate({ ...plan, successCriteria: next })}
          />
        </section>

        <section className="px-6 py-5 sm:px-8 space-y-2 bg-gradient-to-b from-[#FDF6F6] to-white">
          <h3 className="text-sm font-bold text-red-800">失敗基準（ピボット/撤退ライン）</h3>
          <EditableText
            value={plan.failureCriteria}
            label="失敗基準を編集"
            textClassName="text-xs text-zinc-700 leading-relaxed"
            onSave={(next) => onUpdate({ ...plan, failureCriteria: next })}
          />
        </section>

        <section className="px-6 py-5 sm:px-8 space-y-2">
          <h3 className="text-sm font-bold text-[#161B18]">必要な実装範囲</h3>
          <EditableText
            value={plan.requiredImplementationScope}
            label="必要な実装範囲を編集"
            textClassName="text-xs text-zinc-700 leading-relaxed"
            onSave={(next) => onUpdate({ ...plan, requiredImplementationScope: next })}
          />
        </section>

        <section className="px-6 py-5 sm:px-8 space-y-2">
          <h3 className="text-sm font-bold text-[#161B18]">検証後の意思決定分岐</h3>
          <EditableText
            value={plan.postValidationDecision}
            label="検証後の意思決定を編集"
            textClassName="text-xs text-zinc-700 leading-relaxed"
            onSave={(next) => onUpdate({ ...plan, postValidationDecision: next })}
          />
        </section>
      </div>

      {/* Interview Guide */}
      <section>
        <div className="px-6 py-4 sm:px-9 bg-[#FAFBFA] border-b border-zinc-200">
          <span className="text-[11px] font-mono font-semibold text-[#166534]">INTERVIEW GUIDE</span>
          <h3 className="text-base font-bold text-[#161B18] mt-0.5">
            顧客検証インタビューガイド
          </h3>
        </div>

        <div className="px-6 py-6 sm:px-9 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pb-4 border-b border-zinc-200">
            <div>
              <div className="font-semibold text-zinc-500 mb-1">インタビューの目的</div>
              <EditableText
                value={plan.interviewGuide.objective}
                label="インタビュー目的を編集"
                textClassName="text-xs text-zinc-700 leading-relaxed"
                onSave={(next) =>
                  onUpdate({
                    ...plan,
                    interviewGuide: { ...plan.interviewGuide, objective: next },
                  })
                }
              />
            </div>
            <div>
              <div className="font-semibold text-zinc-500 mb-1">対象者スクリーニング条件</div>
              <EditableText
                value={plan.interviewGuide.screeningCriteria}
                label="スクリーニング条件を編集"
                textClassName="text-xs text-zinc-700 leading-relaxed"
                onSave={(next) =>
                  onUpdate({
                    ...plan,
                    interviewGuide: { ...plan.interviewGuide, screeningCriteria: next },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-zinc-700">質問項目リスト</div>
            <div className="divide-y divide-zinc-200 border-y border-zinc-200">
              {plan.interviewGuide.questions.map((q, idx) => (
                <div key={idx} className="py-3.5 space-y-1.5">
                  <div className="text-xs font-semibold text-[#14532D] tabular-nums">
                    Q{idx + 1}. {q.topic}
                  </div>
                  <EditableText
                    value={q.question}
                    label={`質問 ${idx + 1} を編集`}
                    textClassName="text-xs font-medium text-[#161B18] leading-relaxed"
                    onSave={(next) =>
                      onUpdate({
                        ...plan,
                        interviewGuide: {
                          ...plan.interviewGuide,
                          questions: plan.interviewGuide.questions.map((item, i) =>
                            i === idx ? { ...item, question: next } : item,
                          ),
                        },
                      })
                    }
                  />
                  <div className="text-[11px] text-zinc-500">確認したい意図: {q.intent}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 py-3 bg-[#F7F8F7] border border-zinc-200 rounded-sm text-xs text-zinc-700">
            <span className="font-semibold text-[#161B18]">ヒアリング時の注意点: </span>
            {plan.interviewGuide.cautionNotes}
          </div>
        </div>
      </section>
    </div>
  );
};
