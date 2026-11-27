// Copies the web app from the folder above into www/, which Capacitor packs into the phone app.
// The file list comes from sw.js, so the app ships exactly what the website caches for offline use.
import { readFileSync, rmSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const web = join(here, '..', '..');
const out = join(here, '..', 'www');
const sw = readFileSync(join(web, 'sw.js'), 'utf8');
const files = JSON.parse(sw.match(/const FILES = (\[[^\]]*\])/s)[1].replace(/'/g, '"').replace(/\s+/g, ' '))
  .filter(f => f !== './');

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const f of files) copyFileSync(join(web, f), join(out, f));
console.log(`www: ${files.length} files`);
