import type { AnalysisStepState, EpistemicTag, IdeaInput, ClarifyingQuestion } from '../types/decision.ts';

export const EPISTEMIC_META: Record<
  EpistemicTag,
  { label: string; jaLabel: string; description: string; className: string }
> = {
  FACT: {
    label: 'FACT',
    jaLabel: '確認済み',
    description: 'ユーザー入力や明示された事実に基づく情報',
    className: 'text-[#14532D] bg-[#EAF4EE] border-[#A7D3B9]',
  },
  HYPOTHESIS: {
    label: 'HYPOTHESIS',
    jaLabel: '仮説',
    description: '今後の顧客・市場検証が必要な仮説',
    className: 'text-[#6B4F1D] bg-[#FAF6EC] border-[#DFCFA9]',
  },
  ESTIMATE: {
    label: 'ESTIMATE',
    jaLabel: '推定',
    description: '一般的な事業構造からの合理的な推定',
    className: 'text-[#2D473A] bg-[#EEF3F0] border-[#BCCDC3]',
  },
  UNKNOWN: {
    label: 'UNKNOWN',
    jaLabel: '要調査',
    description: '根拠・一次情報が不足しているため調査が必要',
    className: 'text-zinc-700 bg-zinc-100 border-zinc-300',
  },
};

export const ANALYSIS_STEPS_TEMPLATE: Omit<AnalysisStepState, 'status'>[] = [
  {
    step: 1,
    title: 'アイデアの理解',
    description: '入力内容から確認済み情報（FACT）と不足情報を分離・整理します',
  },
  {
    step: 2,
    title: '顧客課題の分析',
    description: '想定顧客のペインと解決すべき課題の強度を構造化します',
  },
  {
    step: 3,
    title: '事業仮説の構築',
    description: 'エグゼクティブサマリーと検証すべき中核仮説を定義します',
  },
  {
    step: 4,
    title: 'ビジネスモデルの整理',
    description: '10要素の事業構造と複数収益モデルの比較を作成します',
  },
  {
    step: 5,
    title: '意思決定論点の抽出',
    description: 'GO / CONDITIONAL GO / NO-GO判断、リスク、次アクションを抽出します',
  },
  {
    step: 6,
    title: '成果物の生成',
    description: '事業提案書、MVP仕様書、AI開発プロンプト、検証計画を出力します',
  },
];

export function validateIdeaInput(input: IdeaInput): { valid: boolean; error?: string } {
  const trimmedIdea = input.idea.trim();
  if (!trimmedIdea) {
    return {
      valid: false,
      error: '事業アイデアを入力してください。',
    };
  }
  if (trimmedIdea.length < 5) {
    return {
      valid: false,
      error: 'アイデアの概要を5文字以上で入力してください。',
    };
  }
  if (input.purpose !== 'Corporate' && input.purpose !== 'Startup') {
    return {
      valid: false,
      error: '利用目的（Corporate または Startup）を選択してください。',
    };
  }
  return { valid: true };
}

/**
 * Generates up to 3 lightweight clarifying questions ONLY when key context is absent.
 * Users can always skip these and generate immediately.
 */
export function buildFallbackClarifyingQuestions(input: IdeaInput): ClarifyingQuestion[] {
  const questions: ClarifyingQuestion[] = [];

  if (!input.targetCustomer?.trim()) {
    questions.push({
      id: 'q_target_customer',
      label: '想定顧客の具体化',
      question: 'このサービス・事業で最初に価値を届けたい具体的な顧客像（職種・企業規模・属性）はありますか？',
      placeholder: '例：従業員50〜300名規模の製造業の工場長・保全責任者',
    });
  }

  if (!input.problem?.trim()) {
    questions.push({
      id: 'q_problem',
      label: '最も深刻な課題',
      question: '対象顧客がいま最も時間やコストを奪われている、あるいは困っている課題は何ですか？',
      placeholder: '例：ベテラン作業員の退職で設備トラブルの復旧ノウハウが引き継げない',
    });
  }

  const hasAnyConstraint =
    Boolean(input.constraints?.budget?.trim()) ||
    Boolean(input.constraints?.timeline?.trim()) ||
    Boolean(input.constraints?.team?.trim());

  if (!hasAnyConstraint && questions.length < 3) {
    questions.push({
      id: 'q_constraints',
      label: '想定している制約・前提',
      question: '検証や立ち上げに向けて、想定している予算感・期間・推進体制の制約はありますか？',
      placeholder: '例：3ヶ月以内にPoC実施、開発は2名体制、初期予算300万円以内',
    });
  }

  return questions.slice(0, 3);
}
