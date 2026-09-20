import { promises as fs } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const BASE = '/yunding-portal/';
const ORIGIN = 'https://ydtzfx.github.io';
const EXPECTED_CANONICAL_PREFIX = ORIGIN + BASE;
const errors = [];
const notes = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

function fail(file, message) {
  errors.push(`${path.relative(DIST, file)}: ${message}`);
}

function attrs(tag) {
  return Object.fromEntries([...tag.matchAll(/([:\w-]+)\s*=\s*["']([^"']*)["']/g)].map(([,key,value]) => [key.toLowerCase(), value]));
}

function localTarget(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean.startsWith(BASE)) return null;
  let rel = clean.slice(BASE.length);
  try { rel = decodeURIComponent(rel); } catch {}
  if (!rel) return 'index.html';
  if (rel.endsWith('/')) return path.join(rel, 'index.html');
  if (path.extname(rel)) return rel;
  return path.join(rel, 'index.html');
}

const all = await walk(DIST);
const htmlFiles = all.filter(file => file.endsWith('.html'));
const htmlSet = new Set(all.map(file => path.relative(DIST, file).replaceAll(path.sep, '/')));
const canonicals = new Map();

if (!htmlSet.has('robots.txt')) errors.push('dist: robots.txt missing');
if (!htmlSet.has('sitemap-index.xml')) errors.push('dist: sitemap-index.xml missing');
if (!htmlSet.has('404.html') && !htmlSet.has('404/index.html')) errors.push('dist: 404 page missing');

let totalCss = 0;
for (const file of all.filter(file => file.endsWith('.css'))) totalCss += (await fs.stat(file)).size;
if (totalCss > 300 * 1024) errors.push(`dist: CSS budget exceeded (${Math.round(totalCss/1024)} KiB > 300 KiB)`);
else notes.push(`CSS: ${Math.round(totalCss/1024)} KiB`);

for (const file of htmlFiles) {
  const html = await fs.readFile(file, 'utf8');
  const size = Buffer.byteLength(html);
  if (size > 250 * 1024) fail(file, `HTML budget exceeded (${Math.round(size/1024)} KiB > 250 KiB)`);

  if (!/<html[^>]+lang=["']zh-CN["']/i.test(html)) fail(file, 'missing html lang="zh-CN"');
  if (!/<title>[^<]+<\/title>/i.test(html)) fail(file, 'missing non-empty title');
  if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(html)
      && !/<meta[^>]+content=["'][^"']+["'][^>]+name=["']description["']/i.test(html)) fail(file, 'missing meta description');

  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) fail(file, `expected exactly one h1, found ${h1Count}`);

  const canonicalMatches = [...html.matchAll(/<link[^>]+rel=["']canonical["'][^>]*>/gi)];
  if (canonicalMatches.length !== 1) fail(file, `expected one canonical, found ${canonicalMatches.length}`);
  else {
    const canonical = attrs(canonicalMatches[0][0]).href;
    if (!canonical?.startsWith(EXPECTED_CANONICAL_PREFIX)) fail(file, `canonical outside expected production prefix: ${canonical}`);
    if (canonicals.has(canonical)) fail(file, `duplicate canonical also used by ${canonicals.get(canonical)}`);
    else canonicals.set(canonical, path.relative(DIST, file));
  }

  if (html.includes('/yunding-portalresearch') || html.includes('yunding-portalresearch')) fail(file, 'malformed GitHub Pages base path');

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const a = attrs(match[0]);
    if (!('alt' in a)) fail(file, `image missing alt: ${match[0].slice(0,100)}`);
  }

  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const a = attrs(match[0]);
    const href = a.href;
    if (!href) continue;
    if (a.target === '_blank') {
      const rel = (a.rel ?? '').split(/\s+/);
      if (!rel.includes('noreferrer') && !rel.includes('noopener')) fail(file, `target=_blank link missing noreferrer/noopener: ${href}`);
    }
    const target = localTarget(href);
    if (target && !htmlSet.has(target.replaceAll(path.sep, '/'))) fail(file, `broken internal link: ${href} -> ${target}`);
  }

  const isArticle = /<meta[^>]+property=["']og:type["'][^>]+content=["']article["']/i.test(html)
    || /<meta[^>]+content=["']article["'][^>]+property=["']og:type["']/i.test(html);
  if (isArticle) {
    const reportNumber = html.match(/YD-[A-Z]+-\d{4}-\d{3}/)?.[0] ?? 'article page';
    if (!/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?"@type":"Article"/i.test(html)) fail(file, `${reportNumber} missing Article JSON-LD`);
    if (!/property=["']article:published_time["']/i.test(html)) fail(file, `${reportNumber} missing article:published_time`);
  }
}

console.log(`QA inspected ${htmlFiles.length} HTML pages.`);
for (const note of notes) console.log('✓', note);

if (errors.length) {
  console.error(`\nQA failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error('✗', error);
  process.exit(1);
}

console.log('✓ Accessibility/SEO/link/performance static QA passed.');
