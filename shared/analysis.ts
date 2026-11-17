import type { ClarifyingQuestion, DecisionReport } from './schema.ts';

export const ANALYSIS_STEPS = [
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
] as const;

export type AnalysisStepNumber = (typeof ANALYSIS_STEPS)[number]['step'];

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'error';

export interface ProgressEvent {
  step: AnalysisStepNumber;
  status: Extract<StepStatus, 'in_progress' | 'completed'>;
  message: string;
}

/** Server-sent events emitted by `POST /api/analyze`. */
export type AnalysisEvent =
  | { type: 'progress'; data: ProgressEvent }
  | { type: 'complete'; data: { report: DecisionReport } }
  | { type: 'error'; data: { message: string } };

export interface ClarifyResponse {
  needsClarification: boolean;
  questions: ClarifyingQuestion[];
}
