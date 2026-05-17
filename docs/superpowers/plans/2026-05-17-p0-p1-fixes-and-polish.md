# P0/P1 Fixes & Modern Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the TypeScript build error, replace all fake percentages with qualitative score badges, restore a11y triple-coding on map markers, wire bookmark buttons, unify filter UX, enrich the Profile page, add micro-motion polish, and fix geolocation policy.

**Architecture:** Shared constants (`SCORE_LABEL`, `SCORE_GLYPH`, `SCORE_TONE`) in `src/lib/a11y-labels.ts` serve as the single source of truth for score display. New shared UI components (`ScoreBadge`, `MatchBadge`, `BookmarkButton`, `FilterDropdown`, `ActiveFilterChip`) are extracted so all pages consume them consistently. A new `src/lib/activity-log.ts` module handles persistent activity tracking. All changes are backward-compatible with existing localStorage data.

**Tech Stack:** React 18, TypeScript strict, Tailwind v3, framer-motion, lucide-react, Leaflet/react-leaflet. No new dependencies.

---

## File Map

**Created:**
- `src/lib/activity-log.ts` — activity log storage (Task 10)
- `src/components/ui/ScoreBadge.tsx` — qualitative score badge component (Task 2)
- `src/components/ui/MatchBadge.tsx` — event profile match badge (Task 3)
- `src/components/ui/BookmarkButton.tsx` — animated bookmark toggle (Task 6)
- `src/components/ui/FilterDropdown.tsx` — shared label-above-value dropdown (Task 8)
- `src/components/ui/ActiveFilterChip.tsx` — animated dismissible filter chip (Task 8)
- `src/components/feature/MiniFavCard.tsx` — mini favorite card for Profile (Task 11)

**Modified:**
- `src/lib/a11y-labels.ts` — add `SCORE_LABEL`, `SCORE_GLYPH`, `SCORE_TONE` (Task 1)
- `src/types/index.ts` — add `favoriteExercises: string[]` to `UserProfile` (Task 5)
- `src/contexts/ProfileContext.tsx` — add toggle methods + backward compat (Task 5)
- `src/pages/FacilityMap.tsx` — fix build error + photo marker glyph badge + filter UX (Tasks 1,4,9)
- `src/pages/FacilityDetail.tsx` — replace fake % with ScoreBadge + BookmarkButton (Tasks 2,7)
- `src/pages/Dashboard.tsx` — replace fake % with ScoreBadge (Task 2)
- `src/pages/MatchSport.tsx` — remove facilityScorePct + ScoreBadge (Task 2)
- `src/pages/EventList.tsx` — MatchBadge + BookmarkButton + filter UX (Tasks 3,7,9)
- `src/pages/ExerciseLibrary.tsx` — BookmarkButton + ActiveFilterChip row (Tasks 7,9)
- `src/pages/Profile.tsx` — hero + MiniFavCard + activity timeline (Task 11)
- `src/pages/Onboarding.tsx` — push profile_created/updated activity (Task 10)
- `src/components/map/FacilityPin.tsx` — use shared SCORE_GLYPH/SCORE_LABEL (Task 4)
- `src/components/map/FacilityList.tsx` — replace local SCORE_PERCENT/LABEL with shared (Task 2)
- `src/components/feature/MiniFacilityCard.tsx` — replace local SCORE_PERCENT/LABEL (Task 2)
- `src/components/feature/ExerciseCard.tsx` — wire BookmarkButton (Task 7)
- `src/components/layout/AppShell.tsx` — add MotionConfig + useReducedMotion (Task 13)
- `src/components/layout/Sidebar.tsx` — motion.span layoutId active indicator (Task 12)
- `src/styles/globals.css` — add prefers-reduced-motion block (Task 13)
- `vercel.json` — geolocation=(self) (Task 14)

---

## Task 1: Add shared score constants to a11y-labels.ts + fix build error

**Files:**
- Modify: `src/lib/a11y-labels.ts`
- Modify: `src/pages/FacilityMap.tsx` (lines 113–116 only)

- [ ] **Step 1: Add constants to a11y-labels.ts**

Open `src/lib/a11y-labels.ts`. The file currently has `A11yLabel`, `LABELS`, `getAccessibilityLabel`. Append at the bottom:

```ts
import type { ScoreColor } from '../hooks/useFacilityScore'

export const SCORE_LABEL: Record<ScoreColor, string> = {
  green:  'Çok Uygun',
  yellow: 'Kısmen Uygun',
  red:    'Riskli',
  gray:   'Bilgi Eksik',
}

export const SCORE_GLYPH: Record<ScoreColor, string> = {
  green:  '✓',
  yellow: '~',
  red:    '✕',
  gray:   '?',
}

export const SCORE_TONE: Record<ScoreColor, string> = {
  green:  'bg-mint/60 text-mint-foreground',
  yellow: 'bg-[oklch(0.95_0.07_85)] text-[oklch(0.45_0.14_75)]',
  red:    'bg-destructive/15 text-destructive',
  gray:   'bg-muted text-foreground/70',
}
```

- [ ] **Step 2: Fix build error in FacilityMap.tsx**

In `src/pages/FacilityMap.tsx`, find line ~113 inside `LiveFacilityMarker`:

```ts
const { overall, verifiedCount } = useFacilityScore(facility, disabilityType)
const color = COLOR_HEX[overall]
const colorLabel = COLOR_LABELS[overall]
const scorePct = Math.round((verifiedCount / 6) * 100)
```

Replace with:

```ts
const { overall } = useFacilityScore(facility, disabilityType)
const color = COLOR_HEX[overall]
const colorLabel = COLOR_LABELS[overall]
```

- [ ] **Step 3: Verify build passes**

```bash
npx tsc --noEmit
```

Expected: no errors (exit 0).

- [ ] **Step 4: Commit**

```bash
git add src/lib/a11y-labels.ts src/pages/FacilityMap.tsx
git commit -m "feat: add SCORE_LABEL/GLYPH/TONE constants; fix verifiedCount build error"
```

---

## Task 2: Create ScoreBadge component + replace all fake percentages

**Files:**
- Create: `src/components/ui/ScoreBadge.tsx`
- Modify: `src/pages/FacilityDetail.tsx` (lines 54-55, 76, 124, 244)
- Modify: `src/pages/Dashboard.tsx` (lines 177-178)
- Modify: `src/pages/MatchSport.tsx` (lines 80-81, 234)
- Modify: `src/components/feature/MiniFacilityCard.tsx` (lines 28-33, 83)
- Modify: `src/components/map/FacilityList.tsx` (lines 25-27, 62)
- Modify: `src/pages/FacilityMap.tsx` (popup line ~156; list lines ~312, ~490)

- [ ] **Step 1: Create ScoreBadge**

Create `src/components/ui/ScoreBadge.tsx`:

