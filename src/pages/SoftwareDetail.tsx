import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, Timestamp, deleteDoc } from 'firebase/firestore';
import { Software, Comment } from '../types';
import ReactMarkdown from 'react-markdown';
import { Calendar, Tag, Download, ArrowLeft, ShieldCheck, Layers, MessageSquare, User, Send, Trash2, Reply, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';

const BANNED_WORDS = ['küfür1', 'küfür2', 'küfür3']; // Örnek küfür listesi, gerçek hayatta daha kapsamlı olmalı

export default function SoftwareDetail() {
  const { id } = useParams<{ id: string }>();
  const [software, setSoftware] = useState<Software | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const moderateContent = (text: string) => {
    // Küfür temizleme
    let moderated = text;
    BANNED_WORDS.forEach(word => {
      const regex = new RegExp(word, 'gi');
      moderated = moderated.replace(regex, '***');
    });

    // Link kontrolü
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(moderated)) {
      return null; // Link varsa null döner, mesaj silinecek
    }

    return moderated;
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        } else if (user.email === 'nijatemiraslanov@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchSoftware = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'software', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSoftware({ id: docSnap.id, ...docSnap.data() } as Software);
        }
      } catch (error) {
        console.error("Error fetching software:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSoftware();

    if (id) {
      const commentsQuery = query(
        collection(db, 'software', id, 'comments'),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
      });
      return unsubscribe;
    }
  }, [id]);

  /* ─── Dinamik SEO ve Schema.org JSON-LD Güncellemesi ─── */
  useEffect(() => {
    if (!software) return;
    const previousTitle = document.title;
    document.title = `${software.title} İndir – L9Zone`;

    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.getAttribute('content') || '';
    const cleanDesc = software.description.replace(/[#*`_\[\]]/g, '').slice(0, 150).trim();
    if (metaDesc) {
      metaDesc.setAttribute('content', `${software.title} hakkında detaylar ve indirme bağlantıları. ${cleanDesc}... L9Zone'da keşfedin.`);
    }

    const scriptId = 'software-json-ld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: software.title,
      description: cleanDesc,
      applicationCategory: software.category || 'SoftwareApplication',
      operatingSystem: 'Windows, macOS, Linux, Android',
      softwareVersion: software.version || 'Son Sürüm',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'TRY',
      },
    });

    return () => {
      document.title = previousTitle;
      if (metaDesc && prevDesc) {
        metaDesc.setAttribute('content', prevDesc);
      }
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
    };
  }, [software]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !nickname || !commentContent || submitting) return;

    const moderated = moderateContent(commentContent);
    if (moderated === null) {
      alert("Yorumunuzda bağlantı (link) tespit edildiği için gönderilemedi.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'software', id, 'comments'), {
        nickname,
        content: moderated,
        createdAt: Timestamp.now(),
        parentId: replyTo?.id || null
      });
      setCommentContent('');
      setReplyTo(null);
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Yorum eklenirken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (!id) return;
    
    const now = Date.now();
    const commentTime = comment.createdAt.toMillis();
    const diffMinutes = (now - commentTime) / (1000 * 60);

    if (!isAdmin && diffMinutes > 30) {
      setDeletingId(null);
      return;
    }

    try {
      await deleteDoc(doc(db, 'software', id, 'comments', comment.id));
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!software) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-4xl font-bold mb-4">İçerik Bulunamadı</h1>
        <p className="text-zinc-500 mb-8 text-center">Aradığınız içerik mevcut değil veya silinmiş olabilir.</p>
        <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all">
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Hero Header */}
      <div className="relative h-[40vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={software.mediaType === 'youtube' ? `https://img.youtube.com/vi/${getYoutubeId(software.mediaUrl)}/maxresdefault.jpg` : software.mediaUrl}
            alt={software.title}
            className="w-full h-full object-cover opacity-40 blur-sm scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative flex flex-col justify-end pb-12">
          <Link to="/" className="inline-flex items-center space-x-2 text-zinc-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Geri Dön</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {software.category && (
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {software.category}
              </span>
            )}
            {software.isPremium && (
              <span className="bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Premium</span>
              </span>
            )}
            {software.version && (
              <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1 rounded-full border border-zinc-700">
                {software.version}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
            {software.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-zinc-400 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{software.createdAt.toDate().toLocaleDateString('tr-TR')}</span>
            </div>
            {software.tags && software.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-blue-500" />
                <div className="flex gap-2">
                  {software.tags.map(tag => (
                    <span key={tag} className="hover:text-white transition-colors">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Media Display */}
            <div className="rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
              {software.mediaType === 'youtube' ? (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(software.mediaUrl)}`}
                    title={software.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={software.mediaUrl}
                  alt={software.title}
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            {/* Special Note */}
            {software.specialNote && (
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-3xl p-6 flex items-start space-x-4">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-1">Admin Notu</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed">{software.specialNote}</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Hakkında</h2>
              <div className="prose prose-invert prose-blue max-w-none">
                <ReactMarkdown>{software.description}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide pb-10">
            {/* Actions Window */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-6">Eylemler</h3>
              
              <div className="space-y-4">
                {software.downloadUrl && (
                  <a
                    href={software.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/20"
                  >
                    <Download className="w-5 h-5" />
                    <span>Hemen İndir</span>
                  </a>
                )}

                {software.downloadUrl2 && (
                  <a
                    href={software.downloadUrl2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Alternatif İndir</span>
                  </a>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-800">
                <p className="text-zinc-500 text-[10px] leading-relaxed">
                  Bu içerik L9zone topluluğu için paylaşılmıştır. İndirme ve kullanım sorumluluğu kullanıcıya aittir.
                </p>
              </div>
            </div>

            {/* Comments Window */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  <span>Yorumlar ({comments.length})</span>
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleAddComment} className="bg-black/50 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  {replyTo && (
                    <div className="flex items-center justify-between bg-blue-900/20 border border-blue-900/30 px-3 py-2 rounded-lg mb-2">
                      <span className="text-[10px] text-blue-400 font-medium">
                        {replyTo.nickname} kullanıcısına yanıt veriliyor
                      </span>
                      <button type="button" onClick={() => setReplyTo(null)} className="text-blue-400 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Nick"
                      maxLength={30}
                      className="w-full bg-black border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <textarea
                    required
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Mesajınız..."
                    maxLength={500}
                    rows={2}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none transition-all resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3 h-3" />
                    <span>{submitting ? '...' : 'Gönder'}</span>
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {comments.filter(c => !c.parentId).map((comment) => (
                      <div key={comment.id} className="space-y-3">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 relative group"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-blue-400 text-xs">{comment.nickname}</span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setReplyTo(comment)}
                                className="text-zinc-600 hover:text-blue-500 transition-colors p-1"
                                title="Yanıtla"
                              >
                                <Reply className="w-3 h-3" />
                              </button>
                              {deletingId === comment.id ? (
                                <div className="flex items-center bg-red-600 rounded overflow-hidden">
                                  <button
                                    onClick={() => handleDeleteComment(comment)}
                                    className="px-2 py-1 text-[8px] font-bold text-white hover:bg-red-700 transition-colors"
                                  >
                                    SİL
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(null)}
                                    className="px-2 py-1 text-[8px] font-bold text-white/70 hover:bg-red-700 transition-colors border-l border-red-500"
                                  >
                                    İPTAL
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingId(comment.id)}
                                  className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                                  title="Sil"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-zinc-300 text-[11px] leading-relaxed break-words">
                            {comment.content}
                          </p>
                          <div className="mt-2 text-[9px] text-zinc-600">
                            {comment.createdAt.toDate().toLocaleString('tr-TR')}
                          </div>
                        </motion.div>

                        {/* Replies */}
                        {comments.filter(r => r.parentId === comment.id).map(reply => (
                          <motion.div
                            key={reply.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="ml-6 bg-zinc-900/20 border-l-2 border-blue-600/30 rounded-r-xl p-3 relative group"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-zinc-400 text-[10px]">{reply.nickname}</span>
                              {deletingId === reply.id ? (
                                <div className="flex items-center bg-red-600 rounded overflow-hidden">
                                  <button
                                    onClick={() => handleDeleteComment(reply)}
                                    className="px-1.5 py-0.5 text-[7px] font-bold text-white hover:bg-red-700 transition-colors"
                                  >
                                    SİL
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(null)}
                                    className="px-1.5 py-0.5 text-[7px] font-bold text-white/70 hover:bg-red-700 transition-colors border-l border-red-500"
                                  >
                                    X
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingId(reply.id)}
                                  className="text-zinc-700 hover:text-red-500 transition-colors p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-zinc-400 text-[10px] leading-relaxed break-words">
                              {reply.content}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
