import React from 'react';
import { Link } from 'react-router-dom';
import { Software } from '../types';
import ReactMarkdown from 'react-markdown';
import { ExternalLink, PlayCircle, Calendar, ShieldCheck } from 'lucide-react';

interface SoftwareCardProps {
  software: Software;
}

export default function SoftwareCard({ software }: SoftwareCardProps) {
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group flex flex-col h-full">
      <Link to={`/software/${software.id}`} className="aspect-video relative overflow-hidden bg-black block">
        {software.mediaType === 'youtube' ? (
          <div className="w-full h-full relative">
            <img
              src={`https://img.youtube.com/vi/${getYoutubeId(software.mediaUrl)}/maxresdefault.jpg`}
              alt={software.title}
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-600/90 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-xl shadow-blue-600/20">
                <PlayCircle className="w-8 h-8" />
              </div>
            </div>
          </div>
        ) : (
          <img
            src={software.mediaUrl}
            alt={software.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        )}
        
        {software.isPremium && (
          <div className="absolute top-4 right-4 bg-amber-500 text-black text-[10px] font-bold px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg">
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
