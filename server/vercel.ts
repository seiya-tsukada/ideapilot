import { createApiApp } from './app.ts';

/** Vercel function entry: an Express app is a `(req, res)` handler. Bundled by scripts/build-vercel.ts. */
export default createApiApp();
