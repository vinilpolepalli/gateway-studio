# Implementation notes

- `lib/engine.ts`: monthlyCost() is requests/day x 30 x tokens x price. evaluateCluster() computes repeatability from labeled prompt variance, owned-model monthly cost (infra + small-model usage + quality-risk reserve), savings and training payback. A cluster is a candidate when repeatability >= 0.5 and savings clear the owner's bar. All deterministic; labeled estimates in the UI.
- Persistence: shared fictional `traffic` seed; per-owner `owner_traffic`, `candidate_states` (append-only, newest wins), `owner_assumptions`, keyed by the httpOnly `lr_uid` cookie from `middleware.ts`. SQLite locally, Postgres via DATABASE_URL; DDL in `lib/db/ddl.ts`, seeding with advisory lock in `lib/db/seed.ts`.
- API: POST /api/traffic (60/hr), PUT /api/assumptions, POST /api/candidates (120/hr). 20KB body cap; validation in `lib/validate.ts`.
