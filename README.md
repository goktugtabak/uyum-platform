# UYUM

**Engelli bireyler için adaptif spor erişim platformu.**

Türkiye'de adaptif spora başlamak isteyen engelli bireyler için: hangi tesise gidebileceğini, rampanın ne durumda olduğunu, tuvaletin uygun olup olmadığını, ilk ziyarette ne yapacağını **tek bakışta** gösteren bir platform.

> METU Sports Tech Hackathon 2026 · Ankara · 24 saat · 16-17 Mayıs

---

## ⚡ Tek Cümle

Onboarding'den profile, profilden eşleşmiş spora, sporlardan haritadaki tesise, tesisten kişiselleştirilmiş ilk ziyaret rehberine — tek akış, sıfır engel.

---

## ✨ Öne Çıkan Özellikler

| | |
|---|---|
| 🧭 **Erişilebilirlik Parmak İzi** | 6 boyutlu radar; engel tipi değişince anında morph |
| 🗺️ **Akıllı Harita** | Ankara'da Leaflet pin'leri, profile göre renk + glyph çift kodlama |
| ✍️ **AI İlk Ziyaret Rehberi** | n8n + OpenAI, JSON kuralı, 5sn fallback, Türkçe sesli okuma, PDF indir |
| 🤝 **Topluluk Tanıklıkları** | Anonim paylaşım, profile uygun filtre, anlık güncellenme |
| 🎯 **Kural Tabanlı Spor Eşleşmesi** | 3 spor önerisi + gerekçe + tesis/koç linki — LLM değil, deterministik |
| ♿ **A11y Birinci Sınıf** | Renk körlüğü filtreleri (3 mod), yüksek kontrast, font boyutu, sesli okuma, klavye gezinme |

---

