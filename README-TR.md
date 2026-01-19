# Metin Listesini Diziye Dönüştürücü

Metin listelerinizi **JavaScript, SQL, PHP, PERL, PYTHON (liste olarak)** ve birçok farklı programlama diliyle uyumlu dizi formatlarına kolayca dönüştürün. Bu araç; metin ve sayıların farklı formatlarda işlenmesi için esnek özelleştirme seçenekleri sunarak hızlı ve sorunsuz dönüşümler sağlar.

🌐 **Canlı Demo:**  
[Array Helper](https://www.arrayhelper.com)

🌍 **Diller:**  
🇹🇷 Türkçe | 🇬🇧 [English](README.md)

---

## Projenin hikâyesi

Bu proje Atak Domain’de junior olarak çalıştığım dönemde ortaya çıktı. Veritabanından rapor alırken bana verilen listeleri sürekli olarak SQL `IN()` içine yazmam gerekiyordu. Başta bu iş için küçük Python scriptleri yazıp kullanıyordum ama bir süre sonra script açmak, çalıştırmak ve çıktıyı kopyalamak bile gereksiz gelmeye başladı.

“Bunu tarayıcıda tek ekranda yapsam daha hızlı olmaz mı?” diye düşünerek bu aracı kodladım. Tamamen kendi ihtiyacımı çözmek için başladı, sonra başkalarının da işine yarayabileceğini fark ettim.

---

![Og Image Preview](https://www.arrayhelper.com/images/arrayHelper-og.png)

## Önizleme
![Canlı Önizleme](https://www.arrayhelper.com/images/Readme%20Image%201.jpg)  
![Canlı Önizleme](https://www.arrayhelper.com/images/Readme%20Image%202.jpg)

## Lighthouse
![Lighthouse Skoru](https://www.arrayhelper.com/images/LightShot.jpg)

---

## İçindekiler

- [Özellikler](#özellikler)
- [Kullanım](#kullanım)
- [Ayarlar](#ayarlar)
- [Katkıda Bulunma](#katkıda-bulunma)

---

## Özellikler

- **Anında Dönüştürme**: Metin listelerini JavaScript, SQL, PHP, PERL, PYTHON ve daha birçok formatta dizilere dönüştürür.
- **Özelleştirilebilir Biçimlendirme**: Metinler için tek (`'`) veya çift (`"`) tırnak seçimi yapabilir, sayıların tırnaklı veya düz olarak çıktılanmasını belirleyebilirsiniz.
- **Çıktıları Kopyalama**: Raw, JavaScript ve SQL formatlarındaki çıktıları tek tıkla kopyalayın.
- **Kullanıcı Tercihleri**: Tırnak stili ve sayı formatı gibi tercihlerinizi kaydedin ve daha sonra yeniden yükleyin.
- **Satır Numaralandırma**: Metin girişiyle senkronize çalışan satır numaralandırması sayesinde kolay takip.

---

## Kullanım

### Girdi

1. Metin listenizi editöre girin. Her satır ayrı bir öğe olarak değerlendirilir.
2. **Dönüştür** butonuna tıklayarak aşağıdaki formatlarda çıktı alın:
   - **Ham Çıktı (Raw)**: Virgülle ayrılmış değerler (CSV benzeri).
   - **JavaScript Dizisi**: JavaScript uyumlu dizi formatı.
   - **SQL IN Sorgusu**: SQL `IN()` ifadeleri için uygun format.

---

### Örnek

**Girdi:**  
apple  
banana  
42  
orange  

**Çıktı:**

- **Ham Çıktı:** `"apple", "banana", 42, "orange"`
- **JavaScript Dizisi:** `["apple", "banana", 42, "orange"]`
- **SQL IN Sorgusu:** `IN ("apple", "banana", 42, "orange")`

---

### Çıktıları Kopyalama

Her formatın yanında bulunan **Kopyala** butonlarını kullanarak oluşturulan çıktıları panonuza kolayca kopyalayabilirsiniz.

---

## Ayarlar

Çıktıları özelleştirmek için aşağıdaki ayarları kullanabilirsiniz:

- **Tırnak Stili**: Metinler için tek (`'`) veya çift (`"`) tırnak seçimi
- **Sayı Formatı**: Sayıların düz (`42`) veya tırnaklı (`"42"`) olarak çıktılanması

---

## Katkıda Bulunma

Bu proje **kâr amacı gütmeyen**, topluluk odaklı bir çalışmadır 🙌  
Katkılar; geliştirme, hata düzeltme veya yeni özellik önerileri şeklinde memnuniyetle karşılanır.

Depoyu forklayarak pull request gönderebilirsiniz.
