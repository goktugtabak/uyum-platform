# HCI Review — UYUM Platform

**Tarih:** 2026-05-17  
**İncelenen:** UYUM Platform MVP (Faz 12 — frontend entegrasyonu tamamlandı)  
**Yöntem:** Alan Dix üçlü çatısı (Learnability · Flexibility · Robustness) + SRS FR analizi  
**Değerlendirici:** Yapay zeka destekli HCI analizi (kaynak: kod + UYUM-platform-final.md + SRS-UYUM.md)

---

## 1. Bağlam

**Ekranlar / Akışlar:** Landing → Onboarding (4 adım) → Dashboard → FacilityMap → FacilityDetail → ExerciseLibrary → EventList → CoachDirectory → Community → Profile  
**Hedef kullanıcı:** Türkiye'de yaşayan, çeşitli engellilik türlerine sahip bireyler (tekerlekli sandalye, görme, işitme, üst ekstremite) — tekil persona, Ankara'ya yönelik  
**Birincil görev:** Erişilebilir bir spor tesisi bul, ilk ziyaret için hazırlan  
**Bağlam:** Çoğunlukla ev/ofis ortamı; bazı durumlarda tek elle kullanım (koltuk değneği veya tekerlekli sandalye), mobil + masaüstü  
**Bilişsel profil:** Genel yetişkin bilgisayar kullanım düzeyi; bilgi aramaya alışkın ancak UI'ların standart engelsizlik uyumuna alışık olmayan kullanıcılar

---

## 2. Kullanıcı Modeli

| Kısıt | Etki | Platform Yanıtı |
|---|---|---|
| Motor kısıtlama (tekerlekli sandalye / koltuk değneği) | Tek elle yazma, küçük touch hedefleri sorun | `focus-visible` ring, klavye tam desteği var; ancak FAB hedef boyutu sınırda |
| Görme bozukluğu | Kontrast, renk bağımlılığı, ekran okuyucu | 3 koyu kör filtre + yüksek kontrast; ancak bazı placeholder metin kontrastı düşük |
| İşitme bozukluğu | Ses bildirimleri, altyazı gerekliliği | Subtitle-first toggle egzersizlerde mevcut; Web Speech A3 devre dışı bırakılabilir |
| Bilişsel yük | Çok adımlı akış, fazla seçenek | Onboarding taslak kayıt var; ancak Dashboard bilgi yoğunluğu yüksek |
| Dil | Türkçe, erişilebilirlik terminolojisi alışılmadık | UI Türkçe; "erişilebilirlik skoru" açıklaması minimun |

---

## 3. Sezgisel İnceleme

### 3.1 Learnability (Öğrenilebilirlik)

**Predictability (Davranış öngörülebilirliği)**  
Sidebar nav tutarlı: her tıklamada beklenen sayfaya gidilir. Ancak Landing ve authenticated akış arasındaki geçiş belirsiz — "Giriş Yap" butonu yok, Onboarding ile Dashboard arası köprü `RequireProfile` guard'dan geçiyor; kullanıcı bunu görmüyor.

**Synthesizability (Durum sentezi)**  
Kullanıcı bir eylemi gerçekleştirdikten sonra sistemin durumunu görebilmeli. F3 rehber üretilirken yükleme göstergesi var, ancak başarı / başarısızlık durumu aynı boyuttaki alanda gösteriliyor; kullanıcı değişimi kaçırabilir.

**Familiarity (Tanıdıklık)**  
Egzersiz kartlarında video süre göstergesi (kalp atışı ikonu yanında) ve "Altyazı" rozeti işlevsel bağlamı iyi yansıtıyor. Harita pinlerindeki renk + glyph ikilisi iyi uygulanmış. Ancak "erişilebilirlik skoru %" — bu değerin ne anlama geldiği hiçbir yerde öğretilmiyor.

