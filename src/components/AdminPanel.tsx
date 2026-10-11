import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import {
  collection, addDoc, query, orderBy, onSnapshot,
  deleteDoc, doc, Timestamp, updateDoc, getDoc, setDoc,
} from 'firebase/firestore';
import { Software, MediaType, Category, UserRole, UserProfile, SupportSettings, CustomSupportLink, SupportIconType } from '../types';
import {
  Plus, Trash2, Video, Image as ImageIcon, AlertCircle, CheckCircle2,
  Layers, Bold, Italic, Heading1, Heading2, List, Link2, Quote, Info,
  Edit2, X as CloseIcon, Users, Shield, Crown, Search, UserCheck,
  Heart, Gift, Coffee, DollarSign, ExternalLink, Link as LinkIcon, Sparkles, Check, Globe, Activity,
} from 'lucide-react';
import { PatreonIcon, KofiIcon, SupportIconRenderer } from './SupportIcons';
import { DEFAULT_SUPPORT_SETTINGS } from './SupportLinksBar';
import { DEFAULT_CATEGORIES } from '../lib/categories';
import { cn } from '../lib/utils';
import VisitorAnalytics from './VisitorAnalytics';

type ActiveTab = 'content' | 'categories' | 'users' | 'support' | 'analytics';

/* ─── Rol badge renkleri ─── */
const roleMeta: Record<UserRole, { label: string; color: string; icon: React.ReactNode }> = {
  admin:     { label: 'Admin',     color: 'bg-blue-600/20 text-blue-300 border-blue-600/30',   icon: <Crown className="w-3 h-3" /> },
  moderator: { label: 'Moderatör', color: 'bg-purple-600/20 text-purple-300 border-purple-600/30', icon: <Shield className="w-3 h-3" /> },
  user:      { label: 'Üye',       color: 'bg-zinc-800 text-zinc-400 border-zinc-700',          icon: <UserCheck className="w-3 h-3" /> },
};

