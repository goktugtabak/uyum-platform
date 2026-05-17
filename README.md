# UYUM

**Engelli bireyler için adaptif spor erişim platformu.**

Türkiye'de adaptif spora başlamak isteyen engelli bireyler için: hangi tesise gidebileceğini, rampanın ne durumda olduğunu, tuvaletin uygun olup olmadığını, ilk ziyarette ne yapacağını **tek bakışta** gösteren bir platform.

> METU Sports Tech Hackathon 2026 · Ankara · 24 saat · 16-17 Mayıs

---

## Tek Cümle

Onboarding'den profile, profilden eşleşmiş spora, sporlardan haritadaki tesise, tesisten kişiselleştirilmiş ilk ziyaret rehberine — tek akış, sıfır engel.

---

## Öne Çıkan Özellikler

| | |
|---|---|
| **Erişilebilirlik Parmak İzi** | 6 boyutlu radar; engel tipi değişince anında morph |
| **Akıllı Harita** | Ankara'da Leaflet pin'leri, profile göre renk + glyph çift kodlama |
| **AI İlk Ziyaret Rehberi** | n8n + OpenAI, JSON kuralı, 5sn fallback, Türkçe sesli okuma, PDF indir |
| **Topluluk Tanıklıkları** | Anonim paylaşım, profile uygun filtre, anlık güncellenme |
| **Kural Tabanlı Spor Eşleşmesi** | 3 spor önerisi + gerekçe + tesis/koç linki — LLM değil, deterministik |
| **A11y Birinci Sınıf** | Renk körlüğü filtreleri (3 mod), yüksek kontrast, font boyutu, sesli okuma, klavye gezinme |

---

