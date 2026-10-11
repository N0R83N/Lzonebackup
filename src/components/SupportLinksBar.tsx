import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { SupportSettings, CustomSupportLink } from '../types';
import { PatreonIcon, KofiIcon, SupportIconRenderer } from './SupportIcons';
import { Heart, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

export const DEFAULT_SUPPORT_SETTINGS: SupportSettings = {
  patreonUrl: 'https://www.patreon.com',
  patreonEnabled: true,
  patreonLabel: "Patreon",
  kofiUrl: '',
  kofiEnabled: false,
  kofiLabel: "Ko-fi",
  customLinks: [],
  heading: 'Destek Ol',
  showOnHome: true,
};

export default function SupportLinksBar({ compact = false }: { compact?: boolean }) {
  const [settings, setSettings] = useState<SupportSettings>(DEFAULT_SUPPORT_SETTINGS);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'support'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<SupportSettings>;
        setSettings({
          patreonUrl: data.patreonUrl ?? DEFAULT_SUPPORT_SETTINGS.patreonUrl,
          patreonEnabled: data.patreonEnabled ?? DEFAULT_SUPPORT_SETTINGS.patreonEnabled,
          patreonLabel: data.patreonLabel ?? DEFAULT_SUPPORT_SETTINGS.patreonLabel,
          kofiUrl: data.kofiUrl ?? DEFAULT_SUPPORT_SETTINGS.kofiUrl,
          kofiEnabled: data.kofiEnabled ?? DEFAULT_SUPPORT_SETTINGS.kofiEnabled,
          kofiLabel: data.kofiLabel ?? DEFAULT_SUPPORT_SETTINGS.kofiLabel,
          customLinks: Array.isArray(data.customLinks) ? data.customLinks : [],
          heading: data.heading ?? DEFAULT_SUPPORT_SETTINGS.heading,
          showOnHome: data.showOnHome ?? DEFAULT_SUPPORT_SETTINGS.showOnHome,
        });
      } else {
        setSettings(DEFAULT_SUPPORT_SETTINGS);
      }
    });

    return () => unsub();
  }, []);

  const activeCustomLinks = settings.customLinks?.filter(l => l.enabled && l.url) || [];
  const hasPatreon = settings.patreonEnabled && !!settings.patreonUrl;
  const hasKofi = settings.kofiEnabled && !!settings.kofiUrl;
  const totalActive = (hasPatreon ? 1 : 0) + (hasKofi ? 1 : 0) + activeCustomLinks.length;

  if (totalActive === 0) {
    return null;
  }

  return (
    <div className={cn("relative flex items-center gap-2.5", compact ? "scale-90" : "")}>
      {/* Patreon Button */}
      {hasPatreon && (
        <a
          href={settings.patreonUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Patreon üzerinden projemize destek olun"
          className="group relative inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-zinc-950/90 hover:bg-[#FF424D]/10 border border-[#FF424D]/40 hover:border-[#FF424D] text-zinc-200 hover:text-white transition-all duration-200 shadow-md shadow-black/40 hover:shadow-[#FF424D]/20"
        >
          <span className="w-5 h-5 rounded-md bg-[#FF424D] text-white flex items-center justify-center p-0.5 group-hover:scale-110 transition-transform">
            <PatreonIcon className="w-3.5 h-3.5 fill-white" />
          </span>
          <span className="text-xs font-semibold tracking-wide">
            {settings.patreonLabel || 'Patreon'}
          </span>
          <span className="hidden lg:inline text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#FF424D]/20 text-[#FF424D] border border-[#FF424D]/30">
            Destek
          </span>
        </a>
      )}

      {/* Ko-fi Button */}
      {hasKofi && (
        <a
          href={settings.kofiUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Ko-fi üzerinden kahve ısmarlayın"
          className="group relative inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-zinc-950/90 hover:bg-[#13C3FF]/10 border border-[#13C3FF]/40 hover:border-[#13C3FF] text-zinc-200 hover:text-white transition-all duration-200 shadow-md shadow-black/40 hover:shadow-[#13C3FF]/20"
        >
          <span className="w-5 h-5 rounded-md bg-[#13C3FF] text-white flex items-center justify-center p-0.5 group-hover:scale-110 transition-transform">
            <KofiIcon className="w-3.5 h-3.5 fill-white" />
          </span>
          <span className="text-xs font-semibold tracking-wide">
            {settings.kofiLabel || 'Ko-fi'}
          </span>
        </a>
      )}

      {/* Custom Support Links (Direct if 1-2, or dropdown if more) */}
      {activeCustomLinks.length > 0 && activeCustomLinks.length <= 2 && (
        activeCustomLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${link.title} ile destek olun`}
            style={{
              borderColor: link.color ? `${link.color}66` : undefined,
            }}
            className="group relative inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white transition-all duration-200 shadow-md shadow-black/40"
          >
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center p-0.5 group-hover:scale-110 transition-transform text-white"
              style={{ backgroundColor: link.color || '#3b82f6' }}
            >
              <SupportIconRenderer icon={link.icon} className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="text-xs font-semibold tracking-wide">{link.title}</span>
          </a>
        ))
      )}

      {/* Dropdown for 3+ custom links or multiple options */}
      {activeCustomLinks.length > 2 && (
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Diğer Destekler ({activeCustomLinks.length})</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform", dropdownOpen && "rotate-180")} />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-800 mb-1">
                Destek Seçenekleri
              </div>
              {activeCustomLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center p-0.5 text-white"
                    style={{ backgroundColor: link.color || '#3b82f6' }}
                  >
                    <SupportIconRenderer icon={link.icon} className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span className="font-medium">{link.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
