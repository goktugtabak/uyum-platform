# Faz 8 — F9 Ana Sayfa Dashboard Design

**Tarih:** 2026-05-16
**Hedef saat:** 10:30 – 11:30 (≈1 saat)
**Bağımlılık:** Faz 7 tamam (F1, F2, F3, F4, F5, A1–A7 hazır)
**Branch:** `feature/faz8-dashboard`

---

## 1. Amaç ve Kapsam

ÇEKİRDEK'in son halkası. `/` rotasındaki Dashboard, bağımsız feature inşa etmez; **mevcut feature'lardan veri çeken aggregator**'dür. Demo'nun giriş noktası. Bu faz biterse 14:00 hard-freeze öncesi tüm P1 dokunulmuş olur ve "ara kontrol" listesindeki *F9 ana sayfa dolu* maddesi yeşilenir.

Build plan §FAZ 8 (line 827–882) bire bir uygulanır; mimari ya da scope sapması yok.

### Kapsam içi (DoD)

- [ ] Profil özeti üst şeritte (engel tipi · hedef · şehir + profili düzenle).
- [ ] **Sana Yakında**: profile uyumlu en iyi 3 tesis kartı, her birinde mini radar preview + Detay butonu.
- [ ] **Topluluktan**: son ≤3 tanıklık + ≤1 yakın etkinlik.
- [ ] **Keşfet**: 4 büyük buton → `/match`, `/exercises`, `/events`, `/coaches`.
- [ ] Boş state yok; tüm bölümler dolu (mock + seed yeterli).
- [ ] DEMO VERİSİ rozetleri ilgili bölümlerde.
- [ ] Klavye gezilebilirlik tam (`Tab` sırası mantıklı, focus ring uyum-purple).
- [ ] Mobile responsive (≥sm tek kolon, ≥md grid).
- [ ] `tsc --noEmit` + `npm run build` + `npm run lint` temiz.

### Kapsam dışı (sessizce silinmez, taşınır)

- Dashboard'dan **runtime n8n çağrısı yok** (build plan §FAZ 8.6 — "WF-01 CTA … feature kapsam dışıdır"). Tüm veri local/static.
- Header'da zaten olan A11y toggle'ları Dashboard'da **tekrarlanmaz** (build plan §FAZ 8.5).
- `/exercises`, `/events`, `/coaches` rotaları hâlâ `NotImplemented` placeholder; Faz 9'da dolacaklar. Keşfet butonları yine de bu rotalara link verir — Faz 9 sonunda otomatik canlanır.

---

## 2. Mimari Karar Notları

| Konu | Karar | Gerekçe |
|---|---|---|
| Tesis verisi kaynağı | `loadFacilities()` (manual JSON, Faz 5 DECISIONS) | Tek runtime kaynağı, sport-match.ts dışı LLM yok. |
| Tesis sıralama | `useFacilityScore` ile `overall` puanını al, sıra: `green > yellow > gray > red`, eşitlikte `counts.verified` desc, sonra `name` asc | Spec: "F2 score logic'ini kullan, green olanları öncele". Mevcut hook'u Dashboard'da bir kez çağıramayız (hook list, facility per render), bu yüzden saf fonksiyon `lib/facility-rank.ts` çıkar — hook'la aynı sınıflama kuralı. |
| Mini radar | Mevcut `AccessibilityRadar` component'ini `height=120` ile yeniden kullan, **legend/aria-list göstermeden**. Wrapper component her kartta küçük preview verir. | Yeni recharts kodu yazmak değil; mevcut ARIA + animation davranışını koruyalım. |
| Topluluk feed | `loadTestimonies()` (seed+localStorage merge, timestamp DESC) — slice(0,3). Etkinlik: `events.json` içinde `new Date(date) > now` olanların en yakını. | Mevcut helper'ları doğrudan tüket. |
| Keşfet | Saf statik 4 buton bileşeni; Link → `/match`, `/exercises`, `/events`, `/coaches`. | Spec emoji + label aynen kullanır. |
| DEMO rozeti | "Sana Yakında" ve "Topluluktan" başlıklarında küçük rozet. Keşfet rotası canlı (mock değil), rozet yok. | Spec "ilgili kartlarda" der; Keşfet kullanıcıyı yönlendiren CTA, mock veri değil. |
| Faz 9 hazırlığı | Keşfet butonları placeholder rotalara yönlendirir; **butonun kendisi disabled değil** — Faz 9 sonunda 1 satır değişikliği gerektirmez. | Build planı "4 keşfet butonu doğru sayfalara yönlendiriyor" testini birinci sınıf ister. |

