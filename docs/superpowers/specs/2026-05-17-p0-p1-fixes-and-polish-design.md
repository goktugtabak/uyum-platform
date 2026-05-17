# P0/P1 Fixes & Modern Polish — Design Spec

**Tarih:** 2026-05-17
**Branch:** `feature/frontend` (mevcut)
**Hedef:** Build hatasını gidermek, sahte yüzdeleri tamamen kaldırıp nitel etiket sistemine geçmek, harita marker'larında a11y üçlü kodlamayı (renk + glyph + metin) restore etmek, bookmark butonlarını çalışır hale getirmek, filtre UX'ini tüm sayfalarda tutarlılaştırmak, Profile sayfasını zenginleştirmek ve genel motion polish'i uygulamak.

---

## Karar Özeti

Brainstorming'de alınan kararlar:

- **Yüzde stratejisi:** Tamamen nitel etiketler. `%92`, `%X uygunluk`, `%matchPct` gibi tüm yüzdeler kaldırılır; yerine `Çok Uygun / Kısmen Uygun / Riskli / Bilgi Eksik` rozetleri gelir.
- **Marker stili:** Hibrit — foto marker korunur, üzerine renk + glyph (✓/~/✕/?) badge eklenir.
- **Bookmark:** 3 buton (FacilityDetail, ExerciseCard, EventList) çalışır hale getirilir. ProfileContext'e toggle metodları eklenir, localStorage'a persist.
- **Geolocation:** `Permissions-Policy: geolocation=(self)` — kendi origin'e izinli.
- **Filter UX:** CoachDirectory'deki label-above-value dropdown pattern'i EventList + FacilityMap + ExerciseLibrary'ye yayılır.
- **Profile:** Foto-içeren hero + activity timeline.
- **Polish:** Mikro etkileşim & motion (framer-motion zaten kurulu).

---

## Bölüm 1 — P0 Build Hatası

