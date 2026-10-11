import { Software, Category } from '../types';

/**
 * Mevcut alan adı (origin) veya varsayılan canlı alan adı
 */
export function getSiteBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    // Eğer localhost veya dev ortamı ise canlı alan adını veya mevcut adresi kullan
    return origin.replace(/\/+$/, '');
  }
  return 'https://l9zone.pages.dev';
}

/**
 * Dinamik XML Site Haritası Üretici (Sitemap Generator)
 * Tüm aktif yazılımları, kategorileri ve ana sayfayı standart Google Sitemap protokolüne dönüştürür.
 */
export function generateSitemapXml(
  softwares: Software[],
  categories: Category[],
  customDomain?: string
): string {
  const baseUrl = (customDomain?.trim() || getSiteBaseUrl()).replace(/\/+$/, '');
  const today = new Date().toISOString().split('T')[0];

  const escapeXml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const urls: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [];

  // 1. Ana Sayfa (En Yüksek Öncelik)
  urls.push({
    loc: `${baseUrl}/`,
    lastmod: today,
    changefreq: 'daily',
    priority: '1.0'
  });

  // 2. Kategoriler
  const uniqueCategories = new Set<string>();
  categories.forEach(c => uniqueCategories.add(c.name));
  softwares.forEach(s => {
    if (s.category) uniqueCategories.add(s.category);
  });

  uniqueCategories.forEach(cat => {
    const encodedCat = encodeURIComponent(cat);
    urls.push({
      loc: `${baseUrl}/?category=${encodedCat}`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.9'
    });
  });

  // 3. Yazılım & Oyun Detay Sayfaları (Doğrudan Google'da aranacak sayfalar)
  softwares.forEach(sw => {
    let dateStr = today;
    if (sw.createdAt) {
      try {
        const d = (sw.createdAt as any).toDate ? (sw.createdAt as any).toDate() : new Date((sw.createdAt as any).seconds * 1000);
        dateStr = d.toISOString().split('T')[0];
      } catch {
        dateStr = today;
      }
    }

    urls.push({
      loc: `${baseUrl}/software/${sw.id}`,
      lastmod: dateStr,
      changefreq: 'weekly',
      priority: sw.isFeatured ? '0.9' : '0.8'
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

/**
 * Dosya olarak sitemap.xml indirtme yardımcısı
 */
export function downloadSitemapFile(xmlContent: string, fileName = 'sitemap.xml'): void {
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
