import { Router, type Response } from 'express';
import type { AnalysisEvent, ClarifyResponse } from '#shared/analysis.ts';
import { buildFallbackClarifyingQuestions, validateIdeaInput } from '#shared/validation.ts';
import { config } from '../config.ts';
import { hasApiKey } from '../ai/gemini.ts';
import { mockClarifyingQuestions, runMockPipeline } from '../ai/mock.ts';
import { generateClarifyingQuestions, runDecisionPipeline } from '../ai/pipeline.ts';
import { openEventStream } from './sse.ts';

/** Aborts when the client disconnects so in-flight Gemini calls are cancelled. */
function abortOnDisconnect(res: Response): AbortSignal {
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableFinished) controller.abort();
  });
  return controller.signal;
}

const useMock = config.aiBackend === 'mock';
const runPipeline = useMock ? runMockPipeline : runDecisionPipeline;

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ ok: true, aiBackend: config.aiBackend, hasGeminiKey: hasApiKey() });
});

apiRouter.post('/clarify', async (req, res) => {
  const validation = validateIdeaInput(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const input = validation.data;
  if (useMock) {
    res.json(mockClarifyingQuestions(input));
    return;
  }

  const fallback = buildFallbackClarifyingQuestions(input);
  if (fallback.length === 0) {
    res.json({ needsClarification: false, questions: [] } satisfies ClarifyResponse);
    return;
  }

  try {
    res.json(await generateClarifyingQuestions(input, abortOnDisconnect(res)));
  } catch {
    // Clarification is best-effort: fall back to deterministic questions.
    res.json({ needsClarification: true, questions: fallback } satisfies ClarifyResponse);
  }
});

apiRouter.post('/analyze', async (req, res) => {
  const validation = validateIdeaInput(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const signal = abortOnDisconnect(res);
  const stream = openEventStream<AnalysisEvent>(res);

  try {
    const report = await runPipeline(validation.data, {
      signal,
      onProgress: (data) => stream.send({ type: 'progress', data }),
    });
    stream.send({ type: 'complete', data: { report } });
  } catch (err) {
    if (!signal.aborted) {
      const message =
        err instanceof Error ? err.message : 'AI分析の実行中に予期せぬエラーが発生しました。';
      stream.send({ type: 'error', data: { message } });
    }
  } finally {
    stream.close();
  }
});
