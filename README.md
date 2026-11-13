# Sweety

Sweety is a blood sugar (glucose) tracker. Users sign up, log up to four readings a day (fasting and after each meal), and see daily and monthly reports with the average, highest and lowest values.

It is a full-stack JavaScript app: a **React + Vite** frontend talks to an **Express** REST API, which stores data in **PostgreSQL** through **Prisma 8**.

---

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite 8, React Router 7, Tailwind CSS 4, Axios |
| Backend | Node.js (ES modules), Express 5 |
| Database | PostgreSQL 15+ |
| ORM | Prisma 8 (`@prisma/orm-postgres`) with a `contract.prisma` schema |
| Auth | JWT (`jsonwebtoken`) in an httpOnly cookie, passwords hashed with `bcrypt` |
| Other | `cookie-parser`, `cors`, `dotenv` |

---

## Project structure

```
Sweety/
├── client/                      # React frontend (Vite)
│   └── src/
│       ├── App.jsx              # Route definitions
│       ├── main.jsx             # React entry point
│       ├── Pages/
│       │   ├── ReadingsPage.jsx # Add / list / edit / delete readings
│       │   └── ReportPage.jsx   # Daily, this-month, previous-month reports
│       ├── components/
│       │   ├── Layout.jsx       # Guards logged-in pages, renders Navbar + footer
│       │   ├── Navbar.jsx       # Navigation + logout
│       │   ├── LoginPage.jsx
│       │   ├── SignUp.jsx
│       │   ├── ReadingForm.jsx  # Shared form for adding and editing a reading
│       │   ├── Reading.jsx      # One reading row (edit / delete)
│       │   ├── ReportStats.jsx  # Average / highest / lowest cards
│       │   ├── ReportReadingsTable.jsx
│       │   ├── StatusBadge.jsx  # Low / In range / High badge
│       │   └── Logo.jsx
│       └── utils/readings.js    # Slot list, formatting, sorting, grouping, status helpers
│
└── server/                      # Express API
    ├── index.js                 # App setup, middleware, route mounting
    ├── prisma.config.ts         # Prisma CLI config
    ├── migrations/              # Prisma migration state
    ├── scripts/seed.js          # Test data seeder
    └── src/
        ├── prisma/
        │   ├── contract.prisma  # Database schema (source of truth)
        │   ├── contract.json    # Generated from contract.prisma
        │   ├── contract.d.ts    # Generated types
        │   └── db.ts            # Database client used by the whole server
        ├── Middleware/authMiddleware.js
        ├── Services/readingService.js
        └── routes/
            ├── authRoutes.js
            ├── readingsRoutes.js
            └── reportRoutes.js
```

---

## Architecture

```
┌──────────────────────┐   HTTP + JSON, cookie   ┌───────────────────────────┐   Prisma ORM   ┌────────────┐
│  React client (Vite) │ ──────────────────────▶ │  Express API (port 3000)  │ ─────────────▶ │ PostgreSQL │
│  localhost:5173      │ ◀────────────────────── │  routes → middleware →    │ ◀───────────── │            │
└──────────────────────┘                         │  service → db.ts          │                └────────────┘
                                                 └───────────────────────────┘
```

### Request flow on the server

1. **`index.js`** sets up Express with `express.json()`, `cookie-parser`, and CORS (allowing `http://localhost:5173` with credentials so the browser sends the auth cookie).
2. Routes are mounted:
   - `/api/auth` → `authRoutes.js`
   - `/api` → `readingsRoutes.js`
   - `/api/report` → `reportRoutes.js`
3. Protected routes run **`authMiddleware`** first. It reads the `token` cookie, verifies it with `JWT_SECRET`, checks the user still exists, and puts `req.userId` on the request. Any failure returns `401`.
4. Create and edit requests go through **`readingService.validateReading`** before anything is written.
5. All database access goes through the single client exported from **`src/prisma/db.ts`** (`db.orm.public.User` / `db.orm.public.Reading`).

### Authentication

