# Dashboard Sol Panel Hover-Collapse — Design Spec

**Date:** 2026-05-17  
**Status:** Approved

## Problem

Dashboard'daki sol sütun ("Yakındaki Tesisler") her zaman tam açık görünüyor. Kullanıcı paneli hover ile açıp kapatabilmeli: varsayılan kapalı (sadece başlık), üzerine gelince açık.

## Çözüm

Tailwind `group` + `group-hover:max-h-[...]` + `overflow-hidden` + `transition-all` — saf CSS, sıfır React state.

## Davranış

| Durum | Görünüm |
|---|---|
| Varsayılan (kapalı) | Sadece `SectionHeader` başlık satırı görünür (~2rem yükseklik) |
| Hover (açık) | İçerik aşağıya doğru ~300ms ease-in-out ile açılır |
| Hover biter | İçerik tekrar kapanır, ~300ms |

## Implementasyon

### `src/pages/Dashboard.tsx` — Sol `<section>` (satır 164–212)

**Adım 1:** `<section>` etiketine `group` class'ı ekle:

```tsx
<section className="group">
```

**Adım 2:** `<SectionHeader .../>` satırından sonraki tüm içeriği (`<div className="relative mt-5 ...">` mini harita'dan `<Link to="/map" ...>` alt link'e kadar) bir sarmalayıcı `<div>` içine al:

```tsx
<div className="max-h-0 overflow-hidden transition-all duration-300 ease-in-out group-hover:max-h-[600px]">
  {/* mini harita */}
  {/* tesis listesi */}
  {/* "tüm tesisleri gör" linki */}
</div>
```

## Kapsam Dışı

- Orta sütun (Topluluk Akışı): değişmez
- Sağ sütun (Sana Özel Keşif): değişmez
- Mobile davranış: hover CSS'i touch cihazlarda tetiklenmez — mobile'da panel her zaman açık kalır (hover yoktur)
- A11y keyboard focus ile açma: kapsam dışı (demo MVP)

## Etkilenen Dosyalar

| Dosya | Değişiklik |
|---|---|
| `src/pages/Dashboard.tsx` | Sol `<section>` — `group` class + içerik `div` sarmalayıcı |
