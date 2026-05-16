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
