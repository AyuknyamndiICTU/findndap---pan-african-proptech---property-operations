// Vercel Function entry point. scripts/build.mjs bundles this file (with all dependencies)
// into .vercel/output/functions/api.func; every /api/* request is routed to it.
import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from './app.js';

const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  app(req as any, res as any);
}
