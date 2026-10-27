# arrayhelper.com SEO Denetim Raporu

**Tarih:** 2026-10-27  
**Araç:** [claude-seo](https://github.com/AgriciDaniel/claude-seo) v2.5.0 (`seo-audit` akışı)  
**Kapsam:** https://www.arrayhelper.com/ ve 25 dil sayfası (toplam 26 URL)  
**İş türü:** Geliştirici aracı / ücretsiz web uygulaması

Skill'in 10 alt ajanı paralel çalıştırıldı: technical (+hreflang), content, schema, sitemap, performance, visual, geo, agentic, backlinks ve sxo. Her birinin ayrıntılı bulguları `findings/` klasöründe.

Veri sınırı şudur: Google Search Console, GA4, CrUX ve Moz anahtarı yoktu. Bu yüzden tüm performans değerleri lab ölçümüdür ve backlink skoru üretilemedi.

## SEO Sağlık Skoru: 77 / 100

Bu skor, değişikliklerden **önceki** canlı siteye aittir.

| Kategori | Ağırlık | Skor |
|---|---|---|
| Teknik SEO | 22% | 85 |
| İçerik Kalitesi | 23% | 71 |
| On-Page SEO | 20% | 82 |
| Şema / Yapısal Veri | 10% | 72 |
| Performans (CWV, lab) | 10% | 91 |
| AI Arama Hazırlığı | 10% | 68 |
| Görseller | 5% | 55 |

Kategori dışı skorlar:

- SXO boşluk skoru: 63
- Sitemap: 92
- Agent-UX: 96
- Backlink skoru üretilemedi. Yalnızca Common Crawl verisi vardı (Tier 0).

## Yönetici Özeti

**Güçlü yanlar**

- hreflang 26 sayfada kusursuz: self-reference, dönüş etiketleri, x-default ve `zh-Hans`.
- Her dil için sunucuda üretilmiş statik HTML var. Tüm botlara aynı içerik gidiyor.
- LCP metin (H1). Mobilde 1.0–1.4 sn, CLS 0.
- İçerik ince değil. Somut ve tekrar etmeyen yaklaşık 1.200 kelime var.

**En önemli 5 sorun**

1. **"Tırnaklar doğru kaçırılır" iddiası yanlıştı.** JS, Python, PHP ve Raw çıktısında `O'Brien`, `['O'Brien']` olarak çıkıyordu; bu bir sözdizimi hatası. `007`, `0x1F` ve `Infinity` da tırnaksız yazılıyordu, yani geçersiz JSON.
2. **www'suz alan adı ve `/index.html` 301 yerine 200 dönüyordu.** Canonical bunu hafifletiyor ama tekilleştirme yapılmamıştı.
3. **Güvenlik başlıkları hiç yoktu:** HSTS, nosniff, X-Frame-Options ve Referrer-Policy.
4. **JSON-LD'de sorunlar vardı.** Kullanımdan kalkmış HowTo şeması duruyordu. WebApplication üzerinde de geçersiz özellikler vardı: `codeRepository` ve `availableLanguage`.
5. **Mobilde ilk ekran 720px'lik boş bir editörden ibaretti.** Sonuçlar ve araç çubuğu ekranın altında kalıyordu.

**Bağımsız kanıt eksikti**

- Hiç bağımsız backlink yok. Doğrulanan 3 bağlantının üçü de sahibine ait.
- "ArrayHelper" adı Yii, Craft ve CodeIgniter'daki sınıflarla çakışıyor.

## Bu çalışmada yapılan düzeltmeler

| Alan | Değişiklik | Dosya |
|---|---|---|
| Teknik | www'suz alan adı www'ya, `/index.html` dizine 301 ile yönleniyor | `src/.htaccess` |
| Teknik | HSTS, nosniff, X-Frame-Options, Referrer-Policy ve Permissions-Policy eklendi | `src/.htaccess` |
| Teknik | robots.txt ve sitemap için önbellek süresi 1 gün; XML sıkıştırılıyor | `src/.htaccess` |
| Teknik | `noindex` özel 404 sayfası eklendi | `src/404.html`, `src/.htaccess`, `build.mjs` |
| Sitemap | `lastmod` her dil için git geçmişinden geliyor; yalnızca build yapmak tarihi değiştirmiyor | `build.mjs` |
| Şema | HowTo kaldırıldı. Diğer şema değişiklikleri bu tablonun altında listelendi. | `build.mjs` |
| İçerik | Tırnak ve ters bölü kaçışı eklendi (JS/Python/PHP/Raw). Yalnızca JSON sayı dilbilgisine uyan değerler tırnaksız kalıyor. | `src/js/core/converter.js` |
| Marka | `meta.appName` 26 dilde "ArrayHelper – …" olarak birleştirildi | `src/i18n/*.json` |
| On-page | og:image boyutu 2121x1114 olarak düzeltildi | `src/page.html` |
| On-page | Kullanılmayan meta etiketleri kaldırıldı: `og:price`, X-UA-Compatible, referrer meta | `src/page.html` |
| On-page | Favicon tipi düzeltildi, yazar adı "Yavuz Selim Yazıcı" olarak birleştirildi | `src/page.html` |
| Erişilebilirlik | Çıktı alanları panel başlığıyla etiketlendi (`aria-labelledby`); dekoratif ikonlara `alt=""` verildi | `src/page.html` |
| Erişilebilirlik | Araç çubuğu artık `data-option` ile çalışıyor ve `aria-pressed` taşıyor | `src/page.html`, `src/js/ui/events.js` |
| Erişilebilirlik | Ayar menüsü klavyeyle açılıyor (`:focus-within`) | `src/styles/globals.css` |
| Erişilebilirlik | Başlık altı metnin kontrastı 2.07:1'den 4.9:1'e çıkarıldı | `src/styles/globals.css` |
| Performans | GA4 yalnızca boşta yükleniyor; ilk tuş vuruşlarında 240 ms'lik gecikme kalktı | `src/page.html` |
| Performans | Rehber bölümleri `content-visibility:auto` kullanıyor | `src/styles/globals.css` |
| Performans | Gereksiz jsDelivr preconnect kaldırıldı | `src/page.html` |
| Performans | Latin-ext fontlar eklendi: tr, pl, cs, hu, ro ve bs'deki ş, ğ, İ, ą, č, ő artık Poppins ile çiziliyor | `src/styles/globals.css` |
| Görsel / CLS | Logo SVG'si 120x26 yapıldı; başlıktaki kayma kalktı | `src/images/arrayHelper.svg`, `src/page.html` |
| Mobil | Editör yüksekliği 720px yerine `clamp(240px, 42svh, 720px)`; ilk çıktı paneli ekranın içinde | `src/styles/globals.css` |
| GEO | `llms.txt` eklendi. Google bu dosyayı kullanmıyor; AI kodlama ajanları için ucuz bir opsiyon. | `src/llms.txt` |
| Diğer | browserconfig www alanına alındı, robots.txt sonuna satır sonu eklendi | `src/browserconfig.xml`, `src/robots.txt` |

Şema grafiğindeki diğer değişiklikler (`build.mjs`):

- WebPage ve SoftwareSourceCode düğümleri eklendi.
- Uygulamanın `@id` değeri artık tüm diller için tek (`/#app`).
- Logo artık 180x180 boyutunda bir ImageObject.
- `alternateName` ve `isAccessibleForFree` eklendi.
- Script içindeki `<` karakteri kaçırılıyor.

**Doğrulama**

- `npm run build`: 26/26 dil derlendi.
- 26 sayfanın JSON-LD'si ayrıştırıldı: 0 kopuk `@id`, HowTo yok, HTML entity kalıntısı yok.
- Skill'in `parse_html.py` aracı yeni meta ve şemayı okuyor.
- Tarayıcıda test edildi:
  - `O'Brien`, `C:\temp` ve `say "hi"` tek ve çift tırnak modunda geçerli JS olarak çıktı. `eval` ile değerler birebir geri geldi.
  - 20.000 satırlık listede kısaltma mesajındaki toplam uzunluk, tam çıktıyla birebir aynı (262.227).
  - Ayar menüsü klavye odağıyla açılıyor.
  - Mobilde ilk çıktı y=865 yerine y=473'te başlıyor.
- `.htaccess` kuralları yerelde test edilemedi; yerel sunucu Apache değil. Canlıya alındıktan sonra kontrol edilmeli (bkz. ACTION-PLAN).

## Açık kalan bulgular (kaynak kodda karar gerektirenler)

| Öncelik | Bulgu | Neden bu çalışmada yapılmadı |
|---|---|---|
| Yüksek | Auto Run 40 satırın üstünde durur; yapıştırılan uzun listede çıktı boş kalır | Bilinçli bir performans kararı (`AUTO_RUN_MAX_LINES`). Ürün kararı gerektiriyor. |
| Yüksek | E-E-A-T 51/100: yazar, iletişim, tarih ve analytics bilgisi yok | 26 dilde yeni içerik gerektiriyor |
| Yüksek | Bağımsız backlink yok | Site dışı çalışma (bkz. ACTION-PLAN) |
| Yüksek | Python/PHP/JSON/C# panelleri varsayılan olarak gizli; başlıkta vaat ediliyor | UI tasarım kararı |
| Orta | Niyete özel sayfalar yok: SQL IN generator, JSON array, comma separated | Yeni sayfa şablonu ve çeviri gerektiriyor |
| Orta | LICENSE yok, ama site "open source" diyor | Lisans seçimi sahibin kararı |
| Orta | Dedupe etiketi 21 dilde isim olarak okunuyor ("Duplikate") | Her dilde metin gözden geçirmesi gerekiyor |
| Orta | C# örneği `new[] { "apple", "banana", 42 }` derlenmiyor (CS0826) | Kart metni 26 dilde "implicitly typed" diyor |
| Orta | 50.000 satır yapıştırınca satır numaraları sayfayı 5.6 sn donduruyor | Editör performans işi |
| Orta | CSP yok | Inline gtag ve jsDelivr Monaco nedeniyle önce Report-Only ile denenmeli |
| Düşük | da ve no başlıkları aynı | Norveççe başlık için dil kontrolü gerekiyor |

## Kategori ayrıntıları

- Teknik: `findings/technical.md`
- İçerik ve on-page: `findings/content.md`
- Şema: `findings/schema.md` (önerilen grafik: `findings/schema-proposed-en.jsonld`)
- Sitemap: `findings/sitemap.md`
- Performans: `findings/performance.md`
- Görsel ve mobil: `findings/visual.md`
- AI arama (GEO): `findings/geo.md`
- Agent hazırlığı: `findings/agentic.md`
- Backlink: `findings/backlinks.md`
- SXO: `findings/sxo.md`
