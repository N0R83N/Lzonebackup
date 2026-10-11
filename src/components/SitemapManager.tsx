import React, { useState } from 'react';
import { Software, Category } from '../types';
import { generateSitemapXml, downloadSitemapFile, getSiteBaseUrl } from '../utils/sitemapGenerator';
import {
  FileCode, Download, Copy, Check, ExternalLink, Globe,
  Sparkles, RefreshCw, Layers, CheckCircle2
} from 'lucide-react';

interface SitemapManagerProps {
  softwares: Software[];
  categories: Category[];
}

export default function SitemapManager({ softwares, categories }: SitemapManagerProps) {
  const [domain, setDomain] = useState(() => getSiteBaseUrl());
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const xmlContent = generateSitemapXml(softwares, categories, domain);

  // Toplam URL hesaplama
  const uniqueCategories = new Set<string>();
  categories.forEach(c => uniqueCategories.add(c.name));
  softwares.forEach(s => {
    if (s.category) uniqueCategories.add(s.category);
  });
  const totalUrls = 1 + uniqueCategories.size + softwares.length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  const handleDownload = () => {
    downloadSitemapFile(xmlContent, 'sitemap.xml');
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Başlık ve Üst Bilgi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Site Haritası Yöneticisi (sitemap.xml)
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-medium">
                  Google SEO
                </span>
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                Google Search Console ve diğer arama motorları için tüm içeriklerinizi kapsayan güncel XML haritası.
              </p>
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium border border-zinc-700/60 transition-all active:scale-95"
            title="XML Kodunu Kopyala"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>XML Kopyala</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium shadow-lg shadow-amber-900/30 transition-all active:scale-95"
            title="sitemap.xml Dosyasını İndir"
          >
            <Download className="w-4 h-4" />
            <span>sitemap.xml İndir</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span><strong>sitemap.xml</strong> başarıyla oluşturuldu ve bilgisayarınıza indirildi!</span>
        </div>
      )}

      {/* İstatistikler */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Toplam URL</p>
          <p className="text-2xl font-bold text-white mt-1">{totalUrls}</p>
        </div>
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Yazılımlar & Oyunlar</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{softwares.length}</p>
        </div>
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Kategoriler</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{uniqueCategories.size}</p>
        </div>
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Format & Standart</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">Sitemaps 0.9</p>
        </div>
      </div>

      {/* Canlı Alan Adı Ayarı */}
      <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Site Alan Adı (Base URL)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="https://l9zone.pages.dev"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <button
            onClick={() => setDomain(getSiteBaseUrl())}
            className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium border border-zinc-700/60 flex items-center gap-1.5"
            title="Varsayılan Alan Adına Sıfırla"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sıfırla</span>
          </button>
        </div>
        <p className="text-xs text-zinc-500">
          Google Search Console'da mülkünüz hangi adreste kayıtlıysa (ör. <code>https://l9zone.pages.dev</code> veya özel alan adınız), buraya o adresi girerek haritanızı güncelleyebilirsiniz.
        </p>
      </div>

      {/* Canlı XML Önizleme */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-semibold uppercase tracking-wider">XML Çıktı Önizlemesi ({totalUrls} bağlantı)</span>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 hover:underline"
          >
            <span>Tarayıcıda /sitemap.xml Görüntüle</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="relative">
          <pre className="bg-black/80 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-300 font-mono max-h-72 overflow-y-auto overflow-x-auto select-all scrollbar-thin scrollbar-thumb-zinc-700">
            {xmlContent}
          </pre>
        </div>
      </div>

      {/* Google Search Console Rehberi */}
      <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Google Search Console'a Nasıl Gönderilir?
        </h4>
        <ol className="text-xs text-zinc-300 space-y-1.5 list-decimal list-inside leading-relaxed">
          <li><strong>Google Search Console</strong> panelinizi açın ve doğruladığınız site mülkünü seçin.</li>
          <li>Sol menüdeki <strong>"Site Haritaları" (Sitemaps)</strong> sekmesine tıklayın.</li>
          <li>"Yeni bir site haritası ekleyin" alanına yalnızca <code>sitemap.xml</code> yazın ve <strong>"Gönder"</strong> butonuna basın.</li>
          <li>Google botları haritanızı okuyup içindeki tüm oyun ve programları indekslemeye başlayacaktır.</li>
        </ol>
      </div>
    </div>
  );
}
