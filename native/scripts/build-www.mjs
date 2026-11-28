// Copies the web app from the folder above into www/, which Capacitor packs into the phone app.
// The file list comes from sw.js, so the app ships exactly what the website caches for offline use.
// The phone build then removes the website tip jar and installs the app-only privacy page.
// Play payments rules: the packaged app must not mention or link to a payment page outside Google Play.
import { readFileSync, writeFileSync, rmSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
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

const TEXT = new Set(['.html', '.js', '.css', '.svg', '.webmanifest', '.json', '.txt', '.mjs']);

// The support block is the website tip jar. Remove the whole block, then any leftover checkout URL.
function stripSupport(html) {
  const block = /\s*<div id="support"[^>]*>[\s\S]*?<\/div>/;
  if (!block.test(html)) throw new Error('index.html has no #support block to strip');
  let next = html.replace(block, '');
  next = next.replace(/https?:\/\/buy\.stripe\.com\/[^\s"'<>]*/gi, '');
  const from = 'What this site and the Android app do with data (for schools)';
  const to = 'What this app does with data';
  if (!next.includes(from)) throw new Error('index.html privacy link text was not found');
  next = next.replace(from, to);
  if (next.includes('id="support"') || next.includes('buy.stripe.com')) {
    throw new Error('index.html still has the support block after stripping');
  }
  return next;
}

function stripBuyStripe(text) {
  return text.replace(/https?:\/\/buy\.stripe\.com\/[^\s"'<>]*/gi, '');
}

function walk(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) found.push(...walk(p));
    else found.push(p);
  }
  return found;
}

const indexPath = join(out, 'index.html');
writeFileSync(indexPath, stripSupport(readFileSync(indexPath, 'utf8')));

for (const file of walk(out)) {
  if (!TEXT.has(extname(file))) continue;
  const text = readFileSync(file, 'utf8');
  const next = stripBuyStripe(text);
  if (next !== text) writeFileSync(file, next);
}

// The website privacy page mentions the tip jar. The app ships a separate page about the app only.
copyFileSync(join(here, '..', 'privacy-app.html'), join(out, 'privacy.html'));
const privacyOut = readFileSync(join(out, 'privacy.html'), 'utf8');
if (!privacyOut.includes('This page is about the Android app only.')) {
  throw new Error('Native privacy page was not installed');
}

const banned = ['buy.stripe.com', 'stripe.com'];
const hits = [];
for (const file of walk(out)) {
  const text = readFileSync(file).toString('latin1').toLowerCase();
  for (const term of banned) {
    if (text.includes(term)) hits.push(`${file.slice(out.length + 1)} contains ${term}`);
  }
}
if (hits.length) {
  console.error('Native www must not mention Stripe:');
  for (const hit of hits) console.error(`  ${hit}`);
  process.exit(1);
}

console.log(`www: ${files.length} files`);
console.log('www: no buy.stripe.com or stripe.com');