---

## 3. Dosya & Component Planı

### Yeni dosyalar

```
src/lib/facility-rank.ts                     # saf fonksiyon: top-N facility for profile
src/components/feature/MiniFacilityCard.tsx  # 1 tesis kartı: mini radar + dot + Detay
src/components/feature/CommunityFeed.tsx     # 3 tanıklık + 1 etkinlik
src/components/feature/DiscoverGrid.tsx      # 4 emoji buton grid
```

### Değişen dosyalar

```
src/pages/Dashboard.tsx                      # placeholder'lar dolduruluyor
docs-compliance/DECISIONS.md                 # yeni kayıt (en üste)
docs/superpowers/specs/2026-05-16-faz8-dashboard-design.md  # bu doc
```

### Component ağacı

```
<Dashboard>                                          // src/pages/Dashboard.tsx
  <ProfileHeader profile />                          // inline JSX (Dashboard içinde, ayrı dosya değil)
  <section aria-labelledby="section-nearby">
    <DemoBadge />
    <div grid grid-cols-1 md:grid-cols-3 gap-4>
      <MiniFacilityCard facility profile />          // ×3
    </div>
  </section>
  <section aria-labelledby="section-community">
    <DemoBadge />
    <CommunityFeed />
  </section>
  <section aria-labelledby="section-explore">
    <DiscoverGrid />
  </section>
```

---

## 4. Veri Akışı

```
ProfileContext (localStorage uyum:profile)
   ↓
Dashboard
   ├─ loadFacilities() → manual JSON                 [overpass-loader.ts]
   │     ↓
   │  pickTopFacilities(facilities, profile, 3)      [facility-rank.ts]
   │     ↓
   │  MiniFacilityCard × 3
   │     ↓
   │  useFacilityScore(facility, profile.disabilityType) → AccessibilityRadar (mini)
   │
   ├─ loadTestimonies()  → seed+localStorage merge, slice(0,3)   [testimony-store.ts]
   ├─ events.json static import → filter future, sort asc, take 1
   └─ DiscoverGrid (statik)
```

Hiçbir n8n/OpenAI çağrısı yok. `useEffect`'te facilities async load edilir (mevcut Faz 5 pattern'i).

---

## 5. `pickTopFacilities` Algoritması (saf fn)

```ts
// src/lib/facility-rank.ts
export interface RankedFacility { facility: Facility; overall: ScoreColor; verifiedCount: number }
export function pickTopFacilities(
  facilities: Facility[], profile: UserProfile, limit: number
): RankedFacility[]
```

1. Her tesis için `useFacilityScore` ile aynı kuralı **inline hesapla** (hook değil, saf fn). DRY için core'u `lib/facility-score.ts` adında ortak fonksiyona çıkarmak Faz 8 scope'unu aşar — kopya kabul: 15 satır. Hook'u mevcut haliyle bırak. (DECISIONS'ta not düşülür: "küçük tekrar > erken abstraksiyon".)
2. Sıralama anahtarı: `colorRank[overall]` (green=0, yellow=1, gray=2, red=3) → verified desc → name asc.
3. `slice(0, limit)` döner.

Profil yoksa boş dizi döner; Dashboard zaten `RequireProfile` arkasında, bu yol gerçekleşmez.

---

## 6. Edge Case'ler

| Durum | Davranış |
|---|---|
| Facilities load henüz bitmemiş | "Sana Yakında" başlığı altında 3 skeleton placeholder (rounded bg-white/5 h-48). |
| Profile yok | `RequireProfile` zaten redirect eder; Dashboard render etmez. |
| Profile uyumlu yeşil tesis sayısı < 3 | Sıralama yine de top-3 verir (yellow/gray dahil). Boş state yok. |
| Tanıklık sıfır (seed dahil) | Mümkün değil (`testimonies.seed.json` 6 kayıt). Yine de defensive: "Topluluktan henüz tanıklık yok" tek satır. |
| Yakın etkinlik yok (tarih geçmiş) | "Yakında planlı etkinlik yok — `/events` sayfasından geçmiş kayıtlara göz at." 1 satır mesaj. |
| `useFacilityScore` import cycle | Hook React'a bağlı, saf fn değil. Bu yüzden `facility-rank.ts` hook'u import **etmez**, kendi içinde aynı kuralı uygular. |

---

## 7. Erişilebilirlik

