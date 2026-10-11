import React, { useState } from 'react';
import { Software, Category } from '../types';
import { generateSitemapXml, downloadSitemapFile, getSiteBaseUrl } from '../utils/sitemapGenerator';
import {
  FileCode, Download, Copy, Check, ExternalLink, Globe,
  Sparkles, RefreshCw, Layers, CheckCircle2, AlertCircle, Search, Info
} from 'lucide-react';

interface SitemapManagerProps {
  softwares: Software[];
  categories: Category[];
}

export default function SitemapManager({ softwares, categories }: SitemapManagerProps) {
  const [domain, setDomain] = useState(() => getSiteBaseUrl());
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'preview' | 'list'>('list');

  const xmlContent = generateSitemapXml(softwares, categories, domain);

  // Toplam URL hesaplama (Ana Sayfa + Kategoriler + Alt Kategoriler + Yazılımlar)
  const uniqueCategories = new Set<string>();
  let subcategoryCount = 0;
  categories.forEach(c => {
    uniqueCategories.add(c.name);
    if (Array.isArray(c.subcategories)) {
      subcategoryCount += c.subcategories.length;
    }
  });
  softwares.forEach(s => {
    if (s.category && !uniqueCategories.has(s.category)) {
      uniqueCategories.add(s.category);
    }
  });
  const totalUrls = 1 + uniqueCategories.size + subcategoryCount + softwares.length;

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

  const filteredSoftwares = softwares.filter(sw =>
    sw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sw.category && sw.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                  Google SEO & İndeksleme
                </span>
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                Google Search Console ve botların sitenizdeki her oyunu, programı ve kategoriyi dizine eklemesi için otomatik XML haritası.
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

      {/* Bilgilendirme Kutusu: Neden önceki harita içerikleri görmüyordu? */}
      <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/30 border border-blue-500/30 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2.5 text-blue-300 font-semibold text-sm">
          <Info className="w-5 h-5 text-blue-400 shrink-0" />
          <span>Neden Önceki Sitemap İçerikleri Okuyamıyordu ve Nasıl Çözüldü?</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Siteniz modern bir React Tek Sayfa Uygulamasıdır (SPA) ve paylaştığınız içerikler doğrudan <strong>Google Firebase Firestore</strong> veritabanına kaydedilir. Ancak sunucudaki <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">/public/sitemap.xml</code> dosyası ilk oluşturulduğunda statik bir şablon olduğundan, veritabanına sonradan eklediğiniz içerikler bu dosyada yer almıyordu.
        </p>
        <p className="text-xs text-emerald-300/90 leading-relaxed">
          ✔ <strong>Çözüldü:</strong> Artık veritabanınızdaki tüm <strong>{softwares.length} oyun ve program</strong>, <strong>{uniqueCategories.size} ana kategori</strong> ve <strong>{subcategoryCount} alt kategori</strong> (toplam <strong>{totalUrls} URL</strong>) otomatik olarak taranıp <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">sitemap.xml</code> içine aktarılmıştır.
        </p>
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
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Taranan Toplam URL</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{totalUrls}</p>
        </div>
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">İçerikler (Oyun/Yazılım)</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{softwares.length}</p>
        </div>
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Kategori & Alt Kategori</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{uniqueCategories.size + subcategoryCount}</p>
        </div>
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Protokol</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">Sitemaps 0.9</p>
        </div>
      </div>

      {/* Canlı Alan Adı Ayarı */}
      <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Site Alan Adı (Base URL)
          </label>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Canlı /sitemap.xml Dosyasını Tarayıcıda Aç</span>
          </a>
        </div>
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
          Google Search Console'da kayıtlı olan alan adınızı girerek sitemap içindeki bağlantı kökünü tek tıkla değiştirebilirsiniz.
        </p>
      </div>

      {/* Görünüm Seçimi & Liste */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveView('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeView === 'list'
                  ? 'bg-amber-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Haritadaki İçerikler Listesi ({softwares.length})
            </button>
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeView === 'preview'
                  ? 'bg-amber-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ham XML Kodu ({totalUrls} URL)
            </button>
          </div>

          {activeView === 'list' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="İçeriklerde ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 w-48"
              />
            </div>
          )}
        </div>

        {activeView === 'list' ? (
          <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/60 divide-y divide-zinc-800/80">
            {filteredSoftwares.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-500">
                Aramanızla eşleşen içerik bulunamadı.
              </div>
            ) : (
              filteredSoftwares.map((sw) => {
                const sitemapUrl = `${domain.replace(/\/+$/, '')}/software/${sw.id}`;
                return (
                  <div key={sw.id} className="p-3.5 sm:p-4 hover:bg-zinc-900/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate max-w-md">
                          {sw.title}
                        </span>
                        {sw.isFeatured && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                            Öne Çıkan (Öncelik: 0.9)
                          </span>
                        )}
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                          {sw.category || 'Genel'}
                        </span>
                        {sw.subcategory && (
                          <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full">
                            {sw.subcategory}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 truncate">
                        <span className="text-zinc-600">URL:</span>
                        <span className="text-amber-400/90">{sitemapUrl}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`/software/${sw.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700/60 flex items-center gap-1 transition-all"
                      >
                        <span>Sayfayı Aç</span>
                        <ExternalLink className="w-3 h-3 text-zinc-400" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="relative">
            <pre className="bg-black/90 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-300 font-mono max-h-80 overflow-y-auto overflow-x-auto select-all scrollbar-thin scrollbar-thumb-zinc-700">
              {xmlContent}
            </pre>
          </div>
        )}
      </div>

      {/* Google Search Console Rehberi */}
      <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Google Search Console'a Nasıl Gönderilir?
        </h4>
        <ol className="text-xs text-zinc-300 space-y-1.5 list-decimal list-inside leading-relaxed">
          <li><strong>Google Search Console</strong> mülkünüze gidin.</li>
          <li>Sol menüdeki <strong>"Site Haritaları" (Sitemaps)</strong> sekmesine tıklayın.</li>
          <li>Kutuya yalnızca <code>sitemap.xml</code> yazın ve <strong>"Gönder"</strong> butonuna basın.</li>
          <li>Google botları haritanızı okuyup içindeki tüm <strong>{softwares.length} oyunu, yazılımı ve kategorileri</strong> dizine ekleyecektir.</li>
        </ol>
      </div>
    </div>
  );
}
