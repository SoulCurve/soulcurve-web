# Mimari: soulcurve-web

## Bileşenler

```
 tarayıcı ──► apps/web (React + Vite, statik build)
                 │  fetch /api/...
                 ▼
             apps/api (FastAPI)
                 │  1. maç verisini çeker ──► api.deadlock-api.com (REST)
                 │  2. özellikleri hesaplar ──► soulcurve_model.features (paket)
                 │  3. tahmin eder ──► LightGBM model (Release artefaktı)
                 ▼
             JSON: kazanma olasılığı serisi + olaylar
```

## API sözleşmesi (Faz 1 taslağı)

| Uç | Açıklama |
|---|---|
| `GET /health` | Canlılık + yüklü model sürümü |
| `GET /api/matches/{match_id}/win-probability` | Maçın zaman serisi kazanma olasılığı |
| `GET /api/model` | Model sürümü, eğitim aralığı, metrikler (şeffaflık için) |

Örnek yanıt (`win-probability`):

```json
{
  "match_id": 12345678,
  "model_version": "model-v0.1.0",
  "team_perspective": "amber",
  "points": [
    {"t_min": 0, "p_win": 0.51},
    {"t_min": 3, "p_win": 0.55}
  ],
  "events": [
    {"t_min": 7.5, "type": "objective", "detail": "Guardian", "team": "sapphire"}
  ],
  "winner": "amber"
}
```

Şema FastAPI'nin ürettiği OpenAPI'den okunur. Frontend tipleri bu şemadan üretilir
(ör. `openapi-typescript`), elle yazılmaz. Böylece iki taraf aynı repoda senkron kalır.

## Model yükleme

- API bağımlılığı: `soulcurve-model` paketi, git tag'ine sabitlenmiş (bkz. soulcurve-model/docs/ARCHITECTURE.md).
- Model dosyası: başlangıçta `MODEL_VERSION` ortam değişkenindeki Release'ten indirilir
  ve yerelde önbelleğe alınır.
- Başlangıçta `metadata.json` içindeki özellik listesi paketteki listeyle karşılaştırılır,
  uyuşmazsa API başlamaz (training/serving skew koruması).

## Veri çekme ve önbellek

- Tek bir maç için veri, deadlock-api REST uçlarından alınır. Hangi ucun `match_player`
  snapshot'larını verdiği M4'te OpenAPI şemasından doğrulanacak.
- Tamamlanmış maçların verisi değişmez, bu yüzden sonuçlar kalıcı önbelleğe alınabilir
  (Faz 1: dosya/SQLite; ihtiyaç olursa Redis).
- Rate limit'e saygı: istemci tarafında basit limit ve yeniden deneme.

## Frontend (Faz 1 sayfaları)

1. **Ana sayfa:** maç ID'si ile arama.
2. **Maç sayfası:** kazanma olasılığı eğrisi (0-100%, %50 referans çizgisi), objective
   olayları zaman çizelgesinde işaretli, sonuç ve model sürümü.

## Ortam değişkenleri

`.env.example` dosyasında listelenir; gerçek değerler yerelde `.env`, deploy ortamında
platformun secret yönetimi ile verilir.

| Değişken | Açıklama |
|---|---|
| `MODEL_VERSION` | Kullanılacak model Release tag'i |
| `DEADLOCK_API_BASE_URL` | Varsayılan `https://api.deadlock-api.com` |
| `CACHE_DIR` | Model ve maç önbelleği klasörü |

## Deploy (M4'te karar verilecek)

Öneri: frontend statik olarak (Vercel / Netlify / Cloudflare Pages), API tek bir
konteyner olarak (Fly.io / Render / Railway). Faz 1 trafiği düşük olduğundan ücretsiz
veya en düşük katman yeterli. Karar DECISIONS.md'ye yazılacak.

## CI

- `api` işi: `uv sync --locked`, `ruff check`, `ruff format --check`, `pytest`.
- `web` işi: frontend kurulunca eklenecek (`npm ci`, `npm run lint`, `npm run build`).
