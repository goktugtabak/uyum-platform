# CLAUDE.md

Bu dosya **Claude Code ve diğer AI ajanlarının** UYUM repo'sunda doğru kararlar vermesi için yazıldı. Bağlam burada — `docs/` ve `docs-compliance/` derinlemesine, `CLAUDE.md` her oturum başında okunur.

---

## 1. Proje Bağlamı

**UYUM** — engelli bireylerin Türkiye'deki spor tesislerine erişimini kolaylaştıran adaptif spor platformu.

- **METU Sports Tech Hackathon 2026** (16-17 Mayıs, 24 saat) için inşa edildi
- **Hedef kitle:** Tek persona (engelli birey), tek şehir (Ankara), tek dil (Türkçe UI)
- **Strateji:** UX-first, frontend-only MVP, backend mock JSON + tek runtime n8n çağrısı (F3)

**Mevcut durum:** Faz 0–12 tamamlandı. `design/2026_uyum/` frontend entegrasyonu `feature/faz12-design-integration` branch'inde uygulandı: light theme + sidebar + topbar + lucide-react + 10 sayfa yeniden tasarımı. Tüm Faz 0-11 mantık katmanı (`lib/`, `hooks/`, `contexts/`, `types/`) korundu.

### Faz haritası

| Faz | İçerik | Durum |
|---|---|---|
| 0 | Vite + React + TS + Tailwind iskelet, klasör skeleton, stack | ✅ |
| 1 | Design tokens, A11y renkleri, Tailwind config, mock data seeds | ✅ |
| 2 | A11y çekirdek (A1, A2, A4, A5, A6, A7), AccessibilityToolbar, context, SVG cb filters | ✅ |
| 3 | Onboarding 3-adım, ProfileContext, AppShell, routing iskelet, Dashboard placeholder | ✅ |
| 4 | F5 — Sport match (kural tabanlı, LLM yok), `/match` sayfası, 3 öneri | ✅ |
| 5 | F2 — Leaflet harita, Ankara pin'leri, profile göre renk + filter bar | ✅ |
| 6 | F1 — Erişilebilirlik radar (Recharts), F4 — Canlı durum, Testimonies | ✅ |
| 7 | F3 — İlk Ziyaret Rehberi (n8n+OpenAI), A3 Sesli Okuma, PDF indir | ✅ |
| 8 | F9 Dashboard içerik (Sana Yakında, Topluluktan, Keşfet) | ✅ |
| 9 | F6 Egzersiz kütüphanesi, F7 Etkinlikler, F8 Koç dizini | ✅ |
| 10 | Polish — route animasyonları, mobile responsive, ErrorBoundary, pin glyph, README known limits | ✅ |
| 11 | Demo deploy paketi — vercel.json, runbook'lar, demo script, incident recovery | ✅ |
| 12 | Frontend entegrasyon — light theme, sidebar shell, lucide-react, 10 sayfa redesign | ✅ |

---

## 2. Komutlar

```bash
npm install                        # bağımlılıkları kur
npm run dev                        # Vite dev server, localhost:5173
npm run build                      # tsc -b && vite build (TS strict + bundle)
npm run preview                    # dist/ servisi, localhost:4173
npm run lint                       # ESLint flat config
npx tsc --noEmit                   # typecheck only (CI/DoD'de kullanılır)
npm run fetch:overpass             # public/data/ cache'ini yeniden üret (build-time, manuel)
```

**Test runner yok ve bilinçli olarak kurulu değil.** `docs-compliance/DISCIPLINE.md` "Test yazmayız — golden path için manuel smoke yeterli" diyor. Test ekleme bir scope kararıdır, önce `DECISIONS.md`'ye kayıt düşülür.

---

## 3. Sabit Mimari Kararlar (Değişmez)

`docs/UYUM-platform-final.md` Bölüm 3'te kilitli kararlar. Fazlar arası **değişmez**.

