# COMMITS.md — Commit, Branch ve Merge Disiplini

> **Amaç:** 24 saat içinde 2-4 kişi aynı repo üzerinde çalışacak. Kayıp kod, çakışma ve "kimin commit'i bu" karmaşası **yok**.
> Kural basit: küçük commit, sık push, main her zaman çalışır.

---

## 1. Branching Stratejisi

Üç tür branch var. Daha fazlasına ihtiyacımız yok.

| Branch | Amaç | Kural |
|---|---|---|
| `main` | Her zaman demo-çalışır halde | Bozuk kod buraya **inmez**. Force push **yasak**. |
| `feature/<isim>` | Yeni özellik / ekran | Maksimum 4-6 saatte main'e dönecek, sonra silinecek |
| `wip/<isim>` | Deneme, spike, "şunu bir göreyim" | Asla merge edilmez, gerekirse cherry-pick |

> **Long-lived feature branch yasak.** 6 saatten uzun açık duran branch = scope yanlış kesilmiş demek.

**Branch ismi formatı:** `feature/<kişi>-<kısa-iş>` — örn: `feature/tuna-dashboard-grid`

---

## 2. Commit Mesajı Formatı

Conventional Commits'in hafif versiyonu. Tip + kısa açıklama. **İngilizce.**

```
<tip>: <50 karakter altı kısa açıklama>

[opsiyonel body — neden, ne için. İngilizce.]
```

### Tipler

| Tip | Ne için |
|---|---|
| `feat:` | Yeni özellik (kullanıcının gördüğü bir şey) |
| `fix:` | Bug |
| `ui:` | Görsel / styling (feat'ten ayrı çünkü çok olacak) |
| `chore:` | Config, paket kurulumu, dosya taşıma |
| `docs:` | Markdown dosyaları, README, bu klasörün içeriği |
| `wip:` | Ara commit, gün sonu kurtarma (sonra squash edilir) |

### Örnekler

İyi:
```
feat: dashboard main card grid
fix: workout timer reset bug
ui: primary button hover state
chore: install framer-motion
```

Kötü:
```
update                          ← ne yaptın?
fixed stuff                     ← neyi?
WIP                             ← tip yok, açıklama yok
asdasdasd                       ← kovulursun
massive refactor of everything  ← 1 commit ≠ 5 saat iş
```

---

## 3. Atomik Commit Kuralı

**Bir commit = bir mantıksal değişiklik.**

- En az **30 dakikada bir commit + push**. Yorgun beyinde unutuluyor → alarm kurun.
- 1 saatten uzun süre commit etmeden çalışmak = kod kaybetme riski.
- 500+ satırlık tek commit görülürse: o branch'i çıkaran kişi commit'i bölmek zorunda (`git reset --soft HEAD~1` + parça parça add).

---

## 4. Merge Akışı

Hackathon'da formal PR review yok ama hafif bir kapı var:

1. Feature branch işi biter → `git push`
2. **Bir başka kişi 60 saniye bakar:** "Demo bozulur mu? Build geçer mi?"
3. ✅ ise → **Squash merge** ile main'e (log temiz kalır)
4. Branch silinir (lokal ve remote)

### Conflict Olursa

- Branch'i çıkaran kişi çözer.
- `main` üzerine **asla** `--force` push yok.
- Kendi feature branch'inde force push serbest (sadece kendine ait ise).

### Squash Merge Neden?

Main log temiz olur. Demo'dan sonra hackathonu özetlerken `git log --oneline main` okunabilir. Feature içi 20 `wip:` commit'i kimsenin umurunda değil.

---

## 5. Acil Durum Kuralı (Demo'ya 2 saat kala)

Demo'dan **2 saat önce** main üzerinde freeze:

- ❌ Yeni feature **yok**
- ❌ Refactor **yok**
- ❌ "Şu kısmı düzelteyim" **yok**
- ✅ Sadece **demo'yu bozan bug fix**
- ✅ Sadece **pitch için copy değişikliği**

Bu noktadan sonra her merge'de **iki kişi onaylar**, biri commit'i atan, diğeri demo'yu çalıştırıp test eden.

---

## 6. Ne Commit Edilmez

Aşağıdakiler `.gitignore`'da olmalı **ve** commit öncesi `git status` ile kontrol edilmeli:

- `.env`, `.env.local`, API key, token, secret
- `node_modules/`, `.next/`, `dist/`, `build/`, build çıktıları
- IDE dosyaları: `.vscode/` (workspace ayarları hariç), `.idea/`
- OS dosyaları: `.DS_Store`, `Thumbs.db`
- **5 MB üzeri binary** — asset → ya Figma'da kalsın ya optimize (TinyPNG, SVG)
- Yorum satırına gömülmüş eski kod blokları ("sonra lazım olur" → **yasak**, `git` zaten arşivin)
- Geçici test dosyaları: `test.html`, `deneme.js`, `untitled.tsx`

> Yanlışlıkla secret commit edildiyse: **panik yapma**, ekibe haber ver, key'i rotate et, sonra `git filter-repo` ile temizle. Production'da değiliz, panik gereksiz.

---

## 7. Günün Sonu Kuralı

Bilgisayar kapanmadan / uyumadan önce:

1. `git add -A` (veya seçili dosyalar)
2. `git commit -m "wip: <bugün yapılanlar>"` — kötü mesaj olabilir, sorun değil
3. `git push`

> "Yarın temizleyip atarım" = ertesi sabah kaybolmuş kod.
> Kötü commit, hiç commit'ten iyidir.

---

## 8. Hızlı Komut Cheatsheet

```bash
# Feature başlat
git checkout main && git pull
git checkout -b feature/tuna-dashboard-grid

# Çalışırken her 30 dakikada
git add -A && git commit -m "feat: ..."
git push -u origin feature/tuna-dashboard-grid

# Feature bitti, main'e al (squash merge - GitHub UI'dan veya CLI)
git checkout main && git pull
git merge --squash feature/tuna-dashboard-grid
git commit -m "feat: full dashboard grid with 4 cards"
git push

# Branch sil
git branch -D feature/tuna-dashboard-grid
git push origin --delete feature/tuna-dashboard-grid

# "Aman tanrım yanlış branch'tey çalıştım" kurtarma
git stash
git checkout <doğru-branch>
git stash pop
```

---

## 9. AI / Claude Code ile Commit

- Claude commit mesajı önerirse: **insan okumadan push edilmez**.
- AI tarafından üretilen kod da bu dosyaya uyar — tip + kısa açıklama.
- `Co-Authored-By: Claude` satırı **kesinlikle olmamalı**, hackathon jürisi için faydası yok, eklemesek de olur.

---

*İhlal görüldüğünde: kibarca uyar, kural neyse hatırlat. Suçlama yok, sadece kurala dönüş. Yorgun millet hata yapar — kural bunun için var.*
