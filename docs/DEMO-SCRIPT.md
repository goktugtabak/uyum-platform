# UYUM — Demo Script (Sunum Akışı)

> Build plan §FAZ 11 §1'in operasyonel hâli. 12 adımlık akış, hangi ekranda ne diyeceğin, ne tıklayacağın, ne aramayan jüri için ne göstereceğin.
>
> **Hedef süre:** 4-5 dakika. Jüri demo + 2-3 dakika soru-cevap.

---

## 0. Demo Öncesi (Saat 15:55, 5 dk kala)

- [ ] Vercel URL incognito'da açık duruyor (cache yok, profilden başlar)
- [ ] n8n workflow **Active**, warm-up çağrısı atılmış ([N8N-RUNBOOK.md §2.3](N8N-RUNBOOK.md))
- [ ] Laptop ekranı projeksiyona bağlı, 1920x1080 veya en azından 1440x900
- [ ] Sesi açık (A3 sesli okuma demonstrasyonu için)
- [ ] DevTools kapalı (jüri sorarsa açarsın, başlangıçta kapalı temiz)
- [ ] Backup: telefonda da aynı URL açık (laptop çökerse mobile demo)
- [ ] Pitch deck son slayt'tan demo'ya geçilecek hazırlık

---

## 1. Senaryo: "Ali, 32 yaşında, tekerlekli sandalye kullanıcısı, Ankara'da yaşıyor"

Jüriye 1 cümlelik problem statement:
> "Bugün size Ali'nin hikayesini göstermek istiyorum. Ali tekerlekli sandalye kullanan, Ankara'da yeni taşınmış bir birey ve mahallesinde adaptif spora başlamak istiyor. Ama hangi tesise gidebilir? Rampa var mı? Tuvalet uygun mu? Kimseyi tanımıyor, kimseye soramıyor. Bu sorun bizim çözmek istediğimiz şey — UYUM."

---

## 2. 12-Adımlık Demo Akışı

### Adım 1 — Boş tarayıcı (10 sn)
**Eylem:** Vercel URL'i incognito'da aç.
**Görünür:** Onboarding Adım 1 — "Engel tipiniz nedir?"
**Anlatı:** "İlk açıldığında UYUM bir profil sorar. Hiç hesap yok, kayıt yok — sadece üç soru."

### Adım 2 — Profil oluştur (30 sn)
**Eylem:**
1. **Tekerlekli Sandalye** kartına tıkla → "Devam"
2. **Bağımsız** → "Devam"
3. **Sosyal** → "Profili Oluştur"

**Görünür:** Dashboard yüklendi (~1 sn route transition fade)
**Anlatı:** "Engel tipi, hareket durumu, hedef. Ali bağımsız hareket edebiliyor, sosyal motivasyonla geliyor. Hedef burada önemli — bu seçim sonraki tüm önerileri etkileyecek."

### Adım 3 — Dashboard "Sana Yakında" + "Topluluktan" (20 sn)
**Eylem:** Dashboard'da scroll et, üç bölümü göster:
- "Sana Yakında" — 3 tesis kartı (profile göre puanlanmış)
- "Topluluktan" — tanıklık feed + yakın etkinlik kartı
- "Keşfet" — egzersiz / etkinlik / koç grid'i

**Anlatı:** "Profil oluşturuldu — Dashboard Ali'nin profiline göre 3 tesis önerdi. Topluluktan diğer tekerlekli sandalye kullanıcılarının tanıklıkları var. Buradaki rozetleri görüyor musunuz? 'DEMO VERİSİ' — hackathon kapsamında veri mock; biz bunu jüriye dürüst gösterelim diye işaretledik."

### Adım 4 — AccessibilityToolbar A1 Renk Körlüğü (15 sn)
**Eylem:** Header'daki "Renk Körlüğü" dropdown'dan **Deuteranopia** seç.
**Görünür:** Tüm sayfa anında deuteranopia simulation filter'la render edildi (yeşil-kırmızı algısı azaldı).
**Anlatı:** "UYUM erişilebilirlik panelinde 3 renk körlüğü simulationu var. Demonstrasyon için — gerçek kullanıcı kendi durumunu seçer."

### Adım 5 — A2 Yüksek Kontrast (10 sn)
**Eylem:** "Yüksek Kontrast" toggle'ını **Açık**. Sonra tekrar **Kapalı** (geri al).
**Görünür:** Tüm UI siyah-beyaz benzeri yüksek kontrastla render edildi, sonra normale döndü.
**Anlatı:** "Düşük görme veya kontrast hassasiyeti olan kullanıcı için. Anlık toggle, sayfa yenilenmiyor."

