import assert from 'node:assert/strict';
import { it } from 'node:test';
import { parseEventStream } from './sse.ts';

function streamOf(...chunks: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

it('parses events split across chunks', async () => {
  const stream = streamOf('event: progress\nda', 'ta: {"step":1}\n\nevent: complete\n', 'data: {}\n\n');
  const messages = [];
  for await (const message of parseEventStream(stream)) messages.push(message);

  assert.deepEqual(messages, [
    { event: 'progress', data: '{"step":1}' },
    { event: 'complete', data: '{}' },
  ]);
});
