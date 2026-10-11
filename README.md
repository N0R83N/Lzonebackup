# L9Zone

Oyun ve program paylaşım sitesi. Bu site Nijat tarafından yapıldı. (Noren)

## Yerel çalıştırma

Node.js kurulu olmalıdır.

1. Bağımlılıkları yükleyin: `npm install`
2. Uygulamayı başlatın: `npm run dev`
3. Üretim çıktısını oluşturun: `npm run build`

Firebase bağlantısı `src/firebase.ts` ve `firebase-applet-config.json` üzerinden yapılandırılır.

## Oyun ve program kategorileri

Dağıtımdan sonra admin hesabıyla **Admin → Kategoriler → Oyun & Program Kategorilerini Ekle** düğmesine basın. Dört ana kategori ve 39 alt başlık Firestore'a tek işlemde kaydedilir; menü ve içerik formu otomatik güncellenir. Mevcut başlıklar, sıralamalar ve içerikler korunur. Düğme tekrar kullanıldığında aynı alt başlıklar çoğaltılmaz. Sonrasında kategoriler panelden düzenlenebilir veya silinebilir.

Başlıklar `src/lib/categories.ts` içinde tanımlıdır. Filtre bağlantıları Türkçe karakterler ve `&` işareti için URLSearchParams kullanır.
