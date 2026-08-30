# X Hotel — Architecture

## 1. Architecture Overview

X Hotel is designed as a separated frontend/backend web application.

The backend is the primary development focus initially.

The frontend framework is intentionally not permanently frozen yet because the current requirements do not explicitly require SEO.

---

## 2. Current Technology Decisions

### Backend

- ElysiaJS
- Cloudflare Workers
- TypeScript

### Database

- PostgreSQL
- Supabase
- Drizzle ORM

### Authentication

- Better Auth

### Tooling

- Bun

Bun is used as the development/package-management tool.

It is **not** a requirement that the production backend runs on the Bun runtime.

Example usage:

```bash
bun install
bun add <package>
bun run <script>
```

### Image Storage

- Cloudinary

Hotel and room images are stored and delivered through Cloudinary.

### Email

- Resend is currently not included.

Email functionality can be considered later if additional requirements are introduced.

---

## 3. Backend Architecture

```text
Client
  │
  ▼
ElysiaJS API
  │
  ├── Authentication
  │     └── Better Auth
  │
  ├── Hotel
  │
  ├── Region / Branch
  │
  ├── Room Type
  │
  ├── Booking
  │
  ├── Review
  │
  ├── Identity Verification
  │
  └── Statistics
        │
        ▼
    Drizzle ORM
        │
        ▼
PostgreSQL
   (Supabase)
```

---

## 4. Production Runtime

The backend is intended to run on:

```text
Cloudflare Workers
```

ElysiaJS is used as the application framework.

Conceptually:

```text
ElysiaJS
    │
    ▼
Cloudflare Workers
    │
    ▼
API
```

Bun is used for project tooling and package management rather than being the required production runtime.

---

## 5. Database Architecture

The database uses PostgreSQL hosted by Supabase.

Drizzle ORM provides the application database layer.

```text
ElysiaJS
    │
    ▼
Drizzle ORM
    │
    ▼
PostgreSQL
    │
    ▼
Supabase
```

The database should contain entities required to represent the current requirements.

Initial domain entities are expected to include:

```text
User
Hotel
Region / Branch
Room Type
Booking
Review
Identity Verification
Check-in
```

The exact schema should be finalized during ERD/database design before implementation.

---

## 6. Authentication Architecture

Better Auth is the selected authentication system.

The authentication flow is conceptually:

```text
Guest
  │
  ├── Sign up
  │
  ├── Login
  │
  └── Session
         │
         ▼
      Better Auth
         │
         ▼
      PostgreSQL
```

Guests may browse hotel information without authentication.

Authentication is required before confirming a booking.

---

## 7. Booking Architecture

The booking flow is intentionally simple according to the current requirements.

```text
Guest
  │
  ▼
Select Hotel
  │
  ▼
Select Region / Branch
  │
  ▼
Select Room Type
  │
  ▼
Specify Number of Guests
  │
  ▼
Specify Number of Nights
  │
  ▼
Login / Authenticate
  │
  ▼
Confirm Booking
  │
  ▼
Save Booking
  │
  ▼
Pay at Hotel
```

The system does not perform real-time room availability checking.

---

## 8. Booking Data

A booking should retain the information necessary to identify the reservation.

Conceptually:

```text
Booking
├── User
├── Hotel
├── Region / Branch
├── Room Type
├── Number of Guests
├── Number of Nights
├── Booking Status
├── Payment Method
├── Check-in Status / Record
└── Timestamps
```

The exact fields will be finalized during database design.

---

## 9. Payment Architecture

The current system uses:

```text
PAY_AT_HOTEL
```

There is no online payment gateway.

Therefore the architecture does not currently include:

- Stripe
- Omise
- PayPal
- Other payment gateways

Payment integration can be added later only if the requirements change.

---

## 10. Image Architecture

Cloudinary is used for hotel and room images.

The database should store image references/URLs rather than storing image binary data directly in PostgreSQL.

Conceptually:

```text
Hotel / Room
      │
      └── image URL / Cloudinary identifier

Cloudinary
      │
      └── Actual image files
```

Example:

```text
Hotel
├── name
├── description
└── images
       │
       └── Cloudinary
```

---

## 11. Review Architecture

Reviews are associated with the appropriate user and hotel/domain record.

The rating value must support:

```text
0
1
2
3
4
5
```

The backend must validate the rating range.

---

## 12. Statistics Architecture

Statistics should be calculated primarily on the backend/database side.

Required statistics include:

