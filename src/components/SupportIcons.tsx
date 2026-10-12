import React from 'react';
import { Heart, Gift, Coffee, DollarSign, ExternalLink, Globe } from 'lucide-react';
import { SupportIconType } from '../types';

export function PatreonIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M15.386.562a8.053 8.053 0 0 0-8.053 8.053c0 4.43 3.623 8.053 8.053 8.053a8.053 8.053 0 0 0 8.053-8.053A8.053 8.053 0 0 0 15.386.562zM.562 23.438h4.529V.562H.562v22.876z" />
    </svg>
  );
}

export function KofiIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267.023 11.966-.049c2.438-.426 2.683-2.566 2.683-2.566 3.874.142 6.626-4.004 6.626-7.084zm-6.581 5.304c-.389 1.48-1.528 1.637-1.528 1.637H3.456c-.958-.198-.958-1.393-.958-1.393s.023-4.707.023-7.534c0-.992.834-1.042.834-1.042h11.921c1.282.025 1.54 1.144 1.54 1.144s.87 4.148.484 7.188zm4.498-2.613c-.347 1.408-1.408 1.748-1.928 1.78-.184-1.442-.628-3.92-.816-4.853.473-.023 1.656-.05 2.217.781.428.636.721 1.61.527 2.292z" />
      <path d="M11.66 9.87c-.51-.6-1.42-.66-1.99-.12-.55.53-.55 1.42-.02 1.97l1.79 1.83 1.8-1.83c.53-.55.53-1.44-.02-1.97-.57-.54-1.48-.48-1.99.12h.43z" />
    </svg>
  );
}

export function DiscordIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function TwitterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function MastodonIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.244 15.15 0 12.001 0c-3.15 0-5.51.244-5.964.309C3.35 1.114 1.083 3.146.733 5.724.385 8.287.35 11.353.35 12.285c0 3.25.176 6.495.733 8.04.557 1.545 2.186 2.87 3.82 3.393 2.18.697 4.606.726 7.098.577 2.052-.123 4.103-.526 5.656-1.579a.747.747 0 0 0 .285-.595v-1.748a.747.747 0 0 0-.965-.717 14.54 14.54 0 0 1-3.958.544c-2.316 0-4.887-.234-5.293-2.65-.044-.26-.06-.525-.06-.793.578.14 1.173.243 1.782.308 1.488.16 2.99.102 4.475-.052 2.652-.275 5.253-1.076 6.78-3.082 1.442-1.896 1.838-4.707 1.838-8.17 0-.932-.034-3.998-.382-6.562zm-4.707 9.873h-2.527v-6.38c0-1.344-.564-2.025-1.691-2.025-1.245 0-1.868.804-1.868 2.414v3.504h-2.518V9.195c0-1.61-.623-2.414-1.868-2.414-1.127 0-1.691.681-1.691 2.025v6.38H3.87V8.974c0-1.344.346-2.414 1.037-3.21.691-.796 1.597-1.194 2.718-1.194 1.298 0 2.274.498 2.928 1.494L12 7.82l1.447-1.756c.654-.996 1.63-1.494 2.928-1.494 1.12 0 2.027.398 2.718 1.194.691.796 1.037 1.866 1.037 3.21v6.212z" />
    </svg>
  );
}

export function MatrixIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M.632.55v22.9h2.284v-.96H1.593V1.51h1.323V.55H.632zm22.736 0h-2.284v.96h1.323v20.98h-1.323v.96h2.284V.55zm-14.77 6.13c-.93 0-1.71.4-2.18 1.13v-.98H4.25v9.85h2.16v-5.2c0-1.23.82-2.04 1.95-2.04 1.11 0 1.84.77 1.84 2.04v5.2h2.17v-5.2c0-1.23.83-2.04 1.95-2.04 1.11 0 1.84.77 1.84 2.04v5.2h2.17v-5.46c0-2.45-1.34-3.82-3.32-3.82-1.33 0-2.34.64-2.88 1.67-.5-.98-1.48-1.67-2.73-1.67z" />
    </svg>
  );
}

export function TelegramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

export function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function RedditIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.703zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

export function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function TwitchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  );
}

export function SteamIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.979 0C5.641 0 .459 4.935.034 11.161l5.58 2.298a3.738 3.738 0 0 1 2.441-1.037c.189 0 .373.016.554.045l2.673-3.874a4.484 4.484 0 0 1-.036-.554c0-2.482 2.016-4.498 4.497-4.498s4.498 2.016 4.498 4.498-2.016 4.498-4.498 4.498a4.44 4.44 0 0 1-1.782-.373l-3.834 2.709c.03.208.048.421.048.638 0 2.067-1.68 3.747-3.747 3.747-1.79 0-3.29-1.258-3.66-2.924L.272 15.114C1.72 20.301 6.402 24 11.979 24c6.627 0 12-5.373 12-12S18.606 0 11.979 0z" />
    </svg>
  );
}

export interface PlatformPreset {
  id: SupportIconType;
  label: string;
  defaultTitle: string;
  defaultColor: string;
  placeholderUrl: string;
  badge?: string;
}