```tsx
import { motion } from 'framer-motion'
import type { ScoreColor } from '../../hooks/useFacilityScore'
import { SCORE_LABEL, SCORE_GLYPH, SCORE_TONE } from '../../lib/a11y-labels'

interface ScoreBadgeProps {
  color: ScoreColor
  size?: 'sm' | 'md' | 'lg'
  showGlyph?: boolean
}

export function ScoreBadge({ color, size = 'md', showGlyph = true }: ScoreBadgeProps) {
  const sizeCls =
    size === 'sm' ? 'px-2 py-0.5 text-[10px]'
    : size === 'lg' ? 'px-4 py-1.5 text-sm'
    : 'px-3 py-1 text-[11px]'
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${SCORE_TONE[color]} ${sizeCls}`}
    >
      {showGlyph && <span aria-hidden>{SCORE_GLYPH[color]}</span>}
      {SCORE_LABEL[color]}
    </motion.span>
  )
}
```

- [ ] **Step 2: Update FacilityDetail.tsx**

In `src/pages/FacilityDetail.tsx`:

a) Remove these constants at lines 54-55:
```ts
const SCORE_PERCENT_BY_COLOR = { green: 92, yellow: 68, red: 35, gray: 50 } as const
const SCORE_LABEL = { green: 'Çok Uygun', yellow: 'Kısmen Uygun', red: 'Riskli', gray: 'Bilgi Yetersiz' } as const
```

b) Add imports at top:
```tsx
import { ScoreBadge } from '../components/ui/ScoreBadge'
```

c) In `FacilityDetailInner`, remove `score` variable:
```ts
// Remove:
const score = SCORE_PERCENT_BY_COLOR[overall]
```

Also destructure `counts` from `useFacilityScore`:
```ts
const { dimensions, overall, counts } = useFacilityScore(facility, disabilityType)
```

d) Line ~124 hero badge — replace:
```tsx
// Before:
<span className="inline-flex items-center gap-2 rounded-full bg-mint/60 px-3 py-1 text-[11px] font-bold text-mint-foreground">
  %{score} {SCORE_LABEL[overall]}
</span>

// After:
<ScoreBadge color={overall} size="md" />
```

e) Line ~244 score section (search for `font-display text-4xl font-extrabold text-primary-deep`):
```tsx
// Before:
<div className="font-display text-4xl font-extrabold text-primary-deep">%{score}</div>

// After:
<ScoreBadge color={overall} size="lg" />
<p className="mt-1 text-xs text-muted-foreground">{counts.verified}/6 boyut doğrulandı</p>
```

- [ ] **Step 3: Update Dashboard.tsx**

In `src/pages/Dashboard.tsx`, add import:
```tsx
import { ScoreBadge } from '../components/ui/ScoreBadge'
```

Find the ranked.map() at line ~177. Replace any `scorePct` display with:
```tsx
// Before (something like):
<span className="...">%{scorePct}</span>

// After:
<ScoreBadge color={overall} size="sm" />
```

`verifiedCount` destructure stays — only the `scorePct` visual is replaced. If `scorePct` is not declared elsewhere, remove its line too.

- [ ] **Step 4: Update MatchSport.tsx**

In `src/pages/MatchSport.tsx`:

a) Add import:
```tsx
import { ScoreBadge } from '../components/ui/ScoreBadge'
```

b) Remove lines 80-81:
```ts
function facilityScorePct(verifiedCount: number): number {
  return Math.round((verifiedCount / 6) * 100)
}
```

c) At line ~234 (inside related facilities map), replace:
```tsx
// Before:
%{facilityScorePct(verifiedCount)}

// After:
<ScoreBadge color={overall} size="sm" />
```

Note: The `related` array comes from `ranked` (RankedFacility[]) which has `{ facility, overall, verifiedCount }`. Destructure `overall` directly instead of computing a percentage.

- [ ] **Step 5: Update MiniFacilityCard.tsx**

In `src/components/feature/MiniFacilityCard.tsx`:

a) Remove local constants (lines 7-33: `SCORE_BG`, `SCORE_LABEL`, `SCORE_GLYPH`, `SCORE_PERCENT`).

b) Add imports:
```tsx
import { ScoreBadge } from '../ui/ScoreBadge'
```

c) Replace the score span (~line 79-84):
```tsx
// Before:
<span
  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${SCORE_BG[overall]}`}
  role="img"
  aria-label={SCORE_LABEL[overall]}
>
  <span aria-hidden>{SCORE_GLYPH[overall]}</span> %{SCORE_PERCENT[overall]}
</span>

// After:
<ScoreBadge color={overall} size="sm" />
```

- [ ] **Step 6: Update FacilityList.tsx**

In `src/components/map/FacilityList.tsx`:

a) Remove local constants (lines 13-27: `SCORE_BG`, `SCORE_GLYPH`, `SCORE_LABEL`, `SCORE_PERCENT`).

b) Add import:
```tsx
import { ScoreBadge } from '../ui/ScoreBadge'
```

c) Update the `aria-label` on the Link (line ~42) — still uses `SCORE_LABEL[overall]`:
```tsx
import { SCORE_LABEL } from '../../lib/a11y-labels'
// ...
aria-label={`${facility.name}, ${facility.district} — ${SCORE_LABEL[overall]}`}
```

d) Replace the score span (~line 58-63):
```tsx
// Before:
<span
  className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold ${SCORE_BG[overall]}`}
  role="img"
  aria-label={SCORE_LABEL[overall]}
>
  <span aria-hidden>{SCORE_GLYPH[overall]}</span> %{SCORE_PERCENT[overall]}
</span>

// After:
<ScoreBadge color={overall} size="sm" />
```

- [ ] **Step 7: Update FacilityMap.tsx — popup and list views**

In `src/pages/FacilityMap.tsx`:

a) Add import at top:
```tsx
import { ScoreBadge } from '../components/ui/ScoreBadge'
import { SCORE_LABEL } from '../lib/a11y-labels'
```

b) Inside `LiveFacilityMarker` Popup (around line 156), find the inline score span with `%{scorePct}` and replace. Note this is inside inline HTML string (not JSX). For the popup JSX content after the closing `</Link>` tag (the actual popup card is HTML string), find the `%{scorePct} uygunluk` span in `buildPhotoIcon` HTML string. This will be fixed in Task 4 when we rebuild `buildPhotoIcon` — leave for now, just delete the `scorePct` display from the popup JSX if there's a separate one.

c) In the FacilityList panel (lines ~312, ~490 in `ranked.map()`):
Find `scorePct` usage in the list/card views and replace with `<ScoreBadge color={overall} size="sm" />`. The `verifiedCount` in these loops comes from `RankedFacility` — it's fine to keep that destructuring for potential future use, but remove the `scorePct` calculation and display.

- [ ] **Step 8: Verify**

```bash
npx tsc --noEmit
npm run lint
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/components/ui/ScoreBadge.tsx src/pages/FacilityDetail.tsx src/pages/Dashboard.tsx src/pages/MatchSport.tsx src/components/feature/MiniFacilityCard.tsx src/components/map/FacilityList.tsx src/pages/FacilityMap.tsx
git commit -m "feat: replace fake percentages with ScoreBadge qualitative labels"
```

---

## Task 3: Create MatchBadge + replace EventList percentage

**Files:**
- Create: `src/components/ui/MatchBadge.tsx`
- Modify: `src/pages/EventList.tsx` (lines 91-96, 165, 192-193)

- [ ] **Step 1: Create MatchBadge**

Create `src/components/ui/MatchBadge.tsx`:

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

- [ ] **Step 2: Update EventList.tsx**

In `src/pages/EventList.tsx`:

a) Add import:
```tsx
import { MatchBadge } from '../components/ui/MatchBadge'
```

b) Remove lines 91-96 (`profileMatchPercent` function):
```ts
// Remove this entire function:
function profileMatchPercent(event: SportEvent, profile: { disabilityType: DisabilityType }): number {
  const hit = event.disabilityTypes.includes(profile.disabilityType) ? 1 : 0
  const sport = ALL_SPORTS.find(s => s.id === event.sport)
  const sportHit = sport?.suitableFor.includes(profile.disabilityType) ? 1 : 0
  return 70 + hit * 18 + sportHit * 8 - (event.level === 'yarışma' ? 6 : 0)
}
```

c) In `EventRow` component, remove `matchPct` from destructured state (line ~165):
```tsx
// Remove:
const matchPct = profileMatchPercent(event, profile)
```

d) Replace the `%{matchPct}` display (~line 192-193):
```tsx
// Before:
<div className="absolute right-0 top-0 text-right">
  <span className="block text-[11px] font-bold text-success">%{matchPct}</span>
  <span className="block text-[10px] text-muted-foreground">Uygunluk</span>
