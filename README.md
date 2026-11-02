# L9Zone

L9Zone'u oyun, program ve teknoloji içeriklerini düzenli bir katalogda bir araya getirmek için geliştiriyorum. İçerikler kategori ve alt kategorilere göre gezilebilir; arama ile başlık, açıklama ve etiketler içinde filtrelenebilir.

## Neler var?

- Öne çıkan ve yeni eklenen içerikler için ana sayfa
- Kategori, alt kategori ve arama filtreleri
- Her içerik için ayrı detay sayfası
- E-posta ve Google ile hesap oluşturma ve giriş
- Kullanıcı profili ve şifre sıfırlama
- Yetkili kullanıcılar için içerik ve kategori yönetimi
- Ziyaretçi istatistikleri

Katalog; oyunlar, yazılımlar, işletim sistemleri ve mobil/emülatör içerikleri gibi başlıklara ayrılır. Varsayılan kategori yapısı `src/lib/categories.ts` dosyasında bulunur.

## Kullanılan teknolojiler

React, TypeScript, Vite, Tailwind CSS ve Firebase (Authentication ve Cloud Firestore).

## Yerelde çalıştırma

Gereksinim: Node.js 20 veya üzeri.

```bash
npm install
npm run dev
```

Vite geliştirme sunucusu terminalde gösterdiği yerel adreste açılır.

Tür kontrolü için:

```bash
npm run lint
```

Üretim derlemesi:

```bash
npm run build
```

Bu komut Firestore'daki içerikleri kullanarak site haritası ve içerik detay sayfaları da üretir. Firestore erişimi yoksa bu üretim adımları tamamlanmayabilir.

## Firebase ayarları

Uygulama Firebase Authentication ve Cloud Firestore kullanır. Web uygulaması ayarları `firebase-applet-config.json` dosyasından okunur.

Projeyi kendi Firebase projenle çalıştıracaksan:

1. Firebase'de bir Web uygulaması ve Firestore veritabanı oluştur.
2. Firebase Authentication'da kullanacağın giriş yöntemlerini etkinleştir.
3. Firebase Web uygulaması bilgilerini `firebase-applet-config.json` içine gir.
4. Firestore kurallarını `firestore.rules` dosyasına göre gözden geçirip Firebase Console'dan yayımla.
5. Yayın adresini Firebase Authentication'daki yetkili alan adlarına ekle.

Firebase yapılandırmasını ve güvenlik kurallarını yayımlamadan önce kendi projen için kontrol et. Yönetici erişimini yalnızca yetkili hesaplara ver.

## GitHub Pages

Depo herkese açık olduğu için GitHub Pages'te ücretsiz yayınlanabilir. `main` dalına gönderilen değişiklikler `.github/workflows/pages.yml` iş akışıyla otomatik dağıtılır.

Yayın adresi: [https://n0r83n.github.io/Lzonebackup/](https://n0r83n.github.io/Lzonebackup/)

GitHub Pages, projeyi `/Lzonebackup/` altında sunar. Vite taban yolu ve yönlendirici bu yola göre ayarlanmıştır. İş akışı ayrıca uygulama içindeki bağlantıların doğrudan açılabilmesi için bir `404.html` yedeği üretir.

## Kategori yapısını ekleme

İlk kurulumdan sonra yönetici hesabıyla **Admin → Kategoriler → Oyun & Program Kategorilerini Ekle** seçeneğini kullanarak varsayılan kategori yapısını Firestore'a ekleyebilirsin. Bu işlem tekrarlandığında mevcut kategoriler çoğaltılmaz.

## Proje yapısı

- `src/pages` — ana sayfa, içerik detayları ve profil
- `src/components` — gezinme, giriş ve yönetim arayüzleri
- `src/lib` — kategori tanımları ve yardımcı işlevler
- `firestore.rules` — Firestore güvenlik kuralları
- `.github/workflows/pages.yml` — GitHub Pages dağıtım iş akışı

