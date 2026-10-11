import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { Software } from '../types';
import SoftwareCard from '../components/SoftwareCard';
import { Sparkles, Terminal, Cpu, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [featuredSoftwares, setFeaturedSoftwares] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const categoryFilter = searchParams.get('category');
  const subcategoryFilter = searchParams.get('subcategory');
  const searchQuery = searchParams.get('search')?.toLowerCase();

  useEffect(() => {
    let q = query(collection(db, 'software'), orderBy('createdAt', 'desc'));

    if (categoryFilter) {
      q = query(q, where('category', '==', categoryFilter));
    }
    if (subcategoryFilter) {
      q = query(q, where('subcategory', '==', subcategoryFilter));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Software));
      
      // Client-side search filtering for "sensitive and character-aware" search
      if (searchQuery) {
        data = data.filter(sw => 
          sw.title.toLowerCase().includes(searchQuery) ||
          sw.description.toLowerCase().includes(searchQuery) ||
          sw.tags?.some(tag => tag.toLowerCase().includes(searchQuery)) ||
          sw.category?.toLowerCase().includes(searchQuery) ||
          sw.subcategory?.toLowerCase().includes(searchQuery)
        );
      }

      setSoftwares(data);
      setFeaturedSoftwares(data.filter(sw => sw.isFeatured));
      setLoading(false);
    });

    return unsubscribe;
  }, [categoryFilter, subcategoryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Spotlight Bar */}
      {!searchQuery && (
        <section className="relative py-12 overflow-hidden border-b border-zinc-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1d4ed822,transparent_60%)]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex items-center space-x-2 mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight uppercase">Öne Çıkanlar</h2>
            </div>

            <div className="flex overflow-x-auto pb-8 space-x-6 scrollbar-hide snap-x">
              {featuredSoftwares.map((sw) => (
                <motion.div
                  key={sw.id}
                  className="flex-shrink-0 w-[300px] md:w-[400px] snap-start"
                  whileHover={{ y: -5 }}
                >
                  <Link to={`/software/${sw.id}`} className="block group">
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 group-hover:border-blue-500/50 transition-all">
                      <img
                        src={sw.mediaUrl}
                        alt={sw.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        {sw.category && (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {sw.category}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-0 p-6">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                          {sw.title}
                        </h3>
                        <p className="text-zinc-400 text-xs line-clamp-1">
                          {sw.description.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {!loading && featuredSoftwares.length === 0 && (
                <div className="w-full py-12 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                  <p className="text-zinc-500 text-sm italic">Henüz öne çıkarılan bir içerik yok.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center space-x-3">
              <span>
                {searchQuery 
                  ? `"${searchParams.get('search')}" için sonuçlar`
                  : categoryFilter 
                    ? `${categoryFilter}${subcategoryFilter ? ` > ${subcategoryFilter}` : ''}` 
                    : 'Son Paylaşımlar'}
              </span>
            </h2>
            <p className="text-zinc-500 mt-2">
              {searchQuery 
                ? `${softwares.length} içerik bulundu`
                : categoryFilter 
                  ? `${categoryFilter} kategorisindeki içerikler` 
                  : 'Topluluğumuz için seçilen en yeni içerikler'}
            </p>
          </div>
          {(categoryFilter || searchQuery) && (
            <Link to="/" className="text-sm text-blue-400 hover:text-blue-300 transition-colors bg-blue-900/10 px-4 py-2 rounded-xl border border-blue-900/20">
              {searchQuery ? 'Aramayı Temizle' : 'Filtreyi Kaldır'}
            </Link>
          )}
          <div className="h-px flex-grow mx-8 bg-zinc-900 hidden md:block" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl h-[450px] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {softwares.map((sw, index) => (
              <motion.div
                key={sw.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <SoftwareCard software={sw} />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && softwares.length === 0 && (
          <div className="text-center py-32 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2rem]">
            <p className="text-zinc-500 text-lg">Henüz paylaşılan bir içerik bulunmuyor.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-6 h-6 bg-[#fc1515] rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tighter flex items-baseline">
              L9<span className="text-xl ml-0.5">Z</span>one
            </span>
          </div>
          <p className="text-zinc-600 text-sm">
            © 2026 L9Zone. Tüm hakları saklıdır. <br />
            Tasarlayan: <a href="https://github.com/N0R83N" target="_blank" rel="noopener noreferrer" className="text-blue-500/50 hover:text-blue-500 transition-colors">N0R83N</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