- Her `<section>` `aria-labelledby` ile başlığa bağlı (Dashboard placeholder'da zaten doğru kurulmuş).
- Her MiniFacilityCard root'u `<Link>` veya `<article>` + içinde Detay `<Link>` — kart tamamını tıklanabilir yapmak için **`<Link>` wrapper** (FacilityList pattern'i).
- AccessibilityRadar mini varyant'ı role="img" + aria-label aynen taşır (component zaten yapıyor).
- Keşfet butonları büyük (`min-h-24`), emoji `aria-hidden`, label görünür Türkçe text.
- Focus ring: tüm interactive element'lerde `focus-visible:ring-2 focus-visible:ring-uyum-purple`.

---

## 8. Test Planı (manuel smoke — testing framework yok)

1. `npm run dev` → `localhost:5173`
2. Profilini reset → 4 adım onboarding → wheelchair / sitting / social.
3. Dashboard açılışı:
   - Üstte profil özeti.
   - "Sana Yakında" 3 tesis: en az 1'i yeşil dot'lu (mock data wheelchair için en az 2-3 yeşil tesis içeriyor).
   - Mini radar her kartta görünür (animasyonlu).
4. Tesis kartına "Detay" → `/facility/:id` açılır, geri dön.
5. "Topluluktan": 3 tanıklık + 1 yakın etkinlik (en yakını 2026-05-19 "Kuvvet Antrenmanı" — bugün 2026-05-16 ise).
6. Yeni tanıklık ekle (`/facility/f-ank-005` üzerinden) → Dashboard'a dön → "Topluluktan" en üstte yeni eklenmiş tanıklık (test 2'yi karşılar).
7. Keşfet 4 buton:
   - Yüzme → `/match` (canlı sayfa).
   - Diğer 3 → placeholder "Faz 9'de geliyor" sayfası — yine de route doğru çalışıyor.
8. Tab ile gezilebilirlik: her interactive element focus alır, ring görünür.
9. DevTools 393×852 viewport → kartlar tek kolona düşer, grid bozulmaz.
10. `npm run build` + `npm run lint` → temiz.

---

## 9. Risk & Geri Al

| Risk | Olasılık | Etki | Önlem |
|---|---|---|---|
| Recharts mini boyutta okunmaz | Orta | Düşük | Min `height=120` + mobile'da tam genişlik. Okunma niyeti "vibe"; detay zaten 1 tık ötede. |
| `pickTopFacilities` recompute pahalı | Düşük | Düşük | 10 facility × 6 boyut × 1 disabilityType = trivial; `useMemo` ile sarılır. |
| Faz 9 rotaları geç bitince Discover dead-end | Düşük | Düşük | Placeholder zaten "ana sayfaya dön" linki içeriyor (App.tsx'te). |
| Profile'da `disabilityType` değişimi sonrası rank güncellenmiyor | Düşük | Orta | `useMemo([facilities, profile.disabilityType, profile.mobilityLevel, profile.goal])`. |

---

## 10. Commit Stratejisi (atomik, COMMITS.md uyumlu)

1. `docs: add faz 8 dashboard design spec`
2. `feat: add facility rank helper for profile top-n`
3. `feat: add mini facility card for dashboard`
4. `feat: add community feed for dashboard`
5. `feat: add discover grid for dashboard`
6. `feat: wire dashboard sections with feed and discover`
7. `docs: record faz 8 dashboard decisions`

Branch: `feature/faz8-dashboard`. Merge stratejisi: PR aç, kullanıcıya bırak (mevcut akış: PR #14 gibi). `Co-Authored-By: Claude` satırı yok.

---

## 11. ÇEKİRDEK Bitti Ara Kontrol (build plan §886)

Faz 8 sonu için karşılanması beklenenler:

- [x] F1 morph çalışıyor, ARIA tam (Faz 6).
- [x] F2 harita 8+ tesis, profile pin (Faz 5).
- [x] F3 rehber + fallback + sesli okuma + PDF (Faz 7).
- [x] F4 canlı durum + tanıklık + localStorage (Faz 6).
- [x] F5 öneri zinciri (Faz 4).
- [ ] **F9 ana sayfa dolu (BU FAZ).**
- [x] A1, A2, A4, A5, A6, A7 toggle ve davranış aktif (Faz 2).
- [x] A3 sesli okuma 4 noktada (Faz 7).
- [ ] Vercel deploy bu commit ile güncel — kullanıcı PR merge ettiğinde otomatik.