- **Frontend-only MVP.** Backend yok — `src/data/*.json` mock + `localStorage` persistence. Vercel'e tek bundle deploy.
- **Stack listesi kapalı:** `react`, `react-router-dom`, `framer-motion`, `recharts`, `leaflet`, `react-leaflet`, `html2canvas`, `jspdf`. Yeni dependency eklemeden önce kullanıcıya sorulur.
- **Tailwind v3** (v4 değil). `theme.extend.colors.a11y` config formatı v3 syntax gerektirir.
- **localStorage anahtarları `uyum:` prefix.** Örnekler: `uyum:profile`, `uyum:testimonies`, `uyum:a11y`.
- **TypeScript strict + `noImplicitAny`** açık. `any` yerine `unknown` (tsconfig.app.json'da zorlanır).
- **A11y birinci sınıf vatandaş.** Hiçbir interactive element `outline: none` alamaz. Tüm interactive element'lerde `aria-label` veya görünür `<label>` var. F1 radar SVG'sinde `aria-label` etiketi var.
- **F3 runtime tek n8n çağrısı.** Direkt OpenAI çağrısı production'da YOK (`VITE_OPENAI_KEY` Vercel env'inde olmaz).
- **Renk-tek-bilgi yok.** Pin/radar/livestatus hep renk + glyph/icon + metin üçlü kodlama.

---

## 4. Klasör Yapısı (Faz 0'da kurulu, sabit)

```
src/
├── App.tsx                              ErrorBoundary > BrowserRouter > providers > Suspense > AppRoutes
├── main.tsx                             createRoot mount
├── vite-env.d.ts
├── types/index.ts                       Ana doküman §7 veri modeli — TEK dosya
├── contexts/
│   ├── AccessibilityContext.tsx        prefs.colorblindMode/highContrast/fontSize/speechEnabled
│   └── ProfileContext.tsx              UserProfile, persist localStorage
├── hooks/
│   ├── useFacilityScore.ts             facility + disabilityType → overall + dimensions
│   └── useSpeech.ts                    Web Speech API tr-TR wrapper
├── lib/                                 UI-bağımsız saf TS modüller
│   ├── sport-match.ts                  F5 kural tabanlı algoritma, LLM yok
│   ├── redflag.ts                      Türkçe red flag listesi (n8n side'da uygulanır)
│   ├── f3-service.ts                   n8n webhook çağrısı, 5sn timeout, 8 fallback trigger
│   ├── f3-fallback.ts                  Statik şablon rehber metni
│   ├── overpass-loader.ts              public/data/ cache fetch + facilities.json fallback
│   ├── facility-rank.ts                Dashboard "Sana Yakında" puanlama
│   ├── live-status.ts                  Freshness hesaplama, label'lar
│   ├── a11y-dimensions.ts              6 boyut tanımı + label
│   ├── a11y-labels.ts                  Dimension → renkli etiket çevirisi
│   ├── sport-icons.ts                  Emoji + Türkçe spor adı eşlemesi
│   ├── testimony-store.ts              localStorage CRUD
│   ├── event-filter.ts                 F7 filtre helper
│   ├── coach-filter.ts                 F8 filtre helper (sport + facility + expertise)
│   └── exercise-filter.ts              F6 filtre helper
├── data/                                Mock seed — runtime'da read-only (testimonies hariç)
│   ├── facilities.json                 10 Ankara tesisi, inline koordinatlı
│   ├── sports.json                     Adaptif sporlar + accessibility mapping
│   ├── events.json                     8 etkinlik
│   ├── coaches.json                    8 koç + expertise
│   ├── exercises.json                  20 YouTube embed referansı
│   └── testimonies.seed.json           İlk tanıklıklar (sonrası localStorage)
├── components/
│   ├── a11y/                            AccessibilityToolbar, SegmentedControl, Toggle
│   ├── layout/                          AppShell, Header, Footer, ErrorBoundary, RouteTransition
│   ├── ui/                              DemoBadge, FilterChip, SpeakButton, Spinner
│   ├── facility/                        DisabilityTypeSelect, AccessibilityRadar, AccessibilityLabelList, LiveStatus
│   ├── map/                             MapView, FacilityPin, FacilityList, MapFilterBar, MapLegend
│   └── feature/                         F3Guide, SportMatchCard, Testimonies, EventCard,
│                                        CoachCard, ExerciseCard, MiniFacilityCard, OnboardingStep,
│                                        CommunityFeed, DiscoverGrid
├── pages/                               Route-level component'ler — RequireProfile guard'lı
│   ├── Onboarding.tsx                  /onboarding
│   ├── Dashboard.tsx                   /
│   ├── MatchSport.tsx                  /match
│   ├── FacilityMap.tsx                 /map
│   ├── FacilityDetail.tsx              /facility/:id
│   ├── ExerciseLibrary.tsx             /exercises
│   ├── EventList.tsx                   /events
│   └── CoachDirectory.tsx              /coaches
└── styles/globals.css                   Tailwind base+components+utilities + cb filter sınıfları
                                         + .high-contrast + global :focus-visible outline

public/
├── favicon.svg
└── data/facilities-overpass-cache.json  Build-time cache (scripts/fetch-overpass-cache.mjs)

scripts/fetch-overpass-cache.mjs         Manuel `npm run fetch:overpass` — OSM Overpass API
vercel.json                              SPA rewrite + güvenlik header'ları + asset cache

docs/                                    Mimari + faz planı + deploy paketi
docs-compliance/                         Commit/scope/disiplin/karar kuralları
design/2026_uyum/                        Yeni tasarım sistemi (Faz 12 entegrasyon hedefi)
```

