import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ClarifyingAnswer, ClarifyingQuestion } from '#shared/schema.ts';
import { Button } from '../../components/ui/Button.tsx';

interface ClarifyStepProps {
  questions: ClarifyingQuestion[];
  onBack: () => void;
  onSubmit: (answers: ClarifyingAnswer[]) => void;
}

export function ClarifyStep({ questions, onBack, onSubmit }: ClarifyStepProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const submitWithAnswers = () =>
    onSubmit(
      questions
        .map((q) => ({ id: q.id, question: q.question, answer: answers[q.id]?.trim() ?? '' }))
        .filter((a) => a.answer),
    );

  return (
    <div className="divide-y divide-zinc-200">
      <div className="space-y-1 px-6 py-5 sm:px-9">
        <span className="eyebrow">OPTIONAL CLARIFICATION · 最大3問</span>
        <h2 className="text-lg font-bold">精度を高めるための任意確認</h2>
        <p className="text-sm text-zinc-600">
          重要な前提情報が一部未入力です。回答できるものだけ記入するか、回答せずにそのまま生成へ進むことができます。
        </p>
      </div>

      <div className="space-y-4 px-6 py-6 sm:px-9">
        {questions.map((q, i) => (
          <div key={q.id} className="space-y-1.5">
            <label htmlFor={`clarify-${q.id}`} className="block text-sm font-medium">
              {i + 1}. {q.question}
            </label>
            <input
              id={`clarify-${q.id}`}
              type="text"
              className="field"
              value={answers[q.id] ?? ''}
              placeholder={q.placeholder}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-stretch justify-between gap-3 bg-surface-muted px-6 py-5 sm:flex-row sm:items-center sm:px-9">
        <Button variant="ghost" onClick={onBack} className="justify-start">
          ← 入力フォームに戻る
        </Button>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Button variant="secondary" size="md" onClick={() => onSubmit([])}>
            回答せずそのまま生成する
          </Button>
          <Button size="md" onClick={submitWithAnswers}>
            回答を反映して生成する
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
