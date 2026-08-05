# StudentNest — Phase 1 MVP

Verified off-campus student accommodation platform, built for a single-university
pilot. Students, landlords, and agents sign up, landlords/agents list properties,
and an admin manually reviews every listing before it goes public.

## Stack

- **Framework:** Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- **Database:** PostgreSQL via Prisma ORM 7 (`@prisma/adapter-pg` driver adapter)
- **Auth:** Custom email/phone + password auth, JWT session cookie (`jose`)
- **Hosting target:** Render or Railway

## What's built so far

- ✅ Auth: signup/login with role selection (Student/Landlord/Agent), students
  pick their institution at signup, JWT session cookie, route protection via
  `src/proxy.ts`
- ✅ Listings: landlords/agents create listings (photos, amenities, room type,
  gender policy, price/caution/agency fees, institution + distance from campus)
- ✅ Admin approval flow: pending queue, approve/reject with a reason, basic
  usage stats (users, listings by status)
- ✅ Minimal public "browse approved listings" grid + listing detail page

## Not built yet (next passes, per the build order)

- Search & filter (budget, room type, gender, amenities, distance)
- Messaging between students and landlords/agents
- Booking & inspection scheduling
- Paystack payment integration
- Richer admin dashboard (user verification UI, flagging)

## Local setup

### 1. Prerequisites

- Node.js 20+
- A running PostgreSQL instance

### 2. Install dependencies

```bash
npm install
```

`postinstall` runs `prisma generate` automatically.

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

- `DATABASE_URL` — your Postgres connection string
- `SESSION_SECRET` — random 32+ byte secret (`openssl rand -base64 32`)

### 4. Run migrations and seed data

```bash
npm run db:migrate   # applies prisma/migrations, creates the schema
npm run db:seed      # seeds institutions + a default admin account
```

The seed script creates an admin account. By default:
`admin@studentnest.local` / `ChangeMe123!` — **change this password
immediately** after first login, or set `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` before seeding to pick your own.

### 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Project structure

```
prisma/
  schema.prisma       # User, Institution, Listing, ListingPhoto models
  seed.ts              # Institutions + admin account seed
prisma.config.ts        # Prisma 7 CLI config (migrations, seed command)
src/
  app/                  # Next.js App Router routes (pages + API routes)
  components/            # Client/server components (forms, nav, etc.)
  lib/
    db.ts                # Prisma client (pg driver adapter)
    session.ts           # JWT session cookie helpers
    dal.ts                # Data Access Layer — verifySession/requireRole
    validation.ts          # Zod schemas for auth + listing forms
    constants.ts           # Shared enum values/labels (rooms, amenities, etc.)
  proxy.ts               # Route protection (renamed from middleware.ts in Next 16)
```

## Notes on scope decisions

- **Image uploads** are stored on local disk under `/public/uploads` for the
  pilot. Render/Railway disks are ephemeral across deploys — swap
  `src/app/api/upload/route.ts` for S3/Cloudinary/R2 before scaling past a
  single pilot.
- **Money fields** are stored as whole-Naira integers (no kobo precision) —
  fine for rent listings, revisit if you need finer-grained payment amounts.
- **Distance-from-campus / map pin** is a manually entered number for now;
  full map-based search is explicitly out of scope for Phase 1.
