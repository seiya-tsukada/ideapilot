import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { ClarifyResponse, ProgressEvent } from '#shared/analysis.ts';
import {
  businessModelSchema,
  businessProposalSchema,
  clarifyingQuestionSchema,
  decisionBriefSchema,
  executiveSummarySchema,
  mvpSpecificationSchema,
  validationPlanSchema,
  type DecisionReport,
  type IdeaInput,
} from '#shared/schema.ts';
import { MAX_CLARIFYING_QUESTIONS } from '#shared/validation.ts';
import { generateStructured } from './gemini.ts';
import { formatIdeaContext, prompts, withUnderstanding } from './prompts.ts';

const clarifyResultSchema = z.object({
  needsClarification: z.boolean(),
  questions: z.array(clarifyingQuestionSchema),
});

const understandingSchema = z.object({
  ideaName: z.string(),
  overallSummary: z.string(),
  confirmedFacts: z.array(z.string()),
  missingInformation: z.array(z.string()),
});

export async function generateClarifyingQuestions(
  input: IdeaInput,
  signal?: AbortSignal,
): Promise<ClarifyResponse> {
  const result = await generateStructured({
    stage: '追加質問の生成',
    prompt: prompts.clarify(formatIdeaContext(input)),
    schema: clarifyResultSchema,
    signal,
  });

  const questions = result.questions.slice(0, MAX_CLARIFYING_QUESTIONS);
  return { needsClarification: result.needsClarification && questions.length > 0, questions };
}

export interface PipelineOptions {
  onProgress: (event: ProgressEvent) => void;
  signal?: AbortSignal;
}

/**
 * Runs the 6-step analysis. Independent stages are executed in parallel:
 *
 *   1. understanding
 *   2–4. executive summary ‖ business model
 *   5. decision brief
 *   6. proposal ‖ MVP spec ‖ validation plan
 */
export async function runDecisionPipeline(
  input: IdeaInput,
  { onProgress, signal }: PipelineOptions,
): Promise<DecisionReport> {
  const progress = (step: ProgressEvent['step'], status: ProgressEvent['status'], message: string) =>
    onProgress({ step, status, message });

  // Step 1 — understanding
  progress(1, 'in_progress', '入力情報からFACTと未確認論点を抽出しています...');
  const ideaContext = formatIdeaContext(input);
  const understanding = await generateStructured({
    stage: 'アイデアの理解',
    prompt: prompts.understanding(ideaContext),
    schema: understandingSchema,
    signal,
  });
  progress(1, 'completed', 'アイデアの構造化が完了しました');

  const ctx = withUnderstanding(ideaContext, understanding);

  // Steps 2–4 — executive summary & business model
  progress(2, 'in_progress', '顧客課題とビジネスモデル構造を並行分析しています...');
  const [executiveSummary, businessModel] = await Promise.all([
    generateStructured({
      stage: 'Executive Summary',
      prompt: prompts.executiveSummary(ctx),
      schema: executiveSummarySchema,
      signal,
    }),
    generateStructured({
      stage: 'Business Model',
      prompt: prompts.businessModel(ctx),
      schema: businessModelSchema,
      signal,
    }),
  ]);
  progress(2, 'completed', '顧客課題の分析が完了しました');
  progress(3, 'completed', '事業仮説の構築が完了しました');
  progress(4, 'completed', 'ビジネスモデルの整理が完了しました');

  // Step 5 — decision brief
  progress(5, 'in_progress', 'Decision Brief（判断区分・リスク・重要仮説・次アクション）を抽出しています...');
  const decisionBrief = await generateStructured({
    stage: 'Decision Brief',
    prompt: prompts.decisionBrief(ctx),
    schema: decisionBriefSchema,
    thinking: 'medium',
    signal,
  });
  progress(5, 'completed', '意思決定論点の抽出が完了しました');

  // Step 6 — deliverables
  progress(6, 'in_progress', '事業提案書・MVP仕様書・開発プロンプト・検証計画を生成しています...');
  const [businessProposal, mvpSpecification, validationPlan] = await Promise.all([
    generateStructured({
      stage: 'Business Proposal',
      prompt: prompts.businessProposal(ctx, input.purpose),
      schema: businessProposalSchema,
      signal,
    }),
    generateStructured({
      stage: 'MVP Specification',
      prompt: prompts.mvpSpecification(ctx),
      schema: mvpSpecificationSchema,
      signal,
    }),
    generateStructured({
      stage: 'Validation Plan',
      prompt: prompts.validationPlan(ctx),
      schema: validationPlanSchema,
      signal,
    }),
  ]);
  progress(6, 'completed', 'すべての成果物の生成が完了しました');

  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    isSample: false,
    input,
    ideaName: understanding.ideaName,
    overallSummary: understanding.overallSummary,
    executiveSummary,
    businessModel,
    decisionBrief,
    businessProposal,
    mvpSpecification,
    validationPlan,
  };
}
