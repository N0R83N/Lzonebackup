import React from 'react';
import { Heart, Gift, Coffee, DollarSign, ExternalLink } from 'lucide-react';
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

export function SupportIconRenderer({
  icon,
  className = "w-4 h-4",
}: {
  icon: SupportIconType;
  className?: string;
}) {
  switch (icon) {
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
    case 'link':
    default:
      return <ExternalLink className={className} />;
  }
}
