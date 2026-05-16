# DECISIONS.md — Karar Kayıt Defteri (ADR-lite)

> **Amaç:** "Niye böyle yaptık?" sorusuna 24 saat sonra **veya 2 ay sonra** cevap verebilmek.
> Her kayıt **3-5 satır**. Uzun yazma, kayıt al.
>
> **Format:** Yukarıdan aşağıya kronolojik. Yeni kararlar en üste eklenir.

---

## Şablon (Her Kayıt İçin)

```
### YYYY-MM-DD HH:MM — <Kısa Karar Başlığı>

- **Karar:** <1-2 cümle, ne karar verildi>
- **Niye:** <gerekçe, hangi alternatife karşı seçildi>
- **Etki:** <hangi dosya/scope/feature etkilendi — varsa>
- **Geri al kuralı:** <hangi koşulda bu karardan döneriz — opsiyonel>
```

---

## Karar Türleri (Etiket olarak ekle)

| Etiket | Ne için |
|---|---|
| `[SCOPE]` | Scope'a ekleme / çıkarma |
| `[TECH]` | Teknoloji seçimi (library, framework, hosting) |
| `[UX]` | Tasarım / akış kararı |
| `[PROCESS]` | Çalışma şekli, disiplin değişikliği |
| `[MENTOR]` | Mentor feedback'i sonucu alınan karar |
| `[PIVOT]` | Önceki bir karardan dönüş |
| `[COMPLIANCE]` | Hackathon kuralı / lisans / etik kaynaklı |

---

## Kayıtlar

### 2026-05-16 — `[UX]` Faz 10: harita pin'lerinde renk + glyph çift kodlaması

- **Karar:** FacilityPin / FacilityList / MapLegend erişilebilirlik durumunu renk + glyph (✓ / ~ / ✕ / ?) + metin üçlüsüyle gösterir. Pin DivIcon'a sağ üstte 16px badge eklendi; lejant ve liste de aynı glyph'i kullanır.
- **Niye:** Build plan §FAZ 10 madde 10–11 "renk-tek-bilgi yasak" denetimi. Yüksek kontrast + renk körlüğü filtresi açıkken yeşil/sarı/kırmızı/gri arasında ayırt etmeyi sadece çevre rengine bağlamak A11y açığıydı. Glyph kullanıcı dostu (✓/~/✕/?) ve mevcut aria-label akışını bozmaz.
- **Etki:** `src/components/map/FacilityPin.tsx`, `src/components/map/FacilityList.tsx`, `src/components/map/MapLegend.tsx`.
- **Geri al kuralı:** Glyph görsel olarak kalabalık görünürse pin badge'i kaldırılır, sadece liste + lejant glyph'i kalır.

### 2026-05-16 — `[TECH]` Faz 10: ErrorBoundary App'i sarar, demo'da hata gizlenir

- **Karar:** Yeni `ErrorBoundary` component'i `App` köküne yerleştirildi. Runtime hatasında "Bir şey ters gitti" UI + ana sayfaya dön CTA gösterilir; hata detayı sadece console'a yazılır.
- **Niye:** Build plan §FAZ 10 madde 7 — demo'da React error overlay jüriye karşı kırmızı bayrak. `getDerivedStateFromError` + `componentDidCatch` yeterli; production sentry / error reporting kapsam dışı (CLAUDE.md "backend yok").
- **Etki:** `src/components/layout/ErrorBoundary.tsx`, `src/App.tsx`.
- **Geri al kuralı:** Hata loglamada eksik kalıyorsa `componentDidCatch` içine breadcrumb genişletilir; çıkarmak için App'ten unwrap yeterli.

### 2026-05-16 — `[UX]` Faz 10: route geçişlerinde fade + 10px translateY, `prefers-reduced-motion` korumalı

- **Karar:** `RouteTransition` component'i AppShell `<Outlet />`'i sarar; framer-motion ile 200ms fade + 10px Y offset uygular. `useReducedMotion()` true ise animasyon devre dışı.
- **Niye:** Build plan §FAZ 10 madde 1. Tek sayfa uygulamada route değişimi "snap" hissi yaratıyor; küçük bir geçişe demo akışı için tutarlılık katar. Reduced-motion kullanıcılarına sıçramak A11y ihlali olur, korumayı baştan koyduk.
- **Etki:** `src/components/layout/RouteTransition.tsx`, `src/components/layout/AppShell.tsx`.
- **Geri al kuralı:** Frame drop olursa duration 100ms'e düşürülür veya component App'ten kaldırılır — Outlet altı stabil kalır.

