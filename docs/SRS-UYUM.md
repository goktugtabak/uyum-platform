# Software Requirements Specification
## UYUM — Engelli Bireyler için Spor Erişilebilirlik Platformu

| Alan | Değer |
|---|---|
| **Belge No** | SRS-UYUM-001 |
| **Versiyon** | 1.0 |
| **Tarih** | 16 Mayıs 2026 |
| **Durum** | Taslak — Hackathon MVP |
| **Standart** | ISO/IEC/IEEE 29148:2018 (MSRS yapısı) |
| **Kapsam** | Frontend-only MVP; Vercel deploy; tek kullanıcı sınıfı |

---

## 1. Giriş

### 1.1 Amaç

Bu belge, UYUM platformunun MVP kapsamındaki yazılım gereksinimlerini tanımlar. Belge; geliştirici ekip, hackathon jürisi ve ilerleyen aşamalarda projeye dahil olacak paydaşlar için referans alınır.

### 1.2 Kapsam

**Sistem adı:** UYUM

**Kısa tanım:** Türkiye'deki engelli bireylerin spor tesislerine erişimini kolaylaştıran, kendisi de tam erişilebilir olan bir web platformu. Engel tipine özgü 6 boyutlu tesis erişilebilirlik bilgisi, kişiselleştirilmiş ilk ziyaret rehberi, adaptif spor eşleştirme, egzersiz içeriği ve topluluk tanıklık sistemi sunar.