---

## 5. Feature Mimarisi — Cross-File Akışlar

Tek dosya okumayla anlaşılamayacak zincirler:

### F5 zinciri (Onboarding → Dashboard → Map → Detail)
1. **Onboarding** → `ProfileContext.setProfile()` → `localStorage:uyum:profile`
2. **Dashboard** → `useProfile()` + `pickTopFacilities(facilities, profile, 3)` → "Sana Yakında" 3 kart
3. **MatchSport** (`/match`) → `matchSports(profile, sports)` → 3 sıralı öneri + gerekçe
4. **FacilityMap** (`/map?sport=<id>`) → `useFacilityScore()` her pin için, profile göre renk + glyph
5. **FacilityDetail** (`/facility/:id`) → F1 radar + F3 rehber + F4 canlı durum + tanıklık + koç linki
6. **CoachDirectory** (`/coaches?facility=<id>` veya `?sport=<id>`) → `filterCoaches()` profile boost

### F3 üretim akışı (kritik — JSON kuralı sabit)
1. `F3Guide.tsx` kullanıcı butona basar
2. `fetchF3Guide(profile, facility)` → `f3-service.ts`
3. Webhook URL yoksa → fallback statik şablon (`f3-fallback.ts`)
4. Varsa POST n8n → 5sn timeout, AbortController
5. n8n response 8 farklı failure case'inden birine düşerse → fallback
6. Başarılı response → success state → SpeakButton + PDF butonu aktif
7. **Kural:** n8n side'da OpenAI prompt'u "Yalnızca sağlanan JSON'daki alanları kullan, üretme" der. Red flag check de n8n side'da (`error:'RED_FLAG'`).

### A11y context tüm uygulamayı sarar
`AccessibilityContext` `(colorblindMode, highContrast, fontSize, speechEnabled)` `<html>` className + inline fontSize değiştirir. `globals.css`'teki SVG `<filter>` (deuteranopia/protanopia/tritanopia) ve Tailwind `hc:` variant buna göre tetiklenir. `localStorage:uyum:a11y` persist.

### DEMO VERİSİ rozeti zorunluluğu
Mock kaynaklı her içeriğin yanında `<DemoBadge />` görünür — `docs/UYUM-platform-final.md` Bölüm 3 "Veri Stratejisi". Pitch'te jüriye karşı dürüstlük kalkanı. 9 consumer noktası:
- Dashboard (Sana Yakında + Topluluktan başlıkları)
- MatchSport (header)
- FacilityMap (header)
- FacilityDetail (header)
- LiveStatus (component sonu)
- EventList, ExerciseLibrary, CoachDirectory (header)

---

## 6. Komponent ve Sayfa Sözleşmeleri

