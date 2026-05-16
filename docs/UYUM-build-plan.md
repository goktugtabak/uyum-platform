# UYUM — Faz Faz Build Planı (Claude Code İçin)

> **Hackathon:** METU Sports Tech 2026 — 16-17 Mayıs, 24 saat
> **Hedef:** Demo'ya kadar tüm P1 + P2 feature'lar, A1-A7 erişilebilirlik katmanı tam, Vercel'de canlı.
> **Hedef kitle bu döküman için:** Autonomous Claude Code agent — her faz bağımsız bir oturumda tamamlanır.

---

## 0. Plan Mantığı — Önce Bunu Oku

1. **Faz faz, brick by brick.** Bir faz bitmeden sonraki faza geçilmez. Her faz tek bir Claude Code session'ında tamamlanır.
2. **Definition of Done sözleşmedir.** Faz, DoD'deki tüm maddeler işaretlenmeden kapanmaz. Kalan madde varsa faz devam eder, yeni faza başlanmaz.
3. **Her faz commit ile kapanır.** Commit mesajı `docs-compliance/commit.md` kurallarına uygun olur. Commit öncesi o dosya okunur.
4. **Eksiksizlik kuralı.** Hiçbir feature build sırasında atlanmaz. Yetişmeyen feature pitch deck'e taşınır (ana döküman Bölüm 12) — sessizce silinmez.
5. **Mimari kararlar değişmez.** Ana dökümandaki ("docs/UYUM-platform-final.md") Bölüm 3 kararları sabittir. Faz içinde "daha iyi bir kütüphane buldum" diyerek stack değiştirilmez.
6. **Tasarım uyumu.** Renk, font, spacing, komponent görünümü `design/` klasöründeki tasarımlardan alınır. Improvisation yok — tasarımda yoksa Faz 1'de tanımlanan tokenlardan seçilir.

---

## 0.1. Her Faz Başında Okunacak Dosyalar (Zorunlu)

```bash
# Her fazın ilk komutu bu sırada okumak:
cat docs/UYUM-platform-final.md                 # Ana mimari döküman
cat docs-compliance/commit.md                   # Commit kuralları
ls docs-compliance/                             # Diğer hackathon kuralları
ls design/                                      # Tasarım dosyaları
cat docs/UYUM-build-plan.md                     # Bu plan (mevcut faz)
```

## 0.2. Klasör Yapısı (Faz 0'da Kurulur, Sonra Değişmez)

```
uyum/
├── docs/
│   ├── UYUM-platform-final.md              # Ana döküman
│   └── UYUM-build-plan.md                  # Bu plan
├── docs-compliance/                         # Hackathon kuralları (commit.md vs.)
├── design/                                  # Frontend tasarım dosyaları (arkadaşın)
├── public/
│   └── data/
│       └── facilities-overpass-cache.json   # F2 önceden cache
├── scripts/
│   └── fetch-overpass-cache.mjs             # Build-time Overpass çağrısı
├── src/
│   ├── components/
│   │   ├── a11y/                            # AccessibilityToolbar, vs.
│   │   ├── layout/                          # AppShell, Header, Footer
│   │   ├── ui/                              # Button, Card, Badge, Toggle, SpeakButton
│   │   ├── facility/                        # FacilityCard, AccessibilityRadar
│   │   ├── map/                             # MapView, FacilityPin, FacilityDetail
│   │   └── feature/                         # F3Guide, F4LiveStatus, F5Match, vs.
│   ├── contexts/
│   │   ├── AccessibilityContext.tsx
│   │   └── ProfileContext.tsx
│   ├── data/
│   │   ├── facilities.json
│   │   ├── sports.json
│   │   ├── events.json
│   │   ├── coaches.json
│   │   ├── exercises.json
│   │   └── testimonies.seed.json            # localStorage'a inject edilecek seed
│   ├── hooks/
│   │   ├── useSpeech.ts                     # Web Speech API wrapper
│   │   ├── useLocalStorage.ts
│   │   └── useFacilityScore.ts              # Pin renk + radar skoru
│   ├── lib/
│   │   ├── f3-service.ts                    # F3 API çağrısı + fallback
│   │   ├── redflag.ts                       # Red flag listesi + filtre
│   │   ├── sport-match.ts                   # F5 kural tabanlı algoritma
│   │   └── overpass-loader.ts               # Cache yükle, hata fallback
│   ├── pages/
│   │   ├── Onboarding.tsx                   # İlk açılışta 3 soru
│   │   ├── Dashboard.tsx                    # F9 Ana Sayfa
│   │   ├── MatchSport.tsx                   # F5
│   │   ├── FacilityMap.tsx                  # F2
│   │   ├── FacilityDetail.tsx               # F1 + F3 + F4 burada birleşir
│   │   ├── ExerciseLibrary.tsx              # F6
│   │   ├── EventList.tsx                    # F7
│   │   └── CoachDirectory.tsx               # F8
│   ├── types/
│   │   └── index.ts                         # Tüm TS tipleri
│   ├── styles/
│   │   └── globals.css                      # Tailwind + a11y CSS filtreleri
│   ├── App.tsx
│   └── main.tsx
├── .env.example                             # Boş template
├── .env.local                               # Git'te yok, key buraya
├── .gitignore
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 0.3. Sabit Kararlar (Tüm Fazlarda Geçerli)

- **TypeScript strict mode açık.** `any` kullanılmaz, gerekirse `unknown`.
- **Tailwind utility-first.** Ek CSS minimum — sadece A1 renk körlüğü SVG filter'ları için `globals.css`.
- **Stack listesi dışı dependency eklenmez.** Ana döküman Bölüm 3'teki stack yetiyor: `react`, `react-router-dom`, `framer-motion`, `recharts`, `leaflet`, `react-leaflet`, `html2canvas`, `jspdf`. Ek bir şey eklenecekse önce kullanıcıya sor.
- **localStorage anahtarları** `uyum:` prefix'iyle başlar. Örnek: `uyum:profile`, `uyum:testimonies`, `uyum:a11y`.
- **Mock data tüm dosyaları** `src/data/` altında — koddan import edilir.
- **DEMO VERİSİ rozeti** ana dökümanda zorunlu — her mock kaynaklı içeriğin yanında küçük etiket görünür.
- **Erişim:** Tüm interactive elementler `aria-label` veya görünür `<label>` ile etiketli, hiçbir element `outline: none` almaz.
- **Türkçe varsayılan.** Tüm UI metni Türkçe, kod ve commit mesajları İngilizce/Türkçe karışık olabilir ama tutarlı.

## 0.4. Do Not Do — Scope Guard

Aşağıdaki maddeler hackathon MVP boyunca uygulanmaz. Tartışma açılmaz, kayıt da düşülmez — bu liste karardır. Tam liste için ana doküman Bölüm 13.

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

## FAZ 0 — Repo & Infra Bootstrap

**Süre:** ~30 dk
**Bağımlılık:** Yok
**Hedef hackathon saati:** 0-0:30

### Amaç
Vite + React + TypeScript + Tailwind projesini ayağa kaldır, klasör iskeletini kur, ilk boş "Hello UYUM" sayfasını Vercel'e deploy et. Pipeline çalışıyor olmalı.

### Yapılacak İşler

1. **Repo init:** `git init`, ilk commit boş bir README ile.
2. **Vite scaffold:** `npm create vite@latest . -- --template react-ts`
3. **Tailwind kurulumu:** `npm i -D tailwindcss postcss autoprefixer`, `npx tailwindcss init -p`. `tailwind.config.ts` ve `globals.css` hazırla.
4. **Bağımlılıkları kur:** `react-router-dom`, `framer-motion`, `recharts`, `leaflet`, `react-leaflet`, `@types/leaflet`, `html2canvas`, `jspdf`. Hepsi ana döküman stack'inden.
5. **`.env.example` oluştur:**
   ```
   # F3 İlk Ziyaret Rehberi — üretimde aktif workflow
   VITE_N8N_F3_WEBHOOK_URL=

   # Opsiyonel: WF-02 anonim sorun bildirimi (P1 stabilse Faz 6'da)
   VITE_N8N_REPORT_ISSUE_WEBHOOK_URL=

   # Yerel geliştirme için isteğe bağlı — ÜRETİMDE KULLANILMAZ
   # Üretimde F3, n8n webhook üzerinden çalışır; OpenAI key n8n'de tutulur.
   # VITE_OPENAI_KEY=
   ```
6. **`.gitignore`** — node_modules, dist, .env.local, .vercel.
7. **Klasör iskeleti:** Bölüm 0.2'deki tüm boş klasörleri `mkdir -p` ile oluştur. Her klasörde `.gitkeep` koy.
8. **`App.tsx`** — sadece "UYUM" başlığı + tarih, geçici.
9. **Build smoke test:** `npm run build` hata vermeden bitmeli.
10. **Vercel deploy:** `vercel --prod` (veya GitHub bağlama). URL al, README'ye koy.

### Oluşacak/Değişecek Dosyalar
- `package.json`, `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- `.env.example`, `.gitignore`
- `src/App.tsx`, `src/main.tsx`, `src/styles/globals.css`
- `README.md` — proje adı + Vercel URL + bir cümle açıklama