export const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: 'discord',
    label: 'Discord',
    defaultTitle: 'Discord Sunucumuz',
    defaultColor: '#5865F2',
    placeholderUrl: 'https://discord.gg/davet-kodu',
    badge: 'Topluluk',
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    defaultTitle: 'Twitter (X)',
    defaultColor: '#000000',
    placeholderUrl: 'https://x.com/kullanici_adiniz',
    badge: 'Sosyal',
  },
  {
    id: 'mastodon',
    label: 'Mastodon',
    defaultTitle: 'Mastodon',
    defaultColor: '#6364FF',
    placeholderUrl: 'https://mastodon.social/@kullanici_adiniz',
    badge: 'Fediverse',
  },
  {
    id: 'matrix',
    label: 'Matrix',
    defaultTitle: 'Matrix Odası',
    defaultColor: '#0DBD8B',
    placeholderUrl: 'https://matrix.to/#/#oda-adi:matrix.org',
    badge: 'Şifreli Sohbet',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    defaultTitle: 'Telegram Kanalı',
    defaultColor: '#229ED9',
    placeholderUrl: 'https://t.me/kanal_adiniz',
    badge: 'Topluluk',
  },
  {
    id: 'coffee',
    label: 'Buy Me a Coffee',
    defaultTitle: 'Buy Me a Coffee',
    defaultColor: '#FF813F',
    placeholderUrl: 'https://buymeacoffee.com/kullanici_adiniz',
    badge: 'Destek',
  },
  {
    id: 'github',
    label: 'GitHub',
    defaultTitle: 'GitHub Projemiz',
    defaultColor: '#24292e',
    placeholderUrl: 'https://github.com/kullanici_adiniz',
    badge: 'Açık Kaynak',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    defaultTitle: 'YouTube Kanalı',
    defaultColor: '#FF0000',
    placeholderUrl: 'https://youtube.com/@kanal_adiniz',
    badge: 'Video',
  },
  {
    id: 'twitch',
    label: 'Twitch',
    defaultTitle: 'Twitch Yayını',
    defaultColor: '#9146FF',
    placeholderUrl: 'https://twitch.tv/kanal_adiniz',
    badge: 'Canlı Yayın',
  },
  {
    id: 'reddit',
    label: 'Reddit',
    defaultTitle: 'Reddit Topluluğu',
    defaultColor: '#FF4500',
    placeholderUrl: 'https://reddit.com/r/topluluk_adi',
    badge: 'Topluluk',
  },
  {
    id: 'steam',
    label: 'Steam',
    defaultTitle: 'Steam Grubu',
    defaultColor: '#171a21',
    placeholderUrl: 'https://steamcommunity.com/groups/grup_adiniz',
    badge: 'Oyun',
  },
  {
    id: 'kofi',
    label: 'Ko-fi',
    defaultTitle: 'Ko-fi Destek',
    defaultColor: '#13C3FF',
    placeholderUrl: 'https://ko-fi.com/kullanici_adiniz',
    badge: 'Destek',
  },
  {
    id: 'patreon',
    label: 'Patreon',
    defaultTitle: 'Patreon',
    defaultColor: '#FF424D',
    placeholderUrl: 'https://patreon.com/kullanici_adiniz',
    badge: 'Abonelik',
  },
  {
    id: 'heart',
    label: 'Bağış / Kalp',
    defaultTitle: 'Bize Destek Ol',
    defaultColor: '#F43F5E',
    placeholderUrl: 'https://...',
    badge: 'Genel',
  },
  {
    id: 'dollar',
    label: 'Kripto / Para',
    defaultTitle: 'Bağış Yap',
    defaultColor: '#10B981',
    placeholderUrl: 'https://...',
    badge: 'Finans',
  },
  {
    id: 'globe',
    label: 'Web Sitesi',
    defaultTitle: 'Resmi Web Sitemiz',
    defaultColor: '#0EA5E9',
    placeholderUrl: 'https://...',
    badge: 'Bağlantı',
  },
  {
    id: 'link',
    label: 'Özel Bağlantı',
    defaultTitle: 'Harici Bağlantı',
    defaultColor: '#3B82F6',
    placeholderUrl: 'https://...',
    badge: 'Özel',
  },
];

export function SupportIconRenderer({
  icon,
  className = "w-4 h-4",
}: {
  icon: SupportIconType;
  className?: string;
}) {
  switch (icon) {
    case 'discord':
      return <DiscordIcon className={className} />;
    case 'twitter':
      return <TwitterIcon className={className} />;
    case 'mastodon':
      return <MastodonIcon className={className} />;
    case 'matrix':
      return <MatrixIcon className={className} />;
    case 'telegram':
      return <TelegramIcon className={className} />;
    case 'github':
      return <GithubIcon className={className} />;
    case 'reddit':
      return <RedditIcon className={className} />;
    case 'youtube':
      return <YoutubeIcon className={className} />;
    case 'twitch':
      return <TwitchIcon className={className} />;
    case 'steam':
      return <SteamIcon className={className} />;
    case 'patreon':
      return <PatreonIcon className={className} />;
    case 'kofi':
      return <KofiIcon className={className} />;
    case 'coffee':
      return <Coffee className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'gift':
      return <Gift className={className} />;
    case 'dollar':
      return <DollarSign className={className} />;
    case 'globe':
      return <Globe className={className} />;
    case 'link':
    default:
      return <ExternalLink className={className} />;
  }
}