### Pages
Her sayfa `<RequireProfile>` ile sarmalı (Onboarding hariç). `useProfile()` null check şart. Header pattern:
```tsx
<div className="max-w-Xxl mx-auto p-4 md:p-6 space-y-6">
  <header className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10">
    <div>
      <h1 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">...</h1>
      <p className="text-sm text-white/60 font-body max-w-2xl">...</p>
    </div>
    <DemoBadge label="..." />
  </header>
  ...
</div>
```

### Filter pattern
`<FilterGroup label="...">` + `<FilterChip>` + her ekran sonunda "Filtreleri temizle" butonu. Empty state'te `clearFilters()` CTA — dead-end yok.

### Card pattern
`rounded-xl border border-white/10 bg-white/5` — SportMatchCard, CoachCard, EventCard, ExerciseCard, MiniFacilityCard, FacilityList item'larında tutarlı.

### A11y konvansiyonları
- Her `<button>`/`<Link>`'de `focus-visible:outline focus-visible:outline-2 focus-visible:outline-uyum-purple` (global `:focus-visible` zaten outline atıyor; component-level redundancy savunulabilir)
- Statü ikonları aria-hidden + sr-only metin etiketi
- Dynamic content değişiminde `#aria-live-region`'a yazılır (AppShell.tsx:18-22)

---

## 7. Faz Disiplini

**Her faz öncesi okunur:** `docs/UYUM-platform-final.md` (ana mimari) + `docs/UYUM-build-plan.md` (mevcut faz) + `docs-compliance/COMMITS.md`. Build planının §0.1'inde bu sıralama emir kipiyle.

**Faz, Definition of Done'daki tüm maddeler işaretlenmeden kapanmaz.** Eksik DoD = faz devam. Yetişmeyen feature pitch deck'e taşınır, sessizce silinmez (`docs-compliance/SCOPE.md` §5 stretch goals).

---

## 8. Commit Disiplini (`docs-compliance/COMMITS.md`)

- **Format:** `<tip>: <50 karakter altı İngilizce açıklama>`. Tipler: `feat`, `fix`, `ui`, `chore`, `docs`, `wip`. **Scope yok.**
- **Atomik commit:** bir commit = bir mantıksal değişiklik. 500+ satırlık tek commit reddedilir, `git reset --soft HEAD~1` ile parçalanır.
- **`Co-Authored-By: Claude` satırı kesinlikle eklenmez.**
- **Branch:** `feature/<kişi>-<kısa-iş>` veya `feature/faz<N>-<konu>` (Faz 7+ konvansiyonu). Maksimum 4-6 saatte main'e döner.
- **Merge:** Squash merge ile main'e. Force push **yasak**.
- **Build planındaki Türkçe scope'lu örnekler yanıltıcı** — COMMITS.md (İngilizce, scope'suz) kazanır.

---

## 9. Önceliklendirme (Çakışma Halinde)

`docs-compliance/DISCIPLINE.md` §2 hiyerarşisi — üstteki kazanır:

1. Çalışan demo akışı (golden path)
2. UX/UI parlaklığı
3. Problem-çözüm netliği (pazarlanabilirlik)
4. Keyword entegrasyonu (hackathon sırasında sürpriz)
5. Backend gerçekliği (varsa bonus, yoksa mock)
6. Kod kalitesi / refactor (hackathon sonrası)

**Saat 02:00'den sonra yeni feature eklenmez**, sadece polish. Demo'ya 2 saat kala main üzerinde freeze — sadece demo-bozan bug fix.

---

## 10. Karar Kaydı

Mimari/scope/teknoloji kararları **3-5 satır** olarak `docs-compliance/DECISIONS.md`'ye kronolojik kaydedilir (en yeni en üstte). Etiketler: `[SCOPE]`, `[TECH]`, `[UX]`, `[PROCESS]`, `[MENTOR]`, `[PIVOT]`, `[COMPLIANCE]`. Pivot kararı eski kararı silmez — sıra olarak en üste yeni kayıt.

---

## 11. Tasarım Sistemi (Faz 12 — Aktif)

> Faz 12'de `design/2026_uyum/` referansı uygulandı. Tema **light**, sol sidebar + topbar layout, oklch palet. Eski `uyum-dark`/`uyum-purple` color name'leri **geriye dönük uyumluluk için** Tailwind config'te kalır; yeni kod CSS-variable backed token'ları kullanır.

