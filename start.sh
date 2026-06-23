#!/usr/bin/env bash
set -euo pipefail

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

ok()    { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $1"; }
err()   { echo -e "${RED}✗  BŁĄD:${NC} $1"; }
info()  { echo -e "${BLUE}→${NC}  $1"; }
header(){ echo -e "\n${BOLD}${BLUE}╔══════════════════════════╗${NC}"; \
          echo -e "${BOLD}${BLUE}║      StronaQR — start    ║${NC}"; \
          echo -e "${BOLD}${BLUE}╚══════════════════════════╝${NC}\n"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

header

# ─── 1. Docker ────────────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  err "Docker nie jest zainstalowany."
  echo ""
  echo "  Zainstaluj Docker Desktop:"
  info "macOS / Windows → https://www.docker.com/products/docker-desktop"
  info "Linux           → https://docs.docker.com/engine/install/"
  echo ""
  exit 1
fi
ok "Docker: $(docker --version | sed 's/Docker version //' | cut -d',' -f1)"

if ! docker info &>/dev/null 2>&1; then
  err "Docker daemon nie jest uruchomiony."
  echo ""
  echo "  Uruchom Docker Desktop lub:"
  info "Linux: sudo systemctl start docker"
  echo ""
  exit 1
fi
ok "Docker daemon: działa"

# ─── 2. Docker Compose ────────────────────────────────────────────────────────
if docker compose version &>/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
  ok "Docker Compose: $(docker compose version --short 2>/dev/null || echo 'v2')"
elif command -v docker-compose &>/dev/null; then
  COMPOSE_CMD="docker-compose"
  ok "Docker Compose (v1): $(docker-compose --version | cut -d' ' -f3 | tr -d ',')"
else
  err "Docker Compose nie jest zainstalowany."
  echo ""
  echo "  Zainstaluj Docker Compose:"
  info "Docker Desktop 3.4+ ma Docker Compose wbudowany (docker compose)"
  info "Linux standalone → https://docs.docker.com/compose/install/"
  echo ""
  exit 1
fi

# ─── 3. Plik .env ─────────────────────────────────────────────────────────────
ENV_FILE="$SCRIPT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  err "Brak pliku .env"
  echo ""

  if [ -f "$SCRIPT_DIR/.env.example" ]; then
    warn "Znalazłem .env.example — czy chcesz go teraz skopiować? [t/N]"
    read -r answer
    case $answer in
      [tTyY]*)
        cp "$SCRIPT_DIR/.env.example" "$ENV_FILE"
        echo ""
        warn "Plik .env skopiowany."
        echo "  Uzupełnij go przed uruchomieniem:"
        echo ""
        echo "    POSTGRES_DB=nazwa_bazy"
        echo "    POSTGRES_USER=uzytkownik"
        echo "    POSTGRES_PASSWORD=silne_haslo"
        echo "    APP_CORS_ALLOWED_ORIGIN=http://localhost:4200"
        echo "    APP_ADMIN_PASSWORD=twoje_haslo_admina"
        echo "    SPRING_JPA_HIBERNATE_DDL_AUTO=update"
        echo ""
        info "Edytuj .env i uruchom ./start.sh ponownie."
        echo ""
        exit 0
        ;;
      *)
        echo ""
        echo "  Utwórz plik .env z tymi zmiennymi:"
        echo ""
        echo "    POSTGRES_DB=nazwa_bazy"
        echo "    POSTGRES_USER=uzytkownik"
        echo "    POSTGRES_PASSWORD=silne_haslo"
        echo "    APP_CORS_ALLOWED_ORIGIN=http://localhost:4200"
        echo "    APP_ADMIN_PASSWORD=twoje_haslo_admina"
        echo "    SPRING_JPA_HIBERNATE_DDL_AUTO=update"
        echo ""
        exit 1
        ;;
    esac
  else
    echo "  Utwórz plik .env z tymi zmiennymi:"
    echo ""
    echo "    POSTGRES_DB=nazwa_bazy"
    echo "    POSTGRES_USER=uzytkownik"
    echo "    POSTGRES_PASSWORD=silne_haslo"
    echo "    APP_CORS_ALLOWED_ORIGIN=http://localhost:4200"
    echo "    APP_ADMIN_PASSWORD=twoje_haslo_admina"
    echo "    SPRING_JPA_HIBERNATE_DDL_AUTO=update"
    echo ""
    exit 1
  fi
fi

ok "Plik .env: znaleziony"

# Sprawdź czy wymagane zmienne są ustawione (bezpieczne parsowanie bez source)
MISSING_VARS=()
for var in POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD APP_ADMIN_PASSWORD; do
  val=$(grep -E "^${var}=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '"'"'" | xargs 2>/dev/null || true)
  if [ -z "${val:-}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  err "Brakujące lub puste zmienne w .env:"
  for v in "${MISSING_VARS[@]}"; do
    echo "    • $v"
  done
  echo ""
  info "Uzupełnij je w .env i uruchom ./start.sh ponownie."
  echo ""
  exit 1
fi

ok "Zmienne .env: OK"

# ─── 4. Certyfikaty TLS ───────────────────────────────────────────────────────
CERT_DIR="$SCRIPT_DIR/nginx/certs"
mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_DIR/localhost.pem" ] || [ ! -f "$CERT_DIR/localhost-key.pem" ]; then
  echo ""
  echo -e "${BOLD}Generowanie certyfikatu TLS...${NC}"

  if command -v mkcert &>/dev/null; then
    mkcert -install 2>/dev/null || true
    mkcert -cert-file "$CERT_DIR/localhost.pem" \
           -key-file  "$CERT_DIR/localhost-key.pem" \
           localhost 127.0.0.1 ::1
    ok "Certyfikat: wygenerowany przez mkcert (zaufany przez przeglądarkę)"
  elif command -v openssl &>/dev/null; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout "$CERT_DIR/localhost-key.pem" \
      -out    "$CERT_DIR/localhost.pem" \
      -subj   "/CN=localhost" \
      -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
      2>/dev/null
    warn "Certyfikat: self-signed (openssl). Przeglądarka pokaże ostrzeżenie."
    warn "Aby uniknąć ostrzeżenia zainstaluj mkcert:"
    info "macOS:  brew install mkcert"
    info "Linux:  https://github.com/FiloSottile/mkcert#installation"
    info "Windows: choco install mkcert"
  else
    err "Brak mkcert i openssl — nie można wygenerować certyfikatu."
    info "Zainstaluj mkcert: brew install mkcert"
    exit 1
  fi
else
  ok "Certyfikat TLS: już istnieje"
fi

# ─── 5. Uruchomienie ──────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Uruchamianie aplikacji...${NC}"
echo ""
echo -e "  ${BOLD}Aplikacja:${NC} https://localhost"
echo -e "  ${BOLD}Baza:${NC}      localhost:5432 (debug)"
echo ""
echo -e "  ${YELLOW}Ctrl+C${NC} — zatrzymaj wszystkie kontenery"
echo ""

cd "$SCRIPT_DIR"
$COMPOSE_CMD up --build "$@"
