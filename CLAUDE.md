# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proje Bağlamı

UYUM, engelli bireylerin Türkiye'deki spor tesislerine erişimini kolaylaştıran bir platformdur. METU Sports Tech Hackathon 2026 (16-17 Mayıs, 24 saat) için MVP olarak inşa ediliyor. Hedef kitle: tek persona (engelli birey), tek şehir (Ankara), tek dil (Türkçe UI).

Build, faz faz ilerler (Faz 0-10). Her faz tek bir Claude Code oturumunda tamamlanır ve kendi Definition of Done'una sahiptir. Mevcut durum: **Faz 0 tamamlandı** (Vite+React+TS+Tailwind iskeleti, klasör skeleton, stack bağımlılıkları, Vercel-ready).

## Komutlar

```bash
npm run dev        # Geliştirme sunucusu (localhost:5173)
npm run build      # tsc -b && vite build (TypeScript strict typecheck + bundle)
npm run preview    # dist/ önizleme
npm run lint       # ESLint flat config (eslint.config.js)
npx tsc --noEmit   # Typecheck only — DoD doğrulamasında kullanılır
```

Test runner şu an yok ve **bilinçli olarak** kurulu değil: `docs-compliance/DISCIPLINE.md` "Test yazmayız — golden path için manuel smoke yeterli" diyor. Test ekleme bir scope kararıdır, önce DECISIONS.md'ye kayıt düşülür.

## Mimari — Sabit Kararlar

Aşağıdaki kararlar `docs/UYUM-platform-final.md` Bölüm 3'te kilitlenmiştir, fazlar arası değişmez:

- **Frontend-only MVP.** Backend yok — `src/data/*.json` mock + `localStorage` persistence. Vercel'e tek bundle deploy.
- **Stack listesi kapalı:** `react`, `react-router-dom`, `framer-motion`, `recharts`, `leaflet`, `react-leaflet`, `html2canvas`, `jspdf`. Ek dependency eklemeden önce kullanıcıya sorulur.
- **Tailwind v3** (v4 değil) — Faz 1'deki `theme.extend.colors.a11y` config formatı v3 syntax gerektirir.
- **localStorage anahtarları `uyum:` prefix ile.** Örnekler: `uyum:profile`, `uyum:testimonies`, `uyum:a11y`.
- **TypeScript strict + `noImplicitAny`** açık. `any` yerine `unknown` kullanılır (tsconfig.app.json'da zorlanır).
- **A11y birinci sınıf vatandaş.** Hiçbir interactive element `outline: none` alamaz. Tüm interactive element'lerde `aria-label` veya görünür `<label>` var. F1 radar grafiğinde SVG elementleri `aria-label` ile etiketli.

## Mimari — Katman Mantığı

Build planı Bölüm 0.2'deki klasör yapısı **Faz 0'da kuruldu ve fazlar arası değişmez**. Faz 1+'da yeni dosyalar bu yere oturur:

- `src/types/index.ts` — Ana döküman Bölüm 7'deki veri modeline birebir bağlı tek dosya. `Facility`, `UserProfile`, `Testimony`, `Event`, `Coach`, `Exercise`, `AccessibilityDimension`, `DisabilityType`, `MobilityLevel`, `Goal`.
- `src/data/*.json` — Mock seed: facilities, sports, events, coaches, exercises, testimonies.seed. Koddan import edilir, runtime'da değiştirilmez (testimonies hariç).
- `src/contexts/{AccessibilityContext,ProfileContext}.tsx` — Tek kaynak nokta. Her ikisi de localStorage ile persist.
- `src/lib/` — Saf TypeScript modüller (UI bağımsız): `sport-match.ts` (F5 kural tabanlı algoritma, **LLM kullanılmaz**), `redflag.ts` (Türkçe red flag listesi + filtre), `f3-service.ts` (n8n webhook veya OpenAI direct, fallback statik şablon), `overpass-loader.ts`.
- `src/hooks/` — `useSpeech.ts` (Web Speech API `tr-TR`), `useLocalStorage.ts`, `useFacilityScore.ts`.
- `src/components/{a11y,layout,ui,facility,map,feature}/` — Domain klasörleri. `a11y/AccessibilityToolbar.tsx` Header'a oturur ve uygulamayı sarar.
- `src/pages/` — Route-level component'ler. Routing `App.tsx`'te tanımlı; profil yoksa `/` → `/onboarding` redirect.
- `public/data/facilities-overpass-cache.json` — Build-time'da `scripts/fetch-overpass-cache.mjs` ile üretilir, demo'da inline JSON fallback'i var.

## Feature Mimarisi — Cross-File Bağlam

Tek bir dosya okuyarak anlaşılamayacak akışlar:

- **F5 zinciri.** Onboarding (`ProfileContext`'e yazar) → `MatchSport` (3 spor önerisi) → `FacilityMap` (Ankara'da erişilebilir tesisler) → `FacilityDetail` (F1 radar + F3 rehber + F4 canlı durum) → `CoachDirectory` (koç linki). Zincir Faz 3-8 arası tamamlanır.
- **F3 JSON kuralı — değişmez.** OpenAI/n8n yalnızca sağlanan tesis JSON'undan üretim yapar. Sistem promptu `src/lib/f3-service.ts`'te sabit string olarak tutulur. API başarısız olursa statik şablon devreye girer — demo hiçbir koşulda boş ekran göstermez.
- **Red flag akışı.** Her LLM çağrısı öncesi kullanıcı girdisi `src/lib/redflag.ts`'teki Türkçe liste ("göğüs ağrısı", "nefes alamıyorum" vb.) ile kontrol edilir; eşleşme olursa LLM çağrılmaz, statik yönlendirme ekranı açılır.
- **DEMO VERİSİ rozeti zorunlu.** Mock kaynaklı her içeriğin yanında `<DemoBadge />` görünür — `docs/UYUM-platform-final.md` Bölüm 3 "Veri Stratejisi" gereği. Pitch'te jüriye karşı dürüstlük kalkanı.
- **A11y context tüm uygulamayı sarar.** `AccessibilityContext` (`colorblindMode`, `highContrast`, `fontSize`, `speechEnabled`) `<html>` veya `<body>` className'ini değiştirir; `globals.css`'teki SVG `<filter>` referansları (deuteranopia, protanopia) ve Tailwind `hc:` variant'ı buna göre tetiklenir. A1, A2, A4, A5, A6, A7 Faz 2'de, A3 (Sesli Okuma) Faz 7'de F3 ile birlikte gelir.

## Faz Disiplini

**Her faz öncesi okunur:** `docs/UYUM-platform-final.md` (ana mimari) + `docs/UYUM-build-plan.md` (mevcut faz) + `docs-compliance/COMMITS.md`. Build planının Bölüm 0.1'inde bu sıralama emir kipiyle yazılı.

Faz, **Definition of Done'daki tüm maddeler işaretlenmeden kapanmaz.** Eksik DoD maddesi varsa faz devam eder; yeni faza geçilmez. Yetişmeyen feature pitch deck'e taşınır, **sessizce silinmez** (`docs-compliance/SCOPE.md` §5 stretch goals).

## Commit Disiplini (`docs-compliance/COMMITS.md`)

- **Format:** `<tip>: <50 karakter altı İngilizce açıklama>`. Tipler: `feat`, `fix`, `ui`, `chore`, `docs`, `wip`. **Scope yok.**
- **Atomik commit:** bir commit = bir mantıksal değişiklik. 500+ satırlık tek commit reddedilir, `git reset --soft HEAD~1` ile parçalanır.
- **`Co-Authored-By: Claude` satırı kesinlikle eklenmez.**
- **Branch:** `feature/<kişi>-<kısa-iş>`. Maksimum 4-6 saatte main'e döner, sonra silinir. Long-lived branch yasak.
- **Merge:** Squash merge ile main'e. `main`'e force push **yasak**.
- **Build planındaki Türkçe scope'lu commit örnekleri (`chore(faz-0): ...`) yanıltıcıdır** — COMMITS.md kuralı (İngilizce, scope'suz) kazanır.