**Kapsam dışı:** Tıbbi tavsiye, rehabilitasyon planı, paralimpik yetenek değerlendirmesi, backend veritabanı (MVP'de localStorage), Ankara dışı şehirler.

### 1.3 Tanımlar ve Kısaltmalar

| Terim | Açıklama |
|---|---|
| **FR** | Functional Requirement — İşlevsel Gereksinim |
| **QoS** | Quality of Service — Kalite Gereksinimleri (NFR alt kümesi) |
| **CMP** | Compliance Requirement — Uyumluluk Gereksinimi |
| **CON** | Design Constraint — Tasarım Kısıtı |
| **AccessibilityMatrix** | 6 boyut × 4 engel tipi = 24 hücreli erişilebilirlik veri yapısı |
| **DisabilityType** | `wheelchair` \| `visual` \| `hearing` \| `upper_limb` |
| **AccessibilityDimension** | `verified` \| `partial` \| `none` \| `unknown` |
| **WCAG** | Web Content Accessibility Guidelines |
| **KVKK** | Kişisel Verilerin Korunması Kanunu (6698 sayılı) |
| **OSM** | OpenStreetMap |
| **P1/P2/P3** | Feature öncelik seviyesi (P1 = demo zorunlu) |
| **DEMO VERİSİ** | Mock kaynaklı içeriğin zorunlu UI rozeti |

### 1.4 Referans Belgeler

| No | Belge | Konum |
|---|---|---|
| [1] | UYUM Platform Dokümanı v0.3 | `docs/UYUM-platform-final.md` |
| [2] | UYUM Build Planı | `docs/UYUM-build-plan.md` |
| [3] | Commit Disiplini | `docs-compliance/COMMITS.md` |
| [4] | ISO/IEC/IEEE 29148:2018 | Systems and software engineering — Life cycle processes — Requirements engineering |
| [5] | ISO/IEC 25010:2023 | Systems and software quality models |
| [6] | WCAG 2.1 Level AA | W3C Web Content Accessibility Guidelines |

### 1.5 Genel Bakış

Bu belge beş ana bölümden oluşur:
- **Bölüm 2** — Ürün genel bakışı (bağlam, kullanıcılar, varsayımlar)
- **Bölüm 3** — Gereksinimler (FR + QoS + Compliance + Constraints + AI/ML)
- **Bölüm 4** — Doğrulama yöntemleri
- **Bölüm 5** — Ekler

---

## 2. Ürün Genel Bakışı

### 2.1 Ürün Perspektifi

UYUM, mevcut herhangi bir sistemin bileşeni değildir. Bağımsız bir web uygulamasıdır. Dış sistem bağımlılıkları:

- **OpenStreetMap / Overpass API** — Ankara spor tesisi koordinatları (build-time önbellekleme)
- **n8n webhook** (üretim) → **OpenAI API (gpt-4o-mini)** (n8n içinden çağrılır) — F3 İlk Ziyaret Rehberi kişiselleştirmesi
- **Web Speech API** — Tarayıcı yerel sesli okuma (A3)
- **YouTube** — F6 egzersiz video referansları (hardcoded ID'ler, canlı API çağrısı yok)

### 2.2 Ürün İşlevleri

Platformun sunduğu ana işlev grupları (öncelik sırasıyla):

| Grup | İşlev |
|---|---|
| **P1 — Zorunlu** | F1 Erişilebilirlik Parmak İzi, F2 Tesis Haritası, F3 İlk Ziyaret Rehberi, F4 Canlı Durum + Tanıklık, F5 Adaptif Spor Eşleştirme, F9 Ana Sayfa Dashboard |
| **P2 — Güçlendirici** | F6 Adaptif Egzersiz İçeriği, F7 Etkinlik Rehberi, F8 Koç & Antrenör Dizini |
| **Erişilebilirlik Katmanı** | A1 Renk Körlüğü Modu, A2 Yüksek Kontrast, A3 Sesli Okuma, A4 Klavye Nav, A5 İşitme UX, A6 Font Kontrolü, A7 ARIA |

### 2.3 Kullanıcı Sınıfları

**Tek kullanıcı sınıfı:** Engelli birey (anonim veya profilli)

| Özellik | Detay |
|---|---|
| **Engel tipleri** | Tekerlekli sandalye / Görme engelli / İşitme engelli / Üst ekstremite kısıtı |
| **Teknik yetkinlik** | Orta (tarayıcı kullanıcısı; yardımcı teknoloji kullanabilir) |
| **Dil** | Türkçe (tek dil) |
| **Coğrafya** | Ankara |
| **Profil durumu** | Opsiyonel — profil olmadan da tesis listesi görülebilir; profil varsa kişiselleştirme aktif |

**Yönetici sınıfı:** MVP kapsamında yok. İçerik güncellemesi build-time JSON düzenlemesiyle yapılır.

### 2.4 Operasyonel Ortam

- **Platform:** Modern web tarayıcısı (Chrome 120+, Firefox 120+, Safari 17+)
- **Cihaz:** Masaüstü öncelikli, responsive mobil (≥375px)
- **Bağlantı:** Çevrimiçi gerekli; tesis koordinatları önbelleğe alındığından harita offline da görünebilir
- **Deploy:** Vercel (statik SPA)
- **Tarayıcı API'leri:** Web Speech API, localStorage, Geolocation (opsiyonel, F2 için)

### 2.5 Tasarım ve Uygulama Kısıtları

Bkz. Bölüm 3.5 (Design Constraints).

### 2.6 Varsayımlar ve Bağımlılıklar

**Varsayımlar:**
- Hackathon jürisi platformu masaüstü Chrome ile demo ortamında değerlendirir.
- Overpass API verisi build öncesinde çekilmiş ve `public/data/facilities-overpass-cache.json` commit edilmiştir.
- n8n workflow `f3-rehber` demo anında **Active** durumdadır ve OpenAI API anahtarı yalnızca n8n workflow ortamında tanımlıdır. Webhook 5 saniye içinde yanıt vermezse veya başarısız olursa statik fallback devreye girer. OpenAI key frontend bundle'ında veya `VITE_*` env değişkenlerinde bulunmaz.
- Türkçe Web Speech API desteği demo tarayıcısında aktiftir.

**Bağımlılıklar:**
- Overpass API erişilebilirlik detayı sunmaz; bu veriler mock JSON'da bulunur.
- YouTube video ID'leri manuel olarak küratörlenmiştir; YouTube Data API v3 canlı çağrısı MVP'de yapılmaz.

---

## 3. Gereksinimler

### 3.1 Harici Arayüz Gereksinimleri

#### 3.1.1 Kullanıcı Arayüzleri

**UI-001:** Sistem, tüm sayfalarda Türkçe arayüz sunacaktır.

**UI-002:** Sistem, header bileşeninde erişilebilirlik araç çubuğunu (renk körlüğü modu, yüksek kontrast, font büyüklüğü) kalıcı olarak gösterecektir.

**UI-003:** Sistem, mock kaynaklı her içerik öğesinin yanında `DEMO VERİSİ` rozetini görünür biçimde gösterecektir.

**UI-004:** Sistem, profil yokken `/` rotasından `/onboarding` rotasına yönlendirme yapacaktır.

#### 3.1.2 Donanım Arayüzleri

Geçerli değil — web uygulaması.

#### 3.1.3 Yazılım Arayüzleri

**SW-001:** Sistem, Overpass API'yi yalnızca build öncesinde çağıracak; üretilen `facilities-overpass-cache.json` dosyasını runtime'da kullanacaktır.

**SW-002:** Sistem, F3 İlk Ziyaret Rehberi için OpenAI API'yi (`gpt-4o-mini`) **yalnızca n8n webhook üzerinden** çağıracaktır. Frontend'den doğrudan OpenAI çağrısı üretimde kullanılmayacaktır.

**SW-003:** Sistem, sesli okuma işlevi için Web Speech API'yi `lang: 'tr-TR'`, `rate: 0.9` parametreleriyle kullanacaktır.

**SW-004:** Sistem, kullanıcı durumunu `uyum:` önekli localStorage anahtarlarıyla kalıcı hale getirecektir (örnek: `uyum:profile`, `uyum:testimonies`).

#### 3.1.4 İletişim Arayüzleri

**COM-001:** F3 n8n webhook opsiyonunda sistem, `POST /webhook/f3-rehber` uç noktasına kullanıcı profili ve tesis JSON'u gönderecektir.

---

### 3.2 İşlevsel Gereksinimler

#### F1 — Erişilebilirlik Parmak İzi

**FR-001:** Sistem, her spor tesisi için Giriş & Otopark, Tesis İçi Hareket, Soyunma & Banyo, Adaptif Ekipman, Personel Yetkinliği ve İletişim & Yönlendirme boyutlarından oluşan 6 boyutlu radar grafiği gösterecektir.

**FR-002:** Sistem, radar grafikteki her boyutu sayısal yüzde yerine `Doğrulanmış`, `Kısmi`, `Mevcut Değil` veya `Bilgi Yok` etiketiyle gösterecektir.

**FR-003:** Sistem, kullanıcı engel tipini değiştirdiğinde radar grafiğini Framer Motion geçiş animasyonuyla güncelleyecektir.

**FR-004:** Sistem, radar grafiğinin tüm SVG elementlerini `role="img"` ve `aria-label` nitelikleriyle işaretleyecektir.

#### F2 — Tesis Haritası + Engel Tipi Filtre

**FR-005:** Sistem, Ankara'daki spor tesislerini Leaflet.js tabanlı OpenStreetMap haritasında işaretleyecektir.

**FR-006:** Sistem, haritadaki her tesis işaretçisinin rengini etkin kullanıcı engel tipine göre kural tabanlı olarak hesaplayacaktır; bu hesaplama LLM kullanmayacaktır.

**FR-007:** Sistem, kullanıcı engel profili değiştiğinde tesis işaretçilerinin renklerini yeniden hesaplayacak ve haritayı güncelleyecektir.

**FR-008:** Sistem, `facilities-overpass-cache.json` dosyası yüklenemediğinde en az 6 tesislik sabit yedek veri kümesiyle haritayı dolduracaktır; harita boş açılmayacaktır.

#### F3 — İlk Ziyaret Rehberi

**FR-009:** Sistem, kullanıcı profili ve seçili tesis JSON'unu birleştirerek OpenAI API veya n8n webhook aracılığıyla kişiselleştirilmiş varış rehberi üretecektir.

**FR-010:** Sistem, F3 üretiminde yalnızca sağlanan tesis JSON'undaki alanları kullanacaktır; JSON'da bulunmayan fiziksel detayları çıkarsamayacak, üretmeyecek veya ima etmeyecektir.

**FR-011:** Sistem, her F3 çıktısının altına "Tesis koşullarını doğrulayamayız — ziyaretten önce tesisi arayın. [Tesis telefonu]" ibaresini zorunlu olarak ekleyecektir.

**FR-012:** Sistem, OpenAI API veya n8n webhook başarısız olduğunda statik şablon rehberi gösterecektir; demo boş ekranla karşılaşmayacaktır.

**FR-013:** Sistem, F3 rehberini Web Speech API ile `tr-TR` dilinde sesli okuyacak ve sayfada "Sesli Oku" düğmesi sunacaktır.

**FR-014:** Sistem, F3 rehberini html2canvas kullanarak PDF olarak indirme imkânı sunacaktır.

#### F4 — Canlı Durum + Tanıklık Sistemi

**FR-015:** Sistem, tesis detay sayfasında lift, asansör, rampa ve soyunma odası öğelerinin son doğrulanma tarihlerini gösterecektir; 1 haftadan kısa süre önce doğrulanmış öğeler yeşil, 1 ay içinde doğrulanmış öğeler sarı, 1 aydan eski veya bilinmeyen öğeler gri renkle işaretlenecektir.

**FR-016:** Sistem, kullanıcının "Ben de gittim" tanıklık kaydını anonim olarak zaman damgasıyla localStorage'a yazmasına izin verecektir.

**FR-017:** Sistem, tanıklık sırasında isteğe bağlı kısa sorun bildirim formu sunacaktır.

**FR-018:** Sistem, bir tesisin birden fazla tanıklığı varsa toplam ziyaretçi sayısını "Bu ay X engelli sporcu bu tesisi ziyaret etti." biçiminde gösterecektir.

#### F5 — Adaptif Spor Eşleştirme

**FR-019:** Sistem, kullanıcıya hareket durumu (oturarak / destekle / bağımsız / kol-el kısıtlı), hedef (güç / esneklik / sosyal / rekabet) ve haftalık zaman bütçesi sorularını içeren 3 adımlı profil sihirbazı sunacaktır.

**FR-020:** Sistem, 3 soruya verilen yanıtlara göre kural tabanlı öneri motoruyla en uygun 3 sporu gerekçeli metin açıklamasıyla listeleyecektir; sayısal yüzde veya skor gösterilmeyecektir.

**FR-021:** Sistem, önerilen her spor için Ankara'da erişilebilir tesisleri haritayla birlikte gösterecektir.

**FR-022:** Sistem, F5 spor önerisinden F1 Parmak İzi ve F3 Rehber sayfalarına doğrudan geçiş bağlantısı sunacaktır.

**FR-023:** Sistem, F5 sonuç sayfasında "Bu sporu öğrenmek istiyorum" seçeneğiyle kullanıcıyı F8 Koç Dizinine yönlendirecektir.

#### F6 — Adaptif Egzersiz İçeriği (P2)

**FR-024:** Sistem, engel tipine, hareket durumuna ve hedefe göre filtrelenmiş egzersiz videoları sunacaktır; en az 15 video içerecektir.

**FR-025:** Sistem, Türkçe ve altyazılı içerikleri filtre listesinde önce sıralayacaktır.

**FR-026:** Sistem, her egzersiz videosu üzerinde "Bu içerikler bilgilendirme amaçlıdır. Ağrı varsa dur." ibaresini gösterecektir.

#### F7 — Etkinlik & Turnuva Rehberi (P2)

**FR-027:** Sistem, adaptif spor etkinliklerini ve turnuvaları tarih, konum, engel tipi uyumu ve kayıt bilgisiyle listeleyecektir; en az 6 etkinlik içerecektir.

**FR-028:** Sistem, etkinlikleri kullanıcı profiline göre uyum sırasıyla sıralayacaktır.

**FR-029:** Sistem, her etkinlik kartından F1 Erişilebilirlik Parmak İzi sayfasına bağlantı sunacaktır.

#### F8 — Koç & Antrenör Dizini (P2)

**FR-030:** Sistem, adaptif spor konusunda deneyimli antrenörlerin uzmanlık, tesis ve engel tipi bilgisiyle dizinini gösterecektir; en az 5 profil içerecektir.

**FR-031:** Sistem, F5 önerisinden ve F2 tesis detayından F8 Koç Dizinine bağlantı sunacaktır.

#### F9 — Ana Sayfa Dashboard

**FR-032:** Sistem, profil oluşturan kullanıcıya kişiselleştirilmiş ana sayfa gösterecektir; bu sayfa yakın tesisleri, topluluk tanıklıklarını ve keşif bağlantılarını içerecektir.

**FR-033:** Sistem, profil bulunmayan kullanıcıyı onboarding akışına yönlendirecektir.

---

### 3.3 Kalite Gereksinimleri (QoS)

#### 3.3.1 Performans
*ISO/IEC 25010:2023 — Time Behaviour*

**QoS-PERF-001:** Sistem, tesis haritasını Overpass önbellek dosyasından tarayıcıda 3 saniye içinde yükleyecektir (Vercel CDN + önbelleklenmiş JSON; ağ koşulları standart kablosuz bağlantı).

**QoS-PERF-002:** Sistem, F5 kural tabanlı spor önerisini kullanıcı girişinden itibaren 500 milisaniye içinde üretecektir; bu işlem OpenAI çağrısı içermeyecektir.

**QoS-PERF-003:** Sistem, F1 radar grafiği animasyonunu (engel tipi değişimi) Framer Motion ile 300 milisaniyeden kısa sürede tamamlayacaktır.

**QoS-PERF-004:** Sistem, Vite bundle çıktısını 300 KB sıkıştırılmış JS altında tutacaktır; demo'da ilk yükleme süresi 4G bağlantıda 5 saniyeyi aşmayacaktır.

#### 3.3.2 Güvenlik
*ISO/IEC 25010:2023 — Confidentiality, Integrity*

**QoS-SEC-001:** Sistem, OpenAI API anahtarını kaynak koduna, bundle çıktısına veya git geçmişine yazmayacaktır. OpenAI API anahtarı yalnızca n8n workflow ortamında tutulacaktır; frontend `.env.local`, `.env.production` veya bundle çıktısı içinde bulunmayacaktır. `VITE_N8N_F3_WEBHOOK_URL` ve `VITE_N8N_REPORT_ISSUE_WEBHOOK_URL` ortam değişkenleri yalnızca webhook adresini içerir ve gizli anahtar değildir.

**QoS-SEC-002:** Sistem, F3 OpenAI çağrısı öncesinde kullanıcı metnini red flag listesine karşı filtreleyecektir; aşağıdaki ifadeler algılandığında LLM çağrısı yapılmayacak ve statik güvenlik yönlendirme ekranı gösterilecektir: "göğüs ağrısı", "nefes alamıyorum", "bayılacak", "çok şiddetli ağrı" ve eşdeğer Türkçe argo varyantları.

**QoS-SEC-003:** Sistem, F3 OpenAI sistem promptuna "Yalnızca sağlanan JSON'da bulunan alanları kullan; JSON'da olmayan hiçbir fiziksel detayı çıkarsama, üretme veya ima etme" kuralını sabit olarak ekleyecektir; bu kural prompt aracılığıyla değiştirilemeyecektir.

**QoS-SEC-004:** Sistem, `localStorage`'a yazılan tanıklık verilerini anonim tutacaktır; tanıklık kaydında ad, e-posta veya cihaz tanımlayıcısı bulunmayacaktır.

#### 3.3.3 Güvenilirlik
*ISO/IEC 25010:2023 — Fault Tolerance, Recoverability*

**QoS-REL-001:** Sistem, herhangi bir harici API (OpenAI, n8n, Overpass) başarısız olduğunda statik yedek içerikle çalışmaya devam edecektir; demo hiçbir koşulda boş ekran göstermeyecektir.

**QoS-REL-002:** Sistem, harita veri kaynağı erişilemez olduğunda en az 6 tesislik sabit yedek veri kümesine geçecektir.

**QoS-REL-003:** Sistem, her uygulama rotasında hata sınır bileşeni (error boundary) kullanacaktır; bileşen hatası tüm uygulamayı çökertmeyecektir.

#### 3.3.4 Kullanılabilirlik
*ISO/IEC 25010:2023 — Availability*

**QoS-AVL-001:** Sistem, Vercel platformu üzerinde çalışacak ve platform SLA'sı dahilinde (%99.9) erişilebilir olacaktır; bu gereksinim MVP kapsamında kabul edilebilir.

**QoS-AVL-002:** Sistem, demo ortamında Vercel canlı URL'si üzerinden paylaşılabilir durumda olacaktır; build başarısız olduğunda deploy durdurulacaktır.

#### 3.3.5 Gözlemlenebilirlik
*ISO/IEC 25010:2023 — Operability*

**QoS-OBS-001:** Sistem, F3 AI çağrısının başarılı, başarısız veya fallback'e düştüğünü tarayıcı konsoluna yapılandırılmış log mesajı olarak yazacaktır.

**QoS-OBS-002:** Sistem, Overpass önbellek dosyasının yükleme sonucunu (tesis sayısı, hata) tarayıcı konsoluna yazacaktır.

**QoS-OBS-003:** Sistem, demo öncesinde `npm run build` çıktısında sıkıştırılmış bundle boyutunu (KB cinsinden) raporlayacaktır; bu değer 300 KB eşiğinin üzerindeyse geliştirici uyarılacaktır.

#### 3.3.6 Kullanılabilirlik (Erişilebilirlik)
*ISO/IEC 25010:2023 — Usability — Accessibility, Learnability*

**QoS-USA-001 (A4):** Sistem, tüm interaktif elementleri Tab tuşuyla erişilebilir kılacaktır; hiçbir element `outline: none` CSS kuralı almayacaktır; `*:focus-visible` kuralı global olarak tanımlı olacaktır.

**QoS-USA-002 (A1):** Sistem, header'da renk körlüğü modu toggle sunacaktır; deuteranopia, protanopia modları SVG CSS filtresiyle uygulanacaktır; tüm bilgi yalnızca renkle değil ikon ve etiketle de iletilecektir.

**QoS-USA-003 (A2):** Sistem, WCAG AA kontrast oranlarından WCAG AAA kontrast oranlarına geçen yüksek kontrast modu toggle sunacaktır.

**QoS-USA-004 (A3):** Sistem, F1 erişilebilirlik boyutları, F3 İlk Ziyaret Rehberi, F4 canlı durum bilgileri ve F5 spor önerilerinde "Sesli Oku" düğmesi sunacaktır; Web Speech API `lang: 'tr-TR'` parametresiyle çalışacaktır.

**QoS-USA-005 (A7):** Sistem, tüm görsel elementlerde `aria-label` niteliği kullanacaktır; form elementlerinde `aria-describedby`, dinamik içerik değişikliklerinde `aria-live` uygulanacaktır.

**QoS-USA-006 (A5):** Sistem, ses uyarısı üretmeyecektir; tüm bildirimler görsel olacaktır; F6 egzersiz listesinde altyazılı içerikler (`hasSubtitles: true`) önce sıralanacaktır.

**QoS-USA-007 (A6):** Sistem, header'da Normal / Büyük / Çok Büyük font büyüklüğü toggle sunacaktır; ölçekleme CSS `rem` tabanlı olacak ve tüm uygulama orantılı büyüyecektir.

**QoS-USA-008:** Sistem, sayfanın en üstünde görünmez "İçeriğe geç" bağlantısı sunacaktır; Tab tuşuna basınca bağlantı görünür hale gelecek ve ana içerik alanına odaklanacaktır.

---

### 3.4 Uyumluluk Gereksinimleri

**CMP-001 (KVKK):** Sistem, kullanıcı profilini yalnızca `localStorage`'da, cihaz yerelinde saklayacaktır; profil verisi hiçbir sunucuya iletilmeyecektir (F3 ve WF-02 webhook çağrıları hariç: yalnızca engel tipi, hareket durumu, hedef, tesis kimliği ve — WF-02 için — sorun açıklaması gönderilir. Ad, e-posta, telefon, kesin konum ve cihaz tanımlayıcısı hiçbir webhook'a iletilmez.).

**CMP-002 (KVKK):** Sistem, tanıklık kayıtlarını anonim olarak saklayacaktır; kayıt şeması ad, e-posta veya cihaz parmak izi alanı içermeyecektir.

**CMP-003 (WCAG 2.1 AA):** Sistem, WCAG 2.1 AA başarı kriterlerini karşılayacaktır; bu kapsam klavye erişimi (1.3.1, 2.1.1), kontrast oranı (1.4.3), odak göstergesi (2.4.7) ve alternatif metin (1.1.1) kriterlerini içerir.

**CMP-004 (Tıbbi Sorumluluk):** Sistem, tıbbi tavsiye vermeyecektir; egzersiz içeriğinde "bilgilendirme amaçlıdır" ibaresi zorunlu olarak gösterilecektir; ağrı belirtisi bildiren kullanıcılar statik yönlendirme ekranına yönlendirilecektir.

---

### 3.5 Tasarım Kısıtları

#### 3.5.1 Standartlar

**CON-001:** Sistem TypeScript strict modunda (`noImplicitAny: true`, `strict: true`) yazılacaktır; `any` tipi yerine `unknown` kullanılacaktır.

**CON-002:** Sistem Tailwind CSS v3 syntax'ı kullanacaktır; v4'e geçiş Faz 10'a ertelenmiştir.

#### 3.5.2 Donanım Kısıtları

**CON-003:** Sistem, ek sunucu altyapısı gerektirmeden Vercel'in statik hosting hizmetinde çalışacaktır.

#### 3.5.3 Derleme ve Teslimat

**CON-004:** Sistem, `npm run build` komutuyla `tsc -b && vite build` zincirini hatasız tamamlayacaktır; hatalı build deploy edilmeyecektir.

**CON-005:** Overpass tesis verisi `scripts/fetch-overpass-cache.mjs` ile build öncesinde üretilecek ve `public/data/facilities-overpass-cache.json` olarak commit edilecektir; demo sırasında canlı Overpass çağrısı yapılmayacaktır.

#### 3.5.4 Yazılım Kısıtları

**CON-006:** Bağımlılık listesi kapalıdır: `react`, `react-dom`, `react-router-dom`, `framer-motion`, `recharts`, `leaflet`, `react-leaflet`, `html2canvas`, `jspdf`. Yeni bağımlılık eklenmeden önce kullanıcı onayı alınacaktır.

**CON-007:** Sistem, tek kullanıcı durumunu `uyum:` önekli localStorage anahtarlarıyla yönetecektir; arka plan senkronizasyonu veya servis işçisi (service worker) kullanılmayacaktır.

#### 3.5.5 Sürdürülebilirlik

**CON-008:** `src/data/*.json` dosyaları tek kaynak mock veri deposudur; runtime'da değiştirilmez, tanıklık verileri hariç (localStorage'a yazılır).

