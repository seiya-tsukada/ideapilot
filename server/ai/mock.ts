import { setTimeout as sleep } from 'node:timers/promises';
import { ANALYSIS_STEPS, type ClarifyResponse } from '#shared/analysis.ts';
import type { DecisionReport, IdeaInput } from '#shared/schema.ts';
import { createSampleReport } from '#shared/samples.ts';
import { buildFallbackClarifyingQuestions } from '#shared/validation.ts';
import type { PipelineOptions } from './pipeline.ts';

/** Delay between mock progress events, so the analysis screen behaves like a real run. */
const STEP_DELAY_MS = 400;

/** Rule-based clarifying questions; no external call. */
export function mockClarifyingQuestions(input: IdeaInput): ClarifyResponse {
  const questions = buildFallbackClarifyingQuestions(input);
  return { needsClarification: questions.length > 0, questions };
}

/**
 * Stand-in for `runDecisionPipeline` that emits the same progress events and
 * returns the bundled sample report (flagged `isSample`) with the user's input.
 */
export async function runMockPipeline(
  input: IdeaInput,
  { onProgress, signal }: PipelineOptions,
): Promise<DecisionReport> {
  for (const { step, title } of ANALYSIS_STEPS) {
    onProgress({ step, status: 'in_progress', message: `［モック］${title}を実行しています...` });
    await sleep(STEP_DELAY_MS, undefined, { signal });
    onProgress({ step, status: 'completed', message: `［モック］${title}が完了しました` });
  }
  return { ...createSampleReport(), input };
}