## Önceliklendirme (Çakışma Halinde)

`docs-compliance/DISCIPLINE.md` §2 hiyerarşisi — üstteki kazanır:

1. Çalışan demo akışı (golden path)
2. UX/UI parlaklığı
3. Problem-çözüm netliği (pazarlanabilirlik)
4. Keyword entegrasyonu (hackathon sırasında sürpriz keyword gelirse `feat: keyword <X> entegrasyonu` commit'i ile organik entegre edilir)
5. Backend gerçekliği — varsa bonus, yoksa mock
6. Kod kalitesi / refactor — hackathon sonrası dert

**Saat 02:00'den sonra yeni feature eklenmez**, sadece polish. Demo'ya 2 saat kala main üzerinde freeze — sadece demo-bozan bug fix kabul edilir.

## Karar Kaydı

Mimari/scope/teknoloji kararları **3-5 satır** olarak `docs-compliance/DECISIONS.md`'ye kronolojik kaydedilir (en yeni en üstte). Etiket setleri: `[SCOPE]`, `[TECH]`, `[UX]`, `[PROCESS]`, `[MENTOR]`, `[PIVOT]`, `[COMPLIANCE]`. Pivot kararı eski kararı silmez — sıra olarak en üste yeni kayıt eklenir.

## Tasarım Sistemi

Renk paleti, font, spacing değerleri `design/` klasöründen alınır (Faz 1'de tasarım dosyaları işlenir). Tasarımda olmayan değer **uydurulmaz** — Faz 1'de tanımlanan token'lardan seçilir. Erişilebilirlik renkleri Faz 1'de `tailwind.config.ts`'in `theme.extend.colors.a11y` altında sabitlenir:

```ts
a11y: {
  verified: '#16A34A',  // yeşil ✅
  partial:  '#EAB308',  // sarı ⚠️
  none:     '#DC2626',  // kırmızı ❌
  unknown:  '#9CA3AF',  // gri ❓
}
```

## Dış Servisler

- **Overpass API:** Build-time'da `scripts/fetch-overpass-cache.mjs` ile çağrılır, demo sırasında çağrılmaz (rate-limit + boş harita riski). Çıktı `public/data/facilities-overpass-cache.json`'a yazılır, commit'e dahil.
- **OpenAI (F3 için):** İki opsiyon, hackathon başında bir kez seçilir, sonra değişmez. Opsiyon 1 — n8n webhook (`VITE_N8N_WEBHOOK_URL`); Opsiyon 2 — direkt OpenAI (`VITE_OPENAI_KEY`). İkisinde de fallback statik şablon. `.env.example`'daki iki anahtar bu seçimi yansıtır.
- **YouTube Data API v3:** F6 video kütüphanesi için. MVP'de 15-20 elle küratörlenmiş video referansı `src/data/exercises.json`'a hardcoded.
- **Web Speech API:** A3 Sesli Okuma için browser native, ek kütüphane yok. `lang: 'tr-TR'`, `rate: 0.9`.

## .env

`.env.local` git'te yok, locale tutulur (DoD maddesi). Sadece `.env.example` template repo'da. API key, token, secret **asla** commit edilmez (`docs-compliance/COMMITS.md` §6).