### 2026-05-16 — `[UX]` Faz 9 F8: koç dizini ?facility= query desteği eklendi (spec dışı extension)

- **Karar:** CoachDirectory'ye `?facility=<id>` query param desteği eklendi. Build planı sadece `?sport=` ister. Ek query, FacilityDetail'deki "Bu tesiste çalışan koçlar" linkinin gerçek bir varış sayfası vermesi için zorunlu — aksi halde link kullanıcıyı filtre uygulanmamış 8-koç listesine atardı.
- **Niye:** Build plan §FAZ 6 "Bu tesiste çalışan koçlar → F8'e link" satırını UX olarak değerli kılan tek yol facility filtresi. Profile boost zaten var, ama tesis bağlamı kaybolurdu.
- **Etki:** `src/pages/CoachDirectory.tsx`, `src/lib/coach-filter.ts`, `src/pages/FacilityDetail.tsx`.
- **Geri al kuralı:** Polish saatinde query unrender olursa filtre chip yine "× Temizle" ile manuel kaldırılır; geri alma riski yok.

### 2026-05-16 — `[UX]` Faz 9 F6: YouTube embed `youtube-nocookie.com` domaini

- **Karar:** `<iframe>` src'i `youtube.com/embed` yerine `youtube-nocookie.com/embed` kullanır. Aynı player, ama 3rd party cookie set etmez ve daha gizlilik dostu.
- **Niye:** Hackathon demo'sunda jüri tarayıcısında 3rd party cookie warning'i çıkmasın. YouTube Data API kullanmama kuralı (CLAUDE.md, build plan §0.4) iframe embed'i etkilemez; iframe runtime API çağrısı değil, video sunucusundan stream.
- **Etki:** `src/components/feature/ExerciseCard.tsx`.
- **Geri al kuralı:** Eğer nocookie domain bazı videolarda block ederse standart domain'e dön.

### 2026-05-16 — `[SCOPE]` Faz 9 F7: geçmiş etkinlikler dimmed bölümde, filter `all` iken görünür

- **Karar:** EventList sayfası, "Tarih → Tümü" filtresi seçildiğinde gelecek etkinliklerin altına dimmed bir "Geçmiş Etkinlikler" bölümü açar. "Bu hafta" veya "Bu ay" seçilince geçmiş gizli kalır.
- **Niye:** Build plan §FAZ 9.2 "boş state yok" zorunluluğu. Mock veri (8 etkinlik) hackathon tarihine yakın; demo akarken filtre kombinasyonları bazen 0 future verir. Past fallback boş ekranı önler, ama varsayılan kullanım için (haftalık/aylık) dikkat dağıtmaz.
- **Etki:** `src/lib/event-filter.ts`, `src/pages/EventList.tsx`, `src/components/feature/EventCard.tsx` (dimmed prop).
- **Geri al kuralı:** Past fallback kafa karıştırırsa "all" filtresinde de gizlenir, empty state CTA yine "Filtreleri temizle" gösterir.

### 2026-05-16 — `[TECH]` Faz 9 sayfaları: async load yok, direkt JSON import

- **Karar:** ExerciseLibrary, EventList, CoachDirectory sayfaları `loadFacilities()` Promise yerine `facilities.json`'u doğrudan static import eder. Yalnızca facility **adı / id eşlemesi** için kullanıldıkları için Overpass merge gerekmiyor.
- **Niye:** Faz 5'in `loadFacilities()` async kaynağı haritada koordinat birleştirmesi için var. Bu üç sayfada koordinat kullanılmıyor; async overhead'i Suspense/loading state ihtiyacı doğuruyor, hiçbir değer üretmiyor.
- **Etki:** `src/pages/EventList.tsx`, `src/pages/CoachDirectory.tsx`.
- **Geri al kuralı:** Eğer facility ad/id Overpass merge'iyle değişirse veya bu üç sayfaya koordinat gerekirse `loadFacilities()` switch'i 1 satırla geri eklenir.

### 2026-05-16 — `[TECH]` Faz 8 dashboard: facility sıralama saf fn, hook duplikasyonu kabul

