// Local entry point: `npm run dev` (API + Vite dev server) and `npm start` (API + built files from dist/).
// On Vercel this file is not used: the API runs as a function (server/vercel.ts) and dist/ is served by the CDN.
import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createApp, getRepository } from './server/app.js';

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function startServer() {
  // Connect, create tables and sync accounts before accepting traffic, so configuration errors show up immediately.
  await getRepository();

  const app = createApp();

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FindNdap Core Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Could not start the server:', err instanceof Error ? err.message : err);
  process.exit(1);
});
