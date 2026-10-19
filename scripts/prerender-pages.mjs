import { initializeApp } from 'firebase/app';
import { initializeFirestore, getDocs, collection, query, orderBy } from 'firebase/firestore';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(await fs.readFile(path.resolve(here, '../firebase-applet-config.json'), 'utf8'));
const siteUrl = (process.env.VITE_SITE_URL || 'https://l9zone.nijatemiraslanov.workers.dev').replace(/\/+$/, '');
const app = initializeApp(config);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, config.firestoreDatabaseId);

function escapeHtml(value = '') {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value).replace(/[&<>"']/g, (char) => entities[char]);
}

function plainText(markdown = '') {
  return String(markdown).replace(/\r\n?/g, '\n')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*>\s?/gm, '')
    .replace(/[*_~`]/g, '').trim();
}

function replaceMeta(html, selector, replacement) {
  if (selector.test(html)) return html.replace(selector, replacement);
  return html.replace('</head>', '  ' + replacement + '\n  </head>');
}

function renderPage(software, template) {
  const title = String(software.title || 'Yazılım').trim();
  const description = plainText(software.description || '');
  const shortDescription = description.replace(/\s+/g, ' ').slice(0, 155).trim();
  const pageTitle = title + ' İndir – L9Zone';
  const canonical = siteUrl + '/software/' + encodeURIComponent(software.id);
  const paragraphs = description.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean)
    .map((part) => '<p class="my-4 leading-7 text-zinc-300">' + escapeHtml(part).replace(/\n/g, '<br>') + '</p>').join('');
  const details = [
    software.category && '<p class="text-zinc-400">Kategori: ' + escapeHtml(software.category) + '</p>',
    software.subcategory && '<p class="text-zinc-400">Alt kategori: ' + escapeHtml(software.subcategory) + '</p>',
    software.version && '<p class="text-zinc-400">Sürüm: ' + escapeHtml(software.version) + '</p>',
  ].filter(Boolean).join('');

  let html = template.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + escapeHtml(pageTitle) + '</title>');
  html = replaceMeta(html, /<meta\s+name=["']description["'][^>]*>/i, '<meta name="description" content="' + escapeHtml(shortDescription) + '" />');
  html = replaceMeta(html, /<link\s+rel=["']canonical["'][^>]*>/i, '<link rel="canonical" href="' + escapeHtml(canonical) + '" />');
  html = replaceMeta(html, /<meta\s+property=["']og:title["'][^>]*>/i, '<meta property="og:title" content="' + escapeHtml(pageTitle) + '" />');
  html = replaceMeta(html, /<meta\s+property=["']og:description["'][^>]*>/i, '<meta property="og:description" content="' + escapeHtml(shortDescription) + '" />');
  html = replaceMeta(html, /<meta\s+property=["']og:url["'][^>]*>/i, '<meta property="og:url" content="' + escapeHtml(canonical) + '" />');
  html = replaceMeta(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, '<meta name="twitter:title" content="' + escapeHtml(pageTitle) + '" />');
  html = replaceMeta(html, /<meta\s+name=["']twitter:description["'][^>]*>/i, '<meta name="twitter:description" content="' + escapeHtml(shortDescription) + '" />');
  const article = '<div id="root"><main class="min-h-screen bg-black text-white px-6 py-12"><article class="mx-auto max-w-4xl">' +
    '<a href="/" class="text-blue-400">L9Zone ana sayfa</a><h1 class="mt-8 text-4xl font-bold">' + escapeHtml(title) + '</h1>' +
    '<div class="mt-4 space-y-2">' + details + '</div><section class="mt-8">' + paragraphs + '</section></article></main></div>';
  html = html.replace('<div id="root"></div>', article);
  return html;
}

async function main() {
  const distDir = path.resolve(here, '../dist');
  const template = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');
  const snapshot = await getDocs(query(collection(db, 'software'), orderBy('createdAt', 'desc')));
  let generated = 0;
  for (const doc of snapshot.docs) {
    const software = { id: doc.id, ...doc.data() };
    if (!software.title || !software.description || software.id.includes('/') || software.id.includes('\\\\')) continue;
    const routeDir = path.join(distDir, 'software', software.id);
    await fs.mkdir(routeDir, { recursive: true });
    await fs.writeFile(path.join(routeDir, 'index.html'), renderPage(software, template), 'utf8');
    generated += 1;
  }
  console.log('Generated ' + generated + ' pre-rendered software pages.');
}

main().catch((error) => {
  console.error('SEO page generation failed:', error);
  process.exitCode = 1;
});