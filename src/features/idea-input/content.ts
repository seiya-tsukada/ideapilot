import { Building2, Rocket, type LucideIcon } from 'lucide-react';
import type { IdeaConstraints, IdeaInput, PurposeType } from '#shared/schema.ts';

export const EMPTY_IDEA_INPUT: IdeaInput = {
  idea: '',
  purpose: 'Corporate',
  targetCustomer: '',
  problem: '',
  valueProposition: '',
  constraints: { budget: '', timeline: '', team: '', other: '' },
  additionalContext: '',
};

export const PURPOSE_OPTIONS: { value: PurposeType; title: string; description: string; icon: LucideIcon }[] = [
  {
    value: 'Corporate',
    title: 'Corporate（社内新規事業）',
    description: '既存事業シナジー・社内稟議・PoC計画を重視',
    icon: Building2,
  },
  {
    value: 'Startup',
    title: 'Startup（起業・新規創業）',
    description: '市場機会・GTM戦略・投資家向け構成を重視',
    icon: Rocket,
  },
];

type TextField = 'targetCustomer' | 'problem' | 'valueProposition';

export const DETAIL_FIELDS: { key: TextField; label: string; placeholder: string; wide?: boolean }[] = [
  { key: 'targetCustomer', label: '想定顧客（任意）', placeholder: '例：中堅製造業の工場長、保全部門' },
  { key: 'problem', label: '解決したい課題（任意）', placeholder: '例：熟練者の退職でトラブル対応ノウハウが消失' },
  {
    key: 'valueProposition',
    label: '提供したい価値（任意）',
    placeholder: '例：音声メモから過去事例を即検索でき、復旧時間を短縮',
    wide: true,
  },
];

export const CONSTRAINT_FIELDS: { key: keyof IdeaConstraints; label: string; placeholder: string }[] = [
  { key: 'budget', label: '予算', placeholder: '予算（例：PoC 300万円以内）' },
  { key: 'timeline', label: '期間', placeholder: '期間（例：3ヶ月以内にPoC完了）' },
  { key: 'team', label: 'チーム', placeholder: 'チーム（例：PM1名・エンジニア1名）' },
  { key: 'other', label: 'その他の制約', placeholder: 'その他（例：既存顧客クロスセル）' },
];

export const PRINCIPLES = [
  {
    title: 'FACTと仮説の厳密分離',
    description: '未入力の市場規模や競合情報を捏造せず、UNKNOWN（要調査）として明示します。',
  },
  {
    title: 'Decision Brief 最優先',
    description: 'GO / CONDITIONAL GO / NO-GO の暫定判断と進行条件・次の3アクションを抽出します。',
  },
  {
    title: 'Corporate / Startup最適化',
    description: '社内稟議・シナジー重視か、GTM・投資家向け構成かを自動切替します。',
  },
  {
    title: '最短3日MVPと検証計画',
    description: 'AIアプリ開発用プロンプトと失敗基準付き検証シナリオを同時出力します。',
  },
];

const filled = (value?: string) => Boolean(value?.trim());

export function getReadiness(input: IdeaInput) {
  const { constraints: c } = input;
  const items = [
    { label: '構想', ok: input.idea.trim().length >= 5 },
    { label: '顧客', ok: filled(input.targetCustomer) },
    { label: '課題', ok: filled(input.problem) },
    { label: '価値', ok: filled(input.valueProposition) },
    { label: '制約', ok: [c?.budget, c?.timeline, c?.team, c?.other].some(filled) },
  ];
  return { items, provided: items.filter((i) => i.ok).length };
}

export const hasOptionalDetails = (input: IdeaInput) =>
  [
    input.targetCustomer,
    input.problem,
    input.valueProposition,
    input.additionalContext,
    ...Object.values(input.constraints ?? {}),
  ].some(filled);
