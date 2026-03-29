# SYNCUP

Full-stack scheduling app where admins create event types and availability, and invitees can book through public links.

## Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, Radix UI/ShadCN-style components, Axios, React Router |
| Backend | Node.js, Express, express-validator, express-rate-limit |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcryptjs |
| Date handling | date-fns |

## Core Features

- Event type management (title, slug, duration, description, custom questions)
- Weekly availability and date-specific overrides
- Buffer time before/after meetings
- Public booking flow (`/book/:slug`) with step-by-step UX
- Conflict-aware slot generation and booking creation
- Meetings management (upcoming/past/cancel)
- Public list of active booking links on home page

## Project Structure

```text
.
├─ client/           # React frontend
├─ server/           # Express backend
└─ prisma/           # Prisma schema + migrations
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ (Node 20+ recommended)
- PostgreSQL running locally or remotely

### 2. Install dependencies

From the repo root:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment variables

Create `server/.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/booking_app"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"

# Optional defaults for no-token admin mode
NO_LOGIN_ADMIN=true
DEFAULT_ADMIN_EMAIL="adminuser123@gmail.com"
DEFAULT_ADMIN_PASSWORD="admin123"
DEFAULT_ADMIN_NAME="Default Admin"
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run database migrations and generate Prisma client

```bash
cd server
npx prisma migrate dev --name init
npm run prisma:generate
```

Note: Prisma client is generated using `prisma/schema.prisma`, and this project is configured to output Prisma artifacts into `server/node_modules/.prisma/client`.

### 5. Start the app

In two terminals:

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

Then open the URL printed by Vite (typically `http://localhost:5173`).

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Event Types

- `GET /api/event-types`
- `POST /api/event-types`
- `GET /api/event-types/:id`
- `PUT /api/event-types/:id`
- `DELETE /api/event-types/:id`

### Availability

- `GET /api/availability`
- `POST /api/availability`
- `PUT /api/availability/:id`
- `GET /api/availability/date-overrides`
- `POST /api/availability/date-overrides`
- `DELETE /api/availability/date-overrides/:id`

### Buffer Time

- `GET /api/buffer-time`
- `POST /api/buffer-time`

### Bookings

- `GET /api/bookings/public-event-types` (public)
- `GET /api/bookings/public/:slug` (public)
- `GET /api/bookings/slots/:slug?date=YYYY-MM-DD` (public)
- `POST /api/bookings` (public)
- `GET /api/bookings` (protected)
- `GET /api/bookings/upcoming` (protected)
- `GET /api/bookings/past` (protected)
- `PUT /api/bookings/:id/cancel` (protected)
- `PUT /api/bookings/:id/reschedule` (protected)

## Assumptions

- Times are managed as local wall-clock values in the app flow; UI and backend should run with consistent timezone expectations.
- Event type `slug` is unique and used as the public booking identifier.
- Public booking only allows active event types (`isActive = true`).
- `AvailabilityDateOverride` is unique per `(userId, date)`.
- If no auth token is provided and `NO_LOGIN_ADMIN` is not set to `false`, backend can attach a default admin user for admin-side requests.
- Slot availability is validated server-side at booking creation time to prevent stale/manual slot submissions.

## Useful Commands

```bash
# Regenerate Prisma client after schema changes
cd server && npm run prisma:generate

# Create a new migration after schema updates
cd server && npx prisma migrate dev --name <migration_name>

# Build frontend
cd client && npm run build
```

## Deploy (Get a Live Link)

This is the fastest reliable setup for this stack:

- Database: Neon (Postgres)
- Backend API: Render Web Service
- Frontend: Vercel (Vite static site)

### 1. Create a production Postgres database

1. Create a free Postgres database on Neon.
2. Copy the connection string.
3. In the query params of that URL, ensure SSL is enabled (Neon typically provides this by default).

### 2. Deploy backend to Render

1. Push this repo to GitHub.
2. In Render, create a new Web Service from this repo.
3. Configure:
	- Root Directory: `server`
	- Build Command: `npm install`
	- Start Command: `npm start`
4. Add environment variables in Render:
	- `DATABASE_URL` = your Neon connection string
	- `JWT_SECRET` = long random secret
	- `NO_LOGIN_ADMIN` = `true` (optional)
	- `DEFAULT_ADMIN_EMAIL` = `adminuser123@gmail.com` (optional)
	- `DEFAULT_ADMIN_PASSWORD` = `admin123` (optional)
	- `DEFAULT_ADMIN_NAME` = `Default Admin` (optional)
	- `CLIENT_URL` = your frontend URL(s), comma-separated if needed

After first deploy, run Prisma migrations in Render Shell:

```bash
npx prisma migrate deploy --schema ../prisma/schema.prisma
```

Your backend live link will look like:

- `https://your-backend-name.onrender.com`

### 3. Deploy frontend to Vercel

1. Import the same GitHub repo into Vercel.
2. Set Project Root Directory to `client`.
3. Set framework preset to Vite (usually auto-detected).
4. Add environment variable:
	- `VITE_API_URL` = `https://your-backend-name.onrender.com/api`
5. Deploy.

Your frontend live link will look like:

- `https://your-project-name.vercel.app`

### 4. Final CORS update

Once Vercel gives your real frontend URL, set Render `CLIENT_URL` to that URL.

Example:

```env
CLIENT_URL="https://your-project-name.vercel.app"
```

If you have preview domains too, include them comma-separated.

### 5. Verify production

1. Open frontend link.
2. Register/login.
3. Create an event type.
4. Open public booking page and create a booking.
5. Confirm booking appears in meetings dashboard.