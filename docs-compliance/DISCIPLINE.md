# DISCIPLINE.md — Çalışma Disiplini ve Karar Felsefesi

> **Bu dosya 24 saat boyunca tartışmamak için var.** Karar verirken durup düşünme — buraya bak, uygula.
> Bir şey bu dosyaya aykırıysa: ya dosya yanlış (güncelle), ya karar yanlış (vazgeç). Üçüncü seçenek yok.

---

## 1. Kuzey Yıldızı (North Star)

> **Pazarlanabilir bir spor/sağlık/refah problemine, jürinin canlı görebileceği UX-first bir çözüm sunmak.**

Her karar bu cümleye hizmet etmek zorunda. "Bu şu cümleye yarıyor mu?" — cevap "hayır" veya "belki" ise yapılmaz.

---

## 2. Önceliklendirme Hiyerarşisi

Çakışan iki şey varsa **üstteki kazanır**. Tartışma yok.

1. **Çalışan demo akışı (golden path)** — jürinin önünde patlamayan tek senaryo
2. **UX/UI parlaklığı** — jürinin gözünde "vay" anı
3. **Problem–çözüm netliği** — pazarlanabilirlik anlatımı, gerçek bir derde dokunuyor olmak
4. **Keyword entegrasyonu** — zorunlu, görmezden gelinemez (bkz. [COMPLIANCE.md](COMPLIANCE.md))
5. **Backend gerçekliği** — varsa bonus, yoksa mock; zaman kalırsa eklenir
6. **Kod kalitesi / refactor** — hackathon sonrası dert, şimdi değil

---

## 3. Yapmayız Listesi (Hard Stops)

Aşağıdakileri yapmak **zaman çalmak** demektir. Yapan kişiyi durdurun.

- **Yeni framework / library öğrenmeyiz** — bildiğimizle gideriz
- **Auth / login yapmayız** — demo user hardcoded
- **Database migration zinciri kurmayız** — JSON dosyası veya in-memory yeter
- **Test yazmayız** — golden path için manuel smoke yeterli
- **Tam responsive yapmayız** — demo cihazının ekran boyutunda çalışsın, yeter
- **"Şuna da bakayım" yok** — açık olan task'ın scope dışına bakmak yasak
- **Refactor yapmayız** — çalışan kod = doğru kod
- **Kendi backend'imizi sıfırdan yazmayız** — hazır servis (Supabase / Firebase / mock JSON) kullanırız
- **Pixel-perfect mockup peşine düşmeyiz** — Figma'da 30 dakikadan fazla geçen kişi durdurulur

---

## 4. Zaman Kapıları (Time Boxes)

24 saatlik şablon. Her kapının sonunda **5 dakikalık check-in** — "bu kapıyı bitirdik mi, ne kaldı?"

| Saat aralığı | Faz | Çıktı |
|---|---|---|
| **0 – 2h** | Fikir kilitleme | [SCOPE.md](SCOPE.md) yazılı, low-fi sketch hazır, herkes aynı şeyi anlatıyor |
| **2 – 6h** | UI iskelet + tasarım sistemi | Renk paleti, font, grid, ana ekran statik haliyle gözüküyor |
| **6 – 12h** | Core Feature 1 | Fake data ile baştan sona tıklanabilir |
| **12 – 16h** | Core Feature 2 + keyword | İkinci özellik + verilen keyword entegre edilmiş |
| **16 – 20h** | Polish + iç test | Mikro animasyonlar, boş state'ler, ekip içi 3 kişiyle deneme |
| **20 – 22h** | Demo provası | [DEMO.md](DEMO.md) akışı 3 kez baştan sona, [RISKS.md](RISKS.md) fallback'leri denenmiş |
| **22 – 24h** | Pitch + son rötuş | Slaytlar, sunum metni, varsa kısa uyku |

> **Kural:** Bir kapıyı kaçırdıysak, **bir sonrakini kısaltırız, scope'u küçültürüz**. Faz uzatmayız.

---

## 5. Karar Hızlandırıcı Kurallar

- **5 Dakika Kuralı:** 5 dakikadan uzun tartışılan kararda **daha basit olan** kazanır.
- **İki Seçenek Kuralı:** Üç seçenek arasında kalındıysa, ilk ikisini sırala, üçüncüyü at.
- **"Şimdi mi sonra mı?" Kuralı:** Sonra yapılabilir bir şey **şimdi yapılmaz**. Stretch goal'a eklenir.
- **Yorgun Beyin Kuralı:** Saat 02:00'den sonra **yeni özellik eklenmez**, sadece var olan polish edilir.

---

## 6. AI / Claude Code Kullanımı

| Kullanım | İzin |
|---|---|
| Boilerplate, UI iskeleti, mock data | ✅ Serbest |
| Component tasarımı, styling | ✅ Serbest |
| Bug fix, hata mesajı yorumlama | ✅ Serbest |
| Mimari kararlar (state management, routing yapısı) | ⚠️ İnsan onayı |
| Commit mesajları | ⚠️ İnsan en azından okur ([COMMITS.md](COMMITS.md)) |
| Demo akışı, pitch metni | ⚠️ İnsan yazar, AI sadece düzenler |

> Hackathon kuralları AI kullanımına dair beyan istiyorsa [COMPLIANCE.md](COMPLIANCE.md) içine eklenir.

---

## 7. Sürtüşme Sinyalleri

Aşağıdakilerden biri olursa **dur, bu dosyaya bak**:

- İki kişi 10 dakikadır aynı şeyi tartışıyor → 5 Dakika Kuralı'na geri dön
- "Acaba şunu da yapsak mı?" → Yapmayız Listesi'ne bak, yoksa stretch goal
- "Bu kısmı düzgün yazalım" → Kod kalitesi #6, demo akışı #1
- Bir kişi başlığa yazmadığımız bir şey üstünde çalışıyor → [SCOPE.md](SCOPE.md) kontrolü

---

*Bu dosya değişebilir ama değişiklik bir karardır → [DECISIONS.md](DECISIONS.md)'ye 3 satır not düş.*