## Hızlı Başlangıç

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc -b && vite build
npm run preview      # http://localhost:4173
npm run lint         # ESLint flat config
npx tsc --noEmit     # sadece tip kontrolü
```

İlk açılışta `/` Landing sayfasına düşer. "Başla" butonu ile onboarding'e geçilir (4 adım: karşılama → engel tipi → hareket durumu → hedef). Tamamlandıktan sonra `/dashboard` açılır.

---

## Canlı Demo

**Demo akışı (4-5 dk):** [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) — 12 adımlık sunum senaryosu, yedek planlar, jüri soruları.

---

## Stack

| Katman | Teknoloji |
|---|---|
| Çerçeve | React 19 + Vite 8 + TypeScript (strict) |
| Stil | Tailwind v3 + oklch CSS design tokens |
| Yönlendirme | React Router 7 |
| İkonlar | lucide-react |
| Animasyon | Framer Motion (route transitions + radar morph) |
| Grafik | Recharts (F1 erişilebilirlik radar) |
| Harita | Leaflet + react-leaflet + OpenStreetMap |
| PDF | html2canvas + jspdf (lazy chunk) |
| AI | n8n webhook → OpenAI GPT-4o-mini |
| Sesli okuma | Web Speech API (`tr-TR`) |
| Veri | `src/data/*.json` mock + `localStorage` |
| Deploy | Vercel (SPA rewrites, immutable asset cache) |

---

## Proje Yapısı

```
src/
├── App.tsx                     ErrorBoundary + Router + ScrollToTop + Suspense root
├── contexts/                   AccessibilityContext, ProfileContext
├── hooks/                      useFacilityScore, useSpeech
├── lib/                        sport-match, redflag, f3-service, overpass-loader, ...
├── data/                       facilities, sports, events, coaches, exercises, testimonies seed
├── types/index.ts              Tek dosya veri modeli
├── components/
│   ├── a11y/                   AccessibilityToolbar (A1–A3, A6)
│   ├── layout/                 AppShell, Sidebar, TopBar, Footer, ErrorBoundary, RouteTransition
│   ├── ui/                     DemoBadge, FilterChip, SpeakButton, Spinner, ScoreBadge, BookmarkButton
│   ├── facility/               DisabilityTypeSelect, AccessibilityRadar, LiveStatus, AccessibilityLabelList
│   ├── map/                    MapView, FacilityPin (renk + glyph), FacilityList, MapLegend
│   └── feature/                F3Guide, SportMatchCard, Testimonies, EventCard, CoachCard, ...
├── pages/
│   ├── Landing.tsx             / — public hero, özellikler, nasıl çalışır, footer
│   ├── Onboarding.tsx          /onboarding — 4 adımlı profil kurulumu
│   ├── Dashboard.tsx           /dashboard — yakın tesisler, topluluk, keşfet
│   ├── MatchSport.tsx          /match — kural tabanlı spor eşleşmesi
│   ├── FacilityMap.tsx         /map — Leaflet harita + tesis listesi
│   ├── FacilityDetail.tsx      /facility/:id — radar + canlı durum + F3 rehber + tanıklıklar
│   ├── ExerciseLibrary.tsx     /exercises — video kütüphanesi
│   ├── EventList.tsx           /events — takvim + etkinlik listesi
│   ├── CoachDirectory.tsx      /coaches — koç dizini
│   ├── Community.tsx           /community — topluluk feed
│   ├── Profile.tsx             /profile — kullanıcı profili + a11y ayarları
│   └── Notifications.tsx       /notifications
└── styles/globals.css          Tailwind + oklch token'lar + colorblind CSS filtreleri + focus ring

public/data/
└── facilities-overpass-cache.json   Build-time Overpass cache

docs/                           Mimari, build planı, demo script, runbook'lar
docs-compliance/                Commit kuralları, scope, disiplin, karar defteri
```

---

## Erişilebilirlik

- **A1 — Renk körlüğü.** SVG `feColorMatrix` filtreleri (deuteranopia, protanopia, tritanopia). `html.cb-*` sınıfı ile anında uygulanır.
- **A2 — Yüksek kontrast.** Tailwind custom `hc:` variant + global `filter: contrast(1.4)`.
- **A3 — Sesli okuma.** Web Speech API `tr-TR`, F3 rehber metni paragraf paragraf okunur.
- **A4 — Klavye gezinme.** `*:focus-visible` global outline, "Ana içeriğe atla" skip-link, `aria-live` region.
- **A5 — Sessiz UI.** Hiçbir bildirim ses kullanmaz; tüm geri bildirim görsel + ekran okuyucu.
- **A6 — Font boyutu.** 16 / 18 / 20 px arasında geçiş; `html` elementine inline style ile uygulanır.
- **Renk-tek-bilgi yok.** Harita pin'i: renk + glyph + spor ikonu + aria-label. Radar: renk + ikon + metin etiketi. LiveStatus: renk + sembol + metin.

---

## Bilinen Sınırlar (Hackathon MVP)

- **Backend yok.** Veri `src/data/*.json` mock + `localStorage`. Her mock kaynaklı bileşende `<DemoBadge />` görünür.
- **Tek şehir, tek dil.** Ankara + Türkçe; çoklu şehir/dil yol haritasında.
- **Overpass build-time.** Demo sırasında canlı OSM çağrısı yok; rate-limit riski elimine.
- **F3 fallback'li.** Webhook erişilemezse statik şablon devreye girer — ekran asla boş kalmaz.
- **YouTube Data API yok.** F6 video kütüphanesi 20 elle küratörlenmiş `youtube-nocookie` embed.
- **Auth yok.** Profil sadece `localStorage`'da (`uyum:profile`, `uyum:testimonies`, `uyum:a11y`).
- **Sesli okuma browser-dependent.** Tarayıcı `tr-TR` desteklemezse SpeakButton sessiz no-op.

---

## Yol Haritası (Hackathon Sonrası)

- Fizyoterapist onay katmanı (F6 içeriği)
- Supabase canlı database (community veri gerçek zamanlı)
- Operatör bildirim döngüsü (F4 eksik halkası)
- Bakanlık / federasyon API entegrasyonu (resmi etkinlik verisi)
- Çoklu şehir: İstanbul, İzmir, Bursa

---

## Dokümanlar

**Mimari + kapsam**
- [Platform Final](docs/UYUM-platform-final.md) — ana mimari sözleşme
- [SRS](docs/SRS-UYUM.md) — yazılım gereksinimleri
- [API Kontratları](docs/api-contracts.md) — n8n webhook sözleşmeleri

**Build süreci**
- [Build Planı](docs/UYUM-build-plan.md) — faz planı
- [CLAUDE.md](CLAUDE.md) — AI ajan bağlamı

**Deploy paketi**
- [Deploy Runbook](docs/DEPLOY.md) — Vercel adım adım
- [n8n Runbook](docs/N8N-RUNBOOK.md) — webhook warm-up + failure testleri
- [Demo Script](docs/DEMO-SCRIPT.md) — 12 adımlık sunum akışı
- [Incident Recovery](docs/INCIDENT-RECOVERY.md) — demo sırasında hata playbook

**Disiplin**
- [Commit Disiplini](docs-compliance/COMMITS.md)
- [Karar Defteri](docs-compliance/DECISIONS.md)
- [Scope](docs-compliance/SCOPE.md)

---

## Katkı

PR akışı için [docs-compliance/COMMITS.md](docs-compliance/COMMITS.md) — branch isimlendirme, atomik commit, squash merge.

---

## Lisans

[MIT](LICENSE)

---

<sub>Built in Ankara · For everyone who deserves to move freely.</sub>
