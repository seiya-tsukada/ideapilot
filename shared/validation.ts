import { ideaInputSchema, type ClarifyingQuestion, type IdeaInput } from './schema.ts';

export type ValidationResult =
  | { success: true; data: IdeaInput }
  | { success: false; error: string };

/** Validates raw (untrusted) input and returns the first human-readable error. */
export function validateIdeaInput(raw: unknown): ValidationResult {
  const result = ideaInputSchema.safeParse(raw);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    error: result.error.issues[0]?.message ?? '入力内容を確認してください。',
  };
}

export const MAX_CLARIFYING_QUESTIONS = 3;

const hasText = (value?: string) => Boolean(value?.trim());

/**
 * Deterministic clarifying questions used when key context is missing.
 * Also acts as the fallback when the AI call fails.
 */
export function buildFallbackClarifyingQuestions(input: IdeaInput): ClarifyingQuestion[] {
  const questions: ClarifyingQuestion[] = [];
  const { constraints } = input;

  if (!hasText(input.targetCustomer)) {
    questions.push({
      id: 'q_target_customer',
      label: '想定顧客の具体化',
      question:
        'このサービス・事業で最初に価値を届けたい具体的な顧客像（職種・企業規模・属性）はありますか？',
      placeholder: '例：従業員50〜300名規模の製造業の工場長・保全責任者',
    });
  }

  if (!hasText(input.problem)) {
    questions.push({
      id: 'q_problem',
      label: '最も深刻な課題',
      question: '対象顧客がいま最も時間やコストを奪われている、あるいは困っている課題は何ですか？',
      placeholder: '例：ベテラン作業員の退職で設備トラブルの復旧ノウハウが引き継げない',
    });
  }

  const hasAnyConstraint =
    hasText(constraints?.budget) || hasText(constraints?.timeline) || hasText(constraints?.team);

  if (!hasAnyConstraint) {
    questions.push({
      id: 'q_constraints',
      label: '想定している制約・前提',
      question: '検証や立ち上げに向けて、想定している予算感・期間・推進体制の制約はありますか？',
      placeholder: '例：3ヶ月以内にPoC実施、開発は2名体制、初期予算300万円以内',
    });
  }

  return questions.slice(0, MAX_CLARIFYING_QUESTIONS);
}