### Adım 6 — F5 "Sana Uygun Sporlar" (30 sn)
**Eylem:** Top menü'den **"Sana Uygun Sporlar"** veya Keşfet grid'inden git. URL: `/match`
**Görünür:** 3 spor kartı — "Sana en uygun #1", "Güçlü aday #2", "Denemeye değer #3". Her birinde gerekçe paragrafı + "Tesisleri gör" / "Koç bul" linkleri.
**Anlatı:** "F5 — Ali'nin profiline göre kural tabanlı bir algoritma 3 spor önerdi. Tekerlekli sandalye + sosyal + bağımsız üçlüsü için: Tekerlekli basketbol, oturarak voleybol, masa tenisi. Bu önerilerin altındaki gerekçe metni profilden geliyor — LLM değil, deterministik."

### Adım 7 — F2 Tesis Haritası (20 sn)
**Eylem:** İlk spor kartından "Tesisleri gör" tıkla. URL: `/map?sport=basketball-wc`
**Görünür:** Ankara haritası, 5+ pin. Her pin: renkli kenar (yeşil/sarı/kırmızı/gri) + glyph (✓ ~ ✕ ?) + spor ikonu. Sağ üstte filtre bar.
**Anlatı:** "Ankara haritası. Pin'lerin rengi Ali'nin profili için erişilebilirlik durumunu gösteriyor — yeşil iyi, sarı kısmi, kırmızı engelli. Rengin yanında glyph var (renk körlüğü için), ikon var (spor için), aria-label var (ekran okuyucu için). Tek bilgi tek kanaldan değil — üçlü kodlama."

### Adım 8 — F1 Tesis Detay + Radar Morph (40 sn)
**Eylem:** Yeşil pin'e tıkla (örn. **Çankaya Engelsiz Spor Salonu**). URL: `/facility/<id>`
**Görünür:** Üstte tesis adı + spor ikonları + engel tipi seçici. Altında radar grafik (6 boyut: rampa, asansör, tuvalet, otopark, görsel, işitsel).
**Eylem:** Sağ üstteki **"Engel tipi"** dropdown'ından **Görme**'ye değiştir.
**Görünür:** Radar 1 saniyede morph etti — farklı boyutlar dolup boşaldı.
**Anlatı:** "F1 — Erişilebilirlik Parmak İzi. 6 boyut: rampa, asansör, tuvalet, otopark, görsel rehberlik, işitsel rehberlik. Engel tipini değiştirdiğimde radar morph ediyor — aynı tesis görme engelli bir kullanıcı için farklı bir profil çıkarıyor. Altında her boyutun durumu ✅/⚠️/❌/❓ ikonlarıyla yazılı."

### Adım 9 — F4 Tanıklık Ekleme (30 sn)
**Eylem:** Aşağı scroll et "Topluluk Tanıklıkları" bölümüne. "Tanıklık paylaş" / yeni tanıklık formuna gir.
- Metin: "Rampa güzel, tuvaletteki destek barı dar"
- "Anonim paylaş" seç
- Engel tipi: Tekerlekli Sandalye
- Submit

**Görünür:** Liste anlık güncellendi, yeni tanıklık en üstte.
**Anlatı:** "Tanıklık paylaşımı — F4. Anonim seçeneği var çünkü engelli bireyler için kimlik açığa çıkması bir engel. LocalStorage'a yazılıyor — bu hackathon için yeterli; production'da Supabase'e geçeriz."

### Adım 10 — F3 İlk Ziyaret Rehberi + A3 Sesli Okuma + PDF (60 sn)
**Eylem:** "İlk Ziyaret Rehberi" bölümünde **"İlk Ziyaret Rehberi Oluştur"** butonuna bas.
**Görünür:** 2 saniye skeleton, sonra metin geldi — Türkçe, 4-5 paragraf, profile özel.
**Eylem:** "Sesli Oku" butonuna bas.
**Görünür:** Browser Türkçe TTS ile metni okuyor.
**Eylem:** Birkaç saniye dinlet, sonra **"PDF İndir"** butonuna bas.
**Görünür:** PDF dosyası iner.
**Anlatı:** "F3 — bu kişiselleştirilmiş ziyaret rehberi. Ali'nin profili + tesisin erişilebilirlik verisi n8n workflow'una gönderiliyor, n8n OpenAI'a sistem promptuyla çağırıyor, çıktıyı JSON kuralıyla normalize edip geri gönderiyor. JSON kuralı: yalnız sağlanan verideki alanları kullan, hayal etme. Disclaimer her zaman en altta. Sesli okuma Türkçe Web Speech API. PDF'i Ali yanına aldığı için yanında getirebileceği bir not. Bu adımdaki her şey demo'da çalışıyor ama internet kesilse fallback metin otomatik devreye giriyor — kullanıcı fark etmez."

### Adım 11 — Dashboard'a dön → F7 Etkinlikler (20 sn)
**Eylem:** Header'dan **UYUM** logosuna tıkla → Dashboard. Keşfet grid'den **Etkinlikler**'e git. URL: `/events`
**Görünür:** 5-8 etkinlik kartı. Profile uygun olanlar listenin başında.
**Eylem:** Bir etkinliğin "Tesise git" linkini göster (tıklama opsiyonel).
**Anlatı:** "F7 — Etkinlik listesi. Tekerlekli basketbol turnuvası, oturarak voleybol etkinliği, vs. Tarih + spor + engel tipi filtresi var. Her etkinlik bir tesise bağlı — tıkladığında detay sayfasına gider."