## 🚀 Hızlı Başlangıç

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc -b && vite build
npm run preview      # http://localhost:4173
npm run lint         # ESLint flat config
```

İlk açılışta `/onboarding`'e düşer. 3 adımı (engel tipi → hareket durumu → hedef) tamamla, ana sayfa açılır.

---

## 🌐 Canlı Demo

**Production:** _(Faz 11 Vercel deploy sonrası eklenecek — bkz. [docs/DEPLOY.md](docs/DEPLOY.md))_

**Demo akışı (4-5 dk):** [docs/DEMO-SCRIPT.md](docs/DEMO-SCRIPT.md) — 12 adımlık sunum senaryosu, yedek planlar, jüri soruları.

---

## 🧱 Stack

| Katman | Teknoloji |
|---|---|
| Çerçeve | React 19 + Vite 8 + TypeScript (strict) |
| Stil | Tailwind v3 + custom design tokens |
| Yönlendirme | React Router 7 |
| Animasyon | Framer Motion (route transitions + radar morph) |
| Grafik | Recharts (F1 erişilebilirlik radar) |
| Harita | Leaflet + react-leaflet + OpenStreetMap |
| PDF | html2canvas + jspdf (lazy chunk) |
| AI | n8n webhook → OpenAI GPT-4o-mini |
| Sesli okuma | Web Speech API (`tr-TR`) |
| Veri | `src/data/*.json` mock + `localStorage` |
| Deploy | Vercel (SPA rewrites, immutable asset cache) |

---

## 🗂️ Proje Yapısı

```
src/
├── App.tsx                     ErrorBoundary + Router + Suspense root
├── contexts/                   AccessibilityContext, ProfileContext
├── hooks/                      useFacilityScore, useSpeech
├── lib/                        sport-match, redflag, f3-service, overpass-loader, ...
├── data/                       facilities, sports, events, coaches, exercises, testimonies seed
├── types/index.ts              Tek dosya, ana doküman §7 veri modeline bağlı
├── components/
│   ├── a11y/                   AccessibilityToolbar (A1–A3, A6)
│   ├── layout/                 AppShell, Header, Footer, ErrorBoundary, RouteTransition
│   ├── ui/                     DemoBadge, FilterChip, SpeakButton, Spinner
│   ├── facility/               AccessibilityRadar, LiveStatus, AccessibilityLabelList
│   ├── map/                    MapView, FacilityPin (renk + glyph), FacilityList, MapLegend
│   └── feature/                F3Guide, SportMatchCard, Testimonies, EventCard, CoachCard, ...
├── pages/                      Onboarding, Dashboard, MatchSport, FacilityMap, FacilityDetail,
│                               EventList, ExerciseLibrary, CoachDirectory
└── styles/globals.css          Tailwind directives + colorblind CSS filters + focus ring

public/data/
└── facilities-overpass-cache.json   Build-time Overpass cache (inline JSON fallback)

docs/                           Architecture, build plan, demo script, runbook'lar
docs-compliance/                Commit kuralları, scope, disiplin, karar defteri
design/2026_uyum/               Faz 12 frontend entegrasyonunda kullanılacak yeni tasarım
```

---

## ♿ Erişilebilirlik

- **A1 — Renk körlüğü.** SVG `feColorMatrix` filtreleri (deuteranopia, protanopia, tritanopia). `html.cb-*` sınıfı ile anında uygulanır.
- **A2 — Yüksek kontrast.** Tailwind custom `hc:` variant + global `filter: contrast(1.4)`.
- **A3 — Sesli okuma.** Web Speech API `tr-TR`, F3 rehber metni paragraf paragraf okunur.
- **A4 — Klavye gezinme.** `*:focus-visible` global outline, "Ana içeriğe atla" skip-link, `aria-live` region.
- **A5 — Sessiz UI.** Hiçbir bildirim ses kullanmaz; tüm geri bildirim görsel + ekran okuyucu.
- **A6 — Font boyutu.** 16 / 18 / 20 px arasında geçiş; html elementine inline style ile uygulanır.
- **Renk-tek-bilgi yok.** Harita pin'i: renk + glyph (✓/~/✕/?) + spor ikonu + aria-label. Radar: renk + ikon + metin etiketi. LiveStatus: renk + ✅/❌/❓ + ARIZALI rozeti + metin.

---

## 🛡️ Bilinen Sınırlar (Hackathon MVP)

- **Backend yok.** Veri `src/data/*.json` mock + `localStorage`. Her mock kaynaklı bileşende `<DemoBadge />` görünür.
- **Tek şehir, tek dil.** Ankara + Türkçe; çoklu şehir/dil yol haritasında.
- **Overpass build-time.** Demo sırasında canlı OSM çağrısı yok; rate-limit + boş harita riski elimine.
- **F3 fallback'li.** Webhook erişilemezse statik şablon devreye girer — ekran asla boş kalmaz.
- **YouTube Data API yok.** F6 video kütüphanesi 20 elle küratörlenmiş `youtube-nocookie` embed.
- **Auth yok.** Profil sadece tarayıcı `localStorage`'ında (`uyum:profile`, `uyum:testimonies`, `uyum:a11y` anahtarları).
- **Sesli okuma browser-dependent.** Tarayıcı `tr-TR` desteklemezse SpeakButton sessiz no-op.

Daha geniş anlatım: [docs/UYUM-platform-final.md §11](docs/UYUM-platform-final.md).

---

## 🗺️ Yol Haritası (Hackathon Sonrası)

Pitch deck'te detaylı, kısaca:

- Fizyoterapist onay katmanı (F6 içeriği)
- Supabase canlı database (community veri gerçek zamanlı)
- Operatör bildirim döngüsü (F4 eksik halkası)
- Türkçe adaptif içerik üretim programı (koçlarla ortak)
- Bakanlık / federasyon API entegrasyonu (resmi etkinlik verisi)
- Çoklu şehir: İstanbul, İzmir, Bursa

---

## 👥 Takım

_(Sunum öncesi doldurulacak — isim · rol · iletişim)_

---

## 📚 Dokümanlar

**Mimari + kapsam**
- [Platform Final](docs/UYUM-platform-final.md) — ana mimari sözleşme
- [SRS](docs/SRS-UYUM.md) — yazılım gereksinimleri
- [API Kontratları](docs/api-contracts.md) — n8n webhook sözleşmeleri

**Build süreci**
- [Build Planı](docs/UYUM-build-plan.md) — 11 fazlık plan (tüm fazlar bitti)
- [CLAUDE.md](CLAUDE.md) — Claude Code ve diğer AI ajanları için tam bağlam

**Faz 11 deploy paketi**
- [Deploy Runbook](docs/DEPLOY.md) — Vercel adım adım
- [n8n Runbook](docs/N8N-RUNBOOK.md) — webhook warm-up + failure testleri
- [Demo Script](docs/DEMO-SCRIPT.md) — 12 adımlık sunum akışı
- [Incident Recovery](docs/INCIDENT-RECOVERY.md) — demo sırasında hata playbook

**Disiplin (compliance)**
- [Commit Disiplini](docs-compliance/COMMITS.md)
- [Karar Defteri](docs-compliance/DECISIONS.md) — ADR-lite kronolojik
- [Scope](docs-compliance/SCOPE.md) — in/out of scope
- [Disiplin](docs-compliance/DISCIPLINE.md) — öncelik hiyerarşisi

---

## 🤝 Katkı

Bu hackathon repo'su. Faz 0–11 tamamlandı. Sonraki adım: `design/2026_uyum/` klasöründeki yeni tasarım sisteminin frontend entegrasyonu (post-hackathon).

PR akışı için [docs-compliance/COMMITS.md](docs-compliance/COMMITS.md) — branch isimlendirme, atomik commit, squash merge.

---

## 📜 Lisans

[MIT](LICENSE)

---

<sub>Made with ⚙️ Claude Code · Built in Ankara · For everyone who deserves to move freely.</sub>
