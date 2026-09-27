# Katkı Rehberi

SoulCurve iki kişilik bir ekip: **A (Gün)** uygulama, **B (Deniz)** veri/model.
Bu kurallar iki repoda da aynıdır.

## İş takibi
- Her iş bir **issue**'dur ve bir **milestone**'a (M0-M5, bkz. [ROADMAP](https://github.com/Okkahai/soulcurve-model/blob/main/docs/ROADMAP.md)) bağlıdır.
- Etiketler: `data`, `model`, `api`, `web`, `infra`, `docs`, `bug`, `faz-2`.
- `faz-2` etiketli işler Faz 1 kapısı geçilene kadar başlatılmaz.

## Branch ve commit
- `main` korumalıdır; doğrudan push yapılmaz.
- Branch adı: `<tip>/<issue-no>-<kısa-açıklama>`, örn. `feat/12-snapshot-features`.
- Commit mesajı [Conventional Commits](https://www.conventionalcommits.org/) formatında:
  `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`, `refactor: ...`, `test: ...`.

## Pull request
- Küçük tutun; tek konu, tercihen 400 satırın altında.
- PR açıklaması şablonu doldurur ve ilgili issue'ya `Closes #N` ile bağlanır.
- **Her PR'ı diğer kişi inceler** (A'nınkini B, B'ninkini A). En az 1 onay + yeşil CI olmadan merge yok.
- Merge yöntemi: **squash merge**.
- İnceleme 24 saat içinde yapılmazsa PR sahibi hatırlatır. Acil düzeltmede sahibi merge
  edebilir, ama inceleme sonradan yapılır.

## "Bitti" tanımı
- Kod çalıştırıldı ve çıktı okundu. "Çalışması lazım" bitti değildir.
- Testler ve lint yeşil.
- Davranış veya karar değiştiyse ilgili doküman (docs/) aynı PR'da güncellendi.
- Model değişikliklerinde metrikler PR açıklamasında önce/sonra olarak verildi.

## Kod kuralları
- Python ortamı **uv** ile yönetilir; global `pip` kullanılmaz.
- Kütüphane API'leri hafızadan yazılmaz, güncel dokümanla (Context7) doğrulanır.
- Frontend paketleri `apps/web` içinde tek paket yöneticisiyle (npm) yönetilir; lock dosyası commit edilir.

## Gizli bilgiler
- API anahtarı, token vb. **asla** repoya girmez. Yerelde `.env` (gitignore'da),
  CI'da GitHub Actions secrets kullanılır. `.env.example` dosyası gereken değişkenleri
  değersiz olarak listeler.