**CON-009:** Commit formatı `<tip>: <50 karakter altı İngilizce açıklama>` şeklinde olacaktır; `Co-Authored-By: Claude` satırı kesinlikle eklenmeyecektir.

#### 3.5.6 Veri Kısıtları

**CON-010:** Erişilebilirlik verisi `AccessibilityMatrix` yapısına (6 boyut × 4 engel tipi) göre şemalanacaktır; her hücre `verified | partial | none | unknown` değerinden birini alacaktır.

**CON-011:** Tüm mock veri kaynaklı içerik `DemoBadge` bileşeniyle etiketlenecektir; etiketin `aria-label` niteliği "Bu içerik demo verisidir, gerçek değildir" değerini taşıyacaktır.

#### 3.5.7 Taşınabilirlik

**CON-012:** Sistem, Chrome 120+, Firefox 120+ ve Safari 17+ tarayıcılarında işlevsel olacaktır; Web Speech API desteği olmayan tarayıcılarda sesli okuma sessizce devre dışı kalacaktır.

#### 3.5.8 Marka ve Görsel Kimlik

**CON-013:** Renk token'ları Tailwind `theme.extend.colors` altında semantic isimlerle (`brand.primary`, `brand.accent`, `a11y.verified` vb.) tanımlanacaktır; hex değerleri tasarım geçişinde tek dosyadan güncellenecektir.

