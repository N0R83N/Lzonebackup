import { initializeApp } from 'firebase/app';
import { initializeFirestore, getDocs, collection, query, orderBy } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(config);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, config.firestoreDatabaseId);

export async function buildSitemapXml(customDomain = 'https://l9zone.nijatemiraslanov.workers.dev') {
  const baseUrl = customDomain.replace(/\/+$/, '');
  const today = new Date().toISOString().split('T')[0];

  const escapeXml = (unsafe) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const urls = [];

  // 1. Ana Sayfa
  urls.push({
    loc: `${baseUrl}/`,
    lastmod: today,
    changefreq: 'daily',
    priority: '1.0'
  });

  // Category and search filters are query variations, not distinct landing pages.\n\n  // 3. Yazılımlar & Oyunlar
  const swSnap = await getDocs(query(collection(db, 'software'), orderBy('createdAt', 'desc')));
  swSnap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    let dateStr = today;
    if (data.createdAt && data.createdAt.seconds) {
      dateStr = new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0];
    }

    urls.push({
      loc: `${baseUrl}/software/${encodeURIComponent(docSnap.id)}`,
      lastmod: dateStr,
      changefreq: 'weekly',
      priority: data.isFeatured ? '0.9' : '0.8'
    });
  });

  const xmlUrls = urls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${xmlUrls}
</urlset>`;
}

async function run() {
  const customDomain = process.argv[2] || process.env.VITE_SITE_URL || 'https://l9zone.nijatemiraslanov.workers.dev';
  console.log('Generating dynamic sitemap from Firestore for:', customDomain);
  const xml = await buildSitemapXml(customDomain);
  const target = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(target, xml, 'utf8');
  console.log('Successfully written to', target);
  process.exit(0);
}

// If executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(err => {
    console.error('Sitemap build error:', err);
    process.exit(1);
  });
}