</div>

// After:
<div className="absolute right-0 top-0">
  <MatchBadge isMatch={event.disabilityTypes.includes(profile.disabilityType)} />
</div>
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/MatchBadge.tsx src/pages/EventList.tsx
git commit -m "feat: add MatchBadge; replace fake match percentage in EventList"
```

---

## Task 4: Hybrid map markers — photo + glyph badge

**Files:**
- Modify: `src/pages/FacilityMap.tsx` (lines 75-102 `buildPhotoIcon`, lines 113-120 `LiveFacilityMarker`)
- Modify: `src/components/map/FacilityPin.tsx` (use shared SCORE_GLYPH/SCORE_LABEL)

- [ ] **Step 1: Update buildPhotoIcon signature and HTML**

In `src/pages/FacilityMap.tsx`, replace the entire `buildPhotoIcon` function (lines 75-102):

```ts
function buildPhotoIcon(
  imageUrl: string,
  color: string,
  glyph: string,
  scoreLabel: string,
  isDimmed: boolean,
  isHighlighted: boolean,
): L.DivIcon {
  const size = 48
  const opacity = isDimmed ? 0.45 : 1
  const ring = isHighlighted ? '3px solid #4C2A85' : `2px solid ${color}`
  const html = `
    <div role="img" aria-label="${scoreLabel.replace(/"/g, '&quot;')}"
         style="position:relative;width:${size}px;height:${size + 6}px;opacity:${opacity};cursor:pointer;
                filter:drop-shadow(0 4px 8px rgba(0,0,0,0.18));">
      <div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;
                  border:${ring};background:#fff;">
        <img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover;display:block;" alt="" />
      </div>
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
      <svg width="14" height="10" viewBox="0 0 14 10"
           style="position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);">
        <path d="M0 0 L 7 10 L 14 0 Z" fill="${color}" stroke="#fff" stroke-width="1" />
      </svg>
    </div>`
  return L.divIcon({ html, className: '', iconSize: [size, size + 6], iconAnchor: [size / 2, size + 6] })
}
```

- [ ] **Step 2: Update LiveFacilityMarker to pass glyph + label**

In `LiveFacilityMarker`, add import at top of file:
```tsx
import { SCORE_LABEL, SCORE_GLYPH } from '../lib/a11y-labels'
```

Then update the marker body (around line 113-120):
```tsx
const { overall } = useFacilityScore(facility, disabilityType)
const color = COLOR_HEX[overall]
const glyph = SCORE_GLYPH[overall]
const scoreLabel = `${facility.name} — erişilebilirlik: ${SCORE_LABEL[overall]}`
const distanceKm = estimatedDistance(facility)
const divIcon = buildPhotoIcon(imageUrl, color, glyph, scoreLabel, isDimmed, isHighlighted)
```

Also remove the now-unused `colorLabel` variable if it was there.

Also update the Popup inline HTML — inside the popup card `%{scorePct} uygunluk` span (~line 156) — replace that inline span with just the score label text since we're in an HTML string:
```ts
// Find span with %{scorePct} uygunluk inside buildPhotoIcon's html string
// It was removed in Task 2 / now the glyph badge handles it visually
// In the Popup JSX card, find and replace:
// Before: background: color, ... '%{scorePct} uygunluk'
// After: '${SCORE_LABEL[overall]}'
```

The popup body (lines ~136-181) is JSX — find `%{scorePct} uygunluk` in the popup's inline style span and change to `{SCORE_LABEL[overall]}` with the same styling classes.

- [ ] **Step 3: Update FacilityPin.tsx to use shared constants**

In `src/components/map/FacilityPin.tsx`:

a) Remove local `STATUS_GLYPH` and `COLOR_LABELS` constants (lines 30-35).

b) Add import:
```tsx
import { SCORE_GLYPH, SCORE_LABEL } from '../../lib/a11y-labels'
```

c) Update usages:
```tsx
// Before:
const glyph = STATUS_GLYPH[overall]
// ...
const ariaLabel = `${facility.name} — erişilebilirlik: ${COLOR_LABELS[overall]}, ana spor: ${sportLabel}`

// After:
const glyph = SCORE_GLYPH[overall]
// ...
const ariaLabel = `${facility.name} — erişilebilirlik: ${SCORE_LABEL[overall]}, ana spor: ${sportLabel}`
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run build
```

Expected: exit 0 both.

- [ ] **Step 5: Commit**

```bash
git add src/pages/FacilityMap.tsx src/components/map/FacilityPin.tsx
git commit -m "ui: add glyph badge to facility photo markers; share SCORE_GLYPH from a11y-labels"
```

---

## Task 5: Add favoriteExercises to types + toggle methods to ProfileContext

**Files:**
- Modify: `src/types/index.ts` (line ~70 UserProfile)
- Modify: `src/contexts/ProfileContext.tsx`

- [ ] **Step 1: Add field to UserProfile**

In `src/types/index.ts`, find `UserProfile` interface (~line 63). Add `favoriteExercises`:

```ts
export interface UserProfile {
  disabilityType: DisabilityType
  mobilityLevel: MobilityLevel
  goal: Goal
  city: string
  favoriteFacilities: string[]
  favoriteEvents: string[]
  favoriteExercises: string[]   // ← NEW
  accessibility: AccessibilityPrefs
}
```

- [ ] **Step 2: Update ProfileContext with toggle methods + backward compat**

In `src/contexts/ProfileContext.tsx`:

a) Update `ProfileContextValue` interface to add the 3 toggle methods:
```ts
interface ProfileContextValue {
  profile:                 UserProfile | null
  hasProfile:              boolean
  setProfile:              (profile: UserProfile) => void
  updateProfile:           (patch: Partial<UserProfile>) => void
  clearProfile:            () => void
  toggleFavoriteFacility:  (id: string) => void
  toggleFavoriteEvent:     (id: string) => void
  toggleFavoriteExercise:  (id: string) => void
}
```

b) Update `loadProfile` for backward compat — add defaults for missing fields:
```ts
function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as UserProfile
    // backward compat: old profiles may lack favoriteExercises
    if (!p.favoriteExercises) p.favoriteExercises = []
    if (!p.favoriteFacilities) p.favoriteFacilities = []
    if (!p.favoriteEvents) p.favoriteEvents = []
    return p
  } catch {
    return null
  }
}
```

c) Add the 3 toggle functions inside `ProfileProvider`:
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

function toggleFavoriteEvent(id: string) {
  setProfileState(prev => {
    if (!prev) return prev
    const has = prev.favoriteEvents.includes(id)
    return {
      ...prev,
      favoriteEvents: has
        ? prev.favoriteEvents.filter(x => x !== id)
        : [...prev.favoriteEvents, id],
    }
  })
}

function toggleFavoriteExercise(id: string) {
  setProfileState(prev => {
    if (!prev) return prev
    const has = prev.favoriteExercises.includes(id)
    return {
      ...prev,
      favoriteExercises: has
        ? prev.favoriteExercises.filter(x => x !== id)
        : [...prev.favoriteExercises, id],
    }
  })
}
```

d) Add them to the `value` object:
```ts
const value: ProfileContextValue = {
  profile,
  hasProfile:              profile !== null,
  setProfile,
  updateProfile,
  clearProfile,
  toggleFavoriteFacility,
  toggleFavoriteEvent,
  toggleFavoriteExercise,
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/contexts/ProfileContext.tsx
git commit -m "feat: add favoriteExercises type + toggle favorite methods to ProfileContext"
```

---

## Task 6: Create BookmarkButton component

