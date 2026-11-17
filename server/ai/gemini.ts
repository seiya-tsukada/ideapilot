import { setTimeout as sleep } from 'node:timers/promises';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { z } from 'zod';
import { config } from '../config.ts';
import { SYSTEM_INSTRUCTION } from './prompts.ts';

export class MissingApiKeyError extends Error {
  constructor() {
    super(
      'GEMINI_API_KEY が設定されていません。.env に API キーを設定するか、サンプルデータ機能をお試しください。',
    );
    this.name = 'MissingApiKeyError';
  }
}

let client: GoogleGenAI | undefined;

function getClient(): GoogleGenAI {
  if (!config.gemini.apiKey) throw new MissingApiKeyError();
  client ??= new GoogleGenAI({ apiKey: config.gemini.apiKey });
  return client;
}

export const hasApiKey = () => Boolean(config.gemini.apiKey);

/* -------------------------------------------------------------------------- */
/* Error handling                                                             */
/* -------------------------------------------------------------------------- */

const TRANSIENT_PATTERNS = ['503', 'UNAVAILABLE', 'high demand', '429', 'ECONNRESET', 'ETIMEDOUT'];

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));

const isTransient = (err: unknown) => {
  const message = errorMessage(err);
  return TRANSIENT_PATTERNS.some((pattern) => message.includes(pattern));
};

function toUserFacingError(err: unknown): Error {
  if (err instanceof MissingApiKeyError) return err;

  const raw = errorMessage(err);
  if (/503|UNAVAILABLE|high demand/.test(raw)) {
    return new Error(
      '現在AIモデルへのアクセスが一時的に集中しています（503 UNAVAILABLE）。少し時間をおいて再実行するか、サンプルデータで画面をご確認ください。',
    );
  }
  if (/429|RESOURCE_EXHAUSTED/.test(raw)) {
    return new Error(
      'AI APIの利用回数上限に達しました（429 RESOURCE_EXHAUSTED）。しばらく待ってから再実行してください。',
    );
  }
  if (/API_KEY_INVALID|PERMISSION_DENIED|403/.test(raw)) {
    return new Error('Gemini APIキーが無効または権限不足です。GEMINI_API_KEY をご確認ください。');
  }
  return err instanceof Error ? err : new Error(raw);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  { attempts = 3, signal }: { attempts?: number; signal?: AbortSignal } = {},
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (signal?.aborted || !isTransient(err) || attempt >= attempts) {
        throw toUserFacingError(err);
      }
      await sleep(attempt * 1500, undefined, { signal });
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Structured generation                                                      */
/* -------------------------------------------------------------------------- */

export type Thinking = 'low' | 'medium';

const THINKING_LEVELS: Record<Thinking, ThinkingLevel> = {
  low: ThinkingLevel.LOW,
  medium: ThinkingLevel.MEDIUM,
};

export interface GenerateOptions<S extends z.ZodType> {
  /** Human-readable stage name used in error messages. */
  stage: string;
  prompt: string;
  schema: S;
  thinking?: Thinking;
  signal?: AbortSignal;
}

/**
 * Calls Gemini with a JSON schema derived from the given zod schema and
 * validates the response against the same schema.
 */
export async function generateStructured<S extends z.ZodType>({
  stage,
  prompt,
  schema,
  thinking = 'low',
  signal,
}: GenerateOptions<S>): Promise<z.infer<S>> {
  const ai = getClient();

  const response = await withRetry(
    () =>
      ai.models.generateContent({
        model: config.gemini.model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: THINKING_LEVELS[thinking] },
          responseMimeType: 'application/json',
          responseJsonSchema: z.toJSONSchema(schema),
          abortSignal: signal,
        },
      }),
    { signal },
  );

  const text = response.text?.trim();
  if (!text) throw new Error(`${stage} の生成結果が空でした。再度お試しください。`);

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error(`${stage} のJSON解析に失敗しました: ${errorMessage(err)}`);
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new Error(`${stage} の生成結果がスキーマと一致しません: ${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}