**Aktif token'lar (CSS değişkenleri, `src/styles/globals.css` `:root`):**

```css
--color-background        oklch(0.985 0.005 290)   /* sayfa zemini */
--color-foreground        oklch(0.18 0.06 305)     /* gövde metni */
--color-primary           oklch(0.38 0.16 295)     /* CTA + focus ring */
--color-primary-deep      oklch(0.22 0.12 305)     /* Hero zemini */
--color-accent            oklch(0.68 0.13 270)     /* mavi-mor */
--color-mint              oklch(0.94 0.08 145)     /* başarı + onay pastel */
--color-sky               oklch(0.93 0.06 215)     /* su-mavi pastel */
--color-success           oklch(0.62 0.16 150)
--color-warning           oklch(0.78 0.16 65)
--color-destructive       oklch(0.62 0.22 25)
```

**Tailwind class kullanımı:**

```tsx
bg-background  text-foreground             // sayfa
bg-card  ring-border/40                    // kart
bg-primary  text-primary-foreground        // CTA
bg-mint/60  text-mint-foreground           // pastel rozet
bg-gradient-deep  text-primary-foreground  // hero CTA
shadow-glow                                // primary CTA
font-display                               // Sora, h1-h4 default
```

**Font:** Sora (display) + Plus Jakarta Sans (body), Google Fonts CDN. Outfit + Inter alias olarak korunur.

**A11y dimension renkleri korundu** (`bg-a11y-verified`, vb.) — `tailwind.config.ts` §a11y altında.

**Focus ring:** `*:focus-visible { outline: 2px solid #4C2A85; outline-offset: 2px }` — `globals.css`'te zorlanır, **hiçbir element override edemez.**

---

## 12. Dış Servisler

- **Overpass API:** Build-time'da `scripts/fetch-overpass-cache.mjs` ile çağrılır, demo sırasında çağrılmaz. Çıktı `public/data/facilities-overpass-cache.json`. Cache miss → `src/data/facilities.json` inline fallback.
- **n8n + OpenAI (F3):** Webhook URL `VITE_N8N_F3_WEBHOOK_URL`. n8n workflow OpenAI'ı çağırır (key n8n side'da). Frontend timeout 5sn. 8 failure trigger → fallback. Detay: `docs/api-contracts.md`, `docs/N8N-RUNBOOK.md`.
- **YouTube Data API v3:** F6 için. MVP'de **kullanılmaz** — 20 elle küratörlenmiş video referansı `src/data/exercises.json`'da hardcoded, embed `youtube-nocookie.com`.
- **Web Speech API:** A3 Sesli Okuma için browser native. `lang: 'tr-TR'`, `rate: 0.9`. Tarayıcı desteklemezse no-op.

---

## 13. `.env` ve Sırlar

- `.env.local` git'te yok, locale tutulur (DoD maddesi).
- `.env.example` template repo'da. API key, token, secret **asla** commit edilmez.
- Vercel Production env vars: `VITE_N8N_F3_WEBHOOK_URL` (opsiyonel: `VITE_N8N_REPORT_ISSUE_WEBHOOK_URL`).
- `VITE_OPENAI_KEY` Vercel'de **kesinlikle yok** — bundle'a sızarsa güvenlik açığı.

---

## 14. Faz 11 Deploy Paketi

Faz 11 sonunda repo'ya eklenen runbook'lar:

| Doc | Amaç |
|---|---|
| [docs/DEPLOY.md](docs/DEPLOY.md) | Vercel deploy adım adım + smoke test + rollback |
| [docs/N8N-RUNBOOK.md](docs/N8N-RUNBOOK.md) | Webhook warm-up + CORS test + 3 failure mode test |
| [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) | 12 adımlık sunum akışı + jüri soruları + yedek senaryolar |
| [docs/INCIDENT-RECOVERY.md](docs/INCIDENT-RECOVERY.md) | Demo sırasında patlamalar için playbook |
| [vercel.json](vercel.json) | SPA rewrite + security headers + asset cache |

---

## 15. Yeni Claude Oturumu İçin Quickstart

Sıfırdan başlayan bir Claude için ilk 5 dakika checklist:

