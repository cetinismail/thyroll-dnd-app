
# 🚀 Thyroll D&D Uygulaması - Yayına Alma (Deployment) Rehberi

Uygulamanız canlıya çıkmaya hazır! Aşağıdaki adımları takiperek projenizi **Vercel** üzerinde ücretsiz olarak yayınlayabilirsiniz.

## 1. Hazırlık
Uygulamanızın başarıyla derlendiğini doğruladık (`npm run build`).

## 2. GitHub'a Gönderme
Eğer projeniz henüz GitHub'da değilse:
1.  GitHub'da yeni bir **Private Repository** oluşturun (Örn: `dnd-thyroll-app`).
2.  Proje klasörünüzde terminali açın ve şu komutları sırasıyla girin:
    ```bash
    git init
    git add .
    git commit -m "Deployment v1.0"
    git branch -M main
    git remote add origin https://github.com/KULLANICI_ADINIZ/dnd-thyroll-app.git
    git push -u origin main
    ```

## 3. Vercel Kurulumu
1.  [Vercel Dashboard](https://vercel.com/dashboard) adresine gidin.
2.  **"Add New..."** -> **"Project"** butonuna tıklayın.
3.  GitHub hesabınızı bağlayın ve az önce oluşturduğunuz `dnd-thyroll-app` reposunu seçin.

## 4. Ortam Değişkenleri (Environment Variables)
Vercel'deki **"Configure Project"** ekranında **Environment Variables** bölümüne şu değerleri ekleyin. (Bu değerler `.env.local` dosyanızda mevcuttur):

| İsim | Değer (Örnek) |
|------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xyz...supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |

> ⚠️ **Dikkat:** `SUPABASE_SERVICE_ROLE_KEY` anahtarını Vercel'e eklemenize gerek yoktur (Sadece backend scriptlerinde kullandık).

## 5. Başlat!
- **"Deploy"** butonuna tıklayın.
- Vercel, uygulamanızı otomatik olarak derleyecek ve yayınlayacaktır.
- İşlem bittiğinde size `https://dnd-thyroll-app.vercel.app` gibi bir link verecek.

## 6. Supabase Ayarları (Önemli!)
Uygulama canlıya alındıktan sonra, Supabase üzerinde **Authentication** ayarlarına gitmeniz gerekir:
1.  Supabase Panel -> **Authentication** -> **URL Configuration**.
2.  **Site URL** kısmına Vercel'in size verdiği linki yapıştırın (Örn: `https://dnd-thyroll-app.vercel.app`).
3.  **Redirect URLs** kısmına da `https://dnd-thyroll-app.vercel.app/**` ekleyin.
    *   Bu, Google Login veya E-posta girişinin "Giriş yaptıktan sonra nereye döneceğim?" sorusunu yanıtlar.

Tebrikler! Thyroll artık dünyayla paylaşılmaya hazır. 🌍🎲

## 7. Sürüm Notları (Release Notes)

### v1.2 - 3D Görsel Deneyim & Zar Sistemi (29 Ocak 2026)
Bu sürüm, masaüstü deneyimini dijital ortama taşıyan devrimsel görsel güncellemeler içerir.

#### ✨ Yeni Özellikler
*   **3D Zar Motoru:** Three.js tabanlı, gerçek fizik kurallarına uyan render motoru.
*   **4d6 Drop Lowest:** Karakter yaratma ekranında özel animasyonlu zar atma modu.
    *   4 zar aynı anda atılır.
    *   Sonuçlar büyükten küçüğe sıralanır.
    *   En düşük zar otomatik olarak elenir (üzeri çizilir).
*   **Zar Tepsisi (Tray):** Kullanıcının sonucu görüp onaylamasına ("Sonucu Kullan") veya dilediği kadar tekrar atmasına ("Tekrar At") olanak tanıyan modal yapı.
*   **Skill Entegrasyonu:** Yetenekler sekmesinde ilgili yeteneğe tıklandığında otomatik D20 animasyonu.

#### 🛠️ İyileştirmeler
*   **Performans:** Gereksiz paketler (`react-dice-complete`) kaldırılarak build boyutu küçültüldü.
*   **UX:** Karakter oluşturma sihirbazında veri akışı pürüzsüz hale getirildi.
*   **Görsel:** Camera mesafesi ve ışıklandırma optimize edildi.