### Problem
[src/pages/FacilityMap.tsx:113](../../../src/pages/FacilityMap.tsx#L113) `useFacilityScore()`'dan `verifiedCount` destructure ediyor, ama hook `{ overall, counts, dimensions }` döndürüyor. `verifiedCount` sadece `RankedFacility` tipinde (lib/facility-rank.ts) var.

`tsc -b` çıktısı:
```
src/pages/FacilityMap.tsx(113,20): error TS2339:
  Property 'verifiedCount' does not exist on type 'FacilityScore'.
```

### Çözüm
Bölüm 2 ile birlikte uygulandığında `verifiedCount`'a hiç gerek kalmaz — yüzde hesabı tamamen siliniyor.

[FacilityMap.tsx:113-116](../../../src/pages/FacilityMap.tsx#L113-L116):
```tsx
// Önce
const { overall, verifiedCount } = useFacilityScore(facility, disabilityType)
const scorePct = Math.round((verifiedCount / 6) * 100)

// Sonra
const { overall } = useFacilityScore(facility, disabilityType)
// scorePct silindi
```

Popup içindeki `%{scorePct} uygunluk` (line 156) → `<ScoreBadge color={overall} />` ile değiştirilir.

`ranked.map()` iterasyonları (line 312, 490) zaten `RankedFacility` üzerinde çalışıyor → bunlar TS hatası vermiyor ama Bölüm 2'de yine de yüzde hesabı silinir, label kullanılır.

### DoD
- `npx tsc --noEmit` exit 0
- `npm run build` exit 0

---

## Bölüm 2 — Nitel Etiket Sistemi

### Tek doğruluk kaynağı

[src/lib/a11y-labels.ts](../../../src/lib/a11y-labels.ts)'e (mevcut dosya) eklenecek:

```ts
import type { ScoreColor } from '../hooks/useFacilityScore'

export const SCORE_LABEL: Record<ScoreColor, string> = {
  green:  'Çok Uygun',
  yellow: 'Kısmen Uygun',
  red:    'Riskli',
  gray:   'Bilgi Eksik',
}

export const SCORE_GLYPH: Record<ScoreColor, string> = {
  green: '✓', yellow: '~', red: '✕', gray: '?',
}

export const SCORE_TONE: Record<ScoreColor, string> = {
  green:  'bg-mint/60 text-mint-foreground',
  yellow: 'bg-[oklch(0.95_0.07_85)] text-[oklch(0.45_0.14_75)]',
  red:    'bg-destructive/15 text-destructive',
  gray:   'bg-muted text-foreground/70',
}
```

### Yeni component: ScoreBadge

`src/components/ui/ScoreBadge.tsx`:

```tsx
import type { ScoreColor } from '../../hooks/useFacilityScore'
import { SCORE_LABEL, SCORE_GLYPH, SCORE_TONE } from '../../lib/a11y-labels'

interface ScoreBadgeProps {
  color: ScoreColor
  size?: 'sm' | 'md' | 'lg'
  showGlyph?: boolean  // default true — a11y üçlüsünün glyph ayağı
}

export function ScoreBadge({ color, size = 'md', showGlyph = true }: ScoreBadgeProps) {
  const sizeCls = size === 'sm'
    ? 'px-2 py-0.5 text-[10px]'
    : size === 'lg'
    ? 'px-4 py-1.5 text-sm'
    : 'px-3 py-1 text-[11px]'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold ${SCORE_TONE[color]} ${sizeCls}`}>
      {showGlyph && <span aria-hidden>{SCORE_GLYPH[color]}</span>}
      {SCORE_LABEL[color]}
    </span>
  )
}
```

### Yeni component: MatchBadge (EventList için)

`src/components/ui/MatchBadge.tsx`:

```tsx
interface MatchBadgeProps {
  isMatch: boolean
}
export function MatchBadge({ isMatch }: MatchBadgeProps) {
  return isMatch ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/60 px-3 py-1 text-[11px] font-bold text-mint-foreground">
      <span aria-hidden>✓</span> Profiline Uygun
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-foreground/70">
      Genel Etkinlik
    </span>
  )
}
```

### Değişecek surface'ler

| Dosya | Önce | Sonra |
|---|---|---|
| `FacilityDetail.tsx:54-55` | `SCORE_PERCENT_BY_COLOR` constant | sil — `SCORE_LABEL` ortak kaynaktan import |
| `FacilityDetail.tsx:76, 124` | `%{score} {SCORE_LABEL[overall]}` | `<ScoreBadge color={overall} />` |
| `FacilityDetail.tsx:244` | `%{score}` büyük rakam | `<ScoreBadge color={overall} size="lg" />` + `{counts.verified}/6 boyut doğrulandı` minik altyazı |
| `FacilityMap.tsx:113-116` | yüzde destructure + hesap | `const { overall } = useFacilityScore(...)` |
| `FacilityMap.tsx:156` | popup `%{scorePct} uygunluk` | `<ScoreBadge color={overall} size="sm" />` |
| `FacilityMap.tsx:312, 490` | `scorePct` iterasyonları | label only |
| `Dashboard.tsx:177-178` | `Math.round((verifiedCount/6)*100)` → `%{scorePct}` | `<ScoreBadge color={overall} />` (`verifiedCount` destructure'ı kalır ama görsel kullanım gider) |
| `MatchSport.tsx:80-81, 234` | `facilityScorePct` helper | sil; label |
| `MiniFacilityCard.tsx:28, 83` | `SCORE_PERCENT` map | `SCORE_LABEL` + `SCORE_GLYPH` |
| `FacilityList.tsx:25, 62` | aynı | aynı |
| `EventList.tsx:91-96` | `profileMatchPercent` helper | sil |
| `EventList.tsx:165, 192-193` | `%{matchPct}` | `<MatchBadge isMatch={event.disabilityTypes.includes(profile.disabilityType)} />` |

### DoD
- Grep `%\{score|%\{matchPct|verifiedCount` → sıfır match (data tipi adı dışında)
- TS strict geçer
- `npm run build` exit 0

---

## Bölüm 3 — Hibrit Marker (Foto + Glyph Badge)

### Hedef
`LiveFacilityMarker` foto görselini korurken renk + glyph + metin üçlü kodlamayı geri kazandırmak. Şu an sadece foto + ince renkli çerçeve var (a11y zayıf).

### Değişim — buildPhotoIcon

[FacilityMap.tsx:54-102](../../../src/pages/FacilityMap.tsx#L54-L102) `buildPhotoIcon` fonksiyonu:

```ts
function buildPhotoIcon(
  imageUrl: string,
  color: string,
  glyph: string,         // YENİ — '✓' | '~' | '✕' | '?'
  scoreLabel: string,    // YENİ — aria-label için
  isDimmed: boolean,
  isHighlighted: boolean,
): L.DivIcon {
  const size = 48
  const opacity = isDimmed ? 0.45 : 1
  const ring = isHighlighted ? `3px solid #4C2A85` : `2px solid ${color}`
  const html = `
    <div role="img" aria-label="${scoreLabel}"
         style="position:relative;width:${size}px;height:${size + 6}px;opacity:${opacity};cursor:pointer;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.18));">
      <div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;
                  border:${ring};background:#fff;">
        <img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover;display:block;" alt="" />
      </div>
      <!-- Glyph badge (top-right) -->
      <span aria-hidden="true"
            style="position:absolute;top:-2px;right:-2px;
                   width:22px;height:22px;
                   background:${color};color:#fff;
                   border:2px solid #fff;border-radius:50%;
                   display:grid;place-items:center;
                   font-size:13px;font-weight:800;line-height:1;
                   box-shadow:0 1px 2px rgba(0,0,0,0.18);">
        ${glyph}
      </span>
      <!-- Teardrop tip -->
      <svg width="14" height="10" viewBox="0 0 14 10"
           style="position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);">
        <path d="M0 0 L 7 10 L 14 0 Z" fill="${color}" stroke="#fff" stroke-width="1" />
      </svg>
    </div>`
  return L.divIcon({ html, className: '', iconSize: [size, size + 6], iconAnchor: [size / 2, size + 6] })
}
```

### LiveFacilityMarker güncel kullanımı

```tsx
const { overall } = useFacilityScore(facility, disabilityType)
const color = COLOR_HEX[overall]
const glyph = SCORE_GLYPH[overall]
const scoreLabel = `${facility.name} — erişilebilirlik: ${SCORE_LABEL[overall]}`
const divIcon = buildPhotoIcon(imageUrl, color, glyph, scoreLabel, isDimmed, isHighlighted)
```

Popup içinde de Bölüm 2'deki `<ScoreBadge>` kullanılır → metin ayağı kapanır.

### FacilityPin (teardrop)
Mevcut [FacilityPin.tsx](../../../src/components/map/FacilityPin.tsx) zaten doğru kodlamayı yapıyor (teardrop + spor ikon + status glyph badge). Sadece styling kaynağı paylaşılan `SCORE_GLYPH` / `SCORE_TONE`'a bağlanır — duplicate constant'lar (`STATUS_GLYPH`, `COLOR_LABELS`) silinir.

### A11y üçlü kontrol listesi (her marker)
- [x] Renk — badge zemin + teardrop tip
- [x] Glyph — badge içinde ✓/~/✕/?
- [x] Metin — aria-label + popup ScoreBadge

### DoD
- Harita popup'unda renk değişimini colorblind filter ile test → glyph hâlâ ayırt edilebilir
- High contrast mode'da badge görünür
- `npm run build` exit 0

---

## Bölüm 4 — Bookmark/Favori (Çalışır)

### Veri katmanı

**1.** [src/types/index.ts](../../../src/types/index.ts) `UserProfile`'a alan ekle:
```ts
favoriteExercises: string[]  // yeni — favoriteFacilities ve favoriteEvents zaten var
```

**2.** [src/contexts/ProfileContext.tsx](../../../src/contexts/ProfileContext.tsx)'e 3 method:
```ts
toggleFavoriteFacility(id: string): void
toggleFavoriteEvent(id: string): void
toggleFavoriteExercise(id: string): void
```

Implementation pattern:
```ts
function toggleFavoriteFacility(id: string) {
  setProfileState(prev => {
    if (!prev) return prev
    const has = prev.favoriteFacilities.includes(id)
    return {
      ...prev,
      favoriteFacilities: has
        ? prev.favoriteFacilities.filter(x => x !== id)
        : [...prev.favoriteFacilities, id],
    }
  })
}
```
Auto-persist mevcut `useEffect` üzerinden.

**3.** loadProfile'da geriye dönük uyumluluk: `favoriteExercises` yoksa `[]` doldur.

### UI katmanı — BookmarkButton

`src/components/ui/BookmarkButton.tsx`:
```tsx
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { motion } from 'framer-motion'

interface BookmarkButtonProps {
  active: boolean
  onToggle: () => void
  label: string                       // aria-label varyantı — bağlama özel
  size?: 'sm' | 'md'
  variant?: 'circle' | 'inline'       // circle = FacilityDetail style, inline = card köşesi
}

export function BookmarkButton({ active, onToggle, label, size = 'md', variant = 'inline' }: BookmarkButtonProps) {
  const Icon = active ? BookmarkCheck : Bookmark
  const sizeCls = size === 'sm' ? 'size-9' : 'size-12'
  const iconCls = size === 'sm' ? 'size-4' : 'size-5'
  const ariaLabel = active ? `${label} (kaydedildi)` : label
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      animate={active ? { scale: [1, 1.2, 1] } : { scale: 1 }}
      transition={{ duration: 0.2 }}
      className={
        variant === 'circle'
          ? `grid ${sizeCls} place-items-center rounded-full text-foreground/70 ring-1 ring-border/60 hover:bg-card ${active ? 'bg-primary/10 text-primary ring-primary/30' : ''}`
          : `${active ? 'text-primary' : 'text-foreground/60 hover:text-primary'}`
      }
    >
      <Icon aria-hidden className={`${iconCls} ${active ? 'fill-current' : ''}`} />
    </motion.button>
  )
}
```

Live region hook: `useAriaAnnounce(message)` — küçük helper, AppShell'deki `#aria-live-region`'a textContent yazar. Mevcut element [src/components/layout/AppShell.tsx:18-22](../../../src/components/layout/AppShell.tsx#L18-L22).

### 3 entegrasyon noktası

**FacilityDetail.tsx:179-186** — circle variant, `label="Tesisi favorilere ekle"`, name dahil announce.

**ExerciseCard.tsx:89-91** — inline variant, sm size, `label={exercise.title + ' egzersizini kaydet'}`.

**EventList.tsx:261-267** — circle variant, sm size, `label={event.title + ' etkinliğini kaydet'}`.

### DoD
- 3 surface'te tıklama → ikon dolar + `aria-pressed=true` + localStorage'a yazılır + `#aria-live-region` "X kaydedildi" duyurur
- Sayfa reload sonrası state korunur
- Profile sayfasındaki favori sayısı canlı yansır (`profile.favoriteX.length` zaten görünüyor; otomatik update)

---

## Bölüm 5 — Filter UX (CoachDirectory Pattern Yayılır)

### Shared component

CoachDirectory içindeki inline `FilterDropdown` (line 63-133) yeni dosyaya taşınır:

`src/components/ui/FilterDropdown.tsx` — interface aynı kalır; export named.

`src/components/ui/ActiveFilterChip.tsx` — yeni:
```tsx
interface ActiveFilterChipProps {
  label: string
  onRemove: () => void
}
export function ActiveFilterChip({ label, onRemove }: ActiveFilterChipProps) {
  return (
    <motion.span
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
    >
      {label}
      <button type="button" onClick={onRemove} aria-label={`${label} filtresini kaldır`}
              className="grid size-4 place-items-center rounded-full bg-primary/20 hover:bg-primary/30">
        <X aria-hidden className="size-3" />
      </button>
    </motion.span>
  )
}
```

### EventList değişimi

[src/pages/EventList.tsx:522-612](../../../src/pages/EventList.tsx#L522-L612) `Filter pills` + `secondary panel` blok'u silinir, yerine:

```
┌─────────────────────────────────────────────────────────┐
│ [Senin için] CTA pill (özel)                            │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│ │ TARİH ▼ │ │ SPOR  ▼ │ │ ENGEL ▼ │ │ SEVİYE▼ │         │
│ │ Bu hafta│ │ Tümü    │ │ Tümü    │ │ Tümü    │         │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
├─────────────────────────────────────────────────────────┤
│ Aktif: [Tarih: Bu hafta ✕] [Spor: Yüzme ✕]   Temizle    │
└─────────────────────────────────────────────────────────┘
```

`showSecondary` state silinir; grid daima görünür. "Filtrele" rozeti aktif filter sayısını gösteren minik rozetle değişebilir (opsiyonel).

### FacilityMap değişimi

[src/pages/FacilityMap.tsx:244-...](../../../src/pages/FacilityMap.tsx#L244) aynı pattern — 3 dropdown:
- Spor Dalı (URL `?sport=` ile senkron)
- Erişilebilirlik Özellikleri (verified/partial/none filter)
- Engel tipi (current disabilityType state)

### ExerciseLibrary değişimi

Mevcut filter UI'ı (dosyayı brainstorming'de okumadım ama pattern aynı uygulanır):
- Kategori dropdown
- Dil dropdown
- Süre dropdown

### DoD
- 3 sayfada filtre UI tutarlı
- Mobile'de grid 2-col (`grid-cols-2`), sm+ 3-col, lg+ 4 veya 5-col (sayfaya göre)
- Aktif filter chip'leri AnimatePresence ile enter/exit
- Filtreleri temizle butonu her sayfada aynı pozisyonda

---

## Bölüm 6 — Profile Sayfası (Hero + Activity Timeline)

### Yeni layout

```
┌────────────────────────────────────────────────────────────┐
│ HERO                                                       │
│  ┌────────────────────┐  ┌──────────────┐                  │
│  │ Avatar (gradient)  │  │ Edit profile │ ← CTA            │
│  │ Tekerlekli Sandalye│  └──────────────┘                  │
│  │ Ankara · UYUM üyesi│                                    │
│  │ ✓ Profil tamamlandı│                                    │
│  └────────────────────┘                                    │
│            [dashboard-hero.jpg fade mask sağda]            │
├────────────────────────────────────────────────────────────┤
│ [3 Fact tile — mevcut korunur]                             │
├────────────────────────────────────────────────────────────┤
│ FAVORİLERİN                                                │
│  Tesisler (3):       [MiniFavCard] [MiniFavCard] [+ ekle] │
│  Etkinlikler (1):    [MiniFavCard] [+ ekle]                │
│  Egzersizler (0):    [Henüz favori egzersiz yok — Keşfet]  │
├────────────────────────────────────────────────────────────┤
│ AKTİVİTE                                                   │
│  ● 17 May 14:30 — Eryaman Spor Tesisi'ni favoriledin       │
│  ● 17 May 14:25 — Spor önerini gör'den 3 öneri aldın       │
│  ● 17 May 14:20 — Profilini tamamladın                     │
├────────────────────────────────────────────────────────────┤
│ [Gizlilik & Veri — mevcut korunur]                         │
└────────────────────────────────────────────────────────────┘
sidebar: AccessibilityToolbar + "Önerini yenile" mevcut korunur
```

### Yeni component: MiniFavCard

`src/components/feature/MiniFavCard.tsx`:
```tsx
interface MiniFavCardProps {
  href: string
  image: string
  title: string
  subtitle?: string
  onRemove: () => void
  removeLabel: string  // aria-label
}
```

Tasarım: rounded-2xl + foto thumbnail 80px + isim + uzaklık/tarih + sağ-üst köşede `X` butonu (BookmarkButton'dan farklı — kalıcı silme, hover'da görünür).

### Activity timeline

`src/lib/activity-log.ts`:
```ts
export type ActivityType =
  | 'profile_created'
  | 'profile_updated'
  | 'favorite_added'
  | 'match_run'
  | 'facility_viewed'

export interface ActivityEntry {
  ts: number          // unix ms
  type: ActivityType
  refId?: string      // facility/event/exercise id
  label: string       // pre-formatted display string
}

const STORAGE_KEY = 'uyum:activity'
const MAX_ENTRIES = 20

export function pushActivity(entry: Omit<ActivityEntry, 'ts'>): void { ... }
export function loadActivity(): ActivityEntry[] { ... }
export function clearActivity(): void { ... }
```

Activity push noktaları:
- `Onboarding` complete → `profile_created`
- `Onboarding` revisit + save → `profile_updated`
- `ProfileContext.toggleFavorite*` → `favorite_added` (label içinde "Eryaman Spor Tesisi'ni favoriledin")
- `MatchSport` mount + match çalıştığında → `match_run`
- `FacilityDetail` mount → `facility_viewed` (debounce yok; gelecekte eklenebilir)

Display: `ActivityRow` component, bullet renk by type (mint/accent/sky).

Boş durum: "Daha fazla keşfettikçe burada görünecek." + CTA "Tesisleri keşfet → /map"

### Persona "headline" kişiselleştirme

Hero'da:
```tsx
const headline = profile.favoriteFacilities.length > 0
  ? `${profile.favoriteFacilities.length} tesis keşfettin · ${profile.favoriteEvents.length} etkinliğe ilgi gösterdin`
  : 'Keşfetmeye başlamak için spor önerini gör'
```

### Profile.tsx değişim özeti
- Mevcut hero kart `rounded-3xl bg-card` korunur ama foto mask ile genişletilir
- Fact tile'lar aynı kalır
- Favori bölümü `FavRow` (sadece count) → `MiniFavCard` grid'ine evrilir
- Aktivite bölümü tamamen yeni
- Gizlilik & Veri ve sidebar değişmez

### DoD
- Sayfa scroll boyu 5 belirgin bölüm: Hero / Facts / Favorites / Activity / Privacy
- Boş favori → CTA görünür
- Boş activity → empty state görünür
- Reload sonrası activity korunur
- LocalStorage `uyum:activity` 20 girişi geçmez (rotation)

---

## Bölüm 7 — Mikro Etkileşim & Motion

### Hedef
Tasarımı "standart AI çıktısı" üstüne çıkarmak — küçük, fark edilir motion detayları. `framer-motion` zaten kurulu (Faz 10 route transitions).

### Motion noktaları

**1. ScoreBadge mount animasyonu**

`<ScoreBadge>` içine `motion.span` wrap:
```tsx
<motion.span
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
  className={...}
>
```

**2. BookmarkButton toggle** — Bölüm 4'te tanımlı.

**3. Card hover** — global; Tailwind class'larına ek `transition-all duration-200` standartlaştır:
- `MiniFacilityCard`, `EventCard` (yoksa oluştur), `CoachCard`, `ExerciseCard`, `SportMatchCard`, `MiniFavCard`
- Hover: `-translate-y-0.5 shadow-card` (zaten birçoğunda var, eksik olanlara ekle)

**4. ActiveFilterChip enter/exit** — Bölüm 5'te `AnimatePresence`.

**5. Sidebar nav indicator (layoutId)**

[src/components/layout/Sidebar.tsx](../../../src/components/layout/Sidebar.tsx) içinde aktif route bağlantısının yanında motion glide indicator:
```tsx
{isActive && (
  <motion.span
    layoutId="sidebar-active"
    className="absolute inset-y-1 left-0 w-1 rounded-r bg-primary"
    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
  />
)}
```

**6. Primary CTA hover glow** — `transition-shadow duration-300 hover:shadow-glow` ile tutarlılaştır. Şu an bazı yerlerde shadow var, bazılarında yok.

### Reduced motion

`src/styles/globals.css`'e ek:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

framer-motion global: `MotionConfig` AppShell'in en üstüne:
```tsx
import { MotionConfig, useReducedMotion } from 'framer-motion'
// AppShell içinde
const reduced = useReducedMotion()
<MotionConfig reducedMotion={reduced ? 'always' : 'user'}>
  ...
</MotionConfig>
```

### DoD
- `prefers-reduced-motion: reduce` aktifken hiçbir animasyon görünmez
- Sidebar active indicator smooth glide
- ScoreBadge mount animasyonu page load'da fark edilir
- Bookmark toggle pulse görünür

---

## Bölüm 8 — Geolocation (vercel.json)

[vercel.json:15](../../../vercel.json#L15) değişim:
```diff
- { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" }
+ { "key": "Permissions-Policy", "value": "geolocation=(self), microphone=(), camera=()" }
```

[FacilityMap.tsx:211-217](../../../src/pages/FacilityMap.tsx#L211-L217) handleLocate fonksiyonu zaten doğru — sadece policy açıldı.

### DoD
- Vercel production'da "Konumu Kullan" butonu çalışır
- localhost'ta zaten çalışıyordu (header dev'de uygulanmıyor)
- Geolocation permission denied → graceful fallback Ankara center (zaten var)

---

## Uygulama Sırası

Atomik commit disiplinine uygun mikro-fazlama:

1. **Bölüm 1+2:** P0 build hatası + nitel etiket sistemi (tek commit ailesi, çünkü birbirine bağımlı)
   - 1a: `feat: add SCORE_LABEL + ScoreBadge component`
   - 1b: `feat: replace fake percentages with qualitative ScoreBadge`
   - 1c: `feat: add MatchBadge for event profile match`
2. **Bölüm 3:** Hibrit marker
   - `ui: add glyph badge to facility map markers`
3. **Bölüm 4:** Bookmark
   - 4a: `feat: add toggleFavoriteX methods to ProfileContext`
   - 4b: `feat: add BookmarkButton component with animation`
   - 4c: `feat: wire bookmark buttons in FacilityDetail/Exercise/Event`
4. **Bölüm 5:** Filter UX
   - 5a: `refactor: extract FilterDropdown to shared component`
   - 5b: `ui: unify filter UX on EventList`
   - 5c: `ui: unify filter UX on FacilityMap`
   - 5d: `ui: unify filter UX on ExerciseLibrary`
5. **Bölüm 6:** Profile
   - 6a: `feat: add activity log storage`
   - 6b: `feat: add MiniFavCard component`
   - 6c: `ui: redesign Profile page with hero + favorites + activity`
6. **Bölüm 7:** Motion polish
   - 7a: `ui: add micro-interactions to badges and bookmarks`
   - 7b: `ui: add sidebar active indicator with layoutId`
   - 7c: `chore: honor prefers-reduced-motion globally`
7. **Bölüm 8:** Geolocation
   - `fix: allow geolocation on same origin in vercel headers`

Toplam ~15 atomik commit.

---

## Test stratejisi

`docs-compliance/DISCIPLINE.md` "test yazmayız — manuel smoke" kararı geçerli. Manuel smoke checklist:

**Golden path:**
1. `npm run dev` → onboarding tamamla → dashboard
2. Dashboard kartında `<ScoreBadge>` görünür, glyph + label
3. `/map` → 5 pin görünür, foto + glyph badge sağ-üst
4. Pin tıkla → popup → ScoreBadge görünür, ana CTA
5. Pin tıkla detay → favori butonu doldur → reload → favori dolu kalır
6. `/profile` → Favorilerim'de tesis görünür, activity timeline'da "favoriledin" satırı
7. `/events` → filter dropdown'lar açılır, aktif filter chip dismiss edilebilir
8. `/match` → spor önerileri yüzde olmadan görünür, related facility'ler ScoreBadge
9. `/exercises` → ExerciseCard bookmark çalışır
10. A11y panel → colorblind filter aktif → glyph hâlâ ayırt edilebilir
11. `prefers-reduced-motion` browser flag → tüm animasyonlar duruyor
12. `npm run build` exit 0, `npx tsc --noEmit` exit 0, `npm run lint` exit 0

**Edge cases:**
- localStorage boş → onboarding'e yönlendir (zaten guard'lı)
- Eski profile (favoriteExercises yok) → loadProfile defaults uygular
- Activity 20+ entries → rotation, en yeni 20 kalır
- BookmarkButton toggle rapid → animation queue smooth

---

## Bilinen sınırlar (post-implementation)

- Activity log kullanıcı eylemini takip ediyor ama "x tesise gittin" gibi gerçek dünya verisi yok — sadece UI etkileşimi.
- BookmarkButton'da context menu yok (long-press silme) — sadece tek tıklama toggle.
- Filter "Senin için" pill EventList'te özel CTA olarak kalır; backend olmadığı için "akıllı" değil, sadece profile-match filter.
- Mobile drawer'da focus trap eklenmez (Faz 12 known limit).
- Cmd+K palette eklenmez (scope dışı, gelecek iterasyon).

---

## Geriye dönük uyumluluk

- localStorage `uyum:profile` eski formatta (no `favoriteExercises`) → loadProfile'da defaulta düşülür, kullanıcı re-onboard gerekmez.
- Eski activity yok → empty state gösterilir.
- Eski `SCORE_PERCENT` import'ları silinince TS compile-fail edecek → tek commit'te toplu silinir (atomik).