1. **Bağlamı oku:**
   - `CLAUDE.md` (bu dosya) — bütün resim
   - `docs/UYUM-platform-final.md` — mimari sözleşme
   - `docs/UYUM-build-plan.md` — faz planı + DoD'ler
   - `docs-compliance/COMMITS.md` — commit kuralları
   - `docs-compliance/DECISIONS.md` — geçmiş kararlar (en yeni en üstte)
2. **Git state:**
   - `git status` — branch + temiz mi
   - `git log --oneline -10` — son ne yapıldı
3. **Build sağlık:**
   - `npx tsc --noEmit` — TS hatası?
   - `npm run lint` — lint hatası?
4. **Kullanıcının ne istediğini netleştir:**
   - Yeni feature mi (Faz X'e mi ait)?
   - Bug fix mi (hangi feature)?
   - Polish mi (Faz 10 kapsamında mı yoksa Faz 12 design entegrasyonu mu)?
5. **Planla:**
   - Atomik commit'ler için mikro-fazlama
   - Branch: `feature/faz<N>-<konu>` veya `feature/<kişi>-<kısa-iş>`

### Sık karşılaşılacak durumlar

| Kullanıcı diyor ki | Yapılacak |
|---|---|
| "Bir kütüphane ekleyelim" | Önce kapsam sorusu — stack listesi sabit (`UYUM-platform-final.md` §3) |
| "Test yazalım" | Önce DECISIONS girişi — şu an "test yok" kararı aktif |
| "F3'te kullanıcıdan textarea alalım" | Önce DECISIONS güncelle (semptom input = red flag tetikleyici), sonra implement |
| "Bu UI'ı güzelleştirelim" | Önce §11 token sözlüğüne bak — light theme + sidebar + Sora display + Plus Jakarta body |
| "Yeni route eklemek istiyorum" | `App.tsx` lazy import + `RequireProfile` guard + page component pattern |
| "Demo'da X çalışmıyor" | `INCIDENT-RECOVERY.md` playbook'una bak, console log'unu paylaş |

---

## 16. Faz 12 — Frontend Entegrasyon (Tamamlandı)

`design/2026_uyum/frontend-skeleton/` referans alınarak `feature/faz12-design-integration` branch'inde uygulandı.

### Stratejik kararlar (DECISIONS.md 2026-05-17 [UX] kaydında detay)

- **Tailwind v3 korundu.** Skeleton'daki v4 `@theme inline` formatı atılmadı; oklch CSS değişkenleri `:root`'a yerleştirildi, Tailwind config color'ları `var(--color-*)` üzerinden bridge edildi.
- **react-router-dom v7 korundu.** TanStack Router'a geçilmedi (build sistem değişikliği maliyeti yüksek).
- **lucide-react eklendi.** Stack listesine `^0.575` olarak girdi.
- **shadcn/ui tam adopte edilmedi.** Skeleton sadece Switch kullanıyor, custom Toggle yeterli.
- **Light theme + sidebar shell.** Önceki `bg-uyum-dark` zemin gitti; sayfa = `bg-background`, sidebar lg+'da görünür, mobile'de TopBar'da hamburger menü.
- **Onboarding 4 adım.** Welcome → Disability → Goal → Mobility+Confirmation. Profil schema değişmedi (`disabilityType`, `mobilityLevel`, `goal`).
- **Yeni route'lar:** `/` Landing (public), `/dashboard` (auth), `/community`, `/profile`. Tüm authenticated route'lar `RequireProfile` guard'lı.

### Korunan / sıfır değişiklik katmanlar

- `src/types/index.ts` — sıfır değişiklik
- `src/lib/*` — sıfır değişiklik (sport-match, redflag, f3-service, facility-rank, overpass-loader, ...)
- `src/hooks/*` — sıfır değişiklik (useFacilityScore, useSpeech)
- `src/contexts/AccessibilityContext.tsx`, `ProfileContext.tsx` — sıfır değişiklik
- `src/data/*.json` — sıfır değişiklik
- A11y davranışı tamamen korundu: SVG colorblind filter'lar (`#cb-*-filter` index.html'de), `html.high-contrast` toggle, `hc:` Tailwind variant, `*:focus-visible` global outline, `#aria-live-region`, "Ana içeriğe atla" skip-link.

