# soulcurve-web

SoulCurve'ün uygulama reposu: bir Deadlock maçının zaman içindeki **kazanma olasılığı
eğrisini** gösteren dashboard. Backend ve frontend bu tek repoda (monorepo) durur.

Modeli ve özellik hesabını [`soulcurve-model`](https://github.com/Okkahai/soulcurve-model)
reposu üretir. Yol haritası orada tutulur:
[ROADMAP.md](https://github.com/Okkahai/soulcurve-model/blob/main/docs/ROADMAP.md).

## Yapı

```
apps/
  api/    FastAPI (Python, uv): maç verisini çeker, modeli çalıştırır, JSON döner
  web/    React + Vite (TypeScript): dashboard arayüzü
docs/
  ARCHITECTURE.md   bileşenler, API sözleşmesi, deploy
  DECISIONS.md      alınan mimari kararlar ve gerekçeleri
```

## Dokümanlar

| Dosya | İçerik |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | API uçları, model yükleme, frontend sayfaları, deploy |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Neden monorepo, neden FastAPI + React, açık kararlar |
| [CONTRIBUTING.md](CONTRIBUTING.md) | İki kişilik çalışma düzeni, branch/PR kuralları |

## Hızlı başlangıç

```bash
# API
cd apps/api
uv sync
uv run fastapi dev src/soulcurve_api/main.py   # http://localhost:8000/health
uv run pytest

# Web (ilk kurulumdan sonra, bkz. apps/web/README.md)
cd apps/web
npm install
npm run dev
```

## Faz durumu

**Faz 1: MVP dashboard.** Yalnızca kazanma olasılığı eğrisi. Hesaplar, ödeme ve coaching
(Faz 2) model doğrulanıp deadlock-api'nin ticari şartları netleşmeden eklenmez.
