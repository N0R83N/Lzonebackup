import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, query, orderBy, limit, onSnapshot,
  Timestamp, deleteDoc, doc, getDocs
} from 'firebase/firestore';
import { VisitorSession, VisitorLog } from '../types';
import {
  Activity, Bot, Users, UserCheck, Globe, Laptop, Smartphone,
  Search, RefreshCw, Trash2, ShieldAlert, Clock, ArrowUpRight,
  Filter, Sparkles, CheckCircle2, AlertCircle, Eye, Compass, Shield
} from 'lucide-react';

export default function VisitorAnalytics() {
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'human' | 'bot' | 'member'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 1. Aktif Oturumlar ve Canlı Ziyaretçiler (onSnapshot)
  useEffect(() => {
    const qSessions = query(collection(db, 'visitor_sessions'), limit(150));
    const unsubSessions = onSnapshot(qSessions, (snap) => {
      const list: VisitorSession[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as VisitorSession));
      setSessions(list);
    }, (err) => {
      console.error('Session stream error:', err);
    });

    return () => unsubSessions();
  }, []);

  // 2. Trafik Logları (onSnapshot)
  useEffect(() => {
    const qLogs = query(collection(db, 'visitor_logs'), orderBy('timestamp', 'desc'), limit(100));
    const unsubLogs = onSnapshot(qLogs, (snap) => {
      const list: VisitorLog[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as VisitorLog));
      setLogs(list);
      setLoading(false);
    }, (err) => {
      console.error('Logs stream error:', err);
      setLoading(false);
    });

    return () => unsubLogs();
  }, []);

  // Canlı aktiflik eşiği: Son 3 dakika içinde sinyal verenler
  const nowMs = Date.now();
  const activeThresholdMs = 3 * 60 * 1000; // 3 dakika

  const activeVisitors = sessions.filter(s => {
    if (!s.lastActive) return false;
    const lastActiveMs = s.lastActive?.toMillis ? s.lastActive.toMillis() : new Date(s.lastActive).getTime();
    return (nowMs - lastActiveMs) < activeThresholdMs;
  });

  const activeHumans = activeVisitors.filter(s => !s.isBot);
  const activeBots = activeVisitors.filter(s => s.isBot);
  const activeMembers = activeVisitors.filter(s => s.isMember);

  // Genel İstatistikler
  const totalLogged = logs.length;
  const humanLogsCount = logs.filter(l => !l.isBot).length;
  const botLogsCount = logs.filter(l => l.isBot).length;
  const memberLogsCount = logs.filter(l => l.isMember).length;

  const humanPercent = totalLogged > 0 ? Math.round((humanLogsCount / totalLogged) * 100) : 0;
  const botPercent = totalLogged > 0 ? Math.round((botLogsCount / totalLogged) * 100) : 0;

  // Bot kırılımı (Googlebot, Bingbot, vb.)
  const botBreakdown: { [name: string]: number } = {};
  logs.filter(l => l.isBot).forEach(l => {
    const name = l.botName || 'Bilinmeyen Robot';
    botBreakdown[name] = (botBreakdown[name] || 0) + 1;
  });

  // Filtreleme
  const filteredLogs = logs.filter(log => {
    if (filterType === 'human' && log.isBot) return false;
    if (filterType === 'bot' && !log.isBot) return false;
    if (filterType === 'member' && !log.isMember) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchPath = log.path?.toLowerCase().includes(term);
      const matchBot = log.botName?.toLowerCase().includes(term);
      const matchUser = log.userNickname?.toLowerCase().includes(term);
      const matchBrowser = log.browser?.toLowerCase().includes(term);
      const matchReferrer = log.referrer?.toLowerCase().includes(term);
      return matchPath || matchBot || matchUser || matchBrowser || matchReferrer;
    }
    return true;
  });

  // Eski logları temizleme
  const handleClearLogs = async () => {
    if (!window.confirm('Tüm geçmiş ziyaret loglarını temizlemek istediğinize emin misiniz?')) return;
    setIsClearing(true);
    setStatusMessage(null);
    try {
      const q = query(collection(db, 'visitor_logs'), limit(100));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'visitor_logs', d.id)));
      await Promise.all(deletePromises);
      setStatusMessage('Geçmiş ziyaret logları başarıyla temizlendi.');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setStatusMessage('Loglar temizlenirken hata oluştu: ' + err.message);
    } finally {
      setIsClearing(false);
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return 'Bilinmiyor';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 10) return 'Az önce';
      if (diffSec < 60) return `${diffSec} sn önce`;
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} dk önce`;
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + ' (' + date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + ')';
    } catch {
      return 'Geçersiz tarih';
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Üst Başlık & Açıklama ── */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-blue-950/40 border border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Canlı Trafik & Bot Analiz Radarı
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Activity className="w-7 h-7 text-emerald-400" />
              Ziyaretçi ve Robot Takip Paneli
            </h2>
            <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
              Siteye anlık giren canlı ziyaretçileri, kayıtlı üyeleri ve Googlebot, Bingbot, Yandex gibi arama motoru örümceklerini anlık olarak izleyin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClearLogs}
              disabled={isClearing || logs.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40 border border-zinc-700/80 text-zinc-300 text-xs font-semibold transition-all disabled:opacity-40"
              title="Geçmiş logları temizle"
            >
              <Trash2 className="w-4 h-4" />
              {isClearing ? 'Temizleniyor...' : 'Logları Temizle'}
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            {statusMessage}
          </div>
        )}
      </div>

      {/* ── Canlı Durum Kartları (Metrikler) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Canlı Toplam Ziyaretçi */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Şu An Canlı</span>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {activeVisitors.length}
          </div>
          <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">{activeHumans.length} insan</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{activeBots.length} bot</span>
          </p>
        </div>

        {/* Gerçek Ziyaretçiler */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Gerçek İnsan Trafiği</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-blue-400 tracking-tight">
            {humanLogsCount}
            <span className="text-xs text-zinc-500 font-normal ml-2">({humanPercent}%)</span>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Organik tarayıcı ve kullanıcılar
          </p>
        </div>

        {/* Robotlar & Botlar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Botlar & Örümcekler</span>
            <Bot className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 tracking-tight">
            {botLogsCount}
            <span className="text-xs text-zinc-500 font-normal ml-2">({botPercent}%)</span>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Googlebot, SEO & Web taranmaları
          </p>
        </div>

        {/* Kayıtlı Üyeler */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Giriş Yapmış Üyeler</span>
            <UserCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400 tracking-tight">
            {memberLogsCount}
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Oturum açmış kayıtlı kullanıcılar
          </p>
        </div>
      </div>

      {/* ── Canlı Aktif Oturumlar Bölümü ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-lg font-bold text-white">Şu Anda Sitede Olanlar (Canlı Oturumlar)</h3>
          </div>
          <span className="text-xs text-zinc-400 bg-zinc-800/80 px-3 py-1 rounded-full border border-zinc-700/60">
            Son 3 dakika içinde aktif
          </span>
        </div>

        {activeVisitors.length === 0 ? (
          <div className="text-center py-10 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
            <Eye className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-400 text-sm font-medium">Şu anda sitede aktif başka ziyaretçi bulunmuyor.</p>
            <p className="text-zinc-600 text-xs mt-1">Yeni bir kullanıcı veya arama motoru botu siteyi ziyaret ettiğinde anında burada belirecektir.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeVisitors.map((session) => (
              <div
                key={session.id || session.sessionId}
                className={`p-4 rounded-2xl border transition-all ${
                  session.isBot
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : session.isMember
                    ? 'bg-purple-950/20 border-purple-500/30'
                    : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {session.isBot ? (
                      <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                        <Bot className="w-4 h-4" />
                      </span>
                    ) : session.isMember ? (
                      <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                        <UserCheck className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                        <Users className="w-4 h-4" />
                      </span>
                    )}

                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        {session.isBot ? (
                          <span className="text-amber-300">{session.botName || 'Arama Botu'}</span>
                        ) : session.isMember ? (
                          <span className="text-purple-300 font-semibold">{session.userNickname || 'Kayıtlı Üye'}</span>
                        ) : (
                          <span className="text-zinc-200">Anonim Ziyaretçi</span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {session.device} • {session.browser}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Canlı
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono text-zinc-300 truncate max-w-[180px]" title={session.path}>
                    {session.path || '/'}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {formatTimestamp(session.lastActive)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bot Dağılımı ve SEO Örümcekleri Panosu ── */}
      {Object.keys(botBreakdown).length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-400" />
              Sitenizi Ziyaret Eden Arama Motoru ve SEO Robotları
            </h3>
            <span className="text-xs text-zinc-400">Google SEO Tarama Sıklığı Göstergesi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(botBreakdown).map(([botName, count]) => (
              <div key={botName} className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-sm font-medium text-zinc-200">{botName}</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/20">
                  {count} tarama
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Ziyaretçi Trafik Logları Tablosu ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-400" />
              Gelen Ziyaretçi ve Tarama Akışı (Canlı Log)
            </h3>
            <p className="text-zinc-400 text-xs mt-1">
              Sayfalara yapılan girişler, cihazlar, kaynaklar ve robot tespitleri.
            </p>
          </div>

          {/* Filtre Butonları */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tümü ({logs.length})
            </button>
            <button
              onClick={() => setFilterType('human')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === 'human'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              İnsanlar ({humanLogsCount})
            </button>
            <button
              onClick={() => setFilterType('bot')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === 'bot'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Robotlar ({botLogsCount})
            </button>
            <button
              onClick={() => setFilterType('member')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterType === 'member'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Üyeler ({memberLogsCount})
            </button>
          </div>
        </div>

        {/* Arama Inputu */}
        <div className="mb-6 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sayfa URL'si, kullanıcı adı, bot adı veya kaynak ara..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Log Tablosu */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-zinc-950/40 rounded-2xl border border-zinc-800/60">
            <p className="text-zinc-400 text-sm">Filtreye uygun ziyaret kaydı bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Ziyaretçi Türü / Kimlik</th>
                  <th className="py-3 px-4">Girdiği Sayfa</th>
                  <th className="py-3 px-4">Cihaz & Tarayıcı</th>
                  <th className="py-3 px-4">Trafik Kaynağı</th>
                  <th className="py-3 px-4 text-right">Zaman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-sm">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                    {/* Kimlik & Tür */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {log.isBot ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                            <Bot className="w-3.5 h-3.5 text-amber-400" />
                            <span>{log.botName || 'Arama Motoru Robotu'}</span>
                          </div>
                        ) : log.isMember ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                            <span>{log.userNickname || 'Üye'}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                            <Users className="w-3.5 h-3.5 text-blue-400" />
                            <span>Normal Ziyaretçi</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Sayfa */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs text-zinc-300 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800/80">
                        {log.path || '/'}
                      </span>
                    </td>

                    {/* Cihaz & Tarayıcı */}
                    <td className="py-3.5 px-4 text-xs text-zinc-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {log.device === 'Mobil' ? (
                          <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
                        ) : (
                          <Laptop className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                        <span>{log.device}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-300">{log.browser}</span>
                        <span className="text-zinc-600">•</span>
                        <span>{log.os}</span>
                      </div>
                    </td>

                    {/* Kaynak */}
                    <td className="py-3.5 px-4 text-xs text-zinc-400 max-w-[200px] truncate" title={log.referrer}>
                      {log.referrer?.includes('google') ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" /> Google Arama
                        </span>
                      ) : log.referrer?.includes('yandex') ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" /> Yandex Arama
                        </span>
                      ) : log.referrer?.includes('bing') ? (
                        <span className="text-blue-400 font-semibold flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" /> Bing Arama
                        </span>
                      ) : (
                        log.referrer || 'Doğrudan (Direct)'
                      )}
                    </td>

                    {/* Zaman */}
                    <td className="py-3.5 px-4 text-xs text-zinc-500 text-right whitespace-nowrap">
                      {formatTimestamp(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Bilgilendirme ve Güvenlik Kartı ── */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 text-xs text-zinc-400 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-zinc-200">Robot ve Kullanıcı Tespiti Nasıl Çalışır?</p>
          <p>
            Sistem; Googlebot, Bingbot, YandexBot gibi arama motoru örümceklerini, SEO tarayıcılarını ve otomatik komut dosyalarını (headless/webdriver) User-Agent imzası ve tarayıcı otomasyon flag'leri ile tespit eder. Bu veriler sadece Admin yetkisine sahip kullanıcılara gösterilir ve Firestore güvenlik kuralları ile üçüncü şahısların okumasına tamamen kapatılmıştır.
          </p>
        </div>
      </div>
    </div>
  );
}