**Files:**
- Create: `src/components/ui/BookmarkButton.tsx`

- [ ] **Step 1: Create BookmarkButton**

Create `src/components/ui/BookmarkButton.tsx`:

```tsx
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { motion } from 'framer-motion'

interface BookmarkButtonProps {
  active: boolean
  onToggle: () => void
  label: string
  size?: 'sm' | 'md'
  variant?: 'circle' | 'inline'
}

function announceToLiveRegion(message: string) {
  const el = document.getElementById('aria-live-region')
  if (el) {
    el.textContent = ''
    requestAnimationFrame(() => { el.textContent = message })
  }
}

export function BookmarkButton({
  active,
  onToggle,
  label,
  size = 'md',
  variant = 'inline',
}: BookmarkButtonProps) {
  const Icon = active ? BookmarkCheck : Bookmark
  const sizeCls = size === 'sm' ? 'size-9' : 'size-12'
  const iconCls = size === 'sm' ? 'size-4' : 'size-5'
  const ariaLabel = active ? `${label} (kaydedildi)` : label

  function handleToggle() {
    onToggle()
    announceToLiveRegion(active ? `${label} favorilerden çıkarıldı` : `${label} favorilere eklendi`)
  }

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={handleToggle}
      whileTap={{ scale: 0.85 }}
      animate={active ? { scale: [1, 1.2, 1] } : { scale: 1 }}
      transition={{ duration: 0.2 }}
      className={
        variant === 'circle'
          ? `grid ${sizeCls} place-items-center rounded-full ring-1 ring-border/60 hover:bg-card transition-colors ${
              active ? 'bg-primary/10 text-primary ring-primary/30' : 'text-foreground/70'
            }`
          : `transition-colors ${active ? 'text-primary' : 'text-foreground/60 hover:text-primary'}`
      }
    >
      <Icon aria-hidden className={`${iconCls} ${active ? 'fill-current' : ''}`} />
    </motion.button>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/BookmarkButton.tsx
git commit -m "feat: add BookmarkButton component with framer-motion animation + aria-live announce"
```

---

## Task 7: Wire BookmarkButton in FacilityDetail, ExerciseCard, EventList

**Files:**
- Modify: `src/pages/FacilityDetail.tsx` (line ~179-186)
- Modify: `src/components/feature/ExerciseCard.tsx` (line ~89-91)
- Modify: `src/pages/EventList.tsx` (line ~261-267)

- [ ] **Step 1: Wire in FacilityDetail.tsx**

In `src/pages/FacilityDetail.tsx`:

a) Add imports:
```tsx
import { BookmarkButton } from '../components/ui/BookmarkButton'
import { useProfile } from '../contexts/ProfileContext'
```

Note: `useProfile` is already imported. Just add `BookmarkButton`.

b) Destructure toggle method in `FacilityDetailInner` props or pass it down. Since `FacilityDetailInner` receives `profile`, also pass the toggle. Actually simpler: call `useProfile()` inside `FacilityDetailInner`:

In `FacilityDetailInner`, add:
```tsx
const { toggleFavoriteFacility } = useProfile()
```

c) Replace the bookmark button (~line 179-186):
```tsx
// Before:
<button
  type="button"
  aria-label="Kaydet"
  className="grid size-12 place-items-center rounded-full text-foreground/70 ring-1 ring-border/60 hover:bg-card"
>
  <Bookmark className="size-4" aria-hidden />
</button>

// After:
<BookmarkButton
  active={profile.favoriteFacilities.includes(facility.id)}
  onToggle={() => toggleFavoriteFacility(facility.id)}
  label={`${facility.name} tesisini kaydet`}
  variant="circle"
  size="md"
/>
```

- [ ] **Step 2: Wire in ExerciseCard.tsx**

In `src/components/feature/ExerciseCard.tsx`:

a) Add imports:
```tsx
import { BookmarkButton } from '../ui/BookmarkButton'
import { useProfile } from '../../contexts/ProfileContext'
```

b) Inside `ExerciseCard`, add:
```tsx
const { profile, toggleFavoriteExercise } = useProfile()
```

c) Replace the bookmark button (~line 89-91):
```tsx
// Before:
<button type="button" aria-label="Kaydet">
  <Bookmark aria-hidden className="size-4 text-foreground/60 hover:text-primary" />
</button>

// After:
<BookmarkButton
  active={profile?.favoriteExercises.includes(exercise.id) ?? false}
  onToggle={() => toggleFavoriteExercise(exercise.id)}
  label={`${exercise.title} egzersizini kaydet`}
  variant="inline"
  size="sm"
/>
```

Remove the `Bookmark` import from lucide-react if it's only used here now.

- [ ] **Step 3: Wire in EventList.tsx**

In `src/pages/EventList.tsx`, `EventRow` component:

a) Add import:
```tsx
import { BookmarkButton } from '../components/ui/BookmarkButton'
```

b) `EventRow` receives `profile` prop already. Add `toggleFavoriteEvent` to its props:
```tsx
interface EventRowProps {
  event: SportEvent
  now: number
  profile: { disabilityType: DisabilityType }
  dimmed?: boolean
  toggleFavoriteEvent: (id: string) => void
  favoriteEventIds: string[]
}
```

c) Pass these from the parent `EventList` component:
```tsx
const { profile, toggleFavoriteEvent } = useProfile()
// In JSX:
<EventRow
  key={event.id}
  event={event}
  now={now}
  profile={profile}
  toggleFavoriteEvent={toggleFavoriteEvent}
  favoriteEventIds={profile.favoriteEvents}
/>
```

d) Replace the bookmark button inside `EventRow` (~line 261-267):
```tsx
// Before:
<button
  type="button"
  aria-label="Kaydet"
  className="grid size-9 place-items-center rounded-full text-foreground/70 hover:bg-card"
>
  <Bookmark className="size-4" aria-hidden />
</button>

// After:
<BookmarkButton
  active={favoriteEventIds.includes(event.id)}
  onToggle={() => toggleFavoriteEvent(event.id)}
  label={`${event.title} etkinliğini kaydet`}
  variant="circle"
  size="sm"
/>
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
npm run lint
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/pages/FacilityDetail.tsx src/components/feature/ExerciseCard.tsx src/pages/EventList.tsx
git commit -m "feat: wire BookmarkButton in FacilityDetail, ExerciseCard, EventList"
```

---

## Task 8: Create shared FilterDropdown + ActiveFilterChip components

**Files:**
- Create: `src/components/ui/FilterDropdown.tsx`
- Create: `src/components/ui/ActiveFilterChip.tsx`

- [ ] **Step 1: Extract FilterDropdown**

The `FilterDropdown` component is currently copy-pasted in `CoachDirectory.tsx`, `ExerciseLibrary.tsx`. Extract to a shared file.

Create `src/components/ui/FilterDropdown.tsx`:

