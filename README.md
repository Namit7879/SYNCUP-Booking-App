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

### 1. Public Home (`/`)

The public landing page that lists active booking links and introduces the booking flow (pick date, choose time, confirm details).

![Public Home](https://github.com/user-attachments/assets/6e51cc42-afe0-4d53-8b13-4fe5f506dd23)

---

### 2. Login (`/login`)

Admin sign-in page for existing users. Includes evaluator/demo credentials and a shortcut to the public booking page.

![Login Page](https://github.com/user-attachments/assets/e41fb35a-1976-4d36-9ab4-8bfa0bbd75f3)

---

### 3. Register (`/register`)

Admin account creation page with name, email, and password validation.

![Register Page](https://github.com/user-attachments/assets/8525cc60-1b46-4081-ba1a-846315c8aee0)

---

### 4. Booking Page (`/book/:slug`, `/booking/:slug`, `/public/book/:slug`)

Public scheduling page for a selected event type. Invitees pick a date/time, fill details, answer custom questions, and confirm booking.

![Booking Page](https://github.com/user-attachments/assets/60a316a5-6e90-4cab-a2a9-f92c11b313f8)

---

### 5. Dashboard (`/dashboard`)

Protected admin overview showing event metrics, quick booking-link access, and event type management shortcuts.

![Dashboard](https://github.com/user-attachments/assets/32e745f2-5f35-4eee-bc1d-26eee0529edb)

---

### 6. Event Types (`/event-types`)

Protected admin page to create, edit, delete, search, and share event types. Also supports custom questions and public link actions.

![Event Types](https://github.com/user-attachments/assets/88ff9172-8ee7-4733-ba92-6791bbab6cb9)

---

### 7. Availability (`/availability`)

Protected admin page to configure weekly working hours, date-specific overrides, and buffer times before/after meetings.

![Availability](https://github.com/user-attachments/assets/22aaaaa9-0590-4ccc-ac60-76117488c57f)

---

### 8. Meetings (`/meetings`)

Protected admin meetings manager with upcoming/past views, date-range filtering, and cancel actions.

![Meetings](https://github.com/user-attachments/assets/9f0e3a08-f2e7-4f32-a96d-8f083f83301f)


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

#for Evaluator testing
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

### 5. Verify production

1. Open frontend link.
2. Register/login.
3. Create an event type.
4. Open public booking page and create a booking.
5. Confirm booking appears in meetings dashboard.