### Adım 12 — Kapanış: Mobile + Roadmap (20 sn)
**Eylem:** Telefonu kaldır, aynı URL'i göster.
**Görünür:** Mobile responsive layout, harita yine çalışıyor.
**Anlatı:** "Aynı URL mobile'da da çalışıyor. Hackathon MVP'sinin kapsamı bu kadar. Pitch deck'te göreceksiniz: fizyoterapist onay katmanı, gerçek-zamanlı operatör bildirim döngüsü, çoklu şehir, federasyon API'ı — bunların hepsi yol haritasında. Bugün size **çalışan bir prototip** gösterdik."

---

## 3. 3-Pass Rehearsal (Build Plan §FAZ 11 §2)

Demo öncesi senaryoyu **3 kez peş peşe** çalıştır. Her geçişte tek bir hata bulup düzelt, sonraki geçişte yine başla. **3. geçiş kesintisiz olmalı.**

| Pass # | Sonuç (✅/❌) | Bulunan sorun + Düzeltme |
|---|---|---|
| 1 | _ | _ |
| 2 | _ | _ |
| 3 | _ | _ |

3. pass'da **hiçbir** sorun çıkmayana kadar pass sayısını artırma. Bir feature sürekli patlıyorsa: scope'tan çıkar, [INCIDENT-RECOVERY.md](INCIDENT-RECOVERY.md)'den backup ekrana yönlen.

---

## 4. Yedek Senaryolar (Bir Şey Patlarsa)

| Patlayan | Backup ne göster | Kullanılacak ekran |
|---|---|---|
| F3 n8n down | "Otomatik fallback aktif" de, statik metin geliyor zaten | `/facility/:id` |
| F2 harita yüklenmiyor | "Aşağıdaki liste de Ankara tesislerini gösteriyor" | `FacilityList` (sidebar) |
| Internet kopuk | "Lokal cache'den devam ediyoruz" | localhost preview varsa oraya geç |
| Demo URL açılmıyor | Mobile cihazdan aynı URL'i göster | Telefon yedek |
| Vercel down (nadiren) | "Şu anda lokal preview'a geçiyorum" | `npm run preview` lokal |

Tam playbook [INCIDENT-RECOVERY.md](INCIDENT-RECOVERY.md)'de.

---

## 5. Soru-Cevap Hazırlığı

Olası jüri soruları + 1-cümle cevap:

**Q1: "Backend gerçek mi?"**
"MVP'de mock JSON + localStorage. Pitch deck'teki yol haritasında Supabase'e geçiş var. Bunu jüriye gizlemiyoruz — DEMO VERİSİ rozetleri her yerde."

**Q2: "AI kullandınız mı?"**
"Evet. F3 İlk Ziyaret Rehberi için n8n + OpenAI workflow'u, kodlama sürecinde Claude Code. İkisi de pitch'te belirtildi — şeffaf kullanım."

**Q3: "Engelli kullanıcılarla görüşme yaptınız mı?"**
"Spor Federasyonu erişebildiğimiz kaynaklarla brief'ledik. Production'a geçiş öncesi co-design oturumları planlandı."

**Q4: "Veri güvenliği?"**
"MVP'de auth yok, veri tarayıcıda kalıyor. n8n'e tek gönderilen profil + tesis bilgisi — ad, e-posta, konum **kesin değer** olarak gönderilmiyor (`docs/UYUM-platform-final.md` §13 'Do Not Do' listesi)."

**Q5: "Kapsam Ankara, neden?"**
"24 saatte tek şehir, tek persona kalitesini koruyabildiğimiz scope. Çoklu şehir teknik olarak `src/data/facilities.json` genişletme; pitch deck'teki yol haritasında İstanbul + İzmir + Bursa var."

---

## 6. Demo Sonrası Saat 16:00 — Kod Freeze

[COMMITS.md §5](../docs-compliance/COMMITS.md) "Acil Durum Kuralı" — demo'ya 2 saat kala main üstünde freeze. Saat 14:00'ten itibaren sadece demo-bozan bug fix kabul. Saat 16:00 sonrası **kod commit yasak** — sadece pitch metni, hata kurtarma planı tekrarı.

---

## İlgili Dokümanlar

- [Deploy Runbook](DEPLOY.md) — Vercel deploy + smoke test
- [N8N Runbook](N8N-RUNBOOK.md) — webhook warm-up + failure mode testleri
- [Incident Recovery](INCIDENT-RECOVERY.md) — demo sırasında patlama playbook
- [Build Plan §FAZ 11](UYUM-build-plan.md) — orijinal Faz 11 sözleşmesi
- [Platform Final §11 Demo Checklist](UYUM-platform-final.md) — ana checklist
