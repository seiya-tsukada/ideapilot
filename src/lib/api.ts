import type { AnalysisEvent, ClarifyResponse } from '#shared/analysis.ts';
import type { IdeaInput } from '#shared/schema.ts';
import { parseEventStream } from './sse.ts';

async function postJson(path: string, body: unknown, signal?: AbortSignal) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `サーバーエラーが発生しました (${res.status})`);
  }
  return res;
}

export async function requestClarification(input: IdeaInput): Promise<ClarifyResponse> {
  const res = await postJson('/api/clarify', input);
  return (await res.json()) as ClarifyResponse;
}

/** Streams analysis progress events from the server. */
export async function* streamAnalysis(
  input: IdeaInput,
  signal?: AbortSignal,
): AsyncGenerator<AnalysisEvent> {
  const res = await postJson('/api/analyze', input, signal);
  if (!res.body) throw new Error('ストリーミングレスポンスの読み取りに失敗しました。');

  for await (const { event, data } of parseEventStream(res.body)) {
    yield { type: event, data: JSON.parse(data) } as AnalysisEvent;
  }
}
