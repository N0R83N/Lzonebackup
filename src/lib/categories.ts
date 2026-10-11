import type { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    "id": "catalog-oyun",
    "name": "Oyun",
    "subcategories": [
      "PC Oyunları",
      "Torrent Oyun",
      "Repack Oyunlar",
      "Aksiyon & Macera",
      "RPG & Rol Yapma",
      "Strateji & Simülasyon",
      "Yarış & Spor",
      "Korku & Hayatta Kalma",
      "FPS & Nişancı",
      "Online & Çok Oyunculu",
      "Bağımsız (Indie)",
      "Eski & Nostalji Oyunlar",
      "Türkçe Yama & Modlar",
      "Oyun Hileleri & Trainer"
    ],
    "order": 0
  },
  {
    "id": "catalog-yazilim",
    "name": "Yazılım & Programlar",
    "subcategories": [
      "Windows Programları",
      "macOS Programları",
      "Portable (Kurulumsuz)",
      "Sistem & Bakım Araçları",
      "Antivirüs & Güvenlik",
      "Grafik & Tasarım",
      "Video & Ses Düzenleme",
      "3D Modelleme & Animasyon",
      "Ofis & PDF Araçları",
      "İnternet & İndirme Yöneticileri",
      "Yedekleme & Kurtarma",
      "Sürücü (Driver) & Donanım",
      "Geliştirici & Kodlama Araçları",
      "Linux Programları",
      "Sıkıştırma & Arşiv Araçları"
    ],
    "order": 1
  },
  {
    "id": "catalog-isletim-sistemleri",
    "name": "İşletim Sistemleri",
    "subcategories": [
      "Windows 11",
      "Windows 10",
      "Modlu Windows (Lite / Ghost)",
      "macOS Sürümleri",
      "Linux Dağıtımları",
      "Önyüklenebilir (Bootable) USB Araçları"
    ],
    "order": 2
  },
  {
    "id": "catalog-mobil-emulator",
    "name": "Mobil & Emülatör",
    "subcategories": [
      "Android APK & Mod",
      "iOS IPA & Uygulamalar",
      "Android Emülatörleri (PC)",
      "Konsol Emülatörleri (PS/Switch/Xbox)"
    ],
    "order": 3
  }
];

export function categoryUrl(name: string, subcategory?: string) {
  const params = new URLSearchParams({ category: name });
  if (subcategory) params.set("subcategory", subcategory);
  return `/?${params.toString()}`;
}
