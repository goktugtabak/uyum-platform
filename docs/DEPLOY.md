# UYUM — Vercel Deploy Runbook

> Faz 11 deploy adımı. Tek seferde uygula, demo öncesi `https://uyum-platform.vercel.app` URL'sini paylaşabilir hâle gel.

---

## 0. Ön Şart Kontrolü

Deploy'a başlamadan önce şu üçü doğru olmalı:

- [ ] `main` branch'i yerel temiz (`git status` → "nothing to commit")
- [ ] `npm run build` lokalde exit 0 (CI yok; lokalde geçen build = Vercel'de de geçer)
- [ ] `vercel.json` repo köküne commit edilmiş (Faz 11 `chore: add vercel.json...` commit'iyle)

Bunlardan biri yoksa, geri dön, düzelt, sonra deploy başlat. Half-broken push = Vercel build kırmızı = demo başlangıcında panik.

---

## 1. İlk Deploy (Bir kez yapılır)

### 1.1. Vercel hesabını GitHub repo ile bağla

1. https://vercel.com/new aç.
2. "Import Git Repository" → `goktugtabak/uyum-platform` seç.
3. **Framework Preset:** Vite (otomatik tanır).
4. **Build Command:** `npm run build` (vercel.json içinden de gelir).
5. **Output Directory:** `dist` (vercel.json içinden gelir).
6. **Root Directory:** `.` (default).
7. **Install Command:** `npm install` (default).

### 1.2. Environment Variables — Production scope

Vercel dashboard → Settings → Environment Variables. Sadece **Production** scope için ekle, Preview'a sızdırma.

| Anahtar | Değer | Zorunlu mu? |
|---|---|---|
| `VITE_N8N_F3_WEBHOOK_URL` | `https://<senin-n8n>.app.n8n.cloud/webhook/f3-rehber` | ✅ Evet — yoksa F3 fallback'e düşer |
| `VITE_N8N_REPORT_ISSUE_WEBHOOK_URL` | (opsiyonel, WF-02 implement edilmediyse boş bırak) | ❌ Hayır |

**Kritik kural:** `VITE_OPENAI_KEY` **Vercel'e eklenmez.** OpenAI çağrısı n8n workflow içinde, key n8n credentials'da. Bundle'a sızarsa güvenlik açığı. (`.env.example` §14 zaten bunu söylüyor.)

### 1.3. Domain

- Vercel default `uyum-platform-<hash>.vercel.app` URL'i atar.
- İsteğe bağlı: Settings → Domains → "Add" ile `uyum-platform.vercel.app` (boşsa) talep et. Demo'da daha temiz görünür.

### 1.4. İlk Deploy

"Deploy" butonuna bas. ~60 saniyede biter. Build log'da `✓ built in <X>s` görürsen yeşil.

---

## 2. Sonraki Deploy'lar (Her commit'te)

Vercel default ayarda her `main` push'unda otomatik production deploy yapar. Feature branch push'u → Preview deploy (kendi URL'iyle).

**Manuel trigger:** Vercel dashboard → Deployments → "Redeploy" ile son commit'i yeniden build et (env var değiştiyse şart).

---

## 3. Deploy Sonrası Smoke Test (~3 dk)

URL açıldıktan **hemen sonra** şunları doğrula:

| # | Test | Beklenen |
|---|---|---|
| 1 | `<URL>/` aç | Onboarding (3 adım) görünür |
| 2 | `<URL>/onboarding` direkt aç (yeni sekme) | 404 değil, onboarding'e düşer (vercel.json rewrite) |
| 3 | `<URL>/map` (profil oluşturduktan sonra) | Leaflet harita Ankara'da yüklendi, 5+ pin var |
| 4 | DevTools → Network → ana sayfa yüklemesi | `index.html` 200, `assets/index-*.js` 200, `assets/index-*.css` 200 |
| 5 | DevTools → Network → `connect-src` | n8n webhook'a hiç istek YOK (PDF/F3 tetiklenmedikçe) |
| 6 | DevTools → Application → LocalStorage | `uyum:profile`, `uyum:a11y` anahtarları onboarding sonrası dolar |
| 7 | F3 İlk Ziyaret Rehberi tetikle | n8n webhook'a POST giriyor (Network tab) **veya** fallback metin geliyor |
| 8 | Mobile (iOS Safari / Android Chrome) URL'i aç | Layout kırık değil, harita scrollable |
| 9 | Slow 3G (DevTools → Throttling) ile `/` aç | İlk paint < 5s, route navigation < 3s |
| 10 | Lighthouse (incognito) | Performance ≥ 80, A11y ≥ 95, Best Practices ≥ 90 |

3+ test fail ederse: deploy'u iptal et, lokal `npm run preview`'da aynı testleri çalıştır, fark nereden geliyorsa düzelt, tekrar deploy.

---

## 4. Rollback (Demo'ya 30 dk kala bir şey patlarsa)

1. Vercel dashboard → Deployments.
2. Son **çalışan** deploy'u bul (yeşil rozet).
3. Üç-nokta menüsü → "Promote to Production".
4. ~10 saniyede aktif olur, kullanıcı görmüyor bile.

Force push veya `git revert` ile uğraşma — Vercel'de hazır revert butonu var.

---

## 5. Sık Karşılaşılan Sorunlar

| Belirti | Sebep | Çözüm |
|---|---|---|
| `/onboarding` direkt açınca 404 | `vercel.json` rewrites yok / yanlış | `vercel.json` repo köküne ekle, redeploy |
| F3 her zaman fallback metni gösteriyor | `VITE_N8N_F3_WEBHOOK_URL` env var Production scope'unda eksik | Vercel Settings → Env Vars → ekle → Redeploy |
| F3 webhook 401 / CORS hatası | n8n workflow Inactive **veya** CORS header yok | n8n dashboard → workflow Active'e al; n8n Respond node'una `Access-Control-Allow-Origin: *` ekle |
| Harita pin'leri çıkmıyor | `public/data/facilities-overpass-cache.json` cache miss | `overpass-loader.ts` `src/data/facilities.json`'a fallback yapıyor — pin'ler hep çıkmalı; çıkmıyorsa console hatasına bak |
| Çok eski cache nedeniyle UI eski hâlde | Browser cache | URL'e `?v=2` ekle veya hard reload (Ctrl+Shift+R) |
| Build "tsc -b" hatası verdi | Local'de görünmeyen TS hatası | Yeni dosya çakışması — `npx tsc --noEmit` local'de tekrar koş, hata olduğu yeri düzelt, yeniden push |

---

## 6. Build Plan §FAZ 11 §3 ile İlişki

Build plan §3 "Production build'i Vercel'e at, Slow 3G simülasyonunda demo akışı bitiyor mu kontrol et" maddesi bu doc'un §1.4 + §3 (test #9) ile bire bir karşılanır.

---

## İlgili Dokümanlar

- [N8N Runbook](N8N-RUNBOOK.md) — webhook warm-up, CORS, failure mode testleri
- [Incident Recovery](INCIDENT-RECOVERY.md) — demo sırasında bir şey çökerse playbook
- [Demo Script](DEMO-SCRIPT.md) — 12 adımlık sunum akışı
- [Build Plan](UYUM-build-plan.md) — Faz 11 ana sözleşmesi
