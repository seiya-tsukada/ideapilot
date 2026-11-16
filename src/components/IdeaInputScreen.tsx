import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Rocket,
  Sparkles,
} from 'lucide-react';
import type {
  ClarifyingAnswer,
  ClarifyingQuestion,
  IdeaInput,
  PurposeType,
} from '../types/decision.ts';
import { SAMPLE_IDEAS } from '../data/sampleReports.ts';
import { validateIdeaInput } from '../utils/validation.ts';

interface IdeaInputScreenProps {
  initialInput: IdeaInput;
  onStartAnalysis: (input: IdeaInput) => void;
  onViewSampleReport: () => void;
}

const PRINCIPLES = [
  {
    num: '01',
    title: 'FACTと仮説の厳密分離',
    desc: '未入力の市場規模や競合情報を捏造せず、UNKNOWN（要調査）として明示します。',
  },
  {
    num: '02',
    title: 'Decision Brief 最優先',
    desc: 'GO / CONDITIONAL GO / NO-GO の暫定判断と進行条件・次の3アクションを抽出します。',
  },
  {
    num: '03',
    title: 'Corporate / Startup最適化',
    desc: '社内稟議・シナジー重視か、GTM・投資家向け構成かを自動切替します。',
  },
  {
    num: '04',
    title: '最短3日MVPと検証計画',
    desc: 'Google AI Studio用プロンプトと失敗基準付き検証シナリオを同時出力します。',
  },
];

