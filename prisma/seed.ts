// Demo data is no longer seeded globally or on first sign-in.
//
// Every authenticated user starts with an empty workspace. Demo data
// (vendors, GL accounts, bills, payments) is seeded per-user the first
// time they flip on the "Show demo data" switch on the dashboard. That
// flow lives in `src/actions/preferences.ts` → `setShowSeed()`, gated
// by `User.seededAt` so seeding only ever runs once per user.
//
// This file is kept as a no-op so `npm run db:seed` still exits cleanly.

console.log(
  "[seed] Demo data is seeded per-user on first 'Show demo data' toggle. See src/actions/preferences.ts.",
);
