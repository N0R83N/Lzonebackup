import { Software, Category } from '../types';

export function getSiteBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('run.app')) {
      return 'https://l9zone.nijatemiraslanov.workers.dev';
    }
    return origin.replace(/\/+$/, '');
  }
  return 'https://l9zone.nijatemiraslanov.workers.dev';
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/** Build a sitemap from canonical pages only; query filters are not separate landing pages. */
export function generateSitemapXml(
  softwares: Software[],
  _categories: Category[],
  customDomain?: string
): string {
  const baseUrl = (customDomain?.trim() || getSiteBaseUrl()).replace(/\/+$/, '');
  const urls = [
    { loc: baseUrl + '/' },
    ...softwares.map((software) => ({
      loc: baseUrl + '/software/' + encodeURIComponent(software.id),
    })),
  ];
  const xmlUrls = urls.map((url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
}

export function downloadSitemapFile(xmlContent: string, fileName = 'sitemap.xml'): void {
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