### Test
- [ ] `npm run dev` çalışıyor, `localhost:5173`'te "UYUM" görünüyor
- [ ] `npm run build` hata vermiyor
- [ ] Vercel URL açılıyor, "UYUM" görünüyor

### Definition of Done
- [ ] Tüm klasör iskeleti var
- [ ] Vercel deploy aktif, URL README'de
- [ ] Tailwind çalışıyor (test: `<h1 className="text-3xl font-bold">UYUM</h1>` doğru render ediyor)
- [ ] `.env.local` dosyası **commit edilmemiş** olarak local'de var
- [ ] `VITE_OPENAI_KEY` production deploy ortam değişkenleri arasında **yok** (Vercel Settings → Environment Variables manuel kontrol)

### Commit
`chore(faz-0): bootstrap vite+react+ts+tailwind, klasör iskeleti, ilk vercel deploy`

---

## FAZ 1 — Tasarım Sistemi + Type Definitions + Mock Data

**Süre:** ~1.5 saat
**Bağımlılık:** Faz 0
**Hedef hackathon saati:** 0:30 - 2:00 (TEMEL aşamasının ana yükü)

### Amaç
Tüm projenin üstüne inşa edileceği zemin: tasarım tokenları, TypeScript tipleri, dolu mock data, Overpass cache. Bu faz biterse F1-F9'un her birine paralel başlanabilir.

### Yapılacak İşler

**1. Tasarım sisteminin çıkarılması:**
   - `ls design/` ile mevcut dosyaları gör.
   - Tasarımda renk paleti, font, spacing, border-radius bul.
   - Tasarım dosyalarında **eksik** olan tokenları (örn. erişilebilirlik renkleri, focus ring) ana dökümanın F1/F2 boyut renkleri ve `verified/partial/none/unknown` durumları için **tut**.
   - `tailwind.config.ts` içinde `theme.extend` altında:
     ```ts
     colors: {
       brand: { /* tasarımdan */ },
       a11y: {
         verified: '#16A34A',  // yeşil ✅
         partial:  '#EAB308',  // sarı ⚠️
         none:     '#DC2626',  // kırmızı ❌
         unknown:  '#9CA3AF',  // gri ❓
       }
     }
     ```
   - Renk körlüğü modu için CSS filter'ları `globals.css`'e SVG `<filter>` olarak ekle (deuteranopia, protanopia matrisleri).

**2. TypeScript tipleri (`src/types/index.ts`):**
   Ana dökümanın Bölüm 7 veri modeline birebir uy. Her tip için interface:
   - `Facility`
   - `UserProfile`
   - `Testimony`
   - `Event`
   - `Coach`
   - `Exercise`
   - `AccessibilityDimension` (verified | partial | none | unknown)
   - `DisabilityType` ('wheelchair' | 'visual' | 'hearing' | 'upper_limb')
   - `MobilityLevel` ('sitting' | 'supported' | 'independent')
   - `Goal` ('strength' | 'flexibility' | 'social' | 'compete')

**3. Mock data dosyaları (`src/data/`):**
   - `facilities.json` — Ankara'da 8-10 tesis, gerçek mahalle isimleri (Batıkent, Çankaya, Kızılay, Mamak, Keçiören). Her tesisin `accessibility` objesi 4 engel tipi × 6 boyut dolu. Gerçekçi karışık değerler — hepsi `verified` olmasın, bazıları `partial`, `unknown` olsun. `liveStatus` 2-3 alan dolu.
   - `sports.json` — 12-15 adaptif spor: `wheelchair_basketball`, `seated_volleyball`, `swimming_para`, `goalball` (görme), `boccia`, `archery`, `paratennis`, vs. Her sporun `suitableFor: DisabilityType[]`, `mobilityLevel: MobilityLevel[]`, `goal: Goal[]`, `description` (Türkçe 2-3 cümle).
   - `events.json` — 6-8 etkinlik, 2026 Mayıs-Eylül tarih aralığı. Her etkinlik bir gerçek `facilityId`'ye bağlı.
   - `coaches.json` — 6-8 koç, Ankara merkezli. `disabilityExpertise` dizisi, `facilityIds` bağlantısı.
   - `exercises.json` — 15-20 YouTube video referansı. Her birinin `youtubeId`, `disabilityTypes`, `mobilityLevel`, `hasSubtitles` alanı dolu. Türkçe içerikler önce, en az 8 tanesi `language: "tr"`.
   - `testimonies.seed.json` — 5-6 tanıklık, 3 farklı tesise dağıtılmış. Bazıları `anonymous: true`, bazıları displayName ile.

**4. Overpass cache scripti (`scripts/fetch-overpass-cache.mjs`):**
   ```js
   // Overpass'a Ankara spor tesisleri sorgusu (leisure=sports_centre, sport=*, swimming_pool, vs.)
   // Yaklaşık 30-50 sonuç bekleniyor — id, name, lat, lon, type
   // Çıktıyı public/data/facilities-overpass-cache.json'a yaz
   // Hata olursa: process.exit(1), build kırılsın — fallback inline JSON Faz 5'te
   ```
   Bu scripti **şimdi bir kez çalıştır**, çıktıyı commit'e dahil et. Demo sırasında bu dosya bundle'lanır.

**5. `DemoBadge` komponenti (`src/components/ui/DemoBadge.tsx`):**
   Küçük, sağ üst köşeye gelen `DEMO VERİSİ` rozeti. Tailwind ile yarı saydam, hover'da tooltip.

