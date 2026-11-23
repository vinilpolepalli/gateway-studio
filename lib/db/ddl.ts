export const SQLITE_DDL = [
  `CREATE TABLE IF NOT EXISTS "traffic" ("id" TEXT PRIMARY KEY, "task" TEXT NOT NULL, "model" TEXT NOT NULL, "requests_per_day" INTEGER NOT NULL, "avg_tokens" INTEGER NOT NULL, "cost_per_1k" REAL NOT NULL, "variance" TEXT NOT NULL, "example" TEXT NOT NULL, "sort_order" INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "owner_traffic" ("id" TEXT PRIMARY KEY, "owner_id" TEXT NOT NULL, "task" TEXT NOT NULL, "requests_per_day" INTEGER NOT NULL, "avg_tokens" INTEGER NOT NULL, "cost_per_1k" REAL NOT NULL, "variance" TEXT NOT NULL, "example" TEXT NOT NULL, "created_at" TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "owner_traffic_idx" ON "owner_traffic" ("owner_id")`,
  `CREATE TABLE IF NOT EXISTS "candidate_states" ("owner_id" TEXT NOT NULL, "task_key" TEXT NOT NULL, "state" TEXT NOT NULL, "updated_at" TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "cand_owner_idx" ON "candidate_states" ("owner_id")`,
  `CREATE TABLE IF NOT EXISTS "owner_assumptions" ("owner_id" TEXT PRIMARY KEY, "assumptions" TEXT NOT NULL, "updated_at" TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "kv" ("key" TEXT PRIMARY KEY, "value" TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "rate_events" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "owner_id" TEXT NOT NULL, "kind" TEXT NOT NULL, "at" INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "rate_idx" ON "rate_events" ("owner_id", "kind", "at")`,
];
export const PG_DDL = [
  `CREATE TABLE IF NOT EXISTS "traffic" ("id" TEXT PRIMARY KEY, "task" TEXT NOT NULL, "model" TEXT NOT NULL, "requests_per_day" INTEGER NOT NULL, "avg_tokens" INTEGER NOT NULL, "cost_per_1k" DOUBLE PRECISION NOT NULL, "variance" TEXT NOT NULL, "example" TEXT NOT NULL, "sort_order" INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "owner_traffic" ("id" TEXT PRIMARY KEY, "owner_id" TEXT NOT NULL, "task" TEXT NOT NULL, "requests_per_day" INTEGER NOT NULL, "avg_tokens" INTEGER NOT NULL, "cost_per_1k" DOUBLE PRECISION NOT NULL, "variance" TEXT NOT NULL, "example" TEXT NOT NULL, "created_at" TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "owner_traffic_idx" ON "owner_traffic" ("owner_id")`,
  `CREATE TABLE IF NOT EXISTS "candidate_states" ("owner_id" TEXT NOT NULL, "task_key" TEXT NOT NULL, "state" TEXT NOT NULL, "updated_at" TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "cand_owner_idx" ON "candidate_states" ("owner_id")`,
  `CREATE TABLE IF NOT EXISTS "owner_assumptions" ("owner_id" TEXT PRIMARY KEY, "assumptions" TEXT NOT NULL, "updated_at" TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "kv" ("key" TEXT PRIMARY KEY, "value" TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "rate_events" ("id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, "owner_id" TEXT NOT NULL, "kind" TEXT NOT NULL, "at" BIGINT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "rate_idx" ON "rate_events" ("owner_id", "kind", "at")`,
];
