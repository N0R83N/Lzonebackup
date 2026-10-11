import { db } from '../firebase';
import { doc, setDoc, addDoc, collection, Timestamp, serverTimestamp } from 'firebase/firestore';
import { VisitorSession, VisitorLog } from '../types';

// Bot ve Web Crawler tespiti kuralları
interface BotDetectionResult {
  isBot: boolean;
  botName: string | null;
  botCategory: 'search_engine' | 'seo_crawler' | 'social_bot' | 'scraper' | null;
}

export function detectBot(userAgent: string): BotDetectionResult {
  const ua = (userAgent || '').toLowerCase();

  // 1. Arama motoru robotları (Google, Bing, Yandex, vb.)
  if (ua.includes('googlebot') || ua.includes('google-inspectiontool') || ua.includes('mediapartners-google')) {
    return { isBot: true, botName: 'Googlebot (Google Arama Motoru)', botCategory: 'search_engine' };
  }
  if (ua.includes('bingbot') || ua.includes('msnbot') || ua.includes('bingpreview')) {
    return { isBot: true, botName: 'Bingbot (Microsoft Bing)', botCategory: 'search_engine' };
  }
  if (ua.includes('yandexbot') || ua.includes('yandeximages') || ua.includes('yandexmobilebot') || ua.includes('yandexmetrika')) {
    return { isBot: true, botName: 'YandexBot (Yandex Arama)', botCategory: 'search_engine' };
  }
  if (ua.includes('duckduckbot')) {
    return { isBot: true, botName: 'DuckDuckBot (DuckDuckGo)', botCategory: 'search_engine' };
  }
  if (ua.includes('baiduspider')) {
    return { isBot: true, botName: 'Baiduspider (Baidu Arama)', botCategory: 'search_engine' };
  }
  if (ua.includes('applebot')) {
    return { isBot: true, botName: 'Applebot (Siri & Spotlight)', botCategory: 'search_engine' };
  }
  if (ua.includes('petalbot')) {
    return { isBot: true, botName: 'PetalBot (Huawei Arama)', botCategory: 'search_engine' };
  }
  if (ua.includes('slurp')) {
    return { isBot: true, botName: 'Yahoo! Slurp (Yahoo Arama)', botCategory: 'search_engine' };
  }

  // 2. SEO ve Backlink Tarayıcıları
  if (ua.includes('ahrefsbot')) {
    return { isBot: true, botName: 'AhrefsBot (SEO Analiz)', botCategory: 'seo_crawler' };
  }
  if (ua.includes('semrushbot')) {
    return { isBot: true, botName: 'SemrushBot (SEO Analiz)', botCategory: 'seo_crawler' };
  }
  if (ua.includes('dotbot') || ua.includes('rogerbot')) {
    return { isBot: true, botName: 'Moz DotBot (SEO Analiz)', botCategory: 'seo_crawler' };
  }
  if (ua.includes('screaming frog')) {
    return { isBot: true, botName: 'Screaming Frog SEO Spider', botCategory: 'seo_crawler' };
  }
  if (ua.includes('mj12bot')) {
    return { isBot: true, botName: 'Majestic-12 Bot', botCategory: 'seo_crawler' };
  }

  // 3. Sosyal Medya ve Mesajlaşma Önizleme Botları
  if (ua.includes('facebookexternalhit') || ua.includes('facebot')) {
    return { isBot: true, botName: 'Facebook Link Önizleme', botCategory: 'social_bot' };
  }
  if (ua.includes('twitterbot')) {
    return { isBot: true, botName: 'Twitter / X Kart Botu', botCategory: 'social_bot' };
  }
  if (ua.includes('telegrambot')) {
    return { isBot: true, botName: 'Telegram Bağlantı Önizleme', botCategory: 'social_bot' };
  }
  if (ua.includes('discordbot')) {
    return { isBot: true, botName: 'Discord Link Önizleme', botCategory: 'social_bot' };
  }
  if (ua.includes('whatsapp')) {
    return { isBot: true, botName: 'WhatsApp Link Önizleme', botCategory: 'social_bot' };
  }
  if (ua.includes('linkedinbot')) {
    return { isBot: true, botName: 'LinkedIn Paylaşım Botu', botCategory: 'social_bot' };
  }

  // 4. Otomasyon, Headless ve Kazıma (Scraper) Araçları
  if (typeof navigator !== 'undefined' && (navigator as any).webdriver === true) {
    return { isBot: true, botName: 'WebDriver / Otomasyon Robotu', botCategory: 'scraper' };
  }
  if (ua.includes('headlesschrome') || ua.includes('phantomjs') || ua.includes('puppeteer') || ua.includes('playwright') || ua.includes('selenium')) {
    return { isBot: true, botName: 'Headless / Otomasyon Tarayıcısı', botCategory: 'scraper' };
  }
  if (ua.includes('python-requests') || ua.includes('python-urllib') || ua.includes('aiohttp') || ua.includes('scrapy')) {
    return { isBot: true, botName: 'Python Web Scraper / Bot', botCategory: 'scraper' };
  }
  if (ua.includes('curl/') || ua.includes('wget/') || ua.includes('httpie') || ua.includes('postman')) {
    return { isBot: true, botName: 'Terminal / API Aracı (curl/wget)', botCategory: 'scraper' };
  }
  if (ua.includes('lighthouse') || ua.includes('chrome-lighthouse') || ua.includes('pagespeed')) {
    return { isBot: true, botName: 'Google Lighthouse / Hız Denetçisi', botCategory: 'search_engine' };
  }

  // 5. Genel Bot / Crawler Anahtar Kelimeleri
  if (ua.includes('crawler') || ua.includes('spider') || ua.includes('bot/') || ua.includes('bot;') || ua.includes('archiver')) {
    return { isBot: true, botName: 'Bilinmeyen Web Crawler / Bot', botCategory: 'scraper' };
  }

  return { isBot: false, botName: null, botCategory: null };
}