```tsx
import { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

export interface DropdownOption {
  value: string
  label: string
}

interface FilterDropdownProps {
  label:    string
  value:    string
  options:  DropdownOption[]
  onChange: (next: string) => void
  open:     boolean
  onToggle: () => void
}

export function FilterDropdown({
  label, value, options, onChange, open, onToggle,
}: FilterDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onToggle()
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, onToggle])

  const current = options.find(o => o.value === value)?.label ?? 'Tümü'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between rounded-2xl bg-card px-4 py-2.5 text-left ring-1 transition hover:ring-primary/30 ${
          value !== 'all' && value !== '' ? 'ring-primary/40' : 'ring-border/50'
        }`}
      >
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className={`block text-[13px] font-bold ${value !== 'all' && value !== '' ? 'text-primary' : 'text-foreground'}`}>
            {current}
          </span>
        </span>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-2xl bg-card p-1 shadow-card ring-1 ring-border/40"
        >
          {options.map(o => {
            const active = o.value === value
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(o.value); onToggle() }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                    active ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {o.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create ActiveFilterChip**

Create `src/components/ui/ActiveFilterChip.tsx`:

```tsx
import { X } from 'lucide-react'
import { motion } from 'framer-motion'

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
      transition={{ duration: 0.15 }}
      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${label} filtresini kaldır`}
        className="grid size-4 place-items-center rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
      >
        <X aria-hidden className="size-3" />
      </button>
    </motion.span>
  )
}
```

- [ ] **Step 3: Update CoachDirectory.tsx to use shared FilterDropdown**

In `src/pages/CoachDirectory.tsx`:

a) Remove the inline `FilterDropdown` function (lines 63-133) and its `DropdownOption` interface.

b) Add imports:
```tsx
import { FilterDropdown, type DropdownOption } from '../components/ui/FilterDropdown'
```

All usages of `FilterDropdown` stay the same — interface is identical.

- [ ] **Step 4: Update ExerciseLibrary.tsx to use shared FilterDropdown**

In `src/pages/ExerciseLibrary.tsx`:

a) Remove inline `FilterDropdown` function (lines 94-164) and `DropdownOption` interface.

b) Add imports:
```tsx
import { FilterDropdown, type DropdownOption } from '../components/ui/FilterDropdown'
import { ActiveFilterChip } from '../components/ui/ActiveFilterChip'
import { AnimatePresence } from 'framer-motion'
```

c) After the existing filter dropdown grid, add the ActiveFilterChip row. The existing `isFiltered` flag and `clearFilters` function are already present. Add this block right after the dropdown grid (before the `-mt-6 mb-8` div):

```tsx
<AnimatePresence>
  {(filters.sport !== 'all' || filters.level !== 'all' || filters.equipment !== 'all' || filters.zone !== 'all') && (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {filters.sport !== 'all' && (
        <ActiveFilterChip
          label={`Spor: ${filters.sport.charAt(0).toLocaleUpperCase('tr') + filters.sport.slice(1)}`}
          onRemove={() => patch({ sport: 'all' })}
        />
      )}
      {filters.level !== 'all' && (
        <ActiveFilterChip
          label={`Seviye: ${filters.level.charAt(0).toLocaleUpperCase('tr') + filters.level.slice(1)}`}
          onRemove={() => patch({ level: 'all' })}
        />
      )}
      {filters.equipment !== 'all' && (
        <ActiveFilterChip
          label={`Ekipman: ${filters.equipment === 'none' ? 'Ekipman yok' : filters.equipment}`}
          onRemove={() => patch({ equipment: 'all' })}
        />
      )}
      {filters.zone !== 'all' && (
        <ActiveFilterChip
          label={`Bölge: ${filters.zone.charAt(0).toLocaleUpperCase('tr') + filters.zone.slice(1)}`}
          onRemove={() => patch({ zone: 'all' })}
        />
      )}
      <button
        type="button"
        onClick={clearFilters}
        className="text-xs font-bold text-primary underline-offset-2 hover:underline"
      >
        Tümünü temizle
      </button>
    </div>
  )}
</AnimatePresence>
```

Remove the old `-mt-6 mb-8` button that showed "Filtreleri temizle" separately (since we now have it in the chip row).

- [ ] **Step 5: Verify**

```bash
npx tsc --noEmit
npm run lint
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/FilterDropdown.tsx src/components/ui/ActiveFilterChip.tsx src/pages/CoachDirectory.tsx src/pages/ExerciseLibrary.tsx
git commit -m "refactor: extract FilterDropdown + ActiveFilterChip; wire in CoachDirectory + ExerciseLibrary"
```

---

## Task 9: Unify filter UX in EventList + FacilityMap

**Files:**
- Modify: `src/pages/EventList.tsx`
- Modify: `src/pages/FacilityMap.tsx`

- [ ] **Step 1: Update EventList.tsx filter section**

In `src/pages/EventList.tsx`:

a) Add imports:
```tsx
import { FilterDropdown } from '../components/ui/FilterDropdown'
import { ActiveFilterChip } from '../components/ui/ActiveFilterChip'
import { AnimatePresence } from 'framer-motion'
```

b) Add `openDD` state:
```tsx
const [openDD, setOpenDD] = useState<string | null>(null)
function toggleDD(key: string) {
  setOpenDD(prev => (prev === key ? null : key))
}
```

c) Add a `level` field to `EventFilters`. Check `src/lib/event-filter.ts` — if `level` filter doesn't exist, add it as a simple client-side post-filter. If it does exist, use it.

For now, add a `level` state in the page:
```tsx
const [levelFilter, setLevelFilter] = useState<EventLevel | 'all'>('all')

const LEVEL_OPTIONS = [
  { value: 'all', label: 'Tümü' },
  { value: 'başlangıç', label: 'Başlangıç' },
  { value: 'orta', label: 'Orta' },
  { value: 'ileri', label: 'İleri' },
  { value: 'yarışma', label: 'Yarışma' },
]
```

Apply level filter after `filterEvents`:
```tsx
const filteredUpcoming = levelFilter === 'all'
  ? upcoming
  : upcoming.filter(e => e.level === levelFilter)
const filteredPast = levelFilter === 'all'
  ? past
  : past.filter(e => e.level === levelFilter)
```

d) Replace the entire filter pills section (lines ~522-612: from `{/* Filter pills */}` through `{/* Working secondary filter strip */}` closing div):

```tsx
{/* Filter row */}
<div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
  <FilterDropdown
    label="Tarih"
    value={filters.dateRange}
    options={DATE_OPTIONS.map(o => ({ value: o.id, label: o.label }))}
    onChange={v => setFilters(f => ({ ...f, dateRange: v as DateRange }))}
    open={openDD === 'date'}
    onToggle={() => toggleDD('date')}
  />
  <FilterDropdown
    label="Spor"
    value={filters.sport}
    options={[{ value: 'all', label: 'Tümü' }, ...SPORTS_IN_EVENTS.map(s => ({ value: s.id, label: s.name }))]}
    onChange={v => setFilters(f => ({ ...f, sport: v }))}
    open={openDD === 'sport'}
    onToggle={() => toggleDD('sport')}
  />
  <FilterDropdown
    label="Engel Tipi"
    value={filters.disabilityType}
    options={[{ value: 'all', label: 'Tümü' }, ...DISABILITY_OPTIONS.map(o => ({ value: o.id, label: o.label }))]}
    onChange={v => setFilters(f => ({ ...f, disabilityType: v as DisabilityType | 'all' }))}
    open={openDD === 'disability'}
    onToggle={() => toggleDD('disability')}
  />
  <FilterDropdown
    label="Seviye"
    value={levelFilter}
    options={LEVEL_OPTIONS}
    onChange={v => setLevelFilter(v as EventLevel | 'all')}
    open={openDD === 'level'}
    onToggle={() => toggleDD('level')}
  />
</div>

