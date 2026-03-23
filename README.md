# stronaQr

Aplikacja full-stack:
- frontend: Angular (folder `frontend`)
- backend: Spring Boot + PostgreSQL (folder `stronaQr`)

## Wymagania
- Docker + Docker Compose
- (opcjonalnie) Node.js 22 i npm
- (opcjonalnie) Java 21

## Szybki start (Docker)
1. W katalogu projektu uruchom:

```bash
docker compose up --build
```

2. Otwórz aplikację:
- frontend: http://localhost:4200
- backend API: http://localhost:8080/api

3. Zatrzymanie:

```bash
docker compose down
```

## Uruchomienie lokalne bez Dockera

### 1) Backend
W osobnym terminalu:

```bash
cd stronaQr
./gradlew bootRun
```

Backend wystartuje na: http://localhost:8080

### 2) Frontend
W osobnym terminalu:

```bash
cd frontend
npm ci
npm run start
```

Frontend wystartuje na: http://localhost:4200

## Konfiguracja środowiska
Przykładowe zmienne są w pliku `.env.example`.
Najważniejsze:
- `APP_ADMIN_PASSWORD` - hasło admina backendu
- `APP_CORS_ALLOWED_ORIGIN` - dozwolone origin dla frontendu
- `SPRING_DATASOURCE_*` - konfiguracja bazy PostgreSQL

## Logowanie do panelu admina
- Wejście: `/qr/default/admin-login`
- Hasło admina jest walidowane po stronie backendu i pobierane z `APP_ADMIN_PASSWORD`.

## Test backendu

```bash
cd stronaQr
./gradlew test
```

## Build frontendu

```bash
cd frontend
npm run build
```
