import { useCallback, useEffect, useReducer, useRef } from 'react';
import { ANALYSIS_STEPS, type ProgressEvent, type StepStatus } from '#shared/analysis.ts';
import type { DecisionReport, IdeaInput } from '#shared/schema.ts';
import { streamAnalysis } from '../../lib/api.ts';

export interface StepState {
  step: number;
  title: string;
  description: string;
  status: StepStatus;
}

export interface AnalysisState {
  input: IdeaInput | null;
  steps: StepState[];
  message: string;
  error: string | null;
  startedAt: number | null;
  finishedAt: number | null;
}

type Action =
  | { type: 'start'; input: IdeaInput }
  | { type: 'progress'; event: ProgressEvent }
  | { type: 'complete' }
  | { type: 'fail'; message: string };

const initialSteps = (): StepState[] => ANALYSIS_STEPS.map((s) => ({ ...s, status: 'pending' }));

const initialState: AnalysisState = {
  input: null,
  steps: initialSteps(),
  message: 'AI分析の準備をしています...',
  error: null,
  startedAt: null,
  finishedAt: null,
};

function reducer(state: AnalysisState, action: Action): AnalysisState {
  switch (action.type) {
    case 'start':
      return {
        ...initialState,
        input: action.input,
        steps: initialSteps(),
        message: 'サーバーへアイデアを送信しています...',
        startedAt: Date.now(),
      };
    case 'progress': {
      const { step, status, message } = action.event;
      return {
        ...state,
        message,
        steps: state.steps.map((s) => {
          if (s.step === step) return { ...s, status };
          // The pipeline runs some steps in parallel; anything before the reported step is done.
          if (s.step < step) return { ...s, status: 'completed' };
          return s;
        }),
      };
    }
    case 'complete':
      return { ...state, finishedAt: Date.now() };
    case 'fail':
      return {
        ...state,
        error: action.message,
        finishedAt: Date.now(),
        steps: state.steps.map((s) => (s.status === 'in_progress' ? { ...s, status: 'error' } : s)),
      };
  }
}

const isAbortError = (err: unknown) => err instanceof DOMException && err.name === 'AbortError';

/** Drives the streaming analysis request and exposes its progress. */
export function useAnalysis() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const controllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  /** Resolves with the report, or `null` if the run failed or was cancelled. */
  const run = useCallback(
    async (input: IdeaInput): Promise<DecisionReport | null> => {
      cancel();
      const controller = new AbortController();
      controllerRef.current = controller;
      dispatch({ type: 'start', input });

      try {
        for await (const event of streamAnalysis(input, controller.signal)) {
          switch (event.type) {
            case 'progress':
              dispatch({ type: 'progress', event: event.data });
              break;
            case 'error':
              throw new Error(event.data.message || 'AI生成に失敗しました。');
            case 'complete':
              dispatch({ type: 'complete' });
              return event.data.report;
          }
        }
        throw new Error('分析結果の受信が完了しませんでした。再度お試しください。');
      } catch (err) {
        if (!isAbortError(err)) {
          const message = err instanceof Error ? err.message : '分析中に予期しないエラーが発生しました。';
          dispatch({ type: 'fail', message });
        }
        return null;
      } finally {
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [cancel],
  );

  return { state, run, cancel };
}