#### 3.5.9 Güvenlik Kısıtları

**CON-014:** API anahtarları ve webhook URL'leri `.env.local` dosyasında tutulacaktır; bu dosya `.gitignore`'a eklenmiştir ve asla commit edilmeyecektir.

#### 3.5.10 Dil ve Yerelleştirme

**CON-015:** Sistem yalnızca Türkçe destekleyecektir; i18n altyapısı eklenmeyecektir; çoklu dil desteği pitch deck yol haritasına aittir.

#### 3.5.11 Proje Kısıtları

**CON-016:** Hackathon süresinde, saat 14:00 itibarıyla yeni feature eklenmeyecektir; tamamlanmamış feature teslimatta silinir, pitch deck'e taşınır.

---

### 3.6 AI/ML Gereksinimleri

#### 3.6.1 Model Kapsamı

**AI-001:** Sistem, AI çıkarımını yalnızca F3 İlk Ziyaret Rehberi üretiminde kullanacaktır; F5 spor eşleştirme, F2 pin renk hesaplama ve F1 radar verisi kural tabanlı çalışacak; bu işlevlerde LLM çağrısı yapılmayacaktır.

**AI-002:** Sistem, `gpt-4o-mini` modelini kullanacaktır; daha büyük bir modele geçiş maliyet artışı nedeniyle onay gerektirir.

