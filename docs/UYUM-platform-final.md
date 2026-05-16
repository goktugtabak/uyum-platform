# UYUM — Platform Dokümanı
> **Versiyon:** 0.3 — Final Plan  
> **Tarih:** 16-17 Mayıs 2026  
> **Durum:** Hackathon MVP — Build Başlangıcı

---

## 0. Hackathon Brief

| | |
|---|---|
| **Etkinlik** | METU Sports Tech Hackathon 2026 |
| **Yer** | ODTÜ Teknokent CoZone, Ankara |
| **Süre** | 24 saat — 16-17 Mayıs 2026 |
| **Tema** | Spor, Sağlık ve Refah |
| **Araçlar** | Lovable (frontend üretim) + n8n (workflow/API) kredileri sağlanacak |
| **Çıktı** | Çalışan prototip + jüri sunumu (3-5 dakika) |

**Tema durumu:** Ana tema sabit. Hackathon başında ek anahtar kelimeler verilecek. Bunlar projeyi sıfırlamaz — platforma entegre edilir. Dokümanın sonundaki adaptasyon matrisi bu geçişi yönetir.

**Takım önceliği:** Güçlü UI/UX, çalışan demo, net problem anlatısı. Backend minimal ama sıfır değil — Overpass ve OpenAI entegrasyonları aktif, veri katmanı zamanla büyür.

---

## 1. Platform Kimliği

**UYUM**, Türkiye'deki engelli bireylerin spor ve fiziksel aktiviteye erişimini kolaylaştıran, **kendisi de tam erişilebilir** bir platformdur.

### Tek Cümle
> Engelli bireyin "Bu tesis benim için uygun mu?", "Hangi sporu yapabilirim?", "Yakında hangi etkinlik var?" sorularını — gitmeden önce, kendi engel tipine göre — yanıtlayan platform.

### Ne Değil
- Tıbbi tavsiye veren bir uygulama değil
- Egzersiz koçluğu veya rehabilitasyon sistemi değil
- Genel erişilebilirlik haritası değil — spor spesifik
- Sahte yüzde veya skor üreten yapay zeka aracı değil
- Paralimpik yetenek değerlendirme sistemi değil

### Neden Bu Platform Gerekli
Google Maps "tekerlekli sandalye erişimli" etiketini taşır ama havuz lifti olup olmadığını, soyunma odasının genişliğini, personelin işaret dili bilip bilmediğini söylemez. Türkiye'de 9 milyon engelli birey var. Hangi sporları yapabileceklerini, hangi tesislere güvenle gidebileceklerini, yakınlarında ne tür adaptif etkinlikler düzenlendiğini bilen yok. Bu boşluğu dolduran Türkçe, spor spesifik bir platform yok.

### Tek Paragraf Mimari (README + Pitch için)

> UYUM, Vercel üzerinde çalışan erişilebilir bir React frontend'idir. MVP'de kullanıcı profili ve topluluk tanıklıkları cihazda localStorage ile tutulur. n8n, klasik backend yerine yalnızca seçilmiş external API iş akışları için backend-lite orchestration katmanı olarak kullanılır. F3 İlk Ziyaret Rehberi n8n üzerinden OpenAI ile güvenli şekilde üretilir; API başarısız olursa statik rehber fallback'i devreye girer. Overpass verisi demo sırasında canlı çekilmez, önceden cache'lenmiş JSON'dan okunur.

---

## 2. Çözülen Problem — Katman Katman

Her katman bir feature'ı doğurur.

### Katman 1 — Bilgi Boşluğu
"Erişilebilir" etiketi tek boyutlu ve doğrulanmamış. Tekerlekli sandalye kullanıcısının ihtiyacı, görme engellinin ihtiyacından farklı — hiçbir platform bu farkı görmüyor.
→ **F1: Erişilebilirlik Parmak İzi + F2: Tesis Haritası**

### Katman 2 — Hazırlık Boşluğu
İlk ziyaret kaygısı spora katılımı engelleyen başlıca psikolojik bariyer. "Oraya gittiğimde ne olacak?" sorusu cevapsız.
→ **F3: İlk Ziyaret Rehberi**

### Katman 3 — Güven Boşluğu
Statik tesis bilgisi bozulur. Asansör arızalanır, lift bakıma girer — bu değişiklikler hiçbir platformda güncellenmez.
→ **F4: Canlı Durum + Tanıklık Sistemi**

### Katman 4 — Keşif Boşluğu (Spor)
Engelli bireyler hangi sporları yapabileceklerini bilmiyor. Adaptif spor seçeneklerine dair Türkçe, kişiselleştirilmiş ve tesis bağlantılı bir kaynak yok.
→ **F5: Adaptif Spor Eşleştirme**

### Katman 5 — Keşif Boşluğu (Hareket)
"Bu sporu nasıl yapacağım?" sorusu cevapsız. Türkçe, engel tipine göre filtrelenmiş egzersiz içeriği neredeyse yok.
→ **F6: Adaptif Egzersiz İçeriği**

