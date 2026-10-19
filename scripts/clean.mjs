// Removes build output. Cross-platform replacement for `rm -rf dist`.
import fs from 'fs';

fs.rmSync('dist', { recursive: true, force: true });
console.log('Removed dist/.');