#### 3.6.2 Prompt Güvenceleri

**AI-003:** Sistem promptu aşağıdaki sabit kısıtlamayı içerecektir ve bu kısıtlama kullanıcı girdisi aracılığıyla değiştirilemeyecektir:
> "Yalnızca sağlanan JSON'da bulunan alanları kullan. JSON'da olmayan hiçbir fiziksel detayı çıkarsama, üretme veya ima etme. Bilgi yoksa o alanı tamamen atla."

**AI-004:** Sistem, kullanıcı metnini LLM çağrısından önce red flag listesine karşı kontrol edecektir; eşleşme varsa LLM çağrılmayacak ve statik acil durum ekranı gösterilecektir. Red flag listesi: "göğüs ağrısı", "göğsüm sıkışıyor", "kalbim sıkışıyor", "nefes alamıyorum", "nefesim daralıyor", "baş dönüyor", "bayılacak", "hissizlik", "uyuşma", "çok şiddetli ağrı", "hareket edemiyorum".

**AI-005:** Her F3 çıktısının altına "Tesis koşullarını doğrulayamayız — ziyaretten önce tesisi arayın." ibaresi statik olarak eklenecektir; bu ibareyi AI çıktısı geçersiz kılamayacaktır.

#### 3.6.3 Yedek Davranış

