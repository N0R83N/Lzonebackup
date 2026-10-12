import React, { useState } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Chrome,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../lib/utils';

type AuthMode = 'login' | 'register' | 'forgot';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');

  // Shared fields
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  const reset = () => {
    setError(null);
    setSuccess(null);
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    reset();
  };

  /* ─── Hata mesajlarını Türkçeleştir ─── */
  const friendlyError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential')
      return 'Kullanıcı adı / şifre hatalı. Bilgilerini kontrol et.';
    if (code === 'auth/email-already-in-use')
      return 'Bu kullanıcı adı veya e-posta zaten kullanımda.';
    if (code === 'auth/weak-password')
      return 'Şifre en az 6 karakter olmalıdır.';
    if (code === 'auth/invalid-email')
      return 'Geçersiz e-posta formatı.';
    if (code === 'auth/operation-not-allowed')
      return 'E-posta/Şifre girişi Firebase panelinden aktif edilmeli.';
    if (code === 'auth/network-request-failed')
      return 'Ağ hatası. Bağlantını kontrol et veya tarayıcında üçüncü taraf çerezlere izin ver.';
    if (code === 'auth/too-many-requests')
      return 'Çok fazla deneme. Lütfen biraz bekle.';
    return err?.message || 'Bilinmeyen bir hata oluştu.';
  };

  /* ─── GİRİŞ ─── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    reset();
    try {
      const loginEmail = email.includes('@') ? email : `${email}@l9zone.local`;
      await signInWithEmailAndPassword(auth, loginEmail, password);
      navigate('/');
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ─── KAYIT ─── */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) { setError('Kullanıcı adı zorunludur.'); return; }
    setLoading(true);
    reset();
    try {
      const regEmail = email.trim() ? email.trim() : `${nickname.trim()}@l9zone.local`;
      const credential = await createUserWithEmailAndPassword(auth, regEmail, password);
      const user = credential.user;
      await updateProfile(user, { displayName: nickname.trim() });
      await setDoc(doc(db, 'users', user.uid), {
        nickname: nickname.trim(),
        email: email.trim() || null,
        role: 'user',
        createdAt: new Date(),
      });
      navigate('/');
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ─── ŞİFREMİ UNUTTUM ─── */
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Lütfen kayıt sırasında kullandığın e-posta adresini gir.'); return; }
    setLoading(true);
    reset();
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(`Şifre sıfırlama bağlantısı ${email.trim()} adresine gönderildi. Spam klasörünü de kontrol et.`);
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ─── GOOGLE ─── */
  const handleGoogle = async () => {
    setLoading(true);
    reset();
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          nickname: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
          email: user.email,
          role: user.email === 'nijatemiraslanov@gmail.com' ? 'admin' : 'user',
          createdAt: new Date(),
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  /* ─── RENDER ─── */
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-black">
      {/* Arka plan dekorasyon */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-800/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Kart */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-8 shadow-2xl shadow-blue-950/30">

          {/* ── BAŞLIK ── */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-600/20 mb-4">
              {mode === 'login' && <KeyRound className="w-7 h-7 text-blue-400" />}
              {mode === 'register' && <ShieldCheck className="w-7 h-7 text-blue-400" />}
              {mode === 'forgot' && <Mail className="w-7 h-7 text-blue-400" />}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {mode === 'login' && 'Tekrar Hoş Geldin'}
              {mode === 'register' && 'Aramıza Katıl'}
              {mode === 'forgot' && 'Şifre Sıfırla'}
            </h1>
            <p className="text-zinc-500 text-sm">
              {mode === 'login' && 'L9Zone dünyasına giriş yap'}
              {mode === 'register' && 'Ücretsiz hesap oluştur, e-posta zorunlu değil'}
              {mode === 'forgot' && 'Kayıtlı e-postana sıfırlama bağlantısı göndereceğiz'}
            </p>
          </div>

          {/* ── GİRİŞ FORMU ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field
                label="Kullanıcı Adı veya E-posta"
                icon={<User className="w-4 h-4" />}
              >
                <input
                  id="auth-login-identifier"
                  type="text"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="nickname veya ornek@mail.com"
                />
              </Field>

              <Field label="Şifre" icon={<Lock className="w-4 h-4" />}>
                <input
                  id="auth-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(inputCls, 'pr-12')}
                  placeholder="••••••••"
                />
                <TogglePassword show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              </Field>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs text-zinc-500 hover:text-blue-400 transition-colors"
                >
                  Şifremi unuttum
                </button>
              </div>

              <Alerts error={error} success={success} />

              <SubmitButton loading={loading} label="Giriş Yap" />
            </form>
          )}

          {/* ── KAYIT FORMU ── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field
                label="Kullanıcı Adı *"
                icon={<User className="w-4 h-4" />}
              >
                <input
                  id="auth-reg-nickname"
                  type="text"
                  required
                  autoComplete="username"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className={inputCls}
                  placeholder="nickname"
                />
              </Field>

              <Field
                label={
                  <span className="flex items-center gap-2">
                    E-posta
                    <span className="text-[10px] font-normal text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full tracking-wide">
                      opsiyonel — hesap kurtarma için
                    </span>
                  </span>
                }
                icon={<Mail className="w-4 h-4" />}
              >
                <input
                  id="auth-reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="ornek@mail.com (zorunlu değil)"
                />
              </Field>

              <Field label="Şifre *" icon={<Lock className="w-4 h-4" />}>
                <input
                  id="auth-reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(inputCls, 'pr-12')}
                  placeholder="En az 6 karakter"
                />
                <TogglePassword show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              </Field>

              {/* E-posta uyarısı */}
              {!email.trim() && (
                <div className="flex items-start gap-2.5 bg-amber-950/20 border border-amber-900/30 rounded-2xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-500/80 leading-relaxed">
                    E-posta girmeden kayıt oluyorsun. Şifreni unutursan hesabını kurtaramazsın.
                  </p>
                </div>
              )}

              <Alerts error={error} success={success} />

              <SubmitButton loading={loading} label="Hesap Oluştur" />
            </form>
          )}

          {/* ── ŞİFREMİ UNUTTUM ── */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <Field label="Kayıtlı E-posta Adresin" icon={<Mail className="w-4 h-4" />}>
                <input
                  id="auth-forgot-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="ornek@mail.com"
                />
              </Field>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Eğer kayıt sırasında e-posta eklemediysen şifre sıfırlama mümkün değildir.
                Yeni bir hesap oluşturabilirsin.
              </p>

              <Alerts error={error} success={success} />

              {!success && <SubmitButton loading={loading} label="Sıfırlama Bağlantısı Gönder" />}

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-blue-400 transition-colors mt-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Giriş ekranına dön
              </button>
            </form>
          )}

          {/* ── GOOGLE & TAB GEÇİŞ (sadece login/register) ── */}
          {mode !== 'forgot' && (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-grow bg-zinc-800" />
                <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">veya</span>
                <div className="h-px flex-grow bg-zinc-800" />
              </div>

              <button
                id="auth-google-btn"
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full bg-white hover:bg-zinc-100 disabled:opacity-50 text-black font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-3 text-sm"
              >
                <GoogleIcon />
                Google ile Giriş Yap
              </button>

              {/* Login ↔ Register geçiş */}
              <div className="mt-6 text-center">
                {mode === 'login' ? (
                  <p className="text-sm text-zinc-500">
                    Hesabın yok mu?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      Ücretsiz Kayıt Ol
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Zaten üye misin?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      Giriş Yap
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── YARDIMCI BİLEŞENLER ─── */

const inputCls =
  'w-full bg-black/60 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3.5 text-white text-sm placeholder-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all';

function Field({
  label,
  icon,
  children,
}: {
  label: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function TogglePassword({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
      tabIndex={-1}
      aria-label={show ? 'Şifreyi gizle' : 'Şifreyi göster'}
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}

function Alerts({ error, success }: { error: string | null; success: string | null }) {
  if (!error && !success) return null;
  return (
    <div>
      {error && (
        <div className="flex items-start gap-2.5 bg-red-900/15 border border-red-900/40 text-red-400 px-4 py-3 rounded-2xl text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2.5 bg-green-900/15 border border-green-900/40 text-green-400 px-4 py-3 rounded-2xl text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 group text-sm"
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>İşlem yapılıyor...</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