**Generalizability (Aktarılabilir öğrenme)**  
FilterChip paterni tüm sayfalarda aynı görünüyor — egzersizlerde öğrenilenlerin haritada da geçerli olduğu hissettiriyor. Bu bir güç. Ancak iki ayrı filtre mekanizması var (Chip vs. dropdown `<select>`) — bu tutarsızlık beklentileri bozuyor.

**Consistency (Tutarlılık)**  
`rounded-3xl bg-card ring-1 ring-border/40` kart stili tüm domainlerde tutarlı. Bununla birlikte: CoachDirectory'de "İletişim" butonu birincil, EventCard'da ise "Detaylar" birincil — CTA hiyerarşisi tutarsız.

---

### 3.2 Flexibility (Esneklik)

**Dialog initiative (Kim başlatıyor)**  
Sistem çoğunlukla kullanıcıyı yönlendiriyor (yönlendirilmiş Onboarding, profil zorunluluğu). F3 rehber kullanıcı tetikli — iyi. Ancak harita filtre sıfırlama ("Filtreleri temizle") her zaman mevcut değil; bazı filtre kombinasyonları sonuçsuz bırakıyor.

**Task migratability (Görev göçü)**  
Kullanıcı bazı görevleri başlatıp yarıda bırakabiliyor (Onboarding taslak kaydı — iyi). Ancak Dashboard'dan haritaya geçince filtre durumu korunmuyor; geri dönünce sıfırdan başlamak gerekiyor.

**Substitutivity (Alternatif giriş)**  
Onboarding'de seçim grid'i tıklanabilir kart + klavye navigasyonunu destekliyor. Ancak tüm seçimler yalnızca görsel ikon + metin — sesli yardım ile kullanıcı için seçenekler `aria-label` eksikse anlamsız kalabilir.

**Customizability (Özelleştirme)**  
A11y toolbar güçlü: 6 parametre değiştirilebiliyor ve `localStorage`'a kaydediliyor. Bu tasarımın en güçlü esneklik noktası. Ancak sidebar genişliği ya da kart yoğunluğu gibi görsel tercihler özelleştirilemez.

---

### 3.3 Robustness (Sağlamlık)

**Observability (Sistemin durumu görünür mü)**  
Canlı durum (LiveStatus) tesisler için son doğrulama tarihlerini gösteriyor — iyi. Ancak F3 rehber yüklenirken yalnızca bir `Spinner` var; timeout (5sn) sonrası fallback'e geçiş kullanıcıya bildirilmiyor.

**Recoverability (Hata kurtarma)**  
ErrorBoundary tanımlanmış. Onboarding taslak kayıt koruyor. Ancak harita sayfasında filtreyle "sonuç yok" empty state var ama silme CTA'sı tutarsız konumlandırılmış (bazı sayfalarda hemen altında, bazılarında kayıyor).

**Responsiveness (Algılanan hız)**  
Vite + Framer Motion route animasyonları geçişlerde pürüzsüzlük sağlıyor. Ancak ExerciseLibrary'de `useMemo` hesaplama synchronous — 66 egzersiz için fark edilmez, ancak daha büyük veri setlerinde donabilir.

**Task conformance (Görev uyumu)**  
Ana kullanıcı görevi "tesis bul ve hazırlan" → Dashboard → Map → Detail → F3 akışıyla tam destekleniyor. Ancak Dashboard'dan doğrudan "Yakınımdaki en erişilebilir tesis" tek tıkla açılamıyor; önce haritaya gitmek, sonra sıralamayı görmek gerekiyor.

---

## 4. Bulgular Tablosu

