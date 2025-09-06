# Połączenie z Coolify - Pose Generator

## Informacje o serwerze Coolify

- **Adres serwera**: 192.168.0.250
- **Port API**: 18181
- **Panel web**: http://192.168.0.250:18181

## Konfiguracja połączenia

### 1. Dostęp do API

```bash
# Test połączenia z API
curl -X GET http://192.168.0.250:18181/api/v1/health
```

### 2. Autoryzacja

```bash
# Pobierz token autoryzacji
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email": "your_email", "password": "your_password"}' \
  http://192.168.0.250:18181/api/v1/auth/login
```

### 3. Lista aplikacji

```bash
# Pobierz listę aplikacji
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://192.168.0.250:18181/api/v1/applications
```

## Zarządzanie aplikacją Pose Generator

### Sprawdzenie statusu

```bash
# Status aplikacji
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://192.168.0.250:18181/api/v1/applications/{app_id}
```

### Restart aplikacji

```bash
# Restart aplikacji
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://192.168.0.250:18181/api/v1/applications/{app_id}/restart
```

### Pobieranie logów

```bash
# Logi aplikacji
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://192.168.0.250:18181/api/v1/applications/{app_id}/logs
```

### Aktualizacja zmiennych środowiskowych

```bash
# Aktualizuj zmienne środowiskowe
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"environment_variables": {"VITE_GEMINI_API_KEY": "new_key"}}' \
  http://192.168.0.250:18181/api/v1/applications/{app_id}
```

## Monitoring

### Health Check

```bash
# Sprawdź czy aplikacja odpowiada
curl -X GET http://192.168.0.250:4999/api/health
```

### Sprawdzenie metryk

```bash
# Metryki aplikacji
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://192.168.0.250:18181/api/v1/applications/{app_id}/metrics
```

## Rozwiązywanie problemów

### Aplikacja nie odpowiada
1. Sprawdź status w panelu Coolify
2. Sprawdź logi aplikacji
3. Sprawdź czy port 4999 jest otwarty

### Błędy połączenia z API
1. Sprawdź czy serwer Coolify jest uruchomiony
2. Sprawdź konfigurację sieci
3. Sprawdź czy token autoryzacji jest ważny

### Problemy z wdrożeniem
1. Sprawdź logi builda
2. Sprawdź konfigurację Dockerfile
3. Sprawdź zmienne środowiskowe

## Przydatne skrypty

### Automatyczny restart
```bash
#!/bin/bash
# restart_pose_generator.sh

APP_ID="your_app_id"
TOKEN="your_token"
API_URL="http://192.168.0.250:18181"

curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/v1/applications/$APP_ID/restart"
```

### Sprawdzenie statusu
```bash
#!/bin/bash
# check_status.sh

APP_ID="your_app_id"
TOKEN="your_token"
API_URL="http://192.168.0.250:18181"

curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/v1/applications/$APP_ID" | jq '.status'
```

## Bezpieczeństwo

- Używaj HTTPS w produkcji
- Regularnie rotuj tokeny API
- Monitoruj logi pod kątem podejrzanej aktywności
- Używaj silnych haseł
- Ogranicz dostęp do API tylko do zaufanych adresów IP