### Katman 6 — Etkinlik Boşluğu
Adaptif spor turnuvaları ve etkinlikler dağınık kanallardan duyuruluyor. Filtrelenmiş etkinlik takvimi yok.
→ **F7: Etkinlik & Turnuva Rehberi**

### Katman 7 — Uzman Boşluğu
Adaptif spor konusunda deneyimli koçlara ulaşmak sistematik olarak mümkün değil.
→ **F8: Koç & Antrenör Dizini**

### Katman 8 — Topluluk Boşluğu
"Benim gibi biri bu tesise gerçekten gitti mi?" sorusu cevapsız. Görünmezlik hissi spora katılımın önündeki en güçlü psikolojik engellerden biri.
→ **F4: Tanıklık Akışı** (Canlı Durum ile aynı feature içinde)

---

## 3. Mimari Kararlar — Değişmez

### Stack

| Katman | Karar | Neden |
|---|---|---|
| **Frontend** | React + Vite + TypeScript | Lovable çıktısıyla uyumlu, hızlı |
| **Stil** | Tailwind CSS | Utility-first, Lovable native |
| **Animasyon** | Framer Motion | F1 morph + erişilebilirlik geçişleri |
| **Grafik** | Recharts | React native, radar chart desteği |
| **Harita** | Leaflet.js + OpenStreetMap | Ücretsiz, Overpass ile uyumlu |
| **Veri (MVP)** | localStorage + mock JSON | Demo güvenli, backend ilerleyen aşamada |
| **AI** | n8n + OpenAI (gpt-4o-mini) | Yalnızca F3 için. Üretim çağrısı n8n workflow üzerinden; OpenAI key ve sistem promptu n8n'de tutulur, frontend bundle'a girmez. |
| **Video İçerik** | YouTube Data API v3 | F6 filtrelenmiş içerik için |
| **Tesis Verisi** | Overpass API + mock erişilebilirlik skoru | Gerçek koordinat, mock erişilebilirlik detayı |
| **Sesli Okuma** | Web Speech API | Browser native, ücretsiz, F3 + F1 için |
| **Deploy** | Vercel | Git push → canlı URL, 2 dakika |

### Veri Stratejisi
Overpass API gerçek tesis koordinatlarını verir. Erişilebilirlik detayları mock JSON'da tutulur. Demo'da açıkça belirtilir: *"Konumlar OpenStreetMap'ten gerçek, erişilebilirlik verileri topluluk tarafından dolduruluyor."* Her mock veriye UI'da görünür `DEMO VERİSİ` rozeti eklenir.

### F1 Radar Kararı
Görsel olarak güçlü duruyorsa radar kalır. Zamanımız kalırsa gerçek Overpass/community verisiyle beslenebilir. Mock veri kullanıldığı sürece `DEMO VERİSİ` etiketi görünür. Radar için gerekli tüm SVG elementleri `aria-label` ile işaretlenir — ekran okuyucu uyumu zorunlu.

### F3 JSON Kuralı — Değişmez
OpenAI yalnızca sağlanan tesis JSON'undan üretim yapar. Sistem promptuna şu hüküm sabit olarak girer:

```
Yalnızca sağlanan JSON'da bulunan alanları kullan.
JSON'da olmayan hiçbir fiziksel detayı çıkarsama,
üretme veya ima etme. Bilgi yoksa o alanı tamamen atla.
```

Her F3 çıktısının altına zorunlu: *"Tesis koşullarını doğrulayamayız — ziyaretten önce tesisi arayın. [Tesis telefonu]"*

Static fallback varsayılan davranıştır. LLM çıktısı opsiyonel zenginleştirme. API başarısız olursa demo durmaz.

### F3 API Çağrı Stratejisi — Kilitli

**Üretim (production / Vercel deploy):** Yalnızca n8n webhook.

```
Frontend → POST ${VITE_N8N_F3_WEBHOOK_URL}  (n8n: /webhook/f3-rehber)
        → n8n workflow (validate → red flag → build prompt → OpenAI → JSON validate)
        → Frontend: { ok, sections, guide, disclaimer }  veya  { ok:false, error }
```

OpenAI API anahtarı, sistem promptu, JSON kısıtı, red flag filtresi ve OpenAI yanıt doğrulaması yalnızca n8n workflow içinde yaşar. Frontend bundle'da hiçbir OpenAI çağrısı veya anahtarı bulunmaz.

**Frontend timeout: 5 saniye.** Aşılırsa sessizce statik fallback rehberi devreye girer. Loading state: ilk anda skeleton, 2 saniye sonra "Rehber hazırlanıyor..." metni, 5 saniye sonra fallback rehber normal içerik olarak görünür. Korkutucu hata mesajı kullanıcıya gösterilmez. Hata ayrıntıları `console.warn` ile sadece DevTools'a düşer.

**Fallback tetikleyiciler:** timeout, network error, CORS error, HTTP 4xx/5xx, malformed JSON, eksik response field (`sections` veya `guide`), eksik webhook URL, `ok:false` ile dönen herhangi bir hata kodu.