### Yenilenen render katmanı

| Katman | Yenilik |
|---|---|
| `src/styles/globals.css` | oklch tokens, `bg-gradient-hero/deep/brand`, `glass`, `text-gradient` utility'leri |
| `tailwind.config.ts` | CSS-variable backed color/shadow/font tokens; eski `uyum-*` alias'lar geriye dönük korunur |
| `index.html` | Sora + Plus Jakarta Sans preload eklendi |
| `src/components/layout/AppShell.tsx` | Sidebar + TopBar + ambient pastel light blobs |
| `src/components/layout/Sidebar.tsx` | 8 route'lu sticky sidebar (lg+) |
| `src/components/layout/TopBar.tsx` | Sticky topbar, mobile menu drawer, a11y popover |
| `src/components/ui/UyumLogo.tsx` | SVG logo (purple + mint + sky gradient) |
| `src/pages/Landing.tsx` | Yeni — `/` public hero (HAREKET HERKES İÇİN / UYUM SENİN İÇİN) |
| `src/pages/Onboarding.tsx` | 4 step + ProgressBar + LeftRail kompozisyonu |
| `src/pages/Dashboard.tsx` | 3-column flowing (Nearby + Community + Discover) + dashHero foto mask |
| `src/pages/MatchSport.tsx` | 3 spor foto + detay grid + tints[] + RefreshCw CTA |
| `src/pages/FacilityMap.tsx` | Map sol + facility list sağ; teardrop pin'ler + glyph badge |
| `src/pages/FacilityDetail.tsx` | Hero + radar + LiveStatus + F3Guide + Testimonies; tab nav (link-only) |
| `src/pages/EventList.tsx` | ParkScene hero + calendar widget + create-event CTA |
| `src/pages/ExerciseLibrary.tsx` | Category chips + grid/list view toggle + pagination |
| `src/pages/CoachDirectory.tsx` | Grid cards + star rating + community fallback CTA |
| `src/pages/Community.tsx` | Yeni — feed + compose form + tips |
| `src/pages/Profile.tsx` | Yeni — özet kart + Fact tile'ları + favorites + A11yToolbar |

### Build / lint / typecheck sağlığı

- `npx tsc --noEmit` → exit 0
- `npm run lint` → exit 0
- `npm run build` → exit 0, 1.5s

### Bilinen sınırlar

- Mobile menu drawer overlay, focus trap'siz (basit toggle). Sidebar lg+ breakpoint'inde aktif.
- "Rota oluştur" facility detail'de Google Maps / OSM dış linki açar — kendi maps view'ı yok.
- TopBar'da arama kutusu placeholder; backend search yok (search filter sadece visual).
- "Notification bell" mock — sadece kırmızı nokta.
- Profile sayfasında favorites listesi count gösteriyor; ekleme/silme UI'ı bir sonraki iterasyon.

### Tasarım rehberi (yeni kod yazarken)

- **Page wrapper:** `<div className="mx-auto max-w-7xl pt-2">…</div>` — sidebar/topbar zaten AppShell'den geliyor.
- **Page header:** font-display, clamp size, primary-deep color. Yanında DemoBadge (mock-data ise).
- **Card:** `rounded-3xl bg-card p-5 ring-1 ring-border/40 hc:bg-white hc:ring-black` — boxy değil yumuşak.
- **CTA:** `rounded-full bg-primary text-primary-foreground shadow-glow hover:bg-primary-deep`.
- **Pastel rozet:** `bg-mint/60 text-mint-foreground` veya `bg-accent/15 text-accent`.
- **Icon:** Daima lucide-react, `aria-hidden`, `size-4` / `size-5`. Anlam taşıyan ikon yanına metin etiketi şart.
- **Filter:** `<FilterGroup label>` + `<FilterChip>` + "Filtreleri temizle" butonu.

---

## 17. Son Hatırlatma

**Bu doküman Claude Code için sözleşmedir.** Her oturumda buraya geri dön. Plan dışına çıkma. Şüphede kal → kullanıcıya sor.
