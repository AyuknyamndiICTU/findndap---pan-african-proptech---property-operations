// Production build: client bundle (Vite) + server bundle (esbuild).
// Run with `npm run build`. Implemented in Node instead of shell commands so it works on
// Windows (including folder names containing "&") as well as macOS/Linux.
import { build as viteBuild } from 'vite';
import { build as esbuild } from 'esbuild';

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
