# Kararlar

Kısa karar kaydı. Yeni karar en alta eklenir; eski karar değişirse silinmez, "yerini aldı"
notu düşülür.

## D1: İki repo: `soulcurve-web` (monorepo) + `soulcurve-model`
**Tarih:** 2026-09-27 · **Durum:** kabul

İlk öneri üç repoydu: frontend, backend ve model. İki kişilik, erken aşamadaki bir
projede frontend ile backend'i ayırmak iki ayrı CI, iki ayrı sürümleme ve repolar arası
API sözleşmesi senkronizasyonu gerektirir; karşılığında bir fayda sağlamaz. Frontend ve
backend aynı değişiklikte birlikte değiştiği için tek repoda tutulur.

Model reposu ayrı kalır, çünkü yaşam döngüsü farklıdır: notebook keşfi, büyük yerel veri,
uzun eğitim süreleri ve web deploy'undan bağımsız sürümleme.

## D2: Backend: FastAPI (Python)
**Tarih:** 2026-09-27 · **Durum:** kabul

Model ve özellik kodu Python'da. API de Python olursa özellik hesabı aynı paketten
çağrılır ve eğitim ile sunum arasında sapma riski ortadan kalkar. FastAPI, OpenAPI
şemasını otomatik ürettiği için frontend tipleri şemadan üretilebilir.

## D3: Frontend: React + Vite (TypeScript)
**Tarih:** 2026-09-27 · **Durum:** kabul (A itiraz edebilir)

Değerlendirilen alternatifler:
- **Streamlit / Dash:** Faz 1 için en hızlı yol, ama Faz 2'deki ürünün (hesaplar,
  premium, özel arayüz) temeli olamaz; yeniden yazmak gerekir.
- **Next.js:** SSR/SEO Faz 1'de gerekmiyor, ek karmaşıklık getirir. Faz 2'de ihtiyaç
  olursa geçiş yolu açık.
- **React + Vite:** basit, statik build, FastAPI ile net ayrım. Seçildi.

Grafik kütüphanesi (ör. Recharts, visx, ECharts) A'nın tercihine bırakıldı.

## D4: Model dağıtımı: GitHub Release + sürüme sabitlenmiş paket
**Tarih:** 2026-09-27 · **Durum:** kabul

Ayrıntılar: soulcurve-model/docs/ARCHITECTURE.md. Model registry (MLflow vb.) Faz 1
için gereksiz; ihtiyaç doğarsa yeniden değerlendirilecek.

## Açık kararlar
- [ ] Deploy platformu (M4 öncesi, sahibi A)
- [ ] Önbellek katmanı: dosya/SQLite yeterli mi (M4, sahibi A)
- [ ] Faz 2: kimlik doğrulama ve ödeme sağlayıcısı (Faz 1 kapısından sonra)
