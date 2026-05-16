# UYUM

> Engelli bireyler için spor erişilebilirlik platformu.
> METU Sports Tech Hackathon 2026 — 16-17 Mayıs, Ankara.

**Canlı:** _(Vercel URL — Faz 11 deploy sonrası eklenecek)_

## Stack

React + Vite + TypeScript + Tailwind CSS + Framer Motion + Recharts + Leaflet (+ html2canvas, jspdf)

## Geliştirme

```bash
npm install
npm run dev      # localhost:5173
npm run build
npm run preview
npm run lint
```

## Demo akışı

1. Boş tarayıcı (incognito) — onboarding görünür
2. Profil oluştur (engel tipi → hareket durumu → hedef)
3. Dashboard → Sana Yakında + Topluluktan dolu
4. Erişilebilirlik araç çubuğu: renk körlüğü, yüksek kontrast, font, sesli okuma
5. F5: "Sana uygun sporlar" → 3 öneri → tesis listesine git
6. F2: Ankara haritası, profile göre pin renk + glyph
7. F1: Tesis detay — radar morph (engel tipi değiştirme)
8. F4: Canlı durum + tanıklık ekleme
9. F3: "İlk Ziyaret Rehberi" → Türkçe metin → sesli okuma → PDF indir
10. F9 Dashboard → F6 / F7 / F8 grid'den keşfet

## Bilinen sınırlar (Faz 10)

- **Backend yok.** Tüm veri `src/data/*.json` mock + localStorage. Tesisler, etkinlikler, koçlar, tanıklık seed'leri DEMO VERİSİ rozetleri ile işaretli.
- **Tek şehir, tek dil.** Ankara + Türkçe UI sabit; çoklu şehir / dil desteği Roadmap'te.
- **Overpass cache build-time.** Demo sırasında canlı OSM çağrısı yapılmaz. `public/data/facilities-overpass-cache.json` hata olursa `src/data/facilities.json`'a düşer.
- **F3 üretimi n8n bağımlı.** Webhook erişilemezse fallback statik şablon otomatik devreye girer — ekran boş kalmaz, ama metin profilden bağımsızdır.
- **YouTube Data API yok.** Egzersiz kütüphanesi 20 elle küratörlenmiş video, `youtube-nocookie` embed.
- **Auth / kullanıcı hesabı yok.** Profil sadece tarayıcı `localStorage`'ında. `uyum:profile`, `uyum:testimonies`, `uyum:a11y` anahtarları.
- **Sesli okuma Web Speech API ile.** Tarayıcı `tr-TR` dilini desteklemezse SpeakButton sessiz no-op'tur.
- **Renk-tek-bilgi taraması:** Harita pin, lejant ve tesis listesindeki erişilebilirlik durumu renk + glyph (✓ / ~ / ✕ / ?) + metin etiketi ile çoklu kodlanır.
- **Pitch deck'e taşınanlar:** Fizyoterapist onayı, Supabase canlı DB, operatör bildirim döngüsü, federasyon API, çoklu şehir (`docs/UYUM-platform-final.md` Bölüm 12).

## Dokümanlar

- [Platform Final](docs/UYUM-platform-final.md)
- [Build Planı](docs/UYUM-build-plan.md)
- [SRS](docs/SRS-UYUM.md)
- [API Sözleşmeleri](docs/api-contracts.md)
- [Commit Disiplini](docs-compliance/COMMITS.md)
- [Karar Defteri](docs-compliance/DECISIONS.md)
- [Scope](docs-compliance/SCOPE.md)
- [Disiplin](docs-compliance/DISCIPLINE.md)
