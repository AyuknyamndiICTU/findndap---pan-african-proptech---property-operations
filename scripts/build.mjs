// Production build. Run with `npm run build`.
//   1. Vite builds the frontend into dist/.
//   2. esbuild bundles the server for `npm start` (self-hosting) into dist/server.cjs.
//   3. On Vercel (VERCEL=1), or with --vercel, it also writes the Build Output API folder
//      .vercel/output: dist/ becomes static files on the CDN and the whole Express API becomes
//      one Node.js function at /api. Bundling everything avoids relying on Vercel's file tracing.
// Implemented in Node instead of shell commands so it works on every OS, including folder names with "&".
import { build as viteBuild } from 'vite';
import { build as esbuild } from 'esbuild';
import fs from 'fs';
import path from 'path';

const forVercel = !!process.env.VERCEL || process.argv.includes('--vercel');

await viteBuild();

await esbuild({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  sourcemap: true,
  outfile: 'dist/server.cjs',
  // The bundled server always runs in production mode (static files from dist/, no Vite dev server).
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info'
});

if (forVercel) {
  const out = '.vercel/output';
  const funcDir = path.join(out, 'functions', 'api.func');
  fs.rmSync(out, { recursive: true, force: true });

  // Static frontend, without the self-hosting server bundle or dotfiles.
  fs.cpSync('dist', path.join(out, 'static'), {
    recursive: true,
    filter: (src) => !/server\.cjs(\.map)?$/.test(src) && !path.basename(src).startsWith('.')
  });

  // The API function: one self-contained file, no node_modules needed at runtime.
  await esbuild({
    entryPoints: ['server/vercel.ts'],
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    outfile: path.join(funcDir, 'index.js'),
    // pg-native is an optional add-on that pg only loads when asked to.
    external: ['pg-native'],
    define: { 'process.env.NODE_ENV': '"production"' },
    sourcemap: true,
    logLevel: 'info'
  });

  fs.writeFileSync(
    path.join(funcDir, '.vc-config.json'),
    JSON.stringify(
      {
        runtime: 'nodejs22.x',
        handler: 'index.js',
        launcherType: 'Nodejs',
        shouldAddHelpers: false,
        shouldAddSourcemapSupport: true,
        maxDuration: 30
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    path.join(out, 'config.json'),
    JSON.stringify(
      {
        version: 3,
        routes: [
          // Every API path goes to the single Express function.
          { src: '^/api(?:/.*)?$', dest: '/api' },
          // Hashed Vite assets never change, so browsers may cache them for a year.
          {
            src: '^/assets/(.*)$',
            headers: { 'cache-control': 'public, max-age=31536000, immutable' },
            continue: true
          },
          { handle: 'filesystem' },
          // Any other path is a client-side page: serve the app shell.
          { src: '^/(.*)$', dest: '/index.html' }
        ]
      },
      null,
      2
    )
  );

  console.log(`Vercel Build Output written to ${out}`);
}
