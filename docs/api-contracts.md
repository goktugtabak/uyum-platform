# UYUM — n8n API Kontratları

> **Standart:** Tüm n8n webhook'ları JSON gönderir ve JSON döner.
> Üretim base URL: `${VITE_N8N_F3_WEBHOOK_URL}` (veya WF-02 için `${VITE_N8N_REPORT_ISSUE_WEBHOOK_URL}`).
> Frontend timeout: **5 saniye**.

---

## WF-01 — `POST /webhook/f3-rehber` (P1, ZORUNLU)

F3 İlk Ziyaret Rehberi üretimi. Tek runtime n8n workflow'u.

### n8n Node Sırası

1. **Webhook node** — POST kabulü, JSON parse.
2. **Validate Input node** — `profile` ve `facility` alanlarının varlığını doğrula. Eksikse `{ ok:false, error:"VALIDATION_FAIL" }` döndür.
3. **Red Flag Check node** — Profil ve facility metin alanlarında Türkçe red flag listesi taraması. Eşleşme varsa OpenAI'a gitmeden `{ ok:false, error:"RED_FLAG" }` döndür.
4. **Build Prompt node** — Sistem + user prompt'unu profile + facility JSON'undan kur. Sabit JSON kısıtı promptu içine girer:
   > "Yalnızca sağlanan JSON'da bulunan alanları kullan. JSON'da olmayan hiçbir fiziksel detayı çıkarsama, üretme veya ima etme. Bilgi yoksa o alanı tamamen atla."
5. **OpenAI node** — Model `gpt-4o-mini`, Türkçe çıktı, structured JSON response tercih edilir. Sistem promptuna disclaimer cümlesinin sonuçta zorunlu olduğu yazılır.
6. **JSON Validate / Normalize node** — OpenAI çıktısını parse et, `sections.{arrival,parking,inside,attention,contact}` ve `guide` alanlarını doğrula. Bozuksa `{ ok:false, error:"MALFORMED_RESPONSE" }`.
7. **Respond to Webhook node** — Normalize edilmiş yanıtı frontend'e gönder.

### Request

```json
{
  "profile": {
    "disabilityType": "wheelchair | visual | hearing | upper_limb",
    "mobilityLevel": "sitting | supported | independent | upper_limb_limited",
    "goals": ["strength | flexibility | social | compete | wellbeing"],
    "city": "Ankara",
    "language": "tr"
  },
  "facility": {
    "id": "string",
    "name": "string",
    "type": "string",
    "district": "string",
    "contact": {
      "phone": "string",
      "address": "string"
    },
    "accessibility": {
      "wheelchair": {},
      "visual": {},
      "hearing": {},
      "upper_limb": {}
    },
    "liveStatus": {}
  }
}
```

### Response — Success (HTTP 200)

```json
{
  "ok": true,
  "source": "n8n-openai",
  "sections": {
    "arrival": "string",
    "parking": "string",
    "inside": "string",
    "attention": "string",
    "contact": "string"
  },
  "guide": "string",
  "warningAppended": true,
  "disclaimer": "Tesis koşullarını doğrulayamayız — ziyaretten önce tesisi arayın."
}
```

### Response — Error / Fallback Trigger

```json
{
  "ok": false,
  "error": "TIMEOUT | OPENAI_FAIL | VALIDATION_FAIL | RED_FLAG | MALFORMED_RESPONSE"
}
```

### Frontend Sözleşmesi

- Timeout: 5 saniye (`AbortController`).
- `ok !== true` olan **her** yanıt → `f3-fallback.ts` çağrılır.
- Aşağıdaki durumlar da fallback'i tetikler:
  - Network error / fetch reject
  - CORS hatası
  - HTTP 4xx / 5xx
  - Response gövdesi JSON parse edilemiyorsa
  - `sections` veya `guide` eksikse
  - `VITE_N8N_F3_WEBHOOK_URL` env değişkeni tanımlı değilse
- Kullanıcıya görünür hata mesajı yok. `console.warn(error)` yeterli.

### İlgili Frontend Dosyaları

- `src/lib/f3-service.ts` — n8n çağrısı + 5s timeout + fallback decision
- `src/lib/f3-fallback.ts` — Profil + facility'den statik şablon
- `src/lib/redflag.ts` — Türkçe red flag listesi + `containsRedFlag()`
- `src/lib/mocks/f3-mock-response.json` — Yerel geliştirme örnek yanıt

---

## WF-02 — `POST /webhook/report-issue` (P2, OPSİYONEL)

Anonim sorun / topluluk geri bildirimi. P1 stabil olduktan sonra (Faz 6 sonunda) eklenir. F4 tanıklık akışını bloklamaz.

### Request

```json
{
  "facilityId": "string",
  "issueType": "ramp | elevator | lift | changing | staff | communication | other",
  "message": "string",
  "disabilityType": "wheelchair | visual | hearing | upper_limb",
  "anonymous": true,
  "createdAt": "ISO 8601 string"
}
```

### Gizlilik Kuralları (Sert)

WF-02'ye **asla gönderilmez**:

- Ad, soyad, kullanıcı adı, displayName
- E-posta, telefon
- Kesin GPS konumu / IP / cihaz ID
- Kişisel tanımlayıcı hiçbir veri

### Davranış

- Webhook fire-and-forget; frontend yanıtı beklemez (ya da kısa timeout).
- Webhook fail / 4xx / 5xx / timeout → kullanıcıya yine **lokal başarı** görüntüsü verilir; sorun yerelde `uyum:testimonies` altına kaydedildi.
- n8n destination'ı (Google Sheets / Airtable / Discord / e-posta) MVP demosu için gerekli **değil**. Demo WF-02 olmasa da çalışır.

### İlgili Frontend Dosyaları (eklenirse)

- `src/components/feature/Testimonies.tsx` içinde fire-and-forget POST
- `src/lib/report-issue.ts` (opsiyonel) — POST + sessiz fallback

---

## Roadmap — Hackathon MVP'de Yapılmaz

- WF-03 Etkinlik veri pipeline'ı
- WF-04 Koç veri pipeline'ı
- WF-05 Koç yardım talebi
- WF-06 Overpass cache yenileme workflow'u
- WF-07 Egzersiz içerik küratörlüğü workflow'u

Bu workflow'lar pitch deck "Yol Haritası" bölümünde sunulur; P1 ve polish fazları tamamlanıp ekstra zaman kalmadıkça yazılmaz.
