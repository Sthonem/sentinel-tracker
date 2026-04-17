# Kullanım Kılavuzu — Sentinel Tracker PG

## Ön Gereksinimler

| Araç | Minimum Sürüm |
|---|---|
| Node.js | 20 LTS |
| npm | 9 |
| Python | 3.11 |
| Git | güncel herhangi bir sürüm |

Ayrıca erişim jetonu almak için ücretsiz bir **Cesium Ion hesabı** gereklidir:  
<https://ion.cesium.com/tokens>

---

## 1. Depoyu Klonlama

```bash
git clone https://github.com/your-org/sentinel-tracker-pg.git
cd sentinel-tracker-pg
```

---

## 2. Arka Uç (Backend) Kurulumu

```bash
cd backend

# Sanal ortam oluştur ve etkinleştir
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# Ortam değişkenlerini yapılandır
cp .env.example .env
# .env dosyasını düzenle — gerekirse ALLOWED_ORIGIN değerini değiştir

# API sunucusunu başlat
uvicorn main:app --reload --port 8000
```

Arka uç **http://localhost:8000** adresinde çalışır.  
Sağlık kontrolü: <http://localhost:8000/api/satellites> JSON döndürmeli.

---

## 3. Ön Uç (Frontend) Kurulumu

**Yeni bir terminal sekmesi/penceresi** açın.

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# Ortam değişkenlerini yapılandır
cp .env.example .env
```

`frontend/.env` dosyasını düzenleyin:

```env
VITE_API_URL=http://localhost:8000
VITE_CESIUM_ION_TOKEN=buraya_token_yaz
```

```bash
# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcınızda **http://localhost:5173** adresini açın.

---

## 4. Uygulamanın Kullanımı

### Küre Navigasyonu
- **Sol tık + sürükle** — küreyi döndür
- **Sağ tık + sürükle** veya **fare tekerleği** — yakınlaştır/uzaklaştır
- **Orta tık + sürükle** — kamerayı eğ

### Uydu Varlıkları
Her uydu, zemin iz şeridiyle birlikte renkli bir nokta olarak gösterilir:
- 🟠 **Turuncu** — Sentinel-1 (SAR, C-bandı)
- 🔵 **Camgöbeği** — Sentinel-2 (MSI, optik)

Herhangi bir uyduya tıklayarak **bilgi panelini** (sağ üst) açabilirsiniz. Panel; irtifa, hız, eğim açısı, devir numarası ve TLE tarihini gösterir.

### Kapsama Isı Haritası
1. Araç çubuğundaki **Coverage Map** düğmesine tıklayın.
2. "Computing 7-day coverage map…" banner'ı kaybolana kadar bekleyin (genellikle 5–15 saniye).
3. Renk katmanı belirir — mavi = düşük kapsama, kırmızı = yüksek kapsama.
4. Gizlemek için tekrar **Coverage Map** düğmesine tıklayın.

### Sonraki Geçiş (Next Overpass)
1. Araç çubuğundaki **Pick Location** düğmesine tıklayın (imleç artı biçimine döner).
2. Küre üzerinde herhangi bir noktaya tıklayın.
3. **Next Overpass** paneli (sol alt) her uydu için en yakın geçiş zamanını ve tahmini süreyi gösterir.
4. Kapatmak için **✕** simgesine tıklayın.

### Tarihsel Yeniden Oynatma
1. Araç çubuğundaki **Date** alanına bir tarih girin (biçim: `YYYY-MM-DD`).
2. Cesium saati o tarihe atlar; uydular tarihsel konumlarına geçer.
3. Canlı moda dönmek için **Reset** düğmesine tıklayın veya alanı temizleyin.

---

## 5. Üretim Derlemesi

```bash
cd frontend
npm run build       # çıktı: frontend/dist/
npm run preview     # derlenmiş paketi yerel olarak sun
```

Arka uç dağıtımı için **[DEPLOY.md](DEPLOY.md)** dosyasına bakın.

---

## 6. Yaygın Sorunlar

| Belirti | Olası Neden | Çözüm |
|---|---|---|
| Boş küre / Cesium döşemeleri eksik | Geçersiz Ion jetonu | `frontend/.env` içindeki `VITE_CESIUM_ION_TOKEN` değerini kontrol et |
| "Failed to fetch satellites" hatası | Arka uç çalışmıyor | Uvicorn'u başlat; 8000 portunun boş olduğunu doğrula |
| Tarayıcı konsolunda CORS hatası | `ALLOWED_ORIGIN` uyuşmazlığı | `backend/.env` dosyasında `ALLOWED_ORIGIN=http://localhost:5173` yap |
| Sarı eski TLE banner'ı | TLE verisi >24 saat eski | Arka uç otomatik yeniler; zorlamak için arka ucu yeniden başlat |
| Kapsama haritası çok uzun sürüyor | Çok uydu, yavaş CPU | Normal — hesaplama Web Worker üzerinde çalışır; sadece bekle |