**AI-006:** n8n webhook 5 saniye içinde yanıt vermediğinde, ağ hatası, CORS hatası, HTTP 4xx/5xx, malformed JSON veya eksik response field (`sections` / `guide`) durumlarından herhangi birinde sistem statik şablon rehberi gösterecektir; kullanıcıya hata mesajı yerine içerik sunulacaktır.

#### 3.6.4 Yaşam Döngüsü

**AI-007:** Sistem promptu ve OpenAI çağrı kısıtları **n8n workflow** içindeki Build Prompt node ve OpenAI node'da sabit olarak tutulacaktır; frontend'den değiştirilmesi mümkün olmayacaktır. Red flag listesi defense-in-depth amacıyla hem n8n workflow'unda (Red Flag Check node) hem de frontend `src/lib/redflag.ts` dosyasında bulunacak; iki taraf da eşleşme durumunda OpenAI çağrısını engelleyecektir.

---

## 4. Doğrulama

### 4.1 Doğrulama Matrisi

| Gereksinim | Doğrulama Yöntemi | Kriter |
|---|---|---|
| FR-001 – FR-004 (F1 Radar) | Manuel — tarayıcıda engel tipi değiştirme | Radar güncellenir; aria-label devtools'ta görünür |
| FR-005 – FR-008 (F2 Harita) | Manuel — harita yükleme + profil değiştirme | ≥5 tesis pin görünür; renk değişimi gözlemlenir |
| FR-009 – FR-014 (F3 Rehber) | Manuel — OpenAI çağrısı + API kesintisi simülasyonu | Rehber gelir; API kesilince fallback görünür; PDF indirilebilir |
| FR-015 – FR-018 (F4 Tanıklık) | Manuel — tanıklık kaydı + devtools localStorage | Kayıt localStorage'a yazılır; renk kodu doğru |
| FR-019 – FR-023 (F5 Eşleştirme) | Manuel — 3 soru akışı | 3 spor önerisi gelir; tesis linki çalışır; koç yönlendirmesi çalışır |
| FR-024 – FR-026 (F6 Egzersiz) | Manuel — filtre testi | TR içerikler önce sıralanır; uyarı metni görünür |
| FR-027 – FR-029 (F7 Etkinlik) | Manuel — etkinlik listesi | ≥6 kart görünür; F1 bağlantısı çalışır |
| FR-030 – FR-031 (F8 Koç) | Manuel — koç listesi | ≥5 profil görünür; F5/F2 bağlantıları çalışır |
| FR-032 – FR-033 (F9 Dashboard) | Manuel — profil varlığı/yokluğu | Dashboard dolu açılır; profil yoksa onboarding açılır |
| QoS-PERF-001 | Tarayıcı DevTools Network — harita yüklenme süresi | < 3 saniye (önbelleklenmiş JSON) |
| QoS-PERF-002 | Tarayıcı DevTools Performance — F5 yanıt süresi | < 500 ms |
| QoS-PERF-003 | Gözlemsel — Framer Motion animasyonu | Geçiş akıcı, titreme yok |
| QoS-PERF-004 | `npm run build` çıktısı | Sıkıştırılmış JS < 300 KB |
| QoS-SEC-001 | `git log` + bundle inspect — anahtar varlığı | Anahtar kaynak kodda veya bundle'da bulunamaz |
| QoS-SEC-002 | Manuel — red flag metni girişi | LLM çağrılmaz; güvenlik ekranı açılır |
| QoS-SEC-003 | Kod incelemesi — `f3-service.ts` | Sistem promptu sabit string; değiştirme mekanizması yok |
| QoS-SEC-004 | DevTools localStorage — tanıklık şeması | Ad, e-posta, cihaz kimliği alanı yok |
| QoS-REL-001 | Manuel — API kesintisi simülasyonu (DevTools offline) | Fallback içerik görünür; hata ekranı yok |
| QoS-USA-001 – QoS-USA-008 | Tab navigasyonu + renk körlüğü toggle + sesli okuma | Her gereksinim gözlemsel olarak karşılanır |
| CMP-001 – CMP-002 (KVKK) | DevTools Network — F3 istek incelemesi | Kişisel tanımlayıcı iletilmez |
| CMP-003 (WCAG) | axe DevTools tarama + manuel Tab testi | Kritik WCAG 2.1 AA ihlali yok |
| CMP-004 (Tıbbi) | Kod incelemesi + manuel test | "bilgilendirme amaçlıdır" ibaresi görünür; ağrı girişi yönlendirir |
| AI-001 – AI-007 | Kod incelemesi + manuel AI testi | Prompt kısıtı aktif; fallback ≤5 sn; red flag listesi güncel |

