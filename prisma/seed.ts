// Demo data is no longer seeded globally.
//
// Every authenticated user receives their own copy of the demo dataset
// (vendors, GL accounts, bills, payments) the first time they sign in via
// Google OAuth. The seeding routine lives in `src/server/seed-user.ts` and
// is invoked from the `events.createUser` callback in `src/server/auth.ts`.
//
// All seeded rows are marked `seed: true` so users can hide them via the
// "Hide demo data" toggle on the dashboard.
//
// This file is kept as a no-op so `npm run db:seed` still exits cleanly.

console.log(
  "[seed] Demo data is seeded per-user on first sign-in. See src/server/seed-user.ts.",
);
