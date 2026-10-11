import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setNickname(userDoc.data().nickname || '');
        }
      } catch (err: any) {
        setError('Profil yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !nickname.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        nickname: nickname.trim()
      });
      setSuccess('Profil başarıyla güncellendi!');
    } catch (err: any) {
      setError('Güncelleme sırasında hata oluştu: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <Link to="/" className="inline-flex items-center space-x-2 text-zinc-500 hover:text-white mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Geri Dön</span>
      </Link>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-black">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-600/30">
            <User className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Profil Ayarları</h1>
            <p className="text-zinc-500 text-xs">Hesap bilgilerinizi güncelleyin</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Görünen İsim (Nick)</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="Yeni isminiz..."
                maxLength={30}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-900/50 text-green-400 px-4 py-3 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
          >
            {submitting ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800">
          <div className="flex justify-between text-[10px] text-zinc-600">
            <span>E-posta</span>
            <span>{auth.currentUser?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
