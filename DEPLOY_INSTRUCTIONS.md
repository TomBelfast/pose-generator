# Instrukcje Wdrożenia - Pose Generator

## Lokalne uruchomienie

### Wymagania
- Node.js (wersja 18 lub nowsza)
- npm lub yarn

### Instalacja i uruchomienie

1. **Zainstaluj zależności:**
   ```bash
   npm install
   ```

2. **Skonfiguruj zmienne środowiskowe:**
   - Skopiuj `env.example` do `.env.local`
   - Ustaw `VITE_GEMINI_API_KEY` na swój klucz API Gemini
   - Ustaw `VITE_CLERK_PUBLISHABLE_KEY` na swój klucz Clerk

3. **Uruchom aplikację:**
   ```bash
   # Uruchom tylko frontend
   npm run dev
   
   # Uruchom pełną aplikację (frontend + backend)
   npm run dev:full
   ```

4. **Otwórz aplikację:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4999

## Wdrożenie produkcyjne

### Docker

1. **Zbuduj obraz:**
   ```bash
   docker build -t pose-generator .
   ```

2. **Uruchom kontener:**
   ```bash
   docker run -p 4999:4999 \
     -e VITE_GEMINI_API_KEY=your_key \
     -e VITE_CLERK_PUBLISHABLE_KEY=your_key \
     pose-generator
   ```

### Docker Compose

1. **Uruchom z docker-compose:**
   ```bash
   docker-compose up -d
   ```

2. **Sprawdź status:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

## Struktura projektu

- `App.tsx` - Główny komponent aplikacji
- `server.js` - Backend Express.js
- `components/` - Komponenty React
- `services/` - Serwisy (np. Gemini API)
- `prisma/` - Konfiguracja bazy danych
- `hooks/` - Custom React hooks

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/generate` - Generowanie obrazów z pozami
- `GET /api/poses` - Lista dostępnych poz

## Rozwiązywanie problemów

### Aplikacja nie uruchamia się
- Sprawdź czy wszystkie zmienne środowiskowe są ustawione
- Upewnij się, że porty 5173 i 4999 są wolne
- Sprawdź logi: `npm run dev:full`

### Błędy API
- Sprawdź czy klucz Gemini API jest prawidłowy
- Sprawdź logi serwera w konsoli

### Problemy z bazą danych
- Uruchom: `npx prisma db push`
- Sprawdź czy plik bazy danych ma odpowiednie uprawnienia
