import type { Response } from 'express';

/** Opens a Server-Sent Events stream on the response and returns typed helpers. */
export function openEventStream<E extends { type: string; data: unknown }>(res: Response) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  return {
    send(event: E) {
      if (res.writableEnded) return;
      res.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
    },
    close() {
      if (!res.writableEnded) res.end();
    },
  };
}