- **Sign up** hashes the password with bcrypt (10 salt rounds) and stores only `passwordHash`.
- **Log in** checks the password, signs a JWT containing `{ userId }`, and sets it as an **httpOnly cookie** named `token` that lasts 7 days. JavaScript in the browser cannot read it.
- **Log out** clears the cookie.
- On the client, a `localStorage` flag `isLoggedIn` controls which pages are shown. `Layout.jsx` redirects to `/login` if it is missing. The real check is always the cookie on the server: if any API call returns `401`, the client removes the flag and sends the user back to login.

### Validation rules (`readingService.js`)

A reading is valid only if:

- `value` is a whole number from **40 to 600** mg/dl.
- `slot` is one of `MORNING_FASTING`, `AFTER_BREAKFAST`, `AFTER_LUNCH`, `AFTER_DINNER`.
- `date` is a real date in `YYYY-MM-DD` format and is **not in the future** (compared in UTC).
- The user doesn't already have a reading for that **date + slot**. When editing, the reading being edited is excluded from this check.

### Dates

All dates are stored as `YYYY-MM-DD` strings and treated as **UTC** everywhere: the validator, the report date ranges, the seed script, and the client's `today()` helper all use `toISOString().slice(0, 10)`. This keeps the client and server agreeing on what "today" and "this month" mean.

---

## Database schema

Defined in `server/src/prisma/contract.prisma`:

```prisma
model User {
  id           Int       @id @default(autoincrement())
  name         String
  email        String    @unique
  passwordHash String
  readings     Reading[]
  createdAt    DateTime
  updatedAt    DateTime
}

enum ReadingSlot {
  MORNING_FASTING
  AFTER_BREAKFAST
  AFTER_LUNCH
  AFTER_DINNER
}

model Reading {
  id          Int         @id @default(autoincrement())
  readingDate DateString            // "YYYY-MM-DD"
  slot        ReadingSlot
  value       Int                   // mg/dl
  userId      Int
  user        User        @relation(..., onDelete: Cascade)
  createdAt   DateTime
  updatedAt   DateTime

  @@unique([userId, readingDate, slot])   // one reading per slot per day
}
```

- One user has many readings.
- Deleting a user deletes their readings (`onDelete: Cascade`).
- The unique constraint on `(userId, readingDate, slot)` allows at most four readings per user per day, one per slot.

---

## API routes

Base URL: `http://localhost:3000`. All request and response bodies are JSON. 🔒 means the route needs the `token` cookie (send requests with `credentials: include` / `withCredentials: true`).

### Auth: `/api/auth`

| Method | Route | Body | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | `{ name, email, password }` | Creates a user. `201` with the user (without the password hash). `400` if a field is missing or the email is taken. |
| POST | `/api/auth/login` | `{ email, password }` | Sets the `token` cookie. `404` if the user doesn't exist, `400` for a wrong password. |
| POST | `/api/auth/logout` | none | Clears the `token` cookie. |

### Readings: `/api`

| Method | Route | Body | Description |
| --- | --- | --- | --- |
| POST 🔒 | `/api/readings` | `{ date, slot, value }` | Creates a reading after validation. `201` with `reading`. |
| GET 🔒 | `/api/readings` | none | Returns all of the logged-in user's readings in `reading` (an array). |
| PUT 🔒 | `/api/readings/edit/:id` | `{ date, slot, value }` | Updates a reading the user owns. `404` if it doesn't exist or belongs to someone else. |
| DELETE 🔒 | `/api/readings/delete/:id` | none | Deletes a reading the user owns. `400` for a non-numeric id, `404` if not found. |

Example body:

```json
{ "date": "2026-11-13", "slot": "AFTER_LUNCH", "value": 145 }
```

### Reports: `/api/report`

Every report response has the same shape:

```json
{
  "message": "Data Fetched Successfully",
  "startTime": "2026-11-01",
  "endTime": "2026-11-13",
  "readings": [ ... ],
  "average": 142.6,
  "maximum": 211,
  "minimum": 84
}
```

(`startTime` / `endTime` are only included in the monthly reports.)