export const IdeaInputScreen: React.FC<IdeaInputScreenProps> = ({
  initialInput,
  onStartAnalysis,
  onViewSampleReport,
}) => {
  const [form, setForm] = useState<IdeaInput>(initialInput);
  const [showOptional, setShowOptional] = useState<boolean>(
    Boolean(
      initialInput.targetCustomer ||
        initialInput.problem ||
        initialInput.valueProposition ||
        initialInput.additionalContext ||
        initialInput.constraints?.budget ||
        initialInput.constraints?.timeline ||
        initialInput.constraints?.team ||
        initialInput.constraints?.other,
    ),
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCheckingClarify, setIsCheckingClarify] = useState(false);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[] | null>(
    null,
  );
  const [clarifyDrafts, setClarifyDrafts] = useState<Record<string, string>>({});

  const readiness = useMemo(() => {
    const hasIdea = form.idea.trim().length >= 5;
    const hasCustomer = Boolean(form.targetCustomer?.trim());
    const hasProblem = Boolean(form.problem?.trim());
    const hasValue = Boolean(form.valueProposition?.trim());
    const hasConstraints = Boolean(
      form.constraints?.budget?.trim() ||
        form.constraints?.timeline?.trim() ||
        form.constraints?.team?.trim() ||
        form.constraints?.other?.trim(),
    );
    const providedCount = [hasIdea, hasCustomer, hasProblem, hasValue, hasConstraints].filter(
      Boolean,
    ).length;
    return { hasIdea, hasCustomer, hasProblem, hasValue, hasConstraints, providedCount };
  }, [form]);

  const updateField = <K extends keyof IdeaInput>(key: K, value: IdeaInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const updateConstraint = (
    key: keyof NonNullable<IdeaInput['constraints']>,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        [key]: value,
      },
    }));
  };

  const handleLoadPreset = (presetInput: IdeaInput) => {
    setForm(presetInput);
    setShowOptional(true);
    setClarifyingQuestions(null);
    setErrorMsg(null);
  };

  const handlePrimarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateIdeaInput(form);
    if (!check.valid) {
      setErrorMsg(check.error ?? '入力内容を確認してください。');
      return;
    }

    setIsCheckingClarify(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          needsClarification: boolean;
          questions: ClarifyingQuestion[];
        };
        if (data.needsClarification && data.questions.length > 0) {
          setClarifyingQuestions(data.questions.slice(0, 3));
          setIsCheckingClarify(false);
          return;
        }
      }
      onStartAnalysis(form);
    } catch {
      onStartAnalysis(form);
    } finally {
      setIsCheckingClarify(false);
    }
  };

  const handleProceedWithClarifications = () => {
    const answers: ClarifyingAnswer[] = (clarifyingQuestions ?? [])
      .map((q) => ({
        id: q.id,
        question: q.question,
        answer: (clarifyDrafts[q.id] ?? '').trim(),
      }))
      .filter((a) => a.answer.length > 0);

    onStartAnalysis({
      ...form,
      clarifyingAnswers: answers.length > 0 ? answers : undefined,
    });
  };

  const handleSkipClarifications = () => {
    onStartAnalysis(form);
  };

  return (
    <main className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-7 space-y-6">
      {/* Single Continuous Briefing Folio Sheet */}
      <article className="bg-white border border-zinc-300/90 rounded-sm overflow-hidden">
        {/* Top Editorial Masthead (Deep Pine Charcoal Band) */}
        <header className="bg-gradient-to-br from-[#1B2822] via-[#16201B] to-[#111815] text-white px-6 py-5 sm:px-9 sm:py-6 border-b border-[#29362F]">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2 max-w-[60ch]">
              <div className="text-[11px] font-mono text-emerald-300 tracking-wider">
                DECISION BRIEFING SHEET · NEW VENTURE
              </div>
              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-white leading-snug">
                アイデアを、意思決定できる事業構想へ。
              </h1>
              <p className="text-sm text-zinc-300 leading-relaxed">
                1〜2文の構想からでも、経営陣・投資家へ説明し「進めるか／何を検証するか」を判断できる6種類の構造化資料を一括生成します。
              </p>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={onViewSampleReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-100 bg-[#22322A] hover:bg-[#2B3E34] border border-[#384D42] rounded-sm transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
                <span>生成済みサンプルを閲覧 →</span>
              </button>
            </div>
          </div>

          {/* Inline Sample Idea Presets Strip */}
          <div className="mt-4 pt-3.5 border-t border-[#2A3931] flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-mono text-zinc-400 mr-1">SAMPLE PRESETS:</span>
            {SAMPLE_IDEAS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleLoadPreset(preset.input)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-[#1E2D26] hover:bg-[#273A31] border border-[#34483E] text-zinc-100 rounded-sm transition-colors"
              >
                <span>
                  {preset.purpose === 'Corporate'
                    ? 'Corporate例：設備保全ナレッジAI'
                    : 'Startup例：中小建設業向け請求SaaS'}
                </span>
                <span className="text-[11px] font-mono text-emerald-300">読込</span>
              </button>
            ))}
          </div>
        </header>

        {/* Live Epistemic Input Readiness Bar (UX Guide) */}
        <div className="px-6 sm:px-9 py-3 bg-[#F7F8F7] border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-600">
            <span className="font-mono text-[11px] font-semibold text-[#166534]">
              FACT COVERAGE
            </span>
            <span className="tabular-nums">
              確定入力 <strong className="text-[#161B18]">{readiness.providedCount}/5</strong> 項目
            </span>
            <span className="hidden sm:inline text-zinc-400">|</span>
            <span className="text-zinc-500">
              未入力項目はAIが捏造せず「仮説 / 要調査（UNKNOWN）」として整理します
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {[
              { label: '構想', ok: readiness.hasIdea },
              { label: '顧客', ok: readiness.hasCustomer },
              { label: '課題', ok: readiness.hasProblem },
              { label: '価値', ok: readiness.hasValue },
              { label: '制約', ok: readiness.hasConstraints },
            ].map((item) => (
              <span
                key={item.label}
                className={`px-1.5 py-0.5 border rounded-xs ${
                  item.ok
                    ? 'text-[#14532D] bg-[#EAF4EE] border-[#A7D3B9]'
                    : 'text-zinc-500 bg-white border-zinc-200'
                }`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Form Body */}
        {!clarifyingQuestions ? (
          <form onSubmit={handlePrimarySubmit} noValidate className="divide-y divide-zinc-200">
            {/* Section 01: Business Idea */}
            <section className="px-6 py-5 sm:px-9 space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <label
                  htmlFor="idea-textarea"
                  className="text-sm font-bold text-[#161B18] flex items-center gap-2"
                >
                  <span className="font-mono text-[#166534]">01.</span>
                  <span>事業アイデア</span>
                  <span className="text-red-700 text-xs font-medium">必須</span>
                </label>
                <span className="text-xs text-zinc-500">1〜2文のメモでも生成できます</span>
              </div>
              <textarea
                id="idea-textarea"
                rows={4}
                required
                value={form.idea}
                onChange={(e) => updateField('idea', e.target.value)}
                placeholder="実現したいアイデアや、解決したい課題を入力してください"
                className="w-full px-4 py-2.5 text-sm text-[#161B18] bg-[#F7F8F7] border border-zinc-300 rounded-sm placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#1B6B47] focus:ring-2 focus:ring-[#1B6B47]/15 leading-relaxed"
              />
            </section>

            {/* Section 02: Purpose */}
            <section className="px-6 py-5 sm:px-9 space-y-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold text-[#161B18] flex items-center gap-2">
                  <span className="font-mono text-[#166534]">02.</span>
                  <span>利用目的</span>
                  <span className="text-red-700 text-xs font-medium">必須</span>
                </span>
                <span className="text-xs text-zinc-500">
                  選択に応じて提案書の章構成・判断観点を最適化します
                </span>
              </div>

              <div
                role="radiogroup"
                aria-label="利用目的"
                className="grid grid-cols-1 sm:grid-cols-2 border border-zinc-300 rounded-sm divide-y sm:divide-y-0 sm:divide-x divide-zinc-300 overflow-hidden"
              >
                {(
                  [
                    {
                      value: 'Corporate',
                      title: 'Corporate（社内新規事業）',
                      desc: '既存事業シナジー・社内稟議・PoC計画を重視',
                      Icon: Building2,
                    },
                    {
                      value: 'Startup',
                      title: 'Startup（起業・新規創業）',
                      desc: '市場機会・GTM戦略・投資家向け構成を重視',
                      Icon: Rocket,
                    },
                  ] as Array<{
                    value: PurposeType;
                    title: string;
                    desc: string;
                    Icon: React.ComponentType<{ className?: string }>;
                  }>
                ).map(({ value, title, desc, Icon }) => {
                  const selected = form.purpose === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => updateField('purpose', value)}
                      className={`text-left px-4 py-4 transition-colors flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1B6B47] ${
                        selected
                          ? 'bg-gradient-to-r from-[#EAF4EE] to-[#F7FAF8] text-[#161B18]'
                          : 'bg-white hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mt-0.5 shrink-0 ${
                          selected ? 'text-[#166534]' : 'text-zinc-400'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-[#161B18]">{title}</span>
                          {selected && (
                            <span className="text-[11px] font-mono font-semibold text-[#14532D]">
                              SELECTED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-600 mt-1">{desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Section 03: Optional Details */}
            <section className="px-6 py-5 sm:px-9">
              <button
                type="button"
                onClick={() => setShowOptional((prev) => !prev)}
                aria-expanded={showOptional}
                className="w-full flex items-center justify-between gap-3 text-left py-1 text-sm font-semibold text-zinc-800 hover:text-[#166534] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[#166534]">03.</span>
                  <span>任意の詳細情報を追加する（想定顧客・課題・価値・制約条件）</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 shrink-0">
                  <span>{showOptional ? '閉じる' : '開く'}</span>
                  {showOptional ? (
                    <ChevronUp className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  )}
                </span>
              </button>

              {showOptional && (
                <div className="mt-5 pt-5 border-t border-zinc-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="target-customer"
                        className="block text-xs font-semibold text-zinc-700 mb-1.5"
                      >
                        想定顧客（任意）
                      </label>
                      <input
                        id="target-customer"
                        type="text"
                        value={form.targetCustomer ?? ''}
                        onChange={(e) => updateField('targetCustomer', e.target.value)}
                        placeholder="例：中堅製造業の工場長、保全部門"
                        className="w-full px-3.5 py-2 text-sm text-[#161B18] bg-[#F7F8F7] border border-zinc-300 rounded-sm placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#1B6B47]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="problem-input"
                        className="block text-xs font-semibold text-zinc-700 mb-1.5"
                      >
                        解決したい課題（任意）
                      </label>
                      <input
                        id="problem-input"
                        type="text"
                        value={form.problem ?? ''}
                        onChange={(e) => updateField('problem', e.target.value)}
                        placeholder="例：熟練者の退職でトラブル対応ノウハウが消失"
                        className="w-full px-3.5 py-2 text-sm text-[#161B18] bg-[#F7F8F7] border border-zinc-300 rounded-sm placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#1B6B47]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="value-prop"
                      className="block text-xs font-semibold text-zinc-700 mb-1.5"
                    >
                      提供したい価値（任意）
                    </label>
                    <input
                      id="value-prop"
                      type="text"
                      value={form.valueProposition ?? ''}
                      onChange={(e) => updateField('valueProposition', e.target.value)}
                      placeholder="例：音声メモから過去事例を即検索でき、復旧時間を短縮"
                      className="w-full px-3.5 py-2 text-sm text-[#161B18] bg-[#F7F8F7] border border-zinc-300 rounded-sm placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#1B6B47]"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      事業上の制約（任意）
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        id="constraint-budget"
                        aria-label="予算"
                        type="text"
                        value={form.constraints?.budget ?? ''}
                        onChange={(e) => updateConstraint('budget', e.target.value)}
                        placeholder="予算（例：PoC 300万円以内）"
                        className="w-full px-3.5 py-2 text-sm text-[#161B18] bg-[#F7F8F7] border border-zinc-300 rounded-sm placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#1B6B47]"
                      />
                      <input
                        id="constraint-timeline"
                        aria-label="期間"
                        type="text"
                        value={form.constraints?.timeline ?? ''}
                        onChange={(e) => updateConstraint('timeline', e.target.value)}
                        placeholder="期間（例：3ヶ月以内にPoC完了）"
                        className="w-full px-3.5 py-2 text-sm text-[#161B18] bg-[#F7F8F7] border border-zinc-300 rounded-sm placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#1B6B47]"
                      />
                      <input
                        id="constraint-team"
                        aria-label="チーム"
                        type="text"
                        value={form.constraints?.team ?? ''}
                        onChange={(e) => updateConstraint('team', e.target.value)}
                        placeholder="チーム（例：PM1名・エンジニア1名）"
                        className="w-full px-3.5 py-2 text-sm text-[#161B18] bg-[#F7F8F7] border border-zinc-300 rounded-sm placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#1B6B47]"
                      />
                      <input
                        id="constraint-other"
                        aria-label="その他の制約"
                        type="text"
                        value={form.constraints?.other ?? ''}
                        onChange={(e) => updateConstraint('other', e.target.value)}
                        placeholder="その他（例：既存顧客クロスセル）"
                        className="w-full px-3.5 py-2 text-sm text-[#161B18] bg-[#F7F8F7] border border-zinc-300 rounded-sm placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#1B6B47]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="additional-context"
                      className="block text-xs font-semibold text-zinc-700 mb-1.5"
                    >
                      補足情報（任意）
                    </label>
                    <textarea
                      id="additional-context"
                      rows={2}
                      value={form.additionalContext ?? ''}
                      onChange={(e) => updateField('additionalContext', e.target.value)}
                      placeholder="自社の強み、既存アセット、想定競合など"
                      className="w-full px-3.5 py-2 text-sm text-[#161B18] bg-[#F7F8F7] border border-zinc-300 rounded-sm placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#1B6B47]"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Footer Action Strip */}
            <footer className="px-6 py-5 sm:px-9 bg-[#F7F8F7] space-y-4">
              {errorMsg && (
                <div
                  role="alert"
                  className="px-4 py-3 text-sm text-red-900 bg-red-50 border border-red-300 rounded-sm"
                >
                  {errorMsg}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-xs text-zinc-600">
                  生成される6成果物（Executive Summary / Business Model / Decision Brief / 提案書 / MVP仕様 / 検証計画）はすべて後から編集可能です。
                </p>
                <button
                  type="submit"
                  disabled={isCheckingClarify}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-b from-[#1F6E4A] to-[#165539] hover:from-[#1B6040] hover:to-[#12472F] disabled:opacity-60 rounded-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1B6B47]"
                >
                  {isCheckingClarify ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>入力内容を確認中...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate（事業構想を生成）</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </footer>
          </form>
        ) : (
          /* Optional Clarifying Questions (Max 3, Skippable) */
          <div className="divide-y divide-zinc-200">
            <div className="px-6 py-5 sm:px-9 space-y-1">
              <span className="text-xs font-mono font-semibold text-[#166534]">
                OPTIONAL CLARIFICATION · 最大3問
              </span>
              <h2 className="text-lg font-bold text-[#161B18]">精度を高めるための任意確認</h2>
              <p className="text-sm text-zinc-600">
                重要な前提情報が一部未入力です。回答できるものだけ記入するか、回答せずにそのまま生成へ進むことができます。
              </p>
            </div>

            <div className="px-6 py-6 sm:px-9 space-y-4">
              {clarifyingQuestions.map((q, index) => (
                <div key={q.id} className="space-y-1.5">
                  <label
                    htmlFor={`clarify-${q.id}`}
                    className="block text-sm font-medium text-[#161B18]"
                  >
                    {index + 1}. {q.question}
                  </label>
                  <input
                    id={`clarify-${q.id}`}
                    type="text"
                    value={clarifyDrafts[q.id] ?? ''}
                    onChange={(e) =>
                      setClarifyDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    placeholder={q.placeholder}
                    className="w-full px-3.5 py-2 text-sm text-[#161B18] bg-[#F7F8F7] border border-zinc-300 rounded-sm placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-[#1B6B47]"
                  />
                </div>
              ))}
            </div>

            <div className="px-6 py-5 sm:px-9 bg-[#F7F8F7] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setClarifyingQuestions(null)}
                className="px-2 py-2 text-xs font-medium text-zinc-600 hover:text-[#161B18] text-left"
              >
                ← 入力フォームに戻る
              </button>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleSkipClarifications}
                  className="px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-sm transition-colors whitespace-nowrap"
                >
                  回答せずそのまま生成する
                </button>
                <button
                  type="button"
                  onClick={handleProceedWithClarifications}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-b from-[#1F6E4A] to-[#165539] hover:from-[#1B6040] hover:to-[#12472F] rounded-sm transition-colors whitespace-nowrap"
                >
                  <span>回答を反映して生成する</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Quiet Editorial 4-Column Colophon Strip (No card stack) */}
      <section
        aria-label="プロダクト設計原則"
        className="border-t border-zinc-300 pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {PRINCIPLES.map((p) => (
          <div key={p.num} className="space-y-1">
            <div className="text-xs font-bold text-[#161B18] flex items-baseline gap-1.5">
              <span className="font-mono text-[#166534] tabular-nums">{p.num}.</span>
              <span>{p.title}</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
};