**6. API kontrat dokümantasyonu:**
   - `docs/api-contracts.md` dosyasını yaz (Faz 1 başlarken zaten hazır olabilir — kontrol et).
   - Mock response dosyası iskeletini koy: `src/lib/mocks/f3-mock-response.json` (Faz 7'de doldurulur, şimdi `{ "ok": true, "source": "mock" }` yer tutucu).

**7. Tasarım Düzeltme Notu (kalıcı):**
   - Tasarım ekranlarındaki `%92 Uygunluk`, `Erişilebilirlik Puanı %92` gibi sayısal yüzdeler **kullanılmaz**.
   - F1 boyutları: `Doğrulanmış / Kısmi / Mevcut Değil / Bilgi Yok`.
   - F5 kart üst etiketi: `Sana en uygun #1 / Güçlü aday #2 / Denemeye değer #3`.
   - F5 uyum etiketi: `Çok uygun / Uygun / Kısmi uygun / Bilgi eksik`.
   - Bu kural Faz 4, 6, 8'de doğrulanır.

### Oluşacak Dosyalar
- `tailwind.config.ts`, `src/styles/globals.css`
- `src/types/index.ts`
- `src/data/{facilities,sports,events,coaches,exercises,testimonies.seed}.json`
- `scripts/fetch-overpass-cache.mjs`
- `public/data/facilities-overpass-cache.json`
- `src/components/ui/DemoBadge.tsx`

### Test
- [ ] `tsc --noEmit` hata vermiyor — tüm tipler tutarlı
- [ ] Mock JSON'lar TypeScript tipleriyle uyumlu (örnek: `const f: Facility = facilitiesJson[0]` hata vermiyor)
- [ ] Overpass cache JSON'unda en az 20 tesis var
- [ ] `<DemoBadge />` ekranda görünüyor

### Definition of Done
- [ ] 5 mock data dosyası dolu (kapasiteler yukarıda), boş array yok
- [ ] Overpass cache dosyası repo'da, en az 20 tesis koordinatı içeriyor
- [ ] Tailwind config'inde `a11y.verified/partial/none/unknown` renkleri tanımlı
- [ ] `tsc --noEmit` temiz
- [ ] Tasarım dosyalarından çıkarılan renk/font tokenları `tailwind.config.ts`'te

### Commit
`feat(faz-1): tasarım sistemi + types + mock data + overpass cache`

---

## FAZ 2 — Erişilebilirlik Çekirdeği (A1, A2, A4, A5, A6, A7)

**Süre:** ~1 saat
**Bağımlılık:** Faz 1
**Hedef hackathon saati:** 2:00 - 3:00

### Amaç
Platform erişilebilirlik katmanını **tüm uygulamadan önce** kur. Sonradan bolt-on yapılan a11y geç kalır, mevcut komponentleri kırar. Önce iskelet, sonra feature.

> **Not:** A3 (Sesli Okuma) burada değil — Faz 7'de F3 ile birlikte kurulur, çünkü Web Speech API'nin değer üretmesi için okunacak içerik gerekiyor.

### Yapılacak İşler

**1. AccessibilityContext (`src/contexts/AccessibilityContext.tsx`):**
   - State: `colorblindMode`, `highContrast`, `fontSize`, `speechEnabled`
   - localStorage'a `uyum:a11y` anahtarıyla persist
   - Provider App'i sarar

**2. A1 — Renk Körlüğü Modu:**
   - `<html>` veya `<body>` className'i context'e göre değişir: `colorblind-deuteranopia`, `colorblind-protanopia`, `colorblind-none`
   - `globals.css`'te:
     ```css
     .colorblind-deuteranopia { filter: url('#deuteranopia'); }
     .colorblind-protanopia   { filter: url('#protanopia'); }
     ```
   - SVG filter'ları `index.html`'a inline veya `App.tsx`'in en üstüne yerleştir.

**3. A2 — Yüksek Kontrast Modu:**
   - `body.high-contrast` className eklenince Tailwind variant tetiklenir
   - `tailwind.config.ts`'te custom variant tanımla: `addVariant('hc', 'body.high-contrast &')`
   - Komponentlerde gerektiğinde `hc:bg-black hc:text-white` kullanılabilir
   - Default toggle açıldığında siyah-beyaz palet + tek vurgu rengi (sarı)

**4. A6 — Font Büyüklüğü:**
   - 3 seviye: `normal` (16px), `large` (18px), `xlarge` (20px)
   - `<html>` `style.fontSize` ile değiştir, Tailwind `rem` tabanlı olduğu için tüm uygulama orantılı büyür
   - Toggle 3 buton: A / A+ / A++

**5. A4 — Klavye Navigasyonu:**
   - Skip-to-content linki `AppShell`'de en üstte, görünmez, focus alınca belirir
   - Tüm focusable element'lerde `focus-visible:ring-2 focus-visible:ring-brand` (veya tasarımdaki focus rengi)
   - `outline: none` HİÇBİR yerde yok — `globals.css` ile zorla:
     ```css
     *:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
     ```

**6. A5 — İşitme Engelli UX (kod değil, kural):**
   - Bu faz ses kullanmama kuralının tüm bildirim/notification logic'inde geçerli olduğundan emin ol.
   - Eğer bir `Toast` komponenti yapılırsa: sadece görsel, ses yok.
   - F6 video kartlarında `hasSubtitles: true` olanlar önce sıralanır — bu Faz 9'da uygulanacak, burada NOT olarak bırak.

**7. A7 — ARIA Temeli:**
   - `<AppShell>` skeleton: `<header>`, `<main id="main-content">`, `<footer>` landmark'larıyla
   - `aria-live="polite"` bölgesi (`<div id="aria-live-region" />`) Toast/Notification için
   - `sr-only` utility class Tailwind'de hazır (default'ta var)

**8. AccessibilityToolbar komponenti (`src/components/a11y/AccessibilityToolbar.tsx`):**
   - Header'da sağda, 4 toggle:
     - Renk Körlüğü (dropdown: none / deuteranopia / protanopia)
     - Yüksek Kontrast (toggle)
     - Font Büyüklüğü (3 buton)
     - Sesli Okuma (toggle — Faz 7'de aktif edilecek, şimdi UI'da var ama no-op)
   - Her toggle'ın `aria-label`, `aria-pressed` veya `aria-checked` özellikleri doğru
   - Klavye ile erişilebilir

