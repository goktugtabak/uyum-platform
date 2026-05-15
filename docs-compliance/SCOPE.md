# SCOPE.md — Kapsam Koruyucu

> **Amaç:** Bu dosya, "şunu da ekleyelim mi?" sorusunun tek cevap noktasıdır.
> Tartışma çıkarsa: önce buraya bakılır. Burada yazmıyorsa, **yapılmaz**.

---

## 1. Problem Cümlesi

> _Hackathon başladığında / fikir kilitlendiğinde doldurulacak (max 0-2h içinde)._
>
> **Şablon:**
> "**[Kim]**, gün içinde / haftada **[ne problemi]** yaşıyor. Mevcut çözümler **[neden yetersiz]**.
> Biz **[nasıl bir çözüm]** ile bu derde dokunuyoruz, çünkü **[pazarlanabilirlik gerekçesi]**."

**Tek cümle olacak.** Pitch'te jüriye söylenecek olan da bu cümle.

---

## 2. Hedef Kullanıcı (Persona)

> _Hackathon başladığında doldurulacak._

| Alan | Değer |
|---|---|
| Yaş aralığı | _doldurulacak_ |
| Durum / meslek | _doldurulacak_ |
| Spor / sağlık / refah ile ilişkisi | _doldurulacak_ |
| Şu anki davranışı / aracı | _doldurulacak_ |
| Bizim çözümle ne kazanır | _doldurulacak_ |

> **Tek persona.** Çoklu persona = tek hedef yok = scope kaymış demektir.

---

## 3. In Scope (24 saat içinde yapılacak)

| Madde | Kategori | Sahibi | Durum |
|---|---|---|---|
| Onboarding ekranı (1 ekran, hero + CTA) | UI must-have | _isim_ | ⬜ |
| Ana ekran / Dashboard (core feature 1) | UI + interaksiyon | _isim_ | ⬜ |
| İkinci core ekran (core feature 2) | UI + interaksiyon | _isim_ | ⬜ |
| Sonuç / özet ekranı (kullanıcıya geri bildirim) | UI must-have | _isim_ | ⬜ |
| Mock data layer (`data/mock.json`) | Backend mock | _isim_ | ⬜ |
| Tasarım sistemi (renk, font, spacing, buton) | UI temel | _isim_ | ⬜ |
| Pitch slaytları (5-7 slayt) | Sunum | _isim_ | ⬜ |
| Keyword entegrasyonu (geldikten sonra) | Compliance | _isim_ | ⬜ |

> Bu tablonun **dışına çıkılmaz**. Yeni satır eklemek = scope toplantısı (bkz. §8).

---

## 4. Out of Scope (Yapılmayacak)

Aşağıdaki şeyler **bilinçli olarak yapılmıyor**. Birisi "şunu da ekleyelim" derse, bu listeye işaret et:

