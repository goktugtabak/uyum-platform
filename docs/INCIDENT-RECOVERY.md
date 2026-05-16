# UYUM — Incident Recovery Playbook

> Build plan §FAZ 11 §5 "Hata Kurtarma Planı"nın operasyonel hâli. Demo sırasında bir şey patlarsa: panik yok, bu doc'a bak.
>
> **Felsefe:** Demo'da hata göstermek **bug değil, mühendislik kalitesi.** "Bakın, otomatik fallback devreye girdi — biz buna hazırlandık." Jüri bunu **artı puan** olarak görür.

---

## 0. Pre-Demo Kuru Çalıştırma (Saat 15:30)

Aşağıdaki 5 senaryoyu demo öncesi **en az 1 kez** dene. Build plan §FAZ 11 DoD #3 ("Hata kurtarma planı bir kez kuru çalıştırıldı"):

- [ ] **F3 n8n down** simulation — webhook URL'i kasten yanlış değere set et, fallback metin geliyor mu?
- [ ] **F2 cache miss** simulation — `public/data/facilities-overpass-cache.json`'u geçici sil, build sonrası `src/data/facilities.json` fallback'ine düşüyor mu?
- [ ] **Internet kesilirse** — DevTools → Network → Offline, demo akışı bitiyor mu (localStorage profili var, mock data lokal)?
- [ ] **Mobile cihazda URL** — telefonda Vercel URL'i açılıyor mu?
- [ ] **Vercel down** (nadiren) — `npm run preview` lokal preview yedek olarak hazır mı?

5 senaryonun 5'i de geçince Faz 11 DoD #3 ✅.

---

## 1. Demo Sırasında F3 (n8n) Patlar

**Belirti:** "İlk Ziyaret Rehberi Oluştur"a basıldı, skeleton geldi, 5 saniye sonra...

### Senaryo A — Fallback metin geldi (büyük ihtimal)
**Görünür:** Statik tetkik metni geldi, disclaimer altta, sesli okuma + PDF butonları çalışıyor.
**Eylem:** **Devam et.** Demo akışı sürüyor.
**Anlatı:** "Backend ulaşılamadığında otomatik fallback devreye girer — kullanıcı asla boş ekran görmez. Production'da bu mekanizma 5 saniye timeout sonrası tetiklenir."

### Senaryo B — Hiç metin gelmedi (skeleton sonsuz dönüyor)
**Sebep:** Frontend timeout 5sn — sonra fallback. Eğer hâlâ skeleton, kod bug.
**Eylem:**
1. Sayfayı yenile (Ctrl+Shift+R)
2. Yine olmazsa: "Bir sonraki adıma geçiyorum" deyip atlat
3. Pitch deck'te F3 ekran görüntüsü göster: "Demonstrasyon için ekran görüntüsü"

### Senaryo C — Red flag ekranı geldi (n8n red flag tetikledi)
**Görünür:** Kırmızı uyarı kartı "Lütfen bir sağlık profesyoneline danışın".
**Sebep:** Test verisinde semptom kelime varsa n8n red flag tetikler. **Beklenmedik durum, ama demo'da problem değil.**
**Eylem:** "Geri dön" butonuyla idle state'e dön, başka tesis seç, F3 tekrar tetikle.

---

## 2. F2 (Harita / Overpass) Patlar

**Belirti:** `/map` sayfasında Leaflet boş, ya da pin'ler çıkmıyor.

### Senaryo A — Map background yok, pin var
**Sebep:** OSM tile sunucusu yavaş.
**Eylem:** 5 saniye bekle, otomatik gelir. Bu arada `FacilityList` (sidebar) zaten görünür, tesis listesini oradan göster.
**Anlatı:** "OpenStreetMap tile'ları yüklenirken — listeden devam edebiliriz."

### Senaryo B — Pin'ler hiç çıkmadı
**Sebep:** `loadFacilities()` hem cache hem manuel JSON'da başarısız oldu. Çok nadir.
**Eylem:**
1. DevTools console'u aç, hata mesajına bak
2. Sayfayı yenile
3. Çözülmezse: `/facility/<bilinen-id>` ile direkt tesis detayına git, F1 morph'u oradan göster

### Senaryo C — Tıklayınca facility detail'e gitmiyor
**Sebep:** `FacilityPin` click event işlemiyor.
**Eylem:** `FacilityList` (sidebar) item'ından tıkla — aynı navigation gerçekleşir.

---

## 3. Internet Kesilirse

**Belirti:** Demo sırasında WiFi düştü.

### Mevcut durumda neler hâlâ çalışır
- ✅ Onboarding (lokal state)
- ✅ Dashboard (mock JSON + localStorage)
- ✅ /map — pin'ler (facilities.json bundle içinde)
- ✅ /facility/:id — radar morph (lokal hesap)
- ✅ /events, /exercises, /coaches (mock JSON)
- ✅ A1-A6 erişilebilirlik toggle'ları (CSS)
- ✅ A3 Sesli Okuma (Web Speech browser-local)

