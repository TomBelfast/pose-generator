# 🚀 Instrukcja wdrożenia aplikacji na Coolify

## 📋 Przegląd aplikacji

Twoja aplikacja to **Pose Generator** - aplikacja React + Vite z backendem Express i bazą danych SQLite (Prisma). Aplikacja umożliwia generowanie obrazów z różnymi pozami przy użyciu AI.

## 🛠️ Przygotowanie do wdrożenia

### 1. Wymagane pliki (już utworzone)
- ✅ `Dockerfile` - konfiguracja kontenera Docker
- ✅ `docker-compose.yml` - konfiguracja dla lokalnego testowania
- ✅ `env.production` - szablon zmiennych środowiskowych

### 2. Przygotowanie zmiennych środowiskowych

Przed wdrożeniem musisz przygotować następujące klucze API:

#### 🔑 Gemini API Key
1. Idź do [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Utwórz nowy klucz API
3. Skopiuj klucz

#### 🔑 Clerk Authentication Keys
1. Idź do [Clerk Dashboard](https://dashboard.clerk.com/)
2. Utwórz nową aplikację lub wybierz istniejącą
3. Skopiuj **Publishable Key** (zaczyna się od `pk_live_`)

## 🚀 Kroki wdrożenia na Coolify

### Krok 1: Przygotowanie repozytorium
1. **Skomituj wszystkie pliki** do swojego repozytorium Git:
   ```bash
   git add .
   git commit -m "Add Coolify deployment configuration"
   git push origin main
   ```

### Krok 2: Konfiguracja w Coolify

1. **Zaloguj się do Coolify** i przejdź do swojego projektu

2. **Utwórz nową aplikację**:
   - Wybierz **"Git Repository"**
   - Podaj URL swojego repozytorium Git
   - Wybierz branch `main`

3. **Skonfiguruj build**:
   - **Build Pack**: `Dockerfile`
   - **Dockerfile Path**: `./Dockerfile`
   - **Port**: `4999`

4. **Dodaj zmienne środowiskowe**:
   ```
   VITE_GEMINI_API_KEY=twój_klucz_gemini
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_twój_klucz_clerk
   DATABASE_URL=file:/app/data/production.db
   NODE_ENV=production
   PORT=4999
   ```

5. **Skonfiguruj domenę** (opcjonalnie):
   - Dodaj swoją domenę w sekcji "Domains"
   - Coolify automatycznie skonfiguruje SSL

### Krok 3: Wdrożenie

1. **Kliknij "Deploy"** w Coolify
2. **Obserwuj logi** podczas budowania
3. **Sprawdź status** aplikacji po wdrożeniu

## 🔧 Konfiguracja zaawansowana

### Persistent Volume dla bazy danych
Coolify automatycznie utworzy persistent volume dla katalogu `/app/data`, gdzie będzie przechowywana baza danych SQLite.

### Health Check
Aplikacja ma skonfigurowany health check na endpoint `/api/health`.

### Restart Policy
Aplikacja będzie automatycznie restartowana w przypadku awarii.

## 🧪 Testowanie lokalne

Przed wdrożeniem na Coolify możesz przetestować aplikację lokalnie:

```bash
# 1. Skopiuj plik env.production do .env
cp env.production .env

# 2. Edytuj .env i dodaj swoje klucze API

# 3. Uruchom aplikację
docker-compose up --build
```

Aplikacja będzie dostępna pod adresem: `http://localhost:4999`

## 🐛 Rozwiązywanie problemów

### Problem: Błąd podczas budowania
- **Sprawdź logi** w Coolify
- **Upewnij się**, że wszystkie pliki są w repozytorium
- **Sprawdź**, czy zmienne środowiskowe są poprawnie ustawione

### Problem: Aplikacja nie startuje
- **Sprawdź logi** aplikacji w Coolify
- **Upewnij się**, że wszystkie zmienne środowiskowe są ustawione
- **Sprawdź**, czy port 4999 jest dostępny

### Problem: Baza danych nie działa
- **Sprawdź**, czy persistent volume jest poprawnie skonfigurowany
- **Sprawdź logi** Prisma w aplikacji

## 📊 Monitoring

Po wdrożeniu możesz monitorować:
- **Logi aplikacji** w sekcji "Logs"
- **Metryki** w sekcji "Metrics"
- **Health status** w sekcji "Health"

## 🔄 Aktualizacje

Aby zaktualizować aplikację:
1. **Wprowadź zmiany** w kodzie
2. **Skomituj i wypchnij** do repozytorium
3. **Kliknij "Redeploy"** w Coolify

## 📞 Wsparcie

Jeśli napotkasz problemy:
1. **Sprawdź logi** w Coolify
2. **Przetestuj lokalnie** z docker-compose
3. **Sprawdź dokumentację** Coolify

---

**Powodzenia z wdrożeniem! 🎉**
