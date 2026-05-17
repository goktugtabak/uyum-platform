# AccessibilityToolbar Layout Fix — Design Spec

**Date:** 2026-05-17  
**Status:** Approved

## Problem

Sidebar (`w-64`, 256px) içindeki `AccessibilityToolbar`'da yazılar taşıyor. `Row` bileşeni yatay `flex-wrap` kullandığı için 4 seçenekli SegmentedControl (Kapalı/Deuteranopia/Protanopia/Tritanopia) sığmıyor. Tasarım genel light-theme stilinden kopuk görünüyor.

## Çözüm

İki dosyada minimal değişiklik:

### 1. `Row` bileşeni — dikey layout (`AccessibilityToolbar.tsx`)

**Önce:**
```tsx
<li className="flex flex-wrap items-center gap-3">
  <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted ...">
    {icon}
  </span>
  <span className="flex-1 text-[12px] font-semibold text-foreground ...">
    {label}
  </span>
  <div className="ml-auto">{children}</div>
</li>
```

**Sonra:**
```tsx
<li className="flex flex-col gap-1.5">
  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/70 hc:text-black">
    <span aria-hidden className="grid size-4 shrink-0 place-items-center text-foreground/50">
      {icon}
    </span>
    {label}
  </span>
  <div className="w-full">{children}</div>
</li>
```

Icon büyük kutu (size-7 rounded-lg) kaldırılır — küçük inline ikon (size-4) + etiket tek satırda. Kontrol `w-full` ile tam genişlikte alt satıra iner.

### 2. `SegmentedControl` — tam genişlik (`SegmentedControl.tsx`)

Wrapper div'e `w-full` eklenir, butonlara `flex-1` eklenir:

```tsx
<div
  role="radiogroup"
  className="flex w-full rounded-full overflow-hidden bg-muted/60 ring-1 ring-border/50 hc:ring-black"
>
  {options.map((opt, i) => (
    <button
      className="flex-1 px-2 py-1.5 text-[11px] font-semibold ..."
    >
      {opt.label}
    </button>
  ))}
</div>
```

`inline-flex` → `flex`, `w-full` eklenir. Butonlar `flex-1` ile eşit genişlikte paylaşır — 256px'de 4 seçenek taşmaz.

## Kapsam Dışı

- `Toggle` bileşeni: değişmez
- Kart stili (`rounded-2xl bg-card/85 ring-1 ring-border/40`): değişmez
- `hc:` high-contrast class'ları: korunur
- `Profile.tsx` ve `TopBar.tsx`'teki `AccessibilityToolbar` kullanımları: otomatik iyileşir (aynı bileşen)

## Etkilenen Dosyalar

| Dosya | Değişiklik |
|---|---|
| `src/components/a11y/AccessibilityToolbar.tsx` | `Row` bileşeni dikey layout |
| `src/components/a11y/SegmentedControl.tsx` | wrapper `w-full` + `flex`, butonlar `flex-1` |
