# Repository rules for AI agents

## Always use workspace npm scripts for database & migration operations

When you need to create, apply, reset, or otherwise mutate the database or
Prisma migration history, **invoke the scripts defined in `package.json`** —
never call `npx prisma …` directly, and never edit migration SQL by hand.

| Intent                              | Command                                           |
| ----------------------------------- | ------------------------------------------------- |
| Create a new migration from schema  | `npm run db:generate -- --name <descriptive_name>` |
| Apply pending migrations (prod-ish) | `npm run db:migrate`                              |
| Push schema without a migration     | `npm run db:push`                                 |
| Drop & recreate dev DB              | `npm run db:reset -- --force`                     |
| Open Prisma Studio                  | `npm run db:studio`                               |
| Run the seed script                 | `npm run db:seed`                                 |

Pass extra flags after `--` (e.g. `npm run db:generate -- --name add_seeded_at`).

**Why:** the scripts are the single source of truth for how this project
interacts with Prisma. Calling `npx prisma` directly bypasses any future
wrapping (env loading, hooks, formatting, custom flags) and creates
inconsistency between human contributors and agents.
