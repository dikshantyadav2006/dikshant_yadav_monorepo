import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

execSync('npx esbuild src/index.js --bundle --outdir=dist --format=esm --target=es2017 --sourcemap', {
  cwd: dir,
  stdio: 'inherit',
});

const src = path.join(dir, 'src');
const dest = path.join(dir, 'dist');
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
for (const f of fs.readdirSync(src)) {
  if (f.endsWith('.d.ts')) {
    fs.copyFileSync(path.join(src, f), path.join(dest, f));
  }
}
console.log('shared built');
