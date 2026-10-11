import { Category } from '../types';

export const INITIAL_CATEGORIES: Omit<Category, 'id'>[] = [
  {
    name: 'Oyun',
    order: 0,
    subcategories: [
      'PC Oyunları',
      'Torrent Oyun',
      'Repack Oyunlar',
      'Aksiyon & Macera',
      'RPG & Rol Yapma',
      'Strateji & Simülasyon',
      'Yarış & Spor',
      'Korku & Hayatta Kalma',
      'FPS & Nişancı',
      'Online & Çok Oyunculu',
      'Bağımsız (Indie)',
      'Eski & Nostalji Oyunlar',
      'Türkçe Yama & Modlar',
      'Oyun Hileleri & Trainer'
    ]
  },
  {
    name: 'Yazılım & Programlar',
    order: 1,
    subcategories: [
      'Windows Programları',
      'macOS Programları',
      'Portable (Kurulumsuz)',
      'Sistem & Bakım Araçları',
      'Antivirüs & Güvenlik',
      'Grafik & Tasarım',
      'Video & Ses Düzenleme',
      '3D Modelleme & Animasyon',
      'Ofis & PDF Araçları',
      'İnternet & İndirme Yöneticileri',
      'Yedekleme & Kurtarma',
      'Sürücü (Driver) & Donanım',
      'Geliştirici & Kodlama Araçları'
    ]
  },
  {
    name: 'İşletim Sistemleri',
    order: 2,
    subcategories: [
      'Windows 11',
      'Windows 10',
      'Modlu Windows (Lite / Ghost)',
      'macOS Sürümleri',
      'Linux Dağıtımları',
      'Önyüklenebilir (Bootable) USB Araçları'
    ]
  },
  {
    name: 'Mobil & Emülatör',
    order: 3,
    subcategories: [
      'Android APK & Mod',
      'iOS IPA & Uygulamalar',
      'Android Emülatörleri (PC)',
      'Konsol Emülatörleri (PS/Switch/Xbox)'
    ]
  }
];
