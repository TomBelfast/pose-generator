# 🗑️➡️🆕 Ręczne usunięcie i utworzenie nowego projektu Pose Generator

## 📋 **KROK 1: Usuń stary projekt**

### W interfejsie Coolify:
1. **Zaloguj się** do [https://host.aihub.ovh/](https://host.aihub.ovh/)
2. **Znajdź projekt** `pose-generator` na liście aplikacji
3. **Kliknij na projekt** aby go otworzyć
4. **Przejdź do ustawień** (Settings/Configuration)
5. **Znajdź opcję "Delete"** lub "Usuń"
6. **Potwierdź usunięcie** projektu

## 🆕 **KROK 2: Utwórz nowy projekt**

### A. Nowa aplikacja
1. **Kliknij "New Application"** lub "Dodaj nową aplikację"
2. **Wybierz "Git Repository"**

### B. Konfiguracja repozytorium
- **Repository URL**: `https://github.com/TomBelfast/pose-generator.git`
- **Branch**: `main`
- **Build Pack**: `Dockerfile`
- **Dockerfile Path**: `./Dockerfile`

### C. Konfiguracja portu
- **Port**: `4999`

### D. Zmienne środowiskowe
Dodaj następujące zmienne:
```
VITE_GEMINI_API_KEY=twój_klucz_gemini
VITE_CLERK_PUBLISHABLE_KEY=pk_live_twój_klucz_clerk
DATABASE_URL=file:/app/data/production.db
NODE_ENV=production
PORT=4999
```

### E. Persistent Volume
- **Path**: `/app/data`
- **Type**: `Persistent Volume`

## 🚀 **KROK 3: Uruchom projekt**

1. **Kliknij "Deploy"** lub "Wdróż"
2. **Obserwuj logi** podczas budowania
3. **Sprawdź status** po wdrożeniu

## 🔍 **KROK 4: Sprawdź konfigurację**

### A. Logi aplikacji
Sprawdź czy nie ma błędów:
- ✅ **Brak błędów** podczas budowania
- ✅ **Aplikacja startuje** na porcie 4999
- ✅ **Baza danych** jest dostępna
- ✅ **Zmienne środowiskowe** są ustawione

### B. Health check
- **URL**: `https://twoja-domena/api/health`
- **Oczekiwana odpowiedź**: `{"success": true, "message": "API is running"}`

### C. Funkcjonalność
- **Test generowania** obrazów
- **Test autoryzacji** Clerk
- **Test API** Gemini

## 🐛 **Rozwiązywanie problemów**

### Problem: Błąd podczas budowania
- **Sprawdź logi** - co spowodowało błąd
- **Sprawdź Dockerfile** - czy jest poprawny
- **Sprawdź repozytorium** - czy kod jest aktualny

### Problem: Aplikacja nie startuje
- **Sprawdź zmienne środowiskowe** - czy są ustawione
- **Sprawdź port** - czy 4999 jest dostępny
- **Sprawdź persistent volume** - czy jest skonfigurowany

### Problem: Błąd bazy danych
- **Sprawdź** czy persistent volume jest poprawnie skonfigurowany
- **Sprawdź** czy katalog `/app/data` istnieje

## 📊 **Oczekiwany rezultat**

Po pomyślnym wdrożeniu:
- **Status**: `running:healthy` ✅
- **Port**: 4999
- **URL**: Dostępny przez Coolify
- **Funkcjonalność**: Generowanie obrazów działa

## 🎯 **Korzyści z nowego projektu**

- ✅ **Najnowszy kod** z repozytorium
- ✅ **Poprawna konfiguracja** portu 4999
- ✅ **Zoptymalizowany Dockerfile**
- ✅ **Wszystkie zmienne środowiskowe** skonfigurowane
- ✅ **Persistent volume** dla bazy danych

---

**Powodzenia z nowym projektem! 🎉**
