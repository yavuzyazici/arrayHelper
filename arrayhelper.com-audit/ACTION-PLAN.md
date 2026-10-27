# arrayhelper.com SEO Aksiyon Planı

Her maddede "başarısız olduğunu nasıl anlarız" kontrolü ve izlenecek bir öncü gösterge var.

## Faz 1: Canlıya alma ve doğrulama (1. hafta)

**1. `dist/` klasörünü build edip yayınla.**
- Kontrol: Aşağıdaki komutlar 301 ve `location: https://www.arrayhelper.com/...` döndürmeli.

```bash
curl -sI https://arrayhelper.com/
```

```bash
curl -sI https://www.arrayhelper.com/tr/index.html
```

- Başarısızlık belirtisi: Yanıt 200 ise ya da yönlendirme döngüsü oluşuyorsa, hosting panelindeki "Force HTTPS / www" ayarı ile `.htaccess` çakışıyordur.

**2. Güvenlik başlıklarını doğrula.**

```bash
curl -sI https://www.arrayhelper.com/
```

- Kontrol: Yanıtta `strict-transport-security`, `x-content-type-options` ve `x-frame-options` görünmeli.

**3. Özel 404 sayfasını doğrula.**
- Kontrol: Var olmayan bir URL açıldığında 404 durum kodu ve ArrayHelper 404 sayfası gelmeli.

**4. Search Console ve Bing Webmaster Tools'a sitemap gönder.**
- Kontrol: Sitemap gönderilsin, ardından URL Inspection ile `https://arrayhelper.com/` adresinin www'ya yönlendiği görülsün.
- Öncü gösterge: Coverage raporunda "Alternate page with proper canonical" sayısı azalmalı.

**5. Rich Results Test ile `/` ve `/tr/` sayfalarını kontrol et.**
- Beklenen: Uygun bir zengin sonuç çıkmaz. FAQ sonuçları 2026-05-07'de kaldırıldı ve rating yok; bu bir regresyon değil.
- Başarısızlık belirtisi: Herhangi bir "invalid" hata görünmesi.

## Faz 2: Yüksek etkili ürün iyileştirmeleri (2–3. hafta)

**1. Uzun listelerde Auto Run.**
- Paste olayında 40 satır sınırını aşarak tek seferlik dönüşüm yap. Ya da editör altında görünür bir "Dönüştür" ipucu göster.
- Gösterge: GA4'te kopyalama olayı (aşağıdaki maddeye bakın) / oturum oranı.

**2. Örnek yükle butonu.**
- `ui.loadExample` anahtarını ekle; örnek `apple / banana / 42` olsun.
- Gösterge: İlk etkileşime kadar geçen süre.

**3. Görünür format sekmeleri.**
- Python, PHP, JSON ve C# hover menüsünden çıkıp sekme olarak görünsün.
- `?panel=` ile derin bağlantı kurulabilsin.

**4. LICENSE ekle.**
- Örneğin MIT. Bu, dizin ve awesome-list başvurularının ön koşulu.
- Ardından `build.mjs` içindeki SoftwareSourceCode düğümüne `license` ekle.

**5. Kopyalama olayını ölç.**
- Copy butonuna `gtag('event', 'copy_output', { panel })` ekle.

## Faz 3: İçerik ve otorite (2. ay)

**1. "Hakkında" bloğu.**
- 26 dile `#about` bölümü ekle: kim yaptı, iletişim, Atak Domain'deki SQL `IN()` hikâyesi, analytics/CDN açıklaması ve son güncelleme tarihi.
- `build.mjs` içine `dateModified` ekle; değer `contentDate()` fonksiyonundan alınsın.
- Gösterge: Search Console'da marka sorgularındaki gösterim sayısı.

**2. Niyete özel sayfalar.**
- `/sql-in-clause-generator/`, `/list-to-json-array/`, `/comma-separated-list-generator/`
- Her biri kendi H1'i, meta etiketleri ve varsayılan paneliyle gelmeli. `build.mjs` bu sayfaları üretmeli.
- Başarısızlık belirtisi: 8 hafta sonra bu URL'lerin gösterimi 0 ise kanibalizasyonu kontrol et.

**3. Bağımsız backlink.**
1. Atak Domain'den editoryal bir bağlantı iste. Common Crawl'a göre en güçlü ilgili alan adı bu.
2. Show HN ya da dev.to'da projenin çıkış hikâyesini anlatan bir yazı yayımla.
3. DevHunt ve `awesome-devtools` listelerine başvur.
4. Stack Overflow'da ilgili SQL IN sorularını, bağını açıkça belirterek yanıtla.

- Toplu dizin kaydı, ücretli link ya da PBN kullanma.

**4. Dedupe etiketi.**
- 21 dilde fiil biçimine çevir (örneğin "Duplikate entfernen").

## Faz 4: İzleme (sürekli)

**1. Drift baseline.** Değişiklikleri izlemek için bir kez taban çizgisi oluştur:

```bash
.claude/skills/seo/scripts/claude-seo run drift_baseline.py https://www.arrayhelper.com/
```

**2. Saha verisi.**
- PageSpeed API anahtarı ekle (`~/.config/claude-seo/google-api.json`). Böylece CrUX saha verisi lab tahminlerinin yerini alır.

**3. Backlink verisi.**
- Ücretsiz bir Moz API anahtarı ya da Bing Webmaster bağlantısı ekle. Bu, backlink skorunu üretilebilir hâle getirir.

**4. Üç ayda bir tekrar denetim.**

```bash
/seo audit https://www.arrayhelper.com/
```
