# StronaQR

Aplikacja do zbierania odpowiedzi od uczestników poprzez kod QR. Admin tworzy sesję z pytaniem, uczestnicy skanują QR i wpisują odpowiedź — admin widzi wyniki w czasie rzeczywistym.

**Stack:** Angular 21 · Spring Boot 3 · PostgreSQL 16 · nginx · Docker

---

## Szybki start

### Wymagania

| Narzędzie | Wersja | Uwagi |
|-----------|--------|-------|
| Docker Desktop | 3.4+ | Zawiera Docker Compose v2 |
| mkcert *(opcjonalne)* | dowolna | Certyfikat HTTPS zaufany przez przeglądarkę |

### Uruchomienie

```bash
# 1. Skopiuj i uzupełnij zmienne środowiskowe
cp .env.example .env
# edytuj .env (patrz sekcja Konfiguracja)

# 2. Uruchom (generuje certyfikat, buduje obrazy, startuje kontenery)
./start.sh
```

Aplikacja dostępna pod **https://localhost**

> `start.sh` automatycznie sprawdza czy masz Dockera, Docker Compose i plik `.env`,  
> a następnie generuje certyfikat TLS (mkcert → bez ostrzeżenia przeglądarki,  
> openssl → self-signed z ostrzeżeniem). Przy kolejnych uruchomieniach certyfikat jest pomijany.

Zatrzymanie:

```bash
docker compose down
```

---

## Konfiguracja

Skopiuj `.env.example` do `.env` i uzupełnij:

```env
POSTGRES_DB=strona_qr
POSTGRES_USER=postgres
POSTGRES_PASSWORD=silne_haslo

APP_ADMIN_PASSWORD=twoje_haslo_admina
APP_CORS_ALLOWED_ORIGIN=https://localhost

SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

---

## Architektura

```
Przeglądarka (https://localhost)
        │
        ▼
   nginx :443          # reverse proxy + TLS termination
    ├── /api/ ──►  backend:8080   # Spring Boot REST API
    └── /     ──►  frontend:80   # Angular SPA (statyczne pliki)
                         │
                    PostgreSQL:5432
```

Wszystkie kontenery komunikują się w izolowanej sieci Dockera.  
Na zewnątrz eksponowane są tylko porty **443** (HTTPS), **80** (redirect → HTTPS) i **5432** (baza, debug).

---

## Struktura projektu

```
.
├── frontend/               # Angular 21
│   ├── src/app/
│   │   ├── components/     # landing-page, qr-response, admin-panel, ...
│   │   ├── services/       # QrSessionService
│   │   └── guards/         # AdminGuard, AuthGuard
│   ├── nginx.conf          # konfiguracja nginx dla frontendu
│   └── Dockerfile
│
├── stronaQr/               # Spring Boot 3 (Gradle)
│   └── src/main/java/
│       └── com/example/stronaQr/
│           ├── qr/         # kontrolery, serwisy, encje, repozytoria
│           └── core/       # obsługa wyjątków
│
├── nginx/
│   ├── nginx.conf          # reverse proxy (HTTPS + routing)
│   └── certs/              # certyfikaty TLS (generowane przez start.sh, w .gitignore)
│
├── docker-compose.yml
├── start.sh                # jednokomendowe uruchomienie z walidacją zależności
└── .env.example
```

---

## Panel administratora

1. Wejdź na **https://localhost** i kliknij *Panel administratora*  
   (lub przejdź bezpośrednio na `/qr/default/admin-login`)
2. Wpisz hasło z `APP_ADMIN_PASSWORD`
3. W panelu możesz:
   - ustawić pytanie widoczne dla uczestników
   - przeglądać odpowiedzi (filtrowanie po nicku, treści, dacie)
   - sortować kolumny klikając nagłówki tabeli
   - zresetować sesję (usuwa wszystkie odpowiedzi i użytkowników)

---

## Przepływ użytkownika

```
[Uczestnik skanuje QR]
        │
        ▼
  Strona główna → wpisuje nick
        │
        ▼
  Strona odpowiedzi → widzi pytanie admina → wysyła odpowiedź
        │
        ▼
  Potwierdzenie zapisu
```

---

## API

Baza URL: `/api/qr`

| Metoda | Endpoint | Opis |
|--------|----------|------|
| `POST` | `/sessions` | Utwórz lub pobierz sesję |
| `GET` | `/sessions/{id}` | Info o sesji (pytanie, status) |
| `PUT` | `/sessions/{id}/question` | Zmień pytanie *(wymaga X-Admin-Token)* |
| `POST` | `/sessions/{id}/login` | Zaloguj uczestnika (zwraca userId) |
| `POST` | `/sessions/{id}/response` | Wyślij odpowiedź |
| `GET` | `/sessions/{id}/responses` | Wszystkie odpowiedzi *(wymaga X-Admin-Token)* |
| `POST` | `/sessions/{id}/reset` | Resetuj sesję *(wymaga X-Admin-Token)* |
| `POST` | `/api/qr/admin/login` | Zaloguj admina (zwraca token) |
| `POST` | `/api/qr/admin/logout` | Wyloguj admina |

---

## Lokalne uruchomienie bez Dockera

Wymaga: Java 21, Node.js 22, PostgreSQL działającego lokalnie.

**Backend:**
```bash
cd stronaQr
./gradlew bootRun
# API dostępne na http://localhost:8080
```

**Frontend (dev server):**
```bash
cd frontend
npm ci
npm start
# UI dostępne na http://localhost:4200
```

**Testy backendu:**
```bash
cd stronaQr
./gradlew test
```

---

## Deployment

### Railway (backend)

Ustaw zmienne środowiskowe w panelu Railway:

```
APP_ADMIN_PASSWORD
APP_CORS_ALLOWED_ORIGIN
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

Railway automatycznie eksportuje `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` — backend czyta je jako fallback gdy `SPRING_DATASOURCE_*` nie są ustawione.

### Vercel (frontend)

Konfiguracja w `vercel.json`. Zbudowany Angular (SPA) jest serwowany statycznie.