- **Karar:** Dashboard'da "Sana Yakında" için tesisleri puana göre sıralayan `lib/facility-rank.ts` saf fonksiyonu eklendi. `useFacilityScore` hook'unun puanlama kuralı (overall = red/green/yellow/gray) bu dosyada yeniden yazıldı (~15 satır).
- **Niye:** Hook React'a bağlı, çoklu tesis için listede çağrılamaz. Ortak `lib/facility-score.ts` çıkarmak Faz 8 kapsamını ve diğer faz bağımlılıklarını kırardı; hackathon önceliği: küçük tekrar > erken abstraksiyon (DISCIPLINE.md §2/6).
- **Etki:** `src/lib/facility-rank.ts` (yeni), `src/pages/Dashboard.tsx` consume eder.
- **Geri al kuralı:** Puanlama kuralı değişirse iki yer güncellenir; ortak fn'e refactor Faz 10 polish için açık.

### 2026-05-16 — `[UX]` Faz 8 mini radar: AccessibilityRadar compact varyant

- **Karar:** `AccessibilityRadar` component'ine `height` ve `compact` props eklendi (default 300/false; dashboard kartında 120/true). Compact modda dimension etiketleri gizleniyor, dot ve animation süresi küçültülüyor.
- **Niye:** Build plan Faz 8 "küçük radar mini-preview" istiyor. Dashboard'da etiketli radar 160px alana sığmaz; ayrı bir mini component yazmak yerine mevcut Recharts kodunu props ile esnetmek daha az kod ve aynı a11y davranışı.
- **Etki:** `src/components/facility/AccessibilityRadar.tsx`, `src/components/feature/MiniFacilityCard.tsx`.
- **Geri al kuralı:** Mini radar çok soluk kalırsa kartta dot+sayı kombosuyla değiştir; component'in compact branch'i kaldırılır.

### 2026-05-16 — `[SCOPE]` Faz 8 dashboard runtime n8n çağrısı yok

- **Karar:** Dashboard tüm verisini local kaynaktan çeker (mock JSON + `uyum:testimonies` localStorage). Build plan §8.6'da bahsi geçen "Hızlı rehber CTA" Faz 7'nin facility detay akışına bırakıldı; Dashboard'dan tetiklenmiyor.
- **Niye:** Spec: "feature kapsam dışıdır — varsa polish'te, yoksa Faz 7 akışına bırakılır". 1 saatlik faz penceresinde scope'u dar tutmak ara kontrol listesinin geçmesini garantiler.
- **Etki:** `src/pages/Dashboard.tsx`, `src/components/feature/CommunityFeed.tsx` — fetch yok, sadece import.
- **Geri al kuralı:** Polish saatinde Dashboard hero'sına "Hızlı rehber al" CTA eklenebilir; `f3-service.ts` aynı şekilde çağrılır.

### 2026-05-16 — `[TECH]` Faz 6 F1 radar: Recharts native animasyon, framer-motion kullanılmadı

- **Karar:** AccessibilityRadar component'i Recharts `RadarChart` + `animationDuration={1500}` ile inşa edildi. framer-motion paketi yüklü ama bu component için kullanılmadı.
- **Niye:** Recharts native animasyonu radar remount (key prop) ile birlikte sorunsuz çalışıyor; framer-motion ek katmanı gereksiz state karmaşası ve 200+ satır kod demek.
- **Etki:** `src/components/facility/AccessibilityRadar.tsx` — sadece Recharts importu var.
- **Geri al kuralı:** Radar'a özel transition (morph effect) istenir ve Recharts kısıtı olursa framer-motion AnimatePresence ile sarılır (Faz 10 polish).

### 2026-05-16 — `[SCOPE]` Faz 6 WF-02 webhook scope dışı, Faz 9'a taşındı

- **Karar:** F4 Canlı Durum paneli statik JSON verisinden besleniyor; gerçek WF-02 webhook entegrasyonu Faz 9'a ertelendi.
- **Niye:** Build plan §3.1 webhook'u stretch goal olarak işaretliyor. Demo için JSON mock yeterli; webhook olmadan F4 görsel DoD'u geçiyor.
- **Etki:** `src/components/facility/LiveStatus.tsx` — `DemoBadge label="Webhook Faz 9'da"` ile vurgulandı.
- **Geri al kuralı:** Faz 9'da `live-status.ts` helpers değişmez; sadece LiveStatus component'i fetch kaynağını değiştirir.

