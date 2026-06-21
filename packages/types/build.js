const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, 'src');
const dest = path.join(__dirname, 'dist');
if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
for (const f of fs.readdirSync(src)) {
  if (f.endsWith('.d.ts') || f.endsWith('.js')) {
    fs.copyFileSync(path.join(src, f), path.join(dest, f));
  }
}
console.log('types copied');
