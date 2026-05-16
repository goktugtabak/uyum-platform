# UYUM — n8n Workflow Runbook

> Demo öncesi n8n hazırlığı. Bu doc, build plan §FAZ 11 §6 "n8n Demo Hazırlığı Checklist"ini tek tek nasıl çalıştırırsın anlatır.

---

## 0. Kapsam

Hackathon MVP'sinde **tek runtime n8n çağrısı** yapılır: **WF-01** F3 İlk Ziyaret Rehberi (`POST /webhook/f3-rehber`).

Diğer 6 workflow ([api-contracts.md](api-contracts.md)'te listeli) **post-MVP roadmap**. Bu runbook sadece WF-01'i kapsar.

---

## 1. n8n Workflow Kurulumu (Hackathon Başında, Bir Kez)

### 1.1. n8n Cloud hesabı

- https://app.n8n.cloud → hackathon kredisiyle açılan hesap (Berkecan'ın e-postası altında).
- Plan: Starter yeterli (5 active workflow + 5 günlük 1000 execution).

### 1.2. WF-01 Workflow node sırası

[api-contracts.md §WF-01](api-contracts.md) bire bir uygulanır. Özet:

1. **Webhook** — `POST /webhook/f3-rehber`, JSON body
2. **Validate Input** — `profile.disabilityType` + `facility.id` zorunlu, eksikse `{ ok:false, error:"VALIDATION_FAIL" }`
3. **Red Flag Check** — Türkçe semptom listesi taraması (n8n function node, [redflag.ts](../src/lib/redflag.ts)'teki liste). Eşleşirse `{ ok:false, error:"RED_FLAG" }`
4. **Build Prompt** — sistem promptu sabit string olarak n8n function node'da
5. **OpenAI** — `gpt-4o-mini`, Türkçe, structured JSON response
6. **JSON Validate / Normalize** — `sections.{arrival, parking, inside, attention, contact}` + `guide` field doğrula
7. **Respond to Webhook** — normalize edilmiş yanıt

### 1.3. CORS

n8n Respond node → "Response Headers" sekmesine:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

(`*` hackathon için kabul; production'da Vercel domain'ine kısıtlanır.)

### 1.4. Webhook URL'i Vercel'e ekle

n8n → workflow → Webhook node → "Production URL"i kopyala (örn. `https://<abc>.app.n8n.cloud/webhook/f3-rehber`).
Vercel → Settings → Environment Variables → `VITE_N8N_F3_WEBHOOK_URL` → bu URL.

[DEPLOY.md §1.2](DEPLOY.md) detayları içerir.

---

## 2. Demo Öncesi Warm-Up Checklist (Saat 14:30, Demo'ya 1.5 saat kala)

Build plan §FAZ 11 §6'daki 9 maddenin operasyonel hâli:

### 2.1. Env var doğrulama
- [ ] Vercel dashboard → Settings → Environment Variables → `VITE_N8N_F3_WEBHOOK_URL` **Production** scope'unda görünüyor
- [ ] Değer `https://`'le başlıyor, `webhook/f3-rehber`'le bitiyor
- [ ] Test scope'una sızmamış (Preview deploy'da n8n çağrısı görünmemeli — fallback metin gelmeli)

### 2.2. n8n workflow status
- [ ] n8n dashboard → workflow header → toggle **Active** (yeşil)
- [ ] "Inactive" olarak duran workflow'lar webhook 404 döner; check.

### 2.3. Cold start warm-up
n8n Free tier ilk çağrıda 3-5 saniye cold start yaşar. Demo öncesi tetikleyip cache'i ısıt:

```bash
curl -X POST "$VITE_N8N_F3_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "disabilityType": "wheelchair",
      "mobilityLevel": "independent",
      "goals": ["social"],
      "city": "Ankara",
      "language": "tr"
    },
    "facility": {
      "id": "warm-up",
      "name": "Test Tesisi",
      "type": "spor salonu",
      "district": "Çankaya",
      "contact": { "phone": "", "address": "" },
      "accessibility": {
        "wheelchair": {},
        "visual": {},
        "hearing": {},
        "upper_limb": {}
      },
      "liveStatus": {}
    }
  }'
```

- [ ] HTTP 200 döndü
- [ ] Body içinde `"ok": true` ve `"guide": "..."` var
- [ ] İkinci aynı çağrı bu sefer < 2 saniyede dönüyor (warm)

### 2.4. CORS gerçek frontend testi
- [ ] Production URL'i (https://uyum-platform.vercel.app/) incognito'da aç
- [ ] Profil oluştur → bir tesise gir → "İlk Ziyaret Rehberi Oluştur"
- [ ] DevTools → Network tab → POST `/webhook/f3-rehber` görünüyor, response 200, body geliyor
- [ ] Console'da CORS hatası **yok**

### 2.5. F3 happy path
- [ ] Yukarıdaki akış sonunda ekranda kişiselleştirilmiş rehber metni var
- [ ] Metin Türkçe
- [ ] Profil bilgisi (engel tipi, hedef) metinde bağlamsal olarak geçiyor (genel "spor salonu için tavsiye" değil, "tekerlekli sandalye kullanıcısı için ramp girişi" tarzı)
- [ ] Disclaimer en altta görünür ("Bu rehber yapay zeka destekli...")
- [ ] "Sesli Oku" + "PDF İndir" butonları çalışıyor

### 2.6. F3 fallback testi (5 dakika)

n8n hatasını simüle et:

1. n8n workflow toggle'ını geçici **Inactive** yap
2. Production URL'inde F3 tetikle
3. **Beklenen:** skeleton 2 saniye → "Rehber hazırlanıyor..." overlay 5 saniye → **fallback metni geldi** (kullanıcı fark etmiyor)
4. n8n workflow'u tekrar **Active**'e al
5. Sayfayı yenile, F3 tekrar tetikle → happy path döndü

- [ ] 4 adımın 4'ü de beklendiği gibi çalıştı

### 2.7. (Opsiyonel) Malformed response testi
n8n Respond node'unu geçici olarak `{ ok: true, guide: undefined }` döndürecek şekilde set et:
- [ ] Frontend "missing guide field" log atıp fallback'e düştü, ekran boş kalmadı

### 2.8. Hiçbir n8n hatasında ekran boş kalmıyor
3 failure mode kuru test:
- [ ] Network kesik (DevTools → Offline) → fallback metin geliyor
- [ ] Timeout (n8n yavaş, 5sn'yi aşar) → fallback metin geliyor
- [ ] 500 response → fallback metin geliyor

### 2.9. OpenAI key güvenlik kontrolü
- [ ] Vercel dashboard → Env Variables → `VITE_OPENAI_KEY` **YOK**
- [ ] Production bundle'da `sk-` ile başlayan string yok:
  ```bash
  curl -s https://uyum-platform.vercel.app/assets/index-*.js | grep -c "sk-" # → 0 olmalı
  ```

---

## 3. Demo Sırasında (Saat 16:00+)

### 3.1. n8n monitoring
n8n dashboard → "Executions" sekmesini açık tut. Demo sırasında her F3 tetiklendiğinde yeni execution satırı görünür. Jüri "bu nasıl çalışıyor" sorarsa burayı gösterebilirsin.

### 3.2. Hata olursa
[INCIDENT-RECOVERY.md §F3](INCIDENT-RECOVERY.md) playbook'unu uygula. Özet: fallback otomatik devreye girer, demo'ya "Backend yedek mekanizması da çalışıyor" diyerek devam et — jüri açısından bug değil, **savunulabilir tasarım**.

---

## 4. n8n Hesap Süresi

Hackathon kredisi 5 günlük. Demo 17 Mayıs sabah, kredi süresi içinde. Sonrasında:
- Kredi bitince workflow Inactive'e düşer → frontend otomatik fallback
- Demo URL'i pitch'te yine açılır, F3 metin gelir (fallback), jüri farkı görmez

---

## İlgili Dokümanlar

- [API Kontratları](api-contracts.md) — WF-01 + WF-02..WF-07 spec
- [Deploy Runbook](DEPLOY.md) — Vercel env var ekleme adımları
- [Incident Recovery](INCIDENT-RECOVERY.md) — demo sırasında hata playbook
- [F3 Service Kod](../src/lib/f3-service.ts) — frontend fallback davranışı (5 sn timeout, 8 failure trigger)