- ❌ **Auth / login / kayıt akışı** → demo user hardcoded
- ❌ **Gerçek backend / kullanıcı veritabanı** → mock JSON (bkz. §6)
- ❌ **Push notification** / email
- ❌ **Çoklu dil** (TR veya EN, biri yeter — karar §6'da)
- ❌ **Admin paneli**
- ❌ **Analytics / tracking**
- ❌ **Sosyal feature'lar** — paylaşım, takip, yorum, like
- ❌ **Ödeme entegrasyonu** — pricing slide'da gösterilir ama implement edilmez
- ❌ **Test suite** — manuel smoke yeter (bkz. [DISCIPLINE.md](DISCIPLINE.md))
- ❌ **CI/CD pipeline**
- ❌ **Tam responsive** — sadece demo cihazının ekran boyutu (bkz. [DEMO.md](DEMO.md))
- ❌ **Dark mode** — tek tema yeterli
- ❌ **Accessibility audit** (kontrast tutuyorsa ✓, WCAG full değil)
- ❌ **SEO / meta etiketleri**
- ❌ **PWA, offline mode**
- ❌ **Refactor**, kod temizliği, dosya yeniden organizasyon

---

## 5. Stretch Goals (Zaman kalırsa — sıralı)

Bittiyse sırasıyla bunlara bakılır. **Saat 02:00'den sonra yeni feature açılmaz** ([DISCIPLINE.md](DISCIPLINE.md) §5).

1. **Supabase / Firebase ile gerçek backend** — mock JSON → real DB
2. **Bir ekstra "vay" animasyonu** (Framer Motion mikro etkileşim)
3. **Mobil ekran boyutuna uyum**
4. **Demo seed data zenginleştirme** (daha çok kullanıcı, daha çok veri)
5. **Pricing slide** — pazarlanabilirlik anlatımına destek
6. **Domain alma + canlı deploy linki** (Vercel/Netlify)

---

## 6. Backend Stratejisi (Kritik Karar)

| Konu | Karar |
|---|---|
| **Veri katmanı** | `data/mock.json` + React state (lokal) |
| **Persistence** | Yok — sayfa yenilenince state sıfırlanır (demo'da sıfırlanmaz) |
| **API çağrıları** | Mock — `setTimeout` ile fake delay, fake response |
| **Loading state'ler** | ✅ Gerçekmiş gibi göster (skeletonlar, spinner) |
| **Error state'ler** | ✅ Var ama tetiklenmiyor — UI'da hazır dursun |
| **Stretch fallback** | Supabase (en hızlı kurulum — Auth + DB + API hazır) |

### Pitch'te Backend'i Nasıl Anlatırız

> "Mimaride backend katmanı modüler tasarlandı. MVP fazında **mock data ile UX validasyonuna odaklandık** — çünkü hipotezimiz '_kullanıcı bu deneyimi ister mi_' sorusunda yatıyordu. Bir sonraki adım, **mevcut UI'ı [Supabase / Firebase] entegrasyonu ile gerçek veriye bağlamak** — bunun tahminî süresi 1-2 hafta."

**Bu cümleyi ezberle.** Jüri "backend nerde?" diye sorduğunda **panik yok, profesyonel cevap**.

---

## 7. Keyword Entegrasyon Planı

Hackathon sırasında sürpriz keyword(ler) verilecek. **Önceden planlanmış akış:**

### Keyword Geldiğinde (30 dakika içinde)

1. **5 dk** — Keyword'ü ekipçe oku, anlamı / kapsamı tartış
2. **10 dk** — Entegrasyon noktasını seç (aşağıdaki listeden):
   - Ürün ismine ekle / yeniden adlandır
   - Bir feature ismini değiştir
   - Bir ekrandaki kategori / etiket olarak
   - Onboarding copy'sinde organik kullan
   - Yeni bir küçük component / kart
3. **15 dk** — İlk implementation + commit (`feat: keyword <X> entegrasyonu`)

### Kurallar

- ✅ Organik entegrasyon — feature'ın içinde anlamlı duracak
- ✅ Commit history'de net görünmeli (sonradan eklenmiş olduğu kanıtlanabilir)
- ✅ Pitch'te keyword'e ait slide / satır olacak
- ❌ Logoya yapıştır, footer'a sıkıştır, alt yazı ekle — **bunlar yasak**
- ❌ Keyword'ü ürünle alakasız bir yere zorlama — jüri anlar

### Birden Fazla Keyword Gelirse

Hepsini zorla entegre etme. **En anlamlı 1-2 tanesi** core'a girer, diğerleri pitch'te / copy'de mention edilir.

---

## 8. Scope Değişikliği Protokolü

Birisi "şunu da yapsak" dediğinde:

```
1. Bu dosyaya bak.
2. In Scope (§3) içinde mi? → Zaten yapılıyor, yeni karar yok.
3. Out of Scope (§4) içinde mi? → "Hayır, sebebi şu" — kapanır.
4. Stretch (§5) içinde mi? → "Şimdi değil, zaman kalırsa."
5. Hiçbirinde yoksa → 5 dakika ekip tartışması:
   - In Scope'a ekle (sahibi atanır, takvim bozulur mu kontrolü)
   - Stretch'e ekle
   - Out'a ekle (gerekçesiyle)
6. Karar → [DECISIONS.md](DECISIONS.md)'ye 3 satır not.
```

**5 dakikadan uzun süren scope tartışması → otomatik olarak Out of Scope.** ([DISCIPLINE.md](DISCIPLINE.md) §5)

---

*Bu dosya canlı. Hackathon ilerledikçe güncellenir, ama her güncelleme → [DECISIONS.md](DECISIONS.md) kaydı.*
