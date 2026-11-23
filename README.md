# Gateway Studio

Independent demo: analyze AI gateway traffic, cluster it by task, and price the small model you could own, the pitch of an open-source AI gateway that turns traffic into a cheaper, better model.

- Clusters traffic by task and scores repeatability (prompt variance)
- Estimates owned-model cost (infra + small-model usage + quality-risk reserve) and training payback under assumptions you control
- Candidate states (watching / in-training / deployed / dismissed) and your own traffic rows persist per anonymous browser cookie
- Fictional seeded traffic; every savings number is an estimate from stated assumptions

Stack: Next.js 15, drizzle-orm, SQLite locally, Postgres (Neon) via DATABASE_URL.

## Run
```
npm install && npm run dev
npm test && npm run typecheck
BASE_URL=http://localhost:3000 npm run e2e
```

Demo built by Vinil Polepalli. Not affiliated with or endorsed by Experiential Labs.

## Deployment

Production deploys run on Vercel from the main branch, with the database on Neon Postgres connected through the Vercel integration.
