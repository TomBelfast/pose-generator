# Wdrożenie na Coolify - Pose Generator

## Konfiguracja Coolify

### 1. Tworzenie nowej aplikacji

1. Zaloguj się do panelu Coolify
2. Kliknij "New Application"
3. Wybierz "Docker Compose" lub "Dockerfile"
4. Podaj nazwę: `pose-generator`

### 2. Konfiguracja repozytorium

- **Repository URL**: URL do Twojego repozytorium GitHub
- **Branch**: `main`
- **Build Pack**: Docker

### 3. Zmienne środowiskowe

Ustaw następujące zmienne w panelu Coolify:

```
NODE_ENV=production
PORT=4999
DATABASE_URL=file:/app/data/production.db
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

### 4. Konfiguracja domeny

1. W sekcji "Domains" dodaj swoją domenę
2. Włącz SSL (Let's Encrypt)
3. Ustaw przekierowanie HTTP → HTTPS

### 5. Uruchomienie

1. Kliknij "Deploy"
2. Poczekaj na zakończenie builda
3. Sprawdź logi w sekcji "Logs"

## Monitoring i zarządzanie

### Sprawdzanie statusu
- **Health Check**: `https://your-domain.com/api/health`
- **Logi**: Panel Coolify → Logs
- **Metryki**: Panel Coolify → Metrics

### Restart aplikacji
- Panel Coolify → Restart
- Lub przez API: `POST /api/v1/applications/{id}/restart`

### Backup bazy danych
- Baza danych jest przechowywana w `/app/data/production.db`
- Regularnie tworz kopie zapasowe tego pliku

## Rozwiązywanie problemów

### Aplikacja nie uruchamia się
1. Sprawdź logi w panelu Coolify
2. Upewnij się, że wszystkie zmienne środowiskowe są ustawione
3. Sprawdź czy port 4999 jest dostępny

### Błędy builda
1. Sprawdź czy Dockerfile jest poprawny
2. Upewnij się, że wszystkie pliki są w repozytorium
3. Sprawdź logi builda w panelu Coolify

### Problemy z domeną
1. Sprawdź konfigurację DNS
2. Upewnij się, że domena wskazuje na serwer Coolify
3. Sprawdź certyfikat SSL

## Automatyczne wdrożenia

### GitHub Actions (opcjonalne)
Możesz skonfigurować automatyczne wdrożenia przy każdym pushu do brancha `main`:

```yaml
name: Deploy to Coolify
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Coolify
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{"branch": "main"}' \
            ${{ secrets.COOLIFY_API_URL }}/api/v1/applications/{app_id}/deploy
```

## Bezpieczeństwo

- Używaj silnych haseł dla zmiennych środowiskowych
- Regularnie aktualizuj zależności
- Monitoruj logi pod kątem podejrzanej aktywności
- Używaj HTTPS w produkcji
