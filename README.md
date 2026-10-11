<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/91631878-ee6b-4670-9a8d-559666666ae7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Oyun ve program kategorileri

Dağıtımdan sonra admin hesabıyla **Admin → Kategoriler → Oyun & Program Kategorilerini Ekle** düğmesine basın. Dört ana kategori ve 39 alt başlık Firestore'a tek işlemde kaydedilir; menü ve içerik formu otomatik güncellenir. Mevcut başlıklar, sıralamalar ve içerikler korunur. Düğme tekrar kullanıldığında aynı alt başlıklar çoğaltılmaz. Sonrasında kategoriler panelden düzenlenebilir veya silinebilir.

Başlıklar `src/lib/categories.ts` içinde tanımlıdır. Filtre bağlantıları Türkçe karakterler ve `&` işareti için URLSearchParams kullanır.
