# Faz 9 — F6 Egzersiz + F7 Etkinlik + F8 Koç (GÜÇLENDİRME) Design

**Tarih:** 2026-05-16
**Hedef saat:** 11:30 – 13:30 (~2 saat)
**Bağımlılık:** Faz 8 tamam (ÇEKİRDEK ara kontrolün F9 maddesi yeşil; F1, F2, F3, F4, F5, A1–A7 hazır)
**Branch:** `feature/faz9-strengthen`

---

## 1. Amaç ve Kapsam

ÇEKİRDEK bitti. Bu faz **GÜÇLENDİRME** aşaması — P2 feature'ları (F6, F7, F8) hayata geçirip demo'yu zenginleştirir. Bu üç sayfa olmadan da demo akar; ama Dashboard'daki "Keşfet" grid'i üç dead-end placeholder'a düşüyor (`/exercises`, `/events`, `/coaches`). Bu fazın bitişi onları canlandırır ve aynı zamanda F5 (MatchSport) → CoachDirectory + FacilityDetail → CoachDirectory linklerini de gerçek hedefe oturtur.

Build plan §FAZ 9 (line 904–956) bire bir uygulanır. Mimari veya scope sapması yok.

### Kapsam içi (Definition of Done)

- [ ] `/exercises` — F6 ExerciseLibrary: 20 YouTube embed kartı, filtreler, altyazılı önce, disclaimer her kartta, DEMO VERİSİ rozeti.
- [ ] `/events` — F7 EventList: 8 etkinlik, profile uygun olanlar üstte, filtreler (tarih / spor / engel tipi), facility + kayıt linkleri.
- [ ] `/coaches` — F8 CoachDirectory: 8 koç, `?sport=` ve `?facility=` query filtreleri, profile uyumlu koçlar üstte, kartlarda sport + expertise + facility chip'leri.
- [ ] App.tsx'teki üç `NotImplemented` placeholder gerçek sayfalarla değiştirildi.
- [ ] FacilityDetail.tsx içinde "Bu tesiste çalışan koçlar" linki aktif (`facility.coaches.length > 0` koşulunda, `/coaches?facility={id}`'ye gider).
- [ ] Her sayfa: `<DemoBadge />`, `<AppShell>` içinde, klavye gezilebilir, focus ring `uyum-purple`.
- [ ] Boş state hiçbir filtre kombinasyonunda **kullanıcıyı dead-end'e atmaz** — açıklayıcı metin + filtreyi temizle butonu.
- [ ] Hiçbir runtime n8n / YouTube Data API / OpenAI çağrısı yok (network tab manuel doğrulanır).
- [ ] `tsc --noEmit` + `npm run build` + `npm run lint` temiz.

### Kapsam dışı (sessizce silinmez, taşınır)

- **WF-03 / WF-04 / WF-07** — Etkinlik, koç, egzersiz pipeline'ları post-MVP roadmap'inde. Hackathon'da kurulmuyor (platform doc §3 "Roadmap").
- **Çoklu dil** — `language` filtresi var ama UI dil değişimi yok (Türkçe sabit, CLAUDE.md).
- **Video paneli içinde kontrol** — YouTube embed kendi player'ını sağlar; custom play/pause çıkarmıyoruz.
- **Koç yardım talebi formu (WF-05)** — Bu faz dışı; mailto/tel link yeterli.

---

## 2. Mimari Karar Notları

| Konu | Karar | Gerekçe |
|---|---|---|
| F6 video kaynağı | `<iframe src="https://www.youtube.com/embed/{id}" loading="lazy" allowfullscreen>` — embed kullan, YouTube Data API runtime'da çağrılmaz | Build plan §FAZ 9.1 "YouTube Data API kullanma, exercises.json'dan yükle" + 0.4 "canlı YouTube Data API çağrısı" yasak. |
| F6 altyazı sıralama | `hasSubtitles: true` olanlar `false`'lardan önce | A5 İşitme Engelli UX kuralı (platform doc §A5) — build plan §FAZ 2.5'te uygulama Faz 9'a bırakılmıştı. |
| F6 disclaimer | Her kartın altında küçük çubuk: *"Bu içerikler bilgilendirme amaçlıdır. Ağrı varsa dur."* | Build plan §FAZ 9.1. Tekrar etmek kart bağımsızlığı için iyi — kullanıcı tek video paylaşırsa uyarı taşınmış olur. |
| F6 süre filtresi | 3 bucket: ≤10dk / 10-20dk / 20dk+ (duration int saniye) | Veri 600–1800sn aralığında. Sürekli slider yerine üç chip daha kısa karar. |
| F7 sıralama | Önce gelecek etkinlikler tarih ASC, sonra **opsiyonel** geçmiş etkinlikler dimmed bir bölümde | Demo "boş ekran" göstermesin; eğer aktif filtre sonucu geleceğe etkinlik kalmazsa "geçmiş etkinlikler" görünür. Build plan §FAZ 9.2 "boş state yok". |
| F7 profil boost'u | Future + profile uyumlu (event.disabilityTypes ⊇ profile.disabilityType) → en üst grup; sonra future + uyumsuz → ikinci grup; sonra past | Build plan "Profile uygun etkinlikler önce sıralanır" satırını basit kural ile karşılar — sıralama içinde yine tarih ASC. |
| F7 hazır hissettiğinde tonu | Etkinlik kartı CTA metni: *"Detayları gör"* veya *"Kayıt linki"* — "Hemen kaydol!" gibi performatif ifade yok | Build plan §FAZ 9.2 "Hazır hissettiğinde tonu — performans dayatması yok". |
| F8 `?sport=` filtresi | `coach.sports.includes(sportId)` ile filtre + üst şeritte aktif filtre chip'i ("Yüzme filtresi · Temizle ×") | Build plan §FAZ 9.3 "Query param `?sport=...` ile filtre (F5'ten geliş için)". |
| F8 `?facility=` filtresi | `coach.facilityIds.includes(facilityId)` — FacilityDetail'den geliş için ek query | Build planında açıkça yok ama §FAZ 6 "Bu tesiste çalışan koçlar → F8'e link (Faz 9'da aktif)" maddesini gerçekçi kılmak için zorunlu. |
| F8 profil boost'u | `coach.disabilityExpertise.includes(profile.disabilityType)` olanlar üst grupta; geri kalan altta | Demo'da kullanıcı kendi engel tipinde uzman koçu önce görmeli — F5'ten gelen "Koç bul" linkinin değer üretmesi için kritik. |
| F8 iletişim | `mailto:` ve `tel:` linkleri direkt görünür (mock veri ama gerçek format) | İletişim yok = boş kart. mailto/tel hackathon'da yeterli, WF-05 form roadmap. |
| Cross-page geliş yolları | FacilityDetail → CoachDirectory (`?facility=`), MatchSport → CoachDirectory (`?sport=`), Dashboard "Keşfet" → 3 yeni sayfa, FacilityDetail → spor önerisinden gelen tesis → "Bu tesiste çalışan koçlar" | Faz 9 sonunda F5 zinciri tam: Onboarding → Match → Map → Detail → Coaches |
| DEMO rozeti yeri | Her sayfanın hero'sunda 1 rozet + EventList'te etkinlikler tarihli olduğu için `label="Etkinlik verileri mock"` | Build plan §FAZ 9.1/2/3 her birinde rozet zorunlu. |
| Boş state davranışı | Filtre boş sonuç → açıklayıcı metin + "Filtreyi temizle" buton | DISCIPLINE.md §6 (dead-end yasak). |

---

## 3. Dosya & Component Planı

### Yeni dosyalar

```
src/lib/exercise-filter.ts          # saf fn: filterExercises(profile, filters, all) → sorted Exercise[]
src/lib/event-filter.ts             # saf fn: filterEvents(profile, filters, all, now) → grouped { upcoming, past }
src/lib/coach-filter.ts             # saf fn: filterCoaches(profile, filters, all) → sorted Coach[]
src/components/feature/ExerciseCard.tsx
src/components/feature/EventCard.tsx
src/components/feature/CoachCard.tsx
src/components/ui/FilterChip.tsx    # küçük seçilebilir chip (radiogroup item gibi) — F6/F7/F8 paylaşır
src/pages/ExerciseLibrary.tsx
src/pages/EventList.tsx
src/pages/CoachDirectory.tsx
```

### Değişen dosyalar

```
src/App.tsx                                                # NotImplemented → gerçek sayfa lazy-import
src/pages/FacilityDetail.tsx                               # "Bu tesiste çalışan koçlar" linki aktif (facility.coaches.length > 0 olduğunda)
docs-compliance/DECISIONS.md                               # yeni kayıt (en üste)
docs/superpowers/specs/2026-05-16-faz9-strengthen-design.md  # bu doc
```

### Component ağacı

```
<ExerciseLibrary>                                          // /exercises
  <HeroBar />                                              // başlık + DemoBadge + disclaimer satırı (sayfa düzeyinde)
  <FilterBar>
    <FilterGroup label="Engel tipi">  FilterChip ×4  </FilterGroup>
    <FilterGroup label="Hareket tipi">FilterChip ×3 </FilterGroup>
    <FilterGroup label="Süre">        FilterChip ×3 </FilterGroup>
    <FilterGroup label="Dil">         FilterChip ×2 </FilterGroup>
    <ClearButton />
  </FilterBar>
  <Grid>  ExerciseCard ×N (sorted)  </Grid>
  <EmptyState ifFiltered />
</ExerciseLibrary>

<EventList>                                                // /events
  <HeroBar />
  <FilterBar>
    <FilterGroup label="Tarih">       FilterChip ×3 (Bu hafta / Bu ay / Tümü) </FilterGroup>
    <FilterGroup label="Spor">        FilterChip ×N </FilterGroup>
    <FilterGroup label="Engel tipi">  FilterChip ×4 </FilterGroup>
    <ClearButton />
  </FilterBar>
  <Section title="Gelecek etkinlikler">  EventCard ×N  </Section>
  <Section title="Geçmiş etkinlikler" dimmed ifAny>  EventCard ×N  </Section>
</EventList>

<CoachDirectory>                                           // /coaches?sport=...&facility=...
  <HeroBar />
  <ActiveQueryChips /> // “Yüzme filtresi · Temizle ×” / “Etimesgut Engelli Spor Merkezi filtresi · Temizle ×”
  <FilterBar>
    <FilterGroup label="Engel uzmanlığı"> FilterChip ×4 </FilterGroup>
    <ClearButton />
  </FilterBar>
  <Grid>  CoachCard ×N  </Grid>
  <EmptyState ifFiltered />
</CoachDirectory>
```

---

## 4. Veri Akışı

```
ProfileContext (uyum:profile)
  ↓
ExerciseLibrary
  ├─ static import exercisesData (exercises.json)
  ├─ static import sportsData (yok — exercise sport bilgisi tutmuyor)
  ├─ filter state (useState) → exercise-filter.ts
  └─ ExerciseCard × N

EventList
  ├─ static import eventsData (events.json)
  ├─ static import sportsData (sports.json — filter dropdownu için)
  ├─ static import facilitiesData (facilities.json — facility adı resolve)
  ├─ filter state → event-filter.ts(profile, filters, eventsData, Date.now())
  └─ EventCard × N

CoachDirectory
  ├─ static import coachesData (coaches.json)
  ├─ static import sportsData (sport adı resolve)
  ├─ static import facilitiesData (facility adı resolve)
  ├─ URL query (useSearchParams: sport, facility)
  ├─ filter state (engel uzmanlığı checkbox seti) → coach-filter.ts
  └─ CoachCard × N
```

Hiçbir async load yok — Faz 5'in `loadFacilities()`'i sadece Overpass merge için gerekli; F7/F8 facility **adı** dışında veri çekmiyor, doğrudan `facilities.json` import yeterli (override edilen koordinatlar bu sayfalarda kritik değil). Bu seçim **bilinçli**: Async load + Suspense overhead'i bu üç sayfada değer üretmiyor.

---

## 5. Filtre Algoritmaları (saf fonksiyonlar)

### `exercise-filter.ts`

```ts
export interface ExerciseFilters {
  disabilityType: DisabilityType | 'all'
  mobilityLevel:  MobilityLevel | 'all'
  duration:       'short' | 'medium' | 'long' | 'all'  // ≤600 / 601-1200 / >1200
  language:       'tr' | 'en' | 'all'
}

export function filterExercises(
  filters: ExerciseFilters,
  all: Exercise[],
): Exercise[]
```

1. `filters.disabilityType !== 'all'` → `e.disabilityTypes.includes(filters.disabilityType)`.
2. `filters.mobilityLevel !== 'all'` → `e.mobilityLevel.includes(filters.mobilityLevel)`.
3. `filters.duration !== 'all'` → bucket check.
4. `filters.language !== 'all'` → `e.language === filters.language`.
5. **Sıralama:** `hasSubtitles desc → language tr önce → duration asc`. (A5 → Türkçe → kısa-uzun)

### `event-filter.ts`

```ts
export interface EventFilters {
  dateRange:      'week' | 'month' | 'all'
  sport:          string | 'all'
  disabilityType: DisabilityType | 'all'
}

export interface EventGroups {
  upcoming: SportEvent[]   // future, sıralı
  past:     SportEvent[]   // past, sıralı (sadece filtreden geçen)
}

export function filterEvents(
  filters: EventFilters,
  profile: UserProfile | null,
  all: SportEvent[],
  now: number,
): EventGroups
```

1. Filtreyi tüm etkinliklere uygula (tarih hariç — tarih ayrı dimension).
2. `dateRange === 'week'` → next 7 gün; `'month'` → next 30 gün; `'all'` → sınırsız.
3. Future + filtre kapsamında olanları **profile boost ile sırala**: profile uygun (event.disabilityTypes ⊇ profile.disabilityType) önce, sonra tarih ASC.
4. Past (now > date) olup filtreden geçenleri tarih DESC sırala.

### `coach-filter.ts`

```ts
export interface CoachFilters {
  sportId?:    string
  facilityId?: string
  expertise?:  DisabilityType[]   // çoklu seçim
}

export function filterCoaches(
  filters: CoachFilters,
  profile: UserProfile | null,
  all: Coach[],
): Coach[]
```

1. `sportId` varsa → `coach.sports.includes(sportId)`.
2. `facilityId` varsa → `coach.facilityIds.includes(facilityId)`.
3. `expertise` doluysa → `expertise.every(d => coach.disabilityExpertise.includes(d))` (AND mantığı).
4. **Sıralama:** profile.disabilityType uzmanı olanlar önce, sonra `yearsExperience` desc, sonra `name` asc.

---

## 6. Edge Case'ler

| Durum | Davranış |
|---|---|
| Profile yok (`null`) | Pages `RequireProfile` arkasında — render etmez. F6/F7/F8 RequireProfile guard'ına eklenecek. |
| Filtre kombinasyonu boş sonuç (F6/F8) | Tek satır: *"Bu filtreyle eşleşen [içerik] yok."* + `[Filtreleri temizle]` butonu. |
| EventList'te gelecek etkinlik yok ama filtre uyumlu past var | "Yakında planlı yeni etkinlik yok." başlığı + dimmed past listesi (2 demoluk için yeterli). |
| EventList'te ne future ne past sonuç | Empty state + "Filtreleri temizle". |
| F8 `?sport=` query'sinde olmayan sport id | Filtreyi yok say + console.warn. |
| F8 `?facility=` query'sinde olmayan facility id | Filtreyi yok say + console.warn. |
| F6 YouTube iframe block oluşturursa | Embed sandboxlı, browser kuralları çalışır. Demo'da `youtu.be` engellenirse Faz 10 polish'te poster image fallback. Hackathon scope dışı. |
| `exercises.json` içindeki `youtubeId` placeholder (`dQw4w9WgXcQ`) | Embed yine çalışır ama Rick Astley görünür — Faz 10 polish'te değiştirilebilir. Bu spec içeriği değiştirmez. |

---

## 7. Erişilebilirlik

- Her sayfa landmark `<main>` (AppShell'den geliyor) → `<section aria-labelledby="...">` blokları.
- FilterChip ler `role="radio"` (radiogroup içinde) veya `aria-pressed` (toggle button). Çoklu seçim olan engel uzmanlığında `aria-pressed` (toggle), tek seçim olanlarda `role="radio"` radiogroup.
- Her kart `<article>` ile sarılı, `aria-labelledby` başlık id'sine bağlı.
- YouTube iframe: `title="<exercise.title>"` zorunlu (A7 ARIA).
- Tarih ve süre etiketleri sadece görsel değil, metin de içeriyor ("Yarın 10:00", "10 dakika", "Altyazılı").
- mailto / tel linkleri: `aria-label="E-posta gönder: ayse.kara@..."` (icon-only butonlarda).
- DemoBadge `role="img"` + aria-label zaten kendi component'inde var.

---

## 8. Test Planı (manuel smoke — testing framework yok)

1. `npm run dev` → `localhost:5173`. Profilini reset → 4 adım: **wheelchair / independent / strength**.
2. Dashboard → "Keşfet" → "Egzersiz içeriği":
   - F6 açılır, en az 5 video. Altyazılı olanlar listenin başında.
   - "Hareket tipi → Oturarak" seç → liste daralır (en az 1 video).
   - "Filtreleri temizle" → liste tümüne döner.
   - Her kartta sağ üstte 🔠 (altyazılı) rozet, alt satırda disclaimer.
3. Dashboard → "Keşfet" → "Yakındaki etkinlikler":
   - F7 açılır, en üstte profile uyumlu future event (e-002 "Tekerlekli Basketbol Ligi Finali" 2026-06-07).
   - Tarih filtre "Bu hafta" → 2026-05-23 (Bahar Yüzme), 2026-05-19 (Kuvvet Antrenmanı) görünür.
   - "Spor → Boccia" → 1 etkinlik.
   - Bir etkinlik kartında "Tesis: Mamak Spor Salonu" linki → `/facility/f-ank-004` açılır, geri dön.
4. Dashboard → "Keşfet" → "Koç bul":
   - F8 açılır, en üstte profile uyumlu koçlar (`wheelchair` expertise).
   - URL'e elle `?sport=s-swim` ekle → 2 koç (c-001, c-007) görünür.
   - URL'e `?facility=f-ank-005` ekle → 3 koç (c-002, c-004, c-008).
   - Engel uzmanlığı chip "Görme" tıkla → 2 koç (c-005, c-008).
   - Aktif filtre chip "× Temizle" → filtre kalkar.
5. MatchSport sayfası (`/match`) → bir spor kartında "Koç bul" → `/coaches?sport=<id>` → F8 filtreli açılır.
6. FacilityDetail (`/facility/f-ank-005`) → en altta "Bu tesiste çalışan koçlar (3)" linki → `/coaches?facility=f-ank-005` açılır.
7. Klavye: Tab ile tüm filtre chip'lerine ulaşılır, Enter/Space ile seçilir, focus ring `uyum-purple`.
8. DevTools 393×852 viewport → grid 1 kolon, kart taşmaz.
9. DevTools Network tab → Hiçbir sayfada `youtube.com/api`, `n8n`, `openai` çağrısı yok (sadece YouTube `<iframe>` src request'i — bu beklenen).
10. `npx tsc --noEmit` + `npm run build` + `npm run lint` → temiz.

---

## 9. Risk & Geri Al

| Risk | Olasılık | Etki | Önlem |
|---|---|---|---|
| YouTube embed lazyload page-load'u uzatır | Düşük | Düşük | `loading="lazy"` zaten ekleniyor; ekrana inana kadar iframe HTTP isteği atmaz. |
| Filtre kombinasyonu hep boş sonuç (mock data dar) | Orta | Orta | Empty state + temizle butonu; ayrıca veri profile data 4 disabilityType × tüm mobility'yi kapsıyor (filter coverage matrisi yeterli). |
| `?sport=` URL'i refresh sonrası kayboluyor | Düşük | Düşük | useSearchParams kullanılır — URL'de kalır. |
| FacilityDetail "Koçlar" linki facility.coaches boş olduğunda görünür kalır | Düşük | Düşük | Conditional render: `facility.coaches.length > 0`. |
| F7 future olmadığı için sayfa boş | Düşük (hackathon tarihi 2026-05-16, en yakın etkinlik 2026-05-19) | Düşük | Past fallback dimmed bölüm; yine de F7 hep dolu. |
| `exercises.json` youtubeId placeholder skandalı | Düşük | Düşük (jüri 30sn video açmaz) | Spec değiştirmez; Faz 10 polish saatinde küratör listesi update edilir, scope notu DECISIONS'a girer. |

---

## 10. Commit Stratejisi (atomik, COMMITS.md uyumlu)

Branch: `feature/faz9-strengthen`. Her commit ≤ 1 mantıksal değişiklik, İngilizce, scope'suz, `Co-Authored-By: Claude` yok.

1. `docs: add faz 9 strengthen design spec`
2. `feat: add filter chip ui primitive`
3. `feat: add exercise filter helper`
4. `feat: add exercise card with subtitle priority and disclaimer`
5. `feat: add exercise library page with filters`
6. `feat: add event filter helper`
7. `feat: add event card with facility link`
8. `feat: add event list page with date and profile sort`
9. `feat: add coach filter helper`
10. `feat: add coach card with contact and facility chips`
11. `feat: add coach directory page with sport and facility query filters`
12. `feat: wire faz 9 routes and facility detail coach link`
13. `docs: record faz 9 strengthen decisions`

Squash merge'lemiyoruz — kullanıcı PR akışını korur.

---

## 11. ÇEKİRDEK + GÜÇLENDİRME Faz 9 sonu Ara Kontrol

Faz 9 sonu için karşılanması beklenenler:

- [x] F1 morph çalışıyor, ARIA tam (Faz 6).
- [x] F2 harita 8+ tesis, profile pin (Faz 5).
- [x] F3 rehber + fallback + sesli okuma + PDF (Faz 7).
- [x] F4 canlı durum + tanıklık + localStorage (Faz 6).
- [x] F5 öneri zinciri (Faz 4) — Faz 9 sonunda Koç linki **aktif**.
- [x] F9 ana sayfa dolu (Faz 8) — Faz 9 sonunda Keşfet butonları **canlı**.
- [ ] **F6 egzersiz kütüphanesi (BU FAZ).**
- [ ] **F7 etkinlik listesi (BU FAZ).**
- [ ] **F8 koç dizini (BU FAZ).**
- [x] A1, A2, A4, A5, A6, A7 toggle ve davranış aktif (Faz 2).
- [x] A3 sesli okuma 4 noktada (Faz 7).
- [ ] FacilityDetail "Bu tesiste çalışan koçlar" linki canlı (BU FAZ).

Sonraki faz: Faz 10 (Polish + Animasyonlar + Responsive + ARIA Audit).