| # | Bulgu | Etki | Önerilen Aksiyon | HCI Referansı |
|---|-------|------|------------------|----------------|
| **F1** | **Onboarding'de engel türü seçimi renk + ikona dayanıyor; `aria-label` metinleri seçenekleri yetersiz tanımlıyor** (ör. "wheelchair" ikonu için yalnızca "Tekerlekli Sandalye" değil, "kaslar veya sinirler" da dahil olabilir) | **Critical** | Her `<input type="radio">` için açıklayıcı `aria-describedby` ekle; yalnızca görsel ikonla anlam taşıma | Learnability > Familiarity; WCAG 1.3.1 |
| **F2** | **Erişilebilirlik skoru "%" değerinin hesaplama mantığı hiçbir yerde açıklanmıyor** — kullanıcı %72'nin ne anlama geldiğini bilemiyor | **High** | FacilityDetail'e "Bu skor nasıl hesaplanır?" tooltip veya genişletme kutusu ekle; ilk Dashboard ziyaretinde tek satır bağlam ver | Learnability > Synthesizability |
| **F3** | **F3 Guide timeout (5sn) dolunca fallback içeriğe geçiş sessiz** — kullanıcı ağ hatası mı, AI hatası mı, normal mi bilemiyor | **High** | Timeout geçişini kullanıcıya bildiren `aria-live="assertive"` bildirim + görsel statü değişimi ekle ("Hazır şablon yüklendi" gibi) | Robustness > Observability |
| **F4** | **Dashboard'da "Sana Yakında" bloğundaki 3 tesise tıklamak haritayı değil facility detail'i açıyor** — kullanıcı konumsal bağlamı (haritada nerede?) kaybediyor | **High** | MiniFacilityCard'a harita bağlantısı ekle; alternatif: DetailPage'de "Haritada Göster" CTA'sı | Robustness > Task conformance |
| **F5** | **Harita sayfasında pin renkleri 4 durum arasında ayrımı açıklayan legend, mobilde gizleniyor** — salt renkle durum anlaşılamıyor | **High** | MapLegend'i mobilde de kalıcı yap (collapsible değil); en azından ilk 3 saniye otomatik açık tut | Learnability > Familiarity; WCAG 1.4.1 |
| **F6** | **Egzersiz kartlarında "Başla" butonu yok; kart tıklaması video embed'i açıyor ancak affordance açık değil** — kartın neresine tıklanacağı belirsiz | **Medium** | Her ExerciseCard'a görünür "Başlat" butonu ekle; tüm kart tıklanabilirliğini `role="button"` veya `<a>` ile sararak netleştir | Learnability > Predictability |
| **F7** | **CTA hiyerarşisi sayfalara göre değişiyor** (CoachCard: "İletişim" birincil; EventCard: "Detaylar" birincil) — kullanıcı hangi butonun ne yapacağını tahmin edemiyor | **Medium** | Birincil aksiyon standardını belge; tüm kartlarda tutarlı: bağlam navigasyonu = ikincil, asıl eylem (iletişim/katıl/başlat) = birincil | Learnability > Consistency |
| **F8** | **Onboarding akışında geri butonu çalışıyor ancak adım ilerlemesi (1/4) karşılaştırmalı olarak küçük** — motor kısıtlı kullanıcı "kaç adım kaldı?" sorusunu yanıtlayamıyor | **Medium** | Progress bar yanına "Adım 2 / 4" metin etiketi ekle; yalnızca görsel progress bar yeterli değil | Flexibility > Dialog initiative; WCAG 2.4.8 |
| **F9** | **TopBar'daki arama kutusu placeholder — fonksiyon yok, kullanıcıyı yazmaya teşvik ediyor ancak yanıt vermiyor** | **Medium** | Arama input'u ya kaldır ya da "Yakında" `disabled` durum rozeti koy; boş placeholder affordance soruşturmasına yol açıyor | Robustness > Task conformance |
| **F10** | **"Erişilebilirlik Araçları" popover, TopBar'da yalnızca küçük ikon ile tetikleniyor** — mobil dokunma hedefi ~28px (önerilen min 44×44px) | **Medium** | Dokunma hedefini `min-h-[44px] min-w-[44px]` yaparak genişlet; ikon + kısa metin etiketi ekle | Flexibility > Dialog initiative; WCAG 2.5.5 |
| **F11** | **Community sayfasındaki testimony yazma formu: karakter sayacı yok, gönder butonu aktif mi pasif mi belli değil** | **Low** | Karakter sınırı + kalan sayaç ekle; 0 karakter durumunda gönder butonunu `disabled` + görsel geri bildirim | Robustness > Observability |
| **F12** | **FacilityDetail sayfasındaki tab navigasyonu link-only** — klavye kullanıcısı tab içeriğini yalnızca sayfa kaydırmayla görebilir; gerçek panel switching yok | **Low** | Tabları `role="tablist"` + `role="tab"` + `role="tabpanel"` WAI-ARIA örüntüsüyle uygula; mevcut smooth-scroll yaklaşımı A11y testiyle çelişiyor | Learnability > Familiarity; WCAG 4.1.2 |