**Direkt frontend OpenAI çağrısı production'da kullanılmaz.** Yerel geliştirme sırasında geçici test için `VITE_OPENAI_KEY` opsiyonu korunabilir ama Vercel Environment Variables'a girmez ve repository'de örnek gösterilmez. Detaylı kontrat: [`docs/api-contracts.md`](api-contracts.md).

### n8n Entegrasyon Stratejisi

UYUM bir backend uygulaması değildir. n8n; klasik bir backend yerine **seçilmiş external API iş akışları için backend-lite orchestration katmanı** olarak kullanılır. Kullanıcı profili, tanıklıklar, favoriler, erişilebilirlik ayarları cihazda localStorage'da kalır.

**P1 — Zorunlu (üretimde aktif olmak zorunda):**

- **WF-01 `POST /webhook/f3-rehber`** — F3 İlk Ziyaret Rehberi. Tek çalışma zamanı n8n workflow'u.

**P2 — Opsiyonel showcase (P1 stabil olduktan sonra):**

- **WF-02 `POST /webhook/report-issue`** — Anonim sorun/topluluk geri bildirimi. F4 tanıklık akışını asla bloklamaz; webhook fail olursa local success/fallback devreye girer.

**Roadmap / post-MVP (hackathon'da yapılmaz):**

- WF-03 Etkinlik veri pipeline'ı
- WF-04 Koç veri pipeline'ı
- WF-05 Koç yardım talebi
- WF-06 Overpass cache yenileme workflow'u
- WF-07 Egzersiz içerik küratörlüğü workflow'u

P1 ve polish fazları bitmeden WF-02'ye başlanmaz. Ek zaman çıkarsa ya WF-02 ya WF-03 — ikisi birden değil. Varsayılan tercih WF-02. API kontratları için bkz. [`docs/api-contracts.md`](api-contracts.md).

### Red Flag Kuralı
Herhangi bir metin alanında aşağıdaki ifadeler algılanırsa LLM yanıtı durdurulur, statik yönlendirme ekranı açılır. Liste Türkçe argo varyantlarını kapsar:

```
RED_FLAG = [
  "göğüs ağrısı", "göğsüm sıkışıyor", "kalbim sıkışıyor",
  "nefes alamıyorum", "nefesim daralıyor", "baş dönüyor",
  "bayılacak", "hissizlik", "uyuşma", "çok şiddetli ağrı",
  "hareket edemiyorum"
]
```

---

## 4. Platform Erişilebilirlik Katmanı

> **Bu bölüm feature listesinden ayrıdır. Platformun kendisi erişilebilir olmak zorunda.**
> Engelli bireyler için yapılan ama engelliler tarafından kullanılamayan platform, erişilebilirlik performansıdır — erişilebilirlik değil.
> Sunumda bu özellikler canlı gösterilecek ve ayrıca vurgulanacak.

### A1 — Renk Körlüğü Modu
**Durum: P1 — Tamamen çalışır, sunumda gösterilir**

Header'da toggle. Aktif edilince CSS filtresi ve renk paleti değişir. Tüm bilgi yalnızca renkle değil, ikon ve etiketle de iletilir.

Desteklenen tipler:
- Deuteranopia (kırmızı-yeşil körlüğü, en yaygın)
- Protanopia (kırmızı körlüğü)
- Yüksek Kontrast (genel erişilebilirlik)

```css
/* Örnek: Deuteranopia filtresi */
.colorblind-deuteranopia {
  filter: url('#deuteranopia-filter');
}
```

### A2 — Yüksek Kontrast Modu
**Durum: P1 — Tamamen çalışır, sunumda gösterilir**

WCAG AA → WCAG AAA kontrast oranlarına geçiş. Siyah-beyaz paleti + tek vurgu rengi. Toggle ile açılır.

### A3 — Sesli Okuma (Görme Engelli)
**Durum: P1 — Tamamen çalışır, sunumda gösterilir**

Web Speech API ile tarayıcı üzerinde çalışır, ek kütüphane gerekmez. Aşağıdaki içeriklerde "Sesli Oku" butonu bulunur:
- F1: Tesis erişilebilirlik boyutları
- F3: İlk Ziyaret Rehberi (en kritik — kullanıcı gitmeden dinleyebilir)
- F4: Canlı durum bilgileri
- F5: Spor önerileri

Türkçe dil desteği Web Speech API'de mevcut (`lang: 'tr-TR'`).

```javascript
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'tr-TR';
  utterance.rate = 0.9; // Biraz yavaş — daha net
  speechSynthesis.speak(utterance);
};
```

### A4 — Klavye Navigasyonu
**Durum: P1 — Tüm platform kapsar**

Tüm interaktif elementler Tab ile ulaşılabilir. Enter/Space ile aktif edilir. Harita üzerinde Arrow tuşlarıyla gezinilir. Görünür focus göstergesi — hiçbir element `outline: none` almaz.

Skip-to-content linki: Sayfanın en üstünde görünmez link, Tab'a basınca belirip ana içeriğe atlar.

### A5 — İşitme Engelli UX
**Durum: P1 — Tasarım kararı, ek geliştirme gerektirmez**

Platform ses kullanmaz — tüm bildirimler görseldir. F6 egzersiz videolarında altyazı filtresi aktif (`hasSubtitles: true` olanlar önce sıralanır). Hiçbir uyarı ses çalmaz — yalnızca ekranda görünür ve renk değiştirir.

### A6 — Font Büyüklüğü Kontrolü
**Durum: P2**

Header'da üç seviye: Normal / Büyük / Çok Büyük. CSS `rem` tabanlı ölçekleme — tüm uygulama orantılı büyür.

### A7 — ARIA Standartları
**Durum: P1 — Tüm platform kapsar**

Tüm görsel elementlerde `aria-label`. Radar chart için `role="img"` + `aria-label="[Tesis adı] erişilebilirlik özeti: Giriş erişilebilir, Soyunma bilgi yok..."`. Form elementlerinde `aria-describedby`. Dinamik içerik değişikliklerinde `aria-live`.

---

## 5. Feature Listesi — Atomik

Her feature bağımsız çalışır. Biri bitmeden diğeri başlayabilir.

**Öncelik:**
- **P1** — Demo için zorunlu
- **P2** — Demo'yu güçlendirir, 24h içinde yapılabilir
- **P3** — Pitch deck'te gösterilir, mock yeterli

---

### F1 — Erişilebilirlik Parmak İzi
**Öncelik: P1**

**Ne yapar:**
Her spor tesisinin erişilebilirliği 6 boyutlu radar grafikle gösterilir. Engel tipi değişince Framer Motion ile morph eder. Mock veri kullanıldığı sürece `DEMO VERİSİ` etiketi görünür. Tüm SVG elementleri `aria-label` ile işaretlidir.

**6 Boyut:** Giriş & Otopark / Tesis İçi Hareket / Soyunma & Banyo / Adaptif Ekipman / Personel Yetkinliği / İletişim & Yönlendirme

**Council Kararı — Etiket Sözlüğü (Değişmez):**
F1 boyutları yalnızca dört etiketten biriyle konuşur. UI'da hiçbir sayısal yüzde gösterilmez.

| Etiket | İkon | Veri değeri |
|---|---|---|
| `Doğrulanmış` | ✅ | `verified` |
| `Kısmi` | ⚠️ | `partial` |
| `Mevcut Değil` | ❌ | `none` |
| `Bilgi Yok` | ❓ | `unknown` |

---

### F2 — Tesis Haritası + Engel Tipi Filtre
**Öncelik: P1 — Council 18/18 ile zorunlu tuttu**

**Ne yapar:**
Overpass API ile Ankara'daki gerçek spor tesisleri haritada gösterilir. Her tesis pin'inin rengi aktif engel tipine göre hesaplanır. Profil değişince pin renkleri güncellenir.

**Council Kararı — Hibrit Pin Tasarımı:**
Pin renk hesaplaması kural tabanlıdır, LLM kullanılmaz.

- **Dış halka / arka plan rengi = erişilebilirlik durumu** (aktif engel tipine göre):
  - 🟢 Yeşil — güçlü erişilebilirlik uyumu
  - 🟡 Sarı — kısmi uyum
  - 🔴 Kırmızı — bilinen uyumsuzluk / ciddi kısıt
  - ⚪ Gri — bilgi yok

- **İç ikon = spor tipi** (yüzme, basketbol, tenis, fitness, atletizm…)

Spor filtresi seçili sporları görsel olarak vurgular ama **erişilebilirlik renk durumunu asla bastırmaz**. Harita lejandı her iki katmanı (renk anlamı + spor ikonu anlamı) açıklar.

"Community-sourced" çerçevesi kullanılır — "resmi denetim" değil, "topluluk verisi" dili.

**Veri Stratejisi — Önceden Cache:**
Build sırasında Overpass API bir kez çağrılır, Ankara spor tesisi koordinatları `data/facilities-overpass-cache.json` dosyasına kaydedilir. Demo bu dosyadan yüklenir, canlı Overpass çağrısı demo sırasında yapılmaz. Gerekçe: (1) Overpass public endpoint demo sırasında rate-limit veya yavaşlık yaşatabilir — jüri önünde boş harita risk taşır. (2) Koordinatlar yine OpenStreetMap'ten gerçek, "community-sourced" çerçevesi geçerli kalır. (3) Demo'da tutarlı, anlık tepkili harita. Erişilebilirlik detayları zaten mock JSON'da olduğu için cache stratejisi mevcut veri katmanıyla çelişmez.

**Hata Senaryosu:** Cache dosyası yüklenemezse 6-8 tesislik minimal inline JSON devreye girer. Harita boş açılmaz.

---

### F3 — İlk Ziyaret Rehberi
**Öncelik: P1 — Duygusal ağırlık merkezi**

**Ne yapar:**
Kullanıcı profili + tesis JSON → OpenAI → kişiselleştirilmiş varış rehberi. Giriş yolu, otopark, tesis içi navigasyon, dikkat edilecekler, kime sorulur. Sesli Okuma (A3) ile dinlenebilir. html2canvas ile PDF olarak indirilebilir.

**F3 JSON Kuralı:** Bkz. Bölüm 3. Sistem promptuna sabit olarak girer, değiştirilemez.

**Hata Senaryosu:** API başarısız olursa statik şablon devreye girer. Demo boş ekranla karşılaşmaz.

---

### F4 — Canlı Durum + Tanıklık Sistemi
**Öncelik: P1 — Güven ve topluluk katmanı**

**Ne yapar:**

*Canlı Durum:* Tesis detayında her kritik öğenin son doğrulanma tarihi görünür.
- ✅ Yeşil — 1 hafta içinde doğrulandı
- ⚠️ Sarı — 1 ay içinde doğrulandı
- ❓ Gri — 1 aydan eski veya bilgi yok

*Tanıklık:* "Ben de gittim ✓" — review değil, timestamp bazlı varlık belgesi. Anonim veya isimli. Birikince: *"Bu ay 12 engelli sporcu bu tesisi ziyaret etti."*

*Sorun Bildirimi:* Tanıklık anında opsiyonel kısa form. Tesis verisi güncellenir.

**Atomik Sınır:** localStorage. Backend ilerleyen aşamada.

---

### F5 — Adaptif Spor Eşleştirme
**Öncelik: P1 — Council 18/18 ile zorunlu tuttu**

**Ne yapar:**
3 soru → engel tipine ve hedefe göre spor listesi → Ankara'da erişilebilir tesisler → iletişim. Zincir tam kapanır.

**3 Soru:**
1. Hareket durumun? (oturarak / destekle / bağımsız / kol-el kısıtlı)
2. Hedefin? (güç / esneklik / sosyal / rekabet)
3. Haftada ne kadar zaman ayırabilirsin?

**Akış:**
```
3 soru
   ↓
3 spor önerisi — gerekçeli metin, yüzde yok
   ↓
Her spor için: Ankara'da erişilebilir tesis → harita
   ↓
Tesise tıkla → F1 Parmak İzi + F3 Rehber
   ↓
"Bu sporu öğrenmek istiyorum" → F8 Koç Dizini
```

**Council Kararı:** Kural tabanlı öneri motoru — OpenAI kullanılmaz. Öneri gerekçesi açık metin. Paralimpik bilgisi yok — F7'de etkinlik bilgisi olarak arka planda.

**Sonuç Kartı UI Kuralı (Değişmez):**
F5 sonuç kartları sayısal yüzde veya skor göstermez. İçeride hesaplanan puan sıralama amaçlıdır; UI'da yalnızca sıralama etiketi ve uyum metni yer alır.

- "Sana en uygun #1"
- "Güçlü aday #2"
- "Denemeye değer #3"

Tasarım ekranlarında geçen `%92 Uygunluk` / `%87 Uygunluk` / `%81 Uygunluk` ifadeleri kaldırılır. Dönüşüm:

| Eski (tasarım) | Yeni (üretim) |
|---|---|
| %92 Uygunluk | Çok uygun |
| %78 Uygunluk | Uygun |
| %64 Uygunluk | Kısmi uygun |
| Düşük yüzde / bilgi eksik | Bilgi eksik |

---

### F6 — Adaptif Egzersiz İçeriği
**Öncelik: P2**

**Ne yapar:**
Engel tipine, hareket durumuna ve hedefe göre filtrelenmiş egzersiz videoları. YouTube'da "adaptif egzersiz" aramasında alakasız içerik çıkar — bu feature o boşluğu kapatır. Türkçe ve altyazılı içerikler önce sıralanır (A5 uyumu).

**Filtreleme Etiketleri:**
Hareket tipi / Engel tipi uyumu / Süre / Ekipman / Dil + Altyazı durumu

**İçerik Stratejisi:** MVP'de 15-20 elle küratörlenmiş video. Otomatik öneri değil, manuel seçim.

**Council Kararı:** "Hareket Kütüphanesi" ismi. Her videonun üstünde: *"Bu içerikler bilgilendirme amaçlıdır. Ağrı varsa dur."*

---

### F7 — Etkinlik & Turnuva Rehberi
**Öncelik: P2**

**Ne yapar:**
Adaptif spor etkinlikleri ve turnuvalar tek sayfada. Tarih, konum, engel tipi uyumu, kayıt bilgisi. Kullanıcı profiline göre uygun etkinlikler önce sıralanır.

**Etkinlik Kartı:**
```
🏊  Ankara Adaptif Yüzme Kupası
📅  15 Haziran 2026
📍  Batıkent Olimpik Havuzu  [→ Tesis Erişilebilirliği]
♿  Tekerlekli sandalye kategorisi mevcut
🏁  Seviye: Başlangıç — Orta
🔗  Kayıt: [Federasyon linki]
```

**İçerik Stratejisi:** MVP'de 6-8 mock etkinlik. TBESF ve belediye etkinlikleri referansıyla gerçekçi.

**Council Kararı:** "Hazır hissettiğinde" tonu. Performans hedefi dayatılmaz. Kayıt için federasyon sitesine yönlendirilir.

---

### F8 — Koç & Antrenör Dizini
**Öncelik: P2**

**Ne yapar:**
Adaptif spor konusunda deneyimli antrenörlerin dizini. Uzmanlık, tesis, engel tipi deneyimi, iletişim.

**Bağlantı:** F5 sonunda "Koç bul" → F8. F2 tesis detayında "Bu tesiste çalışan antrenörler" → F8.

**İçerik Stratejisi:** 5-8 mock profil, Ankara merkezli.

---

### F9 — Ana Sayfa Dashboard
**Öncelik: P1 — Demo giriş noktası**

**Ne yapar:**
Kişiselleştirilmiş ana sayfa. Profil oluşturulduktan sonra tek bakışta her şey görünür.

**Bileşenler:**
```
[Eylül — Tekerlekli Sandalye — Ankara]
[Erişilebilirlik Modu Toggleları: Renk Körlüğü / Yüksek Kontrast / Font Büyüklüğü]

SANA YAKINDA
  [Tesis Kartı]  [Tesis Kartı]  [Tesis Kartı →]

TOPLULUKTAN
  "Kemal, Batıkent Havuzu'nda dün yüzdü ✓"
  "Adaptif Tenis Workshopu — 3 gün sonra"

KEŞFET
  [Hangi sporları yapabilirim? →]
  [Egzersiz içeriği →]
  [Yakındaki etkinlikler →]
  [Koç bul →]
```

**Atomik Sınır:** Diğer feature'lardan veri çeker. En sona bırakılır.

---

## 6. Feature Bağlantı Haritası

```
[F9 Ana Sayfa]
     │
     ├── [F2 Harita] ──────────── [F1 Parmak İzi]
     │        │                         │
     │        └── Tesis Detay ────── [F4 Canlı Durum + Tanıklık]
     │                  │
     │                  └── [F3 İlk Ziyaret Rehberi]  ← Sesli Okuma (A3)
     │
     ├── [F5 Spor Eşleştirme] ─── [F2 Harita]
     │        │
     │        └────────────────── [F8 Koç Dizini]
     │
     ├── [F6 Egzersiz İçeriği]
     │
     └── [F7 Etkinlik Rehberi] ── [F2 Harita]
                               ── [F1 Parmak İzi]
                               ── [F8 Koç Dizini]

[Erişilebilirlik Katmanı — Tüm Platform]
  A1 Renk Körlüğü / A2 Yüksek Kontrast / A3 Sesli Okuma
  A4 Klavye Nav / A5 İşitme UX / A6 Font Boyutu / A7 ARIA
```

---

## 7. Veri Modeli — Minimal

### Tesis
```
{
  id: string
  name: string
  coordinates: { lat, lng }
  type: "havuz" | "spor_salonu" | "açık_alan" | "atletizm"
  sports: string[]
  accessibility: {
    wheelchair: { entry, internal, changing, equipment, staff, communication },
    visual:     { entry, internal, changing, equipment, staff, communication },
    hearing:    { entry, internal, changing, equipment, staff, communication },
    upper_limb: { entry, internal, changing, equipment, staff, communication }
  }
  // Her boyut: "verified" | "partial" | "none" | "unknown"
  liveStatus: {
    lift:     { status: boolean | null, verifiedAt: timestamp, verifiedBy: string }
    elevator: { status: boolean | null, verifiedAt: timestamp, verifiedBy: string }
    ramp:     { status: boolean | null, verifiedAt: timestamp, verifiedBy: string }
    changing: { status: boolean | null, verifiedAt: timestamp, verifiedBy: string }
  }
  coaches: string[]
  contact: { phone, email, address }
}
```

### Kullanıcı Profili
```
{
  disabilityType: "wheelchair" | "visual" | "hearing" | "upper_limb"
  mobilityLevel:  "sitting" | "supported" | "independent"
  goals:          Array<"strength" | "flexibility" | "social" | "compete" | "wellbeing">
  interests:      string[]   // ilgi alanları (spor id'leri), opsiyonel çoklu seçim
  city: string
  favoriteFacilities: string[]
  favoriteEvents: string[]
  accessibility: {
    colorblindMode: "none" | "deuteranopia" | "protanopia"
    highContrast: boolean
    fontSize: "normal" | "large" | "xlarge"
    speechEnabled: boolean
  }
}
```

### Tanıklık Kaydı
```
{
  facilityId: string
  timestamp: ISO string
  disabilityType: string
  anonymous: boolean
  displayName?: string
  issueReport?: string
}
```

### Etkinlik
```
{
  id: string
  title: string
  date: ISO string
  facilityId: string
  sport: string
  disabilityTypes: string[]
  level: "başlangıç" | "orta" | "ileri" | "yarışma"
  registrationUrl?: string
  organizer: string
  description: string
}
```

### Koç
```
{
  id: string
  name: string
  sports: string[]
  disabilityExpertise: string[]
  facilityIds: string[]
  yearsExperience: number
  contact: { email, phone }
  bio: string
}
```

### Egzersiz İçeriği
```
{
  id: string
  title: string
  youtubeId: string
  duration: number
  disabilityTypes: string[]
  mobilityLevel: string[]
  equipment: string[]
  language: "tr" | "en"
  hasSubtitles: boolean
  tags: string[]
}
```

---

## 8. Risk Kararları — Değişmez

### Silinen — Tartışmaya Kapalı

| Silinen | Gerekçe | Yerine Ne Var |
|---|---|---|
| **"Uyum %X" yüzdesi** | Sahte kesinlik | Etiket bazlı boyutlar (F1) |
| **"AI Koç" ismi** | Tıbbi otorite iddiası | "Hareket Kütüphanesi" (F6) |
| **Paralimpik yetenek değerlendirme** | LLM'in yapamayacağı görev | F7'de etkinlik bilgisi |
| **Haftalık antrenman plan motoru** | Tıbbi sorumluluk | F6'da filtrelenmiş içerik |
| **Çok adımlı tıbbi anamnez** | Platform kimliğini aşıyor | 3 sorulu profil |
| **"Frontend'den direkt OpenAI" opsiyonu** | Key bundle'a sızar, prompt/red flag bypass edilebilir | n8n workflow tek üretim yolu |
| **Pin renginin spor tipiyle belirlenmesi** | SRS FR-006 ile çelişir, engel tipi sinyalini siler | Hibrit pin: dış halka = erişilebilirlik, iç ikon = spor |
| **F1/F5 sahte yüzde** | SRS FR-002 ve FR-020 ile çelişir | 4 etiket / "Çok uygun / Uygun / Kısmi uygun / Bilgi eksik" |

### Demo Güvenlik Kuralları
- Her AI çağrısının fallback'i var — API kesilse demo durmaz
- Her ekran mock da olsa dolu başlar — boş state demo'da çıkmaz
- Mock data UI'da `DEMO VERİSİ` rozeti ile işaretli
- Red flag listesi aktif, Türkçe argo varyantları dahil

---

## 9. Keyword Adaptasyon Matrisi

| Anahtar Kelime | Entegrasyon Noktası | Değişen | Değişmeyen |
|---|---|---|---|
| **Gençlik** | F9 + F7 gençlik etkinlikleri | Filtre + sunum dili | Tüm platform |
| **Topluluk** | F4 tanıklık öne çıkar | Ana sayfa layout | Core featurelar |
| **Sağlık** | F3 rehbere sağlık notu | 1 prompt satırı | Tüm platform |
| **Erişilebilirlik** | Platform çekirdeği + A katmanı | Sadece sunum açılışı | Hiçbir şey |
| **Teknoloji** | F1 morph + A katmanı demo açılışa | Sunum sırası | Tüm platform |
| **19 Mayıs** | F7'de özel etkinlik kartı | 1 etkinlik mock | Tüm platform |
| **Kapsayıcılık** | Tüm platform + A katmanı | Narratif dili | Hiçbir şey |
| **Spor Performansı** | F5 + F7 öne çıkar | Demo akışı başlangıcı | Tüm platform |
| **Refah** | F4 tanıklık + F8 koç öne çıkar | Sunum vurgu noktası | Tüm platform |

---

## 10. Build Sırası + Bağımlılıklar

```
TEMEL (ilk 2 saat — tüm feature'ların üzerinde çalışacağı zemin)
  Mock data JSON hazırlığı (tüm şemalar dolu)
  Design system: renkler, font, komponent stili
  Erişilebilirlik toggleları: A1 + A2 + A6 (CSS tabanlı, hızlı)
  ARIA temel yapısı

ÇEKIRDEK (saat 2-14)
  F5 Spor Eşleştirme     [OpenAI yok, kural tabanlı — hızlı]
  F2 Harita              [Overpass cache + Leaflet]
  F1 Parmak İzi          [Recharts radar + Framer Motion morph]
  F4 Canlı Durum         [localStorage, F2 tesis detayına girer]
  F3 İlk Ziyaret Rehberi [OpenAI, JSON kısıtı ile — n8n veya direkt çağrı]
  A3 Sesli Okuma         [Web Speech API, F3'e entegre]
  F9 Ana Sayfa Dashboard [diğer P1'lerden veri çeker, çekirdeğin sonunda]

GÜÇLENDIRME (saat 14-20 — saat 14'te yeni feature giremez)
  F6 Egzersiz İçeriği
  F7 Etkinlik Rehberi
  F8 Koç Dizini

SON (saat 20-24)
  Polish + animasyonlar
  Responsive kontrol
  Demo prova (en az 3 kez)
  Vercel deploy
```

**Saat 14 Hard Freeze:** Bu saatten sonra yeni feature giremez. Yetişmeyenler silinir, pitch deck'e taşınır. Yarım feature, ekspoze olmuş zayıflıktır.

### Paralel Çalışma (2 geliştirici)

```
GELİŞTİRİCİ A                      GELİŞTİRİCİ B
────────────────────────            ────────────────────────
Mock data + design system     ←→   Erişilebilirlik toggleları
F1 Radar + morph                    F2 Harita + Overpass cache
F4 Canlı Durum + tanıklık          F5 Spor eşleştirme
F3 OpenAI + PDF + sesli okuma      F9 Ana sayfa
F6 Video embed                      F7 Etkinlik + F8 Koç
Polish + animasyon                  Responsive + ARIA audit
```

---

## 11. Demo Checklist — Sunum Öncesi

**Platform Temeli:**
- [ ] `DEMO VERİSİ` rozetleri tüm mock içerikte görünür
- [ ] Saat 14 freeze tutuldu, yarım feature yok

**P1 Feature'lar — Mutlaka çalışmalı:**
- [ ] F1: Engel tipi değişince radar morph ediyor, aria-label var
- [ ] F2: 5+ Ankara tesisi haritada, pin renkleri engel tipine göre farklı
- [ ] F3: Kişiselleştirilmiş rehber geliyor (fallback hazır, JSON kuralı aktif)
- [ ] F4: Canlı durum + en az 2 tanıklık kaydı görünüyor
- [ ] F5: 3 soru → öneri → tesis linki zinciri çalışıyor
- [ ] F9: Ana sayfa dolu ve profil bilgisini yansıtıyor

**P2 Feature'lar — Demo'yu güçlendirir:**
- [ ] F6: En az 5 video gösteriliyor, filtre çalışıyor
- [ ] F7: En az 5 etkinlik kartı görünüyor
- [ ] F8: Koç listesi görünüyor, bağlantılar var

**Erişilebilirlik — Sunumda gösterilecek:**
- [ ] A1: Renk körlüğü modu toggle çalışıyor, renk paleti değişiyor
- [ ] A2: Yüksek kontrast modu çalışıyor
- [ ] A3: F3 İlk Ziyaret Rehberi sesli okunuyor (Türkçe)
- [ ] A4: Tab ile tüm interaktif elementlere ulaşılıyor
- [ ] A5: Platform ses kullanmıyor, tüm bildirimler görsel
- [ ] A6: Font büyüklüğü toggle çalışıyor (isteğe bağlı)

**Her Koşulda:**
- [ ] Vercel URL canlı ve paylaşılabilir
- [ ] API başarısız olursa fallback devreye giriyor
- [ ] Mobil görünüm kırık değil
- [ ] Red flag listesi aktif

---

## 12. Pitch Deck'e Gidecekler

Sunum slaytında "Yol Haritası" bölümünde gösterilir. Hackathon'da kod yazılmaz.

- Fizyoterapist onay katmanı — F6 içeriği uzman onaylı hale gelir
- Supabase canlı database — community veri gerçek zamanlı
- Tanıklık → operatör bildirim döngüsü — F4'ün eksik halkası
- Türkçe adaptif içerik üretim programı — koçlarla ortak
- Bakanlık / federasyon API entegrasyonu — resmi etkinlik verisi
- Çoklu şehir genişlemesi — İstanbul, İzmir, Bursa

---

## 13. Do Not Do — Scope Guard

Aşağıdaki maddeler hackathon MVP boyunca uygulanmaz. Tartışma açılmaz, kayıt da düşülmez — bu liste karardır.

- ❌ Tam backend (Express, Fastify, NestJS, Django, FastAPI vb.) yazma
- ❌ Gerçek kimlik doğrulama (login, JWT, session)
- ❌ Supabase / Firebase / MongoDB / Postgres / Prisma ekleme
- ❌ Admin paneli / rol sistemi / yönetici akışı
- ❌ F5 spor eşleştirmesinde n8n veya OpenAI kullanma
- ❌ Harita pin renginde n8n veya OpenAI kullanma
- ❌ Kullanıcı runtime'ında canlı Overpass çağrısı
- ❌ Kullanıcı runtime'ında canlı YouTube Data API çağrısı
- ❌ Sahte kesinlikli yüzde (`%92`, `%87`) gösterimi
- ❌ n8n'e ad, e-posta, telefon, kesin konum, cihaz ID, kişisel tanımlayıcı gönderme
- ❌ Hackathon MVP'sinde 7 n8n workflow'unun tamamını kurma
- ❌ Opsiyonel n8n workflow'larının (WF-02+) P1 feature'larını bloklaması
- ❌ Direkt frontend OpenAI çağrısını üretim deploy'una almak

---

*Bu doküman platformun final iskeletidir.*
*Feature detayları, UI kararları, sunum metni ve demo senaryosu ayrı dokümanlarda ele alınır.*