### 4.2 Kabul Kriterleri

Aşağıdaki koşulların tamamı sağlandığında MVP kabul edilmiş sayılır:

1. `npx tsc --noEmit` hatasız tamamlanır.
2. `npm run build` hatasız tamamlanır ve bundle < 300 KB.
3. P1 feature'larının tamamı (F1, F2, F3, F4, F5, F9) manuel smoke testini geçer.
4. Erişilebilirlik toggleları (A1, A2, A3, A4) çalışır durumda gösterilebilir.
5. F3 AI fallback statik şablon devreye girer (DevTools offline modunda doğrulanır).
6. `DEMO VERİSİ` rozeti mock kaynaklı tüm içerikte görünür.
7. Vercel canlı URL paylaşılabilir durumdadır.

---

## 5. Ekler

### Ek A — Veri Modeli Özeti

| Varlık | Anahtar Alanlar | Depolama |
|---|---|---|
| `Facility` | id, name, type, district, lat, lng, sports[], AccessibilityMatrix, source | `src/data/facilities.json` |
| `UserProfile` | disabilityType, mobilityLevel, goals[], interests[], city | `localStorage` (`uyum:profile`) |
| `Testimony` | id, facilityId, userAlias, disability, rating, text, date | `localStorage` (`uyum:testimonies`) |
| `SportEvent` | id, title, date, facilityId, sport, level, disabilityTags[] | `src/data/events.json` |
| `Coach` | id, name, sports[], disabilitySpecialties[], certifications[] | `src/data/coaches.json` |
| `Exercise` | id, title, youtubeId, durationSec, disabilityTags[], mobilityTags[], lang | `src/data/exercises.json` |
| `Sport` | id, name, category, disabilityFitness{} | `src/data/sports.json` |

