# StronaQR

Aplikacja do zbierania odpowiedzi od uczestników poprzez kod QR. Admin tworzy sesję z pytaniem, uczestnicy skanują QR i wpisują odpowiedź — admin widzi wyniki w panelu.

**Stack:** Angular 21 · Firebase (Firestore, Authentication, Hosting)

---

## Szybki start

### Wymagania

| Narzędzie | Uwagi |
|-----------|-------|
| Node.js 22 | do budowania i uruchamiania Angulara |
| Firebase CLI (`npm i -g firebase-tools`) | do wdrożeń i zarządzania regułami Firestore |
| Dostęp do projektu Firebase `qr-andrzej` | (`firebase login`, potem `firebase use qr-andrzej`) |

### Uruchomienie lokalne (dev)

```bash
cd frontend
npm install
npm start
# UI dostępne na http://localhost:4200, łączy się bezpośrednio z projektem Firebase qr-andrzej
```

Konfiguracja Firebase (apiKey, projectId itd.) jest wpisana w `frontend/src/environments/environment.ts` / `environment.prod.ts` — to publiczne dane, bezpieczeństwo zapewniają Firestore Security Rules (`firestore.rules`), a nie ukrywanie configu.

### Wdrożenie

```bash
# jednorazowo: reguły i indeksy Firestore
firebase deploy --only firestore:rules,firestore:indexes

# przy każdej zmianie frontendu
cd frontend && npm run build
cd ..
firebase deploy --only hosting
```

---

## Konfiguracja jednorazowa w konsoli Firebase

1. **Firestore** → utwórz bazę w trybie Native (jeśli jeszcze nie istnieje).
2. **Authentication → Sign-in method** → włącz dostawcę **Email/Password**.
3. **Authentication → Users** → dodaj jednego użytkownika: e-mail `admin@qr-andrzej.internal` (stała wartość zaszyta w `frontend/src/app/firebase.ts`) i dowolne hasło — to hasło wpisujesz w ekranie logowania admina w aplikacji.

---

## Architektura

```
Przeglądarka
     │
     ▼
Firebase Hosting (Angular SPA, statyczne pliki)
     │
     ├── Firestore       # sesje, uczestnicy, odpowiedzi
     └── Firebase Auth    # logowanie admina (Email/Password)
```

Cała logika, która wcześniej żyła w backendzie (Spring Boot + Postgres), jest teraz realizowana przez klienta (Firestore/Auth SDK) i wymuszana przez `firestore.rules`.

### Model danych Firestore

```
sessions/{sessionId}                                  { sessionId, status: 'active'|'closed', question, createdAt, updatedAt }
sessions/{sessionId}/users/{userId}                    { sessionId, nickname, createdAt }
sessions/{sessionId}/users/{userId}/responses/{id}     { sessionId, userId, nickname, response, createdAt }
```

Uczestnik zna tylko swój `userId` (jak dawniej — brak realnej autentykacji uczestnika) i może czytać/tworzyć tylko własną podkolekcję `responses`. Admin (zalogowany przez Firebase Auth) czyta wszystkie odpowiedzi sesji przez `collectionGroup` query — patrz `firestore.rules`.

---

## Struktura projektu

```
.
├── frontend/                     # Angular 21
│   └── src/app/
│       ├── components/           # landing-page, qr-login, qr-response, admin-login, admin-panel, ...
│       ├── services/qr-session.ts  # cała logika Firestore/Auth
│       ├── guards/               # AdminGuard (Firebase Auth), AuthGuard, SessionGuard
│       └── firebase.ts           # inicjalizacja Firebase App/Firestore/Auth
│
├── firebase.json                 # konfiguracja Hosting + wskazanie plików reguł/indeksów
├── .firebaserc                    # alias projektu (qr-andrzej)
├── firestore.rules                # reguły bezpieczeństwa Firestore
└── firestore.indexes.json         # indeks collection-group dla odpowiedzi (admin)
```

---

## Panel administratora

1. Wejdź na stronę główną i kliknij *Panel administratora* (lub `/qr/default/admin-login`).
2. Wpisz hasło ustawione dla użytkownika `admin@qr-andrzej.internal` w Firebase Authentication.
3. W panelu możesz:
   - ustawić pytanie widoczne dla uczestników,
   - przeglądać odpowiedzi (filtrowanie po nicku, treści, dacie),
   - sortować kolumny klikając nagłówki tabeli,
   - zresetować sesję (usuwa wszystkie odpowiedzi i użytkowników, zamyka sesję).

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
