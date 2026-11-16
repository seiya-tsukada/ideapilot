import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateClarifyingQuestions,
  runDecisionAnalysisPipeline,
} from './server/geminiPipeline.ts';
import type { IdeaInput } from './src/types/decision.ts';
import {
  buildFallbackClarifyingQuestions,
  validateIdeaInput,
} from './src/utils/validation.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      hasGeminiKey: Boolean(
        process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
      ),
    });
  });

  app.post('/api/clarify', async (req, res) => {
    const input = req.body as IdeaInput;
    const validation = validateIdeaInput(input);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const fallback = buildFallbackClarifyingQuestions(input);
    if (fallback.length === 0) {
      res.json({ needsClarification: false, questions: [] });
      return;
    }

    try {
      const result = await generateClarifyingQuestions(input);
      res.json(result);
    } catch {
      // If Gemini key is missing or rate-limited during lightweight clarification, fall back deterministically
      res.json({
        needsClarification: fallback.length > 0,
        questions: fallback,
      });
    }
  });

  app.post('/api/analyze', async (req, res) => {
    const input = req.body as IdeaInput;
    const validation = validateIdeaInput(input);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (event: string, payload: unknown) => {
      if (!res.writableEnded) {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    };

    try {
      const report = await runDecisionAnalysisPipeline(input, (step, status, message) => {
        sendEvent('progress', { step, status, message });
      });
      sendEvent('complete', { report });
      res.end();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'AI分析の実行中に予期せぬエラーが発生しました。';
      sendEvent('error', { message });
      res.end();
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  return app;
}

createApp()
  .then((app) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Idea Decision Engine server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