```text
Total Bookings
        │
        ├── Most Booked Room Type
        │
        ├── Most Booked Hotel
        │
        ├── Most Booked Region / Branch
        │
        └── Actual Check-ins
                  │
                  ▼
            Check-in %
```

Example calculation:

```text
check_in_percentage =
    actual_checkins / total_bookings * 100
```

The frontend should receive the calculated result rather than downloading all booking records and calculating the statistics itself.

---

## 13. Frontend Architecture

The frontend is intentionally not permanently frozen at this stage.

Current preferred option:

```text
React
+
Vite
+
TypeScript
+
Tailwind CSS
```

Potential alternatives that may be evaluated later:

```text
Astro + React
Next.js
```

The decision can be made after the backend and API contract are established.

The current requirements do not explicitly require SEO.

Therefore, SEO should not force a framework decision before the requirement is confirmed.

---

## 14. Frontend / Backend Separation

The frontend should communicate with the backend through the Elysia API.

```text
Frontend
    │
    │ HTTP / API
    ▼
ElysiaJS
    │
    ├── Better Auth
    ├── Business Logic
    └── Drizzle
            │
            ▼
       PostgreSQL
        Supabase
```

This separation allows the frontend framework to be changed without rewriting the core backend business logic.

---

## 15. Deployment Architecture

### Frontend

Preferred deployment:

```text
React / Vite
      │
      ▼
Cloudflare Pages
```

The exact frontend deployment will be finalized after choosing the frontend framework.

### Backend

```text
ElysiaJS
      │
      ▼
Cloudflare Workers
```

### Database

```text
PostgreSQL
      │
      ▼
Supabase
```

### Images

```text
Cloudinary
```

---

## 16. Development Order

Backend development should be completed before building the main frontend.

Recommended order:

```text
1. Requirement
      ↓
2. Domain Model
      ↓
3. ERD
      ↓
4. Database Schema
      ↓
5. Drizzle Setup
      ↓
6. Supabase PostgreSQL
      ↓
7. ElysiaJS
      ↓
8. Cloudflare Workers
      ↓
9. Better Auth
      ↓
10. Hotel APIs
      ↓
11. Room APIs
      ↓
12. Booking APIs
      ↓
13. Cancellation
      ↓
14. Identity Verification
      ↓
15. Reviews
      ↓
16. Check-in
      ↓
17. Statistics
      ↓
18. API Testing
      ↓
19. Frontend
```

---

## 17. Architecture Constraints

### Constraint 1 — X Hotel Only

The system is not a hotel marketplace.

There is no external hotel onboarding.

---

### Constraint 2 — No Online Payment

The current architecture does not require a payment gateway.

---

### Constraint 3 — No Availability System

The current architecture does not require real-time room availability checking.

---

### Constraint 4 — Backend First

The backend/API should be established before committing to the final frontend framework.

---

### Constraint 5 — Avoid Unnecessary Services

Do not add infrastructure simply because it is available.

Current services are intentionally limited to:

```text
Cloudflare Workers
Supabase PostgreSQL
Cloudinary
Better Auth
```

Resend and other services are not part of the initial implementation.

---

## 18. Architecture Decisions Not Yet Frozen

### Frontend Framework

Not permanently decided:

```text
Option A:
React + Vite

Option B:
Astro + React

Option C:
Next.js
```

Decision criteria:

- Actual project requirements
- SEO requirements, if any
- Complexity
- Deployment requirements
- Development speed

Do not migrate the frontend framework unless there is a concrete requirement or architectural reason.

---

## 19. Backend Architecture Goal

The backend should remain independent from the frontend framework.

The desired relationship is:

```text
             ┌─────────────────┐
             │    Frontend     │
             │ React / Astro / │
             │     Next.js     │
             └────────┬────────┘
                      │
                     API
                      │
                      ▼
             ┌─────────────────┐
             │    ElysiaJS    │
             │ Cloudflare     │
             │    Workers     │
             └────────┬────────┘
                      │
            ┌─────────┼─────────┐
            │         │         │
            ▼         ▼         ▼
       Better Auth  Drizzle  Cloudinary
                      │
                      ▼
             Supabase PostgreSQL
```

The frontend may change, but the backend contract should remain stable.

---

## 20. Architecture Principle

The project should follow a simple principle:

> Implement the requirements first. Do not add infrastructure or features without a requirement or clear architectural need.

The architecture should be simple enough for a university software engineering project while remaining structured enough to support the X Hotel business model and future expansion to additional regions.
