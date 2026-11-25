import path from 'node:path';
import express from 'express';
import { config } from './config.ts';
import { apiRouter } from './http/routes.ts';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');

/** API-only app. Used as-is by the Vercel function, where the CDN serves the client. */
export function createApiApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));
  app.use('/api', apiRouter);
  return app;
}

/** Long-running server: the API plus the client (Vite middleware in dev, `dist/` in production). */
export async function createApp() {
  const app = createApiApp();

  if (config.isProduction) {
    const distDir = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distDir));
    app.get('/{*path}', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      root: ROOT_DIR,
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  return app;
}
