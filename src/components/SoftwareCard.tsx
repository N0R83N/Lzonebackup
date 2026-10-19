import React from 'react';
import { Link } from 'react-router-dom';
import { Software } from '../types';
import ReactMarkdown from 'react-markdown';
import { ExternalLink, PlayCircle, Calendar, ShieldCheck, Video, Images } from 'lucide-react';
import { getYoutubeId } from '../lib/utils';

interface SoftwareCardProps {
  software: Software;
}

export default function SoftwareCard({ software }: SoftwareCardProps) {
  const getCardImage = () => {
    if (software.coverImage) return software.coverImage;
    const ytUrl = software.youtubeUrl || (software.mediaType === 'youtube' ? software.mediaUrl : null);
    if (ytUrl) {
      const id = getYoutubeId(ytUrl);
      if (id) return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }
    return software.mediaUrl || 'https://placehold.co/600x400/18181b/71717a?text=L9zone';
  };

  const hasVideo = Boolean(software.youtubeUrl || software.mediaType === 'youtube' || software.mediaType === 'both');
  const galleryCount = software.galleryImages?.length || 0;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group flex flex-col h-full">
      <Link to={`/software/${software.id}`} className="aspect-video relative overflow-hidden bg-black block">
        <img
          src={getCardImage()}
          alt={software.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            const ytUrl = software.youtubeUrl || software.mediaUrl;
            const id = getYoutubeId(ytUrl);
            if (id && !img.src.includes('hqdefault')) {
              img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
            } else {
              img.src = 'https://placehold.co/600x400/18181b/71717a?text=L9zone';
            }
          }}
        />

        {/* Video Play Butonu (Sadece video olan veya öne çıkarılmış videolarda) */}
        {hasVideo && !software.coverImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-14 h-14 bg-red-600/90 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-xl shadow-red-600/30">
              <PlayCircle className="w-7 h-7" />
            </div>
          </div>
        )}

        {/* Video Rozeti */}
        {hasVideo && software.coverImage && (
          <div className="absolute bottom-3 right-3 bg-red-600/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-lg shadow-black/60">
            <Video className="w-3 h-3" />
            <span>VİDEO</span>
          </div>
        )}

        {/* Galeri Rozeti */}
        {galleryCount > 0 && (
          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 border border-zinc-700/60 shadow-lg">
            <Images className="w-3 h-3 text-emerald-400" />
            <span>+{galleryCount} Resim</span>
          </div>
        )}
        
        {software.isPremium && (
          <div className="absolute top-3 right-3 bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg">
            <ShieldCheck className="w-3 h-3" />
            <span>PREMIUM</span>
          </div>
        )}
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <Link to={`/software/${software.id}`}>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
              {software.title}
            </h3>
          </Link>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 font-mono">
              {software.createdAt.toDate().toLocaleDateString('tr-TR')}
            </span>
            {software.version && (
              <span className="text-[10px] font-bold text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full mt-1">
                {software.version}
              </span>
            )}
          </div>
        </div>

        <div className="text-zinc-400 text-sm line-clamp-3 mb-6 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{software.description}</ReactMarkdown>
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center">
          <div className="flex gap-2">
            {software.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] text-zinc-600">#{tag}</span>
            ))}
          </div>
          <Link
            to={`/software/${software.id}`}
            className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 text-sm font-medium"
          >
            <span>İncele</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