### Oluşacak Dosyalar
- `src/contexts/AccessibilityContext.tsx`
- `src/components/a11y/AccessibilityToolbar.tsx`
- `src/styles/globals.css` (filter'lar + focus stilleri)
- `index.html` (SVG filter tanımları)

### Test
- [ ] Renk körlüğü toggle: Sayfa renkleri filtreye göre değişiyor (gözle kontrol)
- [ ] Yüksek kontrast toggle: Siyah-beyaz palete geçiyor
- [ ] Font büyüklüğü A++ basıldığında tüm metin orantılı büyüyor
- [ ] Tab tuşu ile toolbar'daki tüm toggle'lara ulaşılabiliyor, focus ring görünüyor
- [ ] Sayfa yenilendiğinde son seçimler korunuyor (localStorage)
- [ ] Skip-to-content linki Tab'a basınca beliriyor

### Definition of Done
- [ ] Tüm 4 toggle çalışıyor (Sesli Okuma hariç — UI var, logic Faz 7)
- [ ] localStorage persistance aktif
- [ ] `outline: none` codebase'de yok (`grep` ile kontrol et)
- [ ] axe DevTools (browser extension) ile sayfa açıldığında 0 kritik hata
- [ ] AccessibilityToolbar mobile responsive (Faz 10'da rafine edilecek ama şimdi taşmıyor)

### Commit
`feat(faz-2): a11y çekirdek — A1 A2 A4 A5 A6 A7 toggle ve aria temeli`

---

## FAZ 3 — App Shell + Profil + Routing

**Süre:** ~1 saat
**Bağımlılık:** Faz 2
**Hedef hackathon saati:** 3:00 - 4:00

### Amaç
Tüm sayfaların oturduğu kabuğu kur. Kullanıcının profil oluşturma akışını bitir (**4 adım**: Welcome → Erişim Profili → Hedefler + İlgi → Review) — bu olmadan F5'in girdisi yok, F9 boş kalır.

### Yapılacak İşler

**1. ProfileContext (`src/contexts/ProfileContext.tsx`):**
   - State: `UserProfile | null`
   - `setProfile`, `updateProfile`, `clearProfile`
   - localStorage `uyum:profile` ile persist
   - Profil yoksa `Onboarding` sayfasına yönlendir

**2. Router (`src/App.tsx`):**
   ```
   /             → Dashboard  (profil yoksa /onboarding'e redirect)
   /onboarding   → Onboarding
   /match        → MatchSport (F5)
   /map          → FacilityMap (F2)
   /facility/:id → FacilityDetail (F1 + F3 + F4)
   /exercises    → ExerciseLibrary (F6)
   /events       → EventList (F7)
   /coaches      → CoachDirectory (F8)
   ```

**3. AppShell (`src/components/layout/AppShell.tsx`):**
   - `<Header>` (logo + nav + AccessibilityToolbar + profil avatar/isim)
   - `<main id="main-content">` `<Outlet />`
   - `<Footer>` — minimal, link yok, sadece "UYUM — METU Sports Tech Hackathon 2026"
   - Tasarımdan layout referans alınır

**4. Onboarding sayfası (`src/pages/Onboarding.tsx`) — 4 adım:**

   **Adım 1 — Welcome / Değer Önerisi:**
   - UYUM'un tek cümle tanımı + tek görsel + "Başla" butonu
   - Profil verisi toplanmaz, sadece anlatım
   - Klavye: Enter ile devam, Tab ile "Geç" linkine ulaşılır

   **Adım 2 — Erişim Profili (Engel tipi + Hareket durumu):**
   - Üst alt-bölüm: Engel tipiniz? (4 seçenek: tekerlekli sandalye / görme / işitme / üst ekstremite)
   - Alt alt-bölüm: Hareket durumunuz? (3 seçenek: oturarak / destekle / bağımsız)
     - **Progressive reveal:** engel tipi seçildikten sonra görünür
   - Her iki alt-bölüm de `role="radiogroup"`, ortak ileri butonu
   - `mobilityLevel` F5 algoritmasının zorunlu girdisi — kaldırılamaz

   **Adım 3 — Hedefler + İlgi Alanları:**
   - Hedef (çoklu seçim, en az 1): güç / esneklik / sosyal / yarışma / wellbeing
   - İlgi alanları (opsiyonel çoklu seçim, görsel chip'ler): yüzme / basketbol / tenis / fitness / atletizm / boccia ...
   - Şehir alanı görünmez — sabit "Ankara" (DECISIONS.md mevcut kararı korunur)

   **Adım 4 — Review & Confirm:**
   - Üç adımdan toplanan profil özeti kart halinde
   - "Düzenle" linki her satırın yanında — ilgili adıma döndürür
   - "Profili oluştur" butonu → `ProfileContext`'e yaz → Dashboard'a yönlendir
   - Her seçenek görsel + ikon + metin, klavye ile gezilebilir

**5. Dashboard sayfası iskeleti (`src/pages/Dashboard.tsx`):**
   - **Şimdilik sadece boş kabuk** — Faz 8'de doldurulacak
   - 3 bölüm placeholder: "Sana Yakında", "Topluluktan", "Keşfet"
   - Her bölüm `<DemoBadge />` ile işaretli (içeriği geldikçe rozet kalkar)

### Oluşacak Dosyalar
- `src/contexts/ProfileContext.tsx`
- `src/components/layout/{AppShell,Header,Footer}.tsx`
- `src/pages/{Onboarding,Dashboard}.tsx`
- `src/App.tsx` (router setup)

### Test
- [ ] İlk açılışta `/` → `/onboarding`'e redirect (profil yok)
- [ ] 4 adımı tamamlayınca profil localStorage'a yazılıyor (`uyum:profile`)
- [ ] Yenileyince Dashboard direkt açılıyor, redirect olmuyor
- [ ] AccessibilityToolbar header'da görünür ve çalışıyor
- [ ] Klavye ile 4 adım tamamen tab + arrow + enter ile tamamlanabiliyor
- [ ] Adım 2 progressive reveal: engel tipi seçilmeden hareket durumu görünmez
- [ ] Review (Adım 4) "Düzenle" linkleri ilgili adıma geri yönlendiriyor

### Definition of Done
- [ ] Profil tipleri ana döküman Bölüm 7 ile bire bir uyumlu
- [ ] Profil oluşturma akışı baştan sona klavye + ekran okuyucu ile tamamlanabiliyor (manuel test)
- [ ] Router tüm path'ler tanımlı (sayfalar boş bile olsa 404 yok)
- [ ] `<DemoBadge />` Dashboard'da görünür

### Commit
`feat(faz-3): app shell, profil context, onboarding 3 soru, router iskeleti`

---

## FAZ 4 — F5 Adaptif Spor Eşleştirme

**Süre:** ~1 saat
**Bağımlılık:** Faz 3
**Hedef hackathon saati:** 4:00 - 5:00

### Amaç
P1 feature. Kullanıcı profili → spor önerileri → tesis linki → koç linki zinciri tam çalışır. **OpenAI kullanılmaz** (Council kararı), kural tabanlı algoritma.

### Yapılacak İşler

**1. `sport-match.ts` algoritması (`src/lib/sport-match.ts`):**
   ```ts
   export function matchSports(profile: UserProfile, sports: Sport[]): MatchResult[]
   ```
   - Her sporu profile karşı puanla:
     - `disabilityType` eşleşmesi: +3
     - `mobilityLevel` uyumu: +2
     - `goal` örtüşmesi: +2 (her örtüşen hedef)
   - En yüksek 3 sporu döndür
   - Her sonuç bir `reason` metni ile gelir: *"Tekerlekli sandalye basketbolu sana uygun çünkü oturarak yapılır, takım ruhu ve güç hedeflerini karşılar."* — yüzde yok, gerekçeli düz metin.

**2. MatchSport sayfası (`src/pages/MatchSport.tsx`):**
   - Profil zaten varsa direkt sonuçları göster (3 soru tekrar sorulmaz — Onboarding'de zaten verildi)
   - Üstte "Profilini değiştirmek ister misin?" linki (Onboarding'e döner)
   - 3 spor kartı:
     - İkon + ad
     - Gerekçe metni
     - "Bu sporu yapılabilen tesisleri gör" → `/map?sport=<id>`
     - "Bu sporu öğrenmek istiyorum" → `/coaches?sport=<id>` (F8 hazır olunca aktif)

**3. Boş durum:** Profile uyan spor yoksa "Hareket durumuna göre önerebileceğimiz spor şu anda mock veride yok — yakında daha fazla seçenek" mesajı. Demo'da olmamalı, mock dataya dikkat.

### Oluşacak Dosyalar
- `src/lib/sport-match.ts`
- `src/pages/MatchSport.tsx`
- `src/components/feature/SportMatchCard.tsx`

### Test
- [ ] Tekerlekli sandalye + bağımsız + güç profili: En az tekerlekli basket + tenis öneriliyor
- [ ] Görme + bağımsız + sosyal profili: Goalball önerileniyor
- [ ] Her kartta gerekçe metni var, yüzde yok
- [ ] "Tesisleri gör" linki `/map?sport=...` query param'la açılıyor (F5'e Faz 5'te yorum eklenir)

### Definition of Done
- [ ] 4 farklı profil kombinasyonuyla manuel test edildi, her birinde en az 2 spor dönüyor
- [ ] Hiçbir kartta sayısal yüzde/skor yok (Council kararı)
- [ ] Klavye ile tam gezilebilir, kartlar `role="article"` veya `<article>`

### Commit
`feat(faz-4): F5 adaptif spor eşleştirme — kural tabanlı algoritma, 3 öneri`

---

## FAZ 5 — F2 Tesis Haritası + Leaflet Entegrasyonu

**Süre:** ~1.5 saat
**Bağımlılık:** Faz 4 (F5'ten gelen sport filter için)
**Hedef hackathon saati:** 5:00 - 6:30

### Amaç
P1 feature. Ankara'da gerçek koordinatlardan tesisler haritada. Profile göre pin renkleri. Tesis tıklanınca detay sayfasına (Faz 6'da F1 + F4 burada).

### Yapılacak İşler

**1. Overpass loader (`src/lib/overpass-loader.ts`):**
   ```ts
   export async function loadFacilities(): Promise<Facility[]>
   ```
   - Önce `public/data/facilities-overpass-cache.json`'u fetch et
   - Cache JSON'undaki ham Overpass çıktısını `src/data/facilities.json` (erişilebilirlik detayları olan) ile birleştir — koordinat Overpass'tan, accessibility mock'tan
   - Hata olursa: `src/data/facilities.json`'u direkt döndür (içinde inline koordinatlar olmalı — bu yüzden Faz 1 mock'unda da koordinat ekle, çift güvenlik)

**2. `useFacilityScore.ts` (`src/hooks/useFacilityScore.ts`):**
   ```ts
   export function useFacilityScore(facility: Facility, disabilityType: DisabilityType): {
     overall: 'green' | 'yellow' | 'gray' | 'red'
     dimensions: Record<string, AccessibilityDimension>
   }
   ```
   - 6 boyut skorunu özetle:
     - 4+ `verified` → green
     - 2-3 `verified` veya çoğu `partial` → yellow
     - Çoğu `unknown` → gray
     - 1+ `none` veya bilinen sorun → red

**3. MapView komponenti (`src/components/map/MapView.tsx`):**
   - React Leaflet
   - Ankara merkez koordinatı (39.9334, 32.8597), zoom 12
   - **Custom pin — hibrit tasarım:**
     - **Dış halka rengi** = `useFacilityScore` çıktısı (green / yellow / red / gray)
     - **İç ikon** = tesisin baskın sporu (`facility.sports[0]` veya seçili filtre sporu)
     - SVG path'leri `<g>` içinde, ikon `aria-hidden`, dış halka `role="img"` + `aria-label="[Tesis adı] — erişilebilirlik: yeşil, ana spor: yüzme"`
   - Spor filtresi seçili sporu vurgular (halka kalınlığı artar) ama dış renk erişilebilirlikten gelmeye devam eder — **filtre rengi bastırmaz**
   - Pin tıklanınca: `navigate(`/facility/${id}`)`
   - Sport filter query param varsa (`?sport=basketball_wheelchair`), o sporu yapılabilen tesisler vurgulu, diğerleri soluk (renk durumu korunur)

**4. FacilityMap sayfası (`src/pages/FacilityMap.tsx`):**
   - Üstte: filtre çubuğu — engel tipi (profile göre default, değiştirilebilir), spor (query param'dan)
   - Sol/sağ: tesis listesi (mobile'da accordion)
   - Orta/sağ: harita
   - `<DemoBadge label="Erişilebilirlik verileri topluluk tarafından dolduruluyor" />` görünür

**5. Klavye erişimi:**
   - Harita üzerinde Tab ile pin'lere ulaşılabilir (Leaflet'in default davranışı yetersiz, custom)
   - Tesis listesi tamamen klavye ile gezilir, Enter pin'i seçer

**6. Lejant komponenti (`src/components/map/MapLegend.tsx`):**
   - Sol alt köşe, accordion açılabilir
   - **Renk anlamı:** 4 satır (yeşil / sarı / kırmızı / gri + Türkçe etiket)
   - **Spor ikon anlamı:** 5-8 satır (yüzme / basketbol / tenis / fitness / atletizm…)
   - `aria-expanded` doğru, klavye ile açılır

### Oluşacak Dosyalar
- `src/lib/overpass-loader.ts`
- `src/hooks/useFacilityScore.ts`
- `src/components/map/{MapView,FacilityPin}.tsx`
- `src/pages/FacilityMap.tsx`

### Test
- [ ] Harita 8+ tesisle açılıyor
- [ ] Engel tipi değişince pin renkleri güncelleniyor
- [ ] `?sport=...` query param'la geldiğinde filtre uygulanmış
- [ ] Cache dosyası 404 olsa bile harita yine açılıyor (inline fallback)
- [ ] Tesis listesi klavye ile gezilebilir

### Definition of Done
- [ ] Pin renk hesaplaması kural tabanlı, LLM yok
- [ ] Pin renkleri engel tipine göre değişiyor, **spor filtresi rengi bastırmıyor** — manuel test edildi
- [ ] Pin iç ikonu spor tipini yansıtıyor (dış halka erişilebilirlik, iç ikon spor)
- [ ] Lejant her iki katmanı (renk + ikon) açıklıyor
- [ ] DEMO VERİSİ rozeti görünür ve doğru metinli ("Konumlar OpenStreetMap'ten gerçek...")
- [ ] Hata senaryosu manuel test edildi (cache dosyasını `mv` ile gizle, sayfa yine açılmalı)

### Commit
`feat(faz-5): F2 tesis haritası — leaflet + overpass cache + profile pin renkleri`

---

## FAZ 6 — F1 Erişilebilirlik Parmak İzi + F4 Canlı Durum + Tanıklık

**Süre:** ~2 saat
**Bağımlılık:** Faz 5
**Hedef hackathon saati:** 6:30 - 8:30

### Amaç
Tesis detay sayfasının üç ana feature'ını birleştir. F1 radar üstte, F4 canlı durum + tanıklık altında. F3 (Faz 7'de) bu sayfaya eklenir.

### Yapılacak İşler

**1. AccessibilityRadar komponenti (`src/components/facility/AccessibilityRadar.tsx`):**
   - Recharts `RadarChart` + `PolarGrid` + `PolarAngleAxis` + `Radar`
   - 6 nokta: Giriş & Otopark / Tesis İçi Hareket / Soyunma & Banyo / Adaptif Ekipman / Personel Yetkinliği / İletişim & Yönlendirme
   - Her noktanın değeri etiket bazlı:
     - `verified` = 1.0
     - `partial` = 0.5
     - `none` = 0.0
     - `unknown` = `null` (gri/kesikli çizilir)
   - Renk: profile göre `a11y.verified/partial/none/unknown`
   - **Framer Motion morph:** Engel tipi değişince poligon yumuşakça yeni şekle morph eder (`animate` prop)
   - **ARIA:** `role="img"`, `aria-label` dinamik: *"[Tesis adı] tekerlekli sandalye erişilebilirlik özeti: Giriş doğrulanmış, Soyunma bilgi yok, ..."*
   - Radar yanında etiket listesi (görsel + metin paralel):
     ```
     ✅ Giriş: Doğrulanmış
     ⚠️ Soyunma: Kısmi
     ❓ Ekipman: Bilgi yok
     ```

**2. F4 Canlı Durum komponenti (`src/components/feature/LiveStatus.tsx`):**
   - Her kritik öğe (asansör, lift, rampa, soyunma) için son `verifiedAt`:
     - `< 7 gün`: ✅ Yeşil "Bu hafta doğrulandı"
     - `< 30 gün`: ⚠️ Sarı "Bu ay doğrulandı"
     - `>= 30 gün veya null`: ❓ Gri "Doğrulanmadı"

**3. F4 Tanıklık (`src/components/feature/Testimonies.tsx`):**
   - Liste: `testimonies.seed.json` + localStorage'daki kullanıcı tanıklıkları
   - "Ben de gittim ✓" butonu — tıklayınca:
     - Modal: anonim mi, displayName mı, sorun bildir mi
     - localStorage'a yaz (`uyum:testimonies`)
     - Listeye anlık eklensin (no refresh)
   - Sayım: *"Bu ay bu tesisi 12 engelli sporcu ziyaret etti"* — son 30 gündeki tanıklıkları say

**3.1. Sorun Bildirimi (Opsiyonel WF-02 hook noktası — Faz 6 sonunda):**

   localStorage akışı **birincil ve zorunludur**. Tanıklık + sorun bildirimi her koşulda `uyum:testimonies` altına yazılır. WF-02 webhook yalnızca P1 zinciri (F1+F2+F3+F4+F5+F9 + A katmanı) tamamen stabil olduktan sonra eklenir.

   **Akış (eklenirse):**
   1. Kullanıcı sorun bildirir → önce localStorage'a yaz (success state lokal kalır)
   2. `VITE_N8N_REPORT_ISSUE_WEBHOOK_URL` tanımlıysa fire-and-forget POST gönder
      - Sadece `facilityId`, `issueType`, `message`, `disabilityType`, `anonymous: true`, `createdAt`
      - **Asla gönderilmez:** ad, e-posta, telefon, kesin konum, cihaz ID
   3. Webhook fail/timeout/CORS — kullanıcı görmez, akış lokal başarı ile biter
   4. `console.warn` ile DevTools'a düşür

   **Kabul:** WF-02 yokken de F4 akışı baştan sona çalışır. F4'ün DoD'u WF-02'ye bağlı değildir.

**4. FacilityDetail sayfası (`src/pages/FacilityDetail.tsx`):**
   - URL: `/facility/:id`
   - Tesis bulunamıyorsa "Tesis bulunamadı" + Map'e dönüş linki
   - Layout:
     1. Hero: tesis adı, adres, telefon, fotoğraf placeholder
     2. AccessibilityRadar
     3. LiveStatus
     4. Testimonies
     5. **F3 placeholder** ("İlk Ziyaret Rehberi" butonu — Faz 7'de aktif)
     6. "Bu tesiste çalışan koçlar" → F8'e link (Faz 9'da aktif)

### Oluşacak Dosyalar
- `src/components/facility/AccessibilityRadar.tsx`
- `src/components/feature/{LiveStatus,Testimonies}.tsx`
- `src/pages/FacilityDetail.tsx`

### Test
- [ ] Radar 6 boyutla çiziliyor, profile değişince morph ediyor
- [ ] Radar'ın `aria-label`'ı tüm 6 boyutu Türkçe okuyor
- [ ] "Ben de gittim" tanıklık eklendiğinde liste anında güncelleniyor
- [ ] Sayım doğru (son 30 gün)
- [ ] Sorun bildirimi formu çalışıyor, localStorage'a yazıyor
- [ ] Anonim toggle: displayName gizleniyor

### Definition of Done
- [ ] Radar'da yüzde yok, sadece etiket
- [ ] `unknown` değerler radar'da kesikli/gri görünüyor (Council kararı: bilgi yokluğu gizlenmiyor)
- [ ] Tanıklık + LiveStatus localStorage tabanlı, refresh sonrası kalıyor
- [ ] Tüm interactive element klavye ile erişilebilir

### Commit
`feat(faz-6): F1 radar + F4 canlı durum + tanıklık — tesis detay birleşik`

---

## FAZ 7 — F3 İlk Ziyaret Rehberi + A3 Sesli Okuma + PDF Export

**Süre:** ~2 saat
**Bağımlılık:** Faz 6 (F3 FacilityDetail'e oturur)
**Hedef hackathon saati:** 8:30 - 10:30

### Amaç
F3 — duygusal ağırlık merkezi. OpenAI çağrısı (n8n veya direkt — bu fazın başında kullanıcıdan karar alınır). A3 sesli okuma F3 başta olmak üzere F1, F4, F5'e entegre.

### Mimari Karar — Kilitli, Sormadan Devam Et

F3 üretimde **yalnızca n8n webhook üzerinden** çalışır. Frontend'den direkt OpenAI çağrısı bu fazda implement edilmez. `VITE_OPENAI_KEY` production'a girmez. Kullanıcıya seçenek sorulmaz — karar `docs/UYUM-platform-final.md` Bölüm 3 "F3 API Çağrı Stratejisi"nde kilitli, kontrat `docs/api-contracts.md` WF-01'de.

### Yapılacak İşler

**1. Red flag kütüphanesi (`src/lib/redflag.ts`):**
   ```ts
   export const RED_FLAGS = [
     "göğüs ağrısı", "göğsüm sıkışıyor", "kalbim sıkışıyor",
     "nefes alamıyorum", "nefesim daralıyor", "baş dönüyor",
     "bayılacak", "hissizlik", "uyuşma", "çok şiddetli ağrı",
     "hareket edemiyorum"
   ]
   export function containsRedFlag(text: string): boolean
   ```
   - F3 sonucunda kullanılır — eğer LLM yanıtı veya kullanıcı girdisi red flag içerirse statik yönlendirme ekranı: "Lütfen bir sağlık profesyoneline danışın. Acil durum: 112"

**2. F3 service (`src/lib/f3-service.ts`):**

   - **Tek çağrı yolu:** n8n webhook (`VITE_N8N_F3_WEBHOOK_URL`).
   - Input: `{ profile: UserProfile, facility: Facility }`
   - Output: `{ ok: true, sections: {...}, guide, warningAppended, disclaimer }` veya `{ ok: false, error: '...' }` (bkz. `docs/api-contracts.md`)
   - **Timeout: 5 saniye.** `AbortController` ile sertçe kesilir.
   - **Loading UX:**
     - 0 sn: skeleton görünür
     - 2 sn: skeleton üstüne "Rehber hazırlanıyor..." metni
     - 5 sn timeout: sessizce `fallbackGuide()` çıktısı normal içerik olarak akar
   - **Fallback tetikleyiciler (hepsi aynı sonuca gider):**
     1. Timeout (5 sn)
     2. Network error
     3. CORS error
     4. HTTP 4xx/5xx
     5. Malformed JSON
     6. Response'da `sections` veya `guide` yok
     7. `VITE_N8N_F3_WEBHOOK_URL` env tanımlı değil
     8. `ok: false` ile dönen herhangi bir hata kodu
   - **Hata UX kuralı:** Korkutucu mesaj **yok**. Kullanıcı fallback ile normal rehber görüyormuş hissinde olur. Detay `console.warn`'a düşer.
   - **Red flag:** Frontend'de yine `containsRedFlag()` çağrılır — kullanıcı metni içeren akış varsa eşleşme durumunda n8n çağrısı atılmaz, yönlendirme ekranı açılır. (n8n tarafında da ikinci kademe red flag node bulunur — defense in depth.)
   - Sistem promptu **frontend'de tutulmaz** — n8n workflow Build Prompt node'unda yaşar.

**3. Statik fallback şablonu (`src/lib/f3-fallback.ts`):**
   - Profil + tesis JSON'undan template doldur:
     ```ts
     export function fallbackGuide(profile, facility): string {
       const parts = []
       if (facility.accessibility[profile.disabilityType].entry === 'verified')
         parts.push("Giriş erişilebilir.")
       // ... her boyut için benzer
       parts.push(`Tesis koşullarını doğrulayamayız — ziyaretten önce tesisi arayın. ${facility.contact.phone}`)
       return parts.join("\n\n")
     }
     ```
   - **Demo durmasın** — API hatası fallback gösterimi başarılı görünür, kullanıcı farkı anlamaz.

**4. F3Guide komponenti (`src/components/feature/F3Guide.tsx`):**
   - Loading state: skeleton + "Rehber hazırlanıyor..."
   - Success state: paragraflar, her birinin yanında 🔊 Sesli Oku butonu
   - Error/Fallback state: statik şablon (kullanıcıya "fallback" olduğu hissettirilmez, normal görünür)
   - Red flag detected state: yönlendirme ekranı
   - Footer'da: zorunlu uyarı + 📄 PDF olarak indir butonu

**5. A3 — Sesli Okuma hook (`src/hooks/useSpeech.ts`):**
   ```ts
   export function useSpeech() {
     const speak = (text: string) => {
       const u = new SpeechSynthesisUtterance(text)
       u.lang = 'tr-TR'
       u.rate = 0.9
       speechSynthesis.speak(u)
     }
     const stop = () => speechSynthesis.cancel()
     return { speak, stop, speaking }
   }
   ```
   - Komponent `SpeakButton` (`src/components/ui/SpeakButton.tsx`) — herhangi bir metni alır, butonu render eder
   - Şu yerlere ekle:
     - F1 radar yanındaki etiket listesi (Faz 6'da yer ayır)
     - F3 her paragraf
     - F4 canlı durum başlıkları
     - F5 spor öneri gerekçeleri

**6. PDF export:**
   - `html2canvas` + `jspdf` kullan
   - F3Guide içeriğini canvas'a çevir, A4 PDF'e bas, indir
   - Dosya adı: `UYUM-{tesisAdi}-ziyaret-rehberi.pdf`

**7. AccessibilityContext'te `speechEnabled` aktif edilir** — Faz 2'de UI vardı ama no-op'tu. Şimdi SpeakButton'lar bu flag'e göre görünür/gizli.

### Oluşacak Dosyalar
- `src/lib/{redflag,f3-service,f3-fallback}.ts`
- `src/hooks/useSpeech.ts`
- `src/components/feature/F3Guide.tsx`
- `src/components/ui/SpeakButton.tsx`
- `.env.local` (yalnızca `VITE_N8N_F3_WEBHOOK_URL` — `VITE_OPENAI_KEY` production'a girmez)

### Test
- [ ] **Happy path:** F3 butonu → loading → rehber metni geliyor → sesli okuma çalışıyor → PDF indiriliyor
- [ ] **API hatası simülasyonu:** Network'ü kapat (DevTools offline), F3 butonu → fallback şablon görünüyor, demo durmuyor
- [ ] **n8n timeout simülasyonu:** n8n workflow'unu durdur veya yanıtı 6+ sn geciktir → 5 sn sonunda fallback metni görünüyor, hata mesajı yok
- [ ] **n8n malformed response:** Webhook test modunda kasten `{"foo":"bar"}` döndür → fallback devreye giriyor
- [ ] **n8n webhook URL eksik:** `.env.local`'dan `VITE_N8N_F3_WEBHOOK_URL` kaldır → fallback direkt görünüyor, console.warn düşüyor
- [ ] **n8n CORS:** Vercel domain'inden çağrı CORS hatası vermiyor
- [ ] **Red flag testi:** Test amaçlı bir tesis description'ına "göğüs ağrısı" ekle, F3 tetiklenince yönlendirme ekranı çıkıyor
- [ ] **Sesli okuma Türkçe:** "Merhaba dünya" cümlesi Türkçe aksanla okunuyor
- [ ] **PDF:** İndirilen PDF açılıyor, içerikte tesis adı ve rehber metni okunabilir

### Definition of Done
- [ ] F3 yalnızca n8n yolunu çağırıyor; direkt OpenAI çağrısı yok
- [ ] Timeout 5 saniye olarak ayarlı, manuel test geçti
- [ ] 7 fallback tetikleyicinin tamamı manuel olarak doğrulandı (en az 3'ü gerçek ortamda denendi)
- [ ] Fallback her API hatasında devreye giriyor — demo boş ekran göstermiyor
- [ ] Red flag listesi en az 11 ifade içeriyor (ana döküman); hem frontend hem n8n tarafında aktif
- [ ] Zorunlu uyarı her F3 çıktısında görünür
- [ ] PDF Türkçe karakterleri doğru render ediyor (font embed kontrolü)
- [ ] SpeakButton 4 yerde aktif (F1, F3, F4, F5)

### Commit
`feat(faz-7): F3 ilk ziyaret rehberi + A3 sesli okuma + PDF export + red flag`

---

## FAZ 8 — F9 Ana Sayfa Dashboard

**Süre:** ~1 saat
**Bağımlılık:** Faz 7 (önceki tüm P1'ler — F1, F2, F3, F4, F5 — bitmiş olmalı)
**Hedef hackathon saati:** 10:30 - 11:30

### Amaç
ÇEKİRDEK'in son adımı, demo giriş noktası. Diğer feature'lardan veri çeken aggregator. Bu faz biterse demo'nun ana hattı tamam — saat 14 freeze öncesi rahat nefes.

### Yapılacak İşler

**1. Dashboard layout (`src/pages/Dashboard.tsx`):**
   Üstte profil bilgisi:
   ```
   [Avatar] Eylül — Tekerlekli Sandalye — Ankara — Hedef: Sosyal
   [Profili düzenle linki]
   ```

**2. "Sana Yakında" bölümü:**
   - 3 tesis kartı, profile en uygunları (F2 score logic'ini kullan, `green` olanları öncele)
   - Her kart: tesis adı, ana spor, küçük radar mini-preview, "Detay" butonu

**3. "Topluluktan" bölümü:**
   - Son tanıklıklar (max 3, en yeniler): *"Kemal, Batıkent Havuzu'nda dün yüzdü ✓"*
   - Yakın etkinlik (max 1): *"Adaptif Tenis Workshopu — 3 gün sonra"* (F7 mock'tan)

**4. "Keşfet" bölümü (4 büyük buton):**
   - 🏊 Hangi sporları yapabilirim? → `/match`
   - 🏋️ Egzersiz içeriği → `/exercises`
   - 📅 Yakındaki etkinlikler → `/events`
   - 🧑‍🏫 Koç bul → `/coaches`

**5. Erişilebilirlik toggleları zaten Header'da, Dashboard'da ayrıca tekrar gösterme.**

**6. Dashboard ↔ n8n Sınırı (Önemli):**
   Dashboard tüm verileri local/static kaynaktan çeker (mock JSON + localStorage). Dashboard'dan tek runtime n8n çağrısı yapılabilir: "İlk ziyaret rehberi oluştur" CTA → WF-01. Bu CTA tesis kartı detayına gitmeden hızlı bir rehber tetikleyebilir, ama feature kapsam dışıdır — varsa polish'te, yoksa Faz 7 akışına bırakılır.

   "Topluluktan" bölümü `uyum:testimonies` + `testimonies.seed.json`'dan beslenir; n8n çağrısı **yok**.

### Oluşacak Dosyalar
- `src/pages/Dashboard.tsx` (Faz 3'teki placeholder dolduruluyor)
- `src/components/feature/{MiniFacilityCard,CommunityFeed,DiscoverGrid}.tsx`

### Test
- [ ] Profil tekerlekli sandalye → "Sana Yakında" tekerlekli sandalye uyumlu tesisleri gösteriyor
- [ ] Tanıklık eklediğimde "Topluluktan" anında güncelleniyor
- [ ] 4 keşfet butonu doğru sayfalara yönlendiriyor
- [ ] Mobile'da grid bozulmuyor

### Definition of Done
- [ ] Boş state yok — tüm bölümler dolu başlıyor (mock data + seed tanıklıklar yetiyor)
- [ ] Klavye gezilebilirlik tam
- [ ] DEMO VERİSİ rozetleri ilgili kartlarda görünür

### Commit
`feat(faz-8): F9 ana sayfa dashboard — aggregator, sana yakında + topluluktan + keşfet`

---

## ÇEKİRDEK BİTTİ — SAAT 14 HARD FREEZE ÖNCESİ ARA KONTROL

**ÖNEMLİ:** Faz 8 sonunda, GÜÇLENDİRME aşamasına geçmeden önce aşağıdaki kontrolü yap:

- [ ] F1 morph çalışıyor, ARIA tam
- [ ] F2 harita 8+ tesis, profile pin
- [ ] F3 rehber + fallback + sesli okuma + PDF
- [ ] F4 canlı durum + tanıklık + localStorage
- [ ] F5 öneri zinciri
- [ ] F9 ana sayfa dolu
- [ ] A1, A2, A4, A5, A6, A7 toggle ve davranış aktif
- [ ] A3 sesli okuma 4 noktada
- [ ] Vercel deploy bu commit ile güncel

Eksik varsa Faz 9'a başlama, eksiği bitir. Demo'nun core'u burası — F6/F7/F8 olmadan da demo verilebilir, ama yukarıdakilerden biri eksikse demo çöker.

---

## FAZ 9 — F6 Egzersiz + F7 Etkinlik + F8 Koç (GÜÇLENDİRME)

**Süre:** ~2 saat
**Bağımlılık:** Faz 8 + ara kontrol
**Hedef hackathon saati:** 11:30 - 13:30

### Amaç
P2 feature'lar — demo'yu zenginleştirir, fakat ÇEKİRDEK'in core'u olmadan da iş görür. Eğer süre dar geliyorsa F8 atlanabilir (en az kritik), pitch deck'e taşınır.

F6 (egzersiz), F7 (etkinlik) ve F8 (koç) verileri **JSON-first**'tür: `src/data/*.json` tek kaynak. Hackathon MVP'sinde bu üç feature için n8n runtime çağrısı yapılmaz. WF-03/WF-04/WF-07 pitch deck roadmap'inde.

### Yapılacak İşler

**1. F6 — ExerciseLibrary (`src/pages/ExerciseLibrary.tsx`):**
   - 15-20 YouTube embed kart (`<iframe src="https://www.youtube.com/embed/...">`)
   - Üstte filtre: engel tipi (profile default), hareket tipi, süre, dil
   - `hasSubtitles: true` olanlar önce sırala (A5 uyumu)
   - Her kart üstünde: *"Bu içerikler bilgilendirme amaçlıdır. Ağrı varsa dur."*
   - Manuel küratör — YouTube Data API kullanma, `exercises.json`'dan yükle.
   - DEMO VERİSİ rozeti.

**2. F7 — EventList (`src/pages/EventList.tsx`):**
   - 6-8 etkinlik kartı, `events.json`'dan
   - Her kart: spor ikonu, başlık, tarih, tesis adı (link → /facility/:id), engel tipi badge'i, kayıt linki
   - Profile uygun etkinlikler önce sıralanır
   - Filtre: tarih aralığı, spor, engel tipi
   - "Hazır hissettiğinde" tonu — performans dayatması yok

**3. F8 — CoachDirectory (`src/pages/CoachDirectory.tsx`):**
   - 6-8 koç kartı, `coaches.json`'dan
   - Her kart: ad, deneyim, uzmanlık (spor + engel tipi), tesis bağlantıları, iletişim
   - Query param `?sport=...` ile filtre (F5'ten geliş için)
   - Tesis detayında "Bu tesiste çalışan koçlar" linki F8'e yönlendirir

### Oluşacak Dosyalar
- `src/pages/{ExerciseLibrary,EventList,CoachDirectory}.tsx`
- `src/components/feature/{ExerciseCard,EventCard,CoachCard}.tsx`

### Test
- [ ] F6: Engel tipi filtresi videoları daraltıyor, en az 5 video kalıyor
- [ ] F6: Altyazılı içerikler önce
- [ ] F7: Profile uyan etkinlikler üstte
- [ ] F8: `?sport=...` ile geldiğinde filtreli
- [ ] Tüm sayfalar klavye gezilebilir

### Definition of Done
- [ ] Üç sayfa da dolu, boş state yok
- [ ] Tüm linkler doğru yönlendiriyor
- [ ] DEMO VERİSİ rozetleri var
- [ ] F6/F7/F8 sayfaları runtime n8n çağrısı yapmıyor (network tab manuel doğrulandı)

### Commit
`feat(faz-9): F6 egzersiz + F7 etkinlik + F8 koç dizini`

---

## FAZ 10 — Polish + Animasyonlar + Responsive + ARIA Audit

**Süre:** ~1.5 saat
**Bağımlılık:** Faz 9 (veya Faz 8 + ara kontrol — eğer F8 atlandıysa)
**Hedef hackathon saati:** 13:30 - 15:00 (saat 14 freeze artık geride, polish zamanı)

### Amaç
Yarım hiçbir şey yok, görünüm tutarlı, mobile bozuk değil, a11y audit temiz.

### Yapılacak İşler

**1. Sayfa geçiş animasyonları (Framer Motion):**
   - Route değişimi: fade-in + 10px translateY
   - F1 radar morph zaten var, doğrula

**2. Mobile responsive:**
   - Tüm sayfalar 360px ekranda taşmıyor
   - Harita mobile'da tam ekran
   - Tesis detay mobile'da tek kolon

**3. Boş state taraması:**
   - `grep` ile "TODO", "FIXME", lorem ipsum, placeholder text kalmasın
   - Her sayfada `<DemoBadge />` doğru yerde

**4. ARIA audit:**
   - Browser'da axe DevTools, her sayfayı tara
   - 0 kritik hata, 0 ciddi hata
   - Uyarılar (best practice) maksimum 3 — kalanlar README'de "bilinen sınırlar" olarak not edilir

**5. Performance:**
   - Lighthouse audit Dashboard'da: Performance 80+, A11y 95+, Best Practices 90+
   - Görsel optimizasyon (varsa large image'lar webp)

**6. Loading state'leri:**
   - F3 loading skeleton
   - Map loading spinner
   - Genel boş data loading

**7. Error boundary:**
   - `<ErrorBoundary>` App'i sarar — JS hata olursa "Bir şey ters gitti, demo URL'sini paylaş" mesajı (demo'da hata gizli kalsın)

**8. Yüzde Temizliği (Tasarım Düzeltme):**
   - Tüm sayfaları tara, kalan `%XX Uygunluk` / `Puan %XX` metnini bul ve sil
   - F1 boyut etiketleri: `Doğrulanmış / Kısmi / Mevcut Değil / Bilgi Yok`
   - F5 sıralama: `Sana en uygun #1 / Güçlü aday #2 / Denemeye değer #3`
   - F5 uyum metni: `Çok uygun / Uygun / Kısmi uygun / Bilgi eksik`

**9. DEMO VERİSİ Rozet Audit:**
   - Her mock kaynaklı içerik bileşeninde `<DemoBadge />` görünür
   - Grep ile `facilities.json`, `events.json`, `coaches.json`, `exercises.json`, `sports.json`, `testimonies.seed.json` consumer'larını tara — eksiği ekle

**10. Erişilebilirlik Mod Toggle ↔ Renk Semantiği Senkronizasyonu:**
   - Renk körlüğü ve yüksek kontrast modlarında pin renkleri ayırt edilebilir mi? Manuel test (deuteranopia + protanopia + yüksek kontrast)
   - Renk + ikon + etiket üçlüsünün her birinde tek başına da bilgi aktarması: pin'de ikon, radar'da etiket, F4 durumda metin + ikon

**11. Renk-Tek-Bilgi Tarama:**
   - "Yeşil = iyi, kırmızı = kötü" mantığıyla **yalnızca renge bağlı** hiçbir bilgi kalmasın. Her renkli durumun yanında ikon ve metin etiketi bulunmalı. Audit listesi: F1 radar, F2 pin, F4 canlı durum, F5 uyum etiketi.

### Test
- [ ] Lighthouse A11y skoru 95+
- [ ] iPhone SE (375px) ekranda hiçbir sayfa kırık değil
- [ ] axe DevTools 0 kritik hata
- [ ] Tab + Shift+Tab ile tüm uygulama gezilebiliyor, focus visible

### Definition of Done
- [ ] Tüm Demo Checklist (ana döküman Bölüm 11) maddeleri ✅
- [ ] Bilinen sınırlar README'de listelenmiş
- [ ] Error boundary aktif

### Commit
`polish(faz-10): animasyonlar + responsive + aria audit + lighthouse`

---

## FAZ 11 — Demo Prova + Final Deploy

**Süre:** ~1 saat
**Bağımlılık:** Faz 10
**Hedef hackathon saati:** 15:00 - 16:00 (sunum öncesi son saatler için buffer)

### Amaç
Demo akışını 3 kez kesintisiz çalıştır, final Vercel deploy, URL paylaşılabilir.

### Yapılacak İşler

**1. Demo senaryosu (sunum akışı):**
   1. Boş tarayıcı (incognito) — onboarding görünür
   2. Profil oluştur: tekerlekli sandalye + bağımsız + sosyal
   3. Dashboard'a düş — "Sana Yakında" + "Topluluktan" dolu
   4. AccessibilityToolbar'dan renk körlüğü modunu aç — palet değişir
   5. Yüksek kontrast aç — siyah-beyaz olur, geri aç
   6. F5: Hangi sporları yapabilirim → 3 öneri
   7. Bir öneriden tesis listesine git → F2 haritada
   8. Bir tesise tıkla → F1 radar morph (engel tipi değiştirme demonstrasyonu)
   9. F4 tanıklık ekle — anlık liste güncellenmesi
   10. F3 "İlk Ziyaret Rehberi" → metin gel — sesli okuma butonu → Türkçe okuma
   10.1. (Opsiyonel showcase) Tesis detayında "Sorun bildir" → anonim rapor → lokal başarı (WF-02 implement edildiyse network tab'da n8n çağrısı da görünür)
   11. PDF indir — dosyayı aç
   12. F9 → F7 etkinlikler → bir tesisle bağlantı

**2. Prova kaydı:**
   - Senaryoyu 3 kez peş peşe çalıştır
   - Her seferinde bir sorun çıkarsa düzelt, tekrarla
   - 3. çalıştırmada kesintisiz olmalı

**3. Performance:**
   - Production build'i Vercel'e at
   - Slow 3G simülasyonunda demo akışı bitiyor mu kontrol et

**4. README final güncelleme:**
   - Vercel URL
   - Demo senaryosu (yukarıdaki adımlar)
   - Stack listesi (ana dökümandan)
   - Bilinen sınırlar
   - Takım üyeleri

**5. Hata kurtarma planı:**
   - Eğer demo sırasında bir feature çökerse: hangi backup ekran gösterilecek?
   - F3 down → fallback şablon (zaten otomatik)
   - F2 cache fail → inline fallback (zaten otomatik)
   - Internet yok → ?

**6. n8n Demo Hazırlığı Checklist'i:**

   - [ ] `VITE_N8N_F3_WEBHOOK_URL` Vercel Environment Variables'da tanımlı
   - [ ] n8n workflow status: **Active** (Inactive değil)
   - [ ] Demo öncesi workflow warm-up: webhook'a test isteği at, ilk çağrının cold start'ını yiyelim
   - [ ] Vercel domain → n8n webhook CORS test: gerçek frontend'den çağrı
   - [ ] F3 happy path: profil + tesis → kişiselleştirilmiş rehber metni
   - [ ] F3 fallback testi: webhook URL'i kasten yanlış değere set et, skeleton → 2 sn metni → 5 sn fallback akışı görünüyor
   - [ ] (Opsiyonel) F3 malformed response testi: n8n'de Respond node'unu bozuk JSON döndürecek şekilde geçici set et
   - [ ] WF-02 implement edildiyse: anonim sorun bildirimi test edildi, n8n'de gerçekten kayıt göründü; webhook fail → akış lokalde tamamlanıyor
   - [ ] Hiçbir n8n hatasında ekran boş kalmıyor — manuel olarak 3 farklı failure modu denendi
   - [ ] OpenAI key Vercel env'inde **yok** (`VITE_OPENAI_KEY` gizli kalmış olsa bile production deploy ortamında bulunmamalı)

### Test
- [ ] 3 kez kesintisiz demo akışı tamamlandı
- [ ] Vercel URL incognito'da açılıyor
- [ ] Mobile'da demo URL çalışıyor

### Definition of Done
- [ ] **Demo Checklist'in tüm maddeleri** (ana döküman Bölüm 11) ✅
- [ ] Vercel URL paylaşılabilir, README'de
- [ ] Hata kurtarma planı bir kez kuru çalıştırıldı

### Commit
`chore(faz-11): demo prova + final deploy + readme`

---

## Acil Durum Playbook'u

**Bir faz beklenenden uzun sürerse:**
- Faz 4-9 herhangi birinde 1 saat aşımı oluyorsa: alt task'lardan en az kritik olanı (örn. F6 filtre rafinasyonu, animasyon polish'i) ertele, ana akış bittiğinde geri dön.
- F8 (Koç Dizini) en feda edilebilir — pitch deck'e taşınabilir.

**Bir API tamamen çökerse:**
- F3 OpenAI down: fallback otomatik — fark edilmez
- F2 Overpass cache yoksa: inline JSON otomatik
- Internet yoksa: localhost'tan offline demo (Vercel preview de cache'liyse çalışır)

**Tasarım dosyaları eksikse:**
- design/ klasörü boşsa: Faz 1'de geçici design tokenları (Tailwind default + brand'i mavi-yeşil) kullan, arkadaşın tasarımı geldiğinde Faz 10'da güncelle.

**Süre çok daralırsa (örn. saat 18'de hâlâ Faz 7'desin):**
- Faz 9 (F6+F7+F8) tamamen ertelenebilir — pitch deck'te "Roadmap" olarak gösterilir
- Faz 10 polish'ten animasyonlar feda edilebilir, mobile responsive feda EDİLEMEZ
- Demo Checklist'in P1 maddeleri zorunlu, P2 ileri tarihte

---

## Genel İş Akışı Kuralları (Her Faz İçin Geçerli)

1. **Faz başında:** Bölüm 0.1'deki dosyaları oku, ne yapacağını özetle (kullanıcıya görünür şekilde).
2. **Faz sırasında:** Her major adım sonrası `npm run dev`'i bir kez yeniden başlat, görsel kontrol et.
3. **Commit öncesi:** `docs-compliance/commit.md`'i yeniden oku, mesajın o formatla uyumlu olduğunu doğrula.
4. **Faz sonunda:** Definition of Done maddelerini kullanıcıya rapor et (✅/❌), eksik varsa fazı kapatma.
5. **Faz arası:** Bir sonraki faza otomatik geçme — kullanıcıdan "devam" onayı al.
6. **Hata olunca:** Sessizce devam etme. Kullanıcıya bildir, çözüm öner, izin al.
7. **Stack dışı eklenti:** Bir kütüphane eklemek gerekiyorsa önce kullanıcıya sor, gerekçeyi açıkla.
8. **DEMO VERİSİ rozetlerini unutma** — her mock kaynaklı içerikte görünür olmalı.

---

## Demo Sonrası (Saat 16:00 - 24:00 buffer + sunum)

Bu plan saat 16:00'da bitiyor — kalan 8 saat: sunum hazırlığı, jüri provası, dinlenme. Build planı buraya kadar.

Saat 14 freeze + saat 16 demo prova bitişi → sunum saatine kadar yalnızca:
- Sunum metni provası (kod değil)
- Pitch deck son düzenlemeler
- Hata kurtarma planı tekrarı

Kod commit'i saat 16'dan sonra **yasak** — son commit demo prova commit'i olmalı, hot-fix gerekirse ayrı branch.

---

**Bu doküman Claude Code için sözleşmedir. Her fazda buraya geri dön, plan dışına çıkma.**
