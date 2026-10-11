import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

const onboardingOptions = [
  'Oyun',
  'Program',
  'Mobil',
  'Ağ',
  'Yazılım',
  'Araç',
];

export default function OnboardingWizard() {
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleOption = (option: string) => {
    setSelected((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    );
  };

  const handleSubmit = async (skip = false) => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await updateDoc(doc(db, 'users', user.uid), {
        onboardingComplete: true,
        preferredCategories: skip ? [] : selected,
        updatedAt: new Date(),
      });

      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'İlk kurulum kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-black text-white">
      <div className="w-full max-w-2xl rounded-[2rem] border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-blue-950/20 backdrop-blur-xl md:p-8">
        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-600/30 bg-blue-600/10 text-blue-400">
            <Sparkles className="h-8 w-8" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-400">Hoş geldin</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white">L9Zone’a hızlı başlangıç</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Hangi içerik türlerini sevdiğini seç; ana sayfa sana daha uygun öneriler sunar.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          {onboardingOptions.map((option) => {
            const active = selected.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className={[
                  'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all',
                  active
                    ? 'border-blue-500 bg-blue-600/10 text-blue-200 shadow-lg shadow-blue-900/20'
                    : 'border-zinc-800 bg-black/40 text-zinc-300 hover:border-zinc-700 hover:text-white',
                ].join(' ')}
              >
                <span>{option}</span>
                {active && <Check className="h-4 w-4 text-blue-300" />}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Kaydediliyor...' : 'Başlayalım'}
            {!saving && <ArrowRight className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="rounded-2xl border border-zinc-700 bg-zinc-950/60 px-5 py-3.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sonra karar ver
          </button>
        </div>
      </div>
    </div>
  );
}
