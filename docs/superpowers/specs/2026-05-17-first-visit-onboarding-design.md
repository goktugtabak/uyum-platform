# First-Visit Onboarding Gate — Design Spec

**Date:** 2026-05-17  
**Status:** Approved

## Problem

Kullanıcı `uyum.app` (`/`) adresine ilk kez girdiğinde Landing page görüyor. Onboarding isteğe bağlı ve ulaşılması zor. Hedef: profil olmayan kullanıcı direkt onboarding ekranına düşsün, Landing page'i onboarding sonrası görsün.

## Çözüm

Route-level guard ile iki küçük değişiklik:

### 1. `App.tsx` — `/` route guard

`/` route'una yeni bir `<RootRoute />` bileşeni yerleştirilir:

```tsx
function RootRoute() {
  const { hasProfile } = useProfile()
  if (!hasProfile) return <Navigate to="/onboarding" replace />
  return <LandingPage />
}
```

`<Route path="/" element={<LandingPage />} />` yerine `<Route path="/" element={<RootRoute />} />` kullanılır.

### 2. `Onboarding.tsx` — confirm sonrası yönlendirme

`next()` içinde confirm adımı tamamlandığında:

```tsx
navigate('/dashboard')  // ÖNCE
navigate('/')           // SONRA
```

## Kullanıcı Akışı

```
İlk ziyaret (profil yok)
  → /           → guard devreye girer → /onboarding
  → Onboarding tamamlanır (profil oluşur)
  → /           → guard geçer → Landing page görünür

Geri dönen kullanıcı (profil var)
  → /           → guard geçer → Landing page direkt açılır
```

## Kapsam Dışı

- Back butonu `navigate('/')` ile Landing'e gider — onboarding başlangıcı `welcome` adımında "geri" → `/`. Bu değişmez.
- Landing page içeriği, tasarımı, Navbar, CTA'lar: değişmez.
- Dashboard, RequireProfile guard'ları: değişmez.

## Etkilenen Dosyalar

| Dosya | Değişiklik |
|---|---|
| `src/App.tsx` | `/` route → `<RootRoute />` bileşeni |
| `src/pages/Onboarding.tsx` | `navigate('/dashboard')` → `navigate('/')` |

## Riskler

- Yok. Her iki değişiklik tek satır. Mevcut mimari bozulmaz.