{/* Active filter chips */}
<AnimatePresence>
  {(filters.dateRange !== 'all' || filters.sport !== 'all' || filters.disabilityType !== 'all' || levelFilter !== 'all') && (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      {filters.dateRange !== 'all' && (
        <ActiveFilterChip
          label={`Tarih: ${DATE_OPTIONS.find(o => o.id === filters.dateRange)?.label ?? ''}`}
          onRemove={() => setFilters(f => ({ ...f, dateRange: 'all' }))}
        />
      )}
      {filters.sport !== 'all' && (
        <ActiveFilterChip
          label={`Spor: ${SPORTS_IN_EVENTS.find(s => s.id === filters.sport)?.name ?? filters.sport}`}
          onRemove={() => setFilters(f => ({ ...f, sport: 'all' }))}
        />
      )}
      {filters.disabilityType !== 'all' && (
        <ActiveFilterChip
          label={`Engel: ${DISABILITY_OPTIONS.find(o => o.id === filters.disabilityType)?.label ?? ''}`}
          onRemove={() => setFilters(f => ({ ...f, disabilityType: 'all' }))}
        />
      )}
      {levelFilter !== 'all' && (
        <ActiveFilterChip
          label={`Seviye: ${LEVEL_OPTIONS.find(o => o.value === levelFilter)?.label ?? ''}`}
          onRemove={() => setLevelFilter('all')}
        />
      )}
      <button type="button" onClick={() => { clearFilters(); setLevelFilter('all') }}
              className="text-xs font-bold text-primary underline-offset-2 hover:underline">
        Tümünü temizle
      </button>
    </div>
  )}
</AnimatePresence>
```

Also update `isFiltered` to include `levelFilter`:
```tsx
const isFiltered =
  filters.dateRange !== 'all' ||
  filters.sport !== 'all' ||
  filters.disabilityType !== 'all' ||
  levelFilter !== 'all'