---

## 5. Olumlu Noktalar

**O1 — A11y Toolbar: Kalıcı, Görünür, Kişiselleştirilebilir**  
Sidebar'ın en altında her zaman mevcut olan erişilebilirlik araç çubuğu, kullanıcının erişilebilirlik tercihlerini her sayfada anında değiştirebilmesini sağlıyor. Renk körlüğü filtreleri, yüksek kontrast, font boyutu, sesli okuma — dört bağımsız boyut. `localStorage` kalıcılığı, kullanıcının her oturumda yeniden ayar yapmasını önlüyor. Bu, piyasadaki çoğu "erişilebilirlik" butonu uygulamasının üzerinde.

**O2 — Onboarding Taslak Kaydı (Sessiz Kurtarma)**  
Sayfa yenilemesinde `sessionStorage`'dan draft otomatik yükleniyor ve kullanıcıya gösteriliyor. Bu küçük ama kritik bir karar — motor kısıtlı bir kullanıcı formu doldurmaya çalışırken kazara sayfayı yenilediğinde verilerini kaybetmiyor. Hiçbir modal, hiçbir uyarı yok — sadece çalışıyor.

**O3 — Pin Tasarımında Renk + Glyph + Metin Üçlü Kodlama**  
Harita pinleri yalnızca renkle değil, ✓ / ~ / ✕ / ? sembolleriyle de erişilebilirlik durumunu gösteriyor. WCAG 1.4.1 "renk tek bilgi kaynağı olamaz" kuralını bilinçli şekilde karşılıyor. Bu kodlama FacilityList içinde de tutarlı biçimde tekrarlanıyor.

**O4 — F3 Red Flag Güvenliği ve Sorumluluk Reddi**  
n8n üzerinden gelen rehber içeriği, sistemin üretilmiş olduğunu kullanıcıya bildiren ve "ziyaret öncesi tesisle doğrulayın" uyarısı içeren bir disclaimer'la sunuluyor. Bu, etik veri kullanımı açısından doğru bir karar. Red flag tespiti fallback statik ekran döndürüyor — kullanıcıyı AI çıktısına bağımlı bırakmıyor.

**O5 — DemoBadge: Şeffaf Mock Veri İletişimi**  
Her mock verili bölümde görünür "DEMO VERİSİ" rozeti var. Kullanıcı (ve jüri) gerçek veri ile gösterim verisini karıştırmıyor. Bu güvenlik duvarı aynı zamanda kullanıcı güvenini koruyan bir tasarım kararı.

---

## 6. Sonraki Adım Önerileri

| Öncelik | Aksiyon | Araç / Skill |
|---|---|---|
| Acil | F1 (aria-label eksikleri), F3 (timeout bildirimi), F10 (dokunma hedefi) | Doğrudan kod düzeltmesi |
| Orta Vadeli | F2 (skor açıklama), F4 (harita bağlantısı), F5 (mobil legend), F9 (arama kaldır) | `/sevgi-ai:heuristic-eval` ile kural denetimi |
| Test | Keyboard-only navigation testi, ekran okuyucu ile Onboarding akışı | `/sevgi-ai:usability-eval-plan` |
| Renk | Placeholder metin ve disabled durumlar için kontrast denetimi | `/sevgi-ai:color-audit` |

---

*Bu inceleme UYUM Platform kaynak kodundan ve proje belgelerinden otomatik üretilmiştir. Manuel kullanıcı testi ile doğrulanması önerilir.*
