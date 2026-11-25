/**
 * Builds a Vercel Build Output API v3 bundle in `.vercel/output`:
 *   static/          the Vite client (`dist/`), served by the CDN
 *   functions/api.func  the Express API bundled into one ESM file
 * Routing: /api/* → function, existing static files, then the SPA fallback.
 * https://vercel.com/docs/build-output-api/v3
 */
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, '.vercel/output');
const FUNC = path.join(OUT, 'functions/api.func');

/** Must match a runtime Vercel supports; the bundle targets the same Node major. */
const NODE_MAJOR = 22;

const writeJson = (file: string, data: unknown) =>
  writeFile(file, `${JSON.stringify(data, null, 2)}\n`);

await rm(OUT, { recursive: true, force: true });
await mkdir(FUNC, { recursive: true });

await cp(path.join(ROOT, 'dist'), path.join(OUT, 'static'), { recursive: true });

await build({
  entryPoints: [path.join(ROOT, 'server/vercel.ts')],
  outfile: path.join(FUNC, 'index.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: `node${NODE_MAJOR}`,
  // Express and its dependencies are CommonJS and `require()` Node built-ins.
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
  // Only used by the local dev server (dynamic import in createApp).
  external: ['vite'],
  logLevel: 'warning',
});

await writeJson(path.join(FUNC, '.vc-config.json'), {
  runtime: `nodejs${NODE_MAJOR}.x`,
  handler: 'index.mjs',
  launcherType: 'Nodejs',
  shouldAddHelpers: false,
  supportsResponseStreaming: true,
  maxDuration: 300,
});

await writeJson(path.join(OUT, 'config.json'), {
  version: 3,
  routes: [
    { src: '^/api(?:/.*)?$', dest: '/api' },
    { handle: 'filesystem' },
    { src: '/.*', dest: '/index.html' },
  ],
});

console.log(`Vercel output written to ${path.relative(ROOT, OUT)}`);
