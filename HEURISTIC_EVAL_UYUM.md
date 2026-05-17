# Heuristic Evaluation — UYUM Platform

**Tarih:** 2026-05-17  
**Kapsam:** Tüm uygulama akışı — Landing → Onboarding → Dashboard → FacilityDetail → ExerciseLibrary → TopBar/Sidebar  
**Yöntem:** Nielsen 10 Heuristic + Alan Dix (Learnability / Flexibility / Robustness) çift eşleştirmesi  
**Severity Skalası:** Nielsen 0–4 (0=Cosmetic, 1=Cosmetic önceliksiz, 2=Minor, 3=Major, 4=Catastrophic)  
**Önceki analiz:** `HCI_REVIEW_UYUM.md` (holistic HCI, 12 bulgu) — bu rapor kural odaklı tamamlayıcıdır

---

## Severity Özeti

```
Catastrophic (4): 2
Major (3):        8
Minor (2):        8
Cosmetic (1):     4
─────────────────────
Toplam:          22
```

---

## Bulgu Tablosu — Nielsen 10 × Alan Dix

| # | Nielsen Heuristic | Alan Dix | Bulgu | Konum | Severity | Önerilen Düzeltme | Kanıt |
|---|---|---|---|---|---|---|---|
| **H01** | H1: Visibility of system status | Robustness > Observability | F3 Guide timeout (5 sn) sonrası fallback'e sessiz geçiş — kullanıcı "Yapay zeka mı çöktü, beklemeye devam mı edeyim?" bilemez. `catch` bloğu `setState('idle')`'a döndürüyor; hangi nedenden çıkıldığı hiç gösterilmiyor. | `src/components/feature/F3Guide.tsx:41-45` | **4** | `catch` bloğunda `setState('error')` ekle; "Rehber yüklenemedi — hazır şablon gösteriliyor" mesajı + `aria-live="assertive"` ile duyur. Fallback state ayrı görsel durum olsun. | Nielsen H1; WCAG 4.1.3 |
| **H02** | H1: Visibility of system status | Robustness > Observability | Dashboard "Yakındaki Tesisler" yüklenirken boş `<ul>` gösteriliyor, `ranked.length === 0` durumu veri yükleme mi, gerçekten tesis yok mu ayırt edilemiyor. | `src/pages/Dashboard.tsx:203-209` | **3** | Veri yükleme süresince skeleton/spinner ekle; yalnızca `facilities.length > 0 && ranked.length === 0` durumunda "tesis bulunamadı" mesajı göster. | Nielsen H1 |
| **H03** | H2: Match between system and real world | Learnability > Familiarity | "Erişilebilirlik Puanı %72 — Çok Uygun" badge'i gerçek dünya ölçütüyle eşleşmiyor: kullanıcı %72'nin neyin yüzdesi olduğunu, neden 92/68/35/50 sabit değerler seçildiğini anlayamıyor (`SCORE_PERCENT_BY_COLOR` sabitleri). | `src/pages/FacilityDetail.tsx:57` | **3** | Badge'in yanına "?" ikonu + tooltip: "Giriş, asansör, soyunma, ekipman, spor seçenekleri ve koç uyumuna göre profilinize özel hesaplanır." Puan metodolojisini dokümante et. | Nielsen H2; Learnability |
| **H04** | H2: Match between system and real world | Learnability > Familiarity | Onboarding'de "Hareket durumun" seçimi (`sitting / supported / independent`) ChoiceGrid yerine `role="radio"` olmayan `<button>` listesi olarak uygulanmış — semantik olarak bir radyo grubu olmasına rağmen HTML bağlamı bunu yansıtmıyor. | `src/pages/Onboarding.tsx:594-609` | **3** | `<button role="radio" aria-checked>` serisi ya da `<fieldset><legend>` + `<input type="radio">` paternine dönüştür; ekran okuyucular seçim state'ini doğru iletebilsin. | Nielsen H2; WCAG 1.3.1 |
| **H05** | H3: User control and freedom | Flexibility > Dialog initiative | FacilityDetail sayfasında "Rota oluştur" butonu direkt Google Maps external link açıyor; kullanıcının geri dönmek istediğinde `Back` yerine sayfayı kapatması gerekiyor, tarayıcı geçmişi karışıyor. | `src/pages/FacilityDetail.tsx:175-180` | **2** | `target="_blank" rel="noreferrer"` dışa açılımı açıkça `(yeni sekme)` metni veya `aria-label`'da belirt ("Google Haritalar'da aç (yeni sekme)"). | Nielsen H3; WCAG 2.4.4 |
| **H06** | H3: User control and freedom | Flexibility > Task migratability | Community sayfasında testimony formu doldurulurken başka bir sayfaya gidilirse form içeriği kaybolur — `sessionStorage` backup yok. Onboarding'de uygulanan draft pattern burada eksik. | `src/pages/Community.tsx` | **2** | Testimony formu için `sessionStorage` draft kaydı uygula; onboarding pattern'i (`loadDraft/saveDraft`) Community form için kopyala. | Nielsen H3; Flexibility |
| **H07** | H4: Consistency and standards | Learnability > Consistency | Filtre mekanizması tutarsız: ExerciseLibrary'de `FilterDropdown` (custom listbox), FacilityMap'te native `<select>`, Onboarding'de `ChoiceGrid` — aynı uygulama içinde üç farklı dropdown pattern. | ExerciseLibrary, FacilityMap | **3** | Tek bir filtre bileşeni standardize et. Acil olmasa da ExerciseLibrary `FilterDropdown`'ı yeniden kullanılabilir hale getir ve FacilityMap'teki `<select>`'i buna dönüştür. | Nielsen H4; Learnability > Consistency |
| **H08** | H4: Consistency and standards | Learnability > Consistency | CTA (Call-to-Action) hiyerarşisi ekranlara göre farklı: FacilityDetail'de birincil = "Rota oluştur" (koyu mor), Dashboard CTA'sı = "Tesisleri Keşfet" (ikon link). CoachCard'da CTA = "İletişim", EventCard'da = "Detaylar". | Tüm sayfalar | **3** | Platform geneli CTA sözlüğü: birincil eylem = `bg-primary text-primary-foreground shadow-glow`, ikincil = `ring-1 ring-border`, link = `text-primary underline`. Uygulamayı document et. | Nielsen H4 |
| **H09** | H5: Error prevention | Robustness > Recoverability | Onboarding Adım 4 (confirm) "Kaydolmaya başla" butonu, `mobilityLevel` null ise de aktif görünüyor (`canProceed` yanlış değerlendirilmiş: `step === 'confirm' && mobilityLevel !== null` — hareketlilik seçimi yapılmamışsa buton disabled olmalı ama varsayılan `independent` atanıyor). Hatalı varsayılan sessizce uygulanıyor. | `src/pages/Onboarding.tsx:154-155` | **2** | Kullanıcıya varsayılan seçimi göster: `mobilityLevel` null iken "Bağımsız varsayıldı" bilgisi ekle. Daha iyi: varsayılan uygulamamak, seçim zorunlu kılmak. | Nielsen H5 |
| **H10** | H5: Error prevention | Robustness > Recoverability | TopBar arama kutusu (`<input type="search">`) çalışmıyor — herhangi bir arama isteği işlenmiyor. Kullanıcı yazıp Enter'a basınca hiçbir şey olmaz, error state yok. İşlevsel olmayan bir input, hata önlemenin tam tersidir. | `src/components/layout/TopBar.tsx:67-78` | **4** | Ya `disabled` yap ve `title="Yakında gelecek"` ekle, ya da input'u kaldır. İşlevsiz `<input type="search">` kör bir çıkmaz. | Nielsen H5; Robustness > Task conformance |
| **H11** | H6: Recognition rather than recall | Learnability > Familiarity | Dashboard "Sana Yakında" tesis kartlarındaki küçük ikonlar (`Activity, MapPin, Waves, CircleDot`) `aria-hidden` — görme engelli kullanıcı için tesis özellikleri tamamen görünmez. Kartın hangi sporları barındırdığına dair yalnızca görsel ipucu var. | `src/pages/Dashboard.tsx:191-193` | **3** | Her tesis kartına `<span className="sr-only">` ile spor listesini ekle. Alternatif: ikon yerine gerçek spor etiketleri (ilk 2'si, "+N daha" kısaltmalı). | Nielsen H6; WCAG 1.1.1 |
| **H12** | H6: Recognition rather than recall | Learnability > Predictability | ExerciseLibrary'de sayfalama numaraları yalnızca 1, 2, 3 ve son sayfayı gösteriyor — kullanıcı kaçıncı sayfada olduğunu ve toplam kaç sayfa kaldığını göremez. `totalPages` hesaplanıyor ama bir yerde gösterilmiyor. | `src/pages/ExerciseLibrary.tsx:435-483` | **2** | Sayfalama navigasyonuna "Sayfa {pageSafe} / {totalPages}" metin etiketi ekle. | Nielsen H6 |
| **H13** | H7: Flexibility and efficiency of use | Flexibility > Customizability | Dashboard'dan tesise gidildiğinde harita görünümüne "Haritada göster" linki external OSM URL açıyor. Platform içi haritaya doğrudan bağlantı yok; deneyimli kullanıcı bile tesisi haritada görmek için ayrı bir sayfa navigasyonu yapmak zorunda. | `src/pages/FacilityDetail.tsx:142-149` | **2** | "Haritada Göster" linki `/map?highlight=<facilityId>` iç rotasına yönlendir; harita sayfası bu query param'ı karşılayarak tesisin pinini öne çıkarsın. | Nielsen H7; Flexibility |
| **H14** | H7: Flexibility and efficiency of use | Flexibility > Substitutivity | Klavye kısayolu yok: sidebar veya TopBar'da hiçbir navigasyon öğesi için `accesskey` ya da belgelenmiş kısayol mevcut değil. Keyboard-only kullanıcı sekme zinciri üzerinden navigasyon yapmak zorunda. | Tüm layout | **1** | Opsiyonel: "Ana içeriğe atla" skip-link (zaten var) yanına yaygın `Alt+M` → harita, `Alt+E` → egzersiz shortcut'larını değerlendir; dokümante et. | Nielsen H7 |
| **H15** | H8: Aesthetic and minimalist design | Learnability > Consistency | Emojiler bazı metinlerde literal string olarak kullanılmış: `"Merhaba! 👋"` (Dashboard), `"📍 {facility.name}"` (FacilityDetail, EventList). Bu emojiler `aria-hidden` değil — ekran okuyucu "yüksek el sallayan emoji" okur. | `src/pages/Dashboard.tsx:111`, `FacilityDetail.tsx:427` | **3** | Tüm dekoratif emojileri `<span aria-hidden>👋</span>` ile sar. Anlamsal emojiler (📍 lokasyon) ya `<MapPin aria-hidden>` ikonuyla değiştir ya da `<span aria-hidden>📍</span><span className="sr-only">Konum:</span>` yap. | Nielsen H8; WCAG 1.1.1 |
| **H16** | H8: Aesthetic and minimalist design | Learnability > Familiarity | FacilityDetail'de "Genel Bakış", "Olanaklar", "Canlı Durum", "Rehber", "Yorumlar", "Etkinlikler" olmak üzere 6 tab var; hepsi aynı sayfa üzerinde smooth-scroll anchor — gerçek panel switching yok. Tab UI olarak görünüyor, davranış olarak değil. | `src/pages/FacilityDetail.tsx:218-237` | **3** | WAI-ARIA tab pattern uygula (`role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-controls`, `aria-selected`). Tab tuşuyla navigasyonda kullanıcı yalnızca aktif tab'ın içeriğini görür. | Nielsen H8; WCAG 4.1.2 |
| **H17** | H9: Help users recognize, diagnose, and recover from errors | Robustness > Recoverability | `FacilityDetail` tesis bulunamadığında yalnızca "Tesis bulunamadı." metni ve "Tesislere dön" linki gösteriyor — URL'de yanlış ID mi, veri yüklenemedi mi ayrımı yok. | `src/pages/FacilityDetail.tsx:499-506` | **2** | Hata mesajını geliştir: "Bu tesis artık mevcut olmayabilir veya bağlantı sorunu yaşanıyor. Tüm tesisleri görüntüle veya sayfayı yenile." — iki CTA: Yenile + Tesislere Dön. | Nielsen H9 |
| **H18** | H9: Help users recognize, diagnose, and recover from errors | Robustness > Recoverability | ExerciseLibrary'de filtrelerle "0 sonuç" durumunda yalnızca "Filtreleri temizle" butonu var; hangi filtrenin daraltmaya yol açtığı gösterilmiyor. | `src/pages/ExerciseLibrary.tsx:405-417` | **2** | Aktif filtrelerin özetini "0 sonuç" empty state'in üstünde göster: "Spor: Yüzme, Seviye: İleri — bu kombinasyonla eşleşen video yok." Her filtre için ayrı "Kaldır" butonu ekle. | Nielsen H9 |
| **H19** | H10: Help and documentation | Flexibility > Dialog initiative | Onboarding'de "İstediğin zaman profil ayarlarından değiştirebilirsin" footer notu var, ancak "profil ayarları" nerede olduğu hiç gösterilmiyor (link veya görsel işaret yok). | `src/pages/Onboarding.tsx:285-288` | **1** | Footer notundaki "profil ayarları"nı `/profile` linkine dönüştür veya ikon ekle. | Nielsen H10 |
| **H20** | H10: Help and documentation | Learnability > Synthesizability | F3 Guide başarılı olduğunda disclaimer "yapay zeka destekli" yazıyor ama kullanıcıya ne yapması gerektiği söylenmiyor: rehberi kaydet mi, tesisle teyit et mi, ne zaman geçerliliği biter? | `src/components/feature/F3Guide.tsx:200-203` | **1** | Disclaimer'a eylem önergesi ekle: "Bu rehberi ziyaretten önce tesisle doğrulamanızı öneririz. PDF olarak indirerek yanınızda bulundurabilirsiniz." | Nielsen H10 |
| **H21** | H1: Visibility of system status | Robustness > Observability | TopBar "Bildirimler" ikonu her zaman kırmızı nokta gösteriyor (statik, mock). Kullanıcı bağlandı diye düşünüp tıklıyor — `/profile`'e gidiyor, bildirim yok. | `src/components/layout/TopBar.tsx:116-123` | **2** | Bell ikonundaki `aria-label="Bildirimler"` → `aria-label="Profil (Bildirim yok)"`. Kırmızı nokta badge'ini ya kaldır ya da gerçek bildirim olmadığını belgele. Yanıltıcı visual state kullanıcı güvenini zedeler. | Nielsen H1 |
| **H22** | H6: Recognition rather than recall | Learnability > Generalizability | Dashboard "Yakındaki Tesisler" → tesis kartına tıklayınca `/facility/:id` açılıyor. Haritaya gitmek için `SectionHeader` "Tümünü gör →" linki var — ancak bu link `to="/map"` ile harita sayfasına gidiyor, kartın konumunu haritada göstermiyor. Kullanıcı haritanın başından araştırmak zorunda kalıyor. | `src/pages/Dashboard.tsx:167, 211` | **2** | "Tümünü gör →" linki `/map` yerine `/map?highlight={ranked[0].facility.id}` ile açılsın; kullanıcı haritada en yakın tesisin vurgulandığını görsün. | Nielsen H6 |

---

## Nielsen Heuristic Kapsam Özeti

| # | Heuristic | Bulunan Sorun | Tarama Durumu |
|---|---|---|---|
| H1 | Visibility of system status | H01 (F3 sessiz hata), H02 (Dashboard skeleton yok), H21 (sahte bildirim nokta) | İhlaller tespit edildi |
| H2 | Match between system and real world | H03 (skor metaforu), H04 (radyo semantiği) | İhlaller tespit edildi |
| H3 | User control and freedom | H05 (dış link uyarısı yok), H06 (form draft kayıp) | İhlaller tespit edildi |
| H4 | Consistency and standards | H07 (filtre 3 farklı pattern), H08 (CTA hiyerarşi tutarsız) | İhlaller tespit edildi |
| H5 | Error prevention | H09 (sessiz varsayılan mobility), H10 (işlevsiz search input) | İhlaller tespit edildi — H10 Catastrophic |
| H6 | Recognition rather than recall | H11 (sr-only spor etiketleri eksik), H12 (sayfalama sayacı yok), H22 (harita context kaybı) | İhlaller tespit edildi |
| H7 | Flexibility and efficiency of use | H13 (platform-içi harita link yok), H14 (klavye kısayolu yok) | Küçük ihlaller |
| H8 | Aesthetic and minimalist design | H15 (emoji aria-hidden eksik), H16 (tab pattern sahte) | İhlaller tespit edildi |
| H9 | Help recover from errors | H17 (hata mesajı yetersiz), H18 (filtre sıfır sonuç bağlamı yok) | İhlaller tespit edildi |
| H10 | Help and documentation | H19 (link verilmemiş yönlendirme), H20 (disclaimer eylem yok) | Küçük ihlaller |

Tüm 10 heuristic tarandı. Hiçbiri atlanmadı.

---

## Alan Dix Dağılımı

| Boyut | İlgili Bulgular |
|---|---|
| Learnability > Familiarity | H03, H04, H11, H15, H16 |
| Learnability > Consistency | H07, H08 |
| Learnability > Predictability | H12 |
| Learnability > Generalizability | H22 |
| Flexibility > Dialog initiative | H10, H19 |
| Flexibility > Task migratability | H06 |
| Flexibility > Substitutivity | H14 |
| Flexibility > Customizability | H13 |
| Robustness > Observability | H01, H02, H21 |
| Robustness > Recoverability | H09, H17, H18 |
| Robustness > Task conformance | H05 |

---

## Öncelik Sıralaması (Acil → Düşük)

### Catastrophic (Severity 4) — Derhal düzelt

| Bulgu | Konum | Aksiyon |
|---|---|---|
| **H10** | `TopBar.tsx:67-78` | Search input'u disabled yap veya kaldır |
| **H01** | `F3Guide.tsx:41-45` | `catch` → `error` state, `aria-live="assertive"` bildirim |

### Major (Severity 3) — Bu iterasyonda düzelt

| Bulgu | Konum |
|---|---|
| **H02** | `Dashboard.tsx:203-209` — skeleton/loading state |
| **H03** | `FacilityDetail.tsx:57` — skor metodolojisi açıklama |
| **H04** | `Onboarding.tsx:594-609` — radyo semantiği |
| **H07** | ExerciseLibrary + FacilityMap — filtre pattern standardizasyonu |
| **H08** | Tüm sayfalar — CTA hiyerarşi sözlüğü |
| **H11** | `Dashboard.tsx:191-193` — sr-only spor etiketleri |
| **H15** | `Dashboard.tsx:111`, `FacilityDetail.tsx:427` — emoji aria-hidden |
| **H16** | `FacilityDetail.tsx:218-237` — WAI-ARIA tab pattern |

### Minor (Severity 2) — Sonraki iterasyonda

H05, H06, H09, H12, H13, H17, H18, H21, H22

### Cosmetic (Severity 1) — Arındırma sırasında

H14, H19, H20

---

## Olumlu Noktalar (Heuristic Perspektifinden)

**P1 — H1 (Sistem Durumu): F3 yükleme skeleton'ı + overlay**  
F3Guide yükleme durumunda animate-pulse skeleton satırları ve 2 saniye gecikmeli "Rehber hazırlanıyor..." overlay var. Kullanıcıya işlem sürüyor mesajı net iletiliyor. `role="status" aria-live="polite"` eklenmiş.

**P2 — H5 (Hata Önleme): Onboarding "Devam Et" disable guard**  
`canProceed` kontrolü seçim yapılmadan ilerlemeyi engelliyor. Buton `disabled` + `aria-disabled` çift kod ile doğru uygulanmış; sadece görsel değil semantik olarak da bloke.

**P3 — H4 (Tutarlılık): `ChoiceGrid` bileşeni tekrar kullanımı**  
Onboarding'deki disability ve goal adımları aynı `ChoiceGrid<T>` generic bileşenini kullanıyor. `fieldset[role="radiogroup"]` ile semantik radyo grubu oluşturuluyor, `focus-within:ring-2` ile keyboard focus tüm kart sınırında görünür.

**P4 — H3 (Kontrol ve Özgürlük): Onboarding session draft**  
`sessionStorage` draft kurtarma sessiz ve otomatik çalışıyor. Kullanıcı F5 yaptığında adım 2'de kaldığı yere dönüyor, veri kaybı yok.

**P5 — H9 (Hata Kurtarma): Red flag fallback**  
F3 Guide'da `redFlag` yanıtı geldiğinde `role="alert"` ile kırmızı uyarı panel açılıyor, 112 numarası gösteriliyor, "Geri dön" butonu mevcut. Kullanıcı kör çıkmaz bırakılmıyor.

---

## Sonraki Adımlar

| Aksiyon | Skill / Araç |
|---|---|
| Renk kontrast doğrulaması (özellikle `text-muted-foreground` üzerinde) | `/sevgi-ai:color-audit` |
| Gerçek kullanıcılarla F3 + Onboarding akışı testi planla | `/sevgi-ai:usability-eval-plan` |
| `role="tab"` pattern implementasyonu önceliklendir | Doğrudan kod düzeltmesi |
| Search input kaldırma veya disable etme | Doğrudan kod düzeltmesi (1 satır) |

---

*Bu rapor UYUM Platform kaynak kodundan türetilmiştir. H01, H10, H15, H16 öncelikli kod düzeltmesi; geri kalanlar design debt. Manuel ekran okuyucu testi (NVDA/VoiceOver) ile doğrulanması zorunludur.*