### 2026-05-16 — `[TECH]` Faz 6 testimony storage: `uyum:testimonies` localStorage, seed merge

- **Karar:** Tanıklıklar `localStorage` `uyum:testimonies` anahtarında JSON dizisi olarak tutulur. Sayfa açılışında `testimonies.seed.json` + localStorage birleştirilir, `timestamp DESC` sıralanır.
- **Niye:** Backend yok (CLAUDE.md: "Frontend-only MVP"). Seed, demo için gerçekçi veri sağlar; localStorage kullanıcının session'ı boyunca persist eder. CLAUDE.md prefix kuralı `uyum:` zorunlu kılıyor.
- **Etki:** `src/lib/testimony-store.ts`, `src/components/feature/Testimonies.tsx`.
- **Geri al kuralı:** Faz 8+ Supabase entegrasyonunda `saveTestimony` fonksiyonu API call'a dönüştürülür, component değişmez.

### 2026-05-16 — `[TECH]` Faz 5 veri kaynağı: manual-first, Overpass cache dekoratif

- **Karar:** `src/data/facilities.json` (10 Ankara tesisi, koordinat + tam a11y matrisi) haritanın birincil ve tek runtime kaynağıdır. `public/data/facilities-overpass-cache.json` (269 OSM nokta) sadece `console.info` logu için yüklenir; render edilmez.
- **Niye:** DoD'da "cache dosyasını gizle, sayfa açılmalı" testi var. Bu test ancak manual veri direkt resolve edilirse geçer. Overpass kayıtlarında `sports[]` alanı yok — hibrit pin'in iç ikonu çizilemiyor. 269 anonim tesis eklemek ayrı bir scope (build plan'da yok).
- **Etki:** `src/lib/overpass-loader.ts` — `loadFacilities()` daima `facilities.json`'u döndürür; cache fetch hatası `console.warn` ile yutulur. `src/components/map/FacilityPin.tsx`, `FacilityList.tsx` sadece manuel 10 tesisi gösterir.
- **Geri al kuralı:** Faz 8+ de Overpass tesislerini "topluluk noktası" olarak haritaya eklemek istenirse `overpass-loader.ts`'e merge mantığı eklenir ve FacilityPin null-sports guard'ı güçlendirilir.

### 2026-05-16 — `[TECH]` F3 üretimde yalnızca n8n; direkt OpenAI yok

- **Karar:** F3 İlk Ziyaret Rehberi üretimde sadece n8n webhook üzerinden çağrılır. Frontend'den direkt OpenAI çağrısı `VITE_OPENAI_KEY` ile Vercel deploy'a girmez. OpenAI key, sistem promptu, JSON kısıtı, red flag ve response doğrulama n8n workflow içinde tutulur.
- **Niye:** Brief n8n kredisi sağladı; key bundle'a sızmaz, prompt bypass edilemez, defense-in-depth (frontend + n8n iki kademe red flag). Faz 7 başında ekibe seçim sorusu sormak boşa zaman.
- **Etki:** `docs/UYUM-platform-final.md` Bölüm 3, `docs/UYUM-build-plan.md` Faz 0 + Faz 7, `docs/SRS-UYUM.md` SW-002/AI-007, `.env.example`, yeni `docs/api-contracts.md`.
- **Geri al kuralı:** n8n hackathon kredisi çekilirse veya workflow demo öncesi çökerse fallback statik şablon zaten yanıt veriyor — geri alma gerekmez. Direkt OpenAI'a geçmek gizlilik riski getirir.

### 2026-05-16 — `[UX]` Onboarding 3 → 4 adım

- **Karar:** Onboarding Welcome → Erişim Profili (engel tipi + hareket durumu progressive reveal) → Hedefler + İlgi Alanları → Review & Confirm olarak 4 adıma çıktı. `mobilityLevel` Adım 2'de korunur.
- **Niye:** Yeni tasarım ekranları 4 adım gösteriyor. Welcome adımı pazarlama tonunu kurar, Review adımı yanlış profil oluşturmayı azaltır. 5 adıma çıkmadan mobility level'ı Adım 2 alt bölümüne birleştirdik — F5 algoritmasının girdisi kaybolmadı.
- **Etki:** `src/pages/Onboarding.tsx` (Faz 3), `docs/UYUM-platform-final.md` Bölüm 7 (`goals[]` çoklu), `docs/UYUM-build-plan.md` Faz 3.
- **Geri al kuralı:** Demo provasında kullanıcı akışı 4 adımda yavaş geliyorsa Adım 1 (Welcome) statik landing'e taşınır, onboarding 3 adıma geri döner.

### 2026-05-16 — `[UX]` Onboarding şehir adımı yok — varsayılan Ankara

- **Karar:** Onboarding 3 adımdan oluşur (engel tipi / hareket durumu / hedef). Şehir seçimi UI'da sorulmaz, otomatik "Ankara" atanır.
- **Niye:** Build plan "tek şehir Ankara, hackathon kapsamında" der (CLAUDE.md). Ek adım demo akışını uzatır, değer katmaz.
- **Etki:** `src/pages/Onboarding.tsx` — `city: 'Ankara'` hardcoded. Gelecekte çok şehir desteği gelirse bu alanı serbest bırakmak yeterli.
- **Geri al kuralı:** Çok şehir talebi gelince Onboarding'e Adım 4 ekle.

### 2026-05-16 — `[PROCESS]` MobilityLevel 3 değer — "kol-el kısıtlı" upper_limb'e havale

- **Karar:** Build plan Adım 2 için 4 seçenek önerdi (oturarak / destekle / bağımsız / kol-el kısıtlı). `MobilityLevel = 'sitting' | 'supported' | 'independent'` 3 değer — types değiştirilmedi.
- **Niye:** Types değiştirmek facilities/sports/exercises mock data'daki tüm union'ları kırar (TypeScript hataları). "Kol-el kısıtlı" işlevselliği zaten Adım 1'deki `upper_limb` ile karşılanıyor — çift sayma olmaması için eklenmedi.
- **Etki:** `src/pages/Onboarding.tsx` Adım 2 — 3 seçenek.
- **Geri al kuralı:** `MobilityLevel` tipine `arm_limited` eklenirse mock data güncellenerek Adım 2'ye seçenek eklenir.

### 2026-05-16 — `[PROCESS]` UserProfile.accessibility alanı runtime'da tüketilmiyor

- **Karar:** `UserProfile.accessibility` alanı Onboarding'de default `AccessibilityPrefs` ile initialize edilir ama runtime'da source-of-truth `AccessibilityContext` (localStorage `uyum:a11y`). Faz 4+ kodu bu alanı yok sayar.
- **Niye:** Faz 2'de `AccessibilityContext` kendi persist mekanizmasını (`uyum:a11y`) kurdu. İkinci bir persist katmanı eklemek yarış koşulu yaratır. Profile şemasını değiştirmek ise Bölüm 7 veri modeliyle sapmaya neden olur.
- **Etki:** `src/pages/Onboarding.tsx` — `accessibility: DEFAULT_ACCESSIBILITY` sabit değerle atılır. Faz 7'de `useSpeech` gelince bu alan ya kaldırılır ya da `AccessibilityContext` ile senkronize edilir.
- **Geri al kuralı:** Faz 7'de `profile.accessibility.speechEnabled` ile `AccessibilityContext.speechEnabled` birleştirilir — karar o zaman netleşir.

### 2026-05-16 — `[UX]` A1 renk körlüğü kapsamı 3 moda genişletildi

- **Karar:** Ana döküman A1 yalnızca deuteranopia + protanopia listelerken, Faz 1'de globals.css + index.html + types/index.ts tritanopia için de hazırlandı. Faz 2'de bu altyapı korundu, dropdown 4 seçenek sunar (Kapalı / Deuteranopia / Protanopia / Tritanopia).
- **Niye:** Mevcut altyapıyı geri almak boşa iş; tritanopia gerçek bir renk körlüğü tipi ve ekstra maliyet neredeyse sıfır (CSS filter matrisi zaten yazılmış).
- **Etki:** `src/contexts/AccessibilityContext.tsx` + `src/components/a11y/AccessibilityToolbar.tsx` 3 modu destekler. `AccessibilityPrefs.colorblindMode` union'ı `tritanopia` içeriyor.
- **Geri al kuralı:** Jüri/kural sorunu çıkarırsa dropdown'dan Tritanopia seçeneğini kaldırmak 1 satır değişiklik.

### 2026-05-15 — `[PROCESS]` Governance paketi hazırlandı

- **Karar:** Hackathon öncesi bir governance paketi (DISCIPLINE, COMMITS, SCOPE, COMPLIANCE, DEMO, DECISIONS, RISKS, README) hazırlandı.
- **Niye:** 24 saatlik bir hackathon'da yorgun beyinle karar vermenin maliyetini düşürmek; "şunu yapalım mı?" tartışmalarını önceden çözmek.
- **Etki:** Tüm ekip bu klasördeki kurallara uyacak. Hackathon başladığında [SCOPE.md](SCOPE.md) ve [DEMO.md](DEMO.md) doldurulacak.
- **Geri al kuralı:** Yok — bu dosyalar canlı, ihtiyaç halinde değişir.

---

### 2026-05-15 — `[SCOPE]` UX-first, backend mock stratejisi

- **Karar:** 24 saatte UI / UX kalitesine odaklanılacak; backend mock JSON ile sahnelenecek. Stretch goal olarak Supabase/Firebase entegrasyonu var.
- **Niye:** Jüri pazarlanabilirlik ve gerçek bir derde dokunma kriterine bakacak — bunlar UI üzerinden gösterilebilir. Backend'de zaman kaybetmek, demo'yu boş bırakma riski yaratır.
- **Etki:** [SCOPE.md §6](SCOPE.md) — Backend Stratejisi başlığı. Pitch'te buna özel cevap hazır ([DEMO.md §4 Q1](DEMO.md)).
- **Geri al kuralı:** İlk 12 saatte UI iskeleti + 2 core feature bitti **ve** ekipte boş kapasite varsa → Supabase'e geçilebilir.

---

### 2026-05-15 — `[COMPLIANCE]` AI kullanımı açıkça beyan edilecek

- **Karar:** Claude Code ve diğer AI araçları kullanılacak, **pitch'te 1 satırla beyan edilecek**.
- **Niye:** Hackathon kuralları AI yasaklamıyor; saklamak yerine dürüstçe söylemek jüride artı puan. Saklasak da git log / kod stilinden anlaşılır.
- **Etki:** [COMPLIANCE.md §3](COMPLIANCE.md), [DEMO.md §3 slayt 6 + §4 Q2](DEMO.md)
- **Geri al kuralı:** Hackathon kuralları AI yasaklarsa → AI kullanmadan çalışılır, beyan da kaldırılır.

---

<!--
## Kayıt eklerken örnek:

### 2026-05-16 14:32 — `[SCOPE]` Live chat feature out of scope

- **Karar:** Kullanıcılar arası chat özelliği out of scope, V2'ye bırakıldı.
- **Niye:** 6 saat ek iş, demo'da gösterilse de jüri için ana hikâyeyi bulanıklaştırıyor. Persona için critical değil.
- **Etki:** [SCOPE.md §4](SCOPE.md) listesine eklendi.
- **Geri al kuralı:** Yok — V2.

### 2026-05-16 16:45 — `[MENTOR]` Mentor Ayşe X'in feedback'i

- **Karar:** Onboarding ekranındaki copy "spor" yerine "hareket" olarak değişti.
- **Niye:** Mentor "spor kelimesi hedef kitlede caydırıcı, hareket daha kapsayıcı" dedi. Persona'ya uygun.
- **Etki:** UI copy değişikliği — `feat: onboarding copy revision` commit'inde.
- **Geri al kuralı:** A/B yapılsaydı test ederdik, hackathon'da mentor sözüne güveniyoruz.

### 2026-05-16 19:10 — `[COMPLIANCE]` Keyword "<KEYWORD>" entegrasyonu

- **Karar:** Verilen keyword `<KEYWORD>`, Core Feature 2'nin başlığı olarak entegre edildi.
- **Niye:** Organik duruyor, kullanıcı akışını bozmuyor, hikâyeye uyuyor.
- **Etki:** `feat: <KEYWORD> entegrasyonu` commit'i. [SCOPE.md §7](SCOPE.md) kapatıldı.
- **Geri al kuralı:** Yok — bu artık ürünün parçası.
-->

---

*Yeni karar geldiğinde bu dosyaya **3 satır** yazılır, başka yerde tartışma uzatılmaz.*
