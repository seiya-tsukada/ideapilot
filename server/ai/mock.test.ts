import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ProgressEvent } from '#shared/analysis.ts';
import { decisionReportSchema } from '#shared/schema.ts';
import { SAMPLE_IDEAS } from '#shared/samples.ts';
import { runMockPipeline } from './mock.ts';

test('mock pipeline reports every step and returns a valid sample report with the input', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const input = SAMPLE_IDEAS[1].input;
  const events: ProgressEvent[] = [];
  const pending = runMockPipeline(input, { onProgress: (e) => events.push(e) });
  for (let i = 0; i < 6; i++) {
    await Promise.resolve();
    t.mock.timers.tick(400);
  }
  const report = await pending;

  assert.equal(events.filter((e) => e.status === 'completed').length, 6);
  assert.equal(report.isSample, true);
  assert.deepEqual(report.input, input);
  assert.ok(decisionReportSchema.safeParse(report).success);
});
