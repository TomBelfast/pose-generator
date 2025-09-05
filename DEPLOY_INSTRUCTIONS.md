# 🚀 Instrukcje uruchomienia Pose Generator na Coolify

## 📋 Status projektu
- **Projekt istnieje**: `tom-belfast/pose-generator:main-e0k88kocwoo8s44gg00osocg`
- **Status**: `exited:unhealthy` ❌
- **Problem**: Projekt jest zatrzymany i wymaga konfiguracji

## 🔧 KROK 1: Sprawdź projekt w interfejsie Coolify

1. **Zaloguj się** do [https://host.aihub.ovh/](https://host.aihub.ovh/)
2. **Znajdź projekt** `pose-generator` na liście aplikacji
3. **Kliknij na projekt** aby go otworzyć

## 🔧 KROK 2: Sprawdź konfigurację

### A. Zmienne środowiskowe
Upewnij się, że są ustawione:
```
VITE_GEMINI_API_KEY=twój_klucz_gemini
VITE_CLERK_PUBLISHABLE_KEY=pk_live_twój_klucz_clerk
DATABASE_URL=file:/app/data/production.db
NODE_ENV=production
PORT=4999
```

### B. Port
- **Port**: `4999`
- **Dockerfile**: `./Dockerfile`

### C. Repozytorium
- **URL**: Twoje repozytorium Git z kodem
- **Branch**: `main`

## 🔧 KROK 3: Uruchom projekt

### Opcja A: Restart istniejącego projektu
1. **Kliknij "Restart"** w interfejsie Coolify
2. **Sprawdź logi** podczas uruchamiania
3. **Sprawdź status** po uruchomieniu

### Opcja B: Redeploy projektu
1. **Kliknij "Redeploy"** w interfejsie Coolify
2. **Obserwuj proces** budowania
3. **Sprawdź logi** po wdrożeniu

### Opcja C: Utwórz nowy projekt
1. **Kliknij "New Application"**
2. **Wybierz "Git Repository"**
3. **Podaj URL repozytorium**
4. **Skonfiguruj** jak powyżej

## 🔧 KROK 4: Sprawdź logi

Po uruchomieniu sprawdź logi pod kątem:
- ✅ **Brak błędów** podczas budowania
- ✅ **Aplikacja startuje** na porcie 4999
- ✅ **Baza danych** jest dostępna
- ✅ **Zmienne środowiskowe** są ustawione

## 🔧 KROK 5: Test aplikacji

Po uruchomieniu sprawdź:
- **URL aplikacji** (podany przez Coolify)
- **Health check** na `/api/health`
- **Funkcjonalność** generowania obrazów

## 🐛 Rozwiązywanie problemów

### Problem: Aplikacja nie startuje
- **Sprawdź logi** - co spowodowało błąd
- **Sprawdź zmienne środowiskowe** - czy są ustawione
- **Sprawdź port** - czy 4999 jest dostępny

### Problem: Błąd bazy danych
- **Sprawdź** czy persistent volume jest skonfigurowany
- **Sprawdź** czy katalog `/app/data` istnieje

### Problem: Błąd autoryzacji
- **Sprawdź** klucze Clerk i Gemini
- **Sprawdź** czy są w formacie produkcyjnym

## 📊 Monitoring

Po uruchomieniu monitoruj:
- **Status aplikacji** w Coolify
- **Logi** w czasie rzeczywistym
- **Metryki** użycia zasobów
- **Health status** aplikacji

## 🎯 Oczekiwany rezultat

Po pomyślnym uruchomieniu:
- **Status**: `running:healthy` ✅
- **Port**: 4999
- **URL**: Dostępny przez Coolify
- **Funkcjonalność**: Generowanie obrazów działa

---

**Powodzenia z uruchomieniem! 🎉**