```

Remove `showSecondary` state entirely.

Also update the event list to use `filteredUpcoming` and `filteredPast` instead of `upcoming`/`past`.

- [ ] **Step 2: Update FacilityMap.tsx filter section**

In `src/pages/FacilityMap.tsx`:

a) Add imports:
```tsx
import { FilterDropdown } from '../components/ui/FilterDropdown'
import { ActiveFilterChip } from '../components/ui/ActiveFilterChip'
import { AnimatePresence } from 'framer-motion'
```

b) Replace the current filter pills section (the `{/* Filter pills */}` div with "Filtrele" + mock pills):

```tsx
{/* Filter row */}
<div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
  <FilterDropdown
    label="Spor Dalı"
    value={sportFilter ?? 'all'}
    options={[
      { value: 'all', label: 'Tümü' },
      ...Array.from(new Set(facilities.flatMap(f => f.sports))).map(id => ({
        value: id,
        label: getSportLabel(id),
      })),
    ]}
    onChange={v => {
      const next = new URLSearchParams(searchParams)
      if (v === 'all') next.delete('sport'); else next.set('sport', v)
      setSearchParams(next)
    }}
    open={openDD === 'sport'}
    onToggle={() => toggleDD('sport')}
  />
  <FilterDropdown
    label="Engel Tipi"
    value={disabilityType}
    options={DISABILITY_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
    onChange={v => setDisabilityType(v as DisabilityType)}
    open={openDD === 'disability'}
    onToggle={() => toggleDD('disability')}
  />
</div>
```

Add `openDD` state and `toggleDD`:
```tsx
const [openDD, setOpenDD] = useState<string | null>(null)
function toggleDD(key: string) {
  setOpenDD(prev => (prev === key ? null : key))
}
```

c) Add active filter chips below the dropdown grid:
```tsx
<AnimatePresence>
  {(sportFilter || disabilityType !== profile?.disabilityType) && (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {sportFilter && (
        <ActiveFilterChip
          label={`Spor: ${getSportLabel(sportFilter)}`}
          onRemove={() => {
            const next = new URLSearchParams(searchParams)
            next.delete('sport')
            setSearchParams(next)
          }}
        />
      )}
    </div>
  )}
</AnimatePresence>
```

Remove `showSecondary` state and the secondary panel block.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run lint
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/pages/EventList.tsx src/pages/FacilityMap.tsx
git commit -m "ui: unify filter UX with FilterDropdown + ActiveFilterChip in EventList + FacilityMap"
```

---

## Task 10: Activity log storage + push points

**Files:**
- Create: `src/lib/activity-log.ts`
- Modify: `src/pages/Onboarding.tsx`
- Modify: `src/contexts/ProfileContext.tsx`

- [ ] **Step 1: Create activity-log.ts**

Create `src/lib/activity-log.ts`:

```ts
export type ActivityType =
  | 'profile_created'
  | 'profile_updated'
  | 'favorite_added'
  | 'match_run'
  | 'facility_viewed'

export interface ActivityEntry {
  ts: number
  type: ActivityType
  refId?: string
  label: string
}

const STORAGE_KEY = 'uyum:activity'
const MAX_ENTRIES = 20

export function pushActivity(entry: Omit<ActivityEntry, 'ts'>): void {
  try {
    const existing = loadActivity()
    const next: ActivityEntry = { ...entry, ts: Date.now() }
    const updated = [next, ...existing].slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // quota exceeded — silently ignore
  }
}

export function loadActivity(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ActivityEntry[]
  } catch {
    return []
  }
}

export function clearActivity(): void {
  localStorage.removeItem(STORAGE_KEY)
}
```

- [ ] **Step 2: Push profile_created/updated in Onboarding**

In `src/pages/Onboarding.tsx`, find where `setProfile(...)` is called (the final step submit). Add:

```tsx
import { pushActivity } from '../lib/activity-log'
// ...
// After setProfile(newProfile):
pushActivity({
  type: hasProfile ? 'profile_updated' : 'profile_created',
  label: hasProfile ? 'Profilini güncelledin' : 'Profilini oluşturdu',
})
```

Note: `hasProfile` comes from `useProfile()`.

- [ ] **Step 3: Push favorite_added in ProfileContext**

In `src/contexts/ProfileContext.tsx`, add import at top:
```ts
import { pushActivity } from '../lib/activity-log'
```

In `toggleFavoriteFacility`, after setting state, push activity:
```ts
function toggleFavoriteFacility(id: string) {
  setProfileState(prev => {
    if (!prev) return prev
    const has = prev.favoriteFacilities.includes(id)
    if (!has) {
      pushActivity({ type: 'favorite_added', refId: id, label: `Tesis favorilere eklendi` })
    }
    return {
      ...prev,
      favoriteFacilities: has
        ? prev.favoriteFacilities.filter(x => x !== id)
        : [...prev.favoriteFacilities, id],
    }
  })
}
```

Same pattern for `toggleFavoriteEvent` and `toggleFavoriteExercise` with appropriate labels.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/activity-log.ts src/pages/Onboarding.tsx src/contexts/ProfileContext.tsx
git commit -m "feat: add activity log storage; push events from Onboarding and ProfileContext"
```

---

## Task 11: Redesign Profile page — hero + MiniFavCard + activity timeline

**Files:**
- Create: `src/components/feature/MiniFavCard.tsx`
- Modify: `src/pages/Profile.tsx`

- [ ] **Step 1: Create MiniFavCard**

Create `src/components/feature/MiniFavCard.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

interface MiniFavCardProps {
  href: string
  image?: string
  title: string
  subtitle?: string
  initials?: string
  onRemove: () => void
  removeLabel: string
}

export function MiniFavCard({ href, image, title, subtitle, initials, onRemove, removeLabel }: MiniFavCardProps) {
  return (
    <div className="group relative flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border/40 transition hover:ring-primary/40 hc:bg-white hc:ring-black">
      <Link to={href} className="flex min-w-0 flex-1 items-center gap-3" aria-label={title}>
        {image ? (
          <img src={image} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
        ) : (
          <div aria-hidden className="grid size-14 shrink-0 place-items-center rounded-xl bg-gradient-brand text-base font-bold text-primary-foreground">
            {initials ?? title[0]}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-foreground group-hover:text-primary hc:text-black">
            {title}
          </div>
          {subtitle && (
            <div className="truncate text-[11px] text-muted-foreground">{subtitle}</div>
          )}
        </div>
      </Link>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-card text-muted-foreground opacity-0 ring-1 ring-border/40 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Rewrite Profile.tsx**

In `src/pages/Profile.tsx`, rewrite the entire component. Keep the `Fact` and `FavRow` helpers but transform the main layout. Add new imports and restructure:

```tsx
import { Link, useNavigate } from 'react-router-dom'
import {
  Accessibility, Target, Footprints, Pencil, RefreshCw, MapPin,
  Trash2, Mail, BadgeCheck, ShieldCheck, Plus,
} from 'lucide-react'
import type { DisabilityType, MobilityLevel, Goal } from '../types'
import { useProfile } from '../contexts/ProfileContext'
import { AccessibilityToolbar } from '../components/a11y/AccessibilityToolbar'
import { MiniFavCard } from '../components/feature/MiniFavCard'
import { loadActivity, type ActivityEntry } from '../lib/activity-log'
import { useMemo } from 'react'
import facilitiesData from '../data/facilities.json'
import eventsData from '../data/events.json'
import facilityEryaman from '../assets/facility-eryaman.jpg'
import facilityPool from '../assets/facility-pool.jpg'
import dashHero from '../assets/dashboard-hero.jpg'
import type { Facility, SportEvent } from '../types'

const ALL_FACILITIES = facilitiesData as Facility[]
const ALL_EVENTS = eventsData as SportEvent[]

// ... keep DISABILITY_LABELS, MOBILITY_LABELS, GOAL_LABELS ...

const ACTIVITY_BULLET_COLOR: Record<string, string> = {
  profile_created: 'bg-mint',
  profile_updated: 'bg-accent',
  favorite_added:  'bg-primary',
  match_run:       'bg-sky-foreground',
  facility_viewed: 'bg-muted-foreground',
}

function getFacilityImage(id: string): string {
  if (id.includes('eryaman')) return facilityEryaman
  if (id.includes('havuz') || id.includes('yuzme')) return facilityPool
  return facilityEryaman
}

function formatActivityTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getDate()} ${['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()]} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

export function Profile() {
  const { profile, clearProfile, toggleFavoriteFacility, toggleFavoriteEvent, toggleFavoriteExercise } = useProfile()
  const navigate = useNavigate()

  const activity = useMemo(() => loadActivity(), [])

  if (!profile) return null

  function handleReset() {
    if (confirm('Profilini sıfırlamak istediğine emin misin? Bütün ayarların silinecek.')) {
      clearProfile()
      navigate('/onboarding')
    }
  }

  const favFacilities = ALL_FACILITIES.filter(f => profile.favoriteFacilities.includes(f.id))
  const favEvents = ALL_EVENTS.filter(e => profile.favoriteEvents.includes(e.id))

  const headline = profile.favoriteFacilities.length > 0
    ? `${profile.favoriteFacilities.length} tesis keşfettin · ${profile.favoriteEvents.length} etkinliğe ilgi gösterdin`
    : 'Keşfetmeye başlamak için spor önerini gör'

  return (
    <div className="mx-auto max-w-7xl pt-2">
      <header className="mb-10">
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight text-primary-deep">
          Profilim
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Profilin önerilerinin temelini oluşturur. İstediğin zaman güncelle.
        </p>
      </header>

      <div className="grid gap-10 xl:grid-cols-[1fr_22rem]">
        <section className="space-y-8">

          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl bg-card ring-1 ring-border/40 hc:bg-white hc:ring-black">
            <div className="relative z-10 flex flex-wrap items-center gap-5 p-6">
              <div
                aria-hidden
                className="grid size-20 place-items-center rounded-full bg-gradient-brand text-2xl font-extrabold text-primary-foreground"
              >
                {DISABILITY_LABELS[profile.disabilityType][0]}
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-extrabold text-primary-deep hc:text-black">
                  {DISABILITY_LABELS[profile.disabilityType]}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile.city} sporcusu · UYUM topluluğu üyesi
                </p>
                <p className="mt-1 text-xs text-foreground/70">{headline}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-mint/60 px-2 py-0.5 text-[10px] font-bold text-mint-foreground">
                    <BadgeCheck aria-hidden className="size-3" /> Profil tamamlandı
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                    <ShieldCheck aria-hidden className="size-3" /> Anonim
                  </span>
                </div>
              </div>
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow hover:bg-primary-deep"
              >
                <Pencil aria-hidden className="size-3.5" /> Profili Düzenle
              </Link>
            </div>
            {/* Fading hero photo on right */}
            <img
              src={dashHero}
              alt=""
              aria-hidden
              className="absolute inset-y-0 right-0 h-full w-48 object-cover"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 60%)',
                maskImage: 'linear-gradient(to right, transparent, black 60%)',
                opacity: 0.35,
              }}
            />
          </div>

          {/* Fact tiles */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Fact icon={<Accessibility className="size-5" aria-hidden />}
                  label="Engel durumu"
                  value={DISABILITY_LABELS[profile.disabilityType]} />
            <Fact icon={<Footprints className="size-5" aria-hidden />}
                  label="Hareket düzeyi"
                  value={MOBILITY_LABELS[profile.mobilityLevel]} />
            <Fact icon={<Target className="size-5" aria-hidden />}
                  label="Hedefin"
                  value={GOAL_LABELS[profile.goal]} />
          </div>

          {/* Favorites */}
          <div className="rounded-3xl bg-card p-6 ring-1 ring-border/40 hc:bg-white hc:ring-black">
            <h3 className="font-display text-base font-extrabold text-primary-deep hc:text-black">
              Favorilerin
            </h3>

            {/* Favorite facilities */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tesisler ({favFacilities.length})
                </span>
                <Link to="/map" className="text-xs font-bold text-primary">Ekle →</Link>
              </div>
              {favFacilities.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {favFacilities.map(f => (
                    <MiniFavCard
                      key={f.id}
                      href={`/facility/${f.id}`}
                      image={getFacilityImage(f.id)}
                      title={f.name}
                      subtitle={f.district}
                      onRemove={() => toggleFavoriteFacility(f.id)}
                      removeLabel={`${f.name} favorilerden çıkar`}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                  <span aria-hidden className="grid size-10 place-items-center rounded-full bg-card text-muted-foreground">
                    <MapPin className="size-4" />
                  </span>
                  <div className="flex-1 text-sm text-muted-foreground">Henüz favori tesis yok.</div>
                  <Link to="/map" className="text-xs font-bold text-primary whitespace-nowrap">
                    <Plus aria-hidden className="inline size-3.5" /> Tesis ekle
                  </Link>
                </div>
              )}
            </div>

            {/* Favorite events */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Etkinlikler ({favEvents.length})
                </span>
                <Link to="/events" className="text-xs font-bold text-primary">Ekle →</Link>
              </div>
              {favEvents.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {favEvents.map(e => (
                    <MiniFavCard
                      key={e.id}
                      href={`/events`}
                      title={e.title}
                      subtitle={new Date(e.date).toLocaleDateString('tr-TR')}
                      onRemove={() => toggleFavoriteEvent(e.id)}
                      removeLabel={`${e.title} favorilerden çıkar`}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                  <div className="flex-1 text-sm text-muted-foreground">Henüz favori etkinlik yok.</div>
                  <Link to="/events" className="text-xs font-bold text-primary whitespace-nowrap">
                    <Plus aria-hidden className="inline size-3.5" /> Etkinlik ekle
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Activity timeline */}
          <div className="rounded-3xl bg-card p-6 ring-1 ring-border/40 hc:bg-white hc:ring-black">
            <h3 className="font-display text-base font-extrabold text-primary-deep hc:text-black">
              Aktivite
            </h3>
            {activity.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {activity.map((entry, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${ACTIVITY_BULLET_COLOR[entry.type] ?? 'bg-muted-foreground'}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-foreground hc:text-black">{entry.label}</div>
                      <div className="text-[11px] text-muted-foreground">{formatActivityTime(entry.ts)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-2xl bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Daha fazla keşfettikçe burada görünecek.</p>
                <Link to="/map" className="mt-2 inline-block text-xs font-bold text-primary">
                  Tesisleri keşfet →
                </Link>
              </div>
            )}
          </div>

          {/* Privacy */}
          <div className="rounded-3xl bg-card p-6 ring-1 ring-border/40 hc:bg-white hc:ring-black">
            <h3 className="font-display text-base font-extrabold text-primary-deep hc:text-black">
              Gizlilik &amp; Veri
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Bilgilerin sadece sana özel öneriler için kullanılır, üçüncü taraflarla paylaşılmaz.
              Profilini sıfırladığında lokal verilerin tamamı silinir.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="mailto:hello@uyum.app"
                className="inline-flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-xs font-semibold text-primary ring-1 ring-primary/30 hover:bg-primary/10"
              >
                <Mail aria-hidden className="size-3.5" /> Bize ulaş
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive ring-1 ring-destructive/30 hover:bg-destructive/20"
              >
                <Trash2 aria-hidden className="size-3.5" /> Profili sıfırla
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <AccessibilityToolbar />
          <div className="rounded-3xl bg-mint/30 p-5 ring-1 ring-mint">
            <h3 className="font-display text-base font-extrabold text-primary-deep">
              Önerini yenile
            </h3>
            <p className="mt-1 text-xs text-foreground/80 hc:text-black">
              Profilini güncelledikten sonra spor önerilerini yeniden eşleştir.
            </p>
            <Link
              to="/match"
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-deep px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              <RefreshCw aria-hidden className="size-3.5" /> Spor önerimi gör
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border/40 hc:bg-white hc:ring-black">
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-0.5 font-display text-base font-extrabold text-primary-deep hc:text-black">{value}</div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run lint
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/feature/MiniFavCard.tsx src/pages/Profile.tsx
git commit -m "ui: redesign Profile page with hero + MiniFavCard favorites + activity timeline"
```

---

## Task 12: Sidebar active indicator with framer-motion layoutId

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Add motion indicator**

In `src/components/layout/Sidebar.tsx`:

a) Add import:
```tsx
import { motion } from 'framer-motion'
```

b) Update the `Link` map to add a relative container and a `motion.span` when active:

```tsx
<Link
  key={item.to}
  to={item.to}
  aria-current={active ? 'page' : undefined}
  className={`group relative flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-all hc:text-black ${
    active
      ? 'bg-[#320E3B] font-semibold text-white hc:bg-black hc:text-white'
      : 'font-medium text-gray-500 hover:bg-gray-50 hover:text-[#320E3B]'
  }`}
>
  {active && (
    <motion.span
      layoutId="sidebar-active-indicator"
      className="absolute inset-0 rounded-full bg-[#320E3B] hc:bg-black"
      style={{ zIndex: -1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
    />
  )}
  <Icon className="size-[18px]" strokeWidth={active ? 2.4 : 1.8} aria-hidden />
  <span>{item.label}</span>
</Link>
```

Note: The `motion.span` uses `layoutId` so framer-motion animates its position between nav items when the route changes.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "ui: add framer-motion layoutId active indicator to sidebar nav"
```

---

## Task 13: Reduced motion + MotionConfig global

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `src/components/layout/AppShell.tsx`

- [ ] **Step 1: Add CSS reduced-motion block**

In `src/styles/globals.css`, at the very end of the file, append:

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

- [ ] **Step 2: Add MotionConfig to AppShell**

In `src/components/layout/AppShell.tsx`:

a) Add imports:
```tsx
import { MotionConfig, useReducedMotion } from 'framer-motion'
```

b) Wrap the return JSX with `MotionConfig`:
```tsx
export function AppShell() {
  const reduced = useReducedMotion()

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>
      <div className="relative min-h-screen bg-white">
        {/* ... existing content ... */}
      </div>
    </MotionConfig>
  )
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run build
```

Expected: exit 0 both.

- [ ] **Step 4: Commit**

```bash
git add src/styles/globals.css src/components/layout/AppShell.tsx
git commit -m "chore: honor prefers-reduced-motion globally via CSS + framer-motion MotionConfig"
```

---

## Task 14: Fix geolocation Permissions-Policy in vercel.json

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Update Permissions-Policy**

In `vercel.json`, line 15, change:

```json
{ "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" }
```

to:

```json
{ "key": "Permissions-Policy", "value": "geolocation=(self), microphone=(), camera=()" }
```

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "require('./vercel.json'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Final build check**

```bash
npm run build
npx tsc --noEmit
npm run lint
```

Expected: all exit 0.

- [ ] **Step 4: Commit**

```bash
git add vercel.json
git commit -m "fix: allow geolocation on same origin in Permissions-Policy header"
```

---

## Self-Review

### Spec Coverage Check

| Spec section | Task(s) covering it |
|---|---|
| P0 build error (verifiedCount) | Task 1, Task 2 |
| Nitel etiket — ScoreBadge | Task 2 |
| Nitel etiket — MatchBadge | Task 3 |
| FacilityDetail fake % | Task 2 |
| Dashboard fake % | Task 2 |
| MatchSport fake % | Task 2 |
| MiniFacilityCard fake % | Task 2 |
| FacilityList fake % | Task 2 |
| FacilityMap popup fake % | Task 4 |
| EventList fake match % | Task 3 |
| Hibrit marker glyph badge | Task 4 |
| FacilityPin shared constants | Task 4 |
| favoriteExercises type | Task 5 |
| Toggle methods ProfileContext | Task 5 |
| BookmarkButton component | Task 6 |
| FacilityDetail bookmark wire | Task 7 |
| ExerciseCard bookmark wire | Task 7 |
| EventList bookmark wire | Task 7 |
| FilterDropdown shared | Task 8 |
| ActiveFilterChip shared | Task 8 |
| CoachDirectory refactor | Task 8 |
| ExerciseLibrary ActiveFilterChip | Task 8 |
| EventList filter UX | Task 9 |
| FacilityMap filter UX | Task 9 |
| Activity log storage | Task 10 |
| Activity push from Onboarding | Task 10 |
| Activity push from ProfileContext | Task 10 |
| MiniFavCard component | Task 11 |
| Profile page redesign | Task 11 |
| Sidebar motion indicator | Task 12 |
| Reduced motion CSS | Task 13 |
| MotionConfig AppShell | Task 13 |
| Geolocation vercel.json | Task 14 |

All spec sections covered. ✓

### Placeholder Scan
- No "TBD" or "implement later" phrases.
- All code blocks are complete.
- All file paths are exact.

### Type Consistency
- `SCORE_LABEL`, `SCORE_GLYPH`, `SCORE_TONE` defined in Task 1, used in Tasks 2-4. ✓
- `ScoreBadge` defined in Task 2, used in Tasks 2, 4. ✓
- `MatchBadge` defined in Task 3, used in Task 3. ✓
- `BookmarkButton` defined in Task 6, used in Task 7. ✓
- `FilterDropdown` interface: `DropdownOption` exported from Task 8, imported in Task 9. ✓
- `ActiveFilterChip` defined in Task 8, used in Tasks 8, 9. ✓
- `toggleFavoriteFacility/Event/Exercise` defined in Task 5 (ProfileContext), used in Tasks 7, 11. ✓
- `favoriteExercises: string[]` added to `UserProfile` in Task 5, referenced in Task 7. ✓
- `ActivityEntry`, `pushActivity`, `loadActivity` defined in Task 10, used in Tasks 10, 11. ✓
- `MiniFavCard` defined in Task 11, used in Task 11. ✓