export function detectDeviceAndBrowser(): {
  device: string;
  browser: string;
  os: string;
} {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { device: 'Bilinmeyen', browser: 'Bilinmeyen', os: 'Bilinmeyen' };
  }

  const ua = navigator.userAgent;

  // Cihaz türü
  let device = 'Masaüstü';
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
  const isMobile = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua);

  if (isTablet) device = 'Tablet';
  else if (isMobile) device = 'Mobil';

  // İşletim Sistemi
  let os = 'Bilinmeyen';
  if (ua.indexOf('Win') !== -1) os = 'Windows';
  else if (ua.indexOf('Mac') !== -1 && ua.indexOf('iPhone') === -1 && ua.indexOf('iPad') === -1) os = 'macOS';
  else if (ua.indexOf('Linux') !== -1 && ua.indexOf('Android') === -1) os = 'Linux';
  else if (ua.indexOf('Android') !== -1) os = 'Android';
  else if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1 || ua.indexOf('iPod') !== -1) os = 'iOS';
  else if (ua.indexOf('CrOS') !== -1) os = 'ChromeOS';

  // Tarayıcı
  let browser = 'Bilinmeyen';
  if (ua.indexOf('Edg') !== -1) browser = 'Edge';
  else if (ua.indexOf('OPR') !== -1 || ua.indexOf('Opera') !== -1) browser = 'Opera';
  else if (ua.indexOf('Brave') !== -1) browser = 'Brave';
  else if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') !== -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';

  return { device, browser, os };
}

// Ziyaretçi ID ve Oturum ID yönetimi
export function getOrCreateVisitorId(): string {
  try {
    let vid = localStorage.getItem('l9_visitor_id');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem('l9_visitor_id', vid);
    }
    return vid;
  } catch {
    return 'v_anon_' + Date.now();
  }
}

export function getOrCreateSessionId(): string {
  try {
    let sid = sessionStorage.getItem('l9_session_id');
    if (!sid) {
      sid = 's_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      sessionStorage.setItem('l9_session_id', sid);
    }
    return sid;
  } catch {
    return 's_temp_' + Date.now();
  }
}

// Ziyareti Firestore'a kaydet ve aktif oturumu güncelle
export interface TrackingParams {
  path: string;
  user?: {
    uid: string;
    nickname?: string;
    role?: any;
    email?: string;
  } | null;
}

let lastLoggedPath = '';
let lastLoggedTime = 0;

export async function trackVisit({ path, user }: TrackingParams) {
  try {
    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const botCheck = detectBot(ua);
    const { device, browser, os } = detectDeviceAndBrowser();
    const referrer = typeof document !== 'undefined' && document.referrer ? document.referrer : 'Doğrudan (Direct)';
    const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '';
    const language = typeof navigator !== 'undefined' ? navigator.language : 'tr';

    const isMember = !!(user && user.uid);
    const userId = user?.uid || null;
    const userNickname = user?.nickname || (isMember ? (user?.email?.split('@')[0] || 'Üye') : null);
    const userRole = user?.role || (isMember ? 'user' : null);

    const now = Timestamp.now();

    // 1. Aktif Oturumu Güncelle veya Oluştur (`visitor_sessions/{sessionId}`)
    const sessionRef = doc(db, 'visitor_sessions', sessionId);
    await setDoc(sessionRef, {
      sessionId,
      visitorId,
      isBot: botCheck.isBot,
      botName: botCheck.botName,
      botCategory: botCheck.botCategory,
      isMember,
      userId,
      userNickname,
      userRole,
      path,
      referrer,
      device: botCheck.isBot ? 'Bot / Sunucu' : device,
      browser: botCheck.isBot ? (botCheck.botName || 'Bot') : browser,
      os: botCheck.isBot ? 'Sunucu' : os,
      screen: screenRes,
      language,
      lastActive: now,
    }, { merge: true });

    // 2. Çok sık log basmayı önle (aynı path için 10 saniye aralık)
    const currentTime = Date.now();
    if (path !== lastLoggedPath || currentTime - lastLoggedTime > 10000) {
      lastLoggedPath = path;
      lastLoggedTime = currentTime;

      const logsRef = collection(db, 'visitor_logs');
      await addDoc(logsRef, {
        visitorId,
        sessionId,
        isBot: botCheck.isBot,
        botName: botCheck.botName,
        botCategory: botCheck.botCategory,
        isMember,
        userId,
        userNickname,
        path,
        referrer,
        device: botCheck.isBot ? 'Bot / Sunucu' : device,
        browser: botCheck.isBot ? (botCheck.botName || 'Bot') : browser,
        os: botCheck.isBot ? 'Sunucu' : os,
        userAgent: ua.substring(0, 300), // İlk 300 karakter yeterli
        timestamp: now,
      });
    }
  } catch (error) {
    // İzleme hatası uygulamanın ana akışını engellememeli
    console.debug('Traffic tracking error:', error);
  }
}

// Canlı oturum kalp atışı (heartbeat)
export async function sendHeartbeat(path: string, user: any) {
  try {
    const sessionId = getOrCreateSessionId();
    const sessionRef = doc(db, 'visitor_sessions', sessionId);
    await setDoc(sessionRef, {
      lastActive: Timestamp.now(),
      path,
      userNickname: user?.nickname || (user?.email ? user.email.split('@')[0] : null),
    }, { merge: true });
  } catch (err) {
    // Sessiz hata
  }
}