| Method | Route | Query | Description |
| --- | --- | --- | --- |
| GET 🔒 | `/api/report/daily` | `?date=YYYY-MM-DD` (required) | Readings and stats for one day. |
| GET 🔒 | `/api/report/this-month` | none | From the 1st of the current month to today (UTC). |
| GET 🔒 | `/api/report/previous-month` | none | The whole previous calendar month (UTC). |

All report routes return `404` with a message when there are no readings in the range, which the client shows as "No report to show".

---

## Frontend

### Pages and routing (`App.jsx`)

| Path | Component | Access |
| --- | --- | --- |
| `/login` | `LoginPage` | Public. Redirects to `/readings` if already logged in. |
| `/signup` | `SignUp` | Public. Redirects to `/login` after a successful sign-up. |
| `/readings` | `ReadingsPage` | Logged in (wrapped in `Layout`). |
| `/reports` | `ReportPage` | Logged in (wrapped in `Layout`). |
| `*` | redirect to `/login` | |

### How the pages work

- **ReadingsPage** fetches `GET /api/readings`, sorts newest day first (slots in order within a day), and groups them by date. `ReadingForm` at the top adds a reading; each `Reading` row can switch into an inline `ReadingForm` to edit, or delete. After any change the list is refetched.
- **ReportPage** has three tabs (Daily, This month, Previous month). The daily tab shows a date picker. Changing the tab or date calls the matching `/api/report/...` route and shows `ReportStats` (average / highest / lowest) and `ReportReadingsTable`.
- **StatusBadge** labels a value using a general target range: **below 70 = Low**, **70 to 180 = In range**, **above 180 = High** (`getStatus` in `utils/readings.js`). This is display only and not medical advice.

---

## Seed file (`server/scripts/seed.js`)

The seed script fills the database with realistic test data so the readings list and all three reports have something to show.

### What it does

1. **Finds or creates a test user**
   - Email: `seed@sweety.test`
   - Password: `password123`
   - Name: `Seed User`
2. **Deletes all existing readings for that user only.** No other user's data is touched. This avoids hitting the `(userId, readingDate, slot)` unique constraint on re-runs.
3. **Inserts readings for every day from the 1st of the previous month through today (UTC)**, one per slot, with random values in a realistic range for each slot:

   | Slot | Range (mg/dl) |
   | --- | --- |
   | `MORNING_FASTING` | 80 to 130 |
   | `AFTER_BREAKFAST` | 120 to 200 |
   | `AFTER_LUNCH` | 130 to 220 |
   | `AFTER_DINNER` | 120 to 210 |

   About **10% of slots are skipped at random** so the data looks like real usage, with some missed readings. Values range from 80 to 220, so reports show a mix of "In range" and "High" readings.
4. Prints how many readings were inserted, the date range, and the login credentials, then closes the database connection. If anything fails it logs the error and exits with code `1`.

Because data covers both the previous month and the current month, the **daily**, **this-month** and **previous-month** reports all return results.

### Running it

```bash
cd server
npm run seed
```

It is safe to run as many times as you like. Each run gives the seed user a fresh set of random readings.

---

## Getting started

### Prerequisites

- Node.js (a version that can import `.ts` files directly, since `db.ts` is imported by plain Node; Node 22.18+ or 23.6+, where TypeScript type stripping is on by default)
- PostgreSQL 15 or newer

### 1. Server

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:

```env
JWT_SECRET=some-long-random-secret
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/sweety"
```

Create the tables from the schema:

```bash
npx prisma contract emit   # regenerate contract.json / contract.d.ts from contract.prisma
npx prisma db init         # create the tables in the database
```

Optionally load test data:

```bash
npm run seed
```

Start the API:

```bash
node index.js
```

The server runs on `http://localhost:3000`.

### 2. Client

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`. Log in with the seed user (`seed@sweety.test` / `password123`) or create a new account.

> The client calls `http://localhost:3000` directly and the server only allows CORS from `http://localhost:5173`. If you change either port, update `server/index.js` and the URLs in the client.

### Changing the schema

1. Edit `server/src/prisma/contract.prisma`.
2. Run `npx prisma contract emit` to regenerate `contract.json` and `contract.d.ts`.
3. Apply the change to the database (see `server/prisma-8.md` for the migration commands).