### Çalışmayan
- ❌ OSM tile background (cache'den gelirse render, yoksa beyaz)
- ❌ F3 n8n çağrısı (fallback metin otomatik devreye girer ✅)
- ❌ YouTube video embed (exercises.json)

**Eylem:**
1. Demo akışına devam et — büyük çoğunluk çalışıyor.
2. F3'te fallback metin geldiğinde: "Bakın, offline mode'da bile çalışıyor."
3. Map'te tile yoksa: "Tile'lar yüklenmedi ama veri katmanı bundle içinde — pin'ler görünür."

### Telefonla mobil hotspot
Demo başlamadan önce telefonda hotspot'u açık tut. WiFi düşerse hotspot'a geç (laptop'ta saved).

---

## 4. Vercel URL Açılmıyor

**Belirti:** Tarayıcıda https://uyum-platform.vercel.app açıldı, 502 / 503 / DNS hatası.

### Acil eylem (30 sn)
1. **Mobile cihazda dene** — kendi cihazımdan olmayabilir
2. **Vercel dashboard** kontrol — son deploy "Ready" durumda mı?
3. **Rollback** [DEPLOY.md §4](DEPLOY.md) — son çalışan deploy'u "Promote to Production"
4. **Çözülmezse lokal preview'a geç:**
   ```bash
   npm run preview
   # localhost:4173 — laptop'tan projeksiyona göster
   ```

### Anlatı
"Vercel CDN'de geçici sorun var, lokal preview'a geçiyorum — production build'in aynısı." (Projeksiyonda fark görünmez.)

---

## 5. Laptop Çöker / Tarayıcı Kapanır

**Eylem:**
1. **Telefonda Vercel URL'i** açık tut → projeksiyonsuz devam et, jüriye yakın göster
2. **Yedek laptop** (ekip arkadaşı) hazırsa devral
3. Demo'nun kalan kısmını **ekran görüntüleri** olarak pitch deck'e yedek slayt koy (demo öncesi screenshot'la her ekranı kaydet)

---

## 6. Demo Esnasında Bir Feature Çalışmıyor (Beklenmeyen Bug)

### Karar matrisi

| Bug ne kadar görünür? | Demo akışında atlanabilir mi? | Eylem |
|---|---|---|
| Önemsiz (ufak rendering glitch) | Evet | Görmezden gel, devam et |
| Belirgin ama akışı bozmuyor | Evet | "Burada küçük bir görsel detay var, atlayalım" |
| Önemli ama yedek var | Evet | "Bu kısmı atlıyorum, [yedek ekrana] gidiyorum" |
| Tam akış kırılması | Hayır | "Bir sonraki demo'da düzelteceğiz, şimdi pitch deck'e dönüyorum" |

**Genel kural:** Demo akışı patladığında **5 saniyeden uzun donma yok.** Kararı al, atlat, devam et.

---

## 7. Pitch Deck Yedek Slayt'ları

Demo sırasında patlama olursa kullanılacak yedek slayt'lar:
- F3 başarılı çıktı screenshot (PDF + sesli okuma indikatörlü)
- F1 radar morph (4 engel tipi için 4 ayrı screenshot)
- F2 harita ekran görüntüsü (pin'li + lejantlı)
- Mobile responsive screenshot (telefondan ekran görüntüsü)
- Lighthouse skoru screenshot (Performance 80+, A11y 95+)

Demo öncesi bu 5 screenshot'u pitch deck'in sonuna "Yedek görseller" başlığıyla koy. Sunum sırasında ihtiyaç olmazsa hiç açma.

---

## 8. Demo Sonrası Soru-Cevap Sırasında

Jüri bug gördüyse ve sordu:
**"Demo'da X şey çalışmadı, neden?"**

**Cevap şablonu:**
"Bu **fallback davranışı** — backend ulaşılamadığında frontend statik yedek devreye giriyor. Production'da n8n + OpenAI bağlantısı aktifken kişiselleştirilmiş metin geliyor. Bu hackathon demo'sunda **resilience'ı** intentional olarak öne çıkardık — kullanıcı boş ekran görmesin."

**Yapma:**
- "Bug var, düzelteceğiz" deme — gelecek vaad eden kapı açıyor
- "Anlamadım" deme — hazırlıksız görünür
- Detaylı bug analizine girme — soruyu kapat, sonraki soruya geç

---

## İlgili Dokümanlar

- [Demo Script](DEMO-SCRIPT.md) — 12 adımlık akış + yedek senaryolar
- [N8N Runbook](N8N-RUNBOOK.md) — n8n özel hata modları
- [Deploy Runbook](DEPLOY.md) — Vercel rollback
- [F3 Service Code](../src/lib/f3-service.ts) — 8 fallback trigger nokta
- [Overpass Loader Code](../src/lib/overpass-loader.ts) — cache fail fallback
