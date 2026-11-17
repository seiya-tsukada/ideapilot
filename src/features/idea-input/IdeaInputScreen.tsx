import { useState, type FormEvent } from 'react';
import { ArrowRight, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import type { ClarifyingAnswer, ClarifyingQuestion, IdeaConstraints, IdeaInput } from '#shared/schema.ts';
import { validateIdeaInput } from '#shared/validation.ts';
import { Button } from '../../components/ui/Button.tsx';
import { SAMPLE_IDEAS } from '../../data/samples.ts';
import { requestClarification } from '../../lib/api.ts';
import { cn } from '../../lib/cn.ts';
import { pad2 } from '../../lib/format.ts';
import { ClarifyStep } from './ClarifyStep.tsx';
import {
  CONSTRAINT_FIELDS,
  DETAIL_FIELDS,
  PRINCIPLES,
  PURPOSE_OPTIONS,
  getReadiness,
  hasOptionalDetails,
} from './content.ts';

interface IdeaInputScreenProps {
  initialInput: IdeaInput;
  onSubmit: (input: IdeaInput) => void;
  onViewSample: () => void;
}

export function IdeaInputScreen({ initialInput, onSubmit, onViewSample }: IdeaInputScreenProps) {
  const [form, setForm] = useState(initialInput);
  const [showDetails, setShowDetails] = useState(() => hasOptionalDetails(initialInput));
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [questions, setQuestions] = useState<ClarifyingQuestion[] | null>(null);

  const update = (patch: Partial<IdeaInput>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setError(null);
  };

  const updateConstraint = (key: keyof IdeaConstraints, value: string) =>
    setForm((prev) => ({ ...prev, constraints: { ...prev.constraints, [key]: value } }));

  const loadPreset = (input: IdeaInput) => {
    setForm(input);
    setShowDetails(true);
    setQuestions(null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validation = validateIdeaInput(form);
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setChecking(true);
    try {
      const result = await requestClarification(form);
      if (result.needsClarification && result.questions.length > 0) {
        setQuestions(result.questions);
        return;
      }
    } catch {
      // Clarification is optional — proceed straight to analysis.
    } finally {
      setChecking(false);
    }
    onSubmit(form);
  };

  const submitWithAnswers = (answers: ClarifyingAnswer[]) =>
    onSubmit({ ...form, clarifyingAnswers: answers.length > 0 ? answers : undefined });

  return (
    <main className="mx-auto max-w-[980px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
      <article className="sheet">
        <Hero onViewSample={onViewSample} onLoadPreset={loadPreset} />
        <ReadinessBar input={form} />

        {questions ? (
          <ClarifyStep questions={questions} onBack={() => setQuestions(null)} onSubmit={submitWithAnswers} />
        ) : (
          <form onSubmit={handleSubmit} noValidate className="divide-y divide-zinc-200">
            <section className="space-y-2 px-6 py-5 sm:px-9">
              <StepHeading
                index={1}
                htmlFor="idea"
                title="事業アイデア"
                required
                hint="1〜2文のメモでも生成できます"
              />
              <textarea
                id="idea"
                rows={4}
                required
                value={form.idea}
                onChange={(e) => update({ idea: e.target.value })}
                placeholder="実現したいアイデアや、解決したい課題を入力してください"
                className="field px-4 py-2.5 leading-relaxed"
              />
            </section>

            <section className="space-y-2.5 px-6 py-5 sm:px-9">
              <StepHeading index={2} title="利用目的" required hint="選択に応じて提案書の章構成・判断観点を最適化します" />
              <div
                role="radiogroup"
                aria-label="利用目的"
                className="grid grid-cols-1 divide-y divide-zinc-300 overflow-hidden rounded-sm border border-zinc-300 sm:grid-cols-2 sm:divide-x sm:divide-y-0"
              >
                {PURPOSE_OPTIONS.map(({ value, title, description, icon: Icon }) => {
                  const selected = form.purpose === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => update({ purpose: value })}
                      className={cn(
                        'flex items-start gap-3 px-4 py-4 text-left transition-colors',
                        'focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none focus-visible:ring-inset',
                        selected ? 'bg-brand-50' : 'bg-white hover:bg-zinc-50',
                      )}
                    >
                      <Icon className={cn('mt-0.5 size-5 shrink-0', selected ? 'text-brand-700' : 'text-zinc-400')} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">{title}</span>
                          {selected && <span className="font-mono text-[11px] font-semibold text-brand-800">SELECTED</span>}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">{description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="px-6 py-5 sm:px-9">
              <button
                type="button"
                onClick={() => setShowDetails((v) => !v)}
                aria-expanded={showDetails}
                className="flex w-full items-center justify-between gap-3 py-1 text-left text-sm font-semibold text-zinc-800 transition-colors hover:text-brand-700"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-brand-700">03.</span>
                  任意の詳細情報を追加する（想定顧客・課題・価値・制約条件）
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-zinc-500">
                  {showDetails ? '閉じる' : '開く'}
                  <ChevronDown className={cn('size-4 transition-transform', showDetails && 'rotate-180')} aria-hidden />
                </span>
              </button>

              {showDetails && (
                <div className="mt-5 grid grid-cols-1 gap-4 border-t border-zinc-200 pt-5 sm:grid-cols-2">
                  {DETAIL_FIELDS.map(({ key, label, placeholder, wide }) => (
                    <div key={key} className={cn(wide && 'sm:col-span-2')}>
                      <FieldLabel htmlFor={key}>{label}</FieldLabel>
                      <input
                        id={key}
                        type="text"
                        className="field"
                        value={form[key] ?? ''}
                        placeholder={placeholder}
                        onChange={(e) => update({ [key]: e.target.value })}
                      />
                    </div>
                  ))}

                  <fieldset className="sm:col-span-2">
                    <legend className="mb-1.5 block text-xs font-semibold text-zinc-700">事業上の制約（任意）</legend>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {CONSTRAINT_FIELDS.map(({ key, label, placeholder }) => (
                        <input
                          key={key}
                          type="text"
                          aria-label={label}
                          className="field"
                          value={form.constraints?.[key] ?? ''}
                          placeholder={placeholder}
                          onChange={(e) => updateConstraint(key, e.target.value)}
                        />
                      ))}
                    </div>
                  </fieldset>

                  <div className="sm:col-span-2">
                    <FieldLabel htmlFor="additionalContext">補足情報（任意）</FieldLabel>
                    <textarea
                      id="additionalContext"
                      rows={2}
                      className="field"
                      value={form.additionalContext ?? ''}
                      placeholder="自社の強み、既存アセット、想定競合など"
                      onChange={(e) => update({ additionalContext: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </section>

            <footer className="space-y-4 bg-surface-muted px-6 py-5 sm:px-9">
              {error && (
                <div role="alert" className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-zinc-600">
                  生成される6成果物（Executive Summary / Business Model / Decision Brief / 提案書 / MVP仕様 / 検証計画）はすべて後から編集可能です。
                </p>
                <Button type="submit" size="md" disabled={checking}>
                  {checking ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      入力内容を確認中...
                    </>
                  ) : (
                    <>
                      Generate（事業構想を生成）
                      <ArrowRight className="size-4" aria-hidden />
                    </>
                  )}
                </Button>
              </div>
            </footer>
          </form>
        )}
      </article>

      <section
        aria-label="プロダクト設計原則"
        className="grid grid-cols-1 gap-5 border-t border-zinc-300 pt-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {PRINCIPLES.map((p, i) => (
          <div key={p.title} className="space-y-1">
            <div className="flex items-baseline gap-1.5 text-xs font-bold">
              <span className="font-mono text-brand-700 tabular-nums">{pad2(i + 1)}.</span>
              {p.title}
            </div>
            <p className="text-xs leading-relaxed text-zinc-600">{p.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

function Hero({ onViewSample, onLoadPreset }: { onViewSample: () => void; onLoadPreset: (input: IdeaInput) => void }) {
  return (
    <header className="border-b border-night-600 bg-night-700 px-6 py-5 text-white sm:px-9 sm:py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[60ch] space-y-2">
          <div className="eyebrow text-brand-300">DECISION BRIEFING SHEET · NEW VENTURE</div>
          <h1 className="text-2xl leading-snug font-bold tracking-tight sm:text-[28px]">アイデアを、意思決定できる事業構想へ。</h1>
          <p className="text-sm leading-relaxed text-zinc-300">
            1〜2文の構想からでも、経営陣・投資家へ説明し「進めるか／何を検証するか」を判断できる6種類の構造化資料を一括生成します。
          </p>
        </div>
        <Button variant="inverse" onClick={onViewSample}>
          <Sparkles className="size-3.5 text-brand-300" aria-hidden />
          生成済みサンプルを閲覧 →
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-night-600 pt-3.5">
        <span className="mr-1 font-mono text-[11px] text-zinc-400">SAMPLE PRESETS:</span>
        {SAMPLE_IDEAS.map((preset) => (
          <Button key={preset.label} variant="inverse" size="xs" className="font-normal" onClick={() => onLoadPreset(preset.input)}>
            {preset.label}
            <span className="font-mono text-[11px] text-brand-300">読込</span>
          </Button>
        ))}
      </div>
    </header>
  );
}

function ReadinessBar({ input }: { input: IdeaInput }) {
  const { items, provided } = getReadiness(input);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-surface-muted px-6 py-3 text-xs sm:px-9">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-600">
        <span className="eyebrow">FACT COVERAGE</span>
        <span className="tabular-nums">
          確定入力 <strong className="text-ink">{provided}/{items.length}</strong> 項目
        </span>
        <span className="hidden text-zinc-400 sm:inline">|</span>
        <span className="text-zinc-500">未入力項目はAIが捏造せず「仮説 / 要調査（UNKNOWN）」として整理します</span>
      </div>
      <div className="flex items-center gap-1.5 font-mono text-[11px]">
        {items.map((item) => (
          <span
            key={item.label}
            className={cn(
              'rounded-xs border px-1.5 py-0.5',
              item.ok ? 'border-brand-200 bg-brand-50 text-brand-800' : 'border-zinc-200 bg-white text-zinc-500',
            )}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function StepHeading({
  index,
  title,
  hint,
  required,
  htmlFor,
}: {
  index: number;
  title: string;
  hint: string;
  required?: boolean;
  htmlFor?: string;
}) {
  const Label = htmlFor ? 'label' : 'span';
  return (
    <div className="flex items-baseline justify-between gap-2">
      <Label htmlFor={htmlFor} className="flex items-center gap-2 text-sm font-bold">
        <span className="font-mono text-brand-700">{pad2(index)}.</span>
        {title}
        {required && <span className="text-xs font-medium text-red-700">必須</span>}
      </Label>
      <span className="text-xs text-zinc-500">{hint}</span>
    </div>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-zinc-700">
      {children}
    </label>
  );
}