export default function AdminPanel() {
  /* ─── Aktif sekme ─── */
  const [activeTab, setActiveTab] = useState<ActiveTab>('content');

  /* ─── Mevcut kullanıcı rolü ─── */
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);

  /* ─── Yazılım form/list state ─── */
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [editingSoftwareId, setEditingSoftwareId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [specialNote, setSpecialNote] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [isFeatured, setIsFeatured] = useState(false);
  const [version, setVersion] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadUrl2, setDownloadUrl2] = useState('');
  const [tags, setTags] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  /* ─── Kategori state ─── */
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newSubCats, setNewSubCats] = useState('');
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  /* ─── Genel UI state ─── */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingSoftwareId, setDeletingSoftwareId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  /* ─── Kullanıcı yönetimi state ─── */
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userActionLoading, setUserActionLoading] = useState<string | null>(null);

  /* ─── Mevcut kullanıcı rolünü çek ─── */
  useEffect(() => {
    const fetchRole = async () => {
      if (!auth.currentUser) return;
      try {
        const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (snap.exists()) {
          setCurrentUserRole(snap.data().role as UserRole);
        } else if (auth.currentUser.email === 'nijatemiraslanov@gmail.com') {
          setCurrentUserRole('admin');
        }
      } catch (e) { console.error(e); }
    };
    fetchRole();
  }, []);

  /* ─── Yazılımlar & kategoriler subscription ─── */
  useEffect(() => {
    const q = query(collection(db, 'software'), orderBy('createdAt', 'desc'));
    const unsubSw = onSnapshot(q, snap => {
      setSoftwares(snap.docs.map(d => ({ id: d.id, ...d.data() } as Software)));
    });
    const catQ = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const unsubCat = onSnapshot(catQ, snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    });
    return () => { unsubSw(); unsubCat(); };
  }, []);

  /* ─── Kullanıcılar subscription (sadece admin) ─── */
  useEffect(() => {
    if (currentUserRole !== 'admin') return;
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    });
    return unsub;
  }, [currentUserRole]);

  /* ─── Destek Bağlantıları state ─── */
  const [supportSettings, setSupportSettings] = useState<SupportSettings>(DEFAULT_SUPPORT_SETTINGS);
  const [supportSaving, setSupportSaving] = useState(false);
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomUrl, setNewCustomUrl] = useState('');
  const [newCustomIcon, setNewCustomIcon] = useState<SupportIconType>('heart');
  const [newCustomColor, setNewCustomColor] = useState('#3b82f6');

  /* ─── Destek ayarları subscription ─── */
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'support'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<SupportSettings>;
        setSupportSettings({
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
      }
    });
    return unsub;
  }, []);

  /* ════════════════════════════════════════
     KATEGORİ HANDLER'LARI
  ════════════════════════════════════════ */
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    setLoading(true); setError(null);
    try {
      if (editingCat) {
        await updateDoc(doc(db, 'categories', editingCat.id), {
          name: newCatName,
          subcategories: newSubCats.split(',').map(s => s.trim()).filter(Boolean),
        });
        setSuccess('Kategori güncellendi!'); setEditingCat(null);
      } else {
        await addDoc(collection(db, 'categories'), {
          name: newCatName,
          subcategories: newSubCats.split(',').map(s => s.trim()).filter(Boolean),
          order: categories.length,
        });
        setSuccess('Kategori eklendi!');
      }
      setNewCatName(''); setNewSubCats('');
    } catch (err: any) { setError('Kategori hatası: ' + err.message); }
    finally { setLoading(false); }
  };

  const startEditCategory = (cat: Category) => {
    setEditingCat(cat); setNewCatName(cat.name);
    setNewSubCats(cat.subcategories.join(', '));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditCategory = () => { setEditingCat(null); setNewCatName(''); setNewSubCats(''); };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      setDeletingCategoryId(null); setSuccess('Kategori silindi!');
    } catch (err: any) { setError('Silme hatası: ' + err.message); }
  };

  const handleImportDefaultCategories = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      for (const defCat of DEFAULT_CATEGORIES) {
        const existing = categories.find(c => c.name.toLowerCase() === defCat.name.toLowerCase());
        if (existing) {
          const merged = Array.from(new Set([...existing.subcategories, ...defCat.subcategories]));
          await updateDoc(doc(db, 'categories', existing.id), {
            subcategories: merged,
          });
        } else {
          await addDoc(collection(db, 'categories'), {
            name: defCat.name,
            subcategories: defCat.subcategories,
            order: defCat.order,
          });
        }
      }
      setSuccess(`Oyun ve Program kategorileri başarıyla yüklendi! (${DEFAULT_CATEGORIES.length} ana kategori, 39 alt başlık senkronize edildi)`);
    } catch (err: any) {
      setError('Kategoriler yüklenirken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ════════════════════════════════════════
     YAZILIM HANDLER'LARI
  ════════════════════════════════════════ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true); setError(null); setSuccess(null);
    try {
      const payload = {
        title, description,
        specialNote: specialNote || null,
        mediaUrl, mediaType, isFeatured,
        version: version || null,
        category: category || null,
        subcategory: subcategory || null,
        downloadUrl: downloadUrl || null,
        downloadUrl2: downloadUrl2 || null,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        isPremium,
      };
      if (editingSoftwareId) {
        await updateDoc(doc(db, 'software', editingSoftwareId), payload);
        setSuccess('Yazılım başarıyla güncellendi!');
        setEditingSoftwareId(null);
      } else {
        await addDoc(collection(db, 'software'), {
          ...payload,
          createdAt: Timestamp.now(),
          authorUid: auth.currentUser.uid,
        });
        setSuccess('Yazılım başarıyla eklendi!');
      }
      resetSoftwareForm();
    } catch (err: any) { setError('Hata: ' + err.message); }
    finally { setLoading(false); }
  };

  const resetSoftwareForm = () => {
    setTitle(''); setDescription(''); setSpecialNote('');
    setMediaUrl(''); setIsFeatured(false); setVersion('');
    setCategory(''); setSubcategory('');
    setDownloadUrl(''); setDownloadUrl2('');
    setTags(''); setIsPremium(false);
  };

  const startEditSoftware = (sw: Software) => {
    setEditingSoftwareId(sw.id);
    setTitle(sw.title); setDescription(sw.description);
    setSpecialNote(sw.specialNote || ''); setMediaUrl(sw.mediaUrl);
    setMediaType(sw.mediaType); setIsFeatured(sw.isFeatured || false);
    setVersion(sw.version || ''); setCategory(sw.category || '');
    setSubcategory(sw.subcategory || ''); setDownloadUrl(sw.downloadUrl || '');
    setDownloadUrl2(sw.downloadUrl2 || '');
    setTags(sw.tags?.join(', ') || ''); setIsPremium(sw.isPremium || false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditSoftware = () => { setEditingSoftwareId(null); resetSoftwareForm(); };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'software', id));
      setDeletingSoftwareId(null); setSuccess('Yazılım silindi!');
    } catch (err: any) { setError('Silme hatası: ' + err.message); }
  };

  const insertMarkdown = (prefix: string, suffix = '') => {
    const ta = document.getElementById('description-textarea') as HTMLTextAreaElement;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const newText = value.slice(0, s) + prefix + value.slice(s, e) + suffix + value.slice(e);
    setDescription(newText);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + prefix.length, e + prefix.length); }, 0);
  };

  /* ════════════════════════════════════════
     KULLANICI HANDLER'LARI (sadece admin)
  ════════════════════════════════════════ */
  const handleChangeRole = async (uid: string, newRole: UserRole) => {
    if (uid === auth.currentUser?.uid) { setError('Kendi rolünüzü değiştiremezsiniz.'); return; }
    setUserActionLoading(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setSuccess(`Kullanıcı rolü "${roleMeta[newRole].label}" olarak güncellendi.`);
    } catch (err: any) { setError('Rol güncellenemedi: ' + err.message); }
    finally { setUserActionLoading(null); }
  };

  const handleDeleteUser = async (uid: string) => {
    if (uid === auth.currentUser?.uid) { setError('Kendi hesabınızı silemezsiniz.'); return; }
    setUserActionLoading(uid);
    try {
      await deleteDoc(doc(db, 'users', uid));
      setDeletingUserId(null); setSuccess('Kullanıcı profili silindi.');
    } catch (err: any) { setError('Kullanıcı silinemedi: ' + err.message); }
    finally { setUserActionLoading(null); }
  };

  /* ─── filtrelenmiş kullanıcılar ─── */
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return (
      u.nickname?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    mods: users.filter(u => u.role === 'moderator').length,
    members: users.filter(u => u.role === 'user').length,
  };

  /* ════════════════════════════════════════
     DESTEK BAĞLANTILARI HANDLER'LARI
  ════════════════════════════════════════ */
  const handleSaveSupport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSupportSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await setDoc(doc(db, 'settings', 'support'), {
        ...supportSettings,
        updatedAt: Timestamp.now(),
      });
      setSuccess('Destek bağlantıları başarıyla kaydedildi!');
    } catch (err: any) {
      setError('Kaydedilemedi: ' + err.message);
    } finally {
      setSupportSaving(false);
    }
  };

  const handleAddCustomSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTitle.trim() || !newCustomUrl.trim()) {
      setError('Lütfen destek seçeneği için başlık ve geçerli bir URL girin.');
      return;
    }
    const newLink: CustomSupportLink = {
      id: Date.now().toString(),
      title: newCustomTitle.trim(),
      url: newCustomUrl.trim(),
      icon: newCustomIcon,
      color: newCustomColor,
      enabled: true,
    };
    setSupportSettings(prev => ({
      ...prev,
      customLinks: [...(prev.customLinks || []), newLink],
    }));
    setNewCustomTitle('');
    setNewCustomUrl('');
    setSuccess(`"${newLink.title}" eklendi. Yayına almak için "Ayarları Kaydet" butonuna tıklayın.`);
  };

  const handleRemoveCustomSupport = (id: string) => {
    setSupportSettings(prev => ({
      ...prev,
      customLinks: prev.customLinks.filter(l => l.id !== id),
    }));
  };

  const handleToggleCustomSupport = (id: string) => {
    setSupportSettings(prev => ({
      ...prev,
      customLinks: prev.customLinks.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l),
    }));
  };

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Sekme Navigasyonu ── */}
      <div className="flex gap-1.5 mb-8 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-1.5">
        <TabBtn
          id="tab-content"
          active={activeTab === 'content'}
          onClick={() => setActiveTab('content')}
          icon={<Plus className="w-4 h-4" />}
          label="İçerik Yönetimi"
        />
        <TabBtn
          id="tab-categories"
          active={activeTab === 'categories'}
          onClick={() => setActiveTab('categories')}
          icon={<Layers className="w-4 h-4" />}
          label="Kategoriler"
        />
        {currentUserRole === 'admin' && (
          <TabBtn
            id="tab-users"
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={<Users className="w-4 h-4" />}
            label="Kullanıcılar"
            badge={users.length}
          />
        )}
        <TabBtn
          id="tab-support"
          active={activeTab === 'support'}
          onClick={() => setActiveTab('support')}
          icon={<Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />}
          label="Destek Bağlantıları"
        />
        <TabBtn
          id="tab-analytics"
          active={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
          icon={<Activity className="w-4 h-4 text-emerald-400" />}
          label="Ziyaretçi & Bot Radarı"
        />
      </div>

      {/* ══════════════════════════════════
          KATEGORİ YÖNETİMİ SEKMESİ
      ══════════════════════════════════ */}
      {activeTab === 'categories' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800/80">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Layers className="w-6 h-6 text-blue-500" />
              <span>{editingCat ? 'Kategoriyi Düzenle' : 'Kategori Yönetimi'}</span>
            </h2>
            <button
              type="button"
              onClick={handleImportDefaultCategories}
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-900/30 text-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Oyun & Program Kategorilerini Ekle (4 Ana / 39 Alt Kategori)</span>
            </button>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-6 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Kategori Adı</label>
                <input
                  type="text" required value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Örn: Oyun"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Alt Kategoriler (Virgülle ayırın)</label>
                <input
                  type="text" value={newSubCats}
                  onChange={e => setNewSubCats(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Pc oyun, Torrent oyun vb."
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button type="submit" disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50">
                {editingCat ? 'Güncelle' : 'Kategori Ekle'}
              </button>
              {editingCat && (
                <button type="button" onClick={cancelEditCategory}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-8 rounded-xl transition-all">
                  İptal
                </button>
              )}
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-black border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between">
                <div className="mb-4">
                  <h4 className="font-bold text-white">{cat.name}</h4>
                  <p className="text-[10px] text-zinc-500 mt-1">{cat.subcategories.join(', ')}</p>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-900 pt-3">
                  <button onClick={() => startEditCategory(cat)} className="text-blue-500 hover:text-blue-400 text-xs font-bold uppercase">Düzenle</button>
                  {deletingCategoryId === cat.id ? (
                    <div className="flex items-center space-x-2 bg-zinc-900 p-1 rounded-lg">
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-400 text-[10px] font-bold uppercase">Sil</button>
                      <span className="text-zinc-700">|</span>
                      <button onClick={() => setDeletingCategoryId(null)} className="text-zinc-500 hover:text-zinc-400 text-[10px] font-bold uppercase">İptal</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeletingCategoryId(cat.id)} className="text-red-500 hover:text-red-400 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          İÇERİK YÖNETİMİ SEKMESİ
      ══════════════════════════════════ */}
      {activeTab === 'content' && (
        <div className="space-y-8">
          {/* Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
              {editingSoftwareId ? <Edit2 className="w-6 h-6 text-blue-500" /> : <Plus className="w-6 h-6 text-blue-500" />}
              <span>{editingSoftwareId ? 'İçeriği Düzenle' : 'Yeni İçerik Ekle'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sol Kolon */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Yazılım İsmi</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Örn: L9 Editor v1.0" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex justify-between items-center">
                      <span>Açıklama Bilgisi</span>
                      <span className="text-[10px] lowercase font-normal opacity-50">Markdown desteklenir</span>
                    </label>
                    <div className="flex flex-wrap gap-1 mb-2 p-1 bg-black border border-zinc-800 rounded-xl">
                      <MdBtn onClick={() => insertMarkdown('# ', '')} title="Büyük Başlık"><Heading1 className="w-4 h-4" /></MdBtn>
                      <MdBtn onClick={() => insertMarkdown('## ', '')} title="Orta Başlık"><Heading2 className="w-4 h-4" /></MdBtn>
                      <MdBtn onClick={() => insertMarkdown('**', '**')} title="Kalın"><Bold className="w-4 h-4" /></MdBtn>
                      <MdBtn onClick={() => insertMarkdown('_', '_')} title="İtalik"><Italic className="w-4 h-4" /></MdBtn>
                      <MdBtn onClick={() => insertMarkdown('- ', '')} title="Liste"><List className="w-4 h-4" /></MdBtn>
                      <MdBtn onClick={() => insertMarkdown('> ', '')} title="Alıntı"><Quote className="w-4 h-4" /></MdBtn>
                      <MdBtn onClick={() => insertMarkdown('[', '](url)')} title="Bağlantı"><Link2 className="w-4 h-4" /></MdBtn>
                    </div>
                    <textarea id="description-textarea" required value={description}
                      onChange={e => setDescription(e.target.value)} rows={12}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none font-mono text-sm"
                      placeholder="Yazılım veya oyun hakkında detaylı bilgi..." />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center space-x-2">
                      <Info className="w-3 h-3 text-blue-500" />
                      <span>Kullanıcılara Özel Not</span>
                    </label>
                    <textarea value={specialNote} onChange={e => setSpecialNote(e.target.value)} rows={3}
                      className="w-full bg-black border border-zinc-800 border-dashed rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none text-sm"
                      placeholder="Örn: Kurulum sırasında interneti kapatın..." />
                  </div>
                </div>

                {/* Sağ Kolon */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Medya Türü</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => setMediaType('image')}
                          className={cn("flex items-center justify-center space-x-2 py-3 rounded-xl border transition-all",
                            mediaType === 'image' ? "bg-blue-600 border-blue-500 text-white" : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700")}>
                          <ImageIcon className="w-4 h-4" /><span>Resim</span>
                        </button>
                        <button type="button" onClick={() => setMediaType('youtube')}
                          className={cn("flex items-center justify-center space-x-2 py-3 rounded-xl border transition-all",
                            mediaType === 'youtube' ? "bg-blue-600 border-blue-500 text-white" : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700")}>
                          <Video className="w-4 h-4" /><span>YouTube</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>{mediaType === 'youtube' ? 'YouTube Video URL' : 'Resim URL'}</span>
                        {mediaType === 'image' && (
                          <span className="text-[10px] text-zinc-500 font-normal">
                            (Doğrudan resim bağlantısı)
                          </span>
                        )}
                      </label>
                      <input type="url" required value={mediaUrl} onChange={e => setMediaUrl(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder={mediaType === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://i.ibb.co/... veya https://.../resim.jpg'} />

                      {/* Medya Önizleme & Yükleme İpuçları */}
                      {mediaType === 'image' && mediaUrl && (
                        <div className="mt-3 p-2 bg-black border border-zinc-800 rounded-xl flex items-center space-x-3">
                          <img
                            src={mediaUrl}
                            alt="Önizleme"
                            className="w-12 h-12 object-cover rounded-lg border border-zinc-700 bg-zinc-900"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/27272a/71717a?text=Hata';
                            }}
                          />
                          <div className="text-xs">
                            <p className="text-zinc-300 font-medium">Görsel Önizlemesi</p>
                            <p className="text-[10px] text-zinc-500 truncate max-w-[200px]">{mediaUrl}</p>
                          </div>
                        </div>
                      )}
                      
                      {mediaType === 'image' && (
                        <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                          💡 Bilgisayarınızdan resim yüklemek için{' '}
                          <a href="https://imgbb.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">ImgBB</a> veya{' '}
                          <a href="https://hizliresim.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Hızlı Resim</a>{' '}
                          kullanıp doğrudan resim linkini buraya yapıştırabilirsiniz.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Versiyon</label>
                      <input type="text" value={version} onChange={e => setVersion(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="v1.0.0" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Ana Kategori</label>
                      <select value={category} onChange={e => { setCategory(e.target.value); setSubcategory(''); }}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all">
                        <option value="">Seçiniz</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Alt Kategori</label>
                      <select value={subcategory} onChange={e => setSubcategory(e.target.value)} disabled={!category}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-40">
                        <option value="">Seçiniz</option>
                        {categories.find(c => c.name === category)?.subcategories.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">İndirme Bağlantısı 1</label>
                      <input type="url" value={downloadUrl} onChange={e => setDownloadUrl(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="https://github.com/..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">İndirme Bağlantısı 2</label>
                      <input type="url" value={downloadUrl2} onChange={e => setDownloadUrl2(e.target.value)}
                        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Alternatif link..." />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Etiketler (Virgülle ayırın)</label>
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                      className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder="open-source, fast, utility" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CheckboxField id="isFeatured" checked={isFeatured} onChange={setIsFeatured} label="Öne Çıkarılan İçerik" />
                    <CheckboxField id="isPremium" checked={isPremium} onChange={setIsPremium} label="Premium / Ücretli İçerik" />
                  </div>
                </div>
              </div>

              {/* Alt alan */}
              <div className="pt-6 border-t border-zinc-800">
                {error && (
                  <div className="flex items-center space-x-2 bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
                    <AlertCircle className="w-4 h-4" /><span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center space-x-2 bg-green-900/20 border border-green-900/50 text-green-400 px-4 py-3 rounded-xl text-sm mb-4">
                    <CheckCircle2 className="w-4 h-4" /><span>{success}</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button type="submit" disabled={loading}
                    className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20">
                    {loading ? 'Yükleniyor...' : editingSoftwareId ? 'Değişiklikleri Kaydet' : 'İçeriği Paylaş'}
                  </button>
                  {editingSoftwareId && (
                    <button type="button" onClick={cancelEditSoftware}
                      className="sm:w-1/4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2">
                      <CloseIcon className="w-4 h-4" /><span>İptal Et</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Liste */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <Layers className="w-6 h-6 text-zinc-500" />
              <span>Paylaşılan İçerikler</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {softwares.map(sw => (
                <div key={sw.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between group hover:border-zinc-700 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0">
                      {sw.mediaType === 'image'
                        ? <img src={sw.mediaUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        : <div className="w-full h-full flex items-center justify-center bg-zinc-800"><Video className="w-6 h-6 text-zinc-500" /></div>
                      }
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-bold">{sw.title}</h3>
                        {sw.isFeatured && (
                          <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-600/30 uppercase tracking-tighter">Öne Çıkan</span>
                        )}
                      </div>
                      <p className="text-zinc-500 text-xs mt-1">
                        {sw.createdAt?.toDate?.()?.toLocaleString('tr-TR') ?? ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => startEditSoftware(sw)}
                      className="p-3 text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all" title="Düzenle">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    {deletingSoftwareId === sw.id ? (
                      <div className="flex items-center space-x-3 bg-zinc-800/50 p-2 rounded-xl border border-red-900/20">
                        <button onClick={() => handleDelete(sw.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all">Sil</button>
                        <button onClick={() => setDeletingSoftwareId(null)}
                          className="text-zinc-500 hover:text-zinc-300 text-xs font-medium">Vazgeç</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingSoftwareId(sw.id)}
                        className="p-3 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Sil">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {softwares.length === 0 && (
                <div className="col-span-full text-center py-20 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
                  <p className="text-zinc-500">Henüz hiç içerik paylaşılmadı.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          KULLANICI YÖNETİMİ SEKMESİ (sadece admin)
      ══════════════════════════════════ */}
      {activeTab === 'users' && currentUserRole === 'admin' && (
        <div className="space-y-6">
          {/* İstatistik kartları */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Toplam Üye" value={userStats.total} color="text-white" />
            <StatCard label="Admin" value={userStats.admins} color="text-blue-400" />
            <StatCard label="Moderatör" value={userStats.mods} color="text-purple-400" />
            <StatCard label="Üye" value={userStats.members} color="text-zinc-400" />
          </div>

          {/* Arama + Hata/Başarı */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Kullanıcı adı, e-posta veya rol ile ara..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-900/20 border border-green-900/50 text-green-400 px-4 py-3 rounded-xl text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" /><span>{success}</span>
            </div>
          )}

          {/* Not */}
          <div className="flex items-start gap-3 bg-amber-950/20 border border-amber-900/30 rounded-2xl px-4 py-3">
            <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-500/80 leading-relaxed">
              Kullanıcı profili silindiğinde Firestore kaydı kaldırılır; Firebase Authentication hesabı aktif kalmaya devam eder.
              Tam silme için Firebase Console &gt; Authentication kısmını kullanın.
            </p>
          </div>

          {/* Kullanıcı listesi */}
          <div className="grid grid-cols-1 gap-3">
            {filteredUsers.length === 0 && (
              <div className="text-center py-16 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-500">Kullanıcı bulunamadı.</p>
              </div>
            )}
            {filteredUsers.map(u => {
              const isSelf = u.uid === auth.currentUser?.uid;
              const meta = roleMeta[u.role] ?? roleMeta.user;
              const avatarColor = u.role === 'admin' ? 'bg-blue-600' : u.role === 'moderator' ? 'bg-purple-600' : 'bg-zinc-700';
              const isDelConfirm = deletingUserId === u.uid;
              const isLoading = userActionLoading === u.uid;

              return (
                <div key={u.uid}
                  className={cn(
                    "bg-zinc-900/60 border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all",
                    isSelf ? "border-blue-800/50" : "border-zinc-800 hover:border-zinc-700"
                  )}>

                  {/* Avatar + bilgi */}
                  <div className="flex items-center gap-4 flex-grow min-w-0">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0", avatarColor)}>
                      {u.nickname?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold truncate">{u.nickname}</span>
                        {isSelf && <span className="text-[10px] text-blue-400 bg-blue-900/30 border border-blue-800/40 px-2 py-0.5 rounded-full">Sen</span>}
                        <span className={cn("flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border", meta.color)}>
                          {meta.icon}{meta.label}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        {u.email || <span className="italic text-zinc-600">E-posta yok</span>}
                      </p>
                    </div>
                  </div>

                  {/* Rol değiştir + Sil (kendi hesabında devre dışı) */}
                  {!isSelf && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Rol seçici */}
                      <select
                        value={u.role}
                        disabled={isLoading}
                        onChange={e => handleChangeRole(u.uid, e.target.value as UserRole)}
                        className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 outline-none transition-all disabled:opacity-40 cursor-pointer"
                      >
                        <option value="user">Üye</option>
                        <option value="moderator">Moderatör</option>
                        <option value="admin">Admin</option>
                      </select>

                      {/* Sil butonu */}
                      {isDelConfirm ? (
                        <div className="flex items-center gap-2 bg-zinc-800 p-1.5 rounded-xl border border-red-900/20">
                          <button
                            onClick={() => handleDeleteUser(u.uid)}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                          >
                            {isLoading ? '...' : 'Onayla'}
                          </button>
                          <button
                            onClick={() => setDeletingUserId(null)}
                            className="text-zinc-400 hover:text-zinc-200 text-xs font-medium px-2"
                          >
                            Vazgeç
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingUserId(u.uid)}
                          disabled={isLoading}
                          className="p-2.5 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-40"
                          title="Kullanıcıyı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          DESTEK BAĞLANTILARI SEKMESİ
      ══════════════════════════════════ */}
      {activeTab === 'support' && (
        <div className="space-y-8">
          {/* Header & Bilgilendirme */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                  <Heart className="w-6 h-6 fill-rose-500/20" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Destek Bağlantıları Yönetimi</h2>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    Kullanıcıların Patreon, Ko-fi veya özel yöntemlerle projenize destek olabileceği bağlantıları buradan yapılandırabilirsiniz.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveSupport}
                disabled={supportSaving}
                className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-600/25 transition-all text-sm flex-shrink-0 cursor-pointer"
              >
                {supportSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Değişiklikleri Kaydet</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-2 bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 flex items-center gap-2 bg-green-900/20 border border-green-900/50 text-green-400 px-4 py-3 rounded-xl text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /><span>{success}</span>
              </div>
            )}

            {/* Canlı Önizleme Kutusu */}
            <div className="bg-black/60 border border-zinc-800 rounded-2xl p-5 mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Sitede Görünüm Önizlemesi (Giriş Panelinin Altındaki Alan)
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500">Canlı Önizleme</span>
              </div>
              <div className="p-4 bg-zinc-950 border border-dashed border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm font-bold text-white uppercase tracking-tight flex items-center space-x-2">
                  <span className="text-zinc-500 text-xs font-normal">Sayfa konumu:</span>
                  <span>ÖNE ÇIKANLAR</span>
                </div>
                {/* Simüle edilen butonlar */}
                <div className="flex items-center gap-2">
                  {supportSettings.patreonEnabled && supportSettings.patreonUrl && (
                    <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-zinc-950 border border-[#FF424D]/50 text-white text-xs font-semibold shadow-sm">
                      <span className="w-5 h-5 rounded-md bg-[#FF424D] text-white flex items-center justify-center p-0.5">
                        <PatreonIcon className="w-3.5 h-3.5 fill-white" />
                      </span>
                      <span>{supportSettings.patreonLabel || 'Patreon'}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#FF424D]/20 text-[#FF424D] border border-[#FF424D]/30">
                        Destek
                      </span>
                    </div>
                  )}
                  {supportSettings.kofiEnabled && supportSettings.kofiUrl && (
                    <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-zinc-950 border border-[#13C3FF]/50 text-white text-xs font-semibold shadow-sm">
                      <span className="w-5 h-5 rounded-md bg-[#13C3FF] text-white flex items-center justify-center p-0.5">
                        <KofiIcon className="w-3.5 h-3.5 fill-white" />
                      </span>
                      <span>{supportSettings.kofiLabel || 'Ko-fi'}</span>
                    </div>
                  )}
                  {supportSettings.customLinks?.filter(l => l.enabled).map(l => (
                    <div key={l.id} className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-semibold shadow-sm">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center p-0.5 text-white" style={{ backgroundColor: l.color || '#3b82f6' }}>
                        <SupportIconRenderer icon={l.icon} className="w-3.5 h-3.5 text-white" />
                      </span>
                      <span>{l.title}</span>
                    </div>
                  ))}
                  {!supportSettings.patreonEnabled && !supportSettings.kofiEnabled && (!supportSettings.customLinks || supportSettings.customLinks.filter(l => l.enabled).length === 0) && (
                    <span className="text-xs text-zinc-500 italic">Hiçbir destek bağlantısı aktif değil. Butonlar sitede gizlenecektir.</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── 1. PATREON AYARLARI ── */}
            <div className="space-y-6">
              <div className="p-6 bg-black border border-zinc-800 rounded-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF424D]/20 border border-[#FF424D]/30 flex items-center justify-center text-[#FF424D]">
                      <PatreonIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                        <span>Patreon Bağlantısı</span>
                        <span className="text-[10px] bg-[#FF424D]/20 text-[#FF424D] px-2 py-0.5 rounded-full font-bold border border-[#FF424D]/30">
                          Önerilen
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-500">Patreon sayfanızı bağlayarak abonelik veya bağış alın.</p>
                    </div>
                  </div>
                  <label className="flex items-center space-x-3 cursor-pointer select-none">
                    <span className="text-xs font-semibold text-zinc-400">
                      {supportSettings.patreonEnabled ? 'Aktif' : 'Kapalı'}
                    </span>
                    <input
                      type="checkbox"
                      checked={supportSettings.patreonEnabled}
                      onChange={e => setSupportSettings({ ...supportSettings, patreonEnabled: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5",
                      supportSettings.patreonEnabled ? "bg-[#FF424D]" : "bg-zinc-800"
                    )}>
                      <div className={cn(
                        "w-5 h-5 rounded-full bg-white transition-transform",
                        supportSettings.patreonEnabled ? "translate-x-5" : "translate-x-0"
                      )} />
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      Patreon Profil veya Kampanya URL'si
                    </label>
                    <input
                      type="url"
                      value={supportSettings.patreonUrl}
                      onChange={e => setSupportSettings({ ...supportSettings, patreonUrl: e.target.value })}
                      placeholder="https://www.patreon.com/kullanici_adiniz"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#FF424D] focus:ring-1 focus:ring-[#FF424D] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      Buton Metni
                    </label>
                    <input
                      type="text"
                      value={supportSettings.patreonLabel || ''}
                      onChange={e => setSupportSettings({ ...supportSettings, patreonLabel: e.target.value })}
                      placeholder="Patreon"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#FF424D] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ── 2. KO-FI AYARLARI ── */}
              <div className="p-6 bg-black border border-zinc-800 rounded-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#13C3FF]/20 border border-[#13C3FF]/30 flex items-center justify-center text-[#13C3FF]">
                      <KofiIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Ko-fi Bağlantısı</h3>
                      <p className="text-xs text-zinc-500">Ko-fi sayfanız üzerinden tek seferlik kahve ısmarlama veya bağış.</p>
                    </div>
                  </div>
                  <label className="flex items-center space-x-3 cursor-pointer select-none">
                    <span className="text-xs font-semibold text-zinc-400">
                      {supportSettings.kofiEnabled ? 'Aktif' : 'Kapalı'}
                    </span>
                    <input
                      type="checkbox"
                      checked={supportSettings.kofiEnabled}
                      onChange={e => setSupportSettings({ ...supportSettings, kofiEnabled: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5",
                      supportSettings.kofiEnabled ? "bg-[#13C3FF]" : "bg-zinc-800"
                    )}>
                      <div className={cn(
                        "w-5 h-5 rounded-full bg-white transition-transform",
                        supportSettings.kofiEnabled ? "translate-x-5" : "translate-x-0"
                      )} />
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      Ko-fi Profil URL'si
                    </label>
                    <input
                      type="url"
                      value={supportSettings.kofiUrl}
                      onChange={e => setSupportSettings({ ...supportSettings, kofiUrl: e.target.value })}
                      placeholder="https://ko-fi.com/kullanici_adiniz"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#13C3FF] focus:ring-1 focus:ring-[#13C3FF] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      Buton Metni
                    </label>
                    <input
                      type="text"
                      value={supportSettings.kofiLabel || ''}
                      onChange={e => setSupportSettings({ ...supportSettings, kofiLabel: e.target.value })}
                      placeholder="Ko-fi"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#13C3FF] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ── 3. ÖZEL DESTEK BAĞLANTILARI (Buy Me a Coffee, BynoGame, Papara vb.) ── */}
              <div className="p-6 bg-black border border-zinc-800 rounded-2xl">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Gift className="w-5 h-5 text-purple-400" />
                    <span>Özel Destek & Bağış Seçenekleri</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Buy Me a Coffee, BynoGame, Papara, Kreosus, Kripto cüzdan veya Discord sunucusu gibi dilediğiniz özel destek seçeneklerini ekleyin.
                  </p>
                </div>

                {/* Yeni ekleme formu */}
                <form onSubmit={handleAddCustomSupport} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 mb-6">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Yeni Destek Seçeneği Ekle</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Platform / Başlık</label>
                      <input
                        type="text"
                        required
                        value={newCustomTitle}
                        onChange={e => setNewCustomTitle(e.target.value)}
                        placeholder="Örn: Buy Me a Coffee"
                        className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Bağlantı URL'si</label>
                      <input
                        type="url"
                        required
                        value={newCustomUrl}
                        onChange={e => setNewCustomUrl(e.target.value)}
                        placeholder="https://buymeacoffee.com/..."
                        className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">İkon</label>
                      <select
                        value={newCustomIcon}
                        onChange={e => setNewCustomIcon(e.target.value as SupportIconType)}
                        className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none cursor-pointer"
                      >
                        <option value="heart">Kalp</option>
                        <option value="coffee">Kahve (Buy Me a Coffee)</option>
                        <option value="gift">Hediye Kutusu</option>
                        <option value="dollar">Para / Dolar</option>
                        <option value="kofi">Ko-fi</option>
                        <option value="patreon">Patreon</option>
                        <option value="link">Dış Bağlantı</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Vurgu Rengi</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={newCustomColor}
                          onChange={e => setNewCustomColor(e.target.value)}
                          className="w-9 h-8 bg-transparent cursor-pointer rounded border border-zinc-800"
                        />
                        <button
                          type="submit"
                          className="flex-grow bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          + Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Eklenen özel bağlantılar listesi */}
                <div className="space-y-2">
                  {(!supportSettings.customLinks || supportSettings.customLinks.length === 0) ? (
                    <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                      Henüz özel bir destek bağlantısı eklenmedi.
                    </div>
                  ) : (
                    supportSettings.customLinks.map(link => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl"
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: link.color || '#3b82f6' }}
                          >
                            <SupportIconRenderer icon={link.icon} className="w-4 h-4 text-white" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white flex items-center space-x-2">
                              <span>{link.title}</span>
                              {!link.enabled && (
                                <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">Pasif</span>
                              )}
                            </p>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-zinc-500 hover:text-blue-400 truncate max-w-xs block"
                            >
                              {link.url}
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleToggleCustomSupport(link.id)}
                            className={cn(
                              "text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer",
                              link.enabled
                                ? "bg-green-900/30 text-green-400 border border-green-800/50"
                                : "bg-zinc-800 text-zinc-500"
                            )}
                          >
                            {link.enabled ? 'Aktif' : 'Pasif'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomSupport(link.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Alt Kaydet Butonu */}
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleSaveSupport}
                  disabled={supportSaving}
                  className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-8 py-3.5 rounded-2xl shadow-xl shadow-blue-600/30 transition-all text-sm cursor-pointer"
                >
                  {supportSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Tüm Değişiklikleri Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          ZİYARETÇİ & BOT RADARI SEKMESİ
      ══════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <VisitorAnalytics />
      )}
    </div>
  );
}

/* ─── YARDIMCI BİLEŞENLER ─── */

function TabBtn({
  id, active, onClick, icon, label, badge,
}: {
  id: string; active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; badge?: number;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all",
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full",
          active ? "bg-blue-500/40 text-blue-100" : "bg-zinc-700 text-zinc-400")}>
          {badge}
        </span>
      )}
    </button>
  );
}

function MdBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all">
      {children}
    </button>
  );
}

function CheckboxField({
  id, checked, onChange, label,
}: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string; }) {
  return (
    <div className="flex items-center space-x-3 bg-black/50 p-4 rounded-xl border border-zinc-800">
      <input type="checkbox" id={id} checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-zinc-800 bg-black text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition-all cursor-pointer" />
      <label htmlFor={id} className="text-sm font-medium text-zinc-300 cursor-pointer select-none">{label}</label>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
      <p className={cn("text-3xl font-bold", color)}>{value}</p>
      <p className="text-xs text-zinc-500 mt-1 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}