### Ek B — Red Flag Listesi (Tam)

```
"göğüs ağrısı", "göğsüm sıkışıyor", "kalbim sıkışıyor",
"nefes alamıyorum", "nefesim daralıyor", "baş dönüyor",
"bayılacak", "hissizlik", "uyuşma", "çok şiddetli ağrı",
"hareket edemiyorum"
```

Türkçe argo varyantları da (`nefesim kesiliyor`, `göğsüm daralıyor` vb.) `src/lib/redflag.ts` içinde kapsanacaktır.

### Ek C — Gereksinim Sayım Özeti

| Bölüm | Gereksinim Türü | Adet |
|---|---|---|
| 3.1 | Arayüz gereksinimleri (UI + SW + COM) | 8 |
| 3.2 | İşlevsel gereksinimler (FR) | 33 |
| 3.3.1 | Performans (QoS-PERF) | 4 |
| 3.3.2 | Güvenlik (QoS-SEC) | 4 |
| 3.3.3 | Güvenilirlik (QoS-REL) | 3 |
| 3.3.4 | Kullanılabilirlik/Eriş. (QoS-AVL) | 2 |
| 3.3.5 | Gözlemlenebilirlik (QoS-OBS) | 3 |
| 3.3.6 | Kullanılabilirlik/UX (QoS-USA) | 8 |
| 3.4 | Uyumluluk (CMP) | 4 |
| 3.5 | Tasarım kısıtları (CON) | 16 |
| 3.6 | AI/ML gereksinimleri (AI) | 7 |
| **Toplam** | | **92** |

### Ek D — Pitch Deck Yol Haritası (MVP Dışı)

Aşağıdaki özellikler hackathon MVP kapsamı dışındadır; pitch deck "Yol Haritası" bölümünde sunulacaktır:

- Fizyoterapist onay katmanı (F6 içeriği için)
- Supabase canlı veritabanı (community veri gerçek zamanlı)
- Tanıklık → operatör bildirim döngüsü
- Bakanlık / federasyon API entegrasyonu
- Çoklu şehir desteği (İstanbul, İzmir, Bursa)
- Çoklu dil desteği

---

*Bu belge UYUM platformunun MVP gereksinimlerini kapsamaktadır.*
*Sonraki versiyon: beta teslimatında Faz 10 sonrası güncellenecektir.*
